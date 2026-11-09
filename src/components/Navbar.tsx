import { BarChart3, MessageSquarePlus, LogIn, User, Sparkles, Lock, ShieldCheck, Shield, Home, ClipboardCheck, CheckSquare } from 'lucide-react';
import { UserProfile, MOHDZUL_ADMIN_PROFILE } from '../types/user';
import { StatAssistLogo } from './StatAssistLogo';

interface NavbarProps {
  activeTab: 'landing' | 'data' | 'analysis' | 'apa-report' | 'wizard';
  setActiveTab: (tab: 'landing' | 'data' | 'analysis' | 'apa-report' | 'wizard') => void;
  onOpenApaGuide?: () => void;
  onOpenUserGuide?: () => void;
  onOpenFeedback?: () => void;
  onOpenAdminCms?: () => void;
  onOpenUsabilityTest?: () => void;
  onOpenPublishChecklist?: () => void;
  onOpenGmail?: () => void;
  onOpenGoogleDrive?: () => void;
  onRunTest: () => void;
  hasData: boolean;
  isDatasetComplete?: boolean;
  currentUser?: UserProfile | null;
  isLoggedIn?: boolean;
  onOpenLogin: () => void;
  onDirectLogin?: (user: UserProfile) => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenFeedback,
  onOpenAdminCms,
  onOpenUsabilityTest,
  onOpenPublishChecklist,
  onOpenGmail,
  onOpenGoogleDrive,
  onRunTest,
  hasData,
  isDatasetComplete = true,
  currentUser,
  isLoggedIn = false,
  onOpenLogin,
  onDirectLogin,
  onOpenProfile,
}) => {
  // Header only appears after user logs in successfully; Landing page already provides direct sign-in
  if (!isLoggedIn) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 md:gap-8 h-16">
          {/* Zone 1: Brand Area - Link to Front / Landing Page */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('landing')}
              className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
              title="Return to Main Front Page"
            >
              <StatAssistLogo variant="horizontal-sm" animated={false} />
            </button>
          </div>

          {/* Zone 2: Navigation links - appear after user successfully logs in */}
          {isLoggedIn && (
            <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 text-sm font-medium text-slate-600">
              {/* Front Page Link */}
              <button
                type="button"
                onClick={() => setActiveTab('landing')}
                title="Return to Main Front Page"
                className={`py-2 px-3 rounded-lg transition-all font-semibold text-xs lg:text-sm whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'landing'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Home className="w-3.5 h-3.5 text-cyan-600" />
                <span>Front Page</span>
              </button>

              {/* Tab 1: Selecting Test (Priority 1) */}
              <button
                type="button"
                onClick={() => setActiveTab('wizard')}
                title="Step 1: Selecting Test — Empirical diagnostic decision tree & test matrix"
                className={`py-2 px-3.5 rounded-lg transition-all font-semibold text-xs lg:text-sm whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'wizard'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>Selecting Test</span>
              </button>

              {/* Tab 2: Dataset (Priority 2) */}
              <button
                type="button"
                onClick={() => setActiveTab('data')}
                className={`py-2 px-3 rounded-lg transition-all cursor-pointer font-semibold text-xs lg:text-sm whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'data'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Step 2: Dataset — Management, variable dictionary & pre-set study data"
              >
                <span>Dataset</span>
              </button>

              {/* Tab 3: Test Analysis */}
              <button
                type="button"
                onClick={() => {
                  if (!isDatasetComplete) {
                    setActiveTab('data');
                    return;
                  }
                  setActiveTab('analysis');
                }}
                title={
                  isDatasetComplete
                    ? 'Step 3: Test Analysis — Statistical execution and model reporting'
                    : 'Sign of Error: Data incomplete for selected test design. Click to inspect & fill up data in Step 2.'
                }
                className={`py-2 px-3.5 rounded-lg transition-all font-semibold text-xs lg:text-sm whitespace-nowrap flex items-center gap-1.5 ${
                  !isDatasetComplete
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 cursor-pointer'
                    : activeTab === 'analysis'
                    ? 'bg-slate-900 text-white shadow-2xs cursor-pointer'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer'
                }`}
              >
                {!isDatasetComplete ? (
                  <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded font-mono font-bold">
                    Error: Fill Data
                  </span>
                ) : null}
                <span>Test Analysis</span>
              </button>
            </nav>
          )}

          {/* Zone 3: Usability Test, Feedback & User Profile / Login */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

            {isLoggedIn && (
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSdJHIJZhAgVpBKYDAQIzwEaG18xrfk_fSKg05RBZHzzzXSGhA/viewform?usp=publish-editor"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer group"
                title="Open StatAssist AI Usability Evaluation Google Form"
              >
                <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>Usability</span>
              </a>
            )}

            {isLoggedIn && onOpenFeedback && (
              <button
                type="button"
                onClick={onOpenFeedback}
                className="px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-700 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Feedback & Support Center"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-blue-600" />
                <span>Feedback</span>
              </button>
            )}

            {/* User Profile Button */}
            {currentUser && (
              <button
                type="button"
                onClick={onOpenProfile}
                className="px-2 sm:px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 transition-all flex items-center gap-2 shadow-2xs cursor-pointer group"
                title="Scholar Profile & Academic Settings"
              >
                <div
                  className={`w-6 h-6 rounded-md bg-gradient-to-tr ${
                    currentUser.avatarColor || 'from-blue-600 to-indigo-700'
                  } text-white font-bold text-2xs flex items-center justify-center shrink-0 shadow-2xs`}
                >
                  {currentUser.avatarInitials}
                </div>
                <div className="hidden lg:flex flex-col text-left leading-none">
                  <span className="font-semibold text-slate-900 text-xs truncate max-w-[105px] group-hover:text-blue-700">
                    {currentUser.name}
                  </span>
                  <span className="text-2xs text-slate-600 truncate max-w-[105px]">
                    {currentUser.title ? currentUser.title.split(' ')[0] : 'Scholar'}
                  </span>
                </div>
                {/* Academic Access Badge */}
                <span
                  className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                  title="Universal Academic Access"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Open Access</span>
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row - appears after user successfully logs in */}
        {isLoggedIn && (
          <div className="flex md:hidden items-center justify-between gap-2 overflow-x-auto pb-2.5 text-xs font-medium text-slate-600 border-t border-slate-100 pt-2">
            <div className="flex items-center gap-1.5">
              {/* Tab 1: Selecting Test */}
              <button
                onClick={() => setActiveTab('wizard')}
                className={`whitespace-nowrap px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 font-medium ${
                  activeTab === 'wizard'
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'hover:text-slate-900 bg-white border border-slate-200'
                }`}
              >
                <span>Selecting Test</span>
              </button>

              {/* Tab 2: Dataset */}
              <button
                onClick={() => setActiveTab('data')}
                className={`whitespace-nowrap px-3 py-1.5 rounded-md transition-colors font-medium flex items-center gap-1 ${
                  activeTab === 'data' ? 'bg-slate-900 text-white font-semibold shadow-2xs' : 'hover:text-slate-900 bg-white border border-slate-200'
                }`}
              >
                <span>Dataset</span>
              </button>

              {/* Tab 3: Test Analysis */}
              <button
                onClick={() => {
                  if (!isDatasetComplete) return;
                  setActiveTab('analysis');
                }}
                className={`whitespace-nowrap px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 font-medium ${
                  !isDatasetComplete
                    ? 'opacity-40 text-slate-400 cursor-not-allowed bg-slate-100'
                    : activeTab === 'analysis'
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'hover:text-slate-900 bg-white border border-slate-200'
                }`}
              >
                {!isDatasetComplete && <Lock className="w-2.5 h-2.5" />}
                <span>Test Analysis</span>
              </button>
            </div>

            {/* Mobile Profile */}
            <div className="flex items-center gap-1.5 shrink-0">
              {currentUser && (
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="text-2xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200 flex items-center gap-1 shrink-0"
                >
                  <User className="w-3 h-3" />
                  <span>{currentUser.avatarInitials}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
