import { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Play, Pause, Settings, Radio, ArrowDown, ChevronRight, 
  MessageSquare, Cpu, HeartHandshake, ArrowLeft, LayoutDashboard,
  Users, Heart, FileText, Search, Bell, Clock, RefreshCw, CreditCard,
  Activity, ShieldAlert, Download
} from 'lucide-react';
import { mockUsers, mergeBackendCustomer, type ActiveUser } from './utils/mockData';
import { Globe } from './components/Globe';
import { ActiveUserInsight } from './components/ActiveUserInsight';
import { getCustomers } from './lib/api';

function App() {
  const [currentPage, setCurrentPage] = useState<'marketing' | 'client_console' | 'client_dashboard' | 'insight'>('marketing');
  const [consoleTab, setConsoleTab] = useState<'dashboard' | 'live_stream' | 'customers' | 'health' | 'reports'>('live_stream');
  const [selectedConsoleUser, setSelectedConsoleUser] = useState<ActiveUser | null>(null);
  const [users, setUsers] = useState<ActiveUser[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<ActiveUser | null>(null);
  const [clientUserId, setClientUserId] = useState<string>('1');
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');

interface Report {
  id: string;
  name: string;
  type: string;
  date: string;
  status: string;
  content: string;
}

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

  // Fetch live customer summaries from FastAPI backend
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      name: 'Q2 Churn Risk & Rescue Assessment',
      type: 'AI Analysis',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Active',
      content: `# Q2 Churn Risk & Rescue Assessment\n\nGenerated on: ${new Date().toLocaleDateString()}\n\n## Portfolio Summary\n- Average Health: 78/100\n- Critical Alerts: 2\n- Monthly Recurring Revenue: $25,000/mo\n\n## Action Items\nGenerate a live rescue report to get custom CSM recommendations.`
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

  const downloadReport = (report: Report) => {
    const blob = new Blob([report.content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${report.name.replace(/[^a-z0-9]/gi, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateDynamicRescuePlan = () => {
    const distressed = users.filter(u => u.healthScore < 70);
    const criticalUsers = users.filter(u => u.healthScore < 40);
    
    let userBreakdownText = "";
    if (distressed.length === 0) {
      userBreakdownText = "No active accounts are currently marked as distressed or at risk of churn. Portfolio health is outstanding!";
    } else {
      distressed.forEach(u => {
        let recommendation = "";
        if (u.metrics.usageVelocity < 0.35 && u.plan !== 'Starter') {
          recommendation = `Execute 1-Click Downgrade to Starter Plan to save $1,500/mo (Usage velocity at ${Math.round(u.metrics.usageVelocity * 100)}%).`;
        } else if (u.warningFlags.includes('Failed Payment')) {
          recommendation = `Request automatic 7-day grace extension to keep services active during card renewal.`;
        } else {
          recommendation = `Schedule active CSM check-in and feature walkthrough (Health at ${u.healthScore}/100).`;
        }
        userBreakdownText += `### 👤 ${u.name} (${u.plan} - $${u.mrr}/mo)\n- **Health Score**: ${u.healthScore}/100\n- **Churn Risk**: ${Math.round(u.churnProbability)}%\n- **Warning Flags**: ${u.warningFlags.join(', ') || 'Low Engagement'}\n- **CSM Action Recommendation**: ${recommendation}\n\n`;
      });
    }

    const reportContent = `# Churn Rescue Plan & Customer Health Assessment

Generated on: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
Analysis Type: Dynamic AI Portfolio Risk Assessment
System Status: Live

## 📊 PORTFOLIO SUMMARY
- **Average Portfolio Health**: ${avgHealth}/100
- **Total At-Risk Accounts (Health < 70)**: ${distressed.length}
- **Critical Alerts (Health < 40)**: ${criticalUsers.length}
- **Active Monthly Recurring Revenue (MRR)**: $${totalMRR.toLocaleString()}/mo
- **Estimated Monthly Revenue At Churn Risk**: $${distressed.reduce((sum, u) => sum + u.mrr, 0).toLocaleString()}/mo

## 🔍 RISK ANALYSIS BY SEGMENT
- **Enterprise Cohort**: ${users.filter(u => u.plan === 'Enterprise' && u.healthScore < 70).length} at risk
- **Growth Cohort**: ${users.filter(u => u.plan === 'Growth' && u.healthScore < 70).length} at risk
- **Starter Cohort**: ${users.filter(u => u.plan === 'Starter' && u.healthScore < 70).length} at risk

## 🛠️ CUSTOMER BREAKDOWN & RESCUE PLAN RECOMMENDATIONS
\n${userBreakdownText}

## 💡 EXECUTIVE SUGGESTIONS
1. **Billing Grace Periods**: For customers suffering from card renewal failures, configure automated billing extension webhooks via SubSentry APIs.
2. **Usage Right-Sizing**: Downgrade underutilizing growth plans proactively. This strengthens enterprise customer trust and secures long-term retention.
3. **Product Outage Response**: Trigger targeted re-engagement campaigns immediately following regional service interruptions.

---
*Report compiled automatically by SubSentry Churn Forecasting Engine. SHA-256 Checksum: ${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}*`;

    const newReport: Report = {
      id: String(Date.now()),
      name: `Q2 Churn Rescue Plan (${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })})`,
      type: 'AI Analysis',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Active',
      content: reportContent
    };

    setReports(prev => [newReport, ...prev]);
    setReportModalData({
      isOpen: true,
      reportName: newReport.name,
      distressedCount: distressed.length,
      report: newReport
    });
  };

  // Fetch live customer summaries from FastAPI backend
  useEffect(() => {
    getCustomers()
      .then((data) => {
        if (data && data.length > 0) {
          const merged = data.map((c: any) => mergeBackendCustomer(c));
          setUsers(merged);
          if (merged[0]) setClientUserId(merged[0].id);
          setTelemetryFeed(prev => [
            `[${new Date().toLocaleTimeString()}] Connected to live data. Showing ${merged.length} active customers.`,
            ...prev
          ]);
        }
      })
      .catch((err) => {
        console.warn('Backend API connection failed, falling back to local simulation data.', err);
        setTelemetryFeed(prev => [
          `[${new Date().toLocaleTimeString()}] ALERT: Live data is unavailable right now. Showing sample data instead.`,
          ...prev
        ]);
      });
  }, []);
  
  // Simulation States (Concept 1: Digital Twin Sandbox)
  const [isSimulating, setIsSimulating] = useState(true);
  const [outageRate, setOutageRate] = useState(15);
  const [billingFailureRate, setBillingFailureRate] = useState(10);
  const [telemetryFeed, setTelemetryFeed] = useState<string[]>([
    'SubSentry is up and running. Watching customer activity in real time.',
    'Tracking 8 active customers around the world.',
  ]);
  const [pulseTrigger, setPulseTrigger] = useState(0);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showOutageAlertModal, setShowOutageAlertModal] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<'successhub' | 'grid' | 'live_data' | 'map'>('successhub');
  const [inspectorUserId, setInspectorUserId] = useState<string>('');

  const consoleRef = useRef<HTMLDivElement>(null);

  const scrollToConsole = () => {
    consoleRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle selected user from the Globe tooltip
  const handleSelectUser = (user: ActiveUser) => {
    const latestUser = users.find(u => u.id === user.id) || user;
    setSelectedUser(latestUser);
    setCurrentPage('insight');
    addTelemetry(`Opened customer details for ${latestUser.name}.`);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleUpdateUser = (updatedUser: ActiveUser) => {
    // Transition customer back to ACTIVE state and resolve warning flags when CSM acts
    const recoveredUser: ActiveUser = {
      ...updatedUser,
      state: 'active',
      healthScore: Math.min(98, updatedUser.healthScore + 20),
      churnProbability: Math.max(5, updatedUser.churnProbability - 30),
      warningFlags: updatedUser.warningFlags.filter(f => f !== 'Using It Less' && f !== 'Failed Payment')
    };
    setUsers(prev => prev.map(u => u.id === recoveredUser.id ? recoveredUser : u));
    setSelectedUser(recoveredUser);
    addTelemetry(`[Action Taken] ${recoveredUser.name} is back on track — risk of leaving is down to ${recoveredUser.churnProbability}%.`);
  };

  const handleClientAction = (userId: string, action: 'downgrade' | 'extend_grace') => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        if (action === 'downgrade') {
          return {
            ...u,
            plan: 'Starter',
            mrr: 400,
            healthScore: Math.min(98, u.healthScore + 20),
            churnProbability: Math.max(5, u.churnProbability - 30),
            warningFlags: u.warningFlags.filter(f => f !== 'Using It Less'),
            activityLogs: [
              {
                date: new Date().toISOString().split('T')[0],
                type: 'plan_change',
                details: 'Customer self-downgraded subscription to Starter Plan ($400/mo) via Dashboard Console.'
              },
              ...u.activityLogs
            ]
          };
        } else if (action === 'extend_grace') {
          return {
            ...u,
            state: 'active',
            warningFlags: u.warningFlags.filter(f => f !== 'Failed Payment'),
            churnProbability: Math.max(10, u.churnProbability - 20),
            activityLogs: [
              {
                date: new Date().toISOString().split('T')[0],
                type: 'payment_success',
                details: 'Requested 7-day payment grace extension via Dashboard Console.'
              },
              ...u.activityLogs
            ]
          };
        }
      }
      return u;
    }));
    addTelemetry(`[Dashboard Console Action] Account ${userId} completed action: ${action}`);
  };

  const addTelemetry = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setTelemetryFeed(prev => [`[${time}] ${msg}`, ...prev.slice(0, 15)]);
  };

  // Keep users list in ref to prevent stale closure in simulation interval
  const usersRef = useRef(users);
  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  // Run Real-Time State Machine Telemetry Simulation
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const currentUsers = [...usersRef.current];
      if (currentUsers.length === 0) return;

      let updatedList = [...currentUsers];
      let didChange = false;

      // 1. Process State Transitions (Markov Chain) for existing distressed users
      for (let i = 0; i < updatedList.length; i++) {
        const u = { ...updatedList[i] };
        
        // Skip already churned users
        if (u.state === 'churned') continue;

        // Transition 1: FRUSTRATED -> DISENGAGED (Quiet Churn due to unresolved bugs)
        if (u.state === 'frustrated' && Math.random() < 0.25) {
          u.state = 'disengaged';
          u.healthScore = Math.max(15, u.healthScore - 15);
          u.churnProbability = Math.min(85, u.churnProbability + 15);
          if (!u.warningFlags.includes('Using It Less')) {
            u.warningFlags.push('Using It Less');
          }
          u.activityLogs.unshift({
            date: new Date().toISOString().split('T')[0],
            type: 'login',
            details: 'WARNING: No logins from this customer in the past 3 days.'
          });
          updatedList[i] = u;
          didChange = true;
          addTelemetry(`[Warning] ${u.name} has gone quiet — they went from FRUSTRATED to DISENGAGED. Risk of leaving: ${u.churnProbability}%.`);
          break; // Process one state transition per tick to keep feed clean
        }

        // Transition 2: DISENGAGED -> CHURNED (Subscription Canceled)
        if (u.state === 'disengaged' && Math.random() < 0.15) {
          u.state = 'churned';
          u.healthScore = 0;
          u.churnProbability = 100;
          u.warningFlags = ['Cancelled Subscription'];
          u.activityLogs.unshift({
            date: new Date().toISOString().split('T')[0],
            type: 'payment_fail',
            details: 'CANCELLED: This customer ended their subscription. Final bill settled.'
          });
          updatedList[i] = u;
          didChange = true;
          addTelemetry(`[CUSTOMER LOST] ⚠️ ${u.name} cancelled their subscription. Lost revenue: $${u.mrr}/mo.`);
          break;
        }
      }

      if (didChange) {
        setUsers(updatedList);
        return; // Skip new random events on this tick to avoid clogging feed
      }

      // 2. Roll probability for an API failure (Outage Rate) -> Transitions ACTIVE to FRUSTRATED
      if (Math.random() * 100 < outageRate) {
        const activeUsers = updatedList.filter(u => u.state === 'active');
        if (activeUsers.length > 0) {
          const target = activeUsers[Math.floor(Math.random() * activeUsers.length)];
          const u = { ...target };
          
          u.state = 'frustrated';
          u.healthScore = Math.max(10, u.healthScore - 12);
          u.churnProbability = Math.min(95, u.churnProbability + 18);
          if (!u.warningFlags.includes('Using It Less')) {
            u.warningFlags.push('Using It Less');
          }
          u.activityLogs.unshift({
            date: new Date().toISOString().split('T')[0],
            type: 'support_open',
            details: 'ALERT: This customer ran into a service outage while using the product.'
          });

          const trendFactor = u.churnFactors.find(f => f.name === 'Usage Trend');
          if (trendFactor) {
            trendFactor.impact = Math.min(45, trendFactor.impact + 10);
          }

          setUsers(prev => prev.map(item => item.id === u.id ? u : item));
          addTelemetry(`[Warning] Service outage hit ${u.name} — they are now FRUSTRATED. Risk of leaving jumped to ${u.churnProbability}%.`);
          return;
        }
      }

      // 3. Roll probability for credit card / renewal failure (Billing failure Rate) -> Transitions ACTIVE to FRUSTRATED
      if (Math.random() * 100 < billingFailureRate) {
        const activeUsers = updatedList.filter(u => u.state === 'active');
        if (activeUsers.length > 0) {
          const target = activeUsers[Math.floor(Math.random() * activeUsers.length)];
          const u = { ...target };

          u.state = 'frustrated';
          u.metrics.failedPayments = 1;
          u.healthScore = Math.max(15, u.healthScore - 18);
          u.churnProbability = Math.min(90, u.churnProbability + 22);
          if (!u.warningFlags.includes('Failed Payment')) {
            u.warningFlags.push('Failed Payment');
          }
          u.activityLogs.unshift({
            date: new Date().toISOString().split('T')[0],
            type: 'payment_fail',
            details: 'Renewal payment failed — the card was declined by the bank.'
          });

          const billFactor = u.churnFactors.find(f => f.name === 'Failed Invoices');
          if (billFactor) {
            billFactor.impact = Math.min(40, billFactor.impact + 20);
          } else {
            u.churnFactors.push({ name: 'Failed Invoices', impact: 20 });
          }

          setUsers(prev => prev.map(item => item.id === u.id ? u : item));
          addTelemetry(`[Warning] Payment problem for ${u.name} — they are now FRUSTRATED. Extra time given to fix billing.`);
          return;
        }
      }

      // 4. Regular login simulation heartbeat
      if (Math.random() > 0.4) {
        const activeUsers = updatedList.filter(u => u.state === 'active');
        if (activeUsers.length > 0) {
          const target = activeUsers[Math.floor(Math.random() * activeUsers.length)];
          addTelemetry(`Activity check-in: ${target.name} is using the product (${target.location}).`);
        }
      }

    }, 4500);

    return () => clearInterval(interval);
  }, [isSimulating, outageRate, billingFailureRate]);

  const avgHealth = Math.round(users.reduce((acc, u) => acc + u.healthScore, 0) / users.length);
  const totalMRR = users.reduce((acc, u) => acc + u.mrr, 0);
  const criticalCount = users.filter(u => u.healthScore < 40).length;

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

  const isDark = currentPage === 'console' || currentPage === 'insight';
  const textMuted = isDark ? 'console-text-muted' : 'text-earth-cocoa/60';
  const textSecondary = isDark ? 'console-text-secondary' : 'text-earth-cocoa/80';
  const textPrimary = isDark ? 'console-text-primary' : 'text-earth-cocoa';
  const textHeading = isDark ? 'text-earth-bg/75' : 'text-earth-cocoa/70';

  return (
    <div className={`min-h-screen font-sans flex flex-col antialiased transition-colors duration-300 ${isDark ? 'console-bg-dark' : 'bg-earth-bg text-earth-cocoa'}`}>
      {/* 1. Navigation Bar */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between shadow-sm transition-all duration-300 ${isDark ? 'bg-earth-cocoa/95 border-earth-bg/15 text-earth-bg' : 'bg-[#F7F1DE]/90 border-earth-sage/35 text-earth-cocoa'}`}>
        <div className="flex items-center gap-3">
          <div className={`border p-2 rounded-xl transition-all duration-300 ${isDark ? 'bg-earth-bg/10 border-earth-bg/25 text-earth-sage' : 'bg-earth-sage/20 border-earth-sage/40 text-earth-cocoa'}`}>
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className={`text-lg font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-earth-bg' : 'text-earth-cocoa'}`}>
              SubSentry <span className={`text-[10px] border px-1.5 py-0.5 rounded font-bold ${isDark ? 'bg-earth-bg/10 border-earth-bg/25 text-earth-bg' : 'bg-earth-sage/20 border-earth-sage/40 text-earth-cocoa'}`}>v4.0.0</span>
            </h1>
            <p className={`text-[10px] font-semibold ${isDark ? 'text-earth-bg/60' : 'text-earth-cocoa/60'}`}>Smart Subscription & Customer Experience Optimizer</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider">
          <button 
            onClick={() => {
              setCurrentPage('marketing');
              setSelectedUser(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
            className="hover:text-earth-clay text-earth-cocoa/75 transition-colors cursor-pointer font-bold"
          >
            Overview
          </button>
          <button 
            onClick={() => {
              setCurrentPage('marketing');
              setSelectedUser(null);
              setTimeout(() => scrollToConsole(), 100);
            }} 
            className="hover:text-earth-clay text-earth-cocoa/75 transition-colors cursor-pointer font-bold"
          >
            Customer Health Tracker
          </button>
        </nav>

        {/* CTA Launch Buttons */}
        <div className="flex items-center gap-3">
          {currentPage !== 'marketing' && (
            <button 
              onClick={() => {
                setCurrentPage('marketing');
                setSelectedUser(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all duration-200 cursor-pointer ${
                isDark 
                  ? 'bg-earth-bg hover:bg-earth-sage text-earth-cocoa' 
                  : 'bg-earth-cocoa hover:bg-earth-clay text-earth-bg'
              }`}
            >
              Overview
            </button>
          )}
          
          {currentPage !== 'client_console' && (
            <button 
              onClick={() => {
                setCurrentPage('client_console');
                setSelectedUser(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all duration-200 cursor-pointer ${
                isDark 
                  ? 'bg-earth-bg hover:bg-earth-sage text-earth-cocoa' 
                  : 'bg-earth-cocoa hover:bg-earth-clay text-earth-bg'
              }`}
            >
              Dashboard Console
            </button>
          )}

          {currentPage !== 'client_dashboard' && (
            <button 
              onClick={() => {
                setCurrentPage('client_dashboard');
                setSelectedUser(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all duration-200 cursor-pointer ${
                isDark 
                  ? 'bg-earth-bg hover:bg-earth-sage text-earth-cocoa' 
                  : 'bg-earth-cocoa hover:bg-earth-clay text-earth-bg'
              }`}
            >
              Client Dashboard
            </button>
          )}
        </div>
      </header>

      {/* 2. Page Body */}
      <main className="flex-1 w-full flex flex-col relative">
        {currentPage === 'insight' && selectedUser ? (
          <ActiveUserInsight 
            user={users.find(u => u.id === selectedUser.id) || selectedUser} 
            onBack={() => {
              setCurrentPage('marketing');
              setSelectedUser(null);
              setTimeout(() => scrollToConsole(), 100);
            }} 
            onUpdateUser={handleUpdateUser}
          />
        ) : currentPage === 'client_console' ? (
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
                    onClick={() => { setConsoleTab('live_stream'); setSelectedConsoleUser(null); }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left cursor-pointer transition-all ${
                      consoleTab === 'live_stream'
                        ? 'bg-earth-sage/20 text-earth-cocoa border-l-4 border-earth-sage'
                        : 'hover:bg-earth-sage/10'
                    }`}
                  >
                    <Radio className="w-4 h-4 text-earth-clay" />
                    <span>Live Stream</span>
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
                    onClick={() => { setConsoleTab('health'); setSelectedConsoleUser(null); }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left cursor-pointer transition-all ${
                      consoleTab === 'health'
                        ? 'bg-earth-sage/20 text-earth-cocoa border-l-4 border-earth-sage'
                        : 'hover:bg-earth-sage/10'
                    }`}
                  >
                    <Heart className="w-4 h-4 text-earth-clay" />
                    <span>Health</span>
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

              <button 
                onClick={() => { setConsoleTab('reports'); setSelectedConsoleUser(null); }}
                className="w-full bg-earth-cocoa hover:bg-earth-clay text-earth-bg py-3 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                New Report
              </button>
            </div>

            {/* Main Area */}
            <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 text-left w-full overflow-y-auto font-sans">
              
              {/* Top Navigation */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-earth-sage/20 w-full">
                <div className="flex items-center gap-6 text-xs font-bold text-earth-cocoa/65 uppercase tracking-wider">
                  <button 
                    onClick={() => setWorkspaceMode('successhub')}
                    className={`cursor-pointer transition-all hover:text-earth-clay pb-1 ${
                      workspaceMode === 'successhub' 
                        ? 'text-earth-clay border-b-2 border-earth-clay font-black' 
                        : 'text-earth-cocoa/65'
                    }`}
                  >
                    SuccessHub
                  </button>
                  
                  <button 
                    onClick={() => setWorkspaceMode('grid')}
                    className={`cursor-pointer transition-all hover:text-earth-clay pb-1 ${
                      workspaceMode === 'grid' 
                        ? 'text-earth-clay border-b-2 border-earth-clay font-black' 
                        : 'text-earth-cocoa/65'
                    }`}
                  >
                    Grid
                  </button>
                  
                  <button 
                    onClick={() => {
                      setWorkspaceMode('live_data');
                      if (users[0]) setInspectorUserId(users[0].id);
                    }}
                    className={`cursor-pointer transition-all hover:text-earth-clay pb-1 ${
                      workspaceMode === 'live_data' 
                        ? 'text-earth-clay border-b-2 border-earth-clay font-black' 
                        : 'text-earth-cocoa/65'
                    }`}
                  >
                    Live Data
                  </button>
                  
                  <button 
                    onClick={() => setWorkspaceMode('map')}
                    className={`cursor-pointer transition-all hover:text-earth-clay pb-1 ${
                      workspaceMode === 'map' 
                        ? 'text-earth-clay border-b-2 border-earth-clay font-black' 
                        : 'text-earth-cocoa/65'
                    }`}
                  >
                    Map
                  </button>
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <input 
                      type="text" 
                      placeholder="Search interactions..."
                      className="bg-[#efe9d2]/35 border border-earth-sage/35 rounded-lg py-1.5 pl-8 pr-3 text-xs outline-none focus:border-earth-clay w-full sm:w-48 text-earth-cocoa font-bold placeholder-earth-cocoa/50"
                    />
                    <Search className="w-3.5 h-3.5 text-earth-cocoa/50 absolute left-2.5 top-2.5" />
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => {
                        setShowNotifications(!showNotifications);
                        setShowSettingsDropdown(false);
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

                  <div className="relative">
                    <button 
                      onClick={() => {
                        setShowSettingsDropdown(!showSettingsDropdown);
                        setShowNotifications(false);
                      }}
                      className="p-1.5 hover:bg-[#efe9d2]/40 rounded-lg text-earth-cocoa/60 hover:text-earth-cocoa cursor-pointer"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    
                    {showSettingsDropdown && (
                      <div className="absolute right-0 mt-2 w-72 bg-[#efe9d2] border border-earth-sage rounded-2xl shadow-xl z-50 p-4 animate-fadeIn text-left text-xs flex flex-col gap-3">
                        <div className="font-bold text-earth-cocoa border-b border-earth-sage/20 pb-2 flex justify-between items-center">
                          <span>Console Configurations</span>
                          <span className="text-[9px] bg-earth-sage/25 text-earth-cocoa px-2 py-0.5 rounded font-extrabold uppercase">Sandbox</span>
                        </div>
                        
                        <div className="flex flex-col gap-3.5">
                          {/* Toggle 1: Simulation running */}
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                              <span className="font-bold text-earth-cocoa">Digital Twin Sandbox</span>
                              <span className="text-[9px] text-earth-cocoa/65">Simulate background user state transitions</span>
                            </div>
                            <button 
                              onClick={() => setIsSimulating(!isSimulating)}
                              className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase transition-all border cursor-pointer ${
                                isSimulating 
                                  ? 'bg-[#276B2B]/15 border-[#276B2B]/35 text-status-healthy' 
                                  : 'bg-earth-cocoa/10 border-earth-cocoa/20 text-earth-cocoa/60'
                              }`}
                            >
                              {isSimulating ? 'Active' : 'Paused'}
                            </button>
                          </div>
                          
                          {/* Slider 1: Outage Rate */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between font-bold">
                              <span>Outage Frequency</span>
                              <span className="text-earth-clay">{outageRate}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={outageRate}
                              onChange={(e) => setOutageRate(Number(e.target.value))}
                              className="w-full accent-earth-clay h-1 bg-earth-cocoa/15 rounded-lg appearance-none cursor-pointer outline-none"
                            />
                          </div>
                          
                          {/* Slider 2: Billing Failure Rate */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between font-bold">
                              <span>Billing Fail Chance</span>
                              <span className="text-earth-clay">{billingFailureRate}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={billingFailureRate}
                              onChange={(e) => setBillingFailureRate(Number(e.target.value))}
                              className="w-full accent-earth-clay h-1 bg-earth-cocoa/15 rounded-lg appearance-none cursor-pointer outline-none"
                            />
                          </div>

                          {/* Trigger Incident Button */}
                          <button 
                            onClick={() => {
                              setUsers(prev => prev.map((u, i) => i === 0 || i === 4 || i === 7 ? {
                                ...u,
                                warningFlags: [...new Set([...u.warningFlags, 'Regional Outage'])],
                                healthScore: Math.max(0, u.healthScore - 35),
                                churnProbability: Math.min(100, u.churnProbability + 40)
                              } : u));
                              addTelemetry("Forced critical outage simulation on active accounts.");
                              setShowSettingsDropdown(false);
                              setShowOutageAlertModal(true);
                            }}
                            className="w-full bg-status-critical hover:bg-[#8F2618] text-earth-bg font-extrabold text-[10px] py-2 rounded-xl transition-all cursor-pointer shadow-sm text-center"
                          >
                            Trigger Instant Outage
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <img src={users[0]?.avatar} className="w-6 h-6 rounded-full border border-earth-sage/40 object-cover" />
                </div>
              </div>
              {workspaceMode === 'grid' ? (
                <>
                  {/* Grid View of Customer Cards */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full animate-fadeIn">
                    <div>
                      <h1 className="text-xl md:text-2xl font-extrabold text-earth-cocoa tracking-tight font-serif">Customer Health Grid</h1>
                      <p className="text-xs text-earth-cocoa/75 mt-1 max-w-xl">
                        Visual card array of active customer profiles, real-time risk tiers, and telemetry alerts.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold shrink-0">
                      <div className="bg-[#276B2B]/15 border border-[#276B2B]/30 rounded-lg px-3 py-1.5 text-status-healthy flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-status-healthy animate-pulse" />
                        <span>System Live</span>
                      </div>
                      <div className="bg-earth-cocoa border border-earth-cocoa text-earth-bg rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Last 24 Hours</span>
                      </div>
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 shadow-sm w-full animate-fadeIn">
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        placeholder="Search customers in grid by name, email, or location..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full bg-earth-bg border border-earth-sage/35 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:border-earth-clay text-earth-cocoa font-bold placeholder-earth-cocoa/50"
                      />
                      <Search className="w-4 h-4 text-earth-cocoa/50 absolute left-3 top-2.5" />
                    </div>

                    <div className="flex gap-3">
                      <select
                        value={filterPlan}
                        onChange={(e) => setFilterPlan(e.target.value)}
                        className="bg-earth-bg border border-earth-sage/35 rounded-xl px-3 py-2 text-xs text-earth-cocoa font-bold outline-none cursor-pointer focus:border-earth-clay min-w-[120px]"
                      >
                        <option value="all">All Plans</option>
                        <option value="enterprise">Enterprise</option>
                        <option value="growth">Growth</option>
                        <option value="starter">Starter</option>
                      </select>

                      <select
                        value={filterRisk}
                        onChange={(e) => setFilterRisk(e.target.value)}
                        className="bg-earth-bg border border-earth-sage/35 rounded-xl px-3 py-2 text-xs text-earth-cocoa font-bold outline-none cursor-pointer focus:border-earth-clay min-w-[120px]"
                      >
                        <option value="all">All Risks</option>
                        <option value="low">Low Risk</option>
                        <option value="medium">Medium Risk</option>
                        <option value="high">High Risk</option>
                      </select>
                    </div>
                  </div>

                  {/* Grid Cards Container */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full animate-fadeIn">
                    {filteredConsoleUsers.length > 0 ? (
                      filteredConsoleUsers.map(u => {
                        const isHighRisk = u.churnProbability > 50;
                        const isMedRisk = u.churnProbability <= 50 && u.churnProbability > 15;
                        return (
                          <div 
                            key={u.id} 
                            className="bg-[#efe9d2]/40 border border-earth-sage/30 p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-all text-earth-cocoa hover:bg-[#efe9d2]/60"
                          >
                            <div className="flex flex-col gap-3">
                              {/* Card Header */}
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex items-center gap-3">
                                  <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full border border-earth-sage/20 object-cover bg-white shrink-0" />
                                  <div className="text-left">
                                    <h4 className="font-extrabold text-sm leading-tight line-clamp-1">{u.name}</h4>
                                    <span className="text-[10px] text-earth-cocoa/50 block mt-0.5">{u.location}</span>
                                  </div>
                                </div>
                                <span className="text-[8px] px-2 py-0.5 border border-earth-sage/35 rounded-full font-bold uppercase tracking-wider bg-earth-bg">
                                  {u.plan}
                                </span>
                              </div>

                              {/* Health & Risk Stats */}
                              <div className="bg-earth-bg/25 border border-earth-sage/10 p-3 rounded-xl flex justify-between items-center text-xs font-bold mt-1">
                                <div className="flex flex-col text-left">
                                  <span className="text-[9px] text-earth-cocoa/50 uppercase">Health Score</span>
                                  <span className={`text-base font-black ${
                                    u.healthScore > 70 ? 'text-status-healthy' : u.healthScore > 40 ? 'text-status-risk' : 'text-status-critical'
                                  }`}>
                                    {u.healthScore}/100
                                  </span>
                                </div>
                                <div className="flex flex-col text-right">
                                  <span className="text-[9px] text-earth-cocoa/50 uppercase">Churn Probability</span>
                                  <span className={`text-base font-black ${
                                    isHighRisk ? 'text-status-critical' : isMedRisk ? 'text-status-risk' : 'text-status-healthy'
                                  }`}>
                                    {Math.round(u.churnProbability)}%
                                  </span>
                                </div>
                              </div>

                              {/* Warning Flags */}
                              <div className="flex flex-wrap gap-1.5 min-h-[22px] items-center">
                                {u.warningFlags.length > 0 ? (
                                  u.warningFlags.map((flag, idx) => (
                                    <span 
                                      key={idx} 
                                      className={`text-[8px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                                        flag === 'Regional Outage' || flag === 'Failed Payment'
                                          ? 'bg-status-critical/15 text-status-critical border border-status-critical/35'
                                          : 'bg-status-risk/15 text-status-risk border border-status-risk/35'
                                      }`}
                                    >
                                      ⚠️ {flag}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[9px] text-status-healthy font-extrabold uppercase tracking-wider flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-status-healthy rounded-full" />
                                    Account Stable
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="border-t border-earth-sage/10 pt-3 flex gap-2 w-full mt-1">
                              <button 
                                onClick={() => {
                                  setSelectedConsoleUser(u);
                                  setConsoleTab('customers');
                                  setWorkspaceMode('successhub');
                                }}
                                className="flex-1 bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-extrabold text-[10px] py-2 rounded-xl transition-all cursor-pointer text-center"
                              >
                                View Insights
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full py-12 text-center text-earth-cocoa/50 font-bold">
                        No customers found matching the search criteria.
                      </div>
                    )}
                  </div>
                </>
              ) : workspaceMode === 'live_data' ? (
                <>
                  {/* Live Data Telemetry View */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full animate-fadeIn">
                    <div>
                      <h1 className="text-xl md:text-2xl font-extrabold text-earth-cocoa tracking-tight font-serif">Live Telemetry & Event Stream</h1>
                      <p className="text-xs text-earth-cocoa/75 mt-1 max-w-xl">
                        Raw data streams, automated webhook triggers, and simulated database event tracking.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold shrink-0">
                      <div className="bg-[#276B2B]/15 border border-[#276B2B]/30 rounded-lg px-3 py-1.5 text-status-healthy flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-status-healthy animate-pulse" />
                        <span>Console Active</span>
                      </div>
                      <div className="bg-earth-cocoa border border-earth-cocoa text-earth-bg rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Live Feed</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch animate-fadeIn">
                    {/* Left Column: Event Stream Console (Span 7) */}
                    <div className="lg:col-span-7 flex flex-col gap-4 w-full">
                      <div className="bg-[#181510] border border-earth-sage/30 rounded-2xl overflow-hidden shadow-inner flex flex-col w-full text-left">
                        <div className="p-4 border-b border-earth-sage/10 bg-[#252019] flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-status-critical" />
                            <span className="w-3 h-3 rounded-full bg-status-risk" />
                            <span className="w-3 h-3 rounded-full bg-status-healthy" />
                            <span className="text-[10px] font-mono text-earth-bg/50 ml-2 font-bold">TERMINAL::telemetry_feed.log</span>
                          </div>
                          <button 
                            onClick={() => setTelemetryFeed([`[${new Date().toLocaleTimeString()}] Telemetry feed cleared.`])}
                            className="bg-earth-bg/10 hover:bg-earth-bg/25 text-earth-bg/60 hover:text-earth-bg text-[9px] font-bold px-2 py-1 rounded transition-all cursor-pointer font-mono"
                          >
                            CLEAR LOGS
                          </button>
                        </div>
                        
                        <div className="p-5 font-mono text-[11px] text-earth-bg/85 h-[400px] overflow-y-auto flex flex-col gap-2 relative leading-relaxed bg-[#181510]">
                          {telemetryFeed.map((line, idx) => {
                            let textColor = "text-earth-bg/85";
                            if (line.includes("ALERT:") || line.includes("CRITICAL:") || line.includes("Outage")) {
                              textColor = "text-status-critical";
                            } else if (line.includes("SUCCESS:") || line.includes("recovered") || line.includes("resolved")) {
                              textColor = "text-status-healthy";
                            } else if (line.includes("SYSTEM:") || line.includes("SubSentry")) {
                              textColor = "text-earth-sage";
                            }
                            return (
                              <div key={idx} className={`${textColor} border-b border-earth-bg/5 pb-1`}>
                                {line}
                              </div>
                            );
                          })}
                          <div className="flex items-center gap-1 text-status-healthy animate-pulse mt-1">
                            <span>$</span>
                            <span className="w-2 h-4 bg-status-healthy" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Statistics & JSON Inspector (Span 5) */}
                    <div className="lg:col-span-5 flex flex-col gap-6 w-full text-left">
                      {/* Sub-card 1: Telemetry Stats */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                        <div className="flex justify-between items-center border-b border-earth-sage/20 pb-2">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">TELEMETRY DIAGNOSTICS</span>
                          <Radio className="w-3.5 h-3.5 text-earth-clay animate-pulse" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                          <div className="bg-earth-bg/35 border border-earth-sage/15 p-3 rounded-xl">
                            <span className="text-[9px] text-earth-cocoa/50 block uppercase">Outage Rate</span>
                            <span className="text-base font-black text-status-critical mt-0.5 block">{outageRate}%</span>
                          </div>
                          <div className="bg-earth-bg/35 border border-earth-sage/15 p-3 rounded-xl">
                            <span className="text-[9px] text-earth-cocoa/50 block uppercase">Renewal Fail Chance</span>
                            <span className="text-base font-black text-status-risk mt-0.5 block">{billingFailureRate}%</span>
                          </div>
                          <div className="bg-earth-bg/35 border border-earth-sage/15 p-3 rounded-xl">
                            <span className="text-[9px] text-earth-cocoa/50 block uppercase">Network Latency</span>
                            <span className="text-base font-black text-status-healthy mt-0.5 block">18ms</span>
                          </div>
                          <div className="bg-earth-bg/35 border border-[#efe9d2]/15 p-3 rounded-xl">
                            <span className="text-[9px] text-earth-cocoa/50 block uppercase">Active Consumers</span>
                            <span className="text-base font-black text-earth-cocoa mt-0.5 block">{users.length}</span>
                          </div>
                        </div>
                      </div>

                      {/* Sub-card 2: JSON Object Inspector */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
                        <div className="flex justify-between items-center border-b border-earth-sage/20 pb-2">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">JSON OBJECT INSPECTOR</span>
                          <Cpu className="w-3.5 h-3.5 text-[#276B2B]" />
                        </div>

                        <div className="flex flex-col gap-2 mt-1">
                          <label className="text-[9px] font-extrabold text-earth-cocoa/65 uppercase">Select Database Target</label>
                          <select 
                            value={inspectorUserId}
                            onChange={(e) => setInspectorUserId(e.target.value)}
                            className="bg-earth-bg border border-earth-sage/35 rounded-xl px-3 py-2 text-xs text-earth-cocoa font-bold outline-none cursor-pointer focus:border-earth-clay w-full"
                          >
                            {users.map(u => (
                              <option key={u.id} value={u.id}>{u.name} ({u.plan})</option>
                            ))}
                          </select>
                        </div>

                        <div className="mt-2 text-left">
                          <span className="text-[9px] font-extrabold text-earth-cocoa/65 uppercase block mb-1.5">Raw JSON Entity Payload</span>
                          <pre className="bg-[#181510] text-[#A6E22E] p-4 rounded-xl border border-earth-sage/20 text-[10px] font-mono overflow-auto h-[210px] shadow-inner select-all leading-normal">
                            {JSON.stringify(users.find(u => u.id === inspectorUserId) || users[0], null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : workspaceMode === 'map' ? (
                <>
                  {/* Map Telemetry View */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full animate-fadeIn">
                    <div>
                      <h1 className="text-xl md:text-2xl font-extrabold text-earth-cocoa tracking-tight font-serif">Global Customer Risk Map</h1>
                      <p className="text-xs text-earth-cocoa/75 mt-1 max-w-xl">
                        Interactive spatial distribution mapping of client accounts, local sentiments, and warning telemetry.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold shrink-0">
                      <div className="bg-[#276B2B]/15 border border-[#276B2B]/30 rounded-lg px-3 py-1.5 text-status-healthy flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-status-healthy animate-pulse" />
                        <span>Map Online</span>
                      </div>
                      <div className="bg-earth-cocoa border border-earth-cocoa text-earth-bg rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>3D Globe Mode</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch animate-fadeIn">
                    {/* Left Column: 3D rotating Globe (Span 7) */}
                    <div className="lg:col-span-7 flex flex-col gap-4 w-full">
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 shadow-sm h-[480px] flex items-center justify-center relative overflow-hidden">
                        <div className="absolute top-4 left-4 bg-earth-bg/75 border border-earth-sage/20 px-3 py-1.5 rounded-xl text-left z-10">
                          <span className="text-[8px] uppercase tracking-wider text-earth-clay font-extrabold block">INTERACTIVE MODEL</span>
                          <span className="text-[10px] font-bold text-earth-cocoa block mt-0.5">Click markers to inspect details</span>
                        </div>
                        
                        <div className="w-full h-full flex items-center justify-center">
                          <Globe 
                            onSelectUser={(u) => setSelectedConsoleUser(u)} 
                            selectedUser={selectedConsoleUser} 
                            users={users} 
                            pulseTrigger={pulseTrigger} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Regional Metrics & Selected Inspector (Span 5) */}
                    <div className="lg:col-span-5 flex flex-col gap-6 w-full text-left">
                      {/* Regional Sentiment Indicators */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                        <div className="flex justify-between items-center border-b border-earth-sage/20 pb-2">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">REGIONAL SENTIMENT MATRIX</span>
                          <span className="text-[9px] bg-earth-sage/20 text-earth-cocoa px-1.5 py-0.5 rounded font-bold">AVG: 89%</span>
                        </div>

                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-earth-cocoa">North America</span>
                            <div className="flex items-center gap-2">
                              <span className="w-16 h-1.5 bg-status-healthy rounded-full" />
                              <span className="text-status-healthy font-extrabold">89%</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-earth-cocoa">Europe</span>
                            <div className="flex items-center gap-2">
                              <span className="w-16 h-1.5 bg-status-risk rounded-full" />
                              <span className="text-status-risk font-extrabold">65%</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-earth-cocoa">Asia Pacific (APAC)</span>
                            <div className="flex items-center gap-2">
                              <span className="w-16 h-1.5 bg-status-healthy rounded-full animate-pulse" />
                              <span className="text-status-healthy font-extrabold">92%</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-earth-cocoa">South America</span>
                            <div className="flex items-center gap-2">
                              <span className="w-16 h-1.5 bg-status-healthy rounded-full" />
                              <span className="text-status-healthy font-extrabold">82%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Map Selector / Details Card */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm flex-1 justify-between min-h-[220px]">
                        <div className="flex justify-between items-center border-b border-earth-sage/20 pb-2">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">MAP TARGET DETAILS</span>
                          <Cpu className="w-3.5 h-3.5 text-earth-clay" />
                        </div>

                        {selectedConsoleUser ? (
                          <div className="flex flex-col gap-3 h-full justify-between">
                            <div className="flex items-center gap-3">
                              <img src={selectedConsoleUser.avatar} alt={selectedConsoleUser.name} className="w-12 h-12 rounded-full border border-earth-sage/20 object-cover bg-white" />
                              <div>
                                <h4 className="font-extrabold text-sm text-earth-cocoa leading-tight">{selectedConsoleUser.name}</h4>
                                <span className="text-[10px] text-earth-cocoa/50 mt-0.5 block">{selectedConsoleUser.location}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-[11px] font-bold text-earth-cocoa/80 bg-earth-bg/35 border border-earth-sage/15 p-3 rounded-xl">
                              <div className="flex flex-col">
                                <span className="text-[9px] text-earth-cocoa/50">Plan Tier</span>
                                <span className="font-black mt-0.5">{selectedConsoleUser.plan}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[9px] text-earth-cocoa/50">Health Index</span>
                                <span className={`font-black mt-0.5 ${
                                  selectedConsoleUser.healthScore > 70 ? 'text-status-healthy' : selectedConsoleUser.healthScore > 40 ? 'text-status-risk' : 'text-status-critical'
                                }`}>{selectedConsoleUser.healthScore}/100</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[9px] text-earth-cocoa/50">Monthly Churn Probability</span>
                                <span className="font-black mt-0.5 text-earth-clay">{Math.round(selectedConsoleUser.churnProbability)}%</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[9px] text-earth-cocoa/50">Account MRR</span>
                                <span className="font-black mt-0.5 text-earth-cocoa">${selectedConsoleUser.mrr}/mo</span>
                              </div>
                            </div>

                            <button 
                              onClick={() => {
                                setConsoleTab('customers');
                                setWorkspaceMode('successhub');
                              }}
                              className="w-full bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-extrabold text-xs py-2 rounded-xl transition-all cursor-pointer shadow-sm text-center mt-1"
                            >
                              Open Full Insights console
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center text-earth-cocoa/50 font-bold gap-2">
                            <Globe className="w-8 h-8 text-earth-cocoa/30 animate-spin-slow" />
                            <span>Select a marker on the Globe map to display client specifications.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : consoleTab === 'live_stream' ? (
                <>
                  {/* Grid View of Customer Cards */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full animate-fadeIn">
                    <div>
                      <h1 className="text-xl md:text-2xl font-extrabold text-earth-cocoa tracking-tight font-serif">Customer Health Grid</h1>
                      <p className="text-xs text-earth-cocoa/75 mt-1 max-w-xl">
                        Visual card array of active customer profiles, real-time risk tiers, and telemetry alerts.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold shrink-0">
                      <div className="bg-[#276B2B]/15 border border-[#276B2B]/30 rounded-lg px-3 py-1.5 text-status-healthy flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-status-healthy animate-pulse" />
                        <span>System Live</span>
                      </div>
                      <div className="bg-earth-cocoa border border-earth-cocoa text-earth-bg rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Last 24 Hours</span>
                      </div>
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 shadow-sm w-full animate-fadeIn">
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        placeholder="Search customers in grid by name, email, or location..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full bg-earth-bg border border-earth-sage/35 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:border-earth-clay text-earth-cocoa font-bold placeholder-earth-cocoa/50"
                      />
                      <Search className="w-4 h-4 text-earth-cocoa/50 absolute left-3 top-2.5" />
                    </div>

                    <div className="flex gap-3">
                      <select
                        value={filterPlan}
                        onChange={(e) => setFilterPlan(e.target.value)}
                        className="bg-earth-bg border border-earth-sage/35 rounded-xl px-3 py-2 text-xs text-earth-cocoa font-bold outline-none cursor-pointer focus:border-earth-clay min-w-[120px]"
                      >
                        <option value="all">All Plans</option>
                        <option value="enterprise">Enterprise</option>
                        <option value="growth">Growth</option>
                        <option value="starter">Starter</option>
                      </select>

                      <select
                        value={filterRisk}
                        onChange={(e) => setFilterRisk(e.target.value)}
                        className="bg-earth-bg border border-earth-sage/35 rounded-xl px-3 py-2 text-xs text-earth-cocoa font-bold outline-none cursor-pointer focus:border-earth-clay min-w-[120px]"
                      >
                        <option value="all">All Risks</option>
                        <option value="low">Low Risk</option>
                        <option value="medium">Medium Risk</option>
                        <option value="high">High Risk</option>
                      </select>
                    </div>
                  </div>

                  {/* Grid Cards Container */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full animate-fadeIn">
                    {filteredConsoleUsers.length > 0 ? (
                      filteredConsoleUsers.map(u => {
                        const isHighRisk = u.churnProbability > 50;
                        const isMedRisk = u.churnProbability <= 50 && u.churnProbability > 15;
                        return (
                          <div 
                            key={u.id} 
                            className="bg-[#efe9d2]/40 border border-earth-sage/30 p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-all text-earth-cocoa hover:bg-[#efe9d2]/60"
                          >
                            <div className="flex flex-col gap-3">
                              {/* Card Header */}
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex items-center gap-3">
                                  <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full border border-earth-sage/20 object-cover bg-white shrink-0" />
                                  <div className="text-left">
                                    <h4 className="font-extrabold text-sm leading-tight line-clamp-1">{u.name}</h4>
                                    <span className="text-[10px] text-earth-cocoa/50 block mt-0.5">{u.location}</span>
                                  </div>
                                </div>
                                <span className="text-[8px] px-2 py-0.5 border border-earth-sage/35 rounded-full font-bold uppercase tracking-wider bg-earth-bg">
                                  {u.plan}
                                </span>
                              </div>

                              {/* Health & Risk Stats */}
                              <div className="bg-earth-bg/25 border border-earth-sage/10 p-3 rounded-xl flex justify-between items-center text-xs font-bold mt-1">
                                <div className="flex flex-col text-left">
                                  <span className="text-[9px] text-earth-cocoa/50 uppercase">Health Score</span>
                                  <span className={`text-base font-black ${
                                    u.healthScore > 70 ? 'text-status-healthy' : u.healthScore > 40 ? 'text-status-risk' : 'text-status-critical'
                                  }`}>
                                    {u.healthScore}/100
                                  </span>
                                </div>
                                <div className="flex flex-col text-right">
                                  <span className="text-[9px] text-earth-cocoa/50 uppercase">Churn Probability</span>
                                  <span className={`text-base font-black ${
                                    isHighRisk ? 'text-status-critical' : isMedRisk ? 'text-status-risk' : 'text-status-healthy'
                                  }`}>
                                    {Math.round(u.churnProbability)}%
                                  </span>
                                </div>
                              </div>

                              {/* Warning Flags */}
                              <div className="flex flex-wrap gap-1.5 min-h-[22px] items-center">
                                {u.warningFlags.length > 0 ? (
                                  u.warningFlags.map((flag, idx) => (
                                    <span 
                                      key={idx} 
                                      className={`text-[8px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                                        flag === 'Regional Outage' || flag === 'Failed Payment'
                                          ? 'bg-status-critical/15 text-status-critical border border-status-critical/35'
                                          : 'bg-status-risk/15 text-status-risk border border-status-risk/35'
                                      }`}
                                    >
                                      ⚠️ {flag}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[9px] text-status-healthy font-extrabold uppercase tracking-wider flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-status-healthy rounded-full" />
                                    Account Stable
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="border-t border-earth-sage/10 pt-3 flex gap-2 w-full mt-1">
                              <button 
                                onClick={() => {
                                  setSelectedConsoleUser(u);
                                  setConsoleTab('customers');
                                  setWorkspaceMode('successhub');
                                }}
                                className="flex-1 bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-extrabold text-[10px] py-2 rounded-xl transition-all cursor-pointer text-center"
                              >
                                View Insights
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full py-12 text-center text-earth-cocoa/50 font-bold">
                        No customers found matching the search criteria.
                      </div>
                    )}
                  </div>
                </>
              ) : workspaceMode === 'live_data' ? (
                <>
                  {/* Live Data Telemetry View */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full animate-fadeIn">
                    <div>
                      <h1 className="text-xl md:text-2xl font-extrabold text-earth-cocoa tracking-tight font-serif">Live Telemetry & Event Stream</h1>
                      <p className="text-xs text-earth-cocoa/75 mt-1 max-w-xl">
                        Raw data streams, automated webhook triggers, and simulated database event tracking.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold shrink-0">
                      <div className="bg-[#276B2B]/15 border border-[#276B2B]/30 rounded-lg px-3 py-1.5 text-status-healthy flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-status-healthy animate-pulse" />
                        <span>Console Active</span>
                      </div>
                      <div className="bg-earth-cocoa border border-earth-cocoa text-earth-bg rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Live Feed</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch animate-fadeIn">
                    {/* Left Column: Event Stream Console (Span 7) */}
                    <div className="lg:col-span-7 flex flex-col gap-4 w-full">
                      <div className="bg-[#181510] border border-earth-sage/30 rounded-2xl overflow-hidden shadow-inner flex flex-col w-full text-left">
                        <div className="p-4 border-b border-earth-sage/10 bg-[#252019] flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-status-critical" />
                            <span className="w-3 h-3 rounded-full bg-status-risk" />
                            <span className="w-3 h-3 rounded-full bg-status-healthy" />
                            <span className="text-[10px] font-mono text-earth-bg/50 ml-2 font-bold">TERMINAL::telemetry_feed.log</span>
                          </div>
                          <button 
                            onClick={() => setTelemetryFeed([`[${new Date().toLocaleTimeString()}] Telemetry feed cleared.`])}
                            className="bg-earth-bg/10 hover:bg-earth-bg/25 text-earth-bg/60 hover:text-earth-bg text-[9px] font-bold px-2 py-1 rounded transition-all cursor-pointer font-mono"
                          >
                            CLEAR LOGS
                          </button>
                        </div>
                        
                        <div className="p-5 font-mono text-[11px] text-earth-bg/85 h-[400px] overflow-y-auto flex flex-col gap-2 relative leading-relaxed bg-[#181510]">
                          {telemetryFeed.map((line, idx) => {
                            let textColor = "text-earth-bg/85";
                            if (line.includes("ALERT:") || line.includes("CRITICAL:") || line.includes("Outage")) {
                              textColor = "text-status-critical";
                            } else if (line.includes("SUCCESS:") || line.includes("recovered") || line.includes("resolved")) {
                              textColor = "text-status-healthy";
                            } else if (line.includes("SYSTEM:") || line.includes("SubSentry")) {
                              textColor = "text-earth-sage";
                            }
                            return (
                              <div key={idx} className={`${textColor} border-b border-earth-bg/5 pb-1`}>
                                {line}
                              </div>
                            );
                          })}
                          <div className="flex items-center gap-1 text-status-healthy animate-pulse mt-1">
                            <span>$</span>
                            <span className="w-2 h-4 bg-status-healthy" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Statistics & JSON Inspector (Span 5) */}
                    <div className="lg:col-span-5 flex flex-col gap-6 w-full text-left">
                      {/* Sub-card 1: Telemetry Stats */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                        <div className="flex justify-between items-center border-b border-earth-sage/20 pb-2">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">TELEMETRY DIAGNOSTICS</span>
                          <Radio className="w-3.5 h-3.5 text-earth-clay animate-pulse" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                          <div className="bg-earth-bg/35 border border-earth-sage/15 p-3 rounded-xl">
                            <span className="text-[9px] text-earth-cocoa/50 block uppercase">Outage Rate</span>
                            <span className="text-base font-black text-status-critical mt-0.5 block">{outageRate}%</span>
                          </div>
                          <div className="bg-earth-bg/35 border border-earth-sage/15 p-3 rounded-xl">
                            <span className="text-[9px] text-earth-cocoa/50 block uppercase">Renewal Fail Chance</span>
                            <span className="text-base font-black text-status-risk mt-0.5 block">{billingFailureRate}%</span>
                          </div>
                          <div className="bg-earth-bg/35 border border-earth-sage/15 p-3 rounded-xl">
                            <span className="text-[9px] text-earth-cocoa/50 block uppercase">Network Latency</span>
                            <span className="text-base font-black text-status-healthy mt-0.5 block">18ms</span>
                          </div>
                          <div className="bg-earth-bg/35 border border-[#efe9d2]/15 p-3 rounded-xl">
                            <span className="text-[9px] text-earth-cocoa/50 block uppercase">Active Consumers</span>
                            <span className="text-base font-black text-earth-cocoa mt-0.5 block">{users.length}</span>
                          </div>
                        </div>
                      </div>

                      {/* Sub-card 2: JSON Object Inspector */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
                        <div className="flex justify-between items-center border-b border-earth-sage/20 pb-2">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">JSON OBJECT INSPECTOR</span>
                          <Cpu className="w-3.5 h-3.5 text-[#276B2B]" />
                        </div>

                        <div className="flex flex-col gap-2 mt-1">
                          <label className="text-[9px] font-extrabold text-earth-cocoa/65 uppercase">Select Database Target</label>
                          <select 
                            value={inspectorUserId}
                            onChange={(e) => setInspectorUserId(e.target.value)}
                            className="bg-earth-bg border border-earth-sage/35 rounded-xl px-3 py-2 text-xs text-earth-cocoa font-bold outline-none cursor-pointer focus:border-earth-clay w-full"
                          >
                            {users.map(u => (
                              <option key={u.id} value={u.id}>{u.name} ({u.plan})</option>
                            ))}
                          </select>
                        </div>

                        <div className="mt-2 text-left">
                          <span className="text-[9px] font-extrabold text-earth-cocoa/65 uppercase block mb-1.5">Raw JSON Entity Payload</span>
                          <pre className="bg-[#181510] text-[#A6E22E] p-4 rounded-xl border border-earth-sage/20 text-[10px] font-mono overflow-auto h-[210px] shadow-inner select-all leading-normal">
                            {JSON.stringify(users.find(u => u.id === inspectorUserId) || users[0], null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : consoleTab === 'live_stream' ? (
                <>
                  {/* Title & Subtitle block */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full">
                    <div>
                      <h1 className="text-xl md:text-2xl font-extrabold text-earth-cocoa tracking-tight">Client Experience Console</h1>
                      <p className="text-xs text-earth-cocoa/75 mt-1 max-w-xl">
                        Real-time transparency into your end-user ecosystem. Track sentiment, health, and automated system wins.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold shrink-0">
                      <div className="bg-[#276B2B]/15 border border-[#276B2B]/30 rounded-lg px-3 py-1.5 text-status-healthy flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-status-healthy animate-pulse" />
                        <span>System Live</span>
                      </div>
                      <div className="bg-earth-cocoa border border-earth-cocoa text-earth-bg rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Last 24 Hours</span>
                      </div>
                    </div>
                  </div>

                  {/* Grid Layout for dashboard items */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full items-stretch">
                    
                    {/* Left side column: Live Experience Stream & Heatmap (Span 7) */}
                    <div className="md:col-span-7 flex flex-col gap-6 w-full">
                      
                      {/* Card 1: Live Experience Stream */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                        <div className="flex justify-between items-center border-b border-earth-sage/20 pb-2">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">LIVE EXPERIENCE STREAM</span>
                          <span className="text-[10px] font-bold text-earth-sage uppercase">Active Users: 1,422</span>
                        </div>

                        <div className="flex flex-col gap-3">
                          {/* Item 1 */}
                          <div className="border border-earth-sage/20 bg-earth-bg/30 p-3.5 rounded-xl flex gap-3.5 items-start">
                            <div className="bg-earth-sage/25 p-1.5 rounded-lg text-earth-cocoa shrink-0">
                              <Users className="w-4 h-4 text-earth-clay" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-baseline">
                                <h4 className="text-xs font-bold text-earth-cocoa">User #8821 initiated Checkout</h4>
                                <span className="text-[9px] text-earth-cocoa/50">Just now</span>
                              </div>
                              <p className="text-[10px] text-earth-cocoa/75 mt-0.5 leading-normal">
                                Cart Value: $248.00 • High Intent Score detected
                              </p>
                            </div>
                          </div>

                          {/* Item 2 */}
                          <div className="border border-earth-sage/20 bg-earth-bg/30 p-3.5 rounded-xl flex gap-3.5 items-start">
                            <div className="bg-earth-sage/25 p-1.5 rounded-lg text-earth-cocoa shrink-0">
                              <Cpu className="w-4 h-4 text-earth-clay animate-pulse" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-baseline">
                                <h4 className="text-xs font-bold text-earth-cocoa">Automated Support Intervention</h4>
                                <span className="text-[9px] text-earth-cocoa/50">2m ago</span>
                              </div>
                              <p className="text-[10px] text-earth-cocoa/75 mt-0.5 leading-normal">
                                Resolved potential churn event for Client 'Atlas Corp'. Sentiment recovered to 85%.
                              </p>
                            </div>
                          </div>

                          {/* Item 3 */}
                          <div className="border border-earth-sage/20 bg-earth-bg/30 p-3.5 rounded-xl flex gap-3.5 items-start">
                            <div className="bg-earth-sage/25 p-1.5 rounded-lg text-earth-cocoa shrink-0">
                              <FileText className="w-4 h-4 text-earth-clay" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-baseline">
                                <h4 className="text-xs font-bold text-earth-cocoa">Page View: Documentation Portal</h4>
                                <span className="text-[9px] text-earth-cocoa/50">5m ago</span>
                              </div>
                              <p className="text-[10px] text-earth-cocoa/75 mt-0.5 leading-normal">
                                User searching for 'API Keys'. Interaction duration: 4m 12s.
                              </p>
                            </div>
                          </div>

                          {/* Item 4 */}
                          <div className="border border-earth-sage/20 bg-earth-bg/30 p-3.5 rounded-xl flex gap-3.5 items-start">
                            <div className="bg-earth-sage/25 p-1.5 rounded-lg text-earth-cocoa shrink-0">
                              <CreditCard className="w-4 h-4 text-earth-clay" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-baseline">
                                <h4 className="text-xs font-bold text-earth-cocoa">Conversion: Premium Plan Upgrade</h4>
                                <span className="text-[9px] text-earth-cocoa/50">8m ago</span>
                              </div>
                              <p className="text-[10px] text-earth-cocoa/75 mt-0.5 leading-normal">
                                Client 'Stellar Inc' upgraded seats from 50 to 100.
                              </p>
                            </div>
                          </div>
                        </div>

                        <button className="self-center mt-2 bg-earth-cocoa hover:bg-earth-clay text-earth-bg px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer shadow-md">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Updating Live Stream</span>
                        </button>
                      </div>

                      {/* Card 2: Heatmap */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                        <div className="flex justify-between items-center border-b border-earth-sage/20 pb-2">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">CUSTOMER SENTIMENT HEATMAP</span>
                          <span className="text-[10px] font-bold text-earth-sage uppercase">Regional emotional response density</span>
                        </div>
                        
                        <div className="relative rounded-xl border border-earth-sage/20 overflow-hidden h-[180px] bg-[#efe9d2]/25 flex items-center justify-center">
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(90,111,84,0.08),transparent)]" />
                          
                          <div className="text-[10px] text-earth-cocoa/40 font-mono tracking-widest text-center select-none uppercase">
                            [ Interactive Sentiment Globe Layer ]
                          </div>

                          {/* Tooltip Overlay */}
                          <div className="absolute bottom-4 left-6 bg-earth-cocoa border border-earth-cocoa/30 p-3 rounded-xl text-left shadow-lg">
                            <span className="text-[8px] uppercase tracking-wider text-earth-sage font-extrabold block">North America</span>
                            <span className="text-xs font-extrabold text-earth-bg block mt-0.5">89% POSITIVE SENTIMENT</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Right side column: Brand Health circular gauge & Automated wins (Span 5) */}
                    <div className="md:col-span-5 flex flex-col gap-6 w-full">
                      
                      {/* Card 3: Brand Health Circular progress gauge */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col justify-between items-center text-center relative overflow-hidden shadow-sm h-fit">
                        <div className="flex flex-col gap-1 border-b border-earth-sage/20 pb-2 text-left w-full">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">BRAND HEALTH SCORE</span>
                          <span className="text-[10px] font-bold text-earth-sage uppercase">Aggregate loyalty & performance index</span>
                        </div>

                        <div className="relative flex items-center justify-center my-6">
                          <svg className="w-32 h-32 transform -rotate-90">
                            <circle 
                              cx="64" cy="64" r="54" 
                              className="stroke-earth-cocoa/15" strokeWidth="10" fill="transparent" 
                            />
                            <circle 
                              cx="64" cy="64" r="54" 
                              className="stroke-earth-clay" strokeWidth="10" fill="transparent" 
                              strokeDasharray={2 * Math.PI * 54}
                              strokeDashoffset={2 * Math.PI * 54 * (1 - 0.92)}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-3xl font-black text-earth-cocoa">92</span>
                            <span className="text-[8px] uppercase font-bold text-earth-cocoa/60">OUT OF 100</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-earth-sage/20 pt-4 w-full">
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-extrabold text-earth-cocoa">8.4k</span>
                            <span className="text-[8px] text-earth-cocoa/50 font-bold uppercase tracking-wider">Active Users</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-extrabold text-status-healthy">+12%</span>
                            <span className="text-[8px] text-earth-cocoa/50 font-bold uppercase tracking-wider">MoM Growth</span>
                          </div>
                        </div>
                      </div>

                      {/* Card 4: Automated Engagement Wins progress bars */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                        <div className="flex flex-col gap-1 border-b border-earth-sage/20 pb-2 w-full text-left">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">AUTOMATED ENGAGEMENT WINS</span>
                          <span className="text-[10px] font-bold text-earth-sage uppercase">Where the platform worked for you</span>
                        </div>

                        <div className="flex flex-col gap-4.5 text-left">
                          {/* Item 1 */}
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-baseline text-xs">
                              <span className="font-bold text-earth-cocoa">Cart Recovery Bots</span>
                              <span className="font-extrabold text-earth-clay">+$14.2k</span>
                            </div>
                            <div className="w-full bg-earth-cocoa/10 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-earth-clay" style={{ width: '72%' }} />
                            </div>
                            <div className="flex justify-between text-[8px] text-earth-cocoa/50 uppercase font-bold">
                              <span>Progress</span>
                              <span>72% Efficiency</span>
                            </div>
                          </div>

                          {/* Item 2 */}
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-baseline text-xs">
                              <span className="font-bold text-earth-cocoa">Churn Prediction (AI)</span>
                              <span className="font-extrabold text-earth-clay">112 Saved</span>
                            </div>
                            <div className="w-full bg-earth-cocoa/10 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-earth-clay" style={{ width: '45%' }} />
                            </div>
                            <div className="flex justify-between text-[8px] text-earth-cocoa/50 uppercase font-bold">
                              <span>Progress</span>
                              <span>45% Efficiency</span>
                            </div>
                          </div>

                          {/* Item 3 */}
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-baseline text-xs">
                              <span className="font-bold text-earth-cocoa">Dynamic Pricing Engine</span>
                              <span className="font-extrabold text-earth-clay">+4.5% Lift</span>
                            </div>
                            <div className="w-full bg-earth-cocoa/10 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-earth-clay" style={{ width: '89%' }} />
                            </div>
                            <div className="flex justify-between text-[8px] text-earth-cocoa/50 uppercase font-bold">
                              <span>Progress</span>
                              <span>89% Efficiency</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-[9px] italic text-earth-cocoa/60 text-center border-t border-earth-sage/10 pt-3 leading-normal">
                          Platform automation handled 82% of all repetitive support events today.
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* Bottom stats bar: 4 items */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-2">
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-3 flex flex-col gap-1 shadow-sm">
                      <span className="text-[8px] font-bold text-earth-cocoa/50 uppercase">API RESPONSE</span>
                      <span className="text-xs font-black text-earth-cocoa">24ms</span>
                    </div>
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-3 flex flex-col gap-1 shadow-sm">
                      <span className="text-[8px] font-bold text-earth-cocoa/50 uppercase">DATA FRESHNESS</span>
                      <span className="text-xs font-black text-status-healthy">Real-time</span>
                    </div>
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-3 flex flex-col gap-1 shadow-sm">
                      <span className="text-[8px] font-bold text-earth-cocoa/50 uppercase">TRANSPARENCY INDEX</span>
                      <span className="text-xs font-black text-earth-cocoa font-mono">Level 5</span>
                    </div>
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-3 flex flex-col gap-1 shadow-sm">
                      <span className="text-[8px] font-bold text-earth-cocoa/50 uppercase">PREMIUM ADVANTAGE</span>
                      <span className="text-xs font-black text-earth-clay">Enabled</span>
                    </div>
                  </div>
                </>
              ) : consoleTab === 'dashboard' ? (
                <>
                  {/* Dashboard View */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full">
                    <div>
                      <h1 className="text-xl md:text-2xl font-extrabold text-earth-cocoa tracking-tight">Client Experience Dashboard</h1>
                      <p className="text-xs text-earth-cocoa/75 mt-1 max-w-xl">
                        Strategic metrics, health distribution, and experience analytics across your customer base.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold shrink-0">
                      <div className="bg-[#276B2B]/15 border border-[#276B2B]/30 rounded-lg px-3 py-1.5 text-status-healthy flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-status-healthy animate-pulse" />
                        <span>System Live</span>
                      </div>
                      <div className="bg-earth-cocoa border border-earth-cocoa text-earth-bg rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Last 24 Hours</span>
                      </div>
                    </div>
                  </div>

                  {/* Metric Cards Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    {/* Card 1 */}
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-earth-cocoa/50 uppercase">Experience Score</span>
                        <Heart className="w-4 h-4 text-status-healthy" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-earth-cocoa">92</span>
                        <span className="text-[9px] bg-status-healthy/15 text-status-healthy px-1.5 py-0.5 rounded font-extrabold uppercase">Excellent</span>
                      </div>
                      <span className="text-[9px] text-earth-cocoa/65">+2.4% from last week</span>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-earth-cocoa/50 uppercase">Active Accounts</span>
                        <Users className="w-4 h-4 text-earth-clay" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-earth-cocoa">8,412</span>
                      </div>
                      <span className="text-[9px] text-earth-cocoa/65">82 active today</span>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-earth-cocoa/50 uppercase">Automated Wins Saved</span>
                        <Cpu className="w-4 h-4 text-status-healthy" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-earth-cocoa">$14,200</span>
                      </div>
                      <span className="text-[9px] text-earth-cocoa/65">82% win rate</span>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-earth-cocoa/50 uppercase">Avg Response Time</span>
                        <Activity className="w-4 h-4 text-earth-clay" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-earth-cocoa">24ms</span>
                      </div>
                      <span className="text-[9px] text-earth-cocoa/65">99.99% uptime</span>
                    </div>
                  </div>

                  {/* Main section grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
                    
                    {/* Left Column (Span 8) */}
                    <div className="lg:col-span-8 flex flex-col gap-6 w-full">
                      {/* Health distribution block */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                        <div className="flex justify-between items-center border-b border-earth-sage/20 pb-2">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">CUSTOMER HEALTH DISTRIBUTION</span>
                          <span className="text-[10px] font-bold text-earth-sage uppercase">Segmentation by active user count</span>
                        </div>

                        {/* Stacked bar chart representation */}
                        <div className="flex flex-col gap-4">
                          <div className="w-full h-5 rounded-lg flex overflow-hidden border border-earth-sage/20">
                            <div className="h-full bg-status-healthy" style={{ width: '73.8%' }} title="Healthy: 73.8%" />
                            <div className="h-full bg-status-risk" style={{ width: '20.0%' }} title="Warning: 20.0%" />
                            <div className="h-full bg-status-critical" style={{ width: '6.2%' }} title="Critical: 6.2%" />
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-xs font-bold text-earth-cocoa/80">
                            <div className="flex flex-col gap-0.5 border-l-4 border-status-healthy pl-2">
                              <span className="text-[9px] text-earth-cocoa/50 uppercase">Healthy</span>
                              <span className="text-sm font-black">6,210 users</span>
                              <span className="text-[9px] text-status-healthy font-extrabold">73.8%</span>
                            </div>
                            <div className="flex flex-col gap-0.5 border-l-4 border-status-risk pl-2">
                              <span className="text-[9px] text-earth-cocoa/50 uppercase">Warning</span>
                              <span className="text-sm font-black">1,682 users</span>
                              <span className="text-[9px] text-status-risk font-extrabold">20.0%</span>
                            </div>
                            <div className="flex flex-col gap-0.5 border-l-4 border-status-critical pl-2">
                              <span className="text-[9px] text-earth-cocoa/50 uppercase">Critical</span>
                              <span className="text-sm font-black">520 users</span>
                              <span className="text-[9px] text-status-critical font-extrabold">6.2%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recent resolutions log */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                        <div className="flex justify-between items-center border-b border-earth-sage/20 pb-2">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">RECENT RESOLUTIONS</span>
                          <span className="text-[10px] font-bold text-earth-sage uppercase">Automated support interventions</span>
                        </div>

                        <div className="flex flex-col gap-3">
                          <div className="border border-earth-sage/20 bg-earth-bg/30 p-3 rounded-xl flex justify-between items-center">
                            <div className="flex gap-3 items-center">
                              <span className="w-2.5 h-2.5 rounded-full bg-status-healthy" />
                              <div>
                                <h4 className="text-xs font-bold text-earth-cocoa">Atlas Corp</h4>
                                <p className="text-[10px] text-earth-cocoa/75">Sentiment recovered to 85% after grace period extension.</p>
                              </div>
                            </div>
                            <span className="text-[9px] bg-status-healthy/15 text-status-healthy border border-status-healthy/30 px-2 py-0.5 rounded font-extrabold uppercase">Success</span>
                          </div>

                          <div className="border border-earth-sage/20 bg-earth-bg/30 p-3 rounded-xl flex justify-between items-center">
                            <div className="flex gap-3 items-center">
                              <span className="w-2.5 h-2.5 rounded-full bg-status-healthy" />
                              <div>
                                <h4 className="text-xs font-bold text-earth-cocoa">Lagos Ventures</h4>
                                <p className="text-[10px] text-earth-cocoa/75">Invoice issue resolved via automated grace period extension.</p>
                              </div>
                            </div>
                            <span className="text-[9px] bg-status-healthy/15 text-status-healthy border border-status-healthy/30 px-2 py-0.5 rounded font-extrabold uppercase">Success</span>
                          </div>

                          <div className="border border-earth-sage/20 bg-earth-bg/30 p-3 rounded-xl flex justify-between items-center">
                            <div className="flex gap-3 items-center">
                              <span className="w-2.5 h-2.5 rounded-full bg-earth-clay" />
                              <div>
                                <h4 className="text-xs font-bold text-earth-cocoa">Northwind Traders</h4>
                                <p className="text-[10px] text-earth-cocoa/75">Cost-optimization downgrade advice executed.</p>
                              </div>
                            </div>
                            <span className="text-[9px] bg-earth-clay/15 text-earth-clay border border-earth-clay/30 px-2 py-0.5 rounded font-extrabold uppercase">Optimized</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Right Column (Span 4) */}
                    <div className="lg:col-span-4 flex flex-col gap-6 w-full">
                      {/* Experience drivers */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm h-full">
                        <div className="flex flex-col gap-1 border-b border-earth-sage/20 pb-2 w-full text-left">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">EXPERIENCE DRIVERS</span>
                          <span className="text-[10px] font-bold text-earth-sage uppercase">Impact on brand loyalty</span>
                        </div>

                        <div className="flex flex-col gap-4 text-xs font-bold text-earth-cocoa/80 text-left">
                          <div className="flex justify-between items-center p-2 bg-earth-bg/25 rounded-lg border border-earth-sage/10">
                            <div>
                              <span>Uptime SLA</span>
                              <span className="text-[9px] text-earth-cocoa/50 block font-normal mt-0.5">Sustained 99.9% uptime</span>
                            </div>
                            <span className="text-status-healthy font-extrabold">+18%</span>
                          </div>

                          <div className="flex justify-between items-center p-2 bg-earth-bg/25 rounded-lg border border-earth-sage/10">
                            <div>
                              <span>Usage Volume Growth</span>
                              <span className="text-[9px] text-earth-cocoa/50 block font-normal mt-0.5">SaaS active feature growth</span>
                            </div>
                            <span className="text-status-healthy font-extrabold">+12%</span>
                          </div>

                          <div className="flex justify-between items-center p-2 bg-earth-bg/25 rounded-lg border border-earth-sage/10">
                            <div>
                              <span>CSM Check-Ins</span>
                              <span className="text-[9px] text-earth-cocoa/50 block font-normal mt-0.5">Quarterly business reviews</span>
                            </div>
                            <span className="text-status-healthy font-extrabold">+15%</span>
                          </div>

                          <div className="flex justify-between items-center p-2 bg-earth-bg/25 rounded-lg border border-earth-sage/10">
                            <div>
                              <span>Failed Invoices</span>
                              <span className="text-[9px] text-earth-cocoa/50 block font-normal mt-0.5">Declined card frequency</span>
                            </div>
                            <span className="text-status-critical font-extrabold">-8%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </>
              ) : consoleTab === 'customers' ? (
                selectedConsoleUser ? (
                  <ActiveUserInsight 
                    user={users.find(u => u.id === selectedConsoleUser.id) || selectedConsoleUser} 
                    onBack={() => setSelectedConsoleUser(null)} 
                    onUpdateUser={(updatedUser) => {
                      handleUpdateUser(updatedUser);
                      setSelectedConsoleUser(updatedUser);
                    }}
                  />
                ) : (
                  <>
                    {/* Customers View */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full animate-fadeIn">
                    <div>
                      <h1 className="text-xl md:text-2xl font-extrabold text-earth-cocoa tracking-tight font-serif">Customer Directory</h1>
                      <p className="text-xs text-earth-cocoa/75 mt-1 max-w-xl">
                        Manage, search, and monitor active customer accounts, contract value, and health standings.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold shrink-0">
                      <div className="bg-[#276B2B]/15 border border-[#276B2B]/30 rounded-lg px-3 py-1.5 text-status-healthy flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-status-healthy animate-pulse" />
                        <span>System Live</span>
                      </div>
                      <div className="bg-earth-cocoa border border-earth-cocoa text-earth-bg rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Last 24 Hours</span>
                      </div>
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 shadow-sm w-full animate-fadeIn">
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        placeholder="Search customers by name, email, or location..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full bg-earth-bg border border-earth-sage/35 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:border-earth-clay text-earth-cocoa font-bold placeholder-earth-cocoa/50"
                      />
                      <Search className="w-4 h-4 text-earth-cocoa/50 absolute left-3 top-2.5" />
                    </div>

                    <div className="flex gap-3">
                      {/* Filter by Plan */}
                      <select
                        value={filterPlan}
                        onChange={(e) => setFilterPlan(e.target.value)}
                        className="bg-earth-bg border border-earth-sage/35 rounded-xl px-3 py-2 text-xs text-earth-cocoa font-bold outline-none cursor-pointer focus:border-earth-clay min-w-[120px]"
                      >
                        <option value="all">All Plans</option>
                        <option value="enterprise">Enterprise</option>
                        <option value="growth">Growth</option>
                        <option value="starter">Starter</option>
                      </select>

                      {/* Filter by Risk */}
                      <select
                        value={filterRisk}
                        onChange={(e) => setFilterRisk(e.target.value)}
                        className="bg-earth-bg border border-earth-sage/35 rounded-xl px-3 py-2 text-xs text-earth-cocoa font-bold outline-none cursor-pointer focus:border-earth-clay min-w-[120px]"
                      >
                        <option value="all">All Risks</option>
                        <option value="low">Low Risk</option>
                        <option value="medium">Medium Risk</option>
                        <option value="high">High Risk</option>
                      </select>
                    </div>
                  </div>

                  {/* Customer Table List */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl overflow-hidden shadow-sm w-full animate-fadeIn">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-earth-sage/20 bg-earth-sage/10 text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">
                            <th className="py-3 px-4">Customer</th>
                            <th className="py-3 px-4">Plan</th>
                            <th className="py-3 px-4">Health Score</th>
                            <th className="py-3 px-4">Churn Probability</th>
                            <th className="py-3 px-4">Contract MRR</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-earth-sage/10 text-xs">
                          {filteredConsoleUsers.length > 0 ? (
                            filteredConsoleUsers.map(u => {
                              const isHighRisk = u.churnProbability > 50;
                              const isMedRisk = u.churnProbability <= 50 && u.churnProbability > 15;
                              return (
                                <tr key={u.id} className="hover:bg-earth-sage/5 transition-colors text-earth-cocoa">
                                  <td className="py-3 px-4 flex items-center gap-3">
                                    <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full border border-earth-sage/20 object-cover bg-white" />
                                    <div>
                                      <span className="font-extrabold block">{u.name}</span>
                                      <span className="text-[10px] text-earth-cocoa/65 block mt-0.5">{u.email}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="text-[10px] px-2 py-0.5 border border-earth-sage/30 rounded-full font-bold uppercase tracking-wider bg-earth-bg">
                                      {u.plan}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`font-black text-sm ${
                                      u.healthScore > 70 ? 'text-status-healthy' : u.healthScore > 40 ? 'text-status-risk' : 'text-status-critical'
                                    }`}>
                                      {u.healthScore}/100
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 w-48">
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 bg-earth-cocoa/10 rounded-full h-1.5">
                                        <div 
                                          className={`h-1.5 rounded-full ${
                                            isHighRisk ? 'bg-status-critical' : isMedRisk ? 'bg-status-risk' : 'bg-status-healthy'
                                          }`} 
                                          style={{ width: `${u.churnProbability}%` }}
                                        />
                                      </div>
                                      <span className="font-bold text-[10px] w-8 text-right">{Math.round(u.churnProbability)}%</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="font-extrabold text-earth-clay">${u.mrr}/mo</span>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <button 
                                      onClick={() => {
                                        setSelectedConsoleUser(u);
                                      }}
                                      className="bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                                    >
                                      View Insights
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-earth-cocoa/50 font-bold">
                                No customers found matching the search criteria.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  </>
                )
              ) : consoleTab === 'health' ? (
                <>
                  {/* Health View */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full animate-fadeIn">
                    <div>
                      <h1 className="text-xl md:text-2xl font-extrabold text-earth-cocoa tracking-tight font-serif">Customer Health Analytics</h1>
                      <p className="text-xs text-earth-cocoa/75 mt-1 max-w-xl">
                        Aggregated metrics, health trends, and telemetry breakdowns across active cohorts.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold shrink-0">
                      <div className="bg-[#276B2B]/15 border border-[#276B2B]/30 rounded-lg px-3 py-1.5 text-status-healthy flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-status-healthy animate-pulse" />
                        <span>System Live</span>
                      </div>
                      <div className="bg-earth-cocoa border border-earth-cocoa text-earth-bg rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Last 24 Hours</span>
                      </div>
                    </div>
                  </div>

                  {/* Health Metric Cards Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full animate-fadeIn">
                    {/* Card 1 */}
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-earth-cocoa/50 uppercase">Average Portfolio Health</span>
                        <Heart className="w-4 h-4 text-status-healthy" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-earth-cocoa">{avgHealth}</span>
                        <span className="text-[9px] bg-status-healthy/15 text-status-healthy px-1.5 py-0.5 rounded font-extrabold uppercase">Stable</span>
                      </div>
                      <span className="text-[9px] text-earth-cocoa/65">Across all active accounts</span>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-earth-cocoa/50 uppercase">Critical Health Alerts</span>
                        <ShieldAlert className="w-4 h-4 text-status-critical" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-earth-cocoa">{criticalCount}</span>
                        <span className="text-[9px] bg-status-critical/15 text-status-critical px-1.5 py-0.5 rounded font-extrabold uppercase">Action Needed</span>
                      </div>
                      <span className="text-[9px] text-earth-cocoa/65">Users below 40% health score</span>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-earth-cocoa/50 uppercase">Total Portfolio MRR</span>
                        <CreditCard className="w-4 h-4 text-earth-clay" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-earth-cocoa">${totalMRR.toLocaleString()}</span>
                      </div>
                      <span className="text-[9px] text-earth-cocoa/65">Active monthly recurring revenue</span>
                    </div>
                  </div>

                  {/* Main health analytics panels */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch animate-fadeIn">
                    
                    {/* Left Column (Span 7) */}
                    <div className="lg:col-span-7 flex flex-col gap-6 w-full">
                      {/* Telemetry Status Breakdown */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm text-left">
                        <div className="flex justify-between items-center border-b border-earth-sage/20 pb-2">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">TELEMETRY STATUS BREAKDOWN</span>
                          <span className="text-[10px] font-bold text-earth-sage uppercase">System checks</span>
                        </div>

                        <div className="flex flex-col gap-4">
                          {/* Item 1 */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-baseline text-xs">
                              <span className="font-bold text-earth-cocoa">Login Frequency (Engagement)</span>
                              <span className="font-extrabold text-status-healthy">82%</span>
                            </div>
                            <div className="w-full bg-earth-cocoa/10 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-status-healthy" style={{ width: '82%' }} />
                            </div>
                          </div>

                          {/* Item 2 */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-baseline text-xs">
                              <span className="font-bold text-earth-cocoa">Feature Utilization (Usage)</span>
                              <span className="font-extrabold text-earth-clay">64%</span>
                            </div>
                            <div className="w-full bg-earth-cocoa/10 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-earth-clay" style={{ width: '64%' }} />
                            </div>
                          </div>

                          {/* Item 3 */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-baseline text-xs">
                              <span className="font-bold text-earth-cocoa">Support Ticket Resolution (Response)</span>
                              <span className="font-extrabold text-status-healthy">91%</span>
                            </div>
                            <div className="w-full bg-earth-cocoa/10 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-status-healthy" style={{ width: '91%' }} />
                            </div>
                          </div>

                          {/* Item 4 */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-baseline text-xs">
                              <span className="font-bold text-earth-cocoa">Payment & Invoicing (Billing)</span>
                              <span className="font-extrabold text-status-healthy">94%</span>
                            </div>
                            <div className="w-full bg-earth-cocoa/10 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-status-healthy" style={{ width: '94%' }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recent transitions log */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm text-left">
                        <div className="flex justify-between items-center border-b border-earth-sage/20 pb-2">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">HEALTH STATE TRANSITIONS</span>
                          <span className="text-[10px] font-bold text-earth-sage uppercase">Distressed Users</span>
                        </div>

                        <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
                          {users.filter(u => u.healthScore < 70).map(u => (
                            <div key={u.id} className="border border-earth-sage/20 bg-earth-bg/30 p-3 rounded-xl flex justify-between items-center">
                              <div className="flex gap-3 items-center">
                                <span className={`w-2.5 h-2.5 rounded-full ${u.healthScore < 40 ? 'bg-status-critical' : 'bg-status-risk'}`} />
                                <div>
                                  <h4 className="text-xs font-bold text-earth-cocoa">{u.name}</h4>
                                  <p className="text-[10px] text-earth-cocoa/75 mt-0.5">
                                    Risk Factor: {u.warningFlags.join(', ') || 'Low Usage'}
                                  </p>
                                </div>
                              </div>
                              <span className={`text-[10px] font-black ${u.healthScore < 40 ? 'text-status-critical' : 'text-status-risk'}`}>
                                {u.healthScore}/100
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column (Span 5) */}
                    <div className="lg:col-span-5 flex flex-col gap-6 w-full text-left">
                      {/* Health Cohort Segmentation */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm h-full justify-between">
                        <div className="flex flex-col gap-1 border-b border-earth-sage/20 pb-2 w-full">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">HEALTH COHORTS</span>
                          <span className="text-[10px] font-bold text-earth-sage uppercase">Distribution of customer base</span>
                        </div>

                        <div className="flex flex-col gap-4 my-2">
                          {/* Healthy */}
                          <div className="flex justify-between items-center p-3 bg-earth-bg/25 rounded-lg border border-earth-sage/10">
                            <div className="flex items-center gap-2.5">
                              <span className="w-3 h-3 rounded-full bg-status-healthy" />
                              <span className="font-bold text-earth-cocoa">Healthy (Score 70+)</span>
                            </div>
                            <span className="text-status-healthy font-black text-sm">
                              {users.filter(u => u.healthScore >= 70).length} Accounts
                            </span>
                          </div>

                          {/* Warning */}
                          <div className="flex justify-between items-center p-3 bg-earth-bg/25 rounded-lg border border-earth-sage/10">
                            <div className="flex items-center gap-2.5">
                              <span className="w-3 h-3 rounded-full bg-status-risk" />
                              <span className="font-bold text-earth-cocoa">Warning (Score 40-69)</span>
                            </div>
                            <span className="text-status-risk font-black text-sm">
                              {users.filter(u => u.healthScore < 70 && u.healthScore >= 40).length} Accounts
                            </span>
                          </div>

                          {/* Critical */}
                          <div className="flex justify-between items-center p-3 bg-earth-bg/25 rounded-lg border border-earth-sage/10">
                            <div className="flex items-center gap-2.5">
                              <span className="w-3 h-3 rounded-full bg-status-critical" />
                              <span className="font-bold text-earth-cocoa">Critical (Score &lt; 40)</span>
                            </div>
                            <span className="text-status-critical font-black text-sm">
                              {users.filter(u => u.healthScore < 40).length} Accounts
                            </span>
                          </div>
                        </div>

                        <div className="bg-earth-sage/10 p-3 rounded-xl border border-earth-sage/20 text-[10px] text-earth-cocoa/75 leading-relaxed mt-2 italic text-center">
                          ℹ️ Telemetry thresholds and state changes are simulated live and updated dynamically via WebSocket and FastAPI ML pipelines.
                        </div>
                      </div>
                    </div>

                  </div>
                </>
              ) : (
                <>
                  {/* Reports View */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full animate-fadeIn">
                    <div>
                      <h1 className="text-xl md:text-2xl font-extrabold text-earth-cocoa tracking-tight font-serif">Executive & Success Reports</h1>
                      <p className="text-xs text-earth-cocoa/75 mt-1 max-w-xl">
                        Generated summaries, cohort churn analysis reports, and action planning templates.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold shrink-0">
                      <div className="bg-[#276B2B]/15 border border-[#276B2B]/30 rounded-lg px-3 py-1.5 text-status-healthy flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-status-healthy animate-pulse" />
                        <span>System Live</span>
                      </div>
                      <div className="bg-earth-cocoa border border-earth-cocoa text-earth-bg rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Last 24 Hours</span>
                      </div>
                    </div>
                  </div>

                  {/* Reports Metric Cards Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full animate-fadeIn">
                    {/* Card 1 */}
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-earth-cocoa/50 uppercase">Generated Reports</span>
                        <FileText className="w-4 h-4 text-earth-clay" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-earth-cocoa">12</span>
                        <span className="text-[9px] bg-status-healthy/15 text-status-healthy px-1.5 py-0.5 rounded font-extrabold uppercase">Archived</span>
                      </div>
                      <span className="text-[9px] text-earth-cocoa/65">Historical runs preserved</span>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-earth-cocoa/50 uppercase">Rescue Recommendations</span>
                        <Cpu className="w-4 h-4 text-status-healthy" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-earth-cocoa">3 Drafted</span>
                        <span className="text-[9px] bg-status-healthy/15 text-status-healthy px-1.5 py-0.5 rounded font-extrabold uppercase">Ready</span>
                      </div>
                      <span className="text-[9px] text-earth-cocoa/65">Based on active churn risks</span>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-earth-cocoa/50 uppercase">Last Generation Time</span>
                        <RefreshCw className="w-4 h-4 text-earth-clay" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-earth-cocoa">Just Now</span>
                      </div>
                      <span className="text-[9px] text-earth-cocoa/65">Real-time sync complete</span>
                    </div>
                  </div>

                  {/* Main reports grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch animate-fadeIn">
                    
                    {/* Left Column - Reports Archive (Span 8) */}
                    <div className="lg:col-span-8 flex flex-col gap-6 w-full">
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl overflow-hidden shadow-sm w-full text-left">
                        <div className="p-5 border-b border-earth-sage/20 bg-earth-sage/5">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">REPORT LIBRARY</span>
                          <h3 className="text-sm font-bold text-earth-cocoa mt-0.5">Select and view compiled analytical outputs</h3>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead>
                              <tr className="border-b border-earth-sage/20 bg-earth-sage/10 text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">
                                <th className="py-3 px-4">Report Name</th>
                                <th className="py-3 px-4">Type</th>
                                <th className="py-3 px-4">Date Generated</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-earth-sage/10">
                              {reports.map((report) => (
                                <tr key={report.id} className="hover:bg-earth-sage/5 transition-colors text-earth-cocoa">
                                  <td className="py-3.5 px-4 font-bold">{report.name}</td>
                                  <td className="py-3.5 px-4">{report.type}</td>
                                  <td className="py-3.5 px-4">{report.date}</td>
                                  <td className="py-3.5 px-4">
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                      report.status === 'Active'
                                        ? 'bg-status-healthy/15 border border-status-healthy/30 text-status-healthy'
                                        : 'bg-earth-cocoa/20 border border-earth-cocoa/30 text-earth-cocoa'
                                    }`}>
                                      {report.status}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-right">
                                    <button 
                                      onClick={() => downloadReport(report)}
                                      className="flex items-center gap-1 bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all ml-auto cursor-pointer"
                                    >
                                      <Download className="w-3 h-3" />
                                      <span>Download</span>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Report Operations (Span 4) */}
                    <div className="lg:col-span-4 flex flex-col gap-6 w-full text-left">
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm h-full justify-between">
                        <div className="flex flex-col gap-1 border-b border-earth-sage/20 pb-2 w-full">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">REPORT OPERATIONS</span>
                          <span className="text-[10px] font-bold text-earth-sage uppercase">Generate new exports</span>
                        </div>

                        <div className="flex flex-col gap-3 my-2">
                          <button 
                            onClick={generateDynamicRescuePlan}
                            className="w-full bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Cpu className="w-4 h-4 animate-pulse text-status-healthy" />
                            <span>Generate Rescue Plan</span>
                          </button>

                          <div className="bg-earth-bg/25 border border-earth-sage/10 p-4 rounded-xl flex flex-col gap-2">
                            <span className="text-[10px] font-extrabold text-earth-clay uppercase tracking-wider">WEEKLY DIGEST SUMMARY</span>
                            <div className="flex justify-between text-xs text-earth-cocoa font-bold">
                              <span>Active Risk Accounts:</span>
                              <span className="text-status-risk font-black">
                                {users.filter(u => u.healthScore < 70).length}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-earth-cocoa font-bold">
                              <span>Critical Interventions:</span>
                              <span className="text-status-critical font-black">
                                {users.filter(u => u.healthScore < 40).length}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-earth-cocoa font-bold">
                              <span>Estimated Churn Prevented:</span>
                              <span className="text-status-healthy font-black">$14,200/mo</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-earth-sage/10 p-3 rounded-xl border border-earth-sage/20 text-[10px] text-earth-cocoa/75 leading-relaxed mt-2 italic text-center">
                          ℹ️ All success reports are cataloged using SHA-256 state tracking for absolute data integrity and audit readiness.
                        </div>
                      </div>
                    </div>

                  </div>
                </>
              )}
            </div>
          </div>
        ) : currentPage === 'client_dashboard' ? (
          <div className="w-full max-w-4xl mx-auto px-6 py-12 text-left flex flex-col gap-8 animate-fadeIn bg-earth-bg min-h-[calc(100vh-80px)]">
            {/* Header section */}
            <div className="flex justify-between items-center border-b pb-4 border-earth-sage/35">
              <div>
                <span className="text-[10px] uppercase font-bold text-earth-clay tracking-wider">Subscriber Portal</span>
                <h2 className="text-2xl font-extrabold mt-0.5 text-earth-cocoa font-serif">Client Self-Service Console</h2>
              </div>
              <button 
                onClick={() => setCurrentPage('marketing')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer bg-earth-cocoa border-earth-cocoa/20 text-earth-bg hover:bg-earth-clay"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Overview</span>
              </button>
            </div>

            {/* Profile Switcher dropdown */}
            <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-earth-cocoa">Switch Client View (CSM Sandbox Tool)</h3>
                <p className="text-xs text-earth-cocoa/75 mt-1">
                  Change active customer profiles to preview different billing or underutilization states.
                </p>
              </div>
              <select
                value={clientUserId}
                onChange={(e) => setClientUserId(e.target.value)}
                className="bg-earth-bg border border-earth-sage/35 rounded-lg p-2 text-xs text-earth-cocoa font-bold outline-none cursor-pointer focus:border-earth-clay min-w-[200px]"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.plan})</option>
                ))}
              </select>
            </div>

            {/* Main dashboard grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch font-sans">
              
              {/* Left Column: Subscription & Profile details (Span 4) */}
              <div className="md:col-span-5 flex flex-col gap-6 w-full">
                <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-6 rounded-2xl flex flex-col gap-4 shadow-sm h-full justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src={users.find(u => u.id === clientUserId)?.avatar || users[0]?.avatar} 
                      alt={users.find(u => u.id === clientUserId)?.name || users[0]?.name} 
                      className="w-16 h-16 rounded-full border border-earth-sage/40 object-cover bg-white" 
                    />
                    <div>
                      <h3 className="font-bold text-earth-cocoa text-base leading-tight">
                        {users.find(u => u.id === clientUserId)?.name || users[0]?.name}
                      </h3>
                      <span className="text-[10px] text-earth-cocoa/65 mt-1 block">
                        {users.find(u => u.id === clientUserId)?.email || users[0]?.email}
                      </span>
                      <span className="text-[10px] text-earth-cocoa/65 mt-0.5 block">
                        {users.find(u => u.id === clientUserId)?.location || users[0]?.location}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-earth-sage/20 pt-4 flex flex-col gap-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-earth-cocoa/65">Subscription Plan:</span>
                      <span className="font-bold text-earth-cocoa uppercase tracking-wider text-[11px]">
                        {users.find(u => u.id === clientUserId)?.plan || users[0]?.plan}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-earth-cocoa/65">Monthly Contract MRR:</span>
                      <span className="font-bold text-earth-clay">
                        ${users.find(u => u.id === clientUserId)?.mrr || users[0]?.mrr}/mo
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-earth-cocoa/65">Billing Status:</span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        (users.find(u => u.id === clientUserId) || users[0])?.warningFlags.includes('Failed Payment')
                          ? 'bg-status-critical/15 border border-status-critical/30 text-status-critical'
                          : 'bg-status-healthy/15 border border-status-healthy/30 text-status-healthy'
                      }`}>
                        {(users.find(u => u.id === clientUserId) || users[0])?.warningFlags.includes('Failed Payment') ? 'Past Due' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Gauges (Span 8) */}
              <div className="md:col-span-7 flex flex-col gap-6 w-full">
                <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-6 rounded-2xl flex flex-col gap-6 shadow-sm justify-between">
                  {/* Gauge 1: Usage Limits */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-earth-cocoa/75">PACKAGE LIMITS UTILIZATION</span>
                      <span className="font-extrabold text-earth-clay">
                        {Math.round(((users.find(u => u.id === clientUserId) || users[0])?.metrics.usageVelocity || 0) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-earth-cocoa/10 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          ((users.find(u => u.id === clientUserId) || users[0])?.metrics.usageVelocity || 0) < 0.35 ? 'bg-status-risk' : 'bg-status-healthy'
                        }`}
                        style={{ width: `${Math.round(((users.find(u => u.id === clientUserId) || users[0])?.metrics.usageVelocity || 0) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-earth-cocoa/60 leading-normal">
                      Based on your login sessions, data throughput, and active seat allocation.
                    </span>
                  </div>

                  {/* Gauge 2: Service SLA health score */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-earth-cocoa/75">SERVICE HEALTH SCORE</span>
                      <span className="font-extrabold text-status-healthy">
                        {(users.find(u => u.id === clientUserId) || users[0])?.healthScore}/100
                      </span>
                    </div>
                    <div className="w-full bg-earth-cocoa/10 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-status-healthy"
                        style={{ width: `${(users.find(u => u.id === clientUserId) || users[0])?.healthScore}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-earth-cocoa/60 leading-normal">
                      We track service uptime and response times to ensure your subscription remains stable.
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* WOW FACTOR INTERVENTIONS SECTION */}
            <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
              <h3 className="text-xs font-bold text-earth-cocoa uppercase tracking-wider">SubSentry Active Value Guard recommendations</h3>
              
              {/* Case A: Underutilization -> Downgrade suggestion */}
              {((users.find(u => u.id === clientUserId) || users[0])?.metrics.usageVelocity || 0) < 0.35 && (users.find(u => u.id === clientUserId) || users[0])?.plan !== 'Starter' && (
                <div className="bg-status-healthy/10 border border-status-healthy/30 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 animate-slideDown">
                  <div className="flex-1 text-left">
                    <h4 className="text-xs font-bold text-status-healthy uppercase tracking-wider flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-status-healthy" />
                      Recommended Saving Action
                    </h4>
                    <p className="text-xs text-earth-cocoa mt-1.5 leading-relaxed">
                      We noticed you are only using <strong>{Math.round(((users.find(u => u.id === clientUserId) || users[0])?.metrics.usageVelocity || 0) * 100)}%</strong> of your package limits. 
                      Downgrade to the <strong>Starter Plan</strong> to save <strong>$1,500/mo</strong> while retaining your core features. We value your trust over empty spend!
                    </p>
                  </div>
                  <button 
                    onClick={() => handleClientAction(clientUserId, 'downgrade')}
                    className="bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Execute 1-Click Downgrade
                  </button>
                </div>
              )}

              {/* Case B: Payment Issue -> Request extension */}
              {(users.find(u => u.id === clientUserId) || users[0])?.warningFlags.includes('Failed Payment') && (
                <div className="bg-status-critical/10 border border-status-critical/30 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 animate-slideDown">
                  <div className="flex-1 text-left">
                    <h4 className="text-xs font-bold text-status-critical uppercase tracking-wider">
                      ⚠️ Payment Delinquency Grace Alert
                    </h4>
                    <p className="text-xs text-earth-cocoa mt-1.5 leading-relaxed">
                      Your invoice payment renewal failed (declined bank transaction). 
                      Request an automatic <strong>7-day grace extension</strong> to keep services fully active while you contact your bank.
                    </p>
                  </div>
                  <button 
                    onClick={() => handleClientAction(clientUserId, 'extend_grace')}
                    className="bg-status-critical hover:bg-status-critical-deep text-earth-bg font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Request 7-Day Extension
                  </button>
                </div>
              )}

              {/* Default State: Healthy */}
              {!(((users.find(u => u.id === clientUserId) || users[0])?.metrics.usageVelocity || 0) < 0.35 && (users.find(u => u.id === clientUserId) || users[0])?.plan !== 'Starter') && !(users.find(u => u.id === clientUserId) || users[0])?.warningFlags.includes('Failed Payment') && (
                <div className="bg-earth-cocoa/5 border border-earth-sage/20 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1 text-left">
                    <h4 className="text-xs font-bold text-earth-cocoa/75 uppercase tracking-wider">
                      Subscription Status: Healthy
                    </h4>
                    <p className="text-xs text-earth-cocoa/70 mt-1.5 leading-relaxed">
                      Your services are fully configured and functional. Uptime SLA is currently operating at 99.98% across all active regions.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Service Log Ticker */}
            <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-5 rounded-2xl flex flex-col gap-3 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-earth-cocoa/65">YOUR RECENT ACCOUNT HISTORY LOG</span>
              <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto">
                {((users.find(u => u.id === clientUserId) || users[0])?.activityLogs || []).map((log, idx) => (
                  <div key={idx} className="flex gap-2 text-[10px] text-earth-cocoa/75 items-start">
                    <span className="font-bold text-earth-sage shrink-0">{log.date}</span>
                    <span className="text-earth-cocoa/30 shrink-0">|</span>
                    <span className="text-left flex-1 leading-normal">{log.details}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-full">
            {currentPage === 'marketing' && (
              <>
                {/* HERO HERO SECTION */}
            
            {/* HERO HERO SECTION */}
            <div className="w-full max-w-7xl mx-auto px-6 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[calc(100vh-80px)]">
              
              {/* Left Column: Hero Text & Features (Span 5) */}
              <div className="lg:col-span-5 flex flex-col gap-6 text-left">
                
                {/* Glowing Badge */}
                <div className="self-start bg-earth-sage/20 border border-earth-sage/40 text-earth-cocoa text-[10px] px-3 py-1 rounded-full font-extrabold uppercase tracking-widest shadow-sm">
                  ⚡ Know Who's About to Leave — and Why
                </div>

                {/* Hero Heading */}
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-earth-cocoa leading-[1.1]">
                  Turn Cancellations into <span className="text-earth-clay">Loyalty Opportunities.</span>
                </h1>

                {/* Hero Description */}
                <p className="text-sm md:text-base text-earth-cocoa/80 leading-relaxed">
                  SubSentry watches how your customers use your product, spots the ones losing interest before they cancel, explains in plain language what's frustrating them, and drafts personalized win-back emails based on what has worked before.
                </p>

                {/* Hero CTAs */}
                <div className="flex flex-wrap gap-4 mt-2">
                  <button 
                    onClick={scrollToConsole}
                    className="bg-earth-cocoa hover:bg-earth-clay text-earth-bg px-6 py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-earth-cocoa/25 transition-all duration-200 flex items-center gap-2 group cursor-pointer"
                  >
                    <span>Launch Admin Console</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  
                  <button 
                    onClick={() => {
                      setPulseTrigger(prev => prev + 1);
                      addTelemetry('Highlighted all active customers on the globe.');
                    }}
                    className="bg-[#efe9d2] hover:bg-[#e4ddc3] border border-earth-sage/40 text-earth-cocoa px-6 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer"
                  >
                    Highlight Active Customers
                  </button>
                </div>

                {/* Micro Features bullet items */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-earth-sage/20 text-xs text-earth-cocoa/70 font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-earth-clay" />
                    <span>Live Activity Tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-earth-sage" />
                    <span>Plain-Language Risk Reasons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-earth-clay" />
                    <span>AI Email Assistant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-earth-sage" />
                    <span>Extra Time for Payment Issues</span>
                  </div>
                </div>
              </div>

              {/* Right Column: 3D rotating Globe (Span 7) */}
              <div className="lg:col-span-7 bg-[#efe9d2]/15 border border-earth-sage/35 rounded-3xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                <div className="absolute top-4 left-4 z-10 flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold text-earth-cocoa/50 tracking-wider">Live System Activity</span>
                  <h2 className="text-sm font-bold text-earth-cocoa mt-0.5">Global User Heatmap</h2>
                </div>
                <Globe onSelectUser={handleSelectUser} selectedUser={selectedUser} users={users} pulseTrigger={pulseTrigger} />
              </div>

              {/* Scroll down indicator */}
              <div className="col-span-12 flex justify-center mt-4">
                <button 
                  onClick={scrollToConsole}
                  className="flex flex-col items-center gap-1.5 text-xs text-earth-cocoa/50 hover:text-earth-cocoa transition-colors cursor-pointer animate-bounce"
                >
                  <span>Scroll to Dashboard Console</span>
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* MARKETING FEATURES LISTING */}
            <div id="features" className="w-full bg-[#efe9d2]/20 border-y border-earth-sage/30 py-16 px-6 text-left select-none">
              <div className="max-w-7xl mx-auto flex flex-col gap-10">
                <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-earth-clay">What SubSentry Does</span>
                  <h2 className="text-2xl font-extrabold text-earth-cocoa">Keep More Customers, With Less Guesswork.</h2>
                  <p className="text-xs text-earth-cocoa/75 leading-relaxed">
                    Most businesses only find out why a customer left after it's too late. SubSentry tells your team who is at risk, why, and exactly what to do about it — in plain language.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Feature 1 */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-6 rounded-2xl flex flex-col gap-3 shadow-sm">
                    <div className="bg-earth-sage/20 text-earth-cocoa p-2.5 rounded-xl w-fit">
                      <Cpu className="w-5 h-5 text-earth-clay" />
                    </div>
                    <h3 className="font-bold text-earth-cocoa text-sm">Know Why, Not Just Who</h3>
                    <p className="text-xs text-earth-cocoa/70 leading-relaxed">
                      We don't just flag customers who might leave. For each one, we show exactly which behaviors are raising or lowering their risk — no guesswork needed.
                    </p>
                  </div>

                  {/* Feature 2 */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-6 rounded-2xl flex flex-col gap-3 shadow-sm">
                    <div className="bg-earth-sage/20 text-earth-cocoa p-2.5 rounded-xl w-fit">
                      <MessageSquare className="w-5 h-5 text-earth-clay" />
                    </div>
                    <h3 className="font-bold text-earth-cocoa text-sm">Learn From Past Wins</h3>
                    <p className="text-xs text-earth-cocoa/70 leading-relaxed">
                      SubSentry compares each at-risk customer with similar customers from the past — and shows you which rescue strategies actually kept them around.
                    </p>
                  </div>

                  {/* Feature 3 */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-6 rounded-2xl flex flex-col gap-3 shadow-sm">
                    <div className="bg-earth-sage/20 text-earth-cocoa p-2.5 rounded-xl w-fit">
                      <HeartHandshake className="w-5 h-5 text-earth-clay" />
                    </div>
                    <h3 className="font-bold text-earth-cocoa text-sm">One-Click Actions</h3>
                    <p className="text-xs text-earth-cocoa/70 leading-relaxed">
                      Help your team act fast: give customers extra time on a missed payment, send helpful tutorials, or schedule a check-in call — all with one click.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

            {/* BELOW THE FOLD: ADMIN CONSOLE DASHBOARD */}
            <div 
              ref={consoleRef}
              className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8 scroll-mt-20 text-left"
            >
              
              <div className="flex justify-between items-center border-b pb-4 border-earth-sage/35">
                <div>
                  <span className="text-[10px] uppercase font-bold text-earth-clay tracking-wider">SubSentry Workspace</span>
                  <h2 className="text-xl font-extrabold mt-0.5 text-earth-cocoa">Customer Directory Panel</h2>
                </div>
                <button 
                  onClick={() => setShowModelModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-200 cursor-pointer bg-earth-cocoa border-earth-cocoa/20 text-earth-bg hover:bg-earth-clay"
                >
                  <Cpu className="w-3.5 h-3.5 text-earth-clay animate-pulse" />
                  <span>How Predictions Work</span>
                </button>
              </div>

              <div className={`rounded-2xl p-5 shadow-sm transition-all duration-300 border ${isDark ? 'console-card-dark' : 'bg-[#efe9d2]/40 border-earth-sage/30'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-sm font-bold ${textPrimary}`}>Customer Health Tracker</h3>
                  <span className={`text-[10px] font-bold ${textMuted}`}>* Click on any row to see customer details</span>
                </div>
                
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className={`border-b uppercase tracking-wider font-bold transition-colors duration-300 ${isDark ? 'border-earth-bg/15 text-earth-bg/60' : 'border-earth-sage/45 text-earth-cocoa/60'}`}>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Plan & Revenue</th>
                        <th className="py-3 px-4 text-center">Health</th>
                        <th className="py-3 px-4 text-center">Risk of Leaving</th>
                        <th className="py-3 px-4">Warnings</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr 
                          key={u.id} 
                          onClick={() => handleSelectUser(u)}
                          className={`border-b transition-colors cursor-pointer ${isDark ? 'border-earth-bg/10 hover:bg-earth-bg/5' : 'border-earth-sage/20 hover:bg-[#efe9d2]/40'}`}
                        >
                          <td className="py-3 px-4 flex items-center gap-3">
                            <img src={u.avatar} alt={u.name} className={`w-8 h-8 rounded-full object-cover border ${isDark ? 'border-earth-bg/25' : 'border-earth-sage/40'}`} />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold block ${textPrimary}`}>{u.name}</span>
                                <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                                  u.state === 'active'
                                    ? (isDark ? 'bg-status-healthy/15 border border-status-healthy/40 text-status-healthy' : 'bg-status-healthy-deep/10 border border-status-healthy-deep/35 text-status-healthy-deep')
                                    : u.state === 'frustrated'
                                    ? (isDark ? 'bg-status-risk/15 border border-status-risk/40 text-status-risk animate-pulse' : 'bg-status-risk-deep/10 border border-status-risk-deep/35 text-status-risk-deep animate-pulse')
                                    : u.state === 'disengaged'
                                    ? (isDark ? 'bg-status-critical/15 border border-status-critical/40 text-status-critical' : 'bg-status-critical-deep/10 border border-status-critical-deep/35 text-status-critical-deep')
                                    : (isDark ? 'bg-earth-bg/10 border border-earth-bg/25 text-earth-bg/50' : 'bg-earth-cocoa/10 border border-earth-cocoa/25 text-earth-cocoa/50')
                                }`}>
                                  {u.state}
                                </span>
                              </div>
                              <span className={`text-[10px] ${textMuted}`}>{u.email}</span>
                            </div>
                          </td>
                          <td className={`py-3 px-4 ${isDark ? 'text-earth-bg/90' : 'text-earth-cocoa/90'}`}>{u.location}</td>
                          <td className="py-3 px-4">
                            <span className={`font-semibold block ${textPrimary}`}>{u.plan}</span>
                            <span className={`text-[10px] ${textMuted}`}>${u.mrr}/mo</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block font-bold px-2 py-0.5 rounded ${
                              u.healthScore > 70
                                ? (isDark ? 'bg-status-healthy/15 text-status-healthy border border-status-healthy/40' : 'bg-status-healthy-deep/10 text-status-healthy-deep border border-status-healthy-deep/35')
                                : u.healthScore > 40
                                ? (isDark ? 'bg-status-risk/15 text-status-risk border border-status-risk/40' : 'bg-status-risk-deep/10 text-status-risk-deep border border-status-risk-deep/35')
                                : (isDark ? 'bg-status-critical/15 text-status-critical border border-status-critical/40' : 'bg-status-critical-deep/10 text-status-critical-deep border border-status-critical-deep/35')
                            }`}>
                              {u.healthScore}/100
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block font-bold ${
                              u.churnProbability > 50
                                ? (isDark ? 'text-status-critical animate-pulse' : 'text-status-critical-deep animate-pulse')
                                : u.churnProbability > 15
                                ? (isDark ? 'text-status-risk' : 'text-status-risk-deep')
                                : (isDark ? 'text-status-healthy' : 'text-status-healthy-deep')
                            }`}>
                              {u.churnProbability}%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {u.warningFlags.length === 0 ? (
                                <span className={`text-[10px] italic ${textMuted}`}>None</span>
                              ) : (
                                u.warningFlags.map(f => (
                                  <span 
                                    key={f} 
                                    className={`border text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${isDark ? 'bg-status-risk/10 border-status-risk/35 text-status-risk' : 'bg-status-risk-deep/10 border-status-risk-deep/35 text-status-risk-deep'}`}
                                  >
                                    {f}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button 
                              className={`border px-3.5 py-1.5 rounded-xl font-bold text-[11px] transition-colors cursor-pointer ${
                                isDark 
                                  ? 'bg-earth-bg border-earth-bg hover:bg-earth-sage text-earth-cocoa' 
                                  : 'bg-earth-cocoa border-earth-cocoa/20 text-earth-bg hover:bg-earth-clay'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectUser(u);
                              }}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        )}
      </main>

      {/* 3. Global Footer */}
      <footer className="bg-earth-bg border-t border-earth-sage/35 py-6 text-center text-earth-cocoa/50 text-[10px] select-none mt-auto">
        <p>&copy; 2026 SubSentry Platform. Helping subscription businesses keep their customers happy.</p>
      </footer>

      {/* 4. Machine Learning Model Analytics Modal Overlay */}
      {showModelModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300"
          onClick={() => setShowModelModal(false)}
        >
          <div 
            className="bg-[#4E220F] border border-earth-sage/30 rounded-3xl max-w-4xl w-full p-6 text-left relative shadow-2xl flex flex-col gap-4 animate-scaleUp max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-earth-sage/20 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-earth-sage tracking-wider">Behind the Scenes</span>
                <h2 className="text-lg font-bold text-earth-bg mt-0.5">How Accurate Are Our Predictions?</h2>
              </div>
              <button 
                onClick={() => setShowModelModal(false)}
                className="text-earth-bg/60 hover:text-earth-bg text-sm font-bold cursor-pointer bg-earth-bg/5 hover:bg-earth-bg/10 px-3 py-1.5 rounded-xl transition-all"
              >
                Close
              </button>
            </div>

            {/* Model Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
              <div className="bg-earth-bg/5 border border-earth-sage/15 p-4 rounded-2xl">
                <span className="text-[9px] font-bold text-earth-sage/75 block">LEARNED FROM</span>
                <span className="text-base font-extrabold text-earth-bg mt-1 block">7,043 Real Customers</span>
                <span className="text-[10px] text-earth-bg/50 mt-0.5 block">Real subscription histories, incl. who left and why</span>
              </div>
              <div className="bg-earth-bg/5 border border-earth-sage/15 p-4 rounded-2xl">
                <span className="text-[9px] font-bold text-earth-sage/75 block">HOW IT PREDICTS</span>
                <span className="text-base font-extrabold text-earth-bg mt-1 block">Pattern Recognition</span>
                <span className="text-[10px] text-earth-bg/50 mt-0.5 block">AI that learns from past customer behavior</span>
              </div>
              <div className="bg-earth-bg/5 border border-earth-sage/15 p-4 rounded-2xl">
                <span className="text-[9px] font-bold text-earth-sage/75 block">PREDICTION QUALITY</span>
                <span className="text-base font-extrabold text-earth-sage mt-1 block">83 / 100</span>
                <span className="text-[10px] text-earth-bg/50 mt-0.5 block">Reliably tells at-risk customers apart from loyal ones</span>
              </div>
              <div className="bg-earth-bg/5 border border-earth-sage/15 p-4 rounded-2xl">
                <span className="text-[9px] font-bold text-earth-sage/75 block">OVERALL ACCURACY</span>
                <span className="text-base font-extrabold text-earth-bg mt-1 block">80.5%</span>
                <span className="text-[10px] text-earth-bg/50 mt-0.5 block">Right about 8 out of 10 customers it has never seen</span>
              </div>
            </div>

            {/* Plot Evaluation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Confusion Matrix Card */}
              <div className="bg-earth-bg/5 border border-earth-sage/15 p-5 rounded-2xl flex flex-col gap-3">
                <h4 className="text-xs font-bold text-earth-bg uppercase tracking-wider">Predictions vs. What Really Happened</h4>
                <img src="/confusion_matrix.png" alt="Chart comparing predictions with real outcomes" className="w-full h-auto rounded-xl border border-earth-sage/20 object-cover bg-white" />
                <p className="text-[10px] text-earth-bg/60 leading-normal">
                  <strong>What this means</strong>: We tested the system on 1,359 customers it had never seen. It correctly flagged <strong>168 customers who really did leave</strong> and correctly cleared <strong>968 who stayed</strong> — so your team gets real warnings, not constant false alarms.
                </p>
              </div>

              {/* ROC Curve Card */}
              <div className="bg-earth-bg/5 border border-earth-sage/15 p-5 rounded-2xl flex flex-col gap-3">
                <h4 className="text-xs font-bold text-earth-bg uppercase tracking-wider">Telling At-Risk From Loyal Customers</h4>
                <img src="/roc_auc_curve.png" alt="Chart showing how well the system separates at-risk customers from loyal ones" className="w-full h-auto rounded-xl border border-earth-sage/20 object-cover bg-white" />
                <p className="text-[10px] text-earth-bg/60 leading-normal">
                  <strong>What this means</strong>: This chart measures how well SubSentry separates customers likely to leave from loyal ones. It scores <strong>83 out of 100</strong> — well above chance (50) — so the risk scores you see are dependable at any customer volume.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Custom Success Report Modal Overlay */}
      {reportModalData.isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300 animate-fadeIn"
          onClick={() => setReportModalData(prev => ({ ...prev, isOpen: false }))}
        >
          <div 
            className="bg-[#efe9d2] border-2 border-earth-sage text-earth-cocoa rounded-3xl max-w-md w-full p-6 text-left relative shadow-2xl flex flex-col gap-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success Header Icon */}
            <div className="flex items-center gap-4">
              <div className="bg-status-healthy/20 text-status-healthy p-3 rounded-full border border-status-healthy/30 w-fit">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-earth-clay tracking-wider">SubSentry Success Engine</span>
                <h2 className="text-lg font-serif font-black text-earth-cocoa mt-0.5">Report Generated!</h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="text-xs text-earth-cocoa/80 leading-relaxed border-y border-earth-sage/20 py-4 flex flex-col gap-2">
              <p>
                A new **Churn Rescue Plan & Customer Health Assessment** has been compiled successfully using live telemetry data.
              </p>
              <div className="bg-earth-bg/40 p-3 rounded-xl border border-earth-sage/15 flex flex-col gap-1.5 mt-1">
                <div className="flex justify-between font-bold">
                  <span>Report Name:</span>
                  <span className="text-earth-clay font-extrabold truncate max-w-[200px]">{reportModalData.reportName}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>At-Risk Customers Audited:</span>
                  <span className="text-status-risk font-extrabold">{reportModalData.distressedCount} Accounts</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Report Status:</span>
                  <span className="text-status-healthy font-extrabold">Ready / Downloadable</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 justify-end mt-2">
              <button 
                onClick={() => setReportModalData(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 bg-[#e4ddc3] hover:bg-[#d8cfb3] text-earth-cocoa font-bold text-xs rounded-xl transition-all cursor-pointer border border-earth-sage/20"
              >
                Close & View Library
              </button>
              
              <button 
                onClick={() => {
                  if (reportModalData.report) {
                    downloadReport(reportModalData.report);
                  }
                  setReportModalData(prev => ({ ...prev, isOpen: false }));
                }}
                className="px-4 py-2.5 bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report (.md)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Custom Outage Alert Modal Overlay */}
      {showOutageAlertModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300 animate-fadeIn"
          onClick={() => setShowOutageAlertModal(false)}
        >
          <div 
            className="bg-[#efe9d2] border-2 border-status-critical text-earth-cocoa rounded-3xl max-w-md w-full p-6 text-left relative shadow-2xl flex flex-col gap-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Header Icon */}
            <div className="flex items-center gap-4">
              <div className="bg-status-critical/20 text-status-critical p-3 rounded-full border border-status-critical/30 w-fit animate-pulse">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-status-critical tracking-wider">SubSentry Incident Injection</span>
                <h2 className="text-lg font-serif font-black text-earth-cocoa mt-0.5">Outage Injected!</h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="text-xs text-earth-cocoa/80 leading-relaxed border-y border-earth-sage/20 py-4 flex flex-col gap-2">
              <p>
                A simulated regional server outage incident has been successfully injected into your active database.
              </p>
              <div className="bg-earth-bg/40 p-3 rounded-xl border border-earth-sage/15 flex flex-col gap-1.5 mt-1">
                <div className="flex justify-between font-bold">
                  <span>Injected Incident:</span>
                  <span className="text-status-critical font-extrabold">US-West Node latency spike</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Impacted Accounts:</span>
                  <span className="text-earth-clay font-extrabold">Northwind, Summit, Singapore Tech</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Simulation Status:</span>
                  <span className="text-status-risk font-extrabold animate-pulse">Real-time Churn Calculation Active</span>
                </div>
              </div>
              <p className="text-[10px] text-earth-cocoa/65 italic mt-1 leading-normal">
                Observe the Live Stream for automated support interventions and check the Customers Directory list to view AI-powered rescue plan updates.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 justify-end mt-2">
              <button 
                onClick={() => {
                  setShowOutageAlertModal(false);
                  setConsoleTab('live_stream');
                }}
                className="px-4 py-2.5 bg-[#e4ddc3] hover:bg-[#d8cfb3] text-earth-cocoa font-bold text-xs rounded-xl transition-all cursor-pointer border border-earth-sage/20"
              >
                Go to Live Stream
              </button>
              
              <button 
                onClick={() => {
                  setShowOutageAlertModal(false);
                  setConsoleTab('customers');
                }}
                className="px-4 py-2.5 bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
              >
                Investigate Customers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
