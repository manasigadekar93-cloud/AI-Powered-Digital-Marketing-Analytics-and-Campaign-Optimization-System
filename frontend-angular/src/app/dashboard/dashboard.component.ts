import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6 space-y-6 bg-slate-50 min-h-screen">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Executive Marketing Dashboard</h1>
          <p class="text-sm text-slate-500">Live omnichannel KPI monitoring & performance analytics</p>
        </div>
        <div class="flex items-center gap-3">
          <button (click)="refresh()" class="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
            Refresh Metrics
          </button>
          <a routerLink="/marketing-data" class="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
            + Log Daily Metrics
          </a>
        </div>
      </div>

      <!-- 8 Core Academic KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" *ngIf="kpis">
        <div class="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div class="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Clients</div>
          <div class="mt-2 text-3xl font-semibold text-slate-900 font-mono tabular-nums">{{ kpis.totalClients }}</div>
          <div class="mt-1 text-xs text-emerald-600">Active Retainers</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div class="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Campaigns</div>
          <div class="mt-2 text-3xl font-semibold text-indigo-600 font-mono tabular-nums">{{ kpis.activeCampaigns }}</div>
          <div class="mt-1 text-xs text-slate-400">Omnichannel Delivery</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div class="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Ad Spend</div>
          <div class="mt-2 text-3xl font-semibold text-slate-900 font-mono tabular-nums">₹{{ kpis.totalCampaignSpend | number }}</div>
          <div class="mt-1 text-xs text-slate-400">Budget Controlled</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div class="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Revenue</div>
          <div class="mt-2 text-3xl font-semibold text-emerald-600 font-mono tabular-nums">₹{{ kpis.totalRevenue | number }}</div>
          <div class="mt-1 text-xs text-emerald-600 font-mono">+{{ kpis.averageROI }}% Net ROI</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div class="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Leads</div>
          <div class="mt-2 text-3xl font-semibold text-slate-900 font-mono tabular-nums">{{ kpis.totalLeads }}</div>
          <div class="mt-1 text-xs text-indigo-600 font-mono">₹{{ kpis.averageCPL }} Avg CPL</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div class="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Conversions</div>
          <div class="mt-2 text-3xl font-semibold text-emerald-600 font-mono tabular-nums">{{ kpis.totalConversions }}</div>
          <div class="mt-1 text-xs text-slate-400">Paying Clients & Orders</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div class="text-xs font-medium text-slate-500 uppercase tracking-wider">Average CPL</div>
          <div class="mt-2 text-3xl font-semibold text-purple-600 font-mono tabular-nums">₹{{ kpis.averageCPL }}</div>
          <div class="mt-1 text-xs text-slate-400">Cost Per Lead</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div class="text-xs font-medium text-slate-500 uppercase tracking-wider">Average ROAS</div>
          <div class="mt-2 text-3xl font-semibold text-blue-600 font-mono tabular-nums">{{ kpis.averageROAS }}x</div>
          <div class="mt-1 text-xs text-emerald-600">High Profit Efficiency</div>
        </div>
      </div>

      <!-- Platform Efficiency Grid -->
      <div class="bg-white border border-slate-200 rounded-xl p-6">
        <h2 class="text-lg font-semibold text-slate-900">Platform Performance Breakdown</h2>
        <div class="mt-4 overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
              <tr>
                <th class="px-4 py-3">Platform</th>
                <th class="px-4 py-3 text-right">Spend</th>
                <th class="px-4 py-3 text-right">Revenue</th>
                <th class="px-4 py-3 text-right">Leads</th>
                <th class="px-4 py-3 text-right">Conv.</th>
                <th class="px-4 py-3 text-right">CPL</th>
                <th class="px-4 py-3 text-right">ROAS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let p of platforms" class="hover:bg-slate-50/50">
                <td class="px-4 py-3 font-medium text-slate-800">{{ p.platform }}</td>
                <td class="px-4 py-3 text-right font-mono tabular-nums">₹{{ p.spend | number }}</td>
                <td class="px-4 py-3 text-right font-mono tabular-nums font-semibold text-emerald-600">₹{{ p.revenue | number }}</td>
                <td class="px-4 py-3 text-right font-mono tabular-nums">{{ p.leads }}</td>
                <td class="px-4 py-3 text-right font-mono tabular-nums">{{ p.conversions }}</td>
                <td class="px-4 py-3 text-right font-mono tabular-nums">₹{{ p.cpl }}</td>
                <td class="px-4 py-3 text-right font-mono tabular-nums font-semibold text-indigo-600">{{ p.roas }}x</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  kpis: any = null;
  platforms: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.api.getOverviewAnalytics().subscribe({
      next: (res) => {
        this.kpis = res.data.kpis;
        this.platforms = res.data.platforms;
      },
      error: (err) => console.error(err)
    });
  }
}
