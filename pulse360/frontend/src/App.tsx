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
            onClick={() => setCurrentPage('marketing')} 
            className={`hover:text-earth-clay transition-colors cursor-pointer ${currentPage === 'marketing' ? 'text-earth-clay underline decoration-2 font-black' : (isDark ? 'text-earth-bg/70' : 'text-earth-cocoa/75')}`}
          >
            Product Tour
          </button>
          <button 
            onClick={() => setCurrentPage('console')} 
            className={`hover:text-earth-clay transition-colors cursor-pointer ${currentPage === 'console' ? 'text-earth-clay underline decoration-2 font-black' : (isDark ? 'text-earth-bg/70' : 'text-earth-cocoa/75')}`}
          >
            Admin Console
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
              
              <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-4 transition-colors duration-300 ${isDark ? 'border-earth-bg/15' : 'border-earth-sage/35'}`}>
                <div>
                  <span className="text-[10px] uppercase font-bold text-earth-clay tracking-wider">SubSentry Workspace</span>
                  <h2 className={`text-xl font-extrabold mt-0.5 ${textPrimary}`}>Admin Management Console</h2>
                </div>

                <div className={`flex items-center gap-6 text-xs border-l pl-6 h-full transition-colors duration-300 ${isDark ? 'border-earth-bg/15' : 'border-earth-sage/30'}`}>
                  <div className="flex flex-col">
                    <span className={`text-[9px] font-bold ${textMuted}`}>Health Level</span>
                    <span className={`font-bold mt-0.5 ${isDark ? 'text-status-healthy' : 'text-status-healthy-deep'}`}>{avgHealth}% Avg</span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[9px] font-bold ${textMuted}`}>Monthly Revenue</span>
                    <span className={`font-bold mt-0.5 ${textPrimary}`}>${totalMRR.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[9px] font-bold ${textMuted}`}>Critical Alert</span>
                    <span className={`font-bold mt-0.5 ${isDark ? 'text-status-critical' : 'text-status-critical-deep'}`}>{criticalCount} Accounts</span>
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
                    <span>How Predictions Work</span>
                  </button>
                </div>
              </div>

              {/* Grid: Simulation Controls & Telemetry Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch animate-fadeIn">
                
                {/* Sandbox controls (Span 5) */}
                <div className={`lg:col-span-5 border rounded-2xl p-5 flex flex-col gap-4 shadow-sm transition-all duration-300 ${isDark ? 'console-card-dark' : 'bg-[#efe9d2]/30 border-earth-sage/30'}`}>
                  <div className="flex justify-between items-center">
                    <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${textHeading}`}>
                      <Settings className="w-3.5 h-3.5 text-earth-clay" />
                      Demo Scenario Controls
                    </h3>
                    <button 
                      onClick={() => {
                        setIsSimulating(!isSimulating);
                        addTelemetry(isSimulating ? 'Demo simulation paused.' : 'Demo simulation resumed.');
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
                      <span className={`font-semibold ${textSecondary}`}>Service Outage Frequency</span>
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
                      Randomly simulates service outages, making customers log in and use the product less.
                    </span>
                  </div>

                  {/* Billing Slider */}
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex justify-between text-xs">
                      <span className={`font-semibold ${textSecondary}`}>Failed Payment Frequency</span>
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
                      Simulates declined cards, so you can see how payment problems affect customers.
                    </span>
                  </div>
                </div>

                {/* Telemetry Log Feed (Span 7) */}
                <div className={`lg:col-span-7 border rounded-2xl p-5 flex flex-col min-h-[220px] shadow-sm transition-all duration-300 ${isDark ? 'console-card-dark' : 'bg-[#efe9d2]/30 border-earth-sage/30'}`}>
                  <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-3 shrink-0 ${textHeading}`}>
                    <Radio className="w-3.5 h-3.5 text-earth-clay animate-pulse" />
                    Live Activity Feed
                  </h3>
                  <div className={`flex-1 overflow-y-auto pr-1 flex flex-col gap-2 font-mono text-[10px] max-h-[160px] ${isDark ? 'text-earth-bg/70' : 'text-earth-cocoa/80'}`}>
                    {telemetryFeed.map((log, i) => (
                      <div 
                        key={i} 
                        className={`py-1.5 border-b border-earth-sage/10 leading-normal ${
                          /alert|warning|customer lost|cancelled|outage|payment problem|failed/i.test(log)
                            ? (isDark
                                ? 'text-status-critical bg-status-critical/10 px-1.5 rounded border border-status-critical/25'
                                : 'text-status-critical-deep bg-status-critical-deep/5 px-1.5 rounded border border-status-critical-deep/20')
                            : /action taken|back on track|saved|restored|resolved/i.test(log)
                            ? (isDark
                                ? 'text-status-healthy bg-status-healthy/10 px-1.5 rounded border border-status-healthy/25'
                                : 'text-status-healthy-deep bg-status-healthy-deep/5 px-1.5 rounded border border-status-healthy-deep/20')
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
    </div>
  );
}

export default App;
