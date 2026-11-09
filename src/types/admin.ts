import { MembershipTier, MembershipStatus, UserSystemRole } from './user';

export interface AdminMember {
  id: string;
  name: string;
  email: string;
  role: UserSystemRole;
  tier: MembershipTier;
  status: MembershipStatus;
  institution: string;
  department?: string;
  validUntil: string;
  joinedDate: string;
  lastActive: string;
  datasetsCount: number;
  datasetsLimit: number | 'Unlimited';
  analysesCount: number;
  analysesLimit: number | 'Unlimited';
  aiTokensUsed: number;
  aiTokensLimit: number | 'Unlimited';
  avatarInitials: string;
  avatarColor: string;
  notes?: string;
}

export interface AdminTierPlan {
  id: MembershipTier;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  currency?: string; // Default: 'RM'
  description: string;
  badgeClass: string;
  datasetLimit: number | 'Unlimited';
  analysisLimit: number | 'Unlimited';
  aiTokensLimit: number | 'Unlimited';
  features: string[];
  activeMembersCount: number;
}

export type TicketStatus = 'new' | 'in_progress' | 'resolved' | 'closed';

export interface AdminTicket {
  ticketId: string;
  category: 'bug' | 'calculation' | 'feature' | 'general';
  subject: string;
  description: string;
  userName: string;
  userEmail: string;
  status: TicketStatus;
  assignedAdmin: string;
  adminNotes?: string;
  submittedAt: string;
  updatedAt?: string;
  attachments?: { name: string; size: number; type: string }[];
}

export interface AdminAuditLog {
  id: string;
  action: string;
  actor: string;
  target: string;
  detail: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'success';
}
