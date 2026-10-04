import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../core/services/api.service';
import { Campaign, CampaignMetric } from '../core/models/types';

@Component({
  selector: 'app-marketing-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Marketing Data & KPI Management</h1>
          <p class="text-sm text-slate-500">Record daily performance metrics with real-time automated KPI computation</p>
        </div>
        <button (click)="showForm = !showForm" class="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs">
          {{ showForm ? 'Close Entry Form' : '+ Record New Metrics' }}
        </button>
      </div>

      <!-- Live Calculation Entry Form -->
      <div *ngIf="showForm" class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 class="text-base font-semibold text-slate-900 mb-4">Daily Marketing Metric Entry</h2>
        
        <form [formGroup]="metricForm" (ngSubmit)="submitMetric()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Select Campaign *</label>
              <select formControlName="campaign_id" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg">
                <option *ngFor="let c of campaigns" [value]="c.id">{{ c.campaign_name }} ({{ c.platform }})</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Date *</label>
              <input type="date" formControlName="metric_date" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
            </div>
          </div>

          <!-- Primary Raw Metrics Inputs -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Impressions</label>
              <input type="number" formControlName="impressions" (input)="recalculate()" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Reach</label>
              <input type="number" formControlName="reach" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Clicks</label>
              <input type="number" formControlName="clicks" (input)="recalculate()" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Ad Spend (₹)</label>
              <input type="number" formControlName="advertising_spend" (input)="recalculate()" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono" />
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Leads</label>
              <input type="number" formControlName="leads" (input)="recalculate()" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Qualified Leads</label>
              <input type="number" formControlName="qualified_leads" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Conversions</label>
              <input type="number" formControlName="conversions" (input)="recalculate()" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Attributed Revenue (₹)</label>
              <input type="number" formControlName="revenue" (input)="recalculate()" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono" />
            </div>
          </div>

          <!-- Real-Time Automated KPI Preview Strip -->
          <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div class="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Automatic KPI Engine (Safe Zero-Division Verification)
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
              <div class="bg-white p-2 rounded-lg border border-slate-200">
                <span class="block text-[10px] text-slate-500 uppercase">CTR</span>
                <span class="text-sm font-bold font-mono text-indigo-600">{{ liveKpi.ctr }}%</span>
              </div>
              <div class="bg-white p-2 rounded-lg border border-slate-200">
                <span class="block text-[10px] text-slate-500 uppercase">CPC</span>
                <span class="text-sm font-bold font-mono text-slate-800">₹{{ liveKpi.cpc }}</span>
              </div>
              <div class="bg-white p-2 rounded-lg border border-slate-200">
                <span class="block text-[10px] text-slate-500 uppercase">CPL</span>
                <span class="text-sm font-bold font-mono text-slate-800">₹{{ liveKpi.cpl }}</span>
              </div>
              <div class="bg-white p-2 rounded-lg border border-slate-200">
                <span class="block text-[10px] text-slate-500 uppercase">Conv. Rate</span>
                <span class="text-sm font-bold font-mono text-emerald-600">{{ liveKpi.conversionRate }}%</span>
              </div>
              <div class="bg-white p-2 rounded-lg border border-slate-200">
                <span class="block text-[10px] text-slate-500 uppercase">CAC</span>
                <span class="text-sm font-bold font-mono text-slate-800">₹{{ liveKpi.cac }}</span>
              </div>
              <div class="bg-white p-2 rounded-lg border border-slate-200">
                <span class="block text-[10px] text-slate-500 uppercase">ROAS</span>
                <span class="text-sm font-bold font-mono text-blue-600">{{ liveKpi.roas }}x</span>
              </div>
              <div class="bg-white p-2 rounded-lg border border-slate-200">
                <span class="block text-[10px] text-slate-500 uppercase">ROI</span>
                <span class="text-sm font-bold font-mono text-emerald-600">{{ liveKpi.roi }}%</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <button type="button" (click)="showForm = false" class="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" class="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Metric Record</button>
          </div>
        </form>
      </div>

      <!-- Historical Metrics Table -->
      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-slate-500 text-xs uppercase font-medium border-b border-slate-200">
            <tr>
              <th class="px-4 py-3">Date</th>
              <th class="px-4 py-3">Campaign</th>
              <th class="px-4 py-3 text-right">Spend</th>
              <th class="px-4 py-3 text-right">Clicks</th>
              <th class="px-4 py-3 text-right">CTR</th>
              <th class="px-4 py-3 text-right">Leads</th>
              <th class="px-4 py-3 text-right">CPL</th>
              <th class="px-4 py-3 text-right">Revenue</th>
              <th class="px-4 py-3 text-right">ROAS</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let m of metrics" class="hover:bg-slate-50/50">
              <td class="px-4 py-3 font-mono text-xs text-slate-600">{{ m.metric_date }}</td>
              <td class="px-4 py-3 font-medium text-slate-800">{{ m.campaign_name }}</td>
              <td class="px-4 py-3 text-right font-mono tabular-nums">₹{{ m.advertising_spend | number }}</td>
              <td class="px-4 py-3 text-right font-mono tabular-nums">{{ m.clicks }}</td>
              <td class="px-4 py-3 text-right font-mono tabular-nums text-indigo-600">{{ m.ctr }}%</td>
              <td class="px-4 py-3 text-right font-mono tabular-nums">{{ m.leads }}</td>
              <td class="px-4 py-3 text-right font-mono tabular-nums">₹{{ m.cpl }}</td>
              <td class="px-4 py-3 text-right font-mono tabular-nums text-emerald-600">₹{{ m.revenue | number }}</td>
              <td class="px-4 py-3 text-right font-mono tabular-nums font-semibold text-blue-600">{{ m.roas }}x</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class MarketingDataComponent implements OnInit {
  metrics: CampaignMetric[] = [];
  campaigns: Campaign[] = [];
  showForm = false;
  metricForm!: FormGroup;

  liveKpi = {
    ctr: 0,
    cpc: 0,
    cpl: 0,
    conversionRate: 0,
    cac: 0,
    roas: 0,
    roi: 0
  };

  constructor(private api: ApiService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.metricForm = this.fb.group({
      campaign_id: [1, Validators.required],
      metric_date: [new Date().toISOString().slice(0, 10), Validators.required],
      impressions: [10000],
      reach: [8000],
      clicks: [300],
      advertising_spend: [4500],
      leads: [25],
      qualified_leads: [15],
      conversions: [8],
      revenue: [18000]
    });
    this.recalculate();
  }

  loadData(): void {
    this.api.getMetrics().subscribe((res) => (this.metrics = res.data));
    this.api.getCampaigns().subscribe((res) => (this.campaigns = res.data));
  }

  recalculate(): void {
    const val = this.metricForm.value;
    const imp = Number(val.impressions) || 0;
    const clicks = Number(val.clicks) || 0;
    const spend = Number(val.advertising_spend) || 0;
    const leads = Number(val.leads) || 0;
    const conv = Number(val.conversions) || 0;
    const rev = Number(val.revenue) || 0;

    this.liveKpi = {
      ctr: imp > 0 ? Number(((clicks / imp) * 100).toFixed(2)) : 0,
      cpc: clicks > 0 ? Number((spend / clicks).toFixed(2)) : 0,
      cpl: leads > 0 ? Number((spend / leads).toFixed(2)) : 0,
      conversionRate: leads > 0 ? Number(((conv / leads) * 100).toFixed(2)) : 0,
      cac: conv > 0 ? Number((spend / conv).toFixed(2)) : 0,
      roas: spend > 0 ? Number((rev / spend).toFixed(2)) : 0,
      roi: spend > 0 ? Number((((rev - spend) / spend) * 100).toFixed(2)) : 0
    };
  }

  submitMetric(): void {
    if (this.metricForm.invalid) return;
    this.api.addMetric(this.metricForm.value).subscribe(() => {
      this.showForm = false;
      this.loadData();
    });
  }
}
