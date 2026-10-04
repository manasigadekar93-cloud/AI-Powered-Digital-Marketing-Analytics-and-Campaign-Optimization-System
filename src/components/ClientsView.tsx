import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, Plus, Edit2, Trash2, Eye, Building2, Phone, Mail, MapPin } from 'lucide-react';

export const ClientsView: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewClient, setViewClient] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    business_name: '',
    email: '',
    phone: '',
    industry: 'E-Commerce & Fashion',
    address: '',
    status: 'Active',
  });

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await api.getClients({
        search,
        status: statusFilter,
        industry: industryFilter,
      });
      setClients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [search, statusFilter, industryFilter]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: '',
      business_name: '',
      email: '',
      phone: '',
      industry: 'E-Commerce & Fashion',
      address: '',
      status: 'Active',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (client: any) => {
    setEditingId(client.id);
    setFormData({
      name: client.name,
      business_name: client.business_name,
      email: client.email,
      phone: client.phone || '',
      industry: client.industry,
      address: client.address || '',
      status: client.status,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateClient(editingId, formData);
      } else {
        await api.createClient(formData);
      }
      setIsFormOpen(false);
      loadClients();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this client and associated campaigns?')) {
      try {
        await api.deleteClient(id);
        loadClients();
      } catch (err: any) {
        alert(err.message || 'Delete failed');
      }
    }
  };

  const industries = [
    'E-Commerce & Fashion',
    'Healthcare & Clinics',
    'B2B Software & Cloud',
    'Education & EdTech',
    'Real Estate & Interiors',
    'Automotive & EV',
  ];

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Client Account Directory</h2>
          <p className="text-xs text-slate-500">
            Manage agency retainer clients, industry verticals, contact points, and billing status
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
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
            placeholder="Search by client name, brand, or email..."
            className="w-full text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="all">All Industries</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Onboarding">Onboarding</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Client ID</th>
              <th className="px-5 py-3">Business / Client Name</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Industry</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                  {loading ? 'Loading clients...' : 'No clients found matching filter criteria.'}
                </td>
              </tr>
            ) : (
              clients.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-slate-500">CL-{c.id.toString().padStart(3, '0')}</td>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-900">{c.business_name}</div>
                    <div className="text-slate-500 text-[11px]">{c.name}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-slate-700">{c.email}</div>
                    <div className="font-mono text-slate-500 text-[11px]">{c.phone || '—'}</div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700">{c.industry}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`font-medium ${
                        c.status === 'Active'
                          ? 'text-emerald-700'
                          : c.status === 'Onboarding'
                          ? 'text-indigo-700'
                          : 'text-slate-500'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => setViewClient(c)}
                      title="View Details"
                      className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <Eye className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(c)}
                      title="Edit Client"
                      className="p-1 text-indigo-500 hover:text-indigo-700 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      title="Delete Client"
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

      {/* Add / Edit Client Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                {editingId ? 'Edit Client Record' : 'Register New Client'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Company / Business Name *</label>
                <input
                  type="text"
                  required
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  placeholder="e.g. Aura Retail India"
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
                    placeholder="contact@business.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98201 54321"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Industry Vertical *</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Retainer Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Onboarding">Onboarding</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Office / Billing Address</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, City, State, PIN"
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
                  {editingId ? 'Update Client' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Client Details Modal */}
      {viewClient && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">{viewClient.business_name}</h3>
              </div>
              <button
                onClick={() => setViewClient(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Client ID</span>
                <span className="font-mono text-slate-900">CL-{viewClient.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Contact Person</span>
                <span className="font-semibold text-slate-900">{viewClient.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Email
                </span>
                <span className="text-slate-800">{viewClient.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Phone
                </span>
                <span className="font-mono text-slate-800">{viewClient.phone || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Industry</span>
                <span className="text-slate-800 font-medium">{viewClient.industry}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Status</span>
                <span className="font-medium text-emerald-700">{viewClient.status}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-500 flex items-center gap-1 mb-1">
                  <MapPin className="w-3.5 h-3.5" /> Address
                </span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {viewClient.address || 'No physical address specified.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setViewClient(null)}
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
