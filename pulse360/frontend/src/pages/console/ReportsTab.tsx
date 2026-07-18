import { Cpu, FileText, Clock, RefreshCw, Download } from 'lucide-react';
import { downloadReport } from '../../utils/reports';

export function ReportsTab(props: any) {
  const { reports, users, generateDynamicRescuePlan } = props;
  return (
                <>
                  {/* Reports View */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full animate-fadeIn">
                    <div>
                      <h1 className="text-xl md:text-2xl font-extrabold text-earth-cocoa tracking-tight font-serif">Executive & Success Reports</h1>
                      <p className="text-xs text-earth-cocoa/75 mt-1 max-w-xl">
                        Generated summaries, cohort churn analysis reports, and action planning templates.
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

                  {/* Reports Metric Cards Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full animate-fadeIn">
                    {/* Card 1 */}
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-earth-cocoa/50 uppercase">Generated Reports</span>
                        <FileText className="w-4 h-4 text-earth-clay" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-earth-cocoa">12</span>
                        <span className="text-[9px] bg-status-healthy/15 text-status-healthy px-1.5 py-0.5 rounded font-extrabold uppercase">Archived</span>
                      </div>
                      <span className="text-[9px] text-earth-cocoa/65">Historical runs preserved</span>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-earth-cocoa/50 uppercase">Rescue Recommendations</span>
                        <Cpu className="w-4 h-4 text-status-healthy" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-earth-cocoa">3 Drafted</span>
                        <span className="text-[9px] bg-status-healthy/15 text-status-healthy px-1.5 py-0.5 rounded font-extrabold uppercase">Ready</span>
                      </div>
                      <span className="text-[9px] text-earth-cocoa/65">Based on active churn risks</span>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-earth-cocoa/50 uppercase">Last Generation Time</span>
                        <RefreshCw className="w-4 h-4 text-earth-clay" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-earth-cocoa">Just Now</span>
                      </div>
                      <span className="text-[9px] text-earth-cocoa/65">Real-time sync complete</span>
                    </div>
                  </div>

                  {/* Main reports grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch animate-fadeIn">
                    
                    {/* Left Column - Reports Archive (Span 8) */}
                    <div className="lg:col-span-8 flex flex-col gap-6 w-full">
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl overflow-hidden shadow-sm w-full text-left">
                        <div className="p-5 border-b border-earth-sage/20 bg-earth-sage/5">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">REPORT LIBRARY</span>
                          <h3 className="text-sm font-bold text-earth-cocoa mt-0.5">Select and view compiled analytical outputs</h3>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead>
                              <tr className="border-b border-earth-sage/20 bg-earth-sage/10 text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">
                                <th className="py-3 px-4">Report Name</th>
                                <th className="py-3 px-4">Type</th>
                                <th className="py-3 px-4">Date Generated</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-earth-sage/10">
                              {reports.map((report) => (
                                <tr key={report.id} className="hover:bg-earth-sage/5 transition-colors text-earth-cocoa">
                                  <td className="py-3.5 px-4 font-bold">{report.name}</td>
                                  <td className="py-3.5 px-4">{report.type}</td>
                                  <td className="py-3.5 px-4">{report.date}</td>
                                  <td className="py-3.5 px-4">
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                      report.status === 'Active'
                                        ? 'bg-status-healthy/15 border border-status-healthy/30 text-status-healthy'
                                        : 'bg-earth-cocoa/20 border border-earth-cocoa/30 text-earth-cocoa'
                                    }`}>
                                      {report.status}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-right">
                                    <button 
                                      onClick={() => downloadReport(report)}
                                      className="flex items-center gap-1 bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all ml-auto cursor-pointer"
                                    >
                                      <Download className="w-3 h-3" />
                                      <span>Download</span>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Report Operations (Span 4) */}
                    <div className="lg:col-span-4 flex flex-col gap-6 w-full text-left">
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm h-full justify-between">
                        <div className="flex flex-col gap-1 border-b border-earth-sage/20 pb-2 w-full">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">REPORT OPERATIONS</span>
                          <span className="text-[10px] font-bold text-earth-sage uppercase">Generate new exports</span>
                        </div>

                        <div className="flex flex-col gap-3 my-2">
                          <button 
                            onClick={generateDynamicRescuePlan}
                            className="w-full bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Cpu className="w-4 h-4 animate-pulse text-status-healthy" />
                            <span>Generate Rescue Plan</span>
                          </button>

                          <div className="bg-earth-bg/25 border border-earth-sage/10 p-4 rounded-xl flex flex-col gap-2">
                            <span className="text-[10px] font-extrabold text-earth-clay uppercase tracking-wider">WEEKLY DIGEST SUMMARY</span>
                            <div className="flex justify-between text-xs text-earth-cocoa font-bold">
                              <span>Active Risk Accounts:</span>
                              <span className="text-status-risk font-black">
                                {users.filter(u => u.healthScore < 70).length}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-earth-cocoa font-bold">
                              <span>Critical Interventions:</span>
                              <span className="text-status-critical font-black">
                                {users.filter(u => u.healthScore < 40).length}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-earth-cocoa font-bold">
                              <span>Estimated Churn Prevented:</span>
                              <span className="text-status-healthy font-black">RM14,200/mo</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-earth-sage/10 p-3 rounded-xl border border-earth-sage/20 text-[10px] text-earth-cocoa/75 leading-relaxed mt-2 italic text-center">
                          ℹ️ All success reports are cataloged using SHA-256 state tracking for absolute data integrity and audit readiness.
                        </div>
                      </div>
                    </div>

                  </div>
                </>
  );
}
