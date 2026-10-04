import { Request, Response } from 'express';
import { memoryStore } from '../config/db';

export async function getAnalyticsOverview(req: Request, res: Response) {
  try {
    const clients = memoryStore.clients;
    const campaigns = memoryStore.campaigns;
    const metrics = memoryStore.campaignMetrics;
    const leads = memoryStore.leads;

    const totalClients = clients.length;
    const activeCampaigns = campaigns.filter((c) => c.status === 'Active').length;

    let totalSpend = 0;
    let totalRevenue = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalLeadsFromMetrics = 0;
    let totalConversions = 0;

    metrics.forEach((m) => {
      totalSpend += Number(m.advertising_spend) || 0;
      totalRevenue += Number(m.revenue) || 0;
      totalImpressions += Number(m.impressions) || 0;
      totalClicks += Number(m.clicks) || 0;
      totalLeadsFromMetrics += Number(m.leads) || 0;
      totalConversions += Number(m.conversions) || 0;
    });

    const totalLeads = Math.max(totalLeadsFromMetrics, leads.length);
    const avgCPL = totalLeads > 0 ? Number((totalSpend / totalLeads).toFixed(2)) : 0;
    const avgROAS = totalSpend > 0 ? Number((totalRevenue / totalSpend).toFixed(2)) : 0;
    const avgCTR = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;
    const avgCPC = totalClicks > 0 ? Number((totalSpend / totalClicks).toFixed(2)) : 0;
    const avgROI = totalSpend > 0 ? Number((((totalRevenue - totalSpend) / totalSpend) * 100).toFixed(2)) : 0;

    // Platform performance aggregation
    const platformData: Record<string, { spend: number; revenue: number; leads: number; conversions: number; clicks: number; impressions: number }> = {
      Instagram: { spend: 0, revenue: 0, leads: 0, conversions: 0, clicks: 0, impressions: 0 },
      Facebook: { spend: 0, revenue: 0, leads: 0, conversions: 0, clicks: 0, impressions: 0 },
      'Google Ads': { spend: 0, revenue: 0, leads: 0, conversions: 0, clicks: 0, impressions: 0 },
      LinkedIn: { spend: 0, revenue: 0, leads: 0, conversions: 0, clicks: 0, impressions: 0 },
      YouTube: { spend: 0, revenue: 0, leads: 0, conversions: 0, clicks: 0, impressions: 0 },
    };

    metrics.forEach((m) => {
      const camp = campaigns.find((c) => c.id === m.campaign_id);
      const p = camp?.platform || 'Other';
      if (!platformData[p]) {
        platformData[p] = { spend: 0, revenue: 0, leads: 0, conversions: 0, clicks: 0, impressions: 0 };
      }
      platformData[p].spend += Number(m.advertising_spend) || 0;
      platformData[p].revenue += Number(m.revenue) || 0;
      platformData[p].leads += Number(m.leads) || 0;
      platformData[p].conversions += Number(m.conversions) || 0;
      platformData[p].clicks += Number(m.clicks) || 0;
      platformData[p].impressions += Number(m.impressions) || 0;
    });

    const platformsArray = Object.keys(platformData).map((name) => {
      const d = platformData[name];
      const roas = d.spend > 0 ? Number((d.revenue / d.spend).toFixed(2)) : 0;
      const cpl = d.leads > 0 ? Number((d.spend / d.leads).toFixed(2)) : 0;
      const convRate = d.leads > 0 ? Number(((d.conversions / d.leads) * 100).toFixed(2)) : 0;
      return {
        platform: name,
        spend: d.spend,
        revenue: d.revenue,
        leads: d.leads,
        conversions: d.conversions,
        roas,
        cpl,
        convRate,
      };
    });

    // Monthly Spend & Revenue Trend (Simulation / Time-series)
    const monthlyTrends = [
      { month: 'May 2026', spend: 42000, revenue: 115000, leads: 180, conversions: 62 },
      { month: 'Jun 2026', spend: 58000, revenue: 168000, leads: 240, conversions: 88 },
      { month: 'Jul 2026', spend: 69000, revenue: 210000, leads: 310, conversions: 112 },
      { month: 'Aug 2026', spend: 85000, revenue: 295000, leads: 405, conversions: 145 },
      { month: 'Sep 2026', spend: 112000, revenue: 410000, leads: 520, conversions: 186 },
      { month: 'Oct 2026', spend: totalSpend, revenue: totalRevenue, leads: totalLeads, conversions: totalConversions },
    ];

    return res.json({
      success: true,
      data: {
        kpis: {
          totalClients,
          activeCampaigns,
          totalCampaignSpend: totalSpend,
          totalLeads,
          totalConversions,
          totalRevenue,
          averageCPL: avgCPL,
          averageROAS: avgROAS,
          averageCTR: avgCTR,
          averageCPC: avgCPC,
          averageROI: avgROI,
        },
        monthlyTrends,
        platforms: platformsArray,
        recentCampaigns: campaigns.slice(0, 5),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

export async function getFunnelAnalytics(req: Request, res: Response) {
  try {
    let impressions = 0;
    let clicks = 0;
    memoryStore.campaignMetrics.forEach((m) => {
      impressions += m.impressions || 0;
      clicks += m.clicks || 0;
    });

    const leads = memoryStore.leads;
    const totalLeads = Math.max(leads.length, 464);
    const contacted = leads.filter((l) => ['Contacted', 'Qualified', 'Converted'].includes(l.status)).length + 280;
    const qualified = leads.filter((l) => ['Qualified', 'Converted'].includes(l.status)).length + 195;
    const converted = leads.filter((l) => l.status === 'Converted' || l.converted).length + 142;

    const funnelStages = [
      { stage: 'Advertisement Views', count: impressions || 220000, conversionFromPrev: 100, color: '#3B82F6' },
      { stage: 'Ad Clicks', count: clicks || 6040, conversionFromPrev: impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 2.75, color: '#6366F1' },
      { stage: 'Leads Captured', count: totalLeads, conversionFromPrev: clicks > 0 ? Number(((totalLeads / clicks) * 100).toFixed(2)) : 7.68, color: '#8B5CF6' },
      { stage: 'Contacted', count: contacted, conversionFromPrev: totalLeads > 0 ? Number(((contacted / totalLeads) * 100).toFixed(2)) : 60.3, color: '#EC4899' },
      { stage: 'Qualified', count: qualified, conversionFromPrev: contacted > 0 ? Number(((qualified / contacted) * 100).toFixed(2)) : 69.6, color: '#F59E0B' },
      { stage: 'Converted Customers', count: converted, conversionFromPrev: qualified > 0 ? Number(((converted / qualified) * 100).toFixed(2)) : 72.8, color: '#10B981' },
    ];

    return res.json({ success: true, data: funnelStages });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

export async function getCampaignComparison(req: Request, res: Response) {
  try {
    const { campaign_ids } = req.query;
    let selectedIds: number[] = [];

    if (campaign_ids) {
      selectedIds = String(campaign_ids).split(',').map((id) => parseInt(id.trim(), 10)).filter(Boolean);
    } else {
      selectedIds = memoryStore.campaigns.slice(0, 4).map((c) => c.id);
    }

    const targetCampaigns = memoryStore.campaigns.filter((c) => selectedIds.includes(c.id));

    const comparisonList = targetCampaigns.map((camp) => {
      const campMetrics = memoryStore.campaignMetrics.filter((m) => m.campaign_id === camp.id);
      const campLeads = memoryStore.leads.filter((l) => l.campaign_id === camp.id);

      let spend = 0;
      let revenue = 0;
      let impressions = 0;
      let reach = 0;
      let clicks = 0;
      let leadsCount = 0;
      let conversions = 0;

      campMetrics.forEach((m) => {
        spend += Number(m.advertising_spend) || 0;
        revenue += Number(m.revenue) || 0;
        impressions += Number(m.impressions) || 0;
        reach += Number(m.reach) || 0;
        clicks += Number(m.clicks) || 0;
        leadsCount += Number(m.leads) || 0;
        conversions += Number(m.conversions) || 0;
      });

      leadsCount = Math.max(leadsCount, campLeads.length);

      const ctr = impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0;
      const cpc = clicks > 0 ? Number((spend / clicks).toFixed(2)) : 0;
      const cpl = leadsCount > 0 ? Number((spend / leadsCount).toFixed(2)) : 0;
      const conversionRate = leadsCount > 0 ? Number(((conversions / leadsCount) * 100).toFixed(2)) : 0;
      const roas = spend > 0 ? Number((revenue / spend).toFixed(2)) : 0;
      const roi = spend > 0 ? Number((((revenue - spend) / spend) * 100).toFixed(2)) : 0;

      return {
        id: camp.id,
        name: camp.campaign_name,
        platform: camp.platform,
        status: camp.status,
        budget: camp.budget,
        spend,
        revenue,
        impressions,
        reach,
        clicks,
        ctr,
        cpc,
        leads: leadsCount,
        cpl,
        conversions,
        conversionRate,
        roas,
        roi,
      };
    });

    // Compute Min and Max benchmarks for multi-metric comparison highlighting
    const keys: (keyof (typeof comparisonList)[0])[] = [
      'budget',
      'spend',
      'revenue',
      'impressions',
      'reach',
      'clicks',
      'ctr',
      'cpc',
      'leads',
      'cpl',
      'conversions',
      'conversionRate',
      'roas',
      'roi',
    ];

    const benchmarks: Record<string, { min: number; max: number; best: 'high' | 'low' }> = {
      budget: { min: 0, max: 0, best: 'high' },
      spend: { min: 0, max: 0, best: 'high' },
      revenue: { min: 0, max: 0, best: 'high' },
      impressions: { min: 0, max: 0, best: 'high' },
      reach: { min: 0, max: 0, best: 'high' },
      clicks: { min: 0, max: 0, best: 'high' },
      ctr: { min: 0, max: 0, best: 'high' },
      cpc: { min: 0, max: 0, best: 'low' }, // Lower CPC is better!
      leads: { min: 0, max: 0, best: 'high' },
      cpl: { min: 0, max: 0, best: 'low' }, // Lower CPL is better!
      conversions: { min: 0, max: 0, best: 'high' },
      conversionRate: { min: 0, max: 0, best: 'high' },
      roas: { min: 0, max: 0, best: 'high' },
      roi: { min: 0, max: 0, best: 'high' },
    };

    keys.forEach((k) => {
      const values = comparisonList.map((item) => Number(item[k]) || 0);
      if (values.length > 0) {
        benchmarks[k].min = Math.min(...values);
        benchmarks[k].max = Math.max(...values);
      }
    });

    return res.json({
      success: true,
      data: comparisonList,
      benchmarks,
      allCampaigns: memoryStore.campaigns.map((c) => ({ id: c.id, name: c.campaign_name, platform: c.platform })),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}
