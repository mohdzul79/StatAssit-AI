import React, { useState, useRef, useEffect } from 'react';
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
  FileText,
  Clock,
  Download,
  History,
  ShieldCheck,
  Shield,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { StatisticalTestType } from '../types/stats';
import { AdminTicket, TicketStatus } from '../types/admin';
import {
  getStoredAdminTickets,
  saveStoredAdminTickets,
  addAdminAuditLog,
} from '../data/initialAdminData';

export type FeedbackCategory =
  | 'bug'
  | 'calculation'
  | 'feature'
  | 'general';

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
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
}

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  defaultName?: string;
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

const CATEGORY_TABS: { id: FeedbackCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
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
  defaultOrganization = '',
  currentTest = 'independent_ttest',
  datasetStats = { hasData: false, rowCount: 0, colCount: 0 },
  adminEmail = 'mohdzul@gmail.com',
  initialCategory = 'general',
  onOpenAdminCms,
}) => {
  const isAdmin = defaultEmail.toLowerCase().trim() === adminEmail.toLowerCase().trim();
  const [activeView, setActiveView] = useState<'form' | 'history' | 'admin'>(isAdmin ? 'form' : 'form');

  // Form State
  const [category, setCategory] = useState<FeedbackCategory>(initialCategory);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [userEmail, setUserEmail] = useState(defaultEmail);
  const [userName, setUserName] = useState(defaultName);

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
  const [pastTickets, setPastTickets] = useState<SubmittedTicket[]>([]);

  // Admin Tickets Queue State
  const [adminTickets, setAdminTickets] = useState<AdminTicket[]>([]);
  const [selectedAdminTicket, setSelectedAdminTicket] = useState<AdminTicket | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  useEffect(() => {
    if (defaultEmail) setUserEmail(defaultEmail);
    if (defaultName) setUserName(defaultName);
  }, [defaultEmail, defaultName]);

  useEffect(() => {
    if (isOpen) {
      setCategory(initialCategory);
      setSubject('');
      setDescription('');
      setUserEmail(defaultEmail || '');
      setUserName(defaultName || '');
      setFormError(null);
      setSubmittedTicket(null);
      try {
        const stored = localStorage.getItem('statassist_feedback_tickets');
        if (stored) {
          setPastTickets(JSON.parse(stored));
        }
      } catch {
        // Ignore
      }
      setAdminTickets(getStoredAdminTickets());
    }
  }, [isOpen, initialCategory, defaultEmail, defaultName]);

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
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

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

  const DIRECT_RECEIVER_EMAIL = 'mohdzul@gmail.com';
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim());
  const isFormComplete =
    subject.trim().length > 0 &&
    description.trim().length > 0 &&
    isValidEmail &&
    userName.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete) {
      setFormError('Please fill in all compulsory details (Subject, Details, valid Email, and Name) before submitting.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    const attachmentMeta = attachments.map((a) => ({ name: a.name, size: a.size, type: a.type }));
    let ticketId = `STA-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          details: description.trim(),
          senderEmail: userEmail.trim(),
          senderName: userName.trim(),
          attachments: attachmentMeta,
          receiver: DIRECT_RECEIVER_EMAIL,
        }),
      });
      if (response.ok) {
        const payload = await response.json();
        if (payload?.ticketId) {
          ticketId = payload.ticketId;
        }
      }
    } catch {
      // Offline / transient network fallback still records ticket routed to mohdzul@gmail.com
    }

    const newTicket: SubmittedTicket = {
      ticketId,
      category,
      subject: subject.trim(),
      description: description.trim(),
      userName: userName.trim(),
      userEmail: userEmail.trim(),
      attachments: attachmentMeta,
      submittedAt: new Date().toLocaleString(),
    };

    // 1. Save to user's local past tickets
    const updatedHistory = [newTicket, ...pastTickets];
    setPastTickets(updatedHistory);
    try {
      localStorage.setItem('statassist_feedback_tickets', JSON.stringify(updatedHistory.slice(0, 20)));
    } catch {
      // Ignore
    }

    // 2. Route directly to mohdzul@gmail.com receiver queue
    const adminTicketObj: AdminTicket = {
      ticketId,
      category,
      subject: subject.trim(),
      description: description.trim(),
      userName: userName.trim(),
      userEmail: userEmail.trim(),
      status: 'new',
      assignedAdmin: DIRECT_RECEIVER_EMAIL,
      submittedAt: 'Just now',
      attachments: attachmentMeta,
    };
    const updatedAdminList = [adminTicketObj, ...getStoredAdminTickets()];
    saveStoredAdminTickets(updatedAdminList);
    setAdminTickets(updatedAdminList);

    addAdminAuditLog(
      'Contact Message Received',
      ticketId,
      `Message from ${userName.trim()} (${userEmail.trim()}) sent directly to receiver ${DIRECT_RECEIVER_EMAIL}`,
      'info'
    );

    setSubmittedTicket(newTicket);
    setIsSubmitting(false);
  };

  const handleResetForm = () => {
    setSubmittedTicket(null);
    setSubject('');
    setDescription('');
    setUserEmail('');
    setUserName('');
    setFormError(null);
    setAttachments([]);
    setUploadError(null);
  };

  const handleCopyTicketId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedTicketId(true);
    setTimeout(() => setCopiedTicketId(false), 2000);
  };

  const handleAdminUpdateStatus = (ticketId: string, status: TicketStatus) => {
    const updated = adminTickets.map((t) =>
      t.ticketId === ticketId ? { ...t, status, updatedAt: 'Just now' } : t
    );
    setAdminTickets(updated);
    saveStoredAdminTickets(updated);
    if (selectedAdminTicket?.ticketId === ticketId) {
      setSelectedAdminTicket({ ...selectedAdminTicket, status });
    }
  };

  const handleAdminSaveNote = (ticketId: string) => {
    if (!adminNoteInput.trim()) return;
    const updated = adminTickets.map((t) =>
      t.ticketId === ticketId
        ? {
            ...t,
            adminNotes: adminNoteInput.trim(),
            status: t.status === 'new' ? ('in_progress' as TicketStatus) : t.status,
            updatedAt: 'Just now',
          }
        : t
    );
    setAdminTickets(updated);
    saveStoredAdminTickets(updated);
    if (selectedAdminTicket?.ticketId === ticketId) {
      setSelectedAdminTicket({ ...selectedAdminTicket, adminNotes: adminNoteInput.trim() });
    }
    setAdminNoteInput('');
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
          {/* Admin Inbox View */}
          {activeView === 'admin' ? (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
                  <div>
                    <span className="font-bold">Administrator Feedback Governance: {adminEmail}</span>
                    <p className="text-2xs text-amber-800">
                      Manage incoming member tickets, update resolution status, and write administrative notes.
                    </p>
                  </div>
                </div>
                {onOpenAdminCms && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdminCms();
                    }}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded text-2xs transition-colors shrink-0 cursor-pointer"
                  >
                    Manage Users in CMS
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Tickets list */}
                <div className="space-y-2 max-h-[380px] overflow-y-auto">
                  {adminTickets.map((t) => (
                    <div
                      key={t.ticketId}
                      onClick={() => {
                        setSelectedAdminTicket(t);
                        setAdminNoteInput(t.adminNotes || '');
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
                      <div className="text-2xs text-slate-500 flex justify-between">
                        <span>{t.userName}</span>
                        <span>{t.submittedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ticket Inspector */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs flex flex-col justify-between">
                  {selectedAdminTicket ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="font-mono font-bold text-blue-700">{selectedAdminTicket.ticketId}</span>
                        <select
                          value={selectedAdminTicket.status}
                          onChange={(e) =>
                            handleAdminUpdateStatus(selectedAdminTicket.ticketId, e.target.value as TicketStatus)
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
                          From: {selectedAdminTicket.userName} ({selectedAdminTicket.userEmail})
                        </div>
                        <p className="mt-2 text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                          {selectedAdminTicket.description}
                        </p>
                      </div>

                      <div className="pt-2">
                        <label className="block text-2xs uppercase font-bold text-slate-500 mb-1">
                          Admin Resolution / Note
                        </label>
                        <textarea
                          rows={2}
                          value={adminNoteInput}
                          onChange={(e) => setAdminNoteInput(e.target.value)}
                          placeholder="Add reply or resolution notes..."
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleAdminSaveNote(selectedAdminTicket.ticketId)}
                          className="mt-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-2xs font-semibold transition-colors cursor-pointer"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-16 text-center text-slate-500">
                      Select a ticket from the left column to review.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeView === 'history' ? (
            /* History View */
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">
                  Past Submissions ({pastTickets.length})
                </span>
                <button
                  onClick={() => {
                    localStorage.removeItem('statassist_feedback_tickets');
                    setPastTickets([]);
                    setActiveView('form');
                  }}
                  className="text-2xs text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>

              {pastTickets.map((t) => (
                <div key={t.ticketId} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-700">{t.ticketId}</span>
                    <span className="text-2xs text-slate-500">{t.submittedAt}</span>
                  </div>
                  <div className="font-semibold text-slate-900">{t.subject}</div>
                  <p className="text-slate-600 text-xs leading-relaxed">{t.description}</p>
                  {t.attachments.length > 0 && (
                    <div className="text-2xs text-slate-500 flex items-center gap-1 pt-1">
                      <Paperclip className="w-3 h-3" />
                      <span>{t.attachments.length} attachment(s)</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : submittedTicket ? (
            /* Success confirmation */
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">Message Submitted!</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Your message has been delivered directly to <strong className="text-slate-900">{DIRECT_RECEIVER_EMAIL}</strong>.
                </p>
                <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
                  <span className="font-mono text-base font-bold text-blue-700">{submittedTicket.ticketId}</span>
                  <button
                    onClick={() => handleCopyTicketId(submittedTicket.ticketId)}
                    className="p-1 hover:text-blue-700 text-slate-500 cursor-pointer"
                    title="Copy Ticket ID"
                  >
                    {copiedTicketId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <a
                  href={`mailto:${DIRECT_RECEIVER_EMAIL}?subject=${encodeURIComponent(`[StatAssist AI Contact] ${submittedTicket.subject}`)}&body=${encodeURIComponent(`From: ${submittedTicket.userName} (${submittedTicket.userEmail})\nReference: ${submittedTicket.ticketId}\n\n${submittedTicket.description}`)}`}
                  className="px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Send Copy via Email App</span>
                </a>
                <button
                  onClick={handleResetForm}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Submit Another
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Submission Form */
            <form onSubmit={handleSubmit} className="space-y-4">

              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between">
                  <span>{formError}</span>
                  <button type="button" onClick={() => setFormError(null)} className="text-rose-500 hover:text-rose-800">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {uploadError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between">
                  <span>{uploadError}</span>
                  <button type="button" onClick={() => setUploadError(null)} className="text-rose-500 hover:text-rose-800">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* 2. Subject */}
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

              {/* 3. Description */}
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

              {/* 4. Compact Contact Row */}
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

              {/* 5. Compact Attachment Area */}
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
                    <span>Drop screenshot/dataset here, or <span className="text-blue-600 underline font-medium">browse</span></span>
                  </div>
                </div>

                {/* Attached File Chips */}
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

              {/* Action Buttons */}
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
                    disabled={!isFormComplete || isSubmitting}
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
                        <span>Submit</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
