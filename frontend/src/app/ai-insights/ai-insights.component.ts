import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-ai-insights',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-bold text-slate-900 tracking-tight">AI Econometric Insights & Budget Allocation</h2>
            <span class="text-[11px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
              {{ insights?.source || 'Gemini Heuristic Engine' }}
            </span>
          </div>
          <p class="text-xs text-slate-500">
            Synthesized natural language insights and algorithmic capital distribution models
          </p>
        </div>

        <button
          (click)="loadInsights()"
          [disabled]="loading"
          class="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
        >
          {{ loading ? 'Synthesizing Data...' : 'Re-Analyze Insights' }}
        </button>
      </div>

      <!-- Executive Briefing -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 class="font-bold text-sm text-slate-900">Executive Performance Briefing</h3>
        <p class="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium">
          {{ insights?.executiveSummary }}
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div class="p-3.5 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-1">
            <span class="text-xs font-bold text-amber-800 block">Detected Friction / Anomaly</span>
            <p class="text-[11px] text-amber-900 leading-normal">{{ insights?.anomalyDetected }}</p>
          </div>
          <div class="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-1">
            <span class="text-xs font-bold text-emerald-800 block">Recommended Scale Action</span>
            <p class="text-[11px] text-emerald-900 leading-normal">{{ insights?.scalingRecommendation }}</p>
          </div>
        </div>
      </div>

      <!-- Budget Optimization Section -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 class="font-bold text-sm text-slate-900">Algorithmic Budget Allocation Recommender</h3>
            <p class="text-xs text-slate-500">Predictive capital allocation optimizing marginal ROAS</p>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-xs text-slate-500 font-medium">Target Budget:</span>
            <span class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-900">
              ₹{{ totalBudget | number }}
            </span>
            <button
              (click)="recalculateBudget()"
              [disabled]="optimizing"
              class="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              {{ optimizing ? 'Calculating...' : 'Recalculate Split' }}
            </button>
          </div>
        </div>

        <!-- Slider -->
        <div class="space-y-1">
          <div class="flex justify-between text-xs text-slate-500 font-mono">
            <span>₹50,000</span>
            <span>Target: ₹{{ totalBudget | number }}</span>
            <span>₹5,00,000</span>
          </div>
          <input
            type="range"
            min="50000"
            max="500000"
            step="10000"
            [(ngModel)]="totalBudget"
            class="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        <!-- Allocation Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            *ngFor="let b of insights?.budgetRecommendations"
            class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between">
                <span class="font-bold text-sm text-slate-900">{{ b.platform }}</span>
                <span class="text-xs font-bold text-indigo-600 font-mono">{{ b.percentageShare }}% Share</span>
              </div>
              <div class="mt-2 text-xl font-bold font-mono text-slate-900 tabular-nums">
                ₹{{ b.recommendedSpend | number }}
              </div>
              <div class="mt-2 text-xs text-slate-600 space-y-0.5 font-mono">
                <div>Est. Return: ₹{{ b.expectedRevenue | number }}</div>
                <div>Est. Leads: ~{{ b.expectedLeads }}</div>
              </div>
              <p class="mt-3 text-[11px] text-slate-500 leading-normal border-t border-slate-200/60 pt-2">
                {{ b.rationale }}
              </p>
            </div>
            <div class="text-[10px] text-slate-400 font-mono text-right">
              Current Spend: ₹{{ b.currentSpend | number }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AiInsightsComponent implements OnInit {
  private api = inject(ApiService);

  insights: any = null;
  loading = false;
  optimizing = false;
  totalBudget = 150000;

  ngOnInit(): void {
    this.loadInsights();
  }

  loadInsights(): void {
    this.loading = true;
    this.api.getAIInsights().subscribe({
      next: (res: any) => {
        this.insights = res.data;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  recalculateBudget(): void {
    this.optimizing = true;
    this.api.optimizeBudget(this.totalBudget).subscribe({
      next: (res: any) => {
        this.optimizing = false;
        this.insights = {
          ...this.insights,
          budgetRecommendations: res.data,
          executiveSummary: res.summary || this.insights?.executiveSummary
        };
      },
      error: () => (this.optimizing = false)
    });
  }
}
