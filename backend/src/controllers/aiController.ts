import { Request, Response } from 'express';
import { memoryStore } from '../config/db';
import { generateAIInsights } from '../services/aiService';

export async function getAIInsights(req: Request, res: Response) {
  try {
    const campaignsSummary = memoryStore.campaigns.map((camp) => {
      const campMetrics = memoryStore.campaignMetrics.filter((m) => m.campaign_id === camp.id);
      let spend = 0;
      let revenue = 0;
      let leads = 0;
      let conversions = 0;

      campMetrics.forEach((m) => {
        spend += Number(m.advertising_spend) || 0;
        revenue += Number(m.revenue) || 0;
        leads += Number(m.leads) || 0;
        conversions += Number(m.conversions) || 0;
      });

      return {
        id: camp.id,
        name: camp.campaign_name,
        platform: camp.platform,
        budget: camp.budget,
        spend,
        revenue,
        leads,
        conversions,
        roas: spend > 0 ? Number((revenue / spend).toFixed(2)) : 0,
      };
    });

    const totalBudget = memoryStore.campaigns.reduce((sum, c) => sum + (c.budget || 0), 0) || 120000;
    const insights = await generateAIInsights(campaignsSummary, totalBudget);

    return res.json({ success: true, data: insights });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

export async function optimizeBudget(req: Request, res: Response) {
  try {
    const { total_budget } = req.body;
    const budgetAmount = parseFloat(total_budget) || 150000;

    const campaignsSummary = memoryStore.campaigns.map((camp) => {
      const campMetrics = memoryStore.campaignMetrics.filter((m) => m.campaign_id === camp.id);
      let spend = 0;
      let revenue = 0;
      let leads = 0;
      let conversions = 0;

      campMetrics.forEach((m) => {
        spend += Number(m.advertising_spend) || 0;
        revenue += Number(m.revenue) || 0;
        leads += Number(m.leads) || 0;
        conversions += Number(m.conversions) || 0;
      });

      return {
        id: camp.id,
        name: camp.campaign_name,
        platform: camp.platform,
        budget: camp.budget,
        spend,
        revenue,
        leads,
        conversions,
      };
    });

    const insights = await generateAIInsights(campaignsSummary, budgetAmount);

    return res.json({
      success: true,
      message: `Budget allocation optimized for ₹${budgetAmount.toLocaleString()}`,
      data: insights.budgetRecommendations,
      summary: insights.executiveSummary,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}
