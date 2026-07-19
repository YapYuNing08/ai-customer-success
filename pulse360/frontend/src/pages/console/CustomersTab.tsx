import { Search, Clock } from 'lucide-react';
import { ActiveUserInsight } from '../../components/ActiveUserInsight';

export function CustomersTab(props: any) {
  const { selectedConsoleUser, setSelectedConsoleUser, users, handleUpdateUser, customerSearch, setCustomerSearch, filterPlan, setFilterPlan, filterRisk, setFilterRisk, filteredConsoleUsers } = props;
  return (
                selectedConsoleUser ? (
                  <ActiveUserInsight 
                    user={users.find(u => u.id === selectedConsoleUser.id) || selectedConsoleUser} 
                    onBack={() => setSelectedConsoleUser(null)} 
                    onUpdateUser={(updatedUser) => {
                      handleUpdateUser(updatedUser);
                      setSelectedConsoleUser(updatedUser);
                    }}
                  />
                ) : (
                  <>
                    {/* Customers View */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full animate-fadeIn">
                    <div>
                      <h1 className="text-xl md:text-2xl font-extrabold text-earth-cocoa tracking-tight font-serif">Customer Directory</h1>
                      <p className="text-sm text-black mt-1 max-w-xl font-medium">
                        Manage, search, and monitor active customer accounts, contract value, and health standings.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold shrink-0">
                      <div className="bg-[#276B2B]/15 border border-[#276B2B]/30 rounded-lg px-3 py-1.5 text-status-healthy flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-status-healthy animate-pulse" />
                        <span>System Live</span>
                      </div>
                      <div className="bg-earth-cocoa border border-earth-cocoa text-earth-bg rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Last 30 Days</span>
                      </div>
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 shadow-sm w-full animate-fadeIn">
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        placeholder="Search customers by name, email, or location..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full bg-earth-bg border border-earth-sage/35 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:border-earth-clay text-black font-semibold placeholder-black/45"
                      />
                      <Search className="w-4 h-4 text-black/50 absolute left-3 top-2.5" />
                    </div>

                    <div className="flex gap-3">
                      {/* Filter by Plan */}
                      <select
                        value={filterPlan}
                        onChange={(e) => setFilterPlan(e.target.value)}
                        className="bg-earth-bg border border-earth-sage/35 rounded-xl px-3 py-2 text-xs text-black font-bold outline-none cursor-pointer focus:border-earth-clay min-w-[120px]"
                      >
                        <option value="all">All Plans</option>
                        <option value="enterprise">Enterprise</option>
                        <option value="growth">Growth</option>
                        <option value="starter">Starter</option>
                      </select>

                      {/* Filter by Risk */}
                      <select
                        value={filterRisk}
                        onChange={(e) => setFilterRisk(e.target.value)}
                        className="bg-earth-bg border border-earth-sage/35 rounded-xl px-3 py-2 text-xs text-black font-bold outline-none cursor-pointer focus:border-earth-clay min-w-[120px]"
                      >
                        <option value="all">All Risks</option>
                        <option value="low">Low Risk</option>
                        <option value="medium">Medium Risk</option>
                        <option value="high">High Risk</option>
                      </select>
                    </div>
                  </div>

                  {/* Grid Cards Container */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full animate-fadeIn">
                    {filteredConsoleUsers.length > 0 ? (
                      filteredConsoleUsers.map(u => {
                        const isHighRisk = u.churnProbability > 50;
                        const isMedRisk = u.churnProbability <= 50 && u.churnProbability > 15;
                        return (
                          <div 
                            key={u.id} 
                            className="bg-[#efe9d2]/40 border border-earth-sage/30 p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-all text-earth-cocoa hover:bg-[#efe9d2]/60"
                          >
                            <div className="flex flex-col gap-3">
                              {/* Card Header */}
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex items-center gap-3">
                                  <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full border border-earth-sage/20 object-cover bg-white shrink-0" />
                                  <div className="text-left">
                                    <h4 className="font-extrabold text-sm leading-tight line-clamp-1 text-black">{u.name}</h4>
                                    <span className="text-xs text-black font-normal block mt-0.5">{u.location}</span>
                                  </div>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 border border-earth-sage/35 rounded-full font-black uppercase tracking-wider bg-earth-bg">
                                  {u.plan}
                                </span>
                              </div>

                              {/* Health & Risk Stats */}
                              <div className="bg-earth-bg/25 border border-earth-sage/10 p-3 rounded-xl flex justify-between items-center text-xs font-bold mt-1">
                                <div className="flex flex-col text-left">
                                  <span className="text-[10px] text-black font-normal uppercase">Health Score</span>
                                  <span className={`text-base font-black ${
                                    u.healthScore > 70 ? 'text-status-healthy' : u.healthScore > 40 ? 'text-status-risk' : 'text-status-critical'
                                  }`}>
                                    {u.healthScore}/100
                                  </span>
                                </div>
                                <div className="flex flex-col text-right">
                                  <span className="text-[10px] text-black font-normal uppercase">Churn Probability</span>
                                  <span className={`text-base font-black ${
                                    isHighRisk ? 'text-status-critical' : isMedRisk ? 'text-status-risk' : 'text-status-healthy'
                                  }`}>
                                    {Math.round(u.churnProbability)}%
                                  </span>
                                </div>
                              </div>

                              {/* Warning Flags */}
                              <div className="flex flex-wrap gap-1.5 min-h-[22px] items-center">
                                {u.warningFlags.length > 0 ? (
                                  u.warningFlags.map((flag, idx) => (
                                    <span 
                                      key={idx} 
                                      className={`text-[9.5px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                                        flag === 'Regional Outage' || flag === 'Failed Payment'
                                          ? 'bg-status-critical/15 text-status-critical border border-status-critical/35'
                                          : 'bg-status-risk/15 text-status-risk border border-status-risk/35'
                                      }`}
                                    >
                                      ⚠️ {flag}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-status-healthy font-extrabold uppercase tracking-wider flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-status-healthy rounded-full" />
                                    Account Stable
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="border-t border-earth-sage/10 pt-3 flex gap-2 w-full mt-1">
                              <button 
                                onClick={() => {
                                  setSelectedConsoleUser(u);
                                }}
                                className="flex-1 bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-extrabold text-xs py-2 rounded-xl transition-all cursor-pointer text-center"
                              >
                                View Insights
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full py-12 text-center text-black/75 text-sm font-bold">
                        No customers found matching the search criteria.
                      </div>
                    )}
                  </div>
                  </>
                )
  );
}
