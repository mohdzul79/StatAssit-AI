import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { StatAssistLogo } from './StatAssistLogo';
import { UserProfile } from '../types/user';

const HERO_DESCRIPTION =
  "Whether you are conducting your undergraduate research, completing a Master's dissertation or pursuing a PhD, StatAssist AI empowers you to approach quantitative research with greater clarity, confidence and productivity. Spend less time struggling with statistics. Spend more time discovering meaningful insights";

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
  const [typedLength, setTypedLength] = useState(0);
  const [showStartButton, setShowStartButton] = useState(false);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setTypedLength(HERO_DESCRIPTION.length);
      setShowStartButton(true);
      return;
    }

    setTypedLength(0);
    setShowStartButton(false);
    let current = 0;
    let revealTimeoutId: number | undefined;

    const intervalId = window.setInterval(() => {
      current += 1;
      setTypedLength(current);
      if (current >= HERO_DESCRIPTION.length) {
        window.clearInterval(intervalId);
        revealTimeoutId = window.setTimeout(() => {
          setShowStartButton(true);
        }, 3000);
      }
    }, 73);

    return () => {
      window.clearInterval(intervalId);
      if (revealTimeoutId !== undefined) {
        window.clearTimeout(revealTimeoutId);
      }
    };
  }, []);

  const handleNav = (tab: 'data' | 'analysis' | 'apa-report' | 'wizard') => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    onEnterWorkspace(tab);
  };

  const isTyping = typedLength < HERO_DESCRIPTION.length;

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
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-10 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Research Smarter Analyse Better
              </h1>

              {/* Description */}
              <p className="relative text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-3xl mx-auto">
                <span className="invisible select-none" aria-hidden="true">
                  {HERO_DESCRIPTION}
                </span>
                <span className="absolute inset-0">
                  {HERO_DESCRIPTION.slice(0, typedLength)}
                  <span
                    className={`inline-block w-[2px] h-[1.05em] bg-cyan-400 align-[-0.12em] ml-0.5 ${
                      isTyping ? 'animate-pulse' : 'animate-pulse opacity-75'
                    }`}
                    aria-hidden="true"
                  />
                </span>
              </p>

              {/* Instant Workspace Access CTA Buttons */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => handleNav('wizard')}
                  tabIndex={showStartButton ? 0 : -1}
                  aria-hidden={!showStartButton}
                  className={`px-7 py-3.5 rounded-xl text-sm sm:text-base font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-all duration-500 shadow-lg shadow-cyan-500/25 flex items-center gap-2.5 cursor-pointer group ${
                    showStartButton
                      ? 'opacity-100 visible translate-y-0'
                      : 'opacity-0 invisible pointer-events-none translate-y-2'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
