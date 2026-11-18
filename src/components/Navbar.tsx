import React from 'react';
import { Home, Sliders, Database, BarChart3, Lock } from 'lucide-react';
import { UserProfile } from '../types/user';

interface NavbarProps {
  activeTab: 'landing' | 'data' | 'analysis' | 'apa-report' | 'wizard';
  setActiveTab: (tab: 'landing' | 'data' | 'analysis' | 'apa-report' | 'wizard') => void;
  onOpenApaGuide?: () => void;
  onOpenUserGuide?: () => void;
  onOpenPublishChecklist?: () => void;
  onOpenGmail?: () => void;
  onOpenGoogleDrive?: () => void;
  onRunTest?: () => void;
  hasData?: boolean;
  isDatasetComplete?: boolean;
  currentUser?: UserProfile | null;
  isLoggedIn?: boolean;
  onOpenLogin?: () => void;
  onDirectLogin?: (user: UserProfile) => void;
  onOpenProfile?: () => void;
  onOpenFeedback?: () => void;
  onOpenAdminCms?: () => void;
  onOpenUsabilityTest?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDatasetComplete = true,
}) => {
  const handleNav = (tab: 'landing' | 'data' | 'analysis' | 'apa-report' | 'wizard') => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setActiveTab(tab);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16">
          {/* Navigation links - 100% Open Access for all users */}
          <nav className="flex items-center gap-1.5 sm:gap-2 text-sm font-medium text-slate-600 overflow-x-auto py-1">
            {/* Front Page Link */}
            <button
              type="button"
              onClick={() => handleNav('landing')}
              title="Return to Main Front Page"
              className={`py-2 px-3 sm:px-4 rounded-xl transition-all font-semibold text-xs sm:text-sm whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'landing'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                  : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-blue-600" />
              <span>Home</span>
            </button>

            {/* Tab 1: Selecting Test (Priority 1) */}
            <button
              type="button"
              onClick={() => handleNav('wizard')}
              title="Step 1: Selecting Test — Empirical diagnostic decision tree & test matrix"
              className={`py-2 px-3 sm:px-4 rounded-xl transition-all font-semibold text-xs sm:text-sm whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'wizard'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                  : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>1. Selecting Test</span>
            </button>

            {/* Tab 2: Dataset (Priority 2) */}
            <button
              type="button"
              onClick={() => handleNav('data')}
              className={`py-2 px-3 sm:px-4 rounded-xl transition-all cursor-pointer font-semibold text-xs sm:text-sm whitespace-nowrap shrink-0 flex items-center gap-1.5 border ${
                activeTab === 'data'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                  : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Step 2: Dataset — Management, variable dictionary & pre-set study data"
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>2. Dataset</span>
            </button>

            {/* Tab 3: Test Analysis */}
            <button
              type="button"
              onClick={() => {
                if (!isDatasetComplete) {
                  handleNav('data');
                  return;
                }
                handleNav('analysis');
              }}
              title={
                isDatasetComplete
                  ? 'Step 3: Test Analysis — Statistical execution and model reporting'
                  : 'Sign of Error: Data incomplete for selected test design. Click to inspect & fill up data in Step 2.'
              }
              className={`py-2 px-3 sm:px-4 rounded-xl transition-all font-semibold text-xs sm:text-sm whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                !isDatasetComplete
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-300 shadow-2xs'
                  : activeTab === 'analysis'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                  : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              {!isDatasetComplete ? (
                <span className="text-[10px] bg-rose-200/80 text-rose-800 px-1.5 py-0.5 rounded font-mono font-bold">
                  Error: Fill Data
                </span>
              ) : null}
              <span>3. Test Analysis</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
