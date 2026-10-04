import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, Calculator, CheckCircle2, UploadCloud } from 'lucide-react';

export const MarketingDataView: React.FC = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form input fields
  const [formData, setFormData] = useState({
    campaign_id: 1,
    metric_date: new Date().toISOString().slice(0, 10),
    impressions: 25000,
    reach: 18000,
    clicks: 750,
    advertising_spend: 12000,
    leads: 50,
    qualified_leads: 30,
    conversions: 15,
    revenue: 48000,
  });

  // Safe KPI live calculation state
  const calculateLiveKPIs = (data: typeof formData) => {
    const imp = Math.max(0, Number(data.impressions) || 0);
    const clicks = Math.max(0, Number(data.clicks) || 0);
    const spend = Math.max(0, Number(data.advertising_spend) || 0);
    const leads = Math.max(0, Number(data.leads) || 0);
    const conv = Math.max(0, Number(data.conversions) || 0);
    const rev = Math.max(0, Number(data.revenue) || 0);

    return {
      ctr: imp > 0 ? Number(((clicks / imp) * 100).toFixed(2)) : 0.0,
      cpc: clicks > 0 ? Number((spend / clicks).toFixed(2)) : 0.0,
      cpl: leads > 0 ? Number((spend / leads).toFixed(2)) : 0.0,
      conversionRate: leads > 0 ? Number(((conv / leads) * 100).toFixed(2)) : 0.0,
      cac: conv > 0 ? Number((spend / conv).toFixed(2)) : 0.0,
      roas: spend > 0 ? Number((rev / spend).toFixed(2)) : 0.0,
      roi: spend > 0 ? Number((((rev - spend) / spend) * 100).toFixed(2)) : 0.0,
    };
  };

  const [liveKpis, setLiveKpis] = useState(calculateLiveKPIs(formData));

  const loadData = async () => {
    setLoading(true);
    try {
      const [mRes, cRes] = await Promise.all([api.getMetrics(), api.getCampaigns()]);
      setMetrics(mRes.data);
      setCampaigns(cRes.data);
      if (cRes.data.length > 0 && formData.campaign_id === 1) {
        setFormData((prev) => ({ ...prev, campaign_id: cRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    const next = { ...formData, [field]: value };
    setFormData(next);
    setLiveKpis(calculateLiveKPIs(next));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addMetric(formData);
      setIsFormOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to record metric');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this metric entry?')) {
      try {
        await api.deleteMetric(id);
        loadData();
      } catch (err: any) {
        alert(err.message || 'Delete failed');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Marketing Performance Data Entry</h2>
          <p className="text-xs text-slate-500">
            Log daily ad impressions, clicks, spend, leads and revenue with real-time automated KPI evaluation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{isFormOpen ? 'Close Entry Form' : 'Log Daily Performance'}</span>
          </button>
        </div>
      </div>

      {/* Real-time KPI Calculator Panel / Entry Form */}
      {isFormOpen && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Performance Entry & Automated KPI Calculation Engine
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Safe Zero-Division Invariant Active
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Campaign *</label>
                <select
                  value={formData.campaign_id}
                  onChange={(e) => handleInputChange('campaign_id', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.campaign_name} · {c.platform}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Performance Date *</label>
                <input
                  type="date"
                  required
                  value={formData.metric_date}
                  onChange={(e) => handleInputChange('metric_date', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Metric Input Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Impressions</label>
                <input
                  type="number"
                  min="0"
                  value={formData.impressions}
                  onChange={(e) => handleInputChange('impressions', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Unique Reach</label>
                <input
                  type="number"
                  min="0"
                  value={formData.reach}
                  onChange={(e) => handleInputChange('reach', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Clicks</label>
                <input
                  type="number"
                  min="0"
                  value={formData.clicks}
                  onChange={(e) => handleInputChange('clicks', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Advertising Spend (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.advertising_spend}
                  onChange={(e) => handleInputChange('advertising_spend', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Total Leads Captured</label>
                <input
                  type="number"
                  min="0"
                  value={formData.leads}
                  onChange={(e) => handleInputChange('leads', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Qualified Leads</label>
                <input
                  type="number"
                  min="0"
                  value={formData.qualified_leads}
                  onChange={(e) => handleInputChange('qualified_leads', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Conversions / Sales</label>
                <input
                  type="number"
                  min="0"
                  value={formData.conversions}
                  onChange={(e) => handleInputChange('conversions', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Attributed Revenue (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.revenue}
                  onChange={(e) => handleInputChange('revenue', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Computed KPI Formula Strip */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Computed Marketing KPIs (Real-Time Formula Preview)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">CTR</span>
                  <span className="text-sm font-bold font-mono text-indigo-600 tabular-nums">
                    {liveKpis.ctr}%
                  </span>
                  <span className="block text-[9px] text-slate-400">Clicks/Impr</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">CPC</span>
                  <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                    ₹{liveKpis.cpc}
                  </span>
                  <span className="block text-[9px] text-slate-400">Spend/Clicks</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">CPL</span>
                  <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                    ₹{liveKpis.cpl}
                  </span>
                  <span className="block text-[9px] text-slate-400">Spend/Leads</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">Conv Rate</span>
                  <span className="text-sm font-bold font-mono text-emerald-600 tabular-nums">
                    {liveKpis.conversionRate}%
                  </span>
                  <span className="block text-[9px] text-slate-400">Conv/Leads</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">CAC</span>
                  <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                    ₹{liveKpis.cac}
                  </span>
                  <span className="block text-[9px] text-slate-400">Spend/Conv</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">ROAS</span>
                  <span className="text-sm font-bold font-mono text-blue-600 tabular-nums">
                    {liveKpis.roas}x
                  </span>
                  <span className="block text-[9px] text-slate-400">Rev/Spend</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">ROI</span>
                  <span className="text-sm font-bold font-mono text-emerald-600 tabular-nums">
                    +{liveKpis.roi}%
                  </span>
                  <span className="block text-[9px] text-slate-400">(Rev-Spd)/Spd</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
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
                Store Metric in Database
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Historical Metrics Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Campaign Metrics Log (Chronological)</h3>
            <p className="text-xs text-slate-500">Verified raw observations and pre-computed econometric KPIs</p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {metrics.length} Records Stored
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3 text-right">Spend</th>
                <th className="px-4 py-3 text-right">Impressions</th>
                <th className="px-4 py-3 text-right">Clicks</th>
                <th className="px-4 py-3 text-right">CTR</th>
                <th className="px-4 py-3 text-right">CPC</th>
                <th className="px-4 py-3 text-right">Leads</th>
                <th className="px-4 py-3 text-right">CPL</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3 text-right">ROAS</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-slate-400">
                    {loading ? 'Loading metrics...' : 'No marketing data recorded yet.'}
                  </td>
                </tr>
              ) : (
                metrics.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-slate-600 whitespace-nowrap">
                      {m.metric_date?.slice(0, 10)}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                      {m.campaign_name || 'Campaign #' + m.campaign_id}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono tabular-nums text-slate-900 whitespace-nowrap">
                      ₹{Number(m.advertising_spend).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                      {Number(m.impressions).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                      {Number(m.clicks).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono tabular-nums text-indigo-600 font-semibold whitespace-nowrap">
                      {m.ctr}%
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                      ₹{m.cpc}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono tabular-nums text-slate-900 font-medium whitespace-nowrap">
                      {m.leads}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                      ₹{m.cpl}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono tabular-nums font-semibold text-emerald-600 whitespace-nowrap">
                      ₹{Number(m.revenue).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono tabular-nums font-bold text-blue-600 whitespace-nowrap">
                      {m.roas}x
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete Entry"
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
      </div>
    </div>
  );
};
