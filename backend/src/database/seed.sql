-- ====================================================================
-- Sample Seed Data for Local PostgreSQL Database
-- ====================================================================

-- 1. Default Admin User (Password is 'admin123' hashed with bcrypt)
INSERT INTO users (name, email, password_hash, role)
VALUES 
('System Administrator', 'admin@marketing.com', '$2a$10$wE0vPjR37aO6B6jZ5v7zCOq5hI8PjS4Gk6ZgL9e8xUuW9z6o5/Y5i', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 2. Clients
INSERT INTO clients (name, business_name, email, phone, industry, address, status)
VALUES
('Rajesh Sharma', 'Aura Retail India', 'rajesh@auraretail.in', '+91 98201 54321', 'E-Commerce & Fashion', 'Lower Parel, Mumbai, MH', 'Active'),
('Dr. Ananya Sen', 'CarePlus Diagnostics', 'contact@careplus.org', '+91 94331 88765', 'Healthcare & Clinics', 'Salt Lake Sector V, Kolkata, WB', 'Active'),
('Vikram Mehta', 'CloudScale SaaS', 'vikram@cloudscale.io', '+91 80234 11223', 'B2B Software & Cloud', 'Indiranagar, Bengaluru, KA', 'Active'),
('Pooja Kulkarni', 'Zenith Academy', 'pooja@zenithacademy.edu', '+91 91580 44556', 'Education & EdTech', 'Kothrud, Pune, MH', 'Active'),
('Rohan Malhotra', 'UrbanHaven Living', 'rohan@urbanhaven.co', '+91 98112 77889', 'Real Estate & Interiors', 'Golf Course Road, Gurugram, HR', 'Active');

-- 3. Campaigns
INSERT INTO campaigns (client_id, campaign_name, platform, campaign_objective, budget, start_date, end_date, target_audience, status, description)
VALUES
(1, 'Diwali Festival Flash Sale', 'Instagram', 'Sales', 65000.00, '2026-09-15', '2026-10-30', 'Ages 18-35, Metro Cities, Fashion Shoppers', 'Active', 'High-energy carousel and reel ads promoting ethnic festive collection.'),
(1, 'Winter Apparel Pre-Launch', 'Facebook', 'Traffic', 35000.00, '2026-10-01', '2026-11-15', 'Ages 25-45, Tier 1 & 2 cities, Winter lifestyle', 'Active', 'Traffic campaign driving users to winter catalogue lookbook.'),
(2, 'Annual Health Checkup Drive', 'Google Ads', 'Lead Generation', 50000.00, '2026-09-01', '2026-10-31', 'Search intent: preventive tests, full body blood tests, age 35+', 'Active', 'Search ad campaign capturing high-intent medical test queries.'),
(3, 'SaaS Free Trial Signups', 'LinkedIn', 'Lead Generation', 90000.00, '2026-08-15', '2026-11-30', 'CTOs, IT Managers, DevOps Engineers in India & Singapore', 'Active', 'Sponsored content and InMail highlighting 50% cloud cost reduction.'),
(4, 'Full-Stack MCA Bootcamp 2026', 'YouTube', 'Conversions', 45000.00, '2026-09-10', '2026-11-10', 'Computer Science Students, BCA/BSc IT Graduates', 'Active', 'Video discovery ads showcasing alumni placement packages.'),
(5, 'Luxury Villa Virtual Tour', 'Instagram', 'Lead Generation', 80000.00, '2026-08-01', '2026-10-15', 'HNIs, Business Owners, Age 32-55, Top Metros', 'Paused', 'Reels and stories with 3D walkthrough and VIP brochure download.');
