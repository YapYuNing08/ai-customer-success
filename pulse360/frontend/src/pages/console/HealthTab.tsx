import { Heart, Clock, CreditCard, ShieldAlert } from 'lucide-react';

export function HealthTab(props: any) {
  const { users, avgHealth, criticalCount, totalMRR } = props;
  return (
                <>
                  {/* Health View */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full animate-fadeIn">
                    <div>
                      <h1 className="text-xl md:text-2xl font-extrabold text-earth-cocoa tracking-tight font-serif">Customer Health Analytics</h1>
                      <p className="text-xs text-earth-cocoa/75 mt-1 max-w-xl">
                        Aggregated metrics, health trends, and telemetry breakdowns across active accounts.
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

                  {/* Health Metric Cards Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full animate-fadeIn">
                    {/* Card 1 */}
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-earth-cocoa/50 uppercase">Average Portfolio Health</span>
                        <Heart className="w-4 h-4 text-status-healthy" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-earth-cocoa">{avgHealth}</span>
                        <span className="text-[9px] bg-status-healthy/15 text-status-healthy px-1.5 py-0.5 rounded font-extrabold uppercase">Stable</span>
                      </div>
                      <span className="text-[9px] text-earth-cocoa/65">Across all active accounts</span>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-earth-cocoa/50 uppercase">Critical Health Alerts</span>
                        <ShieldAlert className="w-4 h-4 text-status-critical" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-earth-cocoa">{criticalCount}</span>
                        <span className="text-[9px] bg-status-critical/15 text-status-critical px-1.5 py-0.5 rounded font-extrabold uppercase">Action Needed</span>
                      </div>
                      <span className="text-[9px] text-earth-cocoa/65">Users below 40% health score</span>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-earth-cocoa/50 uppercase">Total Portfolio MRR</span>
                        <CreditCard className="w-4 h-4 text-earth-clay" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-earth-cocoa">${totalMRR.toLocaleString()}</span>
                      </div>
                      <span className="text-[9px] text-earth-cocoa/65">Active monthly recurring revenue</span>
                    </div>
                  </div>

                  {/* Main health analytics panels */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch animate-fadeIn">
                    
                    {/* Full Width Column */}
                    <div className="lg:col-span-12 flex flex-col gap-6 w-full">
                      {/* Recent transitions log */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm text-left">
                        <div className="flex justify-between items-center border-b border-earth-sage/20 pb-2">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">HEALTH STATE TRANSITIONS</span>
                          <span className="text-[10px] font-bold text-earth-sage uppercase">Distressed Users</span>
                        </div>

                        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                          {users.filter(u => u.healthScore < 70).map(u => (
                            <div key={u.id} className="border border-earth-sage/20 bg-earth-bg/30 p-3 rounded-xl flex justify-between items-center">
                              <div className="flex gap-3 items-center">
                                <span className={`w-2.5 h-2.5 rounded-full ${u.healthScore < 40 ? 'bg-status-critical' : 'bg-status-risk'}`} />
                                <div>
                                  <h4 className="text-xs font-bold text-earth-cocoa">{u.name}</h4>
                                  <p className="text-[10px] text-earth-cocoa/75 mt-0.5">
                                    Risk Factor: {u.warningFlags.join(', ') || 'Low Usage'}
                                  </p>
                                </div>
                              </div>
                              <span className={`text-[10px] font-black ${u.healthScore < 40 ? 'text-status-critical' : 'text-status-risk'}`}>
                                {u.healthScore}/100
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                </>
  );
}
