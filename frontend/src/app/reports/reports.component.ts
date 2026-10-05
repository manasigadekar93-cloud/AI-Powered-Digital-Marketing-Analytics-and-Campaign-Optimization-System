import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/services/api.service';
import { Campaign, Client } from '../core/models/types';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">Executive Report Generator</h2>
          <p class="text-xs text-slate-500">
            Generate printable audit reports, client marketing summaries, and cross-channel efficiency analyses
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            (click)="exportCSV()"
            [disabled]="!report"
            class="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs disabled:opacity-50"
          >
            Export CSV
          </button>
          <button
            (click)="printReport()"
            [disabled]="!report"
            class="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs disabled:opacity-50"
          >
            Print / Save PDF
          </button>
        </div>
      </div>

      <!-- Generator Controls -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-slate-700">Report Template:</span>
          <select [(ngModel)]="reportType" class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800">
            <option value="campaign_performance">Campaign Performance Audit</option>
            <option value="client_marketing">Client Retainer Summary</option>
            <option value="platform_performance">Omnichannel Platform Efficiency</option>
            <option value="monthly_audit">Monthly Agency Audit</option>
          </select>
        </div>

        <div *ngIf="reportType === 'campaign_performance'" class="flex items-center gap-2">
          <span class="text-xs font-semibold text-slate-700">Campaign:</span>
          <select [(ngModel)]="selectedCampaignId" class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800">
            <option *ngFor="let c of campaigns" [value]="c.id">{{ c.campaign_name }}</option>
          </select>
        </div>

        <div *ngIf="reportType === 'client_marketing'" class="flex items-center gap-2">
          <span class="text-xs font-semibold text-slate-700">Client:</span>
          <select [(ngModel)]="selectedClientId" class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800">
            <option *ngFor="let cl of clients" [value]="cl.id">{{ cl.business_name }}</option>
          </select>
        </div>

        <button
          (click)="generateReport()"
          [disabled]="loading"
          class="ml-auto px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs disabled:opacity-50"
        >
          {{ loading ? 'Compiling...' : 'Generate Report' }}
        </button>
      </div>

      <!-- Rendered Report Container -->
      <div *ngIf="report" class="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-3">
          <div>
            <div class="text-[11px] font-mono text-indigo-600 font-bold uppercase tracking-wider">
              Digital Marketing Analytics System · Report Ref: {{ report.id }}
            </div>
            <h1 class="text-xl font-bold text-slate-900 mt-1">{{ report.title }}</h1>
            <p class="text-xs text-slate-500 mt-0.5">Audit Period: {{ report.period }} · Prepared by: {{ report.generatedBy }}</p>
          </div>
          <div class="text-right text-xs text-slate-400 font-mono">
            Generated: {{ report.generatedAt | date:'medium' }}
          </div>
        </div>

        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
          <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Executive Evaluation Summary</span>
          <p class="text-xs text-slate-700 leading-relaxed font-medium">{{ report.data?.summary }}</p>
        </div>

        <!-- KPIs Strip -->
        <div *ngIf="report.data?.kpis" class="space-y-3">
          <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Key Performance Indicators</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-center">
            <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span class="text-[10px] text-slate-500 uppercase block">Ad Spend</span>
              <span class="text-base font-bold font-mono text-slate-900 tabular-nums">₹{{ report.data.kpis.spend | number }}</span>
            </div>
            <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span class="text-[10px] text-slate-500 uppercase block">Revenue</span>
              <span class="text-base font-bold font-mono text-emerald-600 tabular-nums">₹{{ report.data.kpis.revenue | number }}</span>
            </div>
            <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span class="text-[10px] text-slate-500 uppercase block">Total Leads</span>
              <span class="text-base font-bold font-mono text-slate-900 tabular-nums">{{ report.data.kpis.leads }}</span>
            </div>
            <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span class="text-[10px] text-slate-500 uppercase block">CPL</span>
              <span class="text-base font-bold font-mono text-purple-700 tabular-nums">₹{{ report.data.kpis.cpl }}</span>
            </div>
            <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span class="text-[10px] text-slate-500 uppercase block">ROAS</span>
              <span class="text-base font-bold font-mono text-blue-600 tabular-nums">{{ report.data.kpis.roas }}x</span>
            </div>
            <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span class="text-[10px] text-slate-500 uppercase block">Net ROI</span>
              <span class="text-base font-bold font-mono text-emerald-600 tabular-nums">+{{ report.data.kpis.roi }}%</span>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-200 pt-6 flex justify-between text-[11px] text-slate-400">
          <div>AI-Powered Digital Marketing Analytics and Campaign Optimization System</div>
          <div>Department of Computer Applications · MCA Academic Project</div>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  private api = inject(ApiService);

  campaigns: Campaign[] = [];
  clients: Client[] = [];
  reportType = 'campaign_performance';
  selectedCampaignId = 1;
  selectedClientId = 1;
  report: any = null;
  loading = false;

  ngOnInit(): void {
    this.api.getCampaigns().subscribe((res: any) => (this.campaigns = res.data));
    this.api.getClients().subscribe((res: any) => (this.clients = res.data));
    this.generateReport();
  }

  generateReport(): void {
    this.loading = true;
    this.api.generateReport(this.reportType, this.selectedCampaignId).subscribe({
      next: (res: any) => {
        this.report = res.report;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  printReport(): void {
    window.print();
  }

  exportCSV(): void {
    if (!this.report) return;
    const csv = `Title,${this.report.title}\nDate,${this.report.generatedAt}\nSummary,"${this.report.data?.summary || ''}"\n`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketing_report_${this.report.id}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
