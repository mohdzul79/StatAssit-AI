import React, { useMemo, useRef, useState } from 'react';
import {
  X,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  FileText,
  Maximize2,
  BookOpen,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import {
  StatisticalResult,
  Dataset,
  ResearchQuestion,
  ApaSynthesisResponse,
} from '../types/stats';
import { generateApaNarrative, generateApaTable } from '../utils/apaFormatter';
import { evaluateHypothesisDecision, extractPValue } from '../utils/hypothesisHelper';
import { computeDiagnosticAudit } from '../utils/diagnosticCalculator';

interface SinglePagePdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: StatisticalResult;
  dataset?: Dataset;
  activeResearchQuestion?: ResearchQuestion | null;
  alphaLevel?: number;
  researchQuestionText: string;
  userNotes?: string;
  synthesisData: ApaSynthesisResponse;
}

interface ChartBarItem {
  label: string;
  value: number;
  sublabel?: string;
  error?: number;
}

function getDesignLabel(result: StatisticalResult): {
  designType: string;
  analysisMethod: string;
  variablesSummary: string;
  sampleN: string;
} {
  switch (result.type) {
    case 'independent_ttest':
      return {
        designType: 'Quantitative Between-Subjects Comparative Design',
        analysisMethod: 'Independent-Samples t-Test (with Levene variance audit and Welch robustness check)',
        variablesSummary: `Dependent Variable (DV): ${result.dependentVar} (Continuous); Independent Variable (IV): ${result.groupVar} (${result.group1.name} vs. ${result.group2.name})`,
        sampleN: `${result.group1.n + result.group2.n} (${result.group1.name}: n = ${result.group1.n}; ${result.group2.name}: n = ${result.group2.n})`,
      };
    case 'paired_ttest':
      return {
        designType: 'Quantitative Within-Subjects Pre–Post Design',
        analysisMethod: 'Paired-Samples t-Test with repeated-observation correlation check',
        variablesSummary: `Paired Measures: ${result.var1} vs. ${result.var2}`,
        sampleN: `${result.n} matched pairs`,
      };
    case 'one_sample_ttest':
      return {
        designType: 'Quantitative Single-Cohort Benchmark Design',
        analysisMethod: `One-Sample t-Test evaluated against test criterion μ₀ = ${result.testValue}`,
        variablesSummary: `Target Variable: ${result.variable}`,
        sampleN: `${result.n}`,
      };
    case 'anova':
      return {
        designType: 'Quantitative Multi-Group Comparative Design',
        analysisMethod: 'One-Way Between-Subjects ANOVA with Tukey HSD post-hoc contrasts',
        variablesSummary: `DV: ${result.dependentVar}; Factor: ${result.factorVar} (${result.groups.length} levels)`,
        sampleN: `${result.groups.reduce((s, g) => s + g.n, 0)} across ${result.groups.length} groups`,
      };
    case 'two_way_anova':
      return {
        designType: 'Quantitative 2-Factor Factorial Experimental Design',
        analysisMethod: 'Two-Way Factorial ANOVA testing main effects and A × B interaction',
        variablesSummary: `DV: ${result.dependentVar}; Factors: ${result.factorA} × ${result.factorB}`,
        sampleN: `${result.totalDf + 1}`,
      };
    case 'repeated_measures_anova':
      return {
        designType: 'Quantitative Longitudinal / Repeated-Measures Design',
        analysisMethod: 'One-Way Repeated-Measures ANOVA with Mauchly sphericity check',
        variablesSummary: `Within-Subject Levels: ${result.variables.join(', ')}`,
        sampleN: `${result.n} participants (${result.k} timepoints)`,
      };
    case 'ancova':
      return {
        designType: 'Quantitative Quasi-Experimental Covariate-Adjusted Design',
        analysisMethod: `One-Way ANCOVA controlling for ${result.covariateVar}`,
        variablesSummary: `DV: ${result.dependentVar}; IV: ${result.groupVar}; Covariate: ${result.covariateVar}`,
        sampleN: `${result.groups.reduce((s, g) => s + g.n, 0)}`,
      };
    case 'mann_whitney':
      return {
        designType: 'Non-Parametric Independent-Groups Rank Design',
        analysisMethod: 'Mann-Whitney U Rank-Sum Test with rank-biserial effect size',
        variablesSummary: `DV: ${result.dependentVar}; Group Factor: ${result.groupVar}`,
        sampleN: `${result.group1.n + result.group2.n}`,
      };
    case 'wilcoxon_signed':
      return {
        designType: 'Non-Parametric Paired-Rank Repeated Design',
        analysisMethod: 'Wilcoxon Signed-Rank Test',
        variablesSummary: `Paired Variables: ${result.var1} vs. ${result.var2}`,
        sampleN: `${result.nTotal}`,
      };
    case 'kruskal_wallis':
      return {
        designType: 'Non-Parametric Multi-Group Rank Design',
        analysisMethod: 'Kruskal-Wallis H Test with epsilon-squared (ε²) effect magnitude',
        variablesSummary: `DV: ${result.dependentVar}; Factor: ${result.groupVar}`,
        sampleN: `${result.totalN}`,
      };
    case 'friedman':
      return {
        designType: 'Non-Parametric Multi-Condition Rank Design',
        analysisMethod: "Friedman Two-Way ANOVA by Ranks with Kendall's W",
        variablesSummary: `Repeated Conditions: ${result.variables.join(', ')}`,
        sampleN: `${result.n}`,
      };
    case 'regression':
      return {
        designType: 'Quantitative Predictive Regression Design',
        analysisMethod: 'Multiple Linear Regression (OLS) with collinearity (VIF) & Durbin-Watson checks',
        variablesSummary: `Criterion (DV): ${result.dependentVar}; Predictors: ${result.independentVars.join(', ')}`,
        sampleN: `${result.n}`,
      };
    case 'logistic_regression':
      return {
        designType: 'Quantitative Binary Classification / Odds Modeling Design',
        analysisMethod: 'Binary Logistic Regression estimating Odds Ratios Exp(B) & Nagelkerke R²',
        variablesSummary: `Binary DV: ${result.dependentVar} (${result.eventCategory}); Predictors: ${result.independentVars.join(', ')}`,
        sampleN: `${result.n}`,
      };
    case 'correlation':
      return {
        designType: 'Quantitative Bivariate Associational Design',
        analysisMethod: `${result.method === 'spearman' ? 'Spearman Rank (ρ)' : 'Pearson Product-Moment (r)'} Correlation Matrix`,
        variablesSummary: `Variables: ${result.variables.join(', ')}`,
        sampleN: `${result.matrix[0]?.n ?? 'N/A'}`,
      };
    case 'cronbach_alpha':
      return {
        designType: 'Psychometric Internal Consistency Reliability Design',
        analysisMethod: "Cronbach's Alpha (α) & Corrected Item-Total Correlation Analysis",
        variablesSummary: `Scale Items (${result.itemCount}): ${result.items.slice(0, 6).join(', ')}${result.items.length > 6 ? '...' : ''}`,
        sampleN: `${result.n}`,
      };
    case 'chi_square':
      return {
        designType: 'Categorical Contingency Association Design',
        analysisMethod: "Pearson Chi-Square (χ²) Test of Independence with Cramér's V",
        variablesSummary: `Cross-Tabulation: ${result.rowVar} × ${result.colVar}`,
        sampleN: `${result.n}`,
      };
    case 'chi_square_gof':
      return {
        designType: 'Categorical Goodness-of-Fit Distribution Design',
        analysisMethod: 'Chi-Square (χ²) Goodness-of-Fit Test',
        variablesSummary: `Categorical Variable: ${result.variable}`,
        sampleN: `${result.n}`,
      };
    case 'exploratory_factor_analysis':
      return {
        designType: 'Psychometric Exploratory Latent Structure Design',
        analysisMethod: `Exploratory Factor Analysis (${result.extractionMethod}, ${result.rotationMethod})`,
        variablesSummary: `Observed Indicators (${result.variables.length}): ${result.variables.slice(0, 6).join(', ')}`,
        sampleN: `${result.sampleSize}`,
      };
    case 'confirmatory_factor_analysis':
      return {
        designType: 'Measurement Model Structural Validation Design',
        analysisMethod: 'Confirmatory Factor Analysis (CFA) evaluating CFI, TLI, RMSEA, SRMR & AVE',
        variablesSummary: `Latent Constructs (${result.latentFactors.length}): ${result.latentFactors.map((f) => f.name).join(', ')}`,
        sampleN: `${result.sampleSize}`,
      };
    case 'structural_equation_modeling':
      return {
        designType: 'Latent Structural Equation Path Modeling (SEM) Design',
        analysisMethod: 'Structural Equation Modeling (SEM) testing direct/indirect paths & model fit',
        variablesSummary: `Exogenous: ${result.exogenousVars.join(', ')} → Endogenous: ${result.endogenousVars.join(', ')}`,
        sampleN: `${result.sampleSize}`,
      };
    case 'descriptive':
      return {
        designType: 'Quantitative Exploratory Descriptive Screening Design',
        analysisMethod: 'Parametric & Distributional Descriptive Profiling (M, SD, Mdn, Skew, Kurtosis)',
        variablesSummary: `Variables: ${result.items.map((i) => i.variable).join(', ')}`,
        sampleN: `${result.items[0]?.n ?? 'N/A'}`,
      };
    default:
      return {
        designType: 'Quantitative Empirical Statistical Design',
        analysisMethod: 'testTitle' in result ? result.testTitle : 'Inferential Quantitative Procedure',
        variablesSummary: 'Empirical quantitative dataset variables',
        sampleN: 'sampleSize' in result ? String(result.sampleSize) : 'N/A',
      };
  }
}

function buildEmpiricalChartData(result: StatisticalResult): {
  title: string;
  yLabel: string;
  items: ChartBarItem[];
} {
  switch (result.type) {
    case 'independent_ttest':
      return {
        title: `Group Means ± SE (${result.dependentVar})`,
        yLabel: result.dependentVar,
        items: [
          { label: result.group1.name, value: result.group1.mean, error: result.group1.se, sublabel: `n=${result.group1.n}` },
          { label: result.group2.name, value: result.group2.mean, error: result.group2.se, sublabel: `n=${result.group2.n}` },
        ],
      };
    case 'paired_ttest':
      return {
        title: 'Paired Means Comparison',
        yLabel: 'Mean Score',
        items: [
          { label: result.var1, value: result.mean1, error: result.sd1 / Math.sqrt(Math.max(1, result.n)) },
          { label: result.var2, value: result.mean2, error: result.sd2 / Math.sqrt(Math.max(1, result.n)) },
        ],
      };
    case 'one_sample_ttest':
      return {
        title: `${result.variable} vs. Benchmark`,
        yLabel: 'Value',
        items: [
          { label: 'Sample M', value: result.mean, error: result.se },
          { label: 'Test μ₀', value: result.testValue },
        ],
      };
    case 'anova':
      return {
        title: `Group Means ± SE (${result.dependentVar})`,
        yLabel: result.dependentVar,
        items: result.groups.slice(0, 6).map((g) => ({
          label: g.name,
          value: g.mean,
          error: g.se,
        })),
      };
    case 'repeated_measures_anova':
      return {
        title: 'Within-Subject Trajectory',
        yLabel: 'Mean',
        items: result.timepoints.slice(0, 6).map((tp) => ({
          label: tp.name,
          value: tp.mean,
          error: tp.se,
        })),
      };
    case 'ancova':
      return {
        title: `Adjusted Means (${result.dependentVar})`,
        yLabel: 'Adj. Mean',
        items: result.groups.slice(0, 6).map((g) => ({
          label: g.name,
          value: g.adjustedMean,
          error: g.se,
        })),
      };
    case 'two_way_anova':
      return {
        title: `Cell Means (${result.dependentVar})`,
        yLabel: 'Mean',
        items: result.cellStats.slice(0, 6).map((c) => ({
          label: `${c.factorA}/${c.factorB}`,
          value: c.mean,
          error: c.sd / Math.sqrt(Math.max(1, c.n)),
        })),
      };
    case 'mann_whitney':
      return {
        title: `Median Comparison (${result.dependentVar})`,
        yLabel: 'Median',
        items: [
          { label: result.group1.name, value: result.group1.median },
          { label: result.group2.name, value: result.group2.median },
        ],
      };
    case 'wilcoxon_signed':
      return {
        title: 'Paired Medians',
        yLabel: 'Median',
        items: [
          { label: result.var1, value: result.median1 },
          { label: result.var2, value: result.median2 },
        ],
      };
    case 'kruskal_wallis':
      return {
        title: `Mean Ranks (${result.dependentVar})`,
        yLabel: 'Mean Rank',
        items: result.groups.slice(0, 6).map((g) => ({ label: g.name, value: g.meanRank })),
      };
    case 'friedman':
      return {
        title: 'Condition Mean Ranks',
        yLabel: 'Mean Rank',
        items: result.conditions.slice(0, 6).map((c) => ({ label: c.name, value: c.meanRank })),
      };
    case 'regression':
      return {
        title: `Standardized Effects |β| (R²=${(result.rSquared * 100).toFixed(0)}%)`,
        yLabel: '|β|',
        items: result.coefficients
          .filter((c) => c.variable.toLowerCase() !== 'intercept' && c.variable !== '(Intercept)')
          .slice(0, 6)
          .map((c) => ({ label: c.variable, value: Math.abs(c.beta) })),
      };
    case 'logistic_regression':
      return {
        title: 'Predictor Odds Ratios Exp(B)',
        yLabel: 'OR',
        items: result.coefficients
          .filter((c) => c.variable.toLowerCase() !== 'intercept' && c.variable !== '(Intercept)')
          .slice(0, 6)
          .map((c) => ({ label: c.variable, value: c.oddsRatio })),
      };
    case 'correlation':
      return {
        title: 'Top Pairwise |r| Magnitudes',
        yLabel: '|r|',
        items: result.matrix
          .filter((c) => c.var1 !== c.var2)
          .slice(0, 6)
          .map((c) => ({ label: `${c.var1.slice(0, 5)}×${c.var2.slice(0, 5)}`, value: Math.abs(c.r) })),
      };
    case 'cronbach_alpha':
      return {
        title: `Item-Rest Correlations (α=${result.rawAlpha.toFixed(2)})`,
        yLabel: 'r',
        items: result.itemStats.slice(0, 6).map((i) => ({ label: i.item, value: i.itemRestCorrelation })),
      };
    case 'chi_square':
      return {
        title: 'Observed Cell Frequencies',
        yLabel: 'Count',
        items: result.cells.slice(0, 6).map((c) => ({
          label: `${c.rowValue.slice(0, 5)}/${c.colValue.slice(0, 5)}`,
          value: c.observed,
        })),
      };
    case 'chi_square_gof':
      return {
        title: `Observed Counts (${result.variable})`,
        yLabel: 'Count',
        items: result.categories.slice(0, 6).map((c) => ({ label: c.category, value: c.observed })),
      };
    case 'exploratory_factor_analysis':
      return {
        title: 'Scree Eigenvalues (Kaiser > 1)',
        yLabel: 'λ',
        items: result.eigenvalues.slice(0, 6).map((e) => ({ label: `F${e.factor}`, value: e.eigenvalue })),
      };
    case 'confirmatory_factor_analysis':
      return {
        title: 'Standardized Factor Loadings (λ)',
        yLabel: 'λ',
        items: result.factorLoadings.slice(0, 6).map((l) => ({ label: l.indicator, value: l.standardized })),
      };
    case 'structural_equation_modeling':
      return {
        title: 'Structural Path Coefficients |β|',
        yLabel: '|β|',
        items: result.structuralPaths.slice(0, 6).map((p) => ({
          label: `${p.source.slice(0, 4)}→${p.target.slice(0, 4)}`,
          value: Math.abs(p.beta),
        })),
      };
    case 'descriptive':
      return {
        title: 'Variable Means ± SD',
        yLabel: 'Mean',
        items: result.items.slice(0, 6).map((i) => ({ label: i.variable, value: i.mean, error: i.sd })),
      };
    default:
      return {
        title: 'Empirical Summary Metric',
        yLabel: 'Score',
        items: [
          {
            label: 'primaryMetric' in result ? result.primaryMetric : 'Metric',
            value:
              'primaryValue' in result && typeof result.primaryValue === 'number'
                ? result.primaryValue
                : 1,
          },
        ],
      };
  }
}

function truncateText(text: string, maxLen: number): string {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1).trim()}…`;
}

function buildFigureExplanations(
  result: StatisticalResult,
  empiricalChart: { title: string; yLabel: string; items: ChartBarItem[] },
  audit: ReturnType<typeof computeDiagnosticAudit>,
  shortCitation: string,
  verdictLabel: string | undefined,
  alphaLevel: number
): {
  fig1: string;
  fig2: string;
  fig3: string;
  fig4: string;
} {
  // Figure 4.1 Explanation: Based on primary empirical result & plotted bars
  const items = empiricalChart.items;
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const spread = highest && lowest ? Math.abs(highest.value - lowest.value) : 0;
  const verdictSuffix = verdictLabel
    ? ` (${shortCitation}; ${verdictLabel} at α = ${alphaLevel}).`
    : ` (${shortCitation}).`;

  let fig1 = '';
  if (result.type === 'regression' && items.length >= 1) {
    fig1 = `Standardized predictor magnitudes show ${highest.label} exerts the strongest absolute effect (|β| = ${highest.value.toFixed(2)})${
      items.length > 1 ? ` compared to ${lowest.label} (|β| = ${lowest.value.toFixed(2)})` : ''
    }, accounting for ${(result.rSquared * 100).toFixed(1)}% of criterion variance in ${result.dependentVar}${verdictSuffix}`;
  } else if (result.type === 'logistic_regression' && items.length >= 1) {
    fig1 = `Predictor odds ratios peak at ${highest.label} (OR = ${highest.value.toFixed(2)})${
      items.length > 1 ? ` relative to ${lowest.label} (OR = ${lowest.value.toFixed(2)})` : ''
    }, with Nagelkerke R² = ${(result.nagelkerkeR2 * 100).toFixed(1)}% predicting ${result.dependentVar}${verdictSuffix}`;
  } else if (result.type === 'correlation' && items.length >= 1) {
    fig1 = `Pairwise ${result.method === 'spearman' ? 'rank' : 'linear'} correlation strength is highest for ${highest.label} (|r| = ${highest.value.toFixed(2)})${
      items.length > 1 ? ` and lowest for ${lowest.label} (|r| = ${lowest.value.toFixed(2)})` : ''
    }${verdictSuffix}`;
  } else if (result.type === 'cronbach_alpha' && items.length >= 1) {
    fig1 = `Corrected item-rest correlations range from ${lowest.value.toFixed(2)} (${lowest.label}) to ${highest.value.toFixed(2)} (${highest.label}), confirming overall scale reliability α = ${result.rawAlpha.toFixed(2)} across ${result.itemCount} items.`;
  } else if (result.type === 'exploratory_factor_analysis' && items.length >= 1) {
    const retainedCount = result.eigenvalues.filter((e) => e.eigenvalue > 1).length;
    fig1 = `Scree plot eigenvalues peak at ${highest.label} (λ = ${highest.value.toFixed(2)}), with ${retainedCount} factor(s) exceeding the Kaiser λ > 1.0 extraction criterion${verdictSuffix}`;
  } else if (items.length >= 2) {
    const highErr = highest.error !== undefined ? ` ± ${highest.error.toFixed(2)}` : '';
    const lowErr = lowest.error !== undefined ? ` ± ${lowest.error.toFixed(2)}` : '';
    fig1 = `${highest.label} records the highest ${empiricalChart.yLabel.toLowerCase()} (${highest.value.toFixed(2)}${highErr}) versus ${lowest.label} (${lowest.value.toFixed(2)}${lowErr}), yielding an empirical contrast of Δ = ${spread.toFixed(2)}${verdictSuffix}`;
  } else if (highest) {
    fig1 = `Observed ${empiricalChart.yLabel.toLowerCase()} for ${highest.label} equals ${highest.value.toFixed(2)}${verdictSuffix}`;
  } else {
    fig1 = `Empirical summary metrics reflect the primary statistical outcome${verdictSuffix}`;
  }

  // Figure 4.2 Explanation: Normal Q-Q Plot
  const jbPStr = audit.jarqueBeraP < 0.001 ? '< .001' : `= ${audit.jarqueBeraP.toFixed(3)}`;
  const qqTotal = Math.max(1, audit.qqPoints.length);
  const qqInside = audit.qqPoints.filter(
    (p) => p.sampleStdResidual >= p.lowerEnvelope && p.sampleStdResidual <= p.upperEnvelope
  ).length;
  const qqInsidePct = Math.round((qqInside / qqTotal) * 100);
  const fig2 =
    audit.normalityStatus === 'Passed'
      ? `Observed quantiles closely track the 45° reference diagonal with ${qqInsidePct}% of points inside the 95% confidence envelope (JB = ${audit.jarqueBera.toFixed(2)}, p ${jbPStr}), satisfying normality.`
      : audit.normalityStatus === 'Mild Deviation'
      ? `${qqInsidePct}% of residuals fall within the 95% envelope with slight tail departure (JB = ${audit.jarqueBera.toFixed(2)}, p ${jbPStr}); inference remains moderately robust.`
      : `Quantiles diverge from linearity in the tails (${qqInsidePct}% inside envelope; JB = ${audit.jarqueBera.toFixed(2)}, p ${jbPStr}), indicating non-normal residuals.`;

  // Figure 4.3 Explanation: Residuals vs Fitted Homoscedasticity Plot
  const maxAbsZ = audit.homoscedasticityPoints.length
    ? Math.max(...audit.homoscedasticityPoints.map((p) => Math.abs(p.stdResidual)))
    : 0;
  const leveneClause =
    audit.leveneF !== undefined && audit.leveneP !== undefined
      ? `Levene F = ${audit.leveneF.toFixed(2)}, p ${audit.leveneP < 0.001 ? '< .001' : `= ${audit.leveneP.toFixed(3)}`}`
      : `max |z| = ${maxAbsZ.toFixed(2)}`;
  const fig3 =
    audit.homoscedasticityStatus === 'Passed'
      ? `Residuals scatter evenly around y = 0 within ±2 SD bounds without funneling (${leveneClause}; ${audit.outlierCount} extreme outlier${audit.outlierCount === 1 ? '' : 's'} |z| > 3.0), confirming homoscedasticity.`
      : `Dispersion shows ${audit.homoscedasticityStatus.toLowerCase()} variance across fitted levels (${leveneClause}; ${audit.outlierCount} outlier${audit.outlierCount === 1 ? '' : 's'} |z| > 3.0), warranting robust error checks.`;

  // Figure 4.4 Explanation: Residual Histogram & Normal Curve
  const modalBin = audit.histogramBins.reduce(
    (best, cur) => (cur.count > best.count ? cur : best),
    audit.histogramBins[0] || { binMid: 0, count: 0 }
  );
  const absSkew = Math.abs(audit.skewness);
  const absKurt = Math.abs(audit.excessKurtosis);
  const shapeDesc =
    absSkew <= 1 && absKurt <= 2
      ? 'closely mirrors the superimposed red normal curve'
      : absSkew > 1
      ? `displays ${audit.skewness > 0 ? 'positive (right)' : 'negative (left)'} asymmetry relative to the normal curve`
      : `exhibits ${audit.excessKurtosis > 0 ? 'leptokurtic peaking' : 'platykurtic flattening'} relative to the normal curve`;
  const fig4 = `Empirical residual bars peak near z = ${modalBin.binMid.toFixed(2)} (SD = ${audit.sdResidual.toFixed(2)}) and ${shapeDesc} (Skew = ${audit.skewness.toFixed(2)}, Kurtosis = ${audit.excessKurtosis.toFixed(2)}, ±2.0 benchmark).`;

  return { fig1, fig2, fig3, fig4 };
}

async function svgElementToPngDataUrl(svgEl: SVGSVGElement | null, scale = 3): Promise<string | null> {
  if (!svgEl) return null;
  try {
    const cloned = svgEl.cloneNode(true) as SVGSVGElement;
    cloned.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const vb = cloned.viewBox?.baseVal;
    const width = vb?.width || Number(cloned.getAttribute('width')) || 320;
    const height = vb?.height || Number(cloned.getAttribute('height')) || 195;
    cloned.setAttribute('width', String(width));
    cloned.setAttribute('height', String(height));

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(cloned);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    return await new Promise<string | null>((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(width * scale);
          canvas.height = Math.round(height * scale);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(url);
            resolve(null);
            return;
          }
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const png = canvas.toDataURL('image/png');
          URL.revokeObjectURL(url);
          resolve(png);
        } catch {
          URL.revokeObjectURL(url);
          resolve(null);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  } catch {
    return null;
  }
}

export const SinglePagePdfPreviewModal: React.FC<SinglePagePdfPreviewModalProps> = ({
  isOpen,
  onClose,
  result,
  dataset,
  activeResearchQuestion,
  alphaLevel = 0.05,
  researchQuestionText,
  userNotes,
  synthesisData,
}) => {
  const [previewZoom, setPreviewZoom] = useState<number>(0.84);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const fig1Ref = useRef<SVGSVGElement>(null);
  const fig2Ref = useRef<SVGSVGElement>(null);
  const fig3Ref = useRef<SVGSVGElement>(null);
  const fig4Ref = useRef<SVGSVGElement>(null);

  const narrativeData = useMemo(() => generateApaNarrative(result), [result]);
  const tableData = useMemo(() => generateApaTable(result, 1), [result]);
  const audit = useMemo(() => computeDiagnosticAudit(result, dataset), [result, dataset]);
  const pValue = useMemo(() => extractPValue(result), [result]);
  const evaluation = useMemo(
    () => (pValue !== null ? evaluateHypothesisDecision(pValue, alphaLevel) : null),
    [pValue, alphaLevel]
  );
  const designMeta = useMemo(() => getDesignLabel(result), [result]);
  const empiricalChart = useMemo(() => buildEmpiricalChartData(result), [result]);
  const figureExplanations = useMemo(
    () =>
      buildFigureExplanations(
        result,
        empiricalChart,
        audit,
        narrativeData.shortCitation,
        evaluation?.verdictLabel,
        alphaLevel
      ),
    [result, empiricalChart, audit, narrativeData.shortCitation, evaluation?.verdictLabel, alphaLevel]
  );

  if (!isOpen) return null;

  const totalPages = 4;
  const studyTitle = activeResearchQuestion?.title || narrativeData.headline;
  const resolvedRq =
    researchQuestionText ||
    activeResearchQuestion?.question ||
    'Investigating empirical group differences and predictive effects across primary study variables.';
  const resolvedH0 =
    activeResearchQuestion?.hypothesisNull ||
    'There is no statistically significant difference or predictive relationship among the examined variables.';
  const resolvedH1 =
    activeResearchQuestion?.hypothesisAlt ||
    'There is a statistically significant difference or predictive relationship among the examined variables.';
  const submissionDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // --- SVG Geometry Calculations (Explicit Hex Colors for Crisp PDF Vector/PNG Export) ---
  const svgW = 320;
  const svgH = 195;

  // Fig 4.1: Empirical Bar / Mean ± SE Chart
  const fig1Bars = empiricalChart.items.length > 0 ? empiricalChart.items : [{ label: 'Result', value: 1 }];
  const fig1Max = Math.max(1e-6, ...fig1Bars.map((b) => Math.abs(b.value) + (b.error || 0)));
  const fig1Min = Math.min(0, ...fig1Bars.map((b) => b.value - (b.error || 0)));
  const fig1Span = fig1Max - fig1Min || 1;
  const fig1Pad = { top: 20, right: 16, bottom: 32, left: 42 };
  const fig1PlotW = svgW - fig1Pad.left - fig1Pad.right;
  const fig1PlotH = svgH - fig1Pad.top - fig1Pad.bottom;
  const fig1ZeroY = fig1Pad.top + ((fig1Max - 0) / fig1Span) * fig1PlotH;

  // Fig 4.2: Normal Q-Q Plot
  const qqPad = { top: 16, right: 16, bottom: 32, left: 38 };
  const qqW = svgW - qqPad.left - qqPad.right;
  const qqH = svgH - qqPad.top - qqPad.bottom;
  const qqMinSamp = Math.min(-3.1, ...audit.qqPoints.map((p) => p.sampleStdResidual));
  const qqMaxSamp = Math.max(3.1, ...audit.qqPoints.map((p) => p.sampleStdResidual));
  const qqScaleX = (v: number) => qqPad.left + ((v + 3.1) / 6.2) * qqW;
  const qqScaleY = (v: number) => qqPad.top + qqH - ((v - qqMinSamp) / (qqMaxSamp - qqMinSamp || 1)) * qqH;

  const qqEnvelopePath = (() => {
    if (audit.qqPoints.length < 3) return '';
    const upper: string[] = [];
    const lower: string[] = [];
    audit.qqPoints.forEach((p) => {
      const x = qqScaleX(p.theoreticalQuantile).toFixed(1);
      upper.push(`${x},${qqScaleY(p.upperEnvelope).toFixed(1)}`);
      lower.unshift(`${x},${qqScaleY(p.lowerEnvelope).toFixed(1)}`);
    });
    return `M ${upper.join(' L ')} L ${lower.join(' L ')} Z`;
  })();

  // Fig 4.3: Residuals vs Fitted
  const hscPad = { top: 16, right: 16, bottom: 32, left: 38 };
  const hscW = svgW - hscPad.left - hscPad.right;
  const hscH = svgH - hscPad.top - hscPad.bottom;
  const hscFits = audit.homoscedasticityPoints.map((p) => p.fitted);
  const hscMinX = hscFits.length ? Math.min(...hscFits) - 0.1 : 0;
  const hscMaxX = hscFits.length ? Math.max(...hscFits) + 0.1 : 1;
  const hscRes = audit.homoscedasticityPoints.map((p) => p.stdResidual);
  const hscMinY = Math.min(-3.0, ...(hscRes.length ? hscRes : [-3]));
  const hscMaxY = Math.max(3.0, ...(hscRes.length ? hscRes : [3]));
  const hscScaleX = (v: number) => hscPad.left + ((v - hscMinX) / (hscMaxX - hscMinX || 1)) * hscW;
  const hscScaleY = (v: number) => hscPad.top + hscH - ((v - hscMinY) / (hscMaxY - hscMinY || 1)) * hscH;

  // Fig 4.4: Residual Distribution Histogram + Bell Curve
  const histPad = { top: 16, right: 16, bottom: 32, left: 36 };
  const histW = svgW - histPad.left - histPad.right;
  const histH = svgH - histPad.top - histPad.bottom;
  const maxBinCount = Math.max(
    1,
    ...audit.histogramBins.map((b) => Math.max(b.count, b.expectedCount))
  );
  const histCurvePath = (() => {
    if (audit.histogramBins.length < 2) return '';
    const pts = audit.histogramBins.map((b, i) => {
      const cx = histPad.left + ((i + 0.5) / audit.histogramBins.length) * histW;
      const cy = histPad.top + histH - (b.expectedCount / maxBinCount) * histH;
      return `${cx.toFixed(1)},${cy.toFixed(1)}`;
    });
    return `M ${pts.join(' L ')}`;
  })();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth(); // 595.28
      const pageH = doc.internal.pageSize.getHeight(); // 841.89
      // Standard 1-inch (72pt) left/right thesis margin for formal university submission
      const marginX = 64;
      const usableW = pageW - marginX * 2; // 467.28

      const addThesisRunningHeaderFooter = (runningHeader: string, pageNum: number) => {
        doc.setFont('times', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(runningHeader, marginX, 38);
        doc.text(String(pageNum), marginX + usableW, 38, { align: 'right' });
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.5);
        doc.line(marginX, 44, marginX + usableW, 44);

        doc.line(marginX, pageH - 42, marginX + usableW, pageH - 42);
        doc.setFont('times', 'normal');
        doc.setFontSize(8.5);
        doc.text('University Thesis Submission Format · APA 7th Edition', marginX, pageH - 28);
        doc.text(`Page ${pageNum} of ${totalPages}`, marginX + usableW, pageH - 28, { align: 'right' });
      };

      const drawChapterHeading = (chapterTitle: string, startY: number): number => {
        doc.setFont('times', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text(chapterTitle, pageW / 2, startY, { align: 'center' });
        doc.setDrawColor(15, 23, 42);
        doc.setLineWidth(0.8);
        doc.line(marginX + 90, startY + 6, marginX + usableW - 90, startY + 6);
        return startY + 26;
      };

      const drawSubSection = (
        heading: string,
        body: string,
        currentY: number,
        italicBody = false
      ): number => {
        let y = currentY;
        doc.setFont('times', 'bold');
        doc.setFontSize(11.5);
        doc.setTextColor(15, 23, 42);
        doc.text(heading, marginX, y);
        y += 16;

        doc.setFont('times', italicBody ? 'italic' : 'normal');
        doc.setFontSize(10.5);
        doc.setTextColor(30, 41, 59);
        const lines = doc.splitTextToSize(body, usableW);
        doc.text(lines, marginX, y, { lineHeightFactor: 1.45 });
        return y + lines.length * 10.5 * 1.45 + 14;
      };

      // ================= PAGE 1: CHAPTER 1 INTRODUCTION =================
      addThesisRunningHeaderFooter('CHAPTER 1: INTRODUCTION', 1);
      let y = 66;
      doc.setFont('times', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 58, 138);
      const titleLines = doc.splitTextToSize(studyTitle.toUpperCase(), usableW);
      doc.text(titleLines, pageW / 2, y, { align: 'center' });
      y += titleLines.length * 14 + 4;
      doc.setFont('times', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text(
        `Dataset: ${dataset?.name || 'Empirical Sample'} | N = ${designMeta.sampleN} | alpha = ${alphaLevel} | ${submissionDate}`,
        pageW / 2,
        y,
        { align: 'center' }
      );
      y += 26;

      y = drawChapterHeading('CHAPTER 1: INTRODUCTION', y);
      y = drawSubSection(
        '1.1 Background of the Study',
        `This quantitative empirical investigation examines "${studyTitle}" within the domain of ${dataset?.domain || 'Quantitative Research'} using data drawn from ${dataset?.name || 'the active empirical dataset'} (N = ${designMeta.sampleN}). ${dataset?.description || `The analysis evaluates empirical associations and group-level effects across ${designMeta.variablesSummary}.`} Accurate statistical modeling and assumption auditing ensure that inferential conclusions conform to peer-reviewed APA 7th Edition scholarly standards.`,
        y
      );
      y = drawSubSection(
        '1.2 Problem Statement & Research Purpose',
        `In empirical research, establishing reliable statistical evidence requires aligning the analytical procedure (${designMeta.analysisMethod}) with the underlying measurement scale and distributional assumptions. Using a ${designMeta.designType.toLowerCase()}, this study isolates systematic empirical effects from random sampling variation at significance criterion alpha = ${alphaLevel}.`,
        y
      );
      y = drawSubSection('1.3 Research Question (RQ)', `"${resolvedRq}"`, y, true);
      y = drawSubSection(
        '1.4 Research Hypotheses',
        `Null Hypothesis (H0): ${resolvedH0}\n\nAlternative Hypothesis (H1): ${resolvedH1}`,
        y
      );
      drawSubSection(
        '1.5 Scope & Operational Variables',
        `Operationalized study variables: ${designMeta.variablesSummary}.${userNotes ? ` Authorial analytical emphasis: ${userNotes}.` : ''}`,
        y
      );

      // ================= PAGE 2: CHAPTER 3 METHODOLOGY =================
      doc.addPage();
      addThesisRunningHeaderFooter('CHAPTER 3: METHODOLOGY', 2);
      y = drawChapterHeading('CHAPTER 3: METHODOLOGY', 72);
      y = drawSubSection(
        '3.1 Research Design',
        `The study adopts a ${designMeta.designType}. This design structure systematically tests the stated research hypotheses by evaluating empirical parameters across the selected study variables while controlling Type I error at alpha = ${alphaLevel}.`,
        y
      );
      y = drawSubSection(
        '3.2 Population, Sample & Dataset Characteristics',
        `Empirical observations were drawn from ${dataset?.name || 'the study dataset'} (${dataset?.domain || 'Quantitative Domain'}), yielding an analytic sample of N = ${designMeta.sampleN}. Complete case screening verified variable completeness across all analyzed dimensions.`,
        y
      );
      y = drawSubSection(
        '3.3 Instrumentation & Variable Operationalization',
        `The measurement architecture incorporates: ${designMeta.variablesSummary}. Table 3.1 summarizes the operationalized dataset variables, measurement scales, and completeness metrics.`,
        y
      );

      // Table 3.1: Variable Dictionary Summary
      const colsMeta = (dataset?.columns || []).slice(0, 7);
      if (colsMeta.length > 0) {
        doc.setFont('times', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text('Table 3.1', marginX, y);
        y += 12;
        doc.setFont('times', 'italic');
        doc.text('Operationalized Dataset Variable Specifications', marginX, y);
        y += 8;
        doc.setDrawColor(15, 23, 42);
        doc.setLineWidth(1.1);
        doc.line(marginX, y, marginX + usableW, y);
        y += 12;
        doc.setFont('times', 'italic');
        doc.setFontSize(9.5);
        doc.text('Variable Name', marginX + 4, y);
        doc.text('Scale Type', marginX + 205, y);
        doc.text('Distinct Levels', marginX + 310, y);
        doc.text('Missing', marginX + 405, y);
        y += 5;
        doc.setLineWidth(0.6);
        doc.line(marginX, y, marginX + usableW, y);
        y += 12;
        doc.setFont('times', 'normal');
        doc.setFontSize(9.2);
        colsMeta.forEach((col) => {
          doc.text(truncateText(col.name, 34), marginX + 4, y);
          doc.text(col.type, marginX + 205, y);
          doc.text(String(col.distinctCount), marginX + 310, y);
          doc.text(String(col.missingCount), marginX + 405, y);
          y += 14;
        });
        doc.setLineWidth(1.1);
        doc.line(marginX, y - 4, marginX + usableW, y - 4);
        y += 16;
      }

      drawSubSection(
        '3.4 Data Analysis Procedure & Assumption Testing Protocol',
        `Statistical inference was executed using ${designMeta.analysisMethod} with a pre-specified significance threshold of alpha = ${alphaLevel}. Prior to interpreting test statistics, distributional normality (Jarque-Bera test, skewness, excess kurtosis), variance homogeneity (Levene's F where applicable), Q-Q probability plots, homoscedasticity residual scatterplots, and standardized residual outlier screening (|z| > 3.0) were formally audited.`,
        y
      );

      // ================= PAGE 3: CHAPTER 4 RESULT (TEXT & APA TABLE) =================
      doc.addPage();
      addThesisRunningHeaderFooter('CHAPTER 4: RESULT', 3);
      y = drawChapterHeading('CHAPTER 4: RESULT', 72);
      y = drawSubSection(
        '4.1 Preliminary Data Screening & Assumption Diagnostics',
        `Diagnostic screening revealed normality status: ${audit.normalityStatus} (Jarque-Bera JB = ${audit.jarqueBera.toFixed(3)}, p = ${audit.jarqueBeraP < 0.001 ? '< .001' : audit.jarqueBeraP.toFixed(3)}; Skewness = ${audit.skewness.toFixed(2)}, Excess Kurtosis = ${audit.excessKurtosis.toFixed(2)})${audit.leveneF !== undefined && audit.leveneP !== undefined ? `; Levene variance test F = ${audit.leveneF.toFixed(2)}, p = ${audit.leveneP.toFixed(3)}` : ''}; Outliers detected: ${audit.outlierCount}. ${synthesisData.assumptionsReport}`,
        y
      );
      y = drawSubSection(
        '4.2 Primary Inferential Statistical Findings',
        `${synthesisData.apaNarrative || narrativeData.narrativeText}${evaluation ? `\n\nHypothesis Verdict (${evaluation.verdictLabel}): ${evaluation.academicStatement}` : ''}`,
        y
      );

      // 4.3 Table 4.1 APA Three-Rule Table
      doc.setFont('times', 'bold');
      doc.setFontSize(11.5);
      doc.setTextColor(15, 23, 42);
      doc.text('4.3 APA 7th Edition Statistical Summary Table', marginX, y);
      y += 16;
      doc.setFontSize(10);
      doc.text('Table 4.1', marginX, y);
      y += 12;
      doc.setFont('times', 'italic');
      const tblTitleLines = doc.splitTextToSize(tableData.tableTitle, usableW);
      doc.text(tblTitleLines, marginX, y);
      y += tblTitleLines.length * 12 + 4;

      const tCols = tableData.headers.length;
      const tColW = usableW / Math.max(1, tCols);
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(1.1);
      doc.line(marginX, y, marginX + usableW, y);
      y += 12;
      doc.setFont('times', 'italic');
      doc.setFontSize(9);
      tableData.headers.forEach((h, i) => {
        doc.text(truncateText(String(h), 18), marginX + i * tColW + 3, y);
      });
      y += 5;
      doc.setLineWidth(0.6);
      doc.line(marginX, y, marginX + usableW, y);
      y += 12;

      doc.setFont('times', 'normal');
      doc.setFontSize(8.8);
      tableData.rows.slice(0, 12).forEach((row) => {
        row.forEach((cell, i) => {
          doc.text(truncateText(String(cell), 20), marginX + i * tColW + 3, y);
        });
        y += 13.5;
      });
      doc.setLineWidth(1.1);
      doc.line(marginX, y - 4, marginX + usableW, y - 4);
      y += 10;
      doc.setFont('times', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const tNoteLines = doc.splitTextToSize(tableData.tableNote, usableW).slice(0, 3);
      doc.text(tNoteLines, marginX, y);

      // ================= PAGE 4: CHAPTER 4 RESULT (FIGURES & DISCUSSION) =================
      doc.addPage();
      addThesisRunningHeaderFooter('CHAPTER 4: RESULT (CONTINUED)', 4);
      y = 66;
      doc.setFont('times', 'bold');
      doc.setFontSize(11.5);
      doc.setTextColor(15, 23, 42);
      doc.text('4.4 Graphical Results & Diagnostic Figures', marginX, y);
      y += 12;

      const [png1, png2, png3, png4] = await Promise.all([
        svgElementToPngDataUrl(fig1Ref.current),
        svgElementToPngDataUrl(fig2Ref.current),
        svgElementToPngDataUrl(fig3Ref.current),
        svgElementToPngDataUrl(fig4Ref.current),
      ]);

      const gridGap = 14;
      const cellW = (usableW - gridGap) / 2;
      const cellH = 104;
      const rowStep = cellH + 62;
      const figs = [
        {
          png: png1,
          label: `Figure 4.1. ${empiricalChart.title}`,
          explanation: figureExplanations.fig1,
        },
        {
          png: png2,
          label: 'Figure 4.2. Normal Q-Q Residual Probability Plot',
          explanation: figureExplanations.fig2,
        },
        {
          png: png3,
          label: 'Figure 4.3. Residuals vs. Fitted Homoscedasticity Plot',
          explanation: figureExplanations.fig3,
        },
        {
          png: png4,
          label: 'Figure 4.4. Residual Histogram & Normal Overlay',
          explanation: figureExplanations.fig4,
        },
      ];

      figs.forEach((f, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const fx = marginX + col * (cellW + gridGap);
        const fy = y + row * rowStep;
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.6);
        doc.rect(fx, fy, cellW, cellH);
        if (f.png) {
          const imgW = Math.min(cellW - 8, ((cellH - 6) * svgW) / svgH);
          const imgH = cellH - 6;
          const imgX = fx + (cellW - imgW) / 2;
          doc.addImage(f.png, 'PNG', imgX, fy + 3, imgW, imgH);
        }
        doc.setFont('times', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(truncateText(f.label, 52), fx, fy + cellH + 9);

        doc.setFont('times', 'normal');
        doc.setFontSize(7.4);
        doc.setTextColor(71, 85, 105);
        const expLines = doc.splitTextToSize(f.explanation, cellW).slice(0, 4);
        doc.text(expLines, fx, fy + cellH + 19, { lineHeightFactor: 1.28 });
      });

      y += rowStep * 2 + 6;

      const drawCompactSubSection = (heading: string, body: string, currentY: number): number => {
        let sy = currentY;
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(heading, marginX, sy);
        sy += 14;

        doc.setFont('times', 'normal');
        doc.setFontSize(9.8);
        doc.setTextColor(30, 41, 59);
        const lines = doc.splitTextToSize(body, usableW);
        const maxLines = Math.max(1, Math.floor((pageH - 52 - sy) / (9.8 * 1.38)));
        const clipped = lines.slice(0, maxLines);
        doc.text(clipped, marginX, sy, { lineHeightFactor: 1.38 });
        return sy + clipped.length * 9.8 * 1.38 + 12;
      };

      y = drawCompactSubSection(
        '4.5 Effect Size & Practical Significance',
        synthesisData.effectSizeInterpretation,
        y
      );

      drawCompactSubSection(
        '4.6 Theoretical Discussion & Scholarly Implications',
        synthesisData.discussionDraft,
        y
      );

      doc.save(`Thesis_Submission_Ch1_Ch3_Ch4_${result.type}.pdf`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex flex-col overflow-hidden animate-in fade-in duration-150"
      onClick={onClose}
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #single-page-pdf-sheet,
          #single-page-pdf-sheet * {
            visibility: visible !important;
          }
          #single-page-pdf-sheet {
            position: static !important;
            transform: none !important;
            margin: 0 !important;
            width: auto !important;
            height: auto !important;
            gap: 0 !important;
          }
          .thesis-a4-page {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            page-break-after: always !important;
            break-after: page !important;
          }
          .thesis-a4-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>

      {/* PDF Viewer Top Toolbar */}
      <div
        className="px-4 sm:px-6 py-3 bg-slate-950 border-b border-slate-800 text-white flex flex-wrap items-center justify-between gap-3 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight text-slate-100">
                University Thesis Submission Preview
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                <span>{totalPages} Pages · A4 Standard Margins</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <div className="inline-flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setPreviewZoom((z) => Math.max(0.55, Number((z - 0.1).toFixed(2))))}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[11px] font-mono text-slate-300 min-w-[42px] text-center">
              {Math.round(previewZoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setPreviewZoom((z) => Math.min(1.25, Number((z + 0.1).toFixed(2))))}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewZoom(0.84)}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 border-l border-slate-700 pl-1.5 cursor-pointer"
              title="Fit page"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print ({totalPages} Pages)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? 'Generating Thesis PDF...' : 'Download Thesis PDF'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close PDF Preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Multi-Page A4 Thesis Stage */}
      <div
        className="flex-1 overflow-auto p-6 sm:p-8 flex justify-center items-start"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: `${Math.round(794 * previewZoom)}px`,
            height: `${Math.round((1123 * totalPages + 28 * (totalPages - 1)) * previewZoom)}px`,
          }}
          className="relative shrink-0 transition-all duration-150"
        >
          <div
            id="single-page-pdf-sheet"
            style={{
              width: '794px',
              transform: `scale(${previewZoom})`,
              transformOrigin: 'top left',
            }}
            className="flex flex-col gap-7"
          >
            {/* ==================== PAGE 1: CHAPTER 1 INTRODUCTION ==================== */}
            <article
              style={{ width: '794px', height: '1123px' }}
              className="thesis-a4-page bg-white text-slate-900 shadow-2xl border border-slate-300 px-[72px] py-[64px] flex flex-col justify-between font-serif"
            >
              <div className="space-y-5">
                {/* Running Header */}
                <div className="pb-2 border-b border-slate-300 flex items-center justify-between text-[11px] italic text-slate-500">
                  <span>CHAPTER 1: INTRODUCTION</span>
                  <span>1</span>
                </div>

                {/* Thesis Submission Title Header */}
                <div className="text-center space-y-1.5 pt-2 pb-3 border-b border-slate-200">
                  <h1 className="text-[15px] font-bold uppercase tracking-wide text-slate-900 leading-snug">
                    {studyTitle}
                  </h1>
                  <p className="text-[11px] text-slate-600 font-sans">
                    Dataset: {dataset?.name || 'Empirical Study Sample'} · Sample Size N = {designMeta.sampleN} · Criterion α = {alphaLevel} · {submissionDate}
                  </p>
                </div>

                {/* Centered University Chapter Heading */}
                <div className="text-center pt-1 pb-2">
                  <h2 className="text-[18px] font-bold uppercase tracking-widest text-slate-900">
                    CHAPTER 1
                  </h2>
                  <div className="text-[15px] font-bold uppercase tracking-wider text-slate-800 mt-0.5">
                    INTRODUCTION
                  </div>
                  <div className="w-28 h-[1.5px] bg-slate-800 mx-auto mt-2.5" />
                </div>

                <div className="space-y-4 text-[12.5px] leading-[1.7] text-slate-800 text-justify">
                  <div>
                    <h3 className="text-[13px] font-bold text-slate-900 mb-1">
                      1.1 Background of the Study
                    </h3>
                    <p>
                      This empirical quantitative investigation examines <em>{studyTitle}</em> within the research domain of{' '}
                      {dataset?.domain || 'Quantitative Research'}, utilizing empirical data derived from{' '}
                      <strong>{dataset?.name || 'the active study dataset'}</strong> (<em>N</em> = {designMeta.sampleN}).{' '}
                      {dataset?.description ||
                        `The analytical framework evaluates empirical relationships and systematic effects across ${designMeta.variablesSummary}.`}{' '}
                      Rigorous adherence to statistical assumption verification and APA 7th Edition reporting conventions ensures reproducibility and scholarly validity.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[13px] font-bold text-slate-900 mb-1">
                      1.2 Problem Statement &amp; Research Purpose
                    </h3>
                    <p>
                      Contemporary quantitative inquiry requires matching the inferential statistical model (
                      {designMeta.analysisMethod}) cleanly to variable measurement properties and distributional assumptions. Adopting a{' '}
                      {designMeta.designType.toLowerCase()}, this study evaluates whether observed empirical differences or predictive effects exceed random sampling variability at the α = {alphaLevel} significance threshold.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[13px] font-bold text-slate-900 mb-1.5">
                      1.3 Research Question (RQ)
                    </h3>
                    <blockquote className="pl-4 py-2 border-l-3 border-slate-700 bg-slate-50/80 italic text-slate-900">
                      &ldquo;{resolvedRq}&rdquo;
                    </blockquote>
                  </div>

                  <div>
                    <h3 className="text-[13px] font-bold text-slate-900 mb-1.5">
                      1.4 Research Hypotheses
                    </h3>
                    <div className="space-y-2 pl-2">
                      <p>
                        <strong>Null Hypothesis (H₀):</strong> {resolvedH0}
                      </p>
                      <p>
                        <strong>Alternative Hypothesis (H₁):</strong> {resolvedH1}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[13px] font-bold text-slate-900 mb-1">
                      1.5 Scope &amp; Operationalized Variables
                    </h3>
                    <p>
                      The scope of this analysis encompasses: {designMeta.variablesSummary}.
                      {userNotes ? ` Specific scholarly emphasis: ${userNotes}.` : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-sans text-slate-500">
                <span>University Thesis Submission Format · APA 7th Edition</span>
                <span className="font-semibold text-slate-700">Page 1 of {totalPages}</span>
              </div>
            </article>

            {/* ==================== PAGE 2: CHAPTER 3 METHODOLOGY ==================== */}
            <article
              style={{ width: '794px', height: '1123px' }}
              className="thesis-a4-page bg-white text-slate-900 shadow-2xl border border-slate-300 px-[72px] py-[64px] flex flex-col justify-between font-serif"
            >
              <div className="space-y-5">
                <div className="pb-2 border-b border-slate-300 flex items-center justify-between text-[11px] italic text-slate-500">
                  <span>CHAPTER 3: METHODOLOGY</span>
                  <span>2</span>
                </div>

                <div className="text-center pt-1 pb-2">
                  <h2 className="text-[18px] font-bold uppercase tracking-widest text-slate-900">
                    CHAPTER 3
                  </h2>
                  <div className="text-[15px] font-bold uppercase tracking-wider text-slate-800 mt-0.5">
                    METHODOLOGY
                  </div>
                  <div className="w-28 h-[1.5px] bg-slate-800 mx-auto mt-2.5" />
                </div>

                <div className="space-y-4 text-[12.5px] leading-[1.7] text-slate-800 text-justify">
                  <div>
                    <h3 className="text-[13px] font-bold text-slate-900 mb-1">
                      3.1 Research Design
                    </h3>
                    <p>
                      This study implements a <strong>{designMeta.designType}</strong> to address the research question and test the formulated hypotheses empirically. Quantitative hypothesis evaluation is anchored to a two-tailed decision threshold of α = {alphaLevel}.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[13px] font-bold text-slate-900 mb-1">
                      3.2 Population, Sample &amp; Sampling Scope
                    </h3>
                    <p>
                      The analytic dataset originates from <strong>{dataset?.name || 'Empirical Study Dataset'}</strong> ({dataset?.domain || 'Quantitative Research'}), comprising a total sample of <em>N</em> = {designMeta.sampleN}. Observations were screened for variable completeness and measurement scale compatibility prior to model estimation.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[13px] font-bold text-slate-900 mb-1.5">
                      3.3 Instrumentation &amp; Variable Operationalization
                    </h3>
                    <p className="mb-2.5">
                      Study variables operationalized within the statistical model: {designMeta.variablesSummary}.
                    </p>

                    {dataset && dataset.columns.length > 0 && (
                      <div className="pt-1">
                        <div className="text-[11.5px] font-bold text-slate-900">Table 3.1</div>
                        <div className="text-[11.5px] italic text-slate-700 mb-2">
                          Operationalized Dataset Variable Dictionary
                        </div>
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="border-t-2 border-b border-slate-900">
                              <th className="py-1.5 px-2 font-normal italic">Variable Name</th>
                              <th className="py-1.5 px-2 font-normal italic">Scale Classification</th>
                              <th className="py-1.5 px-2 font-normal italic">Distinct Levels</th>
                              <th className="py-1.5 px-2 font-normal italic">Missing Cases</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dataset.columns.slice(0, 8).map((col, idx) => (
                              <tr key={idx}>
                                <td className="py-1 px-2 font-medium text-slate-900">{col.name}</td>
                                <td className="py-1 px-2 capitalize text-slate-700">{col.type}</td>
                                <td className="py-1 px-2 font-mono text-slate-700">{col.distinctCount}</td>
                                <td className="py-1 px-2 font-mono text-slate-700">{col.missingCount}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 border-slate-900">
                              <td colSpan={4} className="pt-1.5 text-[10px] italic text-slate-600">
                                Note. Summarized from active analytic dataset ({dataset.totalRows} total observations).
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-[13px] font-bold text-slate-900 mb-1">
                      3.4 Data Analysis Procedure &amp; Assumption Screening Protocol
                    </h3>
                    <p>
                      Statistical inference was performed via <strong>{designMeta.analysisMethod}</strong> evaluated at α = {alphaLevel}. Pre-analysis assumption verification encompassed distributional normality testing (Jarque-Bera statistic, skewness, and excess kurtosis), variance homogeneity screening (Levene&apos;s test where applicable), Normal Q-Q probability plots, residuals-versus-fitted homoscedasticity scatterplots, and standardized outlier identification (|<em>z</em>| &gt; 3.0).
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-sans text-slate-500">
                <span>University Thesis Submission Format · APA 7th Edition</span>
                <span className="font-semibold text-slate-700">Page 2 of {totalPages}</span>
              </div>
            </article>

            {/* ==================== PAGE 3: CHAPTER 4 RESULT (PART I) ==================== */}
            <article
              style={{ width: '794px', height: '1123px' }}
              className="thesis-a4-page bg-white text-slate-900 shadow-2xl border border-slate-300 px-[72px] py-[64px] flex flex-col justify-between font-serif"
            >
              <div className="space-y-5">
                <div className="pb-2 border-b border-slate-300 flex items-center justify-between text-[11px] italic text-slate-500">
                  <span>CHAPTER 4: RESULT</span>
                  <span>3</span>
                </div>

                <div className="text-center pt-1 pb-2">
                  <h2 className="text-[18px] font-bold uppercase tracking-widest text-slate-900">
                    CHAPTER 4
                  </h2>
                  <div className="text-[15px] font-bold uppercase tracking-wider text-slate-800 mt-0.5">
                    RESULT
                  </div>
                  <div className="w-28 h-[1.5px] bg-slate-800 mx-auto mt-2.5" />
                </div>

                <div className="space-y-4 text-[12.5px] leading-[1.7] text-slate-800 text-justify">
                  <div>
                    <h3 className="text-[13px] font-bold text-slate-900 mb-1.5">
                      4.1 Preliminary Data Screening &amp; Assumption Diagnostics
                    </h3>
                    <div className="grid grid-cols-4 gap-2 mb-2.5 text-[10.5px] font-sans">
                      <div className="p-2 rounded border border-slate-200 bg-slate-50">
                        <div className="text-slate-500">Normality Status</div>
                        <div className="font-bold text-slate-900">{audit.normalityStatus}</div>
                        <div className="text-[9.5px] text-slate-600 font-mono">
                          JB p = {audit.jarqueBeraP < 0.001 ? '< .001' : audit.jarqueBeraP.toFixed(3)}
                        </div>
                      </div>
                      <div className="p-2 rounded border border-slate-200 bg-slate-50">
                        <div className="text-slate-500">Skewness / Kurtosis</div>
                        <div className="font-bold text-slate-900 font-mono">
                          {audit.skewness.toFixed(2)} / {audit.excessKurtosis.toFixed(2)}
                        </div>
                        <div className="text-[9.5px] text-slate-600">Target ±2.0</div>
                      </div>
                      <div className="p-2 rounded border border-slate-200 bg-slate-50">
                        <div className="text-slate-500">Homogeneity</div>
                        <div className="font-bold text-slate-900">{audit.homoscedasticityStatus}</div>
                        <div className="text-[9.5px] text-slate-600 font-mono">
                          {audit.leveneP !== undefined ? `Levene p = ${audit.leveneP.toFixed(3)}` : 'Screened'}
                        </div>
                      </div>
                      <div className="p-2 rounded border border-slate-200 bg-slate-50">
                        <div className="text-slate-500">Residual Outliers</div>
                        <div className="font-bold text-slate-900 font-mono">{audit.outlierCount}</div>
                        <div className="text-[9.5px] text-slate-600">|z| &gt; 3.0 check</div>
                      </div>
                    </div>
                    <p>{synthesisData.assumptionsReport}</p>
                  </div>

                  <div>
                    <h3 className="text-[13px] font-bold text-slate-900 mb-1">
                      4.2 Primary Inferential Statistical Findings
                    </h3>
                    <p className="mb-2">
                      {synthesisData.apaNarrative || narrativeData.narrativeText}
                    </p>
                    {evaluation && (
                      <div className="p-2.5 rounded border border-slate-300 bg-slate-50 text-[11.5px]">
                        <strong>Hypothesis Decision ({evaluation.verdictLabel}):</strong>{' '}
                        {evaluation.academicStatement}{' '}
                        <span className="font-mono text-blue-800">({narrativeData.shortCitation})</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-[13px] font-bold text-slate-900 mb-1.5">
                      4.3 APA 7th Edition Statistical Summary Table
                    </h3>
                    <div className="text-[11.5px] font-bold text-slate-900">Table 4.1</div>
                    <div className="text-[11.5px] italic text-slate-700 mb-2">
                      {tableData.tableTitle}
                    </div>
                    <table className="w-full text-left border-collapse text-[10.8px]">
                      <thead>
                        <tr className="border-t-2 border-b border-slate-900">
                          {tableData.headers.map((h, i) => (
                            <th key={i} className="py-1.5 px-2 font-normal italic text-slate-900 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.rows.slice(0, 12).map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className={`py-1 px-2 whitespace-nowrap ${
                                  cIdx > 0 ? 'font-mono text-slate-700' : 'font-medium text-slate-900'
                                }`}
                              >
                                {String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-slate-900">
                          <td colSpan={tableData.headers.length} className="pt-1.5 text-[10px] italic text-slate-600">
                            {tableData.tableNote}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-sans text-slate-500">
                <span>University Thesis Submission Format · APA 7th Edition</span>
                <span className="font-semibold text-slate-700">Page 3 of {totalPages}</span>
              </div>
            </article>

            {/* ==================== PAGE 4: CHAPTER 4 RESULT (PART II - FIGURES & DISCUSSION) ==================== */}
            <article
              style={{ width: '794px', height: '1123px' }}
              className="thesis-a4-page bg-white text-slate-900 shadow-2xl border border-slate-300 px-[72px] py-[64px] flex flex-col justify-between font-serif"
            >
              <div className="space-y-3.5">
                <div className="pb-2 border-b border-slate-300 flex items-center justify-between text-[11px] italic text-slate-500">
                  <span>CHAPTER 4: RESULT (CONTINUED)</span>
                  <span>4</span>
                </div>

                {/* 4.4 Graphical Results & Diagnostic Figures (2x2 High-Clarity Grid + Analytical Explanations) */}
                <div>
                  <h3 className="text-[13px] font-bold text-slate-900 mb-2">
                    4.4 Graphical Results &amp; Diagnostic Figures
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Figure 4.1 */}
                    <div className="border border-slate-200 rounded p-2 bg-white">
                      <svg ref={fig1Ref} viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-[132px] block">
                        <rect x="0" y="0" width={svgW} height={svgH} fill="#ffffff" />
                        <line
                          x1={fig1Pad.left}
                          y1={fig1ZeroY}
                          x2={svgW - fig1Pad.right}
                          y2={fig1ZeroY}
                          stroke="#94a3b8"
                          strokeWidth="1"
                        />
                        <line
                          x1={fig1Pad.left}
                          y1={fig1Pad.top}
                          x2={fig1Pad.left}
                          y2={svgH - fig1Pad.bottom}
                          stroke="#cbd5e1"
                          strokeWidth="1"
                        />
                        {fig1Bars.map((bar, idx) => {
                          const slotW = fig1PlotW / fig1Bars.length;
                          const bw = Math.min(38, slotW * 0.56);
                          const bx = fig1Pad.left + idx * slotW + (slotW - bw) / 2;
                          const valY = fig1Pad.top + ((fig1Max - bar.value) / fig1Span) * fig1PlotH;
                          const barTop = Math.min(valY, fig1ZeroY);
                          const barH = Math.max(3, Math.abs(fig1ZeroY - valY));
                          const errPx = bar.error ? (bar.error / fig1Span) * fig1PlotH : 0;
                          return (
                            <g key={idx}>
                              <rect x={bx} y={barTop} width={bw} height={barH} rx="3" fill="#2563eb" fillOpacity="0.85" />
                              {bar.error !== undefined && errPx > 1 && (
                                <g stroke="#1e293b" strokeWidth="1.2">
                                  <line x1={bx + bw / 2} y1={valY - errPx} x2={bx + bw / 2} y2={valY + errPx} />
                                  <line x1={bx + bw / 2 - 5} y1={valY - errPx} x2={bx + bw / 2 + 5} y2={valY - errPx} />
                                  <line x1={bx + bw / 2 - 5} y1={valY + errPx} x2={bx + bw / 2 + 5} y2={valY + errPx} />
                                </g>
                              )}
                              <text
                                x={bx + bw / 2}
                                y={svgH - 10}
                                textAnchor="middle"
                                fontSize="9.5"
                                fill="#334155"
                                fontFamily="sans-serif"
                              >
                                {truncateText(bar.label, 12)}
                              </text>
                              <text
                                x={bx + bw / 2}
                                y={Math.max(12, barTop - 4)}
                                textAnchor="middle"
                                fontSize="9"
                                fill="#1e3a8a"
                                fontFamily="monospace"
                              >
                                {bar.value.toFixed(2)}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                      <div className="text-[10px] text-slate-900 mt-1">
                        <strong>Figure 4.1.</strong> <em>{empiricalChart.title}</em>
                      </div>
                      <p className="text-[9.5px] leading-[1.38] text-slate-600 mt-1 text-justify">
                        {figureExplanations.fig1}
                      </p>
                    </div>

                    {/* Figure 4.2 */}
                    <div className="border border-slate-200 rounded p-2 bg-white">
                      <svg ref={fig2Ref} viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-[132px] block">
                        <rect x="0" y="0" width={svgW} height={svgH} fill="#ffffff" />
                        <line x1={qqPad.left} y1={svgH - qqPad.bottom} x2={svgW - qqPad.right} y2={svgH - qqPad.bottom} stroke="#cbd5e1" strokeWidth="1" />
                        <line x1={qqPad.left} y1={qqPad.top} x2={qqPad.left} y2={svgH - qqPad.bottom} stroke="#cbd5e1" strokeWidth="1" />
                        {qqEnvelopePath && <path d={qqEnvelopePath} fill="#dbeafe" fillOpacity="0.7" />}
                        <line
                          x1={qqScaleX(-2.8)}
                          y1={qqScaleY(-2.8)}
                          x2={qqScaleX(2.8)}
                          y2={qqScaleY(2.8)}
                          stroke="#2563eb"
                          strokeWidth="1.5"
                          strokeDasharray="4,3"
                        />
                        {audit.qqPoints.map((pt, idx) => (
                          <circle
                            key={idx}
                            cx={qqScaleX(pt.theoreticalQuantile)}
                            cy={qqScaleY(pt.sampleStdResidual)}
                            r="3"
                            fill={pt.isOutlier ? '#dc2626' : '#0f172a'}
                            fillOpacity="0.82"
                          />
                        ))}
                        <text x={svgW / 2} y={svgH - 10} textAnchor="middle" fontSize="9.5" fill="#475569" fontFamily="sans-serif">
                          Theoretical Quantiles
                        </text>
                      </svg>
                      <div className="text-[10px] text-slate-900 mt-1">
                        <strong>Figure 4.2.</strong> <em>Normal Q-Q Residual Probability Plot</em>
                      </div>
                      <p className="text-[9.5px] leading-[1.38] text-slate-600 mt-1 text-justify">
                        {figureExplanations.fig2}
                      </p>
                    </div>

                    {/* Figure 4.3 */}
                    <div className="border border-slate-200 rounded p-2 bg-white">
                      <svg ref={fig3Ref} viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-[132px] block">
                        <rect x="0" y="0" width={svgW} height={svgH} fill="#ffffff" />
                        <line x1={hscPad.left} y1={hscScaleY(0)} x2={svgW - hscPad.right} y2={hscScaleY(0)} stroke="#2563eb" strokeWidth="1.3" strokeDasharray="4,3" />
                        <line x1={hscPad.left} y1={hscScaleY(2)} x2={svgW - hscPad.right} y2={hscScaleY(2)} stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,2" />
                        <line x1={hscPad.left} y1={hscScaleY(-2)} x2={svgW - hscPad.right} y2={hscScaleY(-2)} stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,2" />
                        <line x1={hscPad.left} y1={hscPad.top} x2={hscPad.left} y2={svgH - hscPad.bottom} stroke="#cbd5e1" strokeWidth="1" />
                        <line x1={hscPad.left} y1={svgH - hscPad.bottom} x2={svgW - hscPad.right} y2={svgH - hscPad.bottom} stroke="#cbd5e1" strokeWidth="1" />
                        {audit.homoscedasticityPoints.map((pt, idx) => (
                          <circle
                            key={idx}
                            cx={hscScaleX(pt.fitted)}
                            cy={hscScaleY(pt.stdResidual)}
                            r="3"
                            fill={pt.isOutlier ? '#dc2626' : '#059669'}
                            fillOpacity="0.82"
                          />
                        ))}
                        <text x={svgW / 2} y={svgH - 10} textAnchor="middle" fontSize="9.5" fill="#475569" fontFamily="sans-serif">
                          Fitted Values
                        </text>
                      </svg>
                      <div className="text-[10px] text-slate-900 mt-1">
                        <strong>Figure 4.3.</strong> <em>Residuals vs. Fitted Homoscedasticity Plot</em>
                      </div>
                      <p className="text-[9.5px] leading-[1.38] text-slate-600 mt-1 text-justify">
                        {figureExplanations.fig3}
                      </p>
                    </div>

                    {/* Figure 4.4 */}
                    <div className="border border-slate-200 rounded p-2 bg-white">
                      <svg ref={fig4Ref} viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-[132px] block">
                        <rect x="0" y="0" width={svgW} height={svgH} fill="#ffffff" />
                        <line x1={histPad.left} y1={svgH - histPad.bottom} x2={svgW - histPad.right} y2={svgH - histPad.bottom} stroke="#cbd5e1" strokeWidth="1" />
                        <line x1={histPad.left} y1={histPad.top} x2={histPad.left} y2={svgH - histPad.bottom} stroke="#cbd5e1" strokeWidth="1" />
                        {audit.histogramBins.map((b, idx) => {
                          const bw = histW / Math.max(1, audit.histogramBins.length);
                          const bx = histPad.left + idx * bw + 1.5;
                          const bh = (b.count / maxBinCount) * histH;
                          const by = histPad.top + histH - bh;
                          return (
                            <rect
                              key={idx}
                              x={bx}
                              y={by}
                              width={Math.max(3, bw - 3)}
                              height={Math.max(1, bh)}
                              fill="#6366f1"
                              fillOpacity="0.74"
                            />
                          );
                        })}
                        {histCurvePath && (
                          <path d={histCurvePath} fill="none" stroke="#dc2626" strokeWidth="1.8" />
                        )}
                        <text x={svgW / 2} y={svgH - 10} textAnchor="middle" fontSize="9.5" fill="#475569" fontFamily="sans-serif">
                          Standardized Residual Distribution
                        </text>
                      </svg>
                      <div className="text-[10px] text-slate-900 mt-1">
                        <strong>Figure 4.4.</strong> <em>Residual Distribution &amp; Normal Overlay</em>
                      </div>
                      <p className="text-[9.5px] leading-[1.38] text-slate-600 mt-1 text-justify">
                        {figureExplanations.fig4}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4.5 Effect Size & 4.6 Theoretical Discussion */}
                <div className="space-y-3 text-[11.5px] leading-[1.58] text-slate-800 text-justify">
                  <div>
                    <h3 className="text-[12.5px] font-bold text-slate-900 mb-0.5">
                      4.5 Effect Size &amp; Practical Significance
                    </h3>
                    <p>{synthesisData.effectSizeInterpretation}</p>
                  </div>

                  <div>
                    <h3 className="text-[12.5px] font-bold text-slate-900 mb-0.5">
                      4.6 Theoretical Discussion &amp; Scholarly Implications
                    </h3>
                    <p>{synthesisData.discussionDraft}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-sans text-slate-500">
                <span>University Thesis Submission Format · APA 7th Edition</span>
                <span className="font-semibold text-slate-700">Page 4 of {totalPages}</span>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};
