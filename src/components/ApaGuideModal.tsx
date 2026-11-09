import React from 'react';
import { X, BookOpen, Check, AlertTriangle } from 'lucide-react';

interface ApaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApaGuideModal: React.FC<ApaGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                APA 7th Edition Statistical Reporting Guide
              </h3>
              <p className="text-xs text-slate-500">
                Mandatory rules for academic manuscripts, theses, and peer-reviewed submissions.
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

        <div className="space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* Rule 1: Italicization */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
              <span>1. Statistical Symbol Italicization</span>
            </h4>
            <p className="mb-3">
              Italicize all statistical symbols that are represented by Latin/English letters. Do <strong>not</strong> italicize Greek letters or abbreviations for multi-letter terms.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <div className="font-semibold text-emerald-700 mb-1">
                  ✓ Italicize (Latin letters):
                </div>
                <div><em>M</em> (Mean), <em>SD</em> (Standard Deviation)</div>
                <div><em>t</em> (t-test), <em>F</em> (ANOVA/Regression F)</div>
                <div><em>p</em> (Probability), <em>d</em> (Cohen’s d)</div>
                <div><em>r</em> (Correlation), <em>R</em>² (Coefficient of determination)</div>
                <div><em>N</em> (Total sample), <em>n</em> (Subgroup size)</div>
                <div><em>β</em> (Standardized beta weight), <em>SE</em> (Std Error)</div>
              </div>
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <div className="font-semibold text-rose-700 mb-1">
                  ✗ Do NOT Italicize (Greek / Multi-letter):
                </div>
                <div>χ² (Chi-Square)</div>
                <div>α (Cronbach’s alpha or significance alpha)</div>
                <div>η² (Eta-squared)</div>
                <div>ω² (Omega-squared)</div>
                <div>ANOVA, ANCOVA, MANOVA</div>
                <div>CI (Confidence Interval)</div>
                <div>VIF, IQR, RMSEA, CFI</div>
              </div>
            </div>
          </div>

          {/* Rule 2: The Leading Zero Rule */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
              <span>2. The Strict Leading Zero Rule</span>
            </h4>
            <p className="mb-2">
              Do <strong>NOT</strong> use a leading zero when a statistic cannot theoretically exceed 1.0. If a statistic can exceed 1.0, <strong>DO</strong> use a leading zero.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <div className="font-semibold text-emerald-700 mb-1">
                  No Leading Zero (Bounded &lt; 1.0):
                </div>
                <div><em>p</em> = .023 (NOT <em>p</em> = 0.023)</div>
                <div><em>p</em> &lt; .001 (NOT <em>p</em> = .000 or 0.000)</div>
                <div><em>r</em> = .45, <em>r</em> = -.32</div>
                <div><em>R</em>² = .28, η² = .14</div>
              </div>
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <div className="font-semibold text-emerald-700 mb-1">
                  Include Leading Zero (Can exceed 1.0):
                </div>
                <div><em>M</em> = 0.85, <em>SD</em> = 0.42</div>
                <div><em>t</em> = 2.45, <em>F</em> = 5.12</div>
                <div><em>d</em> = 0.65, <em>z</em> = 1.96</div>
                <div>χ² = 8.42</div>
              </div>
            </div>
          </div>

          {/* Rule 3: Exact p-Values & Decimals */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-2">
              3. Decimal Places & Exact Probability
            </h4>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                Report exact <em>p</em>-values to two or three decimal places (e.g., <em>p</em> = .034, <em>p</em> = .08).
              </li>
              <li>
                When <em>p</em> is smaller than .001, report as <strong><em>p</em> &lt; .001</strong>. Never report <em>p</em> = .000 (probability is never absolute zero).
              </li>
              <li>
                Most descriptive and inferential statistics (<em>M</em>, <em>SD</em>, <em>t</em>, <em>F</em>, <em>d</em>) are rounded to two decimal places.
              </li>
            </ul>
          </div>

          {/* Rule 4: Confidence Intervals */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-2">
              4. Confidence Interval Notation
            </h4>
            <p>
              Always enclose the confidence limits in square brackets separated by a comma and a single space:
            </p>
            <div className="p-2.5 bg-white rounded border border-slate-200 font-mono text-[11px] mt-2">
              95% CI [2.45, 8.90] (CORRECT) <br />
              <span className="text-rose-600">95% CI (2.45 - 8.90) (INCORRECT)</span>
            </div>
          </div>

          {/* Rule 5: Publication Tables */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-2">
              5. Three-Rule Publication Tables
            </h4>
            <p>
              An official APA 7th table contains:
            </p>
            <ul className="list-disc pl-4 space-y-1 mt-1">
              <li><strong>Table 1</strong> in bold on its own line above the table.</li>
              <li><em>Italicized table title</em> on the next line in Title Case.</li>
              <li>Only three horizontal rules: top border, bottom of headings row, and bottom of table. <strong>Zero vertical rules</strong>.</li>
              <li>Table note beginning with <em>Note.</em> in italics.</li>
            </ul>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
          >
            Close Reference Guide
          </button>
        </div>
      </div>
    </div>
  );
};
