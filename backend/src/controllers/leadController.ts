import { Request, Response } from 'express';
import { memoryStore, pool, isPostgresConnected } from '../config/db';

export async function getLeads(req: Request, res: Response) {
  try {
    const { campaign_id, client_id, status, search } = req.query;

    if (isPostgresConnected && pool) {
      let query = `
        SELECT l.*, c.campaign_name, cl.name as client_name, cl.business_name
        FROM leads l
        LEFT JOIN campaigns c ON l.campaign_id = c.id
        JOIN clients cl ON l.client_id = cl.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (campaign_id) {
        params.push(campaign_id);
        query += ` AND l.campaign_id = $${params.length}`;
      }
      if (client_id) {
        params.push(client_id);
        query += ` AND l.client_id = $${params.length}`;
      }
      if (status && status !== 'all') {
        params.push(status);
        query += ` AND l.status = $${params.length}`;
      }
      if (search) {
        params.push(`%${search}%`);
        query += ` AND (l.name ILIKE $${params.length} OR l.email ILIKE $${params.length} OR l.source ILIKE $${params.length})`;
      }

      query += ' ORDER BY l.id DESC';
      const result = await pool.query(query, params);
      return res.json({ success: true, count: result.rows.length, data: result.rows });
    }

    let leads = memoryStore.leads.map((l) => {
      const campaign = memoryStore.campaigns.find((c) => c.id === l.campaign_id);
      const client = memoryStore.clients.find((cl) => cl.id === l.client_id);
      return {
        ...l,
        campaign_name: campaign?.campaign_name || 'Direct / Organic',
        client_name: client?.name || 'Unknown',
        business_name: client?.business_name || 'Unknown Business',
      };
    });

    if (campaign_id) {
      leads = leads.filter((l) => l.campaign_id === parseInt(String(campaign_id), 10));
    }
    if (client_id) {
      leads = leads.filter((l) => l.client_id === parseInt(String(client_id), 10));
    }
    if (status && status !== 'all') {
      leads = leads.filter((l) => l.status === status);
    }
    if (search) {
      const q = String(search).toLowerCase();
      leads = leads.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.source.toLowerCase().includes(q)
      );
    }

    return res.json({ success: true, count: leads.length, data: leads });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

export async function createLead(req: Request, res: Response) {
  try {
    const { campaign_id, client_id, name, email, phone, source, lead_date, status, estimated_value } = req.body;

    if (!client_id || !name || !email || !source) {
      return res.status(400).json({ success: false, message: 'Client, name, email, and source are required' });
    }

    const isConverted = status === 'Converted';
    const convDate = isConverted ? new Date().toISOString().slice(0, 10) : null;

    if (isPostgresConnected && pool) {
      const query = `
        INSERT INTO leads (campaign_id, client_id, name, email, phone, source, lead_date, status, estimated_value, converted, conversion_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      const result = await pool.query(query, [
        campaign_id || null,
        client_id,
        name,
        email,
        phone || '',
        source,
        lead_date || new Date().toISOString().slice(0, 10),
        status || 'New',
        estimated_value || 0,
        isConverted,
        convDate,
      ]);

      return res.status(201).json({ success: true, message: 'Lead created', data: result.rows[0] });
    }

    const newId = memoryStore.leads.length > 0 ? Math.max(...memoryStore.leads.map((l) => l.id)) + 1 : 1;
    const newLead = {
      id: newId,
      campaign_id: campaign_id ? parseInt(campaign_id, 10) : null,
      client_id: parseInt(client_id, 10),
      name,
      email,
      phone: phone || '',
      source,
      lead_date: lead_date || new Date().toISOString().slice(0, 10),
      status: status || 'New',
      estimated_value: parseFloat(estimated_value) || 0,
      converted: isConverted,
      conversion_date: convDate,
      created_at: new Date().toISOString(),
    };

    memoryStore.leads.unshift(newLead);
    return res.status(201).json({ success: true, message: 'Lead created', data: newLead });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

export async function updateLeadStatus(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, estimated_value } = req.body;

    const isConverted = status === 'Converted';
    const convDate = isConverted ? new Date().toISOString().slice(0, 10) : null;

    if (isPostgresConnected && pool) {
      const query = `
        UPDATE leads
        SET status = COALESCE($1, status),
            estimated_value = COALESCE($2, estimated_value),
            converted = $3,
            conversion_date = CASE WHEN $3 = TRUE THEN COALESCE(conversion_date, CURRENT_DATE) ELSE NULL END
        WHERE id = $4
        RETURNING *
      `;
      const result = await pool.query(query, [status, estimated_value, isConverted, id]);
      return res.json({ success: true, message: 'Lead updated', data: result.rows[0] });
    }

    const lead = memoryStore.leads.find((l) => l.id === id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    lead.status = status || lead.status;
    if (estimated_value !== undefined) lead.estimated_value = parseFloat(estimated_value);
    lead.converted = isConverted;
    lead.conversion_date = isConverted ? convDate : null;

    return res.json({ success: true, message: 'Lead updated', data: lead });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

export async function deleteLead(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const index = memoryStore.leads.findIndex((l) => l.id === id);
    if (index !== -1) {
      memoryStore.leads.splice(index, 1);
    }
    return res.json({ success: true, message: 'Lead deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}
