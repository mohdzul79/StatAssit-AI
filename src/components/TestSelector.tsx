import React from 'react';
import {
  GitCompare,
  History,
  Grid,
  TrendingUp,
  BarChart2,
  Table2,
  SlidersHorizontal,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Layers,
  Scale,
  Binary,
  PieChart,
  ShieldCheck,
  Target,
  Repeat,
  FileSpreadsheet,
} from 'lucide-react';
import { StatisticalTestType } from '../types/stats';
import { getRecommendedChartsForTest } from '../utils/recommendedCharts';

export interface TestOption {
  id: StatisticalTestType;
  title: string;
  apaCategory:
    | 'parametric_comparison'
    | 'nonparametric_comparison'
    | 'regression_prediction'
    | 'association_measurement'
    | 'categorical_frequencies'
    | 'descriptive_screening'
    | 'advanced_modeling';
  apaCategoryLabel: string;
  isParametric: boolean;
  plainEnglish: string;
  whenToUse: string;
  dataRequirements: string;
  apaExample: string;
  effectSizeMetric: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
}

export const APA_TEST_OPTIONS: TestOption[] = [
  // --- APA CATEGORY 1: Group Mean Differences (Parametric) ---
  {
    id: 'independent_ttest',
    title: 'Independent Samples t-Test',
    apaCategory: 'parametric_comparison',
    apaCategoryLabel: 'APA I: Mean Comparisons (Parametric)',
    isParametric: true,
    plainEnglish: 'Compare the average scores of two separate, unrelated groups.',
    whenToUse: 'Use when testing if an intervention or condition made a significant difference between two groups (e.g., Treatment vs. Control, Male vs. Female).',
    dataRequirements: '1 Categorical Grouping Factor (2 levels) + 1 Continuous Numeric Outcome',
    apaExample: 't(58) = 2.84, p = .006, d = 0.74, 95% CI [0.85, 4.90]',
    effectSizeMetric: "Cohen's d (0.2 small, 0.5 med, 0.8 large)",
    icon: GitCompare,
    tags: ['2 Independent Groups', 'Between-Subjects', "Levene's Homogeneity", "Cohen's d", "Welch's Correction"],
  },
  {
    id: 'paired_ttest',
    title: 'Paired Samples t-Test',
    apaCategory: 'parametric_comparison',
    apaCategoryLabel: 'APA I: Mean Comparisons (Parametric)',
    isParametric: true,
    plainEnglish: 'Compare the same participants tested twice (e.g., Baseline Pre-test vs. Endpoint Post-test).',
    whenToUse: 'Use when each participant contributes two scores across timepoints or matched experimental conditions.',
    dataRequirements: '2 Continuous Numeric Variables measured on the same subjects (Time 1 & Time 2)',
    apaExample: 't(44) = 4.15, p < .001, d = 0.62, 95% CI [3.20, 9.10]',
    effectSizeMetric: "Cohen's d_z for paired differences",
    icon: History,
    tags: ['Within-Subjects', 'Pre vs Post', 'Repeated Measures', 'Paired Differences'],
  },
  {
    id: 'one_sample_ttest',
    title: 'One-Sample t-Test',
    apaCategory: 'parametric_comparison',
    apaCategoryLabel: 'APA I: Mean Comparisons (Parametric)',
    isParametric: true,
    plainEnglish: 'Compare a sample average against a known population benchmark or historical standard (μ₀).',
    whenToUse: 'Use when evaluating whether your group scores significantly above or below an academic benchmark (e.g., test value = 75.0 or 0.0).',
    dataRequirements: '1 Continuous Numeric Variable + 1 Hypothesized Test Benchmark Value (μ₀)',
    apaExample: 't(59) = 3.42, p = .001, d = 0.44, 95% CI [1.80, 6.45]',
    effectSizeMetric: "Cohen's d relative to test value",
    icon: Target,
    tags: ['Single Group', 'Criterion Benchmark', 'Population Mean μ₀', "Cohen's d"],
  },
  {
    id: 'anova',
    title: 'One-Way Between-Subjects ANOVA',
    apaCategory: 'parametric_comparison',
    apaCategoryLabel: 'APA I: Mean Comparisons (Parametric)',
    isParametric: true,
    plainEnglish: 'Compare average scores across 3 or more distinct, unrelated groups simultaneously.',
    whenToUse: 'Use when comparing 3+ conditions (e.g., Placebo vs. Low Dose vs. High Dose) while controlling familywise Type I error.',
    dataRequirements: '1 Categorical Grouping Factor (3+ levels) + 1 Continuous Numeric Outcome',
    apaExample: 'F(2, 57) = 4.92, p = .011, η² = .15, Tukey HSD',
    effectSizeMetric: 'Eta-squared (η²) or Omega-squared (ω²)',
    icon: Grid,
    tags: ['3+ Conditions', 'Between-Subjects', 'Tukey HSD Post-Hoc', 'Eta-Squared (η²)'],
  },
  {
    id: 'two_way_anova',
    title: 'Two-Way Factorial ANOVA (A × B)',
    apaCategory: 'parametric_comparison',
    apaCategoryLabel: 'APA I: Mean Comparisons (Parametric)',
    isParametric: true,
    plainEnglish: 'Test the main effects of two separate factors and their interaction effect on an outcome.',
    whenToUse: 'Use when examining how two factors interact (e.g., Intervention Arm × Gender on Blood Pressure reduction).',
    dataRequirements: '2 Categorical Independent Variables (Factor A & Factor B) + 1 Continuous Outcome',
    apaExample: 'F(2, 54) = 6.84, p = .002, η_p² = .20 (Interaction A × B)',
    effectSizeMetric: 'Partial Eta-squared (η_p²)',
    icon: Layers,
    tags: ['Factorial Design', 'Main Effects', 'Interaction Effect (A × B)', 'Partial Eta-Squared (η_p²)'],
  },
  {
    id: 'repeated_measures_anova',
    title: 'Repeated Measures ANOVA (One-Way)',
    apaCategory: 'parametric_comparison',
    apaCategoryLabel: 'APA I: Mean Comparisons (Parametric)',
    isParametric: true,
    plainEnglish: 'Compare the same participants across 3 or more timepoints or within-subject conditions.',
    whenToUse: 'Use for longitudinal clinical trials tracking subjects across Baseline, 6 Weeks, and 12 Weeks follow-up.',
    dataRequirements: '3 or more Continuous Numeric Variables collected repeatedly from identical participants',
    apaExample: 'F(2, 88) = 12.35, p < .001, η_p² = .22, Mauchly W = .84',
    effectSizeMetric: 'Partial Eta-squared (η_p²)',
    icon: Repeat,
    tags: ['Longitudinal', 'Within-Subjects', 'Sphericity (Mauchly)', 'Greenhouse-Geisser'],
  },
  {
    id: 'ancova',
    title: 'Analysis of Covariance (ANCOVA)',
    apaCategory: 'parametric_comparison',
    apaCategoryLabel: 'APA I: Mean Comparisons (Parametric)',
    isParametric: true,
    plainEnglish: 'Compare group means while statistically controlling for a confounding continuous covariate.',
    whenToUse: 'Use when groups differed at baseline (e.g., comparing Post-Treatment BP while controlling for Pre-Treatment BP or Age).',
    dataRequirements: '1 Categorical Grouping Factor + 1 Continuous Numeric Outcome + 1 Continuous Covariate',
    apaExample: 'F(2, 41) = 7.91, p = .001, η_p² = .28 (Adjusted Means)',
    effectSizeMetric: 'Partial Eta-squared (η_p²)',
    icon: Scale,
    tags: ['Covariate Control', 'Adjusted Marginal Means', 'Confounder Adjustment', 'Partial Eta-Squared'],
  },

  // --- APA CATEGORY 2: Non-Parametric & Rank-Based (Ranks) ---
  {
    id: 'mann_whitney',
    title: 'Mann-Whitney U Test',
    apaCategory: 'nonparametric_comparison',
    apaCategoryLabel: 'APA II: Non-Parametric & Rank Comparisons',
    isParametric: false,
    plainEnglish: 'Non-parametric alternative to independent t-test for skewed data or small sample sizes.',
    whenToUse: 'Use to compare two independent groups when normality or homoscedasticity assumptions are violated.',
    dataRequirements: '1 Categorical Factor (2 groups) + 1 Ordinal or Skewed Continuous Variable',
    apaExample: 'U = 214.5, z = 2.45, p = .014, rank-biserial r = .38',
    effectSizeMetric: 'Rank-biserial correlation r or Glass rank biserial',
    icon: GitCompare,
    tags: ['Non-Parametric', '2 Independent Groups', 'Wilcoxon Rank-Sum', 'Medians & Mean Ranks'],
  },
  {
    id: 'wilcoxon_signed',
    title: 'Wilcoxon Signed-Rank Test',
    apaCategory: 'nonparametric_comparison',
    apaCategoryLabel: 'APA II: Non-Parametric & Rank Comparisons',
    isParametric: false,
    plainEnglish: 'Non-parametric alternative to paired t-test for repeated measures or matched pairs.',
    whenToUse: 'Use when comparing two paired timepoints/conditions with non-normal difference distributions.',
    dataRequirements: '2 Dependent Numeric or Ordinal Variables (Time 1 & Time 2)',
    apaExample: 'W = 86.0, z = 3.12, p = .002, r = .41',
    effectSizeMetric: 'Effect size r = |z| / sqrt(N)',
    icon: History,
    tags: ['Non-Parametric', 'Paired Measures', 'Matched Pairs', 'Signed Ranks'],
  },
  {
    id: 'kruskal_wallis',
    title: 'Kruskal-Wallis H Test',
    apaCategory: 'nonparametric_comparison',
    apaCategoryLabel: 'APA II: Non-Parametric & Rank Comparisons',
    isParametric: false,
    plainEnglish: 'Non-parametric alternative to One-Way ANOVA for 3 or more independent groups.',
    whenToUse: 'Use when comparing 3+ groups with skewed continuous or Likert ordinal outcomes.',
    dataRequirements: '1 Categorical Factor (3+ groups) + 1 Ordinal or Continuous Outcome',
    apaExample: 'H(2) = 11.45, p = .003, ε² = .21',
    effectSizeMetric: 'Epsilon-squared (ε²)',
    icon: Grid,
    tags: ['Non-Parametric', '3+ Groups', 'One-Way Rank ANOVA', 'Epsilon-Squared'],
  },
  {
    id: 'friedman',
    title: 'Friedman Test (Repeated Ranks)',
    apaCategory: 'nonparametric_comparison',
    apaCategoryLabel: 'APA II: Non-Parametric & Rank Comparisons',
    isParametric: false,
    plainEnglish: 'Non-parametric alternative to repeated measures ANOVA across 3+ conditions.',
    whenToUse: 'Use when tracking participants across 3+ conditions where data are ranked or non-normal.',
    dataRequirements: '3 or more Dependent Variables (Repeated conditions / timepoints)',
    apaExample: 'χ_F²(2) = 14.80, p < .001, Kendall W = .33',
    effectSizeMetric: "Kendall's W (Coefficient of Concordance)",
    icon: Repeat,
    tags: ['Non-Parametric', 'Repeated Measures', "Kendall's W", 'Rank Chi-Square'],
  },

  // --- APA CATEGORY 3: Prediction, Modeling & Regression ---
  {
    id: 'regression',
    title: 'Multiple Linear Regression (OLS)',
    apaCategory: 'regression_prediction',
    apaCategoryLabel: 'APA III: Prediction, Modeling & Regression',
    isParametric: true,
    plainEnglish: 'Predict a continuous outcome using one or more predictor variables.',
    whenToUse: 'Use when investigating how much variance predictors explain in an outcome (e.g., predicting Exam Score from Study Hours, Sleep, and Stress).',
    dataRequirements: '1 Continuous Numeric Outcome (DV) + 1 or more Predictors (IVs)',
    apaExample: 'F(3, 56) = 14.28, p < .001, R² = .43, β = .48',
    effectSizeMetric: 'Coefficient of Determination (R²) and Cohen’s f²',
    icon: TrendingUp,
    tags: ['OLS Regression', 'Multiple Predictors', 'R-Squared (R²)', 'Standardized Beta (β)', 'VIF Collinearity'],
  },
  {
    id: 'logistic_regression',
    title: 'Binary Logistic Regression',
    apaCategory: 'regression_prediction',
    apaCategoryLabel: 'APA III: Prediction, Modeling & Regression',
    isParametric: true,
    plainEnglish: 'Predict the likelihood or odds of a binary categorical event (e.g., Pass vs. Fail, Yes vs. No).',
    whenToUse: 'Use when your outcome is dichotomous and you want to calculate Odds Ratios for each predictor.',
    dataRequirements: '1 Dichotomous Categorical Outcome (0/1) + 1 or more Numeric/Categorical Predictors',
    apaExample: 'χ²(2) = 18.42, p < .001, Nagelkerke R² = .36, OR = 2.45, 95% CI [1.32, 4.56]',
    effectSizeMetric: 'Odds Ratio (Exp(B)) and Nagelkerke pseudo-R²',
    icon: Binary,
    tags: ['Dichotomous Outcome', 'Odds Ratios (OR)', 'Wald Chi-Square', 'Nagelkerke R²'],
  },

  // --- APA CATEGORY 4: Associations, Correlation & Scale Measurement ---
  {
    id: 'correlation',
    title: 'Bivariate Correlation Matrix',
    apaCategory: 'association_measurement',
    apaCategoryLabel: 'APA IV: Associations & Scale Measurement',
    isParametric: true,
    plainEnglish: 'Examine linear or monotonic relationships among two or more continuous variables.',
    whenToUse: 'Use when testing associations without assuming causal direction (Pearson r or Spearman rank rho).',
    dataRequirements: '2 or more Continuous Numeric Variables',
    apaExample: 'r(58) = .48, p < .001, 95% CI [.26, .65]',
    effectSizeMetric: 'Correlation coefficient r (0.1 small, 0.3 med, 0.5 large)',
    icon: BarChart2,
    tags: ['Pearson r', 'Spearman ρ', 'Correlation Matrix', 'Bivariate Association'],
  },
  {
    id: 'cronbach_alpha',
    title: "Cronbach's Alpha Scale Reliability",
    apaCategory: 'association_measurement',
    apaCategoryLabel: 'APA IV: Associations & Scale Measurement',
    isParametric: true,
    plainEnglish: 'Evaluate the internal consistency reliability of multi-item survey scales and tests.',
    whenToUse: 'Use prior to computing composite scale scores to verify that survey items reliably measure the same construct (α ≥ .70).',
    dataRequirements: '2 or more Continuous/Likert Survey Items measuring a single psychological construct',
    apaExample: "Cronbach's α = .86, 4 items, M = 74.5, SD = 8.2",
    effectSizeMetric: "Cronbach's Alpha (α ≥ .70 acceptable, α ≥ .80 good)",
    icon: ShieldCheck,
    tags: ['Psychometrics', 'Scale Reliability', 'Internal Consistency', 'Item-Total Correlation', 'Alpha If Deleted'],
  },

  // --- APA CATEGORY 5: Categorical Frequencies & Proportions ---
  {
    id: 'chi_square',
    title: 'Chi-Square Test of Independence',
    apaCategory: 'categorical_frequencies',
    apaCategoryLabel: 'APA V: Categorical Frequencies & Proportions',
    isParametric: false,
    plainEnglish: 'Determine if two categorical variables are significantly related or independent.',
    whenToUse: 'Use to cross-tabulate frequencies in contingency tables (e.g., Department × Turnover Risk).',
    dataRequirements: '2 Categorical Variables with discrete group levels',
    apaExample: 'χ²(2, N = 60) = 8.42, p = .015, V = .37',
    effectSizeMetric: "Cramér's V (for tables > 2×2) or Phi (φ) for 2×2",
    icon: Table2,
    tags: ['Contingency Matrix', 'Cross-Tabulation', "Cramér's V", 'Observed vs Expected'],
  },
  {
    id: 'chi_square_gof',
    title: 'Chi-Square Goodness-of-Fit Test',
    apaCategory: 'categorical_frequencies',
    apaCategoryLabel: 'APA V: Categorical Frequencies & Proportions',
    isParametric: false,
    plainEnglish: 'Test whether observed category frequencies match an equal or hypothesized theoretical distribution.',
    whenToUse: 'Use to check whether participants are equally distributed across categories of a single variable.',
    dataRequirements: '1 Categorical Variable with 2 or more discrete levels',
    apaExample: 'χ²(2, N = 60) = 6.20, p = .045',
    effectSizeMetric: "Cohen's w effect size",
    icon: PieChart,
    tags: ['Single Categorical', 'Observed vs Expected', 'Goodness-of-Fit', 'Equal Proportions'],
  },

  // --- APA CATEGORY 6: Descriptive Screening & Distributional Metrics ---
  {
    id: 'descriptive',
    title: 'Descriptive Statistics & Normality',
    apaCategory: 'descriptive_screening',
    apaCategoryLabel: 'APA VI: Descriptive & Distributional Screening',
    isParametric: true,
    plainEnglish: 'Calculate central tendency, dispersion, skewness, kurtosis, and parametric normality checks.',
    whenToUse: 'Use as the mandatory first step for every quantitative paper to report sample demographics and verify parametric assumptions.',
    dataRequirements: '1 or more Continuous Numeric Variables',
    apaExample: 'M = 78.50, SD = 8.40, Mdn = 79.00, 95% CI [76.32, 80.68]',
    effectSizeMetric: 'Standard Deviation, Interquartile Range, 95% CI',
    icon: SlidersHorizontal,
    tags: ['Mean & SD', 'Median & IQR', 'Skewness & Kurtosis', 'Normality Audit', 'Table 1 Demographics'],
  },

  // --- APA CATEGORY 7: Advanced Latent Modeling & SEM ---
  {
    id: 'exploratory_factor_analysis',
    title: 'Exploratory Factor Analysis (EFA)',
    apaCategory: 'advanced_modeling',
    apaCategoryLabel: 'APA VII: Advanced Latent Modeling & SEM',
    isParametric: true,
    plainEnglish: 'Discover underlying latent dimensions, reduce item sets, and evaluate Kaiser-Meyer-Olkin sampling adequacy with Varimax rotation.',
    whenToUse: 'Use when validating scale structures, exploring psychometric survey dimensions, or reducing high-dimensional indicator batteries.',
    dataRequirements: '3 or more Continuous Scale Items (e.g., Likert survey batteries)',
    apaExample: 'KMO = .84, Bartlett χ²(45) = 214.80, p < .001, 3 factors (68.4% var)',
    effectSizeMetric: 'Eigenvalues > 1.0, Total Variance Explained (%), Communalities (h²)',
    icon: Layers,
    tags: ['Latent Constructs', 'KMO Adequacy', 'Bartlett Sphericity', 'Varimax Rotation', 'Eigenvalues'],
  },
  {
    id: 'confirmatory_factor_analysis',
    title: 'Confirmatory Factor Analysis (CFA)',
    apaCategory: 'advanced_modeling',
    apaCategoryLabel: 'APA VII: Advanced Latent Modeling & SEM',
    isParametric: true,
    plainEnglish: 'Verify a hypothesized multi-factor measurement model and test goodness-of-fit against Hu & Bentler (1999) joint criteria.',
    whenToUse: 'Use to evaluate measurement instrument validity, testing whether observed indicators reliably represent hypothesized latent constructs.',
    dataRequirements: 'Multiple continuous indicator variables mapped to latent factors',
    apaExample: 'χ²(24) = 31.2, p = .148, CFI = .978, TLI = .967, RMSEA = .038, SRMR = .039',
    effectSizeMetric: 'CFI, TLI, RMSEA (90% CI), SRMR, CR > .70, AVE > .50',
    icon: ShieldCheck,
    tags: ['Measurement Model', 'Hu & Bentler Fit', 'CFI & TLI', 'RMSEA & SRMR', 'CR & AVE'],
  },
  {
    id: 'structural_equation_modeling',
    title: 'Structural Equation Modeling (SEM)',
    apaCategory: 'advanced_modeling',
    apaCategoryLabel: 'APA VII: Advanced Latent Modeling & SEM',
    isParametric: true,
    plainEnglish: 'Model simultaneous direct, indirect, and mediated structural regression paths among latent and observed variables.',
    whenToUse: 'Use to test complex theoretical models with mediator mechanisms, direct/indirect effects (Sobel test), and global model fit.',
    dataRequirements: 'Continuous indicators for Exogenous, Mediator, and Endogenous constructs',
    apaExample: 'CFI = .972, RMSEA = .041, β = .48, SE = .08, z = 5.82, p < .001',
    effectSizeMetric: 'Standardized Path β, Sobel Mediation z, Endogenous R², Cohen f²',
    icon: TrendingUp,
    tags: ['Structural Paths', 'Direct & Indirect Effects', 'Sobel Mediation', 'Endogenous R²', 'Global Fit'],
  },
];

interface TestSelectorProps {
  selectedTest: StatisticalTestType;
  onSelectTest?: (test: StatisticalTestType) => void;
  onOpenWizard: () => void;
}

export const TestSelector: React.FC<TestSelectorProps> = ({
  selectedTest,
  onOpenWizard,
}) => {
  const activeOption = APA_TEST_OPTIONS.find((t) => t.id === selectedTest) || APA_TEST_OPTIONS[0];
  const IconComponent = activeOption.icon;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-200 shrink-0">
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {activeOption.title}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};
