import { AdminMember, AdminTierPlan, AdminTicket, AdminAuditLog } from '../types/admin';

export const INITIAL_ADMIN_MEMBERS: AdminMember[] = [
  {
    id: 'usr-admin-mohdzul',
    name: 'Mohd Zulhisam',
    email: 'mohdzul@gmail.com',
    role: 'admin',
    tier: 'Single User',
    status: 'Active',
    institution: 'Empirical Research Consortium',
    department: 'Department of Statistical Governance & Analytics',
    validUntil: 'October 19, 2027 (1-Year Access)',
    joinedDate: 'Jan 15, 2023',
    lastActive: 'Just now',
    datasetsCount: 12,
    datasetsLimit: 'Unlimited',
    analysesCount: 145,
    analysesLimit: 'Unlimited',
    aiTokensUsed: 58,
    aiTokensLimit: 'Unlimited',
    avatarInitials: 'MZ',
    avatarColor: 'from-amber-600 to-indigo-700',
    notes: 'Single User Membership Plan with 1 Year Access in default RM currency. Super Administrator governance authority.',
  },
  {
    id: 'usr-schol-01',
    name: 'Dr. Alex Morgan',
    email: 'example@gmail.com',
    role: 'researcher',
    tier: 'Single User',
    status: 'Active',
    institution: 'University of Science & Technology',
    department: 'Faculty of Social & Behavioral Sciences',
    validUntil: 'October 19, 2027 (1-Year Access)',
    joinedDate: 'Feb 10, 2024',
    lastActive: '2 hours ago',
    datasetsCount: 4,
    datasetsLimit: 'Unlimited',
    analysesCount: 18,
    analysesLimit: 'Unlimited',
    aiTokensUsed: 7,
    aiTokensLimit: 'Unlimited',
    avatarInitials: 'AM',
    avatarColor: 'from-blue-600 to-indigo-700',
    notes: 'Single User Membership Plan with 1-Year Access. Default RM currency applied.',
  },
  {
    id: 'usr-schol-02',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@oxford-research.org',
    role: 'researcher',
    tier: 'Pro Researcher',
    status: 'Active',
    institution: 'Oxford Center for Cognitive Studies',
    department: 'Experimental Psychology',
    validUntil: 'Nov 14, 2026',
    joinedDate: 'May 04, 2024',
    lastActive: 'Yesterday',
    datasetsCount: 9,
    datasetsLimit: 'Unlimited',
    analysesCount: 52,
    analysesLimit: 'Unlimited',
    aiTokensUsed: 22,
    aiTokensLimit: 100,
    avatarInitials: 'ER',
    avatarColor: 'from-purple-600 to-fuchsia-700',
    notes: 'Annual Pro subscriber. Active research on working memory and attention spans.',
  },
  {
    id: 'usr-schol-03',
    name: 'Prof. James Wilson',
    email: 'j.wilson@stanford-lab.edu',
    role: 'analyst',
    tier: 'Enterprise Lab',
    status: 'Active',
    institution: 'Stanford Biostatistics Lab',
    department: 'Medicine & Population Health',
    validUntil: 'Aug 20, 2027',
    joinedDate: 'Nov 12, 2023',
    lastActive: '3 days ago',
    datasetsCount: 24,
    datasetsLimit: 'Unlimited',
    analysesCount: 310,
    analysesLimit: 'Unlimited',
    aiTokensUsed: 140,
    aiTokensLimit: 'Unlimited',
    avatarInitials: 'JW',
    avatarColor: 'from-emerald-600 to-teal-700',
    notes: 'Enterprise Lab multi-seat administrator. High-volume clinical trials testing.',
  },
  {
    id: 'usr-schol-04',
    name: 'Kevin Tan',
    email: 'kevin.tan@student.edu.my',
    role: 'member',
    tier: 'Single User',
    status: 'Active',
    institution: 'National University of Malaysia',
    department: 'Educational Foundations',
    validUntil: 'Universal Open Access',
    joinedDate: 'Sep 01, 2024',
    lastActive: '4 days ago',
    datasetsCount: 1,
    datasetsLimit: 1,
    analysesCount: 4,
    analysesLimit: 5,
    aiTokensUsed: 0,
    aiTokensLimit: 1,
    avatarInitials: 'KT',
    avatarColor: 'from-slate-600 to-zinc-800',
    notes: 'Postgraduate student completing master thesis defense.',
  },
  {
    id: 'usr-schol-05',
    name: 'Aisha Patel',
    email: 'aisha.patel@cambridge.ac.uk',
    role: 'researcher',
    tier: 'Single User',
    status: 'Active',
    institution: 'University of Cambridge',
    department: 'Department of Public Health',
    validUntil: 'Jan 22, 2027',
    joinedDate: 'Jul 19, 2024',
    lastActive: '5 hours ago',
    datasetsCount: 7,
    datasetsLimit: 'Unlimited',
    analysesCount: 38,
    analysesLimit: 'Unlimited',
    aiTokensUsed: 14,
    aiTokensLimit: 100,
    avatarInitials: 'AP',
    avatarColor: 'from-rose-600 to-pink-700',
    notes: 'Investigating epidemiological interventions and regression modeling.',
  },
  {
    id: 'usr-schol-06',
    name: 'Marcus Vance',
    email: 'marcus.vance@commercial-analytics.io',
    role: 'guest',
    tier: 'Single User',
    status: 'Suspended',
    institution: 'Private Industry',
    department: 'Marketing Analytics',
    validUntil: 'Suspended',
    joinedDate: 'Aug 14, 2024',
    lastActive: '2 weeks ago',
    datasetsCount: 1,
    datasetsLimit: 1,
    analysesCount: 5,
    analysesLimit: 5,
    aiTokensUsed: 0,
    aiTokensLimit: 1,
    avatarInitials: 'MV',
    avatarColor: 'from-amber-600 to-orange-700',
    notes: 'Account suspended by mohdzul@gmail.com pending verification of academic affiliation terms.',
  },
];

export const INITIAL_ADMIN_TIERS: AdminTierPlan[] = [
  {
    id: 'Single User',
    name: 'Open Scholar Access (Non-Profit)',
    monthlyPrice: 0,
    annualPrice: 0,
    currency: 'RM',
    description: 'Universal open-access academic license granting unlimited access to all statistical tests, datasets, and APA 7th synthesis without payment or subscriptions.',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20',
    datasetLimit: 'Unlimited',
    analysisLimit: 'Unlimited',
    aiTokensLimit: 'Unlimited',
    features: [
      'Universal Lifetime Academic Access',
      'Zero subscription fees or locked features',
      'Unlimited datasets & inferential test calculations',
      'Integrated APA 7th Manuscript Synthesis in Test Analysis',
      'Automated assumption audits & Word table export',
      'Google Form Sheet and Cloud Database integration',
    ],
    activeMembersCount: 6,
  },
  {
    id: 'Open Access',
    name: 'Open Science Student Access',
    monthlyPrice: 0,
    annualPrice: 0,
    currency: 'RM',
    description: 'Full open access for undergraduate and postgraduate students conducting thesis and coursework research.',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    datasetLimit: 'Unlimited',
    analysisLimit: 'Unlimited',
    aiTokensLimit: 'Unlimited',
    features: [
      'Unlimited datasets uploaded or sampled',
      'Unlimited inferential calculations',
      'Complete APA 7th narrative & manuscript paragraphs',
      'Deterministic high-precision mathematical algorithms',
      'Community academic support',
    ],
    activeMembersCount: 2,
  },
  {
    id: 'Pro Researcher',
    name: 'Postgraduate & Fellow Access',
    monthlyPrice: 0,
    annualPrice: 0,
    currency: 'RM',
    description: 'Open research toolkit for Master/PhD candidates, lecturers, and academic fellows.',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    datasetLimit: 'Unlimited',
    analysisLimit: 'Unlimited',
    aiTokensLimit: 'Unlimited',
    features: [
      'Unlimited datasets & sample observations',
      'Full APA 7th Manuscript Synthesis with theoretical discussion',
      '6-point automated assumption audit',
      'Copy 3-line Word tables with 1 click',
      'NotebookLM log book sync',
    ],
    activeMembersCount: 3,
  },
  {
    id: 'Academic Institutional',
    name: 'Institutional Partnership (UNIMAS & Universities)',
    monthlyPrice: 0,
    annualPrice: 0,
    currency: 'RM',
    description: 'Open academic partnership and campus deployment for universities and research departments.',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    datasetLimit: 'Unlimited',
    analysisLimit: 'Unlimited',
    aiTokensLimit: 'Unlimited',
    features: [
      'Campus domain recognition',
      'Institutional team project sharing',
      'Full compliance with APA 7th guidelines',
      'Open reproducible scientific workflow',
      'Zero software licensing fees',
    ],
    activeMembersCount: 1,
  },
  {
    id: 'Enterprise Lab',
    name: 'Research Consortium & Clinical Trials',
    monthlyPrice: 0,
    annualPrice: 0,
    currency: 'RM',
    description: 'Open collaborative workspace for multi-center research teams and empirical scholars.',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    datasetLimit: 'Unlimited',
    analysisLimit: 'Unlimited',
    aiTokensLimit: 'Unlimited',
    features: [
      'Non-profit research consortium access',
      'Full administrative CMS visibility',
      'High-precision deterministic statistics',
      'Data privacy & ethical standards compliant',
      'Open science reproducibility support',
    ],
    activeMembersCount: 2,
  },
];

export const INITIAL_ADMIN_TICKETS: AdminTicket[] = [
  {
    ticketId: 'STA-4821',
    category: 'calculation',
    subject: 'Welch t-test degrees of freedom rounding convention',
    description: 'When equal variances assumption is violated, StatAssist AI uses Satterthwaite approximation. In APA 7th, does it recommend rounding to 2 decimals (e.g., t(47.32)) or integer? Thanks!',
    userName: 'Dr. Elena Rostova',
    userEmail: 'elena.rostova@oxford-research.org',
    status: 'new',
    assignedAdmin: 'mohdzul@gmail.com',
    submittedAt: 'Today, 08:30 AM',
    attachments: [{ name: 'levene_test_screen.png', size: 245000, type: 'image/png' }],
  },
  {
    ticketId: 'STA-3914',
    category: 'feature',
    subject: 'Request: Mixed-design ANOVA and Repeated Measures support',
    description: 'StatAssist AI is fantastic for between-subject Factorial ANOVA. Could administrator Mohd Zulhisam consider adding within-subjects or mixed RM-ANOVA in the next cycle?',
    userName: 'Prof. James Wilson',
    userEmail: 'j.wilson@stanford-lab.edu',
    status: 'in_progress',
    assignedAdmin: 'mohdzul@gmail.com',
    adminNotes: 'Assigned to Mohd Zulhisam. Algorithm design in progress for sphericity adjustment (Greenhouse-Geisser).',
    submittedAt: 'Yesterday, 03:15 PM',
  },
  {
    ticketId: 'STA-2804',
    category: 'bug',
    subject: 'CSV uploaded with semicolon delimiters in European locale',
    description: 'Colleagues from Germany uploaded CSV exported with semicolon delimiter (;) instead of comma (,). The parser showed 1 column. Works fine when converted to comma.',
    userName: 'Dr. Alex Morgan',
    userEmail: 'example@gmail.com',
    status: 'resolved',
    assignedAdmin: 'mohdzul@gmail.com',
    adminNotes: 'Resolved by Administrator Mohd Zulhisam. Auto-detection for comma/semicolon/tab delimiter was verified.',
    submittedAt: 'Oct 12, 2026',
    updatedAt: 'Oct 13, 2026',
  },
  {
    ticketId: 'STA-1940',
    category: 'general',
    subject: 'Institutional Membership quote for Faculty of Social Sciences',
    description: 'We would like to acquire an Academic Institutional license for 85 researchers. Please advise on invoicing and purchase order procedure.',
    userName: 'Aisha Patel',
    userEmail: 'aisha.patel@cambridge.ac.uk',
    status: 'in_progress',
    assignedAdmin: 'mohdzul@gmail.com',
    adminNotes: 'Sent procurement proposal to Cambridge purchasing department.',
    submittedAt: 'Oct 10, 2026',
  },
];

export const INITIAL_ADMIN_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'log-01',
    action: 'CMS Session Initialized',
    actor: 'mohdzul@gmail.com',
    target: 'System Governance',
    detail: 'Administrator Mohd Zulhisam logged into Admin CMS and reviewed active member quotas.',
    timestamp: 'Just now',
    severity: 'info',
  },
  {
    id: 'log-02',
    action: 'Scholar Access Verification',
    actor: 'mohdzul@gmail.com',
    target: 'Dr. Alex Morgan (example@gmail.com)',
    detail: 'Academic Institutional Grant verified and renewed through Dec 2026.',
    timestamp: 'Today, 08:00 AM',
    severity: 'success',
  },
  {
    id: 'log-03',
    action: 'Account Access Suspended',
    actor: 'mohdzul@gmail.com',
    target: 'Marcus Vance (marcus.vance@commercial-analytics.io)',
    detail: 'Temporary access suspended pending verification of non-commercial academic eligibility.',
    timestamp: 'Oct 14, 2026',
    severity: 'warning',
  },
  {
    id: 'log-04',
    action: 'Ticket Resolved',
    actor: 'mohdzul@gmail.com',
    target: 'STA-2804 (Delimiter CSV Parsing)',
    detail: 'Resolution confirmed by Administrator and ticket marked closed.',
    timestamp: 'Oct 13, 2026',
    severity: 'success',
  },
];

// Storage helpers
const STORAGE_ADMIN_MEMBERS = 'statassist_admin_members';
const STORAGE_ADMIN_TIERS = 'statassist_admin_tiers';
const STORAGE_ADMIN_TICKETS = 'statassist_admin_tickets';
const STORAGE_ADMIN_LOGS = 'statassist_admin_logs';

export const getStoredAdminMembers = (): AdminMember[] => {
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_MEMBERS);
    if (raw) {
      const parsed: AdminMember[] = JSON.parse(raw);
      let changed = false;
      const updated = parsed.map((m) => {
        if (m.name === 'Mohd Zul' || (m.email === 'mohdzul@gmail.com' && m.name !== 'Mohd Zulhisam')) {
          changed = true;
          return { ...m, name: 'Mohd Zulhisam' };
        }
        return m;
      });
      if (changed) {
        saveStoredAdminMembers(updated);
      }
      return updated;
    }
  } catch (e) {
    console.error('Failed reading admin members', e);
  }
  return INITIAL_ADMIN_MEMBERS;
};

export const saveStoredAdminMembers = (members: AdminMember[]): void => {
  try {
    localStorage.setItem(STORAGE_ADMIN_MEMBERS, JSON.stringify(members));
  } catch (e) {
    console.error('Failed saving admin members', e);
  }
};

export const getStoredAdminTiers = (): AdminTierPlan[] => {
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_TIERS);
    if (raw) {
      const parsed: AdminTierPlan[] = JSON.parse(raw);
      const hasSingleUser = parsed.some((t) => t.id === 'Single User');
      const hasRmCurrency = parsed.some((t) => t.currency === 'RM');
      if (hasSingleUser && hasRmCurrency) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed reading admin tiers', e);
  }
  return INITIAL_ADMIN_TIERS;
};

export const saveStoredAdminTiers = (tiers: AdminTierPlan[]): void => {
  try {
    localStorage.setItem(STORAGE_ADMIN_TIERS, JSON.stringify(tiers));
  } catch (e) {
    console.error('Failed saving admin tiers', e);
  }
};

export const getStoredAdminTickets = (): AdminTicket[] => {
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_TICKETS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading admin tickets', e);
  }
  return INITIAL_ADMIN_TICKETS;
};

export const saveStoredAdminTickets = (tickets: AdminTicket[]): void => {
  try {
    localStorage.setItem(STORAGE_ADMIN_TICKETS, JSON.stringify(tickets));
  } catch (e) {
    console.error('Failed saving admin tickets', e);
  }
};

export const getStoredAdminLogs = (): AdminAuditLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading admin logs', e);
  }
  return INITIAL_ADMIN_AUDIT_LOGS;
};

export const addAdminAuditLog = (action: string, target: string, detail: string, severity: 'info' | 'warning' | 'success' = 'info'): void => {
  try {
    const current = getStoredAdminLogs();
    const newLog: AdminAuditLog = {
      id: `log-${Date.now()}`,
      action,
      actor: 'mohdzul@gmail.com',
      target,
      detail,
      timestamp: 'Just now',
      severity,
    };
    const updated = [newLog, ...current].slice(0, 50);
    localStorage.setItem(STORAGE_ADMIN_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed appending admin audit log', e);
  }
};
