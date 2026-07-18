import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { downgradeSavings } from '../utils/mockData';
import { PortalNotificationModal } from '../components/modals/PortalNotificationModal';

export function ClientDashboardPage(props: any) {
  const { users, clientUserId, setClientUserId, handleClientAction, addTelemetry, setCurrentPage } = props;
  const [chatbotMessages, setChatbotMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
    { sender: 'bot', text: "Hello! I'm your SubSentry AI assistant. Ask me anything about your mobile plan, billing renewal, data usage, or roaming add-ons!" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [onboardingSteps, setOnboardingSteps] = useState([
    { id: 'esim', label: 'Activate eSIM Profile', done: true },
    { id: '5g', label: 'Configure 5G VoLTE Calling', done: true },
    { id: 'autopay', label: 'Setup Auto-pay Billing', done: false },
    { id: 'app', label: 'Install Mobile Companion App', done: false }
  ]);
  const [portalNotification, setPortalNotification] = useState<{ title: string; message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const loggedInUser = users.find((u: any) => u.id === clientUserId) || users[0];
  const hasFailedPayment = loggedInUser?.warningFlags?.includes('Failed Payment');
  return (
    <>
          <div className="w-full max-w-7xl mx-auto px-6 py-12 text-left flex flex-col gap-8 animate-fadeIn bg-earth-bg min-h-[calc(100vh-80px)]">
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
            <div className="flex flex-col gap-6 w-full font-sans animate-fadeIn">
              
              {/* Row 1: Key Profile & Telco Spec metrics (Equal heights, balanced flex row) */}
              <div className="flex flex-col md:flex-row gap-6 w-full items-stretch">
                
                {/* Profile Card */}
                <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-6 rounded-2xl flex flex-col justify-between flex-1 shadow-sm text-left">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-earth-clay tracking-wider">Account Identity</span>
                    <div className="flex items-center gap-4 mt-3">
                      <img 
                        src={loggedInUser?.avatar} 
                        alt={loggedInUser?.name} 
                        className="w-14 h-14 rounded-full border border-earth-sage/40 object-cover bg-white shrink-0" 
                      />
                      <div>
                        <h3 className="font-extrabold text-earth-cocoa text-base leading-tight">
                          {loggedInUser?.name}
                        </h3>
                        <span className="text-[10px] text-earth-cocoa/65 mt-1 block">
                          {loggedInUser?.email}
                        </span>
                        <span className="text-[10px] text-earth-cocoa/50 mt-0.5 block">
                          {loggedInUser?.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-earth-sage/20 pt-4 flex flex-col gap-2 mt-4 font-bold">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-earth-cocoa/65">Subscription Plan:</span>
                      <span className="font-extrabold text-earth-cocoa uppercase tracking-wider text-[10px] bg-earth-bg border border-earth-sage/20 px-2 py-0.5 rounded-full">
                        {loggedInUser?.plan} Plan
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-earth-cocoa/65">Monthly Contract MRR:</span>
                      <span className="font-bold text-earth-clay">
                        ${loggedInUser?.mrr}/mo
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-earth-cocoa/65">Billing Status:</span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        hasFailedPayment
                          ? 'bg-status-critical/15 border border-status-critical/30 text-status-critical'
                          : 'bg-[#276B2B]/15 border border-[#276B2B]/30 text-status-healthy'
                      }`}>
                        {hasFailedPayment ? 'Past Due' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Service SLA card */}
                <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-6 rounded-2xl flex flex-col justify-between flex-1 shadow-sm text-left font-sans">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-earth-clay tracking-wider">Service Quality</span>
                    <div className="flex flex-col gap-2 mt-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-earth-cocoa/75 uppercase tracking-wider">Connection SLA Uptime</span>
                        <span className="font-extrabold text-status-healthy">
                          {loggedInUser?.healthScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-earth-cocoa/10 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-status-healthy transition-all duration-500"
                          style={{ width: `${loggedInUser?.healthScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-earth-sage/20 pt-4 flex flex-col gap-2 mt-4 text-[11px] font-bold text-earth-cocoa/85">
                    <div className="flex justify-between">
                      <span className="text-earth-cocoa/65">Network Ping:</span>
                      <span>14ms (Optimal)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-earth-cocoa/65">Routing Channel:</span>
                      <span>5G VoLTE Tier-1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-earth-cocoa/65">Active Warnings:</span>
                      <span className={hasFailedPayment ? 'text-status-critical font-extrabold animate-pulse' : 'text-status-healthy'}>
                        {hasFailedPayment ? '⚠️ Billing Delinquent' : 'None'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Usage statistics card */}
                <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-6 rounded-2xl flex flex-col justify-between flex-1 shadow-sm text-left">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-earth-clay tracking-wider">Data Thresholds</span>
                    <div className="flex flex-col gap-2 mt-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-earth-cocoa/75 uppercase tracking-wider">Monthly Bandwidth Used</span>
                        <span className="font-extrabold text-earth-clay">
                          {Math.round((loggedInUser?.metrics.usageVelocity || 0) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-earth-cocoa/10 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            (loggedInUser?.metrics.usageVelocity || 0) < 0.35 ? 'bg-status-risk' : 'bg-[#276B2B]'
                          }`}
                          style={{ width: `${Math.round((loggedInUser?.metrics.usageVelocity || 0) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-earth-sage/20 pt-4 flex flex-col gap-2 mt-4 text-[11px] font-bold text-earth-cocoa/85">
                    <div className="flex justify-between">
                      <span className="text-earth-cocoa/65">Data Used:</span>
                      <span>{Math.round((loggedInUser?.metrics.usageVelocity || 0) * 50)} GB / 50 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-earth-cocoa/65">Call Minutes:</span>
                      <span>420 min / 500 min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-earth-cocoa/65">Assigned Seats:</span>
                      <span>{loggedInUser?.plan === 'Starter' ? '3 / 5' : loggedInUser?.plan === 'Growth' ? '14 / 20' : '45 / Unlimited'}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Row 2: Interaction Actions, AI Optimization, & Chatbot (3 uniform columns) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-stretch">
                
                {/* Module 1: Self-Service & Onboarding */}
                <div className="flex flex-col gap-6 w-full">
                  {/* Onboarding Checklist Card */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-5 rounded-2xl flex flex-col gap-3.5 shadow-sm text-left flex-1 justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-earth-clay">AI ONBOARDING CHECKLIST</span>
                      <div className="flex flex-col gap-2 mt-3">
                        {onboardingSteps.map((step) => {
                          const isAutopay = step.id === 'autopay';
                          const isDone = isAutopay ? !hasFailedPayment : step.done;
                          return (
                            <button 
                              key={step.id}
                              onClick={() => {
                                if (isAutopay) {
                                  if (hasFailedPayment) {
                                    handleClientAction(loggedInUser.id, 'extend_grace');
                                    setPortalNotification({
                                      title: 'Grace Extension Activated',
                                      message: 'Your payment delinquency has been updated to a 7-day grace extension successfully.',
                                      type: 'success'
                                    });
                                  } else {
                                    setPortalNotification({
                                      title: 'Payment Status Healthy',
                                      message: 'Auto-pay is active and operates in good standing.',
                                      type: 'info'
                                    });
                                  }
                                } else {
                                  setOnboardingSteps(prev => prev.map(s => s.id === step.id ? { ...s, done: !s.done } : s));
                                }
                              }}
                              className="flex items-center gap-2.5 text-xs text-earth-cocoa font-bold text-left cursor-pointer hover:bg-earth-sage/10 p-1.5 rounded-xl transition-all w-full"
                            >
                              <span className={`w-4.5 h-4.5 rounded-lg border flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                isDone 
                                  ? 'bg-[#276B2B] text-earth-bg border-[#276B2B]' 
                                  : 'border-earth-sage bg-earth-bg/50'
                              }`}>
                                {isDone ? '✓' : ''}
                              </span>
                              <span className={isDone ? 'line-through opacity-60 font-medium' : ''}>
                                {step.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <span className="text-[9px] text-earth-cocoa/50 mt-3 leading-tight block">
                      💡 Click items to complete onboarding. Setup Auto-pay resolves payment warnings instantly.
                    </span>
                  </div>

                  {/* Add-on deals card */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-5 rounded-2xl flex flex-col gap-3.5 shadow-sm text-left justify-between min-h-[170px]">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-earth-clay">PERSONALIZED ADD-ON DEALS</span>
                    <div className="flex flex-col gap-3 mt-1.5">
                      <div className="flex justify-between items-center border-b border-earth-sage/10 pb-2">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-extrabold text-earth-cocoa">Roaming Pass</span>
                          <span className="text-[9px] text-earth-cocoa/65">APAC & Europe • $15/mo</span>
                        </div>
                        <button 
                          onClick={() => {
                            loggedInUser.activityLogs = [
                              { date: new Date().toLocaleDateString(), type: 'plan_change' as const, details: 'Purchased APAC & Europe Roaming Pass Add-on.' },
                              ...(loggedInUser.activityLogs || [])
                            ];
                            addTelemetry(`Customer ${loggedInUser.name} purchased Roaming Pass add-on.`);
                            setPortalNotification({
                              title: 'Add-on Pass Activated',
                              message: '✈_ APAC & Europe Roaming Pass activated successfully! Added to your next monthly bill.',
                              type: 'success'
                            });
                          }}
                          className="bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-bold text-[9px] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                        >
                          Buy Pass
                        </button>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-extrabold text-earth-cocoa">5G Extra Quota</span>
                          <span className="text-[9px] text-earth-cocoa/65">+10 GB High-Speed • $10/mo</span>
                        </div>
                        <button 
                          onClick={() => {
                            loggedInUser.activityLogs = [
                              { date: new Date().toLocaleDateString(), type: 'plan_change' as const, details: 'Added 10 GB 5G Extra Data Quota.' },
                              ...(loggedInUser.activityLogs || [])
                            ];
                            addTelemetry(`Customer ${loggedInUser.name} added 10 GB data quota.`);
                            setPortalNotification({
                              title: 'Data Quota Added',
                              message: '⚡ 10 GB Extra Data Quota added successfully! Added to your next invoice.',
                              type: 'success'
                            });
                          }}
                          className="bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-bold text-[9px] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                        >
                          Buy Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Module 2: AI Plan Optimization Suggestions & Logs */}
                <div className="flex flex-col gap-6 w-full">
                  {/* Suggestions block */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-5 rounded-2xl flex flex-col gap-3 shadow-sm text-left justify-between flex-1">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-earth-clay">AI PLAN OPTIMIZATION</span>
                      
                      {((loggedInUser?.metrics.usageVelocity || 0) < 0.35 && loggedInUser?.plan !== 'Starter') || hasFailedPayment ? (
                        <div className="flex flex-col gap-3 mt-3">
                          {/* Case A: Underutilization */}
                          {(loggedInUser?.metrics.usageVelocity || 0) < 0.35 && loggedInUser?.plan !== 'Starter' && (
                            <div className="bg-status-healthy/10 border border-[#276B2B]/20 p-3.5 rounded-xl flex flex-col gap-2">
                              <span className="text-[10px] font-extrabold text-[#276B2B] uppercase">Saving Opportunity</span>
                              <p className="text-[10px] text-earth-cocoa leading-relaxed">
                                Usage is at {Math.round((loggedInUser?.metrics.usageVelocity || 0) * 100)}%. Downgrade to **Starter Plan** to save **${downgradeSavings(loggedInUser?.mrr || 0).toLocaleString()}/mo**.
                              </p>
                              <button 
                                onClick={() => {
                                  handleClientAction(clientUserId, 'downgrade');
                                  setPortalNotification({
                                    title: 'Plan Downgrade Applied',
                                    message: '📉 1-Click Downgrade applied successfully! Plan set to Starter.',
                                    type: 'success'
                                  });
                                }}
                                className="bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-extrabold text-[9px] py-1.5 rounded-lg transition-all w-full cursor-pointer text-center"
                              >
                                Downgrade plan to save
                              </button>
                            </div>
                          )}

                          {/* Case B: Billing Delinquency */}
                          {hasFailedPayment && (
                            <div className="bg-status-critical/10 border border-status-critical/30 p-3.5 rounded-xl flex flex-col gap-2">
                              <span className="text-[10px] font-extrabold text-status-critical uppercase">Payment Grace alert</span>
                              <p className="text-[10px] text-earth-cocoa leading-relaxed">
                                Transaction declined. Request a **7-day grace extension** to prevent service lock.
                              </p>
                              <button 
                                onClick={() => {
                                  handleClientAction(clientUserId, 'extend_grace');
                                  setPortalNotification({
                                    title: 'Grace Period Extended',
                                    message: '🔌 Grace extension requested successfully! Status set to Grace Period.',
                                    type: 'success'
                                  });
                                }}
                                className="bg-status-critical hover:bg-[#8F2618] text-earth-bg font-extrabold text-[9px] py-1.5 rounded-lg transition-all w-full cursor-pointer text-center"
                              >
                                Request 7-Day Extension
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-[#276B2B]/5 border border-[#276B2B]/20 p-5 rounded-2xl flex flex-col gap-2.5 mt-3">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#276B2B]">System Status: Stable</span>
                          <p className="text-[11px] text-earth-cocoa/95 leading-relaxed">
                            All systems operating optimally. Your plan settings perfectly align with current usage telemetry limits.
                          </p>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-earth-cocoa/50 mt-3 leading-tight block">
                      💡 Optimization recommendation algorithm auto-syncs every 60 seconds to right-size contracts.
                    </span>
                  </div>

                  {/* Service Log Ticker */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-5 rounded-2xl flex flex-col gap-3 shadow-sm text-left min-h-[170px] justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-earth-cocoa/65">YOUR RECENT ACCOUNT HISTORY LOG</span>
                    <div className="flex-1 flex flex-col gap-2 overflow-y-auto mt-2 max-h-[100px] border border-earth-sage/10 rounded-xl p-2 bg-earth-bg/30">
                      {(loggedInUser?.activityLogs || []).map((log, idx) => (
                        <div key={idx} className="flex gap-2 text-[9px] text-earth-cocoa/80 items-start">
                          <span className="font-bold text-earth-sage shrink-0">{log.date}</span>
                          <span className="text-earth-cocoa/30 shrink-0">|</span>
                          <span className="text-left flex-1 leading-normal">{log.details}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Module 3: AI Chatbot Assistant */}
                <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-5 rounded-2xl flex flex-col gap-3.5 shadow-sm h-full justify-between text-left min-h-[380px]">
                  <div className="flex justify-between items-center border-b border-earth-sage/20 pb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-earth-clay">AI PLAN ASSISTANT CHATBOT</span>
                    <span className="w-2 h-2 rounded-full bg-[#276B2B] animate-pulse" />
                  </div>

                  <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 py-2 font-sans pr-1 text-[10px] max-h-[250px]">
                    {chatbotMessages.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`p-2.5 rounded-2xl max-w-[85%] leading-relaxed ${
                          msg.sender === 'user' 
                            ? 'bg-earth-cocoa text-earth-bg ml-auto rounded-tr-none shadow-sm' 
                            : 'bg-earth-bg/75 text-earth-cocoa mr-auto rounded-tl-none border border-earth-sage/15 shadow-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!chatInput.trim()) return;
                      const userMsg = chatInput.trim();
                      setChatbotMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
                      setChatInput('');

                      // Compute AI Response
                      setTimeout(() => {
                        let botReply = "I can help you audit your billing invoices, change subscription plans, activate eSIM roaming passes, or resolve credit card issues. What would you like to do?";
                        const lower = userMsg.toLowerCase();
                        if (lower.includes("bill") || lower.includes("invoice") || lower.includes("charge") || lower.includes("pay")) {
                          botReply = hasFailedPayment 
                            ? `⚠️ ALERT: Your last credit card renewal declined. Please request a Grace Extension or update payment details.`
                            : `Your account is healthy! Current subscription costs $${loggedInUser.mrr}/mo and auto-renews via credit card.`;
                        } else if (lower.includes("limit") || lower.includes("data") || lower.includes("usage") || lower.includes("quota")) {
                          botReply = `You are currently utilizing ${Math.round((loggedInUser.metrics.usageVelocity || 0) * 100)}% of your plan thresholds. Recommend buying 5G Extra Data (+10 GB) for $10 to prevent speed drops.`;
                        } else if (lower.includes("roaming") || lower.includes("travel") || lower.includes("abroad")) {
                          botReply = "Planning a trip? Buy our APAC & Europe Roaming Pass add-on for $15/mo to get high-speed connection abroad!";
                        } else if (lower.includes("upgrade") || lower.includes("downgrade") || lower.includes("plan")) {
                          botReply = `You are on the ${loggedInUser.plan} subscription plan. If you need plan suggestions, our optimization dashboard recommends right-sizing to match your telemetry metrics.`;
                        }
                        setChatbotMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
                      }, 500);
                    }}
                    className="flex gap-2 border-t border-earth-sage/20 pt-2.5"
                  >
                    <input 
                      type="text" 
                      placeholder="Ask about plan, billing, roaming..." 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-earth-bg border border-earth-sage/35 rounded-xl px-3 py-2 text-[10px] text-earth-cocoa font-bold outline-none focus:border-earth-clay placeholder-earth-cocoa/50"
                    />
                    <button 
                      type="submit"
                      className="bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-extrabold text-[10px] px-3.5 rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      Send
                    </button>
                  </form>
                </div>

              </div>

            </div>
          </div>
      {portalNotification && (
        <PortalNotificationModal notification={portalNotification} onDismiss={() => setPortalNotification(null)} />
      )}
    </>
  );
}
