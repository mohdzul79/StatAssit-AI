import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  updateDoc,
  query,
  where,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from './firebase';

export const ALLOWED_EMAIL_COLLECTIONS = [
  { id: 'mail', label: 'mail (Trigger Email Default)' },
  { id: 'contact_emails', label: 'contact_emails (Support Queue)' },
  { id: 'email_queue', label: 'email_queue (Outbound Mail Queue)' },
] as const;

export type EmailCollectionName = (typeof ALLOWED_EMAIL_COLLECTIONS)[number]['id'];
export type EmailDeliveryState = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

export interface EmailMessageContent {
  subject: string;
  text: string;
  html?: string;
}

export interface EmailDeliveryStatus {
  state: EmailDeliveryState;
  attempts: number;
  info?: string;
  error?: string;
  gmailMessageId?: string;
  gmailThreadId?: string;
  startTime?: Timestamp | Date | null;
  endTime?: Timestamp | Date | null;
}

export interface FirestoreEmailDocument {
  id: string;
  to: string[];
  replyTo?: string;
  collectionName: EmailCollectionName;
  ticketId: string;
  category: string;
  message: EmailMessageContent;
  delivery: EmailDeliveryStatus;
  senderUid: string;
  senderName: string;
  senderEmail: string;
  attachmentNames?: string[];
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

export interface DispatchFromFirestoreResult {
  documentId: string;
  collectionName: EmailCollectionName;
  ticketId: string;
  deliveryState: EmailDeliveryState;
  emailDispatched: boolean;
  emailError?: string;
  gmailMessageId?: string;
  gmailThreadId?: string;
  gmailStatusCode?: number;
}

const ADMIN_EMAIL = 'mohdzul@gmail.com';
const inFlightDocs = new Set<string>();

function clampStr(value: string, maxLen: number): string {
  const trimmed = value.trim();
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen) : trimmed;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generateDocId(): string {
  const rand = Math.random().toString(36).replace(/[^a-z0-9]/g, '').slice(0, 8) || 'doc';
  return `mail_${Date.now()}_${rand}`.slice(0, 64);
}

export function isAllowedEmailCollection(name: string): name is EmailCollectionName {
  return ALLOWED_EMAIL_COLLECTIONS.some((c) => c.id === name);
}

/**
 * Step 1: Write a structured email trigger document to the specified Cloud Firestore collection.
 * Enforces firebase-blueprint.json schema & volumetric boundaries before persistence.
 */
export async function writeEmailTriggerDocument(
  collectionName: EmailCollectionName,
  params: {
    to: string[];
    replyTo?: string;
    ticketId: string;
    category: string;
    subject: string;
    text: string;
    senderName: string;
    senderEmail: string;
    attachmentNames?: string[];
  }
): Promise<{ documentId: string; ticketId: string; collectionName: EmailCollectionName }> {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.emailVerified) {
    throw new Error('Verified Google sign-in is required before writing to Cloud Firestore.');
  }

  if (!isAllowedEmailCollection(collectionName)) {
    throw new Error(`Collection "${collectionName}" is not an allowed Firestore email collection.`);
  }

  const sanitizedRecipients = params.to
    .map((r) => clampStr(r, 160))
    .filter((r) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r))
    .slice(0, 5);

  if (sanitizedRecipients.length === 0) {
    throw new Error('At least one valid destination email address is required.');
  }

  const cleanTicketId = clampStr(params.ticketId.replace(/[^a-zA-Z0-9_-]/g, ''), 64) || `STA-${Date.now()}`;
  const cleanSubject = clampStr(params.subject, 200);
  const cleanBody = clampStr(params.text, 10000);
  const cleanSenderName = clampStr(params.senderName || currentUser.displayName || 'Researcher', 120);
  const cleanSenderEmail = clampStr(params.senderEmail || currentUser.email || '', 160);
  const cleanReplyTo = clampStr(params.replyTo || cleanSenderEmail, 160);
  const cleanCategory = clampStr(params.category || 'general', 32);

  if (!cleanSubject || !cleanBody || !cleanSenderEmail) {
    throw new Error('Subject, message text, and sender email are required to compose an email document.');
  }

  const cleanAttachments = (params.attachmentNames || [])
    .map((name) => clampStr(name, 160))
    .filter(Boolean)
    .slice(0, 4);

  const composedHtml = clampStr(
    `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#1e293b;">
      <p><strong>Reference:</strong> ${escapeHtml(cleanTicketId)} &middot; <strong>Collection:</strong> <code>${escapeHtml(collectionName)}</code></p>
      <p><strong>From:</strong> ${escapeHtml(cleanSenderName)} (${escapeHtml(cleanSenderEmail)})</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0;" />
      <p style="white-space:pre-wrap;">${escapeHtml(cleanBody)}</p>
    </div>`,
    20000
  );

  const documentId = generateDocId();
  const docPath = `${collectionName}/${documentId}`;
  const docRef = doc(db, collectionName, documentId);

  const payload = {
    to: sanitizedRecipients,
    replyTo: cleanReplyTo,
    collectionName,
    ticketId: cleanTicketId,
    category: cleanCategory,
    message: {
      subject: cleanSubject,
      text: cleanBody,
      html: composedHtml,
    },
    delivery: {
      state: 'PENDING' as const,
      attempts: 0,
    },
    senderUid: clampStr(currentUser.uid, 128),
    senderName: cleanSenderName,
    senderEmail: cleanSenderEmail,
    ...(cleanAttachments.length > 0 ? { attachmentNames: cleanAttachments } : {}),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(docRef, payload);
    return { documentId, ticketId: cleanTicketId, collectionName };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

/**
 * Step 2: Read the written Cloud Firestore document contents, compose the outbound email strictly
 * from those persisted Firestore fields, send it via /api/firestore-email/send (Gmail API when OAuth
 * token is available), and update the Firestore document's delivery state.
 */
export async function composeAndSendFromFirestoreDocument(
  collectionName: EmailCollectionName,
  documentId: string,
  accessToken: string | null
): Promise<DispatchFromFirestoreResult> {
  const lockKey = `${collectionName}/${documentId}`;
  if (inFlightDocs.has(lockKey)) {
    throw new Error('This Firestore email document is already being dispatched.');
  }
  inFlightDocs.add(lockKey);

  const docRef = doc(db, collectionName, documentId);

  try {
    let snapshot;
    try {
      snapshot = await getDocFromServer(docRef);
    } catch {
      try {
        snapshot = await getDoc(docRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, lockKey);
      }
    }

    if (!snapshot.exists()) {
      throw new Error(`Firestore document ${lockKey} does not exist.`);
    }

    const data = snapshot.data() as Omit<FirestoreEmailDocument, 'id'>;
    const prevAttempts = typeof data.delivery?.attempts === 'number' ? data.delivery.attempts : 0;

    if (data.delivery?.state === 'SUCCESS') {
      return {
        documentId,
        collectionName,
        ticketId: data.ticketId,
        deliveryState: 'SUCCESS',
        emailDispatched: Boolean(data.delivery.gmailMessageId),
        gmailMessageId: data.delivery.gmailMessageId,
        gmailThreadId: data.delivery.gmailThreadId,
      };
    }

    try {
      await updateDoc(docRef, {
        delivery: {
          state: 'PROCESSING',
          attempts: prevAttempts + 1,
          startTime: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, lockKey);
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    let responseOk = false;
    let payload: any = {};
    let transportError: string | undefined;

    try {
      const response = await fetch('/api/firestore-email/send', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          collectionName,
          documentId,
          ticketId: data.ticketId,
          to: data.to,
          replyTo: data.replyTo || data.senderEmail,
          subject: data.message.subject,
          text: data.message.text,
          html: data.message.html,
          senderName: data.senderName,
          senderEmail: data.senderEmail,
          category: data.category,
          attachmentNames: data.attachmentNames || [],
        }),
      });
      payload = await response.json().catch(() => ({}));
      responseOk = response.ok;
      if (!response.ok) {
        transportError = payload?.error || `Email dispatch endpoint returned HTTP ${response.status}.`;
      }
    } catch (netErr: any) {
      transportError = netErr?.message || 'Network failure while dispatching Firestore email.';
    }

    if (responseOk && payload?.success) {
      const dispatched = Boolean(payload.emailDispatched);
      const infoMessage = clampStr(
        dispatched
          ? `Composed from ${lockKey} & delivered via Gmail API (${payload.gmailMessageId || 'sent'})`
          : `Composed from ${lockKey} & delivered via Hosted Mail Queue (${data.ticketId})`,
        1000
      );

      const nextDelivery: Record<string, unknown> = {
        state: 'SUCCESS',
        attempts: prevAttempts + 1,
        info: infoMessage,
        endTime: serverTimestamp(),
      };
      if (typeof payload.gmailMessageId === 'string' && payload.gmailMessageId) {
        nextDelivery.gmailMessageId = clampStr(payload.gmailMessageId, 128);
      }
      if (typeof payload.gmailThreadId === 'string' && payload.gmailThreadId) {
        nextDelivery.gmailThreadId = clampStr(payload.gmailThreadId, 128);
      }
      if (typeof payload.emailError === 'string' && payload.emailError) {
        nextDelivery.error = clampStr(payload.emailError, 1000);
      }

      try {
        await updateDoc(docRef, {
          delivery: nextDelivery,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, lockKey);
      }

      return {
        documentId,
        collectionName,
        ticketId: data.ticketId,
        deliveryState: 'SUCCESS',
        emailDispatched: dispatched,
        emailError: payload.emailError,
        gmailMessageId: payload.gmailMessageId,
        gmailThreadId: payload.gmailThreadId,
        gmailStatusCode: payload.gmailStatusCode,
      };
    } else {
      const cleanErr = clampStr(transportError || 'Email dispatch failed.', 1000);
      try {
        await updateDoc(docRef, {
          delivery: {
            state: 'ERROR',
            attempts: prevAttempts + 1,
            error: cleanErr,
            endTime: serverTimestamp(),
          },
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, lockKey);
      }

      return {
        documentId,
        collectionName,
        ticketId: data.ticketId,
        deliveryState: 'ERROR',
        emailDispatched: false,
        emailError: cleanErr,
      };
    }
  } finally {
    inFlightDocs.delete(lockKey);
  }
}

/**
 * Real-time Cloud Firestore listener watching email documents inside the selected collection.
 * Automatically enforces Pillar 8 owner filter (or admin scope) matching firestore.rules.
 */
export function subscribeToCollectionEmails(
  collectionName: EmailCollectionName,
  onDocuments: (docs: FirestoreEmailDocument[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    onDocuments([]);
    return () => {};
  }

  const colRef = collection(db, collectionName);
  const isBootstrappedAdmin =
    currentUser.emailVerified &&
    (currentUser.email || '').toLowerCase().trim() === ADMIN_EMAIL;

  const q = isBootstrappedAdmin
    ? query(colRef, limit(25))
    : query(colRef, where('senderUid', '==', currentUser.uid), limit(25));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: FirestoreEmailDocument[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<FirestoreEmailDocument, 'id'>),
      }));
      items.sort((a, b) => {
        const aTime =
          a.createdAt instanceof Timestamp
            ? a.createdAt.toMillis()
            : a.createdAt instanceof Date
            ? a.createdAt.getTime()
            : 0;
        const bTime =
          b.createdAt instanceof Timestamp
            ? b.createdAt.toMillis()
            : b.createdAt instanceof Date
            ? b.createdAt.getTime()
            : 0;
        return bTime - aTime;
      });
      onDocuments(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, collectionName);
      } catch (wrappedErr: any) {
        if (onError) onError(wrappedErr);
      }
    }
  );
}
