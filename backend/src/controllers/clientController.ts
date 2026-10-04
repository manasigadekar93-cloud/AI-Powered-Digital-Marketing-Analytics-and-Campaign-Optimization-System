import { Request, Response } from 'express';
import { memoryStore, pool, isPostgresConnected } from '../config/db';

export async function getClients(req: Request, res: Response) {
  try {
    const { search, status, industry } = req.query;

    if (isPostgresConnected && pool) {
      let query = 'SELECT * FROM clients WHERE 1=1';
      const params: any[] = [];

      if (search) {
        params.push(`%${search}%`);
        query += ` AND (name ILIKE $${params.length} OR business_name ILIKE $${params.length} OR email ILIKE $${params.length})`;
      }
      if (status && status !== 'all') {
        params.push(status);
        query += ` AND status = $${params.length}`;
      }
      if (industry && industry !== 'all') {
        params.push(industry);
        query += ` AND industry = $${params.length}`;
      }

      query += ' ORDER BY id DESC';
      const result = await pool.query(query, params);
      return res.json({ success: true, count: result.rows.length, data: result.rows });
    }

    let clients = [...memoryStore.clients];

    if (search) {
      const q = String(search).toLowerCase();
      clients = clients.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.business_name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }
    if (status && status !== 'all') {
      clients = clients.filter((c) => c.status === status);
    }
    if (industry && industry !== 'all') {
      clients = clients.filter((c) => c.industry === industry);
    }

    return res.json({ success: true, count: clients.length, data: clients });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

export async function getClientById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);

    if (isPostgresConnected && pool) {
      const result = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Client not found' });
      }
      return res.json({ success: true, data: result.rows[0] });
    }

    const client = memoryStore.clients.find((c) => c.id === id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    return res.json({ success: true, data: client });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

export async function createClient(req: Request, res: Response) {
  try {
    const { name, business_name, email, phone, industry, address, status } = req.body;

    if (!name || !business_name || !email || !industry) {
      return res.status(400).json({ success: false, message: 'Name, business name, email, and industry are required' });
    }

    if (isPostgresConnected && pool) {
      const query = `
        INSERT INTO clients (name, business_name, email, phone, industry, address, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const result = await pool.query(query, [
        name,
        business_name,
        email,
        phone || '',
        industry,
        address || '',
        status || 'Active',
      ]);
      return res.status(201).json({ success: true, message: 'Client created', data: result.rows[0] });
    }

    const newId = memoryStore.clients.length > 0 ? Math.max(...memoryStore.clients.map((c) => c.id)) + 1 : 1;
    const newClient = {
      id: newId,
      name,
      business_name,
      email,
      phone: phone || '',
      industry,
      address: address || '',
      status: status || 'Active',
      created_at: new Date().toISOString(),
    };
    memoryStore.clients.unshift(newClient);

    return res.status(201).json({ success: true, message: 'Client created', data: newClient });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

export async function updateClient(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, business_name, email, phone, industry, address, status } = req.body;

    if (isPostgresConnected && pool) {
      const query = `
        UPDATE clients 
        SET name = COALESCE($1, name),
            business_name = COALESCE($2, business_name),
            email = COALESCE($3, email),
            phone = COALESCE($4, phone),
            industry = COALESCE($5, industry),
            address = COALESCE($6, address),
            status = COALESCE($7, status),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
      `;
      const result = await pool.query(query, [name, business_name, email, phone, industry, address, status, id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Client not found' });
      }
      return res.json({ success: true, message: 'Client updated', data: result.rows[0] });
    }

    const index = memoryStore.clients.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    memoryStore.clients[index] = {
      ...memoryStore.clients[index],
      name: name ?? memoryStore.clients[index].name,
      business_name: business_name ?? memoryStore.clients[index].business_name,
      email: email ?? memoryStore.clients[index].email,
      phone: phone ?? memoryStore.clients[index].phone,
      industry: industry ?? memoryStore.clients[index].industry,
      address: address ?? memoryStore.clients[index].address,
      status: status ?? memoryStore.clients[index].status,
    };

    return res.json({ success: true, message: 'Client updated', data: memoryStore.clients[index] });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

export async function deleteClient(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);

    if (isPostgresConnected && pool) {
      await pool.query('DELETE FROM clients WHERE id = $1', [id]);
      return res.json({ success: true, message: 'Client deleted' });
    }

    const index = memoryStore.clients.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    memoryStore.clients.splice(index, 1);
    // Cascade delete campaigns & leads
    memoryStore.campaigns = memoryStore.campaigns.filter((c) => c.client_id !== id);
    memoryStore.leads = memoryStore.leads.filter((l) => l.client_id !== id);

    return res.json({ success: true, message: 'Client deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}
