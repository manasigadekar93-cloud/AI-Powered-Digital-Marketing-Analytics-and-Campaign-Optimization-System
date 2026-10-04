import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, Plus, Trash2, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';

export const LeadsView: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [funnel, setFunnel] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_id: 1,
    campaign_id: 1,
    name: '',
    email: '',
    phone: '',
    source: 'Google Search Ads',
    lead_date: new Date().toISOString().slice(0, 10),
    status: 'New',
    estimated_value: 15000,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [leadsRes, funnelRes, clientsRes, campRes] = await Promise.all([
        api.getLeads({ search, status: statusFilter }),
        api.getFunnel(),
        api.getClients(),
        api.getCampaigns(),
      ]);
      setLeads(leadsRes.data);
      setFunnel(funnelRes.data);
      setClients(clientsRes.data);
      setCampaigns(campRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.updateLeadStatus(id, newStatus);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createLead(formData);
      setIsFormOpen(false);
      setFormData({
        client_id: clients[0]?.id || 1,
        campaign_id: campaigns[0]?.id || 1,
        name: '',
        email: '',
        phone: '',
        source: 'Google Search Ads',
        lead_date: new Date().toISOString().slice(0, 10),
        status: 'New',
        estimated_value: 15000,
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create lead');
    }
  };

  const handleDeleteLead = async (id: number) => {
    if (confirm('Delete this lead entry?')) {
      try {
        await api.deleteLead(id);
        loadData();
      } catch (err: any) {
        alert(err.message || 'Delete failed');
      }
    }
  };

  const leadStatuses = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Lead Pipeline & Conversion Funnel</h2>
          <p className="text-xs text-slate-500">
            Track individual prospect lifecycle progression from advertising touchpoint to converted customer
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Prospective Lead</span>
        </button>
      </div>

      {/* Visual Lead Funnel Display */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">End-to-End Marketing Funnel Progression</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Conversion Velocity Model</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {funnel.map((stage: any, idx: number) => (
            <div
              key={idx}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl relative flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  {stage.stage}
                </span>
                <span className="text-xl font-bold text-slate-900 font-mono tabular-nums block mt-1">
                  {Number(stage.count).toLocaleString()}
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Step Conv:</span>
                <span className="font-mono font-semibold text-indigo-600 tabular-nums">
                  {stage.conversionFromPrev}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by name, email, or marketing source..."
            className="w-full text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="all">All Funnel Stages</option>
            {leadStatuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Lead Details</th>
              <th className="px-5 py-3">Source Channel</th>
              <th className="px-5 py-3">Campaign Origin</th>
              <th className="px-5 py-3 text-right">Est. Deal Value</th>
              <th className="px-5 py-3">Current Funnel Status</th>
              <th className="px-5 py-3 text-right">Status Action</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                  {loading ? 'Loading leads...' : 'No leads match current filter criteria.'}
                </td>
              </tr>
            ) : (
              leads.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-900">{l.name}</div>
                    <div className="text-slate-500 text-[11px]">{l.email}</div>
                    <div className="font-mono text-slate-400 text-[10px]">{l.phone || '—'}</div>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">{l.source}</td>
                  <td className="px-5 py-3.5 text-slate-600">
                    <div>{l.campaign_name || 'Direct / Brand'}</div>
                    <div className="text-slate-400 text-[10px]">{l.client_name}</div>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono tabular-nums font-semibold text-slate-900">
                    ₹{Number(l.estimated_value).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`font-semibold ${
                        l.status === 'Converted'
                          ? 'text-emerald-700'
                          : l.status === 'Qualified'
                          ? 'text-amber-700'
                          : l.status === 'Contacted'
                          ? 'text-purple-700'
                          : l.status === 'Lost'
                          ? 'text-rose-600'
                          : 'text-blue-700'
                      }`}
                    >
                      {l.status}
                    </span>
                    {l.converted && (
                      <span className="block text-[10px] text-emerald-600 font-mono">
                        Conv: {l.conversion_date?.slice(0, 10)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <select
                      value={l.status}
                      onChange={(e) => handleStatusChange(l.id, e.target.value)}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:outline-none"
                    >
                      {leadStatuses.map((st) => (
                        <option key={st} value={st}>
                          Move to {st}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleDeleteLead(l.id)}
                      title="Delete Lead"
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Lead Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Capture New Inbound Lead</h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Client Account *</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {clients.map((cl) => (
                      <option key={cl.id} value={cl.id}>
                        {cl.business_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Attributed Campaign</label>
                  <select
                    value={formData.campaign_id}
                    onChange={(e) => setFormData({ ...formData, campaign_id: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.campaign_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Lead Prospect Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Aditi Varma"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="prospect@company.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98334 11229"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Channel / Source *</label>
                  <input
                    type="text"
                    required
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="e.g. Instagram Reels Ad"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Estimated Deal Value (₹)</label>
                  <input
                    type="number"
                    value={formData.estimated_value}
                    onChange={(e) => setFormData({ ...formData, estimated_value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold shadow-xs transition-colors"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
