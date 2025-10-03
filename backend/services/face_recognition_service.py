import face_recognition
import sqlite3
import os
import json
import time
import pickle
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / 'database' / 'app.db'
UPLOADS_DIR = BASE_DIR / 'uploads'

class FaceRecognitionService:
    def __init__(self):
        self.db_path = str(DB_PATH)
        self.public_reports_dir = UPLOADS_DIR / 'public-reports'
        self.family_cases_dir = UPLOADS_DIR / 'family-cases'
        self.confidence_threshold = 0.6

    def get_db_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def load_face_encoding(self, image_path):
        try:
            full_path = BASE_DIR / image_path.lstrip('/')
            if not full_path.exists():
                print(f"Image not found: {full_path}")
                return None

            image = face_recognition.load_image_file(str(full_path))
            encodings = face_recognition.face_encodings(image)

            if len(encodings) > 0:
                return encodings[0]
            else:
                print(f"No face detected in: {image_path}")
                return None
        except Exception as e:
            print(f"Error loading image {image_path}: {e}")
            return None

    def get_or_create_face_encoding(self, case_id, photo_path):
        conn = self.get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            'SELECT encoding FROM face_encodings WHERE case_id = ? AND photo_path = ?',
            (case_id, photo_path)
        )
        result = cursor.fetchone()

        if result:
            encoding = pickle.loads(result['encoding'])
            conn.close()
            return encoding

        encoding = self.load_face_encoding(photo_path)

        if encoding is not None:
            cursor.execute(
                'INSERT INTO face_encodings (case_id, photo_path, encoding) VALUES (?, ?, ?)',
                (case_id, photo_path, pickle.dumps(encoding))
            )
            conn.commit()

        conn.close()
        return encoding

    def compare_faces(self, report_encoding, case_encodings):
        if report_encoding is None or not case_encodings:
            return 0.0

        distances = face_recognition.face_distance(case_encodings, report_encoding)
        best_match_distance = min(distances)
        confidence = (1 - best_match_distance) * 100

        return confidence

    def process_public_report(self, report_id):
        conn = self.get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            'SELECT * FROM public_reports WHERE id = ? AND processed = 0',
            (report_id,)
        )
        report = cursor.fetchone()

        if not report:
            conn.close()
            return

        print(f"Processing report: {report['report_id']}")

        report_encoding = self.load_face_encoding(report['photo_path'])

        if report_encoding is None:
            cursor.execute(
                'UPDATE public_reports SET processed = 1 WHERE id = ?',
                (report_id,)
            )
            conn.commit()
            conn.close()
            return

        cursor.execute('SELECT * FROM missing_persons WHERE status = ?', ('active',))
        missing_persons = cursor.fetchall()

        matches_found = []

        for person in missing_persons:
            photo_paths = json.loads(person['photo_paths'])
            case_encodings = []

            for photo_path in photo_paths:
                encoding = self.get_or_create_face_encoding(person['id'], photo_path)
                if encoding is not None:
                    case_encodings.append(encoding)

            if case_encodings:
                confidence = self.compare_faces(report_encoding, case_encodings)

                if confidence >= (self.confidence_threshold * 100):
                    matches_found.append({
                        'case_id': person['id'],
                        'confidence': confidence,
                        'matched_photo': photo_paths[0]
                    })
                    print(f"Match found: {person['full_name']} - Confidence: {confidence:.2f}%")

        for match in matches_found:
            cursor.execute(
                '''INSERT INTO matches (case_id, report_id, confidence, matched_photo, report_photo)
                   VALUES (?, ?, ?, ?, ?)''',
                (
                    match['case_id'],
                    report['id'],
                    match['confidence'],
                    match['matched_photo'],
                    report['photo_path']
                )
            )

        cursor.execute(
            'UPDATE public_reports SET processed = 1 WHERE id = ?',
            (report_id,)
        )

        conn.commit()
        conn.close()

        print(f"Report processed. Found {len(matches_found)} match(es)")

    def process_pending_reports(self):
        conn = self.get_db_connection()
        cursor = conn.cursor()

        cursor.execute('SELECT id FROM public_reports WHERE processed = 0 ORDER BY timestamp ASC')
        pending_reports = cursor.fetchall()
        conn.close()

        print(f"Found {len(pending_reports)} pending report(s)")

        for report in pending_reports:
            self.process_public_report(report['id'])

    def run_continuous(self, interval=10):
        print("Face Recognition Service Started")
        print(f"Checking for new reports every {interval} seconds...")
        print(f"Confidence threshold: {self.confidence_threshold * 100}%")

        while True:
            try:
                self.process_pending_reports()
                time.sleep(interval)
            except KeyboardInterrupt:
                print("\nService stopped by user")
                break
            except Exception as e:
                print(f"Error in processing loop: {e}")
                time.sleep(interval)

if __name__ == '__main__':
    service = FaceRecognitionService()
    service.run_continuous()
