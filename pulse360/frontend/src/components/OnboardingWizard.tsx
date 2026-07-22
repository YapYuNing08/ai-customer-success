import { useState, useEffect, useRef } from 'react';
import { Bot, Check, Sparkles, X } from 'lucide-react';

// Scripted triggers for the AI interventions — deterministic by design, not
// behavioral ML. The agent pops up ONLY when one of these fires:
//   • the same control is clicked REPEAT_CLICK_THRESHOLD times (confusion) —
//     fires at most once per step, or
//   • no mouse/click activity for IDLE_TRIGGER_MS while a choice is pending
//     (hesitation) — re-fires every time the customer goes idle again, so a
//     customer who dismisses the guide and keeps hesitating is helped again.
const IDLE_TRIGGER_MS = 5 * 1000;
const REPEAT_CLICK_THRESHOLD = 3;

export const LIFESTYLE_CONFIG = {
  malaysia: {
    label: 'Mostly in Malaysia',
    roaming: 'Off — you\'ll never see surprise roaming charges',
    notifications: 'Standard billing reminders only',
    dataAlerts: 'Alert when you hit 80% of your quota',
  },
  travel: {
    label: 'Travel often',
    roaming: 'On — APAC & Europe pass pre-selected for one-tap activation',
    notifications: 'Trip-aware alerts when you land in a new country',
    dataAlerts: 'Earlier alert at 50% while abroad',
  },
  business: {
    label: 'Business travel',
    roaming: 'On — priority 5G routing abroad',
    notifications: 'Monthly invoice + expense-ready summaries',
    dataAlerts: 'Alert at 70% with auto top-up offer',
  },
  student: {
    label: 'Student',
    roaming: 'Off — student saver mode keeps the bill predictable',
    notifications: 'Budget-friendly deal alerts',
    dataAlerts: 'Alert at 90% + nightly usage recap',
  },
} as const;

export type LifestyleKey = keyof typeof LIFESTYLE_CONFIG;

// Subscription packages offered on the plan step. Prices match the planMrr
// map in App.tsx so revenue figures stay consistent end-to-end.
export const PLAN_OPTIONS = {
  Starter: { price: 50, blurb: '20 GB data · 4G speed · SMS bundle' },
  Growth: { price: 100, blurb: '60 GB data · 5G access · weekend boost' },
  Pro: { price: 200, blurb: 'Unlimited data · 5G priority · hotspot' },
  Enterprise: { price: 500, blurb: 'Unlimited · dedicated support · SLA' },
} as const;

export type PlanKey = keyof typeof PLAN_OPTIONS;

// Profile questions asked BEFORE the plan step — the answers drive the
// AI plan suggestion (deterministic scoring below, no live model call).
export const OCCUPATION_OPTIONS = {
  student: 'Student',
  professional: 'Working professional',
  business: 'Business owner',
  retiree: 'Retiree',
} as const;
export type OccupationKey = keyof typeof OCCUPATION_OPTIONS;

export const DATA_USAGE_OPTIONS = {
  wifi: 'Mostly Wi-Fi',
  mixed: 'A mix of both',
  mobile: 'Mostly mobile data',
} as const;
export type DataUsageKey = keyof typeof DATA_USAGE_OPTIONS;

export const LOCATION_OPTIONS = {
  city: 'City centre',
  suburb: 'Suburban area',
  rural: 'Small town / rural',
} as const;
export type LocationKey = keyof typeof LOCATION_OPTIONS;

// Deterministic plan suggestion from the profile answers. Business owners map
// straight to Enterprise (support + SLA is the selling point, not data volume);
// everyone else is scored on how data-hungry their answers are.
export function recommendPlan(occupation: OccupationKey, dataUsage: DataUsageKey, location: LocationKey): { plan: PlanKey; reason: string } {
  const usageText = {
    wifi: "you're on Wi-Fi most of the time",
    mixed: 'you split your time between Wi-Fi and mobile data',
    mobile: 'you rely on mobile data through the day',
  }[dataUsage];
  const locText = {
    city: 'around the city, where our 5G coverage is strongest',
    suburb: 'in suburban areas',
    rural: 'in smaller towns, where our 4G network is rock-solid',
  }[location];

  if (occupation === 'business') {
    return {
      plan: 'Enterprise',
      reason: `You run a business and ${usageText} ${locText} — Enterprise keeps you unlimited with dedicated support and an SLA, so downtime never costs you money.`,
    };
  }

  const score =
    ({ wifi: 0, mixed: 2, mobile: 4 } as const)[dataUsage] +
    ({ student: 0, retiree: 0, professional: 2, business: 3 } as const)[occupation] +
    ({ rural: 0, suburb: 1, city: 2 } as const)[location];
  const plan: PlanKey = score >= 6 ? 'Pro' : score >= 3 ? 'Growth' : 'Starter';

  const planPitch = {
    Starter: 'Starter covers you comfortably without paying for data you won’t use',
    Growth: 'Growth gives you the best value — plenty of data for streaming and social, with 5G access',
    Pro: 'Pro keeps you unlimited with 5G priority and hotspot, so you never have to ration data',
    Enterprise: 'Enterprise keeps you unlimited with dedicated support',
  }[plan];

  return {
    plan,
    reason: `As a ${OCCUPATION_OPTIONS[occupation].toLowerCase()}, ${usageText} ${locText} — ${planPitch}.`,
  };
}

const TOTAL_STEPS = 5;

export interface WizardResult {
  simChoice: 'physical' | 'esim';
  lifestyle: LifestyleKey;
  plan: PlanKey;
  occupation: OccupationKey;
  dataUsage: DataUsageKey;
  location: LocationKey;
  aiInterventions: number;
  // Present in signup mode only.
  name?: string;
  email?: string;
  phone?: string;
}

interface HelperState {
  topic: 'details' | 'profile' | 'plan' | 'sim' | 'prefs';
  trigger: 'idle' | 'clicks';
}

// Which helper topic the AI agent uses on each wizard step.
const STEP_TOPICS: Record<number, HelperState['topic']> = {
  1: 'details', 2: 'profile', 3: 'plan', 4: 'sim', 5: 'prefs',
};

// mode 'assist': re-run setup for an existing customer (launched from the
// checklist card). mode 'signup': first visit — the wizard doubles as account
// creation, collecting name/email on the welcome step.
export function OnboardingWizard({ customerName, mode = 'assist', onComplete, onClose, addTelemetry }: {
  customerName: string;
  mode?: 'signup' | 'assist';
  onComplete: (result: WizardResult) => void;
  onClose: () => void;
  addTelemetry: (msg: string) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const displayName = mode === 'signup' ? (name.trim() || 'there') : customerName;
  const firstName = displayName.split(' ')[0] || 'there';
  const [step, setStep] = useState(1);
  const [occupation, setOccupation] = useState<OccupationKey | null>(null);
  const [dataUsage, setDataUsage] = useState<DataUsageKey | null>(null);
  const [location, setLocation] = useState<LocationKey | null>(null);
  const [plan, setPlan] = useState<PlanKey | null>(null);
  const [simChoice, setSimChoice] = useState<'physical' | 'esim' | null>(null);
  const [aiRecommendedSim, setAiRecommendedSim] = useState(false);
  const [aiRecommendedPref, setAiRecommendedPref] = useState<LifestyleKey | null>(null);
  const [lifestyle, setLifestyle] = useState<LifestyleKey | null>(null);
  const [interventions, setInterventions] = useState(0);
  const [helper, setHelper] = useState<HelperState | null>(null);
  const helperShown = useRef<Record<HelperState['topic'], boolean>>({ details: false, profile: false, plan: false, sim: false, prefs: false });
  const clickCounts = useRef<Record<string, number>>({});
  const lastActivity = useRef(Date.now());

  const fireHelper = (topic: HelperState['topic'], trigger: 'idle' | 'clicks', detail: string, { once = true } = {}) => {
    // Never stack two popups; the click trigger also respects the once-per-step
    // gate, but the idle trigger passes once:false so it can re-fire on repeated
    // hesitation.
    if (helper || (once && helperShown.current[topic])) return;
    helperShown.current[topic] = true;
    setHelper({ topic, trigger });
    setInterventions(n => n + 1);
    addTelemetry(`Falcon Guide Agent intervened for ${displayName}: ${detail}`);
  };

  // Dismissing the guide counts as activity — restart the idle clock so it
  // takes another full IDLE_TRIGGER_MS of hesitation before it pops again.
  const dismissHelper = () => {
    lastActivity.current = Date.now();
    setHelper(null);
  };

  const emailValid = /^\S+@\S+\.\S+$/.test(email.trim());
  const phoneValid = phone.replace(/\D/g, '').length >= 9;
  const detailsComplete = mode !== 'signup' || (!!name.trim() && emailValid && phoneValid);
  const profileComplete = !!occupation && !!dataUsage && !!location;
  // Plan suggestion derived from the profile answers; available from step 3 on.
  const suggestion = occupation && dataUsage && location ? recommendPlan(occupation, dataUsage, location) : null;

  // The agent watches until the customer ADVANCES the step (clicks Continue /
  // Start Setup / Finish). Picking an option but hesitating to move on still
  // counts as being stuck — so triggers stay armed for the whole step.
  // Confusion trigger: the same control clicked repeatedly on any step.
  const registerClick = (id: string) => {
    lastActivity.current = Date.now();
    clickCounts.current[id] = (clickCounts.current[id] || 0) + 1;
    if (clickCounts.current[id] < REPEAT_CLICK_THRESHOLD) return;
    const topic = STEP_TOPICS[step];
    if (topic && !helperShown.current[topic]) {
      fireHelper(topic, 'clicks', `clicked "${id}" ${clickCounts.current[id]}× on step ${step}.`);
    }
  };

  // Hesitation trigger: no activity for 5s while still on the step.
  useEffect(() => {
    lastActivity.current = Date.now();
    clickCounts.current = {};
    const check = setInterval(() => {
      if (Date.now() - lastActivity.current < IDLE_TRIGGER_MS) return;
      const topic = STEP_TOPICS[step];
      if (topic) fireHelper(topic, 'idle', `idle ${IDLE_TRIGGER_MS / 1000}s on step ${step}.`, { once: false });
    }, 500);
    return () => clearInterval(check);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const config = lifestyle ? LIFESTYLE_CONFIG[lifestyle] : null;

  const selectLifestyle = (key: LifestyleKey) => {
    if (lifestyle === key) return;
    const isFirstPick = !lifestyle;
    setLifestyle(key);
    if (isFirstPick) {
      setInterventions(n => n + 1);
      addTelemetry(`Falcon Guide Agent auto-configured preferences for ${displayName} ("${LIFESTYLE_CONFIG[key].label}").`);
    }
  };

  const radioClass = (selected: boolean) =>
    `flex items-start gap-3 p-4 rounded-xl border text-left cursor-pointer transition-all w-full ${
      selected
        ? 'bg-earth-cocoa text-earth-bg border-earth-cocoa shadow-sm'
        : 'bg-earth-bg/60 text-earth-cocoa border-earth-sage/35 hover:border-earth-clay/50'
    }`;

  const pillClass = (selected: boolean) =>
    `px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
      selected
        ? 'bg-earth-cocoa text-earth-bg border-earth-cocoa shadow-sm'
        : 'bg-earth-bg/60 text-earth-cocoa border-earth-sage/35 hover:border-earth-clay/50'
    }`;

  const aiBadge = (onDark: boolean) => (
    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 whitespace-nowrap ${onDark ? 'bg-earth-bg/20 text-earth-bg' : 'bg-earth-clay/15 text-earth-clay border border-earth-clay/30'}`}>
      <Sparkles className="w-3 h-3 shrink-0" /> AI Recommended
    </span>
  );

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn font-sans"
      onMouseMove={() => { lastActivity.current = Date.now(); }}
    >
      <div className="bg-[#fcfaf2] border-2 border-earth-sage/40 rounded-3xl shadow-2xl max-w-3xl w-full mx-4 my-4 text-left flex flex-col animate-scaleUp text-earth-cocoa overflow-hidden relative max-h-[92vh]">

        {/* Header with agent identity + progress */}
        <div className="flex justify-between items-center px-5 sm:px-8 pt-6 pb-4 border-b border-earth-sage/20 shrink-0">
          <div className="flex items-center gap-3.5">
            <img src="/falcon-icon.png" alt="Falcon Guide Agent" className="w-12 h-12 object-contain shrink-0" />
            <div className="flex flex-col leading-tight">
              <h3 className="text-lg font-extrabold text-earth-cocoa">Falcon Guide Agent</h3>
              <span className="text-[11px] uppercase font-bold text-earth-clay tracking-wider">Guided Setup — Step {step} of {TOTAL_STEPS}</span>
              <div className="flex gap-1.5 mt-2">
                {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(n => (
                  <span key={n} className={`h-1.5 rounded-full transition-all duration-300 ${n <= step ? 'bg-earth-clay w-9' : 'bg-earth-sage/30 w-4'}`} />
                ))}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-earth-sage/15 text-earth-cocoa/60 cursor-pointer transition-all self-start">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step body */}
        <div className="px-5 py-6 sm:px-9 sm:py-9 flex flex-col gap-5 flex-1 overflow-y-auto min-h-0 sm:min-h-[460px]">

          {step === 1 && (
            <div className="flex flex-col gap-4 items-center text-center my-auto">
              <span className="text-5xl">📡</span>
              <h2 className="text-2xl font-extrabold font-serif text-earth-cocoa">Welcome to Falcon360 Telecom!</h2>
              <p className="text-sm text-earth-cocoa/75">Let's get your account ready.</p>
              <span className="text-xs font-bold text-earth-clay bg-earth-clay/10 border border-earth-clay/25 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                Estimated time: 3 minutes
              </span>
              {mode === 'signup' && (
                <div className="flex flex-col gap-2.5 w-full max-w-[340px] mt-1">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => { lastActivity.current = Date.now(); setName(e.target.value); }}
                    className="w-full bg-earth-bg border border-earth-sage/35 rounded-xl px-4 py-3 text-sm text-earth-cocoa font-bold outline-none focus:border-earth-clay placeholder-earth-cocoa/45 text-center"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => { lastActivity.current = Date.now(); setEmail(e.target.value); }}
                    className="w-full bg-earth-bg border border-earth-sage/35 rounded-xl px-4 py-3 text-sm text-earth-cocoa font-bold outline-none focus:border-earth-clay placeholder-earth-cocoa/45 text-center"
                  />
                  <input
                    type="tel"
                    placeholder="Mobile number — +60 12-345 6789"
                    value={phone}
                    onChange={(e) => { lastActivity.current = Date.now(); setPhone(e.target.value); }}
                    className="w-full bg-earth-bg border border-earth-sage/35 rounded-xl px-4 py-3 text-sm text-earth-cocoa font-bold outline-none focus:border-earth-clay placeholder-earth-cocoa/45 text-center"
                  />
                  <span className="text-[11px] text-earth-cocoa/55">We'll use your email for e-billing and your number for the SIM activation. Porting an existing number? Just enter it — we'll handle the transfer.</span>
                </div>
              )}
              {/* Not disabled= so dead-clicks still count toward the confusion
                  trigger — the classic lost-user signal. */}
              <button
                onClick={() => {
                  registerClick('Start Setup');
                  if (detailsComplete) setStep(2);
                }}
                className={`font-extrabold text-sm px-9 py-3 rounded-xl transition-all mt-2 ${
                  !detailsComplete
                    ? 'bg-earth-sage/20 text-earth-cocoa/40 cursor-not-allowed'
                    : 'bg-earth-cocoa hover:bg-earth-clay text-earth-bg cursor-pointer shadow-sm'
                }`}
              >
                Start Setup
              </button>
            </div>
          )}

          {step === 2 && (
            <>
              <div>
                <h2 className="text-lg font-extrabold text-earth-cocoa">Tell Us About You</h2>
                <p className="text-sm text-earth-cocoa/70 mt-1 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-earth-clay" /> Three quick questions so I can suggest the right plan for you.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-earth-cocoa/70">What best describes you?</span>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(OCCUPATION_OPTIONS) as OccupationKey[]).map(key => (
                    <button key={key} className={pillClass(occupation === key)} onClick={() => { registerClick(OCCUPATION_OPTIONS[key]); setOccupation(key); }}>
                      {OCCUPATION_OPTIONS[key]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-earth-cocoa/70">How do you usually get online?</span>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(DATA_USAGE_OPTIONS) as DataUsageKey[]).map(key => (
                    <button key={key} className={pillClass(dataUsage === key)} onClick={() => { registerClick(DATA_USAGE_OPTIONS[key]); setDataUsage(key); }}>
                      {DATA_USAGE_OPTIONS[key]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-earth-cocoa/70">Where do you usually stay?</span>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(LOCATION_OPTIONS) as LocationKey[]).map(key => (
                    <button key={key} className={pillClass(location === key)} onClick={() => { registerClick(LOCATION_OPTIONS[key]); setLocation(key); }}>
                      {LOCATION_OPTIONS[key]}
                    </button>
                  ))}
                </div>
              </div>
              {/* Not disabled= so clicks on the "inactive" button still count
                  toward the confusion trigger — the classic lost-user signal. */}
              <button
                onClick={() => {
                  registerClick('Continue');
                  if (profileComplete) setStep(3);
                }}
                className={`font-extrabold text-sm px-7 py-3 rounded-xl transition-all mt-auto ${
                  profileComplete
                    ? 'bg-earth-cocoa hover:bg-earth-clay text-earth-bg cursor-pointer shadow-sm'
                    : 'bg-earth-sage/20 text-earth-cocoa/40 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <h2 className="text-lg font-extrabold text-earth-cocoa">Choose Your Package</h2>
                <p className="text-sm text-earth-cocoa/70 mt-1 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-earth-clay" /> Pick a plan — you can change it anytime, no lock-in.
                </p>
              </div>
              {suggestion && (
                <div className="bg-earth-clay/8 border border-earth-clay/25 rounded-xl p-3.5 flex flex-col gap-2 animate-fadeIn">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-earth-clay flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> AI Suggestion: {suggestion.plan} — RM{PLAN_OPTIONS[suggestion.plan].price}/mo
                  </span>
                  <p className="text-xs text-earth-cocoa leading-relaxed">{suggestion.reason}</p>
                  {plan !== suggestion.plan && (
                    <button
                      onClick={() => {
                        registerClick('Use suggested plan');
                        setPlan(suggestion.plan);
                        addTelemetry(`Falcon Guide Agent suggested the ${suggestion.plan} plan to ${displayName} (profile-based).`);
                      }}
                      className="self-start bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-extrabold text-xs px-3.5 py-2 rounded-lg transition-all cursor-pointer"
                    >
                      Use suggested plan
                    </button>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(Object.keys(PLAN_OPTIONS) as PlanKey[]).map(key => (
                  <button
                    key={key}
                    className={radioClass(plan === key)}
                    onClick={() => { registerClick(`${key} plan`); setPlan(key); }}
                  >
                    <span className="text-sm font-bold leading-tight flex flex-col items-start gap-1 min-w-0 w-full">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1 w-full">
                        {key}
                        {suggestion?.plan === key && aiBadge(plan === key)}
                      </span>
                      <span className={`text-base font-extrabold ${plan === key ? 'text-earth-bg' : 'text-earth-clay'}`}>RM{PLAN_OPTIONS[key].price}/mo</span>
                      <span className={`text-[11px] font-medium leading-snug ${plan === key ? 'text-earth-bg/80' : 'text-earth-cocoa/65'}`}>{PLAN_OPTIONS[key].blurb}</span>
                    </span>
                  </button>
                ))}
              </div>
              {/* Not disabled= so clicks on the "inactive" button still count
                  toward the confusion trigger — the classic lost-user signal. */}
              <button
                onClick={() => {
                  registerClick('Continue');
                  if (plan) setStep(4);
                }}
                className={`font-extrabold text-sm px-7 py-3 rounded-xl transition-all mt-auto ${
                  plan
                    ? 'bg-earth-cocoa hover:bg-earth-clay text-earth-bg cursor-pointer shadow-sm'
                    : 'bg-earth-sage/20 text-earth-cocoa/40 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </>
          )}

          {step === 4 && (
            <>
              <div>
                <h2 className="text-lg font-extrabold text-earth-cocoa">Activate SIM</h2>
                <p className="text-sm text-earth-cocoa/70 mt-1">Choose activation</p>
              </div>
              <div className="flex flex-col gap-3">
                <button className={radioClass(simChoice === 'physical')} onClick={() => { registerClick('Physical SIM'); setSimChoice('physical'); }}>
                  <span className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${simChoice === 'physical' ? 'border-earth-bg' : 'border-earth-sage'}`}>
                    {simChoice === 'physical' && <span className="w-2.5 h-2.5 rounded-full bg-earth-bg" />}
                  </span>
                  <span className="text-sm font-bold">Physical SIM</span>
                </button>
                <button className={radioClass(simChoice === 'esim')} onClick={() => { registerClick('eSIM'); setSimChoice('esim'); }}>
                  <span className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${simChoice === 'esim' ? 'border-earth-bg' : 'border-earth-sage'}`}>
                    {simChoice === 'esim' && <span className="w-2.5 h-2.5 rounded-full bg-earth-bg" />}
                  </span>
                  <span className="text-sm font-bold flex items-center gap-2">
                    eSIM
                    {aiRecommendedSim && aiBadge(simChoice === 'esim')}
                  </span>
                </button>
              </div>
              {/* Not disabled= so clicks on the "inactive" button still count
                  toward the confusion trigger — the classic lost-user signal. */}
              <button
                onClick={() => {
                  registerClick('Continue');
                  if (simChoice) setStep(5);
                }}
                className={`font-extrabold text-sm px-7 py-3 rounded-xl transition-all mt-auto ${
                  simChoice
                    ? 'bg-earth-cocoa hover:bg-earth-clay text-earth-bg cursor-pointer shadow-sm'
                    : 'bg-earth-sage/20 text-earth-cocoa/40 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </>
          )}

          {step === 5 && (
            <>
              <div>
                <h2 className="text-lg font-extrabold text-earth-cocoa">Configure Preferences</h2>
                <p className="text-sm text-earth-cocoa/70 mt-1 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-earth-clay" /> Where do you usually use your phone?
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(Object.keys(LIFESTYLE_CONFIG) as LifestyleKey[]).map(key => (
                  <button
                    key={key}
                    className={radioClass(lifestyle === key)}
                    onClick={() => { registerClick(LIFESTYLE_CONFIG[key].label); selectLifestyle(key); }}
                  >
                    <span className="text-sm font-bold leading-tight flex flex-wrap items-center gap-x-2 gap-y-1 w-full min-w-0">
                      {LIFESTYLE_CONFIG[key].label}
                      {aiRecommendedPref === key && aiBadge(lifestyle === key)}
                    </span>
                  </button>
                ))}
              </div>

              {config && (
                <div className="bg-earth-clay/8 border border-earth-clay/25 rounded-xl p-4 flex flex-col gap-2.5 animate-fadeIn">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-earth-clay flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> AI configured for you
                  </span>
                  {[
                    ['Roaming', config.roaming],
                    ['Notifications', config.notifications],
                    ['Data alerts', config.dataAlerts],
                  ].map(([name, value]) => (
                    <div key={name} className="flex items-start gap-2 text-xs text-earth-cocoa leading-relaxed">
                      <Check className="w-3.5 h-3.5 text-[#276B2B] mt-0.5 shrink-0" />
                      <span><strong>{name}:</strong> {value}</span>
                    </div>
                  ))}
                  <span className="text-[11px] text-earth-cocoa/55">You can change any of these later in Settings.</span>
                </div>
              )}

              <button
                onClick={() => {
                  registerClick('Finish Setup');
                  if (lifestyle) {
                    onComplete({
                      simChoice: simChoice || 'esim',
                      lifestyle,
                      plan: plan || 'Starter',
                      occupation: occupation || 'professional',
                      dataUsage: dataUsage || 'mixed',
                      location: location || 'city',
                      aiInterventions: interventions,
                      ...(mode === 'signup' ? { name: name.trim(), email: email.trim(), phone: phone.trim() } : {})
                    });
                  }
                }}
                className={`font-extrabold text-sm px-7 py-3 rounded-xl transition-all mt-auto ${
                  lifestyle
                    ? 'bg-earth-cocoa hover:bg-earth-clay text-earth-bg cursor-pointer shadow-sm'
                    : 'bg-earth-sage/20 text-earth-cocoa/40 cursor-not-allowed'
                }`}
              >
                Finish Setup
              </button>
            </>
          )}
        </div>

        {/* AI monitoring strip — makes the scripted agent visible for the demo */}
        <div className="px-5 sm:px-9 py-3 bg-earth-cocoa/5 border-t border-earth-sage/20 flex items-center gap-4 text-[11px] font-bold text-earth-cocoa/60 shrink-0">
          <span className="flex items-center gap-2 text-earth-clay">
            <img src="/falcon-icon.png" alt="Falcon Guide Agent" className="w-5 h-5 object-contain" />
            Falcon Guide Agent monitoring
            <span className="w-2 h-2 rounded-full bg-[#276B2B] animate-pulse" />
          </span>
        </div>

        {/* AI intervention popup — appears ONLY when a trigger fires */}
        {helper && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center animate-fadeIn rounded-3xl">
            <div className="bg-[#fcfaf2] border-2 border-earth-clay/50 rounded-2xl p-6 max-w-[380px] w-full mx-4 flex flex-col gap-3.5 animate-agentPop agent-glow">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-xl shrink-0 bg-earth-clay/10 border border-earth-clay/25 relative">
                  <img src="/falcon-icon.png" alt="Falcon Guide Agent" className="w-9 h-9 object-contain" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#276B2B] border-2 border-[#fcfaf2] animate-pulse" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-earth-clay">Falcon Guide Agent</span>
                  <h3 className="font-extrabold text-base leading-tight">👋 Hi {firstName}!</h3>
                  <p className="text-xs text-earth-cocoa/75 mt-1">
                    {helper.trigger === 'clicks'
                      ? "Looks like that button isn't doing what you expected — let me help."
                      : helper.topic === 'details'
                        ? 'Need a hand getting started?'
                        : helper.topic === 'profile'
                          ? 'Wondering why I ask? These answers help me find your best-fit plan.'
                          : 'Need help choosing?'}
                  </p>
                </div>
              </div>

              {helper.topic === 'details' ? (
                <div className="bg-earth-bg/60 border border-earth-sage/25 rounded-xl p-3 text-[11px] text-earth-cocoa leading-relaxed">
                  <span className="font-extrabold text-xs block mb-1">Just three things to get you connected</span>
                  • <strong>Name</strong> — how we'll address you on your account<br />
                  • <strong>Email</strong> — for your e-bill and account recovery<br />
                  • <strong>Mobile number</strong> — the number to activate (or port over from your current provider)<br />
                  <span className="block mt-1 text-earth-cocoa/65">Your details stay private — we only use them to set up your line.</span>
                </div>
              ) : helper.topic === 'profile' ? (
                <div className="bg-earth-bg/60 border border-earth-sage/25 rounded-xl p-3 text-[11px] text-earth-cocoa leading-relaxed">
                  <span className="font-extrabold text-xs block mb-1">Why I'm asking</span>
                  • <strong>What you do</strong> — students & retirees usually need lighter plans; businesses need support & SLA<br />
                  • <strong>Wi-Fi vs mobile data</strong> — the biggest driver of how much data you actually need<br />
                  • <strong>Where you stay</strong> — matches you to our 5G or 4G coverage strengths<br />
                  <span className="block mt-1 text-earth-cocoa/65">Answer all three and I'll suggest a plan on the next step — nothing is locked in.</span>
                </div>
              ) : helper.topic === 'plan' ? (
                <div className="bg-earth-bg/60 border border-earth-sage/25 rounded-xl p-3 text-[11px] text-earth-cocoa leading-relaxed">
                  <span className="font-extrabold text-xs block mb-1">Quick guide</span>
                  • <strong>Starter</strong> — light use, mostly Wi-Fi<br />
                  • <strong>Growth</strong> — everyday streaming & social, best value<br />
                  • <strong>Pro</strong> — heavy data, hotspot, 5G priority<br />
                  • <strong>Enterprise</strong> — teams & business accounts<br />
                  <span className="block mt-1 text-earth-cocoa/65">
                    {suggestion
                      ? `Based on your answers, ${suggestion.plan} looks like your best fit — you can switch plans anytime with no penalty.`
                      : 'Most new customers start on Growth — you can switch plans anytime with no penalty.'}
                  </span>
                </div>
              ) : helper.topic === 'sim' ? (
                <div className="grid grid-cols-2 gap-2.5 text-[11px] text-earth-cocoa leading-relaxed">
                  <div className="bg-earth-bg/60 border border-earth-sage/25 rounded-xl p-3">
                    <span className="font-extrabold text-xs block mb-1">Physical SIM</span>
                    • Insert into phone<br />
                    • Better for switching devices
                  </div>
                  <div className="bg-earth-bg/60 border border-earth-sage/25 rounded-xl p-3">
                    <span className="font-extrabold text-xs block mb-1">eSIM</span>
                    • No physical card<br />
                    • Activate instantly<br />
                    • Great for newer phones
                  </div>
                </div>
              ) : (
                <div className="bg-earth-bg/60 border border-earth-sage/25 rounded-xl p-3 text-[11px] text-earth-cocoa leading-relaxed">
                  <span className="font-extrabold text-xs block mb-1">Quick guide</span>
                  • <strong>Mostly in Malaysia</strong> — local use, roaming stays off<br />
                  • <strong>Travel often</strong> — roaming pass ready when you land<br />
                  • <strong>Business travel</strong> — priority 5G + expense summaries<br />
                  • <strong>Student</strong> — saver mode, predictable bill<br />
                  <span className="block mt-1 text-earth-cocoa/65">Whatever you pick, I'll configure roaming, notifications and data alerts to match — you can change them anytime.</span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {helper.topic !== 'details' && helper.topic !== 'profile' && (
                <button
                  onClick={() => {
                    if (helper.topic === 'plan') {
                      const recommended = suggestion?.plan || 'Growth';
                      setPlan(recommended);
                      addTelemetry(`Falcon Guide Agent recommended the ${recommended} plan to ${displayName}.`);
                    } else if (helper.topic === 'sim') {
                      setSimChoice('esim');
                      setAiRecommendedSim(true);
                      addTelemetry(`Falcon Guide Agent recommended eSIM to ${displayName}.`);
                    } else {
                      setAiRecommendedPref('malaysia');
                      selectLifestyle('malaysia');
                      addTelemetry(`Falcon Guide Agent recommended "Mostly in Malaysia" defaults to ${displayName}.`);
                    }
                    dismissHelper();
                  }}
                  className="w-full bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Recommend for me
                </button>
                )}
                <button
                  onClick={dismissHelper}
                  className="w-full bg-transparent hover:bg-earth-sage/10 text-earth-cocoa/70 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer border border-earth-sage/30"
                >
                  {helper.topic === 'details' || helper.topic === 'profile' ? 'Got it, thanks' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
