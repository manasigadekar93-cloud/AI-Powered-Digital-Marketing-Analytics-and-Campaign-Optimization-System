import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FileText, Printer, Download, Eye, CheckCircle2 } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [reportType, setReportType] = useState('campaign_performance');
  const [selectedCampaign, setSelectedCampaign] = useState(1);
  const [selectedClient, setSelectedClient] = useState(1);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.getCampaigns(), api.getClients()]).then(([cRes, clRes]) => {
      setCampaigns(cRes.data);
      setClients(clRes.data);
    });
    handleGenerate();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await api.generateReport({
        report_type: reportType,
        campaign_id: selectedCampaign,
        client_id: selectedClient,
      });
      setReport(res.report);
    } catch (err: any) {
      alert(err.message || 'Report generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!report) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      encodeURIComponent(
        `Report Title,${report.title}\nReport Type,${report.type}\nGenerated At,${report.generatedAt}\nSummary,"${report.data.summary}"\n`
      );
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `${report.id}_marketing_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Executive Report Generator</h2>
          <p className="text-xs text-slate-500">
            Generate printable audit reports, client marketing summaries, and cross-channel efficiency analyses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={!report}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            disabled={!report}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Report Generator Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Report Template:</span>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none"
          >
            <option value="campaign_performance">Campaign Performance Audit</option>
            <option value="client_marketing">Client Retainer Summary</option>
            <option value="platform_performance">Omnichannel Platform Efficiency</option>
            <option value="monthly_audit">Monthly Agency Audit</option>
          </select>
        </div>

        {reportType === 'campaign_performance' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Target Campaign:</span>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(parseInt(e.target.value, 10))}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.campaign_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {reportType === 'client_marketing' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Target Client:</span>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(parseInt(e.target.value, 10))}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none"
            >
              {clients.map((cl) => (
                <option key={cl.id} value={cl.id}>
                  {cl.business_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="ml-auto px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
        >
          {loading ? 'Compiling...' : 'Generate Report'}
        </button>
      </div>

      {/* Rendered Printable Report Container */}
      {report && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-3">
            <div>
              <div className="text-[11px] font-mono text-indigo-600 font-bold uppercase tracking-wider">
                Digital Marketing Analytics System · Report Ref: {report.id}
              </div>
              <h1 className="text-xl font-bold text-slate-900 mt-1">{report.title}</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit Period: {report.period} · Prepared by: {report.generatedBy}
              </p>
            </div>
            <div className="text-right text-xs text-slate-400 font-mono">
              Generated: {new Date(report.generatedAt).toLocaleString()}
            </div>
          </div>

          {/* Performance Summary Narrative */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Executive Evaluation Summary
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {report.data?.summary}
            </p>
          </div>

          {/* Key KPI Breakdown for Campaign */}
          {report.data?.kpis && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Audited Performance Key Performance Indicators
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-center">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Ad Spend</span>
                  <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                    ₹{Number(report.data.kpis.spend).toLocaleString()}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Revenue</span>
                  <span className="text-base font-bold font-mono text-emerald-600 tabular-nums">
                    ₹{Number(report.data.kpis.revenue).toLocaleString()}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Total Leads</span>
                  <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                    {report.data.kpis.leads}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">CPL</span>
                  <span className="text-base font-bold font-mono text-purple-700 tabular-nums">
                    ₹{report.data.kpis.cpl}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">ROAS</span>
                  <span className="text-base font-bold font-mono text-blue-600 tabular-nums">
                    {report.data.kpis.roas}x
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Net ROI</span>
                  <span className="text-base font-bold font-mono text-emerald-600 tabular-nums">
                    +{report.data.kpis.roi}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Platform Performance Table in Report */}
          {report.data?.platforms && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Cross-Platform Distribution & Unit Efficiency
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 font-semibold text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Platform</th>
                      <th className="px-4 py-2.5 text-right">Spend</th>
                      <th className="px-4 py-2.5 text-right">Revenue</th>
                      <th className="px-4 py-2.5 text-right">Leads</th>
                      <th className="px-4 py-2.5 text-right">CPL</th>
                      <th className="px-4 py-2.5 text-right">ROAS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.data.platforms.map((p: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-4 py-2.5 font-medium text-slate-900">{p.platform}</td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums">₹{p.spend.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums font-semibold text-emerald-600">
                          ₹{p.revenue.toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums">{p.leads}</td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums">₹{p.cpl}</td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums font-bold text-indigo-600">
                          {p.roas}x
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer Sign-off */}
          <div className="border-t border-slate-200 pt-6 flex justify-between text-[11px] text-slate-400">
            <div>AI-Powered Digital Marketing Analytics and Campaign Optimization System</div>
            <div>Department of Computer Applications · MCA Academic Project</div>
          </div>
        </div>
      )}
    </div>
  );
};
