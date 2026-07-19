import { useState, useEffect } from 'react';
import { Cpu, Users, Heart, Clock, Activity, Send, Mail, MessageCircle } from 'lucide-react';

export function DashboardTab(props: any) {
  const { dist, expScore, expLabel, users, addTelemetry } = props;
  const [activeSubTab, setActiveSubTab] = useState<'distribution' | 'interventions'>('distribution');
  const [activeBroadcast, setActiveBroadcast] = useState<{
    groupName: string;
    type: 'email' | 'whatsapp';
    recipients: any[];
    subject: string;
    body: string;
  } | null>(null);
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [recipientSearch, setRecipientSearch] = useState('');

  // Automatically select all recipients when modal opens
  useEffect(() => {
    if (activeBroadcast) {
      setSelectedRecipientIds(activeBroadcast.recipients.map(r => r.id));
      setRecipientSearch('');
    } else {
      setSelectedRecipientIds([]);
      setRecipientSearch('');
    }
  }, [activeBroadcast]);

  const getBroadcastTemplate = (groupName: string, type: 'email' | 'whatsapp', names: string[]) => {
    const isBilling = groupName.includes('Billing') || groupName.includes('Payment');
    const isOutage = groupName.includes('Outage');

    let subject = '';
    let body = '';

    if (type === 'email') {
      if (isBilling) {
        subject = 'Action Required: Updating your Falcon360 payment card';
        body = `Dear Falcon360 Customer,

We recently encountered a renewal issue with your subscription payment card on file.

To prevent any interruptions to your service, we have applied a 14-day grace extension on your account. You can securely update your billing details in your customer console.

Please let us know if you need any assistance!

Best regards,
Customer Success Team`;
      } else if (isOutage) {
        subject = 'Resolved: West-US node connectivity recovery';
        body = `Dear Falcon360 Customer,

We are writing to inform you that the regional node connectivity latency spike in West-US has been fully resolved.

System uptime and latency have returned to our baseline SLA levels of 24ms. Thank you for your patience as our network engineering team stabilized the servers.

Best regards,
Falcon360 Infrastructure Team`;
      } else {
        subject = 'Unlocking the full value of Falcon360';
        body = `Dear Falcon360 Customer,

We noticed that your team has logged in less frequently this week. We want to make sure you are getting the absolute best value out of your active package plan.

We would love to schedule a quick 10-minute CSM review session to see if we can help optimize your integrations.

Best regards,
Customer Success Team`;
      }
    } else {
      if (isBilling) {
        body = `*Falcon360 Billing Update* ⚠️\nWe noticed a card renewal failure on your account. We have activated a 14-day grace period to keep your workspace online. Please check your billing dashboard to update details.`;
      } else if (isOutage) {
        body = `*Falcon360 System Recovery* 🔌\nThe regional West-US connectivity spike is now resolved. All integrations and API rates are back to stable levels (24ms). Thank you for your patience!`;
      } else {
        body = `*Falcon360 Customer Success check-in* 📈\nWe noticed your usage dropped this week. Would your team like a quick 10-minute review with your Success Manager to help optimize integrations? Let us know!`;
      }
    }

    return { subject, body };
  };

  const warningGroups = (() => {
    const groups: Record<string, any[]> = {};
    if (users) {
      users.forEach((u: any) => {
        u.warningFlags.forEach((flag: string) => {
          let cleanName = '';
          if (flag === 'Failed Payment') cleanName = 'Failed Payments (Billing)';
          else if (flag === 'Regional Outage') cleanName = 'Regional Outages (Infrastructure)';
          else if (flag === 'Using It Less' || flag === 'Low Usage') cleanName = 'Low Usage (Engagement)';
          else cleanName = `${flag} Triggers`;

          if (!groups[cleanName]) {
            groups[cleanName] = [];
          }
          groups[cleanName].push(u);
        });
      });
    }
    return groups;
  })();
  const [showAiChat, setShowAiChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: "Hello! I'm your Falcon360 AI Portfolio Advisor. Ask me anything about customer health trends, critical account updates, or risk distribution." }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newUserMsg = { sender: 'user' as const, text: textToSend };
    setChatMessages(prev => [...prev, newUserMsg]);
    setUserInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let reply = '';
      const query = textToSend.toLowerCase();

      const criticalCount = users ? users.filter((u: any) => u.healthScore < 40).length : 0;
      const warningCount = users ? users.filter((u: any) => u.healthScore >= 40 && u.healthScore < 70).length : 0;
      const healthyCount = users ? users.filter((u: any) => u.healthScore >= 70).length : 0;
      const avgScore = users ? Math.round(users.reduce((acc: number, u: any) => acc + u.healthScore, 0) / users.length) : 0;

      if (query.includes('improve') || query.includes('critical') || query.includes('suddenly') || query.includes('improved')) {
        reply = `Critical customer counts have stabilized at ${criticalCount} accounts. This improvement is primarily driven by:
1. **Infrastructure Recovery**: Resolution of the West-US regional node outage restored application performance for at-risk enterprise users.
2. **Billing Remediation**: Active billing grace extensions prevented involuntary account cancellations.
3. **CSM Interventions**: Success managers resolved critical usage blocks for key accounts like Northwind Traders.`;
      } else if (query.includes('warning') || query.includes('action') || query.includes('which')) {
        const warningUsers = users ? users.filter((u: any) => u.healthScore >= 40 && u.healthScore < 70).slice(0, 3) : [];
        const warningNames = warningUsers.map((u: any) => `${u.name} (Health: ${u.healthScore}%)`).join(', ');
        reply = `We currently have ${warningCount} accounts in the Warning category. The most urgent accounts needing CSM check-ins are:
- **${warningNames}**
The primary risk triggers are **Failed Card Renewals** and **Low Usage Frequency**. We recommend scheduling a direct review using the billing audit template.`;
      } else if (query.includes('driver') || query.includes('satisfaction') || query.includes('why')) {
        reply = `Customer satisfaction is highly correlated with:
- **System Reliability**: Remains our strongest driver (+18% retention).
- **Increasing Usage**: Growth in API traffic and feature utilization adds +12% retention impact.
- **Support Ticket Resolution**: Fast response times (under 24ms average) have mitigated customer distress across all tiers.`;
      } else {
        reply = `Currently, the portfolio average health score is **${avgScore}/100**. 
- **Healthy**: ${healthyCount} accounts (stable engagement).
- **Warning**: ${warningCount} accounts (requiring follow-up on usage drops).
- **Critical**: ${criticalCount} accounts (immediate CSM action suggested).

Is there a specific account or recent system event you would like me to analyze?`;
      }

      setChatMessages(prev => [...prev, { sender: 'ai' as const, text: reply }]);
    }, 1000);
  };
  return (
                <>
                  {/* Dashboard View */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full">
                    <div>
                      <h1 className="text-xl md:text-2xl font-extrabold text-earth-cocoa tracking-tight">Client Experience Dashboard</h1>
                      <p className="text-sm text-black mt-1 max-w-xl font-medium">
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
                        <span>Last 30 Days</span>
                      </div>
                    </div>
                  </div>

                  {/* Metric Cards Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch">
                    {/* Active Accounts Card */}
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-5 flex flex-col justify-between shadow-sm w-full">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-extrabold text-earth-cocoa/85 uppercase">Active Accounts</span>
                          <Users className="w-4 h-4 text-earth-clay" />
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-black">{dist.total_customers.toLocaleString()}</span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-black border-t border-earth-sage/20 pt-2 mt-4 block">{dist.critical_count.toLocaleString()} accounts in critical state</span>
                    </div>

                    {/* Health distribution block */}
                    <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-xl p-5 flex flex-col justify-between gap-4 shadow-sm w-full">
                      <div className="flex justify-between items-center border-b border-earth-sage/20 pb-2">
                        <span className="text-[10px] font-extrabold text-earth-cocoa/85 uppercase">CUSTOMER HEALTH DISTRIBUTION</span>
                        <span className="text-[10px] font-extrabold text-earth-cocoa/70 uppercase">Segmentation by active user count</span>
                      </div>

                      {/* Stacked bar chart representation */}
                      <div className="flex flex-col gap-4 justify-center flex-1">
                        <div className="w-full h-5 rounded-lg flex overflow-hidden border border-earth-sage/20">
                          <div className="h-full bg-status-healthy" style={{ width: `${dist.healthy_pct}%` }} title={`Healthy: ${dist.healthy_pct}%`} />
                          <div className="h-full bg-status-risk" style={{ width: `${dist.at_risk_pct}%` }} title={`Warning: ${dist.at_risk_pct}%`} />
                          <div className="h-full bg-status-critical" style={{ width: `${dist.critical_pct}%` }} title={`Critical: ${dist.critical_pct}%`} />
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-xs font-bold text-earth-cocoa/80">
                          <div className="flex flex-col gap-0.5 border-l-4 border-status-healthy pl-2">
                            <span className="text-xs text-black/75 uppercase font-bold">Healthy</span>
                            <span className="text-sm font-black text-black">{dist.healthy_count.toLocaleString()} users</span>
                            <span className="text-xs text-status-healthy font-extrabold">{dist.healthy_pct}%</span>
                          </div>
                          <div className="flex flex-col gap-0.5 border-l-4 border-status-risk pl-2">
                            <span className="text-xs text-black/75 uppercase font-bold">Warning</span>
                            <span className="text-sm font-black text-black">{dist.at_risk_count.toLocaleString()} users</span>
                            <span className="text-xs text-status-risk font-extrabold">{dist.at_risk_pct}%</span>
                          </div>
                          <div className="flex flex-col gap-0.5 border-l-4 border-status-critical pl-2">
                            <span className="text-xs text-black/75 uppercase font-bold">Critical</span>
                            <span className="text-sm font-black text-black">{dist.critical_count.toLocaleString()} users</span>
                            <span className="text-xs text-status-critical font-extrabold">{dist.critical_pct}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main section grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
                    
                    {/* Left Column (Span 6) */}
                    <div className="lg:col-span-6 flex flex-col gap-6 w-full">
                      
                      {/* Telemetry Status Breakdown */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm text-left">
                        <div className="flex justify-between items-center border-b border-earth-sage/20 pb-2">
                          <span className="text-[10px] font-black uppercase text-earth-cocoa/90 tracking-wider">SYSTEM STATUS BREAKDOWN</span>
                          <span className="text-[10px] font-extrabold text-earth-cocoa/75 uppercase">System checks</span>
                        </div>

                        <div className="flex flex-col gap-4">
                          {/* Item 1 */}
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-baseline text-xs">
                              <div>
                                <span className="text-sm font-bold text-earth-cocoa block">Login Frequency (Engagement)</span>
                                <span className="text-xs text-black font-normal block mt-1 leading-normal">A positive delta shows customer check-in methods are working. If negative, refine onboarding engagement plans.</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-4 font-sans text-xs">
                                <span className="text-sm font-black text-black">82%</span>
                                <span className="text-[10px] text-status-healthy bg-[#276B2B]/10 border border-[#276B2B]/20 px-1.5 py-0.5 rounded font-black flex items-center gap-0.5">
                                  ▲ +5%
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-earth-cocoa/10 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-status-healthy" style={{ width: '82%' }} />
                            </div>
                          </div>

                          {/* Item 2 */}
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-baseline text-xs">
                              <div>
                                <span className="text-sm font-bold text-earth-cocoa block">Feature Utilization (Usage)</span>
                                <span className="text-xs text-black font-normal block mt-1 leading-normal">An increase confirms new features are successfully adopted. A drop indicates a need to schedule tutorial broadcasts.</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-4 font-sans text-xs">
                                <span className="text-sm font-black text-black">64%</span>
                                <span className="text-[10px] text-[#8C6239] bg-[#8C6239]/10 border border-[#8C6239]/20 px-1.5 py-0.5 rounded font-black flex items-center gap-0.5">
                                  ▲ +8%
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-earth-cocoa/10 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-earth-clay" style={{ width: '64%' }} />
                            </div>
                          </div>

                          {/* Item 3 */}
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-baseline text-xs">
                              <div>
                                <span className="text-sm font-bold text-earth-cocoa block">Support Ticket Resolution (Response)</span>
                                <span className="text-xs text-black font-normal block mt-1 leading-normal">Higher rates validate successful CSM support interventions. A drop highlights resource bottlenecks needing attention.</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-4 font-sans text-xs">
                                <span className="text-sm font-black text-black">91%</span>
                                <span className="text-[10px] text-status-healthy bg-[#276B2B]/10 border border-[#276B2B]/20 px-1.5 py-0.5 rounded font-black flex items-center gap-0.5">
                                  ▲ +3%
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-earth-cocoa/10 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-status-healthy" style={{ width: '91%' }} />
                            </div>
                          </div>

                          {/* Item 4 */}
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-baseline text-xs">
                              <div>
                                <span className="text-sm font-bold text-earth-cocoa block">Payment & Invoicing (Billing)</span>
                                <span className="text-xs text-black font-normal block mt-1 leading-normal">A stable rate shows automated invoicing is reliable. A drop warns of payment failures requiring grace-period playbooks.</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-4 font-sans text-xs">
                                <span className="text-sm font-black text-black">94%</span>
                                <span className="text-[10px] text-status-critical bg-status-critical/10 border border-status-critical/20 px-1.5 py-0.5 rounded font-black flex items-center gap-0.5">
                                  ▼ -2%
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-earth-cocoa/10 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-status-healthy" style={{ width: '94%' }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      
                    </div>

                    {/* Right Column (Span 6) */}
                    <div className="lg:col-span-6 flex flex-col gap-6 w-full">
                      {/* Customer's Health */}
                      <div className="bg-[#efe9d2]/40 border border-earth-sage/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm text-left">
                        <div className="flex justify-between items-center border-b border-earth-sage/20 pb-2 w-full">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase text-earth-cocoa/90 tracking-wider">CUSTOMER'S HEALTH</span>
                            <span className="text-[10px] font-extrabold text-earth-cocoa/75 uppercase">Distribution & Actions</span>
                          </div>
                        </div>

                        {/* High-visibility Tab Toggle Mode */}
                        <div className="w-full flex bg-earth-bg/30 p-1 rounded-xl border border-earth-sage/20 text-xs font-bold shadow-inner">
                          <button
                            onClick={() => setActiveSubTab('distribution')}
                            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              activeSubTab === 'distribution'
                                ? 'bg-earth-cocoa text-earth-bg shadow-sm font-extrabold'
                                : 'text-earth-cocoa/60 hover:text-earth-cocoa hover:bg-earth-bg/25'
                            }`}
                          >
                            <Activity className="w-3.5 h-3.5" />
                            <span>Overview</span>
                          </button>
                          <button
                            onClick={() => setActiveSubTab('interventions')}
                            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              activeSubTab === 'interventions'
                                ? 'bg-earth-cocoa text-earth-bg shadow-sm font-extrabold'
                                : 'text-earth-cocoa/60 hover:text-earth-cocoa hover:bg-earth-bg/25'
                            }`}
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Group Actions</span>
                          </button>
                        </div>

                        {activeSubTab === 'distribution' ? (
                          <>
                            <div className="flex flex-col gap-4 my-2 font-bold text-xs">
                              {/* Healthy */}
                              <div className="flex justify-between items-center p-3 bg-earth-bg/25 rounded-lg border border-earth-sage/10">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-3 h-3 rounded-full bg-status-healthy" />
                                  <span className="font-bold text-black text-sm">Healthy (Score 70+)</span>
                                </div>
                                <span className="text-status-healthy font-black text-base">
                                  {users ? users.filter((u: any) => u.healthScore >= 70).length : 0} Accounts
                                </span>
                              </div>

                              {/* Warning */}
                              <div className="flex justify-between items-center p-3 bg-earth-bg/25 rounded-lg border border-earth-sage/10">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-3 h-3 rounded-full bg-status-risk" />
                                  <span className="font-bold text-black text-sm">Warning (Score 40-69)</span>
                                </div>
                                <span className="text-status-risk font-black text-base">
                                  {users ? users.filter((u: any) => u.healthScore < 70 && u.healthScore >= 40).length : 0} Accounts
                                </span>
                              </div>

                              {/* Critical */}
                              <div className="flex justify-between items-center p-3 bg-earth-bg/25 rounded-lg border border-earth-sage/10">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-3 h-3 rounded-full bg-status-critical" />
                                  <span className="font-bold text-black text-sm">Critical (Score &lt; 40)</span>
                                </div>
                                <span className="text-status-critical font-black text-base">
                                  {users ? users.filter((u: any) => u.healthScore < 40).length : 0} Accounts
                                </span>
                              </div>
                            </div>

                            {/* AI Advisor Button */}
                            <button 
                              onClick={() => setShowAiChat(!showAiChat)}
                              className="w-full mt-2 bg-[#efe9d2]/85 hover:bg-earth-sage/20 text-black border border-earth-sage/35 font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Cpu className="w-3.5 h-3.5 text-status-healthy animate-pulse" />
                              <span>{showAiChat ? 'Hide AI Advisor' : 'Ask AI Portfolio Advisor'}</span>
                            </button>

                            {showAiChat && (
                              <div className="border-t border-earth-sage/20 pt-4 mt-2 flex flex-col gap-3">
                                {/* Scrollable messages box */}
                                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                                  {chatMessages.map((msg, i) => (
                                    <div 
                                      key={i} 
                                      className={`flex flex-col max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm font-sans ${
                                        msg.sender === 'user'
                                          ? 'self-end bg-[#efe9d2]/30 text-black border border-earth-sage/20 font-semibold'
                                          : 'self-start bg-[#efe9d2]/70 text-black border border-earth-sage/35 font-semibold whitespace-pre-line'
                                      }`}
                                    >
                                      {msg.text}
                                    </div>
                                  ))}
                                  {isTyping && (
                                    <div className="self-start bg-earth-cocoa/5 text-black font-semibold rounded-2xl px-3 py-2 text-xs italic flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-black/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                                      <span className="w-1.5 h-1.5 rounded-full bg-black/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                                      <span className="w-1.5 h-1.5 rounded-full bg-black/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                                      <span>Advisor is typing...</span>
                                    </div>
                                  )}
                                </div>

                                {/* Suggested Questions */}
                                <div className="flex flex-wrap gap-1.5">
                                  <button 
                                    onClick={() => handleSendMessage("Why did critical users suddenly improve?")}
                                    className="text-xs font-bold text-black hover:bg-earth-sage/20 px-2.5 py-1 rounded-full border border-earth-sage/35 transition-all cursor-pointer bg-[#efe9d2]/60"
                                  >
                                    💡 Why did critical improve?
                                  </button>
                                  <button 
                                    onClick={() => handleSendMessage("Which warning accounts need action?")}
                                    className="text-xs font-bold text-black hover:bg-earth-sage/20 px-2.5 py-1 rounded-full border border-earth-sage/35 transition-all cursor-pointer bg-[#efe9d2]/60"
                                  >
                                    ⚠️ Which warnings need action?
                                  </button>
                                </div>

                                {/* Message input bar */}
                                <div className="flex gap-2">
                                  <input 
                                    type="text" 
                                    placeholder="Ask AI advisor..."
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSendMessage(userInput);
                                    }}
                                    className="flex-1 bg-white border border-earth-sage/35 rounded-xl py-2 px-3 text-xs outline-none focus:border-earth-clay text-black font-semibold placeholder-black/45"
                                  />
                                  <button 
                                    onClick={() => handleSendMessage(userInput)}
                                    className="p-2 bg-[#efe9d2]/85 hover:bg-earth-sage/20 text-black border border-earth-sage/35 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-sm"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col gap-4 my-2 font-bold text-xs">
                            {Object.keys(warningGroups).length === 0 ? (
                              <div className="p-4 bg-earth-bg/25 border border-earth-sage/10 rounded-xl text-center font-bold text-xs text-black/60">
                                🎉 All active accounts are currently stable and in good standing. No group interventions needed.
                              </div>
                            ) : (
                              Object.entries(warningGroups).map(([groupName, groupUsers]) => (
                                <div key={groupName} className="p-3.5 bg-earth-bg/25 border border-earth-sage/15 rounded-xl flex flex-col gap-2.5">
                                  <div className="flex justify-between items-center">
                                    <span className="text-black font-black text-xs">{groupName}</span>
                                    <span className="text-[10px] bg-status-critical/15 text-status-critical px-2 py-0.5 border border-status-critical/30 rounded font-black uppercase">
                                      {groupUsers.length} Accounts
                                    </span>
                                  </div>
                                  
                                  <p className="text-xs text-black leading-relaxed font-normal">
                                    <span className="font-bold text-black uppercase text-[10px] tracking-wider block mb-0.5">Recipients:</span>
                                    {groupUsers.map((u: any) => u.name).join(', ')}
                                  </p>

                                  <div className="flex gap-2 mt-1">
                                    <button 
                                      onClick={() => {
                                        const { subject, body } = getBroadcastTemplate(groupName, 'email', groupUsers.map((u: any) => u.name));
                                        setActiveBroadcast({ groupName, type: 'email', recipients: groupUsers, subject, body });
                                        setBroadcastSuccess(false);
                                        setIsSendingBroadcast(false);
                                      }}
                                      className="flex-1 bg-[#efe9d2]/60 border border-earth-sage/35 hover:bg-earth-sage/30 text-black font-bold text-xs py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <Mail className="w-3 h-3 text-earth-clay" />
                                      <span>Email Group</span>
                                    </button>
                                    <button 
                                      onClick={() => {
                                        const { subject, body } = getBroadcastTemplate(groupName, 'whatsapp', groupUsers.map((u: any) => u.name));
                                        setActiveBroadcast({ groupName, type: 'whatsapp', recipients: groupUsers, subject, body });
                                        setBroadcastSuccess(false);
                                        setIsSendingBroadcast(false);
                                      }}
                                      className="flex-1 bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 text-[#128C7E] font-bold text-xs py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <MessageCircle className="w-3 h-3 text-[#128C7E]" />
                                      <span>WhatsApp Group</span>
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                    </div>

                  </div>

                  {activeBroadcast && (
                    <div 
                      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300 animate-fadeIn"
                      onClick={() => setActiveBroadcast(null)}
                    >
                      <div 
                        className="bg-[#efe9d2] border-2 border-earth-sage text-earth-cocoa rounded-3xl max-w-3xl w-full p-8 text-left relative shadow-2xl flex flex-col gap-5 animate-scaleUp font-sans"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Broadcast Header */}
                        <div className="flex items-center gap-4">
                          <div className={`p-4 rounded-full border w-fit ${
                            activeBroadcast.type === 'email' 
                              ? 'bg-earth-clay/25 border-earth-clay/35 text-earth-clay' 
                              : 'bg-[#25D366]/20 border-[#25D366]/40 text-[#128C7E]'
                          }`}>
                            {activeBroadcast.type === 'email' ? <Mail className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
                          </div>
                          <div>
                            <span className="text-xs uppercase font-extrabold text-earth-clay tracking-wider">Group Broadcast Operations</span>
                            <h2 className="text-xl font-extrabold text-earth-cocoa mt-0.5">
                              Send Broadcast to {activeBroadcast.groupName}
                            </h2>
                          </div>
                        </div>

                        {/* Recipients list with Search bar */}
                        <div className="text-sm border-y border-earth-sage/20 py-4 flex flex-col gap-3">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <span className="font-extrabold text-xs text-black uppercase tracking-wider">
                              RECIPIENT PORTFOLIOS ({selectedRecipientIds.length}/{activeBroadcast.recipients.length} SELECTED):
                            </span>
                            <input
                              type="text"
                              placeholder="Search by name or email..."
                              value={recipientSearch}
                              onChange={(e) => setRecipientSearch(e.target.value)}
                              className="bg-white border border-earth-sage/35 rounded-xl px-3.5 py-1.5 text-xs text-black font-semibold outline-none focus:border-earth-clay placeholder-black/45 w-full sm:w-64 shadow-sm"
                            />
                          </div>

                          <div className="flex flex-wrap gap-2 mt-1 max-h-[160px] overflow-y-auto pr-1">
                            {(() => {
                              const filtered = activeBroadcast.recipients.filter((r: any) =>
                                r.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
                                (activeBroadcast.type === 'email' && r.email.toLowerCase().includes(recipientSearch.toLowerCase()))
                              );

                              if (filtered.length === 0) {
                                return (
                                  <span className="text-xs text-black/50 italic py-1">
                                    No recipients match your search.
                                  </span>
                                );
                              }

                              return filtered.map((r: any) => {
                                const isSelected = selectedRecipientIds.includes(r.id);
                                return (
                                  <button
                                    key={r.id}
                                    disabled={broadcastSuccess || isSendingBroadcast}
                                    onClick={() => {
                                      if (isSelected) {
                                        setSelectedRecipientIds(prev => prev.filter(id => id !== r.id));
                                      } else {
                                        setSelectedRecipientIds(prev => [...prev, r.id]);
                                      }
                                    }}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-2 cursor-pointer disabled:cursor-not-allowed ${
                                      isSelected
                                        ? 'bg-white text-black border-status-healthy shadow-sm font-extrabold'
                                        : 'bg-earth-bg/25 text-black/60 border-earth-sage/35 opacity-70 hover:bg-earth-bg/40'
                                    }`}
                                  >
                                    <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-black transition-all shrink-0 ${
                                      isSelected 
                                        ? 'bg-status-healthy border-status-healthy text-white' 
                                        : 'border-black/40 bg-white text-transparent'
                                    }`}>
                                      ✓
                                    </span>
                                    <span>{r.name} ({activeBroadcast.type === 'email' ? r.email : 'WhatsApp Live'})</span>
                                  </button>
                                );
                              });
                            })()}
                          </div>
                        </div>

                        {/* Editor / Template display */}
                        <div className="flex flex-col gap-2">
                          <span className="font-extrabold text-xs text-black uppercase tracking-wider">AI BROADCAST MESSAGE TEMPLATE:</span>
                          {activeBroadcast.type === 'email' && (
                            <div className="flex flex-col gap-1 bg-white border border-earth-sage/35 p-3 rounded-2xl text-xs shadow-sm">
                              <span className="font-bold text-black/75 text-xs uppercase">Subject Line:</span>
                              <input
                                type="text"
                                value={activeBroadcast.subject}
                                disabled={broadcastSuccess || isSendingBroadcast}
                                onChange={(e) => setActiveBroadcast(prev => prev ? { ...prev, subject: e.target.value } : null)}
                                className="w-full bg-transparent font-bold text-sm text-black outline-none border-b border-transparent focus:border-earth-clay pb-1"
                              />
                            </div>
                          )}
                          <textarea
                            disabled={broadcastSuccess || isSendingBroadcast}
                            value={activeBroadcast.body}
                            onChange={(e) => setActiveBroadcast(prev => prev ? { ...prev, body: e.target.value } : null)}
                            className="w-full h-56 bg-white border border-earth-sage/35 p-4 rounded-2xl text-sm font-mono text-black leading-relaxed outline-none focus:border-earth-clay shadow-sm"
                          />
                        </div>

                        {/* Success State */}
                        {broadcastSuccess && (
                          <div className="bg-[#276B2B]/15 border border-[#276B2B]/35 text-status-healthy p-3.5 rounded-xl text-xs font-bold text-center animate-scaleUp">
                            ✅ Broadcast transmitted successfully to {selectedRecipientIds.length} customer nodes! System logs updated.
                          </div>
                        )}

                        <div className="flex gap-3 justify-end mt-2">
                          {!broadcastSuccess && (
                            <button 
                              disabled={isSendingBroadcast}
                              onClick={() => setActiveBroadcast(null)}
                              className="px-6 py-3 bg-[#efe9d2]/80 hover:bg-[#efe9d2] text-black font-bold text-sm rounded-xl transition-all cursor-pointer border border-earth-sage/30 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}
                          
                          {broadcastSuccess ? (
                            <button 
                              onClick={() => setActiveBroadcast(null)}
                              className="px-6 py-3 bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-bold text-sm rounded-xl transition-all cursor-pointer shadow-md"
                            >
                              Close Dialog
                            </button>
                          ) : (
                            <button 
                              disabled={isSendingBroadcast || selectedRecipientIds.length === 0}
                              onClick={() => {
                                setIsSendingBroadcast(true);
                                
                                // Check if Yap or Yu Ning is among the selected recipients
                                const yapRecipient = activeBroadcast.recipients.find((r: any) => 
                                  selectedRecipientIds.includes(r.id) && r.name.toLowerCase().replace(/\s+/g, '').includes('yap')
                                );
                                const yuningRecipient = activeBroadcast.recipients.find((r: any) => 
                                  selectedRecipientIds.includes(r.id) && r.name.toLowerCase().replace(/\s+/g, '').includes('yuning')
                                );
                                
                                if (activeBroadcast.type === 'whatsapp') {
                                  const text = `Dear Customer,\n\n${activeBroadcast.body}`;
                                  if (yapRecipient) {
                                    window.open(`https://wa.me/60162897881?text=${encodeURIComponent(text)}`, '_blank');
                                  }
                                  if (yuningRecipient) {
                                    window.open(`https://wa.me/60122293817?text=${encodeURIComponent(text)}`, '_blank');
                                  }
                                }

                                  setTimeout(() => {
                                    setIsSendingBroadcast(false);
                                    setBroadcastSuccess(true);
                                    if (addTelemetry) {
                                      addTelemetry(`Transmitted group ${activeBroadcast.type} broadcast to ${selectedRecipientIds.length} accounts (${activeBroadcast.groupName}).`);
                                    }
                                  }, 1500);
                              }}
                              className="px-6 py-3 bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSendingBroadcast ? (
                                <>
                                  <span className="w-3.5 h-3.5 border-2 border-earth-bg border-t-transparent rounded-full animate-spin" />
                                  <span>Transmitting...</span>
                                </>
                              ) : (
                                <>
                                  <Send className="w-3.5 h-3.5" />
                                  <span>Send Broadcast Now</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
  );
}
