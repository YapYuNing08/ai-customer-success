import { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Play, Pause, Settings, Radio, ArrowDown, ChevronRight, 
  MessageSquare, Cpu, HeartHandshake
} from 'lucide-react';
import { mockUsers, mergeBackendCustomer, type ActiveUser } from './utils/mockData';
import { Globe } from './components/Globe';
import { ActiveUserInsight } from './components/ActiveUserInsight';
import { getCustomers } from './lib/api';

function App() {
  const [currentPage, setCurrentPage] = useState<'marketing' | 'console' | 'insight'>('console');
  const [users, setUsers] = useState<ActiveUser[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<ActiveUser | null>(null);

  // Fetch live customer summaries from FastAPI backend
  useEffect(() => {
    getCustomers()
      .then((data) => {
        if (data && data.length > 0) {
          const merged = data.map((c: any) => mergeBackendCustomer(c));
          setUsers(merged);
          setTelemetryFeed(prev => [
            `[${new Date().toLocaleTimeString()}] Live connection to FastAPI established. Synced ${merged.length} active clients.`,
            ...prev
          ]);
        }
      })
      .catch((err) => {
        console.warn('Backend API connection failed, falling back to local simulation data.', err);
        setTelemetryFeed(prev => [
          `[${new Date().toLocaleTimeString()}] ALERT: Backend API unreachable. Running in offline fallback mode.`,
          ...prev
        ]);
      });
  }, []);
  
  // Simulation States (Concept 1: Digital Twin Sandbox)
  const [isSimulating, setIsSimulating] = useState(true);
  const [outageRate, setOutageRate] = useState(15);
  const [billingFailureRate, setBillingFailureRate] = useState(10);
  const [telemetryFeed, setTelemetryFeed] = useState<string[]>([
    'System Sentry initialized. Real-time telemetry connection established.',
    'Synced 8 active enterprise connections globally.',
  ]);
  const [pulseTrigger, setPulseTrigger] = useState(0);
  const [showModelModal, setShowModelModal] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState<'admin' | 'customer'>('admin');
  const [customerPortalUserId, setCustomerPortalUserId] = useState<string>('cus_001');

  const consoleRef = useRef<HTMLDivElement>(null);

  const scrollToConsole = () => {
    if (currentPage === 'marketing') {
      consoleRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setCurrentPage('console');
    }
  };

  // Handle selected user from the Globe tooltip
  const handleSelectUser = (user: ActiveUser) => {
    const latestUser = users.find(u => u.id === user.id) || user;
    setSelectedUser(latestUser);
    setCurrentPage('insight');
    addTelemetry(`Navigated to Insight details for account: ${latestUser.name}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleUpdateUser = (updatedUser: ActiveUser) => {
    // Transition customer back to ACTIVE state and resolve warning flags when CSM acts
    const recoveredUser: ActiveUser = {
      ...updatedUser,
      state: 'active',
      healthScore: Math.min(98, updatedUser.healthScore + 20),
      churnProbability: Math.max(5, updatedUser.churnProbability - 30),
      warningFlags: updatedUser.warningFlags.filter(f => f !== 'Usage Decay' && f !== 'Failed Payment')
    };
    setUsers(prev => prev.map(u => u.id === recoveredUser.id ? recoveredUser : u));
    setSelectedUser(recoveredUser);
    addTelemetry(`[CSM Intervention] Saved ${recoveredUser.name}: State restored to ACTIVE. Churn risk reduced to ${recoveredUser.churnProbability}%.`);
  };

  const addTelemetry = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setTelemetryFeed(prev => [`[${time}] ${msg}`, ...prev.slice(0, 15)]);
  };

  const handleCustomerSelfAction = (customerId: string, action: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== customerId) return u;
      const updated = { ...u };
      if (action === 'downgrade') {
        updated.plan = 'Starter';
        updated.mrr = 150;
        updated.state = 'active';
        updated.healthScore = Math.min(96, updated.healthScore + 25);
        updated.churnProbability = Math.max(3, updated.churnProbability - 35);
        updated.warningFlags = updated.warningFlags.filter(f => f !== 'Usage Decay' && f !== 'Failed Payment');
        updated.activityLogs = [
          {
            date: new Date().toISOString().split('T')[0],
            details: 'CUSTOMER OPTIMIZATION: Self-downgraded subscription to Starter Plan ($150/mo) to match actual limits.'
          },
          ...updated.activityLogs
        ];
        addTelemetry(`[Customer Action] ${updated.name} self-downgraded subscription to Starter Plan ($150/mo). Active customer trust score maximized!`);
      } else if (action === 'extend_grace') {
        updated.state = 'active';
        updated.metrics.failedPayments = 0;
        updated.healthScore = Math.min(90, updated.healthScore + 20);
        updated.churnProbability = Math.max(10, updated.churnProbability - 25);
        updated.warningFlags = updated.warningFlags.filter(f => f !== 'Failed Payment');
        updated.activityLogs = [
          {
            date: new Date().toISOString().split('T')[0],
            details: 'BILLING REPAIR: Requested 7-day payment grace extension. Services restored to fully active.'
          },
          ...updated.activityLogs
        ];
        addTelemetry(`[Customer Action] ${updated.name} requested 7-day billing grace period. Cancellation risk resolved.`);
      } else if (action === 'refresh') {
        addTelemetry(`[Customer Activity] ${updated.name} executed automated value health check. System operating normally.`);
      }
      return updated;
    }));
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
          if (!u.warningFlags.includes('Usage Decay')) {
            u.warningFlags.push('Usage Decay');
          }
          u.activityLogs.unshift({
            date: new Date().toISOString().split('T')[0],
            type: 'login',
            details: 'WARNING: Telemetry heartbeat showing zero session logins over 72 hours.'
          });
          updatedList[i] = u;
          didChange = true;
          addTelemetry(`[State Transition] ${u.name} decayed from FRUSTRATED to DISENGAGED (Quiet Churn). Churn risk: ${u.churnProbability}%.`);
          break; // Process one state transition per tick to keep feed clean
        }

        // Transition 2: DISENGAGED -> CHURNED (Subscription Canceled)
        if (u.state === 'disengaged' && Math.random() < 0.15) {
          u.state = 'churned';
          u.healthScore = 0;
          u.churnProbability = 100;
          u.warningFlags = ['Subscription Terminated'];
          u.activityLogs.unshift({
            date: new Date().toISOString().split('T')[0],
            type: 'payment_fail',
            details: 'TERMINATED: Account subscription cancelled. Final bill settled.'
          });
          updatedList[i] = u;
          didChange = true;
          addTelemetry(`[CHURN EVENT] ⚠️ Lost Account: ${u.name} transitioned to CHURNED. Lost MRR: $${u.mrr}/mo.`);
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
          if (!u.warningFlags.includes('Usage Decay')) {
            u.warningFlags.push('Usage Decay');
          }
          u.activityLogs.unshift({
            date: new Date().toISOString().split('T')[0],
            type: 'support_open',
            details: 'ALERT: Automated sensor detected API connection timeout (HTTP 504).'
          });

          const trendFactor = u.churnFactors.find(f => f.name === 'Usage Trend');
          if (trendFactor) {
            trendFactor.impact = Math.min(45, trendFactor.impact + 10);
          }

          setUsers(prev => prev.map(item => item.id === u.id ? u : item));
          addTelemetry(`[State Transition] API Outage: ${u.name} transitioned from ACTIVE to FRUSTRATED. Churn risk spiked to ${u.churnProbability}%.`);
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
            details: 'Invoice renewal payment failed: CARD_DECLINED (Declined by Bank).'
          });

          const billFactor = u.churnFactors.find(f => f.name === 'Failed Invoices');
          if (billFactor) {
            billFactor.impact = Math.min(40, billFactor.impact + 20);
          } else {
            u.churnFactors.push({ name: 'Failed Invoices', impact: 20 });
          }

          setUsers(prev => prev.map(item => item.id === u.id ? u : item));
          addTelemetry(`[State Transition] Billing Issue: ${u.name} transitioned from ACTIVE to FRUSTRATED. Grace-period active.`);
          return;
        }
      }

      // 4. Regular login simulation heartbeat
      if (Math.random() > 0.4) {
        const activeUsers = updatedList.filter(u => u.state === 'active');
        if (activeUsers.length > 0) {
          const target = activeUsers[Math.floor(Math.random() * activeUsers.length)];
          addTelemetry(`Telemetry Ping: Heartbeat received from active node ${target.name} (${target.location})`);
        }
      }

    }, 4500);

    return () => clearInterval(interval);
  }, [isSimulating, outageRate, billingFailureRate]);

  const avgHealth = Math.round(users.reduce((acc, u) => acc + u.healthScore, 0) / users.length);
  const totalMRR = users.reduce((acc, u) => acc + u.mrr, 0);
  const criticalCount = users.filter(u => u.healthScore < 40).length;

  const isDark = currentPage === 'console' || currentPage === 'insight';
  const textMuted = isDark ? 'console-text-muted' : 'text-earth-cocoa/60';
  const textSecondary = isDark ? 'console-text-secondary' : 'text-earth-cocoa/80';
  const textPrimary = isDark ? 'console-text-primary' : 'text-earth-cocoa';
  const textHeading = isDark ? 'text-earth-bg/75' : 'text-earth-cocoa/70';

  const customerUser = users.find(u => u.id === customerPortalUserId) || users[0];

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
            onClick={() => setCurrentPage('marketing')} 
            className={`hover:text-earth-clay transition-colors cursor-pointer ${currentPage === 'marketing' ? 'text-earth-clay underline decoration-2 font-black' : (isDark ? 'text-earth-bg/70' : 'text-earth-cocoa/75')}`}
          >
            Product Tour
          </button>
          <button 
            onClick={() => setCurrentPage('console')} 
            className={`hover:text-earth-clay transition-colors cursor-pointer ${currentPage === 'console' ? 'text-earth-clay underline decoration-2 font-black' : (isDark ? 'text-earth-bg/70' : 'text-earth-cocoa/75')}`}
          >
            Workspace Console
          </button>
        </nav>

        {/* CTA Launch Button */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentPage(currentPage === 'marketing' ? 'console' : 'marketing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all duration-200 cursor-pointer ${
              isDark 
                ? 'bg-earth-bg hover:bg-earth-sage text-earth-cocoa shadow-earth-bg/10' 
                : 'bg-earth-cocoa hover:bg-earth-clay text-earth-bg shadow-earth-cocoa/20'
            }`}
          >
            {currentPage === 'marketing' ? 'Launch Console' : 'View Tour'}
          </button>
        </div>
      </header>

      {/* 2. Page Body */}
      <main className="flex-1 w-full flex flex-col relative">
        {currentPage === 'insight' && selectedUser ? (
          <ActiveUserInsight 
            user={selectedUser} 
            onBack={() => {
              setCurrentPage('console');
              setSelectedUser(null);
            }} 
            onUpdateUser={handleUpdateUser}
          />
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
                  ⚡ Smart Customer Retention Assistant
                </div>

                {/* Hero Heading */}
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-earth-cocoa leading-[1.1]">
                  Turn Customer Churn into <span className="text-earth-clay">Loyalty Opportunities.</span>
                </h1>

                {/* Hero Description */}
                <p className="text-sm md:text-base text-earth-cocoa/80 leading-relaxed">
                  SubSentry is an intelligent customer success copilot that prevents client cancellations (churn) before they happen. By tracking customer satisfaction, billing status, and platform usage, we predict which accounts are at risk and automatically recommend simple playbooks to win them back.
                </p>

                {/* Hero CTAs */}
                <div className="flex flex-wrap gap-4 mt-2">
                  <button 
                    onClick={scrollToConsole}
                    className="bg-earth-cocoa hover:bg-earth-clay text-earth-bg px-6 py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-earth-cocoa/25 transition-all duration-200 flex items-center gap-2 group cursor-pointer"
                  >
                    <span>Launch Workspace Console</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  
                  <button 
                    onClick={() => {
                      setPulseTrigger(prev => prev + 1);
                      addTelemetry('Manual telemetry pulse broadcasted: triggered 3D polar sweeping ripples.');
                    }}
                    className="bg-[#efe9d2] hover:bg-[#e4ddc3] border border-earth-sage/40 text-earth-cocoa px-6 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer"
                  >
                    Pulse Active Nodes
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
                    <span>Smart Risk Forecasting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-earth-clay" />
                    <span>Recommended Playbooks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-earth-sage" />
                    <span>Billing Issue Alerts</span>
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
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-earth-clay">Advanced Engine Features</span>
                  <h2 className="text-2xl font-extrabold text-earth-cocoa">Optimized Retention, Grounded in Data.</h2>
                  <p className="text-sm text-earth-cocoa/80 leading-relaxed max-w-2xl mx-auto">
                    Client cancellations are often hard to anticipate. SubSentry combines smart risk forecasts with historical customer case resolution histories to give your account managers clear, immediate playbooks to retain users.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Feature 1 */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-6 rounded-2xl flex flex-col gap-3 shadow-sm">
                    <div className="bg-earth-sage/20 text-earth-cocoa p-2.5 rounded-xl w-fit">
                      <Cpu className="w-5 h-5 text-earth-clay" />
                    </div>
                    <h3 className="font-bold text-earth-cocoa text-sm">AI Churn Predictor</h3>
                    <p className="text-xs text-earth-cocoa/70 leading-relaxed">
                      We analyze user activity, billing issues, and support logs to flag at-risk accounts. SubSentry explains exactly why a customer is unhappy, so you can address the root cause.
                    </p>
                  </div>

                  {/* Feature 2 */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-6 rounded-2xl flex flex-col gap-3 shadow-sm">
                    <div className="bg-earth-sage/20 text-earth-cocoa p-2.5 rounded-xl w-fit">
                      <MessageSquare className="w-5 h-5 text-earth-clay" />
                    </div>
                    <h3 className="font-bold text-earth-cocoa text-sm">Smart Resolution Finder</h3>
                    <p className="text-xs text-earth-cocoa/70 leading-relaxed">
                      SubSentry searches historical support logs and resolutions to find the exact strategies that worked for similar customer issues in the past.
                    </p>
                  </div>

                  {/* Feature 3 */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-6 rounded-2xl flex flex-col gap-3 shadow-sm">
                    <div className="bg-earth-sage/20 text-earth-cocoa p-2.5 rounded-xl w-fit">
                      <HeartHandshake className="w-5 h-5 text-earth-clay" />
                    </div>
                    <h3 className="font-bold text-earth-cocoa text-sm">One-Click Customer Rescue</h3>
                    <p className="text-xs text-earth-cocoa/70 leading-relaxed">
                      Equip customer success agents with instant remedies—like extending billing grace periods, triggering guided walkthroughs, or scheduling calls—to restore client health in seconds.
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
              
              <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-4 transition-colors duration-300 ${isDark ? 'border-earth-bg/15' : 'border-earth-sage/35'}`}>
                <div>
                  <span className="text-[10px] uppercase font-bold text-earth-clay tracking-wider">SubSentry Workspace</span>
                  <h2 className={`text-xl font-extrabold mt-0.5 ${textPrimary}`}>Admin Management Console</h2>
                </div>

                <div className={`flex items-center gap-6 text-xs border-l pl-6 h-full transition-colors duration-300 ${isDark ? 'border-earth-bg/15' : 'border-earth-sage/30'}`}>
                  <div className="flex flex-col">
                    <span className={`text-[9px] font-bold ${textMuted}`}>Health Level</span>
                    <span className="font-bold text-earth-sage mt-0.5">{avgHealth}% Avg</span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[9px] font-bold ${textMuted}`}>Live MRR</span>
                    <span className={`font-bold mt-0.5 ${textPrimary}`}>${totalMRR.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[9px] font-bold ${textMuted}`}>Critical Alert</span>
                    <span className="font-bold text-earth-clay mt-0.5">{criticalCount} Accounts</span>
                  </div>
                  
                  <button 
                    onClick={() => setShowModelModal(true)}
                    className={`ml-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-200 cursor-pointer ${
                      isDark 
                        ? 'bg-earth-bg/10 border-earth-bg/25 text-earth-bg hover:bg-earth-bg/20' 
                        : 'bg-earth-cocoa border-earth-cocoa/20 text-earth-bg hover:bg-earth-clay'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5 text-earth-clay animate-pulse" />
                    <span>ML Insights</span>
                  </button>
                </div>
              </div>

              {workspaceTab === 'admin' && (
                <>
                  {/* Grid: Simulation Controls & Telemetry Feed */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch animate-fadeIn">
                
                {/* Sandbox controls (Span 5) */}
                <div className={`lg:col-span-5 border rounded-2xl p-5 flex flex-col gap-4 shadow-sm transition-all duration-300 ${isDark ? 'console-card-dark' : 'bg-[#efe9d2]/30 border-earth-sage/30'}`}>
                  <div className="flex justify-between items-center">
                    <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${textHeading}`}>
                      <Settings className="w-3.5 h-3.5 text-earth-clay" />
                      Simulation Sandbox Controls
                    </h3>
                    <button 
                      onClick={() => {
                        setIsSimulating(!isSimulating);
                        addTelemetry(isSimulating ? 'Telemetry simulation paused.' : 'Telemetry simulation resumed.');
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all duration-200 cursor-pointer ${
                        isSimulating 
                          ? 'bg-earth-clay/10 border-earth-clay/35 text-earth-clay hover:bg-earth-clay/20' 
                          : `bg-earth-sage/20 border-earth-sage/40 hover:bg-earth-sage/30 ${isDark ? 'text-earth-bg' : 'text-earth-cocoa'}`
                      }`}
                    >
                      {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      <span>{isSimulating ? 'PAUSE SIM' : 'RESUME SIM'}</span>
                    </button>
                  </div>

                  {/* Outage Slider */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs">
                      <span className={`font-semibold ${textSecondary}`}>API Outage Frequency</span>
                      <span className="font-bold text-earth-clay">{outageRate}% rate</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="50" 
                      value={outageRate} 
                      onChange={(e) => setOutageRate(Number(e.target.value))}
                      className={`w-full accent-earth-cocoa cursor-pointer h-1.5 rounded-lg appearance-none ${isDark ? 'bg-earth-bg/15' : 'bg-[#efe9d2]'}`} 
                    />
                    <span className={`text-[10px] leading-none ${textMuted}`}>
                      Triggers random HTTP 504 timeouts, decaying user logins and usage velocity.
                    </span>
                  </div>

                  {/* Billing Slider */}
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex justify-between text-xs">
                      <span className={`font-semibold ${textSecondary}`}>Billing Renewal Failures</span>
                      <span className="font-bold text-earth-clay">{billingFailureRate}% rate</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="40" 
                      value={billingFailureRate} 
                      onChange={(e) => setBillingFailureRate(Number(e.target.value))}
                      className={`w-full accent-earth-cocoa cursor-pointer h-1.5 rounded-lg appearance-none ${isDark ? 'bg-earth-bg/15' : 'bg-[#efe9d2]'}`} 
                    />
                    <span className={`text-[10px] leading-none ${textMuted}`}>
                      Simulates declined banking transactions, prompting invoice dunning flags.
                    </span>
                  </div>
                </div>

                {/* Telemetry Log Feed (Span 7) */}
                <div className={`lg:col-span-7 border rounded-2xl p-5 flex flex-col min-h-[220px] shadow-sm transition-all duration-300 ${isDark ? 'console-card-dark' : 'bg-[#efe9d2]/30 border-earth-sage/30'}`}>
                  <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-3 shrink-0 ${textHeading}`}>
                    <Radio className="w-3.5 h-3.5 text-earth-clay animate-pulse" />
                    Live System Telemetry Feed
                  </h3>
                  <div className={`flex-1 overflow-y-auto pr-1 flex flex-col gap-2 font-mono text-[10px] max-h-[160px] ${isDark ? 'text-earth-bg/70' : 'text-earth-cocoa/80'}`}>
                    {telemetryFeed.map((log, i) => (
                      <div 
                        key={i} 
                        className={`py-1.5 border-b border-earth-sage/10 leading-normal ${
                          log.includes('Alert') || log.includes('Warning')
                            ? 'text-earth-clay bg-earth-clay/5 px-1.5 rounded border border-earth-clay/10' 
                            : log.includes('action')
                            ? 'text-earth-sage bg-earth-sage/5 px-1.5 rounded border border-earth-sage/10'
                            : isDark ? 'text-earth-bg/85' : 'text-earth-cocoa/80'
                        }`}
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Customer Directory Table */}
              <div className={`border rounded-2xl p-5 shadow-sm transition-all duration-300 ${isDark ? 'console-card-dark' : 'bg-[#efe9d2]/20 border-earth-sage/35'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-sm font-bold ${textPrimary}`}>Active Subscription Health Tracker</h3>
                  <span className={`text-[10px] font-bold ${textMuted}`}>* Click on any row to open Active User Insight</span>
                </div>
                
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className={`border-b uppercase tracking-wider font-bold transition-colors duration-300 ${isDark ? 'border-earth-bg/15 text-earth-bg/60' : 'border-earth-sage/45 text-earth-cocoa/60'}`}>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Plan & MRR</th>
                        <th className="py-3 px-4 text-center">Health</th>
                        <th className="py-3 px-4 text-center">Churn Prob.</th>
                        <th className="py-3 px-4">Alert Flags</th>
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
                                    ? 'bg-earth-sage/20 border border-earth-sage/35 text-earth-sage'
                                    : u.state === 'frustrated'
                                    ? 'bg-earth-clay/20 border border-earth-clay/35 text-earth-clay animate-pulse'
                                    : u.state === 'disengaged'
                                    ? (isDark ? 'bg-earth-bg/10 border border-earth-bg/25 text-earth-bg/85' : 'bg-earth-cocoa/10 border border-earth-cocoa/25 text-earth-cocoa/85')
                                    : 'bg-black/10 border border-black/20 text-black/50'
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
                                ? (isDark ? 'bg-earth-sage/20 text-earth-bg border border-earth-sage/40' : 'bg-earth-sage/20 text-earth-cocoa border border-earth-sage/30') 
                                : u.healthScore > 40 
                                ? (isDark ? 'bg-earth-clay/20 text-earth-bg border border-earth-clay/40' : 'bg-earth-clay/20 text-earth-cocoa border border-earth-clay/30') 
                                : (isDark ? 'bg-earth-bg/10 text-earth-bg border border-earth-bg/20' : 'bg-earth-cocoa/10 text-earth-cocoa border border-earth-cocoa/20')
                            }`}>
                              {u.healthScore}/100
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block font-bold ${
                              u.churnProbability > 50 
                                ? 'text-earth-clay animate-pulse' 
                                : u.churnProbability > 15 
                                ? 'text-earth-clay' 
                                : 'text-earth-sage'
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
                                    className={`border text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${isDark ? 'bg-earth-bg/5 border-earth-bg/20 text-earth-bg/85' : 'bg-earth-clay/10 border-earth-clay/30 text-earth-clay'}`}
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
                              Analyze
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </>
          )}

          {workspaceTab === 'customer' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn w-full">
              {/* Left side (Span 4): Account Summary & Profile Switcher */}
              <div className="lg:col-span-4 flex flex-col gap-6 w-full">
                {/* Profile Switcher */}
                <div className="console-card-dark p-5 rounded-2xl flex flex-col gap-3">
                  <span className="console-text-muted text-[10px] font-bold uppercase tracking-wider">CSM Sandbox Switcher</span>
                  <label className="text-xs text-earth-bg/60 font-semibold leading-relaxed">
                    Switch customer profile to test different customer-facing scenarios (low usage optimization or payment failures).
                  </label>
                  <select
                    value={customerPortalUserId}
                    onChange={(e) => setCustomerPortalUserId(e.target.value)}
                    className="bg-earth-cocoa border console-border rounded-xl p-2.5 text-xs console-text-primary font-bold outline-none cursor-pointer focus:border-earth-clay w-full"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id} className="bg-earth-cocoa console-text-primary">
                        {u.name} ({u.state.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Client Profile Summary Card */}
                <div className="console-card-dark p-6 rounded-2xl flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <img src={customerUser.avatar} alt={customerUser.name} className="w-12 h-12 rounded-full object-cover border-2 border-earth-sage" />
                    <div className="text-left">
                      <h3 className="text-base font-extrabold text-earth-bg">{customerUser.name}</h3>
                      <span className="text-[10px] text-earth-bg/60 font-medium block mt-0.5">{customerUser.email}</span>
                    </div>
                  </div>

                  <div className="border-t border-earth-sage/15 pt-4 flex flex-col gap-3 text-xs text-earth-bg/85">
                    <div className="flex justify-between">
                      <span className="console-text-muted font-bold">Subscription Plan</span>
                      <span className="font-bold text-earth-sage">{customerUser.plan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="console-text-muted font-bold">Monthly Value</span>
                      <span className="font-extrabold text-earth-bg">${customerUser.mrr}/mo</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="console-text-muted font-bold">Status Code</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        customerUser.state === 'active' 
                          ? 'bg-earth-sage/20 text-earth-sage border border-earth-sage/40' 
                          : customerUser.state === 'frustrated'
                          ? 'bg-earth-clay/20 text-earth-clay border border-earth-clay/40 animate-pulse'
                          : 'bg-earth-bg/10 text-earth-bg/85 border border-earth-bg/20'
                      }`}>
                        {customerUser.state}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side (Span 8): Self-Service Value Dashboard */}
              <div className="lg:col-span-8 flex flex-col gap-6 w-full">
                {/* Main value area */}
                <div className="console-card-dark p-6 rounded-3xl flex flex-col gap-6">
                  <div className="flex flex-col gap-1 border-b border-earth-sage/15 pb-4 text-left">
                    <span className="text-[10px] uppercase font-bold text-earth-sage tracking-wider">Client Self-Service Hub</span>
                    <h3 className="text-lg font-bold text-earth-bg">Your Subscription Health & Resource Value</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Gauge 1: Usage Limits */}
                    <div className="bg-earth-bg/5 border border-earth-sage/15 p-5 rounded-2xl flex flex-col gap-3 text-left">
                      <span className="text-[10px] font-bold text-earth-sage/75">PACKAGE LIMITS UTILIZATION</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-extrabold text-earth-bg">{Math.round(customerUser.metrics.monthlyUsage * 100)}%</span>
                        <span className="text-xs text-earth-bg/50">of monthly quota used</span>
                      </div>
                      <div className="w-full bg-earth-bg/10 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${
                            customerUser.metrics.monthlyUsage < 0.35 ? 'bg-earth-clay' : 'bg-earth-sage'
                          }`}
                          style={{ width: `${customerUser.metrics.monthlyUsage * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-earth-bg/60 mt-1 leading-normal">
                        Based on your login sessions, data throughput, and active seat allocation.
                      </span>
                    </div>

                    {/* SLA health score (customer perspective of platform health) */}
                    <div className="bg-earth-bg/5 border border-earth-sage/15 p-5 rounded-2xl flex flex-col gap-3 text-left">
                      <span className="text-[10px] font-bold text-earth-sage/75">YOUR SERVICE HEALTH SCORE</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-extrabold text-earth-sage">{customerUser.healthScore}/100</span>
                        <span className="text-xs text-earth-bg/50">Optimal platform health</span>
                      </div>
                      <div className="w-full bg-earth-bg/10 rounded-full h-2 mt-2">
                        <div 
                          className="h-2 rounded-full bg-earth-sage"
                          style={{ width: `${customerUser.healthScore}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-earth-bg/60 mt-1 leading-normal">
                        We track service uptime and response times to ensure your subscription remains stable.
                      </span>
                    </div>
                  </div>

                  {/* DYNAMIC WOW FACTOR INTERVENTIONS SECTION */}
                  <div className="mt-4 border-t border-earth-sage/15 pt-6 flex flex-col gap-4">
                    <h4 className="text-xs font-bold text-earth-bg uppercase tracking-wider text-left">SubSentry Active Value Guard recommendations</h4>

                    {/* Case A: Underutilization -> Trust-Building Downgrade Option */}
                    {customerUser.metrics.monthlyUsage < 0.35 && customerUser.plan !== 'Starter' && (
                      <div className="bg-earth-sage/10 border border-earth-sage/35 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 animate-slideDown">
                        <div className="flex-1 text-left">
                          <h5 className="text-xs font-bold text-earth-sage uppercase tracking-wider flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-earth-sage" />
                            Recommended Saving Action
                          </h5>
                          <p className="text-xs text-earth-bg mt-1.5 leading-relaxed">
                            We noticed you are only using <strong>{Math.round(customerUser.metrics.monthlyUsage * 100)}%</strong> of your package limits. 
                            Downgrade to the <strong>Starter Plan</strong> to save <strong>$1,500/mo</strong> while retaining your core features. We value your trust over empty spend!
                          </p>
                        </div>
                        <button 
                          onClick={() => handleCustomerSelfAction(customerUser.id, 'downgrade')}
                          className="bg-earth-sage hover:bg-earth-sage/80 text-earth-cocoa font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap"
                        >
                          Execute 1-Click Downgrade
                        </button>
                      </div>
                    )}

                    {/* Case B: Payment Issue -> Request Grace-Extension Option */}
                    {customerUser.state === 'frustrated' && customerUser.warningFlags.includes('Failed Payment') && (
                      <div className="bg-earth-clay/10 border border-earth-clay/35 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 animate-slideDown">
                        <div className="flex-1 text-left">
                          <h5 className="text-xs font-bold text-earth-clay uppercase tracking-wider flex items-center gap-1.5">
                            ⚠️ Payment Delinquency Grace Alert
                          </h5>
                          <p className="text-xs text-earth-bg mt-1.5 leading-relaxed">
                            Your invoice payment renewal failed (declined bank transaction). 
                            Request an automatic <strong>7-day grace extension</strong> to keep services fully active while you contact your bank.
                          </p>
                        </div>
                        <button 
                          onClick={() => handleCustomerSelfAction(customerUser.id, 'extend_grace')}
                          className="bg-earth-clay hover:bg-earth-clay/80 text-earth-bg font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap"
                        >
                          Request 7-Day Extension
                        </button>
                      </div>
                    )}

                    {/* Default State: Healthy Account -> Customer satisfaction and support center */}
                    {!(customerUser.metrics.monthlyUsage < 0.35 && customerUser.plan !== 'Starter') && !(customerUser.state === 'frustrated' && customerUser.warningFlags.includes('Failed Payment')) && (
                      <div className="bg-earth-bg/5 border border-earth-sage/15 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1 text-left">
                          <h5 className="text-xs font-bold text-earth-bg/75 uppercase tracking-wider">
                            Subscription Status: Healthy
                          </h5>
                          <p className="text-xs text-earth-bg/60 mt-1.5 leading-relaxed">
                            Your services are fully configured and functional. Uptime SLA is currently operating at 99.98% across all active regions.
                          </p>
                        </div>
                        <button 
                          onClick={() => handleCustomerSelfAction(customerUser.id, 'refresh')}
                          className="border border-earth-sage/30 text-earth-bg/80 hover:bg-earth-bg/5 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                        >
                          Run Value Health Check
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service SLA log ticker */}
                <div className="console-card-dark p-5 rounded-2xl flex flex-col gap-3">
                  <span className="console-text-muted text-[10px] font-bold uppercase tracking-wider text-left">YOUR RECENT ACCOUNT HISTORY LOG</span>
                  <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto">
                    {customerUser.activityLogs.map((log, idx) => (
                      <div key={idx} className="flex gap-2 text-[10px] text-earth-bg/75 items-start">
                        <span className="font-bold text-earth-sage shrink-0">{log.date}</span>
                        <span className="console-text-muted shrink-0">|</span>
                        <span className="text-left flex-1 leading-normal">{log.details}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    )}
      </main>

      {/* 3. Global Footer */}
      <footer className="bg-earth-bg border-t border-earth-sage/35 py-6 text-center text-earth-cocoa/50 text-[10px] select-none mt-auto">
        <p>&copy; 2026 SubSentry Platform. Built for Subscription Health & Churn Optimization. Real-time RAG Pipeline Active.</p>
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
                <span className="text-[10px] uppercase font-bold text-earth-sage tracking-wider">SubSentry Analytics Engine</span>
                <h2 className="text-lg font-bold text-earth-bg mt-0.5">XGBoost & Random Forest Model Analytics</h2>
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
                <span className="text-[9px] font-bold text-earth-sage/75 block">TRAINING DATASET</span>
                <span className="text-base font-extrabold text-earth-bg mt-1 block">IBM Telco Churn</span>
                <span className="text-[10px] text-earth-bg/50 mt-0.5 block">7,043 Customer Profiles</span>
              </div>
              <div className="bg-earth-bg/5 border border-earth-sage/15 p-4 rounded-2xl">
                <span className="text-[9px] font-bold text-earth-sage/75 block">CLASSIFIER MODEL</span>
                <span className="text-base font-extrabold text-earth-bg mt-1 block">Random Forest</span>
                <span className="text-[10px] text-earth-bg/50 mt-0.5 block">n_estimators=100, max_depth=10</span>
              </div>
              <div className="bg-earth-bg/5 border border-earth-sage/15 p-4 rounded-2xl">
                <span className="text-[9px] font-bold text-earth-sage/75 block">ROC-AUC SCORE</span>
                <span className="text-base font-extrabold text-earth-sage mt-1 block">0.834 / 1.0</span>
                <span className="text-[10px] text-earth-bg/50 mt-0.5 block">Strong predictive separation</span>
              </div>
              <div className="bg-earth-bg/5 border border-earth-sage/15 p-4 rounded-2xl">
                <span className="text-[9px] font-bold text-earth-sage/75 block">TEST ACCURACY</span>
                <span className="text-base font-extrabold text-earth-bg mt-1 block">80.5%</span>
                <span className="text-[10px] text-earth-bg/50 mt-0.5 block">Stratified 20% validation split</span>
              </div>
            </div>

            {/* Plot Evaluation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Confusion Matrix Card */}
              <div className="bg-earth-bg/5 border border-earth-sage/15 p-5 rounded-2xl flex flex-col gap-3">
                <h4 className="text-xs font-bold text-earth-bg uppercase tracking-wider">Confusion Matrix (Validation)</h4>
                <img src="/confusion_matrix.png" alt="Confusion Matrix" className="w-full h-auto rounded-xl border border-earth-sage/20 object-cover bg-white" />
                <p className="text-[10px] text-earth-bg/60 leading-normal">
                  <strong>Interpretation</strong>: Out of 1,359 test cases, the model accurately flags <strong>168 actual churn accounts</strong> (True Positives) and <strong>968 retained accounts</strong> (True Negatives). The precision-recall profile helps CSMs act proactively without flooding the feed with false warnings.
                </p>
              </div>

              {/* ROC Curve Card */}
              <div className="bg-earth-bg/5 border border-earth-sage/15 p-5 rounded-2xl flex flex-col gap-3">
                <h4 className="text-xs font-bold text-earth-bg uppercase tracking-wider">Receiver Operating Characteristic (ROC)</h4>
                <img src="/roc_auc_curve.png" alt="ROC Curve" className="w-full h-auto rounded-xl border border-earth-sage/20 object-cover bg-white" />
                <p className="text-[10px] text-earth-bg/60 leading-normal">
                  <strong>Interpretation</strong>: The Area Under Curve (<strong>AUC = 0.834</strong>) validates that SubSentry's ML classifier successfully distinguishes low-risk accounts from true churn risk. This metrics profile ensures the scoring engine scales reliably across enterprise portfolios.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
