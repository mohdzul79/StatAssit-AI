import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  Search,
  CheckCircle2,
  ArrowRight,
  GitBranch,
  ShieldCheck,
  BarChart3,
  TrendingUp,
  Target,
  FileText,
  Sparkles,
  Lightbulb,
} from 'lucide-react';
import { StatisticalTestType } from '../types/stats';

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
    id: 'choosing-test',
    category: 'Study Design',
    title: 'Choosing the Right Statistical Test',
    subtitle: 'Match your research question, variable scales, and group structure cleanly.',
    readTime: '4 min read',
    level: 'Foundational',
    icon: GitBranch,
    summary:
      'Selecting an appropriate quantitative test depends on three inputs: (1) your analytic goal (group difference, association, or prediction), (2) the measurement scale of each variable (nominal, ordinal, or continuous interval/ratio), and (3) whether observations are independent or repeated.',
    keyTakeaways: [
      'Two independent groups + continuous outcome → Independent Samples t-Test (or Mann-Whitney U if skewed).',
      'Three or more independent groups + continuous outcome → One-Way ANOVA (or Kruskal-Wallis H).',
      'Same participants measured twice → Paired Samples t-Test (or Wilcoxon Signed-Rank).',
      'Predicting a continuous outcome from predictors → Multiple Linear Regression.',
    ],
    sections: [
      {
        heading: '1. Identify Variable Measurement Scales',
        body: 'Before selecting a test, verify whether your Dependent Variable (DV) and Independent Variable (IV) are continuous or categorical:',
        bullets: [
          'Continuous (Interval / Ratio): Numeric measurements with meaningful distances (e.g., exam scores, reaction times, Likert composite means).',
          'Categorical (Nominal / Ordinal): Discrete group labels or categories (e.g., Control vs. Treatment, Low / Medium / High).',
        ],
      },
      {
        heading: '2. Determine Observation Independence',
        body: 'Independent designs compare separate participants across groups, whereas repeated-measures or paired designs track the same participants across timepoints or matched conditions.',
      },
      {
        heading: '3. Match Analytic Goal to Test Family',
        body: 'Use group-comparison tests to test mean or median differences, correlation/chi-square to test associations, and regression or SEM to model predictive variance and latent constructs.',
      },
    ],
    recommendedTest: 'independent_ttest',
    recommendedTestLabel: 'Practice with Independent t-Test Preset',
  },
  {
    id: 'assumptions-auditing',
    category: 'Diagnostics',
    title: 'Parametric Assumptions & Non-Parametric Alternatives',
    subtitle: 'Understand Normality (Shapiro-Wilk), Homogeneity (Levene), and robust fallbacks.',
    readTime: '5 min read',
    level: 'Foundational',
    icon: ShieldCheck,
    summary:
      'Parametric tests (t-tests, ANOVA, Pearson r) assume approximate normality and equal group variances. Auditing assumptions prevents inflated Type I error rates and ensures valid p-values.',
    keyTakeaways: [
      'Shapiro-Wilk W with p > .05 indicates no significant departure from normality.',
      'Levene’s Test with p > .05 supports homogeneity of variances across groups.',
      'Skewness and Kurtosis within ±2.0 generally satisfy practical normality for moderate samples (N ≥ 30).',
      'When assumptions are violated, switch to Welch corrections or rank-based non-parametric tests.',
    ],
    sections: [
      {
        heading: 'Normality Testing (Shapiro-Wilk & Q-Q Inspection)',
        body: 'The Shapiro-Wilk test evaluates whether sample residuals deviate significantly from a normal distribution. Always interpret p-values alongside visual histograms, skewness, and kurtosis, because very large samples can flag trivial deviations.',
        formula: 'Normality satisfied if Shapiro-Wilk p > .05 or |Skewness| < 2.0, |Kurtosis| < 2.0',
      },
      {
        heading: 'Homogeneity of Variance (Levene’s Test)',
        body: 'Independent group comparisons assume equal variance spread across groups. If Levene’s F is significant (p < .05), report Welch’s adjusted t or Welch’s ANOVA, or verify with Mann-Whitney U / Kruskal-Wallis H.',
      },
      {
        heading: 'Quick Parametric → Non-Parametric Map',
        body: 'Use this direct fallback map whenever extreme outliers or strong skew occur:',
        bullets: [
          'Independent t-Test → Mann-Whitney U Test',
          'Paired Samples t-Test → Wilcoxon Signed-Rank Test',
          'One-Way ANOVA → Kruskal-Wallis H Test',
          'Repeated Measures ANOVA → Friedman’s ANOVA (χ²)',
          'Pearson r → Spearman Rank-Order Correlation (ρ)',
        ],
      },
    ],
    recommendedTest: 'mann_whitney',
    recommendedTestLabel: 'Explore Non-Parametric Mann-Whitney Preset',
  },
  {
    id: 'comparing-groups',
    category: 'Inferential Tests',
    title: 'Group Comparisons: t-Tests, ANOVA & ANCOVA',
    subtitle: 'Compare two or more groups, factorial interactions, and covariate adjustments.',
    readTime: '6 min read',
    level: 'Intermediate',
    icon: BarChart3,
    summary:
      'Group comparison procedures evaluate whether observed differences in sample means exceed random sampling variability. Multi-group designs require omnibus F tests followed by family-wise error controlled post-hoc comparisons.',
    keyTakeaways: [
      'Never run multiple pairwise t-tests across 3+ groups—this inflates Type I error; use One-Way ANOVA with Tukey HSD.',
      'Two-Way ANOVA tests two main effects plus their interaction effect (Factor A × Factor B).',
      'ANCOVA statistically controls for a continuous baseline covariate to isolate the treatment effect.',
    ],
    sections: [
      {
        heading: 't-Tests (One-Sample, Independent & Paired)',
        body: 'Use a One-Sample t-test against a known benchmark value (μ₀), an Independent t-test for two unrelated groups, and a Paired t-test for pre/post scores from the same cohort.',
        formula: 't = (Mean Difference) / (Standard Error of Difference)',
      },
      {
        heading: 'ANOVA & Post-Hoc Pairwise Probing',
        body: 'An omnibus F-ratio tells you at least one group mean differs from the others. Follow up significant F results (p < .05) with Tukey HSD post-hoc contrasts to pinpoint exactly which pairs differ.',
      },
      {
        heading: 'Controlling Baseline Covariates (ANCOVA)',
        body: 'In quasi-experimental studies where pre-existing differences exist at baseline, include baseline scores as a covariate in ANCOVA to compare adjusted post-test group means.',
      },
    ],
    recommendedTest: 'anova',
    recommendedTestLabel: 'Launch One-Way ANOVA Preset',
  },
  {
    id: 'regression-modeling',
    category: 'Predictive Modeling',
    title: 'Correlation, Multiple Regression & Psychometrics',
    subtitle: 'Quantify linear associations, R² variance explained, VIF, and EFA/CFA factor models.',
    readTime: '6 min read',
    level: 'Intermediate',
    icon: TrendingUp,
    summary:
      'Regression and multivariate models move beyond simple group differences to quantify direction, strength, unique predictor weights (β), and latent construct validity.',
    keyTakeaways: [
      'Adjusted R² penalizes unnecessary predictors when evaluating overall model fit.',
      'Check Variance Inflation Factor (VIF < 5.0) to rule out multicollinearity among predictors.',
      'Logistic Regression outputs Odds Ratios (Exp(B)) for binary categorical outcomes.',
      'EFA requires KMO ≥ .70 and significant Bartlett’s test of sphericity (p < .05).',
    ],
    sections: [
      {
        heading: 'Multiple Linear Regression Diagnostics',
        body: 'Examine the omnibus model F, R² (proportion of DV variance explained), standardized regression weights (β) to compare relative predictor importance, and VIF values to confirm predictors are not redundant.',
        formula: 'Ŷ = b₀ + b₁X₁ + b₂X₂ + ... + bₖXₖ   (Check VIF < 5.0)',
      },
      {
        heading: 'Factor Analysis & Construct Validity (EFA / CFA)',
        body: 'Exploratory Factor Analysis uncovers latent factor structure via eigenvalues > 1.0 and rotated factor loadings (≥ .40), while Confirmatory Factor Analysis evaluates theoretical measurement fit using CFI (≥ .95), TLI (≥ .95), and RMSEA (≤ .08).',
      },
    ],
    recommendedTest: 'regression',
    recommendedTestLabel: 'Launch Multiple Regression Preset',
  },
  {
    id: 'effect-sizes',
    category: 'Interpretation',
    title: 'Effect Sizes & Practical Significance',
    subtitle: 'Go beyond p-values by quantifying magnitude with Cohen’s d, η², and R².',
    readTime: '4 min read',
    level: 'Foundational',
    icon: Target,
    summary:
      'A p-value only evaluates compatibility with the null hypothesis and grows artificially small as sample size increases. Effect sizes quantify the practical magnitude of an effect independent of sample size.',
    keyTakeaways: [
      'Cohen’s d benchmarks: 0.20 (Small), 0.50 (Medium), 0.80 (Large).',
      'Eta-squared (η² / partial η²) benchmarks: .01 (Small), .06 (Medium), .14 (Large).',
      'Correlation r benchmarks: ±.10 (Small), ±.30 (Medium), ±.50 (Large).',
      'Always report a 95% confidence interval alongside effect sizes and point estimates.',
    ],
    sections: [
      {
        heading: 'Why p < .05 Is Not Enough',
        body: 'In large datasets (N > 1,000), tiny, clinically meaningless differences can yield p < .001. Conversely, promising pilot interventions with small samples may show a large Cohen’s d despite p = .08. Reporting effect sizes anchors interpretation in real-world impact.',
      },
      {
        heading: 'Choosing the Right Effect Size Index',
        body: 'Match each statistical procedure with its standard APA 7th effect size metric:',
        bullets: [
          't-Tests: Cohen’s d (or Hedges’ g for small samples)',
          'ANOVA / ANCOVA: Eta-squared (η²) or Partial Eta-squared (ηₚ²)',
          'Non-Parametric Group Tests: Rank-Biserial r or Epsilon-squared (ε²)',
          'Chi-Square Contingency: Cramér’s V or Phi (φ)',
          'Regression: R² / Adjusted R² and Cohen’s f²',
        ],
      },
    ],
  },
  {
    id: 'apa7-reporting',
    category: 'Academic Writing',
    title: 'APA 7th Edition Statistical Reporting Checklist',
    subtitle: 'Master leading zeros, italicization, confidence intervals, and three-rule tables.',
    readTime: '4 min read',
    level: 'Foundational',
    icon: FileText,
    summary:
      'Peer-reviewed journals and graduate thesis committees enforce strict APA 7th formatting for in-text statistical strings and tabular presentations.',
    keyTakeaways: [
      'Italicize Latin statistical symbols (M, SD, t, F, p, r, d, R², N, n); do NOT italicize Greek letters (α, χ², η², β/ω² conventions follow journal spec).',
      'Omit the leading zero for numbers bounded between -1 and +1 (p = .023, r = .45, R² = .31).',
      'Report p < .001 instead of p = .000.',
      'Format 95% confidence intervals in square brackets: 95% CI [1.42, 6.85].',
    ],
    sections: [
      {
        heading: 'In-Text Reporting Templates',
        body: 'Follow clean, reproducible syntax for results paragraphs:',
        bullets: [
          'Independent t-Test: t(58) = 2.84, p = .006, d = 0.73, 95% CI [1.95, 11.24].',
          'One-Way ANOVA: F(2, 87) = 6.42, p = .003, η² = .13.',
          'Pearson Correlation: r(48) = .54, p < .001, 95% CI [.31, .71].',
          'Multiple Regression: F(3, 96) = 18.40, p < .001, R² = .37, Adjusted R² = .35.',
        ],
      },
      {
        heading: 'Three-Rule Publication Tables',
        body: 'APA tables omit vertical gridlines entirely and display only three horizontal lines: top border, header bottom border, and table bottom border, accompanied by a bold Table number, italicized Title Case heading, and a table Note.',
      },
    ],
  },
];

export const LearningCentreModal: React.FC<LearningCentreModalProps> = ({
  isOpen,
  onClose,
  onLaunchTutorialTest,
  onOpenApaGuide,
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>(TUTORIAL_MODULES[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return TUTORIAL_MODULES;
    return TUTORIAL_MODULES.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.subtitle.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const activeModule =
    filteredModules.find((m) => m.id === selectedModuleId) ||
    filteredModules[0] ||
    TUTORIAL_MODULES[0];

  if (!isOpen) return null;

  const ActiveIcon = activeModule.icon;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
              Learning Centre
            </h2>
            <span className="text-xs text-slate-400 font-normal hidden sm:inline">
              · Statistical Tutorials
            </span>
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
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Navigation List */}
          <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/70 p-4 flex flex-col gap-3 shrink-0 overflow-y-auto max-h-56 md:max-h-none">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tutorials..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              {filteredModules.length === 0 ? (
                <div className="p-3 text-xs text-slate-500 text-center bg-white rounded-lg border border-slate-200">
                  No tutorials match &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                filteredModules.map((mod) => {
                  const IconComp = mod.icon;
                  const isActive = mod.id === activeModule.id;
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => setSelectedModuleId(mod.id)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                        isActive
                          ? 'bg-white border-blue-300 shadow-2xs ring-1 ring-blue-500/15'
                          : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200/70 text-slate-600'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-blue-600">
                          {mod.category}
                        </div>
                        <div className="text-xs font-bold text-slate-900 leading-snug">
                          {mod.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {mod.readTime} · {mod.level}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Right Tutorial Content Pane */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6 bg-white">
            {/* Module Title Banner */}
            <div className="space-y-2 pb-4 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <ActiveIcon className="w-3 h-3" />
                  <span>{activeModule.category}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                  {activeModule.level}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {activeModule.readTime}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {activeModule.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {activeModule.summary}
              </p>
            </div>

            {/* Key Takeaways Callout */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 uppercase tracking-wider">
                <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
                <span>Key Methodological Takeaways</span>
              </div>
              <ul className="space-y-1.5">
                {activeModule.keyTakeaways.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Detailed Tutorial Sections */}
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

            {/* Interactive Action Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
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
          </div>
        </div>
      </div>
    </div>
  );
};
