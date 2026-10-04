import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Sparkles, BrainCircuit, Sliders, AlertCircle, TrendingUp, Info } from 'lucide-react';

export const AIInsightsView: React.FC = () => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [totalBudget, setTotalBudget] = useState(150000);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const res = await api.getAIInsights();
      setInsights(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const handleRunOptimizer = async () => {
    setOptimizing(true);
    try {
      const res = await api.optimizeBudget(totalBudget);
      setInsights((prev: any) => ({
        ...prev,
        budgetRecommendations: res.data,
        executiveSummary: res.summary || prev?.executiveSummary,
      }));
    } catch (err: any) {
      alert(err.message || 'Optimization failed');
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              AI Econometric Insights & Budget Allocation
            </h2>
            <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
              {insights?.source || 'Gemini / Heuristic Engine'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Synthesized human-readable natural language insights and algorithmic capital distribution models
          </p>
        </div>

        <button
          onClick={loadInsights}
          disabled={loading}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Synthesizing Data...' : 'Re-Analyze Insights'}</span>
        </button>
      </div>

      {/* Executive Summary Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-sm text-slate-900">Executive Performance Briefing</h3>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium">
          {insights?.executiveSummary ||
            'Analyzing cross-platform campaign returns. Google Ads and Instagram lead acquisition velocity currently outperform baseline targets with optimal ROAS multiplier.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-3.5 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Detected Friction / Anomaly</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-normal">
              {insights?.anomalyDetected ||
                'Meta platforms (Facebook/Instagram) showing high initial click volume with an 18% lag in sales conversion speed.'}
            </p>
          </div>

          <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Recommended Scale Action</span>
            </div>
            <p className="text-[11px] text-emerald-900 leading-normal">
              {insights?.scalingRecommendation ||
                'Gradually scale high-intent Google Search and top-tier LinkedIn ads by 25% to maximize qualified deal closures.'}
            </p>
          </div>
        </div>

        {/* Risk factors list */}
        {insights?.riskFactors && insights.riskFactors.length > 0 && (
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-800 block mb-2">Identified Portfolio Risks:</span>
            <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
              {insights.riskFactors.map((r: string, idx: number) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Budget Optimization Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Algorithmic Budget Allocation Recommender</h3>
            <p className="text-xs text-slate-500">
              Predictive allocation optimizing marginal ROAS and minimizing blended Cost Per Lead
            </p>
          </div>

          {/* Budget Simulator Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Available Budget:</span>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-900">
                ₹{Number(totalBudget).toLocaleString()}
              </div>
            </div>
            <button
              onClick={handleRunOptimizer}
              disabled={optimizing}
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              {optimizing ? 'Calculating...' : 'Recalculate Split'}
            </button>
          </div>
        </div>

        {/* Slider Input */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500 font-mono">
            <span>₹50,000</span>
            <span>Target: ₹{Number(totalBudget).toLocaleString()}</span>
            <span>₹5,00,000</span>
          </div>
          <input
            type="range"
            min="50000"
            max="500000"
            step="10000"
            value={totalBudget}
            onChange={(e) => setTotalBudget(parseInt(e.target.value, 10))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        {/* Allocation Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights?.budgetRecommendations?.map((b: any, idx: number) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{b.platform}</span>
                  <span className="text-xs font-bold text-indigo-600 font-mono">
                    {b.percentageShare}% Share
                  </span>
                </div>

                <div className="mt-2 text-xl font-bold font-mono text-slate-900 tabular-nums">
                  ₹{Number(b.recommendedSpend).toLocaleString()}
                </div>

                <div className="mt-2 text-xs text-slate-600 space-y-0.5 font-mono">
                  <div>Est. Return: ₹{Number(b.expectedRevenue).toLocaleString()}</div>
                  <div>Est. Inbound Leads: ~{b.expectedLeads}</div>
                </div>

                <p className="mt-3 text-[11px] text-slate-500 leading-normal border-t border-slate-200/60 pt-2">
                  {b.rationale}
                </p>
              </div>

              <div className="text-[10px] text-slate-400 font-mono text-right">
                Current Spend: ₹{Number(b.currentSpend).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Academic Legal Disclaimer */}
        <div className="flex items-start gap-2 p-3 bg-slate-100 rounded-lg text-[11px] text-slate-500">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            <strong>Academic Note:</strong> These budget recommendations are algorithmic estimates produced by
            the system's econometric heuristic regression model based on historical campaign returns, not
            guaranteed financial outcomes.
          </span>
        </div>
      </div>
    </div>
  );
};
