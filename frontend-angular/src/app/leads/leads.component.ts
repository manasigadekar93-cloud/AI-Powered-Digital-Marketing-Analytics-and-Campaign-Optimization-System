import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/services/api.service';
import { Lead } from '../core/models/types';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Lead Management & Funnel Pipeline</h1>
          <p class="text-sm text-slate-500">Track prospect progression from impression to converted paying customer</p>
        </div>
      </div>

      <!-- Lead Funnel Diagram -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h2 class="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Marketing Lead Funnel</h2>
        <div class="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
          <div *ngFor="let stage of funnelStages" class="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
            <span class="block text-xs text-slate-500 font-medium">{{ stage.stage }}</span>
            <span class="text-xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">{{ stage.count | number }}</span>
            <span class="text-[10px] text-indigo-600 font-medium mt-0.5 block">{{ stage.conversionFromPrev }}% conv</span>
          </div>
        </div>
      </div>

      <!-- Leads Grid / List -->
      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div class="p-4 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between">
          <input 
            type="text" 
            [(ngModel)]="search" 
            (input)="loadLeads()" 
            placeholder="Search leads by name, email, or source..." 
            class="px-3 py-2 text-sm border border-slate-200 rounded-lg w-full sm:w-72"
          />
          <select [(ngModel)]="statusFilter" (change)="loadLeads()" class="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
            <option value="all">All Stages</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
            <tr>
              <th class="px-5 py-3">Lead Name</th>
              <th class="px-5 py-3">Source & Campaign</th>
              <th class="px-5 py-3">Est. Value</th>
              <th class="px-5 py-3">Funnel Status</th>
              <th class="px-5 py-3 text-right">Update Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let lead of leads" class="hover:bg-slate-50/50">
              <td class="px-5 py-3.5">
                <div class="font-medium text-slate-900">{{ lead.name }}</div>
                <div class="text-xs text-slate-500">{{ lead.email }} · {{ lead.phone }}</div>
              </td>
              <td class="px-5 py-3.5">
                <div class="text-slate-800">{{ lead.source }}</div>
                <div class="text-xs text-slate-500">{{ lead.campaign_name }}</div>
              </td>
              <td class="px-5 py-3.5 font-mono tabular-nums text-slate-800">
                ₹{{ lead.estimated_value | number }}
              </td>
              <td class="px-5 py-3.5">
                <span class="text-xs font-medium" 
                      [ngClass]="{
                        'text-blue-600': lead.status === 'New',
                        'text-purple-600': lead.status === 'Contacted',
                        'text-amber-600': lead.status === 'Qualified',
                        'text-emerald-600': lead.status === 'Converted',
                        'text-rose-600': lead.status === 'Lost'
                      }">
                  {{ lead.status }}
                </span>
              </td>
              <td class="px-5 py-3.5 text-right">
                <select [ngModel]="lead.status" (ngModelChange)="updateStatus(lead, $event)" class="text-xs border border-slate-200 rounded px-2 py-1 bg-white">
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Converted">Converted</option>
                  <option value="Lost">Lost</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class LeadsComponent implements OnInit {
  leads: Lead[] = [];
  funnelStages: any[] = [];
  search = '';
  statusFilter = 'all';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadLeads();
    this.loadFunnel();
  }

  loadLeads(): void {
    this.api.getLeads(undefined, this.statusFilter).subscribe((res) => {
      this.leads = res.data;
    });
  }

  loadFunnel(): void {
    this.api.getFunnelAnalytics().subscribe((res) => {
      this.funnelStages = res.data;
    });
  }

  updateStatus(lead: Lead, newStatus: string): void {
    this.api.updateLeadStatus(lead.id, newStatus, lead.estimated_value).subscribe(() => {
      lead.status = newStatus as any;
      this.loadFunnel();
    });
  }
}
