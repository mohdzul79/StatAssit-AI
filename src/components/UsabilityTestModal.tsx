import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ClipboardCheck,
  ExternalLink,
  Sparkles,
  Award,
  CheckCircle2,
  Copy,
  Check,
  FileSpreadsheet,
  Download,
  Info,
  ChevronRight,
  BarChart3,
  HelpCircle,
  Code2,
  Share2,
  RefreshCw,
  Send,
  Sliders,
  UserCheck,
  BookOpen,
  Database,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  SUS_QUESTIONS,
  TASK_EVALUATIONS,
  calculateSusScore,
  getEffectiveGoogleFormUrl,
  saveEffectiveGoogleFormUrl,
  getStoredUsabilityResponses,
  saveUsabilityResponse,
  generateGoogleAppsScriptForForm,
  UsabilityResponse,
} from '../data/usabilityTestData';
import {
  signInWithGoogleOAuth,
  getGoogleAccessToken,
  initGoogleAuth,
  googleSignOut,
} from '../services/googleAuth';
import {
  findOrCreateUsabilitySpreadsheet,
  appendResponseToGoogleSheet,
  syncAllResponsesToGoogleSheet,
  createOrGetGoogleForm,
  getStoredSheetConfig,
  saveStoredSheetConfig,
  GoogleSheetDatabase,
  GoogleFormInfo,
  SHEET_TAB_NAME,
  SHEET_HEADERS,
} from '../services/googleFormsSheets';

interface UsabilityTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUserName?: string;
  defaultUserEmail?: string;
  defaultRole?: string;
  initialTab?: 'survey' | 'form-sheet' | 'google-form' | 'script' | 'instrument' | 'responses';
}

export const UsabilityTestModal: React.FC<UsabilityTestModalProps> = ({
  isOpen,
  onClose,
  defaultUserName = '',
  defaultUserEmail = '',
  defaultRole = 'Academic Researcher',
  initialTab = 'google-form',
}) => {
  const [activeTab, setActiveTab] = useState<
    'survey' | 'form-sheet' | 'google-form' | 'script' | 'instrument' | 'responses'
  >('google-form');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab === 'instrument' ? 'instrument' : 'google-form');
    }
  }, [isOpen, initialTab]);

  // Google Sheets & Forms Authentication State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [sheetDatabase, setSheetDatabase] = useState<GoogleSheetDatabase | null>(null);
  const [googleFormInfo, setGoogleFormInfo] = useState<GoogleFormInfo | null>(null);
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [sheetNotice, setSheetNotice] = useState<string | null>(null);
  const [autoSyncToSheet, setAutoSyncToSheet] = useState(true);

  // Survey Form State
  const [participantName, setParticipantName] = useState(defaultUserName);
  const [participantEmail, setParticipantEmail] = useState(defaultUserEmail);
  const [participantRole, setParticipantRole] = useState(defaultRole);
  const [fieldOfStudy, setFieldOfStudy] = useState('Psychology & Behavioral Sciences');
  const [priorSoftware, setPriorSoftware] = useState<string[]>([
    'IBM SPSS Statistics',
    'Microsoft Excel',
  ]);

  // SUS Answers: 1 to 5 for each item 1..10
  const [susAnswers, setSusAnswers] = useState<Record<number, number>>({
    1: 4, // Like to use frequently
    2: 2, // Complex
    3: 5, // Easy to use
    4: 1, // Need tech expert
    5: 5, // Well integrated
    6: 1, // Inconsistency
    7: 5, // Learn quickly
    8: 1, // Cumbersome
    9: 4, // Confident
    10: 2, // Learn a lot before starting
  });

  // Task Ratings (1 to 5)
  const [taskRatings, setTaskRatings] = useState<Record<string, number>>({
    task_data: 5,
    task_selection: 5,
    task_console: 4,
    task_apa: 5,
    task_ai_sync: 4,
  });

  const [npsScore, setNpsScore] = useState<number>(9);
  const [mostValuableFeature, setMostValuableFeature] = useState(
    'Automated APA 7th edition table generation and zero-hallucination deterministic p-value calculation.'
  );
  const [painPoints, setPainPoints] = useState('');
  const [featureSuggestions, setFeatureSuggestions] = useState(
    'Direct export to LaTeX format and additional nonparametric effect size metrics.'
  );

  // Form submission state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedSheetSynced, setSubmittedSheetSynced] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedFormUrl, setCopiedFormUrl] = useState(false);

  // Google Form URL configuration
  const [googleFormUrl, setGoogleFormUrl] = useState<string>('');
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  // Stored responses
  const [storedList, setStoredList] = useState<UsabilityResponse[]>([]);

  // Init auth listener and load Google Sheet resources
  useEffect(() => {
    if (!isOpen) return;

    const url = getEffectiveGoogleFormUrl();
    setGoogleFormUrl(url);
    setUrlInput(url);
    setStoredList(getStoredUsabilityResponses());

    // Check cached sheet and form config
    const cached = getStoredSheetConfig();
    if (cached.sheetId && cached.sheetUrl) {
      setSheetDatabase({
        id: cached.sheetId,
        title: 'StatAssist AI — Usability Test Database (Responses)',
        spreadsheetUrl: cached.sheetUrl,
        totalRows: getStoredUsabilityResponses().length,
        lastSyncedAt: cached.lastSyncedAt || 'Previously cached',
      });
    }
    if (cached.formId && cached.formResponderUrl) {
      setGoogleFormInfo({
        id: cached.formId,
        title: 'StatAssist AI — System Usability Scale & Usability Evaluation',
        responderUri: cached.formResponderUrl,
        editUri: cached.formEditUrl || `https://docs.google.com/forms/d/${cached.formId}/edit`,
      });
    }

    const unsubscribe = initGoogleAuth(
      (user) => {
        setGoogleUser(user);
        connectAndLoadGoogleSheetDatabase();
      },
      () => {
        setGoogleUser(null);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  const connectAndLoadGoogleSheetDatabase = async () => {
    try {
      const token = await getGoogleAccessToken();
      if (!token) return;

      setIsLoadingSheet(true);
      setSheetNotice('Connecting to Google Sheet Usability Database...');

      // 1. Locate or create official Google Sheet database
      const sheet = await findOrCreateUsabilitySpreadsheet(token);
      setSheetDatabase(sheet);

      // 2. Check for or create Google Form
      try {
        const formResult = await createOrGetGoogleForm(token);
        setGoogleFormInfo(formResult);
        if (formResult.responderUri) {
          setGoogleFormUrl(formResult.responderUri);
          saveEffectiveGoogleFormUrl(formResult.responderUri);
        }
      } catch (formErr) {
        console.warn('Form check deferred:', formErr);
      }

      setSheetNotice('Google Sheets database connected and ready.');
      setTimeout(() => setSheetNotice(null), 3000);
    } catch (err: any) {
      console.error('Error connecting to Google Sheets database:', err);
      setAuthError(err.message || 'Failed to connect to Google Sheets & Forms database.');
    } finally {
      setIsLoadingSheet(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      setAuthError(null);
      const res = await signInWithGoogleOAuth();
      if (res?.user) {
        setGoogleUser(res.user);
        await connectAndLoadGoogleSheetDatabase();
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setAuthError(err.message || 'Google authentication failed.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await googleSignOut();
    setGoogleUser(null);
    setSheetDatabase(null);
    setGoogleFormInfo(null);
  };

  const handleCreateOrConnectForm = async () => {
    try {
      const token = await getGoogleAccessToken();
      if (!token) {
        await handleGoogleSignIn();
        return;
      }

      setIsCreatingForm(true);
      setSheetNotice('Creating official Google Form with 10 SUS items & task evaluations...');
      const created = await createOrGetGoogleForm(token);
      setGoogleFormInfo(created);
      if (created.responderUri) {
        setGoogleFormUrl(created.responderUri);
        saveEffectiveGoogleFormUrl(created.responderUri);
      }
      setSheetNotice('Google Form created & connected to responses database.');
      setTimeout(() => setSheetNotice(null), 3500);
    } catch (err: any) {
      console.error('Failed to create Google Form:', err);
      setAuthError(err.message || 'Failed to create Google Form.');
    } finally {
      setIsCreatingForm(false);
    }
  };

  const handleSyncResponsesToGoogleSheet = async () => {
    try {
      const token = await getGoogleAccessToken();
      if (!token) {
        await handleGoogleSignIn();
        return;
      }

      setIsSyncingSheet(true);
      setSheetNotice('Syncing evaluations into Google Sheet database...');
      const targetSheet = sheetDatabase || (await findOrCreateUsabilitySpreadsheet(token));
      setSheetDatabase(targetSheet);

      const updated = await syncAllResponsesToGoogleSheet(token, targetSheet.id, storedList);
      setSheetNotice(`Synced ${updated.totalSynced} evaluations to Google Sheet (${SHEET_TAB_NAME}).`);
      setTimeout(() => setSheetNotice(null), 3500);
    } catch (err: any) {
      console.error('Failed to sync to Google Sheet:', err);
      setAuthError(err.message || 'Failed to synchronize with Google Sheet.');
    } finally {
      setIsSyncingSheet(false);
    }
  };

  // Real-time SUS score metric calculation
  const susMetric = useMemo(() => {
    return calculateSusScore(susAnswers);
  }, [susAnswers]);

  // Aggregate stats from stored responses
  const aggregateStats = useMemo(() => {
    if (storedList.length === 0) return null;
    const avgSus =
      storedList.reduce((acc, curr) => acc + (curr.susScore || 0), 0) / storedList.length;
    const avgNps =
      storedList.reduce((acc, curr) => acc + (curr.npsScore || 0), 0) / storedList.length;
    return {
      count: storedList.length,
      avgSus: Math.round(avgSus * 10) / 10,
      avgNps: Math.round(avgNps * 10) / 10,
    };
  }, [storedList]);

  const handleSusChange = (questionId: number, value: number) => {
    setSusAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleTaskRatingChange = (taskId: string, rating: number) => {
    setTaskRatings((prev) => ({
      ...prev,
      [taskId]: rating,
    }));
  };

  const handlePriorSoftwareToggle = (software: string) => {
    setPriorSoftware((prev) =>
      prev.includes(software) ? prev.filter((s) => s !== software) : [...prev, software]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newResponse: UsabilityResponse = {
      id: 'eval_' + Date.now().toString(36),
      submittedAt: new Date().toISOString(),
      participantName: participantName.trim() || 'Anonymous Scholar',
      participantEmail: participantEmail.trim() || 'participant@academic.edu',
      participantRole,
      fieldOfStudy,
      priorSoftware,
      susAnswers,
      susScore: susMetric.score,
      susGrade: susMetric.grade,
      susAdjective: susMetric.adjective,
      taskRatings,
      npsScore,
      mostValuableFeature,
      painPoints,
      featureSuggestions,
    };

    saveUsabilityResponse(newResponse);
    const updatedList = getStoredUsabilityResponses();
    setStoredList(updatedList);
    setIsSubmitted(true);

    // Auto-sync directly to Google Sheet database if connected
    if (autoSyncToSheet && sheetDatabase) {
      try {
        const token = await getGoogleAccessToken();
        if (token) {
          await appendResponseToGoogleSheet(token, sheetDatabase.id, newResponse);
          setSubmittedSheetSynced(true);
        }
      } catch (err) {
        console.warn('Auto-sync to Google Sheet completed with local fallback:', err);
      }
    }
  };

  const handleCopyScript = () => {
    const script = generateGoogleAppsScriptForForm();
    navigator.clipboard.writeText(script);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleCopyFormUrl = () => {
    navigator.clipboard.writeText(googleFormUrl);
    setCopiedFormUrl(true);
    setTimeout(() => setCopiedFormUrl(false), 2500);
  };

  const handleSaveCustomUrl = () => {
    saveEffectiveGoogleFormUrl(urlInput);
    setGoogleFormUrl(getEffectiveGoogleFormUrl());
    setIsEditingUrl(false);
  };

  const handleExportCsv = () => {
    if (storedList.length === 0) return;
    const headers = [
      'ID',
      'Date',
      'Participant',
      'Email',
      'Role',
      'Field',
      'SUS Score (0-100)',
      'Grade',
      'Adjective',
      'NPS (0-10)',
      'Valuable Feature',
      'Pain Points',
      'Suggestions',
    ];
    const rows = storedList.map((r) => [
      `"${r.id}"`,
      `"${r.submittedAt}"`,
      `"${r.participantName.replace(/"/g, '""')}"`,
      `"${r.participantEmail.replace(/"/g, '""')}"`,
      `"${r.participantRole.replace(/"/g, '""')}"`,
      `"${r.fieldOfStudy.replace(/"/g, '""')}"`,
      r.susScore,
      `"${r.susGrade}"`,
      `"${r.susAdjective}"`,
      r.npsScore,
      `"${(r.mostValuableFeature || '').replace(/"/g, '""')}"`,
      `"${(r.painPoints || '').replace(/"/g, '""')}"`,
      `"${(r.featureSuggestions || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `statassist_usability_study_responses_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh] text-slate-800">
        
        {/* Modern Minimalist Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 bg-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-900">
              Usability & SUS Evaluation
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>Brooke (1996) System Usability Scale</span>
              <span className="text-slate-300">·</span>
              <span>Google Sheets Integration</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Minimalist Live Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs">
              {sheetDatabase ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-slate-700">Connected</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  <span className="text-slate-500">Ready to Connect</span>
                </>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Minimal Understated Tab Navigation */}
        <div className="flex border-b border-slate-200/80 bg-white px-6 gap-6 shrink-0 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('google-form')}
            className={`py-3 font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'google-form'
                ? 'border-b-2 border-slate-900 text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Google Form Link</span>
          </button>

          <button
            onClick={() => setActiveTab('instrument')}
            className={`py-3 font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'instrument'
                ? 'border-b-2 border-slate-900 text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Instrument Spec</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/40">
          
          {/* Subtle Notification Banner */}
          {sheetNotice && (
            <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{sheetNotice}</span>
            </div>
          )}

          {authError && (
            <div className="p-3 rounded-lg bg-rose-50/80 border border-rose-200 text-rose-900 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{authError}</span>
              </div>
              <button
                type="button"
                onClick={() => setAuthError(null)}
                className="text-rose-700 hover:text-rose-900 font-medium"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* TAB 1: GOOGLE SHEETS DATABASE */}
          {activeTab === 'form-sheet' && (
            <div className="space-y-5">
              
              {/* Sleek Integration Summary Card (Linear/Stripe style) */}
              <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">Google Sheets Integration</span>
                      <span className="text-slate-300">·</span>
                      <div className="flex items-center gap-1.5 text-xs">
                        {sheetDatabase ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-emerald-700 font-medium">Connected</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-slate-300" />
                            <span className="text-slate-500">Ready to Connect</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                      <div>
                        Target Spreadsheet:{' '}
                        <code className="font-mono text-2xs bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200/70 font-medium">
                          StatAssist AI — Usability Test Database (Responses)
                        </code>
                      </div>
                      <div className="flex items-center gap-1 text-2xs text-slate-500">
                        <span>Destination Tabs:</span>
                        <code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded border border-slate-200/70">
                          Database_Responses
                        </code>
                        <span className="text-slate-300">·</span>
                        <code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded border border-slate-200/70">
                          Benchmark_Summary
                        </code>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {googleUser ? (
                      <div className="flex items-center gap-2.5">
                        <div className="text-right hidden sm:block">
                          <div className="text-xs font-medium text-slate-800">{googleUser.displayName || 'Authorized'}</div>
                          <div className="text-2xs text-slate-400 font-mono">{googleUser.email}</div>
                        </div>
                        <button
                          type="button"
                          onClick={handleGoogleSignOut}
                          className="px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Disconnect</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isAuthenticating}
                        className="px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
                      >
                        {isAuthenticating ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Connecting...</span>
                          </>
                        ) : (
                          <>
                            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-200" />
                            <span>Connect Google Sheets</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Direct Action Links Bar when connected */}
                {sheetDatabase && (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-4">
                      <a
                        href={sheetDatabase.spreadsheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-700 hover:text-slate-900 font-medium flex items-center gap-1.5"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Open Google Sheet</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>

                      {googleFormInfo && (
                        <a
                          href={googleFormInfo.responderUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-700 hover:text-slate-900 font-medium flex items-center gap-1.5"
                        >
                          <Share2 className="w-3.5 h-3.5 text-purple-600" />
                          <span>Open Public Form</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={connectAndLoadGoogleSheetDatabase}
                      disabled={isLoadingSheet}
                      className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-600 text-2xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingSheet ? 'animate-spin' : ''}`} />
                      <span>Refresh State</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 3 Refined Minimal Architecture Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* CARD 1: Responses Sheet */}
                <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-slate-700" />
                        <h4 className="font-semibold text-xs text-slate-900">Responses Database</h4>
                      </div>
                      <span className="font-mono text-2xs text-slate-400">tab: {SHEET_TAB_NAME}</span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Evaluations are written directly to structured rows across 18 columns in your spreadsheet.
                    </p>

                    {/* Clean Metrics Strip */}
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-around text-center text-xs">
                      <div>
                        <div className="text-3xs uppercase tracking-wider text-slate-400 font-medium">Local Rows</div>
                        <div className="font-semibold font-mono text-slate-800 text-sm">{storedList.length}</div>
                      </div>
                      <div className="w-px h-6 bg-slate-200" />
                      <div>
                        <div className="text-3xs uppercase tracking-wider text-slate-400 font-medium">Avg SUS</div>
                        <div className="font-semibold font-mono text-slate-800 text-sm">
                          {aggregateStats ? aggregateStats.avgSus : '68.0'}
                        </div>
                      </div>
                      <div className="w-px h-6 bg-slate-200" />
                      <div>
                        <div className="text-3xs uppercase tracking-wider text-slate-400 font-medium">Target</div>
                        <div className="font-semibold font-mono text-slate-500 text-sm">&gt; 68.0</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSyncResponsesToGoogleSheet}
                      disabled={isSyncingSheet}
                      className="w-full py-2 px-3 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSyncingSheet ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Syncing...</span>
                        </>
                      ) : (
                        <>
                          <Database className="w-3.5 h-3.5" />
                          <span>Sync Local Evaluations</span>
                        </>
                      )}
                    </button>

                    <label className="flex items-center gap-2 text-2xs text-slate-500 cursor-pointer pt-0.5">
                      <input
                        type="checkbox"
                        checked={autoSyncToSheet}
                        onChange={(e) => setAutoSyncToSheet(e.target.checked)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-400 cursor-pointer"
                      />
                      <span>Auto-sync new submissions to Google Sheet</span>
                    </label>
                  </div>
                </div>

                {/* CARD 2: Google Form */}
                <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-slate-700" />
                        <h4 className="font-semibold text-xs text-slate-900">Google Form Survey</h4>
                      </div>
                      <span className="font-mono text-2xs text-slate-400">
                        {googleFormInfo ? 'connected' : 'unlinked'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Publishes the standardized 10 SUS items and task evaluations to an official Google Form for external distribution.
                    </p>

                    {googleFormInfo && (
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                        <a
                          href={googleFormInfo.responderUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-700 hover:text-slate-900 font-medium flex items-center justify-between"
                        >
                          <span>Open Public Survey</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                        <a
                          href={googleFormInfo.editUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-500 hover:text-slate-700 flex items-center justify-between"
                        >
                          <span>Edit in Google Forms</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleCreateOrConnectForm}
                      disabled={isCreatingForm}
                      className="w-full py-2 px-3 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isCreatingForm ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating Form...</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>{googleFormInfo ? 'Re-link Google Form' : 'Generate Google Form'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* CARD 3: Psychometric Formulas */}
                <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-slate-700" />
                        <h4 className="font-semibold text-xs text-slate-900">Benchmark Formulas</h4>
                      </div>
                      <span className="font-mono text-2xs text-slate-400">tab: Benchmark_Summary</span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Real-time spreadsheet formulas compute industry usability benchmarks automatically.
                    </p>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 font-mono text-2xs text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Average SUS:</span>
                        <span className="text-slate-800 font-medium">=AVERAGE(...)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Net Promoter:</span>
                        <span className="text-slate-800 font-medium">=AVERAGE(...)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sample Count:</span>
                        <span className="text-slate-800 font-medium">=COUNTA(...)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleExportCsv}
                      className="w-full py-2 px-3 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV for SPSS / R</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Flow Architecture Note */}
              <div className="p-3.5 rounded-lg bg-white border border-slate-200/80 text-xs text-slate-500 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Evaluations are recorded into <code className="font-mono text-2xs text-slate-700 font-medium">Database_Responses</code> and aggregated against Brooke (1996) benchmarks in <code className="font-mono text-2xs text-slate-700 font-medium">Benchmark_Summary</code> with zero intermediate locks.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: IN-APP EVALUATION (SURVEY) */}
          {activeTab === 'survey' && (
            <div className="space-y-5">
              {/* Submission Confirmation Banner */}
              {isSubmitted && (
                <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Evaluation recorded successfully: SUS Score {susMetric.score} / 100 ({susMetric.grade} · {susMetric.adjective}).</span>
                  </div>
                  {submittedSheetSynced && (
                    <div className="text-2xs text-emerald-800">
                      ✓ Synchronized with Google Sheet database ({SHEET_TAB_NAME}).
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsSubmitted(false)}
                      className="px-2.5 py-1 rounded bg-white border border-emerald-300 text-emerald-900 text-2xs font-medium cursor-pointer"
                    >
                      Edit Answers
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('form-sheet')}
                      className="px-2.5 py-1 rounded bg-emerald-700 text-white text-2xs font-medium cursor-pointer"
                    >
                      View in Google Sheet
                    </button>
                  </div>
                </div>
              )}

              {/* Minimalist SUS Score Strip */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-2xs text-slate-400 uppercase tracking-wider font-medium">Live Psychometric Metric</div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-bold font-mono text-slate-900">{susMetric.score}</span>
                    <span className="text-xs text-slate-400">/ 100</span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs font-semibold text-slate-700">Grade {susMetric.grade}</span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-600">{susMetric.adjective}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                  <div>
                    <span className="text-slate-400">Percentile: </span>
                    <span className="font-semibold text-slate-800">~{susMetric.percentile}%</span>
                  </div>
                  <span className="text-slate-300">·</span>
                  <div>
                    <span className="text-slate-400">Industry Avg: </span>
                    <span className="font-semibold text-slate-800">68.0</span>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Section 1: Demographics */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <UserCheck className="w-4 h-4 text-slate-600" />
                    <h4 className="font-semibold text-xs text-slate-900">
                      1. Participant Profile
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Participant Name / Pseudonym
                      </label>
                      <input
                        type="text"
                        value={participantName}
                        onChange={(e) => setParticipantName(e.target.value)}
                        placeholder="Dr. Scholar / Anonymous"
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:border-slate-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={participantEmail}
                        onChange={(e) => setParticipantEmail(e.target.value)}
                        placeholder="researcher@university.edu"
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:border-slate-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Primary Role
                      </label>
                      <select
                        value={participantRole}
                        onChange={(e) => setParticipantRole(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:border-slate-400 focus:outline-none"
                      >
                        <option value="Postgraduate / Doctoral Scholar (PhD / Masters)">
                          Postgraduate / Doctoral Scholar (PhD / Masters)
                        </option>
                        <option value="Undergraduate Student">Undergraduate Student</option>
                        <option value="Academic Lecturer / Professor">Academic Lecturer / Professor</option>
                        <option value="Institutional Researcher / Postdoc">
                          Institutional Researcher / Postdoc
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Field of Study
                      </label>
                      <input
                        type="text"
                        value={fieldOfStudy}
                        onChange={(e) => setFieldOfStudy(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:border-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      Prior Statistical Software Used
                    </label>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {['IBM SPSS Statistics', 'Microsoft Excel', 'R / RStudio', 'Python / SciPy', 'JASP', 'Jamovi', 'GraphPad Prism'].map((tool) => {
                        const isSelected = priorSoftware.includes(tool);
                        return (
                          <button
                            type="button"
                            key={tool}
                            onClick={() => handlePriorSoftwareToggle(tool)}
                            className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer border ${
                              isSelected
                                ? 'bg-slate-900 border-slate-900 text-white'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {tool}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Section 2: 10 SUS Questions */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-slate-600" />
                      <h4 className="font-semibold text-xs text-slate-900">
                        2. System Usability Scale (SUS) 10-Item Instrument
                      </h4>
                    </div>
                    <span className="text-2xs text-slate-400">1 = Strongly Disagree, 5 = Strongly Agree</span>
                  </div>

                  <div className="space-y-3">
                    {SUS_QUESTIONS.map((item) => {
                      const ans = susAnswers[item.id] ?? 3;
                      return (
                        <div
                          key={item.id}
                          className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="text-xs text-slate-800">
                            <span className="font-mono text-slate-400 mr-2">{item.id}.</span>
                            <span>{item.text}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {[1, 2, 3, 4, 5].map((val) => (
                              <button
                                type="button"
                                key={val}
                                onClick={() => handleSusChange(item.id, val)}
                                className={`w-8 h-7 rounded text-xs font-mono font-medium border transition-colors cursor-pointer ${
                                  ans === val
                                    ? 'bg-slate-900 border-slate-900 text-white'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {val}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Task Ratings */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4 text-slate-600" />
                      <h4 className="font-semibold text-xs text-slate-900">
                        3. Usability Task Ratings (1-5 Stars)
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {TASK_EVALUATIONS.map((task) => {
                      const rating = taskRatings[task.id] ?? 4;
                      return (
                        <div
                          key={task.id}
                          className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="text-xs font-semibold text-slate-900">{task.taskTitle}</div>
                            <div className="text-2xs text-slate-500 mt-0.5">{task.description}</div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {[1, 2, 3, 4, 5].map((lvl) => (
                              <button
                                type="button"
                                key={lvl}
                                onClick={() => handleTaskRatingChange(task.id, lvl)}
                                className={`px-2.5 py-1 rounded text-xs font-mono font-medium border transition-colors cursor-pointer ${
                                  rating === lvl
                                    ? 'bg-slate-900 border-slate-900 text-white'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {lvl}★
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 4: Qualitative & NPS */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-slate-600" />
                      <h4 className="font-semibold text-xs text-slate-900">
                        4. Qualitative Reflections & Net Promoter Score
                      </h4>
                    </div>
                    <span className="font-mono text-xs font-semibold text-slate-800">
                      NPS: {npsScore} / 10
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      How likely are you to recommend StatAssist AI to a colleague or student? (0–10)
                    </label>
                    <div className="grid grid-cols-11 gap-1">
                      {Array.from({ length: 11 }).map((_, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setNpsScore(idx)}
                          className={`py-1.5 rounded text-xs font-mono font-medium border transition-colors cursor-pointer ${
                            npsScore === idx
                              ? 'bg-slate-900 border-slate-900 text-white'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {idx}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-3xs text-slate-400 mt-1">
                      <span>0 - Not likely</span>
                      <span>10 - Extremely likely</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Most valuable feature or aspect
                      </label>
                      <textarea
                        rows={2}
                        value={mostValuableFeature}
                        onChange={(e) => setMostValuableFeature(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:border-slate-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Any points of confusion or areas for improvement
                      </label>
                      <textarea
                        rows={2}
                        value={painPoints}
                        onChange={(e) => setPainPoints(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:border-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Evaluation</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: GOOGLE FORM LINK */}
          {activeTab === 'google-form' && (
            <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Google Form Public Link</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Share this URL with students, respondents, and research participants.
                  </p>
                </div>

                <a
                  href={googleFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <span>Launch Form</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 flex items-center justify-between gap-3 text-xs font-mono">
                <div className="truncate text-slate-700 select-all">{googleFormUrl}</div>
                <button
                  type="button"
                  onClick={handleCopyFormUrl}
                  className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-sans text-xs flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                >
                  {copiedFormUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: GOOGLE APPS SCRIPT */}
          {activeTab === 'script' && (
            <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Google Apps Script Generator</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    1-click script to build the entire Google Form and connect responses in script.google.com.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Script</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-lg bg-slate-900 text-slate-200 font-mono text-2xs overflow-x-auto max-h-[360px] leading-relaxed">
                {generateGoogleAppsScriptForForm()}
              </pre>
            </div>
          )}

          {/* TAB 5: QUESTIONNAIRE SPEC */}
          {activeTab === 'instrument' && (
            <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Brooke (1996) System Usability Scale Spec</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Alternating positive/negative 10-item psychometric questionnaire items.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-slate-500 text-2xs uppercase">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">#</th>
                      <th className="px-3 py-2 text-left font-medium">Item Text</th>
                      <th className="px-3 py-2 text-left font-medium">Polarity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                    {SUS_QUESTIONS.map((q) => (
                      <tr key={q.id}>
                        <td className="px-3 py-2 font-mono text-slate-400">{q.id}</td>
                        <td className="px-3 py-2">{q.text}</td>
                        <td className="px-3 py-2 font-mono text-2xs text-slate-500">
                          {q.isPositive ? '+ Positive' : '- Negative'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: STORED RESPONSES */}
          {activeTab === 'responses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Recorded Submissions ({storedList.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Local evaluations stored in browser state and synchronized to Google Sheets.
                  </p>
                </div>

                {storedList.length > 0 && (
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="px-3.5 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                )}
              </div>

              {storedList.length > 0 ? (
                <div className="space-y-2">
                  {storedList.map((resp) => (
                    <div
                      key={resp.id}
                      className="p-3.5 rounded-lg border border-slate-200/90 bg-white shadow-2xs space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{resp.participantName}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-2xs text-slate-500 font-mono">
                            {new Date(resp.submittedAt).toLocaleDateString()}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-2xs text-slate-500">{resp.participantRole}</span>
                        </div>

                        <div className="flex items-center gap-3 font-mono text-xs">
                          <span className="font-semibold text-slate-800">
                            SUS: {resp.susScore} ({resp.susGrade})
                          </span>
                          <span className="text-slate-500">NPS: {resp.npsScore}/10</span>
                        </div>
                      </div>

                      {resp.mostValuableFeature && (
                        <div className="text-2xs text-slate-600">
                          <span className="font-medium text-slate-800">Valuable:</span> {resp.mostValuableFeature}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center rounded-lg border border-dashed border-slate-200 bg-white text-xs text-slate-400">
                  No evaluations recorded yet. Fill out the in-app survey or connect to Google Sheets.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Minimal Understated Footer */}
        <div className="px-6 py-3 border-t border-slate-200/80 bg-white flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span>System Usability Scale</span>
            <span className="text-slate-300">·</span>
            <span>Brooke (1996)</span>
            <span className="text-slate-300">·</span>
            <span>Google Sheets</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
