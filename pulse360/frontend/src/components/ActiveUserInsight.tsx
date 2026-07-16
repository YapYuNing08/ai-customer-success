import React, { useState } from 'react';
import { 
  ArrowLeft, TrendingDown, TrendingUp, UserCheck, 
  Clock, CreditCard, MessageSquare, DollarSign, CheckCircle, 
  Copy, Zap, BookOpen, HeartHandshake, ShieldAlert
} from 'lucide-react';
import { type ActiveUser } from '../utils/mockData';

interface ActiveUserInsightProps {
  user: ActiveUser;
  onBack: () => void;
  onUpdateUser: (updatedUser: ActiveUser) => void;
}

export const ActiveUserInsight: React.FC<ActiveUserInsightProps> = ({ user, onBack, onUpdateUser }) => {
  const [copied, setCopied] = useState(false);
  const [activePlaybook, setActivePlaybook] = useState<string | null>(null);

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

  return (
    <div className="text-left w-full flex flex-col gap-6 p-4 md:p-6 bg-earth-bg min-h-screen text-earth-cocoa relative">
      {/* 1. Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-earth-sage/35">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-earth-cocoa/70 hover:text-earth-cocoa transition-colors duration-200 text-sm group font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Global System Map</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="bg-earth-sage/20 border border-earth-sage/40 rounded-full px-3 py-1 text-xs text-earth-cocoa font-medium flex items-center gap-1.5 animate-pulse-glow-earth">
            <span className="w-2 h-2 rounded-full bg-earth-sage" />
            <span>Active Session Tracked</span>
          </div>
        </div>
      </div>

      {/* 2. User Overview Bar */}
      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-16 h-16 rounded-full border-2 border-earth-clay object-cover" 
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-earth-cocoa leading-tight">{user.name}</h2>
              <span className="bg-earth-sage/20 border border-earth-sage/40 text-earth-cocoa text-xs px-2.5 py-0.5 rounded-full font-bold">
                {user.plan} Plan
              </span>
            </div>
            <p className="text-earth-cocoa/70 text-sm mt-1">{user.email}</p>
            <p className="text-earth-cocoa/65 text-xs mt-0.5">{user.location} &bull; Onboarded {user.metrics.daysSinceOnboarding} days ago</p>
          </div>
        </div>

        <div className="flex gap-8 border-l border-earth-sage/30 pl-6 h-full items-center">
          <div>
            <span className="text-earth-cocoa/60 text-xs block mb-1">Contract Value</span>
            <span className="text-lg font-bold text-earth-cocoa flex items-center">
              <DollarSign className="w-4 h-4 text-earth-clay -mr-0.5" />
              {user.mrr.toLocaleString()}/mo
            </span>
          </div>
          <div>
            <span className="text-earth-cocoa/60 text-xs block mb-1">Lifetime Value</span>
            <span className="text-lg font-bold text-earth-cocoa flex items-center">
              <DollarSign className="w-4 h-4 text-earth-clay -mr-0.5" />
              {(user.mrr * Math.round(user.metrics.daysSinceOnboarding / 30)).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Core Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Radial Health Score */}
        <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-5 rounded-2xl flex flex-col justify-between items-center text-center relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 p-3 text-earth-sage/20 group-hover:text-earth-sage/30 transition-colors pointer-events-none">
            <UserCheck className="w-16 h-16" />
          </div>
          <span className="text-earth-cocoa/60 text-xs font-bold self-start">CUSTOMER HEALTH</span>
          
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
              <span className="text-2xl font-extrabold text-earth-cocoa">{user.healthScore}</span>
              <span className="text-[10px] text-earth-cocoa/50 block leading-none">/ 100</span>
            </div>
          </div>

          <span className={`text-xs px-2.5 py-0.5 rounded font-bold ${
            user.healthScore > 70 
              ? 'bg-earth-sage/20 text-earth-cocoa border border-earth-sage/30' 
              : user.healthScore > 40 
              ? 'bg-earth-clay/20 text-earth-cocoa border border-earth-clay/30' 
              : 'bg-earth-cocoa/10 text-earth-cocoa border border-earth-cocoa/20'
          }`}>
            {user.healthScore > 70 ? 'HEALTHY' : user.healthScore > 40 ? 'MONITOR' : 'CRITICAL'}
          </span>
        </div>

        {/* Churn Risk */}
        <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-5 rounded-2xl flex flex-col justify-between items-start relative group shadow-sm">
          <div className="absolute top-0 right-0 p-3 text-earth-sage/20 group-hover:text-earth-sage/30 transition-colors pointer-events-none">
            <ShieldAlert className="w-16 h-16" />
          </div>
          <span className="text-earth-cocoa/60 text-xs font-bold">CHURN PROBABILITY (XGBOOST)</span>
          
          <div className="my-4">
            <span className={`text-4xl font-extrabold tracking-tight ${
              user.churnProbability > 50 ? 'text-earth-cocoa' : user.churnProbability > 15 ? 'text-earth-clay' : 'text-earth-sage'
            }`}>
              {user.churnProbability}%
            </span>
            <div className="flex items-center gap-1 mt-2 text-xs text-earth-cocoa/70">
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

          <div className="w-full bg-[#efe9d2] rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                user.churnProbability > 50 ? 'bg-earth-cocoa' : user.churnProbability > 15 ? 'bg-earth-clay' : 'bg-earth-sage'
              }`}
              style={{ width: `${user.churnProbability}%` }}
            />
          </div>
        </div>

        {/* Usage Velocity */}
        <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-5 rounded-2xl flex flex-col justify-between items-start relative shadow-sm">
          <span className="text-earth-cocoa/60 text-xs font-bold">USAGE VELOCITY (7D VS PRIOR)</span>
          
          <div className="my-4">
            <span className={`text-4xl font-extrabold tracking-tight ${
              user.metrics.usageVelocity < 0.5 ? 'text-earth-cocoa' : user.metrics.usageVelocity < 0.9 ? 'text-earth-clay' : 'text-earth-sage'
            }`}>
              {user.metrics.usageVelocity}x
            </span>
            <div className="flex items-center gap-1 mt-2 text-xs text-earth-cocoa/75">
              {user.metrics.usageVelocity < 0.8 ? (
                <span className="text-earth-clay font-bold">
                  {Math.round((1 - user.metrics.usageVelocity) * 100)}% activity decay
                </span>
              ) : (
                <span className="text-earth-sage font-bold">Stable or rising usage</span>
              )}
            </div>
          </div>

          <div className="text-[10px] text-earth-cocoa/50 leading-normal">
            Normal range: 0.9x - 1.2x. Below 0.8x indicates users are phasing out daily logins.
          </div>
        </div>

        {/* Friction & Invoices */}
        <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-5 rounded-2xl flex flex-col justify-between items-start relative shadow-sm">
          <span className="text-earth-cocoa/60 text-xs font-bold">SUPPORT FRICTION & BILLING</span>
          
          <div className="my-4 flex flex-col gap-2 w-full">
            <div className="flex justify-between items-center w-full">
              <span className="text-xs text-earth-cocoa/60">Support Friction Index</span>
              <span className={`font-bold ${user.metrics.frictionIndex > 5 ? 'text-earth-clay' : 'text-earth-cocoa'}`}>
                {user.metrics.frictionIndex} / 10
              </span>
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="text-xs text-earth-cocoa/60">Failed Invoices (30d)</span>
              <span className={`font-bold ${user.metrics.failedPayments > 0 ? 'text-earth-cocoa animate-pulse' : 'text-earth-cocoa'}`}>
                {user.metrics.failedPayments} Failed
              </span>
            </div>
          </div>

          <div className="text-[10px] text-earth-cocoa/50 leading-normal">
            Failed credit cards or unresolved critical bugs contribute directly to involuntary churn.
          </div>
        </div>
      </div>

      {/* 4. SHAP Explainable AI and Timeline Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SHAP Explanations (XAI) */}
        <div className="bg-[#efe9d2]/20 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-earth-cocoa flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-earth-clay" />
              Explainable AI: Churn Contribution (SHAP)
            </h3>
            <span className="text-[10px] bg-earth-sage/20 border border-earth-sage/30 text-earth-cocoa px-2 py-0.5 rounded font-bold">
              Model: XGBoost Classifier
            </span>
          </div>
          <p className="text-xs text-earth-cocoa/70 leading-relaxed">
            Shapley values show how much each behavioral metric pushes the churn risk up (+) or down (-) relative to the average baseline risk (15%).
          </p>

          <div className="flex flex-col gap-4 my-2">
            {user.churnFactors.map((factor) => {
              const isPositive = factor.impact > 0;
              return (
                <div key={factor.name} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-earth-cocoa/80 font-bold">{factor.name}</span>
                    <span className={isPositive ? 'text-earth-clay font-bold' : 'text-earth-sage font-bold'}>
                      {isPositive ? `+${factor.impact}% Churn Risk` : `${factor.impact}% Retention Strength`}
                    </span>
                  </div>
                  {/* Slider bar */}
                  <div className="w-full h-2 bg-[#efe9d2]/80 rounded-full relative overflow-hidden">
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

          <div className="bg-[#efe9d2]/40 border border-earth-sage/20 rounded-lg p-3 text-[10px] text-earth-cocoa/60 flex justify-between">
            <span>&larr; Pulls down churn (Retained)</span>
            <span>Pushes up churn (At Risk) &rarr;</span>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-[#efe9d2]/20 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
          <h3 className="text-base font-bold text-earth-cocoa flex items-center gap-2">
            <Clock className="w-4 h-4 text-earth-clay" />
            Active User Timeline logs
          </h3>

          <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2">
            {user.activityLogs.map((log, idx) => (
              <div key={idx} className="flex gap-3 border-l border-earth-sage/40 pb-3 pl-4 relative last:pb-0">
                <span className={`w-3.5 h-3.5 rounded-full absolute -left-1.5 border-4 border-earth-bg flex items-center justify-center ${
                  log.type === 'payment_fail' || log.type === 'support_open'
                    ? 'bg-earth-clay animate-pulse'
                    : log.type === 'payment_success' || log.type === 'support_resolve'
                    ? 'bg-earth-sage'
                    : 'bg-earth-cocoa/60'
                }`} />
                <div className="flex-1">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-xs font-bold text-earth-cocoa capitalize">
                      {log.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-earth-cocoa/50">{log.date}</span>
                  </div>
                  <p className="text-xs text-earth-cocoa/75 mt-1">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. RAG AI Copilot & Value Injections panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RAG Copilot */}
        <div className="bg-[#efe9d2]/20 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 lg:col-span-2 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-earth-cocoa flex items-center gap-2">
              <Zap className="w-4 h-4 text-earth-clay" />
              SubSentry RAG Retention Copilot
            </h3>
            <span className="bg-earth-sage/20 text-earth-cocoa text-[10px] px-2 py-0.5 border border-earth-sage/30 rounded font-bold">
              RAG Engine Active
            </span>
          </div>

          {/* Similar past cases */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase font-extrabold text-earth-cocoa/60 tracking-wider">
              Semantic Search: Similar Historical Cases Found
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {user.pastJourneys.map((j, i) => (
                <div 
                  key={i} 
                  className={`border rounded-xl p-3 flex flex-col gap-2 ${
                    j.outcome === 'churned' 
                      ? 'bg-earth-cocoa/5 border-earth-cocoa/20' 
                      : 'bg-earth-sage/10 border-earth-sage/20'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-earth-cocoa font-bold">{j.name} ({j.plan})</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      j.outcome === 'churned' ? 'bg-earth-cocoa/15 text-earth-cocoa' : 'bg-earth-sage/20 text-earth-cocoa'
                    }`}>
                      {j.outcome.toUpperCase()} (Sim: {j.similarity}%)
                    </span>
                  </div>
                  <p className="text-[11px] text-earth-cocoa/80 leading-normal">
                    <strong className="text-earth-cocoa/90">Context:</strong> {j.reason}
                  </p>
                  <p className="text-[11px] text-earth-cocoa/80 leading-normal">
                    <strong className="text-earth-cocoa/90">Intervention:</strong> {j.intervention}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-earth-sage/35" />

          {/* Generated email draft */}
          <div className="flex flex-col gap-2 relative">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-extrabold text-earth-cocoa/60 tracking-wider">
                Generated CSM Outreach Draft (Personalized Email)
              </span>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-earth-clay hover:text-earth-cocoa transition-colors font-bold cursor-pointer"
              >
                {copied ? <CheckCircle className="w-3.5 h-3.5 text-earth-sage" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>
            </div>

            <div className="bg-[#F7F1DE]/70 border border-earth-sage/30 rounded-xl p-4 font-mono text-xs text-earth-cocoa flex flex-col gap-2 leading-relaxed shadow-inner">
              <div>
                <strong className="text-earth-cocoa/60">Subject:</strong> {subject}
              </div>
              <hr className="border-earth-sage/20 my-1" />
              <div className="whitespace-pre-line text-earth-cocoa/90">{body}</div>
            </div>
          </div>
        </div>

        {/* Value Injections Playbook */}
        <div className="bg-[#efe9d2]/20 border border-earth-sage/30 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold text-earth-cocoa flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-earth-clay" />
              CSM Value Injections
            </h3>
            <p className="text-xs text-earth-cocoa/70 leading-normal mt-1">
              Select an intervention to inject value immediately. These actions update client metrics and drop churn risk in real-time.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 my-2">
            <button
              onClick={() => handleAction('grace_period')}
              disabled={!user.warningFlags.includes('Failed Payment')}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-between border transition-all duration-200 ${
                user.warningFlags.includes('Failed Payment')
                  ? 'bg-earth-bg hover:bg-[#efe9d2] border-earth-sage/40 text-earth-cocoa cursor-pointer'
                  : 'bg-earth-bg/20 border-earth-sage/10 text-earth-cocoa/30 cursor-not-allowed'
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
                  ? 'bg-earth-bg hover:bg-[#efe9d2] border-earth-sage/40 text-earth-cocoa cursor-pointer'
                  : 'bg-earth-bg/20 border-earth-sage/10 text-earth-cocoa/30 cursor-not-allowed'
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
              className="w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-between border bg-earth-bg hover:bg-[#efe9d2] border-earth-sage/40 text-earth-cocoa transition-all duration-200 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-earth-clay" />
                Schedule Priority Feedback Sync
              </span>
              <span className="text-[10px] text-earth-sage font-extrabold">-18% Churn</span>
            </button>

            <button
              onClick={() => handleAction('discount')}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-between border bg-earth-bg hover:bg-[#efe9d2] border-earth-sage/40 text-earth-cocoa transition-all duration-200 cursor-pointer"
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
            <div className="bg-earth-sage/20 border border-earth-sage/40 text-earth-cocoa text-[11px] p-3 rounded-xl flex items-center gap-2 animate-bounce font-bold shadow-sm">
              <CheckCircle className="w-4 h-4 shrink-0 text-earth-cocoa" />
              <span>{activePlaybook}</span>
            </div>
          ) : (
            <div className="border border-dashed border-earth-sage/30 p-3 rounded-xl text-[10px] text-earth-cocoa/40 text-center">
              Triggering an action immediately posts it to the customer activity logs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
