import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authRoutes from './backend/src/routes/authRoutes';
import clientRoutes from './backend/src/routes/clientRoutes';
import campaignRoutes from './backend/src/routes/campaignRoutes';
import metricsRoutes from './backend/src/routes/metricsRoutes';
import leadRoutes from './backend/src/routes/leadRoutes';
import analyticsRoutes from './backend/src/routes/analyticsRoutes';
import recommendationRoutes from './backend/src/routes/recommendationRoutes';
import aiRoutes from './backend/src/routes/aiRoutes';
import reportRoutes from './backend/src/routes/reportRoutes';
import dbRoutes from './backend/src/routes/dbRoutes';
import { initializeDatabase } from './backend/src/config/db';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize PostgreSQL / Transactional Store
  const dbStatus = await initializeDatabase();
  console.log(`[Database] Status: ${dbStatus.mode} - ${dbStatus.message}`);

  // Register REST API endpoints
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

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'UP',
      system: 'AI-Powered Digital Marketing Analytics and Campaign Optimization System',
      timestamp: new Date().toISOString(),
      database: dbStatus,
    });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Failed to start:', err);
});
