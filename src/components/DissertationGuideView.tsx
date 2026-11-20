import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Compass,
  Users,
  ShieldCheck,
  HelpCircle,
  BookOpen,
  FileText,
  Calculator,
  Lightbulb,
  RotateCcw,
} from 'lucide-react';
import { StatisticalTestType } from '../types/stats';
import {
  DISSERTATION_CHAPTERS,
  SAMPLING_TECHNIQUES,
  DISSERTATION_QUIZ,
  DissertationChapterId,
} from '../data/dissertationGuideData';

interface DissertationGuideViewProps {
  onLaunchTutorialTest?: (testType: StatisticalTestType) => void;
  onClose: () => void;
}

const CHAPTER_ICONS: Record<DissertationChapterId, React.ComponentType<{ className?: string }>> = {
  essentials: GraduationCap,
  questions: HelpCircle,
  literature: BookOpen,
  strategy: Compass,
  sampling: Users,
  ethics: ShieldCheck,
  writing: FileText,
};

const ESSENTIALS_MILESTONES = [
  'Narrowed research topic & verified empirical feasibility',
  'Drafted concise 12–18 word working title with key constructs',
  'Confirmed institutional chapter structure & word-count limits',
  'Identified primary data access & target population',
  'Aligned research questions with StatAssist AI statistical plan',
  'Prepared ethics proposal & participant consent documentation',
];

const ETHICS_CHECKS = [
  { id: 'harm', label: 'Minimising Risk of Harm (physical, emotional, reputational safeguards)' },
  { id: 'consent', label: 'Informed Consent Sheet & Voluntary Participation Form prepared' },
  { id: 'anon', label: 'Anonymity / Confidentiality & encrypted data storage protocol defined' },
  { id: 'deception', label: 'Full transparency (no undisclosed deception; debriefing ready if needed)' },
  { id: 'withdraw', label: 'Explicit Right to Withdraw without penalty communicated to participants' },
];

export const DissertationGuideView: React.FC<DissertationGuideViewProps> = ({
  onLaunchTutorialTest,
  onClose,
}) => {
  const [activeChapterId, setActiveChapterId] = useState<DissertationChapterId>('essentials');
  const [expandedSubIds, setExpandedSubIds] = useState<Set<string>>(
    () => new Set(['ess-topic-title', 'rq-types', 'lit-synthesis', 'strat-quant-designs', 'samp-fundamentals', 'eth-principles', 'wr-data-prep'])
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Part 1 Interactive State: Milestones & Title Builder
  const [checkedMilestones, setCheckedMilestones] = useState<Set<number>>(() => new Set([0, 1]));
  const [titleIv, setTitleIv] = useState('Mindfulness Training');
  const [titleDv, setTitleDv] = useState('Academic Exam Performance');
  const [titlePop, setTitlePop] = useState('Undergraduate STEM Students');

  // Part 2 Interactive State: Quantitative RQ & Hypothesis Builder
  const [rqMode, setRqMode] = useState<'descriptive' | 'comparative' | 'relationship'>('comparative');
  const [rqVar1, setRqVar1] = useState('Exam Score');
  const [rqVar2, setRqVar2] = useState('Mindfulness vs. Control Groups');
  const [rqPop, setRqPop] = useState('first-year university students');

  // Part 4 Interactive State: Research Design Selector
  const [designGoal, setDesignGoal] = useState<'describe' | 'compare' | 'relate'>('compare');
  const [manipulatesIv, setManipulatesIv] = useState<boolean>(true);
  const [randomAssign, setRandomAssign] = useState<boolean>(false);

  // Part 5 Interactive State: Sampling Explorer & Sample Size Calculator
  const [samplingFilter, setSamplingFilter] = useState<'all' | 'probability' | 'non-probability'>('all');
  const [selectedSamplingId, setSelectedSamplingId] = useState<string>('stratified');
  const [popSizeInput, setPopSizeInput] = useState<string>('1200');
  const [confidenceLevel, setConfidenceLevel] = useState<90 | 95 | 99>(95);
  const [marginError, setMarginError] = useState<number>(5);

  // Part 6 Interactive State: Ethics Audit
  const [checkedEthics, setCheckedEthics] = useState<Set<string>>(() => new Set(['harm', 'consent', 'anon']));

  // Part 7 Interactive State: Methodology Quiz
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  const activeChapter = useMemo(
    () => DISSERTATION_CHAPTERS.find((c) => c.id === activeChapterId) || DISSERTATION_CHAPTERS[0],
    [activeChapterId]
  );

  const toggleSub = (id: string) => {
    setExpandedSubIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Part 2 generated RQ & Hypotheses
  const generatedRq = useMemo(() => {
    const v1 = rqVar1.trim() || '[Dependent Variable]';
    const v2 = rqVar2.trim() || '[Groups / Predictor]';
    const pop = rqPop.trim() || '[Target Population]';

    if (rqMode === 'descriptive') {
      return {
        rq: `What are the mean level, dispersion, and distribution of ${v1} among ${pop}?`,
        h0: 'Descriptive questions summarise population parameters (M, SD, Mdn, IQR) rather than testing a formal null hypothesis.',
        h1: 'Report central tendency, spread, 95% confidence interval, and normality diagnostics (Shapiro-Wilk).',
        testType: 'descriptive' as StatisticalTestType,
        testLabel: 'Descriptive Statistics',
      };
    }
    if (rqMode === 'comparative') {
      return {
        rq: `Is there a statistically significant difference in ${v1} across ${v2} among ${pop}?`,
        h0: `H₀: There is no statistically significant difference in mean ${v1} across ${v2} (μ₁ = μ₂).`,
        h1: `H₁: There is a statistically significant difference in mean ${v1} across ${v2} (μ₁ ≠ μ₂).`,
        testType: 'independent_ttest' as StatisticalTestType,
        testLabel: 'Independent-Samples t-Test / ANOVA',
      };
    }
    return {
      rq: `To what extent is there a statistically significant relationship between ${v2} and ${v1} among ${pop}?`,
      h0: `H₀: ${v2} does not significantly correlate with or predict ${v1} (r = 0; β = 0).`,
      h1: `H₁: ${v2} significantly correlates with or predicts ${v1} (r ≠ 0; β ≠ 0).`,
      testType: 'regression' as StatisticalTestType,
      testLabel: 'Correlation / Linear Regression',
    };
  }, [rqMode, rqVar1, rqVar2, rqPop]);

  // Part 4 recommended Research Design
  const designRecommendation = useMemo(() => {
    if (designGoal === 'describe') {
      return {
        design: 'Descriptive Quantitative Research Design',
        paradigm: 'Positivist / Post-Positivist (Deductive)',
        validityNote: 'Guard against sampling bias, non-response bias, and low instrument reliability.',
        testType: 'descriptive' as StatisticalTestType,
        testLabel: 'Descriptive Statistics & Normality',
      };
    }
    if (designGoal === 'relate') {
      return {
        design: 'Relationship-Based (Correlational / Predictive) Design',
        paradigm: 'Post-Positivist (Deductive)',
        validityNote: 'Correlation does not establish causation; check multicollinearity (VIF < 5) and potential confounders.',
        testType: 'regression' as StatisticalTestType,
        testLabel: 'Correlation & Multiple Regression',
      };
    }
    if (manipulatesIv && randomAssign) {
      return {
        design: 'True Experimental Design (RCT / Pre-Post Control)',
        paradigm: 'Positivist (Strong Causal Inference)',
        validityNote: 'Monitor participant attrition, experimenter expectancy, and diffusion of treatment across groups.',
        testType: 'independent_ttest' as StatisticalTestType,
        testLabel: 'Independent t-Test / One-Way ANOVA',
      };
    }
    if (manipulatesIv && !randomAssign) {
      return {
        design: 'Quasi-Experimental Design (Non-Equivalent Groups)',
        paradigm: 'Post-Positivist',
        validityNote: 'Selection bias is the primary threat; measure and control baseline differences using ANCOVA.',
        testType: 'ancova' as StatisticalTestType,
        testLabel: 'One-Way ANCOVA',
      };
    }
    return {
      design: 'Comparative Non-Experimental (Ex Post Facto) Design',
      paradigm: 'Post-Positivist',
      validityNote: 'Naturally occurring group membership prevents causal claims; control demographic covariates where possible.',
      testType: 'anova' as StatisticalTestType,
      testLabel: 'One-Way ANOVA / Kruskal-Wallis',
    };
  }, [designGoal, manipulatesIv, randomAssign]);

  // Part 5 Sampling Explorer & Cochran Sample Size Calculation
  const filteredSampling = useMemo(() => {
    if (samplingFilter === 'all') return SAMPLING_TECHNIQUES;
    return SAMPLING_TECHNIQUES.filter((s) => s.family === samplingFilter);
  }, [samplingFilter]);

  const activeSampling = useMemo(
    () =>
      filteredSampling.find((s) => s.id === selectedSamplingId) ||
      filteredSampling[0] ||
      SAMPLING_TECHNIQUES[0],
    [filteredSampling, selectedSamplingId]
  );

  const recommendedSampleSize = useMemo(() => {
    const zMap: Record<90 | 95 | 99, number> = { 90: 1.645, 95: 1.96, 99: 2.576 };
    const z = zMap[confidenceLevel];
    const e = Math.max(0.01, marginError / 100);
    const p = 0.5;
    const n0 = (z * z * p * (1 - p)) / (e * e);
    const popN = parseInt(popSizeInput, 10);
    if (!Number.isNaN(popN) && popN > 0) {
      return Math.ceil(n0 / (1 + (n0 - 1) / popN));
    }
    return Math.ceil(n0);
  }, [confidenceLevel, marginError, popSizeInput]);

  // Part 6 Ethics Statement Generator
  const ethicsStatement = useMemo(() => {
    const activeLabels = ETHICS_CHECKS.filter((c) => checkedEthics.has(c.id)).map((c) => c.label.split(' (')[0]);
    if (activeLabels.length === 0) {
      return 'Select your study’s ethical safeguards above to generate a Chapter 3 Ethics Statement.';
    }
    return `Ethical approval was secured from the institutional Research Ethics Committee prior to data collection. In accordance with StatAssist AI Dissertations ethical governance standards, this study strictly upheld ${activeLabels.join('; ')}. All digital records were stored securely in encrypted, password-protected institutional storage accessible solely to the research team.`;
  }, [checkedEthics]);

  const quizScore = useMemo(() => {
    return DISSERTATION_QUIZ.reduce((acc, q) => {
      return acc + (quizAnswers[q.id] === q.correctIndex ? 1 : 0);
    }, 0);
  }, [quizAnswers]);

  const milestonePct = Math.round((checkedMilestones.size / ESSENTIALS_MILESTONES.length) * 100);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Top Banner + Chapter Tabs */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-200 bg-slate-50/60 shrink-0 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600 text-white">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                StatAssist AI Dissertations
              </h3>
              <p className="text-[11px] text-slate-500">
                Interactive step-by-step guide from research topic and design to sampling, ethics, and APA 7th write-up
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            7 Interactive Modules
          </span>
        </div>

        {/* Horizontal Chapter Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {DISSERTATION_CHAPTERS.map((chap) => {
            const Icon = CHAPTER_ICONS[chap.id];
            const isSelected = chap.id === activeChapter.id;
            return (
              <button
                key={chap.id}
                type="button"
                onClick={() => setActiveChapterId(chap.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all inline-flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{chap.badge}: {chap.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Chapter Content + Interactive Lab */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
        {/* Chapter Header */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              {activeChapter.badge}
            </span>
            <span className="text-xs text-slate-500">{activeChapter.subtitle}</span>
          </div>
          <h4 className="text-lg font-bold text-slate-900">{activeChapter.title}</h4>
          <p className="text-xs text-slate-600 leading-relaxed">{activeChapter.overview}</p>
        </div>

        {/* Interactive Accordions for All Subsections */}
        <div className="space-y-2.5">
          {activeChapter.subsections.map((sub) => {
            const isOpen = expandedSubIds.has(sub.id);
            return (
              <div
                key={sub.id}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggleSub(sub.id)}
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">{sub.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{sub.summary}</div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3 bg-slate-50/40">
                    <ul className="space-y-1.5">
                      {sub.keyPoints.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>

                    {sub.academicTip && (
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>StatAssist AI Tip:</strong> {sub.academicTip}
                        </span>
                      </div>
                    )}

                    {sub.writeUpTemplate && (
                      <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Write-Up Template
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(sub.id, sub.writeUpTemplate!)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            {copiedId === sub.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-slate-700 italic leading-relaxed">
                          &ldquo;{sub.writeUpTemplate}&rdquo;
                        </p>
                      </div>
                    )}

                    {sub.recommendedTest && onLaunchTutorialTest && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onLaunchTutorialTest(sub.recommendedTest!);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{sub.recommendedTestLabel || 'Launch in StatAssist AI'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ==================== CHAPTER-SPECIFIC INTERACTIVE WORKBENCH ==================== */}

        {/* PART 1 LAB: Dissertation Progress Checklist & Title Builder */}
        {activeChapter.id === 'essentials' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Interactive Readiness Checklist
                </h5>
                <span className="text-xs font-mono font-bold text-blue-700">{milestonePct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${milestonePct}%` }}
                />
              </div>
              <div className="space-y-1.5">
                {ESSENTIALS_MILESTONES.map((item, idx) => {
                  const done = checkedMilestones.has(idx);
                  return (
                    <label
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() =>
                          setCheckedMilestones((prev) => {
                            const next = new Set(prev);
                            if (next.has(idx)) next.delete(idx);
                            else next.add(idx);
                            return next;
                          })
                        }
                        className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={done ? 'line-through text-slate-400' : ''}>{item}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Interactive Working Title Composer
                </h5>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      'title-gen',
                      `The Effect of ${titleIv} on ${titleDv} Among ${titlePop}: A Quantitative Investigation`
                    )
                  }
                  className="text-[11px] font-semibold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === 'title-gen' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === 'title-gen' ? 'Copied' : 'Copy Title'}</span>
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <input
                  type="text"
                  value={titleIv}
                  onChange={(e) => setTitleIv(e.target.value)}
                  placeholder="Independent Variable / Intervention"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                />
                <input
                  type="text"
                  value={titleDv}
                  onChange={(e) => setTitleDv(e.target.value)}
                  placeholder="Dependent Variable / Outcome"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                />
                <input
                  type="text"
                  value={titlePop}
                  onChange={(e) => setTitlePop(e.target.value)}
                  placeholder="Target Population"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                />
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800">
                &ldquo;The Effect of {titleIv || '[IV]'} on {titleDv || '[DV]'} Among {titlePop || '[Population]'}: A Quantitative Investigation&rdquo;
              </div>
            </div>
          </div>
        )}

        {/* PART 2 LAB: Interactive Research Question & Hypothesis Generator */}
        {activeChapter.id === 'questions' && (
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Interactive Quantitative Research Question Builder
              </h5>
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-[11px] font-semibold">
                {(['descriptive', 'comparative', 'relationship'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setRqMode(m)}
                    className={`px-2.5 py-1 rounded-md capitalize cursor-pointer transition-colors ${
                      rqMode === m ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Outcome / Dependent Variable
                </label>
                <input
                  type="text"
                  value={rqVar1}
                  onChange={(e) => setRqVar1(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  {rqMode === 'comparative' ? 'Groups / Factor' : 'Predictor / Covariate'}
                </label>
                <input
                  type="text"
                  value={rqVar2}
                  onChange={(e) => setRqVar2(e.target.value)}
                  disabled={rqMode === 'descriptive'}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Target Population
                </label>
                <input
                  type="text"
                  value={rqPop}
                  onChange={(e) => setRqPop(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1.5 text-xs">
              <div>
                <span className="font-bold text-blue-700">RQ: </span>
                <span className="text-slate-900 font-medium">{generatedRq.rq}</span>
              </div>
              <div className="text-slate-600">{generatedRq.h0}</div>
              <div className="text-slate-600">{generatedRq.h1}</div>
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleCopy('rq-gen', `RQ: ${generatedRq.rq}\n${generatedRq.h0}\n${generatedRq.h1}`)
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === 'rq-gen' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === 'rq-gen' ? 'Copied' : 'Copy RQ & Hypotheses'}</span>
                </button>
                {onLaunchTutorialTest && (
                  <button
                    type="button"
                    onClick={() => {
                      onLaunchTutorialTest(generatedRq.testType);
                      onClose();
                    }}
                    className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Run {generatedRq.testLabel} in StatAssist AI</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PART 4 LAB: Interactive Research Design Selector */}
        {activeChapter.id === 'strategy' && (
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Interactive Quantitative Research Design Selector
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">
                  1. Primary Analytic Goal
                </div>
                <select
                  value={designGoal}
                  onChange={(e) => setDesignGoal(e.target.value as 'describe' | 'compare' | 'relate')}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                >
                  <option value="describe">Describe / Profile a Sample</option>
                  <option value="compare">Compare Group Differences</option>
                  <option value="relate">Test Relationships / Predict Outcomes</option>
                </select>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">
                  2. Do You Manipulate an IV?
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    disabled={designGoal !== 'compare'}
                    onClick={() => setManipulatesIv(true)}
                    className={`flex-1 py-1.5 rounded-lg border font-semibold cursor-pointer disabled:opacity-40 ${
                      manipulatesIv && designGoal === 'compare'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    disabled={designGoal !== 'compare'}
                    onClick={() => setManipulatesIv(false)}
                    className={`flex-1 py-1.5 rounded-lg border font-semibold cursor-pointer disabled:opacity-40 ${
                      !manipulatesIv && designGoal === 'compare'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">
                  3. Random Assignment Used?
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    disabled={designGoal !== 'compare' || !manipulatesIv}
                    onClick={() => setRandomAssign(true)}
                    className={`flex-1 py-1.5 rounded-lg border font-semibold cursor-pointer disabled:opacity-40 ${
                      randomAssign && designGoal === 'compare' && manipulatesIv
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    disabled={designGoal !== 'compare' || !manipulatesIv}
                    onClick={() => setRandomAssign(false)}
                    className={`flex-1 py-1.5 rounded-lg border font-semibold cursor-pointer disabled:opacity-40 ${
                      !randomAssign && designGoal === 'compare' && manipulatesIv
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-indigo-200 space-y-1.5 text-xs">
              <div className="font-bold text-indigo-800">{designRecommendation.design}</div>
              <div className="text-slate-600">
                <strong>Aligned Paradigm:</strong> {designRecommendation.paradigm}
              </div>
              <div className="text-slate-600">
                <strong>Validity Watch-Out:</strong> {designRecommendation.validityNote}
              </div>
              {onLaunchTutorialTest && (
                <button
                  type="button"
                  onClick={() => {
                    onLaunchTutorialTest(designRecommendation.testType);
                    onClose();
                  }}
                  className="mt-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Open {designRecommendation.testLabel} Preset</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* PART 5 LAB: Interactive 11-Technique Sampling Explorer & Sample Size Calculator */}
        {activeChapter.id === 'sampling' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Interactive Sampling Technique Explorer (11 Methods)
                </h5>
                <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-[11px] font-semibold">
                  {(['all', 'probability', 'non-probability'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSamplingFilter(f)}
                      className={`px-2.5 py-1 rounded-md capitalize cursor-pointer ${
                        samplingFilter === f ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {f === 'all' ? 'All (11)' : f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {filteredSampling.map((tech) => (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => setSelectedSamplingId(tech.id)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold cursor-pointer transition-colors ${
                      activeSampling.id === tech.id
                        ? tech.family === 'probability'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {tech.name}
                  </button>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2.5 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 text-sm">{activeSampling.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      activeSampling.family === 'probability'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {activeSampling.family}
                  </span>
                </div>
                <p className="text-slate-700">
                  <strong>Best For:</strong> {activeSampling.bestFor}
                </p>
                <p className="text-slate-600">
                  <strong>How It Works:</strong> {activeSampling.howItWorks}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
                    <div className="font-bold text-emerald-800 text-[11px] mb-1">Strengths</div>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-700">
                      {activeSampling.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200">
                    <div className="font-bold text-rose-800 text-[11px] mb-1">Limitations</div>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-700">
                      {activeSampling.limitations.map((l, i) => (
                        <li key={i}>{l}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between gap-2">
                  <span className="text-[11px] text-slate-700 italic">
                    &ldquo;{activeSampling.justificationSnippet}&rdquo;
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeSampling.id, activeSampling.justificationSnippet)}
                    className="text-[11px] font-semibold text-blue-600 hover:underline shrink-0 cursor-pointer"
                  >
                    {copiedId === activeSampling.id ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            {/* Cochran Sample Size Estimator */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <Calculator className="w-3.5 h-3.5 text-blue-600" />
                <span>Interactive Sample Size Estimator (Cochran Formula)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Population Size (N, optional)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={popSizeInput}
                    onChange={(e) => setPopSizeInput(e.target.value)}
                    placeholder="Leave blank if > 20,000"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Confidence Level
                  </label>
                  <select
                    value={confidenceLevel}
                    onChange={(e) => setConfidenceLevel(Number(e.target.value) as 90 | 95 | 99)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                  >
                    <option value={90}>90% (Z = 1.645)</option>
                    <option value={95}>95% (Z = 1.96)</option>
                    <option value={99}>99% (Z = 2.576)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Margin of Error (±{marginError}%)
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={marginError}
                    onChange={(e) => setMarginError(Number(e.target.value))}
                    className="w-full mt-1.5 accent-blue-600"
                  />
                </div>
              </div>
              <div className="px-3.5 py-2.5 rounded-lg bg-white border border-blue-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-600">
                  Minimum recommended sample size (assuming conservative p = 0.50):
                </span>
                <span className="font-mono text-base font-bold text-blue-700">
                  n = {recommendedSampleSize.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PART 6 LAB: Interactive 5-Principle Research Ethics Compliance Audit */}
        {activeChapter.id === 'ethics' && (
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Interactive Research Ethics Compliance Audit
              </h5>
              <span className="text-xs font-mono font-bold text-emerald-700">
                {checkedEthics.size} / {ETHICS_CHECKS.length} Verified
              </span>
            </div>
            <div className="space-y-1.5">
              {ETHICS_CHECKS.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checkedEthics.has(item.id)}
                    onChange={() =>
                      setCheckedEthics((prev) => {
                        const next = new Set(prev);
                        if (next.has(item.id)) next.delete(item.id);
                        else next.add(item.id);
                        return next;
                      })
                    }
                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
            <div className="p-3 rounded-lg bg-white border border-emerald-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-emerald-700">
                  Generated Chapter 3 Ethics Statement
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy('ethics-stmt', ethicsStatement)}
                  className="text-[11px] font-semibold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === 'ethics-stmt' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === 'ethics-stmt' ? 'Copied' : 'Copy Statement'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{ethicsStatement}</p>
            </div>
          </div>
        )}

        {/* PART 7 LAB: Interactive Dissertation Methodology Mastery Quiz */}
        {activeChapter.id === 'writing' && (
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Interactive Methodology Self-Check Quiz
              </h5>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-700">
                  Score: {quizScore} / {DISSERTATION_QUIZ.length}
                </span>
                {Object.keys(quizAnswers).length > 0 && (
                  <button
                    type="button"
                    onClick={() => setQuizAnswers({})}
                    className="text-[11px] text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {DISSERTATION_QUIZ.map((q, qIdx) => {
                const chosen = quizAnswers[q.id];
                const answered = chosen !== undefined;
                return (
                  <div
                    key={q.id}
                    className="p-3 rounded-lg bg-white border border-slate-200 space-y-2 text-xs"
                  >
                    <div className="font-semibold text-slate-900">
                      {qIdx + 1}. {q.question}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isPicked = chosen === optIdx;
                        const isCorrect = optIdx === q.correctIndex;
                        let style = 'bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300';
                        if (answered) {
                          if (isCorrect) style = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold';
                          else if (isPicked) style = 'bg-rose-50 border-rose-400 text-rose-800';
                        }
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                            className={`text-left px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${style}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {answered && (
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Navigation */}
      <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <span className="text-[11px] text-slate-500">
          StatAssist AI Dissertations Methodology Hub
        </span>
        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
        >
          Close Learning Centre
        </button>
      </div>
    </div>
  );
};
