import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Inbox,
  User,
  LogOut,
  ShieldCheck,
  Search,
  ExternalLink,
  Save,
  HelpCircle,
  Clock,
} from 'lucide-react';
interface FirebaseUser {
  uid?: string;
  email?: string | null;
  displayName?: string | null;
}
import {
  initGoogleAuth,
  signInWithGoogleOAuth,
  getGoogleAccessToken,
  googleSignOut,
} from '../services/googleAuth';
import {
  getGmailProfile,
  listGmailMessages,
  sendGmailMessage,
  createGmailDraft,
  GmailProfile,
  GmailMessageSummary,
} from '../services/gmailService';
import { Dataset, StatisticalResult, ResearchQuestion } from '../types/stats';
import { generateApaNarrative } from '../utils/apaFormatter';

interface GmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDataset?: Dataset;
  currentResult?: StatisticalResult | null;
  activeResearchQuestion?: ResearchQuestion | null;
  activeTestName?: string;
}

export const GmailModal: React.FC<GmailModalProps> = ({
  isOpen,
  onClose,
  currentDataset,
  currentResult,
  activeResearchQuestion,
  activeTestName = 'Statistical Analysis',
}) => {
  const [activeTab, setActiveTab] = useState<'compose' | 'inbox'>('compose');
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Profile & Inbox state
  const [profile, setProfile] = useState<GmailProfile | null>(null);
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Compose State
  const [recipient, setRecipient] = useState('');
  const [ccRecipient, setCcRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);
  const [sendErrorMessage, setSendErrorMessage] = useState<string | null>(null);

  // Mandatory Confirmation Dialog State (Per Workspace API guidelines for sending emails)
  const [showConfirmSendDialog, setShowConfirmSendDialog] = useState(false);

  // Generate default email draft based on current active statistical output
  const generateDefaultReportContent = () => {
    const studyTitle = currentDataset?.name || 'Empirical Study';
    const testTitle = activeTestName || 'Statistical Analysis';
    const rqText = activeResearchQuestion?.question
      ? `Research Question:\n"${activeResearchQuestion.question}"\n\n`
      : '';
    const hypotheses =
      activeResearchQuestion?.hypothesisNull || activeResearchQuestion?.hypothesisAlt
        ? `Hypotheses:\n• H₀: ${activeResearchQuestion.hypothesisNull || 'N/A'}\n• H₁: ${activeResearchQuestion.hypothesisAlt || 'N/A'}\n\n`
        : '';

    let apaSection = '';
    if (currentResult) {
      const narrative = generateApaNarrative(currentResult);
      const resAny = currentResult as any;
      const testStat = resAny.testStatistic !== undefined ? `• Test Statistic: ${Number(resAny.testStatistic).toFixed(3)}\n` : '';
      const pVal = resAny.pValue !== undefined ? `• Exact p-value: ${resAny.pValue < 0.001 ? '< .001' : `= ${Number(resAny.pValue).toFixed(3)}`}\n` : '';
      const effSize = resAny.effectSize !== undefined ? `• Effect Size: ${Number(resAny.effectSize).toFixed(3)} (${resAny.effectSizeInterpretation || 'Standard'})\n` : '';
      const decision = resAny.nullHypothesisDecision ? `• Decision: ${resAny.nullHypothesisDecision}\n` : '';

      apaSection = `APA 7th Statistical Finding:\n${narrative.narrativeText}\n\nCitation:\n${narrative.shortCitation}\n\nKey Statistics:\n${testStat}${pVal}${effSize}${decision}\n\n`;
    }

    const defaultSubject = `[StatAssist AI] APA 7th Statistical Report: ${studyTitle} - ${testTitle}`;
    const defaultBody = `Dear Colleague / Advisor,\n\nPlease find attached the statistical findings and APA 7th formatted narrative generated via StatAssist AI for the following research inquiry:\n\nDataset: ${studyTitle}\nProcedure: ${testTitle}\n${rqText}${hypotheses}${apaSection}Generated securely via StatAssist AI (Verified Deterministic Inference Engine).\n\nBest regards,\n${googleUser?.displayName || 'Academic Researcher'}`;

    return { defaultSubject, defaultBody };
  };

  // Sync Google Auth state on load
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
        setAuthError(null);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );

    getGoogleAccessToken().then((token) => {
      if (token) setAccessToken(token);
    });

    return () => unsubscribe();
  }, [isOpen]);

  // Populate draft when modal opens
  useEffect(() => {
    if (isOpen) {
      const { defaultSubject, defaultBody } = generateDefaultReportContent();
      setSubject(defaultSubject);
      setBody(defaultBody);
      setSendSuccessMessage(null);
      setSendErrorMessage(null);
    }
  }, [isOpen, currentDataset, currentResult, activeResearchQuestion, activeTestName]);

  // Fetch profile & inbox when authenticated
  useEffect(() => {
    if (accessToken && isOpen) {
      loadProfileAndMessages(accessToken);
    }
  }, [accessToken, isOpen]);

  const loadProfileAndMessages = async (token: string, query?: string) => {
    try {
      setIsLoadingMessages(true);
      const [prof, msgs] = await Promise.all([
        getGmailProfile(token).catch(() => null),
        listGmailMessages(token, 10, query).catch(() => []),
      ]);
      if (prof) setProfile(prof);
      setMessages(msgs);
    } catch (err: any) {
      console.error('Error fetching Gmail data:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await signInWithGoogleOAuth();
      if (res) {
        setGoogleUser(res.user);
        setAccessToken(res.accessToken);
        loadProfileAndMessages(res.accessToken);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google Workspace authentication failed.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await googleSignOut();
    setGoogleUser(null);
    setAccessToken(null);
    setProfile(null);
    setMessages([]);
  };

  // Step 1 of Send: Trigger Confirmation Dialog
  const handleInitiateSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSendSuccessMessage(null);
    setSendErrorMessage(null);

    if (!recipient.trim() || !recipient.includes('@')) {
      setSendErrorMessage('Please enter a valid recipient email address.');
      return;
    }
    if (!subject.trim()) {
      setSendErrorMessage('Please enter a subject line for your email.');
      return;
    }

    // MANDATORY confirmation dialog trigger
    setShowConfirmSendDialog(true);
  };

  // Step 2 of Send: Execute after user explicit confirmation
  const handleConfirmAndSend = async () => {
    setShowConfirmSendDialog(false);
    if (!accessToken) {
      setSendErrorMessage('Google Workspace session has expired. Please sign in again.');
      return;
    }

    setIsSending(true);
    setSendErrorMessage(null);
    try {
      await sendGmailMessage(accessToken, {
        to: recipient.trim(),
        cc: ccRecipient.trim() || undefined,
        subject: subject.trim(),
        body: body.trim(),
      });
      setSendSuccessMessage(`Email successfully dispatched via Gmail to ${recipient.trim()}!`);
      // Refresh inbox
      loadProfileAndMessages(accessToken);
    } catch (err: any) {
      setSendErrorMessage(err.message || 'Failed to send email via Gmail API.');
    } finally {
      setIsSending(false);
    }
  };

  // Save as Draft
  const handleSaveDraft = async () => {
    if (!accessToken) {
      setSendErrorMessage('Google Workspace session has expired. Please sign in again.');
      return;
    }
    if (!recipient.trim() && !subject.trim()) {
      setSendErrorMessage('Please enter at least a recipient or subject to save as draft.');
      return;
    }

    setIsSavingDraft(true);
    setSendErrorMessage(null);
    setSendSuccessMessage(null);
    try {
      await createGmailDraft(accessToken, {
        to: recipient.trim() || 'me',
        cc: ccRecipient.trim() || undefined,
        subject: subject.trim() || '(Draft Report)',
        body: body.trim(),
      });
      setSendSuccessMessage('Draft successfully saved in your Gmail account.');
    } catch (err: any) {
      setSendErrorMessage(err.message || 'Failed to save draft via Gmail API.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSending) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] space-y-4">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100 shadow-2xs">
              <Mail className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Gmail Workspace Integration
                </h3>
                <span className="text-[11px] font-mono text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded font-bold">
                  Official Gmail API
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Dispatch APA 7th statistical findings, communicate with academic co-authors, and manage study correspondence.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Authentication Zone */}
        {!googleUser ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center space-y-3.5 my-auto">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-slate-200">
              <Mail className="w-6 h-6 text-red-500" />
            </div>
            <div className="max-w-md mx-auto">
              <h4 className="text-sm font-bold text-slate-900">
                Connect your Google Workspace Account
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Authorize StatAssist AI with permission to send emails and save statistical drafts on your behalf via official Gmail API.
              </p>
            </div>

            {authError && (
              <div className="max-w-md mx-auto p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSignIn}
              disabled={isAuthenticating}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl border border-slate-300 shadow-sm transition-all flex items-center gap-2.5 mx-auto cursor-pointer hover:border-slate-400 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isAuthenticating ? 'Connecting Gmail...' : 'Sign in with Google'}</span>
            </button>
            <p className="text-[11px] text-slate-400">
              In-memory authorization. Your access token is kept in ephemeral RAM and never stored in localStorage.
            </p>
          </div>
        ) : (
          <>
            {/* Connected User Badge & Navigation Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                  {googleUser.displayName ? googleUser.displayName.charAt(0) : 'G'}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{googleUser.displayName || profile?.emailAddress || 'Connected Researcher'}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-medium">
                      Gmail Connected
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {googleUser.email || profile?.emailAddress}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab('compose')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                      activeTab === 'compose'
                        ? 'bg-red-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Compose & Share</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('inbox')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                      activeTab === 'inbox'
                        ? 'bg-red-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    <span>Recent Mail</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors"
                  title="Disconnect Google session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification Feedback */}
            {sendSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 shrink-0 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{sendSuccessMessage}</span>
              </div>
            )}
            {sendErrorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 shrink-0 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium">{sendErrorMessage}</span>
              </div>
            )}

            {/* Tab 1: Compose & Share Statistical Report */}
            {activeTab === 'compose' && (
              <form onSubmit={handleInitiateSend} className="space-y-3.5 overflow-y-auto flex-1 pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Recipient Email (To) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="e.g. supervisor@university.edu or coauthor@research.org"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cc (Optional)
                    </label>
                    <input
                      type="text"
                      value={ccRecipient}
                      onChange={(e) => setCcRecipient(e.target.value)}
                      placeholder="e.g. lab@university.edu"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Subject Line <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const { defaultSubject } = generateDefaultReportContent();
                        setSubject(defaultSubject);
                      }}
                      className="text-[11px] text-red-600 hover:text-red-800 flex items-center gap-1 font-medium"
                      title="Reset to automated study report subject"
                    >
                      <Sparkles className="w-3 h-3 text-red-500" />
                      <span>Use Report Title</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject of the email"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 font-medium text-slate-900"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Message Body (APA 7th Findings & Academic Narrative)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const { defaultBody } = generateDefaultReportContent();
                        setBody(defaultBody);
                      }}
                      className="text-[11px] text-red-600 hover:text-red-800 flex items-center gap-1 font-medium"
                      title="Regenerate full APA 7th study summary"
                    >
                      <Sparkles className="w-3 h-3 text-red-500" />
                      <span>Regenerate Summary</span>
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 font-mono text-slate-800 leading-relaxed"
                    required
                  />
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Requires explicit confirmation before sending.</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={isSavingDraft || isSending}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Save as a draft in your Gmail account"
                    >
                      <Save className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isSavingDraft ? 'Saving Draft...' : 'Save Draft in Gmail'}</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSending || isSavingDraft}
                      className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shadow-red-500/20 active:scale-[0.98] disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send via Gmail</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Tab 2: Recent Emails / Inbox Viewer */}
            {activeTab === 'inbox' && (
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && accessToken) {
                          loadProfileAndMessages(accessToken, searchQuery);
                        }
                      }}
                      placeholder="Search messages by sender, subject, or keywords..."
                      className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (accessToken) loadProfileAndMessages(accessToken, searchQuery);
                    }}
                    disabled={isLoadingMessages}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer shrink-0"
                    title="Refresh Gmail messages"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {isLoadingMessages ? (
                  <div className="p-8 text-center space-y-2">
                    <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">Fetching messages from Gmail API...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
                    <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-600 font-medium">No messages found in your Gmail mailbox.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-3 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {msg.from || 'Unknown Sender'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {msg.date ? new Date(msg.date).toLocaleDateString() : ''}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {msg.subject}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-2">
                            {msg.snippet}
                          </p>
                        </div>
                        <a
                          href={`https://mail.google.com/mail/u/0/#inbox/${msg.threadId || msg.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                          title="Open in Gmail Web App"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Confirmation Modal for Sending Email (MANDATORY per Workspace integration safety rules) */}
        {showConfirmSendDialog && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-100 text-red-700 rounded-xl">
                  <Send className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Confirm Sending Email via Gmail
                  </h4>
                  <p className="text-xs text-slate-500">
                    Please review recipient and subject before sending.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                <div>
                  <span className="font-semibold text-slate-700">To: </span>
                  <span className="font-mono text-slate-900">{recipient}</span>
                </div>
                {ccRecipient && (
                  <div>
                    <span className="font-semibold text-slate-700">Cc: </span>
                    <span className="font-mono text-slate-900">{ccRecipient}</span>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-slate-700">Subject: </span>
                  <span className="text-slate-900">{subject}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                Are you sure you want to send this statistical report email through your authorized Gmail account?
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowConfirmSendDialog(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndSend}
                  disabled={isSending}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'Sending...' : 'Confirm & Send'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
