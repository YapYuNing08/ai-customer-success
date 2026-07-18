import { useState, useRef } from 'react';
import { mockUsers, mergeBackendCustomer, downgradeSavings, type ActiveUser } from './utils/mockData';
import { ActiveUserInsight } from './components/ActiveUserInsight';
import { NavBar } from './components/NavBar';
import { MarketingPage } from './pages/MarketingPage';
import { ClientDashboardPage } from './pages/ClientDashboardPage';
import { ConsolePage } from './pages/console/ConsolePage';
import { useChurnSimulation } from './hooks/useChurnSimulation';
import { getCustomers, getCustomerStats } from './lib/api';
import { useEffect } from 'react';

function App() {
  const [currentPage, setCurrentPage] = useState<'marketing' | 'client_console' | 'client_dashboard' | 'insight'>('marketing');
  const [users, setUsers] = useState<ActiveUser[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<ActiveUser | null>(null);
  const [clientUserId, setClientUserId] = useState<string>('1');

  // Simulation States (Concept 1: Digital Twin Sandbox)
  const [isSimulating, setIsSimulating] = useState(true);
  const [outageRate, setOutageRate] = useState(15);
  const [billingFailureRate, setBillingFailureRate] = useState(10);
  const [telemetryFeed, setTelemetryFeed] = useState<string[]>([
    'SubSentry is up and running. Watching customer activity in real time.',
    'Tracking 8 active customers around the world.',
  ]);
  const [pulseTrigger, setPulseTrigger] = useState(0);

  // Population-wide health-band distribution (from /customers/stats — the
  // customer list itself is a band-balanced sample, so never aggregate it).
  const [healthStats, setHealthStats] = useState<{
    total_customers: number;
    healthy_count: number;
    at_risk_count: number;
    critical_count: number;
    healthy_pct: number;
    at_risk_pct: number;
    critical_pct: number;
    avg_health_score: number;
  } | null>(null);

  // Fetch live customer summaries from FastAPI backend
  useEffect(() => {
    getCustomerStats()
      .then(setHealthStats)
      .catch((err: unknown) => {
        console.warn('Could not load health distribution stats; keeping placeholder figures.', err);
      });
    getCustomers()
      .then((data) => {
        if (data && data.length > 0) {
          const merged = data.map((c: any) => mergeBackendCustomer(c));
          setUsers(merged);
          if (merged[0]) setClientUserId(merged[0].id);
          setTelemetryFeed(prev => [
            `[${new Date().toLocaleTimeString()}] Connected to live data. Showing ${merged.length} active customers.`,
            ...prev
          ]);
        }
      })
      .catch((err) => {
        console.warn('Backend API connection failed, falling back to local simulation data.', err);
        setTelemetryFeed(prev => [
          `[${new Date().toLocaleTimeString()}] ALERT: Live data is unavailable right now. Showing sample data instead.`,
          ...prev
        ]);
      });
  }, []);

  const consoleRef = useRef<HTMLDivElement>(null);

  const scrollToConsole = () => {
    consoleRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle selected user from the Globe tooltip
  const handleSelectUser = (user: ActiveUser) => {
    const latestUser = users.find(u => u.id === user.id) || user;
    setSelectedUser(latestUser);
    setCurrentPage('insight');
    addTelemetry(`Opened customer details for ${latestUser.name}.`);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleUpdateUser = (updatedUser: ActiveUser) => {
    // Transition customer back to ACTIVE state and resolve warning flags when CSM acts
    const recoveredUser: ActiveUser = {
      ...updatedUser,
      state: 'active',
      healthScore: Math.min(98, updatedUser.healthScore + 20),
      churnProbability: Math.max(5, updatedUser.churnProbability - 30),
      warningFlags: updatedUser.warningFlags.filter(f => f !== 'Using It Less' && f !== 'Failed Payment')
    };
    setUsers(prev => prev.map(u => u.id === recoveredUser.id ? recoveredUser : u));
    setSelectedUser(recoveredUser);
    addTelemetry(`[Action Taken] ${recoveredUser.name} is back on track — risk of leaving is down to ${recoveredUser.churnProbability}%.`);
  };

  const handleClientAction = (userId: string, action: 'downgrade' | 'extend_grace') => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        if (action === 'downgrade') {
          const newMrr = u.mrr - downgradeSavings(u.mrr);
          return {
            ...u,
            plan: 'Starter',
            mrr: newMrr,
            healthScore: Math.min(98, u.healthScore + 20),
            churnProbability: Math.max(5, u.churnProbability - 30),
            warningFlags: u.warningFlags.filter(f => f !== 'Using It Less'),
            activityLogs: [
              {
                date: new Date().toISOString().split('T')[0],
                type: 'plan_change',
                details: `Customer self-downgraded subscription to Starter Plan ($${newMrr.toLocaleString()}/mo) via Dashboard Console.`
              },
              ...u.activityLogs
            ]
          };
        } else if (action === 'extend_grace') {
          return {
            ...u,
            state: 'active',
            warningFlags: u.warningFlags.filter(f => f !== 'Failed Payment'),
            churnProbability: Math.max(10, u.churnProbability - 20),
            activityLogs: [
              {
                date: new Date().toISOString().split('T')[0],
                type: 'payment_success',
                details: 'Requested 7-day payment grace extension via Dashboard Console.'
              },
              ...u.activityLogs
            ]
          };
        }
      }
      return u;
    }));
    addTelemetry(`[Dashboard Console Action] Account ${userId} completed action: ${action}`);
  };

  const addTelemetry = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setTelemetryFeed(prev => [`[${time}] ${msg}`, ...prev.slice(0, 15)]);
  };

  useChurnSimulation(users, setUsers, addTelemetry, isSimulating, outageRate, billingFailureRate);

  const isDark = currentPage === 'insight';

  // Real population stats when the backend is up; placeholder figures offline.
  const dist = healthStats ?? {
    total_customers: 8412,
    healthy_count: 6210,
    at_risk_count: 1682,
    critical_count: 520,
    healthy_pct: 73.8,
    at_risk_pct: 20.0,
    critical_pct: 6.2,
    avg_health_score: 92,
  };
  const expScore = Math.round(dist.avg_health_score);
  const expLabel = expScore > 70 ? 'Excellent' : expScore > 40 ? 'Stable' : 'At Risk';

  return (
    <div className={`min-h-screen font-sans flex flex-col antialiased transition-colors duration-300 ${isDark ? 'console-bg-dark' : 'bg-earth-bg text-earth-cocoa'}`}>
      <NavBar isDark={isDark} currentPage={currentPage} setCurrentPage={setCurrentPage} setSelectedUser={setSelectedUser} scrollToConsole={scrollToConsole} />

      {/* Page Body */}
      <main className="flex-1 w-full flex flex-col relative">
        {currentPage === 'insight' && selectedUser ? (
          <ActiveUserInsight
            user={users.find(u => u.id === selectedUser.id) || selectedUser}
            onBack={() => {
              setCurrentPage('marketing');
              setSelectedUser(null);
              setTimeout(() => scrollToConsole(), 100);
            }}
            onUpdateUser={handleUpdateUser}
          />
        ) : currentPage === 'client_console' ? (
          <ConsolePage
            users={users}
            setUsers={setUsers}
            telemetryFeed={telemetryFeed}
            setTelemetryFeed={setTelemetryFeed}
            isSimulating={isSimulating}
            setIsSimulating={setIsSimulating}
            outageRate={outageRate}
            setOutageRate={setOutageRate}
            billingFailureRate={billingFailureRate}
            setBillingFailureRate={setBillingFailureRate}
            addTelemetry={addTelemetry}
            handleUpdateUser={handleUpdateUser}
            dist={dist}
            expScore={expScore}
            expLabel={expLabel}
          />
        ) : currentPage === 'client_dashboard' ? (
          <ClientDashboardPage
            users={users}
            clientUserId={clientUserId}
            setClientUserId={setClientUserId}
            handleClientAction={handleClientAction}
            addTelemetry={addTelemetry}
            setCurrentPage={setCurrentPage}
          />
        ) : (
          <MarketingPage
            currentPage={currentPage}
            users={users}
            selectedUser={selectedUser}
            handleSelectUser={handleSelectUser}
            pulseTrigger={pulseTrigger}
            setPulseTrigger={setPulseTrigger}
            addTelemetry={addTelemetry}
            scrollToConsole={scrollToConsole}
            consoleRef={consoleRef}
            isDark={isDark}
          />
        )}
      </main>

      {/* Global Footer */}
      <footer className="bg-earth-bg border-t border-earth-sage/35 py-6 text-center text-earth-cocoa/50 text-[10px] select-none mt-auto">
        <p>&copy; 2026 SubSentry Platform. Helping subscription businesses keep their customers happy.</p>
      </footer>
    </div>
  );
}

export default App;
