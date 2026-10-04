import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { memoryStore, pool, isPostgresConnected } from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'mca_super_secret_jwt_key_2026_marketing_system';

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    let user: any = null;

    if (isPostgresConnected && pool) {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
      user = result.rows[0];
    } else {
      user = memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Authentication error' });
  }
}

export async function getProfile(req: any, res: Response) {
  return res.json({
    success: true,
    user: req.user,
  });
}
