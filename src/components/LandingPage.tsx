import React from 'react';
import {
  ArrowRight,
  Database,
  BarChart3,
  FileText,
  Sliders,
  Sparkles,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { StatAssistLogo } from './StatAssistLogo';
import { DirectLoginCard } from './DirectLoginCard';
import { UserProfile } from '../types/user';

interface LandingPageProps {
  onEnterWorkspace: (tab?: 'data' | 'analysis' | 'apa-report' | 'wizard') => void;
  onLoginSuccess: (user: UserProfile) => void;
  isLoggedIn: boolean;
  currentUser: UserProfile | null;
  onOpenAdminCms?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterWorkspace,
  onLoginSuccess,
  isLoggedIn,
  currentUser,
  onOpenAdminCms,
}) => {

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Ambient Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-cyan-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-emerald-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Main Content Container */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* SECTION 1: Brand Banner & Direct Login Hero */}
        <section className="space-y-8">
          {/* Animated Main Logo Banner */}
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <StatAssistLogo variant="full-banner" animated={true} />
          </div>

          {/* Direct Login and Architecture Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
            {/* Left 7 cols: Platform Pillars & Highlights */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Deterministic Statistical Inference Engine</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  Zero-Hallucination Statistical Computing with Automated APA 7th Manuscript Synthesis
                </h2>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  StatAssist AI separates exact mathematical logic from natural language generation. Numerical results
                  (degrees of freedom, test statistics, exact p-values, effect sizes) are calculated via a deterministic
                  engine, guaranteeing verifiable results for faculty, graduate scholars, and research institutions.
                </p>
              </div>

              {/* 3 Core Architecture Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-mono font-bold">
                    <Cpu className="w-4 h-4 shrink-0" />
                    <span>FSM Logic Router</span>
                  </div>
                  <p className="text-2xs text-slate-300">
                    Finite-state machine that validates scale types and assumptions before executing tests.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-bold">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Zero-Retention RAM</span>
                  </div>
                  <p className="text-2xs text-slate-300">
                    Your research dataset stays strictly in browser memory. No cloud harvesting or training leakage.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono font-bold">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>APA 7th Output</span>
                  </div>
                  <p className="text-2xs text-slate-300">
                    Automated, publication-grade academic prose, formal hypothesis decisions, and formatted tables.
                  </p>
                </div>
              </div>

              {/* Workspace Action Row */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onEnterWorkspace('wizard')}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2 cursor-pointer group"
                >
                  <span>Enter Statistical Workspace (Selecting Test)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                {isLoggedIn && currentUser && (
                  <span className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Signed in as <strong className="text-cyan-300">{currentUser.email}</strong></span>
                  </span>
                )}
              </div>
            </div>

            {/* Right 5 cols: Direct Email / Social Login Box (Reduced size 50%) */}
            <div className="lg:col-span-5 flex flex-col justify-center items-center">
              <DirectLoginCard
                onLoginSuccess={onLoginSuccess}
              />
            </div>
          </div>
        </section>

        {/* SECTION 2: 4-Stage Statistical Workflow - Landing page concludes after these 4 buttons */}
        <section className="space-y-6 pt-4">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-400">
              Methodological Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              From Diagnostic Test Selection to APA 7th Manuscript
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
              StatAssist guides researchers through three empirical stages: Select Test → Inspect Pre-set Dataset → Run Test Analysis & Manuscript Synthesis.
            </p>
          </div>

          {/* 3-Stage Statistical Workflow Figure */}
          <figure className="max-w-3xl mx-auto">
            <figcaption className="sr-only">Three Empirical Stages of StatAssist AI</figcaption>
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 bg-slate-900/80 p-2.5 sm:p-3 rounded-2xl border border-slate-800 shadow-xl">
              {/* Stage 1: Selecting Test */}
              <button
                type="button"
                onClick={() => onEnterWorkspace('wizard')}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-950/70 text-slate-200 hover:text-white hover:border-purple-400 border border-slate-700/80 flex items-center gap-2 shadow-2xs transition-all cursor-pointer group"
                title="Enter Stage 1: Selecting Test"
              >
                <Sliders className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <span>1. Selecting Test</span>
              </button>

              {/* Stage 2: Dataset */}
              <button
                type="button"
                onClick={() => onEnterWorkspace('data')}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-950/70 text-slate-200 hover:text-white hover:border-cyan-400 border border-slate-700/80 flex items-center gap-2 shadow-2xs transition-all cursor-pointer group"
                title="Enter Stage 2: Dataset"
              >
                <Database className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>2. Dataset</span>
              </button>

              {/* Stage 3: Test Analysis */}
              <button
                type="button"
                onClick={() => onEnterWorkspace('analysis')}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-950/70 text-slate-200 hover:text-white hover:border-emerald-400 border border-slate-700/80 flex items-center gap-2 shadow-2xs transition-all cursor-pointer group"
                title="Enter Stage 3: Test Analysis & Synthesis"
              >
                <BarChart3 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>3. Test Analysis & Synthesis</span>
              </button>
            </div>
          </figure>
          {/* Note: In accordance with user requirements, no further information or preview panels are shown after these 4 buttons. */}
        </section>
      </main>
    </div>
  );
};
