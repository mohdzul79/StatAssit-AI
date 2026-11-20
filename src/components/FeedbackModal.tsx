import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Send,
  Paperclip,
  UploadCloud,
  CheckCircle2,
  Bug,
  Lightbulb,
  AlertCircle,
  MessageSquare,
  Copy,
  Check,
  Trash2,
  History,
  ShieldCheck,
  ExternalLink,
  MailCheck,
  LogOut,
  RefreshCw,
  Database,
} from 'lucide-react';
import { StatisticalTestType } from '../types/stats';
import { AdminTicket, TicketStatus } from '../types/admin';
import {
  getStoredAdminTickets,
  saveStoredAdminTickets,
  addAdminAuditLog,
} from '../data/initialAdminData';
import {
  initGoogleAuth,
  signInWithGoogleOAuth,
  getGoogleAccessToken,
  getCurrentGoogleUser,
  googleSignOut,
  WorkspaceUser,
} from '../services/googleAuth';
import {
  ALLOWED_EMAIL_COLLECTIONS,
  EmailCollectionName,
  FirestoreEmailDocument,
  writeEmailTriggerDocument,
  composeAndSendFromFirestoreDocument,
  subscribeToCollectionEmails,
} from '../services/firestoreEmailService';

export type FeedbackCategory = 'bug' | 'calculation' | 'feature' | 'general';

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
}

export interface ContactReplyItem {
  id: string;
  senderName: string;
  senderEmail: string;
  message: string;
  isAdmin: boolean;
  emailDispatched: boolean;
  gmailMessageId?: string;
  createdAt: string;
}

export interface LiveContactTicket {
  ticketId: string;
  category: FeedbackCategory | string;
  subject: string;
  details: string;
  senderName: string;
  senderEmail: string;
  receiver: string;
  status: TicketStatus;
  emailDispatched: boolean;
  emailError?: string;
  gmailMessageId?: string;
  gmailThreadId?: string;
  authenticatedByGoogle?: boolean;
  attachments: { name: string; size: number; type: string }[];
  replies: ContactReplyItem[];
  submittedAt: string;
  updatedAt?: string;
}

export interface SubmittedTicket {
  ticketId: string;
  category: FeedbackCategory;
  subject: string;
  description: string;
  userName: string;
  userEmail: string;
  attachments: { name: string; size: number; type: string }[];
  submittedAt: string;
  emailDispatched?: boolean;
  gmailMessageId?: string;
  firestoreCollection?: EmailCollectionName;
  firestoreDocId?: string;
  recipientEmail?: string;
}

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  defaultName?: string;
  currentUserEmail?: string;
  defaultOrganization?: string;
  currentTest?: StatisticalTestType;
  datasetStats?: {
    hasData: boolean;
    rowCount: number;
    colCount: number;
  };
  adminEmail?: string;
  initialCategory?: FeedbackCategory;
  onOpenAdminCms?: () => void;
}

const DIRECT_RECEIVER_EMAIL = 'mohdzul@gmail.com';

const CATEGORY_TABS: {
  id: FeedbackCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'bug', label: 'Bug / Error', icon: Bug },
  { id: 'calculation', label: 'Calculation Issue', icon: AlertCircle },
  { id: 'feature', label: 'Suggestion', icon: Lightbulb },
  { id: 'general', label: 'General Inquiry', icon: MessageSquare },
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
  defaultName = '',
  currentUserEmail = '',
  adminEmail = DIRECT_RECEIVER_EMAIL,
  initialCategory = 'general',
  onOpenAdminCms,
}) => {
  // Google Authentication State (real Firebase Auth + Gmail OAuth token)
  const [googleUser, setGoogleUser] = useState<WorkspaceUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const normalizedAdmin = adminEmail.toLowerCase().trim();
  const isAdmin =
    (googleUser?.email || '').toLowerCase().trim() === normalizedAdmin ||
    currentUserEmail.toLowerCase().trim() === normalizedAdmin ||
    defaultEmail.toLowerCase().trim() === normalizedAdmin;

  const [activeView, setActiveView] = useState<'form' | 'history' | 'admin'>('form');

  // Form State
  const [category, setCategory] = useState<FeedbackCategory>(initialCategory);
  const [selectedCollection, setSelectedCollection] = useState<EmailCollectionName>('mail');
  const [recipientEmail, setRecipientEmail] = useState(DIRECT_RECEIVER_EMAIL);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [userEmail, setUserEmail] = useState(defaultEmail);
  const [userName, setUserName] = useState(defaultName);

  // Firestore Collection Listener State
  const [firestoreDocs, setFirestoreDocs] = useState<FirestoreEmailDocument[]>([]);
  const [firestoreListenerError, setFirestoreListenerError] = useState<string | null>(null);
  const [dispatchingDocId, setDispatchingDocId] = useState<string | null>(null);

  // Attachments
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<SubmittedTicket | null>(null);
  const [copiedTicketId, setCopiedTicketId] = useState(false);
  const [showConfirmSendDialog, setShowConfirmSendDialog] = useState(false);
  const [isSendingGmailCopy, setIsSendingGmailCopy] = useState(false);
  const [deliveryPopup, setDeliveryPopup] = useState<{
    status: 'delivered' | 'queued' | 'not_delivered';
    title: string;
    message: string;
    ticketId?: string;
    gmailMessageId?: string;
    firestorePath?: string;
  } | null>(null);

  // Real-time Server Inbox & Local History
  const [liveInbox, setLiveInbox] = useState<LiveContactTicket[]>([]);
  const [isLoadingInbox, setIsLoadingInbox] = useState(false);
  const [pastTickets, setPastTickets] = useState<SubmittedTicket[]>([]);
  const [selectedAdminTicketId, setSelectedAdminTicketId] = useState<string | null>(null);
  const [adminReplyInput, setAdminReplyInput] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyConfirmPending, setReplyConfirmPending] = useState(false);
  const [replyFeedbackMsg, setReplyFeedbackMsg] = useState<string | null>(null);

  // Sync Google Auth when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const existingUser = getCurrentGoogleUser();
    if (existingUser) {
      setGoogleUser(existingUser);
    }
    getGoogleAccessToken().then((token) => {
      if (token) setAccessToken(token);
    });

    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
        setAuthError(null);
      },
      () => {
        setAccessToken(null);
      },
      (user) => {
        setGoogleUser(user);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  // Populate sender fields cleanly when Google user signs in
  useEffect(() => {
    if (googleUser?.email && !userEmail) {
      setUserEmail(googleUser.email);
    }
    if (googleUser?.displayName && !userName) {
      setUserName(googleUser.displayName);
    }
  }, [googleUser, userEmail, userName]);

  // Subscribe to selected Cloud Firestore collection for real-time trigger-email monitoring
  useEffect(() => {
    if (!isOpen || !googleUser?.uid) {
      setFirestoreDocs([]);
      return;
    }

    setFirestoreListenerError(null);
    const unsubscribe = subscribeToCollectionEmails(
      selectedCollection,
      (docs) => {
        setFirestoreDocs(docs);
      },
      (err) => {
        setFirestoreListenerError(err.message);
      }
    );

    return () => unsubscribe();
  }, [isOpen, googleUser?.uid, selectedCollection]);

  // Subscribe to real-time Contact SSE stream and fetch initial inbox when open
  useEffect(() => {
    if (!isOpen) return;

    setCategory(initialCategory);
    setFormError(null);
    setAuthError(null);
    setSubmittedTicket(null);
    setShowConfirmSendDialog(false);
    setDeliveryPopup(null);
    setReplyFeedbackMsg(null);

    try {
      const stored = localStorage.getItem('statassist_feedback_tickets');
      if (stored) {
        setPastTickets(JSON.parse(stored));
      }
    } catch {
      // Ignore storage error
    }

    let cancelled = false;
    setIsLoadingInbox(true);
    fetch('/api/contact/inbox')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && Array.isArray(data.messages)) {
          setLiveInbox(data.messages);
        }
      })
      .catch(() => {
        // Non-fatal
      })
      .finally(() => {
        if (!cancelled) setIsLoadingInbox(false);
      });

    const eventSource = new EventSource('/api/contact/stream');
    eventSource.addEventListener('init', (ev: MessageEvent) => {
      try {
        const parsed = JSON.parse(ev.data);
        if (!cancelled && Array.isArray(parsed.messages)) {
          setLiveInbox(parsed.messages);
        }
      } catch {
        // Ignore parse error
      }
    });

    eventSource.addEventListener('contact_created', (ev: MessageEvent) => {
      try {
        const created = JSON.parse(ev.data) as LiveContactTicket;
        if (!cancelled && created?.ticketId) {
          setLiveInbox((prev) => [
            created,
            ...prev.filter((item) => item.ticketId !== created.ticketId),
          ]);
        }
      } catch {
        // Ignore parse error
      }
    });

    eventSource.addEventListener('contact_updated', (ev: MessageEvent) => {
      try {
        const updated = JSON.parse(ev.data) as LiveContactTicket;
        if (!cancelled && updated?.ticketId) {
          setLiveInbox((prev) =>
            prev.map((item) => (item.ticketId === updated.ticketId ? updated : item))
          );
        }
      } catch {
        // Ignore parse error
      }
    });

    return () => {
      cancelled = true;
      eventSource.close();
    };
  }, [isOpen, initialCategory]);

  // Match real-time tickets belonging to the current sender or tracked ticket IDs
  const myLiveTickets = useMemo(() => {
    const trackedIds = new Set(pastTickets.map((t) => t.ticketId));
    const activeEmails = new Set(
      [userEmail, googleUser?.email, defaultEmail]
        .filter((e): e is string => Boolean(e && e.trim()))
        .map((e) => e.trim().toLowerCase())
    );

    const matchedLive = liveInbox.filter(
      (item) =>
        trackedIds.has(item.ticketId) ||
        activeEmails.has(item.senderEmail.toLowerCase().trim())
    );

    // Include any local-only historical items not yet in server store
    const liveIds = new Set(matchedLive.map((m) => m.ticketId));
    const localOnly: LiveContactTicket[] = pastTickets
      .filter((p) => !liveIds.has(p.ticketId))
      .map((p) => ({
        ticketId: p.ticketId,
        category: p.category,
        subject: p.subject,
        details: p.description,
        senderName: p.userName,
        senderEmail: p.userEmail,
        receiver: DIRECT_RECEIVER_EMAIL,
        status: 'new',
        emailDispatched: Boolean(p.emailDispatched),
        gmailMessageId: p.gmailMessageId,
        attachments: p.attachments || [],
        replies: [],
        submittedAt: p.submittedAt,
      }));

    return [...matchedLive, ...localOnly];
  }, [liveInbox, pastTickets, userEmail, googleUser?.email, defaultEmail]);

  const totalRepliesCount = useMemo(
    () => myLiveTickets.reduce((sum, t) => sum + (t.replies?.length || 0), 0),
    [myLiveTickets]
  );

  const selectedAdminTicket = useMemo(
    () => liveInbox.find((t) => t.ticketId === selectedAdminTicketId) || null,
    [liveInbox, selectedAdminTicketId]
  );

  if (!isOpen) return null;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    const maxFiles = 4;
    const maxSizeBytes = 10 * 1024 * 1024;

    if (attachments.length + files.length > maxFiles) {
      setUploadError(`Maximum ${maxFiles} files can be attached.`);
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > maxSizeBytes) {
        setUploadError(`File "${file.name}" exceeds 10MB limit.`);
        return;
      }

      const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachments((prev) => [
            ...prev,
            {
              id: fileId,
              name: file.name,
              size: file.size,
              type: file.type,
              dataUrl: e.target?.result as string,
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachments((prev) => [
          ...prev,
          {
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
          },
        ]);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    setFormError(null);
    try {
      const res = await signInWithGoogleOAuth();
      if (res) {
        setGoogleUser(res.user);
        setAccessToken(res.accessToken);
        if (res.user.email) setUserEmail(res.user.email);
        if (res.user.displayName) setUserName(res.user.displayName);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Google Sign-In failed. Please allow popup access and Gmail permission.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await googleSignOut();
    setGoogleUser(null);
    setAccessToken(null);
  };

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim());
  const isValidRecipient = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail.trim());

  const executeFirestoreEmailPipeline = async (
    authToken: string | null,
    resolvedSenderEmail: string,
    resolvedSenderName: string
  ) => {
    const attachmentMeta = attachments.map((a) => ({ name: a.name, size: a.size, type: a.type }));
    const targetRecipient = recipientEmail.trim() || DIRECT_RECEIVER_EMAIL;
    const generatedTicketId = `STA-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1) Write document into the specified Cloud Firestore collection
    const writtenDoc = await writeEmailTriggerDocument(selectedCollection, {
      to: [targetRecipient],
      replyTo: resolvedSenderEmail,
      ticketId: generatedTicketId,
      category,
      subject: subject.trim(),
      text: description.trim(),
      senderName: resolvedSenderName,
      senderEmail: resolvedSenderEmail,
      attachmentNames: attachmentMeta.map((a) => a.name),
    });

    // 2) Read that Cloud Firestore document's contents, compose the email, send it, and update delivery state
    const dispatchResult = await composeAndSendFromFirestoreDocument(
      selectedCollection,
      writtenDoc.documentId,
      authToken
    );

    const firestorePath = `${selectedCollection}/${writtenDoc.documentId}`;
    const newTicket: SubmittedTicket = {
      ticketId: dispatchResult.ticketId,
      category,
      subject: subject.trim(),
      description: description.trim(),
      userName: resolvedSenderName,
      userEmail: resolvedSenderEmail,
      attachments: attachmentMeta,
      submittedAt: new Date().toLocaleString(),
      emailDispatched: dispatchResult.emailDispatched,
      gmailMessageId: dispatchResult.gmailMessageId,
      firestoreCollection: selectedCollection,
      firestoreDocId: writtenDoc.documentId,
      recipientEmail: targetRecipient,
    };

    const updatedHistory = [newTicket, ...pastTickets];
    setPastTickets(updatedHistory);
    try {
      localStorage.setItem('statassist_feedback_tickets', JSON.stringify(updatedHistory.slice(0, 20)));
    } catch {
      // Ignore storage error
    }

    try {
      const adminTicketObj: AdminTicket = {
        ticketId: dispatchResult.ticketId,
        category,
        subject: subject.trim(),
        description: description.trim(),
        userName: resolvedSenderName,
        userEmail: resolvedSenderEmail,
        status: 'new',
        assignedAdmin: targetRecipient,
        submittedAt: 'Just now',
        attachments: attachmentMeta,
      };
      saveStoredAdminTickets([adminTicketObj, ...getStoredAdminTickets()]);
      addAdminAuditLog(
        dispatchResult.emailDispatched
          ? 'Email Composed & Sent from Firestore Document'
          : 'Firestore Document Processed to Hosted Queue',
        dispatchResult.ticketId,
        `${firestorePath} -> ${targetRecipient}`,
        dispatchResult.deliveryState === 'ERROR' ? 'warning' : 'info'
      );
    } catch {
      // Ignore local audit storage error
    }

    if (dispatchResult.deliveryState === 'ERROR') {
      const errMsg = dispatchResult.emailError || 'Firestore document delivery failed.';
      setFormError(errMsg);
      setDeliveryPopup({
        status: 'not_delivered',
        title: 'Email Not Delivered',
        message: errMsg,
        ticketId: dispatchResult.ticketId,
        firestorePath,
      });
      return;
    }

    if (dispatchResult.gmailStatusCode === 401) {
      setAccessToken(null);
    }

    setSubmittedTicket(newTicket);
    setDeliveryPopup({
      status: 'delivered',
      title: 'Message Delivered!',
      message: dispatchResult.emailDispatched
        ? `Composed from Cloud Firestore (${firestorePath}) and sent via Gmail to ${targetRecipient}.`
        : `Written to Cloud Firestore (${firestorePath}) and delivered via Hosted website to ${targetRecipient}.`,
      ticketId: dispatchResult.ticketId,
      gmailMessageId: dispatchResult.gmailMessageId,
      firestorePath,
    });
  };

  const executeHostedFallbackSubmission = async (optionalToken?: string | null) => {
    const attachmentMeta = attachments.map((a) => ({ name: a.name, size: a.size, type: a.type }));
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (optionalToken) {
      headers.Authorization = `Bearer ${optionalToken}`;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          category,
          subject: subject.trim(),
          details: description.trim(),
          senderEmail: userEmail.trim(),
          senderName: userName.trim(),
          attachments: attachmentMeta,
          receiver: recipientEmail.trim() || DIRECT_RECEIVER_EMAIL,
          requireGmailDelivery: false,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errMsg =
          payload?.error || `Submission failed (HTTP ${response.status}). Please retry.`;
        setFormError(errMsg);
        setDeliveryPopup({
          status: 'not_delivered',
          title: 'Message Not Delivered',
          message: errMsg,
        });
        return;
      }

      const ticketId: string = payload.ticketId || `STA-${Math.floor(1000 + Math.random() * 9000)}`;
      const emailDispatched = Boolean(payload.emailDispatched);
      const newTicket: SubmittedTicket = {
        ticketId,
        category,
        subject: subject.trim(),
        description: description.trim(),
        userName: userName.trim(),
        userEmail: userEmail.trim(),
        attachments: attachmentMeta,
        submittedAt: new Date().toLocaleString(),
        emailDispatched,
        gmailMessageId: payload.gmailMessageId,
        recipientEmail: recipientEmail.trim() || DIRECT_RECEIVER_EMAIL,
      };

      const updatedHistory = [newTicket, ...pastTickets];
      setPastTickets(updatedHistory);
      try {
        localStorage.setItem('statassist_feedback_tickets', JSON.stringify(updatedHistory.slice(0, 20)));
      } catch {
        // Ignore storage error
      }

      if (payload.record) {
        setLiveInbox((prev) => [
          payload.record,
          ...prev.filter((item) => item.ticketId !== payload.record.ticketId),
        ]);
      }

      setSubmittedTicket(newTicket);
      setDeliveryPopup({
        status: 'delivered',
        title: 'Message Delivered!',
        message: emailDispatched
          ? `Delivered via Gmail and Hosted website to ${recipientEmail.trim() || DIRECT_RECEIVER_EMAIL}.`
          : `Delivered via Hosted website to ${recipientEmail.trim() || DIRECT_RECEIVER_EMAIL}.`,
        ticketId,
        gmailMessageId: payload.gmailMessageId,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const handleDispatchExistingFirestoreDoc = async (docItem: FirestoreEmailDocument) => {
    setDispatchingDocId(docItem.id);
    setFormError(null);
    try {
      let token = accessToken;
      if (!token) {
        const authRes = await signInWithGoogleOAuth();
        if (authRes) {
          setGoogleUser(authRes.user);
          setAccessToken(authRes.accessToken);
          token = authRes.accessToken;
        }
      }
      const res = await composeAndSendFromFirestoreDocument(selectedCollection, docItem.id, token);
      if (res.deliveryState === 'SUCCESS') {
        setDeliveryPopup({
          status: 'delivered',
          title: 'Email Sent from Firestore Document!',
          message: res.emailDispatched
            ? `Document ${selectedCollection}/${docItem.id} composed and dispatched via Gmail.`
            : `Document ${selectedCollection}/${docItem.id} processed and marked SUCCESS.`,
          ticketId: res.ticketId,
          gmailMessageId: res.gmailMessageId,
          firestorePath: `${selectedCollection}/${docItem.id}`,
        });
      } else {
        setFormError(res.emailError || 'Dispatch failed.');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Failed to dispatch Firestore document.');
    } finally {
      setDispatchingDocId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing: string[] = [];
    if (!isValidRecipient) missing.push('valid Recipient To email');
    if (!subject.trim()) missing.push('Subject');
    if (!description.trim()) missing.push('Details');
    if (!isValidEmail) missing.push('valid Email');
    if (!userName.trim()) missing.push('Name');

    if (missing.length > 0) {
      const errMsg = `Please complete required fields before submitting: ${missing.join(', ')}.`;
      setFormError(errMsg);
      setDeliveryPopup({
        status: 'not_delivered',
        title: 'Message Not Delivered',
        message: errMsg,
      });
      return;
    }

    setFormError(null);
    setDeliveryPopup(null);
    setIsSubmitting(true);

    try {
      let activeUser = googleUser || getCurrentGoogleUser();
      let activeToken = accessToken || (await getGoogleAccessToken());

      // Obtain verified Firebase Auth + fresh Gmail OAuth token when either is missing
      if (!activeUser || !activeToken) {
        try {
          const authRes = await signInWithGoogleOAuth();
          if (authRes) {
            activeUser = authRes.user;
            activeToken = authRes.accessToken;
            setGoogleUser(authRes.user);
            setAccessToken(authRes.accessToken);
            if (!userEmail.trim() && authRes.user.email) setUserEmail(authRes.user.email);
            if (!userName.trim() && authRes.user.displayName) setUserName(authRes.user.displayName);
          }
        } catch {
          // If Google popup is closed, blocked, or unavailable, continue cleanly with existing auth or hosted delivery
        }
      }

      if (activeUser) {
        try {
          await executeFirestoreEmailPipeline(
            activeToken,
            userEmail.trim() || activeUser.email || '',
            userName.trim() || activeUser.displayName || 'Researcher'
          );
          return;
        } catch {
          // Gracefully fall back to hosted + Gmail delivery if Firestore write fails transiently
          await executeHostedFallbackSubmission(activeToken);
          return;
        }
      }

      await executeHostedFallbackSubmission(activeToken);
    } catch (err: any) {
      const errMsg =
        err?.message || 'Unable to deliver message right now. Please retry.';
      setFormError(errMsg);
      setDeliveryPopup({
        status: 'not_delivered',
        title: 'Message Not Delivered',
        message: errMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAndSendViaGmail = async () => {
    setShowConfirmSendDialog(false);
    setIsSubmitting(true);
    try {
      await executeFirestoreEmailPipeline(
        accessToken,
        userEmail.trim() || googleUser?.email || '',
        userName.trim() || googleUser?.displayName || 'Researcher'
      );
    } catch (err: any) {
      setFormError(err?.message || 'Failed to dispatch Firestore email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignInAndSendSubmittedCopy = async () => {
    if (!submittedTicket) return;
    setIsSendingGmailCopy(true);
    setFormError(null);
    try {
      const authRes = await signInWithGoogleOAuth();
      if (!authRes?.accessToken) {
        const msg = 'Google sign-in did not return Gmail sending permission.';
        setFormError(msg);
        setDeliveryPopup({
          status: 'not_delivered',
          title: 'Email Not Delivered',
          message: msg,
          ticketId: submittedTicket.ticketId,
        });
        return;
      }
      setGoogleUser(authRes.user);
      setAccessToken(authRes.accessToken);

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authRes.accessToken}`,
        },
        body: JSON.stringify({
          category: submittedTicket.category,
          subject: submittedTicket.subject,
          details: submittedTicket.description,
          senderEmail: authRes.user.email || submittedTicket.userEmail,
          senderName: authRes.user.displayName || submittedTicket.userName,
          attachments: submittedTicket.attachments,
          requireGmailDelivery: true,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const msg = payload?.error || 'Failed to dispatch Gmail copy.';
        setFormError(msg);
        setDeliveryPopup({
          status: 'not_delivered',
          title: 'Email Not Delivered',
          message: msg,
          ticketId: submittedTicket.ticketId,
        });
        return;
      }
      const nextTicketId = payload.ticketId || submittedTicket.ticketId;
      setSubmittedTicket((prev) =>
        prev
          ? {
              ...prev,
              ticketId: nextTicketId,
              emailDispatched: true,
              gmailMessageId: payload.gmailMessageId,
            }
          : prev
      );
      setDeliveryPopup({
        status: 'delivered',
        title: 'Message Delivered!',
        message: `Your authenticated message was delivered directly via Gmail to ${DIRECT_RECEIVER_EMAIL}.`,
        ticketId: nextTicketId,
        gmailMessageId: payload.gmailMessageId,
      });
    } catch (err: any) {
      const msg = err?.message || 'Failed to authenticate and dispatch email via Gmail.';
      setFormError(msg);
      setDeliveryPopup({
        status: 'not_delivered',
        title: 'Email Not Delivered',
        message: msg,
        ticketId: submittedTicket.ticketId,
      });
    } finally {
      setIsSendingGmailCopy(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedTicket(null);
    setDeliveryPopup(null);
    setSubject('');
    setDescription('');
    if (!googleUser?.email) setUserEmail('');
    if (!googleUser?.displayName) setUserName('');
    setFormError(null);
    setAttachments([]);
    setUploadError(null);
  };

  const handleCopyTicketId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedTicketId(true);
    setTimeout(() => setCopiedTicketId(false), 2000);
  };

  const handleAdminUpdateStatus = async (ticketId: string, status: TicketStatus) => {
    try {
      const res = await fetch(`/api/contact/${encodeURIComponent(ticketId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const payload = await res.json();
        if (payload?.record) {
          setLiveInbox((prev) =>
            prev.map((t) => (t.ticketId === ticketId ? payload.record : t))
          );
        }
      }
    } catch {
      // Ignore transient status error
    }
  };

  const executeAdminReply = async (useGmailToken: boolean) => {
    if (!selectedAdminTicket || !adminReplyInput.trim()) return;
    setIsSendingReply(true);
    setReplyFeedbackMsg(null);
    setReplyConfirmPending(false);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (useGmailToken && accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    try {
      const res = await fetch(
        `/api/contact/${encodeURIComponent(selectedAdminTicket.ticketId)}/reply`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            replyText: adminReplyInput.trim(),
            responderName: googleUser?.displayName || 'Mohd Zulhisam',
            responderEmail: googleUser?.email || DIRECT_RECEIVER_EMAIL,
            status: 'resolved',
          }),
        }
      );
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setReplyFeedbackMsg(payload?.error || 'Failed to send response.');
        return;
      }
      if (payload?.record) {
        setLiveInbox((prev) =>
          prev.map((t) => (t.ticketId === payload.record.ticketId ? payload.record : t))
        );
      }
      setAdminReplyInput('');
      setReplyFeedbackMsg(
        payload.emailDispatched
          ? `Response sent in real time & emailed to ${selectedAdminTicket.senderEmail}!`
          : 'Response posted in real time to user support thread.'
      );
    } catch (err: any) {
      setReplyFeedbackMsg(err?.message || 'Failed to deliver response.');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleRefreshInbox = async () => {
    setIsLoadingInbox(true);
    try {
      const res = await fetch('/api/contact/inbox');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.messages)) {
          setLiveInbox(data.messages);
        }
      }
    } finally {
      setIsLoadingInbox(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ==================== ADMIN INBOX VIEW (REAL-TIME) ==================== */}
          {activeView === 'admin' ? (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2 text-xs text-amber-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
                  <div>
                    <span className="font-bold">Live Contact Inbox: {DIRECT_RECEIVER_EMAIL}</span>
                    <p className="text-2xs text-amber-800">
                      Real-time submissions stream automatically. Sign in with Google to email responses directly via Gmail.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleRefreshInbox}
                    className="p-1.5 rounded-lg bg-white border border-amber-200 hover:bg-amber-100 text-amber-800 cursor-pointer"
                    title="Refresh inbox"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInbox ? 'animate-spin' : ''}`} />
                  </button>
                  {onOpenAdminCms && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAdminCms();
                      }}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded text-2xs transition-colors cursor-pointer"
                    >
                      CMS
                    </button>
                  )}
                </div>
              </div>

              {/* Google Auth bar inside Admin Inbox if not yet Gmail authenticated */}
              {!accessToken ? (
                <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-700">
                    Connect Google to send real-time Gmail replies directly to senders:
                  </span>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isAuthenticating}
                    className="gsi-material-button"
                  >
                    <div className="gsi-material-button-content-wrapper">
                      <div className="gsi-material-button-icon">
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                          <path fill="none" d="M0 0h48v48H0z" />
                        </svg>
                      </div>
                      <span className="gsi-material-button-contents">
                        {isAuthenticating ? 'Connecting...' : 'Sign in with Google'}
                      </span>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-xs text-emerald-800 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <MailCheck className="w-4 h-4 text-emerald-600" />
                    Gmail Ready: {googleUser?.email}
                  </span>
                  <button
                    type="button"
                    onClick={handleGoogleSignOut}
                    className="text-2xs text-emerald-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    Sign out
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Tickets list */}
                <div className="space-y-2 max-h-[360px] overflow-y-auto">
                  {liveInbox.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
                      No live contact submissions received yet.
                    </div>
                  ) : (
                    liveInbox.map((t) => (
                      <div
                        key={t.ticketId}
                        onClick={() => {
                          setSelectedAdminTicketId(t.ticketId);
                          setReplyFeedbackMsg(null);
                          setReplyConfirmPending(false);
                        }}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all space-y-1.5 ${
                          selectedAdminTicket?.ticketId === t.ticketId
                            ? 'border-blue-600 bg-blue-50 shadow-xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-blue-700">{t.ticketId}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              t.status === 'new'
                                ? 'bg-amber-100 text-amber-800'
                                : t.status === 'in_progress'
                                ? 'bg-blue-50 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {t.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="font-semibold text-slate-900 line-clamp-1">{t.subject}</div>
                        <div className="text-2xs text-slate-500 flex justify-between items-center">
                          <span>{t.senderName} ({t.senderEmail})</span>
                          {t.emailDispatched && (
                            <span className="text-emerald-700 font-semibold">Gmail Sent</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Ticket Inspector & Real-time Reply */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs flex flex-col justify-between">
                  {selectedAdminTicket ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="font-mono font-bold text-blue-700">{selectedAdminTicket.ticketId}</span>
                        <select
                          value={selectedAdminTicket.status}
                          onChange={(e) =>
                            handleAdminUpdateStatus(
                              selectedAdminTicket.ticketId,
                              e.target.value as TicketStatus
                            )
                          }
                          className="bg-white border border-slate-300 rounded px-2 py-0.5 text-2xs font-semibold"
                        >
                          <option value="new">New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>

                      <div>
                        <div className="font-bold text-slate-900">{selectedAdminTicket.subject}</div>
                        <div className="text-2xs text-slate-500 mt-0.5">
                          From: {selectedAdminTicket.senderName} ({selectedAdminTicket.senderEmail})
                        </div>
                        <p className="mt-2 text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                          {selectedAdminTicket.details}
                        </p>
                      </div>

                      {selectedAdminTicket.replies?.length > 0 && (
                        <div className="space-y-1.5 max-h-28 overflow-y-auto">
                          {selectedAdminTicket.replies.map((rep) => (
                            <div
                              key={rep.id}
                              className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-2xs text-slate-800"
                            >
                              <div className="font-bold text-emerald-800 flex justify-between">
                                <span>{rep.senderName}</span>
                                <span>{rep.emailDispatched ? 'Emailed via Gmail' : 'In-App Reply'}</span>
                              </div>
                              <p className="mt-0.5">{rep.message}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {replyFeedbackMsg && (
                        <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-2xs text-blue-800">
                          {replyFeedbackMsg}
                        </div>
                      )}

                      <div className="pt-1">
                        <label className="block text-2xs uppercase font-bold text-slate-500 mb-1">
                          Real-Time Response
                        </label>
                        <textarea
                          rows={2}
                          value={adminReplyInput}
                          onChange={(e) => setAdminReplyInput(e.target.value)}
                          placeholder="Write reply to sender..."
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                        />
                        {replyConfirmPending ? (
                          <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
                            <p className="text-2xs text-amber-900 font-medium">
                              Send reply email via Gmail to <strong>{selectedAdminTicket.senderEmail}</strong>?
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setReplyConfirmPending(false)}
                                className="px-2.5 py-1 bg-white border border-slate-300 rounded text-2xs font-semibold cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={isSendingReply}
                                onClick={() => executeAdminReply(true)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-2xs font-semibold cursor-pointer disabled:opacity-50"
                              >
                                {isSendingReply ? 'Sending...' : 'Confirm & Send Email'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isSendingReply || !adminReplyInput.trim()}
                            onClick={() => {
                              if (accessToken) {
                                setReplyConfirmPending(true);
                              } else {
                                executeAdminReply(false);
                              }
                            }}
                            className="mt-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-2xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isSendingReply
                              ? 'Sending...'
                              : accessToken
                              ? 'Send Response & Email via Gmail'
                              : 'Post Live Response'}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-16 text-center text-slate-500">
                      Select a submission from the left column to view and respond.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeView === 'history' ? (
            /* ==================== REAL-TIME MY SUBMISSIONS & RESPONSES VIEW ==================== */
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">
                  Real-Time Submissions &amp; Responses ({myLiveTickets.length})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRefreshInbox}
                    className="text-2xs text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingInbox ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  {pastTickets.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem('statassist_feedback_tickets');
                        setPastTickets([]);
                      }}
                      className="text-2xs text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear Local</span>
                    </button>
                  )}
                </div>
              </div>

              {myLiveTickets.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl space-y-2">
                  <p>No submissions found for your session yet.</p>
                  <button
                    type="button"
                    onClick={() => setActiveView('form')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs cursor-pointer"
                  >
                    Submit a Contact Message
                  </button>
                </div>
              ) : (
                myLiveTickets.map((t) => (
                  <div
                    key={t.ticketId}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-700">{t.ticketId}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            t.status === 'new'
                              ? 'bg-amber-100 text-amber-800'
                              : t.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {t.status.replace('_', ' ')}
                        </span>
                        {t.emailDispatched && (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold">
                            Sent via Gmail
                          </span>
                        )}
                      </div>
                      <span className="text-2xs text-slate-500">
                        {new Date(t.submittedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900">{t.subject}</div>
                    <p className="text-slate-600 text-xs leading-relaxed">{t.details}</p>

                    {t.replies && t.replies.length > 0 ? (
                      <div className="pt-2 border-t border-slate-200 space-y-1.5">
                        <div className="text-2xs font-bold text-emerald-700 uppercase tracking-wider">
                          Real-Time Response from {DIRECT_RECEIVER_EMAIL}:
                        </div>
                        {t.replies.map((rep) => (
                          <div
                            key={rep.id}
                            className="p-2.5 rounded-lg bg-white border border-emerald-200 text-slate-800"
                          >
                            <div className="flex justify-between text-2xs text-slate-500 mb-1">
                              <span className="font-semibold text-emerald-800">{rep.senderName}</span>
                              <span>{new Date(rep.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-xs leading-relaxed">{rep.message}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-2xs text-slate-500 italic pt-1">
                        Awaiting real-time response from {DIRECT_RECEIVER_EMAIL}...
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : submittedTicket ? (
            /* ==================== POST-SUBMIT CONFIRMATION VIEW ==================== */
            <div className="py-5 text-center space-y-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Delivered
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Message Delivered!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  {submittedTicket.emailDispatched ? (
                    <>
                      Composed from Cloud Firestore and delivered via Gmail to{' '}
                      <strong className="text-slate-900">
                        {submittedTicket.recipientEmail || DIRECT_RECEIVER_EMAIL}
                      </strong>
                      .
                    </>
                  ) : (
                    <>
                      Delivered via Hosted website to{' '}
                      <strong className="text-slate-900">
                        {submittedTicket.recipientEmail || DIRECT_RECEIVER_EMAIL}
                      </strong>
                      .
                    </>
                  )}
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Reference ID:
                    </span>
                    <span className="font-mono text-base font-bold text-blue-700">
                      {submittedTicket.ticketId}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyTicketId(submittedTicket.ticketId)}
                      className="p-1 hover:text-blue-700 text-slate-500 cursor-pointer"
                      title="Copy Reference ID"
                    >
                      {copiedTicketId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  {submittedTicket.firestoreCollection && submittedTicket.firestoreDocId && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-[11px] text-indigo-800 font-mono">
                      <Database className="w-3.5 h-3.5 text-indigo-600" />
                      <span>
                        {submittedTicket.firestoreCollection}/{submittedTicket.firestoreDocId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 max-w-md mx-auto">
                  {formError}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {!submittedTicket.emailDispatched && (
                  <button
                    type="button"
                    disabled={isSendingGmailCopy}
                    onClick={handleSignInAndSendSubmittedCopy}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <MailCheck className="w-3.5 h-3.5" />
                    <span>
                      {isSendingGmailCopy
                        ? 'Authenticating & Sending...'
                        : 'Sign in with Google & Email Copy'}
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveView('history')}
                  className="px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                >
                  Track Real-Time Response
                </button>
                <a
                  href={`mailto:${DIRECT_RECEIVER_EMAIL}?subject=${encodeURIComponent(
                    `[StatAssist AI Contact] ${submittedTicket.subject}`
                  )}&body=${encodeURIComponent(
                    `From: ${submittedTicket.userName} (${submittedTicket.userEmail})\nReference: ${submittedTicket.ticketId}\n\n${submittedTicket.description}`
                  )}`}
                  className="px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Email App</span>
                </a>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Submit Another
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* ==================== SUBMISSION FORM + GOOGLE AUTHENTICATION ==================== */
            <div className="space-y-4">
              {/* Firebase Google Auth & Gmail Ready Bar */}
              {googleUser && accessToken ? (
                <div className="px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-xs text-emerald-800 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-medium truncate">
                    <MailCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Signed in as {googleUser.email}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleGoogleSignOut}
                    className="text-[11px] text-emerald-700 hover:underline inline-flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-600">
                    {googleUser
                      ? `Signed in (${googleUser.email}) — reconnect Google to send via Gmail:`
                      : 'Sign in with Google to save to Cloud Firestore & email via Gmail:'}
                  </span>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isAuthenticating}
                    className="gsi-material-button"
                  >
                    <div className="gsi-material-button-content-wrapper">
                      <div className="gsi-material-button-icon">
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                          <path fill="none" d="M0 0h48v48H0z" />
                        </svg>
                      </div>
                      <span className="gsi-material-button-contents">
                        {isAuthenticating ? 'Connecting...' : 'Sign in with Google'}
                      </span>
                    </div>
                  </button>
                </div>
              )}

              {(authError || formError || uploadError) && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between gap-2">
                  <span>{authError || formError || uploadError}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setFormError(null);
                      setUploadError(null);
                    }}
                    className="text-rose-500 hover:text-rose-800 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Explicit Gmail Confirmation Dialog */}
              {showConfirmSendDialog && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-300 space-y-2.5 text-xs">
                  <div className="font-bold text-slate-900">
                    Confirm Contact Email Delivery via Gmail
                  </div>
                  <div className="text-slate-700 space-y-1">
                    <div>
                      <strong>From:</strong> {googleUser?.email || userEmail}
                    </div>
                    <div>
                      <strong>To:</strong> {DIRECT_RECEIVER_EMAIL}
                    </div>
                    <div>
                      <strong>Subject:</strong> {subject}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowConfirmSendDialog(false)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleConfirmAndSendViaGmail}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Sending...' : 'Confirm & Send'}</span>
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* 1. Subject */}
                <div>
                  <label className="block text-2xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Subject <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  />
                </div>

                {/* 2. Description */}
                <div>
                  <label className="block text-2xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Details <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    className="w-full text-xs rounded-lg border border-slate-300 p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none leading-relaxed"
                  />
                </div>

                {/* 3. Compact Contact Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-2xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Email <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={userEmail}
                      onChange={(e) => {
                        setUserEmail(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      className="w-full text-xs rounded-lg border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      className="w-full text-xs rounded-lg border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* 4. Compact Attachment Area */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-2xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                      <Paperclip className="w-3 h-3 text-blue-600" />
                      <span>Attachment</span>
                    </label>
                    <span className="text-2xs text-slate-500">Max 4 files, 10MB each</span>
                  </div>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border border-dashed rounded-lg py-3 px-4 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => processFiles(e.target.files)}
                      multiple
                      accept=".png,.jpg,.jpeg,.webp,.pdf,.csv,.xlsx,.tsv,.txt,.log,.docx"
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-600 pointer-events-none">
                      <UploadCloud className="w-4 h-4 text-blue-600" />
                      <span>
                        Drop screenshot/dataset here, or{' '}
                        <span className="text-blue-600 underline font-medium">browse</span>
                      </span>
                    </div>
                  </div>

                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {attachments.map((att) => (
                        <div
                          key={att.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-700 font-mono"
                        >
                          <span className="truncate max-w-[150px]">{att.name}</span>
                          <span className="text-slate-500 text-2xs">({formatBytes(att.size)})</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveAttachment(att.id);
                            }}
                            className="hover:text-rose-600 text-slate-500 ml-0.5 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Action Buttons */}
                <div className="pt-3 flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">
                    <span className="text-rose-600 font-semibold">*</span> All details compulsory
                  </span>
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>{accessToken ? 'Write to Firestore & Send' : 'Submit & Send'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Live Firestore Document Queue Stream for Selected Collection */}
              {googleUser && (
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <span>
                      Live Collection Stream: <code className="text-blue-700">{selectedCollection}</code> ({firestoreDocs.length})
                    </span>
                    {firestoreListenerError && (
                      <span className="text-rose-600 normal-case font-medium">
                        Listener warning
                      </span>
                    )}
                  </div>
                  {firestoreDocs.length === 0 ? (
                    <div className="text-[11px] text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-lg px-3 py-2">
                      No documents written to <code>{selectedCollection}</code> yet. Submitting writes a trigger document and dispatches its contents.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {firestoreDocs.slice(0, 6).map((docItem) => (
                        <div
                          key={docItem.id}
                          className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-800 truncate">
                              {docItem.message?.subject || '(Untitled)'}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 truncate">
                              {selectedCollection}/{docItem.id} &rarr; {docItem.to?.join(', ')}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                docItem.delivery?.state === 'SUCCESS'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : docItem.delivery?.state === 'ERROR'
                                  ? 'bg-rose-100 text-rose-800'
                                  : docItem.delivery?.state === 'PROCESSING'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {docItem.delivery?.state || 'PENDING'}
                            </span>
                            {(docItem.delivery?.state === 'PENDING' || docItem.delivery?.state === 'ERROR') && (
                              <button
                                type="button"
                                disabled={dispatchingDocId === docItem.id}
                                onClick={() => handleDispatchExistingFirestoreDoc(docItem)}
                                className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold cursor-pointer disabled:opacity-50"
                              >
                                {dispatchingDocId === docItem.id ? 'Sending...' : 'Send Now'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pop-up Delivery Status Notification (Delivered vs Not Delivered) */}
      {deliveryPopup && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          onClick={(e) => {
            e.stopPropagation();
            setDeliveryPopup(null);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 text-center animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                deliveryPopup.status === 'delivered'
                  ? 'bg-emerald-100 text-emerald-600'
                  : deliveryPopup.status === 'queued'
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-rose-100 text-rose-600'
              }`}
            >
              {deliveryPopup.status === 'delivered' ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <AlertCircle className="w-7 h-7" />
              )}
            </div>

            <div className="space-y-1.5">
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  deliveryPopup.status === 'delivered'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : deliveryPopup.status === 'queued'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {deliveryPopup.status === 'delivered'
                  ? 'Delivered'
                  : deliveryPopup.status === 'queued'
                  ? 'Saved Only — Email Not Sent'
                  : 'Not Delivered'}
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {deliveryPopup.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {deliveryPopup.message}
              </p>
              {deliveryPopup.ticketId && (
                <div className="mt-2 flex flex-col items-center gap-1.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Reference ID:
                    </span>
                    <span className="font-mono text-sm font-bold text-blue-700">
                      {deliveryPopup.ticketId}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyTicketId(deliveryPopup.ticketId!)}
                      className="p-1 hover:text-blue-700 text-slate-500 cursor-pointer"
                      title="Copy Reference ID"
                    >
                      {copiedTicketId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  {deliveryPopup.firestorePath && (
                    <div className="text-[11px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md">
                      Firestore Doc: {deliveryPopup.firestorePath}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {deliveryPopup.status === 'queued' && submittedTicket && (
                <button
                  type="button"
                  disabled={isSendingGmailCopy}
                  onClick={handleSignInAndSendSubmittedCopy}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <MailCheck className="w-3.5 h-3.5" />
                  <span>
                    {isSendingGmailCopy
                      ? 'Signing in & Sending...'
                      : 'Sign in with Google & Deliver Email'}
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setDeliveryPopup(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
