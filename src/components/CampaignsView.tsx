import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, Plus, Edit2, Trash2, Eye, Calendar, Target, DollarSign } from 'lucide-react';

export const CampaignsView: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewCampaign, setViewCampaign] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    client_id: 1,
    campaign_name: '',
    platform: 'Instagram',
    campaign_objective: 'Lead Generation',
    budget: 50000,
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    target_audience: '',
    status: 'Active',
    description: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [campRes, clientRes] = await Promise.all([
        api.getCampaigns({
          platform: platformFilter,
          status: statusFilter,
          search,
        }),
        api.getClients(),
      ]);
      setCampaigns(campRes.data);
      setClients(clientRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, platformFilter, statusFilter]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      client_id: clients[0]?.id || 1,
      campaign_name: '',
      platform: 'Instagram',
      campaign_objective: 'Lead Generation',
      budget: 50000,
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      target_audience: '',
      status: 'Active',
      description: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingId(c.id);
    setFormData({
      client_id: c.client_id,
      campaign_name: c.campaign_name,
      platform: c.platform,
      campaign_objective: c.campaign_objective,
      budget: c.budget,
      start_date: c.start_date ? c.start_date.slice(0, 10) : '',
      end_date: c.end_date ? c.end_date.slice(0, 10) : '',
      target_audience: c.target_audience || '',
      status: c.status,
      description: c.description || '',
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateCampaign(editingId, formData);
      } else {
        await api.createCampaign(formData);
      }
      setIsFormOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await api.deleteCampaign(id);
        loadData();
      } catch (err: any) {
        alert(err.message || 'Delete failed');
      }
    }
  };

  const platforms = ['Instagram', 'Facebook', 'Google Ads', 'YouTube', 'LinkedIn', 'Other'];
  const objectives = ['Brand Awareness', 'Traffic', 'Lead Generation', 'Engagement', 'Sales', 'Conversions'];
  const statuses = ['Draft', 'Active', 'Paused', 'Completed'];

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Campaign Operations Console</h2>
          <p className="text-xs text-slate-500">
            Configure omnichannel campaigns, budgets, demographic audiences, and objectives
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Campaign</span>
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns by title or target audience..."
            className="w-full text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="all">All Platforms</option>
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Campaign Name & ID</th>
              <th className="px-5 py-3">Client</th>
              <th className="px-5 py-3">Platform</th>
              <th className="px-5 py-3">Objective</th>
              <th className="px-5 py-3 text-right">Budget</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                  {loading ? 'Loading campaigns...' : 'No campaigns found matching criteria.'}
                </td>
              </tr>
            ) : (
              campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-900">{c.campaign_name}</div>
                    <div className="font-mono text-slate-400 text-[11px]">CMP-{c.id.toString().padStart(3, '0')}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-slate-800 font-medium">{c.business_name || 'Client #' + c.client_id}</div>
                    <div className="text-slate-400 text-[11px]">{c.client_name}</div>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">{c.platform}</td>
                  <td className="px-5 py-3.5 text-slate-700">{c.campaign_objective}</td>
                  <td className="px-5 py-3.5 text-right font-mono tabular-nums font-semibold text-slate-900">
                    ₹{Number(c.budget).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`font-medium ${
                        c.status === 'Active'
                          ? 'text-emerald-700'
                          : c.status === 'Paused'
                          ? 'text-amber-700'
                          : c.status === 'Completed'
                          ? 'text-blue-700'
                          : 'text-slate-500'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => setViewCampaign(c)}
                      title="View Details"
                      className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <Eye className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(c)}
                      title="Edit Campaign"
                      className="p-1 text-indigo-500 hover:text-indigo-700 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      title="Delete Campaign"
                      className="p-1 text-rose-500 hover:text-rose-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Campaign Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                {editingId ? 'Edit Campaign Configuration' : 'Launch New Campaign'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Target Client *</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {clients.map((cl) => (
                      <option key={cl.id} value={cl.id}>
                        {cl.business_name} ({cl.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Platform *</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {platforms.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Campaign Name *</label>
                <input
                  type="text"
                  required
                  value={formData.campaign_name}
                  onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                  placeholder="e.g. Diwali Festival Flash Sale"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Campaign Objective *</label>
                  <select
                    value={formData.campaign_objective}
                    onChange={(e) => setFormData({ ...formData, campaign_objective: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {objectives.map((obj) => (
                      <option key={obj} value={obj}>
                        {obj}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Allocated Budget (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Target Audience Demographics</label>
                  <input
                    type="text"
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    placeholder="e.g. Ages 18-35, Metro Cities"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Campaign Creative Strategy / Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Reels, carousel ads, or Google search copy details"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
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
                  {editingId ? 'Update Campaign' : 'Save & Launch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Campaign Details Modal */}
      {viewCampaign && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{viewCampaign.campaign_name}</h3>
                <span className="text-xs text-slate-500">
                  {viewCampaign.business_name} · {viewCampaign.platform}
                </span>
              </div>
              <button
                onClick={() => setViewCampaign(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-500 block">Total Budget</span>
                  <span className="font-mono text-base font-bold text-slate-900">
                    ₹{Number(viewCampaign.budget).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Status</span>
                  <span className="text-sm font-semibold text-emerald-700">{viewCampaign.status}</span>
                </div>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Objective</span>
                <span className="font-medium text-slate-800">{viewCampaign.campaign_objective}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Flight Schedule</span>
                <span className="font-mono text-slate-700">
                  {viewCampaign.start_date?.slice(0, 10)} to {viewCampaign.end_date?.slice(0, 10)}
                </span>
              </div>

              <div className="py-1">
                <span className="text-slate-500 block mb-1">Target Audience</span>
                <p className="text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {viewCampaign.target_audience || 'Broad demographic audience'}
                </p>
              </div>

              <div className="py-1">
                <span className="text-slate-500 block mb-1">Strategy Description</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {viewCampaign.description || 'No strategy notes provided.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setViewCampaign(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
