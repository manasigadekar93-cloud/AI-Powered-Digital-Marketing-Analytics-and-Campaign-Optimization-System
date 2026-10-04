import React from 'react';
import { NavTab } from './Sidebar';
import { RefreshCw, PlusCircle, Database } from 'lucide-react';

interface TopBarProps {
  activeTab: NavTab;
  onRefresh: () => void;
  onOpenDataModal: () => void;
  dbMode: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onRefresh,
  onOpenDataModal,
  dbMode,
}) => {
  const titles: Record<NavTab, string> = {
    dashboard: 'Agency Performance Dashboard',
    clients: 'Client Management System',
    campaigns: 'Omnichannel Campaigns',
    'marketing-data': 'Marketing Data & Automated KPIs',
    leads: 'Lead Management & Funnel',
    analytics: 'Multi-Dimension Marketing Analytics',
    'campaign-comparison': 'Cross-Campaign Performance Matrix',
    'ai-insights': 'AI Econometric Insights & Budget Optimizer',
    recommendations: 'Rule-Based Campaign Recommendation Engine',
    reports: 'Executive Marketing Reports Generator',
    database: 'PostgreSQL Local Database Status',
    'mca-viva': 'Academic MCA Viva & System Architecture Hub',
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      {/* Zone 1: Single title element */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold tracking-tight text-slate-900 truncate">
          {titles[activeTab] || 'Marketing Analytics'}
        </h1>
        <span className="hidden sm:inline-block text-slate-300">·</span>
        <span className="hidden sm:inline-flex items-center text-xs text-slate-500 font-mono">
          <Database className="w-3 h-3 mr-1 text-slate-400" />
          {dbMode}
        </span>
      </div>

      {/* Zone 2: Informational / context indicator */}
      <div className="hidden md:flex items-center gap-5 text-xs text-slate-500">
        <span>MCA Capstone Project</span>
        <span aria-hidden="true">·</span>
        <span>Node.js / Express REST API</span>
        <span aria-hidden="true">·</span>
        <span>PostgreSQL-Ready</span>
      </div>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onRefresh}
          title="Refresh dataset from backend"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 text-xs flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sync Data</span>
        </button>
        <button
          onClick={onOpenDataModal}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Record Daily Metrics</span>
        </button>
      </div>
    </header>
  );
};
