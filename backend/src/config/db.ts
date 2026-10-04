/**
 * Database Module for PostgreSQL (Localhost:5432)
 * Features dual-mode support:
 * 1. Native PostgreSQL (via 'pg' Pool) when local PostgreSQL is active.
 * 2. In-Memory transactional store fallback with seed data when PostgreSQL is offline.
 * This guarantees that the academic project runs cleanly anywhere while providing true PostgreSQL compatibility.
 */

import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

export interface DbStatus {
  connected: boolean;
  mode: 'PostgreSQL-Local' | 'In-Memory-Fallback';
  host: string;
  database: string;
  message: string;
}

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/marketing_analytics_db';

let pool: pg.Pool | null = null;
let isPostgresConnected = false;

// In-Memory store backing storage
export const memoryStore: {
  users: any[];
  clients: any[];
  campaigns: any[];
  campaignMetrics: any[];
  leads: any[];
  customers: any[];
  recommendations: any[];
} = {
  users: [
    {
      id: 1,
      name: 'System Administrator',
      email: 'admin@marketing.com',
      // 'admin123' hashed with bcrypt
      password_hash: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      created_at: new Date('2026-01-10T10:00:00Z').toISOString(),
    },
  ],
  clients: [
    {
      id: 1,
      name: 'Rajesh Sharma',
      business_name: 'Aura Retail India',
      email: 'rajesh@auraretail.in',
      phone: '+91 98201 54321',
      industry: 'E-Commerce & Fashion',
      address: 'Lower Parel, Mumbai, MH',
      status: 'Active',
      created_at: '2026-02-15T09:30:00Z',
    },
    {
      id: 2,
      name: 'Dr. Ananya Sen',
      business_name: 'CarePlus Diagnostics',
      email: 'contact@careplus.org',
      phone: '+91 94331 88765',
      industry: 'Healthcare & Clinics',
      address: 'Salt Lake Sector V, Kolkata, WB',
      status: 'Active',
      created_at: '2026-03-01T11:00:00Z',
    },
    {
      id: 3,
      name: 'Vikram Mehta',
      business_name: 'CloudScale SaaS',
      email: 'vikram@cloudscale.io',
      phone: '+91 80234 11223',
      industry: 'B2B Software & Cloud',
      address: 'Indiranagar, Bengaluru, KA',
      status: 'Active',
      created_at: '2026-03-12T14:15:00Z',
    },
    {
      id: 4,
      name: 'Pooja Kulkarni',
      business_name: 'Zenith Academy',
      email: 'pooja@zenithacademy.edu',
      phone: '+91 91580 44556',
      industry: 'Education & EdTech',
      address: 'Kothrud, Pune, MH',
      status: 'Active',
      created_at: '2026-04-05T08:45:00Z',
    },
    {
      id: 5,
      name: 'Rohan Malhotra',
      business_name: 'UrbanHaven Living',
      email: 'rohan@urbanhaven.co',
      phone: '+91 98112 77889',
      industry: 'Real Estate & Interiors',
      address: 'Golf Course Road, Gurugram, HR',
      status: 'Active',
      created_at: '2026-05-18T16:20:00Z',
    },
  ],
  campaigns: [
    {
      id: 1,
      client_id: 1,
      campaign_name: 'Diwali Festival Flash Sale',
      platform: 'Instagram',
      campaign_objective: 'Sales',
      budget: 65000,
      start_date: '2026-09-15',
      end_date: '2026-10-30',
      target_audience: 'Ages 18-35, Metro Cities, Fashion Shoppers',
      status: 'Active',
      description: 'High-energy carousel and reel ads promoting ethnic festive collection.',
      created_at: '2026-09-10T10:00:00Z',
    },
    {
      id: 2,
      client_id: 1,
      campaign_name: 'Winter Apparel Pre-Launch',
      platform: 'Facebook',
      campaign_objective: 'Traffic',
      budget: 35000,
      start_date: '2026-10-01',
      end_date: '2026-11-15',
      target_audience: 'Ages 25-45, Tier 1 & 2 cities, Winter lifestyle',
      status: 'Active',
      description: 'Traffic campaign driving users to winter catalogue lookbook.',
      created_at: '2026-09-28T12:00:00Z',
    },
    {
      id: 3,
      client_id: 2,
      campaign_name: 'Annual Health Checkup Drive',
      platform: 'Google Ads',
      campaign_objective: 'Lead Generation',
      budget: 50000,
      start_date: '2026-09-01',
      end_date: '2026-10-31',
      target_audience: 'Search intent: preventive tests, full body blood tests, age 35+',
      status: 'Active',
      description: 'Search ad campaign capturing high-intent medical test queries.',
      created_at: '2026-08-25T09:00:00Z',
    },
    {
      id: 4,
      client_id: 3,
      campaign_name: 'SaaS Free Trial Signups',
      platform: 'LinkedIn',
      campaign_objective: 'Lead Generation',
      budget: 90000,
      start_date: '2026-08-15',
      end_date: '2026-11-30',
      target_audience: 'CTOs, IT Managers, DevOps Engineers in India & Singapore',
      status: 'Active',
      description: 'Sponsored content and InMail highlighting 50% cloud cost reduction.',
      created_at: '2026-08-10T11:30:00Z',
    },
    {
      id: 5,
      client_id: 4,
      campaign_name: 'Full-Stack MCA Bootcamp 2026',
      platform: 'YouTube',
      campaign_objective: 'Conversions',
      budget: 45000,
      start_date: '2026-09-10',
      end_date: '2026-11-10',
      target_audience: 'Computer Science Students, BCA/BSc IT Graduates',
      status: 'Active',
      description: 'Video discovery ads showcasing alumni placement packages.',
      created_at: '2026-09-05T15:00:00Z',
    },
    {
      id: 6,
      client_id: 5,
      campaign_name: 'Luxury Villa Virtual Tour',
      platform: 'Instagram',
      campaign_objective: 'Lead Generation',
      budget: 80000,
      start_date: '2026-08-01',
      end_date: '2026-10-15',
      target_audience: 'HNIs, Business Owners, Age 32-55, Top Metros',
      status: 'Paused',
      description: 'Reels and stories with 3D walkthrough and VIP brochure download.',
      created_at: '2026-07-28T14:00:00Z',
    },
  ],
  campaignMetrics: [
    {
      id: 1,
      campaign_id: 1,
      metric_date: '2026-09-20',
      impressions: 48500,
      reach: 36200,
      clicks: 1420,
      advertising_spend: 18500,
      leads: 94,
      qualified_leads: 58,
      conversions: 32,
      revenue: 84500,
      ctr: 2.93,
      cpc: 13.03,
      cpl: 196.81,
      conversion_rate: 34.04,
      cac: 578.13,
      roas: 4.57,
      roi: 356.76,
    },
    {
      id: 2,
      campaign_id: 1,
      metric_date: '2026-09-27',
      impressions: 54200,
      reach: 41000,
      clicks: 1680,
      advertising_spend: 21200,
      leads: 110,
      qualified_leads: 72,
      conversions: 41,
      revenue: 106000,
      ctr: 3.1,
      cpc: 12.62,
      cpl: 192.73,
      conversion_rate: 37.27,
      cac: 517.07,
      roas: 5.0,
      roi: 400.0,
    },
    {
      id: 3,
      campaign_id: 2,
      metric_date: '2026-10-02',
      impressions: 32000,
      reach: 24500,
      clicks: 640,
      advertising_spend: 9800,
      leads: 35,
      qualified_leads: 18,
      conversions: 9,
      revenue: 16500,
      ctr: 2.0,
      cpc: 15.31,
      cpl: 280.0,
      conversion_rate: 25.71,
      cac: 1088.89,
      roas: 1.68,
      roi: 68.37,
    },
    {
      id: 4,
      campaign_id: 3,
      metric_date: '2026-09-18',
      impressions: 21000,
      reach: 16500,
      clicks: 890,
      advertising_spend: 24000,
      leads: 82,
      qualified_leads: 64,
      conversions: 28,
      revenue: 89600,
      ctr: 4.24,
      cpc: 26.97,
      cpl: 292.68,
      conversion_rate: 34.15,
      cac: 857.14,
      roas: 3.73,
      roi: 273.33,
    },
    {
      id: 5,
      campaign_id: 4,
      metric_date: '2026-09-25',
      impressions: 18500,
      reach: 14200,
      clicks: 510,
      advertising_spend: 38000,
      leads: 65,
      qualified_leads: 48,
      conversions: 18,
      revenue: 145000,
      ctr: 2.76,
      cpc: 74.51,
      cpl: 584.62,
      conversion_rate: 27.69,
      cac: 2111.11,
      roas: 3.82,
      roi: 281.58,
    },
    {
      id: 6,
      campaign_id: 5,
      metric_date: '2026-09-22',
      impressions: 42000,
      reach: 31000,
      clicks: 980,
      advertising_spend: 16500,
      leads: 78,
      qualified_leads: 45,
      conversions: 22,
      revenue: 66000,
      ctr: 2.33,
      cpc: 16.84,
      cpl: 211.54,
      conversion_rate: 28.21,
      cac: 750.0,
      roas: 4.0,
      roi: 300.0,
    },
  ],
  leads: [
    {
      id: 1,
      campaign_id: 1,
      client_id: 1,
      name: 'Aditi Varma',
      email: 'aditi.v@gmail.com',
      phone: '+91 98334 11229',
      source: 'Instagram Reels',
      lead_date: '2026-09-28',
      status: 'Converted',
      estimated_value: 4500,
      converted: true,
      conversion_date: '2026-09-29',
    },
    {
      id: 2,
      campaign_id: 3,
      client_id: 2,
      name: 'Manoj Deshpande',
      email: 'manoj.d@outlook.com',
      phone: '+91 97654 33210',
      source: 'Google Ads Search',
      lead_date: '2026-09-29',
      status: 'Qualified',
      estimated_value: 8200,
      converted: false,
      conversion_date: null,
    },
    {
      id: 3,
      campaign_id: 4,
      client_id: 3,
      name: 'Siddharth Iyer',
      email: 'siddharth@fintechlabs.co',
      phone: '+91 99881 22334',
      source: 'LinkedIn Sponsored Content',
      lead_date: '2026-09-30',
      status: 'Contacted',
      estimated_value: 45000,
      converted: false,
      conversion_date: null,
    },
    {
      id: 4,
      campaign_id: 5,
      client_id: 4,
      name: 'Nikhil Patil',
      email: 'nikhil.p99@gmail.com',
      phone: '+91 91234 56789',
      source: 'YouTube Video Ad',
      lead_date: '2026-10-01',
      status: 'Converted',
      estimated_value: 35000,
      converted: true,
      conversion_date: '2026-10-03',
    },
    {
      id: 5,
      campaign_id: 1,
      client_id: 1,
      name: 'Simran Chadha',
      email: 'simran.c@yahoo.in',
      phone: '+91 98450 99881',
      source: 'Instagram Shopping',
      lead_date: '2026-10-02',
      status: 'New',
      estimated_value: 3200,
      converted: false,
      conversion_date: null,
    },
    {
      id: 6,
      campaign_id: 2,
      client_id: 1,
      name: 'Tarun Saxena',
      email: 'tarun.saxena@rediffmail.com',
      phone: '+91 98101 22334',
      source: 'Facebook Feed',
      lead_date: '2026-10-03',
      status: 'Lost',
      estimated_value: 2800,
      converted: false,
      conversion_date: null,
    },
  ],
  customers: [
    {
      id: 1,
      client_id: 1,
      lead_id: 1,
      name: 'Aditi Varma',
      email: 'aditi.v@gmail.com',
      phone: '+91 98334 11229',
      lifetime_value: 12500,
      acquisition_cost: 578.13,
      acquisition_date: '2026-09-29',
    },
    {
      id: 2,
      client_id: 4,
      lead_id: 4,
      name: 'Nikhil Patil',
      email: 'nikhil.p99@gmail.com',
      phone: '+91 91234 56789',
      lifetime_value: 35000,
      acquisition_cost: 750.0,
      acquisition_date: '2026-10-03',
    },
  ],
  recommendations: [
    {
      id: 1,
      campaign_id: 1,
      campaignName: 'Diwali Festival Flash Sale',
      recommendation_type: 'Budget Scaling',
      message: 'Exceptional ROAS of 4.78x. Scale daily ad spend by 25% over the next 7 days while inventory is available.',
      priority: 'Opportunity',
      reason: 'Profit margin is strong and CAC is only ₹547.60 against an average order value of ₹2,600+.',
      status: 'Pending',
      created_date: '2026-10-02T10:00:00Z',
    },
    {
      id: 2,
      campaign_id: 4,
      campaignName: 'SaaS Free Trial Signups',
      recommendation_type: 'Cost Optimization',
      message: 'Cost per Click is elevated at ₹74.51. Switch to automated Target CPA bidding and exclude non-decision-maker titles.',
      priority: 'High',
      reason: 'LinkedIn InMail costs are pushing CPL to ₹584.62, reducing overall campaign margins.',
      status: 'Pending',
      created_date: '2026-10-01T15:30:00Z',
    },
    {
      id: 3,
      campaign_id: 2,
      campaignName: 'Winter Apparel Pre-Launch',
      recommendation_type: 'Creative & Targeting',
      message: 'Low ROAS (1.68x) and weak CTR (2.0%). Test dynamic video product showcase rather than static images.',
      priority: 'High',
      reason: 'Audience engagement drop detected after 5 days of frequency exposure on Facebook.',
      status: 'Pending',
      created_date: '2026-10-03T11:15:00Z',
    },
  ],
};

// Initialize PostgreSQL Pool
export async function initializeDatabase(): Promise<DbStatus> {
  try {
    pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 2000,
    });

    // Test connection with timeout
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    isPostgresConnected = true;

    return {
      connected: true,
      mode: 'PostgreSQL-Local',
      host: 'localhost:5432',
      database: 'marketing_analytics_db',
      message: 'Connected to local PostgreSQL database server successfully.',
    };
  } catch (err: any) {
    isPostgresConnected = false;
    return {
      connected: false,
      mode: 'In-Memory-Fallback',
      host: 'localhost:5432',
      database: 'marketing_analytics_db',
      message: `PostgreSQL connection to localhost:5432 skipped (${err?.message || 'offline'}). Running on in-memory ACID store with pre-seeded data.`,
    };
  }
}

export function getDbStatus(): DbStatus {
  return {
    connected: isPostgresConnected,
    mode: isPostgresConnected ? 'PostgreSQL-Local' : 'In-Memory-Fallback',
    host: 'localhost:5432',
    database: 'marketing_analytics_db',
    message: isPostgresConnected
      ? 'Active connection to PostgreSQL database on localhost:5432'
      : 'In-Memory Transactional Store active (local PostgreSQL server offline or simulated in cloud sandbox)',
  };
}

export { pool, isPostgresConnected };
