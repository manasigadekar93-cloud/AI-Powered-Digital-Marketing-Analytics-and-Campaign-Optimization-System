/**
 * Rule-Based Recommendation Engine
 * Analyzes campaign KPIs and outputs prioritized operational actions.
 */

export interface CampaignAnalysisContext {
  campaignId: number;
  campaignName: string;
  platform: string;
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpl: number;
  conversionRate: number;
  cac: number;
  roas: number;
  roi: number;
}

export interface RecommendationOutput {
  id?: number;
  campaignId: number;
  campaignName: string;
  recommendationType: 'Creative & Targeting' | 'Cost Optimization' | 'Lead Qualification' | 'Budget Scaling' | 'Ad Quality';
  message: string;
  priority: 'High' | 'Medium' | 'Low' | 'Opportunity';
  reason: string;
  status: 'Pending' | 'Applied' | 'Dismissed';
  createdDate: string;
}

export function evaluateCampaignRules(campaign: CampaignAnalysisContext): RecommendationOutput[] {
  const recommendations: RecommendationOutput[] = [];
  const now = new Date().toISOString();

  // Rule 1: CTR is Low (< 1.2%)
  if (campaign.impressions > 500 && campaign.ctr < 1.2) {
    recommendations.push({
      campaignId: campaign.campaignId,
      campaignName: campaign.campaignName,
      recommendationType: 'Creative & Targeting',
      message: 'Review advertisement creative and headline copy. Refresh visual assets or refine demographic targeting.',
      priority: 'Medium',
      reason: `CTR of ${campaign.ctr}% is below industry benchmark (1.5%). Audience fatigue or weak visual hooks detected on ${campaign.platform}.`,
      status: 'Pending',
      createdDate: now,
    });
  }

  // Rule 2: CPC is High (> ₹45 / $0.60)
  if (campaign.clicks > 20 && campaign.cpc > 45) {
    recommendations.push({
      campaignId: campaign.campaignId,
      campaignName: campaign.campaignName,
      recommendationType: 'Cost Optimization',
      message: 'Improve keyword quality score or switch bidding strategy from manual CPC to Target CPA / Maximize Clicks.',
      priority: 'High',
      reason: `CPC of ₹${campaign.cpc} is elevated. Negative keyword exclusion and audience exclusions are advised to cut cost-per-click.`,
      status: 'Pending',
      createdDate: now,
    });
  }

  // Rule 3: CPL is High (> ₹350)
  if (campaign.leads > 5 && campaign.cpl > 350) {
    recommendations.push({
      campaignId: campaign.campaignId,
      campaignName: campaign.campaignName,
      recommendationType: 'Cost Optimization',
      message: 'Optimize lead capture forms by reducing fields and testing instant native lead generation forms.',
      priority: 'High',
      reason: `Cost per Lead is ₹${campaign.cpl}, exceeding target threshold. Funnel friction on the landing page is reducing submission efficiency.`,
      status: 'Pending',
      createdDate: now,
    });
  }

  // Rule 4: Leads are high (> 20) but Conversions are low (Conversion Rate < 10%)
  if (campaign.leads >= 20 && campaign.conversionRate < 10) {
    recommendations.push({
      campaignId: campaign.campaignId,
      campaignName: campaign.campaignName,
      recommendationType: 'Lead Qualification',
      message: 'Audit lead qualification criteria and tighten SDR / Sales follow-up turnaround speed.',
      priority: 'High',
      reason: `Generated ${campaign.leads} leads, but conversion rate is only ${campaign.conversionRate}%. Signals poor audience intent or slow sales outreach.`,
      status: 'Pending',
      createdDate: now,
    });
  }

  // Rule 5: High ROAS (>= 3.8x) -> Scale Budget Opportunity
  if (campaign.spend > 5000 && campaign.roas >= 3.8) {
    recommendations.push({
      campaignId: campaign.campaignId,
      campaignName: campaign.campaignName,
      recommendationType: 'Budget Scaling',
      message: 'Consider a gradual 20% - 30% weekly budget increase to capture additional market share while maintaining profitability.',
      priority: 'Opportunity',
      reason: `Outstanding ROAS of ${campaign.roas}x and ROI of ${campaign.roi}%. The campaign unit economics are highly profitable and scalable.`,
      status: 'Pending',
      createdDate: now,
    });
  }

  // Rule 6: Low ROAS (< 1.6x)
  if (campaign.spend > 8000 && campaign.roas < 1.6) {
    recommendations.push({
      campaignId: campaign.campaignId,
      campaignName: campaign.campaignName,
      recommendationType: 'Cost Optimization',
      message: 'Review campaign targeting, pause non-performing ad sets, and audit conversion tracking accuracy.',
      priority: 'High',
      reason: `Current ROAS is ${campaign.roas}x (Revenue ₹${campaign.revenue.toLocaleString()} vs Spend ₹${campaign.spend.toLocaleString()}). Near-break-even return indicates capital reallocation is necessary.`,
      status: 'Pending',
      createdDate: now,
    });
  }

  return recommendations;
}
