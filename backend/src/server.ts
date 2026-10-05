import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import clientRoutes from './routes/clientRoutes';
import campaignRoutes from './routes/campaignRoutes';
import metricsRoutes from './routes/metricsRoutes';
import leadRoutes from './routes/leadRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import recommendationRoutes from './routes/recommendationRoutes';
import aiRoutes from './routes/aiRoutes';
import reportRoutes from './routes/reportRoutes';
import dbRoutes from './routes/dbRoutes';
import { initializeDatabase } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// CORS middleware for Angular local dev (http://localhost:4200)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Local PostgreSQL / Transactional Store
initializeDatabase().then((dbStatus) => {
  console.log(`[PostgreSQL Engine] ${dbStatus.mode} on ${dbStatus.host} (${dbStatus.database}): ${dbStatus.message}`);
});

// REST API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/ai-insights', aiRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/database', dbRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    project: 'AI-Powered Digital Marketing Analytics and Campaign Optimization System',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Express Backend] API server running on http://localhost:${PORT}`);
});
