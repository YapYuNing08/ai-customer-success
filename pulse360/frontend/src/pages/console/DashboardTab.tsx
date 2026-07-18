import { Cpu, Users, Heart, Clock, Activity } from 'lucide-react';

export function DashboardTab(props: any) {
  const { dist, expScore, expLabel } = props;
  return (
                <>
                  {/* Dashboard View */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full">
                    <div>
                      <h1 className="text-xl md:text-2xl font-extrabold text-earth-cocoa tracking-tight">Client Experience Dashboard</h1>
                      <p className="text-xs text-earth-cocoa/75 mt-1 max-w-xl">
                        Strategic metrics, health distribution, and experience analytics across your customer base.
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

                  {/* Metric Cards Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    {/* Card 1 */}
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-earth-cocoa/50 uppercase">Experience Score</span>
                        <Heart className="w-4 h-4 text-status-healthy" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-earth-cocoa">{expScore}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                          expScore > 70 ? 'bg-status-healthy/15 text-status-healthy' : expScore > 40 ? 'bg-status-risk/15 text-status-risk' : 'bg-status-critical/15 text-status-critical'
                        }`}>{expLabel}</span>
                      </div>
                      <span className="text-[9px] text-earth-cocoa/65">Average health across all customers</span>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-earth-cocoa/50 uppercase">Active Accounts</span>
                        <Users className="w-4 h-4 text-earth-clay" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-earth-cocoa">{dist.total_customers.toLocaleString()}</span>
                      </div>
                      <span className="text-[9px] text-earth-cocoa/65">{dist.critical_count.toLocaleString()} accounts in critical state</span>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-earth-cocoa/50 uppercase">Automated Wins Saved</span>
                        <Cpu className="w-4 h-4 text-status-healthy" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-earth-cocoa">$14,200</span>
                      </div>
                      <span className="text-[9px] text-earth-cocoa/65">82% win rate</span>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-earth-cocoa/50 uppercase">Avg Response Time</span>
                        <Activity className="w-4 h-4 text-earth-clay" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-earth-cocoa">24ms</span>
                      </div>
                      <span className="text-[9px] text-earth-cocoa/65">99.99% uptime</span>
                    </div>
                  </div>

                  {/* Main section grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
                    
                    {/* Left Column (Span 8) */}
                    <div className="lg:col-span-8 flex flex-col gap-6 w-full">
                      {/* Health distribution block */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                        <div className="flex justify-between items-center border-b border-earth-sage/20 pb-2">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">CUSTOMER HEALTH DISTRIBUTION</span>
                          <span className="text-[10px] font-bold text-earth-sage uppercase">Segmentation by active user count</span>
                        </div>

                        {/* Stacked bar chart representation */}
                        <div className="flex flex-col gap-4">
                          <div className="w-full h-5 rounded-lg flex overflow-hidden border border-earth-sage/20">
                            <div className="h-full bg-status-healthy" style={{ width: `${dist.healthy_pct}%` }} title={`Healthy: ${dist.healthy_pct}%`} />
                            <div className="h-full bg-status-risk" style={{ width: `${dist.at_risk_pct}%` }} title={`Warning: ${dist.at_risk_pct}%`} />
                            <div className="h-full bg-status-critical" style={{ width: `${dist.critical_pct}%` }} title={`Critical: ${dist.critical_pct}%`} />
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-xs font-bold text-earth-cocoa/80">
                            <div className="flex flex-col gap-0.5 border-l-4 border-status-healthy pl-2">
                              <span className="text-[9px] text-earth-cocoa/50 uppercase">Healthy</span>
                              <span className="text-sm font-black">{dist.healthy_count.toLocaleString()} users</span>
                              <span className="text-[9px] text-status-healthy font-extrabold">{dist.healthy_pct}%</span>
                            </div>
                            <div className="flex flex-col gap-0.5 border-l-4 border-status-risk pl-2">
                              <span className="text-[9px] text-earth-cocoa/50 uppercase">Warning</span>
                              <span className="text-sm font-black">{dist.at_risk_count.toLocaleString()} users</span>
                              <span className="text-[9px] text-status-risk font-extrabold">{dist.at_risk_pct}%</span>
                            </div>
                            <div className="flex flex-col gap-0.5 border-l-4 border-status-critical pl-2">
                              <span className="text-[9px] text-earth-cocoa/50 uppercase">Critical</span>
                              <span className="text-sm font-black">{dist.critical_count.toLocaleString()} users</span>
                              <span className="text-[9px] text-status-critical font-extrabold">{dist.critical_pct}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Telemetry Status Breakdown */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm text-left">
                        <div className="flex justify-between items-center border-b border-earth-sage/20 pb-2">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">TELEMETRY STATUS BREAKDOWN</span>
                          <span className="text-[10px] font-bold text-earth-sage uppercase">System checks</span>
                        </div>

                        <div className="flex flex-col gap-4">
                          {/* Item 1 */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-baseline text-xs">
                              <span className="font-bold text-earth-cocoa">Login Frequency (Engagement)</span>
                              <span className="font-extrabold text-status-healthy">82%</span>
                            </div>
                            <div className="w-full bg-earth-cocoa/10 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-status-healthy" style={{ width: '82%' }} />
                            </div>
                          </div>

                          {/* Item 2 */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-baseline text-xs">
                              <span className="font-bold text-earth-cocoa">Feature Utilization (Usage)</span>
                              <span className="font-extrabold text-earth-clay">64%</span>
                            </div>
                            <div className="w-full bg-earth-cocoa/10 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-earth-clay" style={{ width: '64%' }} />
                            </div>
                          </div>

                          {/* Item 3 */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-baseline text-xs">
                              <span className="font-bold text-earth-cocoa">Support Ticket Resolution (Response)</span>
                              <span className="font-extrabold text-status-healthy">91%</span>
                            </div>
                            <div className="w-full bg-earth-cocoa/10 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-status-healthy" style={{ width: '91%' }} />
                            </div>
                          </div>

                          {/* Item 4 */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-baseline text-xs">
                              <span className="font-bold text-earth-cocoa">Payment & Invoicing (Billing)</span>
                              <span className="font-extrabold text-status-healthy">94%</span>
                            </div>
                            <div className="w-full bg-earth-cocoa/10 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-status-healthy" style={{ width: '94%' }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recent resolutions log */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                        <div className="flex justify-between items-center border-b border-earth-sage/20 pb-2">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">RECENT RESOLUTIONS</span>
                          <span className="text-[10px] font-bold text-earth-sage uppercase">Automated support interventions</span>
                        </div>

                        <div className="flex flex-col gap-3">
                          <div className="border border-earth-sage/20 bg-earth-bg/30 p-3 rounded-xl flex justify-between items-center">
                            <div className="flex gap-3 items-center">
                              <span className="w-2.5 h-2.5 rounded-full bg-status-healthy" />
                              <div>
                                <h4 className="text-xs font-bold text-earth-cocoa">Atlas Corp</h4>
                                <p className="text-[10px] text-earth-cocoa/75">Sentiment recovered to 85% after grace period extension.</p>
                              </div>
                            </div>
                            <span className="text-[9px] bg-status-healthy/15 text-status-healthy border border-status-healthy/30 px-2 py-0.5 rounded font-extrabold uppercase">Success</span>
                          </div>

                          <div className="border border-earth-sage/20 bg-earth-bg/30 p-3 rounded-xl flex justify-between items-center">
                            <div className="flex gap-3 items-center">
                              <span className="w-2.5 h-2.5 rounded-full bg-status-healthy" />
                              <div>
                                <h4 className="text-xs font-bold text-earth-cocoa">Lagos Ventures</h4>
                                <p className="text-[10px] text-earth-cocoa/75">Invoice issue resolved via automated grace period extension.</p>
                              </div>
                            </div>
                            <span className="text-[9px] bg-status-healthy/15 text-status-healthy border border-status-healthy/30 px-2 py-0.5 rounded font-extrabold uppercase">Success</span>
                          </div>

                          <div className="border border-earth-sage/20 bg-earth-bg/30 p-3 rounded-xl flex justify-between items-center">
                            <div className="flex gap-3 items-center">
                              <span className="w-2.5 h-2.5 rounded-full bg-earth-clay" />
                              <div>
                                <h4 className="text-xs font-bold text-earth-cocoa">Northwind Traders</h4>
                                <p className="text-[10px] text-earth-cocoa/75">Cost-optimization downgrade advice executed.</p>
                              </div>
                            </div>
                            <span className="text-[9px] bg-earth-clay/15 text-earth-clay border border-earth-clay/30 px-2 py-0.5 rounded font-extrabold uppercase">Optimized</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Right Column (Span 4) */}
                    <div className="lg:col-span-4 flex flex-col gap-6 w-full">
                      {/* Experience drivers */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm h-full">
                        <div className="flex flex-col gap-1 border-b border-earth-sage/20 pb-2 w-full text-left">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">CUSTOMER SATISFACTION DRIVERS</span>
                          <span className="text-[10px] font-bold text-earth-sage uppercase">What keeps customers happy & loyal</span>
                        </div>

                        <div className="flex flex-col gap-4 text-xs font-bold text-earth-cocoa/80 text-left">
                          <div className="flex justify-between items-center p-2 bg-earth-bg/25 rounded-lg border border-earth-sage/10">
                            <div>
                              <span>System Reliability</span>
                              <span className="text-[9px] text-earth-cocoa/50 block font-normal mt-0.5">How often the app is online & working</span>
                            </div>
                            <span className="text-status-healthy font-extrabold">+18%</span>
                          </div>

                          <div className="flex justify-between items-center p-2 bg-earth-bg/25 rounded-lg border border-earth-sage/10">
                            <div>
                              <span>Increasing Usage</span>
                              <span className="text-[9px] text-earth-cocoa/50 block font-normal mt-0.5">Customers using more features over time</span>
                            </div>
                            <span className="text-status-healthy font-extrabold">+12%</span>
                          </div>

                          <div className="flex justify-between items-center p-2 bg-earth-bg/25 rounded-lg border border-earth-sage/10">
                            <div>
                              <span>Regular Check-Ins</span>
                              <span className="text-[9px] text-earth-cocoa/50 block font-normal mt-0.5">Our customer support talking with them</span>
                            </div>
                            <span className="text-status-healthy font-extrabold">+15%</span>
                          </div>

                          <div className="flex justify-between items-center p-2 bg-earth-bg/25 rounded-lg border border-earth-sage/10">
                            <div>
                              <span>Failed Payments</span>
                              <span className="text-[9px] text-earth-cocoa/50 block font-normal mt-0.5">How often credit card renewals decline</span>
                            </div>
                            <span className="text-status-critical font-extrabold">-8%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </>
  );
}
