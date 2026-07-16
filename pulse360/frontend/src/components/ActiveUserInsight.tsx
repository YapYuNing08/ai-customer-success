import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, TrendingDown, TrendingUp, UserCheck, 
  Clock, CreditCard, MessageSquare, DollarSign, CheckCircle, 
  Copy, Zap, BookOpen, HeartHandshake, ShieldAlert, Cpu
} from 'lucide-react';
import { type ActiveUser } from '../utils/mockData';
import { getRecommendation, simulate } from '../lib/api';

interface ActiveUserInsightProps {
  user: ActiveUser;
  onBack: () => void;
  onUpdateUser: (updatedUser: ActiveUser) => void;
}

export const ActiveUserInsight: React.FC<ActiveUserInsightProps> = ({ user, onBack, onUpdateUser }) => {
  const [copied, setCopied] = useState(false);
  const [activePlaybook, setActivePlaybook] = useState<string | null>(null);

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

  // What-If Simulator Levers State
  const [simLevers, setSimLevers] = useState({
    login_frequency: 3.5,
    feature_usage: 0.5,
    monthly_usage_pct: Math.round(user.metrics.usageVelocity * 100),
    support_ticket_count: user.metrics.failedPayments > 0 ? 3 : 1,
    feedback_score: user.healthScore > 70 ? 8.5 : 5.8,
    payment_status: user.metrics.failedPayments > 0 ? 'past_due' : 'active'
  });

  const [simResult, setSimResult] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);

  const runSimulation = () => {
    setSimLoading(true);
    setSimError(null);
    simulate(user.id, {
      login_frequency: Number(simLevers.login_frequency),
      feature_usage: Number(simLevers.feature_usage),
      monthly_usage_pct: Number(simLevers.monthly_usage_pct),
      support_ticket_count: parseInt(String(simLevers.support_ticket_count)),
      feedback_score: Number(simLevers.feedback_score),
      payment_status: simLevers.payment_status
    })
      .then((res) => {
        setSimResult(res);
      })
      .catch((err) => {
        setSimError('Failed to calculate simulation on backend FastAPI.');
        console.error(err);
      })
      .finally(() => {
        setSimLoading(false);
      });
  };

  // Quick Action triggers (Value Injections)
  const handleAction = (actionType: 'grace_period' | 'training' | 'discount' | 'csm_call') => {
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
          details: 'Manual 14-day billing grace period extended by CSM.'
        });
        message = 'Applied 14-day billing grace period. Lock-out disabled.';
        break;
      case 'training':
        updatedUser.metrics.featureAdoption = Math.min(1.0, updatedUser.metrics.featureAdoption + 0.3);
        updatedUser.warningFlags = updatedUser.warningFlags.filter(f => f !== 'Low Feature Adoption');
        updatedUser.churnProbability = Math.max(0, updatedUser.churnProbability - 15);
        updatedUser.healthScore = Math.min(100, updatedUser.healthScore + 15);
        updatedUser.activityLogs.unshift({
          date: new Date().toISOString().split('T')[0],
          type: 'feature_use',
          details: 'Guided video tutorials and feature docs package sent to customer.'
        });
        message = 'Emailed guided feature tutorials. Feature adoption updated (+30%).';
        break;
      case 'discount':
        updatedUser.churnProbability = Math.max(0, updatedUser.churnProbability - 20);
        updatedUser.healthScore = Math.min(100, updatedUser.healthScore + 10);
        updatedUser.activityLogs.unshift({
          date: new Date().toISOString().split('T')[0],
          type: 'support_resolve',
          details: 'Offered 20% loyalty discount for the next 3 months.'
        });
        message = 'Offered 20% loyalty discount for 3 months to prevent churn.';
        break;
      case 'csm_call':
        updatedUser.metrics.frictionIndex = Math.max(0, updatedUser.metrics.frictionIndex - 3.5);
        updatedUser.warningFlags = updatedUser.warningFlags.filter(f => f !== 'Unresolved Tickets');
        updatedUser.churnProbability = Math.max(0, updatedUser.churnProbability - 18);
        updatedUser.healthScore = Math.min(100, updatedUser.healthScore + 15);
        updatedUser.activityLogs.unshift({
          date: new Date().toISOString().split('T')[0],
          type: 'support_resolve',
          details: 'Direct CSM feedback sync call scheduled.'
        });
        message = 'Urgent CSM outreach call scheduled. Support tickets flagged for priority review.';
        break;
    }

    onUpdateUser(updatedUser);
    setActivePlaybook(message);
    setTimeout(() => setActivePlaybook(null), 4000);
  };

  // Generate Email Text based on Churn Indicators
  const generateEmailDraft = () => {
    const isBillingFail = user.warningFlags.includes('Failed Payment');
    const isLowUsage = user.warningFlags.includes('Usage Decay') || user.warningFlags.includes('Low Feature Adoption');
    
    let subject = `Optimizing your experience with SubSentry`;
    let body = `Hi ${user.name.split(' ')[0]},\n\nI'm checking in from the SubSentry team. We noticed you've been working with our platform for the past ${user.metrics.daysSinceOnboarding} days. `;

    if (isBillingFail) {
      subject = `Action Required: Keeping your SubSentry account active`;
      body += `We recently encountered a renewal issue with your payment card on file. \n\nTo ensure your service is not interrupted, we've extended a 7-day grace period on your account. You can easily update your card details in your billing console whenever you're ready.\n\nLet me know if we can help you with anything else!`;
    } else if (isLowUsage) {
      body += `We want to make sure you're getting the absolute best value out of your ${user.plan} plan. We noticed you haven't had a chance to explore our advanced reporting tools yet.\n\nI'd love to schedule a quick 10-minute walkthrough to help configure these pipelines for you, or discuss if a different tier would better match your current workflow needs.\n\nWhat is your availability this week?`;
    } else {
      body += `I wanted to reach out and thank you for being a valued customer. Your usage metrics look fantastic, and we'd love to share some of our upcoming beta features with you.\n\nLet me know if you would be interested in joining our early-tester program.`;
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

  // Bridge real backend SHAP indicators if recommendation API has loaded
  const activeFactors = recommendation?.shap_reasons
    ? recommendation.shap_reasons.map((r: any) => ({
        name: r.feature.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        impact: Math.round(r.contribution * 100)
      }))
    : user.churnFactors;

  return (
    <div className="text-left w-full flex flex-col gap-6 p-4 md:p-6 console-bg-dark min-h-screen relative animate-fadeIn">
      {/* 1. Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b console-border">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 console-text-muted hover:text-earth-bg transition-colors duration-200 text-sm group font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Global System Map</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="bg-earth-sage/20 border console-border rounded-full px-3 py-1 text-xs console-text-primary font-medium flex items-center gap-1.5 animate-pulse-glow-earth">
            <span className="w-2 h-2 rounded-full bg-earth-sage" />
            <span>Active Session Tracked</span>
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
                  ? 'bg-earth-sage/20 border-earth-sage/30 text-earth-sage'
                  : user.state === 'frustrated'
                  ? 'bg-earth-clay/20 border-earth-clay/30 text-earth-clay animate-pulse'
                  : user.state === 'disengaged'
                  ? 'bg-earth-bg/10 border-earth-bg/20 text-earth-bg/80'
                  : 'bg-black/20 border-black/40 text-black/50'
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
                className="stroke-earth-bg/80" strokeWidth="8" fill="transparent" 
              />
              <circle 
                cx="56" cy="56" r="48" 
                className={`transition-all duration-500 ${
                  user.healthScore > 70 
                    ? 'stroke-earth-sage' 
                    : user.healthScore > 40 
                    ? 'stroke-earth-clay' 
                    : 'stroke-earth-cocoa'
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
              ? 'bg-earth-sage/20 console-text-primary border console-border' 
              : user.healthScore > 40 
              ? 'bg-earth-clay/20 console-text-primary border border-earth-clay/30' 
              : 'bg-earth-cocoa/10 console-text-primary border border-earth-cocoa/20'
          }`}>
            {user.healthScore > 70 ? 'HEALTHY' : user.healthScore > 40 ? 'MONITOR' : 'CRITICAL'}
          </span>
        </div>

        {/* Churn Risk */}
        <div className="console-card-dark p-5 rounded-2xl flex flex-col justify-between items-start relative group shadow-sm">
          <div className="absolute top-0 right-0 p-3 text-earth-sage/20 group-hover:text-earth-sage/30 transition-colors pointer-events-none">
            <ShieldAlert className="w-16 h-16" />
          </div>
          <span className="console-text-muted text-xs font-bold">CHURN PROBABILITY (XGBOOST)</span>
          
          <div className="my-4">
            <span className={`text-4xl font-extrabold tracking-tight ${
              user.churnProbability > 50 ? 'console-text-primary' : user.churnProbability > 15 ? 'text-earth-clay' : 'text-earth-sage'
            }`}>
              {user.churnProbability}%
            </span>
            <div className="flex items-center gap-1 mt-2 text-xs console-text-secondary">
              {user.churnProbability > 50 ? (
                <>
                  <TrendingUp className="w-3.5 h-3.5 text-earth-clay" />
                  <span className="text-earth-clay font-bold">High Risk of cancellation</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3.5 h-3.5 text-earth-sage" />
                  <span className="text-earth-sage font-bold">Stable Account</span>
                </>
              )}
            </div>
          </div>

          <div className="w-full bg-earth-bg/10 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                user.churnProbability > 50 ? 'bg-earth-cocoa' : user.churnProbability > 15 ? 'bg-earth-clay' : 'bg-earth-sage'
              }`}
              style={{ width: `${user.churnProbability}%` }}
            />
          </div>
        </div>

        {/* Usage Velocity */}
        <div className="console-card-dark p-5 rounded-2xl flex flex-col justify-between items-start relative shadow-sm">
          <span className="console-text-muted text-xs font-bold">USAGE VELOCITY (7D VS PRIOR)</span>
          
          <div className="my-4">
            <span className={`text-4xl font-extrabold tracking-tight ${
              user.metrics.usageVelocity < 0.5 ? 'console-text-primary' : user.metrics.usageVelocity < 0.9 ? 'text-earth-clay' : 'text-earth-sage'
            }`}>
              {user.metrics.usageVelocity}x
            </span>
            <div className="flex items-center gap-1 mt-2 text-xs console-text-secondary">
              {user.metrics.usageVelocity < 0.8 ? (
                <span className="text-earth-clay font-bold">
                  {Math.round((1 - user.metrics.usageVelocity) * 100)}% activity decay
                </span>
              ) : (
                <span className="text-earth-sage font-bold">Stable or rising usage</span>
              )}
            </div>
          </div>

          <div className="text-[10px] console-text-muted leading-normal">
            Normal range: 0.9x - 1.2x. Below 0.8x indicates users are phasing out daily logins.
          </div>
        </div>

        {/* Friction & Invoices */}
        <div className="console-card-dark p-5 rounded-2xl flex flex-col justify-between items-start relative shadow-sm">
          <span className="console-text-muted text-xs font-bold">SUPPORT FRICTION & BILLING</span>
          
          <div className="my-4 flex flex-col gap-2 w-full">
            <div className="flex justify-between items-center w-full">
              <span className="text-xs console-text-muted">Support Friction Index</span>
              <span className={`font-bold ${user.metrics.frictionIndex > 5 ? 'text-earth-clay' : 'console-text-primary'}`}>
                {user.metrics.frictionIndex} / 10
              </span>
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="text-xs console-text-muted">Failed Invoices (30d)</span>
              <span className={`font-bold ${user.metrics.failedPayments > 0 ? 'console-text-primary animate-pulse' : 'console-text-primary'}`}>
                {user.metrics.failedPayments} Failed
              </span>
            </div>
          </div>

          <div className="text-[10px] console-text-muted leading-normal">
            Failed credit cards or unresolved critical bugs contribute directly to involuntary churn.
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
              Explainable AI: Churn Contribution (SHAP)
            </h3>
            <span className="text-[10px] bg-earth-sage/20 border console-border console-text-primary px-2 py-0.5 rounded font-bold">
              Model: XGBoost Classifier
            </span>
          </div>
          <p className="text-xs console-text-secondary leading-relaxed">
            Shapley values show how much each behavioral metric pushes the churn risk up (+) or down (-) relative to the average baseline risk (15%).
          </p>

          <div className="flex flex-col gap-4 my-2">
            {activeFactors.map((factor) => {
              const isPositive = factor.impact > 0;
              return (
                <div key={factor.name} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="console-text-secondary font-bold">{factor.name}</span>
                    <span className={isPositive ? 'text-earth-clay font-bold' : 'text-earth-sage font-bold'}>
                      {isPositive ? `+${factor.impact}% Churn Risk` : `${factor.impact}% Retention Strength`}
                    </span>
                  </div>
                  {/* Slider bar */}
                  <div className="w-full h-2 bg-earth-bg/10/80 rounded-full relative overflow-hidden">
                    <div 
                      className={`h-full absolute rounded-full ${isPositive ? 'bg-earth-clay right-1/2 left-auto' : 'bg-earth-sage left-1/2 right-auto'}`}
                      style={
                        isPositive 
                          ? { left: '50%', width: `${factor.impact * 2}%` } 
                          : { right: '50%', width: `${Math.abs(factor.impact) * 2}%` }
                      }
                    />
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-earth-cocoa/30" /> {/* Center line */}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="console-card-dark-inner rounded-lg p-3 text-[10px] console-text-muted flex justify-between">
            <span>&larr; Pulls down churn (Retained)</span>
            <span>Pushes up churn (At Risk) &rarr;</span>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="console-card-dark rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
          <h3 className="text-base font-bold console-text-primary flex items-center gap-2">
            <Clock className="w-4 h-4 text-earth-clay" />
            Active User Timeline logs
          </h3>

          <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2">
            {user.activityLogs.map((log, idx) => (
              <div key={idx} className="flex gap-3 border-l console-border pb-3 pl-4 relative last:pb-0">
                <span className={`w-3.5 h-3.5 rounded-full absolute -left-1.5 border-4 border-earth-bg flex items-center justify-center ${
                  log.type === 'payment_fail' || log.type === 'support_open'
                    ? 'bg-earth-clay animate-pulse'
                    : log.type === 'payment_success' || log.type === 'support_resolve'
                    ? 'bg-earth-sage'
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
              Real-Time Tree Model "What-If" Simulator
            </h3>
            <p className="text-xs console-text-secondary leading-normal">
              Adjust behavioral parameters and renewal status below to request real-time churn predictions from your XGBoost classifier.
            </p>
          </div>
          <button
            onClick={runSimulation}
            disabled={simLoading}
            className="self-start md:self-auto bg-earth-cocoa hover:bg-earth-clay text-earth-bg px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-earth-cocoa/20 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {simLoading ? 'Calculating Levers...' : 'Run Prediction Lever Simulation'}
          </button>
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
                className="w-full accent-earth-sage cursor-pointer h-1 bg-earth-bg/10 rounded-lg appearance-none" 
              />
            </div>

            {/* Feature Usage Rate */}
            <div className="flex flex-col gap-2 console-card-dark-inner p-3.5 rounded-xl">
              <div className="flex justify-between text-xs">
                <span className="console-text-secondary font-bold">Feature Adoption Rate</span>
                <span className="font-bold text-earth-clay">{Math.round(simLevers.feature_usage * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0.0" 
                max="1.0" 
                step="0.05"
                value={simLevers.feature_usage} 
                onChange={(e) => setSimLevers({...simLevers, feature_usage: parseFloat(e.target.value)})}
                className="w-full accent-earth-sage cursor-pointer h-1 bg-earth-bg/10 rounded-lg appearance-none" 
              />
            </div>

            {/* Monthly Usage Volume */}
            <div className="flex flex-col gap-2 console-card-dark-inner p-3.5 rounded-xl">
              <div className="flex justify-between text-xs">
                <span className="console-text-secondary font-bold">Monthly Usage Volume</span>
                <span className="font-bold text-earth-clay">{Math.round(simLevers.monthly_usage_pct)}%</span>
              </div>
              <input 
                type="range" 
                min="5.0" 
                max="100.0" 
                step="1.0"
                value={simLevers.monthly_usage_pct} 
                onChange={(e) => setSimLevers({...simLevers, monthly_usage_pct: parseFloat(e.target.value)})}
                className="w-full accent-earth-sage cursor-pointer h-1 bg-earth-bg/10 rounded-lg appearance-none" 
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
                className="w-full accent-earth-sage cursor-pointer h-1 bg-earth-bg/10 rounded-lg appearance-none" 
              />
            </div>

            {/* Feedback Score */}
            <div className="flex flex-col gap-2 console-card-dark-inner p-3.5 rounded-xl">
              <div className="flex justify-between text-xs">
                <span className="console-text-secondary font-bold">NPS Feedback Score</span>
                <span className="font-bold text-earth-clay">{simLevers.feedback_score} / 10</span>
              </div>
              <input 
                type="range" 
                min="1.0" 
                max="10.0" 
                step="0.1"
                value={simLevers.feedback_score} 
                onChange={(e) => setSimLevers({...simLevers, feedback_score: parseFloat(e.target.value)})}
                className="w-full accent-earth-sage cursor-pointer h-1 bg-earth-bg/10 rounded-lg appearance-none" 
              />
            </div>

            {/* Payment Status Dropdown */}
            <div className="flex flex-col gap-2 console-card-dark-inner p-3.5 rounded-xl">
              <label className="text-xs console-text-secondary font-bold">Account Payment Status</label>
              <select
                value={simLevers.payment_status}
                onChange={(e) => setSimLevers({...simLevers, payment_status: e.target.value})}
                className="bg-earth-cocoa border console-border rounded-lg p-1.5 text-xs console-text-primary font-bold outline-none cursor-pointer focus:border-earth-clay w-full"
              >
                <option value="active" className="bg-earth-cocoa console-text-primary">Active (Good Standing)</option>
                <option value="past_due" className="bg-earth-cocoa console-text-primary">Past Due (Declined Cards / Invoices)</option>
              </select>
            </div>

          </div>

          {/* Simulation Output results (Right Column: Span 5) */}
          <div className="lg:col-span-5 console-card-dark-inner rounded-2xl p-5 flex flex-col gap-4 shadow-inner min-h-[220px] justify-center text-center">
            {simError && (
              <div className="text-earth-clay text-xs font-bold leading-normal">
                ⚠️ {simError}
              </div>
            )}

            {!simResult && !simError && (
              <div className="flex flex-col items-center justify-center gap-2 py-4">
                <Cpu className="w-8 h-8 console-text-primary/25 animate-pulse" />
                <span className="text-xs console-text-muted font-bold">
                  Adjust sliders and click "Run Prediction Lever Simulation" to query Digital Twin outputs.
                </span>
              </div>
            )}

            {simResult && !simError && (
              <div className="flex flex-col gap-4 select-none text-left">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] uppercase font-bold console-text-primary/65 tracking-wider">Simulation Output</span>
                  <span className="text-[9px] bg-earth-sage/20 border console-border console-text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Computed</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Churn Risk Change */}
                  <div className="console-card-dark-inner p-3.5 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] console-text-muted font-semibold block">CHURN RISK DELTA</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-bold console-text-muted line-through">
                        {Math.round(simResult.baseline_churn_probability * 100)}%
                      </span>
                      <span className="text-2xl font-extrabold text-earth-clay">
                        &rarr; {Math.round(simResult.simulated_churn_probability * 100)}%
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold mt-1.5 block ${simResult.delta_churn < 0 ? 'text-earth-sage' : simResult.delta_churn > 0 ? 'text-earth-clay' : 'console-text-muted'}`}>
                      {simResult.delta_churn < 0 ? `Reduced risk by ${Math.round(Math.abs(simResult.delta_churn) * 100)}%` : simResult.delta_churn > 0 ? `Increased risk by ${Math.round(simResult.delta_churn * 100)}%` : 'No risk changes'}
                    </span>
                  </div>

                  {/* Health Score Change */}
                  <div className="console-card-dark-inner p-3.5 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] console-text-muted font-semibold block">HEALTH SCORE DELTA</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-bold console-text-muted line-through">
                        {Math.round(simResult.baseline_health_score)}
                      </span>
                      <span className="text-2xl font-extrabold text-earth-sage">
                        &rarr; {Math.round(simResult.simulated_health_score)}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold mt-1.5 block ${simResult.delta_health > 0 ? 'text-earth-sage' : simResult.delta_health < 0 ? 'text-earth-clay' : 'console-text-muted'}`}>
                      {simResult.delta_health > 0 ? `Health improved (+${Math.round(simResult.delta_health)})` : simResult.delta_health < 0 ? `Health degraded (${Math.round(simResult.delta_health)})` : 'No health change'}
                    </span>
                  </div>
                </div>

                {/* Summary sentence */}
                <p className="text-[11px] console-text-secondary leading-relaxed console-card-dark-inner p-2 rounded-lg mt-1 italic">
                  * Tree-model says: Churn is simulated at {Math.round(simResult.simulated_churn_probability * 100)}% risk level with the proposed behavioral profile change.
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
              SubSentry RAG Retention Copilot
            </h3>
            <span className="bg-earth-sage/20 console-text-primary text-[10px] px-2 py-0.5 border console-border rounded font-bold">
              RAG Engine Active
            </span>
          </div>

          {/* Similar past cases */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase font-extrabold console-text-muted tracking-wider">
              Semantic Search: Similar Historical Cases Found
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {user.pastJourneys.map((j, i) => (
                <div 
                  key={i} 
                  className={`border rounded-xl p-3 flex flex-col gap-2 ${
                    j.outcome === 'churned' 
                      ? 'bg-earth-cocoa/5 border-earth-cocoa/20' 
                      : 'bg-earth-sage/10 console-border'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="console-text-primary font-bold">{j.name} ({j.plan})</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      j.outcome === 'churned' ? 'bg-earth-cocoa/15 console-text-primary' : 'bg-earth-sage/20 console-text-primary'
                    }`}>
                      {j.outcome.toUpperCase()} (Sim: {j.similarity}%)
                    </span>
                  </div>
                  <p className="text-[11px] console-text-secondary leading-normal">
                    <strong className="console-text-primary">Context:</strong> {j.reason}
                  </p>
                  <p className="text-[11px] console-text-secondary leading-normal">
                    <strong className="console-text-primary">Intervention:</strong> {j.intervention}
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
                Generated CSM Outreach Draft (Personalized Email)
              </span>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-earth-clay hover:console-text-primary transition-colors font-bold cursor-pointer"
              >
                {copied ? <CheckCircle className="w-3.5 h-3.5 text-earth-sage" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>
            </div>

            <div className="console-card-dark-inner rounded-xl p-4 font-mono text-xs console-text-primary flex flex-col gap-2 leading-relaxed shadow-inner">
              <div>
                <strong className="console-text-muted">Subject:</strong> {subject}
              </div>
              <hr className="console-border my-1" />
              <div className="whitespace-pre-line console-text-primary">{body}</div>
            </div>
          </div>
        </div>

        {/* Value Injections Playbook */}
        <div className="console-card-dark rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold console-text-primary flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-earth-clay" />
              CSM Value Injections
            </h3>
            <p className="text-xs console-text-secondary leading-normal mt-1">
              Select an intervention to inject value immediately. These actions update client metrics and drop churn risk in real-time.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 my-2">
            <button
              onClick={() => handleAction('grace_period')}
              disabled={!user.warningFlags.includes('Failed Payment')}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-between border transition-all duration-200 ${
                user.warningFlags.includes('Failed Payment')
                  ? 'bg-earth-bg/10 hover:bg-earth-bg/20 console-border text-earth-bg cursor-pointer'
                  : 'bg-earth-bg/5 console-border text-earth-bg/20 cursor-not-allowed'
              }`}
            >
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-earth-clay" />
                Extend Billing Grace Period
              </span>
              <span className="text-[10px] text-earth-sage font-extrabold">-25% Churn</span>
            </button>

            <button
              onClick={() => handleAction('training')}
              disabled={user.metrics.featureAdoption > 0.8}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-between border transition-all duration-200 ${
                user.metrics.featureAdoption <= 0.8
                  ? 'bg-earth-bg/10 hover:bg-earth-bg/20 console-border text-earth-bg cursor-pointer'
                  : 'bg-earth-bg/5 console-border text-earth-bg/20 cursor-not-allowed'
              }`}
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-earth-clay" />
                Send Guided Tutorials package
              </span>
              <span className="text-[10px] text-earth-sage font-extrabold">-15% Churn</span>
            </button>

            <button
              onClick={() => handleAction('csm_call')}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-between border bg-earth-bg/10 hover:bg-earth-bg/20 console-border text-earth-bg transition-all duration-200 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-earth-clay" />
                Schedule Priority Feedback Sync
              </span>
              <span className="text-[10px] text-earth-sage font-extrabold">-18% Churn</span>
            </button>

            <button
              onClick={() => handleAction('discount')}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-between border bg-earth-bg/10 hover:bg-earth-bg/20 console-border text-earth-bg transition-all duration-200 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-earth-clay" />
                Offer 20% Loyalty Discount
              </span>
              <span className="text-[10px] text-earth-sage font-extrabold">-20% Churn</span>
            </button>
          </div>

          {/* Action Alert Banner */}
          {activePlaybook ? (
            <div className="bg-earth-sage/20 border console-border console-text-primary text-[11px] p-3 rounded-xl flex items-center gap-2 animate-bounce font-bold shadow-sm">
              <CheckCircle className="w-4 h-4 shrink-0 console-text-primary" />
              <span>{activePlaybook}</span>
            </div>
          ) : (
            <div className="border border-dashed console-border p-3 rounded-xl text-[10px] console-text-muted text-center">
              Triggering an action immediately posts it to the customer activity logs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
