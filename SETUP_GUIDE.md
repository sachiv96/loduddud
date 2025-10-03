# Quick Setup Guide

## Step-by-Step Installation

### 1. Install System Dependencies

#### macOS
```bash
brew install cmake
```

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install cmake libopenblas-dev liblapack-dev python3-dev
```

#### Windows
- Install Visual Studio Build Tools
- Install CMake from https://cmake.org/download/

### 2. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install Node.js dependencies
npm install

# Create Python virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Setup database
node database/setup.js
```

### 3. Setup Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### 4. First Run

Open three terminal windows:

**Terminal 1 - Backend Server:**
```bash
cd backend
npm start
```

**Terminal 2 - Face Recognition Service:**
```bash
cd backend/services
python face_recognition_service.py
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application

- **Public Portal**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin/login
  - Username: `admin`
  - Password: `admin123`

## Testing the System

### Test Public Report

1. Visit http://localhost:5173
2. Upload a test photo (clear frontal face)
3. Fill in location details
4. Submit and save the report ID
5. Check Terminal 2 to see face recognition processing

### Test Admin Functions

1. Login to admin panel
2. Register a missing person case with photos
3. View dashboard statistics
4. Check matches section for any automatic matches

## Common Issues

### Issue: face_recognition won't install

**Solution**: Make sure you have cmake and system dependencies installed first.

```bash
# macOS
brew install cmake

# Ubuntu
sudo apt-get install cmake build-essential

# Then try again
pip install face_recognition
```

### Issue: Database locked

**Solution**: Make sure only one instance of the backend server is running.

```bash
# Kill any existing processes
pkill -f "node server.js"

# Restart backend
npm start
```

### Issue: Port already in use

**Solution**: Change the port in configuration or kill the process using the port.

```bash
# Find process on port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Issue: Photos not uploading

**Solution**: Check upload directory permissions.

```bash
# Make upload directories writable
chmod -R 755 backend/uploads/
```

## Development Tips

### Running in Development Mode

Backend with auto-reload:
```bash
npm install -g nodemon
cd backend
nodemon server.js
```

### Checking Database

```bash
sqlite3 backend/database/app.db
.tables
SELECT * FROM missing_persons;
.exit
```

### Adjusting Confidence Threshold

Edit `backend/services/face_recognition_service.py`:

```python
self.confidence_threshold = 0.5  # Lower = more matches, less accurate
```

### Processing Test Video

```bash
cd backend/services
python video_processor.py 1  # Process video with ID 1
```

## Production Deployment

For production use:

1. Change default admin password
2. Update JWT_SECRET and ENCRYPTION_KEY
3. Use HTTPS with reverse proxy (nginx/apache)
4. Setup systemd services for auto-restart
5. Configure regular database backups
6. Monitor disk space for uploads

## Next Steps

- Configure email notifications
- Setup automated backups
- Add more admin users
- Customize UI branding
- Integrate with local police systems
