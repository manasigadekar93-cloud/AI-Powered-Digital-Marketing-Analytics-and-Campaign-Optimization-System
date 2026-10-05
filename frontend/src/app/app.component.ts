import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { SidebarComponent } from './layout/sidebar.component';
import { TopbarComponent } from './layout/topbar.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <!-- If not on login route, show full admin dashboard layout -->
    <div *ngIf="!isLoginPage()" class="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans antialiased text-slate-900">
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <app-topbar></app-topbar>
        <main class="flex-1 overflow-y-auto p-6">
          <div class="max-w-7xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>

    <!-- If on login route, render standalone login view -->
    <div *ngIf="isLoginPage()" class="min-h-screen w-screen flex items-center justify-center bg-slate-900 p-4">
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  isLoginPage(): boolean {
    return this.router.url.includes('/login');
  }
}
