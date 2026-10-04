import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, Campaign, CampaignMetric, Lead, Recommendation } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  // Clients
  getClients(search?: string, status?: string): Observable<any> {
    const params: any = {};
    if (search) params.search = search;
    if (status) params.status = status;
    return this.http.get<{ success: boolean; data: Client[] }>(`${this.baseUrl}/clients`, { params });
  }

  createClient(client: Partial<Client>): Observable<any> {
    return this.http.post(`${this.baseUrl}/clients`, client);
  }

  updateClient(id: number, client: Partial<Client>): Observable<any> {
    return this.http.put(`${this.baseUrl}/clients/${id}`, client);
  }

  deleteClient(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/clients/${id}`);
  }

  // Campaigns
  getCampaigns(clientId?: number, platform?: string, status?: string): Observable<any> {
    const params: any = {};
    if (clientId) params.client_id = clientId;
    if (platform) params.platform = platform;
    if (status) params.status = status;
    return this.http.get<{ success: boolean; data: Campaign[] }>(`${this.baseUrl}/campaigns`, { params });
  }

  createCampaign(campaign: Partial<Campaign>): Observable<any> {
    return this.http.post(`${this.baseUrl}/campaigns`, campaign);
  }

  updateCampaign(id: number, campaign: Partial<Campaign>): Observable<any> {
    return this.http.put(`${this.baseUrl}/campaigns/${id}`, campaign);
  }

  deleteCampaign(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/campaigns/${id}`);
  }

  // Metrics
  getMetrics(campaignId?: number): Observable<any> {
    const params: any = campaignId ? { campaign_id: campaignId } : {};
    return this.http.get<{ success: boolean; data: CampaignMetric[] }>(`${this.baseUrl}/metrics`, { params });
  }

  addMetric(metric: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/metrics`, metric);
  }

  // Leads
  getLeads(campaignId?: number, status?: string): Observable<any> {
    const params: any = {};
    if (campaignId) params.campaign_id = campaignId;
    if (status) params.status = status;
    return this.http.get<{ success: boolean; data: Lead[] }>(`${this.baseUrl}/leads`, { params });
  }

  createLead(lead: Partial<Lead>): Observable<any> {
    return this.http.post(`${this.baseUrl}/leads`, lead);
  }

  updateLeadStatus(id: number, status: string, estimatedValue?: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/leads/${id}`, { status, estimated_value: estimatedValue });
  }

  // Analytics & Comparison
  getOverviewAnalytics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/overview`);
  }

  getFunnelAnalytics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/funnel`);
  }

  getCampaignComparison(campaignIds?: number[]): Observable<any> {
    const params = campaignIds ? { campaign_ids: campaignIds.join(',') } : {};
    return this.http.get(`${this.baseUrl}/analytics/comparison`, { params });
  }

  // Recommendations & AI
  getRecommendations(): Observable<any> {
    return this.http.get(`${this.baseUrl}/recommendations`);
  }

  generateRecommendations(): Observable<any> {
    return this.http.post(`${this.baseUrl}/recommendations/generate`, {});
  }

  getAIInsights(): Observable<any> {
    return this.http.get(`${this.baseUrl}/ai-insights`);
  }

  optimizeBudget(totalBudget: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/ai-insights/budget-optimization`, { total_budget: totalBudget });
  }

  generateReport(reportType: string, campaignId?: number): Observable<any> {
    const params: any = { report_type: reportType };
    if (campaignId) params.campaign_id = campaignId;
    return this.http.get(`${this.baseUrl}/reports/generate`, { params });
  }
}
