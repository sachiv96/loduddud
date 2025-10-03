import cv2
import face_recognition
import sqlite3
import os
import json
import pickle
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / 'database' / 'app.db'
UPLOADS_DIR = BASE_DIR / 'uploads'

class VideoProcessor:
    def __init__(self):
        self.db_path = str(DB_PATH)
        self.videos_dir = UPLOADS_DIR / 'videos'
        self.matched_frames_dir = UPLOADS_DIR / 'matched-frames'
        self.matched_frames_dir.mkdir(exist_ok=True)
        self.confidence_threshold = 0.6
        self.frame_skip = 30

    def get_db_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def get_case_encodings(self):
        conn = self.get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            '''SELECT fe.case_id, fe.encoding, mp.full_name
               FROM face_encodings fe
               JOIN missing_persons mp ON fe.case_id = mp.id
               WHERE mp.status = ?''',
            ('active',)
        )

        encodings_data = []
        for row in cursor.fetchall():
            encodings_data.append({
                'case_id': row['case_id'],
                'encoding': pickle.loads(row['encoding']),
                'full_name': row['full_name']
            })

        conn.close()
        return encodings_data

    def process_video(self, video_id):
        conn = self.get_db_connection()
        cursor = conn.cursor()

        cursor.execute('SELECT * FROM video_uploads WHERE id = ?', (video_id,))
        video_record = cursor.fetchone()

        if not video_record:
            conn.close()
            return

        video_path = BASE_DIR / video_record['video_path'].lstrip('/')

        if not video_path.exists():
            print(f"Video not found: {video_path}")
            conn.close()
            return

        print(f"Processing video: {video_path}")

        cursor.execute(
            'UPDATE video_uploads SET processing_status = ? WHERE id = ?',
            ('processing', video_id)
        )
        conn.commit()

        case_encodings = self.get_case_encodings()

        if not case_encodings:
            print("No active cases with face encodings found")
            cursor.execute(
                'UPDATE video_uploads SET processing_status = ? WHERE id = ?',
                ('completed', video_id)
            )
            conn.commit()
            conn.close()
            return

        video_capture = cv2.VideoCapture(str(video_path))
        fps = video_capture.get(cv2.CAP_PROP_FPS)
        total_frames = int(video_capture.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0

        cursor.execute(
            'UPDATE video_uploads SET duration = ?, total_frames = ? WHERE id = ?',
            (duration, total_frames, video_id)
        )
        conn.commit()

        frame_number = 0
        matches_found = []

        print(f"Total frames: {total_frames}, FPS: {fps}, Duration: {duration:.2f}s")
        print(f"Processing every {self.frame_skip}th frame")

        while video_capture.isOpened():
            ret, frame = video_capture.read()

            if not ret:
                break

            if frame_number % self.frame_skip == 0:
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                face_locations = face_recognition.face_locations(rgb_frame)
                face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

                for face_encoding in face_encodings:
                    for case_data in case_encodings:
                        distance = face_recognition.face_distance(
                            [case_data['encoding']],
                            face_encoding
                        )[0]

                        confidence = (1 - distance) * 100

                        if confidence >= (self.confidence_threshold * 100):
                            timestamp = frame_number / fps if fps > 0 else 0

                            frame_filename = f"video_{video_id}_case_{case_data['case_id']}_frame_{frame_number}.jpg"
                            frame_path = self.matched_frames_dir / frame_filename
                            cv2.imwrite(str(frame_path), frame)

                            cursor.execute(
                                '''INSERT INTO video_matches
                                   (video_id, case_id, timestamp, frame_path, confidence)
                                   VALUES (?, ?, ?, ?, ?)''',
                                (
                                    video_id,
                                    case_data['case_id'],
                                    timestamp,
                                    f"/uploads/matched-frames/{frame_filename}",
                                    confidence
                                )
                            )
                            conn.commit()

                            print(f"Match found at {timestamp:.2f}s: {case_data['full_name']} "
                                  f"(Confidence: {confidence:.2f}%)")

                cursor.execute(
                    'UPDATE video_uploads SET frames_processed = ? WHERE id = ?',
                    (frame_number, video_id)
                )
                conn.commit()

                if frame_number % (self.frame_skip * 10) == 0:
                    progress = (frame_number / total_frames) * 100 if total_frames > 0 else 0
                    print(f"Progress: {progress:.1f}% ({frame_number}/{total_frames} frames)")

            frame_number += 1

        video_capture.release()

        cursor.execute(
            'UPDATE video_uploads SET processing_status = ?, frames_processed = ? WHERE id = ?',
            ('completed', total_frames, video_id)
        )
        conn.commit()
        conn.close()

        print(f"Video processing completed. Total frames: {frame_number}")

    def process_pending_videos(self):
        conn = self.get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            'SELECT id FROM video_uploads WHERE processing_status = ? ORDER BY created_at ASC',
            ('pending',)
        )
        pending_videos = cursor.fetchall()
        conn.close()

        print(f"Found {len(pending_videos)} pending video(s)")

        for video in pending_videos:
            self.process_video(video['id'])

if __name__ == '__main__':
    import sys

    processor = VideoProcessor()

    if len(sys.argv) > 1:
        video_id = int(sys.argv[1])
        print(f"Processing video ID: {video_id}")
        processor.process_video(video_id)
    else:
        print("Processing all pending videos...")
        processor.process_pending_videos()
