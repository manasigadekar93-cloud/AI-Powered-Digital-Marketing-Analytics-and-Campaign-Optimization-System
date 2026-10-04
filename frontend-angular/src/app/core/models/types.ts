export interface Client {
  id: number;
  name: string;
  business_name: string;
  email: string;
  phone: string;
  industry: string;
  address: string;
  status: 'Active' | 'Inactive' | 'Onboarding';
  created_at: string;
}

export interface Campaign {
  id: number;
  client_id: number;
  client_name?: string;
  business_name?: string;
  campaign_name: string;
  platform: 'Instagram' | 'Facebook' | 'Google Ads' | 'YouTube' | 'LinkedIn' | 'Other';
  campaign_objective: 'Brand Awareness' | 'Traffic' | 'Lead Generation' | 'Engagement' | 'Sales' | 'Conversions';
  budget: number;
  start_date: string;
  end_date: string;
  target_audience: string;
  status: 'Draft' | 'Active' | 'Paused' | 'Completed';
  description: string;
  created_at: string;
}

export interface CampaignMetric {
  id: number;
  campaign_id: number;
  campaign_name?: string;
  platform?: string;
  metric_date: string;
  impressions: number;
  reach: number;
  clicks: number;
  advertising_spend: number;
  leads: number;
  qualified_leads: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpl: number;
  conversion_rate: number;
  cac: number;
  roas: number;
  roi: number;
}

export interface Lead {
  id: number;
  campaign_id: number | null;
  campaign_name?: string;
  client_id: number;
  client_name?: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  lead_date: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';
  estimated_value: number;
  converted: boolean;
  conversion_date?: string | null;
}

export interface Recommendation {
  id: number;
  campaign_id: number;
  campaignName: string;
  recommendation_type: string;
  message: string;
  priority: 'High' | 'Medium' | 'Low' | 'Opportunity';
  reason: string;
  status: 'Pending' | 'Applied' | 'Dismissed';
  created_date: string;
}
