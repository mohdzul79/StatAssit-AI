import React, { useState, useEffect } from 'react';
import { X, HelpCircle, Sparkles, Check, BookOpen, ArrowLeft } from 'lucide-react';
import { ResearchQuestion, StatisticalTestType, Dataset } from '../types/stats';
import { autoDraftResearchQuestion } from '../utils/hypothesisHelper';

interface ResearchQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rq: ResearchQuestion) => void;
  dataset: Dataset;
  editingRq?: ResearchQuestion | null;
  currentTestType?: StatisticalTestType;
  currentDV?: string;
  currentIV?: string;
  currentMultiVars?: string[];
}

export const ResearchQuestionModal: React.FC<ResearchQuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  dataset,
  editingRq,
  currentTestType = 'independent_ttest',
  currentDV = '',
  currentIV = '',
  currentMultiVars = [],
}) => {
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [hypothesisNull, setHypothesisNull] = useState('');
  const [hypothesisAlt, setHypothesisAlt] = useState('');
  const [testType, setTestType] = useState<StatisticalTestType>(currentTestType);
  const [dependentVar, setDependentVar] = useState(currentDV);
  const [independentVar, setIndependentVar] = useState(currentIV);
  const [secondVar, setSecondVar] = useState(editingRq?.secondVar || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isTitleValid = title.trim().length > 0;
  const isQuestionValid = question.trim().length > 0;
  const canSubmit = isTitleValid && isQuestionValid && !isSubmitting;

  const continuousCols = dataset.columns.filter((c) => c.type === 'continuous');
  const categoricalCols = dataset.columns.filter((c) => c.type === 'categorical');
  const allCols = dataset.columns;

  useEffect(() => {
    if (editingRq) {
      setTitle(editingRq.title);
      setQuestion(editingRq.question);
      setHypothesisNull(editingRq.hypothesisNull || '');
      setHypothesisAlt(editingRq.hypothesisAlt || '');
      setTestType(editingRq.testType || currentTestType);
      setDependentVar(editingRq.dependentVar || currentDV);
      setIndependentVar(editingRq.independentVar || currentIV);
      setSecondVar(editingRq.secondVar || '');
      setNotes(editingRq.notes || '');
    } else {
      // Auto-draft defaults
      const nextIndex = (dataset.researchQuestions?.length || 0) + 1;
      const initialDv = currentDV || continuousCols[0]?.name || allCols[0]?.name || '';
      const initialIv = currentIV || categoricalCols[0]?.name || allCols[1]?.name || '';
      const draft = autoDraftResearchQuestion({
        testType: currentTestType,
        dependentVar: initialDv,
        independentVar: initialIv,
        secondVar: '',
        multiVars: currentMultiVars,
      });

      setTitle(`RQ${nextIndex}: ${draft.title.replace(/^RQ:\s*/, '')}`);
      setQuestion(draft.question);
      setHypothesisNull(draft.hypothesisNull || '');
      setHypothesisAlt(draft.hypothesisAlt || '');
      setTestType(currentTestType);
      setDependentVar(initialDv);
      setIndependentVar(initialIv);
      setSecondVar('');
      setNotes('');
    }
  }, [editingRq, isOpen, dataset, currentTestType, currentDV, currentIV]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const generateDraftTitleAndContent = (
    dv: string,
    iv: string,
    tType: StatisticalTestType,
    sVar: string = secondVar
  ) => {
    const draft = autoDraftResearchQuestion({
      testType: tType,
      dependentVar: dv,
      independentVar: iv,
      secondVar: sVar,
      multiVars: currentMultiVars,
    });

    const prefix =
      editingRq?.title?.match(/^RQ\d+:\s*/)?.[0] ||
      (dataset.researchQuestions ? `RQ${dataset.researchQuestions.length + (editingRq ? 0 : 1)}: ` : 'RQ1: ');
    const cleanTitle = draft.title.replace(/^RQ:\s*/, '');
    const newTitle = `${prefix}${cleanTitle}`;

    return {
      title: newTitle,
      question: draft.question,
      hypothesisNull: draft.hypothesisNull || '',
      hypothesisAlt: draft.hypothesisAlt || '',
    };
  };

  const handleDependentVarChange = (newDV: string) => {
    setDependentVar(newDV);
    const drafted = generateDraftTitleAndContent(newDV, independentVar, testType, secondVar);
    setTitle(drafted.title);
    setQuestion(drafted.question);
    setHypothesisNull(drafted.hypothesisNull);
    setHypothesisAlt(drafted.hypothesisAlt);
  };

  const handleIndependentVarChange = (newIV: string) => {
    setIndependentVar(newIV);
    const drafted = generateDraftTitleAndContent(dependentVar, newIV, testType, secondVar);
    setTitle(drafted.title);
    setQuestion(drafted.question);
    setHypothesisNull(drafted.hypothesisNull);
    setHypothesisAlt(drafted.hypothesisAlt);
  };

  const handleSecondVarChange = (newSVar: string) => {
    setSecondVar(newSVar);
    const drafted = generateDraftTitleAndContent(dependentVar, independentVar, testType, newSVar);
    setTitle(drafted.title);
    setQuestion(drafted.question);
    setHypothesisNull(drafted.hypothesisNull);
    setHypothesisAlt(drafted.hypothesisAlt);
  };

  const handleTestTypeChange = (newTest: StatisticalTestType) => {
    setTestType(newTest);
    const drafted = generateDraftTitleAndContent(dependentVar, independentVar, newTest, secondVar);
    setTitle(drafted.title);
    setQuestion(drafted.question);
    setHypothesisNull(drafted.hypothesisNull);
    setHypothesisAlt(drafted.hypothesisAlt);
  };

  const handleAutoDraft = () => {
    const drafted = generateDraftTitleAndContent(dependentVar, independentVar, testType, secondVar);
    setTitle(drafted.title);
    setQuestion(drafted.question);
    setHypothesisNull(drafted.hypothesisNull);
    setHypothesisAlt(drafted.hypothesisAlt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const newRq: ResearchQuestion = {
        id: editingRq ? editingRq.id : `rq-${Date.now()}`,
        title: title.trim() || `Research Question ${(dataset.researchQuestions?.length || 0) + 1}`,
        question: question.trim(),
        hypothesisNull: hypothesisNull.trim(),
        hypothesisAlt: hypothesisAlt.trim(),
        testType,
        dependentVar,
        independentVar,
        secondVar: secondVar || undefined,
        multiVars: currentMultiVars,
        notes: notes.trim(),
      };

      onSave(newRq);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingRq ? 'Edit Research Question' : 'Add New Research Question (RQ)'}
              </h3>
              <p className="text-xs text-slate-500">
                Formulate an empirical research question and corresponding null (H₀) & alternative (H₁) hypotheses.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Title / Label
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {dependentVar && (
                  <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Outcome / DV: <strong className="font-semibold text-blue-800">{dependentVar}</strong>
                  </span>
                )}
                {independentVar && (
                  <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Factor / IV: <strong className="font-semibold text-indigo-800">{independentVar}</strong>
                  </span>
                )}
              </div>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. RQ1: Mindfulness Intervention on Exam Performance"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-800"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Statistical Test
              </label>
              <select
                value={testType}
                onChange={(e) => handleTestTypeChange(e.target.value as StatisticalTestType)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <optgroup label="APA I: Mean Comparisons (Parametric)">
                  <option value="independent_ttest">Independent Samples t-Test</option>
                  <option value="paired_ttest">Paired Samples t-Test</option>
                  <option value="one_sample_ttest">One-Sample t-Test</option>
                  <option value="anova">One-Way ANOVA (Between-Subjects)</option>
                  <option value="two_way_anova">Two-Way Factorial ANOVA (A × B)</option>
                  <option value="repeated_measures_anova">Repeated Measures ANOVA (Within-Subjects)</option>
                  <option value="ancova">Analysis of Covariance (ANCOVA)</option>
                </optgroup>
                <optgroup label="APA II: Non-Parametric & Rank-Based Comparisons">
                  <option value="mann_whitney">Mann-Whitney U Test (2 Groups)</option>
                  <option value="wilcoxon_signed">Wilcoxon Signed-Rank Test (Paired)</option>
                  <option value="kruskal_wallis">Kruskal-Wallis H Test (3+ Groups)</option>
                  <option value="friedman">Friedman Repeated Measures Test</option>
                </optgroup>
                <optgroup label="APA III: Prediction & Regression">
                  <option value="regression">Multiple Linear Regression (OLS)</option>
                  <option value="logistic_regression">Binary Logistic Regression</option>
                </optgroup>
                <optgroup label="APA IV: Associations & Scale Reliability">
                  <option value="correlation">Pearson / Spearman Correlation</option>
                  <option value="cronbach_alpha">Cronbach's Alpha Scale Reliability</option>
                </optgroup>
                <optgroup label="APA V: Categorical Frequencies & Proportions">
                  <option value="chi_square">Chi-Square Test of Independence</option>
                  <option value="chi_square_gof">Chi-Square Goodness-of-Fit Test</option>
                </optgroup>
                <optgroup label="APA VI: Descriptive Baseline">
                  <option value="descriptive">Descriptive Statistics & Normality</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {['paired_ttest', 'wilcoxon_signed'].includes(testType)
                  ? 'Baseline / Measurement 1 (DV)'
                  : ['correlation'].includes(testType)
                  ? 'First Variable (X)'
                  : 'Outcome / Dependent Variable (DV)'}
              </label>
              <select
                value={dependentVar}
                onChange={(e) => handleDependentVarChange(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-800"
              >
                <option value="">(None / General)</option>
                {continuousCols.length > 0 && (
                  <optgroup label="Continuous Variables">
                    {continuousCols.map((c) => (
                      <option key={`c-${c.name}`} value={c.name}>
                        {c.name} (Continuous)
                      </option>
                    ))}
                  </optgroup>
                )}
                {dataset.columns.filter((c) => c.type !== 'continuous').length > 0 && (
                  <optgroup label="Other Variables">
                    {dataset.columns
                      .filter((c) => c.type !== 'continuous')
                      .map((c) => (
                        <option key={`o-${c.name}`} value={c.name}>
                          {c.name} ({c.type})
                        </option>
                      ))}
                  </optgroup>
                )}
              </select>
            </div>

            {[
              'independent_ttest',
              'anova',
              'two_way_anova',
              'ancova',
              'mann_whitney',
              'kruskal_wallis',
              'regression',
              'logistic_regression',
              'chi_square',
              'chi_square_gof',
            ].includes(testType) && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Factor / Independent Variable (IV)
                </label>
                <select
                  value={independentVar}
                  onChange={(e) => handleIndependentVarChange(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-800"
                >
                  <option value="">(None / General Factor)</option>
                  {categoricalCols.length > 0 && (
                    <optgroup label="Categorical Factors / Groups">
                      {categoricalCols.map((c) => (
                        <option key={`iv-cat-${c.name}`} value={c.name}>
                          {c.name} (Categorical)
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="All Variables">
                    {allCols.map((c) => (
                      <option key={`iv-all-${c.name}`} value={c.name}>
                        {c.name} ({c.type})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            )}

            {['paired_ttest', 'wilcoxon_signed', 'correlation', 'two_way_anova', 'ancova'].includes(testType) && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {['paired_ttest', 'wilcoxon_signed'].includes(testType)
                    ? 'Post-Test / Measurement 2'
                    : ['correlation'].includes(testType)
                    ? 'Second Variable (Y)'
                    : ['ancova'].includes(testType)
                    ? 'Covariate Variable'
                    : 'Factor B (Second Factor)'}
                </label>
                <select
                  value={secondVar}
                  onChange={(e) => handleSecondVarChange(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-800"
                >
                  <option value="">(None / General)</option>
                  {allCols.map((c) => (
                    <option key={`svar-${c.name}`} value={c.name}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Research Question (Formal Phrasing)
              </label>
              <button
                type="button"
                onClick={handleAutoDraft}
                className="text-[11px] font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline transition-colors cursor-pointer"
                title={
                  dependentVar
                    ? `Auto-draft Title/Label, Research Question, and Hypotheses for ${dependentVar}`
                    : 'Automatically draft research question and hypotheses based on selected test and variables'
                }
              >
                <Sparkles className="w-3 h-3 text-blue-500" />
                <span>{dependentVar ? `Auto-Draft for ${dependentVar}` : 'Auto-Draft Phrasing'}</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Does the 8-week mindfulness meditation intervention significantly improve student exam scores compared to the control group?"
              className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Null Hypothesis (H₀)
              </label>
              <textarea
                rows={2}
                value={hypothesisNull}
                onChange={(e) => setHypothesisNull(e.target.value)}
                placeholder="e.g. H₀: There is no significant difference between mindfulness and control groups (μ₁ = μ₂)."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-serif"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alternative Hypothesis (H₁)
              </label>
              <textarea
                rows={2}
                value={hypothesisAlt}
                onChange={(e) => setHypothesisAlt(e.target.value)}
                placeholder="e.g. H₁: Students in the mindfulness group achieve significantly higher exam scores (μ₁ > μ₂)."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-serif"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
            {canSubmit ? (
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>Ready to save</span>
              </span>
            ) : (
              <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span>
                  {!isTitleValid
                    ? 'Title / Label required'
                    : 'Research question phrasing required'}
                </span>
              </span>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:text-slate-900 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                title="Cancel and return back to page"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>Cancel / Back to Page</span>
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-sm ${
                  canSubmit
                    ? 'text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] cursor-pointer shadow-blue-500/20'
                    : 'text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed shadow-none'
                }`}
                title={
                  !isTitleValid
                    ? 'Please enter a Title / Label to save'
                    : !isQuestionValid
                    ? 'Please enter the Research Question phrasing to save'
                    : editingRq
                    ? 'Save changes to this research question'
                    : 'Add this research question'
                }
              >
                <Check className={`w-3.5 h-3.5 ${canSubmit ? 'text-white' : 'text-slate-400'}`} />
                <span>
                  {isSubmitting
                    ? 'Saving...'
                    : editingRq
                    ? 'Save Changes'
                    : 'Add Research Question'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
