import React from 'react';
import {
  Users,
  Megaphone,
  IndianRupee,
  UserCheck,
  Award,
  TrendingUp,
  Target,
  BarChart2,
} from 'lucide-react';

interface DashboardViewProps {
  data: any;
  onNavigate: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ data, onNavigate }) => {
  const kpis = data?.kpis || {
    totalClients: 0,
    activeCampaigns: 0,
    totalCampaignSpend: 0,
    totalLeads: 0,
    totalConversions: 0,
    totalRevenue: 0,
    averageCPL: 0,
    averageROAS: 0,
    averageCTR: 0,
    averageCPC: 0,
    averageROI: 0,
  };

  const platforms = data?.platforms || [];
  const monthlyTrends = data?.monthlyTrends || [];

  const maxRevenue = Math.max(...monthlyTrends.map((t: any) => t.revenue || 1), 1);
  const totalPlatformLeads = platforms.reduce((acc: number, p: any) => acc + (p.leads || 0), 0) || 1;

  return (
    <div className="space-y-6">
      {/* 8 Core MCA Academic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Clients */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Clients
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {kpis.totalClients}
          </div>
          <div className="mt-1 text-xs text-slate-500">Active Retainers Managed</div>
        </div>

        {/* Card 2: Active Campaigns */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Campaigns
            </span>
            <Megaphone className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-600 font-mono tabular-nums">
            {kpis.activeCampaigns}
          </div>
          <div className="mt-1 text-xs text-slate-500">Running Across 5 Ad Networks</div>
        </div>

        {/* Card 3: Total Campaign Spend */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Ad Spend
            </span>
            <IndianRupee className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            ₹{Number(kpis.totalCampaignSpend).toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Avg CPC: <span className="font-mono text-slate-700">₹{kpis.averageCPC}</span>
          </div>
        </div>

        {/* Card 4: Total Revenue */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 font-mono tabular-nums">
            ₹{Number(kpis.totalRevenue).toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-emerald-700 font-medium">
            ROI: <span className="font-mono">+{kpis.averageROI}%</span>
          </div>
        </div>

        {/* Card 5: Total Leads */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Leads
            </span>
            <UserCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {kpis.totalLeads}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            CTR: <span className="font-mono text-slate-700">{kpis.averageCTR}%</span>
          </div>
        </div>

        {/* Card 6: Total Conversions */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Conversions
            </span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {kpis.totalConversions}
          </div>
          <div className="mt-1 text-xs text-slate-500">Closed Sales & Signups</div>
        </div>

        {/* Card 7: Average CPL */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Average CPL
            </span>
            <Target className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-700 font-mono tabular-nums">
            ₹{kpis.averageCPL}
          </div>
          <div className="mt-1 text-xs text-slate-500">Cost Per Acquired Lead</div>
        </div>

        {/* Card 8: Average ROAS */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Average ROAS
            </span>
            <BarChart2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-600 font-mono tabular-nums">
            {kpis.averageROAS}x
          </div>
          <div className="mt-1 text-xs text-slate-500">Return on Advertising Spend</div>
        </div>
      </div>

      {/* Two Column Section: Monthly Trends Chart & Platform Share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Monthly Marketing Spend vs Revenue Performance Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Monthly Ad Spend vs Attributed Revenue</h2>
              <p className="text-xs text-slate-500">Comparative revenue growth vs media spend trajectory</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-400"></span> Spend
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Revenue
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {monthlyTrends.map((m: any, idx: number) => {
              const spendWidth = Math.min(100, Math.round((m.spend / maxRevenue) * 100));
              const revWidth = Math.min(100, Math.round((m.revenue / maxRevenue) * 100));
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{m.month}</span>
                    <span className="font-mono text-slate-600">
                      Spend: ₹{m.spend.toLocaleString()} · <span className="text-emerald-700 font-semibold">Rev: ₹{m.revenue.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="space-y-1">
                    {/* Revenue Bar */}
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${revWidth}%` }}
                      ></div>
                    </div>
                    {/* Spend Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-slate-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${spendWidth}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Leads by Platform */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Leads by Advertising Platform</h2>
            <p className="text-xs text-slate-500">Share of inbound prospect acquisition</p>

            <div className="mt-5 space-y-3">
              {platforms.map((p: any, idx: number) => {
                const share = Math.round((p.leads / totalPlatformLeads) * 100);
                const colors = ['bg-indigo-600', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-600', 'bg-rose-500'];
                const color = colors[idx % colors.length];

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-800">{p.platform}</span>
                      <span className="font-mono text-slate-600">
                        {p.leads} leads ({share}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`${color} h-full rounded-full`} style={{ width: `${share}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onNavigate('analytics')}
            className="mt-6 w-full py-2 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-center"
          >
            Open Comprehensive Analytics →
          </button>
        </div>
      </div>

      {/* Platform Performance Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Platform Performance & Efficiency Breakdown</h2>
            <p className="text-xs text-slate-500">Aggregated channel spend, revenue return, and acquisition economics</p>
          </div>
          <button
            onClick={() => onNavigate('campaign-comparison')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Compare Individual Campaigns →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Platform</th>
                <th className="px-5 py-3 text-right">Ad Spend</th>
                <th className="px-5 py-3 text-right">Revenue</th>
                <th className="px-5 py-3 text-right">Leads</th>
                <th className="px-5 py-3 text-right">Conversions</th>
                <th className="px-5 py-3 text-right">Conv. Rate</th>
                <th className="px-5 py-3 text-right">CPL</th>
                <th className="px-5 py-3 text-right">ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {platforms.map((p: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-900">{p.platform}</td>
                  <td className="px-5 py-3.5 text-right font-mono tabular-nums text-slate-800">
                    ₹{Number(p.spend).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono tabular-nums font-semibold text-emerald-600">
                    ₹{Number(p.revenue).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono tabular-nums text-slate-800">
                    {p.leads}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono tabular-nums text-slate-800">
                    {p.conversions}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono tabular-nums text-slate-700">
                    {p.convRate}%
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono tabular-nums text-slate-800">
                    ₹{p.cpl}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono tabular-nums font-bold text-indigo-600">
                    {p.roas}x
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
