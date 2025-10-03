const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-encryption-key-change-in-production';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const caseFolder = req.body.case_number || `CASE-${Date.now()}`;
    const uploadPath = path.join(__dirname, '../uploads/family-cases', caseFolder);
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
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
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.use(authMiddleware);

router.post('/', upload.array('photos', 10), async (req, res) => {
  try {
    const {
      full_name,
      age,
      gender,
      aadhar,
      phone,
      email,
      last_seen_location,
      last_seen_date,
      physical_description
    } = req.body;

    if (!full_name || !req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Name and at least one photo are required' });
    }

    const caseNumber = req.body.case_number || `CASE-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const aadharEncrypted = aadhar ? CryptoJS.AES.encrypt(aadhar, ENCRYPTION_KEY).toString() : null;

    const photoPaths = req.files.map(file => `/uploads/family-cases/${caseNumber}/${file.filename}`);

    const result = await db.run(
      `INSERT INTO missing_persons
       (case_number, full_name, age, gender, aadhar_encrypted, phone, email, last_seen_location, last_seen_date, photo_paths, physical_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        caseNumber,
        full_name,
        age,
        gender,
        aadharEncrypted,
        phone,
        email,
        last_seen_location,
        last_seen_date,
        JSON.stringify(photoPaths),
        physical_description
      ]
    );

    res.status(201).json({
      message: 'Missing person case registered successfully',
      caseNumber,
      id: result.id
    });
  } catch (error) {
    console.error('Case registration error:', error);
    res.status(500).json({ error: 'Failed to register case' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { status = 'active' } = req.query;
    const cases = await db.all(
      'SELECT id, case_number, full_name, age, gender, last_seen_location, last_seen_date, status, created_at FROM missing_persons WHERE status = ? ORDER BY created_at DESC',
      [status]
    );

    res.json(cases);
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const caseData = await db.get(
      'SELECT * FROM missing_persons WHERE id = ?',
      [req.params.id]
    );

    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    if (caseData.photo_paths) {
      caseData.photo_paths = JSON.parse(caseData.photo_paths);
    }

    if (caseData.aadhar_encrypted) {
      caseData.aadhar = CryptoJS.AES.decrypt(caseData.aadhar_encrypted, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
      delete caseData.aadhar_encrypted;
    }

    res.json(caseData);
  } catch (error) {
    console.error('Error fetching case:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'found', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db.run(
      'UPDATE missing_persons SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, req.params.id]
    );

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
