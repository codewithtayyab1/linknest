require('dotenv').config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET must be set and at least 32 characters. Exiting.');
  process.exit(1);
}

const express       = require('express');
const cors          = require('cors');
const helmet        = require('helmet');
const sanitize  = require('./middleware/sanitize');
const rateLimit = require('express-rate-limit');
const connectDB       = require('./config/db');
const authRoutes      = require('./routes/authRoutes');
const linkRoutes      = require('./routes/linkRoutes');
const publicRoutes    = require('./routes/publicRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

connectDB();

// ── security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// ── body parsing + NoSQL injection guard ─────────────────────────────────────
app.use(express.json());
app.use(sanitize);

// ── rate limiters ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: process.env.NODE_ENV === 'production' ? 10 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

// ── routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',      authLimiter,   authRoutes);
app.use('/api/links',                    linkRoutes);
app.use('/api/public',    publicLimiter, publicRoutes);
app.use('/api/analytics',               analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
