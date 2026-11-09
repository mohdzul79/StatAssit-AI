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
  onOpenAdminCms,
}) => {
  const isAdmin = defaultEmail.toLowerCase().trim() === adminEmail.toLowerCase().trim();
  const [activeView, setActiveView] = useState<'form' | 'history' | 'admin'>(isAdmin ? 'form' : 'form');

  // Form State
  const [category, setCategory] = useState<FeedbackCategory>('bug');
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
  }, [isOpen]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const ticketNum = Math.floor(1000 + Math.random() * 9000);
      const ticketId = `STA-${ticketNum}`;

      const newTicket: SubmittedTicket = {
        ticketId,
        category,
        subject: subject.trim(),
        description: description.trim(),
        userName: userName.trim() || 'Researcher',
        userEmail: userEmail.trim(),
        attachments: attachments.map((a) => ({ name: a.name, size: a.size, type: a.type })),
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

      // 2. Save directly to Administrator mohdzul@gmail.com queue
      const adminTicketObj: AdminTicket = {
        ticketId,
        category,
        subject: subject.trim(),
        description: description.trim(),
        userName: userName.trim() || 'Researcher',
        userEmail: userEmail.trim(),
        status: 'new',
        assignedAdmin: adminEmail,
        submittedAt: 'Just now',
        attachments: attachments.map((a) => ({ name: a.name, size: a.size, type: a.type })),
      };
      const updatedAdminList = [adminTicketObj, ...getStoredAdminTickets()];
      saveStoredAdminTickets(updatedAdminList);
      setAdminTickets(updatedAdminList);

      addAdminAuditLog(
        'Feedback Ticket Received',
        ticketId,
        `Inquiry from ${userEmail.trim()} routed to Administrator ${adminEmail}`,
        'info'
      );

      setSubmittedTicket(newTicket);
      setIsSubmitting(false);
    }, 450);
  };

  const handleResetForm = () => {
    setSubmittedTicket(null);
    setSubject('');
    setDescription('');
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
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-xl shadow-xs">
              <Send className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white leading-tight">
                  Feedback & Support Center
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Admin: {adminEmail}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveView('form')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeView === 'form'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Submit Feedback
            </button>

            {pastTickets.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveView('history')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  activeView === 'history'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>My Tickets ({pastTickets.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveView('admin')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'admin'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100'
              }`}
              title="Administrator Inbox"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Inbox ({adminTickets.length})</span>
            </button>
          </div>

          {onOpenAdminCms && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAdminCms();
              }}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer hover:underline"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Open Admin CMS</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Admin Inbox View */}
          {activeView === 'admin' ? (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
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
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs'
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
                              ? 'bg-blue-100 text-blue-800'
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
                    <div className="py-16 text-center text-slate-400">
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
                <h3 className="text-base font-bold text-slate-900">Feedback Submitted!</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Your ticket has been delivered directly to Administrator <strong className="text-slate-800">{adminEmail}</strong>.
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

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={handleResetForm}
                  className="px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
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

              {uploadError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between">
                  <span>{uploadError}</span>
                  <button type="button" onClick={() => setUploadError(null)} className="text-rose-500 hover:text-rose-800">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* 1. Category Pills */}
              <div>
                <label className="block text-2xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {CATEGORY_TABS.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`py-2 px-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Subject */}
              <div>
                <label className="block text-2xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Question about ANOVA results or dataset upload assistance"
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                />
              </div>

              {/* 3. Description */}
              <div>
                <label className="block text-2xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Message / Details
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your question, observation, or recommendation in detail for Administrator Mohd Zulhisam..."
                  className="w-full text-xs rounded-lg border border-slate-300 p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none leading-relaxed"
                />
              </div>

              {/* 4. Compact Contact Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Researcher"
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 5. Compact Attachment Area */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-2xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                    <Paperclip className="w-3 h-3 text-blue-600" />
                    <span>Attachment (Optional)</span>
                  </label>
                  <span className="text-2xs text-slate-400">Max 4 files, 10MB each</span>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border border-dashed rounded-lg py-3 px-4 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-blue-600 bg-blue-50/60'
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50/60'
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
                        <span className="text-slate-400 text-2xs">({formatBytes(att.size)})</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAttachment(att.id);
                          }}
                          className="hover:text-rose-600 text-slate-400 ml-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
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
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
