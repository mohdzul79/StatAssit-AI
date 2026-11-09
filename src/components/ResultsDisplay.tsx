import React, { useState } from 'react';
import {
  Copy,
  Check,
  FileCheck,
  Table as TableIcon,
  ShieldCheck,
  BarChart2,
  HelpCircle,
  Download,
  FileCode,
  Share2,
  Mail,
} from 'lucide-react';
import { StatisticalResult, ResearchQuestion, Dataset } from '../types/stats';
import { generateApaNarrative, generateApaTable } from '../utils/apaFormatter';
import { evaluateHypothesisDecision, extractPValue } from '../utils/hypothesisHelper';
import { AssumptionAuditor } from './AssumptionAuditor';
import { AdvancedModelingResults } from './AdvancedModelingResults';

interface ResultsDisplayProps {
  result: StatisticalResult;
  dataset?: Dataset;
  activeResearchQuestion?: ResearchQuestion | null;
  alphaLevel?: number;
  onOpenApaGuide: () => void;
  onProceedToAiSynthesis: () => void;
  onOpenEditRqModal?: (rq: ResearchQuestion) => void;
  onOpenAddRqModal?: () => void;
  onOpenGmail?: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  result,
  dataset,
  activeResearchQuestion,
  alphaLevel = 0.05,
  onOpenApaGuide,
  onProceedToAiSynthesis,
  onOpenEditRqModal,
  onOpenAddRqModal,
  onOpenGmail,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [copiedTable, setCopiedTable] = useState(false);

  const narrativeData = React.useMemo(() => generateApaNarrative(result), [result]);
  const tableData = React.useMemo(() => generateApaTable(result, 1), [result]);

  const pValue = extractPValue(result);
  const evaluation = pValue !== null ? evaluateHypothesisDecision(pValue, alphaLevel) : null;

  const handleCopyText = () => {
    navigator.clipboard.writeText(narrativeData.narrativeText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(narrativeData.shortCitation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const handleCopyTableWord = () => {
    // Construct standard academic HTML table for clipboard
    const htmlTable = `
      <div style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5;">
        <p style="margin: 0; font-weight: bold;">${tableData.tableNumber}</p>
        <p style="margin: 0; font-style: italic; margin-bottom: 8pt;">${tableData.tableTitle}</p>
        <table style="border-collapse: collapse; width: 100%; border-top: 1.5pt solid black; border-bottom: 1.5pt solid black; text-align: left;">
          <thead>
            <tr style="border-bottom: 1pt solid black;">
              ${tableData.headers.map((h) => `<th style="padding: 6pt; font-weight: normal; font-style: italic;">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${tableData.rows
              .map(
                (row) => `
              <tr>
                ${row.map((cell) => `<td style="padding: 6pt;">${cell}</td>`).join('')}
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
        <p style="font-size: 10pt; margin-top: 6pt;"><em>${tableData.tableNote}</em></p>
      </div>
    `;

    const blobHtml = new Blob([htmlTable], { type: 'text/html' });
    const blobText = new Blob([narrativeData.narrativeText], { type: 'text/plain' });
    const data = [new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })];
    navigator.clipboard.write(data);
    setCopiedTable(true);
    setTimeout(() => setCopiedTable(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Research Question & Empirical Hypothesis Verdict Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
              <span>Empirical Hypothesis Evaluation</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-slate-700">Decision Threshold α = {alphaLevel}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <span>{activeResearchQuestion ? activeResearchQuestion.title : 'Research Question'}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {evaluation && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold font-mono flex items-center gap-1.5 ${
                  evaluation.isSignificant
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {evaluation.isSignificant ? (
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                ) : (
                  <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                )}
                <span>{evaluation.verdictLabel}</span>
              </span>
            )}

            {activeResearchQuestion && onOpenEditRqModal && (
              <button
                onClick={() => onOpenEditRqModal(activeResearchQuestion)}
                className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                title="Edit research question phrasing"
              >
                Edit RQ
              </button>
            )}

            {!activeResearchQuestion && onOpenAddRqModal && (
              <button
                onClick={onOpenAddRqModal}
                className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                + Add Research Question
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {activeResearchQuestion ? (
            <div>
              <p className="text-base text-slate-900 font-serif italic bg-slate-50 p-4 rounded-lg border border-slate-200/80">
                "{activeResearchQuestion.question}"
              </p>

              {(activeResearchQuestion.hypothesisNull || activeResearchQuestion.hypothesisAlt) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs font-serif">
                  {activeResearchQuestion.hypothesisNull && (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-sans font-bold text-slate-700 block text-[11px] mb-0.5">
                        Null Hypothesis (H₀):
                      </span>
                      <span className="text-slate-800">{activeResearchQuestion.hypothesisNull}</span>
                    </div>
                  )}
                  {activeResearchQuestion.hypothesisAlt && (
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200">
                      <span className="font-sans font-bold text-blue-800 block text-[11px] mb-0.5">
                        Alternative Hypothesis (H₁):
                      </span>
                      <span className="text-slate-800">{activeResearchQuestion.hypothesisAlt}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 flex items-center justify-between">
              <span>No specific Research Question linked. Add one to formalize study hypotheses and report verdicts.</span>
              {onOpenAddRqModal && (
                <button
                  onClick={onOpenAddRqModal}
                  className="font-semibold text-blue-600 hover:underline shrink-0"
                >
                  Add Research Question
                </button>
              )}
            </div>
          )}

          {evaluation && (
            <div
              className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                evaluation.isSignificant
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/70 border-amber-200 text-amber-950'
              }`}
            >
              <span className="font-bold block mb-0.5">Empirical Scholarly Decision:</span>
              <p className="font-serif text-slate-800">{evaluation.academicStatement}</p>
            </div>
          )}
        </div>
      </div>
      {/* Primary Standout Box: APA 7th Edition Synthesis Box */}
      <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400 uppercase tracking-wider mb-1">
              <span>APA 7th Edition Academic Synthesis</span>
              <span aria-hidden="true">·</span>
              <span>Peer-Review Ready</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              {narrativeData.headline}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCitation}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 font-mono"
            >
              {copiedCitation ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCitation ? 'Copied Citation' : 'Copy Citation'}</span>
            </button>
            <button
              onClick={handleCopyText}
              className="px-4 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Copied Full Paragraph' : 'Copy APA Paragraph'}</span>
            </button>
            {onOpenGmail && (
              <button
                type="button"
                onClick={onOpenGmail}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Email APA 7th narrative and findings via Gmail"
              >
                <Mail className="w-3.5 h-3.5 text-white" />
                <span>Email via Gmail</span>
              </button>
            )}
          </div>
        </div>

        {/* Inline Citation Highlight */}
        <div className="mt-5 p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-lg flex items-center justify-between gap-4">
          <div className="text-xs font-mono text-slate-400">
            Inline Citation:
          </div>
          <div className="text-sm font-mono text-emerald-400 font-semibold tracking-wide">
            {narrativeData.shortCitation}
          </div>
        </div>

        {/* Formatted Academic Paragraph */}
        <div className="mt-5 text-slate-200 text-sm sm:text-base leading-relaxed font-serif bg-slate-800/40 p-5 rounded-lg border border-slate-800">
          <p>{narrativeData.narrativeText}</p>
        </div>

        {/* APA 7th Rules Compliance Checklist */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            {narrativeData.apaRulesApplied.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{rule}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onProceedToAiSynthesis}
            className="text-xs font-semibold text-blue-300 hover:text-blue-200 hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <span>Jump to Manuscript Synthesis & Discussion</span>
            <span>↓</span>
          </button>
        </div>
      </div>

      {/* Official APA 7th Publication Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
              Academic Manuscript Artifact
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              APA 7th Three-Rule Publication Table
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Strictly adheres to APA 7th Table Guidelines: 3 horizontal rules, no vertical borders, and formal note formatting.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTableWord}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {copiedTable ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <TableIcon className="w-3.5 h-3.5" />}
              <span>{copiedTable ? 'Copied Word Table' : 'Copy for Microsoft Word'}</span>
            </button>
          </div>
        </div>

        {/* Render Table with APA 7th visual styling */}
        <div className="overflow-x-auto p-4 bg-white rounded-lg">
          <div className="min-w-[600px] font-serif text-slate-900">
            <div className="font-bold text-sm text-slate-900 mb-0.5">
              {tableData.tableNumber}
            </div>
            <div className="italic text-sm text-slate-800 mb-4">
              {tableData.tableTitle}
            </div>

            {/* Table with exactly 3 horizontal borders (top, header-bottom, table-bottom) */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-t-2 border-b border-slate-900">
                  {tableData.headers.map((h, i) => (
                    <th
                      key={i}
                      className="py-2.5 px-3 font-normal italic text-slate-900 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y-0">
                {tableData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/50">
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`py-2 px-3 whitespace-nowrap ${
                          cIdx > 0 ? 'font-mono tabular-nums text-slate-800' : 'font-medium text-slate-900'
                        }`}
                      >
                        {String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900">
                  <td
                    colSpan={tableData.headers.length}
                    className="pt-2 pb-1 px-1 text-[11px] text-slate-600 font-sans italic"
                  >
                    {tableData.tableNote}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Advanced Statistical Modeling: Fit Indices, Factor Loadings & Path Architecture */}
      <AdvancedModelingResults result={result} />

      {/* Automated Visual Assumption Auditor with Diagnostic Plots */}
      <AssumptionAuditor result={result} dataset={dataset} />
    </div>
  );
};
