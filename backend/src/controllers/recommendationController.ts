import { Request, Response } from 'express';
import { memoryStore } from '../config/db';
import { evaluateCampaignRules, CampaignAnalysisContext } from '../services/recommendationEngine';

export async function getRecommendations(req: Request, res: Response) {
  try {
    const { campaign_id, priority, status } = req.query;
    let recs = [...memoryStore.recommendations];

    if (campaign_id) {
      recs = recs.filter((r) => r.campaign_id === parseInt(String(campaign_id), 10));
    }
    if (priority && priority !== 'all') {
      recs = recs.filter((r) => r.priority === priority);
    }
    if (status && status !== 'all') {
      recs = recs.filter((r) => r.status === status);
    }

    return res.json({ success: true, count: recs.length, data: recs });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

export async function generateRecommendations(req: Request, res: Response) {
  try {
    const newGenerated: any[] = [];

    memoryStore.campaigns.forEach((camp) => {
      const campMetrics = memoryStore.campaignMetrics.filter((m) => m.campaign_id === camp.id);
      const campLeads = memoryStore.leads.filter((l) => l.campaign_id === camp.id);

      let spend = 0;
      let revenue = 0;
      let impressions = 0;
      let clicks = 0;
      let leadsCount = 0;
      let conversions = 0;

      campMetrics.forEach((m) => {
        spend += Number(m.advertising_spend) || 0;
        revenue += Number(m.revenue) || 0;
        impressions += Number(m.impressions) || 0;
        clicks += Number(m.clicks) || 0;
        leadsCount += Number(m.leads) || 0;
        conversions += Number(m.conversions) || 0;
      });

      leadsCount = Math.max(leadsCount, campLeads.length);

      const ctr = impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0;
      const cpc = clicks > 0 ? Number((spend / clicks).toFixed(2)) : 0;
      const cpl = leadsCount > 0 ? Number((spend / leadsCount).toFixed(2)) : 0;
      const conversionRate = leadsCount > 0 ? Number(((conversions / leadsCount) * 100).toFixed(2)) : 0;
      const cac = conversions > 0 ? Number((spend / conversions).toFixed(2)) : 0;
      const roas = spend > 0 ? Number((revenue / spend).toFixed(2)) : 0;
      const roi = spend > 0 ? Number((((revenue - spend) / spend) * 100).toFixed(2)) : 0;

      const context: CampaignAnalysisContext = {
        campaignId: camp.id,
        campaignName: camp.campaign_name,
        platform: camp.platform,
        budget: camp.budget,
        spend,
        impressions,
        clicks,
        leads: leadsCount,
        conversions,
        revenue,
        ctr,
        cpc,
        cpl,
        conversionRate,
        cac,
        roas,
        roi,
      };

      const results = evaluateCampaignRules(context);
      results.forEach((rec) => {
        // Prevent duplicate recommendation messages for same campaign
        const exists = memoryStore.recommendations.some(
          (existing) => existing.campaign_id === rec.campaignId && existing.message === rec.message
        );
        if (!exists) {
          const recEntry = {
            id: memoryStore.recommendations.length + 1,
            campaign_id: rec.campaignId,
            campaignName: rec.campaignName,
            recommendation_type: rec.recommendationType,
            message: rec.message,
            priority: rec.priority,
            reason: rec.reason,
            status: rec.status,
            created_date: rec.createdDate,
          };
          memoryStore.recommendations.unshift(recEntry);
          newGenerated.push(recEntry);
        }
      });
    });

    return res.json({
      success: true,
      message: `Rule-based engine completed. ${newGenerated.length} new recommendations generated.`,
      data: memoryStore.recommendations,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

export async function updateRecommendationStatus(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    const rec = memoryStore.recommendations.find((r) => r.id === id);
    if (!rec) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }

    rec.status = status;
    return res.json({ success: true, message: 'Status updated', data: rec });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}
