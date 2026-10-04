import { Request, Response } from 'express';
import { memoryStore, pool, isPostgresConnected } from '../config/db';
import { calculateKPIs } from '../utils/kpiCalculator';

export async function getMetrics(req: Request, res: Response) {
  try {
    const { campaign_id, start_date, end_date } = req.query;

    if (isPostgresConnected && pool) {
      let query = `
        SELECT m.*, c.campaign_name, c.platform
        FROM campaign_metrics m
        JOIN campaigns c ON m.campaign_id = c.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (campaign_id) {
        params.push(campaign_id);
        query += ` AND m.campaign_id = $${params.length}`;
      }
      if (start_date) {
        params.push(start_date);
        query += ` AND m.metric_date >= $${params.length}`;
      }
      if (end_date) {
        params.push(end_date);
        query += ` AND m.metric_date <= $${params.length}`;
      }

      query += ' ORDER BY m.metric_date DESC, m.id DESC';
      const result = await pool.query(query, params);
      return res.json({ success: true, count: result.rows.length, data: result.rows });
    }

    let metrics = memoryStore.campaignMetrics.map((m) => {
      const campaign = memoryStore.campaigns.find((c) => c.id === m.campaign_id);
      return {
        ...m,
        campaign_name: campaign?.campaign_name || 'Campaign #' + m.campaign_id,
        platform: campaign?.platform || 'Other',
      };
    });

    if (campaign_id) {
      metrics = metrics.filter((m) => m.campaign_id === parseInt(String(campaign_id), 10));
    }
    if (start_date) {
      metrics = metrics.filter((m) => m.metric_date >= String(start_date));
    }
    if (end_date) {
      metrics = metrics.filter((m) => m.metric_date <= String(end_date));
    }

    return res.json({ success: true, count: metrics.length, data: metrics });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

export async function addMetric(req: Request, res: Response) {
  try {
    const {
      campaign_id,
      metric_date,
      impressions,
      reach,
      clicks,
      advertising_spend,
      leads,
      qualified_leads,
      conversions,
      revenue,
    } = req.body;

    if (!campaign_id || !metric_date) {
      return res.status(400).json({ success: false, message: 'Campaign and metric date are required' });
    }

    const calculated = calculateKPIs({
      impressions: Number(impressions) || 0,
      reach: Number(reach) || 0,
      clicks: Number(clicks) || 0,
      advertisingSpend: Number(advertising_spend) || 0,
      leads: Number(leads) || 0,
      qualifiedLeads: Number(qualified_leads) || 0,
      conversions: Number(conversions) || 0,
      revenue: Number(revenue) || 0,
    });

    if (isPostgresConnected && pool) {
      const query = `
        INSERT INTO campaign_metrics (
          campaign_id, metric_date, impressions, reach, clicks, advertising_spend,
          leads, qualified_leads, conversions, revenue, ctr, cpc, cpl, conversion_rate, cac, roas, roi
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *
      `;
      const result = await pool.query(query, [
        campaign_id,
        metric_date,
        impressions || 0,
        reach || 0,
        clicks || 0,
        advertising_spend || 0,
        leads || 0,
        qualified_leads || 0,
        conversions || 0,
        revenue || 0,
        calculated.ctr,
        calculated.cpc,
        calculated.cpl,
        calculated.conversionRate,
        calculated.cac,
        calculated.roas,
        calculated.roi,
      ]);

      return res.status(201).json({ success: true, message: 'Metric recorded', data: result.rows[0] });
    }

    const newId = memoryStore.campaignMetrics.length > 0 ? Math.max(...memoryStore.campaignMetrics.map((m) => m.id)) + 1 : 1;
    const newMetric = {
      id: newId,
      campaign_id: parseInt(campaign_id, 10),
      metric_date,
      impressions: Number(impressions) || 0,
      reach: Number(reach) || 0,
      clicks: Number(clicks) || 0,
      advertising_spend: Number(advertising_spend) || 0,
      leads: Number(leads) || 0,
      qualified_leads: Number(qualified_leads) || 0,
      conversions: Number(conversions) || 0,
      revenue: Number(revenue) || 0,
      ...calculated,
      created_at: new Date().toISOString(),
    };

    memoryStore.campaignMetrics.unshift(newMetric);
    return res.status(201).json({ success: true, message: 'Metric recorded', data: newMetric });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

export async function batchImportMetrics(req: Request, res: Response) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Expected array of metric records' });
    }

    const processed = items.map((item, idx) => {
      const calculated = calculateKPIs({
        impressions: Number(item.impressions) || 0,
        reach: Number(item.reach) || 0,
        clicks: Number(item.clicks) || 0,
        advertisingSpend: Number(item.advertising_spend) || 0,
        leads: Number(item.leads) || 0,
        qualifiedLeads: Number(item.qualified_leads) || 0,
        conversions: Number(item.conversions) || 0,
        revenue: Number(item.revenue) || 0,
      });

      return {
        id: memoryStore.campaignMetrics.length + idx + 1,
        campaign_id: parseInt(item.campaign_id, 10),
        metric_date: item.metric_date || new Date().toISOString().slice(0, 10),
        impressions: Number(item.impressions) || 0,
        reach: Number(item.reach) || 0,
        clicks: Number(item.clicks) || 0,
        advertising_spend: Number(item.advertising_spend) || 0,
        leads: Number(item.leads) || 0,
        qualified_leads: Number(item.qualified_leads) || 0,
        conversions: Number(item.conversions) || 0,
        revenue: Number(item.revenue) || 0,
        ...calculated,
        created_at: new Date().toISOString(),
      };
    });

    memoryStore.campaignMetrics.unshift(...processed);
    return res.json({ success: true, message: `Successfully imported ${processed.length} metrics records` });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

export async function deleteMetric(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const index = memoryStore.campaignMetrics.findIndex((m) => m.id === id);
    if (index !== -1) {
      memoryStore.campaignMetrics.splice(index, 1);
    }
    return res.json({ success: true, message: 'Metric entry deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}
