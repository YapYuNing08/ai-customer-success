import { useState, useEffect } from 'react';
import { ArrowLeft, X, Sparkles, PlayCircle } from 'lucide-react';
import { downgradeSavings, suggestPlanChange } from '../utils/mockData';
import { PortalNotificationModal } from '../components/modals/PortalNotificationModal';
import { OnboardingWizard, LIFESTYLE_CONFIG, PLAN_OPTIONS, type PlanKey, type WizardResult } from '../components/OnboardingWizard';
import Avatar from '../components/Avatar';

// DEMO-ONLY: personalized feature-tutorial video the Falcon Guide Agent sends
// to Yu Ning (Pro Plan + unused benefits). Kept in sync with the same constant
// in ActiveUserInsight.tsx (CSM "Send Helpful Tutorials").
const FEATURE_TUTORIAL_VIDEO = 'https://www.youtube.com/watch?v=4d966u2XPuQ';

export function ClientDashboardPage(props: any) {
  const { users, clientUserId, setClientUserId, handleClientAction, addTelemetry, setCurrentPage, signupCompleted, onSignup, onSignupSkip } = props;
  const [chatbotMessages, setChatbotMessages] = useState<{ sender: 'user' | 'bot'; text: string; link?: string }[]>([
    { sender: 'bot', text: "Hello! I'm your Falcon Guide Agent. Ask me anything about your mobile plan, billing renewal, data usage, or roaming add-ons!" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [portalNotification, setPortalNotification] = useState<{ title: string; message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showPlanPicker, setShowPlanPicker] = useState(false);
  // Demo aid: the card the presenter last clicked keeps a pulsing border until another is clicked.
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  // Floating Falcon assistant: closed by default, with a proactive teaser bubble.
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [showChatTeaser, setShowChatTeaser] = useState(false);

  const loggedInUser = users.find((u: any) => u.id === clientUserId) || users[0];
  const hasFailedPayment = loggedInUser?.warningFlags?.includes('Failed Payment');
  // DEMO-ONLY: Yu Ning is the hardcoded high-risk hero customer — the Falcon
  // Guide Agent proactively pushes her a personalized Pro Plan feature tutorial.
  const isYuNing = loggedInUser?.id === 'cus_yuning'
    || (loggedInUser?.name || '').toLowerCase().replace(/\s+/g, '').includes('yuning');
  // Threshold-rule suggestion (same rule the 1-click actions use) so the plan
  // picker can flag the AI's pick alongside the customer's free choice.
  const planSuggestion = loggedInUser
    ? suggestPlanChange(loggedInUser.plan, loggedInUser.metrics?.usageVelocity || 0, loggedInUser.mrr)
    : null;

  const handleSelfServePlanChange = (targetPlan: PlanKey) => {
    handleClientAction(clientUserId, 'change_plan', targetPlan);
    setShowPlanPicker(false);
    setPortalNotification({
      title: 'Plan Changed',
      message: `✅ Your subscription has been switched to the ${targetPlan} Plan. The new rate applies from your next billing cycle.`,
      type: 'success'
    });
  };

  useEffect(() => {
    if (!signupCompleted) {
      setShowWizard(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Proactively pop the assistant teaser bubble a beat after load so the
  // floating Falcon widget invites the customer to start a chat.
  useEffect(() => {
    const t = setTimeout(() => setShowChatTeaser(true), 1400);
    return () => clearTimeout(t);
  }, []);

  // DEMO-ONLY: rebuild the Falcon Guide Agent thread when the active customer
  // changes. For Yu Ning (high-risk hero), the agent proactively sends a
  // personalized feature tutorial highlighting her Pro Plan and the benefits
  // she's paying for but not using, with the walkthrough video link.
  useEffect(() => {
    const greeting = {
      sender: 'bot' as const,
      text: "Hello! I'm your Falcon Guide Agent. Ask me anything about your mobile plan, billing renewal, data usage, or roaming add-ons!",
    };
    if (isYuNing) {
      const firstName = (loggedInUser?.name || 'there').split(' ')[0];
      setChatbotMessages([
        greeting,
        {
          sender: 'bot' as const,
          text: `Hi ${firstName}! Great to see you're getting the full value of your ${loggedInUser?.plan || 'Pro'} Plan — Advanced Analytics, Automation Workflows, and Priority Roaming are all active now, and your usage is up 3x this month. Here's a quick refresher if you'd like to go even deeper:`,
          link: FEATURE_TUTORIAL_VIDEO,
        },
      ]);
    } else {
      setChatbotMessages([greeting]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientUserId]);

  const handleWizardComplete = (result: WizardResult) => {
    setShowWizard(false);
    onSignup(result);
  };

  return (
    <>
      <div className="w-full px-6 sm:px-10 lg:px-16 py-12 text-left flex flex-col gap-8 animate-fadeIn bg-white min-h-[calc(100vh-80px)] font-sans">
        {/* Header section */}
        <div className="flex justify-between items-center border-b pb-4 border-slate-200">
          <div>
            <h2 className="text-3xl font-extrabold mt-1 text-[#001871] font-serif">Telco Customer Portal</h2>
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
        <div
          onClick={() => setSelectedCard('switcher')}
          className={`bg-white border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm cursor-pointer transition-all ${selectedCard === 'switcher' ? 'demo-card-selected-client' : ''}`}
        >
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
            <div
              onClick={() => setSelectedCard('profile')}
              className={`bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between flex-1 shadow-sm hover:border-[#0064DC]/20 transition-all text-left cursor-pointer ${selectedCard === 'profile' ? 'demo-card-selected-client' : ''}`}
            >
              <div>
                <span className="text-xs uppercase font-bold text-[#0064DC] tracking-wider">Account Identity</span>
                <div className="flex items-center gap-4 mt-3">
                  <Avatar
                    name={loggedInUser?.name}
                    className="w-14 h-14 text-xl rounded-full border border-slate-200"
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
                    RM{loggedInUser?.mrr}/mo
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
            <div
              onClick={() => setSelectedCard('usage')}
              className={`bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between flex-1 shadow-sm hover:border-[#0064DC]/20 transition-all text-left cursor-pointer ${selectedCard === 'usage' ? 'demo-card-selected-client' : ''}`}
            >
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

          {/* Row 2: two columns — left AI optimization, right add-ons + history.
              The AI chatbot is now a floating Falcon widget (bottom-right). */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
            
            {/* Left Column: AI Plan Optimization */}
            <div className="flex flex-col gap-6 w-full">
              
              {/* Suggestions block / AI Plan Optimization Card */}
              <div
                onClick={() => setSelectedCard('optimization')}
                className={`bg-white border border-slate-200 p-5 rounded-2xl flex flex-col gap-3 shadow-sm hover:border-[#0064DC]/20 transition-all text-left cursor-pointer ${selectedCard === 'optimization' ? 'demo-card-selected-client' : ''}`}
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <img src="/falcon-icon.png" alt="Falcon Coach Agent" className="w-8 h-8 object-contain shrink-0" />
                    <div className="flex flex-col leading-tight">
                      <h3 className="text-sm font-extrabold text-[#001871]">Falcon Coach Agent</h3>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0064DC]">AI Plan Optimization</span>
                    </div>
                  </div>

                  {((loggedInUser?.metrics.usageVelocity || 0) < 0.35 && loggedInUser?.plan !== 'Starter') || hasFailedPayment ? (
                    <div className="flex flex-col gap-3 mt-3">
                      {/* Case A: Underutilization — explore-first, downgrade optional.
                          Falcon Coach leads with personalized feature guidance
                          (unlock what you're already paying for); the downgrade
                          becomes a secondary "or save instead" option so the
                          customer explores the plan before deciding to change it. */}
                      {(loggedInUser?.metrics.usageVelocity || 0) < 0.35 && loggedInUser?.plan !== 'Starter' && (
                        <div className="flex flex-col gap-3">
                          {/* Primary recommendation: explore unused benefits */}
                          <div className="bg-[#0064DC]/5 border border-[#0064DC]/25 p-3.5 rounded-xl flex flex-col gap-2">
                            <span className="flex items-center gap-1.5 text-xs font-extrabold text-[#0064DC] uppercase tracking-wider">
                              <Sparkles className="w-3.5 h-3.5" />
                              Recommended for You
                            </span>
                            <p className="text-xs text-[#001871] leading-relaxed">
                              You're on the <span className="font-extrabold">{loggedInUser?.plan} Plan</span> but only using {Math.round((loggedInUser?.metrics.usageVelocity || 0) * 100)}% of it. Falcon Coach found <span className="font-extrabold">3 benefits you're already paying for</span> but haven't tried yet — <span className="font-extrabold">Advanced Analytics</span>, <span className="font-extrabold">Automation Workflows</span>, and <span className="font-extrabold">Priority Roaming</span>. Explore these first to get the full value of your plan.
                            </p>
                            <a
                              href={FEATURE_TUTORIAL_VIDEO}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                e.stopPropagation();
                                loggedInUser.activityLogs = [
                                  { date: new Date().toLocaleDateString(), type: 'feature_use' as const, details: `Opened personalized ${loggedInUser.plan} Plan benefits tutorial (Analytics, Automation, Priority Roaming).` },
                                  ...(loggedInUser.activityLogs || [])
                                ];
                                addTelemetry(`Customer ${loggedInUser.name} started exploring unused ${loggedInUser.plan} Plan benefits.`);
                              }}
                              className="flex items-center justify-center gap-1.5 bg-[#001871] hover:bg-[#0064DC] text-white font-extrabold text-xs py-2 rounded-lg transition-all w-full cursor-pointer text-center shadow-sm"
                            >
                              <PlayCircle className="w-4 h-4" />
                              Explore My Plan Benefits
                            </a>
                          </div>

                          {/* Secondary option: right-size / downgrade after exploring */}
                          <div className="bg-[#FFD400]/10 border border-[#FFD400]/45 p-3.5 rounded-xl flex flex-col gap-2">
                            <span className="text-xs font-extrabold text-[#001871] uppercase">Or, Prefer to Save?</span>
                            <p className="text-xs text-[#001871] leading-relaxed">
                              If you'd rather not use the full plan, you can downgrade to **Starter Plan** and save **RM{downgradeSavings(loggedInUser?.mrr || 0).toLocaleString()}/mo**. No rush — try the benefits above first.
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

                {/* Self-service plan change — always available, independent of
                    whether the AI raised a recommendation above */}
                <div className="border-t border-slate-100 pt-3 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-xs font-bold text-slate-600">Prefer to choose yourself? Switch to any plan, anytime.</span>
                    <button
                      onClick={() => setShowPlanPicker(v => !v)}
                      className="bg-white hover:bg-[#0064DC]/5 text-[#0064DC] border border-[#0064DC]/40 font-extrabold text-xs px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                    >
                      {showPlanPicker ? 'Hide Plans' : 'Change Plan'}
                    </button>
                  </div>
                  {showPlanPicker && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fadeIn">
                      {(Object.keys(PLAN_OPTIONS) as PlanKey[]).map(key => {
                        const isCurrent = loggedInUser?.plan === key;
                        const isAiPick = planSuggestion?.targetPlan === key;
                        return (
                          <button
                            key={key}
                            disabled={isCurrent}
                            onClick={() => handleSelfServePlanChange(key)}
                            className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                              isCurrent
                                ? 'bg-slate-50 border-slate-200 cursor-default opacity-70'
                                : 'bg-white border-slate-200 hover:border-[#0064DC] hover:shadow-sm cursor-pointer'
                            }`}
                          >
                            <span className="flex items-center gap-2 text-xs font-extrabold text-[#001871]">
                              {key}
                              {isCurrent && (
                                <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600">Current</span>
                              )}
                              {!isCurrent && isAiPick && (
                                <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full bg-[#0064DC]/10 text-[#0064DC] border border-[#0064DC]/30">AI Suggested</span>
                              )}
                            </span>
                            <span className="text-xs font-extrabold text-[#0064DC]">RM{PLAN_OPTIONS[key].price}/mo</span>
                            <span className="text-[10px] text-slate-500 leading-snug">{PLAN_OPTIONS[key].blurb}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <span className="text-xs text-slate-500 mt-2 leading-tight block">
                  💡 Optimization recommendation algorithm auto-syncs every 60 seconds to right-size contracts.
                </span>
              </div>
            </div>

            {/* Right Column: Personalized add-ons & recent account history */}
            <div className="flex flex-col gap-6 w-full">

              {/* Add-on deals card */}
              <div
                onClick={() => setSelectedCard('addons')}
                className={`bg-white border border-slate-200 p-5 rounded-2xl flex flex-col gap-3.5 shadow-sm hover:border-[#0064DC]/20 transition-all text-left cursor-pointer ${selectedCard === 'addons' ? 'demo-card-selected-client' : ''}`}
              >
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0064DC]">PERSONALIZED ADD-ON DEALS</span>
                <div className="flex flex-col gap-3 mt-1.5">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-extrabold text-[#001871]">Roaming Pass</span>
                      <span className="text-xs text-slate-500">APAC & Europe • RM50/mo</span>
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
                      <span className="text-xs text-slate-500">+10 GB High-Speed • RM10/mo</span>
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
              <div
                onClick={() => setSelectedCard('history')}
                className={`bg-white border border-slate-200 p-5 rounded-2xl flex flex-col gap-3 shadow-sm hover:border-[#0064DC]/20 transition-all text-left cursor-pointer ${selectedCard === 'history' ? 'demo-card-selected-client' : ''}`}
              >
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

            {/* Floating Falcon AI assistant — position:fixed lifts it out of the
                grid flow to the bottom-right of the viewport, so the two-column
                add-ons/history layout above is unaffected. */}
            <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">

              {/* Chat panel (opens above the Falcon launcher) */}
              {chatbotOpen && (
              <div className="bg-white border border-slate-200 rounded-2xl flex flex-col shadow-2xl w-[360px] max-w-[calc(100vw-3rem)] h-[480px] overflow-hidden animate-fadeIn text-left">
                <div className="flex justify-between items-center border-b border-slate-200 px-4 py-3 bg-[#001871]">
                  <div className="flex items-center gap-2">
                    <img src="/falcon-icon.png" alt="" className="w-6 h-6 object-contain" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-white">Falcon Guide Agent</span>
                    <span className="w-2 h-2 rounded-full bg-[#FFD400] animate-pulse" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setChatbotOpen(false)}
                    aria-label="Close assistant"
                    className="text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 p-4 font-sans text-xs bg-slate-50/60">
                  {chatbotMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-2xl max-w-[85%] leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#0064DC] text-white ml-auto rounded-tr-none shadow-sm'
                          : 'bg-white text-[#001871] mr-auto rounded-tl-none border border-slate-200/80 shadow-sm'
                      }`}
                    >
                      {msg.text}
                      {msg.link && (
                        <a
                          href={msg.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 flex items-center justify-center gap-1.5 bg-[#001871] hover:bg-[#0064DC] text-white font-extrabold text-[11px] px-3 py-2 rounded-xl transition-all shadow-sm"
                        >
                          ▶ Watch Your Personalized Tutorial
                        </a>
                      )}
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
                      const lower = userMsg.toLowerCase();
                      let botMsg: { sender: 'bot'; text: string; link?: string } = {
                        sender: 'bot',
                        text: "I can help you audit your billing invoices, change subscription plans, activate eSIM roaming passes, or resolve credit card issues. What would you like to do?",
                      };
                      if (lower.includes("tutorial") || lower.includes("feature") || lower.includes("benefit") || lower.includes("learn") || lower.includes("video") || lower.includes("guide") || lower.includes("how")) {
                        botMsg = {
                          sender: 'bot',
                          text: `Here's a quick personalized tutorial for your ${loggedInUser.plan} Plan — it covers getting even more out of Advanced Analytics, Automation Workflows, and Priority Roaming.`,
                          link: FEATURE_TUTORIAL_VIDEO,
                        };
                      } else if (lower.includes("bill") || lower.includes("invoice") || lower.includes("charge") || lower.includes("pay")) {
                        botMsg = {
                          sender: 'bot',
                          text: hasFailedPayment
                            ? `⚠️ ALERT: Your last credit card renewal declined. Please request a Grace Extension or update payment details.`
                            : `Your account is healthy! Current subscription costs RM${loggedInUser.mrr}/mo and auto-renews via credit card.`,
                        };
                      } else if (lower.includes("limit") || lower.includes("data") || lower.includes("usage") || lower.includes("quota")) {
                        botMsg = {
                          sender: 'bot',
                          text: `You are currently utilizing ${Math.round((loggedInUser.metrics.usageVelocity || 0) * 100)}% of your plan thresholds. Recommend buying 5G Extra Data (+10 GB) for RM10 to prevent speed drops.`,
                        };
                      } else if (lower.includes("roaming") || lower.includes("travel") || lower.includes("abroad")) {
                        botMsg = {
                          sender: 'bot',
                          text: "Planning a trip? Buy our APAC & Europe Roaming Pass add-on for RM50/mo to get high-speed connection abroad!",
                        };
                      } else if (lower.includes("upgrade") || lower.includes("downgrade") || lower.includes("plan")) {
                        botMsg = {
                          sender: 'bot',
                          text: `You are on the ${loggedInUser.plan} subscription plan. You can switch to any plan yourself with the "Change Plan" button in the AI Plan Optimization panel — the AI will flag its suggested tier for you.`,
                        };
                      }
                      setChatbotMessages(prev => [...prev, botMsg]);
                    }, 500);
                  }}
                  className="flex gap-2 border-t border-slate-200 p-3 bg-white"
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
              )}

              {/* Proactive teaser (prewritten pop-up message) */}
              {!chatbotOpen && showChatTeaser && (
                <div className="relative bg-white border border-slate-200 rounded-2xl rounded-br-md shadow-xl p-3.5 pr-7 max-w-[260px] animate-fadeIn text-left">
                  <button
                    type="button"
                    onClick={() => setShowChatTeaser(false)}
                    aria-label="Dismiss message"
                    className="absolute top-1.5 right-1.5 text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-xs text-[#001871] font-semibold leading-relaxed">
                    {isYuNing
                      ? `🎉 You're getting great value from your ${loggedInUser?.plan || 'Pro'} Plan — all your premium benefits are active. Tap if you'd like tips to go even further.`
                      : "👋 Hi! I'm your Falcon Guide Agent. Need help with your plan, billing, or roaming add-ons?"}
                  </p>
                </div>
              )}

              {/* Falcon launcher button */}
              <button
                type="button"
                onClick={() => { setChatbotOpen(v => !v); setShowChatTeaser(false); }}
                aria-label={chatbotOpen ? 'Close assistant' : 'Open assistant'}
                className="relative w-16 h-16 rounded-full bg-white shadow-2xl ring-2 ring-[#001871]/10 hover:ring-[#0064DC]/40 flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
              >
                <img src="/falcon-icon-flipped.png" alt="Falcon360 assistant" className="w-11 h-11 object-contain" />
                {!chatbotOpen && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-status-risk border-2 border-white animate-pulse" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {showWizard && (
        <OnboardingWizard
          customerName={loggedInUser?.name || 'there'}
          mode="signup"
          onComplete={handleWizardComplete}
          onClose={() => {
            setShowWizard(false);
            onSignupSkip();
            addTelemetry('Visitor skipped sign-up — browsing portal as a demo profile.');
          }}
          addTelemetry={addTelemetry}
        />
      )}
      {portalNotification && (
        <PortalNotificationModal notification={portalNotification} onDismiss={() => setPortalNotification(null)} />
      )}
    </>
  );
}
