import React, { useState, useMemo, useRef } from 'react';
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
  Network,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronsUpDown,
  ChevronsDownUp,
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

type MindMapAccent = 'slate' | 'emerald' | 'blue' | 'violet' | 'amber' | 'teal';

interface MindMapTreeNode {
  id: string;
  label: string;
  accent: MindMapAccent;
  leafId?: string;
  children?: MindMapTreeNode[];
}

interface PositionedMindMapNode {
  id: string;
  label: string;
  accent: MindMapAccent;
  depth: number;
  x: number;
  y: number;
  w: number;
  parentId?: string;
  hasChildren: boolean;
  isExpanded: boolean;
  leafId?: string;
}

interface MindMapTestDetail {
  leafId: string;
  pathLabels: string[];
  testName: string;
  launchTestType?: StatisticalTestType;
  nonParametricLabel?: string;
  nonParametricTestType?: StatisticalTestType;
  variablesNeeded: string;
  apaPattern: string;
  whenToUse: string;
}

const MINDMAP_NODE_H = 30;
const MINDMAP_ROW_STEP = 40;
const MINDMAP_COL_STEP = 186;
const MINDMAP_NODE_W = 144;

const MINDMAP_ACCENT_STYLES: Record<
  MindMapAccent,
  { pill: string; activePill: string; stroke: string }
> = {
  slate: {
    pill: 'bg-slate-900 text-white border-slate-900',
    activePill: 'bg-slate-900 text-white border-slate-900 ring-2 ring-blue-400',
    stroke: '#64748b',
  },
  emerald: {
    pill: 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:border-emerald-400',
    activePill: 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-200',
    stroke: '#34d399',
  },
  blue: {
    pill: 'bg-blue-50 text-blue-900 border-blue-200 hover:border-blue-400',
    activePill: 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200',
    stroke: '#60a5fa',
  },
  violet: {
    pill: 'bg-violet-50 text-violet-900 border-violet-200 hover:border-violet-400',
    activePill: 'bg-violet-600 text-white border-violet-600 ring-2 ring-violet-200',
    stroke: '#a78bfa',
  },
  amber: {
    pill: 'bg-amber-50 text-amber-900 border-amber-200 hover:border-amber-400',
    activePill: 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-200',
    stroke: '#fbbf24',
  },
  teal: {
    pill: 'bg-teal-50 text-teal-900 border-teal-200 hover:border-teal-400',
    activePill: 'bg-teal-600 text-white border-teal-600 ring-2 ring-teal-200',
    stroke: '#2dd4bf',
  },
};

const MINDMAP_ROOT: MindMapTreeNode = {
  id: 'mm-root',
  label: 'Statistical Decision Map',
  accent: 'slate',
  children: [
    {
      id: 'mm-summarize',
      label: 'Summarize Data',
      accent: 'emerald',
      children: [
        {
          id: 'leaf-descriptive',
          label: 'Descriptive Statistics',
          accent: 'emerald',
          leafId: 'leaf-descriptive',
        },
      ],
    },
    {
      id: 'mm-group',
      label: 'Group Differences',
      accent: 'blue',
      children: [
        {
          id: 'mm-gd-one-dv',
          label: 'One DV',
          accent: 'blue',
          children: [
            {
              id: 'mm-gd-1dv-nocov',
              label: 'No Covariates',
              accent: 'blue',
              children: [
                {
                  id: 'mm-gd-one-iv',
                  label: 'One IV',
                  accent: 'blue',
                  children: [
                    {
                      id: 'mm-gd-2-levels',
                      label: '2 Levels',
                      accent: 'blue',
                      children: [
                        {
                          id: 'leaf-ind-ttest',
                          label: 'Independent t-Test',
                          accent: 'blue',
                          leafId: 'leaf-ind-ttest',
                        },
                      ],
                    },
                    {
                      id: 'mm-gd-gt2-levels',
                      label: '> 2 Levels',
                      accent: 'blue',
                      children: [
                        {
                          id: 'leaf-anova',
                          label: 'ANOVA',
                          accent: 'blue',
                          leafId: 'leaf-anova',
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'mm-gd-multi-iv',
                  label: 'Multiple IVs',
                  accent: 'blue',
                  children: [
                    {
                      id: 'leaf-two-way-anova',
                      label: 'Two-Way ANOVA',
                      accent: 'blue',
                      leafId: 'leaf-two-way-anova',
                    },
                  ],
                },
              ],
            },
            {
              id: 'mm-gd-1dv-cov',
              label: 'Covariates',
              accent: 'blue',
              children: [
                {
                  id: 'leaf-ancova',
                  label: 'ANCOVA',
                  accent: 'blue',
                  leafId: 'leaf-ancova',
                },
              ],
            },
          ],
        },
        {
          id: 'mm-gd-multi-dv',
          label: 'Multiple DVs',
          accent: 'blue',
          children: [
            {
              id: 'mm-gd-mdv-nocov',
              label: 'No Covariates',
              accent: 'blue',
              children: [
                {
                  id: 'leaf-manova',
                  label: 'MANOVA',
                  accent: 'blue',
                  leafId: 'leaf-manova',
                },
              ],
            },
            {
              id: 'mm-gd-mdv-cov',
              label: 'Covariates',
              accent: 'blue',
              children: [
                {
                  id: 'leaf-mancova',
                  label: 'MANCOVA',
                  accent: 'blue',
                  leafId: 'leaf-mancova',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'mm-predict',
      label: 'Predict an Outcome',
      accent: 'violet',
      children: [
        {
          id: 'mm-pr-numeric',
          label: 'Numeric DV',
          accent: 'violet',
          children: [
            {
              id: 'leaf-regression',
              label: 'Linear Regression',
              accent: 'violet',
              leafId: 'leaf-regression',
            },
          ],
        },
        {
          id: 'mm-pr-nominal',
          label: 'Nominal DV',
          accent: 'violet',
          children: [
            {
              id: 'mm-pr-2-levels',
              label: '2 Levels',
              accent: 'violet',
              children: [
                {
                  id: 'leaf-logistic',
                  label: 'Binary Logistic',
                  accent: 'violet',
                  leafId: 'leaf-logistic',
                },
              ],
            },
            {
              id: 'mm-pr-gt2-levels',
              label: '> 2 Levels',
              accent: 'violet',
              children: [
                {
                  id: 'leaf-chisquare',
                  label: 'Chi-Square (χ²)',
                  accent: 'violet',
                  leafId: 'leaf-chisquare',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'mm-assoc',
      label: 'Test Relationships',
      accent: 'amber',
      children: [
        {
          id: 'mm-as-corr',
          label: 'Numeric Pairs',
          accent: 'amber',
          children: [
            {
              id: 'leaf-corr',
              label: 'Pearson / Spearman',
              accent: 'amber',
              leafId: 'leaf-corr',
            },
          ],
        },
        {
          id: 'mm-as-paired',
          label: 'Repeated / Paired',
          accent: 'amber',
          children: [
            {
              id: 'leaf-paired',
              label: 'Paired t / RM-ANOVA',
              accent: 'amber',
              leafId: 'leaf-paired',
            },
          ],
        },
      ],
    },
    {
      id: 'mm-psych',
      label: 'Scale & Factors',
      accent: 'teal',
      children: [
        {
          id: 'mm-ps-alpha',
          label: 'Reliability Items',
          accent: 'teal',
          children: [
            {
              id: 'leaf-alpha',
              label: "Cronbach's Alpha",
              accent: 'teal',
              leafId: 'leaf-alpha',
            },
          ],
        },
        {
          id: 'mm-ps-sem',
          label: 'Latent Structure',
          accent: 'teal',
          children: [
            {
              id: 'leaf-efa',
              label: 'EFA / CFA / SEM',
              accent: 'teal',
              leafId: 'leaf-efa',
            },
          ],
        },
      ],
    },
  ],
};

function collectAllParentIds(node: MindMapTreeNode, acc: string[] = []): string[] {
  if (node.children && node.children.length > 0) {
    acc.push(node.id);
    node.children.forEach((c) => collectAllParentIds(c, acc));
  }
  return acc;
}

const ALL_PARENT_IDS = collectAllParentIds(MINDMAP_ROOT);
const DEFAULT_EXPANDED_IDS = [
  'mm-root',
  'mm-group',
  'mm-gd-one-dv',
  'mm-gd-1dv-nocov',
  'mm-gd-one-iv',
  'mm-gd-2-levels',
  'mm-gd-gt2-levels',
];

function computeMindMapLayout(root: MindMapTreeNode, expandedIds: Set<string>) {
  const nodes: PositionedMindMapNode[] = [];
  let rowCursor = 0;
  let maxDepth = 0;

  const visit = (node: MindMapTreeNode, depth: number, parentId?: string): number => {
    maxDepth = Math.max(maxDepth, depth);
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const isExpanded = hasChildren && expandedIds.has(node.id);
    const x = 24 + depth * MINDMAP_COL_STEP;
    const w = depth === 0 ? 156 : MINDMAP_NODE_W;

    if (!isExpanded || !node.children) {
      const y = 24 + rowCursor * MINDMAP_ROW_STEP;
      rowCursor += 1;
      nodes.push({
        id: node.id,
        label: node.label,
        accent: node.accent,
        depth,
        x,
        y,
        w,
        parentId,
        hasChildren,
        isExpanded: false,
        leafId: node.leafId,
      });
      return y;
    }

    const childYs = node.children.map((child) => visit(child, depth + 1, node.id));
    const y = (childYs[0] + childYs[childYs.length - 1]) / 2;
    nodes.push({
      id: node.id,
      label: node.label,
      accent: node.accent,
      depth,
      x,
      y,
      w,
      parentId,
      hasChildren,
      isExpanded: true,
      leafId: node.leafId,
    });
    return y;
  };

  visit(root, 0);

  const width = Math.max(680, 24 + (maxDepth + 1) * MINDMAP_COL_STEP + 24);
  const height = Math.max(360, 24 + rowCursor * MINDMAP_ROW_STEP + 24);
  return { nodes, width, height };
}

const FLOWCHART_DETAILS: Record<string, MindMapTestDetail> = {
  'leaf-descriptive': {
    leafId: 'leaf-descriptive',
    pathLabels: ['Summarize Data', 'Descriptive Statistics'],
    testName: 'Descriptive Statistics',
    launchTestType: 'descriptive',
    variablesNeeded: '1 or more continuous / numeric variables',
    apaPattern: 'M = XX.XX, SD = X.XX, Mdn = XX.XX, Skewness = X.XX',
    whenToUse: 'Summarize central tendency, dispersion, skewness, kurtosis, and normality screening.',
  },
  'leaf-ind-ttest': {
    leafId: 'leaf-ind-ttest',
    pathLabels: ['Group Differences', 'One DV', 'No Covariates', 'One IV', '2 Levels', 'Independent t-Test'],
    testName: 'Independent-Samples t-Test',
    launchTestType: 'independent_ttest',
    nonParametricLabel: 'Mann-Whitney U Test',
    nonParametricTestType: 'mann_whitney',
    variablesNeeded: '1 categorical IV (2 groups) + 1 continuous DV',
    apaPattern: 't(df) = X.XX, p = .XXX, d = X.XX, 95% CI [LL, UL]',
    whenToUse: 'Compare mean scores between two unrelated groups (e.g., Treatment vs. Control).',
  },
  'leaf-anova': {
    leafId: 'leaf-anova',
    pathLabels: ['Group Differences', 'One DV', 'No Covariates', 'One IV', '> 2 Levels', 'ANOVA'],
    testName: 'One-Way ANOVA (with Tukey HSD)',
    launchTestType: 'anova',
    nonParametricLabel: 'Kruskal-Wallis H Test',
    nonParametricTestType: 'kruskal_wallis',
    variablesNeeded: '1 categorical IV (3+ groups) + 1 continuous DV',
    apaPattern: 'F(df₁, df₂) = X.XX, p = .XXX, η² = .XX',
    whenToUse: 'Compare mean scores across three or more independent groups with post-hoc contrasts.',
  },
  'leaf-two-way-anova': {
    leafId: 'leaf-two-way-anova',
    pathLabels: ['Group Differences', 'One DV', 'No Covariates', 'Multiple IVs', 'Two-Way ANOVA'],
    testName: 'Two-Way Factorial ANOVA',
    launchTestType: 'two_way_anova',
    variablesNeeded: '2 categorical IVs + 1 continuous DV',
    apaPattern: 'F(df₁, df₂) = X.XX, p = .XXX, ηₚ² = .XX',
    whenToUse: 'Test main effects of two factors simultaneously plus their interaction (Factor A × Factor B).',
  },
  'leaf-ancova': {
    leafId: 'leaf-ancova',
    pathLabels: ['Group Differences', 'One DV', 'Covariates', 'ANCOVA'],
    testName: 'One-Way ANCOVA',
    launchTestType: 'ancova',
    variablesNeeded: '1 categorical IV + 1 continuous covariate + 1 continuous DV',
    apaPattern: 'F(df₁, df₂) = X.XX, p = .XXX, ηₚ² = .XX',
    whenToUse: 'Compare group means while statistically controlling for a continuous baseline covariate.',
  },
  'leaf-manova': {
    leafId: 'leaf-manova',
    pathLabels: ['Group Differences', 'Multiple DVs', 'No Covariates', 'MANOVA'],
    testName: 'Multivariate Analysis of Variance (MANOVA)',
    launchTestType: 'anova',
    variablesNeeded: '1+ categorical IVs + 2 or more correlated continuous DVs',
    apaPattern: "Wilks' Λ = .XX, F(df₁, df₂) = X.XX, p = .XXX, ηₚ² = .XX",
    whenToUse: 'Evaluate group differences simultaneously across multiple conceptually related dependent variables.',
  },
  'leaf-mancova': {
    leafId: 'leaf-mancova',
    pathLabels: ['Group Differences', 'Multiple DVs', 'Covariates', 'MANCOVA'],
    testName: 'Multivariate Analysis of Covariance (MANCOVA)',
    launchTestType: 'ancova',
    variablesNeeded: '1+ categorical IVs + multiple continuous DVs + continuous covariate(s)',
    apaPattern: "Wilks' Λ = .XX, F(df₁, df₂) = X.XX, p = .XXX, ηₚ² = .XX",
    whenToUse: 'Compare group vectors across multiple DVs while adjusting for pre-existing baseline covariates.',
  },
  'leaf-regression': {
    leafId: 'leaf-regression',
    pathLabels: ['Predict an Outcome', 'Numeric DV', 'Linear Regression'],
    testName: 'Multiple Linear Regression',
    launchTestType: 'regression',
    variablesNeeded: '1 continuous DV + 1 or more numeric predictors',
    apaPattern: 'F(df₁, df₂) = X.XX, p = .XXX, R² = .XX, Adjusted R² = .XX',
    whenToUse: 'Predict a continuous score and quantify variance explained (R²) and standardized β weights.',
  },
  'leaf-logistic': {
    leafId: 'leaf-logistic',
    pathLabels: ['Predict an Outcome', 'Nominal DV', '2 Levels', 'Binary Logistic'],
    testName: 'Binary Logistic Regression',
    launchTestType: 'logistic_regression',
    variablesNeeded: '1 binary categorical DV + 1 or more numeric predictors',
    apaPattern: 'χ²(df) = X.XX, p = .XXX, Nagelkerke R² = .XX, OR = X.XX',
    whenToUse: 'Predict binary outcome odds and Odds Ratios Exp(B) (e.g., Pass/Fail, Yes/No).',
  },
  'leaf-chisquare': {
    leafId: 'leaf-chisquare',
    pathLabels: ['Predict an Outcome', 'Nominal DV', '> 2 Levels', 'Chi-Square (χ²)'],
    testName: 'Chi-Square Contingency / Goodness-of-Fit (χ²)',
    launchTestType: 'chi_square',
    nonParametricLabel: 'Chi-Square Goodness-of-Fit',
    nonParametricTestType: 'chi_square_gof',
    variablesNeeded: 'Categorical frequency variables (2+ categories)',
    apaPattern: 'χ²(df, N = XX) = X.XX, p = .XXX, Cramér’s V = .XX',
    whenToUse: 'Examine associations across multi-level nominal categories or compare observed vs. expected counts.',
  },
  'leaf-corr': {
    leafId: 'leaf-corr',
    pathLabels: ['Test Relationships', 'Numeric Pairs', 'Pearson / Spearman'],
    testName: 'Pearson (r) / Spearman (ρ) Correlation',
    launchTestType: 'correlation',
    variablesNeeded: '2 or more continuous or ordinal numeric variables',
    apaPattern: 'r(df) = .XX, p = .XXX, 95% CI [.LL, .UL]',
    whenToUse: 'Measure strength and direction of linear (Pearson) or rank-monotonic (Spearman) associations.',
  },
  'leaf-paired': {
    leafId: 'leaf-paired',
    pathLabels: ['Test Relationships', 'Repeated / Paired', 'Paired t / RM-ANOVA'],
    testName: 'Paired-Samples t-Test / Repeated-Measures ANOVA',
    launchTestType: 'paired_ttest',
    nonParametricLabel: 'Wilcoxon Signed-Rank / Friedman',
    nonParametricTestType: 'wilcoxon_signed',
    variablesNeeded: '2+ related measurements from the same cohort (Pre/Post/Follow-up)',
    apaPattern: 't(df) = X.XX, p = .XXX, d = X.XX',
    whenToUse: 'Compare within-subject change across 2 timepoints (Paired t) or 3+ timepoints (RM-ANOVA).',
  },
  'leaf-alpha': {
    leafId: 'leaf-alpha',
    pathLabels: ['Scale & Factors', 'Reliability Items', "Cronbach's Alpha"],
    testName: "Cronbach's Alpha (α)",
    launchTestType: 'cronbach_alpha',
    variablesNeeded: '2 or more Likert / continuous scale items',
    apaPattern: 'α = .XX (acceptable ≥ .70, strong ≥ .80)',
    whenToUse: 'Evaluate internal consistency reliability of multi-item survey scales.',
  },
  'leaf-efa': {
    leafId: 'leaf-efa',
    pathLabels: ['Scale & Factors', 'Latent Structure', 'EFA / CFA / SEM'],
    testName: 'Exploratory & Confirmatory Factor Analysis / SEM',
    launchTestType: 'exploratory_factor_analysis',
    nonParametricLabel: 'Confirmatory Factor Analysis (CFA)',
    nonParametricTestType: 'confirmatory_factor_analysis',
    variablesNeeded: '3 or more continuous / Likert construct indicators',
    apaPattern: 'KMO = .XX, CFI = .XX, RMSEA = .XX',
    whenToUse: 'Identify latent dimensions (EFA), test measurement model fit (CFA), or estimate structural paths (SEM).',
  },
};

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
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(() => new Set(DEFAULT_EXPANDED_IDS));
  const [selectedNodeId, setSelectedNodeId] = useState<string>('leaf-ind-ttest');
  const [zoom, setZoom] = useState<number>(0.95);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 16, y: 16 });
  const dragStateRef = useRef<{ active: boolean; startX: number; startY: number; origX: number; origY: number }>({
    active: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });

  const mindMapLayout = useMemo(
    () => computeMindMapLayout(MINDMAP_ROOT, expandedNodeIds),
    [expandedNodeIds]
  );

  const highlightedNodeIds = useMemo(() => {
    const activeIds = new Set<string>();
    const nodeMap = new Map(mindMapLayout.nodes.map((n) => [n.id, n]));
    let curr: PositionedMindMapNode | undefined = nodeMap.get(selectedNodeId);
    while (curr) {
      activeIds.add(curr.id);
      curr = curr.parentId ? nodeMap.get(curr.parentId) : undefined;
    }
    return activeIds;
  }, [mindMapLayout.nodes, selectedNodeId]);

  const activeLeafDetail = useMemo(() => {
    if (FLOWCHART_DETAILS[selectedNodeId]) {
      return FLOWCHART_DETAILS[selectedNodeId];
    }
    const findFirstLeaf = (node: MindMapTreeNode): string | null => {
      if (node.leafId) return node.leafId;
      if (node.children) {
        for (const c of node.children) {
          const found = findFirstLeaf(c);
          if (found) return found;
        }
      }
      return null;
    };
    const findTreeNode = (node: MindMapTreeNode, targetId: string): MindMapTreeNode | null => {
      if (node.id === targetId) return node;
      if (node.children) {
        for (const c of node.children) {
          const found = findTreeNode(c, targetId);
          if (found) return found;
        }
      }
      return null;
    };
    const matched = findTreeNode(MINDMAP_ROOT, selectedNodeId);
    const leafId = (matched && findFirstLeaf(matched)) || 'leaf-ind-ttest';
    return FLOWCHART_DETAILS[leafId] || FLOWCHART_DETAILS['leaf-ind-ttest'];
  }, [selectedNodeId]);

  const toggleExpandNode = (nodeId: string) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleMindMapNodeSelect = (node: PositionedMindMapNode) => {
    setSelectedNodeId(node.id);
    if (node.hasChildren && !node.isExpanded) {
      setExpandedNodeIds((prev) => {
        const next = new Set(prev);
        next.add(node.id);
        return next;
      });
    }
  };

  const handleExpandAll = () => {
    setExpandedNodeIds(new Set(ALL_PARENT_IDS));
    setZoom(0.75);
    setPan({ x: 8, y: 8 });
  };

  const handleCollapseBranches = () => {
    setExpandedNodeIds(new Set(['mm-root']));
    setSelectedNodeId('mm-group');
    setZoom(1);
    setPan({ x: 24, y: 40 });
  };

  const handleResetView = () => {
    setExpandedNodeIds(new Set(DEFAULT_EXPANDED_IDS));
    setSelectedNodeId('leaf-ind-ttest');
    setZoom(0.85);
    setPan({ x: 8, y: 12 });
  };

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
  const isMindMapActive = activeModule.id === 'decision-tree';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl w-full flex flex-col overflow-hidden shadow-2xl border border-slate-200 transition-all duration-200 ${
          isMindMapActive ? 'max-w-[97vw] h-[94vh]' : 'max-w-5xl max-h-[90vh]'
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
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Navigation List */}
          <aside className="w-full md:w-68 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/70 p-4 flex flex-col gap-3 shrink-0 overflow-y-auto max-h-56 md:max-h-none">
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
                        <div className="text-xs font-bold text-slate-900 leading-snug">
                          {mod.title}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Right Tutorial Content Pane */}
          <div
            className={
              isMindMapActive
                ? 'flex-1 flex flex-col overflow-hidden p-4 sm:p-5 gap-3 bg-white'
                : 'flex-1 overflow-y-auto p-6 sm:p-7 space-y-6 bg-white'
            }
          >
            {/* Module Title Banner (Compact bar in Mind Map full view mode) */}
            {isMindMapActive ? (
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                    {activeModule.title}
                  </h3>
                </div>
              </div>
            ) : (
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
            )}

            {/* Key Takeaways Callout */}
            {activeModule.keyTakeaways.length > 0 && (
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
            )}

            {/* Interactive Studio Mind Map Canvas */}
            {isMindMapActive && (
              <div className="flex-1 min-h-0 flex flex-col gap-3">
                <div
                  className="relative flex-1 min-h-[240px] rounded-xl border border-slate-200 bg-slate-50 overflow-hidden select-none cursor-grab active:cursor-grabbing"
                  style={{
                    backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                    backgroundSize: '18px 18px',
                  }}
                  onPointerDown={(e) => {
                    if ((e.target as HTMLElement).closest('button')) return;
                    dragStateRef.current = {
                      active: true,
                      startX: e.clientX,
                      startY: e.clientY,
                      origX: pan.x,
                      origY: pan.y,
                    };
                  }}
                  onPointerMove={(e) => {
                    if (!dragStateRef.current.active) return;
                    const dx = e.clientX - dragStateRef.current.startX;
                    const dy = e.clientY - dragStateRef.current.startY;
                    setPan({
                      x: dragStateRef.current.origX + dx,
                      y: dragStateRef.current.origY + dy,
                    });
                  }}
                  onPointerUp={() => {
                    dragStateRef.current.active = false;
                  }}
                  onPointerLeave={() => {
                    dragStateRef.current.active = false;
                  }}
                >
                  {/* Top Toolbar */}
                  <div className="absolute top-3 right-3 z-20 flex items-center justify-end gap-2 pointer-events-none">
                    <div className="pointer-events-auto inline-flex items-center gap-1 p-1 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 shadow-xs">
                      <button
                        type="button"
                        onClick={handleExpandAll}
                        className="px-2 py-1 rounded text-[11px] font-medium text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1 cursor-pointer"
                        title="Expand all branches"
                      >
                        <ChevronsUpDown className="w-3 h-3 text-blue-600" />
                        <span>Expand All</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCollapseBranches}
                        className="px-2 py-1 rounded text-[11px] font-medium text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1 cursor-pointer"
                        title="Collapse to top-level branches"
                      >
                        <ChevronsDownUp className="w-3 h-3 text-slate-500" />
                        <span>Collapse</span>
                      </button>
                    </div>
                  </div>

                  {/* Pan & Zoom Transform Stage */}
                  <div
                    style={{
                      width: `${mindMapLayout.width}px`,
                      height: `${mindMapLayout.height}px`,
                      transform: `translate(${pan.x}px, ${pan.y + 30}px) scale(${zoom})`,
                      transformOrigin: '0 0',
                    }}
                    className="relative transition-transform duration-150 ease-out"
                  >
                    {/* Smooth Cubic Bezier Curves SVG Layer */}
                    <svg
                      width={mindMapLayout.width}
                      height={mindMapLayout.height}
                      viewBox={`0 0 ${mindMapLayout.width} ${mindMapLayout.height}`}
                      className="absolute inset-0 pointer-events-none"
                    >
                      {mindMapLayout.nodes.map((node) => {
                        if (!node.parentId) return null;
                        const parent = mindMapLayout.nodes.find((p) => p.id === node.parentId);
                        if (!parent) return null;
                        const x1 = parent.x + parent.w;
                        const y1 = parent.y + MINDMAP_NODE_H / 2;
                        const x2 = node.x;
                        const y2 = node.y + MINDMAP_NODE_H / 2;
                        const cx = (x1 + x2) / 2;
                        const isActiveEdge =
                          highlightedNodeIds.has(parent.id) && highlightedNodeIds.has(node.id);
                        const strokeColor = isActiveEdge
                          ? '#2563eb'
                          : MINDMAP_ACCENT_STYLES[node.accent].stroke;

                        return (
                          <path
                            key={`${parent.id}->${node.id}`}
                            d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth={isActiveEdge ? 2.6 : 1.7}
                            strokeOpacity={isActiveEdge ? 1 : 0.65}
                            strokeLinecap="round"
                          />
                        );
                      })}
                    </svg>

                    {/* Interactive Mind Map Node Pills with Fold/Unfold Toggles */}
                    {mindMapLayout.nodes.map((node) => {
                      const isActive = highlightedNodeIds.has(node.id);
                      const accentStyle = MINDMAP_ACCENT_STYLES[node.accent];
                      return (
                        <div
                          key={node.id}
                          style={{
                            left: `${node.x}px`,
                            top: `${node.y}px`,
                            width: `${node.w}px`,
                            height: `${MINDMAP_NODE_H}px`,
                          }}
                          className="absolute flex items-center"
                        >
                          <button
                            type="button"
                            onClick={() => handleMindMapNodeSelect(node)}
                            className={`w-full h-full flex items-center justify-between px-2.5 text-[11px] font-medium rounded-lg border shadow-2xs transition-all cursor-pointer ${
                              isActive ? accentStyle.activePill : accentStyle.pill
                            }`}
                            title={node.label}
                          >
                            <span className="truncate">{node.label}</span>
                          </button>

                          {node.hasChildren && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpandNode(node.id);
                              }}
                              aria-label={node.isExpanded ? `Collapse ${node.label}` : `Expand ${node.label}`}
                              className={`-ml-2.5 z-10 w-5 h-5 rounded-full border shadow-xs flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                                node.isExpanded
                                  ? 'bg-white border-slate-300 text-slate-600 hover:border-blue-500 hover:text-blue-600'
                                  : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {node.isExpanded ? (
                                <ChevronLeft className="w-3 h-3" />
                              ) : (
                                <ChevronRight className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom-Right Studio Zoom Controls */}
                  <div className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1 p-1 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(2))))}
                      className="p-1.5 rounded text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                      aria-label="Zoom out"
                      title="Zoom out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-1.5 text-[11px] font-mono text-slate-600 min-w-[42px] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(2))))}
                      className="p-1.5 rounded text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                      aria-label="Zoom in"
                      title="Zoom in"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleResetView}
                      className="p-1.5 rounded text-slate-600 hover:bg-slate-100 hover:text-blue-600 border-l border-slate-200 pl-2 cursor-pointer"
                      aria-label="Reset mind map view"
                      title="Reset view"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Selected Leaf Test Inspector Strip (Full View Slim Footer) */}
                <div className="shrink-0 rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-slate-900">{activeLeafDetail.testName}</span>
                    <span className="text-[11px] font-mono text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {activeLeafDetail.apaPattern}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {activeLeafDetail.nonParametricLabel &&
                      activeLeafDetail.nonParametricTestType &&
                      onLaunchTutorialTest && (
                        <button
                          type="button"
                          onClick={() => {
                            onLaunchTutorialTest(activeLeafDetail.nonParametricTestType!);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer"
                        >
                          Alt: {activeLeafDetail.nonParametricLabel}
                        </button>
                      )}

                    {activeLeafDetail.launchTestType && onLaunchTutorialTest && (
                      <button
                        type="button"
                        onClick={() => {
                          onLaunchTutorialTest(activeLeafDetail.launchTestType!);
                          onClose();
                        }}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Launch Test Preset</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
                    >
                      Close Tutorials
                    </button>
                  </div>
                </div>
              </div>
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

            {/* Interactive Action Strip (non-Mind-Map tutorials) */}
            {!isMindMapActive && (
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
