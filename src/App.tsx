import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/DashboardView';
import { ClientsView } from './components/ClientsView';
import { CampaignsView } from './components/CampaignsView';
import { MarketingDataView } from './components/MarketingDataView';
import { LeadsView } from './components/LeadsView';
import { AnalyticsView } from './components/AnalyticsView';
import { CampaignComparisonView } from './components/CampaignComparisonView';
import { AIInsightsView } from './components/AIInsightsView';
import { RecommendationsView } from './components/RecommendationsView';
import { ReportsView } from './components/ReportsView';
import { DatabaseHubView } from './components/DatabaseHubView';
import { MCAVivaHubView } from './components/MCAVivaHubView';
import { LoginModal } from './components/LoginModal';
import { api } from './services/api';

export default function App() {
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('mca_admin_user');
    return saved ? JSON.parse(saved) : { id: 1, name: 'System Administrator', email: 'admin@marketing.com', role: 'admin' };
  });

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [overviewData, setOverviewData] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadInitialData = async () => {
    try {
      // Ensure token exists on first run
      let token = localStorage.getItem('mca_admin_jwt_token');
      if (!token) {
        const loginRes = await api.login({ email: 'admin@marketing.com', password: 'admin123' });
        localStorage.setItem('mca_admin_jwt_token', loginRes.token);
        localStorage.setItem('mca_admin_user', JSON.stringify(loginRes.user));
        setUser(loginRes.user);
      }

      const [ovRes, dbRes] = await Promise.all([
        api.getOverview(),
        api.getDatabaseStatus(),
      ]);
      setOverviewData(ovRes.data);
      setDbStatus(dbRes.status);
    } catch (err) {
      console.warn('Initial data load warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleLoginSuccess = (userData: any, token: string) => {
    setUser(userData);
    localStorage.setItem('mca_admin_user', JSON.stringify(userData));
    setIsLoggedOut(false);
    loadInitialData();
  };

  const handleLogout = () => {
    localStorage.removeItem('mca_admin_jwt_token');
    localStorage.removeItem('mca_admin_user');
    setIsLoggedOut(true);
  };

  const handleOpenDataEntry = () => {
    setActiveTab('marketing-data');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans antialiased text-slate-900">
      {/* Admin Login Modal if logged out */}
      {isLoggedOut && <LoginModal onLoginSuccess={handleLoginSuccess} />}

      {/* Primary Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        user={user}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopBar
          activeTab={activeTab}
          onRefresh={loadInitialData}
          onOpenDataModal={handleOpenDataEntry}
          dbMode={dbStatus?.mode || 'PostgreSQL Engine'}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView data={overviewData} onNavigate={(tab) => setActiveTab(tab)} />
            )}
            {activeTab === 'clients' && <ClientsView />}
            {activeTab === 'campaigns' && <CampaignsView />}
            {activeTab === 'marketing-data' && <MarketingDataView />}
            {activeTab === 'leads' && <LeadsView />}
            {activeTab === 'analytics' && <AnalyticsView />}
            {activeTab === 'campaign-comparison' && <CampaignComparisonView />}
            {activeTab === 'ai-insights' && <AIInsightsView />}
            {activeTab === 'recommendations' && <RecommendationsView />}
            {activeTab === 'reports' && <ReportsView />}
            {activeTab === 'database' && <DatabaseHubView />}
            {activeTab === 'mca-viva' && <MCAVivaHubView />}
          </div>
        </main>
      </div>
    </div>
  );
}
