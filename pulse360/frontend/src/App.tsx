import { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Play, Pause, Settings, Radio, ArrowDown, ChevronRight, 
  MessageSquare, Cpu, HeartHandshake
} from 'lucide-react';
import { mockUsers, type ActiveUser } from './utils/mockData';
import { Globe } from './components/Globe';
import { ActiveUserInsight } from './components/ActiveUserInsight';

function App() {
  const [currentPage, setCurrentPage] = useState<'globe' | 'insight'>('globe');
  const [users, setUsers] = useState<ActiveUser[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<ActiveUser | null>(null);
  
  // Simulation States (Concept 1: Digital Twin Sandbox)
  const [isSimulating, setIsSimulating] = useState(true);
  const [outageRate, setOutageRate] = useState(15);
  const [billingFailureRate, setBillingFailureRate] = useState(10);
  const [telemetryFeed, setTelemetryFeed] = useState<string[]>([
    'System Sentry initialized. Real-time telemetry connection established.',
    'Synced 8 active enterprise connections globally.',
  ]);

  const consoleRef = useRef<HTMLDivElement>(null);

  const scrollToConsole = () => {
    consoleRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setSelectedUser(updatedUser);
    addTelemetry(`CSM action applied on ${updatedUser.name}: Risk reduced to ${updatedUser.churnProbability}%`);
  };

  const addTelemetry = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setTelemetryFeed(prev => [`[${time}] ${msg}`, ...prev.slice(0, 15)]);
  };

  // Run Real-Time Telemetry Simulation
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // 1. Roll probability for an API failure (Outage Rate)
      if (Math.random() * 100 < outageRate) {
        const targetUserIdx = Math.floor(Math.random() * users.length);
        const targetUser = { ...users[targetUserIdx] };
        
        // Degrade health
        targetUser.healthScore = Math.max(10, targetUser.healthScore - 8);
        targetUser.metrics.usageVelocity = Math.max(0.1, Number((targetUser.metrics.usageVelocity - 0.1).toFixed(2)));
        targetUser.metrics.frictionIndex = Math.min(10, Number((targetUser.metrics.frictionIndex + 0.8).toFixed(1)));
        
        // Add flags
        if (!targetUser.warningFlags.includes('Usage Decay')) {
          targetUser.warningFlags.push('Usage Decay');
        }
        
        // Recalculate Churn Risk (Simulated XGBoost output)
        const currentRisk = targetUser.churnProbability;
        targetUser.churnProbability = Math.min(99, targetUser.churnProbability + 12);
        
        // Add activity log
        targetUser.activityLogs.unshift({
          date: new Date().toISOString().split('T')[0],
          type: 'support_open',
          details: 'ALERT: Automated sensor detected API connection timeout (HTTP 504).'
        });

        // Add SHAP adjustments
        const trendFactor = targetUser.churnFactors.find(f => f.name === 'Usage Trend');
        if (trendFactor) {
          trendFactor.impact = Math.min(45, trendFactor.impact + 8);
        }

        setUsers(prev => prev.map(u => u.id === targetUser.id ? targetUser : u));
        addTelemetry(`API Latency Alert: ${targetUser.name} (${targetUser.location}) reported connectivity errors. Churn risk: ${currentRisk}% -> ${targetUser.churnProbability}%`);
      }

      // 2. Roll probability for credit card / renewal failure (Billing failure Rate)
      if (Math.random() * 100 < billingFailureRate) {
        const targetUserIdx = Math.floor(Math.random() * users.length);
        const targetUser = { ...users[targetUserIdx] };

        if (targetUser.metrics.failedPayments === 0) {
          targetUser.metrics.failedPayments = 1;
          targetUser.healthScore = Math.max(15, targetUser.healthScore - 15);
          targetUser.churnProbability = Math.min(98, targetUser.churnProbability + 20);
          
          if (!targetUser.warningFlags.includes('Failed Payment')) {
            targetUser.warningFlags.push('Failed Payment');
          }

          targetUser.activityLogs.unshift({
            date: new Date().toISOString().split('T')[0],
            type: 'payment_fail',
            details: 'Invoice renewal payment failed: CARD_DECLINED (Incorrect Expiry / Bounces).'
          });

          // Add SHAP adjustments
          const billFactor = targetUser.churnFactors.find(f => f.name === 'Failed Invoices');
          if (billFactor) {
            billFactor.impact = Math.min(40, billFactor.impact + 20);
          } else {
            targetUser.churnFactors.push({ name: 'Failed Invoices', impact: 20 });
          }

          setUsers(prev => prev.map(u => u.id === targetUser.id ? targetUser : u));
          addTelemetry(`Billing Warning: Renewal failed for ${targetUser.name}. SubSentry triggered grace-period dunning.`);
        }
      }

      // 3. Regular login simulation
      if (Math.random() > 0.5) {
        const targetUser = users[Math.floor(Math.random() * users.length)];
        addTelemetry(`Telemetry Ping: Heartbeat received from ${targetUser.name} (${targetUser.plan})`);
      }

    }, 4500);

    return () => clearInterval(interval);
  }, [isSimulating, outageRate, billingFailureRate, users]);

  const avgHealth = Math.round(users.reduce((acc, u) => acc + u.healthScore, 0) / users.length);
  const totalMRR = users.reduce((acc, u) => acc + u.mrr, 0);
  const criticalCount = users.filter(u => u.healthScore < 40).length;

  return (
    <div className="min-h-screen bg-earth-bg font-sans text-earth-cocoa flex flex-col antialiased">
      {/* 1. Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#F7F1DE]/90 backdrop-blur-md border-b border-earth-sage/35 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-earth-sage/20 border border-earth-sage/40 p-2 rounded-xl text-earth-cocoa">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-earth-cocoa tracking-tight flex items-center gap-2">
              SubSentry <span className="text-[10px] bg-earth-sage/20 border border-earth-sage/40 text-earth-cocoa px-1.5 py-0.5 rounded font-bold">v4.0.0</span>
            </h1>
            <p className="text-[10px] text-earth-cocoa/60 font-semibold">Smart Subscription & Customer Experience Optimizer</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-earth-cocoa/75">
          <a href="#" className="hover:text-earth-cocoa transition-colors">Home</a>
          <a href="#features" className="hover:text-earth-cocoa transition-colors">Features</a>
          <button onClick={scrollToConsole} className="hover:text-earth-cocoa transition-colors cursor-pointer">Admin Console</button>
        </nav>

        {/* CTA Launch Button */}
        <div className="flex items-center gap-3">
          <button 
            onClick={scrollToConsole}
            className="bg-earth-cocoa hover:bg-earth-clay text-earth-bg px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-earth-cocoa/20 transition-all duration-200 cursor-pointer"
          >
            Launch Console
          </button>
        </div>
      </header>

      {/* 2. Page Body */}
      <main className="flex-1 w-full flex flex-col relative">
        {currentPage === 'insight' && selectedUser ? (
          <ActiveUserInsight 
            user={selectedUser} 
            onBack={() => {
              setCurrentPage('globe');
              setSelectedUser(null);
            }} 
            onUpdateUser={handleUpdateUser}
          />
        ) : (
          /* PAGE 1: MARKETING HERO LANDING PAGE */
          <div className="flex flex-col w-full">
            
            {/* HERO HERO SECTION */}
            <div className="w-full max-w-7xl mx-auto px-6 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[calc(100vh-80px)]">
              
              {/* Left Column: Hero Text & Features (Span 5) */}
              <div className="lg:col-span-5 flex flex-col gap-6 text-left">
                
                {/* Glowing Badge */}
                <div className="self-start bg-earth-sage/20 border border-earth-sage/40 text-earth-cocoa text-[10px] px-3 py-1 rounded-full font-extrabold uppercase tracking-widest shadow-sm">
                  ⚡ Explainable Churn ML & RAG Playbooks
                </div>

                {/* Hero Heading */}
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-earth-cocoa leading-[1.1]">
                  Turn Customer Churn into <span className="text-earth-clay">Loyalty Opportunities.</span>
                </h1>

                {/* Hero Description */}
                <p className="text-sm md:text-base text-earth-cocoa/80 leading-relaxed">
                  SubSentry analyzes real-time customer telemetries, maps live global sessions, explains customer friction points using **SHAP (Explainable AI)**, and retrieves past retention journeys using **semantic RAG** to draft personalized win-back playbooks.
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
                      addTelemetry('Manual telemetry pulse triggered on globe.');
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
                    <span>Real-time Telemetries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-earth-sage" />
                    <span>SHAP Explanations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-earth-clay" />
                    <span>RAG Playbook Assistant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-earth-sage" />
                    <span>Failed Billing Grace-Periods</span>
                  </div>
                </div>
              </div>

              {/* Right Column: 3D rotating Globe (Span 7) */}
              <div className="lg:col-span-7 bg-[#efe9d2]/15 border border-earth-sage/35 rounded-3xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                <div className="absolute top-4 left-4 z-10 flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold text-earth-cocoa/50 tracking-wider">Live System Activity</span>
                  <h2 className="text-sm font-bold text-earth-cocoa mt-0.5">Global User Heatmap</h2>
                </div>
                <Globe onSelectUser={handleSelectUser} selectedUser={selectedUser} />
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
                  <p className="text-xs text-earth-cocoa/75 leading-relaxed">
                    SaaS churn is often a black box. SubSentry leverages interpretability algorithms and conversational RAG models to give your Customer Success Team clear, actionable intervention playbooks.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Feature 1 */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-6 rounded-2xl flex flex-col gap-3 shadow-sm">
                    <div className="bg-earth-sage/20 text-earth-cocoa p-2.5 rounded-xl w-fit">
                      <Cpu className="w-5 h-5 text-earth-clay" />
                    </div>
                    <h3 className="font-bold text-earth-cocoa text-sm">Explainable Machine Learning</h3>
                    <p className="text-xs text-earth-cocoa/70 leading-relaxed">
                      We go beyond binary churn prediction. We compute Shapley additive values for every client, mapping the specific metrics driving risks up or down.
                    </p>
                  </div>

                  {/* Feature 2 */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-6 rounded-2xl flex flex-col gap-3 shadow-sm">
                    <div className="bg-earth-sage/20 text-earth-cocoa p-2.5 rounded-xl w-fit">
                      <MessageSquare className="w-5 h-5 text-earth-clay" />
                    </div>
                    <h3 className="font-bold text-earth-cocoa text-sm">RAG Journeys Search</h3>
                    <p className="text-xs text-earth-cocoa/70 leading-relaxed">
                      Semantic vector lookup maps your current at-risk users against similar past customer support histories, identifying which strategies successfully retained them.
                    </p>
                  </div>

                  {/* Feature 3 */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-6 rounded-2xl flex flex-col gap-3 shadow-sm">
                    <div className="bg-earth-sage/20 text-earth-cocoa p-2.5 rounded-xl w-fit">
                      <HeartHandshake className="w-5 h-5 text-earth-clay" />
                    </div>
                    <h3 className="font-bold text-earth-cocoa text-sm">In-App Value Injections</h3>
                    <p className="text-xs text-earth-cocoa/70 leading-relaxed">
                      Equip your account managers with one-click actions: extend grace periods, send dynamic feature tutorials, or schedule feedback sessions to drop risk in real-time.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* BELOW THE FOLD: ADMIN CONSOLE DASHBOARD */}
            <div 
              ref={consoleRef}
              className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8 scroll-mt-20 text-left"
            >
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-earth-sage/35 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-earth-clay tracking-wider">SubSentry Workspace</span>
                  <h2 className="text-xl font-extrabold text-earth-cocoa mt-0.5">Admin Management Console</h2>
                </div>

                <div className="flex items-center gap-6 text-xs border-l border-earth-sage/30 pl-6 h-full">
                  <div className="flex flex-col">
                    <span className="text-earth-cocoa/50 text-[9px] font-bold">Health Level</span>
                    <span className="font-bold text-earth-sage mt-0.5">{avgHealth}% Avg</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-earth-cocoa/50 text-[9px] font-bold">Live MRR</span>
                    <span className="font-bold text-earth-cocoa mt-0.5">${totalMRR.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-earth-cocoa/50 text-[9px] font-bold">Critical Alert</span>
                    <span className="font-bold text-earth-clay mt-0.5">{criticalCount} Accounts</span>
                  </div>
                </div>
              </div>

              {/* Grid: Simulation Controls & Telemetry Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
                
                {/* Sandbox controls (Span 5) */}
                <div className="lg:col-span-5 bg-[#efe9d2]/30 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-earth-cocoa/70 uppercase tracking-wider flex items-center gap-1.5">
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
                          : 'bg-earth-sage/20 border-earth-sage/40 text-earth-cocoa hover:bg-earth-sage/30'
                      }`}
                    >
                      {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      <span>{isSimulating ? 'PAUSE SIM' : 'RESUME SIM'}</span>
                    </button>
                  </div>

                  {/* Outage Slider */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-earth-cocoa/80 font-semibold">API Outage Frequency</span>
                      <span className="font-bold text-earth-clay">{outageRate}% rate</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="50" 
                      value={outageRate} 
                      onChange={(e) => setOutageRate(Number(e.target.value))}
                      className="w-full accent-earth-cocoa cursor-pointer h-1.5 bg-[#efe9d2] rounded-lg appearance-none" 
                    />
                    <span className="text-[10px] text-earth-cocoa/50 leading-none">
                      Triggers random HTTP 504 timeouts, decaying user logins and usage velocity.
                    </span>
                  </div>

                  {/* Billing Slider */}
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-earth-cocoa/80 font-semibold">Billing Renewal Failures</span>
                      <span className="font-bold text-earth-clay">{billingFailureRate}% rate</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="40" 
                      value={billingFailureRate} 
                      onChange={(e) => setBillingFailureRate(Number(e.target.value))}
                      className="w-full accent-earth-cocoa cursor-pointer h-1.5 bg-[#efe9d2] rounded-lg appearance-none" 
                    />
                    <span className="text-[10px] text-earth-cocoa/50 leading-none">
                      Simulates declined banking transactions, prompting invoice dunning flags.
                    </span>
                  </div>
                </div>

                {/* Telemetry Log Feed (Span 7) */}
                <div className="lg:col-span-7 bg-[#efe9d2]/30 border border-earth-sage/30 rounded-2xl p-5 flex flex-col min-h-[220px] shadow-sm">
                  <h3 className="text-xs font-bold text-earth-cocoa/70 uppercase tracking-wider flex items-center gap-1.5 mb-3 shrink-0">
                    <Radio className="w-3.5 h-3.5 text-earth-clay animate-pulse" />
                    Live System Telemetry Feed
                  </h3>
                  <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 font-mono text-[10px] text-earth-cocoa/80 max-h-[160px]">
                    {telemetryFeed.map((log, i) => (
                      <div 
                        key={i} 
                        className={`py-1.5 border-b border-earth-sage/10 leading-normal ${
                          log.includes('Alert') || log.includes('Warning')
                            ? 'text-earth-clay bg-earth-clay/5 px-1.5 rounded border border-earth-clay/10' 
                            : log.includes('action')
                            ? 'text-earth-sage bg-earth-sage/5 px-1.5 rounded border border-earth-sage/10'
                            : 'text-earth-cocoa/80'
                        }`}
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Customer Directory Table */}
              <div className="bg-[#efe9d2]/20 border border-earth-sage/35 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-earth-cocoa">Active Subscription Health Tracker</h3>
                  <span className="text-[10px] text-earth-cocoa/50 font-bold">* Click on any row to open Active User Insight</span>
                </div>
                
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-earth-sage/45 text-earth-cocoa/60 uppercase tracking-wider font-bold">
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
                          className="border-b border-earth-sage/20 hover:bg-[#efe9d2]/40 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-4 flex items-center gap-3">
                            <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-earth-sage/40" />
                            <div>
                              <span className="font-bold text-earth-cocoa block">{u.name}</span>
                              <span className="text-earth-cocoa/60 text-[10px]">{u.email}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-earth-cocoa/90">{u.location}</td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-earth-cocoa block">{u.plan}</span>
                            <span className="text-earth-cocoa/60 text-[10px]">${u.mrr}/mo</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block font-bold px-2 py-0.5 rounded ${
                              u.healthScore > 70 
                                ? 'bg-earth-sage/20 text-earth-cocoa border border-earth-sage/30' 
                                : u.healthScore > 40 
                                ? 'bg-earth-clay/20 text-earth-cocoa border border-earth-clay/30' 
                                : 'bg-earth-cocoa/10 text-earth-cocoa border border-earth-cocoa/20'
                            }`}>
                              {u.healthScore}/100
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block font-bold ${
                              u.churnProbability > 50 ? 'text-earth-cocoa' : u.churnProbability > 15 ? 'text-earth-clay' : 'text-earth-sage'
                            }`}>
                              {u.churnProbability}%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {u.warningFlags.length === 0 ? (
                                <span className="text-earth-cocoa/40 text-[10px] italic">None</span>
                              ) : (
                                u.warningFlags.map(f => (
                                  <span 
                                    key={f} 
                                    className="bg-earth-clay/10 border border-earth-clay/30 text-earth-clay text-[9px] px-1.5 py-0.5 rounded uppercase font-bold"
                                  >
                                    {f}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button 
                              className="bg-earth-cocoa border border-earth-cocoa/20 text-earth-bg hover:bg-earth-clay px-3.5 py-1.5 rounded-xl font-bold text-[11px] transition-colors cursor-pointer"
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

            </div>

          </div>
        )}
      </main>

      {/* 3. Global Footer */}
      <footer className="bg-earth-bg border-t border-earth-sage/35 py-6 text-center text-earth-cocoa/50 text-[10px] select-none mt-auto">
        <p>&copy; 2026 SubSentry Platform. Built for Subscription Health & Churn Optimization. Real-time RAG Pipeline Active.</p>
      </footer>
    </div>
  );
}

export default App;
