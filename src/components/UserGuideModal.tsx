import React, { useState } from 'react';
import {
  X,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Database,
  Sliders,
  Sparkles,
  Table as TableIcon,
  FileCheck,
  ShieldCheck,
  Play,
  HelpCircle,
} from 'lucide-react';
import { StatisticalTestType } from '../types/stats';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunDemo: (testType: StatisticalTestType) => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  onRunDemo,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'Selecting Test: Choose Test via Decision Protocol or Matrix',
      icon: Sparkles,
      summary: 'Pick an inferential test or let our empirical decision tree guide you based on your research design.',
      details: [
        'The application opens to the "Selecting Test" tab as your primary methodological starting point.',
        'Answer 3 diagnostic questions (Research Goal, Outcome DV scale, and Group Structure) to see the exact recommended test.',
        'Review the 6-assumption checklist, APA 7th syntax template, and mathematical rationale.',
        'Click "Proceed to Step 2: Dataset (Pre-Set Study)" to automatically load a pre-configured sample study matched to your test.',
      ],
      tip: 'Pro Tip: You can switch between the interactive Decision Protocol and the comprehensive Test Matrix at any time.',
    },
    {
      step: 2,
      title: 'Dataset: Review Pre-Set Study, Upload or Edit Data',
      icon: Database,
      summary: 'Inspect the automatically placed example study, edit values in-place, or upload your own research CSV/TSV.',
      details: [
        'The "Dataset" tab automatically loads the optimal benchmark study for your chosen test with pre-aligned variables.',
        'Edit any value in real time: click any cell in the "Empirical Data Matrix" to edit numbers or text in-place.',
        'Check the Variable Dictionary to verify column measurement scales (Continuous vs. Categorical vs. ID).',
        'Use "Add Observation Row" or "Add Variable" to expand your dataset, or upload your own CSV/TSV file.',
        'When ready, click "Proceed to Step 3: Test Analysis".',
      ],
      tip: 'Pro Tip: Missing values are automatically counted and updated across the Variable Dictionary in real time.',
    },
    {
      step: 3,
      title: 'Test Analysis & APA 7th Manuscript Synthesis',
      icon: Play,
      summary: 'Assign variables, execute mathematical calculations, and synthesize publication-ready APA 7th tables and theoretical discussions.',
      details: [
        'In the "Variable Assignment" console, outcome (DV) and factor (IV) are pre-selected based on your chosen test.',
        'Adjust significance threshold (standard α = .05, or stringent α = .01) and click "Execute Quantitative Analysis".',
        'Directly below results, review the APA 7th Academic Synthesis card with exact inline statistics (e.g., t(58) = 2.84, p = .006, d = 0.74).',
        'Access formatted 3-rule APA publication tables and generate full manuscript Discussion sections with theoretical implications right on the same page.',
      ],
      tip: 'Pro Tip: StatAssist AI automatically runs Brown-Forsythe Levene’s test for equality of variances and applies Welch’s correction if violated.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                StatAssist AI: First-Time User Quickstart Guide
              </h2>
              <p className="text-xs text-slate-500">
                A streamlined 3-step walkthrough for researchers and postgraduate students to analyze data and produce APA 7th reports.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>


        {/* Step Indicator Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {steps.map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 ${
                activeStep === s.step
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">
                {s.step}
              </span>
              <span>{s.title.split(' ')[0]} {s.title.split(' ')[1] || ''}</span>
            </button>
          ))}
        </div>

        {/* Current Step Content */}
        {steps.map((s) => {
          if (s.step !== activeStep) return null;
          const Icon = s.icon;
          return (
            <div key={s.step} className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-600 text-white rounded-lg">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-blue-600 uppercase font-semibold">
                      Step {s.step} of 5
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {s.title}
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  {s.summary}
                </p>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Action Checklist:
                </h4>
                <ul className="space-y-2">
                  {s.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-xs text-blue-900 font-medium">
                {s.tip}
              </div>
            </div>
          );
        })}

        {/* Quick Demo Launchers */}
        <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Try a 1-Click Interactive Demo
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">Loads sample & executes instantly</span>
          </div>
          <p className="text-xs text-slate-300">
            Want to see how StatAssist AI works before loading your own dataset? Click any preset below to see the results and APA 7th tables:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => {
                onRunDemo('independent_ttest');
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Demo 1: Independent t-Test (Mindfulness vs Control)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                onRunDemo('anova');
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Demo 2: One-Way ANOVA (3 Intervention Arms)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                onRunDemo('regression');
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Demo 3: Multiple Regression (Exam Prediction)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
            disabled={activeStep === 1}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Previous Step
          </button>

          <div className="flex items-center gap-2">
            {activeStep < 5 ? (
              <button
                onClick={() => setActiveStep((prev) => Math.min(5, prev + 1))}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Got It, Start Analyzing
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
