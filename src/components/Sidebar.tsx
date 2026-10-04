import React from 'react';
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Database,
  UserCheck,
  BarChart3,
  GitCompare,
  Sparkles,
  Lightbulb,
  FileText,
  Server,
  GraduationCap,
  LogOut,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'clients'
  | 'campaigns'
  | 'marketing-data'
  | 'leads'
  | 'analytics'
  | 'campaign-comparison'
  | 'ai-insights'
  | 'recommendations'
  | 'reports'
  | 'database'
  | 'mca-viva';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onLogout: () => void;
  user: any;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
  user,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'clients', label: 'Clients', icon: <Users className="w-4 h-4" /> },
    { id: 'campaigns', label: 'Campaigns', icon: <Megaphone className="w-4 h-4" /> },
    { id: 'marketing-data', label: 'Marketing Data', icon: <Database className="w-4 h-4" /> },
    { id: 'leads', label: 'Leads & Funnel', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'campaign-comparison', label: 'Campaign Comparison', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'ai-insights', label: 'AI Insights', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'recommendations', label: 'Recommendations', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'database', label: 'PostgreSQL DB', icon: <Server className="w-4 h-4" /> },
    { id: 'mca-viva', label: 'MCA Viva & Project Hub', icon: <GraduationCap className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800 gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
          Δ
        </div>
        <div className="truncate">
          <div className="font-semibold text-sm text-white tracking-tight truncate">
            OmniMark System
          </div>
          <div className="text-[11px] text-slate-400 truncate">MCA Academic Analytics</div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.role || 'admin'} · Localhost</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
