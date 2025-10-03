-- Missing Person Matching System Database Schema

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id TEXT UNIQUE NOT NULL,
  photo_path TEXT NOT NULL,
  reporter_name TEXT,
  phone_number TEXT,
  found_location TEXT,
  found_address TEXT,
  additional_notes TEXT,
  processed BOOLEAN DEFAULT 0,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS missing_persons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  aadhar_encrypted TEXT,
  phone TEXT,
  email TEXT,
  last_seen_location TEXT,
  last_seen_date DATE,
  photo_paths TEXT,
  physical_description TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS face_encodings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  photo_path TEXT NOT NULL,
  encoding BLOB NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES missing_persons(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  report_id INTEGER NOT NULL,
  confidence REAL NOT NULL,
  matched_photo TEXT,
  report_photo TEXT,
  status TEXT DEFAULT 'pending',
  reviewed_by INTEGER,
  reviewed_at DATETIME,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES missing_persons(id) ON DELETE CASCADE,
  FOREIGN KEY (report_id) REFERENCES public_reports(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS video_uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_path TEXT NOT NULL,
  uploaded_by INTEGER,
  duration REAL,
  frames_processed INTEGER DEFAULT 0,
  total_frames INTEGER,
  processing_status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS video_matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id INTEGER NOT NULL,
  case_id INTEGER NOT NULL,
  timestamp REAL NOT NULL,
  frame_path TEXT NOT NULL,
  confidence REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (video_id) REFERENCES video_uploads(id) ON DELETE CASCADE,
  FOREIGN KEY (case_id) REFERENCES missing_persons(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_public_reports_processed ON public_reports(processed);
CREATE INDEX IF NOT EXISTS idx_missing_persons_status ON missing_persons(status);
CREATE INDEX IF NOT EXISTS idx_matches_case_id ON matches(case_id);
CREATE INDEX IF NOT EXISTS idx_matches_report_id ON matches(report_id);
CREATE INDEX IF NOT EXISTS idx_video_matches_video_id ON video_matches(video_id);
CREATE INDEX IF NOT EXISTS idx_video_matches_case_id ON video_matches(case_id);
