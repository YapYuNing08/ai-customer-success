export interface UserActivityLog {
  date: string;
  type: 'login' | 'payment_success' | 'payment_fail' | 'support_open' | 'support_resolve' | 'feature_use';
  details: string;
}

export interface ChurnFactor {
  name: string;
  impact: number; // positive = pushes risk up, negative = pulls risk down
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
  churnProbability: number; // 0 to 100
  warningFlags: string[];
  metrics: {
    usageVelocity: number; // last 7 days / prior 7-14 days average
    featureAdoption: number; // 0 to 1
    frictionIndex: number; // 0 to 10
    failedPayments: number;
    daysSinceOnboarding: number;
  };
  churnFactors: ChurnFactor[];
  activityLogs: UserActivityLog[];
  pastJourneys: PastJourney[];
}

export const mockUsers: ActiveUser[] = [
  {
    id: 'user_1',
    name: 'Sarah Jenkins',
    email: 'sjenkins@apextech.io',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    location: 'San Francisco, USA',
    lat: 37.7749,
    lng: -122.4194,
    plan: 'Enterprise',
    mrr: 1200,
    healthScore: 88,
    churnProbability: 8,
    warningFlags: [],
    metrics: {
      usageVelocity: 1.15,
      featureAdoption: 0.85,
      frictionIndex: 1.2,
      failedPayments: 0,
      daysSinceOnboarding: 240,
    },
    churnFactors: [
      { name: 'Feature Adoption', impact: -15 },
      { name: 'Usage Trend', impact: -8 },
      { name: 'Support Sentiment', impact: -5 },
      { name: 'Contract length', impact: -10 },
      { name: 'Ticket Backlog', impact: 2 },
    ],
    activityLogs: [
      { date: '2026-07-15', type: 'feature_use', details: 'Used Advanced Analytics dashboard' },
      { date: '2026-07-14', type: 'login', details: 'Logged in from desktop browser' },
      { date: '2026-07-10', type: 'payment_success', details: 'Invoice #1092 paid ($1,200.00)' },
      { date: '2026-07-02', type: 'support_resolve', details: 'Resolved API token renewal query' }
    ],
    pastJourneys: [
      {
        name: 'CloudScale Corp',
        plan: 'Enterprise',
        outcome: 'retained',
        reason: 'Requested dashboard expansion after Month 6',
        intervention: 'Proactive account manager training sessions and custom report setup.',
        similarity: 88
      }
    ]
  },
  {
    id: 'user_2',
    name: 'Hiroshi Tanaka',
    email: 'tanaka@miraicorps.jp',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    location: 'Tokyo, Japan',
    lat: 35.6762,
    lng: 139.6503,
    plan: 'Pro',
    mrr: 350,
    healthScore: 32,
    churnProbability: 74,
    warningFlags: ['Usage Decay', 'Failed Payment'],
    metrics: {
      usageVelocity: 0.38, // 62% drop
      featureAdoption: 0.20, // using only basic features
      frictionIndex: 6.8,
      failedPayments: 1,
      daysSinceOnboarding: 95,
    },
    churnFactors: [
      { name: 'Usage Trend', impact: 32 },
      { name: 'Failed Invoices', impact: 24 },
      { name: 'Support Response Delay', impact: 15 },
      { name: 'Low Feature Use', impact: 12 },
      { name: 'Contract Age (Mid-term)', impact: 3 },
      { name: 'NPS Sentiment', impact: -12 }
    ],
    activityLogs: [
      { date: '2026-07-12', type: 'payment_fail', details: 'Invoice #1105 failed (Declined by Bank)' },
      { date: '2026-07-05', type: 'login', details: 'Logged in for 2 minutes, no actions taken' },
      { date: '2026-06-28', type: 'support_open', details: 'Submitted ticket: API reliability issues' },
      { date: '2026-06-15', type: 'feature_use', details: 'Exported basic CSV report' }
    ],
    pastJourneys: [
      {
        name: 'Saito Media Inc',
        plan: 'Pro',
        outcome: 'churned',
        reason: 'Payment failed at Month 3 while usage was dropping. No response to automated dunning emails.',
        intervention: 'None. Automated dunning emails were ignored, account locked after 10 days, user churned.',
        similarity: 92
      },
      {
        name: 'Zenith Logistics',
        plan: 'Pro',
        outcome: 'retained',
        reason: 'Billing issue occurred during usage decline due to credit card expiration.',
        intervention: 'CSM reached out manually, extended a 7-day grace period, and scheduled a quick onboarding recap. Card updated.',
        similarity: 85
      }
    ]
  },
  {
    id: 'user_3',
    name: 'Carlos Diaz',
    email: 'carlos.diaz@solarenergy.es',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    location: 'Madrid, Spain',
    lat: 40.4168,
    lng: -3.7038,
    plan: 'Pro',
    mrr: 350,
    healthScore: 54,
    churnProbability: 42,
    warningFlags: ['Unresolved Tickets'],
    metrics: {
      usageVelocity: 0.82,
      featureAdoption: 0.55,
      frictionIndex: 4.5,
      failedPayments: 0,
      daysSinceOnboarding: 180,
    },
    churnFactors: [
      { name: 'Open Support Tickets', impact: 22 },
      { name: 'API Latency Issues', impact: 14 },
      { name: 'Feature Adoption', impact: -8 },
      { name: 'Billing Consistency', impact: -6 },
      { name: 'Login Frequency', impact: 20 }
    ],
    activityLogs: [
      { date: '2026-07-16', type: 'support_open', details: 'Submitted ticket: High latency during batch processing' },
      { date: '2026-07-14', type: 'login', details: 'Logged in from desktop browser' },
      { date: '2026-07-09', type: 'support_open', details: 'Submitted ticket: Webhook trigger failures' },
      { date: '2026-07-01', type: 'payment_success', details: 'Invoice #1085 paid ($350.00)' }
    ],
    pastJourneys: [
      {
        name: 'TechNovas SA',
        plan: 'Pro',
        outcome: 'retained',
        reason: 'Faced integration hiccups in month 5, raised multiple tickets.',
        intervention: 'Assigned senior developer to review integration in a 20-min session. Resolved issues, retained.',
        similarity: 81
      }
    ]
  },
  {
    id: 'user_4',
    name: 'Elena Rostova',
    email: 'e.rostova@berlincloud.de',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    location: 'Berlin, Germany',
    lat: 52.5200,
    lng: 13.4050,
    plan: 'Enterprise',
    mrr: 1500,
    healthScore: 28,
    churnProbability: 81,
    warningFlags: ['Usage Decay', 'Low Feature Adoption'],
    metrics: {
      usageVelocity: 0.25, // 75% drop
      featureAdoption: 0.12, // extremely low
      frictionIndex: 3.2,
      failedPayments: 0,
      daysSinceOnboarding: 45, // very new Enterprise user!
    },
    churnFactors: [
      { name: 'Onboarding Deficit', impact: 38 },
      { name: 'Usage Decay Velocity', impact: 28 },
      { name: 'Low Feature Adoption', impact: 18 },
      { name: 'Contract Size Risk', impact: 5 },
      { name: 'Billing Issues', impact: -8 }
    ],
    activityLogs: [
      { date: '2026-07-10', type: 'login', details: 'Brief login (1.5 minutes)' },
      { date: '2026-06-25', type: 'feature_use', details: 'Setup integration (incomplete)' },
      { date: '2026-06-10', type: 'payment_success', details: 'Initial onboarding invoice paid ($1,500.00)' },
      { date: '2026-06-08', type: 'login', details: 'First account creation' }
    ],
    pastJourneys: [
      {
        name: 'Vanguard Systems',
        plan: 'Enterprise',
        outcome: 'churned',
        reason: 'New Enterprise user failed to integrate key workflows within 45 days, dropped usage, churned at month 2.',
        intervention: 'Standard onboarding sequences sent automatically, but no live CSM outreach occurred.',
        similarity: 95
      },
      {
        name: 'RheinGroup AG',
        plan: 'Enterprise',
        outcome: 'retained',
        reason: 'Low initial usage after signup due to lack of developer bandwidth to integrate.',
        intervention: 'Offered white-glove engineering integration support. CSM arranged a kickoff call. Account successfully launched.',
        similarity: 90
      }
    ]
  },
  {
    id: 'user_5',
    name: 'Marcus Vance',
    email: 'mvance@sydneymarketing.au',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
    location: 'Sydney, Australia',
    lat: -33.8688,
    lng: 151.2093,
    plan: 'Starter',
    mrr: 80,
    healthScore: 94,
    churnProbability: 3,
    warningFlags: [],
    metrics: {
      usageVelocity: 1.30,
      featureAdoption: 0.95,
      frictionIndex: 0.5,
      failedPayments: 0,
      daysSinceOnboarding: 320,
    },
    churnFactors: [
      { name: 'Feature Adoption', impact: -18 },
      { name: 'Usage Velocity', impact: -12 },
      { name: 'Renewal Window', impact: -8 },
      { name: 'Contract Loyalty', impact: -15 }
    ],
    activityLogs: [
      { date: '2026-07-16', type: 'feature_use', details: 'Triggered automated campaign pipeline' },
      { date: '2026-07-15', type: 'login', details: 'Logged in from desktop App' },
      { date: '2026-07-02', type: 'payment_success', details: 'Invoice #1072 paid ($80.00)' }
    ],
    pastJourneys: [
      {
        name: 'ByteSized Marketing',
        plan: 'Starter',
        outcome: 'retained',
        reason: 'Consistent high utility and high features use.',
        intervention: 'Offered expansion bundle to Pro plan at a discounted rate.',
        similarity: 86
      }
    ]
  },
  {
    id: 'user_6',
    name: 'Femi Awolowo',
    email: 'femi@lagosventures.ng',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=80',
    location: 'Lagos, Nigeria',
    lat: 6.5244,
    lng: 3.3792,
    plan: 'Pro',
    mrr: 350,
    healthScore: 72,
    churnProbability: 12,
    warningFlags: [],
    metrics: {
      usageVelocity: 0.98,
      featureAdoption: 0.70,
      frictionIndex: 2.1,
      failedPayments: 0,
      daysSinceOnboarding: 110,
    },
    churnFactors: [
      { name: 'Feature Adoption', impact: -10 },
      { name: 'Usage velocity', impact: -2 },
      { name: 'Billing Stability', impact: -8 },
      { name: 'Open Support Tickets', impact: 4 }
    ],
    activityLogs: [
      { date: '2026-07-14', type: 'login', details: 'Logged in from mobile device' },
      { date: '2026-07-05', type: 'payment_success', details: 'Invoice #1091 paid ($350.00)' },
      { date: '2026-06-20', type: 'support_resolve', details: 'Resolved query regarding seats upgrade' }
    ],
    pastJourneys: [
      {
        name: 'Nexa Capital',
        plan: 'Pro',
        outcome: 'retained',
        reason: 'Highly active user, upgraded seats during month 4.',
        intervention: 'Offered customized expansion packaging.',
        similarity: 80
      }
    ]
  },
  {
    id: 'user_7',
    name: 'Amina Al-Mansoor',
    email: 'amina@dubaimedia.ae',
    avatar: 'https://images.unsplash.com/photo-1534751516642-a131ffd103fd?auto=format&fit=crop&w=100&q=80',
    location: 'Dubai, UAE',
    lat: 25.2048,
    lng: 55.2708,
    plan: 'Enterprise',
    mrr: 1200,
    healthScore: 48,
    churnProbability: 55,
    warningFlags: ['Failed Payment'],
    metrics: {
      usageVelocity: 0.78,
      featureAdoption: 0.40,
      frictionIndex: 5.2,
      failedPayments: 1,
      daysSinceOnboarding: 150,
    },
    churnFactors: [
      { name: 'Failed Invoices', impact: 28 },
      { name: 'Support sentiment', impact: 15 },
      { name: 'Usage decline', impact: 12 },
      { name: 'Feature Adoption', impact: -4 },
      { name: 'Account volume size', impact: 4 }
    ],
    activityLogs: [
      { date: '2026-07-11', type: 'payment_fail', details: 'Invoice #1102 failed (Authentication Required)' },
      { date: '2026-07-09', type: 'login', details: 'Logged in to change password settings' },
      { date: '2026-06-25', type: 'support_open', details: 'Submitted ticket: Payment system API issues' }
    ],
    pastJourneys: [
      {
        name: 'Emirates Telecoms',
        plan: 'Enterprise',
        outcome: 'retained',
        reason: 'Payment failed due to corporate card limits in month 5.',
        intervention: 'Prompt alert to CSM. CSM reached out via phone call, bypassed automated block, processed wire transfer. Account active.',
        similarity: 89
      }
    ]
  },
  {
    id: 'user_8',
    name: 'Hugo Silva',
    email: 'hugo@innovabr.com.br',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    location: 'São Paulo, Brazil',
    lat: -23.5505,
    lng: -46.6333,
    plan: 'Pro',
    mrr: 350,
    healthScore: 84,
    churnProbability: 9,
    warningFlags: [],
    metrics: {
      usageVelocity: 1.05,
      featureAdoption: 0.80,
      frictionIndex: 1.8,
      failedPayments: 0,
      daysSinceOnboarding: 210,
    },
    churnFactors: [
      { name: 'Feature Adoption', impact: -12 },
      { name: 'Usage Stability', impact: -6 },
      { name: 'Billing Consistency', impact: -8 },
      { name: 'Contract Age', impact: -4 }
    ],
    activityLogs: [
      { date: '2026-07-14', type: 'feature_use', details: 'Configured automated webhook' },
      { date: '2026-07-13', type: 'login', details: 'Logged in from office IP' },
      { date: '2026-07-01', type: 'payment_success', details: 'Invoice #1081 paid ($350.00)' }
    ],
    pastJourneys: [
      {
        name: 'Guanabara Tech',
        plan: 'Pro',
        outcome: 'retained',
        reason: 'Strong organic feature adoption.',
        intervention: 'Enrolled in beta feature program to further cement value.',
        similarity: 82
      }
    ]
  }
];
