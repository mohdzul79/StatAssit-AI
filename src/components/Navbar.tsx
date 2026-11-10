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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16">
          {/* Navigation links - 100% Open Access for all users */}
          <nav className="flex items-center gap-1.5 sm:gap-2 text-sm font-medium text-slate-600 overflow-x-auto py-1">
            {/* Front Page Link */}
            <button
              type="button"
              onClick={() => handleNav('landing')}
              title="Return to Main Front Page"
              className={`py-2 px-3 sm:px-3.5 rounded-lg transition-all font-semibold text-xs sm:text-sm whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'landing'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-cyan-600" />
              <span>Home</span>
            </button>

            {/* Tab 1: Selecting Test (Priority 1) */}
            <button
              type="button"
              onClick={() => handleNav('wizard')}
              title="Step 1: Selecting Test — Empirical diagnostic decision tree & test matrix"
              className={`py-2 px-3 sm:px-3.5 rounded-lg transition-all font-semibold text-xs sm:text-sm whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'wizard'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              <span>1. Selecting Test</span>
            </button>

            {/* Tab 2: Dataset (Priority 2) */}
            <button
              type="button"
              onClick={() => handleNav('data')}
              className={`py-2 px-3 sm:px-3.5 rounded-lg transition-all cursor-pointer font-semibold text-xs sm:text-sm whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'data'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Step 2: Dataset — Management, variable dictionary & pre-set study data"
            >
              <Database className="w-3.5 h-3.5 text-cyan-600" />
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
              className={`py-2 px-3 sm:px-3.5 rounded-lg transition-all font-semibold text-xs sm:text-sm whitespace-nowrap flex items-center gap-1.5 ${
                !isDatasetComplete
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 cursor-pointer'
                  : activeTab === 'analysis'
                  ? 'bg-slate-900 text-white shadow-2xs cursor-pointer'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              {!isDatasetComplete ? (
                <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded font-mono font-bold">
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
