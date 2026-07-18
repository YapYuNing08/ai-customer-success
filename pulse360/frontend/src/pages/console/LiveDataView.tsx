import { Radio, Cpu, Clock } from 'lucide-react';

export function LiveDataView(props: any) {
  const { telemetryFeed, setTelemetryFeed, outageRate, billingFailureRate, users, inspectorUserId, setInspectorUserId } = props;
  return (
                <>
                  {/* Live Data Telemetry View */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full animate-fadeIn">
                    <div>
                      <h1 className="text-xl md:text-2xl font-extrabold text-earth-cocoa tracking-tight font-serif">Live Telemetry & Event Stream</h1>
                      <p className="text-xs text-earth-cocoa/75 mt-1 max-w-xl">
                        Raw data streams, automated webhook triggers, and simulated database event tracking.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold shrink-0">
                      <div className="bg-[#276B2B]/15 border border-[#276B2B]/30 rounded-lg px-3 py-1.5 text-status-healthy flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-status-healthy animate-pulse" />
                        <span>Console Active</span>
                      </div>
                      <div className="bg-earth-cocoa border border-earth-cocoa text-earth-bg rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Live Feed</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch animate-fadeIn">
                    {/* Left Column: Event Stream Console (Span 7) */}
                    <div className="lg:col-span-7 flex flex-col gap-4 w-full">
                      <div className="bg-[#181510] border border-earth-sage/30 rounded-2xl overflow-hidden shadow-inner flex flex-col w-full text-left">
                        <div className="p-4 border-b border-earth-sage/10 bg-[#252019] flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-status-critical" />
                            <span className="w-3 h-3 rounded-full bg-status-risk" />
                            <span className="w-3 h-3 rounded-full bg-status-healthy" />
                            <span className="text-[10px] font-mono text-earth-bg/50 ml-2 font-bold">TERMINAL::telemetry_feed.log</span>
                          </div>
                          <button 
                            onClick={() => setTelemetryFeed([`[${new Date().toLocaleTimeString()}] Telemetry feed cleared.`])}
                            className="bg-earth-bg/10 hover:bg-earth-bg/25 text-earth-bg/60 hover:text-earth-bg text-[9px] font-bold px-2 py-1 rounded transition-all cursor-pointer font-mono"
                          >
                            CLEAR LOGS
                          </button>
                        </div>
                        
                        <div className="p-5 font-mono text-[11px] text-earth-bg/85 h-[400px] overflow-y-auto flex flex-col gap-2 relative leading-relaxed bg-[#181510]">
                          {telemetryFeed.map((line, idx) => {
                            let textColor = "text-earth-bg/85";
                            if (line.includes("ALERT:") || line.includes("CRITICAL:") || line.includes("Outage")) {
                              textColor = "text-status-critical";
                            } else if (line.includes("SUCCESS:") || line.includes("recovered") || line.includes("resolved")) {
                              textColor = "text-status-healthy";
                            } else if (line.includes("SYSTEM:") || line.includes("SubSentry")) {
                              textColor = "text-earth-sage";
                            }
                            return (
                              <div key={idx} className={`${textColor} border-b border-earth-bg/5 pb-1`}>
                                {line}
                              </div>
                            );
                          })}
                          <div className="flex items-center gap-1 text-status-healthy animate-pulse mt-1">
                            <span>$</span>
                            <span className="w-2 h-4 bg-status-healthy" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Statistics & JSON Inspector (Span 5) */}
                    <div className="lg:col-span-5 flex flex-col gap-6 w-full text-left">
                      {/* Sub-card 1: Telemetry Stats */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                        <div className="flex justify-between items-center border-b border-earth-sage/20 pb-2">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">TELEMETRY DIAGNOSTICS</span>
                          <Radio className="w-3.5 h-3.5 text-earth-clay animate-pulse" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                          <div className="bg-earth-bg/35 border border-earth-sage/15 p-3 rounded-xl">
                            <span className="text-[9px] text-earth-cocoa/50 block uppercase">Outage Rate</span>
                            <span className="text-base font-black text-status-critical mt-0.5 block">{outageRate}%</span>
                          </div>
                          <div className="bg-earth-bg/35 border border-earth-sage/15 p-3 rounded-xl">
                            <span className="text-[9px] text-earth-cocoa/50 block uppercase">Renewal Fail Chance</span>
                            <span className="text-base font-black text-status-risk mt-0.5 block">{billingFailureRate}%</span>
                          </div>
                          <div className="bg-earth-bg/35 border border-earth-sage/15 p-3 rounded-xl">
                            <span className="text-[9px] text-earth-cocoa/50 block uppercase">Network Latency</span>
                            <span className="text-base font-black text-status-healthy mt-0.5 block">18ms</span>
                          </div>
                          <div className="bg-earth-bg/35 border border-[#efe9d2]/15 p-3 rounded-xl">
                            <span className="text-[9px] text-earth-cocoa/50 block uppercase">Active Consumers</span>
                            <span className="text-base font-black text-earth-cocoa mt-0.5 block">{users.length}</span>
                          </div>
                        </div>
                      </div>

                      {/* Sub-card 2: JSON Object Inspector */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
                        <div className="flex justify-between items-center border-b border-earth-sage/20 pb-2">
                          <span className="text-[10px] font-extrabold uppercase text-earth-cocoa/75 tracking-wider">JSON OBJECT INSPECTOR</span>
                          <Cpu className="w-3.5 h-3.5 text-[#276B2B]" />
                        </div>

                        <div className="flex flex-col gap-2 mt-1">
                          <label className="text-[9px] font-extrabold text-earth-cocoa/65 uppercase">Select Database Target</label>
                          <select 
                            value={inspectorUserId}
                            onChange={(e) => setInspectorUserId(e.target.value)}
                            className="bg-earth-bg border border-earth-sage/35 rounded-xl px-3 py-2 text-xs text-earth-cocoa font-bold outline-none cursor-pointer focus:border-earth-clay w-full"
                          >
                            {users.map(u => (
                              <option key={u.id} value={u.id}>{u.name} ({u.plan})</option>
                            ))}
                          </select>
                        </div>

                        <div className="mt-2 text-left">
                          <span className="text-[9px] font-extrabold text-earth-cocoa/65 uppercase block mb-1.5">Raw JSON Entity Payload</span>
                          <pre className="bg-[#181510] text-[#A6E22E] p-4 rounded-xl border border-earth-sage/20 text-[10px] font-mono overflow-auto h-[210px] shadow-inner select-all leading-normal">
                            {JSON.stringify(users.find(u => u.id === inspectorUserId) || users[0], null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
  );
}
