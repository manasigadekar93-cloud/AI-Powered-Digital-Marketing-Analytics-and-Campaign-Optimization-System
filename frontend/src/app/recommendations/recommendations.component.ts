import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/services/api.service';
import { Recommendation } from '../core/models/types';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">Rule-Based Campaign Recommendation Engine</h2>
          <p class="text-xs text-slate-500">
            Automated programmatic auditing of CTR, CPC, CPL, Conversion Rates, and ROAS against industry performance thresholds
          </p>
        </div>

        <button
          (click)="generateRecommendations()"
          [disabled]="loading"
          class="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
        >
          <span>{{ loading ? 'Auditing...' : 'Execute Rule Evaluator' }}</span>
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <select [(ngModel)]="priorityFilter" (change)="loadData()" class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700">
            <option value="all">All Priorities</option>
            <option value="Opportunity">Opportunity</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
        <span class="text-xs text-slate-500 font-mono">{{ recommendations.length }} Recommendations</span>
      </div>

      <!-- Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          *ngFor="let rec of recommendations"
          class="p-5 bg-white border rounded-xl shadow-xs space-y-3 flex flex-col justify-between"
          [ngClass]="{
            'border-emerald-200': rec.priority === 'Opportunity',
            'border-rose-200': rec.priority === 'High',
            'border-slate-200': rec.priority !== 'Opportunity' && rec.priority !== 'High'
          }"
        >
          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-500 font-mono">{{ rec.campaignName }}</span>
              <span
                class="text-[11px] font-bold px-2 py-0.5 rounded"
                [ngClass]="{
                  'bg-emerald-50 text-emerald-800 border border-emerald-200': rec.priority === 'Opportunity',
                  'bg-rose-50 text-rose-800 border border-rose-200': rec.priority === 'High',
                  'bg-amber-50 text-amber-800 border border-amber-200': rec.priority === 'Medium'
                }"
              >
                {{ rec.priority }}
              </span>
            </div>

            <div class="mt-2 text-xs font-semibold text-indigo-700">{{ rec.recommendation_type }}</div>
            <p class="mt-1 text-xs font-bold text-slate-900 leading-snug">{{ rec.message }}</p>

            <div class="mt-2 p-3 bg-slate-50 border border-slate-100 rounded-lg text-[11px] text-slate-600 leading-normal">
              <strong class="text-slate-800">Rule Trigger: </strong>{{ rec.reason }}
            </div>
          </div>

          <div class="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
            <span class="text-[11px] text-slate-400 font-mono">Status: <strong class="text-slate-700">{{ rec.status }}</strong></span>
            <div class="flex items-center gap-2">
              <button
                *ngIf="rec.status === 'Pending'"
                (click)="updateStatus(rec.id, 'Applied')"
                class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-medium"
              >
                Apply
              </button>
              <button
                *ngIf="rec.status === 'Pending'"
                (click)="updateStatus(rec.id, 'Dismissed')"
                class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RecommendationsComponent implements OnInit {
  private api = inject(ApiService);

  recommendations: Recommendation[] = [];
  priorityFilter = 'all';
  loading = false;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.api.getRecommendations().subscribe((res: any) => {
      let list = res.data;
      if (this.priorityFilter !== 'all') {
        list = list.filter((r: any) => r.priority === this.priorityFilter);
      }
      this.recommendations = list;
    });
  }

  generateRecommendations(): void {
    this.loading = true;
    this.api.generateRecommendations().subscribe({
      next: (res: any) => {
        this.loading = false;
        alert(res.message);
        this.loadData();
      },
      error: () => (this.loading = false)
    });
  }

  updateStatus(id: number, status: string): void {
    // Optimistic update
    const item = this.recommendations.find(r => r.id === id);
    if (item) item.status = status as any;
  }
}
