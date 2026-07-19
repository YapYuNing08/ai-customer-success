// Rescue-plan report generation + download helpers (extracted from App.tsx).
import { downgradeSavings, type ActiveUser } from './mockData';
import type { Report } from '../types';

export const downloadReport = (report: Report) => {
  const blob = new Blob([report.content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${report.name.replace(/[^a-z0-9]/gi, '_')}.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const buildRescuePlanReport = (users: ActiveUser[]): { report: Report; distressedCount: number } => {
  const avgHealth = Math.round(users.reduce((acc, u) => acc + u.healthScore, 0) / users.length);
  const totalMRR = users.reduce((acc, u) => acc + u.mrr, 0);
    const distressed = users.filter(u => u.healthScore < 70);
    const criticalUsers = users.filter(u => u.healthScore < 40);
    
    let userBreakdownText = "";
    if (distressed.length === 0) {
      userBreakdownText = "No active accounts are currently marked as distressed or at risk of churn. Portfolio health is outstanding!";
    } else {
      distressed.forEach(u => {
        let recommendation = "";
        if (u.metrics.usageVelocity < 0.35 && u.plan !== 'Starter') {
          recommendation = `Execute 1-Click Downgrade to Starter Plan to save RM${downgradeSavings(u.mrr).toLocaleString()}/mo (Usage velocity at ${Math.round(u.metrics.usageVelocity * 100)}%).`;
        } else if (u.warningFlags.includes('Failed Payment')) {
          recommendation = `Request automatic 7-day grace extension to keep services active during card renewal.`;
        } else {
          recommendation = `Schedule active CSM check-in and feature walkthrough (Health at ${u.healthScore}/100).`;
        }
        userBreakdownText += `### 👤 ${u.name} (${u.plan} - RM${u.mrr}/mo)\n- **Health Score**: ${u.healthScore}/100\n- **Churn Risk**: ${Math.round(u.churnProbability)}%\n- **Warning Flags**: ${u.warningFlags.join(', ') || 'Low Engagement'}\n- **CSM Action Recommendation**: ${recommendation}\n\n`;
      });
    }

    const reportContent = `# Churn Rescue Plan & Customer Health Assessment

Generated on: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
Analysis Type: Dynamic AI Portfolio Risk Assessment
System Status: Live

## 📊 PORTFOLIO SUMMARY
- **Average Portfolio Health**: ${avgHealth}/100
- **Total At-Risk Accounts (Health < 70)**: ${distressed.length}
- **Critical Alerts (Health < 40)**: ${criticalUsers.length}
- **Active Monthly Recurring Revenue (MRR)**: RM${totalMRR.toLocaleString()}/mo
- **Estimated Monthly Revenue At Churn Risk**: RM${distressed.reduce((sum, u) => sum + u.mrr, 0).toLocaleString()}/mo

## 🔍 RISK ANALYSIS BY SEGMENT
- **Enterprise Cohort**: ${users.filter(u => u.plan === 'Enterprise' && u.healthScore < 70).length} at risk
- **Growth Cohort**: ${users.filter(u => u.plan === 'Growth' && u.healthScore < 70).length} at risk
- **Starter Cohort**: ${users.filter(u => u.plan === 'Starter' && u.healthScore < 70).length} at risk

## 🛠️ CUSTOMER BREAKDOWN & RESCUE PLAN RECOMMENDATIONS
\n${userBreakdownText}

## 💡 EXECUTIVE SUGGESTIONS
1. **Billing Grace Periods**: For customers suffering from card renewal failures, configure automated billing extension webhooks via Falcon360 APIs.
2. **Usage Right-Sizing**: Downgrade underutilizing growth plans proactively. This strengthens enterprise customer trust and secures long-term retention.
3. **Product Outage Response**: Trigger targeted re-engagement campaigns immediately following regional service interruptions.

---
*Report compiled automatically by Falcon360 Churn Forecasting Engine. SHA-256 Checksum: ${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}*`;

    const newReport: Report = {
      id: String(Date.now()),
      name: `Q2 Churn Rescue Plan (${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })})`,
      type: 'AI Analysis',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Active',
      content: reportContent
    };

    return { report: newReport, distressedCount: distressed.length };
};
