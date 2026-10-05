import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-campaign-comparison',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">Cross-Campaign Comparative Matrix</h2>
          <p class="text-xs text-slate-500">
            Multi-attribute evaluation matrix with automated identification of strongest and weakest operational metrics
          </p>
        </div>
        <div class="flex items-center gap-3 text-xs">
          <span class="flex items-center gap-1 text-emerald-700 font-medium">
            <span class="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Strongest Performer
          </span>
          <span class="flex items-center gap-1 text-rose-700 font-medium">
            <span class="w-2.5 h-2.5 rounded-sm bg-rose-500"></span> Weakest Friction Point
          </span>
        </div>
      </div>

      <!-- Selector Pills -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
        <span class="text-xs font-semibold text-slate-700 block">Select Campaigns to Compare:</span>
        <div class="flex flex-wrap gap-2">
          <button
            *ngFor="let camp of allCampaigns"
            (click)="toggleCampaign(camp.id)"
            class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5"
            [ngClass]="isSelected(camp.id) ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'"
          >
            <span>{{ camp.name }}</span>
            <span class="text-[10px] opacity-75 font-mono">({{ camp.platform }})</span>
          </button>
        </div>
      </div>

      <!-- Matrix Table -->
      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="px-5 py-3.5 font-bold text-slate-900 w-60">Metric Attribute</th>
                <th *ngFor="let c of comparisonList" class="px-5 py-3.5 text-right font-bold text-slate-900 min-w-[160px]">
                  <div>{{ c.name }}</div>
                  <div class="text-[11px] font-normal text-slate-500 font-mono">{{ c.platform }} · {{ c.status }}</div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let item of metricKeys" class="hover:bg-slate-50/50">
                <td class="px-5 py-3 font-medium text-slate-700">
                  <div class="flex items-center gap-1.5">
                    <span>{{ item.label }}</span>
                    <span *ngIf="item.isLowerBetter" class="text-[10px] text-slate-400 font-normal">(lower is better)</span>
                  </div>
                </td>
                <td
                  *ngFor="let c of comparisonList"
                  class="px-5 py-3 text-right font-mono tabular-nums"
                  [ngClass]="getHighlightClass(item.key, c[item.key])"
                >
                  {{ formatValue(item, c[item.key]) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class CampaignComparisonComponent implements OnInit {
  private api = inject(ApiService);

  comparisonList: any[] = [];
  benchmarks: any = {};
  allCampaigns: any[] = [];
  selectedIds: number[] = [1, 2, 3, 4];

  metricKeys = [
    { key: 'budget', label: 'Allocated Budget', prefix: '₹', format: 'currency' },
    { key: 'spend', label: 'Ad Spend Utilized', prefix: '₹', format: 'currency' },
    { key: 'revenue', label: 'Attributed Revenue', prefix: '₹', format: 'currency' },
    { key: 'impressions', label: 'Total Impressions', prefix: '', format: 'number' },
    { key: 'reach', label: 'Audience Reach', prefix: '', format: 'number' },
    { key: 'clicks', label: 'Ad Clicks', prefix: '', format: 'number' },
    { key: 'ctr', label: 'Click-Through Rate (CTR)', suffix: '%', format: 'decimal' },
    { key: 'cpc', label: 'Cost Per Click (CPC)', prefix: '₹', format: 'decimal', isLowerBetter: true },
    { key: 'leads', label: 'Total Leads Captured', prefix: '', format: 'number' },
    { key: 'cpl', label: 'Cost Per Lead (CPL)', prefix: '₹', format: 'decimal', isLowerBetter: true },
    { key: 'conversions', label: 'Final Conversions', prefix: '', format: 'number' },
    { key: 'conversionRate', label: 'Lead-to-Order Conv Rate', suffix: '%', format: 'decimal' },
    { key: 'roas', label: 'Return on Ad Spend (ROAS)', suffix: 'x', format: 'decimal' },
    { key: 'roi', label: 'Return on Investment (ROI)', prefix: '+', suffix: '%', format: 'decimal' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.api.getCampaignComparison(this.selectedIds).subscribe((res: any) => {
      this.comparisonList = res.data;
      this.benchmarks = res.benchmarks;
      this.allCampaigns = res.allCampaigns;
    });
  }

  isSelected(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  toggleCampaign(id: number): void {
    if (this.selectedIds.includes(id)) {
      if (this.selectedIds.length <= 2) return;
      this.selectedIds = this.selectedIds.filter((x) => x !== id);
    } else {
      this.selectedIds.push(id);
    }
    this.loadData();
  }

  getHighlightClass(key: string, value: number): string {
    const bench = this.benchmarks[key];
    if (!bench || this.comparisonList.length < 2) return 'text-slate-800';

    const isBest = bench.best === 'low'
      ? value === bench.min && value > 0
      : value === bench.max && value > 0;

    const isWorst = bench.best === 'low'
      ? value === bench.max && bench.max > bench.min
      : value === bench.min && bench.max > bench.min;

    if (isBest) return 'bg-emerald-50 text-emerald-800 font-bold';
    if (isWorst) return 'bg-rose-50 text-rose-800 font-medium';
    return 'text-slate-800';
  }

  formatValue(item: any, val: any): string {
    const num = Number(val) || 0;
    if (item.format === 'currency') return `${item.prefix}${num.toLocaleString()}`;
    if (item.format === 'decimal') return `${item.prefix || ''}${num}${item.suffix || ''}`;
    return num.toLocaleString();
  }
}
