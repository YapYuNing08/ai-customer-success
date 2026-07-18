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
                      <p className="text-xs text-earth-cocoa/75 mt-1 max-w-xl">
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
                        <span>Last 24 Hours</span>
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
                        className="w-full bg-earth-bg border border-earth-sage/35 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:border-earth-clay text-earth-cocoa font-bold placeholder-earth-cocoa/50"
                      />
                      <Search className="w-4 h-4 text-earth-cocoa/50 absolute left-3 top-2.5" />
                    </div>

                    <div className="flex gap-3">
                      {/* Filter by Plan */}
                      <select
                        value={filterPlan}
                        onChange={(e) => setFilterPlan(e.target.value)}
                        className="bg-earth-bg border border-earth-sage/35 rounded-xl px-3 py-2 text-xs text-earth-cocoa font-bold outline-none cursor-pointer focus:border-earth-clay min-w-[120px]"
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
                        className="bg-earth-bg border border-earth-sage/35 rounded-xl px-3 py-2 text-xs text-earth-cocoa font-bold outline-none cursor-pointer focus:border-earth-clay min-w-[120px]"
                      >
                        <option value="all">All Risks</option>
                        <option value="low">Low Risk</option>
                        <option value="medium">Medium Risk</option>
                        <option value="high">High Risk</option>
                      </select>
                    </div>
                  </div>

                  {/* Customer Table List */}
                  <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl overflow-hidden shadow-sm w-full animate-fadeIn">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-earth-sage/20 bg-earth-sage/10 text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">
                            <th className="py-3 px-4">Customer</th>
                            <th className="py-3 px-4">Plan</th>
                            <th className="py-3 px-4">Health Score</th>
                            <th className="py-3 px-4">Churn Probability</th>
                            <th className="py-3 px-4">Contract MRR</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-earth-sage/10 text-xs">
                          {filteredConsoleUsers.length > 0 ? (
                            filteredConsoleUsers.map(u => {
                              const isHighRisk = u.churnProbability > 50;
                              const isMedRisk = u.churnProbability <= 50 && u.churnProbability > 15;
                              return (
                                <tr key={u.id} className="hover:bg-earth-sage/5 transition-colors text-earth-cocoa">
                                  <td className="py-3 px-4 flex items-center gap-3">
                                    <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full border border-earth-sage/20 object-cover bg-white" />
                                    <div>
                                      <span className="font-extrabold block">{u.name}</span>
                                      <span className="text-[10px] text-earth-cocoa/65 block mt-0.5">{u.email}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="text-[10px] px-2 py-0.5 border border-earth-sage/30 rounded-full font-bold uppercase tracking-wider bg-earth-bg">
                                      {u.plan}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`font-black text-sm ${
                                      u.healthScore > 70 ? 'text-status-healthy' : u.healthScore > 40 ? 'text-status-risk' : 'text-status-critical'
                                    }`}>
                                      {u.healthScore}/100
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 w-48">
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 bg-earth-cocoa/10 rounded-full h-1.5">
                                        <div 
                                          className={`h-1.5 rounded-full ${
                                            isHighRisk ? 'bg-status-critical' : isMedRisk ? 'bg-status-risk' : 'bg-status-healthy'
                                          }`} 
                                          style={{ width: `${u.churnProbability}%` }}
                                        />
                                      </div>
                                      <span className="font-bold text-[10px] w-8 text-right">{Math.round(u.churnProbability)}%</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="font-extrabold text-earth-clay">RM{u.mrr}/mo</span>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <button 
                                      onClick={() => {
                                        setSelectedConsoleUser(u);
                                      }}
                                      className="bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                                    >
                                      View Insights
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-earth-cocoa/50 font-bold">
                                No customers found matching the search criteria.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  </>
                )
  );
}
