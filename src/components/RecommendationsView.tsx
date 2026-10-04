import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Lightbulb, RefreshCw, Check, X, ShieldAlert, Zap, AlertTriangle } from 'lucide-react';

export const RecommendationsView: React.FC = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getRecommendations({
        priority: priorityFilter,
        status: statusFilter,
      });
      setRecommendations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [priorityFilter, statusFilter]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await api.generateRecommendations();
      alert(res.message);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await api.updateRecommendationStatus(id, newStatus);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Rule-Based Campaign Recommendation Engine</h2>
          <p className="text-xs text-slate-500">
            Automated programmatic auditing of CTR, CPC, CPL, Conversion Rates, and ROAS against industry performance thresholds
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Execute Rule Evaluator</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="Opportunity">Opportunity</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Applied">Applied</option>
            <option value="Dismissed">Dismissed</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          {recommendations.length} Active System Recommendations
        </span>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.length === 0 ? (
          <div className="col-span-2 p-8 text-center bg-white border border-slate-200 rounded-xl text-slate-400">
            No recommendations pending. Click "Execute Rule Evaluator" to re-audit all campaigns.
          </div>
        ) : (
          recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`p-5 bg-white border rounded-xl shadow-xs space-y-3 flex flex-col justify-between ${
                rec.priority === 'Opportunity'
                  ? 'border-emerald-200'
                  : rec.priority === 'High'
                  ? 'border-rose-200'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 font-mono">
                    {rec.campaignName || 'Campaign #' + rec.campaign_id}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      rec.priority === 'Opportunity'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : rec.priority === 'High'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {rec.priority}
                  </span>
                </div>

                <div className="mt-2 text-xs font-semibold text-indigo-700">
                  {rec.recommendation_type}
                </div>

                <p className="mt-1 text-xs font-bold text-slate-900 leading-snug">
                  {rec.message}
                </p>

                <div className="mt-2 p-3 bg-slate-50 border border-slate-100 rounded-lg text-[11px] text-slate-600 leading-normal">
                  <strong className="text-slate-800">Rule Trigger: </strong>
                  {rec.reason}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="text-[11px] text-slate-400 font-mono">
                  Status: <strong className="text-slate-700">{rec.status}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {rec.status === 'Pending' ? (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(rec.id, 'Applied')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        <span>Apply</span>
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(rec.id, 'Dismissed')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors"
                      >
                        <X className="w-3 h-3" />
                        <span>Dismiss</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleStatusUpdate(rec.id, 'Pending')}
                      className="text-[11px] text-indigo-600 hover:underline"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
