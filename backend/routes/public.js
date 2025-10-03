const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const db = require('../database/db');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/public-reports'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG) are allowed'));
    }
  }
});

router.post('/report', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Photo is required' });
    }

    const reportId = `RPT-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const photoPath = `/uploads/public-reports/${req.file.filename}`;

    const { reporter_name, phone_number, found_location, found_address, additional_notes } = req.body;

    const result = await db.run(
      `INSERT INTO public_reports (report_id, photo_path, reporter_name, phone_number, found_location, found_address, additional_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [reportId, photoPath, reporter_name, phone_number, found_location, found_address, additional_notes]
    );

    res.status(201).json({
      message: 'Report submitted successfully',
      reportId,
      id: result.id
    });
  } catch (error) {
    console.error('Report submission error:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

router.get('/report/:reportId', async (req, res) => {
  try {
    const report = await db.get(
      'SELECT report_id, reporter_name, found_location, timestamp FROM public_reports WHERE report_id = ?',
      [req.params.reportId]
    );

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
