import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ApiService } from '../core/services/api.service';
import { Campaign, Client } from '../core/models/types';

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Top Action Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">Campaign Operations Console</h2>
          <p class="text-xs text-slate-500">
            Configure omnichannel campaigns, budgets, demographic audiences, and objectives
          </p>
        </div>
        <button
          (click)="openCreateModal()"
          class="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <span>+ Launch Campaign</span>
        </button>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <input
          type="text"
          [(ngModel)]="search"
          (input)="loadCampaigns()"
          placeholder="Search campaigns by title or target audience..."
          class="text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none w-full sm:w-72"
        />

        <div class="flex items-center gap-3">
          <select
            [(ngModel)]="platformFilter"
            (change)="loadCampaigns()"
            class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="all">All Platforms</option>
            <option *ngFor="let p of platforms" [value]="p">{{ p }}</option>
          </select>

          <select
            [(ngModel)]="statusFilter"
            (change)="loadCampaigns()"
            class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
          </select>
        </div>
      </div>

      <!-- Campaigns Table -->
      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th class="px-5 py-3">Campaign Name & ID</th>
              <th class="px-5 py-3">Client</th>
              <th class="px-5 py-3">Platform</th>
              <th class="px-5 py-3">Objective</th>
              <th class="px-5 py-3 text-right">Budget</th>
              <th class="px-5 py-3">Status</th>
              <th class="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let c of campaigns" class="hover:bg-slate-50/60 transition-colors">
              <td class="px-5 py-3.5">
                <div class="font-semibold text-slate-900">{{ c.campaign_name }}</div>
                <div class="font-mono text-slate-400 text-[11px]">CMP-{{ c.id }}</div>
              </td>
              <td class="px-5 py-3.5">
                <div class="text-slate-800 font-medium">{{ c.business_name || 'Client #' + c.client_id }}</div>
                <div class="text-slate-400 text-[11px]">{{ c.client_name }}</div>
              </td>
              <td class="px-5 py-3.5 font-medium text-slate-800">{{ c.platform }}</td>
              <td class="px-5 py-3.5 text-slate-700">{{ c.campaign_objective }}</td>
              <td class="px-5 py-3.5 text-right font-mono tabular-nums font-semibold text-slate-900">
                ₹{{ c.budget | number }}
              </td>
              <td class="px-5 py-3.5">
                <span
                  class="font-medium"
                  [ngClass]="{
                    'text-emerald-700': c.status === 'Active',
                    'text-amber-700': c.status === 'Paused',
                    'text-blue-700': c.status === 'Completed',
                    'text-slate-500': c.status === 'Draft'
                  }"
                >
                  {{ c.status }}
                </span>
              </td>
              <td class="px-5 py-3.5 text-right space-x-2">
                <button (click)="openEditModal(c)" class="text-xs text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>
                <button (click)="deleteCampaign(c.id)" class="text-xs text-rose-600 hover:text-rose-900 font-medium">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Campaign Modal -->
      <div *ngIf="showModal" class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="font-bold text-sm text-slate-900">
              {{ editingId ? 'Edit Campaign Configuration' : 'Launch New Campaign' }}
            </h3>
            <button (click)="showModal = false" class="text-slate-400 hover:text-slate-600 text-lg">&times;</button>
          </div>

          <form [formGroup]="campaignForm" (ngSubmit)="saveCampaign()" class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-medium text-slate-700 mb-1">Target Client *</label>
                <select formControlName="client_id" class="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white">
                  <option *ngFor="let cl of clients" [value]="cl.id">{{ cl.business_name }}</option>
                </select>
              </div>
              <div>
                <label class="block font-medium text-slate-700 mb-1">Platform *</label>
                <select formControlName="platform" class="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white">
                  <option *ngFor="let p of platforms" [value]="p">{{ p }}</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-medium text-slate-700 mb-1">Campaign Name *</label>
              <input type="text" formControlName="campaign_name" class="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-medium text-slate-700 mb-1">Objective *</label>
                <select formControlName="campaign_objective" class="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white">
                  <option *ngFor="let obj of objectives" [value]="obj">{{ obj }}</option>
                </select>
              </div>
              <div>
                <label class="block font-medium text-slate-700 mb-1">Allocated Budget (₹) *</label>
                <input type="number" formControlName="budget" class="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-medium text-slate-700 mb-1">Start Date *</label>
                <input type="date" formControlName="start_date" class="w-full px-3 py-2 border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label class="block font-medium text-slate-700 mb-1">End Date *</label>
                <input type="date" formControlName="end_date" class="w-full px-3 py-2 border border-slate-200 rounded-lg" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-medium text-slate-700 mb-1">Status</label>
                <select formControlName="status" class="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white">
                  <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
                </select>
              </div>
              <div>
                <label class="block font-medium text-slate-700 mb-1">Target Audience</label>
                <input type="text" formControlName="target_audience" class="w-full px-3 py-2 border border-slate-200 rounded-lg" />
              </div>
            </div>

            <div>
              <label class="block font-medium text-slate-700 mb-1">Description / Strategy</label>
              <textarea rows="2" formControlName="description" class="w-full px-3 py-2 border border-slate-200 rounded-lg"></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" (click)="showModal = false" class="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium">Cancel</button>
              <button type="submit" [disabled]="campaignForm.invalid" class="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold disabled:opacity-50">
                {{ editingId ? 'Update Campaign' : 'Save & Launch' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class CampaignsComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  campaigns: Campaign[] = [];
  clients: Client[] = [];
  search = '';
  platformFilter = 'all';
  statusFilter = 'all';
  showModal = false;
  editingId: number | null = null;

  platforms = ['Instagram', 'Facebook', 'Google Ads', 'YouTube', 'LinkedIn', 'Other'];
  objectives = ['Brand Awareness', 'Traffic', 'Lead Generation', 'Engagement', 'Sales', 'Conversions'];
  statuses = ['Draft', 'Active', 'Paused', 'Completed'];

  campaignForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadCampaigns();
    this.api.getClients().subscribe((res: any) => (this.clients = res.data));
  }

  initForm(): void {
    this.campaignForm = this.fb.group({
      client_id: [1, Validators.required],
      campaign_name: ['', Validators.required],
      platform: ['Instagram', Validators.required],
      campaign_objective: ['Lead Generation', Validators.required],
      budget: [50000, Validators.required],
      start_date: [new Date().toISOString().slice(0, 10), Validators.required],
      end_date: [new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10), Validators.required],
      target_audience: [''],
      status: ['Active', Validators.required],
      description: ['']
    });
  }

  loadCampaigns(): void {
    this.api.getCampaigns(undefined, this.platformFilter, this.statusFilter).subscribe((res: any) => {
      this.campaigns = res.data;
    });
  }

  openCreateModal(): void {
    this.editingId = null;
    this.campaignForm.reset({
      client_id: this.clients[0]?.id || 1,
      platform: 'Instagram',
      campaign_objective: 'Lead Generation',
      budget: 50000,
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      status: 'Active'
    });
    this.showModal = true;
  }

  openEditModal(c: any): void {
    this.editingId = c.id;
    this.campaignForm.patchValue({
      client_id: c.client_id,
      campaign_name: c.campaign_name,
      platform: c.platform,
      campaign_objective: c.campaign_objective,
      budget: c.budget,
      start_date: c.start_date ? c.start_date.slice(0, 10) : '',
      end_date: c.end_date ? c.end_date.slice(0, 10) : '',
      target_audience: c.target_audience,
      status: c.status,
      description: c.description
    });
    this.showModal = true;
  }

  saveCampaign(): void {
    if (this.campaignForm.invalid) return;

    if (this.editingId) {
      this.api.updateCampaign(this.editingId, this.campaignForm.value).subscribe(() => {
        this.showModal = false;
        this.loadCampaigns();
      });
    } else {
      this.api.createCampaign(this.campaignForm.value).subscribe(() => {
        this.showModal = false;
        this.loadCampaigns();
      });
    }
  }

  deleteCampaign(id: number): void {
    if (confirm('Delete this campaign?')) {
      this.api.deleteCampaign(id).subscribe(() => this.loadCampaigns());
    }
  }
}
