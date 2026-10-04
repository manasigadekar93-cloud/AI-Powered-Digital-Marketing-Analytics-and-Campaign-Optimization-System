import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BarChart3, TrendingUp, Filter, IndianRupee, Target } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, campRes, mRes] = await Promise.all([
        api.getClients(),
        api.getCampaigns(),
        api.getMetrics(),
      ]);
      setClients(cRes.data);
      setCampaigns(campRes.data);
      setMetrics(mRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter metrics
  let filtered = [...metrics];
  if (selectedCampaign !== 'all') {
    filtered = filtered.filter((m) => m.campaign_id === parseInt(selectedCampaign, 10));
  }
  if (selectedPlatform !== 'all') {
    filtered = filtered.filter((m) => m.platform === selectedPlatform);
  }
  if (selectedClient !== 'all') {
    const clientCampaignIds = campaigns
      .filter((c) => c.client_id === parseInt(selectedClient, 10))
      .map((c) => c.id);
    filtered = filtered.filter((m) => clientCampaignIds.includes(m.campaign_id));
  }

  // Aggregate stats
  let totalSpend = 0;
  let totalRevenue = 0;
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalLeads = 0;
  let totalConversions = 0;

  filtered.forEach((m) => {
    totalSpend += Number(m.advertising_spend) || 0;
    totalRevenue += Number(m.revenue) || 0;
    totalImpressions += Number(m.impressions) || 0;
    totalClicks += Number(m.clicks) || 0;
    totalLeads += Number(m.leads) || 0;
    totalConversions += Number(m.conversions) || 0;
  });

  const ctr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;
  const cpc = totalClicks > 0 ? Number((totalSpend / totalClicks).toFixed(2)) : 0;
  const cpl = totalLeads > 0 ? Number((totalSpend / totalLeads).toFixed(2)) : 0;
  const convRate = totalLeads > 0 ? Number(((totalConversions / totalLeads) * 100).toFixed(2)) : 0;
  const cac = totalConversions > 0 ? Number((totalSpend / totalConversions).toFixed(2)) : 0;
  const roas = totalSpend > 0 ? Number((totalRevenue / totalSpend).toFixed(2)) : 0;
  const roi = totalSpend > 0 ? Number((((totalRevenue - totalSpend) / totalSpend) * 100).toFixed(2)) : 0;

  const platforms = ['Instagram', 'Facebook', 'Google Ads', 'YouTube', 'LinkedIn'];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Multi-Dimensional Marketing Analytics</h2>
          <p className="text-xs text-slate-500">
            Slice and analyze campaign profitability, customer acquisition costs, channel yield, and unit economics
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mr-2">
          <Filter className="w-3.5 h-3.5 text-indigo-600" />
          <span>Analytics Slicer:</span>
        </div>

        {/* Client filter */}
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none"
        >
          <option value="all">All Clients</option>
          {clients.map((cl) => (
            <option key={cl.id} value={cl.id}>
              {cl.business_name}
            </option>
          ))}
        </select>

        {/* Campaign filter */}
        <select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none"
        >
          <option value="all">All Campaigns</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.campaign_name}
            </option>
          ))}
        </select>

        {/* Platform filter */}
        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none"
        >
          <option value="all">All Platforms</option>
          {platforms.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setSelectedClient('all');
            setSelectedCampaign('all');
            setSelectedPlatform('all');
          }}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 ml-auto"
        >
          Reset Filters
        </button>
      </div>

      {/* Primary Unit Economics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Spend</span>
          <span className="text-lg font-bold font-mono text-slate-900 mt-1 block tabular-nums">
            ₹{totalSpend.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Filtered Slice</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Revenue</span>
          <span className="text-lg font-bold font-mono text-emerald-600 mt-1 block tabular-nums">
            ₹{totalRevenue.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-700 font-medium font-mono">ROAS: {roas}x</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">CTR</span>
          <span className="text-lg font-bold font-mono text-indigo-600 mt-1 block tabular-nums">
            {ctr}%
          </span>
          <span className="text-[10px] text-slate-500 font-mono">{totalClicks} Clicks</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">CPC</span>
          <span className="text-lg font-bold font-mono text-slate-900 mt-1 block tabular-nums">
            ₹{cpc}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Per Click Cost</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">CPL</span>
          <span className="text-lg font-bold font-mono text-purple-700 mt-1 block tabular-nums">
            ₹{cpl}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">{totalLeads} Leads</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">CAC</span>
          <span className="text-lg font-bold font-mono text-slate-900 mt-1 block tabular-nums">
            ₹{cac}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">{totalConversions} Orders</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Net ROI</span>
          <span className="text-lg font-bold font-mono text-emerald-600 mt-1 block tabular-nums">
            +{roi}%
          </span>
          <span className="text-[10px] text-emerald-700 font-mono font-medium">Profit Margin</span>
        </div>
      </div>

      {/* Sliced Observations Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Attributed Daily Records ({filtered.length} entries matched)
          </h3>
          <span className="text-xs text-slate-500 font-mono">PostgreSQL DQL Query Result</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Campaign</th>
                <th className="px-5 py-3 text-right">Spend</th>
                <th className="px-5 py-3 text-right">Impressions</th>
                <th className="px-5 py-3 text-right">Clicks</th>
                <th className="px-5 py-3 text-right">CTR</th>
                <th className="px-5 py-3 text-right">Leads</th>
                <th className="px-5 py-3 text-right">CPL</th>
                <th className="px-5 py-3 text-right">Conversions</th>
                <th className="px-5 py-3 text-right">Revenue</th>
                <th className="px-5 py-3 text-right">ROAS</th>
                <th className="px-5 py-3 text-right">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-5 py-8 text-center text-slate-400">
                    No metric records found matching selected filter combination.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-600 whitespace-nowrap">
                      {m.metric_date?.slice(0, 10)}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                      {m.campaign_name || 'Campaign #' + m.campaign_id}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono tabular-nums text-slate-900 whitespace-nowrap">
                      ₹{Number(m.advertising_spend).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                      {Number(m.impressions).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                      {Number(m.clicks).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono tabular-nums text-indigo-600 font-semibold whitespace-nowrap">
                      {m.ctr}%
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono tabular-nums text-slate-900 whitespace-nowrap">
                      {m.leads}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                      ₹{m.cpl}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono tabular-nums text-slate-900 whitespace-nowrap">
                      {m.conversions}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono tabular-nums font-semibold text-emerald-600 whitespace-nowrap">
                      ₹{Number(m.revenue).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono tabular-nums font-bold text-blue-600 whitespace-nowrap">
                      {m.roas}x
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono tabular-nums text-emerald-700 whitespace-nowrap">
                      +{m.roi}%
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
