import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { GitCompare, Award, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const CampaignComparisonView: React.FC = () => {
  const [comparisonList, setComparisonList] = useState<any[]>([]);
  const [benchmarks, setBenchmarks] = useState<any>({});
  const [allCampaigns, setAllCampaigns] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([1, 2, 3, 4]);
  const [loading, setLoading] = useState(false);

  const loadData = async (ids?: number[]) => {
    setLoading(true);
    try {
      const res = await api.getComparison(ids || selectedIds);
      setComparisonList(res.data);
      setBenchmarks(res.benchmarks);
      setAllCampaigns(res.allCampaigns);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleCampaignSelection = (id: number) => {
    let next: number[];
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 2) {
        alert('Please keep at least 2 campaigns selected for comparative analysis.');
        return;
      }
      next = selectedIds.filter((item) => item !== id);
    } else {
      next = [...selectedIds, id];
    }
    setSelectedIds(next);
    loadData(next);
  };

  // Helper to color-code strongest vs weakest metric across selected campaigns
  const getMetricHighlight = (key: string, value: number) => {
    const bench = benchmarks[key];
    if (!bench || comparisonList.length < 2) return '';

    const isBest =
      bench.best === 'low'
        ? value === bench.min && value > 0
        : value === bench.max && value > 0;

    const isWorst =
      bench.best === 'low'
        ? value === bench.max && bench.max > bench.min
        : value === bench.min && bench.max > bench.min;

    if (isBest) {
      return 'bg-emerald-50 text-emerald-800 font-bold';
    }
    if (isWorst) {
      return 'bg-rose-50 text-rose-800 font-medium';
    }
    return 'text-slate-800';
  };

  const metricKeys = [
    { key: 'budget', label: 'Allocated Budget', prefix: '₹', format: 'currency' },
    { key: 'spend', label: 'Ad Spend Utilized', prefix: '₹', format: 'currency' },
    { key: 'revenue', label: 'Attributed Revenue', prefix: '₹', format: 'currency' },
    { key: 'impressions', label: 'Total Impressions', prefix: '', format: 'number' },
    { key: 'reach', label: 'Audience Reach', prefix: '', format: 'number' },
    { key: 'clicks', label: 'Ad Clicks', prefix: '', format: 'number' },
    { key: 'ctr', label: 'Click-Through Rate (CTR)', prefix: '', suffix: '%', format: 'decimal' },
    { key: 'cpc', label: 'Cost Per Click (CPC)', prefix: '₹', format: 'decimal', isLowerBetter: true },
    { key: 'leads', label: 'Total Leads Captured', prefix: '', format: 'number' },
    { key: 'cpl', label: 'Cost Per Lead (CPL)', prefix: '₹', format: 'decimal', isLowerBetter: true },
    { key: 'conversions', label: 'Final Conversions', prefix: '', format: 'number' },
    { key: 'conversionRate', label: 'Lead-to-Order Conv Rate', prefix: '', suffix: '%', format: 'decimal' },
    { key: 'roas', label: 'Return on Ad Spend (ROAS)', prefix: '', suffix: 'x', format: 'decimal' },
    { key: 'roi', label: 'Return on Investment (ROI)', prefix: '+', suffix: '%', format: 'decimal' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Cross-Campaign Comparative Matrix</h2>
          <p className="text-xs text-slate-500">
            Multi-attribute evaluation matrix with automated identification of strongest and weakest operational metrics
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-emerald-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Strongest Performer
          </span>
          <span className="flex items-center gap-1 text-rose-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span> Weakest / Friction Point
          </span>
        </div>
      </div>

      {/* Campaign Selector Pills */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
        <span className="text-xs font-semibold text-slate-700 block">
          Select Campaigns to Compare (Min 2):
        </span>
        <div className="flex flex-wrap gap-2">
          {allCampaigns.map((camp) => {
            const isSelected = selectedIds.includes(camp.id);
            return (
              <button
                key={camp.id}
                onClick={() => toggleCampaignSelection(camp.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{camp.name}</span>
                <span className="text-[10px] opacity-75 font-mono">({camp.platform})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3.5 font-bold text-slate-900 w-60">Metric Attribute</th>
                {comparisonList.map((c) => (
                  <th key={c.id} className="px-5 py-3.5 text-right font-bold text-slate-900 min-w-[160px]">
                    <div>{c.name}</div>
                    <div className="text-[11px] font-normal text-slate-500 font-mono">
                      {c.platform} · {c.status}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metricKeys.map((item) => (
                <tr key={item.key} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <span>{item.label}</span>
                      {item.isLowerBetter && (
                        <span className="text-[10px] text-slate-400 font-normal">(lower is better)</span>
                      )}
                    </div>
                  </td>
                  {comparisonList.map((c) => {
                    const rawVal = c[item.key] || 0;
                    const highlightClass = getMetricHighlight(item.key, rawVal);

                    let formatted = rawVal.toLocaleString();
                    if (item.format === 'currency') formatted = `${item.prefix}${Number(rawVal).toLocaleString()}`;
                    if (item.format === 'decimal') formatted = `${item.prefix || ''}${rawVal}${item.suffix || ''}`;

                    return (
                      <td
                        key={c.id}
                        className={`px-5 py-3 text-right font-mono tabular-nums ${highlightClass}`}
                      >
                        {formatted}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
