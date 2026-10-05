import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-3">
        <h1 class="text-base font-bold tracking-tight text-slate-900">
          {{ title }}
        </h1>
        <span class="text-slate-300">·</span>
        <span class="text-xs text-slate-500 font-mono">
          PostgreSQL (localhost:5432)
        </span>
      </div>

      <div class="hidden md:flex items-center gap-4 text-xs text-slate-500">
        <span>Angular 18 Standalone</span>
        <span aria-hidden="true">·</span>
        <span>Express REST API (5000)</span>
        <span aria-hidden="true">·</span>
        <span>MCA Capstone</span>
      </div>

      <div class="flex items-center gap-2">
        <a
          routerLink="/marketing-data"
          class="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
        >
          + Record Metrics
        </a>
      </div>
    </header>
  `
})
export class TopbarComponent {
  @Input() title = 'Marketing Analytics & Campaign Optimization';
}
