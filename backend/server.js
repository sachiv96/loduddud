const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const missingPersonsRoutes = require('./routes/missing-persons');
const matchesRoutes = require('./routes/matches');
const videosRoutes = require('./routes/videos');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/missing-persons', missingPersonsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/videos', videosRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const dbPath = path.join(__dirname, 'database', 'app.db');
if (!fs.existsSync(dbPath)) {
  console.log('Database not found. Please run: node database/setup.js');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  - Public Reports: http://localhost:${PORT}/api/public`);
  console.log(`  - Authentication: http://localhost:${PORT}/api/auth`);
  console.log(`  - Missing Persons: http://localhost:${PORT}/api/missing-persons`);
  console.log(`  - Matches: http://localhost:${PORT}/api/matches`);
  console.log(`  - Videos: http://localhost:${PORT}/api/videos`);
});

module.exports = app;
