import React, { useState } from 'react';
import { GraduationCap, Code2, Server, BookOpen, Layers, CheckCircle2, ChevronRight, Copy } from 'lucide-react';

export const MCAVivaHubView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'viva-qa' | 'angular-code' | 'kpi-math'>('architecture');
  const [selectedAngularFile, setSelectedAngularFile] = useState('dashboard.component.ts');
  const [copiedCode, setCopiedCode] = useState(false);

  const angularFiles: Record<string, { desc: string; code: string }> = {
    'dashboard.component.ts': {
      desc: 'Angular Standalone Component for Executive Dashboard with 8 core KPIs & Chart.js data binding',
      code: `import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  kpis: any = null;
  platforms: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getOverviewAnalytics().subscribe({
      next: (res) => {
        this.kpis = res.data.kpis;
        this.platforms = res.data.platforms;
      }
    });
  }
}`
    },
    'marketing-data.component.ts': {
      desc: 'Angular Standalone Component with Reactive Forms & Automated Real-Time KPI Mathematical Formulas',
      code: `import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-marketing-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './marketing-data.component.html'
})
export class MarketingDataComponent implements OnInit {
  metricForm!: FormGroup;
  liveKpi = { ctr: 0, cpc: 0, cpl: 0, conversionRate: 0, cac: 0, roas: 0, roi: 0 };

  constructor(private api: ApiService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.metricForm = this.fb.group({
      campaign_id: [1, Validators.required],
      metric_date: [new Date().toISOString().slice(0, 10), Validators.required],
      impressions: [0],
      clicks: [0],
      advertising_spend: [0],
      leads: [0],
      conversions: [0],
      revenue: [0]
    });
  }

  // Safe zero-division KPI formula execution
  recalculate(): void {
    const val = this.metricForm.value;
    const imp = Number(val.impressions) || 0;
    const clicks = Number(val.clicks) || 0;
    const spend = Number(val.advertising_spend) || 0;
    const leads = Number(val.leads) || 0;
    const conv = Number(val.conversions) || 0;
    const rev = Number(val.revenue) || 0;

    this.liveKpi = {
      ctr: imp > 0 ? Number(((clicks / imp) * 100).toFixed(2)) : 0.0,
      cpc: clicks > 0 ? Number((spend / clicks).toFixed(2)) : 0.0,
      cpl: leads > 0 ? Number((spend / leads).toFixed(2)) : 0.0,
      conversionRate: leads > 0 ? Number(((conv / leads) * 100).toFixed(2)) : 0.0,
      cac: conv > 0 ? Number((spend / conv).toFixed(2)) : 0.0,
      roas: spend > 0 ? Number((rev / spend).toFixed(2)) : 0.0,
      roi: spend > 0 ? Number((((rev - spend) / spend) * 100).toFixed(2)) : 0.0
    };
  }
}`
    },
    'api.service.ts': {
      desc: 'Angular Core HTTP Client Service providing REST API consumption for all backend resources',
      code: `import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getClients(): Observable<any> {
    return this.http.get(\`\${this.baseUrl}/clients\`);
  }

  getCampaigns(): Observable<any> {
    return this.http.get(\`\${this.baseUrl}/campaigns\`);
  }

  addMetric(data: any): Observable<any> {
    return this.http.post(\`\${this.baseUrl}/metrics\`, data);
  }

  getOverviewAnalytics(): Observable<any> {
    return this.http.get(\`\${this.baseUrl}/analytics/overview\`);
  }
}`
    },
    'app.routes.ts': {
      desc: 'Angular Standalone Route Configuration with Lazy Loading',
      code: `import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'clients', loadComponent: () => import('./clients/clients.component').then(m => m.ClientsComponent) },
  { path: 'campaigns', loadComponent: () => import('./campaigns/campaigns.component').then(m => m.CampaignsComponent) },
  { path: 'marketing-data', loadComponent: () => import('./marketing-data/marketing-data.component').then(m => m.MarketingDataComponent) },
  { path: 'leads', loadComponent: () => import('./leads/leads.component').then(m => m.LeadsComponent) },
  { path: 'analytics', loadComponent: () => import('./analytics/analytics.component').then(m => m.AnalyticsComponent) },
  { path: 'campaign-comparison', loadComponent: () => import('./campaign-comparison/campaign-comparison.component').then(m => m.CampaignComparisonComponent) },
  { path: 'ai-insights', loadComponent: () => import('./ai-insights/ai-insights.component').then(m => m.AiInsightsComponent) },
  { path: 'recommendations', loadComponent: () => import('./recommendations/recommendations.component').then(m => m.RecommendationsComponent) },
  { path: 'reports', loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent) }
];`
    }
  };

  const copyAngularCode = () => {
    navigator.clipboard.writeText(angularFiles[selectedAngularFile]?.code || '');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const vivaQuestions = [
    {
      q: 'What is the three-tier architecture used in this system?',
      a: 'The system uses an Angular SPA (Presentation Tier) connecting via JSON REST API to a Node.js + Express backend (Application Tier), which interfaces with a PostgreSQL relational database (Data Tier) hosted at localhost:5432 using connection pooling.'
    },
    {
      q: 'How does the system prevent division by zero in KPI calculations?',
      a: 'Every metric calculation verifies that the denominator is strictly greater than zero (e.g. CTR checks impressions > 0, CPC checks clicks > 0, CPL checks leads > 0). If the denominator is zero, the engine safely returns 0.0 rather than NaN or Infinity.'
    },
    {
      q: 'How are passwords secured in the database?',
      a: 'Passwords are never stored in plain text. When an admin registers or logs in, bcrypt with a work factor of 10 salt rounds is used to hash the password. During login, bcrypt.compareSync verifies the hash safely against timing attacks.'
    },
    {
      q: 'How does the Rule-Based Recommendation Engine work?',
      a: 'The recommendation engine analyzes campaign KPIs against industry empirical thresholds: IF CTR < 1.2%, it recommends creative and copy refresh; IF CPC > ₹45, it suggests quality score and bidding optimization; IF CPL > ₹350, it flags landing page friction; IF ROAS >= 3.8x, it recommends a 20-30% budget scale.'
    },
    {
      q: 'What is the difference between ROAS and ROI?',
      a: 'ROAS (Return on Ad Spend) is the ratio of gross revenue to advertising spend (Revenue / Spend). ROI (Return on Investment) measures net profit percentage after subtracting the ad cost: ((Revenue - Spend) / Spend) * 100.'
    },
    {
      q: 'Why are Angular Standalone Components preferred over NgModules in modern Angular?',
      a: 'Standalone components simplify the architecture by removing the boilerplate of NgModule declarations. They directly import their dependencies (like CommonModule, ReactiveFormsModule, RouterModule) and enable clean tree-shaking and route-level lazy loading.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              MCA Project & Viva Examination Hub
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            System architectural diagrams, mathematical KPI formulas, viva preparation Q&A, and Angular standalone code
          </p>
        </div>
      </div>

      {/* Hub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'architecture'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Three-Tier Architecture
        </button>
        <button
          onClick={() => setActiveTab('kpi-math')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'kpi-math'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Automated KPI Formulas
        </button>
        <button
          onClick={() => setActiveTab('viva-qa')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'viva-qa'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Viva Defense Q&A
        </button>
        <button
          onClick={() => setActiveTab('angular-code')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'angular-code'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Angular Standalone Code Explorer
        </button>
      </div>

      {/* Tab 1: Architecture */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">System Block Architecture (3-Tier MCA Design)</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              {/* Tier 1 */}
              <div className="p-5 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider block">
                  Presentation Tier
                </span>
                <span className="text-sm font-bold text-slate-900 block">Angular 18+ Standalone</span>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Reactive Forms, Angular Router, standalone components, Chart.js visual data rendering, and JWT header interceptor.
                </p>
                <div className="text-[10px] font-mono text-indigo-700 bg-white p-1 rounded border border-indigo-100">
                  Runs on localhost:4200
                </div>
              </div>

              {/* Tier 2 */}
              <div className="p-5 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-purple-800 uppercase tracking-wider block">
                  Application Tier
                </span>
                <span className="text-sm font-bold text-slate-900 block">Node.js + Express REST API</span>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Modular controllers, services, JWT auth middleware, rule-based recommendation engine, and isolated AI module.
                </p>
                <div className="text-[10px] font-mono text-purple-700 bg-white p-1 rounded border border-purple-100">
                  Runs on localhost:5000 (port 3000)
                </div>
              </div>

              {/* Tier 3 */}
              <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  Data Tier
                </span>
                <span className="text-sm font-bold text-slate-900 block">PostgreSQL Relational DB</span>
                <p className="text-[11px] text-slate-600 leading-normal">
                  7 normalized tables (users, clients, campaigns, metrics, leads, customers, recommendations) with foreign-key constraints.
                </p>
                <div className="text-[10px] font-mono text-emerald-700 bg-white p-1 rounded border border-emerald-100">
                  Runs on localhost:5432
                </div>
              </div>
            </div>

            {/* REST API Endpoints Specification */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-800 block">Implemented REST API Endpoints:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px] font-mono">
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-emerald-700 font-bold">POST</span> /api/auth/login
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-blue-700 font-bold">GET</span> /api/clients
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-emerald-700 font-bold">POST</span> /api/clients
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-blue-700 font-bold">GET</span> /api/campaigns
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-emerald-700 font-bold">POST</span> /api/metrics
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-blue-700 font-bold">GET</span> /api/leads
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-blue-700 font-bold">GET</span> /api/analytics/overview
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-blue-700 font-bold">GET</span> /api/recommendations
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-blue-700 font-bold">GET</span> /api/ai-insights
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: KPI Mathematical Equations */}
      {activeTab === 'kpi-math' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Academic Marketing KPI Mathematical Formulas</h3>
          <p className="text-xs text-slate-500">
            All calculations are executed programmatically in backend utility `kpiCalculator.ts` with division-by-zero protection:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-indigo-700 font-bold block">1. Click-Through Rate (CTR)</span>
              <p className="text-slate-800 font-bold">CTR = (Clicks / Impressions) × 100</p>
              <span className="text-[10px] text-slate-500 font-sans block">Safe Guard: If impressions == 0, returns 0.00%</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-indigo-700 font-bold block">2. Cost Per Click (CPC)</span>
              <p className="text-slate-800 font-bold">CPC = Advertising Spend / Clicks</p>
              <span className="text-[10px] text-slate-500 font-sans block">Safe Guard: If clicks == 0, returns ₹0.00</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-indigo-700 font-bold block">3. Cost Per Lead (CPL)</span>
              <p className="text-slate-800 font-bold">CPL = Advertising Spend / Leads</p>
              <span className="text-[10px] text-slate-500 font-sans block">Safe Guard: If leads == 0, returns ₹0.00</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-indigo-700 font-bold block">4. Lead Conversion Rate</span>
              <p className="text-slate-800 font-bold">Conversion Rate = (Conversions / Leads) × 100</p>
              <span className="text-[10px] text-slate-500 font-sans block">Safe Guard: If leads == 0, returns 0.00%</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-indigo-700 font-bold block">5. Customer Acquisition Cost (CAC)</span>
              <p className="text-slate-800 font-bold">CAC = Advertising Spend / Conversions</p>
              <span className="text-[10px] text-slate-500 font-sans block">Safe Guard: If conversions == 0, returns ₹0.00</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-indigo-700 font-bold block">6. Return on Ad Spend (ROAS)</span>
              <p className="text-slate-800 font-bold">ROAS = Revenue / Advertising Spend</p>
              <span className="text-[10px] text-slate-500 font-sans block">Safe Guard: If spend == 0, returns 0.00x</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 md:col-span-2">
              <span className="text-indigo-700 font-bold block">7. Return on Investment (ROI)</span>
              <p className="text-slate-800 font-bold">ROI = ((Revenue - Advertising Spend) / Advertising Spend) × 100</p>
              <span className="text-[10px] text-slate-500 font-sans block">Safe Guard: If spend == 0, returns 0.00%</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Viva Q&A */}
      {activeTab === 'viva-qa' && (
        <div className="space-y-4">
          {vivaQuestions.map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
              <div className="flex items-start gap-2">
                <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  Q{idx + 1}
                </span>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.q}</h4>
              </div>
              <p className="text-xs text-slate-700 pl-8 leading-relaxed font-medium">{item.a}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Angular Standalone Code Explorer */}
      {activeTab === 'angular-code' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Angular Standalone Component Implementation Files
              </h3>
              <p className="text-xs text-slate-500">
                Generated source code located in `/frontend-angular/`
              </p>
            </div>

            <button
              onClick={copyAngularCode}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors self-start sm:self-auto"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Component Code'}</span>
            </button>
          </div>

          {/* File selector pills */}
          <div className="flex flex-wrap gap-2">
            {Object.keys(angularFiles).map((filename) => (
              <button
                key={filename}
                onClick={() => setSelectedAngularFile(filename)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                  selectedAngularFile === filename
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {filename}
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-600 italic">
            {angularFiles[selectedAngularFile]?.desc}
          </p>

          <pre className="p-4 bg-slate-900 text-slate-200 text-xs font-mono rounded-xl overflow-x-auto max-h-96 leading-relaxed select-all">
            {angularFiles[selectedAngularFile]?.code}
          </pre>
        </div>
      )}
    </div>
  );
};
