import { StatisticalTestType, ResearchQuestion, StatisticalResult } from '../types/stats';

interface HypothesisDraftParams {
  testType: StatisticalTestType;
  dependentVar?: string;
  independentVar?: string;
  group1?: string;
  group2?: string;
  secondVar?: string;
  multiVars?: string[];
  testValue?: number;
}

/**
 * Automatically crafts a well-formed academic research question and corresponding
 * null (H0) and alternative (H1) hypotheses adhering to APA 7th standards.
 */
export function autoDraftResearchQuestion(params: HypothesisDraftParams): Omit<ResearchQuestion, 'id'> {
  const { testType, dependentVar, independentVar, group1, group2, secondVar, multiVars, testValue = 0 } = params;

  switch (testType) {
    case 'one_sample_ttest': {
      const dv = dependentVar || 'Outcome_Metric';
      return {
        title: `RQ: Difference of ${dv} from Criterion Benchmark μ₀ = ${testValue}`,
        question: `Does the population mean of ${dv} differ significantly from the known standard benchmark of ${testValue}?`,
        hypothesisNull: `H₀: The mean of ${dv} equals the criterion benchmark (μ = ${testValue}).`,
        hypothesisAlt: `H₁: The mean of ${dv} differs significantly from the criterion benchmark (μ ≠ ${testValue}).`,
        testType: 'one_sample_ttest',
        dependentVar: dv,
      };
    }

    case 'independent_ttest': {
      const dv = dependentVar || 'Outcome';
      const iv = independentVar || 'Cohort';
      const g1 = group1 || 'Group 1';
      const g2 = group2 || 'Group 2';

      return {
        title: `RQ: Difference in ${dv} by ${iv}`,
        question: `Does mean ${dv} differ significantly between ${g1} and ${g2} in the ${iv} factor?`,
        hypothesisNull: `H₀: There is no significant difference in mean ${dv} between ${g1} and ${g2} (μ₁ = μ₂).`,
        hypothesisAlt: `H₁: There is a statistically significant difference in mean ${dv} between ${g1} and ${g2} (μ₁ ≠ μ₂).`,
        testType: 'independent_ttest',
        dependentVar: dv,
        independentVar: iv,
      };
    }

    case 'paired_ttest': {
      const v1 = dependentVar || 'Timepoint 1';
      const v2 = secondVar || 'Timepoint 2';

      return {
        title: `RQ: Repeated Measures Change between ${v1} and ${v2}`,
        question: `Is there a statistically significant change in paired measurements from ${v1} to ${v2}?`,
        hypothesisNull: `H₀: The mean paired difference between ${v1} and ${v2} is zero (μ_D = 0).`,
        hypothesisAlt: `H₁: The mean paired difference between ${v1} and ${v2} differs significantly from zero (μ_D ≠ 0).`,
        testType: 'paired_ttest',
        dependentVar: v1,
        secondVar: v2,
      };
    }

    case 'anova': {
      const dv = dependentVar || 'Outcome';
      const iv = independentVar || 'Factor';

      return {
        title: `RQ: Between-Groups Variance in ${dv} across ${iv}`,
        question: `Are there statistically significant differences in mean ${dv} across the cohorts of ${iv}?`,
        hypothesisNull: `H₀: Population mean ${dv} is equivalent across all cohorts of ${iv} (μ₁ = μ₂ = ... = μ_k).`,
        hypothesisAlt: `H₁: At least one cohort differs significantly in mean ${dv} from the other groups.`,
        testType: 'anova',
        dependentVar: dv,
        independentVar: iv,
      };
    }

    case 'two_way_anova': {
      const dv = dependentVar || 'Outcome';
      const fA = independentVar || 'Factor_A';
      const fB = secondVar || 'Factor_B';

      return {
        title: `RQ: Factorial Main Effects and Interaction: ${fA} × ${fB} on ${dv}`,
        question: `Do ${fA} and ${fB} independently and interactively influence mean differences in ${dv}?`,
        hypothesisNull: `H₀: There are no significant main effects of ${fA} or ${fB}, and no interaction effect on ${dv}.`,
        hypothesisAlt: `H₁: There are significant main effects and/or an interaction effect between ${fA} and ${fB} on ${dv}.`,
        testType: 'two_way_anova',
        dependentVar: dv,
        independentVar: fA,
        secondVar: fB,
      };
    }

    case 'repeated_measures_anova': {
      const vars = multiVars && multiVars.length > 0 ? multiVars.join(', ') : 'Timepoints';
      return {
        title: `RQ: Within-Subjects Longitudinal Trajectory across [${vars}]`,
        question: `Does the within-subject outcome change significantly across the repeated measures of [${vars}]?`,
        hypothesisNull: `H₀: Mean scores are equivalent across all repeated conditions (μ₁ = μ₂ = ... = μ_k).`,
        hypothesisAlt: `H₁: Scores change significantly across the repeated conditions over time.`,
        testType: 'repeated_measures_anova',
        multiVars: multiVars || [],
      };
    }

    case 'ancova': {
      const dv = dependentVar || 'Outcome';
      const grp = independentVar || 'Group';
      const cov = secondVar || 'Covariate';
      return {
        title: `RQ: Difference in ${dv} across ${grp} Controlling for ${cov}`,
        question: `Are there significant differences in ${dv} across ${grp} after adjusting for variation in ${cov}?`,
        hypothesisNull: `H₀: Adjusted population means in ${dv} do not differ among groups after controlling for ${cov}.`,
        hypothesisAlt: `H₁: Adjusted population means in ${dv} differ significantly among groups after controlling for ${cov}.`,
        testType: 'ancova',
        dependentVar: dv,
        independentVar: grp,
        secondVar: cov,
      };
    }

    case 'mann_whitney': {
      const dv = dependentVar || 'Outcome';
      const iv = independentVar || 'Group';
      return {
        title: `RQ: Non-Parametric Median Difference in ${dv} by ${iv}`,
        question: `Does the distribution of ${dv} differ significantly between the two groups of ${iv}?`,
        hypothesisNull: `H₀: The distributions and medians of ${dv} are identical across the two groups.`,
        hypothesisAlt: `H₁: The distribution of ${dv} differs significantly between the two groups (stochastic dominance).`,
        testType: 'mann_whitney',
        dependentVar: dv,
        independentVar: iv,
      };
    }

    case 'wilcoxon_signed': {
      const v1 = dependentVar || 'Condition 1';
      const v2 = secondVar || 'Condition 2';
      return {
        title: `RQ: Non-Parametric Ranked Difference between ${v1} and ${v2}`,
        question: `Do median scores differ significantly between paired measurements of ${v1} and ${v2}?`,
        hypothesisNull: `H₀: The median pairwise difference between ${v1} and ${v2} is zero.`,
        hypothesisAlt: `H₁: The median pairwise difference between ${v1} and ${v2} differs significantly from zero.`,
        testType: 'wilcoxon_signed',
        dependentVar: v1,
        secondVar: v2,
      };
    }

    case 'kruskal_wallis': {
      const dv = dependentVar || 'Outcome';
      const iv = independentVar || 'Group';
      return {
        title: `RQ: Non-Parametric Group Differences in ${dv} across ${iv}`,
        question: `Do mean ranks of ${dv} differ significantly among the cohorts of ${iv}?`,
        hypothesisNull: `H₀: The distributions of ${dv} are identical across all groups of ${iv}.`,
        hypothesisAlt: `H₁: At least one group exhibits a distribution of ${dv} that dominates the others.`,
        testType: 'kruskal_wallis',
        dependentVar: dv,
        independentVar: iv,
      };
    }

    case 'friedman': {
      const vars = multiVars && multiVars.length > 0 ? multiVars.join(', ') : 'Repeated Conditions';
      return {
        title: `RQ: Non-Parametric Repeated Ranks across [${vars}]`,
        question: `Do rankings of scores differ significantly across repeated measurements of [${vars}]?`,
        hypothesisNull: `H₀: All condition ranks are equally likely for each subject across the conditions.`,
        hypothesisAlt: `H₁: Ranked outcomes systematically differ across the repeated conditions.`,
        testType: 'friedman',
        multiVars: multiVars || [],
      };
    }

    case 'regression': {
      const dv = dependentVar || 'Criterion';
      const ivs = multiVars && multiVars.length > 0 ? multiVars.join(', ') : 'Predictors';

      return {
        title: `RQ: Linear Prediction of ${dv} by [${ivs}]`,
        question: `To what extent do [${ivs}] collectively predict empirical variation in ${dv}?`,
        hypothesisNull: `H₀: The predictor variables collectively explain zero variance in ${dv} (R² = 0).`,
        hypothesisAlt: `H₁: The predictor variables collectively explain a statistically significant proportion of variance in ${dv} (R² > 0).`,
        testType: 'regression',
        dependentVar: dv,
        multiVars: multiVars || [],
      };
    }

    case 'logistic_regression': {
      const dv = dependentVar || 'Binary_Outcome';
      const ivs = multiVars && multiVars.length > 0 ? multiVars.join(', ') : 'Predictors';

      return {
        title: `RQ: Logistic Odds of ${dv} Predicted by [${ivs}]`,
        question: `Do [${ivs}] significantly predict the log-odds and probability of ${dv}?`,
        hypothesisNull: `H₀: The predictor coefficients are all zero in the logistic model (all β = 0, OR = 1.0).`,
        hypothesisAlt: `H₁: At least one predictor significantly alters the odds of ${dv} (β ≠ 0, OR ≠ 1.0).`,
        testType: 'logistic_regression',
        dependentVar: dv,
        multiVars: multiVars || [],
      };
    }

    case 'correlation': {
      const vars = multiVars && multiVars.length > 0 ? multiVars.join(' and ') : 'Variables';

      return {
        title: `RQ: Bivariate Association among ${vars}`,
        question: `Is there a statistically significant correlation among ${vars}?`,
        hypothesisNull: `H₀: The population correlation coefficient equals zero (ρ = 0).`,
        hypothesisAlt: `H₁: There is a statistically significant non-zero linear correlation (ρ ≠ 0).`,
        testType: 'correlation',
        multiVars: multiVars || [],
      };
    }

    case 'cronbach_alpha': {
      const items = multiVars && multiVars.length > 0 ? multiVars.join(', ') : 'Scale Items';
      return {
        title: `RQ: Psychometric Internal Consistency of [${items}]`,
        question: `Do the survey items [${items}] form a reliable, unidimensional measurement instrument?`,
        hypothesisNull: `H₀: The scale items do not exhibit sufficient internal consistency (α < .70).`,
        hypothesisAlt: `H₁: The scale items exhibit acceptable psychometric reliability (α ≥ .70).`,
        testType: 'cronbach_alpha',
        multiVars: multiVars || [],
      };
    }

    case 'chi_square': {
      const rVar = independentVar || 'Row Variable';
      const cVar = secondVar || 'Column Variable';

      return {
        title: `RQ: Cross-Tabular Association: ${rVar} × ${cVar}`,
        question: `Is there a statistically significant association between ${rVar} and ${cVar}?`,
        hypothesisNull: `H₀: ${rVar} and ${cVar} are mutually independent in the population.`,
        hypothesisAlt: `H₁: There is a statistically significant association between ${rVar} and ${cVar}.`,
        testType: 'chi_square',
        independentVar: rVar,
        secondVar: cVar,
      };
    }

    case 'chi_square_gof': {
      const v = independentVar || dependentVar || 'Category_Variable';
      return {
        title: `RQ: Goodness-of-Fit Distribution for ${v}`,
        question: `Do observed category frequencies in ${v} conform to an equal theoretical distribution?`,
        hypothesisNull: `H₀: Observed frequencies in ${v} follow an equal theoretical distribution across all categories.`,
        hypothesisAlt: `H₁: Observed category frequencies in ${v} deviate significantly from an equal distribution.`,
        testType: 'chi_square_gof',
        independentVar: v,
      };
    }

    case 'exploratory_factor_analysis': {
      const items = multiVars && multiVars.length > 0 ? multiVars.join(', ') : 'Observed Items';
      return {
        title: `RQ: Latent Dimensionality of [${items}]`,
        question: `What is the underlying latent factor structure that accounts for the inter-correlations among [${items}]?`,
        hypothesisNull: `H₀: The observed items do not share common latent dimensions (correlation matrix is an identity matrix).`,
        hypothesisAlt: `H₁: The observed items reduce into reproducible, correlated or uncorrelated latent factors.`,
        testType: 'exploratory_factor_analysis',
        multiVars: multiVars || [],
      };
    }

    case 'confirmatory_factor_analysis': {
      const items = multiVars && multiVars.length > 0 ? multiVars.join(', ') : 'Indicators';
      return {
        title: `RQ: Confirmatory Factor Model Fit and Convergent Validity`,
        question: `Does the hypothesized multi-factor measurement model adequately fit the empirical sample covariance structure?`,
        hypothesisNull: `H₀: The hypothesized factor structure does not reproduce the observed covariance matrix (poor model fit).`,
        hypothesisAlt: `H₁: The hypothesized factor structure demonstrates acceptable goodness of fit and convergent validity.`,
        testType: 'confirmatory_factor_analysis',
        multiVars: multiVars || [],
      };
    }

    case 'structural_equation_modeling': {
      const endo = dependentVar || 'Endogenous Construct';
      const exo = independentVar || 'Exogenous Construct';
      return {
        title: `RQ: Structural Equation Paths and Mediation on ${endo}`,
        question: `Do the hypothesized direct and indirect structural paths significantly explain variance in ${endo}?`,
        hypothesisNull: `H₀: Hypothesized structural regression path coefficients and indirect mediation effects equal zero (all β = 0).`,
        hypothesisAlt: `H₁: Hypothesized structural paths and mediation effects are statistically significant (β ≠ 0) with acceptable global fit.`,
        testType: 'structural_equation_modeling',
        dependentVar: endo,
        independentVar: exo,
        multiVars: multiVars || [],
      };
    }

    case 'descriptive':
    default: {
      const vars = multiVars && multiVars.length > 0 ? multiVars.join(', ') : 'Study Variables';

      return {
        title: `RQ: Empirical Distribution Profiles for ${vars}`,
        question: `What are the distributional parameters (M, SD, Skewness, Kurtosis) of ${vars}?`,
        hypothesisNull: `H₀: The metric distributions conform to expected baseline parametric bounds.`,
        hypothesisAlt: `H₁: The metric distributions exhibit significant empirical dispersion across participants.`,
        testType: 'descriptive',
        multiVars: multiVars || [],
      };
    }
  }
}

/**
 * Extracts the primary omnibus or focal p-value from any of the 18 statistical results
 */
export function extractPValue(result: StatisticalResult): number | null {
  switch (result.type) {
    case 'one_sample_ttest':
      return result.p;
    case 'independent_ttest':
      return result.levene.equalVarianceAssumed ? result.studentsT.p : result.welchsT.p;
    case 'paired_ttest':
      return result.p;
    case 'anova':
      return result.p;
    case 'two_way_anova':
      // Interaction p-value if available, otherwise first main effect
      return result.effects[2] ? result.effects[2].p : result.effects[0]?.p ?? null;
    case 'repeated_measures_anova':
      return result.p;
    case 'ancova':
      // Adjusted group p-value
      return result.effects[1] ? result.effects[1].p : null;
    case 'mann_whitney':
      return result.p;
    case 'wilcoxon_signed':
      return result.p;
    case 'kruskal_wallis':
      return result.p;
    case 'friedman':
      return result.p;
    case 'regression':
      return result.p;
    case 'logistic_regression':
      return result.p;
    case 'correlation':
      return result.matrix.length > 0 ? result.matrix[0].p : null;
    case 'cronbach_alpha':
      // For Cronbach alpha, test whether alpha >= 0.70 threshold
      return result.rawAlpha >= 0.7 ? 0.001 : 0.25;
    case 'chi_square':
      return result.p;
    case 'chi_square_gof':
      return result.p;
    case 'exploratory_factor_analysis':
      return result.bartlett.p;
    case 'confirmatory_factor_analysis':
      return result.fitIndices.p;
    case 'structural_equation_modeling':
      return result.structuralPaths.length > 0 ? result.structuralPaths[0].pValue : result.fitIndices.p;
    case 'descriptive':
      return null;
    default:
      return (result as any)?.pValue ?? (result as any)?.p ?? null;
  }
}

/**
 * Evaluates empirical statistical decision against a Research Question and hypothesis.
 */
export function evaluateHypothesisDecision(
  pValue: number,
  alphaLevel: number = 0.05
): {
  isSignificant: boolean;
  verdictLabel: string;
  verdictDescription: string;
  academicStatement: string;
} {
  const isSignificant = pValue < alphaLevel;

  if (isSignificant) {
    return {
      isSignificant: true,
      verdictLabel: 'Hypothesis Supported (Null Rejected)',
      verdictDescription: `At α = ${alphaLevel}, the test statistic is statistically significant (p = ${
        pValue < 0.001 ? '< .001' : pValue.toFixed(3).replace(/^0/, '')
      }), rejecting H₀.`,
      academicStatement: `The quantitative findings provide empirical support for the alternative hypothesis (H₁) at the p < ${alphaLevel} threshold.`,
    };
  } else {
    return {
      isSignificant: false,
      verdictLabel: 'Failed to Reject Null Hypothesis (H₀ Retained)',
      verdictDescription: `At α = ${alphaLevel}, the empirical evidence is not statistically significant (p = ${pValue.toFixed(3).replace(/^0/, '')}), failing to reject H₀.`,
      academicStatement: `The observed difference or effect did not reach statistical significance at the p < ${alphaLevel} threshold. Insufficient evidence to reject H₀.`,
    };
  }
}
