import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none min-h-screen">
      <!-- Brand Header -->
      <div class="h-16 flex items-center px-5 border-b border-slate-800 gap-3">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
          Δ
        </div>
        <div class="truncate">
          <div class="font-semibold text-sm text-white tracking-tight truncate">
            OmniMark System
          </div>
          <div class="text-[11px] text-slate-400 truncate">MCA Angular 18 Enterprise</div>
        </div>
      </div>

      <!-- Navigation List -->
      <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <a
          *ngFor="let item of navItems"
          [routerLink]="item.path"
          routerLinkActive="bg-indigo-600 text-white shadow-xs font-semibold"
          [routerLinkActiveOptions]="{ exact: item.exact || false }"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors"
        >
          <span class="truncate">{{ item.label }}</span>
        </a>
      </nav>

      <!-- User Profile & Logout -->
      <div class="p-4 border-t border-slate-800 bg-slate-900/50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5 truncate">
            <div class="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div class="truncate">
              <div class="text-xs font-semibold text-white truncate">{{ user?.name || 'Administrator' }}</div>
              <div class="text-[10px] text-slate-400 truncate">{{ user?.role || 'admin' }} · Localhost:5432</div>
            </div>
          </div>
          <button
            (click)="logout()"
            title="Logout"
            class="text-xs text-slate-400 hover:text-rose-400 p-1.5 hover:bg-slate-800 rounded-md transition-colors"
          >
            Exit
          </button>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.getUser();

  navItems = [
    { path: '/dashboard', label: 'Dashboard', exact: true },
    { path: '/clients', label: 'Clients' },
    { path: '/campaigns', label: 'Campaigns' },
    { path: '/marketing-data', label: 'Marketing Data' },
    { path: '/leads', label: 'Leads & Funnel' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/campaign-comparison', label: 'Campaign Comparison' },
    { path: '/ai-insights', label: 'AI Insights' },
    { path: '/recommendations', label: 'Recommendations' },
    { path: '/reports', label: 'Reports' }
  ];

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
