export interface UserActivityLog {
  date: string;
  type: 'login' | 'payment_success' | 'payment_fail' | 'support_open' | 'support_resolve' | 'feature_use' | 'plan_change';
  details: string;
}

export interface ChurnFactor {
  name: string;
  impact: number;
}

export interface PastJourney {
  name: string;
  plan: string;
  outcome: 'churned' | 'retained';
  reason: string;
  intervention: string;
  similarity: number;
}

export interface ActiveUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  location: string;
  lat: number;
  lng: number;
  plan: 'Starter' | 'Growth' | 'Pro' | 'Enterprise';
  mrr: number;
  healthScore: number;
  churnProbability: number;
  warningFlags: string[];
  metrics: {
    usageVelocity: number;
    featureAdoption: number;
    frictionIndex: number;
    failedPayments: number;
    daysSinceOnboarding: number;
  };
  churnFactors: ChurnFactor[];
  activityLogs: UserActivityLog[];
  pastJourneys: PastJourney[];
  state: 'active' | 'frustrated' | 'disengaged' | 'churned';
}

export interface CoordinateMap {
  email: string;
  avatar: string;
  location: string;
  lat: number;
  lng: number;
  mrr: number;
  warningFlags: string[];
  activityLogs: UserActivityLog[];
  pastJourneys: PastJourney[];
}

export const staticCustomerMetadata: Record<string, CoordinateMap> = {
  "cus_001": {
    email: 'contact@yap.my',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    location: 'Kuala Lumpur, Malaysia',
    lat: 3.1390,
    lng: 101.6869,
    mrr: 199,
    warningFlags: ['Using It Less'],
    activityLogs: [
      { date: '2026-07-15', type: 'feature_use', details: 'Used Advanced Analytics dashboard' },
      { date: '2026-07-14', type: 'login', details: 'Logged in from desktop browser' },
      { date: '2026-07-10', type: 'payment_success', details: 'Invoice #1092 paid (RM199.00)' }
    ],
    pastJourneys: []
  },
  "cus_002": {
    email: 'ops@acmeselangor.com.my',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    location: 'Petaling Jaya, Malaysia',
    lat: 3.1073,
    lng: 101.6067,
    mrr: 79,
    warningFlags: ['Not Using Key Features'],
    activityLogs: [
      { date: '2026-07-12', type: 'login', details: 'Logged in for 2 minutes' }
    ],
    pastJourneys: []
  },
  "cus_003": {
    email: 'support@nusantaratech.id',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    location: 'Jakarta, Indonesia',
    lat: -6.2088,
    lng: 106.8456,
    mrr: 199,
    warningFlags: [],
    activityLogs: [
      { date: '2026-07-16', type: 'login', details: 'Logged in from desktop' }
    ],
    pastJourneys: []
  },
  "cus_004": {
    email: 'billing@temasek.sg',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    location: 'Singapore',
    lat: 1.3521,
    lng: 103.8198,
    mrr: 39,
    warningFlags: ['Failed Payment'],
    activityLogs: [
      { date: '2026-07-10', type: 'payment_fail', details: 'Invoice failed (Declined by Bank)' }
    ],
    pastJourneys: []
  },
  "cus_005": {
    email: 'analytics@surabayamaritime.id',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
    location: 'Surabaya, Indonesia',
    lat: -7.2575,
    lng: 112.7521,
    mrr: 79,
    warningFlags: [],
    activityLogs: [
      { date: '2026-07-16', type: 'feature_use', details: 'Triggered automated campaign pipeline' }
    ],
    pastJourneys: []
  },
  "cus_006": {
    email: 'ops@penangsemi.my',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    location: 'George Town, Malaysia',
    lat: 5.4141,
    lng: 100.3288,
    mrr: 199,
    warningFlags: [],
    activityLogs: [
      { date: '2026-07-16', type: 'login', details: 'Logged in from Corporate VPN' }
    ],
    pastJourneys: []
  },
  "cus_007": {
    email: 'contact@bandungcreative.id',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    location: 'Bandung, Indonesia',
    lat: -6.9175,
    lng: 107.6191,
    mrr: 79,
    warningFlags: ['Not Using Key Features'],
    activityLogs: [
      { date: '2026-07-15', type: 'login', details: 'Unusual low session login (30s)' }
    ],
    pastJourneys: []
  },
  "cus_008": {
    email: 'operations@batamelectronics.id',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    location: 'Batam, Indonesia',
    lat: 1.0825,
    lng: 104.0305,
    mrr: 199,
    warningFlags: ['Likely to Leave'],
    activityLogs: [
      { date: '2026-07-16', type: 'support_open', details: 'Opened critical bug report on API latency' }
    ],
    pastJourneys: []
  },
  "cus_009": {
    email: 'compras@johorlogistics.my',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=80',
    location: 'Johor Bahru, Malaysia',
    lat: 1.4927,
    lng: 103.7414,
    mrr: 39,
    warningFlags: [],
    activityLogs: [
      { date: '2026-07-15', type: 'payment_success', details: 'Invoice paid (RM39.00)' }
    ],
    pastJourneys: []
  },
  "cus_010": {
    email: 'info@orchardretail.sg',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
    location: 'Singapore',
    lat: 1.3600,
    lng: 103.8200,
    mrr: 79,
    warningFlags: [],
    activityLogs: [
      { date: '2026-07-16', type: 'feature_use', details: 'Setup advanced webhook integrations' }
    ],
    pastJourneys: []
  },
  "cus_011": {
    email: 'operations@medanpalm.id',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
    location: 'Medan, Indonesia',
    lat: 3.5952,
    lng: 98.6722,
    mrr: 79,
    warningFlags: [],
    activityLogs: [{ date: '2026-07-16', type: 'login', details: 'Medan terminal connected.' }],
    pastJourneys: []
  },
  "cus_012": {
    email: 'ceo@dewataresorts.id',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=80',
    location: 'Bali, Indonesia',
    lat: -8.6705,
    lng: 115.2126,
    mrr: 199,
    warningFlags: [],
    activityLogs: [{ date: '2026-07-16', type: 'login', details: 'Account active from Bali.' }],
    pastJourneys: []
  },
  "cus_013": {
    email: 'staff@peraktin.my',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
    location: 'Ipoh, Malaysia',
    lat: 4.5921,
    lng: 101.0901,
    mrr: 79,
    warningFlags: [],
    activityLogs: [{ date: '2026-07-16', type: 'support_open', details: 'Ipoh team opened API review.' }],
    pastJourneys: []
  },
  "cus_014": {
    email: 'admin@borneoeco.my',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    location: 'Kuching, Malaysia',
    lat: 1.5533,
    lng: 110.3592,
    mrr: 39,
    warningFlags: [],
    activityLogs: [{ date: '2026-07-16', type: 'login', details: 'Logged in from Kuching.' }],
    pastJourneys: []
  },
  "cus_015": {
    email: 'contact@javacoffee.id',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    location: 'Yogyakarta, Indonesia',
    lat: -7.7956,
    lng: 110.3695,
    mrr: 79,
    warningFlags: ['Failed Payment'],
    activityLogs: [{ date: '2026-07-15', type: 'payment_fail', details: 'Dunning alert on Yogyakarta account.' }],
    pastJourneys: []
  },
  "cus_016": {
    email: 'changi@aerospace.sg',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    location: 'Singapore',
    lat: 1.3500,
    lng: 103.9900,
    mrr: 199,
    warningFlags: [],
    activityLogs: [{ date: '2026-07-16', type: 'feature_use', details: 'Changi team operations.' }],
    pastJourneys: []
  },
  "cus_017": {
    email: 'kinabalu@forestry.my',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    location: 'Kota Kinabalu, Malaysia',
    lat: 5.9804,
    lng: 116.0735,
    mrr: 79,
    warningFlags: [],
    activityLogs: [{ date: '2026-07-16', type: 'login', details: 'Kota Kinabalu workspace sync.' }],
    pastJourneys: []
  },
  "cus_018": {
    email: 'sales@palembangenergy.id',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=80',
    location: 'Palembang, Indonesia',
    lat: -2.9909,
    lng: 104.7566,
    mrr: 39,
    warningFlags: [],
    activityLogs: [{ date: '2026-07-16', type: 'login', details: 'Palembang check-in.' }],
    pastJourneys: []
  },
  "cus_019": {
    email: 'makassar@shipping.id',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
    location: 'Makassar, Indonesia',
    lat: -5.1477,
    lng: 119.4327,
    mrr: 199,
    warningFlags: [],
    activityLogs: [{ date: '2026-07-16', type: 'feature_use', details: 'Makassar batch sync triggered.' }],
    pastJourneys: []
  },
  "cus_020": {
    email: 'dev@pontianakagro.id',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    location: 'Pontianak, Indonesia',
    lat: -0.0263,
    lng: 109.3425,
    mrr: 79,
    warningFlags: [],
    activityLogs: [{ date: '2026-07-16', type: 'support_open', details: 'Pontianak dev logged ticket.' }],
    pastJourneys: []
  }
};

const offlineNames: Record<string, string> = {
  "cus_001": "Yap", "cus_002": "Acme Selangor", "cus_003": "Nusantara Tech", "cus_004": "Temasek Holdings", "cus_005": "Surabaya Maritime",
  "cus_006": "Penang Semiconductor", "cus_007": "Bandung Creative Labs", "cus_008": "Batam Electronics", "cus_009": "Johor Logistics Hub", "cus_010": "Orchard Retailers",
  "cus_011": "Medan Palm Corp", "cus_012": "Dewata Resort Group", "cus_013": "Perak Tin Mining", "cus_014": "Borneo Eco Solutions", "cus_015": "Java Coffee Roasters",
  "cus_016": "Changi Aerospace", "cus_017": "Kinabalu Forestry", "cus_018": "Palembang Energy", "cus_019": "Makassar Shipping", "cus_020": "Pontianak Agro"
};

const offlinePlans: Record<string, string> = {
  "cus_001": "Enterprise", "cus_002": "Pro", "cus_003": "Enterprise", "cus_004": "Starter", "cus_005": "Pro",
  "cus_006": "Enterprise", "cus_007": "Pro", "cus_008": "Enterprise", "cus_009": "Starter", "cus_010": "Pro",
  "cus_011": "Pro", "cus_012": "Enterprise", "cus_013": "Pro", "cus_014": "Starter", "cus_015": "Pro",
  "cus_016": "Enterprise", "cus_017": "Pro", "cus_018": "Starter", "cus_019": "Enterprise", "cus_020": "Pro"
};

const offlineHealth: Record<string, number> = {
  "cus_001": 41.2, "cus_002": 68.5, "cus_003": 88.9, "cus_004": 52.3, "cus_005": 74.1,
  "cus_006": 91.5, "cus_007": 58.2, "cus_008": 35.8, "cus_009": 79.4, "cus_010": 85.1,
  "cus_011": 64.0, "cus_012": 94.0, "cus_013": 48.0, "cus_014": 72.0, "cus_015": 38.5,
  "cus_016": 87.0, "cus_017": 62.0, "cus_018": 55.0, "cus_019": 89.5, "cus_020": 40.8
};

const offlineChurn: Record<string, number> = {
  "cus_001": 0.72, "cus_002": 0.34, "cus_003": 0.08, "cus_004": 0.55, "cus_005": 0.21,
  "cus_006": 0.05, "cus_007": 0.42, "cus_008": 0.78, "cus_009": 0.18, "cus_010": 0.09,
  "cus_011": 0.38, "cus_012": 0.04, "cus_013": 0.52, "cus_014": 0.15, "cus_015": 0.74,
  "cus_016": 0.07, "cus_017": 0.28, "cus_018": 0.44, "cus_019": 0.06, "cus_020": 0.68
};

const offlineRisk: Record<string, string> = {
  "cus_001": "high", "cus_002": "medium", "cus_003": "low", "cus_004": "high", "cus_005": "medium",
  "cus_006": "low", "cus_007": "medium", "cus_008": "high", "cus_009": "medium", "cus_010": "low",
  "cus_011": "medium", "cus_012": "low", "cus_013": "high", "cus_014": "low", "cus_015": "high",
  "cus_016": "low", "cus_017": "medium", "cus_018": "medium", "cus_019": "low", "cus_020": "high"
};

const offlineUsage: Record<string, number> = {
  "cus_001": 34.0, "cus_002": 61.0, "cus_003": 92.0, "cus_004": 45.0, "cus_005": 70.0,
  "cus_006": 88.0, "cus_007": 50.0, "cus_008": 22.0, "cus_009": 72.0, "cus_010": 93.0,
  "cus_011": 58.0, "cus_012": 96.0, "cus_013": 39.0, "cus_014": 78.0, "cus_015": 31.0,
  "cus_016": 91.0, "cus_017": 65.0, "cus_018": 48.0, "cus_019": 94.0, "cus_020": 32.0
};

// The Telco dataset has no geography, so backend customers outside the static
// metadata map get a deterministic pseudo-location: hash of the customer ID
// picks a city, plus a small jitter so same-city dots don't stack on the globe.
const GLOBE_CITIES: { city: string; lat: number; lng: number }[] = [
  { city: 'Kuala Lumpur, Malaysia', lat: 3.1390, lng: 101.6869 },
  { city: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { city: 'Jakarta, Indonesia', lat: -6.2088, lng: 106.8456 },
  { city: 'Petaling Jaya, Malaysia', lat: 3.1073, lng: 101.6067 },
  { city: 'Surabaya, Indonesia', lat: -7.2575, lng: 112.7521 },
  { city: 'George Town, Malaysia', lat: 5.4141, lng: 100.3288 },
  { city: 'Bandung, Indonesia', lat: -6.9175, lng: 107.6191 },
  { city: 'Johor Bahru, Malaysia', lat: 1.4927, lng: 103.7414 },
  { city: 'Medan, Indonesia', lat: 3.5952, lng: 98.6722 },
  { city: 'Batam, Indonesia', lat: 1.0825, lng: 104.0305 },
  { city: 'Bali, Indonesia', lat: -8.6705, lng: 115.2126 },
  { city: 'Ipoh, Malaysia', lat: 4.5921, lng: 101.0901 },
  { city: 'Kuching, Malaysia', lat: 1.5533, lng: 110.3592 },
  { city: 'Yogyakarta, Indonesia', lat: -7.7956, lng: 110.3695 },
  { city: 'Kota Kinabalu, Malaysia', lat: 5.9804, lng: 116.0735 },
  { city: 'Palembang, Indonesia', lat: -2.9909, lng: 104.7566 },
  { city: 'Makassar, Indonesia', lat: -5.1477, lng: 119.4327 },
  { city: 'Pontianak, Indonesia', lat: -0.0263, lng: 109.3425 }
];

const hashId = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

const pseudoGeo = (customerId: string) => {
  const h = hashId(customerId);
  const city = GLOBE_CITIES[h % GLOBE_CITIES.length];
  // Jitter of up to ±1.5° (~165 km) keeps dots near their city but distinct.
  const jitterLat = (((h >> 8) % 100) / 100) * 3 - 1.5;
  const jitterLng = (((h >> 16) % 100) / 100) * 3 - 1.5;
  return { location: city.city, lat: city.lat + jitterLat, lng: city.lng + jitterLng };
};

// Estimated monthly savings from right-sizing to a lower plan tier (~40% of
// current charges), so the figure is always consistent with the customer's
// real monthly_charges instead of a hardcoded amount.
export const downgradeSavings = (mrr: number): number =>
  Math.max(5, Math.round(mrr * 0.4));

// Added cost of stepping up one plan tier (~30% of current charges), same
// consistency rationale as downgradeSavings.
export const upgradeCost = (mrr: number): number =>
  Math.max(5, Math.round(mrr * 0.3));

export const PLAN_LADDER = ['Starter', 'Growth', 'Pro', 'Enterprise'] as const;
export type PlanTier = typeof PLAN_LADDER[number];

export interface PlanSuggestion {
  direction: 'downgrade' | 'upgrade';
  targetPlan: PlanTier;
  // RM/month saved (downgrade) or added (upgrade).
  monthlyDelta: number;
}

// Threshold-based subscription right-sizing (no model — a rule, per the
// feature spec): usage far below plan capacity steps the customer down a tier
// (very low usage goes straight to Starter); sustained near-cap usage steps
// them up. Returns null when the plan already fits.
export const suggestPlanChange = (
  plan: string,
  usageVelocity: number,
  mrr: number
): PlanSuggestion | null => {
  const idx = PLAN_LADDER.indexOf(plan as PlanTier);
  if (idx === -1) return null;
  if (usageVelocity < 0.35 && idx > 0) {
    const targetIdx = usageVelocity < 0.2 ? 0 : idx - 1;
    return { direction: 'downgrade', targetPlan: PLAN_LADDER[targetIdx], monthlyDelta: downgradeSavings(mrr) };
  }
  if (usageVelocity > 0.9 && idx < PLAN_LADDER.length - 1) {
    return { direction: 'upgrade', targetPlan: PLAN_LADDER[idx + 1], monthlyDelta: upgradeCost(mrr) };
  }
  return null;
};

const dateDaysAgo = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

// Deterministic activity timeline derived from the customer's REAL signals
// (login_frequency, payment_status, support_ticket_count, feedback_score,
// feature_usage, monthly_charges). Dates are seeded from the customer id so
// re-renders always produce the identical timeline.
const deriveActivityLogs = (c: any): UserActivityLog[] => {
  const h = hashId(c.customer_id || '');
  const logs: UserActivityLog[] = [];

  const loginFreq: number | null = c.login_frequency ?? null;
  if (loginFreq != null) {
    // More frequent logins → more recent last-seen date.
    const gap = loginFreq >= 5 ? h % 2 : loginFreq >= 3 ? 1 + (h % 3) : loginFreq >= 1.5 ? 4 + (h % 4) : 9 + (h % 7);
    logs.push({
      date: dateDaysAgo(gap),
      type: 'login',
      details: `Signed in — averaging ${loginFreq.toFixed(1)} logins/week`,
    });
  }

  if (c.feature_usage != null && c.feature_usage >= 0.5) {
    logs.push({
      date: dateDaysAgo(2 + (h % 5)),
      type: 'feature_use',
      details: `Actively using ${Math.round(c.feature_usage * 100)}% of plan features this month`,
    });
  }

  const charges = c.monthly_charges != null ? `RM${Number(c.monthly_charges).toFixed(2)}` : 'monthly invoice';
  if (c.payment_status === 'past_due') {
    logs.push({
      date: dateDaysAgo(3 + (h % 8)),
      type: 'payment_fail',
      details: `Card payment of ${charges} declined — account past due`,
    });
  } else {
    logs.push({
      date: dateDaysAgo(6 + (h % 22)),
      type: 'payment_success',
      details: `Paid ${charges} invoice (${c.contract || 'Month-to-month'} contract)`,
    });
  }

  const tickets: number = c.support_ticket_count ?? 0;
  if (tickets > 0) {
    const openGap = 5 + (h % 9);
    logs.push({
      date: dateDaysAgo(openGap),
      type: 'support_open',
      details: `Opened support ticket #${1000 + (h % 900)} — ${tickets} ticket${tickets > 1 ? 's' : ''} in the last 90 days`,
    });
    if (c.feedback_score != null) {
      // Resolution always lands after the open date.
      logs.push({
        date: dateDaysAgo(Math.max(1, openGap - 1 - (h % 3))),
        type: 'support_resolve',
        details: `Ticket resolved — customer rated the experience ${Number(c.feedback_score).toFixed(1)}/10`,
      });
    }
  }

  return logs
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 6);
};

export const mergeBackendCustomer = (backendCust: any): ActiveUser => {
  const geo = pseudoGeo(backendCust.customer_id);
  const meta = staticCustomerMetadata[backendCust.customer_id] || {
    email: `${backendCust.customer_id}@example.com`,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
    location: geo.location,
    lat: geo.lat,
    lng: geo.lng,
    mrr: backendCust.subscription_plan === 'Enterprise' ? 199 : backendCust.subscription_plan === 'Pro' ? 79 : 39,
    warningFlags: [],
    activityLogs: [],
    pastJourneys: []
  };

  return {
    id: backendCust.customer_id,
    name: backendCust.name,
    email: meta.email,
    avatar: meta.avatar,
    location: meta.location,
    lat: meta.lat,
    lng: meta.lng,
    plan: backendCust.subscription_plan,
    // Prefer the customer's real monthly charges (Telco data) so revenue
    // figures match the what-if simulator's revenue delta exactly.
    mrr: backendCust.monthly_charges != null ? Math.round(backendCust.monthly_charges) : meta.mrr,
    healthScore: Math.round(backendCust.health_score),
    churnProbability: Math.round(backendCust.churn_probability * 100),
    warningFlags: (() => {
      const flags = new Set(meta.warningFlags);
      if (backendCust.risk_tier === 'high') flags.add('Likely to Leave');
      if (backendCust.payment_status === 'past_due') flags.add('Failed Payment');
      if (backendCust.login_frequency != null && backendCust.login_frequency < 2) flags.add('Using It Less');
      // Mirrors backend _SILENT_CHURN (repository.py) — keep thresholds in sync.
      // NEW-* signups excluded: fresh-account defaults would match on day 0.
      if (
        !String(backendCust.customer_id).startsWith('NEW-') &&
        backendCust.login_frequency != null && backendCust.login_frequency < 2.5 &&
        backendCust.support_ticket_count != null && backendCust.support_ticket_count <= 2 &&
        backendCust.health_score > 40
      ) flags.add('Silent Churner');
      return [...flags];
    })(),
    metrics: {
      usageVelocity: backendCust.monthly_usage_pct ? Number((backendCust.monthly_usage_pct / 100).toFixed(2)) : 0.8,
      featureAdoption: backendCust.feature_usage != null
        ? Number(Number(backendCust.feature_usage).toFixed(2))
        : 0.5,
      frictionIndex: backendCust.support_ticket_count != null
        ? Math.min(10, Math.max(0, backendCust.support_ticket_count))
        : 2.0,
      failedPayments: backendCust.payment_status === 'past_due' ? 1 : 0,
      daysSinceOnboarding: backendCust.signup_date
        ? Math.max(1, Math.round((Date.now() - new Date(backendCust.signup_date).getTime()) / 86400000))
        : 120,
    },
    churnFactors: (backendCust.shap_reasons || []).map((r: any) => ({
      name: r.feature.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      impact: Math.round(r.contribution * 100)
    })),
    // Hand-written logs for the offline mock users; real customers get a
    // deterministic timeline derived from their actual signals.
    activityLogs: meta.activityLogs.length > 0 ? meta.activityLogs : deriveActivityLogs(backendCust),
    pastJourneys: meta.pastJourneys,
    state: backendCust.state || (
      backendCust.health_score < 40 ? 'frustrated' :
      backendCust.health_score < 70 ? 'disengaged' :
      'active'
    )
  };
};

export const mockUsers: ActiveUser[] = Object.keys(staticCustomerMetadata).map(key => {
  return mergeBackendCustomer({
    customer_id: key,
    name: offlineNames[key] || "Unknown Client",
    subscription_plan: offlinePlans[key] || "Pro",
    health_score: offlineHealth[key] || 70,
    churn_probability: offlineChurn[key] || 0.15,
    risk_tier: offlineRisk[key] || "medium",
    recommended_action: "",
    monthly_usage_pct: offlineUsage[key] || 60.0
  });
});
