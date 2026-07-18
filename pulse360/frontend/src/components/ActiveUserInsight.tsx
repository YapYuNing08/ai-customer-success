import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, TrendingDown, TrendingUp, UserCheck, 
  Clock, CreditCard, MessageSquare, DollarSign, CheckCircle, 
  Copy, Zap, BookOpen, HeartHandshake, ShieldAlert, Cpu, Send
} from 'lucide-react';
import { type ActiveUser } from '../utils/mockData';
import { explainSimulation, getCustomer, getRecommendation, simulate } from '../lib/api';

interface ActiveUserInsightProps {
  user: ActiveUser;
  onBack: () => void;
  onUpdateUser: (updatedUser: ActiveUser) => void;
}

export const ActiveUserInsight: React.FC<ActiveUserInsightProps> = ({ user, onBack, onUpdateUser }) => {
  const [copied, setCopied] = useState(false);
  const [activePlaybook, setActivePlaybook] = useState<string | null>(null);
  const [lastClickedAction, setLastClickedAction] = useState<'grace_period' | 'training' | 'discount' | 'csm_call' | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  // Reset states when user changes
  useEffect(() => {
    setLastClickedAction(null);
    setIsSendingEmail(false);
    setEmailSentSuccess(false);
  }, [user.id]);

  // Real backend recommendation state
  const [recommendation, setRecommendation] = useState<any>(null);

  useEffect(() => {
    getRecommendation(user.id)
      .then((data) => {
        setRecommendation(data);
      })
      .catch((err) => {
        console.warn('Failed to load recommendation from backend FastAPI.', err);
      });
  }, [user.id]);

  // What-If Simulator Levers State — estimated defaults until the customer's
  // real stored values arrive from GET /customers/{id}.
  const estimatedLevers = {
    login_frequency: 3.5,
    feature_usage: 0.5,
    monthly_usage_pct: Math.round(user.metrics.usageVelocity * 100),
    support_ticket_count: user.metrics.failedPayments > 0 ? 3 : 1,
    feedback_score: user.healthScore > 70 ? 8.5 : 5.8,
    payment_status: user.metrics.failedPayments > 0 ? 'past_due' : 'active'
  };
  const [simLevers, setSimLevers] = useState(estimatedLevers);
  const [baselineLevers, setBaselineLevers] = useState(estimatedLevers);
  const [leversLoaded, setLeversLoaded] = useState(false);

  const [simResult, setSimResult] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);

  // AI narrative for the last simulation (Gemini, with backend fallback text).
  const [aiNarrative, setAiNarrative] = useState<string | null>(null);
  const [aiSource, setAiSource] = useState<'gemini' | 'fallback' | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const narrativeSeq = useRef(0); // ignore out-of-order responses on rapid re-runs

  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

  // Start the sliders at this customer's real current values, so running the
  // simulator without touching anything shows a zero delta (a true baseline).
  useEffect(() => {
    setLeversLoaded(false);
    setSimResult(null);
    setSimError(null);
    setAiNarrative(null);
    setAiSource(null);
    setAiLoading(false);
    narrativeSeq.current += 1;
    getCustomer(user.id)
      .then((c: any) => {
        const real = {
          login_frequency: c.login_frequency != null ? clamp(Math.round(c.login_frequency * 10) / 10, 0.1, 10) : estimatedLevers.login_frequency,
          feature_usage: c.feature_usage != null ? clamp(Math.round(c.feature_usage * 20) / 20, 0, 1) : estimatedLevers.feature_usage,
          monthly_usage_pct: c.monthly_usage_pct != null ? clamp(Math.round(c.monthly_usage_pct), 5, 100) : estimatedLevers.monthly_usage_pct,
          support_ticket_count: c.support_ticket_count != null ? clamp(c.support_ticket_count, 0, 10) : estimatedLevers.support_ticket_count,
          feedback_score: c.feedback_score != null ? clamp(Math.round(c.feedback_score * 10) / 10, 1, 10) : estimatedLevers.feedback_score,
          payment_status: c.payment_status || estimatedLevers.payment_status,
        };
        setSimLevers(real);
        setBaselineLevers(real);
      })
      .catch((err) => {
        console.warn('Could not load current signal values; simulator keeps estimated defaults.', err);
      })
      .finally(() => setLeversLoaded(true));
  }, [user.id]);

  const runSimulation = () => {
    setSimLoading(true);
    setSimError(null);
    const levers = {
      login_frequency: Number(simLevers.login_frequency),
      feature_usage: Number(simLevers.feature_usage),
      monthly_usage_pct: Number(simLevers.monthly_usage_pct),
      support_ticket_count: parseInt(String(simLevers.support_ticket_count)),
      feedback_score: Number(simLevers.feedback_score),
      payment_status: simLevers.payment_status
    };
    simulate(user.id, levers)
      .then((res) => {
        setSimResult(res);
        // Numbers are shown immediately; the AI retention plan streams in after.
        const seq = ++narrativeSeq.current;
        setAiNarrative(null);
        setAiSource(null);
        setAiLoading(true);
        explainSimulation(user.id, levers)
          .then((n) => {
            if (seq !== narrativeSeq.current) return;
            setAiNarrative(n.narrative);
            setAiSource(n.source);
          })
          .catch((err) => {
            console.warn('AI narrative unavailable for this run.', err);
          })
          .finally(() => {
            if (seq === narrativeSeq.current) setAiLoading(false);
          });
      })
      .catch((err) => {
        setSimError('Could not run the simulation right now. Please try again.');
        console.error(err);
      })
      .finally(() => {
        setSimLoading(false);
      });
  };

  // Quick Action triggers (Value Injections)
  const handleAction = (actionType: 'grace_period' | 'training' | 'discount' | 'csm_call') => {
    setLastClickedAction(actionType);
    let updatedUser = { ...user };
    let message = '';

    switch (actionType) {
      case 'grace_period':
        updatedUser.metrics.failedPayments = 0;
        updatedUser.warningFlags = updatedUser.warningFlags.filter(f => f !== 'Failed Payment');
        // Reduce risk by removing billing issue
        updatedUser.churnProbability = Math.max(0, updatedUser.churnProbability - 25);
        updatedUser.healthScore = Math.min(100, updatedUser.healthScore + 20);
        updatedUser.activityLogs.unshift({
          date: new Date().toISOString().split('T')[0],
          type: 'payment_success',
          details: 'Gave the customer an extra 14 days to sort out their payment.'
        });
        message = 'Gave 14 extra days to pay. The account stays active.';
        break;
      case 'training':
        updatedUser.metrics.featureAdoption = Math.min(1.0, updatedUser.metrics.featureAdoption + 0.3);
        updatedUser.warningFlags = updatedUser.warningFlags.filter(f => f !== 'Not Using Key Features');
        updatedUser.churnProbability = Math.max(0, updatedUser.churnProbability - 15);
        updatedUser.healthScore = Math.min(100, updatedUser.healthScore + 15);
        updatedUser.activityLogs.unshift({
          date: new Date().toISOString().split('T')[0],
          type: 'feature_use',
          details: 'Sent the customer video tutorials and how-to guides.'
        });
        message = 'Emailed helpful tutorials. The customer is now using more of the product (+30%).';
        break;
      case 'discount':
        updatedUser.churnProbability = Math.max(0, updatedUser.churnProbability - 20);
        updatedUser.healthScore = Math.min(100, updatedUser.healthScore + 10);
        updatedUser.activityLogs.unshift({
          date: new Date().toISOString().split('T')[0],
          type: 'support_resolve',
          details: 'Offered 20% loyalty discount for the next 3 months.'
        });
        message = 'Offered a 20% loyalty discount for 3 months to keep this customer.';
        break;
      case 'csm_call':
        updatedUser.metrics.frictionIndex = Math.max(0, updatedUser.metrics.frictionIndex - 3.5);
        updatedUser.warningFlags = updatedUser.warningFlags.filter(f => f !== 'Open Support Issues');
        updatedUser.churnProbability = Math.max(0, updatedUser.churnProbability - 18);
        updatedUser.healthScore = Math.min(100, updatedUser.healthScore + 15);
        updatedUser.activityLogs.unshift({
          date: new Date().toISOString().split('T')[0],
          type: 'support_resolve',
          details: 'Check-in call scheduled with the customer.'
        });
        message = 'Check-in call scheduled. Their support requests are now marked top priority.';
        break;
    }

    onUpdateUser(updatedUser);
    setActivePlaybook(message);
    setTimeout(() => setActivePlaybook(null), 4000);
  };

  // Generate Email Text based on Churn Indicators
  const generateEmailDraft = () => {
    if (!lastClickedAction) {
      return { subject: '', body: '' };
    }

    let subject = `Optimizing your experience with SubSentry`;
    let body = `Hi ${user.name.split(' ')[0]},\n\nI'm checking in from the SubSentry team. We noticed you've been working with our platform for the past ${user.metrics.daysSinceOnboarding} days. `;

    if (lastClickedAction === 'grace_period') {
      subject = `Action Required: Keeping your SubSentry account active`;
      body += `We recently encountered a renewal issue with your subscription payment card on file. \n\nTo ensure your service is not interrupted, we've extended a 14-day grace period on your account. You can securely update your card details in your billing console whenever you're ready.\n\nLet me know if we can help you with anything else!`;
    } else if (lastClickedAction === 'training') {
      subject = `Unlocking the full value of SubSentry`;
      body += `We want to make sure you're getting the absolute best value out of your active package plan. We noticed you haven't had a chance to explore all our advanced integrations yet.\n\nSent you helpful video tutorials and how-to guides to get started. I'd love to schedule a quick 10-minute walkthrough to help configure these pipelines for you.\n\nWhat is your availability this week?`;
    } else if (lastClickedAction === 'discount') {
      subject = `Loyalty Appreciation: 20% discount on SubSentry`;
      body += `I wanted to reach out and thank you for being a valued customer. As a token of our appreciation, we have applied a 20% loyalty discount to your subscription for the next 3 months.\n\nLet me know if you would be interested in discussing advanced usage strategies!`;
    } else if (lastClickedAction === 'csm_call') {
      subject = `SubSentry Customer Success Check-in Call`;
      body += `I wanted to reach out to check how your team is getting along with SubSentry. We've noticed some outstanding support inquiries and want to make sure we resolve all friction.\n\nWould you have 10 minutes next week for a quick sync call?\n\nLet me know if we can help you with anything else!`;
    }

    body += `\n\nBest regards,\nCustomer Success Team\nSubSentry`;
    return { subject, body };
  };

  const { subject, body } = generateEmailDraft();

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = () => {
    setIsSendingEmail(true);
    setTimeout(() => {
      setIsSendingEmail(false);
      setEmailSentSuccess(true);

      const updatedUser = { ...user };
      updatedUser.activityLogs.unshift({
        date: new Date().toISOString().split('T')[0],
        type: 'feature_use',
        details: `Emailed customer: "${subject}"`
      });
      onUpdateUser(updatedUser);

      setTimeout(() => setEmailSentSuccess(false), 4000);
    }, 1500);
  };

  // Friendly display names for backend risk factors (raw DB column names otherwise)
  const FACTOR_LABELS: Record<string, string> = {
    monthly_usage_pct: 'Monthly Usage',
    login_frequency: 'How Often They Log In',
    feature_usage: 'Features They Use',
    support_ticket_count: 'Support Requests',
    feedback_score: 'Feedback Score',
    payment_status: 'Payment Status',
    tenure: 'Time as a Customer',
    contract: 'Contract Type',
    monthly_charges: 'Monthly Bill',
    total_charges: 'Total Spent'
  };

  // Revenue framing for the simulator: expected 12-month revenue kept (or
  // lost) = churn-risk change x this customer's monthly bill. Backend sends
  // it computed from real charges; fall back to the displayed MRR otherwise.
  const annualRevenueDelta = simResult
    ? (simResult.projected_annual_revenue_saved ?? -simResult.delta_churn * user.mrr * 12)
    : 0;
  const revenueBasisMonthly = simResult?.monthly_charges ?? user.mrr;
  const fmtMoney = (v: number) => Math.abs(v).toLocaleString(undefined, { maximumFractionDigits: 0 });

  const activeFactors = recommendation?.shap_reasons
    ? recommendation.shap_reasons.map((r: any) => ({
        name: FACTOR_LABELS[r.feature] ?? r.feature.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        impact: Math.round(r.contribution * 100)
      }))
    : user.churnFactors;

  return (
    <div className="text-left w-full flex flex-col gap-6 p-4 md:p-6 console-bg-dark min-h-screen relative animate-fadeIn">
      {/* 1. Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b console-border">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 console-text-muted hover:text-earth-cocoa transition-colors duration-200 text-sm group font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="bg-earth-sage/20 border console-border rounded-full px-3 py-1 text-xs console-text-primary font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-earth-sage" />
            <span>Customer Is Online Now</span>
          </div>
        </div>
      </div>

      {/* 2. User Overview Bar */}
      <div className="console-card-dark rounded-2xl p-5 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-16 h-16 rounded-full border-2 border-earth-clay object-cover" 
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold console-text-primary leading-tight">{user.name}</h2>
              <span className="bg-earth-sage/20 border console-border console-text-primary text-xs px-2.5 py-0.5 rounded-full font-bold">
                {user.plan} Plan
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${
                user.state === 'active'
                  ? 'bg-status-healthy/15 border-status-healthy/40 text-status-healthy'
                  : user.state === 'frustrated'
                  ? 'bg-status-risk/15 border-status-risk/40 text-status-risk animate-pulse'
                  : user.state === 'disengaged'
                  ? 'bg-status-critical/15 border-status-critical/40 text-status-critical'
                  : 'bg-earth-cocoa/15 border-earth-cocoa/20 text-earth-cocoa/60'
              }`}>
                {user.state}
              </span>
            </div>
            <p className="console-text-secondary text-sm mt-1">{user.email}</p>
            <p className="console-text-primary/65 text-xs mt-0.5">{user.location} &bull; Onboarded {user.metrics.daysSinceOnboarding} days ago</p>
          </div>
        </div>

        <div className="flex gap-8 border-l console-border pl-6 h-full items-center">
          <div>
            <span className="console-text-muted text-xs block mb-1">Contract Value</span>
            <span className="text-lg font-bold console-text-primary flex items-center">
              <DollarSign className="w-4 h-4 text-earth-clay -mr-0.5" />
              {user.mrr.toLocaleString()}/mo
            </span>
          </div>
          <div>
            <span className="console-text-muted text-xs block mb-1">Lifetime Value</span>
            <span className="text-lg font-bold console-text-primary flex items-center">
              <DollarSign className="w-4 h-4 text-earth-clay -mr-0.5" />
              {(user.mrr * Math.round(user.metrics.daysSinceOnboarding / 30)).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Core Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Radial Health Score */}
        <div className="console-card-dark p-5 rounded-2xl flex flex-col justify-between items-center text-center relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 p-3 text-earth-sage/20 group-hover:text-earth-sage/30 transition-colors pointer-events-none">
            <UserCheck className="w-16 h-16" />
          </div>
          <span className="console-text-muted text-xs font-bold self-start">CUSTOMER HEALTH</span>
          
          <div className="relative flex items-center justify-center my-4">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle 
                cx="56" cy="56" r="48" 
                className="stroke-earth-cocoa/20" strokeWidth="8" fill="transparent" 
              />
              <circle 
                cx="56" cy="56" r="48" 
                className={`transition-all duration-500 ${
                  user.healthScore > 70
                    ? 'stroke-status-healthy'
                    : user.healthScore > 40
                    ? 'stroke-status-risk'
                    : 'stroke-status-critical'
                }`}
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - user.healthScore / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-extrabold console-text-primary">{user.healthScore}</span>
              <span className="text-[10px] console-text-muted block leading-none">/ 100</span>
            </div>
          </div>

          <span className={`text-xs px-2.5 py-0.5 rounded font-bold ${
            user.healthScore > 70
              ? 'bg-status-healthy/15 text-status-healthy border border-status-healthy/40'
              : user.healthScore > 40
              ? 'bg-status-risk/15 text-status-risk border border-status-risk/40'
              : 'bg-status-critical/15 text-status-critical border border-status-critical/40'
          }`}>
            {user.healthScore > 70 ? 'HEALTHY' : user.healthScore > 40 ? 'MONITOR' : 'CRITICAL'}
          </span>
        </div>

        {/* Churn Risk */}
        <div className="console-card-dark p-5 rounded-2xl flex flex-col justify-between items-start relative group shadow-sm">
          <div className="absolute top-0 right-0 p-3 text-earth-sage/20 group-hover:text-earth-sage/30 transition-colors pointer-events-none">
            <ShieldAlert className="w-16 h-16" />
          </div>
          <span className="console-text-muted text-xs font-bold">RISK OF LEAVING</span>
          
          <div className="my-4">
            <span className={`text-4xl font-extrabold tracking-tight ${
              user.churnProbability > 50 ? 'text-status-critical' : user.churnProbability > 15 ? 'text-status-risk' : 'text-status-healthy'
            }`}>
              {user.churnProbability}%
            </span>
            <div className="flex items-center gap-1 mt-2 text-xs console-text-secondary">
              {user.churnProbability > 50 ? (
                <>
                  <TrendingUp className="w-3.5 h-3.5 text-status-critical" />
                  <span className="text-status-critical font-bold">High risk of cancelling</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3.5 h-3.5 text-status-healthy" />
                  <span className="text-status-healthy font-bold">Stable Account</span>
                </>
              )}
            </div>
          </div>

          <div className="w-full bg-earth-cocoa/15 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                user.churnProbability > 50 ? 'bg-status-critical' : user.churnProbability > 15 ? 'bg-status-risk' : 'bg-status-healthy'
              }`}
              style={{ width: `${user.churnProbability}%` }}
            />
          </div>
        </div>

        {/* Usage Velocity */}
        <div className="console-card-dark p-5 rounded-2xl flex flex-col justify-between items-start relative shadow-sm">
          <span className="console-text-muted text-xs font-bold">USAGE TREND (THIS WEEK VS LAST)</span>
          
          <div className="my-4">
            <span className={`text-4xl font-extrabold tracking-tight ${
              user.metrics.usageVelocity < 0.5 ? 'text-status-critical' : user.metrics.usageVelocity < 0.9 ? 'text-status-risk' : 'text-status-healthy'
            }`}>
              {Math.round(user.metrics.usageVelocity * 100)}%
            </span>
            <div className="flex items-center gap-1 mt-2 text-xs console-text-secondary">
              {user.metrics.usageVelocity < 0.8 ? (
                <span className="text-status-risk font-bold">
                  Using the product {Math.round((1 - user.metrics.usageVelocity) * 100)}% less than before
                </span>
              ) : (
                <span className="text-status-healthy font-bold">Stable or rising usage</span>
              )}
            </div>
          </div>

          <div className="text-[10px] console-text-muted leading-normal">
            100% means steady usage. Below 80% means this customer is logging in noticeably less than usual.
          </div>
        </div>

        {/* Friction & Invoices */}
        <div className="console-card-dark p-5 rounded-2xl flex flex-col justify-between items-start relative shadow-sm">
          <span className="console-text-muted text-xs font-bold">SUPPORT & BILLING ISSUES</span>
          
          <div className="my-4 flex flex-col gap-2 w-full">
            <div className="flex justify-between items-center w-full">
              <span className="text-xs console-text-muted">Support Trouble Level</span>
              <span className={`font-bold ${user.metrics.frictionIndex > 5 ? 'text-status-risk' : 'console-text-primary'}`}>
                {user.metrics.frictionIndex} / 10
              </span>
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="text-xs console-text-muted">Failed Payments (last 30 days)</span>
              <span className={`font-bold ${user.metrics.failedPayments > 0 ? 'text-status-critical animate-pulse' : 'text-status-healthy'}`}>
                {user.metrics.failedPayments} Failed
              </span>
            </div>
          </div>

          <div className="text-[10px] console-text-muted leading-normal">
            Declined cards and unresolved problems are common reasons customers leave without meaning to.
          </div>
        </div>
      </div>

      {/* 4. SHAP Explainable AI and Timeline Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SHAP Explanations (XAI) */}
        <div className="console-card-dark rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold console-text-primary flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-earth-clay" />
              Why Is This Customer At Risk?
            </h3>
            <span className="text-[10px] bg-earth-sage/20 border console-border console-text-primary px-2 py-0.5 rounded font-bold">
              AI-Powered
            </span>
          </div>
          <p className="text-xs console-text-secondary leading-relaxed">
            The factors below show what is causing this customer to consider leaving (red) versus what is keeping them happy and loyal (green).
          </p>

          <div className="flex flex-col gap-4 my-2">
            {activeFactors.map((factor: { name: string; impact: number }) => {
              const isPositive = factor.impact > 0;
              return (
                <div key={factor.name} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="console-text-secondary font-bold">{factor.name}</span>
                    <span className={isPositive ? 'text-status-critical font-bold' : 'text-status-healthy font-bold'}>
                      {isPositive ? `Raises risk by ${factor.impact}%` : `Lowers risk by ${Math.abs(factor.impact)}%`}
                    </span>
                  </div>
                  {/* Slider bar */}
                  <div className="w-full h-2 bg-earth-cocoa/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isPositive ? 'bg-status-critical' : 'bg-status-healthy'}`}
                      style={{ width: `${Math.min(100, Math.abs(factor.impact))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="console-card-dark-inner rounded-lg p-3 text-[10px] console-text-muted flex justify-between items-center">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-status-healthy" /> Green = Helps retain this customer</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-status-critical" /> Red = Increases cancellation risk</span>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="console-card-dark rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
          <h3 className="text-base font-bold console-text-primary flex items-center gap-2">
            <Clock className="w-4 h-4 text-earth-clay" />
            Recent Activity
          </h3>

          <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2">
            {user.activityLogs.map((log, idx) => (
              <div key={idx} className="flex gap-3 border-l console-border pb-3 pl-4 relative last:pb-0">
                <span className={`w-3.5 h-3.5 rounded-full absolute -left-1.5 border-4 border-earth-bg flex items-center justify-center ${
                  log.type === 'payment_fail' || log.type === 'support_open'
                    ? 'bg-status-critical animate-pulse'
                    : log.type === 'payment_success' || log.type === 'support_resolve'
                    ? 'bg-status-healthy'
                    : 'bg-earth-cocoa/60'
                }`} />
                <div className="flex-1">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-xs font-bold console-text-primary capitalize">
                      {log.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] console-text-muted">{log.date}</span>
                  </div>
                  <p className="text-xs console-text-secondary mt-1">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What-If Churn Simulator Section */}
      <div className="console-card-dark rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b console-border pb-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold console-text-primary flex items-center gap-2">
              <Cpu className="w-4.5 h-4.5 text-earth-clay" />
              "What-If" Simulator
            </h3>
            <p className="text-xs console-text-secondary leading-normal">
              The sliders start at this customer's current situation. Change them to see how their risk of leaving and your revenue would change.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => {
                setSimLevers(baselineLevers);
                setSimResult(null);
                setSimError(null);
                setAiNarrative(null);
                setAiSource(null);
                setAiLoading(false);
                narrativeSeq.current += 1;
              }}
              disabled={!leversLoaded}
              className="border console-border console-text-secondary hover:console-text-primary bg-earth-bg/5 hover:bg-earth-bg/10 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              Reset to Today's Values
            </button>
            <button
              onClick={runSimulation}
              disabled={simLoading || !leversLoaded}
              className="bg-earth-cocoa hover:bg-earth-clay text-earth-bg px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-earth-cocoa/20 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {!leversLoaded ? 'Loading Current Values...' : simLoading ? 'Calculating...' : 'See What Would Happen'}
            </button>
          </div>
        </div>

        {/* Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sliders (Left Column: Span 7) */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Login Frequency */}
            <div className="flex flex-col gap-2 console-card-dark-inner p-3.5 rounded-xl">
              <div className="flex justify-between text-xs">
                <span className="console-text-secondary font-bold">Login Frequency</span>
                <span className="font-bold text-earth-clay">{simLevers.login_frequency} / day</span>
              </div>
              <input 
                type="range" 
                min="0.1" 
                max="10.0" 
                step="0.1"
                value={simLevers.login_frequency} 
                onChange={(e) => setSimLevers({...simLevers, login_frequency: parseFloat(e.target.value)})}
                className="w-full accent-earth-sage cursor-pointer h-1 bg-earth-cocoa/15 rounded-lg appearance-none" 
              />
            </div>

            {/* Feature Usage Rate */}
            <div className="flex flex-col gap-2 console-card-dark-inner p-3.5 rounded-xl">
              <div className="flex justify-between text-xs">
                <span className="console-text-secondary font-bold">Features They Use</span>
                <span className="font-bold text-earth-clay">{Math.round(simLevers.feature_usage * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0.0" 
                max="1.0" 
                step="0.05"
                value={simLevers.feature_usage} 
                onChange={(e) => setSimLevers({...simLevers, feature_usage: parseFloat(e.target.value)})}
                className="w-full accent-earth-sage cursor-pointer h-1 bg-earth-cocoa/15 rounded-lg appearance-none" 
              />
            </div>

            {/* Monthly Usage Volume */}
            <div className="flex flex-col gap-2 console-card-dark-inner p-3.5 rounded-xl">
              <div className="flex justify-between text-xs">
                <span className="console-text-secondary font-bold">Monthly Usage</span>
                <span className="font-bold text-earth-clay">{Math.round(simLevers.monthly_usage_pct)}%</span>
              </div>
              <input 
                type="range" 
                min="5.0" 
                max="100.0" 
                step="1.0"
                value={simLevers.monthly_usage_pct} 
                onChange={(e) => setSimLevers({...simLevers, monthly_usage_pct: parseFloat(e.target.value)})}
                className="w-full accent-earth-sage cursor-pointer h-1 bg-earth-cocoa/15 rounded-lg appearance-none" 
              />
            </div>

            {/* Support Ticket Count */}
            <div className="flex flex-col gap-2 console-card-dark-inner p-3.5 rounded-xl">
              <div className="flex justify-between text-xs">
                <span className="console-text-secondary font-bold">Open Support Tickets</span>
                <span className="font-bold text-earth-clay">{simLevers.support_ticket_count} tickets</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="10" 
                step="1"
                value={simLevers.support_ticket_count} 
                onChange={(e) => setSimLevers({...simLevers, support_ticket_count: parseInt(e.target.value)})}
                className="w-full accent-earth-sage cursor-pointer h-1 bg-earth-cocoa/15 rounded-lg appearance-none" 
              />
            </div>

            {/* Feedback Score */}
            <div className="flex flex-col gap-2 console-card-dark-inner p-3.5 rounded-xl">
              <div className="flex justify-between text-xs">
                <span className="console-text-secondary font-bold">Customer Feedback Score</span>
                <span className="font-bold text-earth-clay">{simLevers.feedback_score} / 10</span>
              </div>
              <input 
                type="range" 
                min="1.0" 
                max="10.0" 
                step="0.1"
                value={simLevers.feedback_score} 
                onChange={(e) => setSimLevers({...simLevers, feedback_score: parseFloat(e.target.value)})}
                className="w-full accent-earth-sage cursor-pointer h-1 bg-earth-cocoa/15 rounded-lg appearance-none" 
              />
            </div>

            {/* Payment Status Dropdown */}
            <div className="flex flex-col gap-2 console-card-dark-inner p-3.5 rounded-xl">
              <label className="text-xs console-text-secondary font-bold">Payment Status</label>
              <select
                value={simLevers.payment_status}
                onChange={(e) => setSimLevers({...simLevers, payment_status: e.target.value})}
                className="bg-earth-bg border border-earth-sage/35 rounded-lg p-1.5 text-xs text-earth-cocoa font-bold outline-none cursor-pointer focus:border-earth-clay w-full"
              >
                <option value="active" className="bg-earth-bg text-earth-cocoa">Paid Up (Good Standing)</option>
                <option value="past_due" className="bg-earth-bg text-earth-cocoa">Behind on Payments</option>
              </select>
            </div>

          </div>

          {/* Simulation Output results (Right Column: Span 5) */}
          <div className="lg:col-span-5 console-card-dark-inner rounded-2xl p-5 flex flex-col gap-4 shadow-inner min-h-[220px] justify-center text-center">
            {simError && (
              <div className="text-status-critical text-xs font-bold leading-normal">
                ⚠️ {simError}
              </div>
            )}

            {!simResult && !simError && (
              <div className="flex flex-col items-center justify-center gap-2 py-4">
                <Cpu className="w-8 h-8 console-text-primary/25 animate-pulse" />
                <span className="text-xs console-text-muted font-bold">
                  Adjust the sliders, then click "See What Would Happen" to preview the change.
                </span>
              </div>
            )}

            {simResult && !simError && (
              <div className="flex flex-col gap-4 select-none text-left">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] uppercase font-bold console-text-primary/65 tracking-wider">Predicted Outcome</span>
                  <span className="text-[9px] bg-earth-sage/20 border console-border console-text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Computed</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Churn Risk Change */}
                  <div className="console-card-dark-inner p-3.5 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] console-text-muted font-semibold block">RISK OF LEAVING</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-bold console-text-muted line-through">
                        {Math.round(simResult.baseline_churn_probability * 100)}%
                      </span>
                      <span className={`text-2xl font-extrabold ${simResult.delta_churn < 0 ? 'text-status-healthy' : simResult.delta_churn > 0 ? 'text-status-critical' : 'console-text-primary'}`}>
                        &rarr; {Math.round(simResult.simulated_churn_probability * 100)}%
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold mt-1.5 block ${simResult.delta_churn < 0 ? 'text-status-healthy' : simResult.delta_churn > 0 ? 'text-status-critical' : 'console-text-muted'}`}>
                      {simResult.delta_churn < 0 ? `Reduced risk by ${Math.round(Math.abs(simResult.delta_churn) * 100)}%` : simResult.delta_churn > 0 ? `Increased risk by ${Math.round(simResult.delta_churn * 100)}%` : 'No risk changes'}
                    </span>
                  </div>

                  {/* Health Score Change */}
                  <div className="console-card-dark-inner p-3.5 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] console-text-muted font-semibold block">HEALTH SCORE</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-bold console-text-muted line-through">
                        {Math.round(simResult.baseline_health_score)}
                      </span>
                      <span className={`text-2xl font-extrabold ${simResult.delta_health > 0 ? 'text-status-healthy' : simResult.delta_health < 0 ? 'text-status-critical' : 'console-text-primary'}`}>
                        &rarr; {Math.round(simResult.simulated_health_score)}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold mt-1.5 block ${simResult.delta_health > 0 ? 'text-status-healthy' : simResult.delta_health < 0 ? 'text-status-critical' : 'console-text-muted'}`}>
                      {simResult.delta_health > 0 ? `Health improved (+${Math.round(simResult.delta_health)})` : simResult.delta_health < 0 ? `Health degraded (${Math.round(simResult.delta_health)})` : 'No health change'}
                    </span>
                  </div>
                </div>

                {/* Revenue Impact (the money view of the same change) */}
                <div className={`p-3.5 rounded-xl flex flex-col gap-1 border ${
                  Math.round(annualRevenueDelta) > 0
                    ? 'bg-status-healthy/10 border-status-healthy/30'
                    : Math.round(annualRevenueDelta) < 0
                    ? 'bg-status-critical/10 border-status-critical/30'
                    : 'console-card-dark-inner console-border'
                }`}>
                  <span className="text-[10px] console-text-muted font-semibold block flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-earth-clay" />
                    REVENUE IMPACT (NEXT 12 MONTHS)
                  </span>
                  <span className={`text-2xl font-extrabold mt-1 ${
                    Math.round(annualRevenueDelta) > 0 ? 'text-status-healthy' : Math.round(annualRevenueDelta) < 0 ? 'text-status-critical' : 'console-text-primary'
                  }`}>
                    {Math.round(annualRevenueDelta) > 0 ? `+$${fmtMoney(annualRevenueDelta)} protected` : Math.round(annualRevenueDelta) < 0 ? `-$${fmtMoney(annualRevenueDelta)} at risk` : 'No revenue change'}
                  </span>
                  <span className="text-[10px] console-text-muted leading-normal mt-1">
                    How we got this: the {Math.round(Math.abs(simResult.delta_churn) * 100)}% change in leave-risk × this customer's ${fmtMoney(revenueBasisMonthly)}/mo bill × 12 months. Keeping a customer is far cheaper than winning a new one.
                  </span>
                </div>

                {/* AI Retention Advisor — Gemini narrates the computed result */}
                {(aiLoading || aiNarrative) && (
                  <div className="console-card-dark-inner border console-border p-3.5 rounded-xl flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] console-text-muted font-semibold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-earth-clay" />
                        AI RETENTION ADVISOR
                      </span>
                      {aiSource && (
                        <span className="text-[9px] bg-earth-sage/20 border console-border console-text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          {aiSource === 'gemini' ? 'Gemini AI' : 'Instant Summary'}
                        </span>
                      )}
                    </div>
                    {aiLoading ? (
                      <span className="text-[11px] console-text-muted italic animate-pulse">
                        Writing a retention plan for this scenario…
                      </span>
                    ) : (
                      <p className="text-[11px] console-text-secondary leading-relaxed">{aiNarrative}</p>
                    )}
                  </div>
                )}

                {/* Summary sentence */}
                <p className="text-[11px] console-text-secondary leading-relaxed console-card-dark-inner p-2 rounded-lg mt-1 italic">
                  * With these changes, this customer's risk of leaving is predicted to be {Math.round(simResult.simulated_churn_probability * 100)}%.
                </p>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* 5. RAG AI Copilot & Value Injections panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RAG Copilot */}
        <div className="console-card-dark rounded-2xl p-5 flex flex-col gap-4 lg:col-span-2 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold console-text-primary flex items-center gap-2">
              <Zap className="w-4 h-4 text-earth-clay" />
              Retention Assistant
            </h3>
            <span className="bg-earth-sage/20 console-text-primary text-[10px] px-2 py-0.5 border console-border rounded font-bold">
              AI Assistant
            </span>
          </div>

          {/* Similar past cases */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase font-extrabold console-text-muted tracking-wider">
              Similar Customers From The Past
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {user.pastJourneys.map((j, i) => (
                <div 
                  key={i} 
                  className={`border rounded-xl p-3 flex flex-col gap-2 ${
                    j.outcome === 'churned'
                      ? 'bg-status-critical/10 border-status-critical/30'
                      : 'bg-status-healthy/10 border-status-healthy/30'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="console-text-primary font-bold">{j.name} ({j.plan})</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      j.outcome === 'churned' ? 'bg-status-critical/15 text-status-critical' : 'bg-status-healthy/15 text-status-healthy'
                    }`}>
                      {j.outcome === 'churned' ? 'LEFT' : 'STAYED'} ({j.similarity}% match)
                    </span>
                  </div>
                  <p className="text-[11px] console-text-secondary leading-normal">
                    <strong className="console-text-primary">What happened:</strong> {j.reason}
                  </p>
                  <p className="text-[11px] console-text-secondary leading-normal">
                    <strong className="console-text-primary">What we did:</strong> {j.intervention}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <hr className="console-border" />

          {/* Generated email draft */}
          <div className="flex flex-col gap-2 relative">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-extrabold console-text-muted tracking-wider">
                Suggested Email For This Customer
              </span>
              {lastClickedAction && (
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] text-earth-clay hover:console-text-primary transition-colors font-bold cursor-pointer"
                >
                  {copied ? <CheckCircle className="w-3.5 h-3.5 text-earth-sage" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>
              )}
            </div>

            {lastClickedAction ? (
              <>
                <div className="console-card-dark-inner rounded-xl p-4 font-mono text-xs console-text-primary flex flex-col gap-2 leading-relaxed shadow-inner">
                  <div>
                    <strong className="console-text-muted">Subject:</strong> {subject}
                  </div>
                  <hr className="console-border my-1" />
                  <div className="whitespace-pre-line console-text-primary">{body}</div>
                </div>

                <button
                  disabled={isSendingEmail}
                  onClick={handleSendEmail}
                  className="w-full py-2.5 bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 mt-1"
                >
                  {isSendingEmail ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-earth-bg border-t-transparent rounded-full animate-spin" />
                      <span>Sending Email to {user.email}...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Email Directly</span>
                    </>
                  )}
                </button>

                {emailSentSuccess && (
                  <div className="bg-[#276B2B]/15 border border-[#276B2B]/35 text-status-healthy p-2.5 rounded-xl text-[10px] font-bold text-center animate-scaleUp">
                    ✅ Suggested email successfully transmitted directly to {user.email}! Activity timeline updated.
                  </div>
                )}
              </>
            ) : (
              <div className="console-card-dark-inner rounded-xl p-6 border border-dashed console-border text-center text-xs console-text-muted">
                Select one of the Quick Actions on the right to automatically generate a tailored follow-up email draft here.
              </div>
            )}
          </div>
        </div>

        {/* Value Injections Playbook */}
        <div className="console-card-dark rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm">
          {(() => {
            const getMostRecommendedAction = () => {
              if (user.warningFlags.includes('Failed Payment')) {
                return 'grace_period';
              }
              if (user.warningFlags.includes('Using It Less') || user.warningFlags.includes('Not Using Key Features') || user.metrics.featureAdoption < 0.5) {
                return 'training';
              }
              if (user.metrics.frictionIndex > 4) {
                return 'csm_call';
              }
              return 'discount';
            };

            const mostRecommended = getMostRecommendedAction();

            return (
              <>
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-bold console-text-primary flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-earth-clay" />
                    Quick Actions
                  </h3>
                  <p className="text-xs console-text-secondary leading-normal mt-1">
                    Pick an action to help this customer right away. Their risk of leaving updates instantly.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 my-2">
                  <button
                    onClick={() => handleAction('grace_period')}
                    disabled={!user.warningFlags.includes('Failed Payment')}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-between border transition-all duration-200 ${
                      user.warningFlags.includes('Failed Payment')
                        ? 'bg-earth-cocoa/10 hover:bg-earth-cocoa/20 console-border text-earth-cocoa cursor-pointer'
                        : 'bg-earth-cocoa/5 console-border text-earth-cocoa/30 cursor-not-allowed'
                    }`}
                  >
                    <span className="flex items-center gap-2 flex-wrap">
                      <CreditCard className="w-4 h-4 text-earth-clay" />
                      Give Extra Time to Pay
                      {mostRecommended === 'grace_period' && (
                        <span className="text-status-healthy text-[9px] font-extrabold ml-1 uppercase bg-status-healthy/10 px-1.5 py-0.5 rounded border border-status-healthy/20 tracking-wider">
                          (Most Recommended)
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-status-healthy font-extrabold shrink-0">-25% risk</span>
                  </button>

                  <button
                    onClick={() => handleAction('training')}
                    disabled={user.metrics.featureAdoption > 0.8}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-between border transition-all duration-200 ${
                      user.metrics.featureAdoption <= 0.8
                        ? 'bg-earth-cocoa/10 hover:bg-earth-cocoa/20 console-border text-earth-cocoa cursor-pointer'
                        : 'bg-earth-cocoa/5 console-border text-earth-cocoa/30 cursor-not-allowed'
                    }`}
                  >
                    <span className="flex items-center gap-2 flex-wrap">
                      <BookOpen className="w-4 h-4 text-earth-clay" />
                      Send Helpful Tutorials
                      {mostRecommended === 'training' && (
                        <span className="text-status-healthy text-[9px] font-extrabold ml-1 uppercase bg-status-healthy/10 px-1.5 py-0.5 rounded border border-status-healthy/20 tracking-wider">
                          (Most Recommended)
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-status-healthy font-extrabold shrink-0">-15% risk</span>
                  </button>

                  <button
                    onClick={() => handleAction('csm_call')}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-between border bg-earth-cocoa/10 hover:bg-earth-cocoa/20 console-border text-earth-cocoa transition-all duration-200 cursor-pointer"
                  >
                    <span className="flex items-center gap-2 flex-wrap">
                      <MessageSquare className="w-4 h-4 text-earth-clay" />
                      Schedule a Check-In Call
                      {mostRecommended === 'csm_call' && (
                        <span className="text-status-healthy text-[9px] font-extrabold ml-1 uppercase bg-status-healthy/10 px-1.5 py-0.5 rounded border border-status-healthy/20 tracking-wider">
                          (Most Recommended)
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-status-healthy font-extrabold shrink-0">-18% risk</span>
                  </button>

                  <button
                    onClick={() => handleAction('discount')}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-between border bg-earth-cocoa/10 hover:bg-earth-cocoa/20 console-border text-earth-cocoa transition-all duration-200 cursor-pointer"
                  >
                    <span className="flex items-center gap-2 flex-wrap">
                      <DollarSign className="w-4 h-4 text-earth-clay" />
                      Offer 20% Loyalty Discount
                      {mostRecommended === 'discount' && (
                        <span className="text-status-healthy text-[9px] font-extrabold ml-1 uppercase bg-status-healthy/10 px-1.5 py-0.5 rounded border border-status-healthy/20 tracking-wider">
                          (Most Recommended)
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-status-healthy font-extrabold shrink-0">-20% risk</span>
                  </button>
                </div>
              </>
            );
          })()}

          {/* Action Alert Banner */}
          {activePlaybook ? (
            <div className="bg-earth-sage/20 border console-border console-text-primary text-[11px] p-3 rounded-xl flex items-center gap-2 animate-fadeIn font-bold shadow-sm">
              <CheckCircle className="w-4 h-4 shrink-0 console-text-primary" />
              <span>{activePlaybook}</span>
            </div>
          ) : (
            <div className="border border-dashed console-border p-3 rounded-xl text-[10px] console-text-muted text-center">
              Every action you take is recorded in the customer's recent activity.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
