export type MembershipTier = 'Single User' | 'Open Access' | 'Pro Researcher' | 'Academic Institutional' | 'Enterprise Lab';
export type MembershipStatus = 'Active' | 'Pending' | 'Suspended' | 'Expired';
export type UserSystemRole = 'admin' | 'researcher' | 'analyst' | 'member' | 'guest';

export interface UserMembershipQuota {
  datasetsUsed: number;
  datasetsLimit: number | 'Unlimited';
  analysesUsed: number;
  analysesLimit: number | 'Unlimited';
  aiSynthesisUsed: number;
  aiSynthesisLimit: number | 'Unlimited';
  validUntil: string;
}

export interface UserMembershipDetails {
  tier: MembershipTier;
  status: MembershipStatus;
  planName: string;
  currency: string; // Default: 'RM' (Ringgit Malaysia)
  priceAnnual: number;
  priceMonthly: number;
  billingCycle: string;
  validUntil: string;
  quotas: UserMembershipQuota;
  features: {
    advancedAssumptions: boolean;
    aiSynthesisExport: boolean;
    rawCsvExport: boolean;
    customThemes: boolean;
    prioritySupport: boolean;
    auditLogs: boolean;
    singleUserAccess?: boolean;
  };
}

export const SINGLE_USER_ANNUAL_MEMBERSHIP: UserMembershipDetails = {
  tier: 'Single User',
  status: 'Active',
  planName: 'Single User Membership Plan',
  currency: 'RM',
  priceAnnual: 199,
  priceMonthly: 29,
  billingCycle: 'Annual (1-Year Access)',
  validUntil: 'October 19, 2027 (1-Year Access)',
  quotas: {
    datasetsUsed: 1,
    datasetsLimit: 'Unlimited',
    analysesUsed: 4,
    analysesLimit: 'Unlimited',
    aiSynthesisUsed: 2,
    aiSynthesisLimit: 'Unlimited',
    validUntil: 'October 19, 2027 (1-Year Access)',
  },
  features: {
    advancedAssumptions: true,
    aiSynthesisExport: true,
    rawCsvExport: true,
    customThemes: true,
    prioritySupport: true,
    auditLogs: true,
    singleUserAccess: true,
  },
};

export interface UserPreferences {
  defaultAlpha: number; // e.g. 0.05
  citationFormat: 'APA 7th' | 'Harvard' | 'Vancouver' | 'IEEE';
  effectSizePreference: 'cohen_d' | 'eta_squared' | 'hedges_g' | 'r';
  decimalPrecision: number; // 2, 3, or 4
  autoCheckAssumptions: boolean;
  highlightSignificant: boolean;
  exportFormat: 'markdown' | 'plain' | 'latex';
}

export interface UserStatsSummary {
  datasetsCount: number;
  analysesRunCount: number;
  apaReportsExported: number;
  savedQuestionsCount: number;
  memberSince: string;
  lastActive: string;
}

export interface UserActivityItem {
  id: string;
  type: 'analysis' | 'dataset' | 'report' | 'feedback';
  title: string;
  detail: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  systemRole?: UserSystemRole;
  membershipTier?: MembershipTier;
  membershipStatus?: MembershipStatus;
  membershipDetails?: UserMembershipDetails;
  title: string; // Academic designation / role
  institution: string; // University / Research Institute
  department: string;
  discipline: string; // e.g., 'Psychology & Behavioral Sciences'
  bio?: string;
  avatarInitials: string;
  avatarColor: string; // Tailwind color class or hex
  isVerifiedAcademic: boolean;
  orcidId?: string;
  preferences: UserPreferences;
  stats: UserStatsSummary;
  recentActivities: UserActivityItem[];
}

export const MOHDZUL_ADMIN_PROFILE: UserProfile = {
  id: 'usr-admin-mohdzul',
  name: 'Mohd Zulhisam',
  email: 'mohdzul@gmail.com',
  systemRole: 'admin',
  membershipTier: 'Single User',
  membershipStatus: 'Active',
  membershipDetails: {
    tier: 'Single User',
    status: 'Active',
    planName: 'Single User Membership Plan (Lead Administrator)',
    currency: 'RM',
    priceAnnual: 199,
    priceMonthly: 29,
    billingCycle: 'Annual (1-Year Access)',
    validUntil: 'October 19, 2027 (1-Year Access)',
    quotas: {
      datasetsUsed: 12,
      datasetsLimit: 'Unlimited',
      analysesUsed: 145,
      analysesLimit: 'Unlimited',
      aiSynthesisUsed: 58,
      aiSynthesisLimit: 'Unlimited',
      validUntil: 'October 19, 2027 (1-Year Access)',
    },
    features: {
      advancedAssumptions: true,
      aiSynthesisExport: true,
      rawCsvExport: true,
      customThemes: true,
      prioritySupport: true,
      auditLogs: true,
      singleUserAccess: true,
    },
  },
  title: 'Lead Administrator & Principal Methodologist',
  institution: 'Empirical Research Consortium',
  department: 'Department of Statistical Governance & Analytics',
  discipline: 'Quantitative Methodology & Statistical Computing',
  bio: 'Platform Administrator with complete oversight of research datasets, statistical engines, member governance, and support tickets.',
  avatarInitials: 'MZ',
  avatarColor: 'from-amber-600 to-indigo-700',
  isVerifiedAcademic: true,
  orcidId: '0000-0002-9912-3841',
  preferences: {
    defaultAlpha: 0.05,
    citationFormat: 'APA 7th',
    effectSizePreference: 'cohen_d',
    decimalPrecision: 2,
    autoCheckAssumptions: true,
    highlightSignificant: true,
    exportFormat: 'markdown',
  },
  stats: {
    datasetsCount: 12,
    analysesRunCount: 145,
    apaReportsExported: 58,
    savedQuestionsCount: 24,
    memberSince: 'January 2023',
    lastActive: 'Just now',
  },
  recentActivities: [
    {
      id: 'act-adm-1',
      type: 'feedback',
      title: 'Administrator Governance Session',
      detail: 'Admin CMS initiated; member permissions and support queue active',
      timestamp: 'Just now',
    },
    {
      id: 'act-adm-2',
      type: 'analysis',
      title: 'Two-Way ANOVA Model Verification',
      detail: 'Validated main and interaction effects against benchmark dataset',
      timestamp: 'Today, 09:20 AM',
    },
    {
      id: 'act-adm-3',
      type: 'report',
      title: 'APA 7th Synthesis Audit',
      detail: 'Verified manuscript narrative adherence to APA 7th section 6.43',
      timestamp: 'Yesterday',
    },
  ],
};

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr-scholar-01',
  name: 'Dr. Alex Morgan',
  email: 'example@gmail.com',
  systemRole: 'researcher',
  membershipTier: 'Single User',
  membershipStatus: 'Active',
  membershipDetails: SINGLE_USER_ANNUAL_MEMBERSHIP,
  title: 'Senior Quantitative Researcher & Assistant Professor',
  institution: 'University of Science & Technology',
  department: 'Faculty of Social & Behavioral Sciences',
  discipline: 'Quantitative Psychology & Applied Statistics',
  bio: 'Specializing in experimental design, multivariate modeling, and empirical behavioral assessment with APA 7th edition compliance.',
  avatarInitials: 'AM',
  avatarColor: 'from-blue-600 to-indigo-700',
  isVerifiedAcademic: true,
  orcidId: '0000-0002-1825-0097',
  preferences: {
    defaultAlpha: 0.05,
    citationFormat: 'APA 7th',
    effectSizePreference: 'cohen_d',
    decimalPrecision: 2,
    autoCheckAssumptions: true,
    highlightSignificant: true,
    exportFormat: 'markdown',
  },
  stats: {
    datasetsCount: 4,
    analysesRunCount: 18,
    apaReportsExported: 7,
    savedQuestionsCount: 5,
    memberSince: 'January 2024',
    lastActive: 'Just now',
  },
  recentActivities: [
    {
      id: 'act-1',
      type: 'analysis',
      title: 'Independent Samples t-Test',
      detail: 'Examined Exam_Score differences between In-Person and Hybrid instruction groups',
      timestamp: 'Today, 10:14 AM',
    },
    {
      id: 'act-2',
      type: 'report',
      title: 'APA 7th Manuscript Synthesis Exported',
      detail: 'Generated full statistical narrative with descriptive tables and confidence intervals',
      timestamp: 'Yesterday, 4:32 PM',
    },
    {
      id: 'act-3',
      type: 'analysis',
      title: 'Pearson Product-Moment Correlation',
      detail: 'Correlated Study_Hours with Exam_Score (r = .72, p < .001)',
      timestamp: '2 days ago',
    },
    {
      id: 'act-4',
      type: 'dataset',
      title: 'Student Academic Performance Dataset',
      detail: 'Imported n=100 observations with 7 quantitative and categorical variables',
      timestamp: '3 days ago',
    },
  ],
};

export const SCHOLAR_GUEST_PROFILE: UserProfile = {
  id: 'usr-guest-schol-02',
  name: 'Scholar Researcher',
  email: 'guest.scholar@academic.edu',
  systemRole: 'researcher',
  membershipTier: 'Single User',
  membershipStatus: 'Active',
  membershipDetails: SINGLE_USER_ANNUAL_MEMBERSHIP,
  title: 'Visiting Postdoctoral Fellow',
  institution: 'Institute for Empirical Research',
  department: 'Data Analytics & Methodology',
  discipline: 'Biostatistics & Health Sciences',
  bio: 'Investigating clinical endpoints, hypothesis validation, and reproducible statistical procedures.',
  avatarInitials: 'SR',
  avatarColor: 'from-emerald-600 to-teal-700',
  isVerifiedAcademic: true,
  orcidId: '0000-0003-4412-8901',
  preferences: {
    defaultAlpha: 0.05,
    citationFormat: 'APA 7th',
    effectSizePreference: 'eta_squared',
    decimalPrecision: 3,
    autoCheckAssumptions: true,
    highlightSignificant: true,
    exportFormat: 'markdown',
  },
  stats: {
    datasetsCount: 2,
    analysesRunCount: 9,
    apaReportsExported: 3,
    savedQuestionsCount: 2,
    memberSince: 'March 2024',
    lastActive: '10 mins ago',
  },
  recentActivities: [
    {
      id: 'act-g1',
      type: 'analysis',
      title: 'One-Way ANOVA',
      detail: 'Evaluated group variance across 3 academic instruction conditions',
      timestamp: '1 hour ago',
    },
  ],
};

const STORAGE_KEY_USER = 'statassist_user_profile';
const STORAGE_KEY_AUTH = 'statassist_is_logged_in';

export const loadStoredUserProfile = (): { user: UserProfile | null; isLoggedIn: boolean } => {
  try {
    const isLoggedInStr = localStorage.getItem(STORAGE_KEY_AUTH);
    const storedUserStr = localStorage.getItem(STORAGE_KEY_USER);

    if (isLoggedInStr === 'false') {
      return { user: null, isLoggedIn: false };
    }

    if (storedUserStr) {
      const parsed = JSON.parse(storedUserStr) as UserProfile;
      if (parsed.name === 'Mohd Zul' || (parsed.email === 'mohdzul@gmail.com' && parsed.name !== 'Mohd Zulhisam')) {
        parsed.name = 'Mohd Zulhisam';
        saveStoredUserProfile(parsed, true);
      }
      // Ensure Single User Membership Plan with 1-year access & default RM currency is applied
      if (!parsed.membershipDetails || parsed.membershipDetails.tier !== 'Single User' || parsed.membershipDetails.currency !== 'RM') {
        parsed.membershipTier = 'Single User';
        parsed.membershipStatus = 'Active';
        parsed.membershipDetails = SINGLE_USER_ANNUAL_MEMBERSHIP;
        saveStoredUserProfile(parsed, true);
      }
      return { user: parsed, isLoggedIn: true };
    }
  } catch (e) {
    console.error('Failed to load user profile from storage', e);
  }
  // Default to authenticated MOHDZUL_ADMIN_PROFILE so user goes straight into workspace without login popup
  return { user: MOHDZUL_ADMIN_PROFILE, isLoggedIn: true };
};

export const saveStoredUserProfile = (user: UserProfile | null, isLoggedIn: boolean): void => {
  try {
    if (isLoggedIn && user) {
      localStorage.setItem(STORAGE_KEY_AUTH, 'true');
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH);
      // Keep profile in storage for easy re-login if desired, or remove
    }
  } catch (e) {
    console.error('Failed to save user profile to storage', e);
  }
};
