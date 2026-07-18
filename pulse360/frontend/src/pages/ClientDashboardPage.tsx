import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { downgradeSavings } from '../utils/mockData';
import { PortalNotificationModal } from '../components/modals/PortalNotificationModal';

export function ClientDashboardPage(props: any) {
  const { users, clientUserId, setClientUserId, handleClientAction, addTelemetry, setCurrentPage } = props;
  const [chatbotMessages, setChatbotMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
    { sender: 'bot', text: "Hello! I'm your Telco AI assistant. Ask me anything about your mobile plan, billing renewal, data usage, or roaming add-ons!" }
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
      <div className="w-full max-w-7xl mx-auto px-6 py-12 text-left flex flex-col gap-8 animate-fadeIn bg-white min-h-[calc(100vh-80px)] font-sans">
        {/* Header section */}
        <div className="flex justify-between items-center border-b pb-4 border-slate-200">
          <div>
            <span className="text-xs uppercase font-bold text-[#0064DC] tracking-wider">Subscriber Portal</span>
            <h2 className="text-3xl font-extrabold mt-1 text-[#001871] font-serif">Telco Customer Console</h2>
          </div>
          <button 
            onClick={() => setCurrentPage('marketing')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold border border-transparent transition-all duration-200 cursor-pointer bg-[#001871] text-white hover:bg-[#0064DC] shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Overview</span>
          </button>
        </div>

        {/* Profile Switcher dropdown */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-[#001871]">Switch Client View (CSM Sandbox Tool)</h3>
            <p className="text-xs text-slate-600 mt-1">
              Change active customer profiles to preview different billing or underutilization states.
            </p>
          </div>
          <select
            value={clientUserId}
            onChange={(e) => setClientUserId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-bold outline-none cursor-pointer focus:border-[#0064DC] min-w-[200px]"
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
            <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between flex-1 shadow-sm hover:border-[#0064DC]/20 transition-all text-left">
              <div>
                <span className="text-xs uppercase font-bold text-[#0064DC] tracking-wider">Account Identity</span>
                <div className="flex items-center gap-4 mt-3">
                  <img 
                    src={loggedInUser?.avatar} 
                    alt={loggedInUser?.name} 
                    className="w-14 h-14 rounded-full border border-slate-200 object-cover bg-white shrink-0" 
                  />
                  <div>
                    <h3 className="font-extrabold text-[#001871] text-base leading-tight">
                      {loggedInUser?.name}
                    </h3>
                    <span className="text-xs text-slate-600 mt-1 block">
                      {loggedInUser?.email}
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5 block">
                      {loggedInUser?.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex flex-col gap-2 mt-4 font-bold">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">Subscription Plan:</span>
                  <span className="font-extrabold text-[#001871] uppercase tracking-wider text-xs bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full">
                    {loggedInUser?.plan} Plan
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">Monthly Contract MRR:</span>
                  <span className="font-bold text-[#0064DC]">
                    ${loggedInUser?.mrr}/mo
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">Billing Status:</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    hasFailedPayment
                      ? 'bg-status-critical/15 border border-status-critical/30 text-status-critical'
                      : 'bg-[#276B2B]/15 border border-[#276B2B]/30 text-status-healthy'
                  }`}>
                    {hasFailedPayment ? 'Past Due' : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Usage statistics card */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between flex-1 shadow-sm hover:border-[#0064DC]/20 transition-all text-left">
              <div>
                <span className="text-xs uppercase font-bold text-[#0064DC] tracking-wider">Data Thresholds</span>
                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#001871] uppercase tracking-wider">Monthly Bandwidth Used</span>
                    <span className="font-extrabold text-[#0064DC]">
                      {Math.round((loggedInUser?.metrics.usageVelocity || 0) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        (loggedInUser?.metrics.usageVelocity || 0) < 0.35 ? 'bg-status-risk' : 'bg-[#0064DC]'
                      }`}
                      style={{ width: `${Math.round((loggedInUser?.metrics.usageVelocity || 0) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex flex-col gap-2 mt-4 text-xs font-bold text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Data Used:</span>
                  <span>{Math.round((loggedInUser?.metrics.usageVelocity || 0) * 50)} GB / 50 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Call Minutes:</span>
                  <span>420 min / 500 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Seats:</span>
                  <span>{loggedInUser?.plan === 'Starter' ? '3 / 5' : loggedInUser?.plan === 'Growth' ? '14 / 20' : '45 / Unlimited'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Row 2: Interaction Actions, AI Optimization, & Chatbot (2 main layout columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch">
            
            {/* Left Column: Stack of Checklist, Plan Optimization, Add-ons, and History Log */}
            <div className="flex flex-col gap-6 w-full">
              
              {/* Onboarding Checklist Card */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col gap-3.5 shadow-sm hover:border-[#0064DC]/20 transition-all text-left">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#0064DC]">AI ONBOARDING CHECKLIST</span>
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
                          className="flex items-center gap-2.5 text-xs text-[#001871] font-bold text-left cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-all w-full"
                        >
                          <span className={`w-4.5 h-4.5 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 ${
                            isDone 
                              ? 'bg-[#0064DC] text-white border-[#0064DC]' 
                              : 'border-slate-300 bg-slate-50'
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
                <span className="text-xs text-slate-500 mt-2 leading-tight block">
                  💡 Click items to complete onboarding. Setup Auto-pay resolves payment warnings instantly.
                </span>
              </div>

              {/* Suggestions block / AI Plan Optimization Card */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col gap-3 shadow-sm hover:border-[#0064DC]/20 transition-all text-left">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#0064DC]">AI PLAN OPTIMIZATION</span>
                  
                  {((loggedInUser?.metrics.usageVelocity || 0) < 0.35 && loggedInUser?.plan !== 'Starter') || hasFailedPayment ? (
                    <div className="flex flex-col gap-3 mt-3">
                      {/* Case A: Underutilization */}
                      {(loggedInUser?.metrics.usageVelocity || 0) < 0.35 && loggedInUser?.plan !== 'Starter' && (
                        <div className="bg-[#FFD400]/10 border border-[#FFD400]/45 p-3.5 rounded-xl flex flex-col gap-2">
                          <span className="text-xs font-extrabold text-[#001871] uppercase">Saving Opportunity</span>
                          <p className="text-xs text-[#001871] leading-relaxed">
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
                            className="bg-[#FFD400] hover:bg-[#e6be00] text-slate-900 font-extrabold text-xs py-1.5 rounded-lg transition-all w-full cursor-pointer text-center shadow-sm"
                          >
                            Downgrade plan to save
                          </button>
                        </div>
                      )}

                      {/* Case B: Billing Delinquency */}
                      {hasFailedPayment && (
                        <div className="bg-status-critical/10 border border-status-critical/30 p-3.5 rounded-xl flex flex-col gap-2">
                          <span className="text-xs font-extrabold text-status-critical uppercase">Payment Grace alert</span>
                          <p className="text-xs text-slate-800 leading-relaxed">
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
                            className="bg-status-critical hover:bg-red-700 text-white font-extrabold text-xs py-1.5 rounded-lg transition-all w-full cursor-pointer text-center shadow-sm"
                          >
                            Request 7-Day Extension
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-[#0064DC]/5 border border-[#0064DC]/20 p-5 rounded-2xl flex flex-col gap-2.5 mt-3">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#0064DC]">System Status: Stable</span>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        All systems operating optimally. Your plan settings perfectly align with current usage telemetry limits.
                      </p>
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-500 mt-2 leading-tight block">
                  💡 Optimization recommendation algorithm auto-syncs every 60 seconds to right-size contracts.
                </span>
              </div>

              {/* Add-on deals card */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col gap-3.5 shadow-sm hover:border-[#0064DC]/20 transition-all text-left">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0064DC]">PERSONALIZED ADD-ON DEALS</span>
                <div className="flex flex-col gap-3 mt-1.5">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-extrabold text-[#001871]">Roaming Pass</span>
                      <span className="text-xs text-slate-500">APAC & Europe • $15/mo</span>
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
                          message: '✈ APAC & Europe Roaming Pass activated successfully! Added to your next monthly bill.',
                          type: 'success'
                        });
                      }}
                      className="bg-[#001871] hover:bg-[#0064DC] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shadow-sm"
                    >
                      Buy Pass
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-xs font-extrabold text-[#001871]">5G Extra Quota</span>
                      <span className="text-xs text-slate-500">+10 GB High-Speed • $10/mo</span>
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
                      className="bg-[#001871] hover:bg-[#0064DC] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shadow-sm"
                    >
                      Buy Data
                    </button>
                  </div>
                </div>
              </div>

              {/* Service Log Ticker / History Log Card */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col gap-3 shadow-sm hover:border-[#0064DC]/20 transition-all text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">YOUR RECENT ACCOUNT HISTORY LOG</span>
                <div className="flex-1 flex flex-col gap-2 overflow-y-auto mt-2 max-h-[120px] border border-slate-200 rounded-xl p-2.5 bg-slate-50">
                  {(loggedInUser?.activityLogs || []).map((log, idx) => (
                    <div key={idx} className="flex gap-2 text-xs text-slate-700 items-start">
                      <span className="font-bold text-[#0064DC] shrink-0">{log.date}</span>
                      <span className="text-slate-300 shrink-0">|</span>
                      <span className="text-left flex-1 leading-normal">{log.details}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: AI Chatbot Assistant */}
            <div className="w-full">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col gap-3.5 shadow-sm hover:border-[#0064DC]/20 transition-all text-left h-[480px] justify-between">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#0064DC]">AI PLAN ASSISTANT CHATBOT</span>
                  <span className="w-2 h-2 rounded-full bg-[#0064DC] animate-pulse" />
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 py-2 font-sans pr-1 text-xs">
                  {chatbotMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`p-2.5 rounded-2xl max-w-[85%] leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'bg-[#0064DC] text-white ml-auto rounded-tr-none shadow-sm' 
                          : 'bg-slate-100 text-[#001871] mr-auto rounded-tl-none border border-slate-200/80 shadow-sm'
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
                  className="flex gap-2 border-t border-slate-200 pt-2.5"
                >
                  <input 
                    type="text" 
                    placeholder="Ask about plan, billing, roaming..." 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold outline-none focus:border-[#0064DC] placeholder-slate-400"
                  />
                  <button 
                    type="submit"
                    className="bg-[#001871] hover:bg-[#0064DC] text-white font-extrabold text-xs px-4 rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    Send
                  </button>
                </form>
              </div>
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
