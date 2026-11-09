import React from 'react';
import {
  Play,
  Settings2,
  Sliders,
  CheckSquare,
  Square,
  HelpCircle,
  Plus,
  Edit2,
  Sparkles,
  Target,
  Layers,
  Scale,
  Binary,
  ShieldCheck,
  Repeat,
  Check,
} from 'lucide-react';
import { Dataset, StatisticalTestType, ResearchQuestion } from '../types/stats';

interface StatisticalConsoleProps {
  dataset: Dataset;
  testType: StatisticalTestType;
  selectedDV: string;
  setSelectedDV: (v: string) => void;
  selectedIV: string;
  setSelectedIV: (v: string) => void;
  selectedGroup1: string;
  setSelectedGroup1: (v: string) => void;
  selectedGroup2: string;
  setSelectedGroup2: (v: string) => void;
  selectedSecondVar: string;
  setSelectedSecondVar: (v: string) => void;
  selectedMultiVars: string[];
  setSelectedMultiVars: (vars: string[]) => void;
  correlationMethod: 'pearson' | 'spearman';
  setCorrelationMethod: (m: 'pearson' | 'spearman') => void;
  alphaLevel: number;
  setAlphaLevel: (a: number) => void;
  oneSampleTestValue?: number;
  setOneSampleTestValue?: (v: number) => void;
  selectedFactorB?: string;
  setSelectedFactorB?: (v: string) => void;
  selectedCovariate?: string;
  setSelectedCovariate?: (v: string) => void;
  activeResearchQuestion?: ResearchQuestion | null;
  onSelectResearchQuestion?: (rq: ResearchQuestion) => void;
  onOpenAddRqModal?: () => void;
  onOpenEditRqModal?: (rq: ResearchQuestion) => void;
  onAutoDraftRq?: () => void;
  onExecuteAnalysis: () => void;
}

export const StatisticalConsole: React.FC<StatisticalConsoleProps> = ({
  dataset,
  testType,
  selectedDV,
  setSelectedDV,
  selectedIV,
  setSelectedIV,
  selectedGroup1,
  setSelectedGroup1,
  selectedGroup2,
  setSelectedGroup2,
  selectedSecondVar,
  setSelectedSecondVar,
  selectedMultiVars,
  setSelectedMultiVars,
  correlationMethod,
  setCorrelationMethod,
  alphaLevel,
  setAlphaLevel,
  oneSampleTestValue = 0,
  setOneSampleTestValue,
  selectedFactorB = '',
  setSelectedFactorB,
  selectedCovariate = '',
  setSelectedCovariate,
  activeResearchQuestion,
  onSelectResearchQuestion,
  onOpenAddRqModal,
  onOpenEditRqModal,
  onAutoDraftRq,
  onExecuteAnalysis,
}) => {
  const continuousCols = dataset.columns.filter((c) => c.type === 'continuous');
  const categoricalCols = dataset.columns.filter((c) => c.type === 'categorical');
  const allNonIdCols = dataset.columns.filter((c) => c.type !== 'id');

  // Distinct groups in currently selected IV
  const distinctGroupsInIV: string[] = React.useMemo(() => {
    if (!selectedIV) return [];
    return Array.from(new Set(dataset.data.map((d) => String(d[selectedIV])).filter(Boolean)));
  }, [dataset, selectedIV]);

  const [isExecuting, setIsExecuting] = React.useState(false);
  const [executedRecently, setExecutedRecently] = React.useState(false);

  const handleExecuteClick = () => {
    setIsExecuting(true);
    onExecuteAnalysis();
    setTimeout(() => {
      setIsExecuting(false);
      setExecutedRecently(true);
      setTimeout(() => setExecutedRecently(false), 2500);
    }, 200);
  };

  const toggleMultiVar = (colName: string) => {
    if (selectedMultiVars.includes(colName)) {
      setSelectedMultiVars(selectedMultiVars.filter((v) => v !== colName));
    } else {
      setSelectedMultiVars([...selectedMultiVars, colName]);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900">
            Variable Assignment & Empirical Hypothesis Setup
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span>Significance Threshold:</span>
          <select
            value={alphaLevel}
            onChange={(e) => setAlphaLevel(Number(e.target.value))}
            className="border border-slate-200 rounded px-2 py-0.5 font-mono text-slate-800 bg-slate-50 focus:outline-none"
          >
            <option value={0.05}>α = .05 (Standard)</option>
            <option value={0.01}>α = .01 (Stringent)</option>
            <option value={0.001}>α = .001 (Rigorous)</option>
          </select>
        </div>
      </div>

      {/* Research Question & Hypothesis Section */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <HelpCircle className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Research Question & Study Hypotheses
              </span>
              <span className="text-[11px] text-slate-500 block">
                Directly connects quantitative outputs to academic inquiry and APA 7th reporting
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {dataset.researchQuestions && dataset.researchQuestions.length > 0 && (
              <select
                value={activeResearchQuestion?.id || ''}
                onChange={(e) => {
                  const target = dataset.researchQuestions?.find((r) => r.id === e.target.value);
                  if (target && onSelectResearchQuestion) onSelectResearchQuestion(target);
                }}
                className="text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {dataset.researchQuestions.map((rq) => (
                  <option key={rq.id} value={rq.id}>
                    {rq.title}
                  </option>
                ))}
              </select>
            )}

            {activeResearchQuestion && onOpenEditRqModal && (
              <button
                type="button"
                onClick={() => onOpenEditRqModal(activeResearchQuestion)}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Edit this research question"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}

            {onAutoDraftRq && (
              <button
                type="button"
                onClick={onAutoDraftRq}
                className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                title="Auto-draft research question from currently assigned variables"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Auto-Draft RQ</span>
              </button>
            )}

            {onOpenAddRqModal && (
              <button
                type="button"
                onClick={onOpenAddRqModal}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Research Question</span>
              </button>
            )}
          </div>
        </div>

        {/* Active RQ Details */}
        {activeResearchQuestion ? (
          <div className="bg-white border border-slate-200/90 rounded-lg p-3.5 space-y-2.5">
            <div>
              <span className="text-[11px] font-mono text-blue-700 font-bold uppercase tracking-wider block mb-0.5">
                {activeResearchQuestion.title}
              </span>
              <p className="text-sm font-medium text-slate-900 italic font-serif">
                "{activeResearchQuestion.question}"
              </p>
            </div>

            {(activeResearchQuestion.hypothesisNull || activeResearchQuestion.hypothesisAlt) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs font-serif">
                {activeResearchQuestion.hypothesisNull && (
                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-700 block font-sans text-[11px] mb-0.5">
                      Null Hypothesis (H₀):
                    </span>
                    <span className="text-slate-800">{activeResearchQuestion.hypothesisNull}</span>
                  </div>
                )}
                {activeResearchQuestion.hypothesisAlt && (
                  <div className="p-2 rounded bg-blue-50/60 border border-blue-200">
                    <span className="font-bold text-blue-800 block font-sans text-[11px] mb-0.5">
                      Alternative Hypothesis (H₁):
                    </span>
                    <span className="text-slate-800">{activeResearchQuestion.hypothesisAlt}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-slate-300 rounded-lg p-3.5 text-center">
            <p className="text-xs text-slate-500">
              No specific Research Question linked yet. Click{' '}
              <button
                type="button"
                onClick={onOpenAddRqModal}
                className="font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Add Research Question
              </button>{' '}
              or{' '}
              <button
                type="button"
                onClick={onAutoDraftRq}
                className="font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Auto-Draft RQ
              </button>{' '}
              to formalize hypotheses for your study.
            </p>
          </div>
        )}
      </div>

      {/* Dynamic Controls based on selected testType */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. One-Sample t-Test */}
        {testType === 'one_sample_ttest' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Continuous Variable (Sample Data)
              </label>
              <select
                value={selectedDV}
                onChange={(e) => setSelectedDV(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {continuousCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} (Continuous)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hypothesized Test Value (Criterion μ₀)
              </label>
              <input
                type="number"
                step="any"
                value={oneSampleTestValue}
                onChange={(e) => setOneSampleTestValue && setOneSampleTestValue(Number(e.target.value))}
                placeholder="e.g. 0 or 75.0"
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standard population benchmark or baseline criterion
              </span>
            </div>
          </>
        )}

        {/* 2. Independent t-Test */}
        {testType === 'independent_ttest' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dependent Variable (Continuous Outcome)
              </label>
              <select
                value={selectedDV}
                onChange={(e) => setSelectedDV(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {continuousCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} (Continuous)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Grouping Variable (Factor / Cohort)
              </label>
              <select
                value={selectedIV}
                onChange={(e) => setSelectedIV(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {categoricalCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.distinctCount} groups)
                  </option>
                ))}
              </select>
            </div>

            {distinctGroupsInIV.length > 2 && (
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Group 1
                  </label>
                  <select
                    value={selectedGroup1}
                    onChange={(e) => setSelectedGroup1(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50"
                  >
                    {distinctGroupsInIV.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Group 2
                  </label>
                  <select
                    value={selectedGroup2}
                    onChange={(e) => setSelectedGroup2(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50"
                  >
                    {distinctGroupsInIV.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </>
        )}

        {/* 3. Paired t-Test */}
        {testType === 'paired_ttest' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Timepoint 1 / Condition A (Continuous)
              </label>
              <select
                value={selectedDV}
                onChange={(e) => setSelectedDV(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
              >
                {continuousCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Timepoint 2 / Condition B (Continuous)
              </label>
              <select
                value={selectedSecondVar}
                onChange={(e) => setSelectedSecondVar(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
              >
                {continuousCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* 4. One-Way ANOVA */}
        {testType === 'anova' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dependent Variable (Continuous Outcome)
              </label>
              <select
                value={selectedDV}
                onChange={(e) => setSelectedDV(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {continuousCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} (Continuous)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Between-Subjects Factor (Categorical Arm)
              </label>
              <select
                value={selectedIV}
                onChange={(e) => setSelectedIV(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {categoricalCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.distinctCount} levels)
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* 5. Two-Way Factorial ANOVA */}
        {testType === 'two_way_anova' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dependent Variable (Continuous Outcome)
              </label>
              <select
                value={selectedDV}
                onChange={(e) => setSelectedDV(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
              >
                {continuousCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Factor A (Categorical Factor 1)
              </label>
              <select
                value={selectedIV}
                onChange={(e) => setSelectedIV(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
              >
                {categoricalCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.distinctCount} levels)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Factor B (Categorical Factor 2)
              </label>
              <select
                value={selectedFactorB || categoricalCols[1]?.name || categoricalCols[0]?.name}
                onChange={(e) => setSelectedFactorB && setSelectedFactorB(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
              >
                {categoricalCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.distinctCount} levels)
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* 6. Repeated Measures ANOVA */}
        {testType === 'repeated_measures_anova' && (
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select 3 or More Within-Subject Conditions / Repeated Timepoints
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              {continuousCols.map((c) => {
                const isChecked = selectedMultiVars.includes(c.name);
                return (
                  <button
                    type="button"
                    key={c.name}
                    onClick={() => toggleMultiVar(c.name)}
                    className={`px-3 py-1.5 text-xs rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isChecked ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Currently selected: {selectedMultiVars.length} timepoints
            </span>
          </div>
        )}

        {/* 7. ANCOVA */}
        {testType === 'ancova' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dependent Variable (Outcome)
              </label>
              <select
                value={selectedDV}
                onChange={(e) => setSelectedDV(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
              >
                {continuousCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Grouping Factor (Categorical IV)
              </label>
              <select
                value={selectedIV}
                onChange={(e) => setSelectedIV(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
              >
                {categoricalCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.distinctCount} groups)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Covariate (Continuous Confounder to Control)
              </label>
              <select
                value={selectedCovariate || continuousCols.find((c) => c.name !== selectedDV)?.name}
                onChange={(e) => setSelectedCovariate && setSelectedCovariate(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
              >
                {continuousCols
                  .filter((c) => c.name !== selectedDV)
                  .map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} (Covariate)
                    </option>
                  ))}
              </select>
            </div>
          </>
        )}

        {/* 8. Mann-Whitney U Test */}
        {testType === 'mann_whitney' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dependent Variable (Continuous or Ordinal)
              </label>
              <select
                value={selectedDV}
                onChange={(e) => setSelectedDV(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
              >
                {continuousCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Grouping Variable (Factor / Arm)
              </label>
              <select
                value={selectedIV}
                onChange={(e) => setSelectedIV(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
              >
                {categoricalCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.distinctCount} groups)
                  </option>
                ))}
              </select>
            </div>

            {distinctGroupsInIV.length > 2 && (
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Group 1
                  </label>
                  <select
                    value={selectedGroup1}
                    onChange={(e) => setSelectedGroup1(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50"
                  >
                    {distinctGroupsInIV.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Group 2
                  </label>
                  <select
                    value={selectedGroup2}
                    onChange={(e) => setSelectedGroup2(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50"
                  >
                    {distinctGroupsInIV.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </>
        )}

        {/* 9. Wilcoxon Signed-Rank Test */}
        {testType === 'wilcoxon_signed' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Condition 1 / Baseline Timepoint
              </label>
              <select
                value={selectedDV}
                onChange={(e) => setSelectedDV(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
              >
                {continuousCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Condition 2 / Follow-up Timepoint
              </label>
              <select
                value={selectedSecondVar}
                onChange={(e) => setSelectedSecondVar(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
              >
                {continuousCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* 10. Kruskal-Wallis H Test */}
        {testType === 'kruskal_wallis' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dependent Variable (Continuous or Ranked Ordinal)
              </label>
              <select
                value={selectedDV}
                onChange={(e) => setSelectedDV(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
              >
                {continuousCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Between-Subjects Grouping Variable (3+ Groups)
              </label>
              <select
                value={selectedIV}
                onChange={(e) => setSelectedIV(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
              >
                {categoricalCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.distinctCount} groups)
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* 11. Friedman Test */}
        {testType === 'friedman' && (
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select 3 or More Repeated Conditions to Rank
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              {continuousCols.map((c) => {
                const isChecked = selectedMultiVars.includes(c.name);
                return (
                  <button
                    type="button"
                    key={c.name}
                    onClick={() => toggleMultiVar(c.name)}
                    className={`px-3 py-1.5 text-xs rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isChecked ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 12. Multiple Linear Regression */}
        {testType === 'regression' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Criterion Variable / Outcome (DV)
              </label>
              <select
                value={selectedDV}
                onChange={(e) => setSelectedDV(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {continuousCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Predictor Variables (Select 1 or more regressors)
              </label>
              <div className="flex flex-wrap gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg max-h-36 overflow-y-auto">
                {continuousCols
                  .filter((c) => c.name !== selectedDV)
                  .map((c) => {
                    const isChecked = selectedMultiVars.includes(c.name);
                    return (
                      <button
                        type="button"
                        key={c.name}
                        onClick={() => toggleMultiVar(c.name)}
                        className={`px-2.5 py-1 text-xs rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-3.5 h-3.5" />
                        ) : (
                          <Square className="w-3.5 h-3.5" />
                        )}
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </>
        )}

        {/* 13. Binary Logistic Regression */}
        {testType === 'logistic_regression' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Binary Categorical Outcome (DV)
              </label>
              <select
                value={selectedIV}
                onChange={(e) => setSelectedIV(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
              >
                {categoricalCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.distinctCount} categories)
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Predictors of Event Occurrence
              </label>
              <div className="flex flex-wrap gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg max-h-36 overflow-y-auto">
                {continuousCols.map((c) => {
                  const isChecked = selectedMultiVars.includes(c.name);
                  return (
                    <button
                      type="button"
                      key={c.name}
                      onClick={() => toggleMultiVar(c.name)}
                      className={`px-2.5 py-1 text-xs rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isChecked ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* 14. Correlation */}
        {testType === 'correlation' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correlation Metric
              </label>
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setCorrelationMethod('pearson')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    correlationMethod === 'pearson'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pearson (r)
                </button>
                <button
                  type="button"
                  onClick={() => setCorrelationMethod('spearman')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    correlationMethod === 'spearman'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Spearman (ρ)
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Variables Included in Correlation Matrix
              </label>
              <div className="flex flex-wrap gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                {continuousCols.map((c) => {
                  const isChecked = selectedMultiVars.includes(c.name);
                  return (
                    <button
                      type="button"
                      key={c.name}
                      onClick={() => toggleMultiVar(c.name)}
                      className={`px-2.5 py-1 text-xs rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-3.5 h-3.5" />
                      ) : (
                        <Square className="w-3.5 h-3.5" />
                      )}
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* 15. Cronbach's Alpha */}
        {testType === 'cronbach_alpha' && (
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select 2 or More Multi-Item Indicators for Scale Reliability (α)
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              {continuousCols.map((c) => {
                const isChecked = selectedMultiVars.includes(c.name);
                return (
                  <button
                    type="button"
                    key={c.name}
                    onClick={() => toggleMultiVar(c.name)}
                    className={`px-3 py-1.5 text-xs rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isChecked ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Internal consistency reliability will be calculated with item-total correlations and α if deleted.
            </span>
          </div>
        )}

        {/* 16. Chi-Square Test of Independence */}
        {testType === 'chi_square' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Row Variable (Categorical)
              </label>
              <select
                value={selectedIV}
                onChange={(e) => setSelectedIV(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
              >
                {categoricalCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.distinctCount} levels)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Column Variable (Categorical)
              </label>
              <select
                value={selectedSecondVar}
                onChange={(e) => setSelectedSecondVar(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
              >
                {categoricalCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.distinctCount} levels)
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* 17. Chi-Square Goodness-of-Fit */}
        {testType === 'chi_square_gof' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Categorical Variable for Distribution Check
            </label>
            <select
              value={selectedIV}
              onChange={(e) => setSelectedIV(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
            >
              {categoricalCols.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.distinctCount} categories)
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Tests whether counts across {selectedIV || 'categories'} differ from an equal distribution.
            </span>
          </div>
        )}

        {/* 18. Descriptive Stats */}
        {testType === 'descriptive' && (
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Variables for Descriptive Profiling & Normality Auditing
            </label>
            <div className="flex flex-wrap gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
              {continuousCols.map((c) => {
                const isChecked = selectedMultiVars.includes(c.name);
                return (
                  <button
                    type="button"
                    key={c.name}
                    onClick={() => toggleMultiVar(c.name)}
                    className={`px-2.5 py-1 text-xs rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-3.5 h-3.5" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 19. Exploratory Factor Analysis (EFA) */}
        {testType === 'exploratory_factor_analysis' && (
          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Select Observed Indicators for Factor Extraction (Minimum 3 items)
              </label>
              <span className="text-[11px] font-mono text-indigo-600 font-bold">
                {selectedMultiVars.length} Items Selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg max-h-40 overflow-y-auto">
              {continuousCols.map((c) => {
                const isChecked = selectedMultiVars.includes(c.name);
                return (
                  <button
                    type="button"
                    key={c.name}
                    onClick={() => toggleMultiVar(c.name)}
                    className={`px-2.5 py-1 text-xs rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isChecked ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block font-mono">
              Extraction: Principal Axis Factoring · Rotation: Kaiser-normalized Varimax · Retention: Kaiser (λ &gt; 1.0)
            </span>
          </div>
        )}

        {/* 20. Confirmatory Factor Analysis (CFA) */}
        {testType === 'confirmatory_factor_analysis' && (
          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Select Indicators for Hypothesized Multi-Factor Measurement Model
              </label>
              <span className="text-[11px] font-mono text-blue-600 font-bold">
                {selectedMultiVars.length} Indicators Selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg max-h-40 overflow-y-auto">
              {continuousCols.map((c) => {
                const isChecked = selectedMultiVars.includes(c.name);
                return (
                  <button
                    type="button"
                    key={c.name}
                    onClick={() => toggleMultiVar(c.name)}
                    className={`px-2.5 py-1 text-xs rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isChecked ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block font-mono">
              Evaluates Hu &amp; Bentler (1999) fit suite (CFI, TLI, RMSEA, SRMR) and construct validity (CR &gt; .70, AVE &gt; .50).
            </span>
          </div>
        )}

        {/* 21. Structural Equation Modeling (SEM) */}
        {testType === 'structural_equation_modeling' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Exogenous Predictor / Independent Construct
              </label>
              <select
                value={selectedIV}
                onChange={(e) => setSelectedIV(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
              >
                {continuousCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Endogenous Outcome / Dependent Construct
              </label>
              <select
                value={selectedDV}
                onChange={(e) => setSelectedDV(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none"
              >
                {continuousCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observed Indicators / Mediators in Structural Equation Network
              </label>
              <div className="flex flex-wrap gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg max-h-36 overflow-y-auto">
                {continuousCols.map((c) => {
                  const isChecked = selectedMultiVars.includes(c.name);
                  return (
                    <button
                      type="button"
                      key={c.name}
                      onClick={() => toggleMultiVar(c.name)}
                      className={`px-2.5 py-1 text-xs rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-cyan-700 text-white border-cyan-700 font-semibold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isChecked ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Execution Action Button */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Real-time APA 7th mathematical verification & assumption auditing</span>
        </div>

        <button
          type="button"
          onClick={handleExecuteClick}
          disabled={isExecuting}
          className={`px-6 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
            executedRecently
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-300'
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
          }`}
          title="Run statistical analysis and compute APA 7th publication results"
        >
          {isExecuting ? (
            <>
              <Repeat className="w-3.5 h-3.5 animate-spin" />
              <span>Computing Analysis...</span>
            </>
          ) : executedRecently ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Analysis Computed & Verified!</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run / Check Analysis</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
