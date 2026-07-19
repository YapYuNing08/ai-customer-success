import { useState, useEffect, useRef } from 'react';
import { Bot, Check, Sparkles, X } from 'lucide-react';

// Scripted triggers for the AI interventions — deterministic by design, not
// behavioral ML. The agent pops up ONLY when one of these fires:
//   • the same control is clicked REPEAT_CLICK_THRESHOLD times (confusion), or
//   • no mouse/click activity for IDLE_TRIGGER_MS while a choice is pending
//     (hesitation). Each step's helper fires at most once.
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
  Starter: { price: 400, blurb: '20 GB data · 4G speed · SMS bundle' },
  Growth: { price: 800, blurb: '60 GB data · 5G access · weekend boost' },
  Pro: { price: 1200, blurb: 'Unlimited data · 5G priority · hotspot' },
  Enterprise: { price: 4000, blurb: 'Unlimited · dedicated support · SLA' },
} as const;

export type PlanKey = keyof typeof PLAN_OPTIONS;

const TOTAL_STEPS = 4;

export interface WizardResult {
  simChoice: 'physical' | 'esim';
  lifestyle: LifestyleKey;
  plan: PlanKey;
  aiInterventions: number;
  // Present in signup mode only.
  name?: string;
  email?: string;
  phone?: string;
}

interface HelperState {
  topic: 'details' | 'plan' | 'sim' | 'prefs';
  trigger: 'idle' | 'clicks';
}

// Which helper topic the AI agent uses on each wizard step.
const STEP_TOPICS: Record<number, HelperState['topic']> = {
  1: 'details', 2: 'plan', 3: 'sim', 4: 'prefs',
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
  const [plan, setPlan] = useState<PlanKey | null>(null);
  const [aiRecommendedPlan, setAiRecommendedPlan] = useState(false);
  const [simChoice, setSimChoice] = useState<'physical' | 'esim' | null>(null);
  const [aiRecommendedSim, setAiRecommendedSim] = useState(false);
  const [aiRecommendedPref, setAiRecommendedPref] = useState<LifestyleKey | null>(null);
  const [lifestyle, setLifestyle] = useState<LifestyleKey | null>(null);
  const [interventions, setInterventions] = useState(0);
  const [helper, setHelper] = useState<HelperState | null>(null);
  const helperShown = useRef<Record<HelperState['topic'], boolean>>({ details: false, plan: false, sim: false, prefs: false });
  const clickCounts = useRef<Record<string, number>>({});
  const lastActivity = useRef(Date.now());

  const fireHelper = (topic: HelperState['topic'], trigger: 'idle' | 'clicks', detail: string) => {
    if (helperShown.current[topic] || helper) return;
    helperShown.current[topic] = true;
    setHelper({ topic, trigger });
    setInterventions(n => n + 1);
    addTelemetry(`AI Onboarding Agent intervened for ${displayName}: ${detail}`);
  };

  const emailValid = /^\S+@\S+\.\S+$/.test(email.trim());
  const phoneValid = phone.replace(/\D/g, '').length >= 9;
  const detailsComplete = mode !== 'signup' || (!!name.trim() && emailValid && phoneValid);

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
      if (topic) fireHelper(topic, 'idle', `idle ${IDLE_TRIGGER_MS / 1000}s on step ${step}.`);
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
      addTelemetry(`AI Onboarding Agent auto-configured preferences for ${displayName} ("${LIFESTYLE_CONFIG[key].label}").`);
    }
  };

  const radioClass = (selected: boolean) =>
    `flex items-start gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all w-full ${
      selected
        ? 'bg-earth-cocoa text-earth-bg border-earth-cocoa shadow-sm'
        : 'bg-earth-bg/60 text-earth-cocoa border-earth-sage/35 hover:border-earth-clay/50'
    }`;

  const aiBadge = (onDark: boolean) => (
    <span className={`text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${onDark ? 'bg-earth-bg/20 text-earth-bg' : 'bg-earth-clay/15 text-earth-clay border border-earth-clay/30'}`}>
      <Sparkles className="w-2.5 h-2.5" /> AI Recommended
    </span>
  );

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn font-sans"
      onMouseMove={() => { lastActivity.current = Date.now(); }}
    >
      <div className="bg-[#fcfaf2] border-2 border-earth-sage/40 rounded-3xl shadow-2xl max-w-2xl w-full mx-4 text-left flex flex-col animate-scaleUp text-earth-cocoa overflow-hidden relative">

        {/* Header with progress */}
        <div className="flex justify-between items-center px-6 pt-5 pb-3 border-b border-earth-sage/20">
          <div>
            <span className="text-[9px] uppercase font-bold text-earth-clay tracking-wider">Guided Setup — Step {step} of {TOTAL_STEPS}</span>
            <div className="flex gap-1.5 mt-1.5">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(n => (
                <span key={n} className={`h-1.5 rounded-full transition-all duration-300 ${n <= step ? 'bg-earth-clay w-8' : 'bg-earth-sage/30 w-4'}`} />
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-earth-sage/15 text-earth-cocoa/60 cursor-pointer transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step body */}
        <div className="px-8 py-8 flex flex-col gap-4 min-h-[400px]">

          {step === 1 && (
            <div className="flex flex-col gap-4 items-center text-center my-auto">
              <span className="text-3xl">📡</span>
              <h2 className="text-xl font-extrabold font-serif text-earth-cocoa">Welcome to Falcon360 Telecom!</h2>
              <p className="text-xs text-earth-cocoa/75">Let's get your account ready.</p>
              <span className="text-[10px] font-bold text-earth-clay bg-earth-clay/10 border border-earth-clay/25 px-3 py-1 rounded-full uppercase tracking-wider">
                Estimated time: 3 minutes
              </span>
              {mode === 'signup' && (
                <div className="flex flex-col gap-2 w-full max-w-[280px] mt-1">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => { lastActivity.current = Date.now(); setName(e.target.value); }}
                    className="w-full bg-earth-bg border border-earth-sage/35 rounded-xl px-3.5 py-2.5 text-xs text-earth-cocoa font-bold outline-none focus:border-earth-clay placeholder-earth-cocoa/45 text-center"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => { lastActivity.current = Date.now(); setEmail(e.target.value); }}
                    className="w-full bg-earth-bg border border-earth-sage/35 rounded-xl px-3.5 py-2.5 text-xs text-earth-cocoa font-bold outline-none focus:border-earth-clay placeholder-earth-cocoa/45 text-center"
                  />
                  <input
                    type="tel"
                    placeholder="Mobile number — +60 12-345 6789"
                    value={phone}
                    onChange={(e) => { lastActivity.current = Date.now(); setPhone(e.target.value); }}
                    className="w-full bg-earth-bg border border-earth-sage/35 rounded-xl px-3.5 py-2.5 text-xs text-earth-cocoa font-bold outline-none focus:border-earth-clay placeholder-earth-cocoa/45 text-center"
                  />
                  <span className="text-[9px] text-earth-cocoa/55">We'll use your email for e-billing and your number for the SIM activation. Porting an existing number? Just enter it — we'll handle the transfer.</span>
                </div>
              )}
              {/* Not disabled= so dead-clicks still count toward the confusion
                  trigger — the classic lost-user signal. */}
              <button
                onClick={() => {
                  registerClick('Start Setup');
                  if (detailsComplete) setStep(2);
                }}
                className={`font-extrabold text-xs px-8 py-2.5 rounded-xl transition-all mt-2 ${
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
                <h2 className="text-base font-extrabold text-earth-cocoa">Choose Your Package</h2>
                <p className="text-xs text-earth-cocoa/70 mt-1 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-earth-clay" /> Pick a plan — you can change it anytime, no lock-in.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(PLAN_OPTIONS) as PlanKey[]).map(key => (
                  <button
                    key={key}
                    className={radioClass(plan === key)}
                    onClick={() => { registerClick(`${key} plan`); setPlan(key); }}
                  >
                    <span className="text-[11px] font-bold leading-tight flex flex-col items-start gap-1">
                      <span className="flex items-center gap-2">
                        {key}
                        {aiRecommendedPlan && key === 'Growth' && aiBadge(plan === key)}
                      </span>
                      <span className={`text-[13px] font-extrabold ${plan === key ? 'text-earth-bg' : 'text-earth-clay'}`}>RM{PLAN_OPTIONS[key].price}/mo</span>
                      <span className={`text-[9px] font-medium leading-snug ${plan === key ? 'text-earth-bg/80' : 'text-earth-cocoa/65'}`}>{PLAN_OPTIONS[key].blurb}</span>
                    </span>
                  </button>
                ))}
              </div>
              {/* Not disabled= so clicks on the "inactive" button still count
                  toward the confusion trigger — the classic lost-user signal. */}
              <button
                onClick={() => {
                  registerClick('Continue');
                  if (plan) setStep(3);
                }}
                className={`font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all mt-auto ${
                  plan
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
                <h2 className="text-base font-extrabold text-earth-cocoa">Activate SIM</h2>
                <p className="text-xs text-earth-cocoa/70 mt-1">Choose activation</p>
              </div>
              <div className="flex flex-col gap-2.5">
                <button className={radioClass(simChoice === 'physical')} onClick={() => { registerClick('Physical SIM'); setSimChoice('physical'); }}>
                  <span className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${simChoice === 'physical' ? 'border-earth-bg' : 'border-earth-sage'}`}>
                    {simChoice === 'physical' && <span className="w-2 h-2 rounded-full bg-earth-bg" />}
                  </span>
                  <span className="text-xs font-bold">Physical SIM</span>
                </button>
                <button className={radioClass(simChoice === 'esim')} onClick={() => { registerClick('eSIM'); setSimChoice('esim'); }}>
                  <span className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${simChoice === 'esim' ? 'border-earth-bg' : 'border-earth-sage'}`}>
                    {simChoice === 'esim' && <span className="w-2 h-2 rounded-full bg-earth-bg" />}
                  </span>
                  <span className="text-xs font-bold flex items-center gap-2">
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
                  if (simChoice) setStep(4);
                }}
                className={`font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all mt-auto ${
                  simChoice
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
                <h2 className="text-base font-extrabold text-earth-cocoa">Configure Preferences</h2>
                <p className="text-xs text-earth-cocoa/70 mt-1 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-earth-clay" /> Where do you usually use your phone?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(LIFESTYLE_CONFIG) as LifestyleKey[]).map(key => (
                  <button
                    key={key}
                    className={radioClass(lifestyle === key)}
                    onClick={() => { registerClick(LIFESTYLE_CONFIG[key].label); selectLifestyle(key); }}
                  >
                    <span className="text-[11px] font-bold leading-tight flex flex-col items-start gap-1">
                      {LIFESTYLE_CONFIG[key].label}
                      {aiRecommendedPref === key && aiBadge(lifestyle === key)}
                    </span>
                  </button>
                ))}
              </div>

              {config && (
                <div className="bg-earth-clay/8 border border-earth-clay/25 rounded-xl p-3.5 flex flex-col gap-2 animate-fadeIn">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-earth-clay flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> AI configured for you
                  </span>
                  {[
                    ['Roaming', config.roaming],
                    ['Notifications', config.notifications],
                    ['Data alerts', config.dataAlerts],
                  ].map(([name, value]) => (
                    <div key={name} className="flex items-start gap-2 text-[10px] text-earth-cocoa leading-relaxed">
                      <Check className="w-3 h-3 text-[#276B2B] mt-0.5 shrink-0" />
                      <span><strong>{name}:</strong> {value}</span>
                    </div>
                  ))}
                  <span className="text-[9px] text-earth-cocoa/55">You can change any of these later in Settings.</span>
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
                      aiInterventions: interventions,
                      ...(mode === 'signup' ? { name: name.trim(), email: email.trim(), phone: phone.trim() } : {})
                    });
                  }
                }}
                className={`font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all mt-auto ${
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
        <div className="px-8 py-2.5 bg-earth-cocoa/5 border-t border-earth-sage/20 flex items-center gap-4 text-[9px] font-bold text-earth-cocoa/60">
          <span className="flex items-center gap-1.5 text-earth-clay">
            <Bot className="w-3 h-3" />
            AI Onboarding Success Agent monitoring
            <span className="w-1.5 h-1.5 rounded-full bg-[#276B2B] animate-pulse" />
          </span>
        </div>

        {/* AI intervention popup — appears ONLY when a trigger fires */}
        {helper && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center animate-fadeIn rounded-3xl">
            <div className="bg-[#fcfaf2] border-2 border-earth-clay/50 rounded-2xl p-5 max-w-[320px] w-full mx-4 flex flex-col gap-3 animate-agentPop agent-glow">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl shrink-0 bg-earth-clay/10 text-earth-clay border border-earth-clay/25 relative">
                  <Bot className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#276B2B] border-2 border-[#fcfaf2] animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm leading-tight">👋 Hi {firstName}!</h3>
                  <p className="text-[11px] text-earth-cocoa/75 mt-1">
                    {helper.trigger === 'clicks'
                      ? "Looks like that button isn't doing what you expected — let me help."
                      : helper.topic === 'details'
                        ? 'Need a hand getting started?'
                        : 'Need help choosing?'}
                  </p>
                </div>
              </div>

              {helper.topic === 'details' ? (
                <div className="bg-earth-bg/60 border border-earth-sage/25 rounded-xl p-2.5 text-[9px] text-earth-cocoa leading-relaxed">
                  <span className="font-extrabold text-[10px] block mb-1">Just three things to get you connected</span>
                  • <strong>Name</strong> — how we'll address you on your account<br />
                  • <strong>Email</strong> — for your e-bill and account recovery<br />
                  • <strong>Mobile number</strong> — the number to activate (or port over from your current provider)<br />
                  <span className="block mt-1 text-earth-cocoa/65">Your details stay private — we only use them to set up your line.</span>
                </div>
              ) : helper.topic === 'plan' ? (
                <div className="bg-earth-bg/60 border border-earth-sage/25 rounded-xl p-2.5 text-[9px] text-earth-cocoa leading-relaxed">
                  <span className="font-extrabold text-[10px] block mb-1">Quick guide</span>
                  • <strong>Starter</strong> — light use, mostly Wi-Fi<br />
                  • <strong>Growth</strong> — everyday streaming & social, best value<br />
                  • <strong>Pro</strong> — heavy data, hotspot, 5G priority<br />
                  • <strong>Enterprise</strong> — teams & business accounts<br />
                  <span className="block mt-1 text-earth-cocoa/65">Most new customers start on Growth — you can switch plans anytime with no penalty.</span>
                </div>
              ) : helper.topic === 'sim' ? (
                <div className="grid grid-cols-2 gap-2 text-[9px] text-earth-cocoa leading-relaxed">
                  <div className="bg-earth-bg/60 border border-earth-sage/25 rounded-xl p-2.5">
                    <span className="font-extrabold text-[10px] block mb-1">Physical SIM</span>
                    • Insert into phone<br />
                    • Better for switching devices
                  </div>
                  <div className="bg-earth-bg/60 border border-earth-sage/25 rounded-xl p-2.5">
                    <span className="font-extrabold text-[10px] block mb-1">eSIM</span>
                    • No physical card<br />
                    • Activate instantly<br />
                    • Great for newer phones
                  </div>
                </div>
              ) : (
                <div className="bg-earth-bg/60 border border-earth-sage/25 rounded-xl p-2.5 text-[9px] text-earth-cocoa leading-relaxed">
                  <span className="font-extrabold text-[10px] block mb-1">Quick guide</span>
                  • <strong>Mostly in Malaysia</strong> — local use, roaming stays off<br />
                  • <strong>Travel often</strong> — roaming pass ready when you land<br />
                  • <strong>Business travel</strong> — priority 5G + expense summaries<br />
                  • <strong>Student</strong> — saver mode, predictable bill<br />
                  <span className="block mt-1 text-earth-cocoa/65">Whatever you pick, I'll configure roaming, notifications and data alerts to match — you can change them anytime.</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                {helper.topic !== 'details' && (
                <button
                  onClick={() => {
                    if (helper.topic === 'plan') {
                      setPlan('Growth');
                      setAiRecommendedPlan(true);
                      addTelemetry(`AI Onboarding Agent recommended the Growth plan to ${displayName}.`);
                    } else if (helper.topic === 'sim') {
                      setSimChoice('esim');
                      setAiRecommendedSim(true);
                      addTelemetry(`AI Onboarding Agent recommended eSIM to ${displayName}.`);
                    } else {
                      setAiRecommendedPref('malaysia');
                      selectLifestyle('malaysia');
                      addTelemetry(`AI Onboarding Agent recommended "Mostly in Malaysia" defaults to ${displayName}.`);
                    }
                    setHelper(null);
                  }}
                  className="w-full bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-extrabold text-[11px] py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3" /> Recommend for me
                </button>
                )}
                <button
                  onClick={() => setHelper(null)}
                  className="w-full bg-transparent hover:bg-earth-sage/10 text-earth-cocoa/70 font-bold text-[11px] py-1.5 rounded-xl transition-all cursor-pointer border border-earth-sage/30"
                >
                  {helper.topic === 'details' ? 'Got it, thanks' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
