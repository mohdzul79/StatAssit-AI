import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  FileText,
  AlertCircle,
  RefreshCw,
  BookOpen,
  CheckCircle2,
  Download,
  Cpu,
  ChevronDown,
} from 'lucide-react';
import {
  StatisticalResult,
  ApaSynthesisResponse,
  Dataset,
  ResearchQuestion,
} from '../types/stats';
import { UserProfile } from '../types/user';
import { generateFullApaSynthesis } from '../utils/apaFormatter';
import { SinglePagePdfPreviewModal } from './SinglePagePdfPreviewModal';

interface ApaManuscriptGeneratorProps {
  result: StatisticalResult;
  dataset?: Dataset;
  activeResearchQuestion?: ResearchQuestion | null;
  alphaLevel?: number;
  defaultResearchQuestion?: string;
  authorProfile?: UserProfile | null;
  onOpenNotebookLMSync?: () => void;
}

export const ApaManuscriptGenerator: React.FC<ApaManuscriptGeneratorProps> = ({
  result,
  dataset,
  activeResearchQuestion,
  alphaLevel = 0.05,
  defaultResearchQuestion = '',
  authorProfile,
  onOpenNotebookLMSync,
}) => {
  const [researchQuestion, setResearchQuestion] = useState(
    defaultResearchQuestion || 'Investigating empirical group differences and predictive effects on quantitative study outcomes.'
  );
  const [userNotes, setUserNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [synthesisData, setSynthesisData] = useState<ApaSynthesisResponse | null>(() => {
    try {
      return generateFullApaSynthesis(result, defaultResearchQuestion);
    } catch {
      return null;
    }
  });
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string | null>(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });
  const [activePresetLabel, setActivePresetLabel] = useState<string>('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isApaFormatMenuOpen, setIsApaFormatMenuOpen] = useState<boolean>(false);
  const [isOutputPreviewOpen, setIsOutputPreviewOpen] = useState<boolean>(false);

  React.useEffect(() => {
    if (defaultResearchQuestion) {
      setResearchQuestion(defaultResearchQuestion);
      try {
        setSynthesisData(generateFullApaSynthesis(result, defaultResearchQuestion, userNotes));
      } catch {
        // preserve
      }
    }
  }, [defaultResearchQuestion]);

  React.useEffect(() => {
    if (result) {
      try {
        setSynthesisData(generateFullApaSynthesis(result, researchQuestion, userNotes));
        setLastUpdatedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch {
        // preserve
      }
    }
  }, [result]);

  const handleGenerate = async (presetPrompt?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    const targetNotes = presetPrompt !== undefined ? presetPrompt : userNotes;
    if (presetPrompt !== undefined) {
      setUserNotes(presetPrompt);
      setActivePresetLabel(presetPrompt);
    } else if (userNotes) {
      setActivePresetLabel(userNotes);
    }

    try {
      const payload = {
        testType: result.type,
        variables:
          result.type === 'independent_ttest'
            ? { dv: result.dependentVar, iv: result.groupVar, groups: [result.group1.name, result.group2.name] }
            : result.type === 'anova'
            ? { dv: result.dependentVar, iv: result.factorVar, groups: result.groups.map((g) => g.name) }
            : result.type === 'regression'
            ? { dv: result.dependentVar, ivs: result.independentVars }
            : result.type === 'paired_ttest'
            ? { var1: result.var1, var2: result.var2 }
            : result.type === 'correlation'
            ? { variables: result.variables }
            : { result },
        statsSummary: result,
        researchQuestion,
        userNotes: targetNotes,
      };

      const res = await fetch('/api/gemini/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data: ApaSynthesisResponse = await res.json();
        if (data && data.apaNarrative) {
          setSynthesisData(data);
          setErrorMsg(null);
          setLastUpdatedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          return;
        }
      }

      // If server returned non-ok, generate immediately with local empirical engine
      const localData = generateFullApaSynthesis(result, researchQuestion, targetNotes);
      setSynthesisData(localData);
      setErrorMsg(null);
      setLastUpdatedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: any) {
      try {
        const localData = generateFullApaSynthesis(result, researchQuestion, targetNotes);
        setSynthesisData(localData);
        setErrorMsg(null);
        setLastUpdatedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (fallbackErr: any) {
        setErrorMsg(err?.message || 'Synthesis engine encountered an issue. Please retry.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, sectionName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleExportFullMarkdown = () => {
    if (!synthesisData) return;

    const md = `# Quantitative Statistical Report (APA 7th Edition)
Test Conducted: ${result.type}
Research Question: ${researchQuestion}
Date: ${new Date().toLocaleDateString()}

## Results
${synthesisData.apaNarrative}

## Assumption Verification
${synthesisData.assumptionsReport}

## Effect Size & Magnitude
${synthesisData.effectSizeInterpretation}

## Discussion & Scholarly Implications
${synthesisData.discussionDraft}

---
Generated by StatAssist AI - APA 7th Edition Statistical Engine
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `APA7_Statistical_Report_${result.type}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Configuration & Prompt Input Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">
            AI-Powered APA 7th Manuscript Synthesizer
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-5">
          Synthesizes numerical outputs into peer-review publication text, assumption compliance commentary, and discussion paragraphs tailored to your research hypothesis.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Research Question / Primary Hypothesis
            </label>
            <input
              type="text"
              value={researchQuestion}
              onChange={(e) => setResearchQuestion(e.target.value)}
              placeholder="e.g. Did mindfulness intervention significantly alleviate exam stress compared to control?"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Custom Academic Guidance / Author Notes (Optional)
            </label>
            <input
              type="text"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="e.g. Target journal: Journal of Educational Psychology; emphasize practical effect size magnitude."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500 font-medium">Quick Presets:</span>
            {[
              'Thesis Results Section Draft',
              'Rigorous Assumption Audit & Remedies',
              'Journal Discussion & Effect Magnitude',
              'Postgraduate Viva Defense Summary',
            ].map((preset) => {
              const isSelected = userNotes === preset || activePresetLabel === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setUserNotes(preset);
                    setActivePresetLabel(preset);
                    handleGenerate(preset);
                  }}
                  className={`text-xs font-medium px-3 py-1 rounded-full transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                  title={`Apply and synthesize: ${preset}`}
                >
                  {preset}
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-mono">
              Engine: <span className="text-slate-700 font-semibold">{synthesisData?._meta?.model || 'StatAssist AI APA 7th Mathematical Engine'}</span>
            </div>
            <button
              onClick={() => handleGenerate()}
              disabled={isLoading}
              className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                isLoading
                  ? 'bg-blue-400 text-white cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Academic Text...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Synthesize Publication Manuscript</span>
                </>
              )}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-900 text-xs">
                    Synthesis Status Notice
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-200/70 text-amber-800 border border-amber-300">
                    Offline Engine Ready
                  </span>
                </div>
                <p className="text-amber-800 leading-relaxed text-[11.5px]">
                  {errorMsg} — The built-in StatAssist APA 7th Empirical Engine can immediately generate your complete publication manuscript.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => {
                  try {
                    const localData = generateFullApaSynthesis(result, researchQuestion, userNotes);
                    setSynthesisData(localData);
                    setErrorMsg(null);
                  } catch (e: any) {
                    setErrorMsg(e.message);
                  }
                }}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate with Local APA Engine</span>
              </button>
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isLoading}
                className="px-3 py-2 bg-white hover:bg-slate-50 border border-amber-300 text-amber-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Synthesis Output Display */}
      {synthesisData && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex flex-wrap items-center gap-2">
                <span>Synthesized Academic Manuscript Artifacts</span>
                {lastUpdatedTime && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Updated {lastUpdatedTime}</span>
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {activePresetLabel ? (
                  <span>
                    Actively tailored to: <strong className="text-slate-700 font-semibold">{activePresetLabel}</strong>
                  </span>
                ) : userNotes ? (
                  <span>
                    Tailored to author guidance: <strong className="text-slate-700 font-semibold">{userNotes}</strong>
                  </span>
                ) : (
                  <span>Tailored to primary research question and empirical test parameters</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportFullMarkdown}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Download Full Report (.md)</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* 1. Results Narrative */}
            <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-blue-600 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 font-mono">
                  1. Manuscript Results Section (Strict APA 7th)
                </span>
                <button
                  onClick={() => handleCopy(synthesisData.apaNarrative, 'results')}
                  className="text-xs font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSection === 'results' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'results' ? 'Copied' : 'Copy Section'}</span>
                </button>
              </div>
              <p className="text-sm font-serif text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
                {synthesisData.apaNarrative}
              </p>
            </div>

            {/* 2. Assumptions & Diagnostics */}
            <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-emerald-600 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
                  2. Methodological & Assumption Evaluation
                </span>
                <button
                  onClick={() => handleCopy(synthesisData.assumptionsReport, 'assumptions')}
                  className="text-xs font-medium text-slate-500 hover:text-emerald-600 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSection === 'assumptions' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'assumptions' ? 'Copied' : 'Copy Section'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {synthesisData.assumptionsReport}
              </p>
            </div>

            {/* 3. Effect Size & Practical Impact */}
            <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-amber-500 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 font-mono">
                  3. Effect Size & Practical Significance
                </span>
                <button
                  onClick={() => handleCopy(synthesisData.effectSizeInterpretation, 'effect')}
                  className="text-xs font-medium text-slate-500 hover:text-amber-600 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSection === 'effect' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'effect' ? 'Copied' : 'Copy Section'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {synthesisData.effectSizeInterpretation}
              </p>
            </div>

            {/* 4. Scholarly Discussion Section Draft */}
            <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-indigo-600 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 font-mono">
                  4. Scholarly Discussion & Theoretical Implications
                </span>
                <button
                  onClick={() => handleCopy(synthesisData.discussionDraft, 'discussion')}
                  className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSection === 'discussion' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'discussion' ? 'Copied' : 'Copy Section'}</span>
                </button>
              </div>
              <p className="text-sm font-serif text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
                {synthesisData.discussionDraft}
              </p>
            </div>

            {/* OUTPUT Button: Standardized Multi-Page University Thesis Submission PDF Preview */}
            <div className="bg-slate-900 text-white rounded-xl border border-slate-800 px-5 py-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold tracking-tight">
                  University Thesis Submission PDF Output (Chapter 1, Chapter 3 &amp; Chapter 4)
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Compile all research details, RQ &amp; hypotheses, methodology, APA tables, graphs, and discussion into standardized thesis pages.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOutputPreviewOpen(true)}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition-colors inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>OUTPUT</span>
              </button>
            </div>
          </div>

          {/* 5. APA 7th Format Verification Checklist (Dropdown Menu) */}
          {synthesisData.checklist && synthesisData.checklist.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setIsApaFormatMenuOpen((prev) => !prev)}
                aria-expanded={isApaFormatMenuOpen}
                className="w-full px-6 py-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 transition-colors rounded-xl cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                    APA 7th Format
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {synthesisData.checklist.length} Rules Verified
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-150 ${
                    isApaFormatMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isApaFormatMenuOpen && (
                <div className="px-6 pb-6 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in duration-150">
                  {synthesisData.checklist.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-slate-900">
                          {item.rule}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          {item.detail}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* 1-Page Chapter 3 & Chapter 4 PDF Output Preview Modal */}
          <SinglePagePdfPreviewModal
            isOpen={isOutputPreviewOpen}
            onClose={() => setIsOutputPreviewOpen(false)}
            result={result}
            dataset={dataset}
            activeResearchQuestion={activeResearchQuestion}
            alphaLevel={alphaLevel}
            researchQuestionText={researchQuestion}
            userNotes={userNotes}
            synthesisData={synthesisData}
          />
        </div>
      )}
    </div>
  );
};
