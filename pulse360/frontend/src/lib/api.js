// Central place for all backend fetch calls.
// The Stitch-exported UI should import from here rather than calling fetch inline.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

// --- Endpoints (mirror the backend routers) ---------------------------------

// GET /customers
export function getCustomers() {
  return request("/customers");
}

// GET /customers/stats — health-band distribution over the FULL population
// (the /customers list is a band-balanced sample; never aggregate from it)
export function getCustomerStats() {
  return request("/customers/stats");
}

// POST /customers — persist a new signup from the onboarding wizard
export function createCustomer(payload) {
  return request("/customers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// GET /customers/{id}
export function getCustomer(customerId) {
  return request(`/customers/${customerId}`);
}

// GET /customers/{id}/recommendation
export function getRecommendation(customerId) {
  return request(`/customers/${customerId}/recommendation`);
}

// POST /customers/{id}/simulate
export function simulate(customerId, levers) {
  return request(`/customers/${customerId}/simulate`, {
    method: "POST",
    body: JSON.stringify(levers),
  });
}

// POST /customers/{id}/simulate/explain — Gemini-written retention plan for
// the same scenario (deterministic fallback text if the LLM is unavailable)
export function explainSimulation(customerId, levers) {
  return request(`/customers/${customerId}/simulate/explain`, {
    method: "POST",
    body: JSON.stringify(levers),
  });
}

export { API_BASE_URL };
