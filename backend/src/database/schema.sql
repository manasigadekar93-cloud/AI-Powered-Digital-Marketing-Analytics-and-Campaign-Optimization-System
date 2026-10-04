-- ====================================================================
-- MCA Academic Project: AI-Powered Digital Marketing Analytics
-- Database Schema for PostgreSQL (Local / Enterprise)
-- ====================================================================

-- 1. Users Table (Authentication and Role-Based Access)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) DEFAULT 'admin' CHECK (role IN ('admin', 'analyst', 'manager')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clients Table (Businesses managed by agency)
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    business_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(25),
    industry VARCHAR(80) NOT NULL,
    address TEXT,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Onboarding')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    campaign_name VARCHAR(150) NOT NULL,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('Instagram', 'Facebook', 'Google Ads', 'YouTube', 'LinkedIn', 'Other')),
    campaign_objective VARCHAR(60) NOT NULL CHECK (campaign_objective IN ('Brand Awareness', 'Traffic', 'Lead Generation', 'Engagement', 'Sales', 'Conversions')),
    budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    target_audience TEXT,
    status VARCHAR(30) DEFAULT 'Active' CHECK (status IN ('Draft', 'Active', 'Paused', 'Completed')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Campaign Metrics Table (Daily / Snapshot Performance)
CREATE TABLE IF NOT EXISTS campaign_metrics (
    id SERIAL PRIMARY KEY,
    campaign_id INT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    impressions INT DEFAULT 0,
    reach INT DEFAULT 0,
    clicks INT DEFAULT 0,
    advertising_spend NUMERIC(12, 2) DEFAULT 0.00,
    leads INT DEFAULT 0,
    qualified_leads INT DEFAULT 0,
    conversions INT DEFAULT 0,
    revenue NUMERIC(12, 2) DEFAULT 0.00,
    -- Computed KPIs (Cached for fast historical analytics)
    ctr NUMERIC(6, 2) DEFAULT 0.00,
    cpc NUMERIC(10, 2) DEFAULT 0.00,
    cpl NUMERIC(10, 2) DEFAULT 0.00,
    conversion_rate NUMERIC(6, 2) DEFAULT 0.00,
    cac NUMERIC(10, 2) DEFAULT 0.00,
    roas NUMERIC(8, 2) DEFAULT 0.00,
    roi NUMERIC(8, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Leads Table (Lead tracking and Funnel stages)
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    campaign_id INT REFERENCES campaigns(id) ON DELETE SET NULL,
    client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    source VARCHAR(50) NOT NULL,
    lead_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(30) DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Converted', 'Lost')),
    estimated_value NUMERIC(12, 2) DEFAULT 0.00,
    converted BOOLEAN DEFAULT FALSE,
    conversion_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Customers Table (Converted Leads)
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    lead_id INT REFERENCES leads(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    lifetime_value NUMERIC(12, 2) DEFAULT 0.00,
    acquisition_cost NUMERIC(10, 2) DEFAULT 0.00,
    acquisition_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Recommendations Table (Rule-based & AI outputs)
CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    campaign_id INT REFERENCES campaigns(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(60) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low', 'Opportunity')),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Applied', 'Dismissed')),
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Indexes for High-Speed Query Performance
CREATE INDEX IF NOT EXISTS idx_campaigns_client_id ON campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_metrics_campaign_date ON campaign_metrics(campaign_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_leads_client_campaign ON leads(client_id, campaign_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_campaign ON recommendations(campaign_id);
