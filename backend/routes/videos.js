const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/videos'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mov|mkv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('video/');

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

router.use(authMiddleware);

router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Video file is required' });
    }

    const videoPath = `/uploads/videos/${req.file.filename}`;

    const result = await db.run(
      'INSERT INTO video_uploads (video_path, uploaded_by, processing_status) VALUES (?, ?, ?)',
      [videoPath, req.user.id, 'pending']
    );

    res.status(201).json({
      message: 'Video uploaded successfully',
      videoId: result.id,
      videoPath
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

router.get('/', async (req, res) => {
  try {
    const videos = await db.all(
      `SELECT
        v.*,
        COUNT(vm.id) as match_count
      FROM video_uploads v
      LEFT JOIN video_matches vm ON v.id = vm.video_id
      GROUP BY v.id
      ORDER BY v.created_at DESC`
    );

    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id/matches', async (req, res) => {
  try {
    const matches = await db.all(
      `SELECT
        vm.*,
        mp.case_number,
        mp.full_name,
        mp.age,
        mp.gender
      FROM video_matches vm
      JOIN missing_persons mp ON vm.case_id = mp.id
      WHERE vm.video_id = ?
      ORDER BY vm.timestamp ASC`,
      [req.params.id]
    );

    res.json(matches);
  } catch (error) {
    console.error('Error fetching video matches:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const video = await db.get(
      'SELECT * FROM video_uploads WHERE id = ?',
      [req.params.id]
    );

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
