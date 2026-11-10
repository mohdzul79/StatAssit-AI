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
  CheckCircle2,
} from 'lucide-react';
import { StatAssistLogo } from './StatAssistLogo';
import { UserProfile } from '../types/user';

interface LandingPageProps {
  onEnterWorkspace: (tab?: 'data' | 'analysis' | 'apa-report' | 'wizard') => void;
  onLoginSuccess?: (user: UserProfile) => void;
  isLoggedIn?: boolean;
  currentUser?: UserProfile | null;
  onOpenAdminCms?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterWorkspace,
}) => {
  const handleNav = (tab: 'data' | 'analysis' | 'apa-report' | 'wizard') => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    onEnterWorkspace(tab);
  };

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
        {/* SECTION 1: Brand Banner & Universal Open Access Hero */}
        <section className="space-y-8">
          {/* Animated Main Logo Banner */}
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <StatAssistLogo variant="full-banner" animated={true} />
          </div>

          {/* Full-Width Open Access Hero Showcase */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-4xl mx-auto text-center space-y-6">
              {/* Main Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Zero-Hallucination Statistical Computing with Automated APA 7th Manuscript Synthesis
              </h1>

              {/* Description */}
              <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-3xl mx-auto">
                StatAssist AI separates exact mathematical logic from natural language generation. Numerical results
                (degrees of freedom, test statistics, exact p-values, effect sizes) are calculated via a deterministic
                engine, guaranteeing verifiable results for faculty, graduate scholars, and research institutions worldwide.
              </p>

              {/* 3 Core Architecture Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
                <div className="p-4 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 text-sm font-mono font-bold">
                    <Cpu className="w-4 h-4 shrink-0" />
                    <span>FSM Logic Router</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Finite-state machine that validates scale types and assumptions before executing tests.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-mono font-bold">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Zero-Retention RAM</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Your research dataset stays strictly in browser memory. No cloud harvesting or training leakage.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 text-sm font-mono font-bold">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>APA 7th Output</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Automated, publication-grade academic prose, formal hypothesis decisions, and formatted tables.
                  </p>
                </div>
              </div>

              {/* Instant Workspace Access CTA Buttons */}
              <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => handleNav('wizard')}
                  className="px-6 py-3.5 rounded-xl text-sm sm:text-base font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 transition-all shadow-[0_0_30px_rgba(6,182,212,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.65)] flex items-center gap-2.5 cursor-pointer group"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Start Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  20+ Statistical Test Matrix
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Deterministic Pure-Math Calculations
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  APA 7th Publication Ready
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: 3-Stage Statistical Workflow */}
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
                onClick={() => handleNav('wizard')}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-950/70 text-slate-200 hover:text-white hover:border-purple-400 border border-slate-700/80 flex items-center gap-2 shadow-2xs transition-all cursor-pointer group"
                title="Enter Stage 1: Selecting Test"
              >
                <Sliders className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <span>1. Selecting Test</span>
              </button>

              {/* Stage 2: Dataset */}
              <button
                type="button"
                onClick={() => handleNav('data')}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-950/70 text-slate-200 hover:text-white hover:border-cyan-400 border border-slate-700/80 flex items-center gap-2 shadow-2xs transition-all cursor-pointer group"
                title="Enter Stage 2: Dataset"
              >
                <Database className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>2. Dataset</span>
              </button>

              {/* Stage 3: Test Analysis */}
              <button
                type="button"
                onClick={() => handleNav('analysis')}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-950/70 text-slate-200 hover:text-white hover:border-emerald-400 border border-slate-700/80 flex items-center gap-2 shadow-2xs transition-all cursor-pointer group"
                title="Enter Stage 3: Test Analysis & Synthesis"
              >
                <BarChart3 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>3. Test Analysis & Synthesis</span>
              </button>
            </div>
          </figure>
        </section>
      </main>
    </div>
  );
};
