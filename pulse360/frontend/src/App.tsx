import { useState, useRef } from 'react';
import { mockUsers, mergeBackendCustomer, downgradeSavings, upgradeCost, suggestPlanChange, PLAN_LADDER, type PlanTier, type ActiveUser } from './utils/mockData';
import { LIFESTYLE_CONFIG, type WizardResult } from './components/OnboardingWizard';
import { ActiveUserInsight } from './components/ActiveUserInsight';
import { NavBar } from './components/NavBar';
import { MarketingPage } from './pages/MarketingPage';
import { ClientDashboardPage } from './pages/ClientDashboardPage';
import { ConsolePage } from './pages/console/ConsolePage';
import { useChurnSimulation } from './hooks/useChurnSimulation';
import { getCustomers, getCustomerStats, createCustomer } from './lib/api';
import { useEffect } from 'react';

// Canonical plan list prices (RM/mo) — must stay in sync with PLAN_OPTIONS in
// OnboardingWizard.tsx (see CLAUDE.md hard rules).
const planMrr = { Starter: 50, Growth: 100, Pro: 200, Enterprise: 500 } as const;

// DEMO-ONLY: hardcoded hero customer, "after" state. Yu Ning is the success
// story — she took Falcon Coach's recommendation to explore the Pro Plan
// benefits she wasn't using, and it turned the account around: high usage,
// strong feature adoption, low churn risk. The drill-down demo shows what a
// healthy, well-guided customer looks like (green SHAP factors, a positive
// activity timeline, and a simulator with little left to rescue). Not model output.
const buildYuNingUser = (): ActiveUser => ({
  id: "cus_yuning",
  name: "Yu Ning",
  email: "yuning@example.com",
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
  location: 'Kuala Lumpur, Malaysia',
  lat: 3.1390,
  lng: 101.6869,
  plan: 'Pro',
  mrr: planMrr.Pro,
  healthScore: 91,
  churnProbability: 6,
  warningFlags: [],
  metrics: {
    usageVelocity: 0.88,
    featureAdoption: 0.86,
    frictionIndex: 1,
    failedPayments: 0,
    daysSinceOnboarding: 52,
  },
  // feature keys drive the plain-language explanations in the "Why Is This
  // Customer At Risk?" panel (explainFactor in ActiveUserInsight). Negative
  // impact = keeping the customer loyal (green) — all of Yu Ning's factors are
  // now retention drivers after she adopted the plan's features.
  churnFactors: [
    { feature: 'feature_usage', name: 'Features They Use', impact: -34 },
    { feature: 'login_frequency', name: 'How Often They Log In', impact: -27 },
    { feature: 'feedback_score', name: 'Feedback Score', impact: -19 },
    { feature: 'payment_status', name: 'Payment Status', impact: -12 },
    { feature: 'support_ticket_count', name: 'Support Requests', impact: -8 },
  ],
  activityLogs: [
    { date: '2026-07-19', type: 'feature_use', details: 'Explored the personalized Pro Plan tutorial and activated Advanced Analytics, Automation Workflows, and Priority Roaming.' },
    { date: '2026-07-18', type: 'feature_use', details: 'Built her first automation workflow — weekly reports now run on their own.' },
    { date: '2026-07-16', type: 'login', details: 'Logged in every day this week — usage up 3x since exploring the plan benefits.' },
    { date: '2026-07-14', type: 'payment_success', details: 'Updated her card and paid the RM200 invoice — account back in good standing.' },
    { date: '2026-07-12', type: 'feature_use', details: 'Adopted the Analytics dashboard as a daily habit — feature usage now at 86%.' },
    { date: '2026-07-10', type: 'support_resolve', details: 'Earlier login issue resolved on first response — rated the experience 9/10.' },
  ],
  pastJourneys: [],
  state: 'active',
  // Baseline signals so the What-If simulator runs fully client-side for this
  // hardcoded customer (no backend row). Values line up with the metrics /
  // SHAP factors above so an untouched run shows a true zero delta.
  simSignals: {
    login_frequency: 6.5,
    feature_usage: 0.86,
    monthly_usage_pct: 88,
    support_ticket_count: 0,
    feedback_score: 9.1,
    payment_status: 'active',
  },
});

function App() {
  const [currentPage, setCurrentPage] = useState<'marketing' | 'client_console' | 'client_dashboard' | 'insight'>('marketing');
  const [users, setUsers] = useState<ActiveUser[]>([buildYuNingUser(), ...mockUsers]);
  const [selectedUser, setSelectedUser] = useState<ActiveUser | null>(null);
  const [clientUserId, setClientUserId] = useState<string>('cus_yuning');
  // First visit to the client dashboard runs the guided setup as a sign-up
  // flow; once completed (or skipped) it never auto-opens again this session.
  const [signupCompleted, setSignupCompleted] = useState(false);

  // Simulation States (Concept 1: Digital Twin Sandbox)
  const [isSimulating, setIsSimulating] = useState(true);
  const [outageRate, setOutageRate] = useState(15);
  const [billingFailureRate, setBillingFailureRate] = useState(10);
  const [telemetryFeed, setTelemetryFeed] = useState<string[]>([
    'Falcon360 is up and running. Watching customer activity in real time.',
    'Tracking 8 active customers around the world.',
  ]);
  const [pulseTrigger, setPulseTrigger] = useState(0);

  // Population-wide health-band distribution (from /customers/stats — the
  // customer list itself is a band-balanced sample, so never aggregate it).
  const [healthStats, setHealthStats] = useState<{
    total_customers: number;
    healthy_count: number;
    at_risk_count: number;
    critical_count: number;
    healthy_pct: number;
    at_risk_pct: number;
    critical_pct: number;
    avg_health_score: number;
    silent_churn_count: number;
    silent_churn_pct: number;
    silent_churn_mrr: number;
  } | null>(null);

  // Fetch live customer summaries from FastAPI backend
  useEffect(() => {
    getCustomerStats()
      .then(setHealthStats)
      .catch((err: unknown) => {
        console.warn('Could not load health distribution stats; keeping placeholder figures.', err);
      });
    getCustomers()
      .then((data) => {
        if (data && data.length > 0) {
          const merged = data.map((c: any) => mergeBackendCustomer(c));
          const hasYuNing = merged.some((u: any) => u.name.toLowerCase().includes('yuning'));
          const finalUsers = hasYuNing ? merged : [buildYuNingUser(), ...merged];
          setUsers(finalUsers);
          setClientUserId('cus_yuning');
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
      warningFlags: updatedUser.warningFlags.filter(f => f !== 'Using It Less' && f !== 'Failed Payment' && f !== 'Silent Churner')
    };
    setUsers(prev => prev.map(u => u.id === recoveredUser.id ? recoveredUser : u));
    setSelectedUser(recoveredUser);
    addTelemetry(`[Action Taken] ${recoveredUser.name} is back on track — risk of leaving is down to ${recoveredUser.churnProbability}%.`);
  };

  const handleClientAction = (userId: string, action: 'downgrade' | 'upgrade' | 'extend_grace' | 'change_plan', targetPlanOverride?: PlanTier) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        if (action === 'downgrade' || action === 'upgrade' || action === 'change_plan') {
          let targetPlan: PlanTier;
          let direction: 'downgrade' | 'upgrade';
          if (action === 'change_plan') {
            // Customer picked a specific plan themselves from the plan picker.
            if (!targetPlanOverride || targetPlanOverride === u.plan) return u;
            targetPlan = targetPlanOverride;
            direction = PLAN_LADDER.indexOf(targetPlan) < PLAN_LADDER.indexOf(u.plan) ? 'downgrade' : 'upgrade';
          } else {
            const suggestion = suggestPlanChange(u.plan, u.metrics.usageVelocity, u.mrr);
            targetPlan = suggestion?.direction === action
              ? suggestion.targetPlan
              : action === 'downgrade' ? 'Starter' : u.plan;
            direction = action;
          }
          // A picked plan scales charges by the list-price ratio so the
          // customer's own price scale is preserved; the 1-click AI actions
          // keep their fixed step deltas.
          const newMrr = action === 'change_plan'
            ? Math.max(5, Math.round(u.mrr * planMrr[targetPlan] / planMrr[u.plan]))
            : direction === 'downgrade'
              ? u.mrr - downgradeSavings(u.mrr)
              : u.mrr + upgradeCost(u.mrr);
          return {
            ...u,
            plan: targetPlan,
            mrr: newMrr,
            healthScore: Math.min(98, u.healthScore + (direction === 'downgrade' ? 20 : 10)),
            churnProbability: Math.max(5, u.churnProbability - (direction === 'downgrade' ? 30 : 15)),
            metrics: {
              ...u.metrics,
              // Right-sizing changes capacity, so relative usage shifts:
              // a smaller plan fills up, a bigger one opens headroom. A picked
              // plan may span several tiers, so scale by capacity ratio.
              usageVelocity: action === 'change_plan'
                ? Math.min(0.85, Math.max(0.05, Number((u.metrics.usageVelocity * planMrr[u.plan] / planMrr[targetPlan]).toFixed(2))))
                : direction === 'downgrade'
                  ? Math.min(0.85, Number((u.metrics.usageVelocity * 2.2).toFixed(2)))
                  : Number((u.metrics.usageVelocity * 0.55).toFixed(2)),
            },
            warningFlags: u.warningFlags.filter(f => f !== 'Using It Less'),
            activityLogs: [
              {
                date: new Date().toISOString().split('T')[0],
                type: 'plan_change',
                details: action === 'change_plan'
                  ? `Customer self-selected the ${targetPlan} Plan (RM${newMrr.toLocaleString()}/mo) via AI Plan Optimization.`
                  : direction === 'downgrade'
                    ? `Customer self-downgraded subscription to ${targetPlan} Plan (RM${newMrr.toLocaleString()}/mo) via Dashboard Console.`
                    : `Customer self-upgraded subscription to ${targetPlan} Plan (RM${newMrr.toLocaleString()}/mo) via Dashboard Console.`
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

  // Guided setup completed in signup mode: persist the new customer via
  // POST /customers (model-scored server-side), falling back to an in-memory
  // record if the backend is unreachable so signup never blocks the demo.
  const handleSignup = async (result: WizardResult) => {
    const name = result.name || 'New Customer';
    const plan: ActiveUser['plan'] = result.plan || 'Starter';
    const today = new Date().toISOString().split('T')[0];
    const cfg = LIFESTYLE_CONFIG[result.lifestyle];
    const buildLocalUser = (id: string): ActiveUser => ({
      id,
      name,
      email: result.email || `${name.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@gmail.com`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
      location: 'Kuala Lumpur, Malaysia',
      lat: 3.139,
      lng: 101.6869,
      plan,
      mrr: planMrr[plan],
      healthScore: 85,
      churnProbability: 8,
      warningFlags: [],
      metrics: {
        usageVelocity: 0.1,
        featureAdoption: 0.25,
        frictionIndex: 0,
        failedPayments: 0,
        daysSinceOnboarding: 1,
      },
      churnFactors: [
        { name: 'Recent Signup', impact: 10 },
        { name: 'Completed Onboarding', impact: -15 },
      ],
      activityLogs: [
        { date: today, type: 'feature_use', details: `AI agent auto-configured preferences for "${cfg.label}" (roaming, notifications, data alerts).` },
        { date: today, type: 'plan_change', details: `Activated ${result.simChoice === 'esim' ? 'eSIM' : 'physical SIM'}${result.phone ? ` for ${result.phone}` : ''} on ${plan} Plan (RM${planMrr[plan]}/mo).` },
        { date: today, type: 'login', details: 'Signed up via AI-guided onboarding (3-minute setup completed).' },
      ],
      pastJourneys: [],
      state: 'active',
    });

    let newUser: ActiveUser;
    try {
      const created = await createCustomer({
        name,
        subscription_plan: plan,
        monthly_charges: planMrr[plan],
        contract: 'Month-to-month',
        sim_type: result.simChoice,
        lifestyle: result.lifestyle,
      });
      // Backend supplies the scored fields; keep the wizard's richer demo
      // context (email, KL location, signup activity log) over the synthetic
      // values mergeBackendCustomer derives for unknown customers.
      const local = buildLocalUser(created.customer_id);
      const merged = mergeBackendCustomer(created);
      newUser = {
        ...merged,
        email: local.email,
        avatar: local.avatar,
        location: local.location,
        lat: local.lat,
        lng: local.lng,
        mrr: local.mrr,
        activityLogs: local.activityLogs,
        // New signups have no train-time SHAP values yet — keep the local
        // fresh-account factors instead of an empty breakdown.
        churnFactors: merged.churnFactors.length > 0 ? merged.churnFactors : local.churnFactors,
      };
    } catch (err) {
      console.warn('Could not save signup to the backend; keeping the customer in-memory.', err);
      newUser = buildLocalUser(`cus_new_${Date.now()}`);
    }
    setUsers(prev => [newUser, ...prev]);
    setClientUserId(newUser.id);
    setSignupCompleted(true);
    addTelemetry(`New customer ${name} signed up via guided onboarding (${result.aiInterventions} AI intervention${result.aiInterventions === 1 ? '' : 's'}) — added to customer list on ${plan} Plan.`);
  };

  const addTelemetry = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setTelemetryFeed(prev => [`[${time}] ${msg}`, ...prev.slice(0, 15)]);
  };

  useChurnSimulation(users, setUsers, addTelemetry, isSimulating, outageRate, billingFailureRate);

  const isDark = currentPage === 'insight';

  // Real population stats when the backend is up; calculated figures offline.
  const dist = healthStats ?? (() => {
    const total = users.length;
    const healthy = users.filter(u => u.healthScore >= 70);
    const atRisk = users.filter(u => u.healthScore < 70 && u.healthScore >= 40);
    const critical = users.filter(u => u.healthScore < 40);
    const silent = users.filter(u => u.warningFlags.includes('Silent Churner') || (u.warningFlags.includes('Using It Less') && u.healthScore > 40));

    const healthy_count = healthy.length;
    const at_risk_count = atRisk.length;
    const critical_count = critical.length;
    const silent_churn_count = silent.length;

    const healthy_pct = total > 0 ? Number(((healthy_count / total) * 100).toFixed(1)) : 0;
    const at_risk_pct = total > 0 ? Number(((at_risk_count / total) * 100).toFixed(1)) : 0;
    const critical_pct = total > 0 ? Number(((critical_count / total) * 100).toFixed(1)) : 0;
    const silent_churn_pct = total > 0 ? Number(((silent_churn_count / total) * 100).toFixed(1)) : 0;
    const silent_churn_mrr = silent.reduce((sum, u) => sum + u.mrr, 0);

    const avg_health_score = total > 0 ? Math.round(users.reduce((sum, u) => sum + u.healthScore, 0) / total) : 70;

    return {
      total_customers: total,
      healthy_count,
      at_risk_count,
      critical_count,
      healthy_pct,
      at_risk_pct,
      critical_pct,
      avg_health_score,
      silent_churn_count,
      silent_churn_pct,
      silent_churn_mrr,
    };
  })();
  const expScore = Math.round(dist.avg_health_score);
  const expLabel = expScore > 70 ? 'Excellent' : expScore > 40 ? 'Stable' : 'At Risk';

  return (
    <div className={`min-h-screen font-sans flex flex-col antialiased transition-colors duration-300 ${isDark ? 'console-bg-dark' : 'bg-earth-bg text-earth-cocoa'}`}>
      <NavBar isDark={isDark} currentPage={currentPage} setCurrentPage={setCurrentPage} setSelectedUser={setSelectedUser} scrollToConsole={scrollToConsole} />

      {/* Page Body */}
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
          <ConsolePage
            users={users}
            setUsers={setUsers}
            telemetryFeed={telemetryFeed}
            setTelemetryFeed={setTelemetryFeed}
            isSimulating={isSimulating}
            setIsSimulating={setIsSimulating}
            outageRate={outageRate}
            setOutageRate={setOutageRate}
            billingFailureRate={billingFailureRate}
            setBillingFailureRate={setBillingFailureRate}
            addTelemetry={addTelemetry}
            handleUpdateUser={handleUpdateUser}
            dist={dist}
            expScore={expScore}
            expLabel={expLabel}
          />
        ) : currentPage === 'client_dashboard' ? (
          <ClientDashboardPage
            users={users}
            clientUserId={clientUserId}
            setClientUserId={setClientUserId}
            handleClientAction={handleClientAction}
            addTelemetry={addTelemetry}
            setCurrentPage={setCurrentPage}
            signupCompleted={signupCompleted}
            onSignup={handleSignup}
            onSignupSkip={() => setSignupCompleted(true)}
          />
        ) : (
          <MarketingPage
            currentPage={currentPage}
            users={users}
            selectedUser={selectedUser}
            handleSelectUser={handleSelectUser}
            pulseTrigger={pulseTrigger}
            setPulseTrigger={setPulseTrigger}
            addTelemetry={addTelemetry}
            scrollToConsole={scrollToConsole}
            consoleRef={consoleRef}
            isDark={isDark}
          />
        )}
      </main>

      {/* Global Footer */}
      <footer className="bg-earth-bg border-t border-earth-sage/35 py-6 text-center text-earth-cocoa/50 text-[10px] select-none mt-auto">
        <p>&copy; 2026 Falcon360 Platform. Helping subscription businesses keep their customers happy.</p>
      </footer>
    </div>
  );
}

export default App;
