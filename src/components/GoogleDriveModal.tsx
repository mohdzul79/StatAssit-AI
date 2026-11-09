import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  FileSpreadsheet,
  FileText,
  Upload,
  Download,
  Search,
  ExternalLink,
  Trash2,
  RefreshCw,
  Folder,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  LogOut,
  FolderPlus,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  initGoogleAuth,
  signInWithGoogleOAuth,
  getGoogleAccessToken,
  googleSignOut,
} from '../services/googleAuth';
import {
  listGoogleDriveFiles,
  uploadFileToGoogleDrive,
  fetchGoogleDriveFileContent,
  deleteGoogleDriveFile,
  findOrCreateDriveFolder,
  DriveFileItem,
} from '../services/googleDriveDocs';
import { Dataset, StatisticalResult, ResearchQuestion } from '../types/stats';
import { generateApaNarrative } from '../utils/apaFormatter';
import { parseCsv } from '../data/sampleDatasets';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDataset?: Dataset;
  currentResult?: StatisticalResult | null;
  activeResearchQuestion?: ResearchQuestion | null;
  activeTestName?: string;
  onImportDataset?: (dataset: Dataset) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  currentDataset,
  currentResult,
  activeResearchQuestion,
  activeTestName = 'Statistical Analysis',
  onImportDataset,
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'export-dataset' | 'export-report'>('browse');
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Drive file browser state
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>(undefined);

  // Export dataset state
  const [exportFilename, setExportFilename] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Export report state
  const [reportDocTitle, setReportDocTitle] = useState('');

  // Mandatory confirmation dialog state for mutating operations (deleting or creating files)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  } | null>(null);

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

  // Set default export filenames
  useEffect(() => {
    if (isOpen) {
      const sanitizedName = (currentDataset?.name || 'Dataset').replace(/[^a-zA-Z0-9_-]/g, '_');
      setExportFilename(`${sanitizedName}_StatAssistAI.csv`);

      const studyTitle = currentDataset?.name || 'Study';
      setReportDocTitle(`[StatAssist AI] APA 7th Report - ${studyTitle} (${activeTestName})`);
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  }, [isOpen, currentDataset, activeTestName]);

  // Load files when token is ready
  useEffect(() => {
    if (accessToken && isOpen) {
      loadFiles(accessToken);
    }
  }, [accessToken, isOpen]);

  const loadFiles = async (token: string, query?: string) => {
    try {
      setIsLoadingFiles(true);
      const res = await listGoogleDriveFiles(token, 25, query, selectedFolder);
      setFiles(res);
    } catch (err: any) {
      console.error('Error listing Google Drive files:', err);
      setErrorMessage(err.message || 'Failed to list Google Drive files.');
    } finally {
      setIsLoadingFiles(false);
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
        loadFiles(res.accessToken);
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
    setFiles([]);
  };

  // Convert current dataset to CSV
  const generateCurrentDatasetCsv = (): string => {
    if (!currentDataset || !currentDataset.columns || currentDataset.columns.length === 0) {
      return '';
    }
    const headers = currentDataset.columns.map((c) => c.name);
    const rows = currentDataset.data.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          if (val === null || val === undefined) return '';
          const str = String(val);
          return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  };

  // Request user confirmation before exporting dataset
  const initiateExportDataset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exportFilename.trim()) {
      setErrorMessage('Please enter a valid filename for the dataset.');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Dataset Export to Google Drive',
      description: `Are you sure you want to upload "${exportFilename.trim()}" (${currentDataset?.data.length || 0} rows, ${currentDataset?.columns.length || 0} columns) into your authorized Google Drive?`,
      actionLabel: 'Upload Dataset',
      onConfirm: executeExportDataset,
      isDestructive: false,
    });
  };

  const executeExportDataset = async () => {
    setConfirmDialog(null);
    if (!accessToken) return;

    setIsUploading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const csvContent = generateCurrentDatasetCsv();
      const uploaded = await uploadFileToGoogleDrive(
        accessToken,
        exportFilename.trim(),
        csvContent,
        'text/csv'
      );
      setSuccessMessage(`Dataset successfully exported to Google Drive as "${uploaded.name}"!`);
      loadFiles(accessToken);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to export dataset to Google Drive.');
    } finally {
      setIsUploading(false);
    }
  };

  // Request user confirmation before exporting APA 7th report
  const initiateExportReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDocTitle.trim()) {
      setErrorMessage('Please enter a document title.');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Confirm APA 7th Report Export to Google Drive',
      description: `Upload statistical findings and APA 7th manuscript narrative as "${reportDocTitle.trim()}.md" into Google Drive?`,
      actionLabel: 'Export Report',
      onConfirm: executeExportReport,
      isDestructive: false,
    });
  };

  const executeExportReport = async () => {
    setConfirmDialog(null);
    if (!accessToken) return;

    setIsUploading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      let reportContent = `# ${reportDocTitle.trim()}\n\n`;
      reportContent += `**Dataset**: ${currentDataset?.name || 'Empirical Study'}\n`;
      reportContent += `**Statistical Test**: ${activeTestName}\n`;
      reportContent += `**Generated**: ${new Date().toLocaleString()}\n\n`;

      if (activeResearchQuestion) {
        reportContent += `## Research Question\n> ${activeResearchQuestion.question}\n\n`;
        reportContent += `**Null Hypothesis (H₀)**: ${activeResearchQuestion.hypothesisNull || 'N/A'}\n`;
        reportContent += `**Alternative Hypothesis (H₁)**: ${activeResearchQuestion.hypothesisAlt || 'N/A'}\n\n`;
      }

      if (currentResult) {
        const narrative = generateApaNarrative(currentResult);
        reportContent += `## APA 7th Edition Statistical Narrative\n${narrative.narrativeText}\n\n`;
        reportContent += `### Citation\n\`${narrative.shortCitation}\`\n\n`;
        const decision = (currentResult as any).nullHypothesisDecision || (currentResult as any).conclusion || 'Completed';
        reportContent += `### Scholarly Decision\n${decision}\n\n`;
      }

      reportContent += `---\n*Exported securely via StatAssist AI with Google Drive Workspace API.*`;

      const uploaded = await uploadFileToGoogleDrive(
        accessToken,
        `${reportDocTitle.trim()}.md`,
        reportContent,
        'text/markdown'
      );

      setSuccessMessage(`Report document created in Google Drive as "${uploaded.name}"!`);
      loadFiles(accessToken);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to export report to Google Drive.');
    } finally {
      setIsUploading(false);
    }
  };

  // Initiate file deletion with explicit confirmation (MANDATORY rule for destructive operations)
  const initiateDeleteFile = (file: DriveFileItem) => {
    setConfirmDialog({
      isOpen: true,
      title: `Permanently Delete "${file.name}"?`,
      description: `Are you sure you want to delete this file from Google Drive? This action cannot be undone.`,
      actionLabel: 'Delete File',
      isDestructive: true,
      onConfirm: async () => {
        setConfirmDialog(null);
        if (!accessToken) return;
        try {
          await deleteGoogleDriveFile(accessToken, file.id);
          setSuccessMessage(`File "${file.name}" was deleted from Google Drive.`);
          loadFiles(accessToken);
        } catch (err: any) {
          setErrorMessage(err.message || 'Failed to delete file from Google Drive.');
        }
      },
    });
  };

  // Import CSV dataset into StatAssist AI
  const handleImportCsvFile = async (file: DriveFileItem) => {
    if (!accessToken || !onImportDataset) return;

    try {
      setIsLoadingFiles(true);
      const rawText = await fetchGoogleDriveFileContent(accessToken, file.id);
      const newDataset = parseCsv(rawText, file.name.replace(/\.[^/.]+$/, ''));
      newDataset.id = `gdrive-${Date.now()}`;
      newDataset.description = `Imported from Google Drive (${file.name})`;

      onImportDataset(newDataset);
      setSuccessMessage(`Dataset "${file.name}" imported into StatAssist AI workspace!`);
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse and import dataset from Google Drive.');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isUploading) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] space-y-4">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-2xs">
              <HardDrive className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Google Drive Workspace Integration
                </h3>
                <span className="text-[11px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-bold">
                  Drive API v3
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Browse files, export research datasets as CSV, and save APA 7th manuscripts directly to your Google Drive.
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
              <HardDrive className="w-6 h-6 text-blue-600" />
            </div>
            <div className="max-w-md mx-auto">
              <h4 className="text-sm font-bold text-slate-900">
                Connect your Google Drive Account
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Authorize StatAssist AI with permission to store research datasets and manage empirical manuscript files in your Google Drive.
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
              <span>{isAuthenticating ? 'Connecting Drive...' : 'Sign in with Google'}</span>
            </button>
            <p className="text-[11px] text-slate-400">
              Ephemeral in-memory authorization. Security token is kept strictly in RAM.
            </p>
          </div>
        ) : (
          <>
            {/* User Session Bar & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  {googleUser.displayName ? googleUser.displayName.charAt(0) : 'D'}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{googleUser.displayName || 'Authorized Scholar'}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-medium">
                      Google Drive Active
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {googleUser.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab('browse')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                      activeTab === 'browse'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>Drive Files</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('export-dataset')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                      activeTab === 'export-dataset'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Export Dataset</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('export-report')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                      activeTab === 'export-report'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Export APA Report</span>
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
            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 shrink-0 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{successMessage}</span>
              </div>
            )}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 shrink-0 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Tab 1: Browse & Manage Drive Files */}
            {activeTab === 'browse' && (
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
                          loadFiles(accessToken, searchQuery);
                        }
                      }}
                      placeholder="Search Drive files by name (press Enter)..."
                      className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (accessToken) loadFiles(accessToken, searchQuery);
                    }}
                    disabled={isLoadingFiles}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer shrink-0"
                    title="Refresh Drive files"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {isLoadingFiles ? (
                  <div className="p-8 text-center space-y-2">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">Fetching files from Google Drive API...</p>
                  </div>
                ) : files.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
                    <HardDrive className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-600 font-medium">No files found matching query in Google Drive.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {files.map((file) => {
                      const isCsv = file.name.endsWith('.csv') || file.mimeType.includes('csv');
                      const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                      const isDoc = file.mimeType.includes('document') || file.name.endsWith('.md');

                      return (
                        <div
                          key={file.id}
                          className="p-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                              {isFolder ? (
                                <Folder className="w-4 h-4 text-amber-500" />
                              ) : isCsv ? (
                                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                              ) : isDoc ? (
                                <FileText className="w-4 h-4 text-blue-600" />
                              ) : (
                                <HardDrive className="w-4 h-4 text-slate-500" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate">
                                {file.name}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                                <span>{file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : ''}</span>
                                {file.size && <span>• {(Number(file.size) / 1024).toFixed(1)} KB</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isCsv && onImportDataset && (
                              <button
                                type="button"
                                onClick={() => handleImportCsvFile(file)}
                                className="px-2.5 py-1 text-2xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                                title="Import this CSV dataset into StatAssist AI"
                              >
                                <Download className="w-3 h-3" />
                                <span>Import Dataset</span>
                              </button>
                            )}

                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Open in Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() => initiateDeleteFile(file)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete file from Google Drive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Export Dataset to Google Drive */}
            {activeTab === 'export-dataset' && (
              <form onSubmit={initiateExportDataset} className="space-y-4 overflow-y-auto flex-1 pr-1">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-900">
                      Active Workspace Dataset Summary
                    </h4>
                  </div>
                  <div className="text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono">
                    <div>Dataset: <strong>{currentDataset?.name}</strong></div>
                    <div>Observations: <strong>{currentDataset?.data.length || 0} rows</strong></div>
                    <div>Variables: <strong>{currentDataset?.columns.length || 0} cols</strong></div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target File Name on Google Drive (.csv)
                  </label>
                  <input
                    type="text"
                    value={exportFilename}
                    onChange={(e) => setExportFilename(e.target.value)}
                    required
                    placeholder="e.g. mindfulness_study_data.csv"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-slate-900"
                  />
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p>
                    Dataset records will be structured as standard RFC 4180 comma-separated values (CSV) and saved directly in your Google Drive root or designated project folder.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('browse')}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Uploading to Drive...' : 'Upload Dataset to Drive'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Tab 3: Export APA 7th Report */}
            {activeTab === 'export-report' && (
              <form onSubmit={initiateExportReport} className="space-y-4 overflow-y-auto flex-1 pr-1">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-slate-900">
                      Active APA 7th Report Contents
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    Includes test statistics, degrees of freedom, exact p-values, effect sizes, research question hypotheses decisions, and peer-review ready narrative prose.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Document Title on Google Drive (.md)
                  </label>
                  <input
                    type="text"
                    value={reportDocTitle}
                    onChange={(e) => setReportDocTitle(e.target.value)}
                    required
                    placeholder="Document title"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('browse')}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Exporting...' : 'Export Report to Drive'}</span>
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* Confirmation Modal for Mutating Operations (MANDATORY per Workspace guidelines) */}
        {confirmDialog && confirmDialog.isOpen && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    confirmDialog.isDestructive
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {confirmDialog.isDestructive ? (
                    <Trash2 className="w-5 h-5 text-rose-600" />
                  ) : (
                    <HardDrive className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {confirmDialog.title}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Google Workspace explicit confirmation
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {confirmDialog.description}
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDialog.onConfirm}
                  className={`px-4 py-1.5 text-xs font-semibold text-white rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                    confirmDialog.isDestructive
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                  }`}
                >
                  <span>{confirmDialog.actionLabel}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
