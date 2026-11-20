/**
 * Phase 0 Security Rules Verification Spec ("Dirty Dozen" Payloads)
 * Evaluates structural and authorization invariants mirrored in firestore.rules.
 */

export interface AuthContext {
  uid: string;
  email: string;
  emailVerified: boolean;
}

export interface EmailTriggerPayload {
  id: string;
  collectionPath: string;
  data: Record<string, any>;
}

const VALID_COLLECTIONS = new Set(['mail', 'contact_emails', 'email_queue']);
const VALID_DELIVERY_STATES = new Set(['PENDING', 'PROCESSING', 'SUCCESS', 'ERROR']);
const VALID_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

export function simulateRuleCreate(
  auth: AuthContext | null,
  payload: EmailTriggerPayload
): 'ALLOW' | 'PERMISSION_DENIED' {
  if (!auth || !auth.emailVerified) return 'PERMISSION_DENIED';
  if (!VALID_ID_REGEX.test(payload.id)) return 'PERMISSION_DENIED';
  if (!VALID_COLLECTIONS.has(payload.collectionPath)) return 'PERMISSION_DENIED';

  const d = payload.data;
  const requiredKeys = [
    'to',
    'collectionName',
    'ticketId',
    'category',
    'message',
    'delivery',
    'senderUid',
    'senderName',
    'senderEmail',
    'createdAt',
    'updatedAt',
  ];
  const allowedKeys = new Set([...requiredKeys, 'replyTo', 'attachmentNames']);

  for (const req of requiredKeys) {
    if (!(req in d)) return 'PERMISSION_DENIED';
  }
  for (const key of Object.keys(d)) {
    if (!allowedKeys.has(key)) return 'PERMISSION_DENIED';
  }

  if (d.senderUid !== auth.uid) return 'PERMISSION_DENIED';
  if (d.collectionName !== payload.collectionPath) return 'PERMISSION_DENIED';
  if (!Array.isArray(d.to) || d.to.length < 1 || d.to.length > 5) return 'PERMISSION_DENIED';
  if (typeof d.to[0] !== 'string' || d.to[0].length < 3 || d.to[0].length > 160) {
    return 'PERMISSION_DENIED';
  }
  if (!d.message || typeof d.message !== 'object') return 'PERMISSION_DENIED';
  const msgKeys = Object.keys(d.message);
  if (!msgKeys.every((k) => k === 'subject' || k === 'text' || k === 'html')) {
    return 'PERMISSION_DENIED';
  }
  if (typeof d.message.subject !== 'string' || d.message.subject.length < 1 || d.message.subject.length > 200) {
    return 'PERMISSION_DENIED';
  }
  if (typeof d.message.text !== 'string' || d.message.text.length < 1 || d.message.text.length > 10000) {
    return 'PERMISSION_DENIED';
  }
  if (d.delivery?.state !== 'PENDING' || d.delivery?.attempts !== 0) return 'PERMISSION_DENIED';
  if (d.createdAt !== 'SERVER_TIME' || d.updatedAt !== 'SERVER_TIME') return 'PERMISSION_DENIED';
  if (Array.isArray(d.attachmentNames) && d.attachmentNames.length > 4) return 'PERMISSION_DENIED';
  if (!VALID_DELIVERY_STATES.has(d.delivery.state)) return 'PERMISSION_DENIED';

  return 'ALLOW';
}

export const DIRTY_DOZEN_CASES = [
  { name: '1. Identity Spoofing', expected: 'PERMISSION_DENIED' },
  { name: '2. Unverified Email Bypass', expected: 'PERMISSION_DENIED' },
  { name: '3. Admin Email Spoof Without Verification', expected: 'PERMISSION_DENIED' },
  { name: '4. Shadow Field Injection', expected: 'PERMISSION_DENIED' },
  { name: '5. Oversized Message Body Poisoning', expected: 'PERMISSION_DENIED' },
  { name: '6. Unbounded Recipients Array', expected: 'PERMISSION_DENIED' },
  { name: '7. Malformed Document ID Poisoning', expected: 'PERMISSION_DENIED' },
  { name: '8. Initial Delivery State Bypass (SUCCESS)', expected: 'PERMISSION_DENIED' },
  { name: '9. Terminal State Reversal After SUCCESS', expected: 'PERMISSION_DENIED' },
  { name: '10. Cross-User PII Get Read', expected: 'PERMISSION_DENIED' },
  { name: '11. Unfiltered List Scraping', expected: 'PERMISSION_DENIED' },
  { name: '12. Forged Client Timestamp / Immutable Mutation', expected: 'PERMISSION_DENIED' },
];
