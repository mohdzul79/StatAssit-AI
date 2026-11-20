import React, { useState } from 'react';
import {
  X,
  BookOpen,
  ArrowRight,
  Sparkles,
  Network,
  GraduationCap,
} from 'lucide-react';
import { StatisticalTestType } from '../types/stats';
import { DissertationGuideView } from './DissertationGuideView';
import { StatisticalFlowchartCanvas } from './StatisticalFlowchartCanvas';

interface LearningCentreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchTutorialTest?: (testType: StatisticalTestType) => void;
  onOpenApaGuide?: () => void;
}

interface TutorialSection {
  heading: string;
  body: string;
  bullets?: string[];
  formula?: string;
}

interface TutorialModule {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  readTime: string;
  level: 'Foundational' | 'Intermediate' | 'Advanced';
  icon: React.ComponentType<{ className?: string }>;
  summary: string;
  keyTakeaways: string[];
  sections: TutorialSection[];
  recommendedTest?: StatisticalTestType;
  recommendedTestLabel?: string;
}

const TUTORIAL_MODULES: TutorialModule[] = [
  {
    id: 'decision-tree',
    category: 'Mind Map',
    title: 'Interactive Statistical Mind Map',
    subtitle: 'Notebook-style expandable mind map from research goal and variables to the exact test.',
    readTime: 'Interactive',
    level: 'Foundational',
    icon: Network,
    summary:
      'Explore your statistical decision path like an interactive mind map—click nodes or branch toggles to unfold or collapse pathways, drag to pan, zoom in/out, and launch any test directly.',
    keyTakeaways: [],
    sections: [],
  },
  {
    id: 'dissertations',
    category: 'Dissertations',
    title: 'Dissertations',
    subtitle:
      'Complete interactive StatAssist AI guide covering dissertation essentials, research questions, literature review, research strategy, sampling, ethics, and writing up.',
    readTime: 'Interactive',
    level: 'Foundational',
    icon: GraduationCap,
    summary:
      'Interactive StatAssist AI Dissertations workspace featuring all 7 core dissertation stages, interactive builders, sampling & sample size calculators, ethics audit, and mastery quiz.',
    keyTakeaways: [],
    sections: [],
  },
];

export const LearningCentreModal: React.FC<LearningCentreModalProps> = ({
  isOpen,
  onClose,
  onLaunchTutorialTest,
  onOpenApaGuide,
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>(TUTORIAL_MODULES[0].id);

  const activeModule =
    TUTORIAL_MODULES.find((m) => m.id === selectedModuleId) || TUTORIAL_MODULES[0];

  if (!isOpen) return null;

  const isMindMapActive = activeModule.id === 'decision-tree';
  const isDissertationsActive = activeModule.id === 'dissertations';
  const isFullWorkspaceActive = isMindMapActive || isDissertationsActive;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl w-full flex flex-col overflow-hidden shadow-2xl border border-slate-200 transition-all duration-200 ${
          isFullWorkspaceActive ? 'max-w-[97vw] h-[94vh]' : 'max-w-5xl max-h-[90vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
              Learning Centre
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close Learning Centre"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Layout */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navigation Bar (Above Mind Map & Content) */}
          <aside className="w-full border-b border-slate-200 bg-slate-50/70 px-4 sm:px-5 py-2.5 flex items-center gap-2 shrink-0 overflow-x-auto">
            {TUTORIAL_MODULES.map((mod) => {
              const IconComp = mod.icon;
              const isActive = mod.id === activeModule.id;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setSelectedModuleId(mod.id)}
                  className={`text-left px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                    isActive
                      ? 'bg-white border-blue-300 shadow-2xs ring-1 ring-blue-500/15'
                      : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">
                    {mod.title}
                  </div>
                </button>
              );
            })}
          </aside>

          {/* Right Tutorial Content Pane */}
          <div
            className={
              isFullWorkspaceActive
                ? 'flex-1 flex flex-col overflow-hidden p-4 sm:p-5 gap-3 bg-white'
                : 'flex-1 overflow-y-auto p-6 sm:p-7 space-y-6 bg-white'
            }
          >
            {/* Module Title Banner (Compact bar in Mind Map full view mode) */}
            {!isDissertationsActive && (
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                    {activeModule.title}
                  </h3>
                </div>
              </div>
            )}

            {/* Interactive StatAssist AI Dissertations Hub */}
            {isDissertationsActive && (
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <DissertationGuideView
                  onLaunchTutorialTest={onLaunchTutorialTest}
                  onClose={onClose}
                />
              </div>
            )}

            {/* Interactive Statistical Decision Flowchart Canvas */}
            {isMindMapActive && (
              <StatisticalFlowchartCanvas
                onLaunchTutorialTest={onLaunchTutorialTest}
                onClose={onClose}
              />
            )}

            {/* Detailed Tutorial Sections */}
            {activeModule.sections.length > 0 && (
              <div className="space-y-4">
                {activeModule.sections.map((section, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                  >
                    <h4 className="text-sm font-bold text-slate-900">{section.heading}</h4>
                    <p className="text-xs text-slate-700 leading-relaxed">{section.body}</p>

                    {section.formula && (
                      <div className="px-3 py-2 rounded-lg bg-white border border-slate-200 font-mono text-[11px] text-blue-700 font-semibold">
                        {section.formula}
                      </div>
                    )}

                    {section.bullets && (
                      <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700 leading-relaxed pt-1">
                        {section.bullets.map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Interactive Action Strip (non-Mind-Map / non-Dissertations tutorials) */}
            {!isFullWorkspaceActive && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100 shrink-0">
                {activeModule.recommendedTest && onLaunchTutorialTest ? (
                  <button
                    type="button"
                    onClick={() => {
                      onLaunchTutorialTest(activeModule.recommendedTest!);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{activeModule.recommendedTestLabel || 'Try Interactive Preset'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : onOpenApaGuide ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenApaGuide();
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Open Full APA 7th Reference Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
                >
                  Close Tutorials
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
