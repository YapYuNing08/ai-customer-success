import { useState } from 'react';
import { ArrowDown, ChevronRight, MessageSquare, Cpu, HeartHandshake } from 'lucide-react';
import { Globe } from '../components/Globe';
import { ModelAnalyticsModal } from '../components/modals/ModelAnalyticsModal';

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
                  ⚡ Know Who's About to Leave — and Why
                </div>

                {/* Hero Heading */}
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-earth-cocoa leading-[1.1]">
                  Turn Cancellations into <span className="text-earth-clay">Loyalty Opportunities.</span>
                </h1>

                {/* Hero Description */}
                <p className="text-sm md:text-base text-earth-cocoa/80 leading-relaxed">
                  SubSentry watches how your customers use your product, spots the ones losing interest before they cancel, explains in plain language what's frustrating them, and drafts personalized win-back emails based on what has worked before.
                </p>

                {/* Hero CTAs */}
                <div className="flex flex-wrap gap-4 mt-2">
                  <button 
                    onClick={scrollToConsole}
                    className="bg-earth-cocoa hover:bg-earth-clay text-earth-bg px-6 py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-earth-cocoa/25 transition-all duration-200 flex items-center gap-2 group cursor-pointer"
                  >
                    <span>Launch Admin Console</span>
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
                    <span>Live Activity Tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-earth-sage" />
                    <span>Plain-Language Risk Reasons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-earth-clay" />
                    <span>AI Email Assistant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-earth-sage" />
                    <span>Extra Time for Payment Issues</span>
                  </div>
                </div>
              </div>

              {/* Right Column: 3D rotating Globe (Span 7) */}
              <div className="lg:col-span-7 bg-[#efe9d2]/15 border border-earth-sage/35 rounded-3xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                <div className="absolute top-4 left-4 z-10 flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold text-earth-cocoa/50 tracking-wider">Live System Activity</span>
                  <h2 className="text-sm font-bold text-earth-cocoa mt-0.5">Global User Heatmap</h2>
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
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-earth-clay">What SubSentry Does</span>
                  <h2 className="text-2xl font-extrabold text-earth-cocoa">Keep More Customers, With Less Guesswork.</h2>
                  <p className="text-xs text-earth-cocoa/75 leading-relaxed">
                    Most businesses only find out why a customer left after it's too late. SubSentry tells your team who is at risk, why, and exactly what to do about it — in plain language.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Feature 1 */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-6 rounded-2xl flex flex-col gap-3 shadow-sm">
                    <div className="bg-earth-sage/20 text-earth-cocoa p-2.5 rounded-xl w-fit">
                      <Cpu className="w-5 h-5 text-earth-clay" />
                    </div>
                    <h3 className="font-bold text-earth-cocoa text-sm">Know Why, Not Just Who</h3>
                    <p className="text-xs text-earth-cocoa/70 leading-relaxed">
                      We don't just flag customers who might leave. For each one, we show exactly which behaviors are raising or lowering their risk — no guesswork needed.
                    </p>
                  </div>

                  {/* Feature 2 */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-6 rounded-2xl flex flex-col gap-3 shadow-sm">
                    <div className="bg-earth-sage/20 text-earth-cocoa p-2.5 rounded-xl w-fit">
                      <MessageSquare className="w-5 h-5 text-earth-clay" />
                    </div>
                    <h3 className="font-bold text-earth-cocoa text-sm">Learn From Past Wins</h3>
                    <p className="text-xs text-earth-cocoa/70 leading-relaxed">
                      SubSentry compares each at-risk customer with similar customers from the past — and shows you which rescue strategies actually kept them around.
                    </p>
                  </div>

                  {/* Feature 3 */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-6 rounded-2xl flex flex-col gap-3 shadow-sm">
                    <div className="bg-earth-sage/20 text-earth-cocoa p-2.5 rounded-xl w-fit">
                      <HeartHandshake className="w-5 h-5 text-earth-clay" />
                    </div>
                    <h3 className="font-bold text-earth-cocoa text-sm">One-Click Actions</h3>
                    <p className="text-xs text-earth-cocoa/70 leading-relaxed">
                      Help your team act fast: give customers extra time on a missed payment, send helpful tutorials, or schedule a check-in call — all with one click.
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
                  <span className="text-[10px] uppercase font-bold text-earth-clay tracking-wider">SubSentry Workspace</span>
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
                            <img src={u.avatar} alt={u.name} className={`w-8 h-8 rounded-full object-cover border ${isDark ? 'border-earth-bg/25' : 'border-earth-sage/40'}`} />
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
