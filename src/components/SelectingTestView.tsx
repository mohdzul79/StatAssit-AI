import React, { useState, useMemo } from 'react';
import {
  History,
  Grid,
  TrendingUp,
  BarChart2,
  Table2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  FileText,
  Sliders,
  ShieldCheck,
  AlertCircle,
  Info,
  Search,
  ExternalLink,
  BookOpen,
  Database,
  Eye,
  X,
} from 'lucide-react';
import { StatisticalTestType } from '../types/stats';
import { TEST_STUDY_PRESETS, TestStudyPreset } from '../utils/testStudyPresets';
import { GRAPH_CHART_TAXONOMY, GraphChartProfile } from '../data/graphChartProfiles';
import {
  EXTENDED_STATISTICAL_TEST_DATABASE,
  StatisticalTestRecommendation,
} from '../data/extendedStatisticalDatabase';

interface SelectingTestViewProps {
  onSelectAndConfigure: (test: StatisticalTestType) => void;
  currentSelectedTest: StatisticalTestType;
}

const BASE_STATISTICAL_TEST_DATABASE: Record<string, any> = {
  independent_ttest: {
    testId: 'independent_ttest',
    testTitle: 'Independent-Samples t-Test',
    isParametric: true,
    nonParametricAlternative: 'Mann-Whitney U Test',
    designCategory: 'Between-Subjects Group Comparison (2 Unrelated Groups)',
    ivDescription: 'One categorical independent variable consisting of two independent, unrelated groups (e.g., Treatment vs. Control, Male vs. Female).',
    dvDescription: 'One continuous dependent variable measured at the interval or ratio scale (e.g., Exam Score, Reaction Time, Systolic Blood Pressure).',
    nullHypothesis: 'H₀: μ₁ = μ₂ (There is no significant difference between the population means of the two groups).',
    altHypothesis: 'H₁: μ₁ ≠ μ₂ (There is a statistically significant difference between the population means of the two groups).',
    assumptions: [
      {
        number: 1,
        title: 'Continuous Dependent Variable',
        description: 'Your dependent variable should be measured on a continuous scale (interval or ratio).',
        howToCheck: 'Verified during variable assignment.',
      },
      {
        number: 2,
        title: 'Categorical Independent Variable (2 Groups)',
        description: 'Your independent variable should consist of two categorical, independent groups.',
        howToCheck: 'Mutual exclusivity of group assignments.',
      },
      {
        number: 3,
        title: 'Independence of Observations',
        description: 'There must be no relationship between participants in either group (participants cannot be in both groups).',
        howToCheck: 'Research design and sampling procedure audit.',
      },
      {
        number: 4,
        title: 'No Significant Outliers',
        description: 'There should be no significant outliers in either group, as outliers distort the group mean and t-statistic.',
        howToCheck: 'Boxplot inspection and Z-score thresholding (|Z| > 3.0).',
      },
      {
        number: 5,
        title: 'Normality of Distribution',
        description: 'Your dependent variable should be approximately normally distributed for each group.',
        howToCheck: 'Shapiro-Wilk test (p > .05 indicates normality) and Normal Q-Q plots.',
      },
      {
        number: 6,
        title: 'Homogeneity of Variances',
        description: 'The variances of the populations should be equal across the two groups (homoscedasticity).',
        howToCheck: "Levene's Test for Equality of Variances. If violated (p < .05), StatAssist AI automatically provides Welch's t-test.",
      },
    ],
    apaSyntax: 't(df) = [value], p = [value], d = [value], 95% CI [LL, UL]',
    apaExampleSentence: 'An independent-samples t-test indicated that students in the mindfulness group achieved significantly higher exam scores (M = 84.50, SD = 6.20) than students in the control group (M = 76.20, SD = 7.10), t(58) = 4.82, p < .001, d = 1.25, 95% CI [4.85, 11.75].',
    effectSizeMetric: "Cohen's d (0.2 = small, 0.5 = medium, 0.8 = large)",
    statAssistSupport: 'Fully automated calculation with Levene’s test, Welch’s correction, Cohen’s d, and 95% Confidence Intervals.',
  },
  paired_ttest: {
    testId: 'paired_ttest',
    testTitle: 'Paired-Samples t-Test (Dependent t-Test)',
    isParametric: true,
    nonParametricAlternative: 'Wilcoxon Signed-Rank Test',
    designCategory: 'Within-Subjects / Repeated Measures (2 Related Conditions / Timepoints)',
    ivDescription: 'One within-subjects factor with two related conditions or timepoints (e.g., Pre-test vs. Post-test, Condition A vs. Condition B).',
    dvDescription: 'Two continuous measures collected from the identical participants or matched pairs (interval or ratio scale).',
    nullHypothesis: 'H₀: μ_diff = 0 (The mean difference between paired observations equals zero).',
    altHypothesis: 'H₁: μ_diff ≠ 0 (The mean difference between paired observations does not equal zero).',
    assumptions: [
      {
        number: 1,
        title: 'Continuous Dependent Variable',
        description: 'The difference between the pairs must be continuous (interval or ratio).',
        howToCheck: 'Calculated difference score D = Time 2 - Time 1.',
      },
      {
        number: 2,
        title: 'Paired / Dependent Observations',
        description: 'Subjects in both conditions must be the same individuals or genetically/clinically matched pairs.',
        howToCheck: 'Study methodology and participant tracking ID.',
      },
      {
        number: 3,
        title: 'No Significant Outliers in Differences',
        description: 'There should be no extreme outliers in the distribution of pairwise differences.',
        howToCheck: 'Difference score boxplot inspection.',
      },
      {
        number: 4,
        title: 'Normality of Difference Scores',
        description: 'The distribution of the differences between the paired groups should be approximately normally distributed.',
        howToCheck: 'Shapiro-Wilk test on difference variable D.',
      },
    ],
    apaSyntax: 't(df) = [value], p = [value], d = [value], 95% CI [LL, UL]',
    apaExampleSentence: 'A paired-samples t-test revealed a significant increase in participant performance from pre-intervention baseline (M = 65.30, SD = 8.12) to post-intervention follow-up (M = 78.40, SD = 7.95), t(44) = 7.15, p < .001, d = 1.07, 95% CI [9.45, 16.75].',
    effectSizeMetric: "Cohen's d_z for paired differences",
    statAssistSupport: 'Pairwise difference calculations, standard error of difference, and APA 7th repeated measures synthesis.',
  },
  anova: {
    testId: 'anova',
    testTitle: 'One-Way Between-Subjects ANOVA',
    isParametric: true,
    nonParametricAlternative: 'Kruskal-Wallis H Test',
    designCategory: 'Between-Subjects Group Comparison (3 or More Independent Groups)',
    ivDescription: 'One categorical independent variable consisting of three or more independent groups (e.g., Control vs. Low Dose vs. High Dose; Freshman vs. Sophomore vs. Junior vs. Senior).',
    dvDescription: 'One continuous dependent variable measured at the interval or ratio scale (e.g., Cognitive Task Accuracy, Cholesterol Level, Reaction Time).',
    nullHypothesis: 'H₀: μ₁ = μ₂ = μ₃ = ... = μ_k (All population group means are equal).',
    altHypothesis: 'H₁: At least two population group means differ significantly from one another.',
    assumptions: [
      {
        number: 1,
        title: 'Continuous Dependent Variable',
        description: 'Dependent variable measured at interval or ratio level.',
        howToCheck: 'Confirmed in variable specification.',
      },
      {
        number: 2,
        title: 'Categorical IV with 3+ Independent Groups',
        description: 'The independent variable must have three or more distinct, unrelated levels.',
        howToCheck: 'Dataset unique factor levels count.',
      },
      {
        number: 3,
        title: 'Independence of Observations',
        description: 'Each participant contributes exactly one observation to one group.',
        howToCheck: 'Experimental design confirmation.',
      },
      {
        number: 4,
        title: 'No Extreme Outliers',
        description: 'No extreme values distorting within-group variances or mean squares.',
        howToCheck: 'Boxplot inspection across all factor groups.',
      },
      {
        number: 5,
        title: 'Normality of Residuals / Groups',
        description: 'The dependent variable should be normally distributed within each factor level.',
        howToCheck: 'Shapiro-Wilk test for each group level.',
      },
      {
        number: 6,
        title: 'Homogeneity of Variances',
        description: 'Equal variances across all 3+ populations (homoscedasticity).',
        howToCheck: "Levene's test of equality of variances. Post-hoc tests: Tukey HSD (if equal variances) vs. Games-Howell (if unequal).",
      },
    ],
    apaSyntax: 'F(df_between, df_within) = [value], p = [value], η² = [value]',
    apaExampleSentence: 'A one-way between-subjects ANOVA was conducted to compare the effect of intervention dosage on symptom reduction. There was a statistically significant difference between dosage conditions, F(2, 57) = 8.42, p < .001, η² = .23. Post hoc comparisons using the Tukey HSD test indicated that the high-dose group (M = 88.2, SD = 5.4) scored significantly higher than the placebo control (M = 72.1, SD = 6.8).',
    effectSizeMetric: 'Eta-squared (η²) or Partial Eta-squared (η_p²)',
    statAssistSupport: 'Sum of squares, Mean squares, F-statistic, p-value, Eta-squared, and automated Tukey HSD post-hoc contrasts.',
  },
  regression: {
    testId: 'regression',
    testTitle: 'Multiple Linear Regression',
    isParametric: true,
    nonParametricAlternative: 'Ordinal Logistic Regression / Robust Regression',
    designCategory: 'Prediction / Explanatory Modeling (Continuous DV with Multiple Predictors)',
    ivDescription: 'Two or more independent predictor variables (can be continuous, or dichotomous/dummy-coded categorical).',
    dvDescription: 'One continuous dependent outcome variable measured at interval or ratio scale (e.g., GPA, Salary, Blood Pressure, Burnout Score).',
    nullHypothesis: 'H₀: β₁ = β₂ = ... = β_k = 0 (R² = 0, predictors do not explain significant variance in the outcome).',
    altHypothesis: 'H₁: At least one regression coefficient β_j ≠ 0 (The regression model explains significant variance).',
    assumptions: [
      {
        number: 1,
        title: 'Linear Relationship',
        description: 'Linear relationship between each continuous predictor and the outcome variable.',
        howToCheck: 'Scatterplots and partial regression plots.',
      },
      {
        number: 2,
        title: 'No Multicollinearity',
        description: 'Predictors should not be too highly correlated with each other (r < .80).',
        howToCheck: 'Variance Inflation Factor (VIF < 5.0) and Tolerance (> 0.2).',
      },
      {
        number: 3,
        title: 'Independence of Residuals',
        description: 'Residuals should be independent and uncorrelated.',
        howToCheck: 'Durbin-Watson statistic (values between 1.5 and 2.5 indicate independence).',
      },
      {
        number: 4,
        title: 'Homoscedasticity of Residuals',
        description: 'The variance of residuals should be constant across all levels of the predicted outcome.',
        howToCheck: 'Scatterplot of standardized residuals against predicted values.',
      },
      {
        number: 5,
        title: 'Normally Distributed Residuals',
        description: 'The residuals (prediction errors) should be approximately normally distributed.',
        howToCheck: 'Histogram of standardized residuals and Normal P-P plot.',
      },
    ],
    apaSyntax: 'F(df_reg, df_res) = [value], p = [value], R² = [value], Adj. R² = [value]',
    apaExampleSentence: 'A multiple linear regression was calculated to predict academic performance based on study hours, sleep duration, and self-reported stress. A significant regression equation was found, F(3, 56) = 14.86, p < .001, with an R² of .443 (Adjusted R² = .413). Study hours (β = .48, p < .001) and sleep hours (β = .31, p = .008) emerged as significant positive predictors.',
    effectSizeMetric: 'R² (variance accounted for) and Cohen’s f²',
    statAssistSupport: 'Unstandardized coefficients (B, SE), Standardized Beta (β), t-statistics, p-values, R², Adjusted R², and VIF multicollinearity audits.',
  },
  correlation: {
    testId: 'correlation',
    testTitle: "Pearson's Correlation / Spearman's Rho",
    isParametric: true,
    nonParametricAlternative: "Spearman's Rank-Order Correlation (ρ)",
    designCategory: 'Bivariate Relationship & Covariance (2 Continuous / Ordinal Variables)',
    ivDescription: 'Two continuous or ordinal variables (no strict IV/DV directionality required; tests mutual association).',
    dvDescription: 'Continuous interval/ratio scale (Pearson) or monotonic ordinal/ranked scale (Spearman).',
    nullHypothesis: 'H₀: ρ = 0 (There is no correlation between the two variables in the population).',
    altHypothesis: 'H₁: ρ ≠ 0 (There is a statistically significant correlation between the two variables).',
    assumptions: [
      {
        number: 1,
        title: 'Continuous Scale (Pearson) or Ordinal (Spearman)',
        description: 'Both variables must be quantitative continuous measures (Pearson) or rank-ordered (Spearman).',
        howToCheck: 'Verified during variable selection.',
      },
      {
        number: 2,
        title: 'Paired Observations',
        description: 'Each participant must have a score on both Variable X and Variable Y.',
        howToCheck: 'Row-wise pairing in dataset.',
      },
      {
        number: 3,
        title: 'Linearity (Pearson) / Monotonicity (Spearman)',
        description: 'A straight-line relationship (Pearson) or monotonic trend (Spearman) between variables.',
        howToCheck: 'Bivariate scatterplot inspection.',
      },
      {
        number: 4,
        title: 'No Significant Outliers',
        description: 'Outliers can artificially inflate or attenuate the correlation coefficient r.',
        howToCheck: 'Scatterplot examination and bivariate Cook’s distance.',
      },
      {
        number: 5,
        title: 'Bivariate Normality (Pearson)',
        description: 'Both variables should follow a bivariate normal distribution.',
        howToCheck: 'Shapiro-Wilk test for both variables. If non-normal, use Spearman’s rho.',
      },
    ],
    apaSyntax: 'r(df) = [value], p = [value] (Pearson) OR r_s(df) = [value], p = [value] (Spearman)',
    apaExampleSentence: 'A Pearson product-moment correlation coefficient was computed to assess the relationship between study hours and exam score. There was a strong, positive correlation between the two variables, r(58) = .68, p < .001, indicating that higher study time is associated with higher test scores.',
    effectSizeMetric: 'Correlation coefficient r (small: .10, medium: .30, large: .50) or coefficient of determination (r²)',
    statAssistSupport: 'Pairwise Pearson r, Spearman ρ, exact p-values, sample size N, and correlation matrix with APA asterisks (*p < .05, **p < .01).',
  },
  chi_square: {
    testId: 'chi_square',
    testTitle: 'Chi-Square Test of Independence',
    isParametric: false,
    nonParametricAlternative: "Fisher's Exact Test (for 2x2 with expected counts < 5)",
    designCategory: 'Categorical Contingency & Independence (2 Categorical / Nominal Variables)',
    ivDescription: 'One categorical variable with two or more discrete categories (e.g., Department, Gender, Group).',
    dvDescription: 'A second categorical variable with two or more discrete categories (e.g., Pass/Fail, Preference Choice).',
    nullHypothesis: 'H₀: The two categorical variables are independent in the population (no association).',
    altHypothesis: 'H₁: The two categorical variables are dependent / associated in the population.',
    assumptions: [
      {
        number: 1,
        title: 'Two Categorical Variables',
        description: 'Both variables must be nominal or ordinal categorical variables.',
        howToCheck: 'Verified by variable roles.',
      },
      {
        number: 2,
        title: 'Independence of Observations',
        description: 'Each participant, item, or entity can belong to only one cell in the contingency table.',
        howToCheck: 'No repeated measures; one observation per participant.',
      },
      {
        number: 3,
        title: 'Expected Cell Frequencies ≥ 5',
        description: 'All expected cell frequencies should be greater than 1, and at least 80% should be 5 or greater.',
        howToCheck: 'Checked via Contingency Table expected frequency calculation: E = (Row Total × Col Total) / Grand Total.',
      },
    ],
    apaSyntax: 'χ²(df, N = [total]) = [value], p = [value], V = [value]',
    apaExampleSentence: 'A Pearson chi-square test of independence was performed to examine the relation between intervention group and certification passing status. The relation between these variables was significant, χ²(1, N = 60) = 6.48, p = .011, Cramér’s V = .33, with mindfulness participants exhibiting higher passing rates.',
    effectSizeMetric: "Cramér's V (for tables > 2x2) or Phi coefficient φ (for 2x2 tables)",
    statAssistSupport: 'Contingency cross-tabulation, Observed vs. Expected cells, Pearson χ², degrees of freedom, exact p-value, and Cramér’s V effect size.',
  },
  descriptive: {
    testId: 'descriptive',
    testTitle: 'Descriptive Statistics & Normality Screening',
    isParametric: true,
    nonParametricAlternative: 'Median & Interquartile Range (IQR)',
    designCategory: 'Univariate Summary & Distribution Diagnostics (Single or Multiple Continuous Variables)',
    ivDescription: 'Not applicable (Exploratory / Univariate analysis).',
    dvDescription: 'One or more continuous numeric variables (Interval or Ratio scale).',
    nullHypothesis: 'H₀: The sample data is normally distributed (Shapiro-Wilk test).',
    altHypothesis: 'H₁: The sample data deviates significantly from a normal distribution.',
    assumptions: [
      {
        number: 1,
        title: 'Continuous Quantitative Scale',
        description: 'Variables must be numeric continuous measures.',
        howToCheck: 'Scale role check.',
      },
      {
        number: 2,
        title: 'Assessment of Distribution Shape',
        description: 'Parametric summaries (Mean, SD) require approximate symmetry; skewed data requires Median and IQR.',
        howToCheck: 'Skewness (between -1.0 and +1.0) and Kurtosis (between -2.0 and +2.0).',
      },
    ],
    apaSyntax: 'M = [value], SD = [value], Mdn = [value], IQR = [value], Skew = [value]',
    apaExampleSentence: 'Descriptive statistics were computed for the sample (N = 60). Participants had a mean exam score of 80.35 (SD = 7.82, 95% CI [78.33, 82.37]), with a median of 81.00 (IQR = 11.25). Skewness (-0.21) and kurtosis (-0.45) indicated an approximately normal distribution suitable for parametric modeling.',
    effectSizeMetric: 'Standard Deviation, Interquartile Range, and 95% Confidence Intervals of the Mean',
    statAssistSupport: 'Sample size N, Mean, Median, Std Dev, Variance, IQR, Min, Max, Skewness, Kurtosis, and Shapiro-Wilk screening.',
  },
  one_sample_ttest: {
    testId: 'one_sample_ttest',
    testTitle: 'One-Sample t-Test',
    isParametric: true,
    nonParametricAlternative: 'Wilcoxon Signed-Rank (One-Sample)',
    designCategory: 'Benchmark Comparison (Sample Mean vs. Hypothesized Population Mean μ₀)',
    ivDescription: 'A single hypothesized numeric benchmark or population criterion value (μ₀).',
    dvDescription: 'One continuous dependent variable measured at interval or ratio scale.',
    nullHypothesis: 'H₀: μ = μ₀ (The population mean equals the hypothesized criterion value).',
    altHypothesis: 'H₁: μ ≠ μ₀ (The population mean differs significantly from the hypothesized criterion value).',
    assumptions: [
      { number: 1, title: 'Continuous Dependent Variable', description: 'Measured at interval or ratio level.', howToCheck: 'Variable type verification.' },
      { number: 2, title: 'Independent Observations', description: 'Participants contribute exactly one score.', howToCheck: 'Sampling procedure audit.' },
      { number: 3, title: 'Normality of Sample Distribution', description: 'Sample data should follow a normal distribution.', howToCheck: 'Shapiro-Wilk test (p > .05) and Normal Q-Q plot.' },
    ],
    apaSyntax: 't(df) = [value], p = [value], d = [value], 95% CI [LL, UL]',
    apaExampleSentence: 'A one-sample t-test was conducted to compare student exam scores against the national benchmark of 75.0. Students scored significantly higher than the benchmark, t(59) = 5.24, p < .001, d = 0.68, 95% CI [78.45, 82.35].',
    effectSizeMetric: "Cohen's d relative to test value",
    statAssistSupport: 'Sample Mean, SD, SE, Mean Difference, t-statistic, exact p-value, 95% CI, and Cohen’s d.',
  },
  two_way_anova: {
    testId: 'two_way_anova',
    testTitle: 'Two-Way Factorial ANOVA (A × B)',
    isParametric: true,
    nonParametricAlternative: 'Aligned Rank Transform (ART) ANOVA',
    designCategory: 'Factorial Group Comparison (2 Independent Categorical Factors)',
    ivDescription: 'Two categorical independent variables (Factor A and Factor B) creating factorial cell conditions.',
    dvDescription: 'One continuous dependent outcome variable.',
    nullHypothesis: 'H₀: No main effect of A, no main effect of B, and no interaction effect (A × B) on the outcome.',
    altHypothesis: 'H₁: Statistically significant main effect(s) and/or interaction effect exist.',
    assumptions: [
      { number: 1, title: 'Continuous Outcome Variable', description: 'Measured on an interval or ratio scale.', howToCheck: 'Variable metadata verification.' },
      { number: 2, title: 'Independence of Observations', description: 'Subjects in each cell are independent.', howToCheck: 'Factorial design check.' },
      { number: 3, title: 'Normality of Residuals', description: 'Residuals within each cell are normally distributed.', howToCheck: 'Q-Q plots of residuals.' },
      { number: 4, title: 'Homogeneity of Variances', description: 'Equal variances across all factorial cells.', howToCheck: "Levene's test across cell conditions." },
    ],
    apaSyntax: 'F(df_effect, df_error) = [value], p = [value], η_p² = [value]',
    apaExampleSentence: 'A 2 × 3 factorial ANOVA revealed a significant main effect of intervention, F(2, 54) = 8.12, p = .001, η_p² = .23, and a significant Intervention × Gender interaction, F(2, 54) = 4.25, p = .019, η_p² = .14.',
    effectSizeMetric: 'Partial Eta-squared (η_p²)',
    statAssistSupport: 'Main effects A & B, interaction A × B, cell means, error MS, F-statistics, exact p-values, and partial η².',
  },
  repeated_measures_anova: {
    testId: 'repeated_measures_anova',
    testTitle: 'One-Way Repeated Measures ANOVA',
    isParametric: true,
    nonParametricAlternative: 'Friedman Test',
    designCategory: 'Within-Subjects Longitudinal Comparison (3 or More Conditions / Timepoints)',
    ivDescription: 'One within-subjects factor consisting of 3 or more repeated testing occasions or conditions.',
    dvDescription: '3 or more continuous measures collected from the same individuals.',
    nullHypothesis: 'H₀: Mean scores are equivalent across all repeated conditions (μ₁ = μ₂ = ... = μ_k).',
    altHypothesis: 'H₁: Mean scores differ significantly across at least two conditions.',
    assumptions: [
      { number: 1, title: 'Continuous Repeated Measures', description: 'Measures at interval or ratio scale.', howToCheck: 'Column metadata verification.' },
      { number: 2, title: 'Sphericity Assumption', description: 'Equal variances of differences between all possible pairs of within-subject conditions.', howToCheck: "Mauchly's Sphericity Test & Greenhouse-Geisser correction." },
      { number: 3, title: 'Normality of Differences', description: 'Differences between conditions are normally distributed.', howToCheck: 'Normal Q-Q plots.' },
    ],
    apaSyntax: 'F(df_time, df_error) = [value], p = [value], η_p² = [value]',
    apaExampleSentence: 'A repeated-measures ANOVA revealed a statistically significant effect of time on cognitive performance, F(2, 88) = 14.32, p < .001, η_p² = .25, Greenhouse-Geisser ε = .88.',
    effectSizeMetric: 'Partial Eta-squared (η_p²)',
    statAssistSupport: 'Timepoint Means, SD, SE, Mauchly’s sphericity test, Greenhouse-Geisser epsilon, F-statistic, and partial η².',
  },
  ancova: {
    testId: 'ancova',
    testTitle: 'Analysis of Covariance (ANCOVA)',
    isParametric: true,
    nonParametricAlternative: 'Rank-based ANCOVA / Quade’s Test',
    designCategory: 'Group Comparison with Covariate Control (Adjusting for Confounders)',
    ivDescription: 'One categorical factor (2+ groups) plus one or more continuous covariates (nuisance variables).',
    dvDescription: 'One continuous dependent outcome variable.',
    nullHypothesis: 'H₀: Adjusted population means do not differ across groups after controlling for the covariate.',
    altHypothesis: 'H₁: Adjusted population means differ significantly after controlling for the covariate.',
    assumptions: [
      { number: 1, title: 'Linearity of Covariate and Outcome', description: 'Linear relationship between covariate and DV in all groups.', howToCheck: 'Grouped scatterplot inspection.' },
      { number: 2, title: 'Homogeneity of Regression Slopes', description: 'Regression slopes between covariate and DV are equal across all groups.', howToCheck: 'Group × Covariate interaction test (p > .05).' },
      { number: 3, title: 'Homogeneity of Variances', description: 'Equal error variances across groups.', howToCheck: "Levene's test on ANCOVA residuals." },
    ],
    apaSyntax: 'F(df_group, df_error) = [value], p = [value], η_p² = [value]',
    apaExampleSentence: 'After controlling for pre-test baseline scores, there was a statistically significant effect of intervention arm on post-test scores, F(2, 41) = 9.45, p < .001, η_p² = .32.',
    effectSizeMetric: 'Partial Eta-squared (η_p²)',
    statAssistSupport: 'Covariate regression coefficient, adjusted marginal group means, SE, F-statistics, and partial η².',
  },
  mann_whitney: {
    testId: 'mann_whitney',
    testTitle: 'Mann-Whitney U Test',
    isParametric: false,
    nonParametricAlternative: 'Parametric: Independent Samples t-Test',
    designCategory: 'Non-Parametric Between-Subjects Comparison (2 Independent Groups)',
    ivDescription: 'One categorical variable with two independent groups (e.g., Treatment vs. Control).',
    dvDescription: 'One ordinal or continuous variable exhibiting skewness or small sample size.',
    nullHypothesis: 'H₀: The distributions of the two populations are identical (equal medians).',
    altHypothesis: 'H₁: The distributions of the two populations differ significantly.',
    assumptions: [
      { number: 1, title: 'Ordinal or Continuous Scale', description: 'Data must be at least ordinal (rankable).', howToCheck: 'Scale audit.' },
      { number: 2, title: 'Independence of Observations', description: 'Different participants in each group.', howToCheck: 'Study design verification.' },
      { number: 3, title: 'Similar Distribution Shape for Medians', description: 'If shapes are similar, test compares medians; if shapes differ, compares mean ranks.', howToCheck: 'Histograms by group.' },
    ],
    apaSyntax: 'U = [value], z = [value], p = [value], r = [value]',
    apaExampleSentence: 'A Mann-Whitney U test indicated that satisfaction was significantly higher in the remote group (Mdn = 62.0) than in the on-site group (Mdn = 44.0), U = 185.0, z = 2.48, p = .013, rank-biserial r = .34.',
    effectSizeMetric: 'Rank-Biserial Correlation r = 1 - 2U / (n1*n2)',
    statAssistSupport: 'Medians, Mean Ranks, Sum of Ranks, U statistic, Wilcoxon W, Z-score, exact p-value, and rank-biserial r.',
  },
  wilcoxon_signed: {
    testId: 'wilcoxon_signed',
    testTitle: 'Wilcoxon Signed-Rank Test',
    isParametric: false,
    nonParametricAlternative: 'Parametric: Paired Samples t-Test',
    designCategory: 'Non-Parametric Within-Subjects Comparison (2 Related Conditions / Timepoints)',
    ivDescription: 'Two repeated measures or matched conditions.',
    dvDescription: 'Two continuous or ordinal variables measured on the same participants.',
    nullHypothesis: 'H₀: The median difference between paired observations equals zero.',
    altHypothesis: 'H₁: The median difference between paired observations differs from zero.',
    assumptions: [
      { number: 1, title: 'Paired Data', description: 'Each subject tested in both conditions.', howToCheck: 'Participant ID tracking.' },
      { number: 2, title: 'Symmetric Differences', description: 'Differences between pairs are approximately symmetrically distributed.', howToCheck: 'Difference score histogram.' },
    ],
    apaSyntax: 'W = [value], z = [value], p = [value], r = [value]',
    apaExampleSentence: 'A Wilcoxon signed-rank test demonstrated a statistically significant improvement from baseline (Mdn = 64.0) to endpoint (Mdn = 78.0), W = 84.0, z = 3.25, p = .001, r = .42.',
    effectSizeMetric: 'Effect size r = |z| / sqrt(N)',
    statAssistSupport: 'Medians, Median Difference, Signed Rank Sums W+ and W-, Z-statistic, and effect size r.',
  },
  kruskal_wallis: {
    testId: 'kruskal_wallis',
    testTitle: 'Kruskal-Wallis H Test',
    isParametric: false,
    nonParametricAlternative: 'Parametric: One-Way ANOVA',
    designCategory: 'Non-Parametric Group Comparison (3 or More Independent Groups)',
    ivDescription: 'One categorical factor consisting of 3 or more independent groups.',
    dvDescription: 'One continuous or ordinal outcome variable.',
    nullHypothesis: 'H₀: The distribution of the outcome is identical across all groups.',
    altHypothesis: 'H₁: At least one group differs significantly from the other groups in distribution.',
    assumptions: [
      { number: 1, title: 'Ordinal or Continuous Scale', description: 'Observations must be rankable.', howToCheck: 'Scale role check.' },
      { number: 2, title: 'Independent Groups', description: 'Each participant in exactly one group.', howToCheck: 'Design audit.' },
    ],
    apaSyntax: 'H(df) = [value], p = [value], ε² = [value]',
    apaExampleSentence: 'A Kruskal-Wallis H test showed a statistically significant difference in burnout among departments, H(2) = 14.82, p < .001, ε² = .27.',
    effectSizeMetric: 'Epsilon-squared (ε²)',
    statAssistSupport: 'Group Medians, Mean Ranks, Sum of Ranks, H statistic, degrees of freedom, exact p-value, and ε².',
  },
  friedman: {
    testId: 'friedman',
    testTitle: 'Friedman Repeated Measures Test',
    isParametric: false,
    nonParametricAlternative: 'Parametric: Repeated Measures ANOVA',
    designCategory: 'Non-Parametric Longitudinal Comparison (3 or More Conditions)',
    ivDescription: '3 or more repeated testing conditions or timepoints.',
    dvDescription: '3 or more continuous or ranked variables measured on the same subjects.',
    nullHypothesis: 'H₀: Rankings across conditions are equally likely (no condition effect).',
    altHypothesis: 'H₁: At least one condition systematically differs in rank.',
    assumptions: [
      { number: 1, title: 'Repeated Measures Design', description: 'Same participants in all k conditions.', howToCheck: 'Row-wise participant structure.' },
      { number: 2, title: 'Ordinal or Continuous Data', description: 'Rankable variables.', howToCheck: 'Variable scale verification.' },
    ],
    apaSyntax: 'χ_F²(df) = [value], p = [value], W = [value]',
    apaExampleSentence: 'A Friedman test revealed significant differences in rankings across conditions, χ_F²(2) = 16.45, p < .001, Kendall’s W = .30.',
    effectSizeMetric: "Kendall's W (Coefficient of Concordance)",
    statAssistSupport: 'Condition Mean Ranks, Medians, IQR, Friedman Chi-square statistic, df, and Kendall’s W.',
  },
  logistic_regression: {
    testId: 'logistic_regression',
    testTitle: 'Binary Logistic Regression',
    isParametric: true,
    nonParametricAlternative: 'Discriminant Analysis / Classification Trees',
    designCategory: 'Prediction of Dichotomous Outcome (0/1 Event Likelihood)',
    ivDescription: 'One or more continuous or categorical predictor variables.',
    dvDescription: 'One binary / dichotomous outcome variable (e.g., Pass vs. Fail, Yes vs. No).',
    nullHypothesis: 'H₀: Predictors explain zero variance in log-odds of event (all β = 0, OR = 1.0).',
    altHypothesis: 'H₁: At least one predictor significantly alters the odds of the event.',
    assumptions: [
      { number: 1, title: 'Binary Outcome', description: 'Outcome must have exactly two mutually exclusive categories.', howToCheck: 'Distinct value count = 2.' },
      { number: 2, title: 'Linearity in the Logit', description: 'Linear relationship between continuous predictors and log-odds.', howToCheck: 'Box-Tidwell test.' },
      { number: 3, title: 'No Multicollinearity', description: 'Predictors not overly correlated with each other.', howToCheck: 'Correlation matrix and VIF.' },
    ],
    apaSyntax: 'χ²(df) = [value], p = [value], Nagelkerke R² = [value], OR = [value]',
    apaExampleSentence: 'A binary logistic regression demonstrated that study hours significantly increased the odds of passing the exam, OR = 2.15, 95% CI [1.34, 3.45], Wald χ² = 11.20, p < .001.',
    effectSizeMetric: 'Odds Ratio (Exp(B)) and Nagelkerke pseudo-R²',
    statAssistSupport: 'Model Omnibus Chi-Square, -2LL, Nagelkerke R², Cox & Snell R², Wald Chi-Square, Odds Ratios, and 95% CI for OR.',
  },
  cronbach_alpha: {
    testId: 'cronbach_alpha',
    testTitle: "Cronbach's Alpha Scale Reliability",
    isParametric: true,
    nonParametricAlternative: "McDonald's Omega (ω)",
    designCategory: 'Scale Reliability & Psychometric Item Analysis',
    ivDescription: 'Multi-item survey scale questions (2 or more items measuring a construct).',
    dvDescription: 'Composite psychological or organizational construct.',
    nullHypothesis: 'H₀: The scale items do not exhibit acceptable internal consistency (α < .70).',
    altHypothesis: 'H₁: The scale items exhibit acceptable internal consistency (α ≥ .70).',
    assumptions: [
      { number: 1, title: 'Unidimensionality', description: 'Items reflect a single underlying construct.', howToCheck: 'Inter-item correlation matrix positive.' },
      { number: 2, title: 'Continuous or Likert Scale', description: 'Interval or 5-to-7 point Likert scale items.', howToCheck: 'Item type check.' },
    ],
    apaSyntax: "Cronbach's α = [value], M = [value], SD = [value]",
    apaExampleSentence: 'The 4-item burnout inventory demonstrated high internal consistency reliability, Cronbach’s α = .86 (standardized α = .87), with all item-total correlations exceeding .40.',
    effectSizeMetric: "Cronbach's Alpha (α ≥ .70 acceptable, α ≥ .80 good)",
    statAssistSupport: 'Raw Alpha, Standardized Alpha, Scale Mean, Scale SD, Item-rest correlation, and Alpha if item deleted.',
  },
  chi_square_gof: {
    testId: 'chi_square_gof',
    testTitle: 'Chi-Square Goodness-of-Fit Test',
    isParametric: false,
    nonParametricAlternative: 'Exact Binomial / Multinomial Test',
    designCategory: 'Single Categorical Distribution vs. Expected Proportions',
    ivDescription: 'One categorical variable with two or more discrete categories.',
    dvDescription: 'Observed frequency counts across categories.',
    nullHypothesis: 'H₀: Category frequencies conform to equal or hypothesized proportions.',
    altHypothesis: 'H₁: Category frequencies deviate significantly from expected proportions.',
    assumptions: [
      { number: 1, title: 'One Categorical Variable', description: 'Discrete mutually exclusive categories.', howToCheck: 'Variable category check.' },
      { number: 2, title: 'Expected Counts ≥ 5', description: 'Expected frequency in each category should be at least 5.', howToCheck: 'Expected cell count audit.' },
    ],
    apaSyntax: 'χ²(df, N = [total]) = [value], p = [value]',
    apaExampleSentence: 'A chi-square goodness-of-fit test showed that students were not equally distributed across intervention cohorts, χ²(2, N = 60) = 8.10, p = .017.',
    effectSizeMetric: "Cohen's w effect size",
    statAssistSupport: 'Observed vs Expected counts, raw residuals, standardized residuals, Pearson χ², df, and exact p-value.',
  },
};

export const STATISTICAL_TEST_DATABASE: Record<StatisticalTestType, StatisticalTestRecommendation> = {
  ...(BASE_STATISTICAL_TEST_DATABASE as any),
  ...(EXTENDED_STATISTICAL_TEST_DATABASE as any),
};


type GoalType = 'diff' | 'rel' | 'pred' | 'cat' | 'desc';
type DvType = 'continuous' | 'ordinal' | 'categorical';
type DesignType = 'between' | 'within' | 'unpaired';
type GroupCountType = '2_groups' | '3_plus';
type ParametricChoiceType = 'parametric' | 'non_parametric';

export const SelectingTestView: React.FC<SelectingTestViewProps> = ({
  onSelectAndConfigure,
  currentSelectedTest,
}) => {
  // Mode toggle: Guided Diagnostic Flow vs. Comprehensive Test Matrix
  const [viewMode, setViewMode] = useState<'guided' | 'matrix'>('guided');

  // Diagnostic Wizard State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [goal, setGoal] = useState<GoalType | null>(null);
  const [dvType, setDvType] = useState<DvType | null>(null);
  const [designType, setDesignType] = useState<DesignType | null>(null);
  const [groupCount, setGroupCount] = useState<GroupCountType | null>(null);
  const [predictorCount, setPredictorCount] = useState<'single' | 'multiple' | null>(null);
  const [parametricPref, setParametricPref] = useState<ParametricChoiceType>('parametric');

  // Matrix search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [activeExpandedTest, setActiveExpandedTest] = useState<StatisticalTestType>(currentSelectedTest);
  const [previewPreset, setPreviewPreset] = useState<TestStudyPreset | null>(null);

  // Compute recommended test based on diagnostic answers
  const computedRecommendedTest: StatisticalTestType | null = useMemo(() => {
    if (!goal) return null;

    if (goal === 'desc') {
      return 'descriptive';
    }

    if (goal === 'cat') {
      return 'chi_square';
    }

    if (goal === 'pred') {
      return 'regression';
    }

    if (goal === 'rel') {
      if (dvType === 'categorical') return 'chi_square';
      return 'correlation';
    }

    if (goal === 'diff') {
      if (dvType === 'categorical') {
        return 'chi_square';
      }

      if (designType === 'within') {
        return 'paired_ttest';
      }

      if (designType === 'between') {
        if (groupCount === '3_plus') {
          return 'anova';
        }
        return 'independent_ttest';
      }
    }

    return null;
  }, [goal, dvType, designType, groupCount]);

  const handleResetWizard = () => {
    setCurrentStep(1);
    setGoal(null);
    setDvType(null);
    setDesignType(null);
    setGroupCount(null);
    setPredictorCount(null);
    setParametricPref('parametric');
  };

  const handleApplyTest = (testId: StatisticalTestType) => {
    onSelectAndConfigure(testId);
  };

  const activeTestDetails = STATISTICAL_TEST_DATABASE[computedRecommendedTest || activeExpandedTest];

  // Filtered matrix list
  const filteredMatrixTests = useMemo(() => {
    const DIFF_SET = new Set([
      'independent_ttest', 'paired_ttest', 'anova', 'repeated_measures_anova', 'two_way_anova',
      'three_way_anova', 'within_within_anova', 'three_way_repeated_anova', 'three_way_mixed_anova', 'mixed_anova',
      'hotellings_t2', 'one_way_manova', 'two_way_manova', 'one_way_mancova', 'ancova', 'two_way_ancova',
      'mann_whitney', 'wilcoxon_signed', 'kruskal_wallis', 'jonckheere_terpstra', 'friedman',
      'mcnemar', 'cochrans_q', 'sign_test', 'two_proportions_test', 'chi_square_homogeneity_2xc', 'chi_square_homogeneity_rx2'
    ]);

    const PRED_SET = new Set([
      'regression', 'multiple_regression', 'hierarchical_regression', 'logistic_regression', 'ordinal_regression'
    ]);

    const ASSOC_SET = new Set([
      'correlation', 'point_biserial', 'partial_correlation', 'spearman_correlation', 'kendalls_tau_b',
      'gamma_test', 'somers_d', 'mantel_haenszel', 'cochran_armitage', 'chi_square_association_2x2',
      'chi_square', 'fishers_exact', 'relative_risk', 'odds_ratio', 'goodman_kruskal_lambda', 'loglinear'
    ]);

    const ONE_SAMPLE_SET = new Set(['one_sample_ttest', 'chi_square_gof']);
    const SURVIVAL_SET = new Set(['kaplan_meier']);
    const RELIABILITY_SET = new Set(['cronbach_alpha', 'cohens_kappa', 'fleiss_kappa', 'weighted_kappa', 'kendalls_w']);
    const DATA_REDUCTION_SET = new Set(['pca']);
    const ASSUMPTIONS_MODERATION_SET = new Set(['normality_test', 'data_transformation', 'moderation_analysis']);

    return Object.values(STATISTICAL_TEST_DATABASE).filter((t) => {
      const matchesSearch =
        t.testTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.designCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.ivDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.dvDescription.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeCategoryFilter === 'all') return true;
      if (activeCategoryFilter === 'diff') return DIFF_SET.has(t.testId);
      if (activeCategoryFilter === 'pred') return PRED_SET.has(t.testId);
      if (activeCategoryFilter === 'assoc') return ASSOC_SET.has(t.testId);
      if (activeCategoryFilter === 'one_sample') return ONE_SAMPLE_SET.has(t.testId);
      if (activeCategoryFilter === 'survival') return SURVIVAL_SET.has(t.testId);
      if (activeCategoryFilter === 'reliability') return RELIABILITY_SET.has(t.testId);
      if (activeCategoryFilter === 'data_reduction') return DATA_REDUCTION_SET.has(t.testId);
      if (activeCategoryFilter === 'assumptions_moderation') return ASSUMPTIONS_MODERATION_SET.has(t.testId);
      if (activeCategoryFilter === 'descriptive') return t.testId === 'descriptive';
      return true;
    });
  }, [searchQuery, activeCategoryFilter]);

  const filteredGraphs = useMemo(() => {
    return GRAPH_CHART_TAXONOMY.filter((g) => {
      const q = searchQuery.toLowerCase();
      return (
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.idealTests.toLowerCase().includes(q) ||
        g.chartGroup.toLowerCase().includes(q) ||
        g.variablesRequired.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Contract & Methodology Philosophy Badge */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Selecting Test
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Determine the mathematically appropriate quantitative test for your study design. Answering 3–4 targeted diagnostic questions systematically evaluates your variable measurement scales, group structure, and statistical assumptions.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-800/90 rounded-xl border border-slate-700 self-start lg:self-center shrink-0">
            <button
              onClick={() => setViewMode('guided')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                viewMode === 'guided'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step-by-Step Diagnostic</span>
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                viewMode === 'matrix'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Comprehensive Test Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: Step-by-Step Guided Diagnostic */}
      {viewMode === 'guided' && (
        <div className="space-y-8">
          {/* Diagnostic Progress Stepper */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1">
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  1
                </span>
                <span className="text-xs font-medium text-slate-700">Research Goal</span>
              </div>
              <div className="h-0.5 w-8 bg-slate-200 shrink-0" />

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  2
                </span>
                <span className="text-xs font-medium text-slate-700">Outcome Scale (DV)</span>
              </div>
              <div className="h-0.5 w-8 bg-slate-200 shrink-0" />

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  3
                </span>
                <span className="text-xs font-medium text-slate-700">Design & Groups (IV)</span>
              </div>
              <div className="h-0.5 w-8 bg-slate-200 shrink-0" />

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    computedRecommendedTest ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {computedRecommendedTest ? <Check className="w-3.5 h-3.5" /> : '4'}
                </span>
                <span className="text-xs font-medium text-slate-700">Recommended Test</span>
              </div>

              <div className="ml-auto shrink-0 pl-4 border-l border-slate-200">
                <button
                  onClick={handleResetWizard}
                  className="px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start Over</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Question Cards */}
          {!computedRecommendedTest ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              {/* STEP 1: Research Goal */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-mono font-semibold text-blue-600 tracking-wider uppercase">
                      Question 1 of 3
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 mt-1">
                      What is the primary objective of your statistical analysis?
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Choose the empirical research inquiry that best describes your study hypothesis.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        setGoal('rel');
                        setCurrentStep(2);
                      }}
                      className="text-left p-5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/20 transition-all group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <BarChart2 className="w-5 h-5" />
                        </div>
                        <div className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                          Assess Relationship / Association Between Variables
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Test whether two variables covary (e.g., is Study Hours correlated with Exam Performance?).
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
                        <span>Select this objective</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setGoal('pred');
                        setCurrentStep(2);
                      }}
                      className="text-left p-5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/20 transition-all group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition-colors">
                          Predict an Outcome Variable from Predictor(s)
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Build a predictive equation or quantify how much variance in an outcome is explained by one or multiple predictors.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-purple-600 flex items-center gap-1">
                        <span>Select this objective</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setGoal('cat');
                        setCurrentStep(2);
                      }}
                      className="text-left p-5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/20 transition-all group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                          <Table2 className="w-5 h-5" />
                        </div>
                        <div className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
                          Analyze Categorical Frequency & Proportions
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Evaluate counts, frequencies, or cross-tabulated contingency between discrete nominal categories.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                        <span>Select this objective</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setGoal('desc');
                        setCurrentStep(2);
                      }}
                      className="text-left p-5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/20 transition-all group flex flex-col justify-between md:col-span-2"
                    >
                      <div className="space-y-2">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <Sliders className="w-5 h-5" />
                        </div>
                        <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">
                          Summarize Data Characteristics, Spread & Normality (Descriptives)
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Calculate Mean, Median, Standard Deviation, Interquartile Range, Skewness, Kurtosis, and Shapiro-Wilk distribution checks.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <span>Select this objective</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Outcome / Dependent Variable Measurement Level */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-semibold text-blue-600 tracking-wider uppercase">
                        Question 2 of 3
                      </span>
                      <h2 className="text-xl font-bold text-slate-900 mt-1">
                        What is the scale of measurement of your Dependent (Outcome) Variable?
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        The measurement scale of your outcome variable dictates whether parametric or non-parametric tests apply.
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Back</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => {
                        setDvType('continuous');
                        if (goal === 'diff') {
                          setCurrentStep(3);
                        } else if (goal === 'pred') {
                          setCurrentStep(3);
                        } else if (goal === 'rel') {
                          // Correlation selected!
                          setCurrentStep(4);
                        } else {
                          setCurrentStep(4);
                        }
                      }}
                      className="text-left p-5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/20 transition-all group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-100 text-blue-800">
                          Continuous
                        </span>
                        <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                          Interval or Ratio Scale
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Numeric values with meaningful equal intervals (e.g., Exam Score 0-100, Reaction Time in ms, Blood Pressure, Monthly Income).
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                        <span>Choose Continuous</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setDvType('ordinal');
                        if (goal === 'diff') {
                          setCurrentStep(3);
                        } else {
                          setCurrentStep(4);
                        }
                      }}
                      className="text-left p-5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/20 transition-all group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-100 text-amber-800">
                          Ordinal
                        </span>
                        <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                          Rank-Ordered Scale
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Values with ordered ranking but non-equal distances (e.g., 5-point Likert survey scales: Strongly Disagree to Strongly Agree).
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                        <span>Choose Ordinal</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setDvType('categorical');
                        // Categorical outcome points to Chi-square
                        setCurrentStep(4);
                      }}
                      className="text-left p-5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/20 transition-all group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-100 text-purple-800">
                          Categorical / Nominal
                        </span>
                        <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                          Discrete Categories / Groups
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Discrete labels without numerical order (e.g., Pass vs. Fail, Disease Positive vs. Negative, Department A vs. B vs. C).
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                        <span>Choose Categorical</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Study Design & Group Structure (Between vs Within) */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-semibold text-blue-600 tracking-wider uppercase">
                        Question 3 of 3
                      </span>
                      <h2 className="text-xl font-bold text-slate-900 mt-1">
                        {goal === 'pred'
                          ? 'How many explanatory predictor variables do you have?'
                          : 'How are your study participants / groups structured?'}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        {goal === 'pred'
                          ? 'Select whether you have a single predictor or multiple simultaneous predictors.'
                          : 'Determines whether your analysis requires a Between-Subjects (unrelated) or Within-Subjects (repeated) model.'}
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Back</span>
                    </button>
                  </div>

                  {goal === 'pred' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          setPredictorCount('single');
                          setCurrentStep(4);
                        }}
                        className="text-left p-5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/20 transition-all group flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-100 text-blue-800">
                            1 Predictor (IV)
                          </span>
                          <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                            Simple Linear Regression
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            One independent variable predicting one continuous outcome (Y = β₀ + β₁X + ε).
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                          <span>Select Single Predictor</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setPredictorCount('multiple');
                          setCurrentStep(4);
                        }}
                        className="text-left p-5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/20 transition-all group flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-100 text-purple-800">
                            2 or More Predictors (IVs)
                          </span>
                          <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                            Multiple Linear Regression
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Multiple independent predictors simultaneously entered into model with standardized beta weights and VIF diagnostics.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                          <span>Select Multiple Predictors</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => {
                          setDesignType('between');
                          setGroupCount('2_groups');
                          setCurrentStep(4);
                        }}
                        className="text-left p-5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/20 transition-all group flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-100 text-blue-800">
                            Between-Subjects
                          </span>
                          <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                            Two Independent Groups (Unrelated)
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Different participants in each group (e.g., Treatment Group vs. Control Group, or Male vs. Female).
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                          <span>Select 2 Independent Groups</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setDesignType('between');
                          setGroupCount('3_plus');
                          setCurrentStep(4);
                        }}
                        className="text-left p-5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/20 transition-all group flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-100 text-indigo-800">
                            Between-Subjects
                          </span>
                          <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                            Three or More Independent Groups
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Different participants in 3+ conditions (e.g., Placebo vs. Low Dose vs. High Dose, or 4 Teaching Method groups).
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                          <span>Select 3+ Independent Groups</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setDesignType('within');
                          setGroupCount('2_groups');
                          setCurrentStep(4);
                        }}
                        className="text-left p-5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/20 transition-all group flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-100 text-purple-800">
                            Within-Subjects / Repeated
                          </span>
                          <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                            Same Participants Tested Twice (Paired)
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Identical participants measured at two different time points or paired conditions (e.g., Pre-test vs. Post-test).
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                          <span>Select Paired / Repeated</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* STEP 4: Recommended Test Result Card */
            <div className="bg-white rounded-2xl border-2 border-blue-600 p-6 sm:p-8 shadow-md space-y-8 animate-in fade-in duration-300">
              {/* Header Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-blue-100 text-blue-800 border border-blue-200">
                      Empirical Diagnostic Result
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Appropriate Test Matched
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {activeTestDetails.testTitle}
                  </h2>
                  <p className="text-xs text-slate-600">
                    Category: <span className="font-semibold text-slate-800">{activeTestDetails.designCategory}</span>
                  </p>
                </div>
              </div>

              {/* Pre-set Study Notification Card for Step 2 */}
              {TEST_STUDY_PRESETS[activeTestDetails.testId] && (
                <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50/70 to-blue-50 border border-blue-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                      <Database className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 font-mono">
                          Pre-Set Study Ready for Step 2
                        </span>
                        <span className="text-2xs font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md border border-blue-200">
                          {TEST_STUDY_PRESETS[activeTestDetails.testId].dataset.totalRows} cases
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {TEST_STUDY_PRESETS[activeTestDetails.testId].datasetName}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                        {TEST_STUDY_PRESETS[activeTestDetails.testId].explanation} Complete empirical study including research questions (H₀, H₁) and pre-configured variables ready to satisfy all Step 2 requirements.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                    <button
                      type="button"
                      onClick={() => setPreviewPreset(TEST_STUDY_PRESETS[activeTestDetails.testId])}
                      className="px-3.5 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 hover:border-blue-400 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      title="Preview sample cases, research questions, and variables"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>Preview Pre-Set Study</span>
                    </button>
                    <button
                      onClick={() => handleApplyTest(activeTestDetails.testId)}
                      className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                      title="Fill complete pre-set study including research questions and link to Step 2"
                    >
                      <Database className="w-3.5 h-3.5 text-blue-200" />
                      <span>Link into 'Dataset'</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Rationale & Hypotheses Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Study Design Blueprint */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>Study Design & Protocol Blueprint</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">Dependent Variable (Outcome):</div>
                      <div className="text-slate-600 mt-0.5 bg-white p-2.5 rounded-lg border border-slate-200">
                        {activeTestDetails.dvDescription}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Independent Variable (Factor / Predictor):</div>
                      <div className="text-slate-600 mt-0.5 bg-white p-2.5 rounded-lg border border-slate-200">
                        {activeTestDetails.ivDescription}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                    <span>Parametric Status:</span>
                    <span className="font-semibold text-slate-900">
                      {activeTestDetails.isParametric ? 'Parametric Model' : 'Non-Parametric Model'}
                    </span>
                  </div>
                  {activeTestDetails.nonParametricAlternative && (
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Non-Parametric Alternative:</span>
                      <span className="font-mono text-purple-700 font-semibold">
                        {activeTestDetails.nonParametricAlternative}
                      </span>
                    </div>
                  )}
                </div>

                {/* Right: Academic Hypotheses Formulated */}
                <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-200 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Empirical Hypotheses Formulation</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
                      <div className="font-bold text-slate-900 font-mono text-[11px] text-blue-700">
                        NULL HYPOTHESIS (H₀)
                      </div>
                      <p className="text-slate-700 mt-1 leading-relaxed">
                        {activeTestDetails.nullHypothesis}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
                      <div className="font-bold text-slate-900 font-mono text-[11px] text-indigo-700">
                        ALTERNATIVE HYPOTHESIS (H₁)
                      </div>
                      <p className="text-slate-700 mt-1 leading-relaxed">
                        {activeTestDetails.altHypothesis}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-blue-200 text-xs text-blue-800">
                    <span className="font-semibold">Effect Size Metric: </span>
                    <span className="font-mono">{activeTestDetails.effectSizeMetric}</span>
                  </div>
                </div>
              </div>

              {/* The Statistical Assumptions Checklist */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Statistical Assumptions & Verification Checklist
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">
                    {activeTestDetails.assumptions.length} Assumptions Audited by StatAssist AI
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeTestDetails.assumptions.map((assump) => (
                    <div
                      key={assump.number}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          Assumption #{assump.number}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {assump.howToCheck}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {assump.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {assump.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* APA 7th Edition Reporting Syntax & Master Example */}
              <div className="bg-slate-900 text-white rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 uppercase tracking-wider">
                    APA 7th Edition Reporting Template
                  </span>
                  <span className="font-mono text-emerald-400 text-[11px]">
                    Publication Formula
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-blue-300 border border-slate-800">
                  {activeTestDetails.apaSyntax}
                </div>

                <div className="text-xs text-slate-300">
                  <span className="text-slate-400 font-semibold">Example Manuscript Text: </span>
                  <span className="italic">"{activeTestDetails.apaExampleSentence}"</span>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
                <button
                  onClick={handleResetWizard}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Choose Another Design</span>
                </button>

                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                  {TEST_STUDY_PRESETS[activeTestDetails.testId] && (
                    <button
                      type="button"
                      onClick={() => setPreviewPreset(TEST_STUDY_PRESETS[activeTestDetails.testId])}
                      className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      title="Preview sample cases, research questions, and variables"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>Preview Pre-Set Study</span>
                    </button>
                  )}
                  <button
                    onClick={() => setViewMode('matrix')}
                    className="px-4 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>View in Test Matrix</span>
                  </button>
                  <button
                    onClick={() => handleApplyTest(activeTestDetails.testId)}
                    className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    title="Fill complete pre-set study including research questions and link to Step 2"
                  >
                    <Database className="w-3.5 h-3.5 text-blue-200" />
                    <span>Link into 'Dataset'</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: Comprehensive Test Matrix (Browse All Tests) */}
      {viewMode === 'matrix' && (
        <div className="space-y-6">
          {/* Search & Category Filter Controls */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by test name, variable type, or research design..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                />
              </div>

              {/* Filter Pills matching exact taxonomy from user guide */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setActiveCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeCategoryFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Analyses (61)
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('diff')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeCategoryFilter === 'diff'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Differences between groups (27)
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('pred')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeCategoryFilter === 'pred'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Predicting scores (5)
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('assoc')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeCategoryFilter === 'assoc'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Associations (16)
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('one_sample')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeCategoryFilter === 'one_sample'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  One sample (2)
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('survival')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeCategoryFilter === 'survival'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Survival analysis (1)
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('reliability')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeCategoryFilter === 'reliability'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Reliability (5)
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('data_reduction')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeCategoryFilter === 'data_reduction'
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Data reduction (1)
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('assumptions_moderation')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeCategoryFilter === 'assumptions_moderation'
                      ? 'bg-cyan-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Assumptions & Moderation (3)
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('graphs')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeCategoryFilter === 'graphs'
                      ? 'bg-fuchsia-600 text-white shadow-xs'
                      : 'bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200 hover:bg-fuchsia-100'
                  }`}
                >
                  Graphs and charts (21)
                </button>
              </div>
            </div>
          </div>

          {/* Grid of Procedure Cards or Graph Cards */}
          {activeCategoryFilter === 'graphs' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGraphs.map((graph) => {
                const isSelected = graph.associatedTestId === currentSelectedTest;
                return (
                  <div
                    key={graph.id}
                    className={`bg-white rounded-xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-fuchsia-600 ring-2 ring-fuchsia-600/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200">
                          {graph.chartGroup}
                        </span>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Active In Workspace
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <BarChart2 className="w-4 h-4 text-fuchsia-600" />
                          <span>{graph.name}</span>
                        </h3>
                        <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          {graph.description}
                        </div>
                      </div>

                      <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
                        <div>
                          <span className="font-semibold text-slate-700">Ideal Test(s): </span>
                          <span className="text-slate-600">{graph.idealTests}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Data Format: </span>
                          <span className="text-slate-600">{graph.variablesRequired}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-700">
                        <span className="font-semibold text-slate-900">APA 7th Standard: </span>
                        {graph.apaStandard}
                      </div>

                      {/* Associated study preset preview */}
                      {TEST_STUDY_PRESETS[graph.associatedTestId] && (
                        <div className="bg-fuchsia-50/60 border border-fuchsia-100 rounded-lg p-2.5 space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-fuchsia-950">
                            <Database className="w-3.5 h-3.5 text-fuchsia-700 shrink-0" />
                            <span className="truncate">
                              Pre-Set Dataset: {TEST_STUDY_PRESETS[graph.associatedTestId].datasetName}
                            </span>
                          </div>
                          <div className="text-[10px] text-fuchsia-800">
                            N = {TEST_STUDY_PRESETS[graph.associatedTestId].dataset.totalRows} observations · {TEST_STUDY_PRESETS[graph.associatedTestId].dataset.columns.length} variables
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col gap-2">
                      <button
                        onClick={() => handleApplyTest(graph.associatedTestId)}
                        className="w-full px-4 py-2.5 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Database className="w-3.5 h-3.5" />
                        <span>Select Test & Load Dataset</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMatrixTests.map((test) => {
              const isSelected = test.testId === currentSelectedTest;
              return (
                <div
                  key={test.testId}
                  className={`bg-white rounded-xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-600/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200">
                        {test.isParametric ? 'Parametric' : 'Non-Parametric'}
                      </span>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Active In App
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {test.testTitle}
                      </h3>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {test.designCategory}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
                      <div>
                        <span className="font-semibold text-slate-700">Outcome (DV): </span>
                        <span className="text-slate-600">{test.dvDescription}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Factor (IV): </span>
                        <span className="text-slate-600">{test.ivDescription}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] font-mono text-slate-700">
                      {test.apaSyntax}
                    </div>

                    {/* Pre-set study mapping */}
                    {TEST_STUDY_PRESETS[test.testId] && (
                      <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-2.5 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-900">
                          <Database className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">
                            Pre-Set: {TEST_STUDY_PRESETS[test.testId].datasetName}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-600 line-clamp-2 leading-tight">
                          {TEST_STUDY_PRESETS[test.testId].explanation}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => handleApplyTest(test.testId)}
                      className="w-full px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>Select Test & Load Dataset</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => {
                          setActiveExpandedTest(test.testId);
                          setViewMode('guided');
                          // Jump straight to recommendation
                          if (test.testId === 'independent_ttest') {
                            setGoal('diff');
                            setDesignType('between');
                            setGroupCount('2_groups');
                            setDvType('continuous');
                          } else if (test.testId === 'anova') {
                            setGoal('diff');
                            setDesignType('between');
                            setGroupCount('3_plus');
                            setDvType('continuous');
                          } else if (test.testId === 'paired_ttest') {
                            setGoal('diff');
                            setDesignType('within');
                            setDvType('continuous');
                          } else if (test.testId === 'regression') {
                            setGoal('pred');
                            setDvType('continuous');
                          } else if (test.testId === 'correlation') {
                            setGoal('rel');
                            setDvType('continuous');
                          } else if (test.testId === 'chi_square') {
                            setGoal('cat');
                          } else {
                            setGoal('desc');
                          }
                        }}
                        className="text-2xs font-semibold text-slate-500 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Info className="w-3 h-3" />
                        <span>View Assumptions & Hypotheses</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* Pre-Set Study Preview Modal */}
      {previewPreset && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
          onClick={() => setPreviewPreset(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-start justify-between gap-4 border-b border-slate-800 shrink-0">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Pre-Set Empirical Study
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-2xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {previewPreset.dataset.totalRows} Cases (N)
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-2xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    {previewPreset.dataset.columns.length} Variables
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-2xs font-semibold bg-slate-700 text-slate-300 border border-slate-600 font-mono">
                    α = {previewPreset.alphaLevel ?? 0.05}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {previewPreset.datasetName}
                </h2>
                <p className="text-xs text-blue-200/80 leading-relaxed max-w-2xl">
                  {previewPreset.explanation}
                </p>
              </div>
              <button
                onClick={() => setPreviewPreset(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                aria-label="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-800 text-xs">
              {/* Research Questions & Hypotheses Card */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        Pre-Defined Research Question & Hypotheses
                      </h3>
                      <p className="text-2xs text-slate-500">
                        {previewPreset.researchQuestion.title}
                      </p>
                    </div>
                  </div>
                  <span className="text-2xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Complete for Step 2 & 3
                  </span>
                </div>

                {/* Research Question */}
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-1">
                  <div className="text-2xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Inquiry / Research Question:
                  </div>
                  <p className="text-sm font-semibold text-slate-800 leading-snug">
                    "{previewPreset.researchQuestion.question}"
                  </p>
                </div>

                {/* Hypotheses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-2xs uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Null Hypothesis (H₀)
                    </div>
                    <p className="text-xs text-emerald-950 font-medium leading-relaxed font-mono">
                      {previewPreset.researchQuestion.hypothesisNull || 'H₀: No significant effect / association.'}
                    </p>
                  </div>

                  <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-blue-800 font-bold text-2xs uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Alternative Hypothesis (H₁)
                    </div>
                    <p className="text-xs text-blue-950 font-medium leading-relaxed font-mono">
                      {previewPreset.researchQuestion.hypothesisAlt || 'H₁: Statistically significant effect / association.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Variables & Test Specifications Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Target Variables */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-600" />
                    Pre-Configured Variables
                  </h4>
                  <div className="space-y-2">
                    {previewPreset.recommendedDv && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Dependent Var (Outcome):</span>
                        <span className="font-bold text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {previewPreset.recommendedDv}
                        </span>
                      </div>
                    )}
                    {previewPreset.recommendedIv && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Independent Var (Factor):</span>
                        <span className="font-bold text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {previewPreset.recommendedIv}
                        </span>
                      </div>
                    )}
                    {previewPreset.recommendedGroup1 && previewPreset.recommendedGroup2 && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-2xs">
                        <span className="text-slate-600 font-medium">Comparison Levels:</span>
                        <span className="font-semibold text-slate-700">
                          {previewPreset.recommendedGroup1} vs. {previewPreset.recommendedGroup2}
                        </span>
                      </div>
                    )}
                    {previewPreset.recommendedSecondVar && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Paired / Second Var:</span>
                        <span className="font-bold text-slate-700 font-mono bg-slate-100 px-2 py-0.5 rounded">
                          {previewPreset.recommendedSecondVar}
                        </span>
                      </div>
                    )}
                    {previewPreset.recommendedMultiVars && previewPreset.recommendedMultiVars.length > 0 && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                        <span className="text-slate-600 font-medium block">Multi-Variables / Indicators:</span>
                        <div className="flex flex-wrap gap-1">
                          {previewPreset.recommendedMultiVars.map((v) => (
                            <span key={v} className="font-mono text-2xs bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-slate-700">
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {previewPreset.recommendedFactorB && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Factor B:</span>
                        <span className="font-bold text-purple-700 font-mono bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {previewPreset.recommendedFactorB}
                        </span>
                      </div>
                    )}
                    {previewPreset.recommendedCovariate && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Covariate:</span>
                        <span className="font-bold text-amber-700 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {previewPreset.recommendedCovariate}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Test Protocol & Chart */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
                    Analysis Protocol & Recommended Visualization
                  </h4>
                  <div className="space-y-2">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Assigned Test:</span>
                      <span className="font-bold text-slate-900">{previewPreset.testTitle}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Design Category:</span>
                      <span className="font-semibold text-slate-800">{previewPreset.category}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Chart Type:</span>
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {previewPreset.recommendedChartType}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Distribution Assumption:</span>
                      <span className="font-semibold text-slate-700">
                        {previewPreset.isParametric ? 'Parametric (Continuous)' : 'Non-Parametric / Categorical'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Dataset Table Preview */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Table2 className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                      Sample Observations (First 8 of {previewPreset.dataset.totalRows} cases)
                    </h4>
                  </div>
                  <span className="text-2xs text-slate-500 font-medium">
                    100% complete data • No missing values
                  </span>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-x-auto bg-white shadow-2xs max-h-60">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold text-2xs uppercase tracking-wider">
                        <th className="py-2 px-3 w-12 text-slate-400">#</th>
                        {previewPreset.dataset.columns.map((col) => (
                          <th key={col.name} className="py-2 px-3 border-l border-slate-200">
                            <div>{col.name}</div>
                            <div className="text-[10px] font-normal text-slate-400 font-mono lowercase">
                              {col.type}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-2xs">
                      {previewPreset.dataset.data.slice(0, 8).map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-1.5 px-3 text-slate-400 font-sans">{rIdx + 1}</td>
                          {previewPreset.dataset.columns.map((col) => (
                            <td key={col.name} className="py-1.5 px-3 border-l border-slate-100 text-slate-800">
                              {String(row[col.name] ?? '-')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Fills complete dataset with research questions ({previewPreset.researchQuestion.title}) ready for Step 2.
                </span>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setPreviewPreset(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleApplyTest(previewPreset.testKey);
                    setPreviewPreset(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Database className="w-4 h-4 text-blue-200" />
                  <span>Fill & Load Complete Pre-Set Study</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
