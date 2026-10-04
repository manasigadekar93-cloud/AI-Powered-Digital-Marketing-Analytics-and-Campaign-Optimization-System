import { Request, Response } from 'express';
import { memoryStore, pool, isPostgresConnected } from '../config/db';

export async function getCampaigns(req: Request, res: Response) {
  try {
    const { client_id, platform, status, search } = req.query;

    if (isPostgresConnected && pool) {
      let query = `
        SELECT c.*, cl.name as client_name, cl.business_name
        FROM campaigns c
        JOIN clients cl ON c.client_id = cl.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (client_id) {
        params.push(client_id);
        query += ` AND c.client_id = $${params.length}`;
      }
      if (platform && platform !== 'all') {
        params.push(platform);
        query += ` AND c.platform = $${params.length}`;
      }
      if (status && status !== 'all') {
        params.push(status);
        query += ` AND c.status = $${params.length}`;
      }
      if (search) {
        params.push(`%${search}%`);
        query += ` AND (c.campaign_name ILIKE $${params.length} OR c.target_audience ILIKE $${params.length})`;
      }

      query += ' ORDER BY c.id DESC';
      const result = await pool.query(query, params);
      return res.json({ success: true, count: result.rows.length, data: result.rows });
    }

    let campaigns = memoryStore.campaigns.map((c) => {
      const client = memoryStore.clients.find((cl) => cl.id === c.client_id);
      return {
        ...c,
        client_name: client?.name || 'Unknown',
        business_name: client?.business_name || 'Unknown Business',
      };
    });

    if (client_id) {
      campaigns = campaigns.filter((c) => c.client_id === parseInt(String(client_id), 10));
    }
    if (platform && platform !== 'all') {
      campaigns = campaigns.filter((c) => c.platform === platform);
    }
    if (status && status !== 'all') {
      campaigns = campaigns.filter((c) => c.status === status);
    }
    if (search) {
      const q = String(search).toLowerCase();
      campaigns = campaigns.filter(
        (c) =>
          c.campaign_name.toLowerCase().includes(q) ||
          c.target_audience?.toLowerCase().includes(q) ||
          c.business_name.toLowerCase().includes(q)
      );
    }

    return res.json({ success: true, count: campaigns.length, data: campaigns });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

export async function getCampaignById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);

    if (isPostgresConnected && pool) {
      const campaignRes = await pool.query(
        `SELECT c.*, cl.name as client_name, cl.business_name, cl.email as client_email
         FROM campaigns c
         JOIN clients cl ON c.client_id = cl.id
         WHERE c.id = $1`,
        [id]
      );

      if (campaignRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
      }

      const metricsRes = await pool.query(
        'SELECT * FROM campaign_metrics WHERE campaign_id = $1 ORDER BY metric_date DESC',
        [id]
      );

      return res.json({
        success: true,
        data: {
          ...campaignRes.rows[0],
          metrics: metricsRes.rows,
        },
      });
    }

    const campaign = memoryStore.campaigns.find((c) => c.id === id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const client = memoryStore.clients.find((cl) => cl.id === campaign.client_id);
    const metrics = memoryStore.campaignMetrics.filter((m) => m.campaign_id === id);

    return res.json({
      success: true,
      data: {
        ...campaign,
        client_name: client?.name || 'Unknown',
        business_name: client?.business_name || 'Unknown Business',
        client_email: client?.email,
        metrics,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

export async function createCampaign(req: Request, res: Response) {
  try {
    const {
      client_id,
      campaign_name,
      platform,
      campaign_objective,
      budget,
      start_date,
      end_date,
      target_audience,
      status,
      description,
    } = req.body;

    if (!client_id || !campaign_name || !platform || !campaign_objective || !budget || !start_date || !end_date) {
      return res.status(400).json({ success: false, message: 'Missing required campaign fields' });
    }

    if (isPostgresConnected && pool) {
      const query = `
        INSERT INTO campaigns (client_id, campaign_name, platform, campaign_objective, budget, start_date, end_date, target_audience, status, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      const result = await pool.query(query, [
        client_id,
        campaign_name,
        platform,
        campaign_objective,
        budget,
        start_date,
        end_date,
        target_audience || '',
        status || 'Active',
        description || '',
      ]);
      return res.status(201).json({ success: true, message: 'Campaign created', data: result.rows[0] });
    }

    const newId = memoryStore.campaigns.length > 0 ? Math.max(...memoryStore.campaigns.map((c) => c.id)) + 1 : 1;
    const newCampaign = {
      id: newId,
      client_id: parseInt(client_id, 10),
      campaign_name,
      platform,
      campaign_objective,
      budget: parseFloat(budget),
      start_date,
      end_date,
      target_audience: target_audience || '',
      status: status || 'Active',
      description: description || '',
      created_at: new Date().toISOString(),
    };
    memoryStore.campaigns.unshift(newCampaign);

    return res.status(201).json({ success: true, message: 'Campaign created', data: newCampaign });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

export async function updateCampaign(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      client_id,
      campaign_name,
      platform,
      campaign_objective,
      budget,
      start_date,
      end_date,
      target_audience,
      status,
      description,
    } = req.body;

    if (isPostgresConnected && pool) {
      const query = `
        UPDATE campaigns
        SET client_id = COALESCE($1, client_id),
            campaign_name = COALESCE($2, campaign_name),
            platform = COALESCE($3, platform),
            campaign_objective = COALESCE($4, campaign_objective),
            budget = COALESCE($5, budget),
            start_date = COALESCE($6, start_date),
            end_date = COALESCE($7, end_date),
            target_audience = COALESCE($8, target_audience),
            status = COALESCE($9, status),
            description = COALESCE($10, description)
        WHERE id = $11
        RETURNING *
      `;
      const result = await pool.query(query, [
        client_id,
        campaign_name,
        platform,
        campaign_objective,
        budget,
        start_date,
        end_date,
        target_audience,
        status,
        description,
        id,
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
      }
      return res.json({ success: true, message: 'Campaign updated', data: result.rows[0] });
    }

    const index = memoryStore.campaigns.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    memoryStore.campaigns[index] = {
      ...memoryStore.campaigns[index],
      client_id: client_id !== undefined ? parseInt(client_id, 10) : memoryStore.campaigns[index].client_id,
      campaign_name: campaign_name ?? memoryStore.campaigns[index].campaign_name,
      platform: platform ?? memoryStore.campaigns[index].platform,
      campaign_objective: campaign_objective ?? memoryStore.campaigns[index].campaign_objective,
      budget: budget !== undefined ? parseFloat(budget) : memoryStore.campaigns[index].budget,
      start_date: start_date ?? memoryStore.campaigns[index].start_date,
      end_date: end_date ?? memoryStore.campaigns[index].end_date,
      target_audience: target_audience ?? memoryStore.campaigns[index].target_audience,
      status: status ?? memoryStore.campaigns[index].status,
      description: description ?? memoryStore.campaigns[index].description,
    };

    return res.json({ success: true, message: 'Campaign updated', data: memoryStore.campaigns[index] });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

export async function deleteCampaign(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);

    if (isPostgresConnected && pool) {
      await pool.query('DELETE FROM campaigns WHERE id = $1', [id]);
      return res.json({ success: true, message: 'Campaign deleted' });
    }

    const index = memoryStore.campaigns.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    memoryStore.campaigns.splice(index, 1);
    memoryStore.campaignMetrics = memoryStore.campaignMetrics.filter((m) => m.campaign_id !== id);

    return res.json({ success: true, message: 'Campaign deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}
