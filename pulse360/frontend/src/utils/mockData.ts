export interface UserActivityLog {
  date: string;
  type: 'login' | 'payment_success' | 'payment_fail' | 'support_open' | 'support_resolve' | 'feature_use';
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
  plan: 'Starter' | 'Pro' | 'Enterprise';
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
    email: 'contact@northwind.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    location: 'San Francisco, USA',
    lat: 37.7749,
    lng: -122.4194,
    mrr: 4500,
    warningFlags: ['Usage Decay'],
    activityLogs: [
      { date: '2026-07-15', type: 'feature_use', details: 'Used Advanced Analytics dashboard' },
      { date: '2026-07-14', type: 'login', details: 'Logged in from desktop browser' },
      { date: '2026-07-10', type: 'payment_success', details: 'Invoice #1092 paid ($4,500.00)' }
    ],
    pastJourneys: []
  },
  "cus_002": {
    email: 'ops@acmerobotics.co.jp',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    location: 'Tokyo, Japan',
    lat: 35.6762,
    lng: 139.6503,
    mrr: 1500,
    warningFlags: ['Low Feature Adoption'],
    activityLogs: [
      { date: '2026-07-12', type: 'login', details: 'Logged in for 2 minutes' }
    ],
    pastJourneys: []
  },
  "cus_003": {
    email: 'support@blueharbor.es',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    location: 'Madrid, Spain',
    lat: 40.4168,
    lng: -3.7038,
    mrr: 5000,
    warningFlags: [],
    activityLogs: [
      { date: '2026-07-16', type: 'login', details: 'Logged in from desktop' }
    ],
    pastJourneys: []
  },
  "cus_004": {
    email: 'billing@cedarco.de',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    location: 'Cape Town, South Africa',
    lat: -33.9249,
    lng: 18.4241,
    mrr: 400,
    warningFlags: ['Failed Payment'],
    activityLogs: [
      { date: '2026-07-10', type: 'payment_fail', details: 'Invoice failed (Declined by Bank)' }
    ],
    pastJourneys: []
  },
  "cus_005": {
    email: 'analytics@summit.au',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
    location: 'Sydney, Australia',
    lat: -33.8688,
    lng: 151.2093,
    mrr: 1500,
    warningFlags: [],
    activityLogs: [
      { date: '2026-07-16', type: 'feature_use', details: 'Triggered automated campaign pipeline' }
    ],
    pastJourneys: []
  },
  "cus_006": {
    email: 'ops@londonfinancial.co.uk',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    location: 'London, UK',
    lat: 51.5074,
    lng: -0.1278,
    mrr: 4500,
    warningFlags: [],
    activityLogs: [
      { date: '2026-07-16', type: 'login', details: 'Logged in from Corporate VPN' }
    ],
    pastJourneys: []
  },
  "cus_007": {
    email: 'contact@parislogistics.fr',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    location: 'Nairobi, Kenya',
    lat: -1.2921,
    lng: 36.8219,
    mrr: 1200,
    warningFlags: ['Low Feature Adoption'],
    activityLogs: [
      { date: '2026-07-15', type: 'login', details: 'Unusual low session login (30s)' }
    ],
    pastJourneys: []
  },
  "cus_008": {
    email: 'operations@singaporetech.sg',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    location: 'Singapore',
    lat: 1.3521,
    lng: 103.8198,
    mrr: 5000,
    warningFlags: ['High Churn Risk'],
    activityLogs: [
      { date: '2026-07-16', type: 'support_open', details: 'Opened critical bug report on API latency' }
    ],
    pastJourneys: []
  },
  "cus_009": {
    email: 'compras@saopauloretail.com.br',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=80',
    location: 'São Paulo, Brazil',
    lat: -23.5505,
    lng: -46.6333,
    mrr: 400,
    warningFlags: [],
    activityLogs: [
      { date: '2026-07-15', type: 'payment_success', details: 'Invoice paid ($400.00)' }
    ],
    pastJourneys: []
  },
  "cus_010": {
    email: 'info@torontodevs.ca',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
    location: 'Mumbai, India',
    lat: 19.0760,
    lng: 72.8777,
    mrr: 1200,
    warningFlags: [],
    activityLogs: [
      { date: '2026-07-16', type: 'feature_use', details: 'Setup advanced webhook integrations' }
    ],
    pastJourneys: []
  },
  "cus_011": {
    email: 'operations@anchorage.net',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
    location: 'Anchorage, Alaska, USA',
    lat: 61.2181,
    lng: -149.9003,
    mrr: 800,
    warningFlags: [],
    activityLogs: [{ date: '2026-07-16', type: 'login', details: 'Anchorage terminal connected.' }],
    pastJourneys: []
  },
  "cus_012": {
    email: 'ceo@lagosventures.ng',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=80',
    location: 'Lagos, Nigeria',
    lat: 6.5244,
    lng: 3.3792,
    mrr: 3500,
    warningFlags: [],
    activityLogs: [{ date: '2026-07-16', type: 'login', details: 'Account active from Lagos.' }],
    pastJourneys: []
  },
  "cus_013": {
    email: 'staff@aucklandmedia.co.nz',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
    location: 'Auckland, New Zealand',
    lat: -36.8485,
    lng: 174.7633,
    mrr: 1200,
    warningFlags: [],
    activityLogs: [{ date: '2026-07-16', type: 'support_open', details: 'Auckland team opened API review.' }],
    pastJourneys: []
  },
  "cus_014": {
    email: 'admin@reykjavikfisheries.is',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    location: 'Reykjavík, Iceland',
    lat: 64.1466,
    lng: -21.9426,
    mrr: 600,
    warningFlags: [],
    activityLogs: [{ date: '2026-07-16', type: 'login', details: 'Logged in from Iceland.' }],
    pastJourneys: []
  },
  "cus_015": {
    email: 'contact@limagri.pe',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    location: 'Lima, Peru',
    lat: -12.0464,
    lng: -77.0428,
    mrr: 1400,
    warningFlags: ['Failed Payment'],
    activityLogs: [{ date: '2026-07-15', type: 'payment_fail', details: 'Dunning alert on Lima account.' }],
    pastJourneys: []
  },
  "cus_016": {
    email: 'honolulu@resortnet.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    location: 'Honolulu, Hawaii, USA',
    lat: 21.3069,
    lng: -157.8583,
    mrr: 4000,
    warningFlags: [],
    activityLogs: [{ date: '2026-07-16', type: 'feature_use', details: 'Analyzed Honolulu visitor dashboards.' }],
    pastJourneys: []
  },
  "cus_017": {
    email: 'dubai@hospitality.ae',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    location: 'Dubai, UAE',
    lat: 25.2048,
    lng: 55.2708,
    mrr: 2200,
    warningFlags: [],
    activityLogs: [{ date: '2026-07-16', type: 'login', details: 'Dubai workspace sync complete.' }],
    pastJourneys: []
  },
  "cus_018": {
    email: 'sales@casablancatextile.ma',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=80',
    location: 'Casablanca, Morocco',
    lat: 33.5731,
    lng: -7.5898,
    mrr: 500,
    warningFlags: [],
    activityLogs: [{ date: '2026-07-16', type: 'login', details: 'Casablanca office logged in.' }],
    pastJourneys: []
  },
  "cus_019": {
    email: 'semiconductors@seoul.kr',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
    location: 'Seoul, South Korea',
    lat: 37.5665,
    lng: 126.9780,
    mrr: 4800,
    warningFlags: [],
    activityLogs: [{ date: '2026-07-16', type: 'feature_use', details: 'High-volume batch pipelines triggered.' }],
    pastJourneys: []
  },
  "cus_020": {
    email: 'dev@vancouveranalytics.ca',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    location: 'Vancouver, Canada',
    lat: 49.2827,
    lng: -123.1207,
    mrr: 1800,
    warningFlags: [],
    activityLogs: [{ date: '2026-07-16', type: 'support_open', details: 'Vancouver dev raised integration ticket.' }],
    pastJourneys: []
  }
};

const offlineNames: Record<string, string> = {
  "cus_001": "Northwind Traders", "cus_002": "Acme Robotics", "cus_003": "Blue Harbor Health", "cus_004": "Cedar & Co.", "cus_005": "Summit Analytics",
  "cus_006": "London Financial", "cus_007": "Paris Logistics", "cus_008": "Singapore Tech", "cus_009": "São Paulo Retail", "cus_010": "Toronto Devs",
  "cus_011": "Anchorage Shipping", "cus_012": "Lagos Ventures", "cus_013": "Auckland Media", "cus_014": "Reykjavík Fisheries", "cus_015": "Lima Agricultures",
  "cus_016": "Honolulu Resorts", "cus_017": "Dubai Hospitality", "cus_018": "Casablanca Textile", "cus_019": "Seoul Semiconductors", "cus_020": "Vancouver Analytics"
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
  "cus_006": 88.0, "cus_007": 50.0, "cus_008": 22.0, "cus_009": 72.0, "cus_010": 90.0,
  "cus_011": 58.0, "cus_012": 96.0, "cus_013": 39.0, "cus_014": 78.0, "cus_015": 31.0,
  "cus_016": 91.0, "cus_017": 65.0, "cus_018": 48.0, "cus_019": 94.0, "cus_020": 32.0
};

export const mergeBackendCustomer = (backendCust: any): ActiveUser => {
  const meta = staticCustomerMetadata[backendCust.customer_id] || {
    email: `${backendCust.customer_id}@example.com`,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
    location: 'Unknown Location',
    lat: 0,
    lng: 0,
    mrr: backendCust.subscription_plan === 'Enterprise' ? 4000 : backendCust.subscription_plan === 'Pro' ? 1200 : 400,
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
    mrr: meta.mrr,
    healthScore: Math.round(backendCust.health_score),
    churnProbability: Math.round(backendCust.churn_probability * 100),
    warningFlags: backendCust.risk_tier === 'high' ? [...new Set([...meta.warningFlags, 'High Churn Risk'])] : meta.warningFlags,
    metrics: {
      usageVelocity: backendCust.monthly_usage_pct ? Number((backendCust.monthly_usage_pct / 100).toFixed(2)) : 0.8,
      featureAdoption: 0.5,
      frictionIndex: 2.0,
      failedPayments: backendCust.payment_status === 'past_due' ? 1 : 0,
      daysSinceOnboarding: 120,
    },
    churnFactors: (backendCust.shap_reasons || []).map((r: any) => ({
      name: r.feature.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      impact: Math.round(r.contribution * 100)
    })),
    activityLogs: meta.activityLogs,
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
