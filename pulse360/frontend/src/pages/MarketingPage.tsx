import { useState } from 'react';
import { ArrowDown, ChevronRight, Cpu, Gauge, EyeOff, History, Lightbulb, SlidersHorizontal, Compass } from 'lucide-react';
import { Globe } from '../components/Globe';
import { ModelAnalyticsModal } from '../components/modals/ModelAnalyticsModal';
import Avatar from '../components/Avatar';

export function MarketingPage(props: any) {
  const { currentPage, users, selectedUser, handleSelectUser, pulseTrigger, setPulseTrigger, addTelemetry, scrollToConsole, consoleRef, isDark } = props;
  const [showModelModal, setShowModelModal] = useState(false);
  const textMuted = isDark ? 'console-text-muted' : 'text-earth-cocoa/60';
  const textPrimary = isDark ? 'console-text-primary' : 'text-earth-cocoa';
  return (
    <>
          <div className="flex flex-col w-full">
            {currentPage === 'marketing' && (
              <>
                {/* HERO HERO SECTION */}
            
            {/* HERO HERO SECTION */}
            <div className="w-full max-w-7xl mx-auto px-6 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[calc(100vh-80px)]">
              
              {/* Left Column: Hero Text & Features (Span 5) */}
              <div className="lg:col-span-5 flex flex-col gap-6 text-left">
                
                {/* Glowing Badge */}
                <div className="self-start bg-earth-sage/20 border border-earth-sage/40 text-earth-cocoa text-[10px] px-3 py-1 rounded-full font-extrabold uppercase tracking-widest shadow-sm">
                  ⚡ Know Who's About to Leave and Why
                </div>

                {/* Hero Heading */}
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-earth-cocoa leading-[1.1]">
                  Turn Cancellations into <span className="text-earth-clay">Loyalty Opportunities.</span>
                </h1>

                {/* Hero Description */}
                <p className="text-sm md:text-base text-earth-cocoa/80 leading-relaxed">
                  Falcon360 is a multi-agent AI ecosystem for customer success. Its agents predict who's about to churn and score every customer's health, flag the silent ones drifting away without ever raising a ticket, replay each customer's full journey at a glance, explain exactly why they're at risk and what to do next, let you simulate any intervention before you act, and guide new signups to the right plan the moment they hesitate.
                </p>

                {/* Hero CTAs */}
                <div className="flex flex-wrap gap-4 mt-2">
                  <button 
                    onClick={scrollToConsole}
                    className="bg-earth-cocoa hover:bg-earth-clay text-earth-bg px-6 py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-earth-cocoa/25 transition-all duration-200 flex items-center gap-2 group cursor-pointer"
                  >
                    <span>Launch CSM Dashboard</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  
                  <button 
                    onClick={() => {
                      setPulseTrigger(prev => prev + 1);
                      addTelemetry('Highlighted all active customers on the globe.');
                    }}
                    className="bg-[#efe9d2] hover:bg-[#e4ddc3] border border-earth-sage/40 text-earth-cocoa px-6 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer"
                  >
                    Highlight Active Customers
                  </button>
                </div>

                {/* Micro Features bullet items */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-earth-sage/20 text-xs text-earth-cocoa/70 font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-earth-clay" />
                    <span>Silent Churn Detection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-earth-sage" />
                    <span>Explainable Risk + Next Best Action</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-earth-clay" />
                    <span>What-If Simulator</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-earth-sage" />
                    <span>Onboarding Guide</span>
                  </div>
                </div>
              </div>

              {/* Right Column: 3D rotating Globe (Span 7) */}
              <div className="lg:col-span-7 bg-[#efe9d2]/15 border border-earth-sage/35 rounded-3xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                <div className="absolute top-4 left-4 z-10 flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold text-earth-cocoa/50 tracking-wider">Live System Activity</span>
                  <h2 className="text-sm font-bold text-earth-cocoa mt-0.5">Global User Heatmap</h2>
                </div>

                {/* SubSentry falcon: the "sentinel" watching over the live user globe */}
                <div className="falcon-hero absolute bottom-3 right-3 md:bottom-4 md:right-5 z-20 pointer-events-none select-none">
                  <img
                    src="/falcon.png"
                    alt="SubSentry sentinel falcon watching over your customers"
                    className="w-36 md:w-52 lg:w-64 h-auto"
                  />
                </div>

                <Globe onSelectUser={handleSelectUser} selectedUser={selectedUser} users={users} pulseTrigger={pulseTrigger} />
              </div>

              {/* Scroll down indicator */}
              <div className="col-span-12 flex justify-center mt-4">
                <button 
                  onClick={scrollToConsole}
                  className="flex flex-col items-center gap-1.5 text-xs text-earth-cocoa/50 hover:text-earth-cocoa transition-colors cursor-pointer animate-bounce"
                >
                  <span>Scroll to Dashboard Console</span>
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* MARKETING FEATURES LISTING */}
            <div id="features" className="w-full bg-[#efe9d2]/20 border-y border-earth-sage/30 py-16 px-6 text-left select-none">
              <div className="max-w-7xl mx-auto flex flex-col gap-10">
                <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-earth-clay">What Falcon360 Does</span>
                  <h2 className="text-2xl font-extrabold text-earth-cocoa">Keep More Customers, With Less Guesswork.</h2>
                  <p className="text-xs text-earth-cocoa/75 leading-relaxed">
                    Most businesses only find out why a customer left after it's too late. Falcon360 puts a team of specialized AI agents to work — each watching a different signal — so you know who's at risk, why, and exactly what to do next.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Feature 1 — Churn Prediction & Health Score */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-6 rounded-2xl flex flex-col gap-3 shadow-sm">
                    <div className="bg-earth-sage/20 text-earth-cocoa p-2.5 rounded-xl w-fit">
                      <Gauge className="w-5 h-5 text-earth-clay" />
                    </div>
                    <h3 className="font-bold text-earth-cocoa text-sm">Churn Prediction & Health Score</h3>
                    <p className="text-xs text-earth-cocoa/70 leading-relaxed">
                      A single health score for every customer, plus an AI churn forecast that flags who's likely to leave — long before they reach for the cancel button.
                    </p>
                  </div>

                  {/* Feature 2 — Silent Customer Detector (Sentinel Agent) */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-6 rounded-2xl flex flex-col gap-3 shadow-sm">
                    <div className="bg-earth-sage/20 text-earth-cocoa p-2.5 rounded-xl w-fit">
                      <EyeOff className="w-5 h-5 text-earth-clay" />
                    </div>
                    <h3 className="font-bold text-earth-cocoa text-sm">Silent Customer Detector</h3>
                    <p className="text-xs text-earth-cocoa/70 leading-relaxed">
                      The Sentinel Agent catches customers quietly slipping away — disengaging and at risk without ever complaining or raising a support ticket.
                    </p>
                  </div>

                  {/* Feature 3 — AI Journey Replay (Chronicle Agent) */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-6 rounded-2xl flex flex-col gap-3 shadow-sm">
                    <div className="bg-earth-sage/20 text-earth-cocoa p-2.5 rounded-xl w-fit">
                      <History className="w-5 h-5 text-earth-clay" />
                    </div>
                    <h3 className="font-bold text-earth-cocoa text-sm">AI Journey Replay</h3>
                    <p className="text-xs text-earth-cocoa/70 leading-relaxed">
                      The Chronicle Agent auto-builds a timeline of each customer's history, interactions and behavior shifts — no more manual digging before a call.
                    </p>
                  </div>

                  {/* Feature 4 — Explainable AI & Next Best Action (Strategist Agent) */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-6 rounded-2xl flex flex-col gap-3 shadow-sm">
                    <div className="bg-earth-sage/20 text-earth-cocoa p-2.5 rounded-xl w-fit">
                      <Lightbulb className="w-5 h-5 text-earth-clay" />
                    </div>
                    <h3 className="font-bold text-earth-cocoa text-sm">Explainable AI & Next Best Action</h3>
                    <p className="text-xs text-earth-cocoa/70 leading-relaxed">
                      The Strategist Agent explains exactly why a customer is at risk and hands your team a data-backed, ready-to-run recommendation.
                    </p>
                  </div>

                  {/* Feature 5 — What-If Simulator */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-6 rounded-2xl flex flex-col gap-3 shadow-sm">
                    <div className="bg-earth-sage/20 text-earth-cocoa p-2.5 rounded-xl w-fit">
                      <SlidersHorizontal className="w-5 h-5 text-earth-clay" />
                    </div>
                    <h3 className="font-bold text-earth-cocoa text-sm">What-If Simulator</h3>
                    <p className="text-xs text-earth-cocoa/70 leading-relaxed">
                      Test any intervention before you commit — simulate how a discount, plan change or check-in call would move a customer's predicted churn.
                    </p>
                  </div>

                  {/* Feature 6 — Proactive Assistance (Guide & Coach Agents) */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-6 rounded-2xl flex flex-col gap-3 shadow-sm">
                    <div className="bg-earth-sage/20 text-earth-cocoa p-2.5 rounded-xl w-fit">
                      <Compass className="w-5 h-5 text-earth-clay" />
                    </div>
                    <h3 className="font-bold text-earth-cocoa text-sm">Proactive Onboarding Assistance</h3>
                    <p className="text-xs text-earth-cocoa/70 leading-relaxed">
                      The Guide and Coach Agents step in during signup — spotting hesitation and recommending the right plan so new customers start on the best fit.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

            {/* BELOW THE FOLD: ADMIN CONSOLE DASHBOARD */}
            <div 
              ref={consoleRef}
              className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8 scroll-mt-20 text-left"
            >
              
              <div className="flex justify-between items-center border-b pb-4 border-earth-sage/35">
                <div>
                  <span className="text-[10px] uppercase font-bold text-earth-clay tracking-wider">Falcon360 Workspace</span>
                  <h2 className="text-xl font-extrabold mt-0.5 text-earth-cocoa">Customer Directory Panel</h2>
                </div>
                <button 
                  onClick={() => setShowModelModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-200 cursor-pointer bg-earth-cocoa border-earth-cocoa/20 text-earth-bg hover:bg-earth-clay"
                >
                  <Cpu className="w-3.5 h-3.5 text-earth-clay animate-pulse" />
                  <span>How Predictions Work</span>
                </button>
              </div>

              <div className={`rounded-2xl p-5 shadow-sm transition-all duration-300 border ${isDark ? 'console-card-dark' : 'bg-[#efe9d2]/40 border-earth-sage/30'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-sm font-bold ${textPrimary}`}>Customer Health Tracker</h3>
                  <span className={`text-[10px] font-bold ${textMuted}`}>* Click on any row to see customer details</span>
                </div>
                
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className={`border-b uppercase tracking-wider font-bold transition-colors duration-300 ${isDark ? 'border-earth-bg/15 text-earth-bg/60' : 'border-earth-sage/45 text-earth-cocoa/60'}`}>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Plan & Revenue</th>
                        <th className="py-3 px-4 text-center">Health</th>
                        <th className="py-3 px-4 text-center">Risk of Leaving</th>
                        <th className="py-3 px-4">Warnings</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr 
                          key={u.id} 
                          onClick={() => handleSelectUser(u)}
                          className={`border-b transition-colors cursor-pointer ${isDark ? 'border-earth-bg/10 hover:bg-earth-bg/5' : 'border-earth-sage/20 hover:bg-[#efe9d2]/40'}`}
                        >
                          <td className="py-3 px-4 flex items-center gap-3">
                            <Avatar name={u.name} className={`w-8 h-8 text-xs rounded-full border ${isDark ? 'border-earth-bg/25' : 'border-earth-sage/40'}`} />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold block ${textPrimary}`}>{u.name}</span>
                                <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                                  u.state === 'active'
                                    ? (isDark ? 'bg-status-healthy/15 border border-status-healthy/40 text-status-healthy' : 'bg-status-healthy-deep/10 border border-status-healthy-deep/35 text-status-healthy-deep')
                                    : u.state === 'frustrated'
                                    ? (isDark ? 'bg-status-risk/15 border border-status-risk/40 text-status-risk animate-pulse' : 'bg-status-risk-deep/10 border border-status-risk-deep/35 text-status-risk-deep animate-pulse')
                                    : u.state === 'disengaged'
                                    ? (isDark ? 'bg-status-critical/15 border border-status-critical/40 text-status-critical' : 'bg-status-critical-deep/10 border border-status-critical-deep/35 text-status-critical-deep')
                                    : (isDark ? 'bg-earth-bg/10 border border-earth-bg/25 text-earth-bg/50' : 'bg-earth-cocoa/10 border border-earth-cocoa/25 text-earth-cocoa/50')
                                }`}>
                                  {u.state}
                                </span>
                              </div>
                              <span className={`text-[10px] ${textMuted}`}>{u.email}</span>
                            </div>
                          </td>
                          <td className={`py-3 px-4 ${isDark ? 'text-earth-bg/90' : 'text-earth-cocoa/90'}`}>{u.location}</td>
                          <td className="py-3 px-4">
                            <span className={`font-semibold block ${textPrimary}`}>{u.plan}</span>
                            <span className={`text-[10px] ${textMuted}`}>RM{u.mrr}/mo</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block font-bold px-2 py-0.5 rounded ${
                              u.healthScore > 70
                                ? (isDark ? 'bg-status-healthy/15 text-status-healthy border border-status-healthy/40' : 'bg-status-healthy-deep/10 text-status-healthy-deep border border-status-healthy-deep/35')
                                : u.healthScore > 40
                                ? (isDark ? 'bg-status-risk/15 text-status-risk border border-status-risk/40' : 'bg-status-risk-deep/10 text-status-risk-deep border border-status-risk-deep/35')
                                : (isDark ? 'bg-status-critical/15 text-status-critical border border-status-critical/40' : 'bg-status-critical-deep/10 text-status-critical-deep border border-status-critical-deep/35')
                            }`}>
                              {u.healthScore}/100
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block font-bold ${
                              u.churnProbability > 50
                                ? (isDark ? 'text-status-critical animate-pulse' : 'text-status-critical-deep animate-pulse')
                                : u.churnProbability > 15
                                ? (isDark ? 'text-status-risk' : 'text-status-risk-deep')
                                : (isDark ? 'text-status-healthy' : 'text-status-healthy-deep')
                            }`}>
                              {u.churnProbability}%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {u.warningFlags.length === 0 ? (
                                <span className={`text-[10px] italic ${textMuted}`}>None</span>
                              ) : (
                                u.warningFlags.map(f => (
                                  <span 
                                    key={f} 
                                    className={`border text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${isDark ? 'bg-status-risk/10 border-status-risk/35 text-status-risk' : 'bg-status-risk-deep/10 border-status-risk-deep/35 text-status-risk-deep'}`}
                                  >
                                    {f}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button 
                              className={`border px-3.5 py-1.5 rounded-xl font-bold text-[11px] transition-colors cursor-pointer ${
                                isDark 
                                  ? 'bg-earth-bg border-earth-bg hover:bg-earth-sage text-earth-cocoa' 
                                  : 'bg-earth-cocoa border-earth-cocoa/20 text-earth-bg hover:bg-earth-clay'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectUser(u);
                              }}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
      {showModelModal && <ModelAnalyticsModal onClose={() => setShowModelModal(false)} />}
    </>
  );
}
