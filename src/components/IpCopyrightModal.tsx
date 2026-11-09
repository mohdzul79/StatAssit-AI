import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Code,
  Server,
  Layout,
  Sparkles,
  Check,
  Copy,
  FileText,
  AlertOctagon,
  Award,
} from 'lucide-react';

interface IpCopyrightModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorEmail?: string;
}

export const IpCopyrightModal: React.FC<IpCopyrightModalProps> = ({
  isOpen,
  onClose,
  authorEmail = 'mohdzul@gmail.com',
}) => {
  const [copiedCitation, setCopiedCitation] = useState(false);

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();

  const formalCitationText = `StatAssist AI — Statistical Assistant & APA 7th Manuscript Engine
Copyright © ${currentYear} Mohd Zulhisam (${authorEmail}). All Rights Reserved.

Proprietary Copyright Protections:
• Original Python & TypeScript source code, statistical math algorithms, and numerical calculations
• Backend scripts, server proxy infrastructure, and API execution pipelines
• UI/UX frontend design, variable matrix, and 3-rule APA table architecture
• Specific generative AI prompt engineering templates and synthesis personas

Trade Secrets:
Protect the precise internal decision matrices, thresholds, and algorithms driving FSM Logic Router by utilizing strict Non-Disclosure Agreements (NDAs) and keeping the core code confidential.

Intellectual Property & Trade Secrets Rights Holder: Mohd Zulhisam (${authorEmail}).`;

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(formalCitationText);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-xl shadow-xs">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Copyright & Intellectual Property Protection
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wide">
                  Trade Secrets Protected
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - Single Page Layout */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {/* Official Declaration Banner */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Award className="w-5 h-5 text-indigo-600" />
              <span>Official Intellectual Property & Trade Secret Declaration</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This notice protects the application's <strong>original Python source code</strong>, <strong>backend scripts</strong>, <strong>UI/UX frontend</strong>, and <strong>specific generative AI prompt engineering templates</strong> under Copyright.
            </p>
            <p className="text-xs text-amber-900 font-medium bg-amber-50 p-2.5 rounded-lg border border-amber-200 leading-relaxed">
              <strong>Trade Secrets:</strong> Protect the precise internal decision matrices, thresholds, and algorithms driving FSM Logic Router by utilizing strict Non-Disclosure Agreements (NDAs) and keeping the core code confidential.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              This application, its architecture, original mathematical statistical code, backend infrastructure, user interface, and specialized prompt engineering systems are the proprietary creations and intellectual property of <strong>Mohd Zulhisam</strong>. All rights are strictly reserved under applicable national and international copyright conventions, trade secret laws, and intellectual property treaties.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleCopyCitation}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors cursor-pointer"
              >
                {copiedCitation ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Citation & Notice Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Formal Copyright Notice</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 1. Original Source Code & Math Algorithms */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Code className="w-4 h-4 text-emerald-600" />
                <span>1. Original Python Source Code & Numerical Math Algorithms</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Protected: Source & Algorithms
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              All computational algorithms—including probability distributions (Student’s t, Snedecor’s F, Chi-Square, Standard Normal), Satterthwaite degrees of freedom corrections, Brown-Forsythe Levene variance tests, partial eta-squared (η²), Cohen’s d formulas, regression matrix operations, and non-parametric rank sums—are protected.
            </p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-2xs text-slate-500 font-mono">
              Unauthorized extraction, scraping, decompiling, repackaging into commercial SaaS products, or unauthorized distribution of these algorithms is strictly prohibited.
            </div>
          </div>

          {/* 2. Backend Scripts & Server Engine */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Server className="w-4 h-4 text-indigo-600" />
                <span>2. Backend Scripts & Execution Pipelines</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Protected: Server Architecture
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The backend execution pipeline, proxy endpoints (<code>/api/gemini/synthesize</code>, <code>/api/gemini/consult</code>, <code>/api/token-check</code>), failover architectures, model racing heuristics, and secure credential sandboxing are proprietary server-side software creations of Mohd Zulhisam.
            </p>
          </div>

          {/* 3. UI/UX Frontend Design */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Layout className="w-4 h-4 text-purple-600" />
                <span>3. UI/UX Frontend Design & Academic Interface</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Protected: Visual Design & UX
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The visual layout, typography, academic data matrix editor, interactive variable console, 3-rule official APA publication table generator, assumption auditing panels, and workflow stage navigation represent protected aesthetic and functional user interface design.
            </p>
          </div>

          {/* 4. Generative AI Prompt Engineering Templates */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>4. Specific Generative AI Prompt Engineering Templates</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Protected: Prompt IP & Trade Secret
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The specialized prompt engineering templates—including system instruction personas, strict APA 7th editorial guidelines (symbol italicization, leading zero omission on bounded statistics, bracketed CI notation), theoretical discussion structuring heuristics, and JSON response schema definitions—are proprietary trade secrets authored by Mohd Zulhisam.
            </p>
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-2xs text-amber-900 space-y-1">
              <strong>Trade Secret Notice:</strong> Prompt templates are proprietary and shall not be extracted, copied, or utilized to train external LLM agents or clone the StatAssist AI synthesis system.
            </div>
          </div>

          {/* 5. Trade Secrets: FSM Logic Router & Decision Matrices */}
          <div className="bg-gradient-to-br from-amber-50/60 via-white to-orange-50/30 p-5 rounded-2xl border-2 border-amber-300 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>5. Trade Secrets: FSM Logic Router & Internal Decision Matrices</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300">
                Strict NDAs & Core Code Confidentiality
              </span>
            </div>
            <div className="bg-amber-100/70 border border-amber-300/80 p-3 rounded-xl text-xs font-semibold text-amber-950">
              Trade Secrets: Protect the precise internal decision matrices, thresholds, and algorithms driving FSM Logic Router by utilizing strict Non-Disclosure Agreements (NDAs) and keeping the core code confidential.
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The finite-state machine (FSM) Logic Router dynamically audits sample sizes, homogeneity of variance checks, normality skewness/kurtosis thresholds, and inferential branch criteria to select and execute the optimal statistical pipeline. These precise internal decision matrices, quantitative threshold cutoffs, and switching algorithms represent protected Trade Secrets of Mohd Zulhisam.
            </p>
            <div className="bg-slate-900 p-3.5 rounded-xl text-2xs text-slate-300 font-mono space-y-1.5 border border-slate-800">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Confidentiality & Non-Disclosure Governance</span>
              </div>
              <p>
                • Internal finite-state matrices and cutoff criteria must remain confidential.<br />
                • Any access granted to internal logic systems requires explicit bilateral Non-Disclosure Agreements (NDAs).<br />
                • Core algorithm source code is not released under open-source licenses and is strictly proprietary.
              </p>
            </div>
          </div>

          {/* 6. Permitted Academic Fair Use */}
          <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Permitted Scholar & Academic Fair Use</span>
            </div>
            <p className="text-emerald-800 leading-relaxed">
              University students, educators, and researchers are fully permitted and encouraged to cite and publish the statistical numbers, tables, and manuscript narratives generated by this application in their theses, dissertations, and peer-reviewed journals. Attribution: <em>"Statistical computation and APA 7th synthesis produced via StatAssist AI (M. Zulhisam, 2026)."</em>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-end gap-3 text-2xs text-slate-500 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
