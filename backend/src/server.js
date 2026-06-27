import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import analyzeRouter from './routes/analyze.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    // Allow any Vercel deployment, localhost, or if no origin (e.g. server-to-server)
    if (!origin || origin.includes('localhost') || origin.includes('vercel.app') || origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(null, origin); // Just echo the origin to avoid strict blocking during dev
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', analyzeRouter);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ─── MongoDB Connection ───────────────────────────────────────────────────────
async function startServer() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.warn('⚠️  MongoDB connection failed — memory features disabled:', err.message);
    // Server starts anyway — memory is optional
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 SkiesInvest Backend running on http://localhost:${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api/analyze`);
    console.log(`❤️  Health: http://localhost:${PORT}/health\n`);
  });
}

startServer();
