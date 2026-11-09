import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Folder,
  BookOpen,
  Sparkles,
  ArrowRight,
  LogOut,
  ShieldCheck,
  Cpu,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initGoogleAuth,
  signInWithGoogleOAuth,
  getGoogleAccessToken,
  googleSignOut,
} from '../services/googleAuth';
import {
  findOrCreateDriveFolder,
  findOrCreateLogbookDoc,
  appendLogbookEntry,
  GoogleDriveFolder,
  GoogleDocFile,
  SyncLogbookPayload,
} from '../services/googleDriveDocs';
import { Dataset, StatisticalResult, ResearchQuestion } from '../types/stats';
import { generateApaNarrative } from '../utils/apaFormatter';

interface NotebookLMSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDataset?: Dataset;
  currentResult?: StatisticalResult | null;
  activeResearchQuestion?: ResearchQuestion | null;
  activeTestName?: string;
  onLogbookSynced?: (docLink: string) => void;
}

export const NotebookLMSyncModal: React.FC<NotebookLMSyncModalProps> = ({
  isOpen,
  onClose,
  currentDataset,
  currentResult,
  activeResearchQuestion,
  activeTestName = 'Statistical Analysis',
  onLogbookSynced,
}) => {
  // Google Auth State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Drive & Doc State
  const [driveFolder, setDriveFolder] = useState<GoogleDriveFolder | null>(null);
  const [logbookDoc, setLogbookDoc] = useState<GoogleDocFile | null>(null);
  const [isInitializingDrive, setIsInitializingDrive] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // User Mutating Confirmation Dialog State (MANDATORY per Workspace guidelines)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [customNote, setCustomNote] = useState('');

  // Tab mode in modal
  const [activeTab, setActiveTab] = useState<'sync' | 'notebooklm-guide'>('sync');

  // Monitor auth state
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initGoogleAuth(
      (user) => {
        setGoogleUser(user);
        // Automatically check Drive folder and doc when authenticated
        loadFolderAndDoc();
      },
      () => {
        setGoogleUser(null);
        setDriveFolder(null);
        setLogbookDoc(null);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  const loadFolderAndDoc = async () => {
    try {
      const token = await getGoogleAccessToken();
      if (!token) return;

      setIsInitializingDrive(true);
      setSyncStatus("Connecting to Google Drive ('unimas')...");
      const folder = await findOrCreateDriveFolder(token, 'unimas');
      setDriveFolder(folder);

      setSyncStatus("Locating log book ('development statsAI')...");
      const { doc } = await findOrCreateLogbookDoc(token, folder.id, 'development statsAI');
      setLogbookDoc(doc);
      setSyncStatus('Logbook ready.');
    } catch (err: any) {
      console.error('Error loading Drive/Doc:', err);
      setAuthError(err.message || 'Failed to connect to Google Drive.');
    } finally {
      setIsInitializingDrive(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = await signInWithGoogleOAuth();
      if (result) {
        setGoogleUser(result.user);
        await loadFolderAndDoc();
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      setAuthError(err.message || 'Google Sign-In was cancelled or failed.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await googleSignOut();
    setGoogleUser(null);
    setDriveFolder(null);
    setLogbookDoc(null);
    setSyncSuccess(false);
    setSyncStatus(null);
  };

  // Triggered when user confirms sync action
  const handlePerformSync = async () => {
    setShowConfirmDialog(false);
    setAuthError(null);
    setIsSyncing(true);
    setSyncSuccess(false);

    try {
      const token = await getGoogleAccessToken();
      if (!token) {
        throw new Error('Not authenticated with Google. Please sign in again.');
      }

      setSyncStatus("Verifying 'unimas' folder in Google Drive...");
      const folder = driveFolder || (await findOrCreateDriveFolder(token, 'unimas'));
      setDriveFolder(folder);

      setSyncStatus("Updating 'development statsAI' logbook in Google Docs...");
      const { doc } = await findOrCreateLogbookDoc(token, folder.id, 'development statsAI');
      setLogbookDoc(doc);

      // Build structured payload
      const narrative = currentResult ? generateApaNarrative(currentResult) : null;
      const payload: SyncLogbookPayload = {
        activeDatasetName: currentDataset?.name,
        datasetStats: currentDataset
          ? { rowCount: currentDataset.data.length, colCount: currentDataset.columns.length }
          : undefined,
        activeTestName,
        researchQuestion: activeResearchQuestion?.question || activeResearchQuestion?.title,
        statisticalSummary: narrative ? `${narrative.headline}: ${narrative.shortCitation}` : undefined,
        apaInText: narrative?.narrativeText,
        customNotes: customNote.trim() || undefined,
      };

      await appendLogbookEntry(token, doc.id, payload);

      setSyncSuccess(true);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(timeStr);
      setSyncStatus(`Successfully synced to 'development statsAI' at ${timeStr}`);
      setCustomNote('');

      if (onLogbookSynced && doc.webViewLink) {
        onLogbookSynced(doc.webViewLink);
      }
    } catch (err: any) {
      console.error('Sync failed:', err);
      setAuthError(err.message || 'Failed to sync logbook to Google Docs.');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 border border-blue-400/30 rounded-xl text-blue-300">
              <Cpu className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Gemini NotebookLM & Drive Integration
                </h2>
                <span className="px-2 py-0.5 text-2xs font-bold font-mono bg-blue-400/20 text-blue-200 rounded border border-blue-400/30">
                  Google Workspace
                </span>
              </div>
              <p className="text-xs text-blue-100/80 mt-0.5">
                Log book <span className="font-semibold text-white">'development statsAI'</span> · Drive <span className="font-semibold text-white">'unimas'</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('sync')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'sync'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Drive Logbook Sync</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notebooklm-guide')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'notebooklm-guide'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>NotebookLM Connection Guide</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Error Banner */}
          {authError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">Notice:</span> {authError}
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <>
              {/* Google Workspace Connection Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Google Account Status
                  </span>
                  {googleUser && (
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="text-2xs text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3 h-3" />
                      Sign Out
                    </button>
                  )}
                </div>

                {!googleUser ? (
                  <div className="space-y-3 pt-1">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Connect your Google account with permission to access Google Drive and Google Docs.
                      This allows StatAssist AI to create and maintain the log book <strong className="text-slate-800">'development statsAI'</strong> under your Drive folder <strong className="text-slate-800">'unimas'</strong>.
                    </p>

                    {/* Official GSI Button Style */}
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isAuthenticating}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-2xs hover:bg-slate-50 hover:border-slate-400 text-xs font-semibold text-slate-700 transition-all cursor-pointer disabled:opacity-60"
                    >
                      <svg
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        className="w-4 h-4"
                      >
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        />
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        />
                      </svg>
                      <span>{isAuthenticating ? 'Connecting...' : 'Sign in with Google'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-3">
                      {googleUser.photoURL ? (
                        <img
                          src={googleUser.photoURL}
                          alt="Google Profile"
                          className="w-8 h-8 rounded-full border border-slate-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                          {googleUser.displayName?.charAt(0) || 'G'}
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{googleUser.displayName || 'Authorized Scholar'}</span>
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                        </div>
                        <div className="text-2xs text-slate-500">{googleUser.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-2xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                        Drive & Docs Connected
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Target Location Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Google Drive Folder */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Folder className="w-4 h-4 text-amber-500" />
                      <span>Drive Folder</span>
                    </div>
                    {driveFolder?.webViewLink && (
                      <a
                        href={driveFolder.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="text-xs font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200/80 truncate">
                    unimas
                  </div>
                  <p className="text-2xs text-slate-500 mt-1">
                    {driveFolder
                      ? 'Folder mapped & active in your Drive.'
                      : 'Will be mapped automatically.'}
                  </p>
                </div>

                {/* Google Doc Logbook */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Log Book Document</span>
                    </div>
                    {logbookDoc?.webViewLink && (
                      <a
                        href={logbookDoc.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="text-xs font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200/80 truncate">
                    development statsAI
                  </div>
                  <p className="text-2xs text-slate-500 mt-1">
                    {logbookDoc
                      ? 'Live document mapped under unimas.'
                      : 'Will be generated in unimas.'}
                  </p>
                </div>
              </div>

              {/* What will be synced section */}
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Payload to Append into 'development statsAI'
                  </span>
                  <span className="text-2xs font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    Current Session
                  </span>
                </div>

                <div className="text-xs text-slate-700 space-y-1.5 bg-white p-3 rounded-lg border border-blue-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Dataset:</span>
                    <span className="font-semibold text-slate-800">
                      {currentDataset?.name || 'Academic Sample Data'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Test Protocol:</span>
                    <span className="font-semibold text-slate-800">{activeTestName}</span>
                  </div>
                  {activeResearchQuestion && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Research Question:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[280px]">
                        {activeResearchQuestion.question || activeResearchQuestion.title}
                      </span>
                    </div>
                  )}
                  {currentResult && (
                    <div className="pt-1 border-t border-slate-100 text-2xs text-slate-600 italic">
                      "{generateApaNarrative(currentResult).shortCitation}"
                    </div>
                  )}
                </div>

                {/* Optional Custom Annotation */}
                <div className="pt-1">
                  <label className="block text-2xs font-bold text-slate-700 mb-1">
                    Add Custom Researcher Annotation to Logbook (Optional):
                  </label>
                  <input
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="e.g. Iteration on experimental intervention hypothesis..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                  />
                </div>
              </div>

              {/* Status Indicator */}
              {syncStatus && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    syncSuccess
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-slate-100 border border-slate-200 text-slate-700'
                  }`}
                >
                  {syncSuccess ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <RefreshCw className={`w-3.5 h-3.5 text-blue-600 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
                  )}
                  <span>{syncStatus}</span>
                </div>
              )}

              {/* Sync Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-2xs text-slate-500">
                  {lastSyncTime ? `Last synced: ${lastSyncTime}` : 'Ready to record development log.'}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {logbookDoc?.webViewLink && (
                    <a
                      href={logbookDoc.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>Open Doc</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (!googleUser) {
                        handleGoogleSignIn();
                      } else {
                        // Open explicit confirmation dialog first per skill instructions
                        setShowConfirmDialog(true);
                      }
                    }}
                    disabled={isSyncing || isInitializingDrive}
                    className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>
                      {isSyncing
                        ? 'Writing to Google Docs...'
                        : "Sync to 'development statsAI'"}
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'notebooklm-guide' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-indigo-900 to-blue-950 text-white rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-indigo-300" />
                  Gemini NotebookLM Grounding Architecture
                </div>
                <h3 className="text-sm font-bold text-white">
                  Grounding Notebook 'Statistical Assistant AI' with 'development statsAI'
                </h3>
                <p className="text-xs text-blue-100/90 leading-relaxed">
                  Google Gemini NotebookLM grounds its language model exclusively in your selected sources.
                  By syncing StatAssist AI into your Google Doc <strong className="text-white">'development statsAI'</strong> under folder <strong className="text-white">'unimas'</strong>, NotebookLM becomes your personalized statistical research co-pilot!
                </p>
              </div>

              {/* Step-by-Step Connection Instructions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Follow these 4 simple steps to connect:
                </h4>

                <div className="space-y-2.5">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Launch Google Gemini NotebookLM
                      </div>
                      <p className="text-2xs text-slate-600 mt-0.5">
                        Open your Google NotebookLM workspace (logged in with your Google account).
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Open Notebook: 'Statistical Assistant AI'
                      </div>
                      <p className="text-2xs text-slate-600 mt-0.5">
                        Create or click into your designated notebook named <strong className="text-slate-800">"Statistical Assistant AI"</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Add Source from Google Drive 'unimas'
                      </div>
                      <p className="text-2xs text-slate-600 mt-0.5">
                        Click <span className="font-semibold text-slate-800">+ Add Source</span> &rarr; choose <span className="font-semibold text-slate-800">Google Drive</span> &rarr; select folder <span className="font-semibold text-slate-800">'unimas'</span> &rarr; select document <strong className="text-blue-700">'development statsAI'</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                      4
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Ask NotebookLM to Synthesize or Draft
                      </div>
                      <p className="text-2xs text-slate-600 mt-0.5">
                        NotebookLM will answer questions with citations grounded in your logbook's exact statistical results, APA tables, and development records.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Link to NotebookLM */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <a
                  href="https://notebooklm.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <span>Open Gemini NotebookLM</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* User Explicit Confirmation Dialog for Workspace API Mutating Call (MANDATORY) */}
        {showConfirmDialog && (
          <div className="absolute inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Confirm Google Docs Logbook Update
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Are you sure you want to append this session's development log, statistical results, and APA 7th synthesis to the Google Doc <strong className="text-slate-800">'development statsAI'</strong> under your Drive folder <strong className="text-slate-800">'unimas'</strong>?
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-2xs text-slate-600 space-y-1">
                <div>• Location: Google Drive / unimas / development statsAI</div>
                <div>• Action: Append structured analysis entry</div>
                <div>• Document will remain available as a source in Gemini NotebookLM</div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePerformSync}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Confirm & Sync
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
