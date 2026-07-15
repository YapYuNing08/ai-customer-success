import { useEffect, useState } from "react";
import { getCustomers, API_BASE_URL } from "./lib/api";

// Placeholder shell. The Google Stitch export drops into src/components +
// src/pages; this just proves the frontend <-> backend wiring end-to-end.
export default function App() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomers()
      .then(setCustomers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const tierColor = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Pulse360</h1>
          <p className="text-slate-500">
            Subscription &amp; customer-success analytics —{" "}
            <span className="font-mono text-sm">{API_BASE_URL}</span>
          </p>
        </header>

        {loading && <p className="text-slate-500">Loading customers…</p>}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
            <p className="font-semibold">Could not reach the backend.</p>
            <p className="text-sm mt-1">{error}</p>
            <p className="text-sm mt-2">
              Start it with:{" "}
              <code className="font-mono">uvicorn app.main:app --reload</code>
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-3">
            {customers.map((c) => (
              <div
                key={c.customer_id}
                className="flex items-center justify-between rounded-lg bg-white border border-slate-200 p-4 shadow-sm"
              >
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-slate-500">{c.subscription_plan}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Health</p>
                    <p className="font-semibold">{c.health_score}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Churn</p>
                    <p className="font-semibold">
                      {Math.round(c.churn_probability * 100)}%
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      tierColor[c.risk_tier] || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {c.risk_tier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
