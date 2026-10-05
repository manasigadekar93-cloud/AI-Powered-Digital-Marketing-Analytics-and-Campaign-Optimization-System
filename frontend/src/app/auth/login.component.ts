import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl space-y-6 border border-slate-200">
      <div class="text-center space-y-2">
        <div class="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-xl shadow-md">
          Δ
        </div>
        <h2 class="text-xl font-bold text-slate-900 tracking-tight">Admin System Authentication</h2>
        <p class="text-xs text-slate-500">
          Sign in to access the Digital Marketing Analytics and Campaign Optimization Engine
        </p>
      </div>

      <div *ngIf="errorMessage" class="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
        {{ errorMessage }}
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4 text-xs">
        <div>
          <label class="block font-medium text-slate-700 mb-1">Administrator Email</label>
          <input
            type="email"
            formControlName="email"
            class="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
          />
        </div>

        <div>
          <label class="block font-medium text-slate-700 mb-1">Security Password</label>
          <input
            type="password"
            formControlName="password"
            class="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
          />
        </div>

        <div class="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1">
          <span class="text-[11px] font-bold text-indigo-900 block">
            Pre-Seeded MCA Admin Account
          </span>
          <div class="text-[11px] text-slate-600 font-mono space-y-0.5">
            <div>Email: <strong>admin&#64;marketing.com</strong></div>
            <div>Password: <strong>admin123</strong> (bcrypt hashed)</div>
          </div>
        </div>

        <button
          type="submit"
          [disabled]="loginForm.invalid || loading"
          class="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
        >
          {{ loading ? 'Authenticating...' : 'Sign In as System Admin' }}
        </button>
      </form>

      <div class="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-4">
        MCA Academic Project · JWT Secure Access Control
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = false;
  errorMessage = '';

  loginForm: FormGroup = this.fb.group({
    email: ['admin@marketing.com', [Validators.required, Validators.email]],
    password: ['admin123', Validators.required]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Invalid email or password';
      }
    });
  }
}
