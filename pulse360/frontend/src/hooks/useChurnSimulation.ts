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

        // Transition 1: FRUSTRATED -> DISENGAGED (Quiet Churn due to unresolved bugs)
        if (u.state === 'frustrated' && Math.random() < 0.25) {
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
        if (u.state === 'disengaged' && Math.random() < 0.15) {
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
      if (Math.random() * 100 < outageRate) {
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
      if (Math.random() * 100 < billingFailureRate) {
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

      // 4. Regular login simulation heartbeat
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
