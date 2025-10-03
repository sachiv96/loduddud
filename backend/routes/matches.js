const express = require('express');
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { status = 'pending', min_confidence = 60 } = req.query;

    const matches = await db.all(
      `SELECT
        m.id,
        m.confidence,
        m.status,
        m.created_at,
        m.matched_photo,
        m.report_photo,
        mp.case_number,
        mp.full_name,
        mp.age,
        mp.gender,
        pr.report_id,
        pr.reporter_name,
        pr.found_location,
        pr.phone_number
      FROM matches m
      JOIN missing_persons mp ON m.case_id = mp.id
      JOIN public_reports pr ON m.report_id = pr.id
      WHERE m.status = ? AND m.confidence >= ?
      ORDER BY m.confidence DESC, m.created_at DESC`,
      [status, min_confidence]
    );

    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const match = await db.get(
      `SELECT
        m.*,
        mp.case_number,
        mp.full_name,
        mp.age,
        mp.gender,
        mp.phone,
        mp.email,
        mp.photo_paths,
        pr.report_id,
        pr.reporter_name,
        pr.phone_number,
        pr.found_location,
        pr.found_address,
        pr.additional_notes,
        pr.photo_path as report_photo_path
      FROM matches m
      JOIN missing_persons mp ON m.case_id = mp.id
      JOIN public_reports pr ON m.report_id = pr.id
      WHERE m.id = ?`,
      [req.params.id]
    );

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.photo_paths) {
      match.photo_paths = JSON.parse(match.photo_paths);
    }

    res.json(match);
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/review', async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!['confirmed', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db.run(
      'UPDATE matches SET status = ?, notes = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, notes, req.user.id, req.params.id]
    );

    res.json({ message: 'Match reviewed successfully' });
  } catch (error) {
    console.error('Error reviewing match:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/case/:caseId', async (req, res) => {
  try {
    const matches = await db.all(
      `SELECT
        m.*,
        pr.report_id,
        pr.reporter_name,
        pr.found_location,
        pr.photo_path
      FROM matches m
      JOIN public_reports pr ON m.report_id = pr.id
      WHERE m.case_id = ?
      ORDER BY m.confidence DESC, m.created_at DESC`,
      [req.params.caseId]
    );

    res.json(matches);
  } catch (error) {
    console.error('Error fetching case matches:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/stats/dashboard', async (req, res) => {
  try {
    const stats = {
      totalCases: 0,
      activeCases: 0,
      totalReports: 0,
      pendingMatches: 0,
      confirmedMatches: 0,
      successRate: 0
    };

    const totalCases = await db.get('SELECT COUNT(*) as count FROM missing_persons');
    stats.totalCases = totalCases.count;

    const activeCases = await db.get('SELECT COUNT(*) as count FROM missing_persons WHERE status = ?', ['active']);
    stats.activeCases = activeCases.count;

    const totalReports = await db.get('SELECT COUNT(*) as count FROM public_reports');
    stats.totalReports = totalReports.count;

    const pendingMatches = await db.get('SELECT COUNT(*) as count FROM matches WHERE status = ?', ['pending']);
    stats.pendingMatches = pendingMatches.count;

    const confirmedMatches = await db.get('SELECT COUNT(*) as count FROM matches WHERE status = ?', ['confirmed']);
    stats.confirmedMatches = confirmedMatches.count;

    const foundCases = await db.get('SELECT COUNT(*) as count FROM missing_persons WHERE status = ?', ['found']);
    stats.successRate = stats.totalCases > 0 ? ((foundCases.count / stats.totalCases) * 100).toFixed(2) : 0;

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
