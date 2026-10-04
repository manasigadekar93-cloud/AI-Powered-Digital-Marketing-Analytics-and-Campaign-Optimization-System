/**
 * Client-Side API Connector for Node.js / Express REST Backend
 */

export const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('mca_admin_jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ success: boolean; token: string; user: any; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getProfile: () => request<{ success: boolean; user: any }>('/auth/profile'),

  // Clients
  getClients: (params?: { search?: string; status?: string; industry?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.status) q.append('status', params.status);
    if (params?.industry) q.append('industry', params.industry);
    return request<{ success: boolean; data: any[] }>(`/clients?${q.toString()}`);
  },
  getClientById: (id: number) => request<{ success: boolean; data: any }>(`/clients/${id}`),
  createClient: (client: any) =>
    request<{ success: boolean; data: any }>('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    }),
  updateClient: (id: number, client: any) =>
    request<{ success: boolean; data: any }>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(client),
    }),
  deleteClient: (id: number) =>
    request<{ success: boolean; message: string }>(`/clients/${id}`, {
      method: 'DELETE',
    }),

  // Campaigns
  getCampaigns: (params?: { client_id?: number; platform?: string; status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.client_id) q.append('client_id', String(params.client_id));
    if (params?.platform) q.append('platform', params.platform);
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    return request<{ success: boolean; data: any[] }>(`/campaigns?${q.toString()}`);
  },
  getCampaignById: (id: number) => request<{ success: boolean; data: any }>(`/campaigns/${id}`),
  createCampaign: (campaign: any) =>
    request<{ success: boolean; data: any }>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign),
    }),
  updateCampaign: (id: number, campaign: any) =>
    request<{ success: boolean; data: any }>(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(campaign),
    }),
  deleteCampaign: (id: number) =>
    request<{ success: boolean; message: string }>(`/campaigns/${id}`, {
      method: 'DELETE',
    }),

  // Metrics
  getMetrics: (params?: { campaign_id?: number; start_date?: string; end_date?: string }) => {
    const q = new URLSearchParams();
    if (params?.campaign_id) q.append('campaign_id', String(params.campaign_id));
    if (params?.start_date) q.append('start_date', params.start_date);
    if (params?.end_date) q.append('end_date', params.end_date);
    return request<{ success: boolean; data: any[] }>(`/metrics?${q.toString()}`);
  },
  addMetric: (metric: any) =>
    request<{ success: boolean; data: any }>('/metrics', {
      method: 'POST',
      body: JSON.stringify(metric),
    }),
  deleteMetric: (id: number) =>
    request<{ success: boolean; message: string }>(`/metrics/${id}`, {
      method: 'DELETE',
    }),

  // Leads
  getLeads: (params?: { campaign_id?: number; client_id?: number; status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.campaign_id) q.append('campaign_id', String(params.campaign_id));
    if (params?.client_id) q.append('client_id', String(params.client_id));
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    return request<{ success: boolean; data: any[] }>(`/leads?${q.toString()}`);
  },
  createLead: (lead: any) =>
    request<{ success: boolean; data: any }>('/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    }),
  updateLeadStatus: (id: number, status: string, estimated_value?: number) =>
    request<{ success: boolean; data: any }>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, estimated_value }),
    }),
  deleteLead: (id: number) =>
    request<{ success: boolean; message: string }>(`/leads/${id}`, {
      method: 'DELETE',
    }),

  // Analytics
  getOverview: () => request<{ success: boolean; data: any }>('/analytics/overview'),
  getFunnel: () => request<{ success: boolean; data: any[] }>('/analytics/funnel'),
  getComparison: (campaignIds?: number[]) => {
    const q = campaignIds ? `?campaign_ids=${campaignIds.join(',')}` : '';
    return request<{ success: boolean; data: any[]; benchmarks: any; allCampaigns: any[] }>(
      `/analytics/comparison${q}`
    );
  },

  // Recommendations & AI
  getRecommendations: (params?: { priority?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.priority) q.append('priority', params.priority);
    if (params?.status) q.append('status', params.status);
    return request<{ success: boolean; data: any[] }>(`/recommendations?${q.toString()}`);
  },
  generateRecommendations: () =>
    request<{ success: boolean; message: string; data: any[] }>('/recommendations/generate', {
      method: 'POST',
    }),
  updateRecommendationStatus: (id: number, status: string) =>
    request<{ success: boolean; data: any }>(`/recommendations/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  getAIInsights: () => request<{ success: boolean; data: any }>('/ai-insights'),
  optimizeBudget: (total_budget: number) =>
    request<{ success: boolean; data: any[]; summary: string; message: string }>('/ai-insights/budget-optimization', {
      method: 'POST',
      body: JSON.stringify({ total_budget }),
    }),

  // Reports
  generateReport: (params: { report_type: string; campaign_id?: number; client_id?: number }) => {
    const q = new URLSearchParams(params as any);
    return request<{ success: boolean; report: any }>(`/reports/generate?${q.toString()}`);
  },

  // Database
  getDatabaseStatus: () =>
    request<{ success: boolean; status: any; tableCounts: any; environment: any }>('/database/status'),
};
