import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/services/api.service';
import { Client, Campaign, CampaignMetric } from '../core/models/types';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">Multi-Dimensional Marketing Analytics</h2>
          <p class="text-xs text-slate-500">
            Slice and analyze campaign profitability, customer acquisition costs, channel yield, and unit economics
          </p>
        </div>
      </div>

      <!-- Filter Toolbar -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-3">
        <span class="text-xs font-semibold text-slate-700 mr-2">Analytics Slicer:</span>

        <select [(ngModel)]="selectedClient" (change)="filterData()" class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800">
          <option value="all">All Clients</option>
          <option *ngFor="let cl of clients" [value]="cl.id">{{ cl.business_name }}</option>
        </select>

        <select [(ngModel)]="selectedCampaign" (change)="filterData()" class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800">
          <option value="all">All Campaigns</option>
          <option *ngFor="let c of campaigns" [value]="c.id">{{ c.campaign_name }}</option>
        </select>

        <select [(ngModel)]="selectedPlatform" (change)="filterData()" class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800">
          <option value="all">All Platforms</option>
          <option *ngFor="let p of platforms" [value]="p">{{ p }}</option>
        </select>

        <button (click)="resetFilters()" class="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 ml-auto">
          Reset Filters
        </button>
      </div>

      <!-- Unit Economics Strip -->
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span class="text-[10px] uppercase font-semibold text-slate-400 block">Total Spend</span>
          <span class="text-lg font-bold font-mono text-slate-900 mt-1 block tabular-nums">₹{{ totalSpend | number }}</span>
          <span class="text-[10px] text-slate-500 font-mono">Filtered Slice</span>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span class="text-[10px] uppercase font-semibold text-slate-400 block">Total Revenue</span>
          <span class="text-lg font-bold font-mono text-emerald-600 mt-1 block tabular-nums">₹{{ totalRevenue | number }}</span>
          <span class="text-[10px] text-emerald-700 font-medium font-mono">ROAS: {{ roas }}x</span>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span class="text-[10px] uppercase font-semibold text-slate-400 block">CTR</span>
          <span class="text-lg font-bold font-mono text-indigo-600 mt-1 block tabular-nums">{{ ctr }}%</span>
          <span class="text-[10px] text-slate-500 font-mono">{{ totalClicks }} Clicks</span>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span class="text-[10px] uppercase font-semibold text-slate-400 block">CPC</span>
          <span class="text-lg font-bold font-mono text-slate-900 mt-1 block tabular-nums">₹{{ cpc }}</span>
          <span class="text-[10px] text-slate-500 font-mono">Cost Per Click</span>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span class="text-[10px] uppercase font-semibold text-slate-400 block">CPL</span>
          <span class="text-lg font-bold font-mono text-purple-700 mt-1 block tabular-nums">₹{{ cpl }}</span>
          <span class="text-[10px] text-slate-500 font-mono">{{ totalLeads }} Leads</span>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span class="text-[10px] uppercase font-semibold text-slate-400 block">CAC</span>
          <span class="text-lg font-bold font-mono text-slate-900 mt-1 block tabular-nums">₹{{ cac }}</span>
          <span class="text-[10px] text-slate-500 font-mono">{{ totalConversions }} Orders</span>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span class="text-[10px] uppercase font-semibold text-slate-400 block">Net ROI</span>
          <span class="text-lg font-bold font-mono text-emerald-600 mt-1 block tabular-nums">+{{ roi }}%</span>
          <span class="text-[10px] text-emerald-700 font-mono font-medium">Margin</span>
        </div>
      </div>

      <!-- Sliced Table -->
      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th class="px-5 py-3">Date</th>
              <th class="px-5 py-3">Campaign</th>
              <th class="px-5 py-3 text-right">Spend</th>
              <th class="px-5 py-3 text-right">Clicks</th>
              <th class="px-5 py-3 text-right">CTR</th>
              <th class="px-5 py-3 text-right">Leads</th>
              <th class="px-5 py-3 text-right">CPL</th>
              <th class="px-5 py-3 text-right">Revenue</th>
              <th class="px-5 py-3 text-right">ROAS</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let m of filteredMetrics" class="hover:bg-slate-50/60 transition-colors">
              <td class="px-5 py-3.5 font-mono text-slate-600">{{ m.metric_date }}</td>
              <td class="px-5 py-3.5 font-medium text-slate-900">{{ m.campaign_name }}</td>
              <td class="px-5 py-3.5 text-right font-mono tabular-nums">₹{{ m.advertising_spend | number }}</td>
              <td class="px-5 py-3.5 text-right font-mono tabular-nums">{{ m.clicks }}</td>
              <td class="px-5 py-3.5 text-right font-mono tabular-nums text-indigo-600 font-semibold">{{ m.ctr }}%</td>
              <td class="px-5 py-3.5 text-right font-mono tabular-nums">{{ m.leads }}</td>
              <td class="px-5 py-3.5 text-right font-mono tabular-nums">₹{{ m.cpl }}</td>
              <td class="px-5 py-3.5 text-right font-mono tabular-nums font-semibold text-emerald-600">₹{{ m.revenue | number }}</td>
              <td class="px-5 py-3.5 text-right font-mono tabular-nums font-bold text-blue-600">{{ m.roas }}x</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AnalyticsComponent implements OnInit {
  private api = inject(ApiService);

  clients: Client[] = [];
  campaigns: Campaign[] = [];
  allMetrics: CampaignMetric[] = [];
  filteredMetrics: CampaignMetric[] = [];

  platforms = ['Instagram', 'Facebook', 'Google Ads', 'YouTube', 'LinkedIn'];
  selectedClient = 'all';
  selectedCampaign = 'all';
  selectedPlatform = 'all';

  totalSpend = 0;
  totalRevenue = 0;
  totalClicks = 0;
  totalLeads = 0;
  totalConversions = 0;
  ctr = 0;
  cpc = 0;
  cpl = 0;
  cac = 0;
  roas = 0;
  roi = 0;

  ngOnInit(): void {
    this.api.getClients().subscribe((res: any) => (this.clients = res.data));
    this.api.getCampaigns().subscribe((res: any) => (this.campaigns = res.data));
    this.api.getMetrics().subscribe((res: any) => {
      this.allMetrics = res.data;
      this.filterData();
    });
  }

  resetFilters(): void {
    this.selectedClient = 'all';
    this.selectedCampaign = 'all';
    this.selectedPlatform = 'all';
    this.filterData();
  }

  filterData(): void {
    let list = [...this.allMetrics];

    if (this.selectedCampaign !== 'all') {
      list = list.filter((m) => m.campaign_id === parseInt(this.selectedCampaign, 10));
    }
    if (this.selectedPlatform !== 'all') {
      list = list.filter((m) => m.platform === this.selectedPlatform);
    }
    if (this.selectedClient !== 'all') {
      const campIds = this.campaigns
        .filter((c) => c.client_id === parseInt(this.selectedClient, 10))
        .map((c) => c.id);
      list = list.filter((m) => campIds.includes(m.campaign_id));
    }

    this.filteredMetrics = list;

    // Recalculate sums
    this.totalSpend = list.reduce((acc, m) => acc + (Number(m.advertising_spend) || 0), 0);
    this.totalRevenue = list.reduce((acc, m) => acc + (Number(m.revenue) || 0), 0);
    this.totalClicks = list.reduce((acc, m) => acc + (Number(m.clicks) || 0), 0);
    this.totalLeads = list.reduce((acc, m) => acc + (Number(m.leads) || 0), 0);
    this.totalConversions = list.reduce((acc, m) => acc + (Number(m.conversions) || 0), 0);

    const impressions = list.reduce((acc, m) => acc + (Number(m.impressions) || 0), 0);
    this.ctr = impressions > 0 ? Number(((this.totalClicks / impressions) * 100).toFixed(2)) : 0;
    this.cpc = this.totalClicks > 0 ? Number((this.totalSpend / this.totalClicks).toFixed(2)) : 0;
    this.cpl = this.totalLeads > 0 ? Number((this.totalSpend / this.totalLeads).toFixed(2)) : 0;
    this.cac = this.totalConversions > 0 ? Number((this.totalSpend / this.totalConversions).toFixed(2)) : 0;
    this.roas = this.totalSpend > 0 ? Number((this.totalRevenue / this.totalSpend).toFixed(2)) : 0;
    this.roi = this.totalSpend > 0 ? Number((((this.totalRevenue - this.totalSpend) / this.totalSpend) * 100).toFixed(2)) : 0;
  }
}
