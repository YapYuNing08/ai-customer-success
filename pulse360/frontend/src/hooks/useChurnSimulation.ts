import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import type { ActiveUser } from '../utils/mockData';

// Client-side "digital twin" state machine (extracted from App.tsx): random
// frustrated -> disengaged -> churned transitions plus outage/billing events.
export function useChurnSimulation(
  users: ActiveUser[],
  setUsers: Dispatch<SetStateAction<ActiveUser[]>>,
  addTelemetry: (msg: string) => void,
  isSimulating: boolean,
  outageRate: number,
  billingFailureRate: number,
) {
  // Keep users list in ref to prevent stale closure in simulation interval
  const usersRef = useRef(users);
  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  // Run Real-Time State Machine Telemetry Simulation
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const currentUsers = [...usersRef.current];
      if (currentUsers.length === 0) return;

      let updatedList = [...currentUsers];
      let didChange = false;

      // 1. Process State Transitions (Markov Chain) for existing distressed users
      for (let i = 0; i < updatedList.length; i++) {
        const u = { ...updatedList[i] };
        
        // Skip already churned users
        if (u.state === 'churned') continue;

        // Transition: FRUSTRATED -> ACTIVE (Self-resolution/recovery)
        if (u.state === 'frustrated' && Math.random() < 0.15) {
          u.state = 'active';
          u.healthScore = Math.min(95, u.healthScore + 12);
          u.churnProbability = Math.max(5, u.churnProbability - 15);
          u.warningFlags = u.warningFlags.filter(f => f !== 'Using It Less' && f !== 'Failed Payment');
          u.activityLogs.unshift({
            date: new Date().toISOString().split('T')[0],
            type: 'login',
            details: 'Self-recovery: Customer resolved their query and resumed normal logins.'
          });
          updatedList[i] = u;
          didChange = true;
          addTelemetry(`[Recovery] ${u.name} resolved their issues and returned to ACTIVE status.`);
          break;
        }

        // Transition: DISENGAGED -> FRUSTRATED (Re-engaged activity check)
        if (u.state === 'disengaged' && Math.random() < 0.10) {
          u.state = 'frustrated';
          u.healthScore = Math.min(65, u.healthScore + 10);
          u.churnProbability = Math.max(25, u.churnProbability - 12);
          u.activityLogs.unshift({
            date: new Date().toISOString().split('T')[0],
            type: 'login',
            details: 'Re-engagement: Customer logged in after a period of dormancy.'
          });
          updatedList[i] = u;
          didChange = true;
          addTelemetry(`[Re-engaged] ${u.name} logged back in — state recovered from DISENGAGED to FRUSTRATED.`);
          break;
        }

        // Transition 1: FRUSTRATED -> DISENGAGED (Quiet Churn due to unresolved bugs)
        if (u.state === 'frustrated' && Math.random() < 0.08) {
          u.state = 'disengaged';
          u.healthScore = Math.max(15, u.healthScore - 15);
          u.churnProbability = Math.min(85, u.churnProbability + 15);
          if (!u.warningFlags.includes('Using It Less')) {
            u.warningFlags.push('Using It Less');
          }
          u.activityLogs.unshift({
            date: new Date().toISOString().split('T')[0],
            type: 'login',
            details: 'WARNING: No logins from this customer in the past 3 days.'
          });
          updatedList[i] = u;
          didChange = true;
          addTelemetry(`[Warning] ${u.name} has gone quiet — they went from FRUSTRATED to DISENGAGED. Risk of leaving: ${u.churnProbability}%.`);
          break; // Process one state transition per tick to keep feed clean
        }

        // Transition 2: DISENGAGED -> CHURNED (Subscription Canceled)
        if (u.state === 'disengaged' && Math.random() < 0.04) {
          u.state = 'churned';
          u.healthScore = 0;
          u.churnProbability = 100;
          u.warningFlags = ['Cancelled Subscription'];
          u.activityLogs.unshift({
            date: new Date().toISOString().split('T')[0],
            type: 'payment_fail',
            details: 'CANCELLED: This customer ended their subscription. Final bill settled.'
          });
          updatedList[i] = u;
          didChange = true;
          addTelemetry(`[CUSTOMER LOST] ⚠️ ${u.name} cancelled their subscription. Lost revenue: RM${u.mrr}/mo.`);
          break;
        }
      }

      if (didChange) {
        setUsers(updatedList);
        return; // Skip new random events on this tick to avoid clogging feed
      }

      // 2. Roll probability for an API failure (Outage Rate) -> Transitions ACTIVE to FRUSTRATED
      if (Math.random() * 100 < outageRate * 0.4) {
        const activeUsers = updatedList.filter(u => u.state === 'active');
        if (activeUsers.length > 0) {
          const target = activeUsers[Math.floor(Math.random() * activeUsers.length)];
          const u = { ...target };
          
          u.state = 'frustrated';
          u.healthScore = Math.max(10, u.healthScore - 12);
          u.churnProbability = Math.min(95, u.churnProbability + 18);
          if (!u.warningFlags.includes('Using It Less')) {
            u.warningFlags.push('Using It Less');
          }
          u.activityLogs.unshift({
            date: new Date().toISOString().split('T')[0],
            type: 'support_open',
            details: 'ALERT: This customer ran into a service outage while using the product.'
          });

          const trendFactor = u.churnFactors.find(f => f.name === 'Usage Trend');
          if (trendFactor) {
            trendFactor.impact = Math.min(45, trendFactor.impact + 10);
          }

          setUsers(prev => prev.map(item => item.id === u.id ? u : item));
          addTelemetry(`[Warning] Service outage hit ${u.name} — they are now FRUSTRATED. Risk of leaving jumped to ${u.churnProbability}%.`);
          return;
        }
      }

      // 3. Roll probability for credit card / renewal failure (Billing failure Rate) -> Transitions ACTIVE to FRUSTRATED
      if (Math.random() * 100 < billingFailureRate * 0.4) {
        const activeUsers = updatedList.filter(u => u.state === 'active');
        if (activeUsers.length > 0) {
          const target = activeUsers[Math.floor(Math.random() * activeUsers.length)];
          const u = { ...target };

          u.state = 'frustrated';
          u.metrics.failedPayments = 1;
          u.healthScore = Math.max(15, u.healthScore - 18);
          u.churnProbability = Math.min(90, u.churnProbability + 22);
          if (!u.warningFlags.includes('Failed Payment')) {
            u.warningFlags.push('Failed Payment');
          }
          u.activityLogs.unshift({
            date: new Date().toISOString().split('T')[0],
            type: 'payment_fail',
            details: 'Renewal payment failed — the card was declined by the bank.'
          });

          const billFactor = u.churnFactors.find(f => f.name === 'Failed Invoices');
          if (billFactor) {
            billFactor.impact = Math.min(40, billFactor.impact + 20);
          } else {
            u.churnFactors.push({ name: 'Failed Invoices', impact: 20 });
          }

          setUsers(prev => prev.map(item => item.id === u.id ? u : item));
          addTelemetry(`[Warning] Payment problem for ${u.name} — they are now FRUSTRATED. Extra time given to fix billing.`);
          return;
        }
      }

      // 4. Minor health fluctuation drift for non-churned users (stay still or add/drop a bit)
      if (Math.random() < 0.4) {
        const targetIndex = Math.floor(Math.random() * updatedList.length);
        const target = { ...updatedList[targetIndex] };
        if (target.state !== 'churned') {
          const healthDelta = Math.round((Math.random() - 0.5) * 6); // -3 to +3
          const churnDelta = Math.round((Math.random() - 0.5) * 4);  // -2 to +2
          target.healthScore = Math.min(98, Math.max(10, target.healthScore + healthDelta));
          target.churnProbability = Math.min(95, Math.max(5, target.churnProbability + churnDelta));
          updatedList[targetIndex] = target;
          setUsers(updatedList);
          return;
        }
      }

      // 5. Regular login simulation heartbeat
      if (Math.random() > 0.4) {
        const activeUsers = updatedList.filter(u => u.state === 'active');
        if (activeUsers.length > 0) {
          const target = activeUsers[Math.floor(Math.random() * activeUsers.length)];
          addTelemetry(`Activity check-in: ${target.name} is using the product (${target.location}).`);
        }
      }

    }, 4500);

    return () => clearInterval(interval);
  }, [isSimulating, outageRate, billingFailureRate]);
}
