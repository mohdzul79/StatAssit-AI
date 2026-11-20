import { StatisticalTestType } from '../types/stats';

export type RecommendedChartId =
  | 'histogram'
  | 'boxplot'
  | 'scatterplot'
  | 'bar_chart'
  | 'line_graph'
  | 'pie_chart'
  | 'heatmap'
  | 'qq_plot'
  | 'residual_plot'
  | 'error_bar_chart';

export interface RecommendedChartSpec {
  id: RecommendedChartId;
  chart: string;
  application: string;
}

export const RECOMMENDED_CHARTS_CATALOG: RecommendedChartSpec[] = [
  { id: 'histogram', chart: 'Histogram', application: 'Distribution' },
  { id: 'boxplot', chart: 'Boxplot', application: 'Outlier detection' },
  { id: 'scatterplot', chart: 'Scatterplot', application: 'Correlation' },
  { id: 'bar_chart', chart: 'Bar chart', application: 'Frequency and comparison' },
  { id: 'line_graph', chart: 'Line graph', application: 'Trends' },
  { id: 'pie_chart', chart: 'Pie chart', application: 'Categorical proportions' },
  { id: 'heatmap', chart: 'Heatmap', application: 'Correlation matrix' },
  { id: 'qq_plot', chart: 'Q–Q plot', application: 'Normality assessment' },
  { id: 'residual_plot', chart: 'Residual plot', application: 'Regression diagnostics' },
  { id: 'error_bar_chart', chart: 'Error bar chart', application: 'Mean comparisons' },
];

export interface TestChartRecommendation {
  primaryIds: RecommendedChartId[];
  diagnosticIds: RecommendedChartId[];
  primary: RecommendedChartSpec[];
  diagnostic: RecommendedChartSpec[];
  suitableSet: Set<RecommendedChartId>;
  rationale: string;
}

const CHART_MAP = new Map<RecommendedChartId, RecommendedChartSpec>(
  RECOMMENDED_CHARTS_CATALOG.map((c) => [c.id, c])
);

const TEST_CHART_MAPPING: Record<
  StatisticalTestType,
  { primaryIds: RecommendedChartId[]; diagnosticIds: RecommendedChartId[]; rationale: string }
> = {
  // Parametric between-group mean comparisons
  independent_ttest: {
    primaryIds: ['error_bar_chart', 'bar_chart'],
    diagnosticIds: ['boxplot', 'qq_plot', 'histogram'],
    rationale: 'Error bar & bar charts highlight mean differences with SE/CI; boxplot & Q–Q plot verify outliers and normality.',
  },
  one_sample_ttest: {
    primaryIds: ['error_bar_chart', 'histogram'],
    diagnosticIds: ['boxplot', 'qq_plot'],
    rationale: 'Error bar chart compares the sample mean against μ₀ while histogram & Q–Q plot audit univariate normality.',
  },
  anova: {
    primaryIds: ['error_bar_chart', 'bar_chart'],
    diagnosticIds: ['boxplot', 'qq_plot', 'histogram'],
    rationale: 'Error bar charts compare 3+ group means with 95% CIs; boxplots inspect variance spread and group outliers.',
  },
  two_way_anova: {
    primaryIds: ['error_bar_chart', 'line_graph', 'bar_chart'],
    diagnosticIds: ['boxplot', 'qq_plot'],
    rationale: 'Error bar and profile line graphs expose Factor A × Factor B interactions alongside cell variance boxplots.',
  },
  three_way_anova: {
    primaryIds: ['error_bar_chart', 'line_graph', 'bar_chart'],
    diagnosticIds: ['boxplot', 'qq_plot'],
    rationale: 'Multi-factor interaction trends are clearest via profile line & error bar charts supported by residual Q–Q checks.',
  },
  ancova: {
    primaryIds: ['error_bar_chart', 'scatterplot'],
    diagnosticIds: ['residual_plot', 'qq_plot'],
    rationale: 'Error bars show covariate-adjusted means while scatterplots and residual plots check slope homogeneity.',
  },
  two_way_ancova: {
    primaryIds: ['error_bar_chart', 'scatterplot'],
    diagnosticIds: ['residual_plot', 'qq_plot'],
    rationale: 'Adjusted cell means pair with covariate scatterplots and residual diagnostics.',
  },
  hotellings_t2: {
    primaryIds: ['error_bar_chart', 'bar_chart'],
    diagnosticIds: ['heatmap', 'boxplot', 'qq_plot'],
    rationale: 'Compare multivariate group centroids alongside an inter-DV correlation heatmap and outlier boxplots.',
  },
  one_way_manova: {
    primaryIds: ['error_bar_chart', 'bar_chart'],
    diagnosticIds: ['heatmap', 'boxplot', 'qq_plot'],
    rationale: 'Multivariate group comparisons pair mean error bars across DVs with an outcome correlation heatmap.',
  },
  two_way_manova: {
    primaryIds: ['error_bar_chart', 'bar_chart'],
    diagnosticIds: ['heatmap', 'boxplot', 'qq_plot'],
    rationale: 'Displays factorial mean profiles across multiple DVs alongside covariance heatmaps and outlier checks.',
  },
  one_way_mancova: {
    primaryIds: ['error_bar_chart', 'scatterplot'],
    diagnosticIds: ['heatmap', 'residual_plot', 'qq_plot'],
    rationale: 'Illustrates adjusted multivariate centroids with covariate scatterplots and residual checks.',
  },

  // Repeated measures & longitudinal trends
  paired_ttest: {
    primaryIds: ['line_graph', 'error_bar_chart'],
    diagnosticIds: ['boxplot', 'qq_plot', 'histogram'],
    rationale: 'Line graphs capture pre-to-post directional change while Q–Q plots verify normality of difference scores.',
  },
  repeated_measures_anova: {
    primaryIds: ['line_graph', 'error_bar_chart'],
    diagnosticIds: ['boxplot', 'qq_plot'],
    rationale: 'Line graphs track longitudinal trajectories across timepoints with ±SE/95% CI error bars.',
  },
  within_within_anova: {
    primaryIds: ['line_graph', 'error_bar_chart'],
    diagnosticIds: ['boxplot', 'qq_plot'],
    rationale: 'Profile line graphs display crossed within-subject condition × time trajectories.',
  },
  three_way_repeated_anova: {
    primaryIds: ['line_graph', 'error_bar_chart'],
    diagnosticIds: ['boxplot', 'qq_plot'],
    rationale: 'Line graphs clarify multi-factor repeated trajectories across measurement occasions.',
  },
  three_way_mixed_anova: {
    primaryIds: ['line_graph', 'error_bar_chart'],
    diagnosticIds: ['boxplot', 'qq_plot'],
    rationale: 'Multi-line trend graphs distinguish between-subject cohort trajectories over repeated timepoints.',
  },
  mixed_anova: {
    primaryIds: ['line_graph', 'error_bar_chart'],
    diagnosticIds: ['boxplot', 'qq_plot'],
    rationale: 'Line graphs immediately reveal group × time divergence alongside group error bars.',
  },
  kaplan_meier: {
    primaryIds: ['line_graph'],
    diagnosticIds: ['bar_chart', 'histogram'],
    rationale: 'Stepwise line graphs depict survival/retention curves across observation intervals.',
  },

  // Non-parametric group comparisons
  mann_whitney: {
    primaryIds: ['boxplot', 'histogram'],
    diagnosticIds: ['bar_chart', 'qq_plot'],
    rationale: 'Boxplots highlight medians, IQRs, and outliers without assuming normality; histograms compare group shapes.',
  },
  wilcoxon_signed: {
    primaryIds: ['boxplot', 'line_graph'],
    diagnosticIds: ['histogram', 'qq_plot'],
    rationale: 'Paired boxplots and trend lines show median shifts across matched observations.',
  },
  kruskal_wallis: {
    primaryIds: ['boxplot', 'bar_chart'],
    diagnosticIds: ['histogram', 'qq_plot'],
    rationale: 'Side-by-side boxplots display group medians, IQRs, and extreme ranks across 3+ groups.',
  },
  jonckheere_terpstra: {
    primaryIds: ['boxplot', 'line_graph'],
    diagnosticIds: ['histogram'],
    rationale: 'Ordered group boxplots and trend lines reveal monotonic shifts across ordered factor levels.',
  },
  friedman: {
    primaryIds: ['boxplot', 'line_graph'],
    diagnosticIds: ['bar_chart'],
    rationale: 'Compare repeated rank medians and condition trajectories via boxplots and trend lines.',
  },
  sign_test: {
    primaryIds: ['bar_chart', 'boxplot'],
    diagnosticIds: ['histogram'],
    rationale: 'Bar charts compare positive/negative difference counts paired with median boxplots.',
  },

  // Associations & correlations
  correlation: {
    primaryIds: ['scatterplot', 'heatmap'],
    diagnosticIds: ['qq_plot', 'histogram'],
    rationale: 'Scatterplots reveal linear direction/outliers while heatmaps summarize multi-variable correlation matrices.',
  },
  point_biserial: {
    primaryIds: ['scatterplot', 'boxplot'],
    diagnosticIds: ['error_bar_chart', 'qq_plot'],
    rationale: 'Scatterplots and boxplots illustrate continuous score separation across the binary variable.',
  },
  partial_correlation: {
    primaryIds: ['scatterplot', 'heatmap'],
    diagnosticIds: ['residual_plot', 'qq_plot'],
    rationale: 'Scatterplots of adjusted residuals and correlation heatmaps capture covariate-controlled associations.',
  },
  spearman_correlation: {
    primaryIds: ['scatterplot', 'heatmap'],
    diagnosticIds: ['boxplot', 'histogram'],
    rationale: 'Scatterplots uncover monotonic trends and bivariate outliers; heatmaps map rank-order matrices.',
  },
  kendalls_tau_b: {
    primaryIds: ['scatterplot', 'heatmap'],
    diagnosticIds: ['bar_chart'],
    rationale: 'Scatterplots and correlation heatmaps visualize ordinal concordance patterns.',
  },
  gamma_test: {
    primaryIds: ['bar_chart', 'heatmap'],
    diagnosticIds: ['pie_chart'],
    rationale: 'Clustered bar charts and heatmaps highlight ordinal cross-tabulation cell concentration.',
  },
  somers_d: {
    primaryIds: ['bar_chart', 'heatmap'],
    diagnosticIds: ['scatterplot'],
    rationale: 'Visualize directional ordinal association strength using clustered bar charts and matrices.',
  },

  // Predictive modeling & regression
  regression: {
    primaryIds: ['residual_plot', 'scatterplot'],
    diagnosticIds: ['qq_plot', 'histogram'],
    rationale: 'Scatterplots visualize predictor-outcome fit while residual plots & Q–Q plots validate linearity and homoscedasticity.',
  },
  multiple_regression: {
    primaryIds: ['residual_plot', 'scatterplot'],
    diagnosticIds: ['qq_plot', 'histogram', 'heatmap'],
    rationale: 'Residual plots audit homoscedasticity & leverage; heatmaps check predictor multicollinearity.',
  },
  hierarchical_regression: {
    primaryIds: ['residual_plot', 'bar_chart'],
    diagnosticIds: ['qq_plot', 'scatterplot', 'histogram'],
    rationale: 'Compare ΔR² model blocks with bar charts and verify each block via residual and Q–Q diagnostics.',
  },
  logistic_regression: {
    primaryIds: ['residual_plot', 'bar_chart'],
    diagnosticIds: ['scatterplot', 'pie_chart'],
    rationale: 'Bar charts display predictor Odds Ratios Exp(B) paired with deviance residual plots.',
  },
  ordinal_regression: {
    primaryIds: ['bar_chart', 'residual_plot'],
    diagnosticIds: ['pie_chart'],
    rationale: 'Compare ordered category probabilities and predictor thresholds via bar and residual plots.',
  },
  moderation_analysis: {
    primaryIds: ['scatterplot', 'line_graph'],
    diagnosticIds: ['residual_plot', 'qq_plot'],
    rationale: 'Interaction slopes across moderator levels show cleanly on scatter/line plots backed by residual diagnostics.',
  },

  // Categorical frequencies & proportions
  two_proportions_test: {
    primaryIds: ['bar_chart', 'pie_chart'],
    diagnosticIds: ['heatmap'],
    rationale: 'Compare cohort percentages using bar charts and proportional pie charts.',
  },
  chi_square_homogeneity_2xc: {
    primaryIds: ['bar_chart', 'pie_chart'],
    diagnosticIds: ['heatmap'],
    rationale: 'Compare category proportions across populations with grouped bar charts and proportional pies.',
  },
  chi_square_homogeneity_rx2: {
    primaryIds: ['bar_chart', 'pie_chart'],
    diagnosticIds: ['heatmap'],
    rationale: 'Grouped bar charts and proportional charts highlight row-by-column frequency shifts.',
  },
  chi_square: {
    primaryIds: ['bar_chart', 'pie_chart'],
    diagnosticIds: ['heatmap'],
    rationale: 'Bar charts compare observed vs. expected frequencies while pie charts show categorical proportions.',
  },
  chi_square_association_2x2: {
    primaryIds: ['bar_chart', 'pie_chart'],
    diagnosticIds: ['heatmap'],
    rationale: 'Grouped frequency bar charts and 2×2 cell heatmaps visualize contingency associations.',
  },
  chi_square_gof: {
    primaryIds: ['pie_chart', 'bar_chart'],
    diagnosticIds: ['histogram'],
    rationale: 'Pie charts depict observed category shares alongside observed-vs-expected frequency bars.',
  },
  fishers_exact: {
    primaryIds: ['bar_chart', 'pie_chart'],
    diagnosticIds: ['heatmap'],
    rationale: 'Illustrate exact 2×2 cell frequency disparities with bar and proportional charts.',
  },
  mcnemar: {
    primaryIds: ['bar_chart', 'pie_chart'],
    diagnosticIds: ['line_graph'],
    rationale: 'Compare paired pre/post discordant proportions via clustered bar and proportion charts.',
  },
  cochrans_q: {
    primaryIds: ['bar_chart', 'line_graph'],
    diagnosticIds: ['pie_chart'],
    rationale: 'Track binary response proportions across 3+ repeated conditions using bar and trend lines.',
  },
  relative_risk: {
    primaryIds: ['bar_chart', 'error_bar_chart'],
    diagnosticIds: ['pie_chart'],
    rationale: 'Bar and error-bar charts depict exposure risk proportions and 95% confidence bounds.',
  },
  odds_ratio: {
    primaryIds: ['bar_chart', 'error_bar_chart'],
    diagnosticIds: ['pie_chart'],
    rationale: 'Bar and CI error-bar charts contrast outcome odds between exposed and unexposed cohorts.',
  },
  mantel_haenszel: {
    primaryIds: ['bar_chart', 'error_bar_chart'],
    diagnosticIds: ['heatmap'],
    rationale: 'Compare stratified odds estimates across confounding strata with grouped bar and CI charts.',
  },
  cochran_armitage: {
    primaryIds: ['line_graph', 'bar_chart'],
    diagnosticIds: ['pie_chart'],
    rationale: 'Line graphs highlight monotonic proportion trends across ordered exposure levels.',
  },
  goodman_kruskal_lambda: {
    primaryIds: ['bar_chart', 'pie_chart'],
    diagnosticIds: ['heatmap'],
    rationale: 'Show nominal category prediction distributions using grouped bar and proportion charts.',
  },
  loglinear: {
    primaryIds: ['bar_chart', 'heatmap'],
    diagnosticIds: ['residual_plot'],
    rationale: 'Heatmaps and multi-way bar charts reveal higher-order categorical cell interactions.',
  },

  // Reliability, factor analysis, PCA & SEM
  cronbach_alpha: {
    primaryIds: ['heatmap', 'bar_chart'],
    diagnosticIds: ['histogram', 'qq_plot'],
    rationale: 'Inter-item correlation heatmaps verify internal consistency alongside item-total bar charts.',
  },
  cohens_kappa: {
    primaryIds: ['heatmap', 'bar_chart'],
    diagnosticIds: ['pie_chart'],
    rationale: 'Confusion/agreement heatmaps display rater concordance vs. off-diagonal disagreement.',
  },
  fleiss_kappa: {
    primaryIds: ['bar_chart', 'heatmap'],
    diagnosticIds: ['pie_chart'],
    rationale: 'Summarize multi-rater category agreement proportions using bar charts and concordance heatmaps.',
  },
  weighted_kappa: {
    primaryIds: ['heatmap', 'bar_chart'],
    diagnosticIds: ['scatterplot'],
    rationale: 'Agreement heatmaps illustrate exact and adjacent ordinal rater concordance weights.',
  },
  kendalls_w: {
    primaryIds: ['bar_chart', 'boxplot'],
    diagnosticIds: ['heatmap'],
    rationale: 'Rank bar charts and boxplots reflect rater rank concordance across items.',
  },
  pca: {
    primaryIds: ['line_graph', 'heatmap', 'scatterplot'],
    diagnosticIds: ['bar_chart'],
    rationale: 'Scree line graphs (eigenvalues), loading heatmaps, and component score scatterplots visualize dimensionality reduction.',
  },
  exploratory_factor_analysis: {
    primaryIds: ['line_graph', 'heatmap'],
    diagnosticIds: ['bar_chart', 'qq_plot'],
    rationale: 'Scree line graphs determine factor retention while factor-loading heatmaps verify simple structure.',
  },
  confirmatory_factor_analysis: {
    primaryIds: ['bar_chart', 'heatmap'],
    diagnosticIds: ['residual_plot', 'qq_plot'],
    rationale: 'Standardized factor loadings (bar chart), latent covariance heatmaps, and residual diagnostics evaluate measurement fit.',
  },
  structural_equation_modeling: {
    primaryIds: ['bar_chart', 'heatmap', 'residual_plot'],
    diagnosticIds: ['qq_plot'],
    rationale: 'Path β bar comparisons, latent correlation heatmaps, and normalized residual plots audit structural fit.',
  },

  // Descriptive & Assumption Screening
  normality_test: {
    primaryIds: ['qq_plot', 'histogram'],
    diagnosticIds: ['boxplot'],
    rationale: 'Q–Q plots assess quantile alignment against normality while histograms & boxplots reveal skew and outliers.',
  },
  data_transformation: {
    primaryIds: ['histogram', 'qq_plot'],
    diagnosticIds: ['boxplot'],
    rationale: 'Before/after histograms and Q–Q plots confirm skewness reduction following log or square-root transforms.',
  },
  descriptive: {
    primaryIds: ['histogram', 'boxplot', 'bar_chart'],
    diagnosticIds: ['qq_plot', 'pie_chart'],
    rationale: 'Histograms profile distributions, boxplots detect outliers, and bar/pie charts summarize group frequencies.',
  },
};

export function getRecommendedChartsForTest(testId: StatisticalTestType): TestChartRecommendation {
  const entry = TEST_CHART_MAPPING[testId] || {
    primaryIds: ['bar_chart', 'error_bar_chart'] as RecommendedChartId[],
    diagnosticIds: ['boxplot', 'qq_plot', 'histogram'] as RecommendedChartId[],
    rationale: 'Matched primary visualization paired with standard distributional and normality diagnostic charts.',
  };

  const primary = entry.primaryIds
    .map((id) => CHART_MAP.get(id))
    .filter((c): c is RecommendedChartSpec => Boolean(c));
  const diagnostic = entry.diagnosticIds
    .map((id) => CHART_MAP.get(id))
    .filter((c): c is RecommendedChartSpec => Boolean(c));
  const suitableSet = new Set<RecommendedChartId>([...entry.primaryIds, ...entry.diagnosticIds]);

  return {
    primaryIds: entry.primaryIds,
    diagnosticIds: entry.diagnosticIds,
    primary,
    diagnostic,
    suitableSet,
    rationale: entry.rationale,
  };
}
