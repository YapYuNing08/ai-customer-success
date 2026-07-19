import { useState } from 'react';
import { LayoutDashboard, Users, FileText, Bell } from 'lucide-react';
import type { ActiveUser } from '../../utils/mockData';
import type { Report } from '../../types';
import { buildRescuePlanReport } from '../../utils/reports';
import { ReportSuccessModal } from '../../components/modals/ReportSuccessModal';
import { OutageAlertModal } from '../../components/modals/OutageAlertModal';
import { DashboardTab } from './DashboardTab';
import { CustomersTab } from './CustomersTab';
import { ReportsTab } from './ReportsTab';

export function ConsolePage(props: any) {
  const { users, setUsers, telemetryFeed, setTelemetryFeed, isSimulating, setIsSimulating, outageRate, setOutageRate, billingFailureRate, setBillingFailureRate, addTelemetry, handleUpdateUser, dist, expScore, expLabel } = props;

  const [consoleTab, setConsoleTab] = useState<'dashboard' | 'customers' | 'reports'>('dashboard');
  const [selectedConsoleUser, setSelectedConsoleUser] = useState<ActiveUser | null>(null);
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOutageAlertModal, setShowOutageAlertModal] = useState(false);

  const [reportModalData, setReportModalData] = useState<{
    isOpen: boolean;
    reportName: string;
    distressedCount: number;
    report: Report | null;
  }>({
    isOpen: false,
    reportName: '',
    distressedCount: 0,
    report: null
  });

  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      name: 'Q2 Churn Risk & Rescue Assessment',
      type: 'AI Analysis',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Active',
      content: `# Q2 Churn Risk & Rescue Assessment\n\nGenerated on: ${new Date().toLocaleDateString()}\n\n## Portfolio Summary\n- Average Health: 78/100\n- Critical Alerts: 2\n- Monthly Recurring Revenue: RM25,000/mo\n\n## Action Items\nGenerate a live rescue report to get custom CSM recommendations.`
    },
    {
      id: '2',
      name: 'Daily Telemetry & Outage Impact Log',
      type: 'System Event',
      date: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Active',
      content: `# Daily Telemetry & Outage Impact Log\n\nGenerated on: ${new Date(Date.now() - 86400000).toLocaleDateString()}\n\n## Incident Summary\n- System outages tracked: 12\n- Average response latency: 24ms\n- SLA compliance: 99.98%`
    },
    {
      id: '3',
      name: 'Enterprise Account Review (Top 10)',
      type: 'CSM Summary',
      date: new Date(Date.now() - 259200000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Active',
      content: `# Enterprise Account Review (Top 10)\n\nGenerated on: ${new Date(Date.now() - 259200000).toLocaleDateString()}\n\n## Executive Review\nReview of top 10 high-value subscription contracts. All growth plans operating with optimal usage velocity except for select distressed instances.`
    },
    {
      id: '4',
      name: 'Failed Invoices & Extension Audit',
      type: 'Billing Report',
      date: new Date(Date.now() - 518400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Archived',
      content: `# Failed Invoices & Extension Audit\n\nGenerated on: ${new Date(Date.now() - 518400000).toLocaleDateString()}\n\n## Billing Summary\nAudit of failed credit card renewals. Recommending grace extensions to prevent involuntary churn on Starter and Growth tier accounts.`
    }
  ]);

  const filteredConsoleUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
                          u.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          u.location.toLowerCase().includes(customerSearch.toLowerCase());
    const matchesPlan = filterPlan === 'all' || u.plan.toLowerCase() === filterPlan.toLowerCase();
    const matchesRisk = filterRisk === 'all' || 
                        (filterRisk === 'high' && u.churnProbability > 50) ||
                        (filterRisk === 'medium' && u.churnProbability <= 50 && u.churnProbability > 15) ||
                        (filterRisk === 'low' && u.churnProbability <= 15);
    return matchesSearch && matchesPlan && matchesRisk;
  });

  const generateReport = (type: 'rescue_plan' | 'telemetry' | 'performance' | 'billing') => {
    let reportName = '';
    let content = '';
    let distressedCount = 0;
    let reportType = '';

    if (type === 'rescue_plan') {
      const res = buildRescuePlanReport(users);
      setReports(prev => [res.report, ...prev]);
      setReportModalData({ isOpen: true, reportName: res.report.name, distressedCount: res.distressedCount, report: res.report });
      return;
    } else if (type === 'telemetry') {
      reportName = 'Daily Telemetry & Outage Audit';
      reportType = 'System Event';
      content = `# Daily Telemetry & Outage Audit\n\nGenerated on: ${new Date().toLocaleDateString()}\n\n## Network Summary\n- Server Latency: 24ms (Optimal)\n- SLA Compliance: 99.99%\n- Regional Outage Risks: None detected.`;
    } else if (type === 'performance') {
      reportName = 'Enterprise Account Performance Review';
      reportType = 'CSM Summary';
      content = `# Enterprise Account Performance Review\n\nGenerated on: ${new Date().toLocaleDateString()}\n\n## Portfolio Growth\n- Top Account Growth: +15% usage velocity\n- Account Stability: 92% of enterprise users active\n- Action items: No immediate upgrades required.`;
    } else {
      reportName = 'Billing & Invoice Extension Audit';
      reportType = 'Billing Report';
      content = `# Billing & Invoice Extension Audit\n\nGenerated on: ${new Date().toLocaleDateString()}\n\n## Credit Card Renewals\n- Renewal failures: 2 starter accounts\n- Grace periods extended: 2 accounts\n- Impact: Churn risk averted.`;
    }

    const newReport = {
      id: String(Date.now()),
      name: reportName,
      type: reportType,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Active',
      content: content
    };

    setReports(prev => [newReport, ...prev]);
    setReportModalData({ isOpen: true, reportName: newReport.name, distressedCount: 0, report: newReport });
  };

  return (
    <>
          <div className="flex-1 flex min-h-[calc(100vh-80px)] w-full animate-fadeIn bg-earth-bg select-none">
            {/* Sidebar */}
            <div className="hidden lg:flex w-64 bg-[#F5ECE3]/75 border-r border-earth-sage/30 p-6 flex-col justify-between text-left shrink-0">
              <div className="flex flex-col gap-6">
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-earth-clay">ENTERPRISE TIER</span>
                  <h3 className="font-extrabold text-earth-cocoa text-base leading-tight mt-0.5">Client Experience</h3>
                </div>
                
                <nav className="flex flex-col gap-2.5 mt-4 text-xs font-bold text-earth-cocoa/75">
                  <button 
                    onClick={() => { setConsoleTab('dashboard'); setSelectedConsoleUser(null); }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left cursor-pointer transition-all ${
                      consoleTab === 'dashboard'
                        ? 'bg-earth-sage/20 text-earth-cocoa border-l-4 border-earth-sage'
                        : 'hover:bg-earth-sage/10'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-earth-clay" />
                    <span>Dashboard</span>
                  </button>
                  <button 
                    onClick={() => { setConsoleTab('customers'); setSelectedConsoleUser(null); }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left cursor-pointer transition-all ${
                      consoleTab === 'customers'
                        ? 'bg-earth-sage/20 text-earth-cocoa border-l-4 border-earth-sage'
                        : 'hover:bg-earth-sage/10'
                    }`}
                  >
                    <Users className="w-4 h-4 text-earth-clay" />
                    <span>Customers</span>
                  </button>
                  <button 
                    onClick={() => { setConsoleTab('reports'); setSelectedConsoleUser(null); }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left cursor-pointer transition-all ${
                      consoleTab === 'reports'
                        ? 'bg-earth-sage/20 text-earth-cocoa border-l-4 border-earth-sage'
                        : 'hover:bg-earth-sage/10'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-earth-clay" />
                    <span>Reports</span>
                  </button>
                </nav>
              </div>

              
            </div>

            {/* Main Area */}
            <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 text-left w-full overflow-y-auto font-sans">
              
              {/* Top Navigation */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-earth-sage/20 w-full">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-earth-clay">Falcon360 Workspace</span>
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative">
                    <button 
                      onClick={() => {
                        setShowNotifications(!showNotifications);
                      }}
                      className="p-1.5 hover:bg-[#efe9d2]/40 rounded-lg text-earth-cocoa/60 hover:text-earth-cocoa cursor-pointer relative"
                    >
                      <Bell className="w-4 h-4" />
                      <span className="absolute top-1 right-1 w-2 h-2 bg-status-critical rounded-full animate-pulse" />
                    </button>
                    
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-72 bg-[#efe9d2] border border-earth-sage rounded-2xl shadow-xl z-50 p-4 animate-fadeIn text-left text-xs">
                        <div className="font-bold text-earth-cocoa border-b border-earth-sage/20 pb-2 mb-2 flex justify-between items-center">
                          <span>Recent Warnings</span>
                          <span className="text-[9px] bg-status-critical/15 text-status-critical px-2 py-0.5 rounded font-extrabold uppercase">3 Unread</span>
                        </div>
                        <div className="flex flex-col gap-2.5 mt-2">
                          <div className="flex flex-col gap-0.5 border-b border-earth-sage/10 pb-2">
                            <span className="font-bold text-earth-cocoa flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-status-critical rounded-full shrink-0" />
                              ⚠️ Failed Card Renewal
                            </span>
                            <span className="text-[10px] text-earth-cocoa/75 mt-0.5 leading-normal">
                              Northwind Traders bank transaction renewal failed. Grace period active.
                            </span>
                            <span className="text-[8px] text-earth-cocoa/50 mt-1 font-mono">2 hours ago</span>
                          </div>
                          
                          <div className="flex flex-col gap-0.5 border-b border-earth-sage/10 pb-2">
                            <span className="font-bold text-earth-cocoa flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-status-critical rounded-full shrink-0" />
                              🔌 Regional Server Outage
                            </span>
                            <span className="text-[10px] text-earth-cocoa/75 mt-0.5 leading-normal">
                              Outage rate spike detected in West-US server node cluster.
                            </span>
                            <span className="text-[8px] text-earth-cocoa/50 mt-1 font-mono">4 hours ago</span>
                          </div>
                          
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-earth-cocoa flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-earth-clay rounded-full shrink-0" />
                              📉 Engagement Drop
                            </span>
                            <span className="text-[10px] text-earth-cocoa/75 mt-0.5 leading-normal">
                              Acme Robotics usage limits fell below 35% threshold limits.
                            </span>
                            <span className="text-[8px] text-earth-cocoa/50 mt-1 font-mono">6 hours ago</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <img src={users[0]?.avatar} className="w-6 h-6 rounded-full border border-earth-sage/40 object-cover" />
                </div>
              </div>
              {consoleTab === 'dashboard' ? (
                <DashboardTab dist={dist} expScore={expScore} expLabel={expLabel} users={users} addTelemetry={addTelemetry} />
              ) : consoleTab === 'customers' ? (
                <CustomersTab selectedConsoleUser={selectedConsoleUser} setSelectedConsoleUser={setSelectedConsoleUser} users={users} handleUpdateUser={handleUpdateUser} customerSearch={customerSearch} setCustomerSearch={setCustomerSearch} filterPlan={filterPlan} setFilterPlan={setFilterPlan} filterRisk={filterRisk} setFilterRisk={setFilterRisk} filteredConsoleUsers={filteredConsoleUsers} />
              ) : (
                <ReportsTab reports={reports} users={users} generateReport={generateReport} />
              )}
            </div>
          </div>
      {reportModalData.isOpen && (
        <ReportSuccessModal data={reportModalData} onClose={() => setReportModalData(prev => ({ ...prev, isOpen: false }))} />
      )}
      {showOutageAlertModal && (
        <OutageAlertModal
          onClose={() => setShowOutageAlertModal(false)}
          onNavigate={(tab) => {
            setShowOutageAlertModal(false);
            setConsoleTab('customers');
          }}
        />
      )}
    </>
  );
}
