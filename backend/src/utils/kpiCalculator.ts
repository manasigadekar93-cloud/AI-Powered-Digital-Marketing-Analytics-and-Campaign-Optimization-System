/**
 * Automatic KPI Calculator for Digital Marketing Analytics
 * Handles division by zero safely and guarantees numerical consistency.
 */

export interface MetricInput {
  impressions: number;
  reach: number;
  clicks: number;
  advertisingSpend: number;
  leads: number;
  qualifiedLeads: number;
  conversions: number;
  revenue: number;
}

export interface CalculatedKPIs {
  ctr: number;           // Click-Through Rate (%)
  cpc: number;           // Cost Per Click (Currency)
  cpl: number;           // Cost Per Lead (Currency)
  conversionRate: number;// Conversion Rate (%)
  cac: number;           // Customer Acquisition Cost (Currency)
  roas: number;          // Return on Ad Spend (Ratio)
  roi: number;           // Return on Investment (%)
}

export function calculateKPIs(data: MetricInput): CalculatedKPIs {
  const impressions = Math.max(0, Number(data.impressions) || 0);
  const clicks = Math.max(0, Number(data.clicks) || 0);
  const spend = Math.max(0, Number(data.advertisingSpend) || 0);
  const leads = Math.max(0, Number(data.leads) || 0);
  const conversions = Math.max(0, Number(data.conversions) || 0);
  const revenue = Math.max(0, Number(data.revenue) || 0);

  // CTR = Clicks / Impressions * 100
  const ctr = impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0.0;

  // CPC = Spend / Clicks
  const cpc = clicks > 0 ? Number((spend / clicks).toFixed(2)) : 0.0;

  // CPL = Spend / Leads
  const cpl = leads > 0 ? Number((spend / leads).toFixed(2)) : 0.0;

  // Conversion Rate = Conversions / Leads * 100
  const conversionRate = leads > 0 ? Number(((conversions / leads) * 100).toFixed(2)) : 0.0;

  // CAC = Spend / Conversions
  const cac = conversions > 0 ? Number((spend / conversions).toFixed(2)) : 0.0;

  // ROAS = Revenue / Spend
  const roas = spend > 0 ? Number((revenue / spend).toFixed(2)) : 0.0;

  // ROI = ((Revenue - Spend) / Spend) * 100
  const roi = spend > 0 ? Number((((revenue - spend) / spend) * 100).toFixed(2)) : 0.0;

  return {
    ctr,
    cpc,
    cpl,
    conversionRate,
    cac,
    roas,
    roi,
  };
}
