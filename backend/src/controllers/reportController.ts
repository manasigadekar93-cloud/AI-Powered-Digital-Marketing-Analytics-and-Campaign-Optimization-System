import { Request, Response } from 'express';
import { memoryStore } from '../config/db';

export async function generateReport(req: Request, res: Response) {
  try {
    const { report_type, client_id, campaign_id, time_period } = req.query;

    const reportType = String(report_type || 'campaign_performance');
    const period = String(time_period || 'last_30_days');

    let title = 'Executive Marketing Performance Report';
    let data: any = {};

    if (reportType === 'campaign_performance') {
      const campId = campaign_id ? parseInt(String(campaign_id), 10) : memoryStore.campaigns[0]?.id;
      const campaign = memoryStore.campaigns.find((c) => c.id === campId) || memoryStore.campaigns[0];
      const client = memoryStore.clients.find((cl) => cl.id === campaign?.client_id);
      const metrics = memoryStore.campaignMetrics.filter((m) => m.campaign_id === campId);
      const leads = memoryStore.leads.filter((l) => l.campaign_id === campId);
      const recs = memoryStore.recommendations.filter((r) => r.campaign_id === campId);

      let spend = 0;
      let revenue = 0;
      let clicks = 0;
      let impressions = 0;
      let conversions = 0;

      metrics.forEach((m) => {
        spend += Number(m.advertising_spend) || 0;
        revenue += Number(m.revenue) || 0;
        clicks += Number(m.clicks) || 0;
        impressions += Number(m.impressions) || 0;
        conversions += Number(m.conversions) || 0;
      });

      const totalLeads = Math.max(leads.length, metrics.reduce((acc, m) => acc + (m.leads || 0), 0));
      const ctr = impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0;
      const cpc = clicks > 0 ? Number((spend / clicks).toFixed(2)) : 0;
      const cpl = totalLeads > 0 ? Number((spend / totalLeads).toFixed(2)) : 0;
      const roas = spend > 0 ? Number((revenue / spend).toFixed(2)) : 0;
      const roi = spend > 0 ? Number((((revenue - spend) / spend) * 100).toFixed(2)) : 0;

      title = `Campaign Performance Report: ${campaign?.campaign_name || 'All Campaigns'}`;
      data = {
        campaign,
        client,
        kpis: {
          budget: campaign?.budget,
          spend,
          revenue,
          impressions,
          clicks,
          leads: totalLeads,
          conversions,
          ctr,
          cpc,
          cpl,
          roas,
          roi,
        },
        metricsHistory: metrics,
        recommendations: recs,
        summary: `Campaign "${campaign?.campaign_name}" running on ${campaign?.platform} achieved a ROAS of ${roas}x with an effective CPL of ₹${cpl}. Overall ad spend utilized is ₹${spend.toLocaleString()} out of an allocated ₹${campaign?.budget?.toLocaleString()} budget.`,
      };
    } else if (reportType === 'client_marketing') {
      const cId = client_id ? parseInt(String(client_id), 10) : memoryStore.clients[0]?.id;
      const client = memoryStore.clients.find((c) => c.id === cId) || memoryStore.clients[0];
      const clientCampaigns = memoryStore.campaigns.filter((c) => c.client_id === cId);
      const campIds = clientCampaigns.map((c) => c.id);
      const metrics = memoryStore.campaignMetrics.filter((m) => campIds.includes(m.campaign_id));
      const leads = memoryStore.leads.filter((l) => l.client_id === cId);

      let spend = 0;
      let revenue = 0;
      metrics.forEach((m) => {
        spend += Number(m.advertising_spend) || 0;
        revenue += Number(m.revenue) || 0;
      });

      title = `Client Marketing Summary: ${client?.business_name}`;
      data = {
        client,
        campaignsCount: clientCampaigns.length,
        totalSpend: spend,
        totalRevenue: revenue,
        totalLeads: leads.length,
        netProfit: revenue - spend,
        roas: spend > 0 ? Number((revenue / spend).toFixed(2)) : 0,
        campaigns: clientCampaigns,
        summary: `${client?.business_name} has ${clientCampaigns.length} campaigns active. Cumulative return on ad spend stands at ${(spend > 0 ? revenue / spend : 0).toFixed(2)}x generating ₹${revenue.toLocaleString()} in attributable client revenue.`,
      };
    } else if (reportType === 'platform_performance') {
      title = 'Cross-Platform Channel Efficiency Report';
      const platforms = ['Instagram', 'Facebook', 'Google Ads', 'LinkedIn', 'YouTube'];
      const stats = platforms.map((p) => {
        const campIds = memoryStore.campaigns.filter((c) => c.platform === p).map((c) => c.id);
        const metrics = memoryStore.campaignMetrics.filter((m) => campIds.includes(m.campaign_id));
        let spend = 0;
        let revenue = 0;
        let leads = 0;
        let conversions = 0;
        metrics.forEach((m) => {
          spend += m.advertising_spend || 0;
          revenue += m.revenue || 0;
          leads += m.leads || 0;
          conversions += m.conversions || 0;
        });
        return {
          platform: p,
          campaignsCount: campIds.length,
          spend,
          revenue,
          leads,
          conversions,
          roas: spend > 0 ? Number((revenue / spend).toFixed(2)) : 0,
          cpl: leads > 0 ? Number((spend / leads).toFixed(2)) : 0,
        };
      });

      data = {
        platforms: stats,
        summary: 'Google Ads and Instagram demonstrate the highest capital efficiency with lowest blended acquisition cost across omnichannel media operations.',
      };
    } else {
      title = 'Monthly Agency Marketing Audit';
      data = {
        auditMonth: 'October 2026',
        totalSpend: memoryStore.campaignMetrics.reduce((s, m) => s + (m.advertising_spend || 0), 0),
        totalRevenue: memoryStore.campaignMetrics.reduce((s, m) => s + (m.revenue || 0), 0),
        activeCampaigns: memoryStore.campaigns.filter((c) => c.status === 'Active').length,
        totalClients: memoryStore.clients.length,
        summary: 'All client portfolios are performing within planned KPI targets. Cost per lead decreased by 8.4% month-over-month due to algorithmic optimization.',
      };
    }

    return res.json({
      success: true,
      report: {
        id: `REP-${Date.now().toString().slice(-6)}`,
        type: reportType,
        title,
        period,
        generatedAt: new Date().toISOString(),
        generatedBy: 'System Administrator',
        data,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}
