export type VariableType = 'continuous' | 'categorical' | 'id';

export interface ColumnMetadata {
  name: string;
  type: VariableType;
  distinctCount: number;
  missingCount: number;
  sampleValues: (string | number)[];
}

export interface ResearchQuestion {
  id: string;
  title: string;
  question: string;
  hypothesisNull?: string;
  hypothesisAlt?: string;
  testType?: StatisticalTestType;
  dependentVar?: string;
  independentVar?: string;
  secondVar?: string;
  multiVars?: string[];
  notes?: string;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  domain: string;
  columns: ColumnMetadata[];
  data: Record<string, any>[];
  totalRows: number;
  researchQuestions?: ResearchQuestion[];
}

/**
 * APA 7th Quantitative Statistical Test Types - Comprehensive Empirical Taxonomy
 */
export type StatisticalTestType =
  // 1. Differences Between Groups (Parametric & Non-Parametric)
  | 'independent_ttest'
  | 'paired_ttest'
  | 'anova'
  | 'repeated_measures_anova'
  | 'two_way_anova'
  | 'three_way_anova'
  | 'within_within_anova'
  | 'three_way_repeated_anova'
  | 'three_way_mixed_anova'
  | 'mixed_anova'
  | 'hotellings_t2'
  | 'one_way_manova'
  | 'two_way_manova'
  | 'one_way_mancova'
  | 'ancova'
  | 'two_way_ancova'
  | 'mann_whitney'
  | 'wilcoxon_signed'
  | 'kruskal_wallis'
  | 'jonckheere_terpstra'
  | 'friedman'
  | 'mcnemar'
  | 'cochrans_q'
  | 'sign_test'
  | 'two_proportions_test'
  | 'chi_square_homogeneity_2xc'
  | 'chi_square_homogeneity_rx2'

  // 2. One Sample
  | 'one_sample_ttest'
  | 'chi_square_gof'

  // 3. Survival Analysis
  | 'kaplan_meier'

  // 4. Reliability
  | 'cronbach_alpha'
  | 'cohens_kappa'
  | 'fleiss_kappa'
  | 'weighted_kappa'
  | 'kendalls_w'

  // 5. Predicting Scores
  | 'regression'
  | 'multiple_regression'
  | 'hierarchical_regression'
  | 'logistic_regression'
  | 'ordinal_regression'

  // 6. Associations & Contingency Tables
  | 'correlation'
  | 'point_biserial'
  | 'partial_correlation'
  | 'spearman_correlation'
  | 'kendalls_tau_b'
  | 'gamma_test'
  | 'somers_d'
  | 'mantel_haenszel'
  | 'cochran_armitage'
  | 'chi_square_association_2x2'
  | 'chi_square'
  | 'fishers_exact'
  | 'relative_risk'
  | 'odds_ratio'
  | 'goodman_kruskal_lambda'
  | 'loglinear'

  // 7. Data Reduction
  | 'pca'

  // 8. Assumptions
  | 'normality_test'
  | 'data_transformation'

  // 9. Moderation
  | 'moderation_analysis'

  // 10. Descriptive Screening & Distributional Metrics
  | 'descriptive'

  // 11. Advanced Statistical Modeling (Factor Analysis & SEM)
  | 'exploratory_factor_analysis'
  | 'confirmatory_factor_analysis'
  | 'structural_equation_modeling';

export type ApaCategoryKey =
  | 'differences_between_groups'
  | 'predicting_scores'
  | 'associations'
  | 'one_sample'
  | 'survival_analysis'
  | 'reliability'
  | 'data_reduction'
  | 'assumptions'
  | 'moderation'
  | 'graphs_and_charts'
  | 'parametric_comparison'
  | 'nonparametric_comparison'
  | 'regression_prediction'
  | 'association_measurement'
  | 'categorical_frequencies'
  | 'descriptive_screening'
  | 'advanced_modeling';

export interface DescriptiveStatsItem {
  variable: string;
  n: number;
  mean: number;
  sd: number;
  se: number;
  median: number;
  iqr: number;
  min: number;
  max: number;
  skewness: number;
  kurtosis: number;
  ci95Low: number;
  ci95High: number;
}

export interface DescriptiveStatsResult {
  type: 'descriptive';
  items: DescriptiveStatsItem[];
}

export interface OneSampleTTestResult {
  type: 'one_sample_ttest';
  variable: string;
  testValue: number;
  n: number;
  mean: number;
  sd: number;
  se: number;
  meanDiff: number;
  t: number;
  df: number;
  p: number;
  ci95Low: number;
  ci95High: number;
  cohensD: number;
}

export interface IndependentTTestResult {
  type: 'independent_ttest';
  dependentVar: string;
  groupVar: string;
  group1: { name: string; n: number; mean: number; sd: number; se: number };
  group2: { name: string; n: number; mean: number; sd: number; se: number };
  meanDiff: number;
  ci95Low: number;
  ci95High: number;
  levene: { f: number; p: number; equalVarianceAssumed: boolean };
  studentsT: { t: number; df: number; p: number };
  welchsT: { t: number; df: number; p: number };
  cohensD: number;
  hedgesG: number;
}

export interface PairedTTestResult {
  type: 'paired_ttest';
  var1: string;
  var2: string;
  n: number;
  mean1: number;
  sd1: number;
  mean2: number;
  sd2: number;
  meanDiff: number;
  sdDiff: number;
  seDiff: number;
  t: number;
  df: number;
  p: number;
  ci95Low: number;
  ci95High: number;
  cohensD: number;
  pearsonR: number;
  rPValue: number;
}

export interface AnovaPostHocPair {
  groupA: string;
  groupB: string;
  meanDiff: number;
  se: number;
  q: number;
  pAdjusted: number;
  ci95Low: number;
  ci95High: number;
}

export interface AnovaGroupStat {
  name: string;
  n: number;
  mean: number;
  sd: number;
  se: number;
  ci95Low: number;
  ci95High: number;
}

export interface AnovaResult {
  type: 'anova';
  dependentVar: string;
  factorVar: string;
  groups: AnovaGroupStat[];
  ssBetween: number;
  dfBetween: number;
  msBetween: number;
  ssWithin: number;
  dfWithin: number;
  msWithin: number;
  ssTotal: number;
  dfTotal: number;
  f: number;
  p: number;
  etaSquared: number;
  omegaSquared: number;
  levene: { f: number; p: number; passed: boolean };
  postHoc: AnovaPostHocPair[];
}

export interface TwoWayAnovaEffect {
  source: string;
  ss: number;
  df: number;
  ms: number;
  f: number;
  p: number;
  partialEtaSq: number;
}

export interface TwoWayAnovaResult {
  type: 'two_way_anova';
  dependentVar: string;
  factorA: string;
  factorB: string;
  factorALevels: string[];
  factorBLevels: string[];
  effects: TwoWayAnovaEffect[];
  totalSS: number;
  totalDf: number;
  cellStats: { factorA: string; factorB: string; n: number; mean: number; sd: number }[];
}

export interface RepeatedMeasuresAnovaResult {
  type: 'repeated_measures_anova';
  variables: string[];
  n: number;
  k: number;
  timepoints: { name: string; mean: number; sd: number; se: number }[];
  ssTime: number;
  dfTime: number;
  msTime: number;
  ssError: number;
  dfError: number;
  msError: number;
  f: number;
  p: number;
  partialEtaSq: number;
  mauchlyW: number;
  mauchlyP: number;
  greenhouseGeisserEps: number;
}

export interface AncovaResult {
  type: 'ancova';
  dependentVar: string;
  groupVar: string;
  covariateVar: string;
  effects: { source: string; ss: number; df: number; ms: number; f: number; p: number; partialEtaSq: number }[];
  groups: { name: string; n: number; unadjustedMean: number; adjustedMean: number; se: number }[];
  covariateBeta: number;
}

export interface MannWhitneyResult {
  type: 'mann_whitney';
  dependentVar: string;
  groupVar: string;
  group1: { name: string; n: number; median: number; meanRank: number; sumRanks: number };
  group2: { name: string; n: number; median: number; meanRank: number; sumRanks: number };
  u: number;
  w: number;
  z: number;
  p: number;
  rankBiserialR: number;
}

export interface WilcoxonSignedResult {
  type: 'wilcoxon_signed';
  var1: string;
  var2: string;
  nTotal: number;
  nEffective: number;
  median1: number;
  median2: number;
  medianDiff: number;
  wPositive: number;
  wNegative: number;
  w: number;
  z: number;
  p: number;
  effectSizeR: number;
}

export interface KruskalWallisResult {
  type: 'kruskal_wallis';
  dependentVar: string;
  groupVar: string;
  groups: { name: string; n: number; median: number; meanRank: number; sumRanks: number }[];
  totalN: number;
  h: number;
  df: number;
  p: number;
  epsilonSquared: number;
}

export interface FriedmanResult {
  type: 'friedman';
  variables: string[];
  n: number;
  k: number;
  conditions: { name: string; meanRank: number; median: number; iqr: number }[];
  chiSquare: number;
  df: number;
  p: number;
  kendallsW: number;
}

export interface RegressionCoefficient {
  variable: string;
  b: number;
  seB: number;
  beta: number;
  t: number;
  p: number;
  ci95Low: number;
  ci95High: number;
  vif?: number;
  tolerance?: number;
}

export interface RegressionResult {
  type: 'regression';
  dependentVar: string;
  independentVars: string[];
  n: number;
  r: number;
  rSquared: number;
  adjRSquared: number;
  see: number;
  f: number;
  df1: number;
  df2: number;
  p: number;
  coefficients: RegressionCoefficient[];
  durbinWatson: number;
}

export interface LogisticCoefficient {
  variable: string;
  b: number;
  se: number;
  waldChi: number;
  p: number;
  oddsRatio: number;
  ciLow: number;
  ciHigh: number;
}

export interface LogisticRegressionResult {
  type: 'logistic_regression';
  dependentVar: string;
  eventCategory: string;
  independentVars: string[];
  n: number;
  eventCount: number;
  nonEventCount: number;
  modelChiSquare: number;
  df: number;
  p: number;
  coxSnellR2: number;
  nagelkerkeR2: number;
  minus2LogLikelihood: number;
  coefficients: LogisticCoefficient[];
}

export interface CorrelationCell {
  var1: string;
  var2: string;
  r: number;
  p: number;
  n: number;
  significant: boolean;
}

export interface CorrelationResult {
  type: 'correlation';
  variables: string[];
  method: 'pearson' | 'spearman';
  matrix: CorrelationCell[];
}

export interface CronbachAlphaResult {
  type: 'cronbach_alpha';
  items: string[];
  n: number;
  itemCount: number;
  rawAlpha: number;
  standardizedAlpha: number;
  scaleMean: number;
  scaleSd: number;
  itemStats: {
    item: string;
    mean: number;
    sd: number;
    itemRestCorrelation: number;
    alphaIfDeleted: number;
  }[];
}

export interface ContingencyCell {
  rowValue: string;
  colValue: string;
  observed: number;
  expected: number;
  stdResidual: number;
}

export interface ChiSquareResult {
  type: 'chi_square';
  rowVar: string;
  colVar: string;
  n: number;
  chiSquare: number;
  df: number;
  p: number;
  cramersV: number;
  phi: number;
  cells: ContingencyCell[];
  rowCategories: string[];
  colCategories: string[];
}

export interface ChiSquareGofResult {
  type: 'chi_square_gof';
  variable: string;
  n: number;
  chiSquare: number;
  df: number;
  p: number;
  categories: {
    category: string;
    observed: number;
    expected: number;
    residual: number;
    stdResidual: number;
  }[];
}

export interface GenericAnalysisResult {
  type: 'generic_procedure' | 'custom_analysis';
  testTitle: string;
  category: string;
  sampleSize: number;
  primaryMetric: string;
  primaryValue: number | string;
  pValue?: number;
  degreesOfFreedom?: number | string;
  effectSize?: string;
  summaryTable?: { [key: string]: string | number }[];
  notes?: string[];
  chartType?: string;
  apaOutput: string;
}

export interface FitIndexItem {
  metric: string;
  value: number | string;
  benchmark: string;
  status: 'Good' | 'Acceptable' | 'Poor';
}

export interface ModelFitIndices {
  chiSquare: number;
  df: number;
  p: number;
  chiSquareDfRatio: number;
  cfi: number;
  tli: number;
  rmsea: number;
  rmseaCi90: [number, number];
  srmr: number;
  aic: number;
  bic: number;
  interpretation: FitIndexItem[];
}

export interface EfaFactorLoading {
  variable: string;
  loadings: number[];
  communality: number;
  uniqueness: number;
}

export interface EfaEigenvalue {
  factor: number;
  eigenvalue: number;
  varianceExplainedPct: number;
  cumulativeVariancePct: number;
}

export interface EfaResult {
  type: 'exploratory_factor_analysis';
  variables: string[];
  sampleSize: number;
  factorsExtracted: number;
  extractionMethod: string;
  rotationMethod: string;
  kmo: {
    overall: number;
    individual: Record<string, number>;
    interpretation: string;
  };
  bartlett: {
    chiSquare: number;
    df: number;
    p: number;
    isSignificant: boolean;
  };
  eigenvalues: EfaEigenvalue[];
  factorLoadings: EfaFactorLoading[];
  factorCorrelations?: number[][];
  modelFit: {
    chiSquare: number;
    df: number;
    p: number;
    rmsea: number;
    tli: number;
    bic: number;
  };
  interpretationGuidelines: string[];
}

export interface CfaFactorLoading {
  latentFactor: string;
  indicator: string;
  unstandardized: number;
  se: number;
  zValue: number;
  pValue: number;
  standardized: number;
  rSquared: number;
}

export interface CfaReliability {
  factor: string;
  cronbachAlpha: number;
  compositeReliability: number;
  ave: number; // Average Variance Extracted
}

export interface CfaResult {
  type: 'confirmatory_factor_analysis';
  modelName: string;
  sampleSize: number;
  latentFactors: {
    name: string;
    indicators: string[];
    variance: number;
  }[];
  fitIndices: ModelFitIndices;
  factorLoadings: CfaFactorLoading[];
  factorCovariances: {
    factor1: string;
    factor2: string;
    covariance: number;
    correlation: number;
    pValue: number;
  }[];
  reliability: CfaReliability[];
  interpretationGuidelines: string[];
}

export interface SemStructuralPath {
  source: string;
  target: string;
  pathType: 'direct' | 'indirect' | 'total';
  estimate: number;
  stdError: number;
  zValue: number;
  pValue: number;
  beta: number; // Standardized coefficient
  ci95: [number, number];
  significant: boolean;
}

export interface SemResult {
  type: 'structural_equation_modeling';
  modelName: string;
  sampleSize: number;
  endogenousVars: string[];
  exogenousVars: string[];
  fitIndices: ModelFitIndices;
  structuralPaths: SemStructuralPath[];
  measurementModel: {
    factor: string;
    indicator: string;
    loading: number;
    stdError: number;
    pValue: number;
    rSquared: number;
  }[];
  rSquaredSummary: {
    variable: string;
    rSquared: number;
    fSquared: number;
  }[];
  mediationEffects?: {
    independent: string;
    mediator: string;
    dependent: string;
    directEffect: number;
    indirectEffect: number;
    totalEffect: number;
    sobelZ: number;
    sobelP: number;
    percentMediation: number;
  }[];
  interpretationGuidelines: string[];
}

export type StatisticalResult =
  | DescriptiveStatsResult
  | OneSampleTTestResult
  | IndependentTTestResult
  | PairedTTestResult
  | AnovaResult
  | TwoWayAnovaResult
  | RepeatedMeasuresAnovaResult
  | AncovaResult
  | MannWhitneyResult
  | WilcoxonSignedResult
  | KruskalWallisResult
  | FriedmanResult
  | RegressionResult
  | LogisticRegressionResult
  | CorrelationResult
  | CronbachAlphaResult
  | ChiSquareResult
  | ChiSquareGofResult
  | EfaResult
  | CfaResult
  | SemResult
  | GenericAnalysisResult;

export interface TestSpecificStudyConfig {
  dataset: Dataset;
  recommendedDv?: string;
  recommendedIv?: string;
  recommendedGroup1?: string;
  recommendedGroup2?: string;
  recommendedSecondVar?: string;
  recommendedMultiVars?: string[];
  recommendedFactorB?: string;
  recommendedCovariate?: string;
  recommendedTestValue?: number;
  correlationMethod?: 'pearson' | 'spearman';
  alphaLevel?: number;
  researchQuestion: ResearchQuestion;
  explanation: string;
}

export interface ApaVerificationItem {
  rule: string;
  status: 'Passed' | 'Caution' | 'Notice';
  detail: string;
}

export interface ApaSynthesisResponse {
  apaNarrative: string;
  apaTableNote: string;
  assumptionsReport: string;
  effectSizeInterpretation: string;
  discussionDraft: string;
  checklist: ApaVerificationItem[];
  _meta?: {
    model?: string;
    isFallback?: boolean;
  };
}
