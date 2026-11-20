import { Dataset, ResearchQuestion, StatisticalTestType } from '../types/stats';
import { refreshDatasetMetadata } from '../utils/datasetEditor';

export type TestLibraryCategoryKey =
  | 'normally_distributed'
  | 'non_normal'
  | 'small_sample'
  | 'missing_data'
  | 'unequal_variance'
  | 'repeated_measures'
  | 'categorical'
  | 'regression'
  | 'reliability_analysis';

export interface TestLibraryCategoryMeta {
  key: TestLibraryCategoryKey;
  label: string;
  shortLabel: string;
  description: string;
  recommendedProcedures: string;
}

export interface TestLibraryEntry {
  id: string;
  categoryKey: TestLibraryCategoryKey;
  categoryLabel: string;
  dataset: Dataset;
  statisticalProfile: string;
  diagnosticFocus: string;
  recommendedTest: StatisticalTestType;
  recommendedTestTitle: string;
  recommendedDv?: string;
  recommendedIv?: string;
  recommendedGroup1?: string;
  recommendedGroup2?: string;
  recommendedSecondVar?: string;
  recommendedMultiVars?: string[];
  recommendedTestValue?: number;
  correlationMethod?: 'pearson' | 'spearman';
  researchQuestion: ResearchQuestion;
}

export const TEST_LIBRARY_CATEGORIES: TestLibraryCategoryMeta[] = [
  {
    key: 'normally_distributed',
    label: 'Normally distributed datasets',
    shortLabel: 'Normally Distributed',
    description: 'Symmetric bell-shaped continuous distributions with negligible skewness and homogeneous spread.',
    recommendedProcedures: 'Independent t-test · One-Sample t-test · One-Way ANOVA',
  },
  {
    key: 'non_normal',
    label: 'Non-normal datasets',
    shortLabel: 'Non-Normal',
    description: 'Right-skewed, heavy-tailed, or zero-bounded distributions where parametric means misrepresent typical cases.',
    recommendedProcedures: 'Mann-Whitney U · Kruskal-Wallis H · Spearman Correlation',
  },
  {
    key: 'small_sample',
    label: 'Small-sample datasets',
    shortLabel: 'Small-Sample',
    description: 'Low-N clinical pilot and human-factors cohorts (N ≤ 12) where asymptotic normality cannot be assumed.',
    recommendedProcedures: 'Mann-Whitney U · Wilcoxon Signed-Rank · Exact Ranks',
  },
  {
    key: 'missing_data',
    label: 'Missing-data examples',
    shortLabel: 'Missing-Data',
    description: 'Real-world longitudinal attrition and sensitive-item non-response containing explicit blank/null observations.',
    recommendedProcedures: 'Completeness Audit · Pairwise Screening · Descriptive Stats',
  },
  {
    key: 'unequal_variance',
    label: 'Unequal-variance datasets',
    shortLabel: 'Unequal-Variance',
    description: 'Heteroscedastic groups (Levene p < .001) requiring Welch corrections instead of pooled-variance tests.',
    recommendedProcedures: "Welch's t-test · One-Way ANOVA (Levene Diagnostics)",
  },
  {
    key: 'repeated_measures',
    label: 'Repeated-measures datasets',
    shortLabel: 'Repeated-Measures',
    description: 'Correlated within-subject measurements tracked across 3–4 timepoints or crossover conditions.',
    recommendedProcedures: 'Repeated Measures ANOVA · Friedman Test · Paired t-test',
  },
  {
    key: 'categorical',
    label: 'Categorical datasets',
    shortLabel: 'Categorical',
    description: 'Nominal and ordinal cross-tabulation counts examining association and frequency independence.',
    recommendedProcedures: 'Chi-Square Test of Independence · Chi-Square GoF',
  },
  {
    key: 'regression',
    label: 'Regression datasets',
    shortLabel: 'Regression',
    description: 'Continuous multi-predictor matrices engineered to test linear slopes, R², VIF, and binary odds.',
    recommendedProcedures: 'Multiple Linear Regression · Binary Logistic Regression',
  },
  {
    key: 'reliability_analysis',
    label: 'Reliability-analysis datasets',
    shortLabel: 'Reliability-Analysis',
    description: 'Multi-item Likert psychometric scales structured for Cronbach’s α and item-total deletion diagnostics.',
    recommendedProcedures: "Cronbach's Alpha · Item-Rest Correlation",
  },
];

function buildLibraryDataset(
  id: string,
  name: string,
  domain: string,
  description: string,
  columns: { name: string; type: 'continuous' | 'categorical' | 'id' }[],
  data: Record<string, any>[],
  rq: ResearchQuestion
): Dataset {
  const base: Dataset = {
    id,
    name,
    domain,
    description,
    columns: columns.map((c) => ({
      name: c.name,
      type: c.type,
      distinctCount: 0,
      missingCount: 0,
      sampleValues: [],
    })),
    data,
    totalRows: data.length,
    researchQuestions: [rq],
  };
  return refreshDatasetMetadata(base, data);
}

// ============================================================================
// 1. NORMALLY DISTRIBUTED DATASETS (N = 40 & N = 36)
// ============================================================================

const normalRecallRq: ResearchQuestion = {
  id: 'rq-lib-normal-1',
  title: 'RQ1: Spaced Retrieval vs. Re-Reading Recall (Gaussian)',
  question: 'Do students using spaced retrieval practice achieve higher delayed recall scores than students using massed re-reading when scores are normally distributed with equal variance?',
  hypothesisNull: 'H₀: μ_Spaced = μ_Control (no difference in mean recall score).',
  hypothesisAlt: 'H₁: μ_Spaced ≠ μ_Control (significant difference in mean recall score).',
  testType: 'independent_ttest',
  dependentVar: 'Recall_Score',
  independentVar: 'Study_Condition',
};

// Symmetric Gaussian values centered around 70.0 (SD ~ 7.5) and 81.5 (SD ~ 7.5)
const normalControlRecall = [56, 61, 63, 64, 66, 67, 68, 69, 69, 70, 70, 71, 71, 72, 73, 74, 76, 77, 79, 84];
const normalSpacedRecall = [68, 72, 74, 76, 77, 78, 79, 80, 81, 81, 82, 82, 83, 84, 85, 86, 87, 89, 91, 95];
const normalRecallRows = [
  ...normalControlRecall.map((score, i) => ({
    Participant_ID: `NR${String(i + 1).padStart(3, '0')}`,
    Study_Condition: 'Massed_Reread',
    Recall_Score: score,
    Reaction_Time_ms: 640 + ((i % 5) - 2) * 28,
  })),
  ...normalSpacedRecall.map((score, i) => ({
    Participant_ID: `NR${String(i + 21).padStart(3, '0')}`,
    Study_Condition: 'Spaced_Retrieval',
    Recall_Score: score,
    Reaction_Time_ms: 585 + ((i % 5) - 2) * 26,
  })),
];

const normalGlucoseRq: ResearchQuestion = {
  id: 'rq-lib-normal-2',
  title: 'RQ1: Normative Cohort Fasting Glucose vs. 100 mg/dL Threshold',
  question: 'Does mean fasting blood glucose in the screened adult wellness cohort differ significantly from the clinical norm reference of μ₀ = 100 mg/dL?',
  hypothesisNull: 'H₀: μ_Glucose = 100.0 mg/dL.',
  hypothesisAlt: 'H₁: μ_Glucose ≠ 100.0 mg/dL.',
  testType: 'one_sample_ttest',
  dependentVar: 'Fasting_Glucose_mgdL',
};

const normalGlucoseVals = [
  78, 81, 83, 85, 86, 87, 88, 89, 90, 91, 91, 92,
  92, 93, 93, 94, 94, 94, 95, 95, 95, 96, 96, 97,
  97, 98, 98, 99, 100, 101, 102, 103, 104, 106, 108, 111,
];
const normalGlucoseRows = normalGlucoseVals.map((g, i) => ({
  Subject_ID: `NG${String(i + 1).padStart(3, '0')}`,
  Fasting_Glucose_mgdL: g,
  Systolic_BP_mmHg: Math.round(118 + (g - 94) * 0.45 + ((i % 3) - 1) * 2),
  HDL_Cholesterol: Math.round(56 - (g - 94) * 0.25),
}));

// ============================================================================
// 2. NON-NORMAL DATASETS (Strong Right Skew & Outliers)
// ============================================================================

const nonNormalTriageRq: ResearchQuestion = {
  id: 'rq-lib-nonnormal-1',
  title: 'RQ1: Right-Skewed Emergency Triage Wait Times',
  question: 'Does Fast-Track Triage reduce waiting-room time in minutes compared to Standard Intake when wait times exhibit severe positive skewness and tail outliers?',
  hypothesisNull: 'H₀: The median/rank distribution of Wait_Time_Min does not differ between triage pathways.',
  hypothesisAlt: 'H₁: Wait_Time_Min rank distributions differ significantly between Standard Intake and Fast-Track Triage.',
  testType: 'mann_whitney',
  dependentVar: 'Wait_Time_Min',
  independentVar: 'Triage_Pathway',
};

// Heavily right-skewed wait times (mins)
const stdTriageWaits = [18, 21, 24, 26, 29, 31, 34, 38, 42, 46, 52, 61, 74, 95, 138, 185, 240];
const fastTriageWaits = [6, 7, 8, 9, 10, 11, 12, 14, 15, 17, 19, 22, 26, 33, 44, 62, 92];
const nonNormalTriageRows = [
  ...stdTriageWaits.map((w, i) => ({
    Visit_ID: `ED${String(i + 1).padStart(3, '0')}`,
    Triage_Pathway: 'Standard_Intake',
    Wait_Time_Min: w,
    Pain_VAS_0_10: Math.min(10, 3 + (i % 7)),
  })),
  ...fastTriageWaits.map((w, i) => ({
    Visit_ID: `ED${String(i + 18).padStart(3, '0')}`,
    Triage_Pathway: 'FastTrack_Triage',
    Wait_Time_Min: w,
    Pain_VAS_0_10: Math.min(10, 2 + (i % 6)),
  })),
];

const nonNormalCreatorRq: ResearchQuestion = {
  id: 'rq-lib-nonnormal-2',
  title: 'RQ1: Skewed Video Reach Across 3 Content Formats',
  question: 'Are there statistically significant rank differences in 7-day video reach across Short-Form, Tutorial, and Documentary creator formats under power-law skewness?',
  hypothesisNull: 'H₀: Mean ranks of Views_7Day_k are equal across all three formats.',
  hypothesisAlt: 'H₁: At least one format exhibits a significantly different median/rank reach.',
  testType: 'kruskal_wallis',
  dependentVar: 'Views_7Day_k',
  independentVar: 'Content_Format',
};

const shortViews = [12.4, 15.1, 18.6, 22.0, 27.5, 34.2, 48.0, 79.5, 165.0, 410.0];
const tutorialViews = [3.2, 4.1, 5.0, 5.8, 6.9, 8.4, 11.2, 16.5, 29.0, 68.0];
const docViews = [7.5, 9.0, 10.4, 12.1, 14.8, 19.3, 26.4, 41.0, 88.0, 195.0];
const nonNormalCreatorRows = [
  ...shortViews.map((v, i) => ({
    Channel_ID: `CR${String(i + 1).padStart(3, '0')}`,
    Content_Format: 'Short_Form',
    Views_7Day_k: v,
    Watch_Minutes_k: Number((v * 0.42).toFixed(1)),
  })),
  ...tutorialViews.map((v, i) => ({
    Channel_ID: `CR${String(i + 11).padStart(3, '0')}`,
    Content_Format: 'Tutorial',
    Views_7Day_k: v,
    Watch_Minutes_k: Number((v * 3.8).toFixed(1)),
  })),
  ...docViews.map((v, i) => ({
    Channel_ID: `CR${String(i + 21).padStart(3, '0')}`,
    Content_Format: 'Documentary',
    Views_7Day_k: v,
    Watch_Minutes_k: Number((v * 7.2).toFixed(1)),
  })),
];

// ============================================================================
// 3. SMALL-SAMPLE DATASETS (N = 10 & N = 8)
// ============================================================================

const smallOrphanRq: ResearchQuestion = {
  id: 'rq-lib-small-1',
  title: 'RQ1: Rare-Disease Biomarker Pilot (n₁ = 5, n₂ = 5)',
  question: 'In a small-sample Phase I/II neuromuscular trial (N = 10), does the Active Biologic cohort show higher functional motor gains than Matched Sham?',
  hypothesisNull: 'H₀: Motor_Gain_Points distributions are equal in Active_Biologic and Matched_Sham.',
  hypothesisAlt: 'H₁: Active_Biologic differs significantly from Matched_Sham in rank-ordered motor gains.',
  testType: 'mann_whitney',
  dependentVar: 'Motor_Gain_Points',
  independentVar: 'Trial_Arm',
};

const smallOrphanRows = [
  { Patient_ID: 'OM01', Trial_Arm: 'Active_Biologic', Motor_Gain_Points: 14.2, Serum_CK_Drop_Pct: 31 },
  { Patient_ID: 'OM02', Trial_Arm: 'Active_Biologic', Motor_Gain_Points: 11.8, Serum_CK_Drop_Pct: 26 },
  { Patient_ID: 'OM03', Trial_Arm: 'Active_Biologic', Motor_Gain_Points: 16.5, Serum_CK_Drop_Pct: 38 },
  { Patient_ID: 'OM04', Trial_Arm: 'Active_Biologic', Motor_Gain_Points: 12.9, Serum_CK_Drop_Pct: 28 },
  { Patient_ID: 'OM05', Trial_Arm: 'Active_Biologic', Motor_Gain_Points: 18.1, Serum_CK_Drop_Pct: 42 },
  { Patient_ID: 'OM06', Trial_Arm: 'Matched_Sham', Motor_Gain_Points: 3.4, Serum_CK_Drop_Pct: 5 },
  { Patient_ID: 'OM07', Trial_Arm: 'Matched_Sham', Motor_Gain_Points: 5.1, Serum_CK_Drop_Pct: 9 },
  { Patient_ID: 'OM08', Trial_Arm: 'Matched_Sham', Motor_Gain_Points: 2.0, Serum_CK_Drop_Pct: 2 },
  { Patient_ID: 'OM09', Trial_Arm: 'Matched_Sham', Motor_Gain_Points: 6.8, Serum_CK_Drop_Pct: 11 },
  { Patient_ID: 'OM10', Trial_Arm: 'Matched_Sham', Motor_Gain_Points: 4.5, Serum_CK_Drop_Pct: 7 },
];

const smallAviationRq: ResearchQuestion = {
  id: 'rq-lib-small-2',
  title: 'RQ1: Aviation HUD Paired Hazard Response Pilot (N = 8)',
  question: 'Across 8 certified test pilots, does an Augmented Reality HUD reduce emergency anomaly reaction time (ms) compared to legacy cockpit gauges?',
  hypothesisNull: 'H₀: Median paired difference (AR_HUD_ms − Legacy_Gauge_ms) equals zero.',
  hypothesisAlt: 'H₁: Paired reaction times differ significantly between Legacy Gauge and AR HUD conditions.',
  testType: 'wilcoxon_signed',
  dependentVar: 'Legacy_Gauge_ms',
  secondVar: 'AR_HUD_ms',
};

const smallAviationRows = [
  { Pilot_ID: 'PLT01', Flight_Hours_Rank: 'Senior', Legacy_Gauge_ms: 1420, AR_HUD_ms: 980 },
  { Pilot_ID: 'PLT02', Flight_Hours_Rank: 'Senior', Legacy_Gauge_ms: 1310, AR_HUD_ms: 910 },
  { Pilot_ID: 'PLT03', Flight_Hours_Rank: 'Mid', Legacy_Gauge_ms: 1680, AR_HUD_ms: 1140 },
  { Pilot_ID: 'PLT04', Flight_Hours_Rank: 'Mid', Legacy_Gauge_ms: 1590, AR_HUD_ms: 1090 },
  { Pilot_ID: 'PLT05', Flight_Hours_Rank: 'Senior', Legacy_Gauge_ms: 1280, AR_HUD_ms: 940 },
  { Pilot_ID: 'PLT06', Flight_Hours_Rank: 'Mid', Legacy_Gauge_ms: 1740, AR_HUD_ms: 1210 },
  { Pilot_ID: 'PLT07', Flight_Hours_Rank: 'Senior', Legacy_Gauge_ms: 1490, AR_HUD_ms: 1020 },
  { Pilot_ID: 'PLT08', Flight_Hours_Rank: 'Mid', Legacy_Gauge_ms: 1860, AR_HUD_ms: 1290 },
];

// ============================================================================
// 4. MISSING-DATA EXAMPLES (Intentional null cells for missingness screening)
// ============================================================================

const missingClinicRq: ResearchQuestion = {
  id: 'rq-lib-missing-1',
  title: 'RQ1: Outpatient Depression Follow-Up With Longitudinal Attrition',
  question: 'Among clinic patients with documented follow-up retention and dropout missingness, do PHQ-9 depression severity scores improve from Baseline to Week 4?',
  hypothesisNull: 'H₀: Mean Baseline_PHQ9 equals Week4_PHQ9 among complete pairs.',
  hypothesisAlt: 'H₁: Mean Baseline_PHQ9 differs significantly from Week4_PHQ9.',
  testType: 'paired_ttest',
  dependentVar: 'Baseline_PHQ9',
  secondVar: 'Week4_PHQ9',
};

const missingClinicRows = [
  { Patient_ID: 'CL01', Retention_Status: 'Completed', Baseline_PHQ9: 19, Week4_PHQ9: 13, Week8_PHQ9: 9 },
  { Patient_ID: 'CL02', Retention_Status: 'Completed', Baseline_PHQ9: 17, Week4_PHQ9: 12, Week8_PHQ9: 8 },
  { Patient_ID: 'CL03', Retention_Status: 'Lost_Week8', Baseline_PHQ9: 21, Week4_PHQ9: 16, Week8_PHQ9: null },
  { Patient_ID: 'CL04', Retention_Status: 'Completed', Baseline_PHQ9: 15, Week4_PHQ9: 10, Week8_PHQ9: 6 },
  { Patient_ID: 'CL05', Retention_Status: 'Early_Dropout', Baseline_PHQ9: 22, Week4_PHQ9: null, Week8_PHQ9: null },
  { Patient_ID: 'CL06', Retention_Status: 'Completed', Baseline_PHQ9: 18, Week4_PHQ9: 11, Week8_PHQ9: 7 },
  { Patient_ID: 'CL07', Retention_Status: 'Completed', Baseline_PHQ9: 16, Week4_PHQ9: 12, Week8_PHQ9: 9 },
  { Patient_ID: 'CL08', Retention_Status: 'Early_Dropout', Baseline_PHQ9: 23, Week4_PHQ9: null, Week8_PHQ9: null },
  { Patient_ID: 'CL09', Retention_Status: 'Completed', Baseline_PHQ9: 14, Week4_PHQ9: 9, Week8_PHQ9: 5 },
  { Patient_ID: 'CL10', Retention_Status: 'Completed', Baseline_PHQ9: 20, Week4_PHQ9: 14, Week8_PHQ9: 10 },
  { Patient_ID: 'CL11', Retention_Status: 'Lost_Week8', Baseline_PHQ9: 19, Week4_PHQ9: 15, Week8_PHQ9: null },
  { Patient_ID: 'CL12', Retention_Status: 'Completed', Baseline_PHQ9: 16, Week4_PHQ9: 11, Week8_PHQ9: 7 },
  { Patient_ID: 'CL13', Retention_Status: 'Completed', Baseline_PHQ9: 18, Week4_PHQ9: 13, Week8_PHQ9: 8 },
  { Patient_ID: 'CL14', Retention_Status: 'Early_Dropout', Baseline_PHQ9: 21, Week4_PHQ9: null, Week8_PHQ9: null },
  { Patient_ID: 'CL15', Retention_Status: 'Completed', Baseline_PHQ9: 15, Week4_PHQ9: 10, Week8_PHQ9: 6 },
  { Patient_ID: 'CL16', Retention_Status: 'Completed', Baseline_PHQ9: 17, Week4_PHQ9: 11, Week8_PHQ9: 8 },
  { Patient_ID: 'CL17', Retention_Status: 'Completed', Baseline_PHQ9: 19, Week4_PHQ9: 14, Week8_PHQ9: 10 },
  { Patient_ID: 'CL18', Retention_Status: 'Lost_Week8', Baseline_PHQ9: 18, Week4_PHQ9: 13, Week8_PHQ9: null },
  { Patient_ID: 'CL19', Retention_Status: 'Completed', Baseline_PHQ9: 14, Week4_PHQ9: 9, Week8_PHQ9: 6 },
  { Patient_ID: 'CL20', Retention_Status: 'Completed', Baseline_PHQ9: 16, Week4_PHQ9: 10, Week8_PHQ9: 7 },
];

const missingSurveyRq: ResearchQuestion = {
  id: 'rq-lib-missing-2',
  title: 'RQ1: Municipal Survey Item Non-Response Screening',
  question: 'What are the valid sample sizes, central tendencies, and dispersion profiles across survey variables with sensitive income non-response?',
  hypothesisNull: 'H₀: Descriptive parameters reflect available complete responses per item.',
  hypothesisAlt: 'H₁: Item non-response concentrates in Household_Income_USD rather than Age or Wellbeing.',
  testType: 'descriptive',
  multiVars: ['Age', 'Household_Income_USD', 'Commute_Min', 'Wellbeing_Index'],
};

const missingSurveyRows = [
  { Resp_ID: 'MS01', District: 'North', Age: 29, Household_Income_USD: 54000, Commute_Min: 24, Wellbeing_Index: 7.4 },
  { Resp_ID: 'MS02', District: 'North', Age: 44, Household_Income_USD: null, Commute_Min: 35, Wellbeing_Index: 6.8 },
  { Resp_ID: 'MS03', District: 'Central', Age: 35, Household_Income_USD: 72000, Commute_Min: 18, Wellbeing_Index: 8.1 },
  { Resp_ID: 'MS04', District: 'South', Age: 52, Household_Income_USD: 61500, Commute_Min: null, Wellbeing_Index: 7.0 },
  { Resp_ID: 'MS05', District: 'Central', Age: 26, Household_Income_USD: 43000, Commute_Min: 22, Wellbeing_Index: 7.5 },
  { Resp_ID: 'MS06', District: 'South', Age: 61, Household_Income_USD: null, Commute_Min: 40, Wellbeing_Index: 6.5 },
  { Resp_ID: 'MS07', District: 'North', Age: 38, Household_Income_USD: 68000, Commute_Min: 28, Wellbeing_Index: 7.9 },
  { Resp_ID: 'MS08', District: 'Central', Age: 31, Household_Income_USD: 79000, Commute_Min: 15, Wellbeing_Index: 8.4 },
  { Resp_ID: 'MS09', District: 'South', Age: 47, Household_Income_USD: 52000, Commute_Min: 44, Wellbeing_Index: 6.7 },
  { Resp_ID: 'MS10', District: 'North', Age: 33, Household_Income_USD: null, Commute_Min: 31, Wellbeing_Index: 7.2 },
  { Resp_ID: 'MS11', District: 'Central', Age: 41, Household_Income_USD: 85000, Commute_Min: 20, Wellbeing_Index: 8.3 },
  { Resp_ID: 'MS12', District: 'South', Age: 56, Household_Income_USD: 49500, Commute_Min: null, Wellbeing_Index: 6.9 },
  { Resp_ID: 'MS13', District: 'North', Age: 28, Household_Income_USD: 58000, Commute_Min: 26, Wellbeing_Index: 7.6 },
  { Resp_ID: 'MS14', District: 'Central', Age: 49, Household_Income_USD: 91000, Commute_Min: 19, Wellbeing_Index: 8.2 },
  { Resp_ID: 'MS15', District: 'South', Age: 37, Household_Income_USD: null, Commute_Min: 38, Wellbeing_Index: 7.1 },
  { Resp_ID: 'MS16', District: 'North', Age: 42, Household_Income_USD: 64000, Commute_Min: 29, Wellbeing_Index: 7.7 },
  { Resp_ID: 'MS17', District: 'Central', Age: 30, Household_Income_USD: 71000, Commute_Min: 17, Wellbeing_Index: 8.0 },
  { Resp_ID: 'MS18', District: 'South', Age: 54, Household_Income_USD: 47000, Commute_Min: 46, Wellbeing_Index: 6.4 },
  { Resp_ID: 'MS19', District: 'North', Age: 39, Household_Income_USD: 62000, Commute_Min: 27, Wellbeing_Index: 7.8 },
  { Resp_ID: 'MS20', District: 'Central', Age: 45, Household_Income_USD: 83000, Commute_Min: 21, Wellbeing_Index: 8.1 },
];

// ============================================================================
// 5. UNEQUAL-VARIANCE DATASETS (Heteroscedastic / Levene p < .001)
// ============================================================================

const unequalTutorRq: ResearchQuestion = {
  id: 'rq-lib-unequal-1',
  title: 'RQ1: Heteroscedastic Score Variance Under Adaptive Tutoring',
  question: 'Does Adaptive AI Tutoring yield higher mean mastery scores than Self-Study when variance homogeneity is violated (requiring Welch’s adjusted t-test)?',
  hypothesisNull: 'H₀: μ_Adaptive = μ_SelfStudy (adjusted via Welch Satterthwaite df).',
  hypothesisAlt: 'H₁: μ_Adaptive ≠ μ_SelfStudy under heterogeneous group variances.',
  testType: 'independent_ttest',
  dependentVar: 'Mastery_Score',
  independentVar: 'Instruction_Mode',
};

// Adaptive: tight SD ~ 3.2 around 85.0 | Self_Study: huge spread SD ~ 19.6 around 67.5
const adaptiveScores = [80, 81, 82, 83, 84, 84, 85, 85, 85, 86, 86, 87, 87, 88, 89, 90];
const selfStudyScores = [34, 38, 43, 48, 53, 58, 63, 67, 71, 75, 79, 83, 87, 91, 94, 96];
const unequalTutorRows = [
  ...adaptiveScores.map((s, i) => ({
    Learner_ID: `UV${String(i + 1).padStart(3, '0')}`,
    Instruction_Mode: 'Adaptive_Tutor',
    Mastery_Score: s,
    Completion_Pct: 92 + (i % 8),
  })),
  ...selfStudyScores.map((s, i) => ({
    Learner_ID: `UV${String(i + 17).padStart(3, '0')}`,
    Instruction_Mode: 'Self_Study',
    Mastery_Score: s,
    Completion_Pct: 45 + i * 3,
  })),
];

const unequalLabRq: ResearchQuestion = {
  id: 'rq-lib-unequal-2',
  title: 'RQ1: Multi-Site Assay Calibration Variance Divergence',
  question: 'Do measured concentration readings differ across Reference Lab, Regional Hospital, and Field Clinic sites while testing Levene’s homogeneity assumption?',
  hypothesisNull: 'H₀: Mean Concentration_umol is equal across all three laboratory sites.',
  hypothesisAlt: 'H₁: At least one site differs in mean Concentration_umol (with severe Levene heterogeneity).',
  testType: 'anova',
  dependentVar: 'Concentration_umol',
  independentVar: 'Lab_Site',
};

const refLabVals = [49.2, 49.6, 50.0, 50.1, 50.3, 50.4, 50.7, 50.9, 51.1, 51.5]; // SD ~ 0.7
const regLabVals = [43.0, 45.2, 47.4, 48.8, 50.1, 51.6, 53.0, 54.8, 56.5, 58.6]; // SD ~ 5.0
const fieldLabVals = [28.0, 33.5, 39.0, 44.0, 49.5, 55.0, 62.0, 68.5, 76.0, 84.5]; // SD ~ 18.5
const unequalLabRows = [
  ...refLabVals.map((v, i) => ({
    Sample_ID: `LB${String(i + 1).padStart(3, '0')}`,
    Lab_Site: 'Reference_Lab',
    Concentration_umol: v,
  })),
  ...regLabVals.map((v, i) => ({
    Sample_ID: `LB${String(i + 11).padStart(3, '0')}`,
    Lab_Site: 'Regional_Hospital',
    Concentration_umol: v,
  })),
  ...fieldLabVals.map((v, i) => ({
    Sample_ID: `LB${String(i + 21).padStart(3, '0')}`,
    Lab_Site: 'Field_Clinic',
    Concentration_umol: v,
  })),
];

// ============================================================================
// 6. REPEATED-MEASURES DATASETS (Within-Subjects 4 & 3 Timepoints)
// ============================================================================

const rmStrokeRq: ResearchQuestion = {
  id: 'rq-lib-rm-1',
  title: 'RQ1: 12-Week Post-Stroke Motor Recovery Trajectory',
  question: 'Does Fugl-Meyer upper-extremity motor function improve significantly across four repeated clinical assessments (Baseline, Week 4, Week 8, Week 12)?',
  hypothesisNull: 'H₀: μ_Baseline = μ_Week4 = μ_Week8 = μ_Week12.',
  hypothesisAlt: 'H₁: Mean Fugl-Meyer score changes significantly across the four rehabilitation timepoints.',
  testType: 'repeated_measures_anova',
  multiVars: ['Baseline_FMA', 'Week4_FMA', 'Week8_FMA', 'Week12_FMA'],
};

const rmStrokeRows = Array.from({ length: 18 }, (_, i) => {
  const base = 24 + (i % 6) * 2 + Math.floor(i / 6);
  const w4 = base + 6 + (i % 3);
  const w8 = w4 + 7 + ((i + 1) % 3);
  const w12 = w8 + 6 + (i % 2);
  return {
    Patient_ID: `ST${String(i + 1).padStart(3, '0')}`,
    Baseline_FMA: base,
    Week4_FMA: w4,
    Week8_FMA: w8,
    Week12_FMA: w12,
  };
});

const rmSleepRq: ResearchQuestion = {
  id: 'rq-lib-rm-2',
  title: 'RQ1: Within-Subjects Evening Light Crossover on REM Sleep',
  question: 'Does nocturnal REM sleep percentage differ within participants across Baseline Dark, Blue-Light Exposure, and Amber-Filter conditions?',
  hypothesisNull: 'H₀: Mean REM sleep % is identical across all three lighting crossover conditions.',
  hypothesisAlt: 'H₁: At least one lighting condition produces a distinct REM sleep percentage within participants.',
  testType: 'repeated_measures_anova',
  multiVars: ['Baseline_REM_Pct', 'BlueLight_REM_Pct', 'AmberFilter_REM_Pct'],
};

const rmSleepRows = Array.from({ length: 16 }, (_, i) => {
  const base = 21.0 + (i % 5) * 0.9;
  const blue = Number((base - 4.2 - (i % 3) * 0.4).toFixed(1));
  const amber = Number((base + 1.1 + ((i + 1) % 3) * 0.3).toFixed(1));
  return {
    Sleeper_ID: `SL${String(i + 1).padStart(3, '0')}`,
    Baseline_REM_Pct: Number(base.toFixed(1)),
    BlueLight_REM_Pct: blue,
    AmberFilter_REM_Pct: amber,
  };
});

// ============================================================================
// 7. CATEGORICAL DATASETS (Contingency Tables, N = 80 & N = 72)
// ============================================================================

const catScreeningRq: ResearchQuestion = {
  id: 'rq-lib-cat-1',
  title: 'RQ1: Screening Protocol × Biopsy Outcome Contingency (2×3)',
  question: 'Is there a statistically significant association between screening protocol (AI_Triage vs. Standard_Care) and diagnostic biopsy outcome classification?',
  hypothesisNull: 'H₀: Screening_Protocol and Biopsy_Outcome are statistically independent.',
  hypothesisAlt: 'H₁: Screening_Protocol and Biopsy_Outcome are significantly associated.',
  testType: 'chi_square',
  independentVar: 'Screening_Protocol',
  secondVar: 'Biopsy_Outcome',
};

const catScreeningRows: Record<string, any>[] = [];
const pushCatRows = (
  target: Record<string, any>[],
  prefix: string,
  count: number,
  rowObj: Record<string, any>
) => {
  for (let i = 0; i < count; i++) {
    target.push({
      Case_ID: `${prefix}${String(target.length + 1).padStart(3, '0')}`,
      ...rowObj,
    });
  }
};
pushCatRows(catScreeningRows, 'SC', 12, { Screening_Protocol: 'AI_Triage', Biopsy_Outcome: 'Early_Malignant', Risk_Tier: 'High' });
pushCatRows(catScreeningRows, 'SC', 8, { Screening_Protocol: 'AI_Triage', Biopsy_Outcome: 'Indeterminate', Risk_Tier: 'Moderate' });
pushCatRows(catScreeningRows, 'SC', 20, { Screening_Protocol: 'AI_Triage', Biopsy_Outcome: 'Benign', Risk_Tier: 'Low' });
pushCatRows(catScreeningRows, 'SC', 4, { Screening_Protocol: 'Standard_Care', Biopsy_Outcome: 'Early_Malignant', Risk_Tier: 'High' });
pushCatRows(catScreeningRows, 'SC', 16, { Screening_Protocol: 'Standard_Care', Biopsy_Outcome: 'Indeterminate', Risk_Tier: 'Moderate' });
pushCatRows(catScreeningRows, 'SC', 20, { Screening_Protocol: 'Standard_Care', Biopsy_Outcome: 'Benign', Risk_Tier: 'Low' });

const catModalityRq: ResearchQuestion = {
  id: 'rq-lib-cat-2',
  title: 'RQ1: Course Learning Modality × Semester Retention (3×2)',
  question: 'Does student semester retention status depend significantly on course delivery modality (In_Person, Hybrid, Online)?',
  hypothesisNull: 'H₀: Course_Modality and Retention_Status are independent.',
  hypothesisAlt: 'H₁: Retention_Status proportions differ significantly by Course_Modality.',
  testType: 'chi_square',
  independentVar: 'Course_Modality',
  secondVar: 'Retention_Status',
};

const catModalityRows: Record<string, any>[] = [];
pushCatRows(catModalityRows, 'CM', 22, { Course_Modality: 'In_Person', Retention_Status: 'Retained', Support_Used: 'Yes' });
pushCatRows(catModalityRows, 'CM', 2, { Course_Modality: 'In_Person', Retention_Status: 'Withdrawn', Support_Used: 'No' });
pushCatRows(catModalityRows, 'CM', 19, { Course_Modality: 'Hybrid', Retention_Status: 'Retained', Support_Used: 'Yes' });
pushCatRows(catModalityRows, 'CM', 5, { Course_Modality: 'Hybrid', Retention_Status: 'Withdrawn', Support_Used: 'No' });
pushCatRows(catModalityRows, 'CM', 13, { Course_Modality: 'Online', Retention_Status: 'Retained', Support_Used: 'Yes' });
pushCatRows(catModalityRows, 'CM', 11, { Course_Modality: 'Online', Retention_Status: 'Withdrawn', Support_Used: 'No' });

// ============================================================================
// 8. REGRESSION DATASETS (Multiple Predictors, N = 40 each)
// ============================================================================

const regHousingRq: ResearchQuestion = {
  id: 'rq-lib-reg-1',
  title: 'RQ1: Multi-Predictor Urban Housing Valuation Model',
  question: 'Do living area (sq ft), transit proximity score, building age (years), and school rating jointly predict residential sale price ($k)?',
  hypothesisNull: 'H₀: R² = 0 (all partial regression slopes β₁ = β₂ = β₃ = β₄ = 0).',
  hypothesisAlt: 'H₁: At least one predictor accounts for significant unique variance in Sale_Price_kUSD.',
  testType: 'regression',
  dependentVar: 'Sale_Price_kUSD',
  multiVars: ['Living_Area_SqFt', 'Transit_Proximity_Score', 'Building_Age_Yrs', 'School_Rating'],
};

const regHousingRows = Array.from({ length: 40 }, (_, i) => {
  const sqft = 920 + ((i * 137) % 1850);
  const transit = Number((4.0 + ((i * 7) % 60) * 0.1).toFixed(1));
  const age = 2 + ((i * 11) % 45);
  const school = Number((5.2 + ((i * 5) % 48) * 0.1).toFixed(1));
  const residual = ((i % 7) - 3) * 6.5;
  const price = Math.round(95 + 0.185 * sqft + 14.5 * transit - 1.9 * age + 11.2 * school + residual);
  return {
    Property_ID: `HS${String(i + 1).padStart(3, '0')}`,
    Sale_Price_kUSD: price,
    Living_Area_SqFt: sqft,
    Transit_Proximity_Score: transit,
    Building_Age_Yrs: age,
    School_Rating: school,
  };
});

const regSaasRq: ResearchQuestion = {
  id: 'rq-lib-reg-2',
  title: 'RQ1: SaaS Account LTV & Product Adoption Regression',
  question: 'Do weekly active days, feature adoption percentage, provisioned seats, and support tickets jointly predict annual SaaS customer lifetime value ($)?',
  hypothesisNull: 'H₀: R² = 0 across engagement predictors on Annual_LTV_USD.',
  hypothesisAlt: 'H₁: Engagement and friction predictors significantly explain Annual_LTV_USD.',
  testType: 'regression',
  dependentVar: 'Annual_LTV_USD',
  multiVars: ['Weekly_Active_Days', 'Feature_Adoption_Pct', 'Seats_Provisioned', 'Support_Tickets'],
};

const regSaasRows = Array.from({ length: 40 }, (_, i) => {
  const activeDays = Number((1.4 + ((i * 11) % 53) * 0.1).toFixed(1));
  const adoptionPct = 28 + ((i * 19) % 67);
  const seats = 4 + ((i * 13) % 29);
  const tickets = 1 + ((i * 5) % 13);
  const residual = ((i % 7) - 3) * 140;
  const ltv = Math.round(
    1200 + 620 * activeDays + 54 * adoptionPct + 215 * seats - 190 * tickets + residual
  );
  return {
    Account_ID: `SA${String(i + 1).padStart(3, '0')}`,
    Retained_Flag: activeDays >= 3.4 && tickets <= 9 ? 'Retained' : 'Churned',
    Annual_LTV_USD: ltv,
    Weekly_Active_Days: activeDays,
    Feature_Adoption_Pct: adoptionPct,
    Seats_Provisioned: seats,
    Support_Tickets: tickets,
  };
});

// ============================================================================
// 9. RELIABILITY-ANALYSIS DATASETS (Multi-Item Likert Scales, N = 30 each)
// ============================================================================

const relSelfEfficacyRq: ResearchQuestion = {
  id: 'rq-lib-rel-1',
  title: 'RQ1: 6-Item Academic Self-Efficacy Internal Consistency',
  question: 'Does the 6-item Academic Self-Efficacy Inventory demonstrate acceptable internal consistency (Cronbach’s α ≥ .70) across 30 respondents?',
  hypothesisNull: 'H₀: Inter-item covariance across ASE_Item1–ASE_Item6 is zero (unreliable scale).',
  hypothesisAlt: 'H₁: ASE_Item1–ASE_Item6 show cohesive positive inter-item correlations and strong α.',
  testType: 'cronbach_alpha',
  multiVars: ['ASE_Item1', 'ASE_Item2', 'ASE_Item3', 'ASE_Item4', 'ASE_Item5', 'ASE_Item6'],
};

const clampLikert = (v: number, max = 7) => Math.max(1, Math.min(max, Math.round(v)));
const relSelfEfficacyRows = Array.from({ length: 30 }, (_, i) => {
  const latent = 2.4 + ((i * 7) % 10) * 0.42; // spans 2.4 to 6.2
  return {
    Respondent_ID: `SE${String(i + 1).padStart(3, '0')}`,
    ASE_Item1: clampLikert(latent + ((i % 3) - 1) * 0.4),
    ASE_Item2: clampLikert(latent + (((i + 1) % 3) - 1) * 0.5),
    ASE_Item3: clampLikert(latent + (((i + 2) % 3) - 1) * 0.4),
    ASE_Item4: clampLikert(latent - 0.1 + ((i % 2) === 0 ? 0.5 : -0.4)),
    ASE_Item5: clampLikert(latent + 0.2 + (((i + 1) % 4) - 1.5) * 0.35),
    ASE_Item6: clampLikert(latent + ((i % 3) - 1) * 0.5),
  };
});

const relEhrRq: ResearchQuestion = {
  id: 'rq-lib-rel-2',
  title: 'RQ1: 5-Item Clinical EHR Usability Item-Deletion Audit',
  question: 'What is Cronbach’s α for the 5-item Clinical EHR Usability Scale, and does any individual item weaken overall internal consistency?',
  hypothesisNull: 'H₀: Scale items lack coherent internal reliability.',
  hypothesisAlt: 'H₁: Items 1–4 correlate strongly while Item 5 contributes higher item variance for Alpha-if-Deleted review.',
  testType: 'cronbach_alpha',
  multiVars: ['EHR_Item1', 'EHR_Item2', 'EHR_Item3', 'EHR_Item4', 'EHR_Item5'],
};

const relEhrRows = Array.from({ length: 30 }, (_, i) => {
  const latent = 1.6 + ((i * 3) % 9) * 0.38; // 1-5 scale
  return {
    Clinician_ID: `EH${String(i + 1).padStart(3, '0')}`,
    EHR_Item1: clampLikert(latent + ((i % 3) === 0 ? 0.4 : -0.2), 5),
    EHR_Item2: clampLikert(latent + ((i % 2) === 0 ? 0.3 : -0.3), 5),
    EHR_Item3: clampLikert(latent + (((i + 1) % 3) - 1) * 0.3, 5),
    EHR_Item4: clampLikert(latent - 0.1 + (((i + 2) % 3) - 1) * 0.4, 5),
    // Deliberately noisier item to showcase item-rest correlation & alpha-if-deleted diagnostics
    EHR_Item5: clampLikert(3.0 + ((i % 5) - 2) * 0.9, 5),
  };
});

// ============================================================================
// PERMANENT TEST LIBRARY CATALOG (18 Curated Benchmark Datasets across 9 Categories)
// ============================================================================

export const PERMANENT_TEST_LIBRARY: TestLibraryEntry[] = [
  // 1. Normally distributed
  {
    id: 'lib-normal-cognitive-recall',
    categoryKey: 'normally_distributed',
    categoryLabel: 'Normally distributed',
    dataset: buildLibraryDataset(
      'lib-normal-cognitive-recall',
      'Gaussian Cognitive Recall Experiment',
      'Cognitive Psychology',
      'Symmetric bell-shaped recall scores comparing Massed Re-reading vs. Spaced Retrieval (N = 40). Built to satisfy normality and variance homogeneity assumptions.',
      [
        { name: 'Participant_ID', type: 'id' },
        { name: 'Study_Condition', type: 'categorical' },
        { name: 'Recall_Score', type: 'continuous' },
        { name: 'Reaction_Time_ms', type: 'continuous' },
      ],
      normalRecallRows,
      normalRecallRq
    ),
    statisticalProfile: 'N = 40 · Symmetric Gaussian · Equal SDs (σ₁ ≈ σ₂)',
    diagnosticFocus: 'Ideal parametric baseline: low skewness, homogeneous Levene variance (p > .50).',
    recommendedTest: 'independent_ttest',
    recommendedTestTitle: 'Independent Samples t-Test',
    recommendedDv: 'Recall_Score',
    recommendedIv: 'Study_Condition',
    recommendedGroup1: 'Spaced_Retrieval',
    recommendedGroup2: 'Massed_Reread',
    researchQuestion: normalRecallRq,
  },
  {
    id: 'lib-normal-clinical-glucose',
    categoryKey: 'normally_distributed',
    categoryLabel: 'Normally distributed',
    dataset: buildLibraryDataset(
      'lib-normal-clinical-glucose',
      'Normative Fasting Glucose & BP Cohort',
      'Preventive Medicine',
      'Normally distributed adult metabolic screening cohort (N = 36) benchmarked against the clinical reference μ₀ = 100 mg/dL.',
      [
        { name: 'Subject_ID', type: 'id' },
        { name: 'Fasting_Glucose_mgdL', type: 'continuous' },
        { name: 'Systolic_BP_mmHg', type: 'continuous' },
        { name: 'HDL_Cholesterol', type: 'continuous' },
      ],
      normalGlucoseRows,
      normalGlucoseRq
    ),
    statisticalProfile: 'N = 36 · Skewness ≈ 0.0 · Benchmark μ₀ = 100',
    diagnosticFocus: 'Single-sample Gaussian distribution centered near M = 94.5, SD ≈ 7.2.',
    recommendedTest: 'one_sample_ttest',
    recommendedTestTitle: 'One-Sample t-Test',
    recommendedDv: 'Fasting_Glucose_mgdL',
    recommendedTestValue: 100,
    researchQuestion: normalGlucoseRq,
  },

  // 2. Non-normal
  {
    id: 'lib-nonnormal-triage-wait',
    categoryKey: 'non_normal',
    categoryLabel: 'Non-normal',
    dataset: buildLibraryDataset(
      'lib-nonnormal-triage-wait',
      'Emergency Triage Wait Times (Right-Skewed)',
      'Health Services Research',
      'Strongly right-skewed positive emergency department wait times (minutes) with severe upper-tail outliers (N = 34).',
      [
        { name: 'Visit_ID', type: 'id' },
        { name: 'Triage_Pathway', type: 'categorical' },
        { name: 'Wait_Time_Min', type: 'continuous' },
        { name: 'Pain_VAS_0_10', type: 'continuous' },
      ],
      nonNormalTriageRows,
      nonNormalTriageRq
    ),
    statisticalProfile: 'N = 34 · Strong Right Skew (> +1.6) · Heavy Tail',
    diagnosticFocus: 'Demonstrates why median & Mann-Whitney U ranks outperform arithmetic means under skew.',
    recommendedTest: 'mann_whitney',
    recommendedTestTitle: 'Mann-Whitney U Test',
    recommendedDv: 'Wait_Time_Min',
    recommendedIv: 'Triage_Pathway',
    recommendedGroup1: 'Standard_Intake',
    recommendedGroup2: 'FastTrack_Triage',
    researchQuestion: nonNormalTriageRq,
  },
  {
    id: 'lib-nonnormal-creator-views',
    categoryKey: 'non_normal',
    categoryLabel: 'Non-normal',
    dataset: buildLibraryDataset(
      'lib-nonnormal-creator-views',
      'Creator Media Views (Power-Law Skew)',
      'Digital Media Analytics',
      'Heavily skewed 7-day video reach across 3 content formats (Short-Form, Tutorial, Documentary) with viral tail observations (N = 30).',
      [
        { name: 'Channel_ID', type: 'id' },
        { name: 'Content_Format', type: 'categorical' },
        { name: 'Views_7Day_k', type: 'continuous' },
        { name: 'Watch_Minutes_k', type: 'continuous' },
      ],
      nonNormalCreatorRows,
      nonNormalCreatorRq
    ),
    statisticalProfile: 'N = 30 · 3 Groups · Heavy Positive Skew (> +1.8)',
    diagnosticFocus: 'Kruskal-Wallis non-parametric rank comparison resilient to viral upper-tail outliers.',
    recommendedTest: 'kruskal_wallis',
    recommendedTestTitle: 'Kruskal-Wallis H Test',
    recommendedDv: 'Views_7Day_k',
    recommendedIv: 'Content_Format',
    researchQuestion: nonNormalCreatorRq,
  },

  // 3. Small-sample
  {
    id: 'lib-small-orphan-therapy',
    categoryKey: 'small_sample',
    categoryLabel: 'Small-sample',
    dataset: buildLibraryDataset(
      'lib-small-orphan-therapy',
      'Orphan Neuromuscular Therapy Micro-Trial',
      'Rare Disease Clinical Trial',
      'Small-sample two-arm pilot study (n₁ = 5, n₂ = 5; N = 10) where low cell counts require rank-based inference.',
      [
        { name: 'Patient_ID', type: 'id' },
        { name: 'Trial_Arm', type: 'categorical' },
        { name: 'Motor_Gain_Points', type: 'continuous' },
        { name: 'Serum_CK_Drop_Pct', type: 'continuous' },
      ],
      smallOrphanRows,
      smallOrphanRq
    ),
    statisticalProfile: 'N = 10 (n = 5 per arm) · Low-N Pilot Cohort',
    diagnosticFocus: 'Exact rank separation without relying on large-sample Central Limit assumptions.',
    recommendedTest: 'mann_whitney',
    recommendedTestTitle: 'Mann-Whitney U Test',
    recommendedDv: 'Motor_Gain_Points',
    recommendedIv: 'Trial_Arm',
    recommendedGroup1: 'Active_Biologic',
    recommendedGroup2: 'Matched_Sham',
    researchQuestion: smallOrphanRq,
  },
  {
    id: 'lib-small-aviation-hud',
    categoryKey: 'small_sample',
    categoryLabel: 'Small-sample',
    dataset: buildLibraryDataset(
      'lib-small-aviation-hud',
      'Cockpit AR HUD Emergency Response Pilot',
      'Human Factors Engineering',
      'Paired small-cohort simulator benchmark (N = 8 test pilots) comparing Legacy Gauge vs. AR HUD hazard reaction times.',
      [
        { name: 'Pilot_ID', type: 'id' },
        { name: 'Flight_Hours_Rank', type: 'categorical' },
        { name: 'Legacy_Gauge_ms', type: 'continuous' },
        { name: 'AR_HUD_ms', type: 'continuous' },
      ],
      smallAviationRows,
      smallAviationRq
    ),
    statisticalProfile: 'N = 8 Paired Pilots · Within-Subjects Micro-Sample',
    diagnosticFocus: 'Wilcoxon Signed-Rank paired evaluation tailored for small within-subject pilots.',
    recommendedTest: 'wilcoxon_signed',
    recommendedTestTitle: 'Wilcoxon Signed-Rank Test',
    recommendedDv: 'Legacy_Gauge_ms',
    recommendedSecondVar: 'AR_HUD_ms',
    researchQuestion: smallAviationRq,
  },

  // 4. Missing-data
  {
    id: 'lib-missing-clinic-attrition',
    categoryKey: 'missing_data',
    categoryLabel: 'Missing-data',
    dataset: buildLibraryDataset(
      'lib-missing-clinic-attrition',
      'Outpatient Depression Trial With Attrition',
      'Clinical Psychiatry',
      'Longitudinal PHQ-9 follow-up dataset (N = 20) containing intentional missing follow-up cells (3 missing at Week 4, 6 missing at Week 8) for missing-data inspection and imputation practice.',
      [
        { name: 'Patient_ID', type: 'id' },
        { name: 'Retention_Status', type: 'categorical' },
        { name: 'Baseline_PHQ9', type: 'continuous' },
        { name: 'Week4_PHQ9', type: 'continuous' },
        { name: 'Week8_PHQ9', type: 'continuous' },
      ],
      missingClinicRows,
      missingClinicRq
    ),
    statisticalProfile: 'N = 20 · 9 Missing Cells · Monotone Dropout Pattern',
    diagnosticFocus: 'Flags missing follow-up cells in Step 2 Dictionary & Matrix for cleaning/imputation.',
    recommendedTest: 'paired_ttest',
    recommendedTestTitle: 'Paired Samples t-Test',
    recommendedDv: 'Baseline_PHQ9',
    recommendedSecondVar: 'Week4_PHQ9',
    researchQuestion: missingClinicRq,
  },
  {
    id: 'lib-missing-municipal-survey',
    categoryKey: 'missing_data',
    categoryLabel: 'Missing-data',
    dataset: buildLibraryDataset(
      'lib-missing-municipal-survey',
      'Municipal Survey With Item Non-Response',
      'Public Policy & Sociology',
      'Cross-sectional survey (N = 20) featuring intentional sensitive-item non-response in Household Income (4 nulls) and Commute Minutes (2 nulls).',
      [
        { name: 'Resp_ID', type: 'id' },
        { name: 'District', type: 'categorical' },
        { name: 'Age', type: 'continuous' },
        { name: 'Household_Income_USD', type: 'continuous' },
        { name: 'Commute_Min', type: 'continuous' },
        { name: 'Wellbeing_Index', type: 'continuous' },
      ],
      missingSurveyRows,
      missingSurveyRq
    ),
    statisticalProfile: 'N = 20 · 6 Missing Cells · Item Non-Response',
    diagnosticFocus: 'Inspects per-variable missingness counts & cell-level gaps before modeling.',
    recommendedTest: 'descriptive',
    recommendedTestTitle: 'Descriptive Statistics',
    recommendedMultiVars: ['Age', 'Household_Income_USD', 'Commute_Min', 'Wellbeing_Index'],
    researchQuestion: missingSurveyRq,
  },

  // 5. Unequal-variance
  {
    id: 'lib-unequal-ai-tutoring',
    categoryKey: 'unequal_variance',
    categoryLabel: 'Unequal-variance',
    dataset: buildLibraryDataset(
      'lib-unequal-ai-tutoring',
      'Adaptive AI Tutoring Variance Divergence',
      'Educational Technology',
      'Two-group mastery comparison (N = 32) where Adaptive_Tutor shows tight mastery clustering (SD ≈ 2.8) while Self_Study exhibits wide dispersion (SD ≈ 19.6).',
      [
        { name: 'Learner_ID', type: 'id' },
        { name: 'Instruction_Mode', type: 'categorical' },
        { name: 'Mastery_Score', type: 'continuous' },
        { name: 'Completion_Pct', type: 'continuous' },
      ],
      unequalTutorRows,
      unequalTutorRq
    ),
    statisticalProfile: 'N = 32 · SD Ratio ≈ 7:1 · Levene p < .001',
    diagnosticFocus: 'Triggers Levene homogeneity violation so Step 3 defaults to Welch’s adjusted t-test.',
    recommendedTest: 'independent_ttest',
    recommendedTestTitle: "Independent Samples t-Test (Welch's)",
    recommendedDv: 'Mastery_Score',
    recommendedIv: 'Instruction_Mode',
    recommendedGroup1: 'Adaptive_Tutor',
    recommendedGroup2: 'Self_Study',
    researchQuestion: unequalTutorRq,
  },
  {
    id: 'lib-unequal-lab-assays',
    categoryKey: 'unequal_variance',
    categoryLabel: 'Unequal-variance',
    dataset: buildLibraryDataset(
      'lib-unequal-lab-assays',
      'Multi-Site Assay Precision Divergence',
      'Analytical Chemistry',
      'Three-site biomarker calibration benchmark (N = 30) with escalating within-lab SDs across Reference Lab, Regional Hospital, and Field Clinic.',
      [
        { name: 'Sample_ID', type: 'id' },
        { name: 'Lab_Site', type: 'categorical' },
        { name: 'Concentration_umol', type: 'continuous' },
      ],
      unequalLabRows,
      unequalLabRq
    ),
    statisticalProfile: 'N = 30 · 3 Sites · Heteroscedastic SD (0.7 vs 18.5)',
    diagnosticFocus: 'Demonstrates severe Levene’s test failure inside One-Way ANOVA assumption checks.',
    recommendedTest: 'anova',
    recommendedTestTitle: 'One-Way Between-Subjects ANOVA',
    recommendedDv: 'Concentration_umol',
    recommendedIv: 'Lab_Site',
    researchQuestion: unequalLabRq,
  },

  // 6. Repeated-measures
  {
    id: 'lib-rm-stroke-recovery',
    categoryKey: 'repeated_measures',
    categoryLabel: 'Repeated-measures',
    dataset: buildLibraryDataset(
      'lib-rm-stroke-recovery',
      '4-Timepoint Stroke Motor Recovery Trial',
      'Neurorehabilitation',
      'Longitudinal within-subjects cohort (N = 18) tracking Fugl-Meyer upper-limb scores at Baseline, Week 4, Week 8, and Week 12.',
      [
        { name: 'Patient_ID', type: 'id' },
        { name: 'Baseline_FMA', type: 'continuous' },
        { name: 'Week4_FMA', type: 'continuous' },
        { name: 'Week8_FMA', type: 'continuous' },
        { name: 'Week12_FMA', type: 'continuous' },
      ],
      rmStrokeRows,
      rmStrokeRq
    ),
    statisticalProfile: 'N = 18 · k = 4 Timepoints · Within-Subjects',
    diagnosticFocus: 'Computes timepoint SS, partial η², and Greenhouse-Geisser sphericity diagnostics.',
    recommendedTest: 'repeated_measures_anova',
    recommendedTestTitle: 'Repeated Measures ANOVA',
    recommendedMultiVars: ['Baseline_FMA', 'Week4_FMA', 'Week8_FMA', 'Week12_FMA'],
    researchQuestion: rmStrokeRq,
  },
  {
    id: 'lib-rm-sleep-crossover',
    categoryKey: 'repeated_measures',
    categoryLabel: 'Repeated-measures',
    dataset: buildLibraryDataset(
      'lib-rm-sleep-crossover',
      '3-Condition Sleep Architecture Crossover',
      'Chronobiology & Sleep',
      'Within-subjects crossover experiment (N = 16) comparing REM sleep % under Baseline Dark, Blue-Light Exposure, and Amber Filter nights.',
      [
        { name: 'Sleeper_ID', type: 'id' },
        { name: 'Baseline_REM_Pct', type: 'continuous' },
        { name: 'BlueLight_REM_Pct', type: 'continuous' },
        { name: 'AmberFilter_REM_Pct', type: 'continuous' },
      ],
      rmSleepRows,
      rmSleepRq
    ),
    statisticalProfile: 'N = 16 · k = 3 Conditions · Crossover Design',
    diagnosticFocus: 'Tests correlated within-subject condition contrast across paired nights.',
    recommendedTest: 'repeated_measures_anova',
    recommendedTestTitle: 'Repeated Measures ANOVA',
    recommendedMultiVars: ['Baseline_REM_Pct', 'BlueLight_REM_Pct', 'AmberFilter_REM_Pct'],
    researchQuestion: rmSleepRq,
  },

  // 7. Categorical
  {
    id: 'lib-cat-screening-biopsy',
    categoryKey: 'categorical',
    categoryLabel: 'Categorical',
    dataset: buildLibraryDataset(
      'lib-cat-screening-biopsy',
      'Screening Protocol × Biopsy Diagnostic Table',
      'Oncology Diagnostics',
      '2 × 3 nominal contingency dataset (N = 80) comparing diagnostic biopsy outcomes across AI_Triage and Standard_Care pathways.',
      [
        { name: 'Case_ID', type: 'id' },
        { name: 'Screening_Protocol', type: 'categorical' },
        { name: 'Biopsy_Outcome', type: 'categorical' },
        { name: 'Risk_Tier', type: 'categorical' },
      ],
      catScreeningRows,
      catScreeningRq
    ),
    statisticalProfile: 'N = 80 · 2×3 Contingency · Expected Cell Counts ≥ 5',
    diagnosticFocus: 'Evaluates Pearson χ², standardized cell residuals, and Cramér’s V effect size.',
    recommendedTest: 'chi_square',
    recommendedTestTitle: 'Chi-Square Test of Independence',
    recommendedIv: 'Screening_Protocol',
    recommendedSecondVar: 'Biopsy_Outcome',
    researchQuestion: catScreeningRq,
  },
  {
    id: 'lib-cat-modality-retention',
    categoryKey: 'categorical',
    categoryLabel: 'Categorical',
    dataset: buildLibraryDataset(
      'lib-cat-modality-retention',
      'Learning Modality × Semester Retention',
      'Higher Education Analytics',
      '3 × 2 categorical frequency dataset (N = 72) cross-tabulating In_Person, Hybrid, and Online delivery against retention outcome.',
      [
        { name: 'Case_ID', type: 'id' },
        { name: 'Course_Modality', type: 'categorical' },
        { name: 'Retention_Status', type: 'categorical' },
        { name: 'Support_Used', type: 'categorical' },
      ],
      catModalityRows,
      catModalityRq
    ),
    statisticalProfile: 'N = 72 · 3×2 Contingency · Nominal Proportions',
    diagnosticFocus: 'Tests independence across three instructional modalities with Cramér’s V & ϕ.',
    recommendedTest: 'chi_square',
    recommendedTestTitle: 'Chi-Square Test of Independence',
    recommendedIv: 'Course_Modality',
    recommendedSecondVar: 'Retention_Status',
    researchQuestion: catModalityRq,
  },

  // 8. Regression
  {
    id: 'lib-reg-housing-valuation',
    categoryKey: 'regression',
    categoryLabel: 'Regression',
    dataset: buildLibraryDataset(
      'lib-reg-housing-valuation',
      'Urban Residential Valuation Drivers',
      'Urban Economics',
      'Multi-predictor OLS regression benchmark (N = 40) modeling residential sale prices ($k) from square footage, transit access, building age, and school quality.',
      [
        { name: 'Property_ID', type: 'id' },
        { name: 'Sale_Price_kUSD', type: 'continuous' },
        { name: 'Living_Area_SqFt', type: 'continuous' },
        { name: 'Transit_Proximity_Score', type: 'continuous' },
        { name: 'Building_Age_Yrs', type: 'continuous' },
        { name: 'School_Rating', type: 'continuous' },
      ],
      regHousingRows,
      regHousingRq
    ),
    statisticalProfile: 'N = 40 · 4 Continuous Regressors · High R² (> .95)',
    diagnosticFocus: 'Tests positive/negative partial slopes (B, β), VIF collinearity, and Durbin-Watson.',
    recommendedTest: 'regression',
    recommendedTestTitle: 'Multiple Linear Regression',
    recommendedDv: 'Sale_Price_kUSD',
    recommendedMultiVars: ['Living_Area_SqFt', 'Transit_Proximity_Score', 'Building_Age_Yrs', 'School_Rating'],
    researchQuestion: regHousingRq,
  },
  {
    id: 'lib-reg-saas-churn',
    categoryKey: 'regression',
    categoryLabel: 'Regression',
    dataset: buildLibraryDataset(
      'lib-reg-saas-churn',
      'SaaS Engagement LTV & Churn Risk Matrix',
      'Product & Revenue Analytics',
      'Multi-predictor commercial dataset (N = 40) supporting both linear Annual LTV regression and binary Retained vs. Churned logistic regression.',
      [
        { name: 'Account_ID', type: 'id' },
        { name: 'Retained_Flag', type: 'categorical' },
        { name: 'Annual_LTV_USD', type: 'continuous' },
        { name: 'Weekly_Active_Days', type: 'continuous' },
        { name: 'Feature_Adoption_Pct', type: 'continuous' },
        { name: 'Seats_Provisioned', type: 'continuous' },
        { name: 'Support_Tickets', type: 'continuous' },
      ],
      regSaasRows,
      regSaasRq
    ),
    statisticalProfile: 'N = 40 · 4 Predictors + Binary Churn Flag',
    diagnosticFocus: 'Demonstrates opposing behavioral drivers (+Active Days / −Support Tickets) & multicollinearity.',
    recommendedTest: 'regression',
    recommendedTestTitle: 'Multiple Linear Regression',
    recommendedDv: 'Annual_LTV_USD',
    recommendedIv: 'Retained_Flag',
    recommendedMultiVars: ['Weekly_Active_Days', 'Feature_Adoption_Pct', 'Seats_Provisioned', 'Support_Tickets'],
    researchQuestion: regSaasRq,
  },

  // 9. Reliability-analysis
  {
    id: 'lib-rel-self-efficacy',
    categoryKey: 'reliability_analysis',
    categoryLabel: 'Reliability-analysis',
    dataset: buildLibraryDataset(
      'lib-rel-self-efficacy',
      '6-Item Academic Self-Efficacy Inventory',
      'Psychometrics & Assessment',
      'Cohesive 1–7 Likert psychometric scale (N = 30, 6 items) engineered to demonstrate high internal consistency (Cronbach’s α ≈ .95).',
      [
        { name: 'Respondent_ID', type: 'id' },
        { name: 'ASE_Item1', type: 'continuous' },
        { name: 'ASE_Item2', type: 'continuous' },
        { name: 'ASE_Item3', type: 'continuous' },
        { name: 'ASE_Item4', type: 'continuous' },
        { name: 'ASE_Item5', type: 'continuous' },
        { name: 'ASE_Item6', type: 'continuous' },
      ],
      relSelfEfficacyRows,
      relSelfEfficacyRq
    ),
    statisticalProfile: 'N = 30 · 6 Likert Items (1–7) · High α Consistency',
    diagnosticFocus: 'Reports raw & standardized Cronbach’s α alongside corrected item-rest correlations.',
    recommendedTest: 'cronbach_alpha',
    recommendedTestTitle: "Cronbach's Alpha Reliability",
    recommendedMultiVars: ['ASE_Item1', 'ASE_Item2', 'ASE_Item3', 'ASE_Item4', 'ASE_Item5', 'ASE_Item6'],
    researchQuestion: relSelfEfficacyRq,
  },
  {
    id: 'lib-rel-ehr-usability',
    categoryKey: 'reliability_analysis',
    categoryLabel: 'Reliability-analysis',
    dataset: buildLibraryDataset(
      'lib-rel-ehr-usability',
      '5-Item Clinical EHR Usability Scale',
      'Clinical Informatics',
      '5-item 1–5 Likert usability inventory (N = 30) where Item 5 exhibits weaker alignment to showcase "Cronbach’s α if Item Deleted" diagnostics.',
      [
        { name: 'Clinician_ID', type: 'id' },
        { name: 'EHR_Item1', type: 'continuous' },
        { name: 'EHR_Item2', type: 'continuous' },
        { name: 'EHR_Item3', type: 'continuous' },
        { name: 'EHR_Item4', type: 'continuous' },
        { name: 'EHR_Item5', type: 'continuous' },
      ],
      relEhrRows,
      relEhrRq
    ),
    statisticalProfile: 'N = 30 · 5 Likert Items (1–5) · Item-Deletion Diagnostic',
    diagnosticFocus: 'Identifies weak/misfitting scale Item 5 where removal improves composite Cronbach’s α.',
    recommendedTest: 'cronbach_alpha',
    recommendedTestTitle: "Cronbach's Alpha Reliability",
    recommendedMultiVars: ['EHR_Item1', 'EHR_Item2', 'EHR_Item3', 'EHR_Item4', 'EHR_Item5'],
    researchQuestion: relEhrRq,
  },
];

export function isTestLibraryDataset(datasetId: string): boolean {
  return PERMANENT_TEST_LIBRARY.some((entry) => entry.dataset.id === datasetId);
}

export function getTestLibraryEntryByDatasetId(datasetId: string): TestLibraryEntry | undefined {
  return PERMANENT_TEST_LIBRARY.find((entry) => entry.dataset.id === datasetId);
}
