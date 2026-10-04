import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../core/services/api.service';
import { Client } from '../core/models/types';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Client Management</h1>
          <p class="text-sm text-slate-500">Manage client accounts, industries, contact details, and marketing contracts</p>
        </div>
        <button (click)="openModal()" class="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs">
          + Add New Client
        </button>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
        <input 
          type="text" 
          [(ngModel)]="searchQuery" 
          (input)="loadClients()" 
          placeholder="Search by name, business, or email..." 
          class="px-3 py-2 text-sm border border-slate-200 rounded-lg w-full sm:w-72 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <select [(ngModel)]="statusFilter" (change)="loadClients()" class="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
          <option value="all">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Onboarding">Onboarding</option>
        </select>
      </div>

      <!-- Clients Table -->
      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-slate-500 text-xs uppercase font-medium border-b border-slate-200">
            <tr>
              <th class="px-5 py-3">Client & Business</th>
              <th class="px-5 py-3">Contact Email</th>
              <th class="px-5 py-3">Phone</th>
              <th class="px-5 py-3">Industry</th>
              <th class="px-5 py-3">Status</th>
              <th class="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let client of clients" class="hover:bg-slate-50/60 transition-colors">
              <td class="px-5 py-3.5">
                <div class="font-medium text-slate-900">{{ client.business_name }}</div>
                <div class="text-xs text-slate-500">{{ client.name }}</div>
              </td>
              <td class="px-5 py-3.5 text-slate-600">{{ client.email }}</td>
              <td class="px-5 py-3.5 text-slate-600 font-mono text-xs">{{ client.phone }}</td>
              <td class="px-5 py-3.5 text-slate-700">{{ client.industry }}</td>
              <td class="px-5 py-3.5">
                <span class="inline-flex items-center text-xs font-medium" 
                      [ngClass]="client.status === 'Active' ? 'text-emerald-700' : 'text-slate-500'">
                  {{ client.status }}
                </span>
              </td>
              <td class="px-5 py-3.5 text-right space-x-2">
                <button (click)="editClient(client)" class="text-xs text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>
                <button (click)="deleteClient(client.id)" class="text-xs text-rose-600 hover:text-rose-900 font-medium">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Modal with Reactive Form -->
      <div *ngIf="showModal" class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="font-bold text-slate-900">{{ editingId ? 'Edit Client' : 'Add New Client' }}</h3>
            <button (click)="closeModal()" class="text-slate-400 hover:text-slate-600 text-lg">&times;</button>
          </div>

          <form [formGroup]="clientForm" (ngSubmit)="saveClient()" class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Contact Name *</label>
              <input type="text" formControlName="name" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Business Name *</label>
              <input type="text" formControlName="business_name" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1">Email *</label>
                <input type="email" formControlName="email" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1">Phone</label>
                <input type="text" formControlName="phone" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1">Industry *</label>
                <input type="text" formControlName="industry" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1">Status</label>
                <select formControlName="status" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Onboarding">Onboarding</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Address</label>
              <input type="text" formControlName="address" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" (click)="closeModal()" class="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg">Cancel</button>
              <button type="submit" [disabled]="clientForm.invalid" class="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg disabled:opacity-50">
                {{ editingId ? 'Update Client' : 'Save Client' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  searchQuery = '';
  statusFilter = 'all';
  showModal = false;
  editingId: number | null = null;
  clientForm!: FormGroup;

  constructor(private api: ApiService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
  }

  initForm(): void {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      business_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      industry: ['', Validators.required],
      address: [''],
      status: ['Active', Validators.required]
    });
  }

  loadClients(): void {
    this.api.getClients(this.searchQuery, this.statusFilter).subscribe((res) => {
      this.clients = res.data;
    });
  }

  openModal(): void {
    this.editingId = null;
    this.clientForm.reset({ status: 'Active' });
    this.showModal = true;
  }

  editClient(client: Client): void {
    this.editingId = client.id;
    this.clientForm.patchValue(client);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingId = null;
  }

  saveClient(): void {
    if (this.clientForm.invalid) return;

    if (this.editingId) {
      this.api.updateClient(this.editingId, this.clientForm.value).subscribe(() => {
        this.closeModal();
        this.loadClients();
      });
    } else {
      this.api.createClient(this.clientForm.value).subscribe(() => {
        this.closeModal();
        this.loadClients();
      });
    }
  }

  deleteClient(id: number): void {
    if (confirm('Are you sure you want to delete this client?')) {
      this.api.deleteClient(id).subscribe(() => this.loadClients());
    }
  }
}
