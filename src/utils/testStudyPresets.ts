import { StatisticalTestType, ResearchQuestion, Dataset } from '../types/stats';
import { TEST_SPECIFIC_STUDIES, TestSpecificStudyConfig } from '../data/testSpecificDatasets';

export interface TestStudyPreset {
  testKey: StatisticalTestType;
  datasetId: string;
  datasetName: string;
  testTitle: string;
  category: string;
  categoryKey:
    | 'differences_between_groups'
    | 'predicting_scores'
    | 'associations'
    | 'one_sample'
    | 'survival_analysis'
    | 'reliability'
    | 'data_reduction'
    | 'assumptions'
    | 'moderation'
    | 'descriptive';
  isParametric: boolean;
  recommendedChartType: string;
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
  dataset: Dataset;
}

export const TEST_METADATA_MAP: Record<
  StatisticalTestType,
  {
    title: string;
    category: string;
    categoryKey: TestStudyPreset['categoryKey'];
    isParametric: boolean;
    recommendedChart: string;
  }
> = {
  // Differences between groups (27 tests)
  independent_ttest: {
    title: 'Independent-samples t-test',
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: true,
    recommendedChart: 'Simple error bar chart',
  },
  paired_ttest: {
    title: 'Paired-samples t-test',
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: true,
    recommendedChart: 'Simple line graph',
  },
  anova: {
    title: 'One-way ANOVA',
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: true,
    recommendedChart: 'Simple error bar chart',
  },
  repeated_measures_anova: {
    title: 'Repeated measures ANOVA',
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: true,
    recommendedChart: 'Simple line graph',
  },
  two_way_anova: {
    title: 'Two-way ANOVA',
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: true,
    recommendedChart: 'Clustered bar chart',
  },
  three_way_anova: {
    title: 'Factorial (three-way) ANOVA',
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: true,
    recommendedChart: 'Clustered bar chart',
  },
  within_within_anova: {
    title: 'Within-within-subjects ANOVA',
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: true,
    recommendedChart: 'Multiple line graph',
  },
  three_way_repeated_anova: {
    title: 'Three-way repeated measures ANOVA',
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: true,
    recommendedChart: 'Multiple line graph',
  },
  three_way_mixed_anova: {
    title: 'Three-way mixed ANOVA',
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: true,
    recommendedChart: 'Multiple line graph',
  },
  mixed_anova: {
    title: 'Mixed ANOVA',
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: true,
    recommendedChart: 'Multiple line graph',
  },
  hotellings_t2: {
    title: "Hotelling's T²",
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: true,
    recommendedChart: 'Grouped scatterplot',
  },
  one_way_manova: {
    title: 'One-way MANOVA',
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: true,
    recommendedChart: 'Clustered bar chart',
  },
  two_way_manova: {
    title: 'Two-way MANOVA',
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: true,
    recommendedChart: 'Clustered bar chart',
  },
  one_way_mancova: {
    title: 'One-way MANCOVA',
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: true,
    recommendedChart: 'Grouped scatterplot',
  },
  ancova: {
    title: 'One-way ANCOVA',
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: true,
    recommendedChart: 'Grouped scatterplot',
  },
  two_way_ancova: {
    title: 'Two-way ANCOVA',
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: true,
    recommendedChart: 'Clustered boxplot',
  },
  mann_whitney: {
    title: 'Mann-Whitney U test',
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: false,
    recommendedChart: 'Boxplot',
  },
  wilcoxon_signed: {
    title: 'Wilcoxon signed-rank test',
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: false,
    recommendedChart: 'Boxplot',
  },
  kruskal_wallis: {
    title: 'Kruskal-Wallis H test',
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: false,
    recommendedChart: 'Clustered boxplot',
  },
  jonckheere_terpstra: {
    title: 'Jonckheere-Terpstra test',
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: false,
    recommendedChart: 'Boxplot',
  },
  friedman: {
    title: 'Friedman test',
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: false,
    recommendedChart: 'Multiple line graph',
  },
  mcnemar: {
    title: "McNemar's test",
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: false,
    recommendedChart: 'Clustered bar chart',
  },
  cochrans_q: {
    title: "Cochran's Q test",
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: false,
    recommendedChart: 'Multiple line graph',
  },
  sign_test: {
    title: 'Sign test',
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: false,
    recommendedChart: 'Simple dot plot',
  },
  two_proportions_test: {
    title: 'Test of two proportions',
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: false,
    recommendedChart: 'Population pyramid',
  },
  chi_square_homogeneity_2xc: {
    title: 'Chi-square test of homogeneity (2 x C)',
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: false,
    recommendedChart: 'Clustered bar chart',
  },
  chi_square_homogeneity_rx2: {
    title: 'Chi-square test of homogeneity (R x 2)',
    category: 'Differences between groups',
    categoryKey: 'differences_between_groups',
    isParametric: false,
    recommendedChart: 'Clustered bar chart',
  },

  // One sample (2 tests)
  one_sample_ttest: {
    title: 'One-sample t-test',
    category: 'One sample',
    categoryKey: 'one_sample',
    isParametric: true,
    recommendedChart: '1-D boxplot',
  },
  chi_square_gof: {
    title: 'Chi-square goodness-of-fit',
    category: 'One sample',
    categoryKey: 'one_sample',
    isParametric: false,
    recommendedChart: 'Pie chart',
  },

  // Survival analysis (1 test)
  kaplan_meier: {
    title: 'Kaplan-Meier',
    category: 'Survival analysis',
    categoryKey: 'survival_analysis',
    isParametric: false,
    recommendedChart: 'Simple line graph',
  },

  // Reliability (5 tests)
  cronbach_alpha: {
    title: "Cronbach's Alpha",
    category: 'Reliability',
    categoryKey: 'reliability',
    isParametric: true,
    recommendedChart: 'Simple error bar chart',
  },
  cohens_kappa: {
    title: "Cohen's kappa",
    category: 'Reliability',
    categoryKey: 'reliability',
    isParametric: false,
    recommendedChart: 'Clustered bar chart',
  },
  fleiss_kappa: {
    title: "Fleiss' kappa",
    category: 'Reliability',
    categoryKey: 'reliability',
    isParametric: false,
    recommendedChart: 'Clustered bar chart',
  },
  weighted_kappa: {
    title: 'Weighted kappa',
    category: 'Reliability',
    categoryKey: 'reliability',
    isParametric: false,
    recommendedChart: 'Clustered bar chart',
  },
  kendalls_w: {
    title: "Kendall's W",
    category: 'Reliability',
    categoryKey: 'reliability',
    isParametric: false,
    recommendedChart: 'Multiple line graph',
  },

  // Predicting scores (5 tests)
  regression: {
    title: 'Linear regression',
    category: 'Predicting scores',
    categoryKey: 'predicting_scores',
    isParametric: true,
    recommendedChart: 'Simple scatterplot',
  },
  multiple_regression: {
    title: 'Multiple regression',
    category: 'Predicting scores',
    categoryKey: 'predicting_scores',
    isParametric: true,
    recommendedChart: 'Scatterplot matrix',
  },
  hierarchical_regression: {
    title: 'Hierarchical multiple regression',
    category: 'Predicting scores',
    categoryKey: 'predicting_scores',
    isParametric: true,
    recommendedChart: 'Scatterplot matrix',
  },
  logistic_regression: {
    title: 'Logistic regression',
    category: 'Predicting scores',
    categoryKey: 'predicting_scores',
    isParametric: true,
    recommendedChart: 'Simple line graph',
  },
  ordinal_regression: {
    title: 'Ordinal regression',
    category: 'Predicting scores',
    categoryKey: 'predicting_scores',
    isParametric: true,
    recommendedChart: 'Clustered bar chart',
  },

  // Associations (16 tests)
  correlation: {
    title: "Pearson's correlation",
    category: 'Associations',
    categoryKey: 'associations',
    isParametric: true,
    recommendedChart: 'Simple scatterplot',
  },
  point_biserial: {
    title: 'Point-biserial correlation',
    category: 'Associations',
    categoryKey: 'associations',
    isParametric: true,
    recommendedChart: 'Grouped scatterplot',
  },
  partial_correlation: {
    title: "Pearson's partial correlation",
    category: 'Associations',
    categoryKey: 'associations',
    isParametric: true,
    recommendedChart: 'Scatterplot matrix',
  },
  spearman_correlation: {
    title: "Spearman's correlation",
    category: 'Associations',
    categoryKey: 'associations',
    isParametric: false,
    recommendedChart: 'Simple scatterplot',
  },
  kendalls_tau_b: {
    title: "Kendall's τb (tau-b)",
    category: 'Associations',
    categoryKey: 'associations',
    isParametric: false,
    recommendedChart: 'Simple scatterplot',
  },
  gamma_test: {
    title: "Goodman and Kruskal's γ (gamma)",
    category: 'Associations',
    categoryKey: 'associations',
    isParametric: false,
    recommendedChart: 'Clustered bar chart',
  },
  somers_d: {
    title: "Somers' d",
    category: 'Associations',
    categoryKey: 'associations',
    isParametric: false,
    recommendedChart: 'Clustered bar chart',
  },
  mantel_haenszel: {
    title: 'Mantel-Haenszel test of trend',
    category: 'Associations',
    categoryKey: 'associations',
    isParametric: false,
    recommendedChart: 'Simple line graph',
  },
  cochran_armitage: {
    title: 'Cochran-Armitage test of trend',
    category: 'Associations',
    categoryKey: 'associations',
    isParametric: false,
    recommendedChart: 'Simple line graph',
  },
  chi_square_association_2x2: {
    title: 'Chi-square test for association (2x2)',
    category: 'Associations',
    categoryKey: 'associations',
    isParametric: false,
    recommendedChart: 'Clustered bar chart',
  },
  chi_square: {
    title: 'Chi-square test of independence (RxC)',
    category: 'Associations',
    categoryKey: 'associations',
    isParametric: false,
    recommendedChart: 'Simple 3-D bar chart',
  },
  fishers_exact: {
    title: "Fisher's exact test (2x2) for independence",
    category: 'Associations',
    categoryKey: 'associations',
    isParametric: false,
    recommendedChart: 'Clustered bar chart',
  },
  relative_risk: {
    title: 'Relative risk (2 x 2)',
    category: 'Associations',
    categoryKey: 'associations',
    isParametric: false,
    recommendedChart: 'Simple error bar chart',
  },
  odds_ratio: {
    title: 'Odds ratio (2 x 2)',
    category: 'Associations',
    categoryKey: 'associations',
    isParametric: false,
    recommendedChart: 'Simple error bar chart',
  },
  goodman_kruskal_lambda: {
    title: "Goodman and Kruskal's λ (lambda)",
    category: 'Associations',
    categoryKey: 'associations',
    isParametric: false,
    recommendedChart: 'Clustered bar chart',
  },
  loglinear: {
    title: 'Loglinear analysis',
    category: 'Associations',
    categoryKey: 'associations',
    isParametric: false,
    recommendedChart: 'Clustered bar chart',
  },

  // Data reduction (1 test)
  pca: {
    title: 'Principal components analysis',
    category: 'Data reduction',
    categoryKey: 'data_reduction',
    isParametric: true,
    recommendedChart: 'Simple 3-D scatterplot',
  },

  // Assumptions (2 tests)
  normality_test: {
    title: 'Testing for normality',
    category: 'Assumptions',
    categoryKey: 'assumptions',
    isParametric: true,
    recommendedChart: 'Simple histogram',
  },
  data_transformation: {
    title: 'Transforming data',
    category: 'Assumptions',
    categoryKey: 'assumptions',
    isParametric: true,
    recommendedChart: 'Frequency polygon',
  },

  // Moderation (1 test)
  moderation_analysis: {
    title: 'Dichotomous moderator analysis',
    category: 'Moderation',
    categoryKey: 'moderation',
    isParametric: true,
    recommendedChart: 'Grouped scatterplot',
  },

  // Descriptive / Screening
  descriptive: {
    title: 'Descriptive & Distributional Screening',
    category: 'Assumptions',
    categoryKey: 'assumptions',
    isParametric: true,
    recommendedChart: 'Simple histogram',
  },

  // Advanced Modeling (3 tests)
  exploratory_factor_analysis: {
    title: 'Exploratory Factor Analysis (EFA)',
    category: 'Data reduction',
    categoryKey: 'data_reduction',
    isParametric: true,
    recommendedChart: 'Factor Loading Heatmap & Scree Plot',
  },
  confirmatory_factor_analysis: {
    title: 'Confirmatory Factor Analysis (CFA)',
    category: 'Data reduction',
    categoryKey: 'data_reduction',
    isParametric: true,
    recommendedChart: 'Measurement Model Diagram & Factor Loadings',
  },
  structural_equation_modeling: {
    title: 'Structural Equation Modeling (SEM)',
    category: 'Data reduction',
    categoryKey: 'data_reduction',
    isParametric: true,
    recommendedChart: 'Structural Path Diagram & Mediation Models',
  },
};

export const TEST_STUDY_PRESETS: Record<StatisticalTestType, TestStudyPreset> = (
  typeof TEST_SPECIFIC_STUDIES === 'object' && TEST_SPECIFIC_STUDIES
    ? (Object.keys(TEST_SPECIFIC_STUDIES) as StatisticalTestType[]).reduce((acc, testKey) => {
        const config = TEST_SPECIFIC_STUDIES[testKey];
        if (!config || !config.dataset) return acc;
        const meta = TEST_METADATA_MAP[testKey] || {
          title: config.dataset.name,
          category: 'Statistical Analysis',
          categoryKey: 'differences_between_groups' as const,
          isParametric: true,
          recommendedChart: 'Bar chart',
        };

        const datasetWithRq: Dataset = {
          ...config.dataset,
          researchQuestions: [config.researchQuestion],
        };

        acc[testKey] = {
          testKey,
          datasetId: config.dataset.id,
          datasetName: config.dataset.name,
          testTitle: meta.title,
          category: meta.category,
          categoryKey: meta.categoryKey,
          isParametric: meta.isParametric,
          recommendedChartType: meta.recommendedChart,
          recommendedDv: config.recommendedDv,
          recommendedIv: config.recommendedIv,
          recommendedGroup1: config.recommendedGroup1,
          recommendedGroup2: config.recommendedGroup2,
          recommendedSecondVar: config.recommendedSecondVar,
          recommendedMultiVars: config.recommendedMultiVars,
          recommendedFactorB: config.recommendedFactorB,
          recommendedCovariate: config.recommendedCovariate,
          recommendedTestValue: config.recommendedTestValue,
          correlationMethod: config.correlationMethod,
          alphaLevel: config.alphaLevel,
          researchQuestion: config.researchQuestion,
          explanation: config.explanation,
          dataset: datasetWithRq,
        };
        return acc;
      }, {} as Record<StatisticalTestType, TestStudyPreset>)
    : ({} as Record<StatisticalTestType, TestStudyPreset>)
);

export const isPresetStudyDataset = (datasetId: string): boolean => {
  if (typeof TEST_SPECIFIC_STUDIES !== 'undefined' && TEST_SPECIFIC_STUDIES) {
    return Object.values(TEST_SPECIFIC_STUDIES).some((s) => s?.dataset?.id === datasetId);
  }
  return false;
};

export { TEST_SPECIFIC_STUDIES };
