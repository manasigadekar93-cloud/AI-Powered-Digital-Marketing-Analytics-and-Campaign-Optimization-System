import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'clients',
    loadComponent: () => import('./clients/clients.component').then(m => m.ClientsComponent)
  },
  {
    path: 'campaigns',
    loadComponent: () => import('./campaigns/campaigns.component').then(m => m.CampaignsComponent)
  },
  {
    path: 'marketing-data',
    loadComponent: () => import('./marketing-data/marketing-data.component').then(m => m.MarketingDataComponent)
  },
  {
    path: 'leads',
    loadComponent: () => import('./leads/leads.component').then(m => m.LeadsComponent)
  },
  {
    path: 'analytics',
    loadComponent: () => import('./analytics/analytics.component').then(m => m.AnalyticsComponent)
  },
  {
    path: 'campaign-comparison',
    loadComponent: () => import('./campaign-comparison/campaign-comparison.component').then(m => m.CampaignComparisonComponent)
  },
  {
    path: 'ai-insights',
    loadComponent: () => import('./ai-insights/ai-insights.component').then(m => m.AiInsightsComponent)
  },
  {
    path: 'recommendations',
    loadComponent: () => import('./recommendations/recommendations.component').then(m => m.RecommendationsComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
