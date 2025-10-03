# Missing Person Matching System

A fully self-hosted missing person matching platform running entirely on localhost with local storage. This system uses face recognition technology to match photos submitted by the public against registered missing persons cases.

## Features

- **Public Portal**: Allow witnesses to submit photos of found persons anonymously
- **Admin Panel**: Manage missing person cases with complete family information
- **Face Recognition**: Automatic face matching using local ML models
- **Video Analysis**: Process surveillance footage to detect missing persons
- **Dashboard**: Real-time statistics and analytics
- **100% Local**: No cloud dependencies, all data stored locally

## Technology Stack

### Backend
- **Node.js/Express**: REST API server
- **SQLite**: Local database (file-based)
- **Python**: Face recognition and video processing
- **face_recognition**: ML model for face matching
- **OpenCV**: Video processing

### Frontend
- **React**: User interface
- **Vite**: Build tool and dev server
- **Chart.js**: Data visualization
- **Axios**: HTTP client

## Installation

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)
- npm (Node package manager)

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Note**: Installing `face_recognition` requires `dlib`, which may need additional system dependencies:

- **macOS**: `brew install cmake`
- **Ubuntu/Debian**: `sudo apt-get install cmake libopenblas-dev liblapack-dev`
- **Windows**: Install Visual C++ Build Tools

### 3. Setup Database

```bash
cd backend
node database/setup.js
```

This creates the SQLite database and a default admin user:
- Username: `admin`
- Password: `admin123`

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Running the Application

You need to run three separate processes:

### 1. Start Backend Server (Terminal 1)

```bash
cd backend
npm start
```

Server runs on: `http://localhost:3000`

### 2. Start Face Recognition Service (Terminal 2)

```bash
cd backend/services
python face_recognition_service.py
```

This service continuously monitors for new public reports and matches them against registered cases.

### 3. Start Frontend Dev Server (Terminal 3)

```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

## Usage

### Public Portal

1. Visit `http://localhost:5173`
2. Upload a photo of the found person
3. Fill in location details
4. Submit the report
5. Save the report ID for tracking

### Admin Panel

1. Visit `http://localhost:5173/admin/login`
2. Login with credentials (default: admin/admin123)
3. Access these features:
   - **Dashboard**: View statistics and charts
   - **Register Case**: Add new missing person with photos
   - **Matches**: Review face matches with confidence scores
   - **Cases**: Manage all registered cases

### Video Processing

1. Login to admin panel
2. Upload surveillance video
3. Run the video processor:

```bash
cd backend/services
python video_processor.py <video_id>
```

Or process all pending videos:

```bash
python video_processor.py
```

## Project Structure

```
/missing-person-app
├── backend/
│   ├── database/
│   │   ├── app.db (SQLite database file)
│   │   ├── schema.sql
│   │   ├── setup.js
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── public.js
│   │   ├── missing-persons.js
│   │   ├── matches.js
│   │   └── videos.js
│   ├── services/
│   │   ├── face_recognition_service.py
│   │   └── video_processor.py
│   ├── uploads/
│   │   ├── public-reports/
│   │   ├── family-cases/
│   │   ├── videos/
│   │   └── matched-frames/
│   ├── server.js
│   ├── package.json
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── public/
│   │   │   └── common/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## API Endpoints

### Public Endpoints

- `POST /api/public/report` - Submit a public report with photo
- `GET /api/public/report/:reportId` - Get report status

### Admin Endpoints (Requires Authentication)

- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Register new admin user
- `GET /api/missing-persons` - List all cases
- `POST /api/missing-persons` - Register new case
- `GET /api/matches` - List all matches
- `PUT /api/matches/:id/review` - Review a match
- `GET /api/matches/stats/dashboard` - Get dashboard statistics
- `POST /api/videos/upload` - Upload video for processing
- `GET /api/videos/:id/matches` - Get matches from video

## Configuration

### Environment Variables

Create a `.env` file in the backend directory (optional):

```env
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
ENCRYPTION_KEY=your-encryption-key-change-in-production
```

### Face Recognition Settings

Edit `backend/services/face_recognition_service.py`:

```python
self.confidence_threshold = 0.6  # 60% confidence threshold
```

### Video Processing Settings

Edit `backend/services/video_processor.py`:

```python
self.frame_skip = 30  # Process every 30th frame
self.confidence_threshold = 0.6  # 60% confidence threshold
```

## Security Features

- **JWT Authentication**: Secure admin panel access
- **Aadhar Encryption**: Encrypted storage of sensitive ID numbers
- **Password Hashing**: Bcrypt for secure password storage
- **File Upload Validation**: Type and size restrictions
- **Local Storage Only**: No external data transmission

## Performance Optimization

- Face encodings are cached in database
- Videos processed with frame skipping (configurable)
- Database indexes on frequently queried columns
- Image compression for storage efficiency

## Troubleshooting

### Face Recognition Issues

If face detection fails:
- Ensure good lighting in photos
- Use frontal face images
- Check image resolution (minimum 640x480)
- Lower confidence threshold if needed

### Database Locked

If you get "database is locked" errors:
- Only one write operation at a time
- Close all database connections properly
- Restart services if needed

### Python Dependencies

If `face_recognition` installation fails:
- Install system dependencies first (cmake, etc.)
- Use virtual environment: `python -m venv venv`
- Try: `pip install --no-cache-dir face_recognition`

## Backup and Maintenance

### Backup Database

```bash
cp backend/database/app.db backend/database/app.db.backup
```

### Clear Processed Reports

```sql
sqlite3 backend/database/app.db
UPDATE public_reports SET processed = 0;
```

### Export Data

All data can be exported via SQLite commands or the API endpoints.

## License

MIT License - Free for personal and commercial use.

## Support

For issues or questions, check the logs:
- Backend: Console output from Node.js server
- Face Recognition: Python service console output
- Frontend: Browser developer console

## Credits

Built with:
- face_recognition by Adam Geitgey
- OpenCV
- React, Express, SQLite
- Chart.js for visualizations
