import { Cpu, Users, FileText, Clock, RefreshCw, CreditCard } from 'lucide-react';

export function LiveStreamTab() {
  return (
                <>
                  {/* Title & Subtitle block */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full">
                    <div>
                      <h1 className="text-xl md:text-2xl font-extrabold text-earth-cocoa tracking-tight">Client Experience Console</h1>
                      <p className="text-xs text-earth-cocoa/75 mt-1 max-w-xl">
                        Real-time transparency into your end-user ecosystem. Track sentiment, health, and automated system wins.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold shrink-0">
                      <div className="bg-[#276B2B]/15 border border-[#276B2B]/30 rounded-lg px-3 py-1.5 text-status-healthy flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-status-healthy animate-pulse" />
                        <span>System Live</span>
                      </div>
                      <div className="bg-earth-cocoa border border-earth-cocoa text-earth-bg rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Last 24 Hours</span>
                      </div>
                    </div>
                  </div>

                  {/* Grid Layout for dashboard items */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full items-stretch">
                    
                    {/* Left side column: Live Experience Stream & Heatmap (Span 7) */}
                    <div className="md:col-span-7 flex flex-col gap-6 w-full">
                      
                      {/* Card 1: Live Experience Stream */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                        <div className="flex justify-between items-center border-b border-earth-sage/20 pb-2">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">LIVE EXPERIENCE STREAM</span>
                          <span className="text-[10px] font-bold text-earth-sage uppercase">Active Users: 1,422</span>
                        </div>

                        <div className="flex flex-col gap-3">
                          {/* Item 1 */}
                          <div className="border border-earth-sage/20 bg-earth-bg/30 p-3.5 rounded-xl flex gap-3.5 items-start">
                            <div className="bg-earth-sage/25 p-1.5 rounded-lg text-earth-cocoa shrink-0">
                              <Users className="w-4 h-4 text-earth-clay" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-baseline">
                                <h4 className="text-xs font-bold text-earth-cocoa">User #8821 initiated Checkout</h4>
                                <span className="text-[9px] text-earth-cocoa/50">Just now</span>
                              </div>
                              <p className="text-[10px] text-earth-cocoa/75 mt-0.5 leading-normal">
                                Cart Value: RM248.00 • High Intent Score detected
                              </p>
                            </div>
                          </div>

                          {/* Item 2 */}
                          <div className="border border-earth-sage/20 bg-earth-bg/30 p-3.5 rounded-xl flex gap-3.5 items-start">
                            <div className="bg-earth-sage/25 p-1.5 rounded-lg text-earth-cocoa shrink-0">
                              <Cpu className="w-4 h-4 text-earth-clay animate-pulse" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-baseline">
                                <h4 className="text-xs font-bold text-earth-cocoa">Automated Support Intervention</h4>
                                <span className="text-[9px] text-earth-cocoa/50">2m ago</span>
                              </div>
                              <p className="text-[10px] text-earth-cocoa/75 mt-0.5 leading-normal">
                                Resolved potential churn event for Client 'Atlas Corp'. Sentiment recovered to 85%.
                              </p>
                            </div>
                          </div>

                          {/* Item 3 */}
                          <div className="border border-earth-sage/20 bg-earth-bg/30 p-3.5 rounded-xl flex gap-3.5 items-start">
                            <div className="bg-earth-sage/25 p-1.5 rounded-lg text-earth-cocoa shrink-0">
                              <FileText className="w-4 h-4 text-earth-clay" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-baseline">
                                <h4 className="text-xs font-bold text-earth-cocoa">Page View: Documentation Portal</h4>
                                <span className="text-[9px] text-earth-cocoa/50">5m ago</span>
                              </div>
                              <p className="text-[10px] text-earth-cocoa/75 mt-0.5 leading-normal">
                                User searching for 'API Keys'. Interaction duration: 4m 12s.
                              </p>
                            </div>
                          </div>

                          {/* Item 4 */}
                          <div className="border border-earth-sage/20 bg-earth-bg/30 p-3.5 rounded-xl flex gap-3.5 items-start">
                            <div className="bg-earth-sage/25 p-1.5 rounded-lg text-earth-cocoa shrink-0">
                              <CreditCard className="w-4 h-4 text-earth-clay" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-baseline">
                                <h4 className="text-xs font-bold text-earth-cocoa">Conversion: Premium Plan Upgrade</h4>
                                <span className="text-[9px] text-earth-cocoa/50">8m ago</span>
                              </div>
                              <p className="text-[10px] text-earth-cocoa/75 mt-0.5 leading-normal">
                                Client 'Stellar Inc' upgraded seats from 50 to 100.
                              </p>
                            </div>
                          </div>
                        </div>

                        <button className="self-center mt-2 bg-earth-cocoa hover:bg-earth-clay text-earth-bg px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer shadow-md">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Updating Live Stream</span>
                        </button>
                      </div>

                      {/* Card 2: Heatmap */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                        <div className="flex justify-between items-center border-b border-earth-sage/20 pb-2">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">CUSTOMER SENTIMENT HEATMAP</span>
                          <span className="text-[10px] font-bold text-earth-sage uppercase">Regional emotional response density</span>
                        </div>
                        
                        <div className="relative rounded-xl border border-earth-sage/20 overflow-hidden h-[180px] bg-[#efe9d2]/25 flex items-center justify-center">
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(90,111,84,0.08),transparent)]" />
                          
                          <div className="text-[10px] text-earth-cocoa/40 font-mono tracking-widest text-center select-none uppercase">
                            [ Interactive Sentiment Globe Layer ]
                          </div>

                          {/* Tooltip Overlay */}
                          <div className="absolute bottom-4 left-6 bg-earth-cocoa border border-earth-cocoa/30 p-3 rounded-xl text-left shadow-lg">
                            <span className="text-[8px] uppercase tracking-wider text-earth-sage font-extrabold block">North America</span>
                            <span className="text-xs font-extrabold text-earth-bg block mt-0.5">89% POSITIVE SENTIMENT</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Right side column: Brand Health circular gauge & Automated wins (Span 5) */}
                    <div className="md:col-span-5 flex flex-col gap-6 w-full">
                      
                      {/* Card 3: Brand Health Circular progress gauge */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col justify-between items-center text-center relative overflow-hidden shadow-sm h-fit">
                        <div className="flex flex-col gap-1 border-b border-earth-sage/20 pb-2 text-left w-full">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">BRAND HEALTH SCORE</span>
                          <span className="text-[10px] font-bold text-earth-sage uppercase">Aggregate loyalty & performance index</span>
                        </div>

                        <div className="relative flex items-center justify-center my-6">
                          <svg className="w-32 h-32 transform -rotate-90">
                            <circle 
                              cx="64" cy="64" r="54" 
                              className="stroke-earth-cocoa/15" strokeWidth="10" fill="transparent" 
                            />
                            <circle 
                              cx="64" cy="64" r="54" 
                              className="stroke-earth-clay" strokeWidth="10" fill="transparent" 
                              strokeDasharray={2 * Math.PI * 54}
                              strokeDashoffset={2 * Math.PI * 54 * (1 - 0.92)}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-3xl font-black text-earth-cocoa">92</span>
                            <span className="text-[8px] uppercase font-bold text-earth-cocoa/60">OUT OF 100</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-earth-sage/20 pt-4 w-full">
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-extrabold text-earth-cocoa">8.4k</span>
                            <span className="text-[8px] text-earth-cocoa/50 font-bold uppercase tracking-wider">Active Users</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-extrabold text-status-healthy">+12%</span>
                            <span className="text-[8px] text-earth-cocoa/50 font-bold uppercase tracking-wider">MoM Growth</span>
                          </div>
                        </div>
                      </div>

                      {/* Card 4: Automated Engagement Wins progress bars */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                        <div className="flex flex-col gap-1 border-b border-earth-sage/20 pb-2 w-full text-left">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">AUTOMATED ENGAGEMENT WINS</span>
                          <span className="text-[10px] font-bold text-earth-sage uppercase">Where the platform worked for you</span>
                        </div>

                        <div className="flex flex-col gap-4.5 text-left">
                          {/* Item 1 */}
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-baseline text-xs">
                              <span className="font-bold text-earth-cocoa">Cart Recovery Bots</span>
                              <span className="font-extrabold text-earth-clay">+RM14.2k</span>
                            </div>
                            <div className="w-full bg-earth-cocoa/10 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-earth-clay" style={{ width: '72%' }} />
                            </div>
                            <div className="flex justify-between text-[8px] text-earth-cocoa/50 uppercase font-bold">
                              <span>Progress</span>
                              <span>72% Efficiency</span>
                            </div>
                          </div>

                          {/* Item 2 */}
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-baseline text-xs">
                              <span className="font-bold text-earth-cocoa">Churn Prediction (AI)</span>
                              <span className="font-extrabold text-earth-clay">112 Saved</span>
                            </div>
                            <div className="w-full bg-earth-cocoa/10 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-earth-clay" style={{ width: '45%' }} />
                            </div>
                            <div className="flex justify-between text-[8px] text-earth-cocoa/50 uppercase font-bold">
                              <span>Progress</span>
                              <span>45% Efficiency</span>
                            </div>
                          </div>

                          {/* Item 3 */}
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-baseline text-xs">
                              <span className="font-bold text-earth-cocoa">Dynamic Pricing Engine</span>
                              <span className="font-extrabold text-earth-clay">+4.5% Lift</span>
                            </div>
                            <div className="w-full bg-earth-cocoa/10 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-earth-clay" style={{ width: '89%' }} />
                            </div>
                            <div className="flex justify-between text-[8px] text-earth-cocoa/50 uppercase font-bold">
                              <span>Progress</span>
                              <span>89% Efficiency</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-[9px] italic text-earth-cocoa/60 text-center border-t border-earth-sage/10 pt-3 leading-normal">
                          Platform automation handled 82% of all repetitive support events today.
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* Bottom stats bar: 4 items */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-2">
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-3 flex flex-col gap-1 shadow-sm">
                      <span className="text-[8px] font-bold text-earth-cocoa/50 uppercase">API RESPONSE</span>
                      <span className="text-xs font-black text-earth-cocoa">24ms</span>
                    </div>
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-3 flex flex-col gap-1 shadow-sm">
                      <span className="text-[8px] font-bold text-earth-cocoa/50 uppercase">DATA FRESHNESS</span>
                      <span className="text-xs font-black text-status-healthy">Real-time</span>
                    </div>
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-3 flex flex-col gap-1 shadow-sm">
                      <span className="text-[8px] font-bold text-earth-cocoa/50 uppercase">TRANSPARENCY INDEX</span>
                      <span className="text-xs font-black text-earth-cocoa font-mono">Level 5</span>
                    </div>
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-3 flex flex-col gap-1 shadow-sm">
                      <span className="text-[8px] font-bold text-earth-cocoa/50 uppercase">PREMIUM ADVANTAGE</span>
                      <span className="text-xs font-black text-earth-clay">Enabled</span>
                    </div>
                  </div>
                </>
  );
}
