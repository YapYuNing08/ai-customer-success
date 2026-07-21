import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, TrendingDown, TrendingUp, UserCheck, 
  CreditCard, MessageSquare, DollarSign, CheckCircle,
  Copy, Zap, BookOpen, ShieldAlert, Cpu, Send, MessageCircle
} from 'lucide-react';
import { type ActiveUser } from '../utils/mockData';
import Avatar from './Avatar';
import { explainSimulation, getCustomer, getRecommendation, simulate } from '../lib/api';

interface ActiveUserInsightProps {
  user: ActiveUser;
  onBack: () => void;
  onUpdateUser: (updatedUser: ActiveUser) => void;
}

// DEMO-ONLY: personalized feature-tutorial video the CSM's "Send Helpful
// Tutorials" action links to (shown in the generated email/WhatsApp draft and
// the customer's activity timeline). Kept in sync with the same constant in
// ClientDashboardPage.tsx (Falcon Guide Agent).
const FEATURE_TUTORIAL_VIDEO = 'https://www.youtube.com/watch?v=4d966u2XPuQ';

// DEMO-ONLY: client-side What-If simulation for hardcoded local customers
// (e.g. Yu Ning) that have no backend row, so POST /simulate would 404.
// Mirrors the FastAPI heuristic fallback (_simulate_heuristic in
// routers/simulate.py): each lever nudges churn by a fixed signed sensitivity,
// applied against the customer's OWN baseline levers so an untouched run
// yields a true zero delta.
const _LOCAL_SENSITIVITY = {
  login_frequency: -0.03,
  feature_usage: -0.25,
  monthly_usage_pct: -0.004,
  support_ticket_count: 0.02,
  feedback_score: -0.03,
} as const;

const _paymentTerm = (s: string) => (s === 'active' ? -0.15 : 0.15);
const _clampLocal = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function computeLocalSimulation(
  customerId: string,
  base: Record<string, any>,
  cur: Record<string, any>,
  baseChurn: number, // 0..1
  baseHealth: number, // 0..100
) {
  let dc = 0;
  dc += _LOCAL_SENSITIVITY.login_frequency * (Number(cur.login_frequency) - Number(base.login_frequency));
  dc += _LOCAL_SENSITIVITY.feature_usage * (Number(cur.feature_usage) - Number(base.feature_usage));
  dc += _LOCAL_SENSITIVITY.monthly_usage_pct * (Number(cur.monthly_usage_pct) - Number(base.monthly_usage_pct));
  dc += _LOCAL_SENSITIVITY.support_ticket_count * (Number(cur.support_ticket_count) - Number(base.support_ticket_count));
  dc += _LOCAL_SENSITIVITY.feedback_score * (Number(cur.feedback_score) - Number(base.feedback_score));
  dc += _paymentTerm(String(cur.payment_status)) - _paymentTerm(String(base.payment_status));

  const simChurn = _clampLocal(baseChurn + dc, 0, 1);
  const simHealth = _clampLocal(baseHealth + (baseChurn - simChurn) * 100, 0, 100);
  return {
    customer_id: customerId,
    baseline_churn_probability: Number(baseChurn.toFixed(4)),
    simulated_churn_probability: Number(simChurn.toFixed(4)),
    baseline_health_score: Number(baseHealth.toFixed(2)),
    simulated_health_score: Number(simHealth.toFixed(2)),
    delta_churn: Number((simChurn - baseChurn).toFixed(4)),
    delta_health: Number((simHealth - baseHealth).toFixed(2)),
    changed_fields: cur,
  };
}

// Deterministic retention narrative for the local simulation (mirrors the
// backend fallback text tone). Pronoun-neutral — the customer's pronouns are
// not stated.
function localRetentionNarrative(user: ActiveUser, result: any): string {
  const firstName = (user.name || 'This customer').split(' ')[0];
  const basePct = Math.round(result.baseline_churn_probability * 100);
  const simPct = Math.round(result.simulated_churn_probability * 100);
  const health = Math.round(result.simulated_health_score);
  const annual = Math.round(-result.delta_churn * user.mrr * 12);
  if (result.delta_churn < -0.005) {
    return `If ${firstName} re-engages at these levels, their risk of leaving drops from ${basePct}% to ${simPct}% and their health recovers to ${health}/100 — protecting about RM${annual.toLocaleString()} over the next 12 months. Start with the personalized ${user.plan} Plan feature tutorial to lift adoption, then clear the past-due balance so billing is no longer a churn trigger.`;
  }
  if (result.delta_churn > 0.005) {
    return `These changes push ${firstName}'s risk up from ${basePct}% to ${simPct}%. Pull the engagement levers back up — more frequent logins and deeper feature use are what move them out of the danger zone.`;
  }
  return `These are ${firstName}'s current numbers — risk ${basePct}%, health ${Math.round(result.baseline_health_score)}/100. Raise their feature usage and fix the billing status to see how much churn risk you can retire.`;
}

const getEstimatedLeaveDate = (probability: number) => {
  if (probability <= 15) return 'N/A (Stable)';
  const days = Math.round(100 - probability);
  const date = new Date('2026-07-19'); // Mock current local date
  date.setDate(date.getDate() + days);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${formattedDate} (~${days} days)`;
};

export const ActiveUserInsight: React.FC<ActiveUserInsightProps> = ({ user, onBack, onUpdateUser }) => {
  const [copied, setCopied] = useState(false);
  const [activePlaybook, setActivePlaybook] = useState<string | null>(null);
  const [lastClickedAction, setLastClickedAction] = useState<'grace_period' | 'training' | 'discount' | 'csm_call' | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  // Demo aid: pulsing ring on the card the presenter last clicked (see .demo-card-selected in index.css)
  const [selectedInsightCard, setSelectedInsightCard] = useState<string | null>(null);

  // Reset states when user changes
  useEffect(() => {
    setLastClickedAction(null);
    setIsSendingEmail(false);
    setEmailSentSuccess(false);
    setEditedSubject('');
    setEditedBody('');
  }, [user.id]);

  useEffect(() => {
    if (lastClickedAction) {
      const draft = generateEmailDraft();
      setEditedSubject(draft.subject);
      setEditedBody(draft.body);
    } else {
      setEditedSubject('');
      setEditedBody('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastClickedAction]);

  // The "Most Recommended" action is pinned once per customer from their
  // INITIAL signals. Applying an action mutates the customer's metrics (clears
  // a warning flag, lifts adoption, etc.), which would otherwise make the badge
  // hop to the next-best action mid-demo — it must stay on the one action.
  const recommendedActionRef = useRef<{ id: string; action: string } | null>(null);
  if (recommendedActionRef.current?.id !== user.id) {
    const initialRecommended = user.warningFlags.includes('Failed Payment')
      ? 'grace_period'
      : (user.warningFlags.includes('Using It Less') || user.warningFlags.includes('Not Using Key Features') || user.metrics.featureAdoption < 0.5)
      ? 'training'
      : user.metrics.frictionIndex > 4
      ? 'csm_call'
      : 'discount';
    recommendedActionRef.current = { id: user.id, action: initialRecommended };
  }
  const pinnedRecommendedAction = recommendedActionRef.current.action;

  // Real backend recommendation state
  const [recommendation, setRecommendation] = useState<any>(null);

  useEffect(() => {
    // Hardcoded local customers (Yu Ning) have no backend row — skip the fetch
    // and fall back to their baked-in SHAP factors (user.churnFactors).
    if (user.simSignals) return;
    getRecommendation(user.id)
      .then((data) => {
        setRecommendation(data);
      })
      .catch((err) => {
        console.warn('Failed to load recommendation from backend FastAPI.', err);
      });
  }, [user.id]);

  // What-If Simulator Levers State. For a hardcoded local customer these come
  // straight from user.simSignals (no backend); otherwise they are estimated
  // defaults until the customer's real stored values arrive from GET
  // /customers/{id}.
  const estimatedLevers = user.simSignals
    ? {
        login_frequency: user.simSignals.login_frequency,
        feature_usage: user.simSignals.feature_usage,
        monthly_usage_pct: user.simSignals.monthly_usage_pct,
        support_ticket_count: user.simSignals.support_ticket_count,
        feedback_score: user.simSignals.feedback_score,
        payment_status: user.simSignals.payment_status as string,
      }
    : {
        login_frequency: 3.5,
        feature_usage: 0.5,
        monthly_usage_pct: Math.round(user.metrics.usageVelocity * 100),
        support_ticket_count: user.metrics.failedPayments > 0 ? 3 : 1,
        feedback_score: user.healthScore > 70 ? 8.5 : 5.8,
        payment_status: user.metrics.failedPayments > 0 ? 'past_due' : 'active',
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
    // Hardcoded local customer (Yu Ning): seed sliders from the baked-in
    // signals and skip the backend fetch — the simulator runs client-side.
    if (user.simSignals) {
      setSimLevers(estimatedLevers);
      setBaselineLevers(estimatedLevers);
      setLeversLoaded(true);
      return;
    }
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

  // overrideLevers lets one-click presets run immediately without waiting for
  // the setSimLevers state update to land.
  const runSimulation = (overrideLevers?: typeof simLevers) => {
    const src = overrideLevers ?? simLevers;
    setSimError(null);
    const levers = {
      login_frequency: Number(src.login_frequency),
      feature_usage: Number(src.feature_usage),
      monthly_usage_pct: Number(src.monthly_usage_pct),
      support_ticket_count: parseInt(String(src.support_ticket_count)),
      feedback_score: Number(src.feedback_score),
      payment_status: src.payment_status
    };

    // Hardcoded local customer (Yu Ning): compute the whole thing client-side,
    // no backend call. Baseline churn/health come from the customer object;
    // the deltas come from how far each lever moved off its baseline.
    if (user.simSignals) {
      const result = computeLocalSimulation(
        user.id,
        baselineLevers,
        levers,
        user.churnProbability / 100,
        user.healthScore,
      );
      setSimResult(result);
      // Mirror the backend-backed UX: numbers land now, the retention plan
      // "streams in" a beat later.
      const seq = ++narrativeSeq.current;
      setAiNarrative(null);
      setAiSource(null);
      setAiLoading(true);
      setTimeout(() => {
        if (seq !== narrativeSeq.current) return;
        setAiNarrative(localRetentionNarrative(user, result));
        setAiSource('fallback');
        setAiLoading(false);
      }, 450);
      return;
    }

    setSimLoading(true);
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
          details: `Sent a personalized ${user.plan} Plan feature tutorial highlighting unused benefits (Analytics, Automation, Priority Roaming) — video: ${FEATURE_TUTORIAL_VIDEO}`
        });
        message = 'Emailed a personalized tutorial video. The customer is now using more of the product (+30%).';
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
  function generateEmailDraft() {
    if (!lastClickedAction) {
      return { subject: '', body: '' };
    }

    let subject = `Optimizing your experience with Falcon360`;
    let body = `Hi ${user.name.split(' ')[0]},\n\nI'm checking in from the Falcon360 team. We noticed you've been working with our platform for the past ${user.metrics.daysSinceOnboarding} days. `;

    if (lastClickedAction === 'grace_period') {
      subject = `Action Required: Keeping your Falcon360 account active`;
      body += `We recently encountered a renewal issue with your subscription payment card on file. \n\nTo ensure your service is not interrupted, we've extended a 14-day grace period on your account. You can securely update your card details in your billing console whenever you're ready.\n\nLet me know if we can help you with anything else!`;
    } else if (lastClickedAction === 'training') {
      subject = `Unlocking the full value of your ${user.plan} Plan`;
      body += `We want to make sure you're getting the absolute best value out of your ${user.plan} Plan. Looking at your account, there are some powerful benefits you're already paying for but haven't tried yet — Advanced Analytics, Automation Workflows, and Priority Roaming.\n\nI put together a short, personalized tutorial that walks you through exactly these features:\n▶ Watch it here: ${FEATURE_TUTORIAL_VIDEO}\n\nIt only takes about 5 minutes, and I'd love to jump on a quick 10-minute call afterwards to help configure them for you.\n\nWhat is your availability this week?`;
    } else if (lastClickedAction === 'discount') {
      subject = `Loyalty Appreciation: 20% discount on Falcon360`;
      body += `I wanted to reach out and thank you for being a valued customer. As a token of our appreciation, we have applied a 20% loyalty discount to your subscription for the next 3 months.\n\nLet me know if you would be interested in discussing advanced usage strategies!`;
    } else if (lastClickedAction === 'csm_call') {
      subject = `Falcon360 Customer Success Check-in Call`;
      body += `I wanted to reach out to check how your team is getting along with Falcon360. We've noticed some outstanding support inquiries and want to make sure we resolve all friction.\n\nWould you have 10 minutes next week for a quick sync call?\n\nLet me know if we can help you with anything else!`;
    }

    body += `\n\nBest regards,\nCustomer Success Team\nFalcon360`;
    return { subject, body };
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${editedSubject}\n\n${editedBody}`);
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
        details: `Emailed customer: "${editedSubject}"`
      });
      onUpdateUser(updatedUser);

      setTimeout(() => setEmailSentSuccess(false), 4000);
    }, 1500);
  };

  // Friendly display names for backend risk factors (raw DB column names otherwise).
  // The trained model emits payment_active/tenure_days; the offline data.py
  // fallback uses payment_status — both spellings must stay mapped.
  const FACTOR_LABELS: Record<string, string> = {
    monthly_usage_pct: 'Monthly Usage',
    login_frequency: 'How Often They Log In',
    feature_usage: 'Features They Use',
    support_ticket_count: 'Support Requests',
    feedback_score: 'Feedback Score',
    payment_status: 'Payment Status',
    payment_active: 'Payment Status',
    tenure: 'Time as a Customer',
    tenure_days: 'Time as a Customer',
    contract: 'Contract Type',
    monthly_charges: 'Monthly Bill',
    total_charges: 'Total Spent'
  };

  // One-sentence plain-language explanation per risk factor, shown under each
  // bar. Uses the customer's real signal values (same GET /customers/{id}
  // fetch that seeds the simulator sliders) once loaded; generic phrasing
  // until then.
  const explainFactor = (feature: string | undefined, raising: boolean): string => {
    const v = leversLoaded ? baselineLevers : null;
    switch (feature) {
      case 'login_frequency':
        return raising
          ? `They log in ${v ? `only about ${v.login_frequency} times a week` : 'infrequently'} — customers who rarely log in are far more likely to cancel.`
          : `They log in ${v ? `about ${v.login_frequency} times a week` : 'regularly'} — frequent use keeps a customer engaged.`;
      case 'feature_usage':
        return raising
          ? `They use ${v ? `only ${Math.round(v.feature_usage * 100)}%` : 'very few'} of the features in their plan — customers who don't explore the product see less value in it.`
          : `They use ${v ? `${Math.round(v.feature_usage * 100)}%` : 'a good share'} of the features in their plan — getting real value makes them likely to stay.`;
      case 'monthly_usage_pct':
        return raising
          ? `They're at ${v ? `${v.monthly_usage_pct}%` : 'a low share'} of their monthly plan allowance — paying for more than they use is a common step before cancelling.`
          : `They're using ${v ? `${v.monthly_usage_pct}%` : 'a healthy share'} of their monthly plan allowance — they're getting their money's worth.`;
      case 'support_ticket_count':
        return raising
          ? `${v ? `${v.support_ticket_count} support tickets` : 'Several support tickets'} recently — unresolved problems are a top reason customers walk away.`
          : v && v.support_ticket_count === 0
            ? 'No support tickets recently — a smooth, frustration-free experience so far.'
            : `${v ? `Only ${v.support_ticket_count} support ticket${v.support_ticket_count === 1 ? '' : 's'}` : 'Few support tickets'} recently — few problems means little frustration.`;
      case 'feedback_score':
        return raising
          ? `They rated their experience ${v ? `${v.feedback_score}/10` : 'poorly'} — unhappy customers rarely stay long.`
          : `They rated their experience ${v ? `${v.feedback_score}/10` : 'well'} — satisfied customers are much more likely to renew.`;
      case 'payment_status':
      case 'payment_active':
        return raising
          ? 'Their payment failed or is past due — billing problems often turn into silent cancellations.'
          : 'Their payments are up to date — a healthy billing history is a strong loyalty sign.';
      case 'tenure':
      case 'tenure_days':
        return raising
          ? "They're still a fairly new customer — loyalty hasn't had time to build, and new customers churn the most."
          : "They're a long-time customer — the longer someone stays, the more likely they are to keep staying.";
      default:
        return raising
          ? 'This factor is pushing their cancellation risk up.'
          : 'This factor is helping keep this customer around.';
    }
  };

  // Revenue framing for the simulator: expected 12-month revenue kept (or
  // lost) = churn-risk change x this customer's monthly bill. Uses the plan's
  // package price (user.mrr) so the figure matches the tier price (RM50/100/
  // 200/500) shown on the customer card and directory.
  const annualRevenueDelta = simResult
    ? -simResult.delta_churn * user.mrr * 12
    : 0;
  const revenueBasisMonthly = user.mrr;
  const fmtMoney = (v: number) => Math.abs(v).toLocaleString(undefined, { maximumFractionDigits: 0 });

  // NEW-* signups (and any unscored row) legitimately have shap_reasons: [] —
  // an empty array must fall through to churnFactors, and an empty result
  // renders the "too new to explain" state below instead of a blank panel.
  const activeFactors: { feature?: string; name: string; impact: number }[] =
    recommendation?.shap_reasons?.length
      ? recommendation.shap_reasons.map((r: any) => ({
          feature: r.feature,
          name: FACTOR_LABELS[r.feature] ?? r.feature.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          impact: Math.round(r.contribution * 100)
        }))
      : user.churnFactors;

  // Diverging-bar geometry for the "Why Is This Customer At Risk?" panel.
  // Each factor's magnitude is its share of the total SHAP explanation;
  // bars are scaled against the strongest factor so the top driver fills its
  // half of the axis and the rest read relative to it.
  const factorTotalAbs = activeFactors.reduce((s, f) => s + Math.abs(f.impact), 0);
  const factorMaxShare = activeFactors.reduce(
    (m, f) => (factorTotalAbs > 0 ? Math.max(m, Math.abs(f.impact) / factorTotalAbs) : m),
    0
  );

  return (
    <div className="text-left w-full flex flex-col gap-6 p-4 md:p-6 console-bg-dark min-h-screen relative animate-fadeIn">
      {/* 1. Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b console-border">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-black hover:text-earth-cocoa transition-colors duration-200 text-sm group font-bold cursor-pointer"
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
      <div
        onClick={() => setSelectedInsightCard('overview')}
        className={`console-card-dark rounded-2xl p-5 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between shadow-sm cursor-pointer transition-all ${selectedInsightCard === 'overview' ? 'demo-card-selected' : ''}`}
      >
        <div className="flex items-center gap-4">
          <Avatar
            name={user.name}
            className="w-16 h-16 text-2xl rounded-full border-2 border-earth-clay"
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
            <p className="text-black font-semibold text-sm mt-1">{user.email}</p>
            <p className="text-black/85 font-normal text-xs mt-0.5">{user.location} &bull; Onboarded {user.metrics.daysSinceOnboarding} days ago</p>
          </div>
        </div>

        <div className="flex gap-8 border-l console-border pl-6 h-full items-center">
          <div>
            <span className="text-black/85 font-extrabold text-[11px] block mb-1 uppercase tracking-wide">Contract Value</span>
            <span className="text-lg font-bold console-text-primary flex items-center">
              <span className="text-sm text-earth-clay mr-0.5">RM</span>
              {user.mrr.toLocaleString()}/mo
            </span>
          </div>
          <div>
            <span className="text-black/85 font-extrabold text-[11px] block mb-1 uppercase tracking-wide">Lifetime Value</span>
            <span className="text-lg font-bold console-text-primary flex items-center">
              <span className="text-sm text-earth-clay mr-0.5">RM</span>
              {(user.mrr * Math.round(user.metrics.daysSinceOnboarding / 30)).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Core Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Radial Health Score */}
        <div
          onClick={() => setSelectedInsightCard('health')}
          className={`console-card-dark p-5 rounded-2xl flex flex-col justify-between items-center text-center relative overflow-hidden group shadow-sm cursor-pointer transition-all ${selectedInsightCard === 'health' ? 'demo-card-selected' : ''}`}
        >
          <div className="absolute top-0 right-0 p-3 text-earth-sage/20 group-hover:text-earth-sage/30 transition-colors pointer-events-none">
            <UserCheck className="w-16 h-16" />
          </div>
          <span className="text-[11px] font-black tracking-wider uppercase text-black/80 self-start">CUSTOMER HEALTH</span>
          
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
              <span className="text-xs text-black font-extrabold block leading-none">/ 100</span>
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
        <div
          onClick={() => setSelectedInsightCard('risk')}
          className={`console-card-dark p-5 rounded-2xl flex flex-col justify-between items-start relative group shadow-sm cursor-pointer transition-all ${selectedInsightCard === 'risk' ? 'demo-card-selected' : ''}`}
        >
          <div className="absolute top-0 right-0 p-3 text-earth-sage/20 group-hover:text-earth-sage/30 transition-colors pointer-events-none">
            <ShieldAlert className="w-16 h-16" />
          </div>
          <span className="text-[11px] font-black tracking-wider uppercase text-black/80">CHURN PROBABILITY</span>
          
          <div className="my-4">
            <span className={`text-4xl font-extrabold tracking-tight ${
              user.churnProbability > 50 ? 'text-status-critical' : user.churnProbability > 15 ? 'text-status-risk' : 'text-status-healthy'
            }`}>
              {user.churnProbability}%
            </span>
            <div className="flex items-center gap-1 mt-2 text-xs text-black font-semibold">
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
            <div className="mt-2.5 text-xs text-black font-normal leading-none flex items-center gap-1">
              <span className="font-bold text-black/75">Est. Leave Date:</span>
              <span className={user.churnProbability > 15 ? 'text-status-critical font-bold' : 'text-status-healthy font-bold'}>
                {getEstimatedLeaveDate(user.churnProbability)}
              </span>
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
        <div
          onClick={() => setSelectedInsightCard('usage')}
          className={`console-card-dark p-5 rounded-2xl flex flex-col justify-between items-start relative shadow-sm cursor-pointer transition-all ${selectedInsightCard === 'usage' ? 'demo-card-selected' : ''}`}
        >
          <span className="text-[11px] font-black tracking-wider uppercase text-black/80">USAGE TREND</span>
          
          <div className="my-4">
            <span className={`text-4xl font-extrabold tracking-tight ${
              user.metrics.usageVelocity < 0.5 ? 'text-status-critical' : user.metrics.usageVelocity < 0.9 ? 'text-status-risk' : 'text-status-healthy'
            }`}>
              {Math.round(user.metrics.usageVelocity * 100)}%
            </span>
            <div className="flex items-center gap-1 mt-2 text-xs text-black font-semibold">
              {user.metrics.usageVelocity < 0.8 ? (
                <span className="text-status-risk font-bold">
                  Using the product {Math.round((1 - user.metrics.usageVelocity) * 100)}% less than before
                </span>
              ) : (
                <span className="text-status-healthy font-bold">Stable or rising usage</span>
              )}
            </div>
          </div>

          <div className="text-xs text-black font-normal leading-normal">
            100% means steady usage. Below 80% means this customer is logging in noticeably less than usual.
          </div>
        </div>

        {/* Friction & Invoices */}
        <div
          onClick={() => setSelectedInsightCard('support')}
          className={`console-card-dark p-5 rounded-2xl flex flex-col justify-between items-start relative shadow-sm cursor-pointer transition-all ${selectedInsightCard === 'support' ? 'demo-card-selected' : ''}`}
        >
          <span className="text-[11px] font-black tracking-wider uppercase text-black/80">SUPPORT & BILLING ISSUES</span>
          
          <div className="my-4 flex flex-col gap-2 w-full">
            <div className="flex justify-between items-center w-full">
              <span className="text-xs text-black font-bold">Support Trouble Level</span>
              <span className={`font-bold ${user.metrics.frictionIndex > 5 ? 'text-status-risk' : 'console-text-primary'}`}>
                {user.metrics.frictionIndex} / 10
              </span>
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="text-xs text-black font-bold">Failed Payments (last 30 days)</span>
              <span className={`font-bold ${user.metrics.failedPayments > 0 ? 'text-status-critical' : 'text-status-healthy'}`}>
                {user.metrics.failedPayments} Failed
              </span>
            </div>
          </div>

          <div className="text-xs text-black font-normal leading-normal">
            Declined cards and unresolved problems are common reasons customers leave without meaning to.
          </div>
        </div>
      </div>

      {/* 4. SHAP Explainable AI and Timeline Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SHAP Explanations (XAI) */}
        <div
          onClick={() => setSelectedInsightCard('shap')}
          className={`console-card-dark rounded-2xl p-5 flex flex-col gap-4 shadow-sm cursor-pointer transition-all ${selectedInsightCard === 'shap' ? 'demo-card-selected' : ''}`}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold console-text-primary flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-earth-clay" />
              Why Is This Customer At Risk?
            </h3>
            <span className="text-[10px] bg-earth-sage/20 border console-border console-text-primary px-2 py-0.5 rounded font-bold">
              AI-Powered
            </span>
          </div>
          {activeFactors.length > 0 && (
            <p className="text-xs text-black font-normal leading-relaxed">
              The factors below show what is causing this customer to consider leaving (red) versus what is keeping them happy and loyal (green).
            </p>
          )}

          <div className="flex flex-col gap-4 my-2">
            {activeFactors.length === 0 ? (
              <div className="console-card-dark-inner rounded-lg p-3 text-xs text-black font-normal leading-relaxed">
                No risk breakdown yet — this customer is too new for the AI to explain. Risk factors
                appear once they build up real usage history (logins, feature use, feedback). For
                now, their score is a healthy new-account baseline.
              </div>
            ) : (
              <>
                {/* Diverging axis header: green retention left, red risk right */}
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider px-0.5 -mb-1">
                  <span className="text-status-healthy">◄ Keeping them loyal</span>
                  <span className="text-status-critical">Pushing them to leave ►</span>
                </div>

                {/* Scaled percentage breakdown where positive risk factor percentages total up to user.churnProbability */}
                {(() => {
                  const positiveFactors = activeFactors.filter(f => f.impact > 0);
                  const positiveImpactSum = positiveFactors.reduce((sum, f) => sum + f.impact, 0);
                  let allocatedSum = 0;
                  const factorPcts: Record<string, number> = {};

                  positiveFactors.forEach((f, idx) => {
                    if (idx === positiveFactors.length - 1) {
                      factorPcts[f.name] = Math.max(0, user.churnProbability - allocatedSum);
                    } else {
                      const pct = positiveImpactSum > 0 ? Math.round((f.impact / positiveImpactSum) * user.churnProbability) : 0;
                      factorPcts[f.name] = pct;
                      allocatedSum += pct;
                    }
                  });

                  const negativeFactors = activeFactors.filter(f => f.impact < 0);
                  const negativeImpactSum = Math.abs(negativeFactors.reduce((sum, f) => sum + f.impact, 0));
                  const retentionTarget = Math.max(10, 100 - user.churnProbability);
                  let allocatedNegSum = 0;
                  negativeFactors.forEach((f, idx) => {
                    if (idx === negativeFactors.length - 1) {
                      factorPcts[f.name] = Math.max(0, retentionTarget - allocatedNegSum);
                    } else {
                      const pct = negativeImpactSum > 0 ? Math.round((Math.abs(f.impact) / negativeImpactSum) * retentionTarget) : 0;
                      factorPcts[f.name] = pct;
                      allocatedNegSum += pct;
                    }
                  });

                  return activeFactors.map((factor) => {
                    const shareFrac = factorTotalAbs > 0 ? Math.abs(factor.impact) / factorTotalAbs : 0;
                    const share = Math.round(shareFrac * 100);
                    const isNeutral = factor.impact === 0;
                    const isPositive = factor.impact > 0;
                    const strength = share >= 35 ? 'Major' : share >= 20 ? 'Strong' : share >= 10 ? 'Moderate' : 'Minor';
                    const pct = factorPcts[factor.name] || 0;
                    const halfPct = factorMaxShare > 0 ? Math.max(6, (shareFrac / factorMaxShare) * 50) : 0;

                    // Evaluate month-over-month trend sign (+ vs -) based on recent customer metric movement
                    const isTrendingUp = (() => {
                      if (factor.feature === 'payment_status' || factor.feature === 'failed_payments') return user.metrics?.failedPayments > 0;
                      if (factor.feature === 'login_frequency' || factor.feature === 'usage_velocity') return (user.metrics?.usageVelocity || 0.8) >= 0.7;
                      if (factor.feature === 'feature_usage' || factor.feature === 'feature_adoption') return (user.metrics?.featureAdoption || 0.6) >= 0.5;
                      if (factor.feature === 'support_tickets' || factor.feature === 'friction_index') return (user.metrics?.frictionIndex || 0) <= 2;
                      return (factor.impact % 2 === 0);
                    })();

                    const signPrefix = isPositive
                      ? (isTrendingUp ? '+' : '-')
                      : (isTrendingUp ? '+' : '-');

                    return (
                      <div key={factor.name} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-black font-extrabold">{factor.name}</span>
                          <div className="flex items-center gap-2">
                            <span className={isNeutral ? 'text-black/50 font-bold' : isPositive ? 'text-status-critical font-bold' : 'text-status-healthy font-bold'}>
                              {isNeutral ? 'Little effect' : isPositive ? `${strength} — raising risk` : `${strength} — keeping loyal`}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md font-extrabold text-xs flex items-center gap-1.5 ${isPositive ? 'bg-status-critical/15 text-status-critical border border-status-critical/30' : 'bg-status-healthy/15 text-status-healthy border border-status-healthy/30'}`}>
                              <span>{signPrefix}{pct}%</span>
                              <span className="text-black/80 font-bold">vs last month</span>
                            </span>
                          </div>
                        </div>
                        {/* Diverging bar: center axis line with green growing left and red growing right */}
                        <div className="relative w-full h-2.5 rounded-full bg-earth-cocoa/10 overflow-hidden">
                          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-earth-cocoa/30 z-10" />
                          {!isNeutral && (
                            isPositive ? (
                              <div
                                className="absolute left-1/2 top-0 bottom-0 bg-status-critical rounded-r-full transition-all duration-300"
                                style={{ width: `${halfPct}%` }}
                              />
                            ) : (
                              <div
                                className="absolute top-0 bottom-0 bg-status-healthy rounded-l-full transition-all duration-300"
                                style={{ right: '50%', width: `${halfPct}%` }}
                              />
                            )
                          )}
                        </div>
                        {!isNeutral && (
                          <p className="text-[11px] text-black/70 font-normal leading-snug">
                            {explainFactor(factor.feature, isPositive)}
                          </p>
                        )}
                      </div>
                    );
                  });
                })()}
              </>
            )}
          </div>

          {/* Dynamic AI Conclusion — Option 2: Executive Risk Summary & Recommended CSM Action */}
          {activeFactors.length > 0 && (() => {
            const isHighHealthHighRisk = user.healthScore >= 65 && user.churnProbability >= 50;
            const isLowHealthLowRisk  = user.healthScore < 50  && user.churnProbability < 30;
            const topRiskFactor       = activeFactors.filter(f => f.impact > 0).sort((a, b) => b.impact - a.impact)[0];
            const topRetainFactor     = activeFactors.filter(f => f.impact < 0).sort((a, b) => a.impact - b.impact)[0];

            let primaryCause = topRiskFactor ? topRiskFactor.name : 'Subscription or billing signal';
            let causeDetail = isHighHealthHighRisk
              ? `Strong daily usage (${user.healthScore}/100 health) is currently overshadowed by forward-looking risk factors, primarily ${primaryCause}.`
              : isLowHealthLowRisk
              ? `Engagement is currently lower than average, but solid structural retention anchors (${topRetainFactor ? topRetainFactor.name : 'contract or loyalty'}) are keeping cancellation risk low (${user.churnProbability}%).`
              : `Primary risk vector driving cancellation probability (${user.churnProbability}%) is ${primaryCause}.`;

            let recommendedAction = user.warningFlags.includes('Failed Payment')
              ? 'Extend a 14-day billing grace period immediately to prevent payment failure from escalating into a cancellation.'
              : user.warningFlags.includes('Not Using Key Features')
              ? 'Send a personalized feature tutorial video highlighting unused plan benefits to rebuild product adoption.'
              : user.warningFlags.includes('Open Support Issues')
              ? 'Schedule a CSM sync call and escalate open support tickets to top resolution priority.'
              : 'Offer a 20% loyalty discount for 3 months to stabilize account retention.';

            return (
              <div className="mt-1 rounded-xl border border-earth-sage/30 bg-[#efe9d2]/30 p-4 flex flex-col gap-3">
                {/* Executive Summary */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-black text-earth-cocoa uppercase tracking-wide">
                    EXECUTIVE RISK SUMMARY
                  </span>
                  <div className="text-xs text-black font-normal leading-relaxed space-y-1">
                    <p>
                      <strong className="font-extrabold text-earth-cocoa">Primary Driver:</strong> {causeDetail}
                    </p>
                    <p>
                      <strong className="font-extrabold text-earth-cocoa">Health vs Churn Gap:</strong> Health score ({user.healthScore}/100) measures daily active sessions, whereas Churn Probability ({user.churnProbability}%) predicts forward-looking cancellation risk over the next 30 days.
                    </p>
                  </div>
                </div>

                {/* Recommended CSM Priority */}
                <div className="border-t border-earth-sage/30 pt-2.5 flex flex-col gap-1">
                  <span className="text-xs font-black text-earth-cocoa uppercase tracking-wide">
                    RECOMMENDED CSM ACTION
                  </span>
                  <p className="text-xs text-black font-normal leading-relaxed">
                    <strong className="font-extrabold text-status-healthy">Action Strategy:</strong> {recommendedAction}
                  </p>
                </div>

                {/* What to Prevent Next Time - Only shown for already-churned accounts (100% / 85%+ churn probability) */}
                {(user.churnProbability >= 85 || user.state === 'churned' || user.healthScore === 0) && (
                  <div className="border-t border-earth-sage/30 pt-2.5 flex flex-col gap-1.5">
                    <span className="text-xs font-black text-earth-cocoa uppercase tracking-wide">
                      What to Prevent Next Time
                    </span>
                    <ul className="text-xs text-black font-normal leading-relaxed space-y-1 list-disc pl-4">
                      <li><strong>Automate Billing Reminders:</strong> Send grace-period notifications 3 days before subscription card expirations to stop payment failures from causing silent cancellations.</li>
                      <li><strong>Early Engagement Trigger:</strong> Schedule automated feature tutorial broadcasts if login frequency drops below 2 logins per week in the first 30 days.</li>
                      <li><strong>CSM Outage & Support SLA:</strong> Require an automated CSM check-in call whenever open support tickets exceed 2 within a single billing cycle.</li>
                    </ul>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Activity Timeline */}
        <div
          onClick={() => setSelectedInsightCard('activity')}
          className={`console-card-dark rounded-2xl p-5 flex flex-col gap-4 shadow-sm cursor-pointer transition-all ${selectedInsightCard === 'activity' ? 'demo-card-selected' : ''}`}
        >
          <div className="flex items-center gap-2.5">
            <img src="/falcon-icon.png" alt="Falcon Chronicle Agent" className="w-8 h-8 object-contain shrink-0" />
            <div className="flex flex-col leading-tight">
              <h3 className="text-base font-bold console-text-primary">Falcon Chronicle Agent</h3>
              <span className="text-[10px] font-semibold text-black/60 uppercase tracking-wider">Recent Activity</span>
            </div>
          </div>

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
                    <span className="text-[11px] text-black font-bold">{log.date}</span>
                  </div>
                  <p className="text-xs text-black font-normal mt-1">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What-If Churn Simulator Section */}
      <div
        onClick={() => setSelectedInsightCard('simulator')}
        className={`console-card-dark rounded-2xl p-6 flex flex-col gap-6 shadow-sm cursor-pointer transition-all ${selectedInsightCard === 'simulator' ? 'demo-card-selected' : ''}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b console-border pb-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold console-text-primary flex items-center gap-2">
              <Cpu className="w-4.5 h-4.5 text-earth-clay" />
              "What-If" Simulator
            </h3>
            <p className="text-xs text-black font-normal leading-normal">
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
              className="border console-border text-black hover:text-earth-clay bg-earth-bg/5 hover:bg-earth-bg/10 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              Reset to Today's Values
            </button>
            <button
              onClick={() => runSimulation()}
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
                <span className="text-black font-extrabold">Login Frequency</span>
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
                <span className="text-black font-extrabold">Features They Use</span>
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
                <span className="text-black font-extrabold">Monthly Usage</span>
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
                <span className="text-black font-extrabold">Open Support Tickets</span>
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
                <span className="text-black font-extrabold">Customer Feedback Score</span>
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
              <label className="text-xs text-black font-bold">Payment Status</label>
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
                <span className="text-xs text-black font-bold">
                  Adjust the sliders, then click "See What Would Happen" to preview the change.
                </span>
              </div>
            )}

            {simResult && !simError && (
              <div className="flex flex-col gap-4 select-none text-left">
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] uppercase font-black text-black/80 tracking-wider">Predicted Outcome</span>
                  <span className="text-[9px] bg-earth-sage/20 border console-border console-text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Computed</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Churn Risk Change */}
                  <div className="console-card-dark-inner p-3.5 rounded-xl flex flex-col gap-1">
                    <span className="text-[11px] text-black font-normal block">RISK OF LEAVING</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-bold text-black/70 line-through">
                        {Math.round(simResult.baseline_churn_probability * 100)}%
                      </span>
                      <span className={`text-2xl font-extrabold ${simResult.delta_churn < 0 ? 'text-status-healthy' : simResult.delta_churn > 0 ? 'text-status-critical' : 'console-text-primary'}`}>
                        &rarr; {Math.round(simResult.simulated_churn_probability * 100)}%
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold mt-1.5 block ${simResult.delta_churn < 0 ? 'text-status-healthy' : simResult.delta_churn > 0 ? 'text-status-critical' : 'text-black/60'}`}>
                      {simResult.delta_churn < 0 ? `Reduced risk by ${Math.round(Math.abs(simResult.delta_churn) * 100)}%` : simResult.delta_churn > 0 ? `Increased risk by ${Math.round(simResult.delta_churn * 100)}%` : 'No risk changes'}
                    </span>
                    <div className="text-[10px] text-black font-normal mt-1 border-t border-earth-sage/10 pt-1">
                      <span className="font-semibold text-black/75">Est. Leave:</span>{' '}
                      <span className="line-through text-black/50">{getEstimatedLeaveDate(simResult.baseline_churn_probability * 100).split(' (')[0]}</span>
                      {' '}&rarr;{' '}
                      <span className="font-bold text-earth-clay">{getEstimatedLeaveDate(simResult.simulated_churn_probability * 100).split(' (')[0]}</span>
                    </div>
                  </div>

                  {/* Health Score Change */}
                  <div className="console-card-dark-inner p-3.5 rounded-xl flex flex-col gap-1">
                    <span className="text-[11px] text-black font-normal block">HEALTH SCORE</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-bold text-black/70 line-through">
                        {Math.round(simResult.baseline_health_score)}
                      </span>
                      <span className={`text-2xl font-extrabold ${simResult.delta_health > 0 ? 'text-status-healthy' : simResult.delta_health < 0 ? 'text-status-critical' : 'console-text-primary'}`}>
                        &rarr; {Math.round(simResult.simulated_health_score)}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold mt-1.5 block ${simResult.delta_health > 0 ? 'text-status-healthy' : simResult.delta_health < 0 ? 'text-status-critical' : 'text-black/60'}`}>
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
                  <span className="text-[11px] text-black font-bold block flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-earth-clay" />
                    REVENUE IMPACT (NEXT 12 MONTHS)
                  </span>
                  <span className={`text-2xl font-extrabold mt-1 ${
                    Math.round(annualRevenueDelta) > 0 ? 'text-status-healthy' : Math.round(annualRevenueDelta) < 0 ? 'text-status-critical' : 'console-text-primary'
                  }`}>
                    {Math.round(annualRevenueDelta) > 0 ? `+RM${fmtMoney(annualRevenueDelta)} protected` : Math.round(annualRevenueDelta) < 0 ? `-RM${fmtMoney(annualRevenueDelta)} at risk` : 'No revenue change'}
                  </span>
                  <span className="text-xs text-black font-normal leading-normal mt-1">
                    How we got this: the {Math.round(Math.abs(simResult.delta_churn) * 100)}% change in leave-risk × this customer's RM{fmtMoney(revenueBasisMonthly)}/mo bill × 12 months. Keeping a customer is far cheaper than winning a new one.
                  </span>
                </div>

                {/* AI Retention Advisor — Gemini narrates the computed result */}
                {(aiLoading || aiNarrative) && (
                  <div className="console-card-dark-inner border console-border p-3.5 rounded-xl flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-black font-bold flex items-center gap-1">
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
                      <span className="text-[11px] text-black font-semibold italic animate-pulse">
                        Writing a retention plan for this scenario…
                      </span>
                    ) : (
                      <p className="text-xs text-black font-normal leading-relaxed">{aiNarrative}</p>
                    )}
                  </div>
                )}

                {/* Summary sentence */}
                <p className="text-xs text-black font-normal leading-relaxed console-card-dark-inner p-2 rounded-lg mt-1 italic">
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
        <div
          onClick={() => setSelectedInsightCard('assistant')}
          className={`console-card-dark rounded-2xl p-5 flex flex-col gap-4 lg:col-span-2 shadow-sm order-2 cursor-pointer transition-all ${selectedInsightCard === 'assistant' ? 'demo-card-selected' : ''}`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <img src="/falcon-icon.png" alt="Falcon Strategist Agent" className="w-8 h-8 object-contain shrink-0" />
              <div className="flex flex-col leading-tight">
                <h3 className="text-base font-bold console-text-primary">Falcon Strategist Agent</h3>
                <span className="text-[10px] font-semibold text-black/60 uppercase tracking-wider">Retention Assistant</span>
              </div>
            </div>
            <span className="bg-earth-sage/20 console-text-primary text-[10px] px-2 py-0.5 border console-border rounded font-bold">
              AI Assistant
            </span>
          </div>

          {/* Similar past cases */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase font-black text-black/80 tracking-wider">
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
                  <p className="text-xs text-black font-normal leading-normal">
                    <strong className="console-text-primary">What happened:</strong> {j.reason}
                  </p>
                  <p className="text-xs text-black font-normal leading-normal">
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
              <span className="text-[11px] uppercase font-black text-black/80 tracking-wider">
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
                <div className="flex flex-col gap-3">
                  {/* Subject input field */}
                  <div className="flex flex-col gap-1 console-card-dark-inner p-3 rounded-xl text-xs">
                    <span className="font-bold text-black text-[11px] uppercase">Subject Line:</span>
                    <input
                      type="text"
                      value={editedSubject}
                      onChange={(e) => setEditedSubject(e.target.value)}
                      disabled={isSendingEmail}
                      className="w-full bg-transparent font-bold text-xs console-text-primary outline-none border-b border-transparent focus:border-earth-clay pb-0.5"
                    />
                  </div>

                  {/* Body textarea */}
                  <textarea
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                    disabled={isSendingEmail}
                    className="w-full h-56 console-card-dark-inner border border-transparent p-4 rounded-xl text-xs font-mono console-text-primary leading-relaxed outline-none focus:border-earth-clay shadow-inner"
                  />
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

                {(user.name.toLowerCase().replace(/\s+/g, '').includes('yap') || user.name.toLowerCase().replace(/\s+/g, '').includes('yuning')) && (
                  <button
                    onClick={() => {
                      const whatsappText = editedBody;
                      const phone = user.name.toLowerCase().replace(/\s+/g, '').includes('yap') ? '60162897881' : '60162897881';
                      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(whatsappText)}`, '_blank');
                    }}
                    className="w-full py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm mt-2"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Send WhatsApp Message ({user.name.toLowerCase().replace(/\s+/g, '').includes('yap') ? '0162897881' : '0162897881'})</span>
                  </button>
                )}

                {emailSentSuccess && (
                  <div className="bg-[#276B2B]/15 border border-[#276B2B]/35 text-status-healthy p-2.5 rounded-xl text-[10px] font-bold text-center animate-scaleUp">
                    ✅ Suggested email successfully transmitted directly to {user.email}! Activity timeline updated.
                  </div>
                )}
              </>
            ) : (
              <div className="console-card-dark-inner rounded-xl p-6 border border-dashed console-border text-center text-xs text-black font-normal">
                Select one of the Next Best Action on the left to automatically generate a tailored follow-up email draft here.
              </div>
            )}
          </div>
        </div>

        {/* Value Injections Playbook */}
        <div
          onClick={() => setSelectedInsightCard('actions')}
          className={`console-card-dark rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm order-1 cursor-pointer transition-all ${selectedInsightCard === 'actions' ? 'demo-card-selected' : ''}`}
        >
          {(() => {
            const mostRecommended = pinnedRecommendedAction;

            const featurePct = Math.round(user.metrics.featureAdoption * 100);
            const friction = user.metrics.frictionIndex;
            const days = user.metrics.daysSinceOnboarding;
            const actionReasons: Record<string, string> = {
              grace_period: user.warningFlags.includes('Failed Payment')
                ? 'A payment on this account failed — a short grace period stops an involuntary cancellation while they fix their billing.'
                : 'No failed payment on file, so this only helps if billing lapses.',
              training: `Only ${featurePct}% of plan features are in use — guided tutorials lift adoption before low engagement turns into churn.`,
              csm_call: `Friction index is ${friction}/10 — a personal check-in clears open issues faster than email and rebuilds trust.`,
              discount: `${days} days in — a loyalty discount reinforces value and removes a price-driven reason to leave.`,
            };

            return (
              <>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2.5">
                    <img src="/falcon-icon.png" alt="Falcon Strategist Agent" className="w-8 h-8 object-contain shrink-0" />
                    <div className="flex flex-col leading-tight">
                      <h3 className="text-base font-bold console-text-primary">Falcon Strategist Agent</h3>
                      <span className="text-[10px] font-semibold text-black/60 uppercase tracking-wider">Next Best Action</span>
                    </div>
                  </div>
                  <p className="text-xs text-black font-normal leading-normal mt-1">
                    <span className="font-bold text-earth-cocoa">Falcon Strategist</span> recommends the best move for this customer. Pick an action and their risk of leaving updates instantly.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 my-2">
                  <button
                    onClick={() => handleAction('grace_period')}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold flex flex-col gap-1.5 border bg-earth-cocoa/10 hover:bg-earth-cocoa/20 console-border text-earth-cocoa transition-all duration-200 cursor-pointer"
                  >
                    <span className="w-full flex items-center justify-between gap-2">
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
                    </span>
                    <p className="w-full text-[11.5px] font-normal text-earth-cocoa/70 text-left leading-snug">{actionReasons.grace_period}</p>
                  </button>

                  <button
                    onClick={() => handleAction('training')}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold flex flex-col gap-1.5 border bg-earth-cocoa/10 hover:bg-earth-cocoa/20 console-border text-earth-cocoa transition-all duration-200 cursor-pointer"
                  >
                    <span className="w-full flex items-center justify-between gap-2">
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
                    </span>
                    <p className="w-full text-[11.5px] font-normal text-earth-cocoa/70 text-left leading-snug">{actionReasons.training}</p>
                  </button>

                  <button
                    onClick={() => handleAction('csm_call')}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold flex flex-col gap-1.5 border bg-earth-cocoa/10 hover:bg-earth-cocoa/20 console-border text-earth-cocoa transition-all duration-200 cursor-pointer"
                  >
                    <span className="w-full flex items-center justify-between gap-2">
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
                    </span>
                    <p className="w-full text-[11.5px] font-normal text-earth-cocoa/70 text-left leading-snug">{actionReasons.csm_call}</p>
                  </button>

                  <button
                    onClick={() => handleAction('discount')}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold flex flex-col gap-1.5 border bg-earth-cocoa/10 hover:bg-earth-cocoa/20 console-border text-earth-cocoa transition-all duration-200 cursor-pointer"
                  >
                    <span className="w-full flex items-center justify-between gap-2">
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
                    </span>
                    <p className="w-full text-[11.5px] font-normal text-earth-cocoa/70 text-left leading-snug">{actionReasons.discount}</p>
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
            <div className="border border-dashed console-border p-3 rounded-xl text-xs text-black font-normal text-center">
              Every action you take is recorded in the customer's recent activity.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
