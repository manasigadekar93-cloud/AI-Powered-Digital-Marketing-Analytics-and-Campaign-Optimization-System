import { Request, Response } from 'express';
import { getDbStatus, memoryStore, pool, isPostgresConnected } from '../config/db';

export async function getDatabaseStatus(req: Request, res: Response) {
  try {
    const status = getDbStatus();

    const counts = {
      users: isPostgresConnected && pool ? (await pool.query('SELECT count(*) FROM users')).rows[0].count : memoryStore.users.length,
      clients: isPostgresConnected && pool ? (await pool.query('SELECT count(*) FROM clients')).rows[0].count : memoryStore.clients.length,
      campaigns: isPostgresConnected && pool ? (await pool.query('SELECT count(*) FROM campaigns')).rows[0].count : memoryStore.campaigns.length,
      campaign_metrics: isPostgresConnected && pool ? (await pool.query('SELECT count(*) FROM campaign_metrics')).rows[0].count : memoryStore.campaignMetrics.length,
      leads: isPostgresConnected && pool ? (await pool.query('SELECT count(*) FROM leads')).rows[0].count : memoryStore.leads.length,
      customers: isPostgresConnected && pool ? (await pool.query('SELECT count(*) FROM customers')).rows[0].count : memoryStore.customers.length,
      recommendations: isPostgresConnected && pool ? (await pool.query('SELECT count(*) FROM recommendations')).rows[0].count : memoryStore.recommendations.length,
    };

    return res.json({
      success: true,
      status,
      tableCounts: counts,
      environment: {
        databaseUrl: process.env.DATABASE_URL ? 'postgresql://postgres:***@localhost:5432/marketing_analytics_db' : 'Not configured (using localhost:5432 default)',
        jwtConfigured: Boolean(process.env.JWT_SECRET),
        aiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}
