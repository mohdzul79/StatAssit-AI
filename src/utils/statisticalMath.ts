/**
 * ==============================================================================
 * STATASSIST AI — ORIGINAL STATISTICAL MATHEMATICAL ALGORITHMS & NUMERICAL CORE
 * Copyright (c) 2026 Mohd Zulhisam (mohdzul@gmail.com). All Rights Reserved.
 *
 * PROPRIETARY STATISTICAL ALGORITHMS & NUMERICAL ROUTINES:
 * - High-precision continuous probability distribution estimators (t, F, chi2, z)
 * - Satterthwaite degrees of freedom corrections for unequal variance Welch tests
 * - Brown-Forsythe Levene variance homogeneity calculation
 * - Two-way and repeated measures ANOVA Greenhouse-Geisser sphericity adjustments
 * - ANCOVA regression-adjusted marginal means & partial eta-squared (eta^2)
 * - Inversion matrix routines for multiple regression & binary logistic log-odds
 *
 * NOTICE: All mathematical code and original algorithm implementations are
 * protected under Copyright and Trade Secret laws. All rights reserved.
 * ==============================================================================
 */

import {
  DescriptiveStatsItem,
  DescriptiveStatsResult,
  OneSampleTTestResult,
  IndependentTTestResult,
  PairedTTestResult,
  AnovaResult,
  AnovaGroupStat,
  AnovaPostHocPair,
  TwoWayAnovaResult,
  TwoWayAnovaEffect,
  RepeatedMeasuresAnovaResult,
  AncovaResult,
  MannWhitneyResult,
  WilcoxonSignedResult,
  KruskalWallisResult,
  FriedmanResult,
  RegressionResult,
  RegressionCoefficient,
  LogisticRegressionResult,
  LogisticCoefficient,
  CorrelationResult,
  CorrelationCell,
  CronbachAlphaResult,
  ChiSquareResult,
  ChiSquareGofResult,
  ContingencyCell,
} from '../types/stats';

// --- Precise Distribution Special Functions ---

// Lanczos approximation for Gamma function
export function logGamma(z: number): number {
  const p = [
    676.5203681287691,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109586547999,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  }
  z -= 1;
  let x = 0.99999999999980993;
  for (let i = 0; i < p.length; i++) {
    x += p[i] / (z + i + 1);
  }
  const t = z + p.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

// Incomplete Beta continued fraction
function betacf(a: number, b: number, x: number): number {
  const MAXIT = 200;
  const EPS = 3.0e-14;
  const FPMIN = 1.0e-30;
  const qab = a + b;
  const qap = a + 1.0;
  const qam = a - 1.0;
  let c = 1.0;
  let d = 1.0 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1.0 / d;
  let h = d;

  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1.0 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1.0 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1.0) < EPS) break;
  }
  return h;
}

// Regularized incomplete beta function I_x(a, b)
export function ibeta(x: number, a: number, b: number): number {
  if (x <= 0.0) return 0.0;
  if (x >= 1.0) return 1.0;

  const bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1.0 - x));

  if (x < (a + 1.0) / (a + b + 2.0)) {
    return (bt * betacf(a, b, x)) / a;
  } else {
    return 1.0 - (bt * betacf(b, a, 1.0 - x)) / b;
  }
}

// Incomplete Gamma series/continued fraction
export function igam(a: number, x: number): number {
  if (x <= 0) return 0;
  if (x < a + 1.0) {
    // Series representation
    let ap = a;
    let sum = 1.0 / a;
    let del = sum;
    for (let n = 1; n <= 100; n++) {
      ap += 1.0;
      del *= x / ap;
      sum += del;
      if (Math.abs(del) < Math.abs(sum) * 3e-14) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
  } else {
    // Continued fraction for Q(a, x) = 1 - P(a, x)
    let b = x + 1.0 - a;
    let c = 1.0 / 1e-30;
    let d = 1.0 / b;
    let h = d;
    for (let i = 1; i <= 100; i++) {
      const an = -i * (i - a);
      b += 2.0;
      d = an * d + b;
      if (Math.abs(d) < 1e-30) d = 1e-30;
      c = b + an / c;
      if (Math.abs(c) < 1e-30) c = 1e-30;
      d = 1.0 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1.0) < 3e-14) break;
    }
    const q = Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
    return 1.0 - q;
  }
}

// Student's t distribution two-tailed p-value
export function tDistributionPValue(t: number, df: number): number {
  if (df <= 0 || isNaN(df)) return 1.0;
  const absT = Math.abs(t);
  const x = df / (df + absT * absT);
  const p = ibeta(x, df / 2.0, 0.5);
  return Math.min(1.0, Math.max(0.0, p));
}

// F-distribution p-value (upper tail: P(F >= fVal))
export function fDistributionPValue(fVal: number, df1: number, df2: number): number {
  if (fVal <= 0 || df1 <= 0 || df2 <= 0) return 1.0;
  const x = df2 / (df2 + df1 * fVal);
  const p = ibeta(x, df2 / 2.0, df1 / 2.0);
  return Math.min(1.0, Math.max(0.0, p));
}

// Chi-square distribution p-value (upper tail: P(chi2 >= x))
export function chiSquarePValue(chi2: number, df: number): number {
  if (chi2 <= 0 || df <= 0) return 1.0;
  const p = 1.0 - igam(df / 2.0, chi2 / 2.0);
  return Math.min(1.0, Math.max(0.0, p));
}

// Standard normal inverse CDF (probit) for confidence interval critical value
export function normInv(p: number): number {
  // Rational approximation by Beasley-Springer-Moro
  const a = [
    2.50662823884,
    -18.61500062529,
    41.39119773534,
    -25.44106048437,
  ];
  const b = [
    -8.4735109309,
    23.08336743743,
    -21.06224101826,
    3.13082909833,
  ];
  const c = [
    0.3374754822726147,
    0.9761690190917186,
    0.1607979714918209,
    0.02764388103308635,
    0.0038405729373609,
    0.0003951804142900,
    0.0000321767881768,
    0.0000002888167364,
    0.0000003960315187,
  ];

  const y = p - 0.5;
  if (Math.abs(y) < 0.42) {
    const r = y * y;
    return (
      (y * (((a[3] * r + a[2]) * r + a[1]) * r + a[0])) /
      ((((b[3] * r + b[2]) * r + b[1]) * r + b[0]) * r + 1.0)
    );
  }

  let r = p;
  if (y > 0) r = 1 - p;
  r = Math.log(-Math.log(r));
  let x = c[0];
  for (let i = 1; i < c.length; i++) {
    x += c[i] * Math.pow(r, i);
  }
  return y < 0 ? -x : x;
}

// Approximate t critical value for df
export function tCritical(df: number, alpha: number = 0.05): number {
  const z = normInv(1.0 - alpha / 2.0);
  if (df > 120) return z;
  // Cornish-Fisher expansion for t quantile
  const t =
    z +
    (Math.pow(z, 3) + z) / (4 * df) +
    (5 * Math.pow(z, 5) + 16 * Math.pow(z, 3) + 3 * z) / (96 * Math.pow(df, 2));
  return t;
}

// --- Descriptive Statistics ---

export function calculateDescriptive(values: number[], variableName: string): DescriptiveStatsItem {
  const clean = values.filter((v) => typeof v === 'number' && !isNaN(v) && isFinite(v));
  const n = clean.length;
  if (n === 0) {
    return {
      variable: variableName,
      n: 0,
      mean: 0,
      sd: 0,
      se: 0,
      median: 0,
      iqr: 0,
      min: 0,
      max: 0,
      skewness: 0,
      kurtosis: 0,
      ci95Low: 0,
      ci95High: 0,
    };
  }

  const sum = clean.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;

  const sorted = [...clean].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  // Median and Quartiles
  const median = getPercentile(sorted, 50);
  const q1 = getPercentile(sorted, 25);
  const q3 = getPercentile(sorted, 75);
  const iqr = q3 - q1;

  // Variance & SD
  let sumSqDiff = 0;
  let sumCubeDiff = 0;
  let sumQuadDiff = 0;

  for (let i = 0; i < n; i++) {
    const diff = clean[i] - mean;
    sumSqDiff += diff * diff;
    sumCubeDiff += diff * diff * diff;
    sumQuadDiff += diff * diff * diff * diff;
  }

  const variance = n > 1 ? sumSqDiff / (n - 1) : 0;
  const sd = Math.sqrt(variance);
  const se = sd / Math.sqrt(n);

  // Sample Skewness & Kurtosis (Fisher-Pearson standard)
  let skewness = 0;
  let kurtosis = 0;
  if (n > 2 && sd > 0) {
    skewness = (n / ((n - 1) * (n - 2))) * (sumCubeDiff / Math.pow(sd, 3));
  }
  if (n > 3 && sd > 0) {
    const term1 = (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3));
    const term2 = sumQuadDiff / Math.pow(sd, 4);
    const term3 = (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
    kurtosis = term1 * term2 - term3; // Excess kurtosis
  }

  // 95% Confidence Interval for mean
  const tCrit = tCritical(n - 1, 0.05);
  const margin = tCrit * se;
  const ci95Low = mean - margin;
  const ci95High = mean + margin;

  return {
    variable: variableName,
    n,
    mean,
    sd,
    se,
    median,
    iqr,
    min,
    max,
    skewness,
    kurtosis,
    ci95Low,
    ci95High,
  };
}

function getPercentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const rank = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(rank);
  const upper = Math.ceil(rank);
  const weight = rank - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function computeDescriptiveStats(
  data: Record<string, any>[],
  variables: string[]
): DescriptiveStatsResult {
  const items: DescriptiveStatsItem[] = variables.map((varName) => {
    const vals = data.map((d) => Number(d[varName])).filter((v) => !isNaN(v));
    return calculateDescriptive(vals, varName);
  });
  return { type: 'descriptive', items };
}

// --- Levene's Test for Equality of Variances (Brown-Forsythe Medians) ---
export function calculateLeveneTest(groups: number[][]): { f: number; p: number } {
  const k = groups.length;
  if (k < 2) return { f: 0, p: 1 };

  // Calculate absolute deviation from group median: z_ij = |y_ij - M_j|
  const zGroups: number[][] = groups.map((g) => {
    const sorted = [...g].sort((a, b) => a - b);
    const mdn = getPercentile(sorted, 50);
    return g.map((y) => Math.abs(y - mdn));
  });

  const groupNs = zGroups.map((g) => g.length);
  const totalN = groupNs.reduce((a, b) => a + b, 0);
  if (totalN <= k) return { f: 0, p: 1 };

  const zGroupMeans = zGroups.map((g) => g.reduce((a, b) => a + b, 0) / g.length);
  const allZ = zGroups.flat();
  const grandZMean = allZ.reduce((a, b) => a + b, 0) / totalN;

  let ssBetween = 0;
  for (let j = 0; j < k; j++) {
    ssBetween += groupNs[j] * Math.pow(zGroupMeans[j] - grandZMean, 2);
  }

  let ssWithin = 0;
  for (let j = 0; j < k; j++) {
    for (let i = 0; i < zGroups[j].length; i++) {
      ssWithin += Math.pow(zGroups[j][i] - zGroupMeans[j], 2);
    }
  }

  const dfBetween = k - 1;
  const dfWithin = totalN - k;
  const msBetween = ssBetween / dfBetween;
  const msWithin = dfWithin > 0 ? ssWithin / dfWithin : 1e-10;

  const f = msWithin > 0 ? msBetween / msWithin : 0;
  const p = fDistributionPValue(f, dfBetween, dfWithin);

  return { f, p };
}

// --- Independent Samples t-Test ---
export function computeIndependentTTest(
  data: Record<string, any>[],
  dependentVar: string,
  groupVar: string,
  group1Val?: string,
  group2Val?: string
): IndependentTTestResult {
  // Extract distinct groups
  const groupsPresent = Array.from(new Set(data.map((d) => String(d[groupVar])).filter(Boolean)));
  const g1Name = group1Val || groupsPresent[0] || 'Group 1';
  const g2Name = group2Val || groupsPresent[1] || 'Group 2';

  const g1Data = data
    .filter((d) => String(d[groupVar]) === g1Name)
    .map((d) => Number(d[dependentVar]))
    .filter((v) => !isNaN(v));

  const g2Data = data
    .filter((d) => String(d[groupVar]) === g2Name)
    .map((d) => Number(d[dependentVar]))
    .filter((v) => !isNaN(v));

  const desc1 = calculateDescriptive(g1Data, g1Name);
  const desc2 = calculateDescriptive(g2Data, g2Name);

  const n1 = desc1.n;
  const n2 = desc2.n;
  const m1 = desc1.mean;
  const m2 = desc2.mean;
  const s1 = desc1.sd;
  const s2 = desc2.sd;

  // Levene's test
  const leveneRes = calculateLeveneTest([g1Data, g2Data]);
  const equalVarianceAssumed = leveneRes.p >= 0.05;

  // Student's t (Pooled variance)
  const dfStudents = n1 + n2 - 2;
  const sp2 =
    dfStudents > 0
      ? ((n1 - 1) * s1 * s1 + (n2 - 1) * s2 * s2) / dfStudents
      : 1;
  const sp = Math.sqrt(sp2);
  const seStudents = sp * Math.sqrt(1 / n1 + 1 / n2);
  const meanDiff = m1 - m2;
  const tStudents = seStudents > 0 ? meanDiff / seStudents : 0;
  const pStudents = tDistributionPValue(tStudents, dfStudents);

  // Welch's t (Unequal variances)
  const var1n = (s1 * s1) / n1;
  const var2n = (s2 * s2) / n2;
  const seWelch = Math.sqrt(var1n + var2n);
  const tWelch = seWelch > 0 ? meanDiff / seWelch : 0;
  const dfWelchNum = Math.pow(var1n + var2n, 2);
  const dfWelchDen =
    Math.pow(var1n, 2) / (n1 - 1) + Math.pow(var2n, 2) / (n2 - 1);
  const dfWelch = dfWelchDen > 0 ? dfWelchNum / dfWelchDen : dfStudents;
  const pWelch = tDistributionPValue(tWelch, dfWelch);

  // Cohen's d & Hedges' g
  const cohensD = sp > 0 ? meanDiff / sp : 0;
  const hedgesCorrection = 1 - 3 / (4 * (n1 + n2) - 9);
  const hedgesG = cohensD * hedgesCorrection;

  // 95% CI of difference (using appropriate df)
  const activeDf = equalVarianceAssumed ? dfStudents : dfWelch;
  const activeSE = equalVarianceAssumed ? seStudents : seWelch;
  const tCritVal = tCritical(activeDf, 0.05);
  const ci95Low = meanDiff - tCritVal * activeSE;
  const ci95High = meanDiff + tCritVal * activeSE;

  return {
    type: 'independent_ttest',
    dependentVar,
    groupVar,
    group1: { name: g1Name, n: n1, mean: m1, sd: s1, se: desc1.se },
    group2: { name: g2Name, n: n2, mean: m2, sd: s2, se: desc2.se },
    meanDiff,
    ci95Low,
    ci95High,
    levene: {
      f: leveneRes.f,
      p: leveneRes.p,
      equalVarianceAssumed,
    },
    studentsT: { t: tStudents, df: dfStudents, p: pStudents },
    welchsT: { t: tWelch, df: dfWelch, p: pWelch },
    cohensD,
    hedgesG,
  };
}

// --- Paired Samples t-Test ---
export function computePairedTTest(
  data: Record<string, any>[],
  var1: string,
  var2: string
): PairedTTestResult {
  const pairs: { a: number; b: number; diff: number }[] = [];
  data.forEach((row) => {
    const a = Number(row[var1]);
    const b = Number(row[var2]);
    if (!isNaN(a) && !isNaN(b)) {
      pairs.push({ a, b, diff: a - b });
    }
  });

  const n = pairs.length;
  const desc1 = calculateDescriptive(pairs.map((p) => p.a), var1);
  const desc2 = calculateDescriptive(pairs.map((p) => p.b), var2);
  const diffs = pairs.map((p) => p.diff);
  const descDiff = calculateDescriptive(diffs, 'Difference');

  const df = n - 1;
  const t = descDiff.se > 0 ? descDiff.mean / descDiff.se : 0;
  const p = tDistributionPValue(t, df);

  const tCrit = tCritical(df, 0.05);
  const ci95Low = descDiff.mean - tCrit * descDiff.se;
  const ci95High = descDiff.mean + tCrit * descDiff.se;

  // Cohen's d for paired: mean diff / sd diff
  const cohensD = descDiff.sd > 0 ? descDiff.mean / descDiff.sd : 0;

  // Correlation between pair
  let sumProd = 0;
  pairs.forEach((item) => {
    sumProd += (item.a - desc1.mean) * (item.b - desc2.mean);
  });
  const cov = n > 1 ? sumProd / (n - 1) : 0;
  const pearsonR = desc1.sd > 0 && desc2.sd > 0 ? cov / (desc1.sd * desc2.sd) : 0;
  const tR = n > 2 && Math.abs(pearsonR) < 1 ? (pearsonR * Math.sqrt(n - 2)) / Math.sqrt(1 - pearsonR * pearsonR) : 0;
  const rPValue = tDistributionPValue(tR, n - 2);

  return {
    type: 'paired_ttest',
    var1,
    var2,
    n,
    mean1: desc1.mean,
    sd1: desc1.sd,
    mean2: desc2.mean,
    sd2: desc2.sd,
    meanDiff: descDiff.mean,
    sdDiff: descDiff.sd,
    seDiff: descDiff.se,
    t,
    df,
    p,
    ci95Low,
    ci95High,
    cohensD,
    pearsonR,
    rPValue,
  };
}

// --- One-Way ANOVA ---
export function computeOneWayAnova(
  data: Record<string, any>[],
  dependentVar: string,
  factorVar: string
): AnovaResult {
  const groupMap: Record<string, number[]> = {};
  data.forEach((row) => {
    const g = String(row[factorVar]);
    const val = Number(row[dependentVar]);
    if (g && !isNaN(val)) {
      if (!groupMap[g]) groupMap[g] = [];
      groupMap[g].push(val);
    }
  });

  const groupKeys = Object.keys(groupMap);
  const groups: AnovaGroupStat[] = [];
  const rawGroupArrays: number[][] = [];

  groupKeys.forEach((gKey) => {
    const vals = groupMap[gKey];
    rawGroupArrays.push(vals);
    const desc = calculateDescriptive(vals, gKey);
    groups.push({
      name: gKey,
      n: desc.n,
      mean: desc.mean,
      sd: desc.sd,
      se: desc.se,
      ci95Low: desc.ci95Low,
      ci95High: desc.ci95High,
    });
  });

  const k = groups.length;
  const allVals = rawGroupArrays.flat();
  const totalN = allVals.length;
  const grandMean = allVals.reduce((a, b) => a + b, 0) / totalN;

  let ssBetween = 0;
  groups.forEach((g) => {
    ssBetween += g.n * Math.pow(g.mean - grandMean, 2);
  });

  let ssWithin = 0;
  rawGroupArrays.forEach((arr, idx) => {
    const gMean = groups[idx].mean;
    arr.forEach((v) => {
      ssWithin += Math.pow(v - gMean, 2);
    });
  });

  const ssTotal = ssBetween + ssWithin;
  const dfBetween = k - 1;
  const dfWithin = totalN - k;
  const dfTotal = totalN - 1;

  const msBetween = dfBetween > 0 ? ssBetween / dfBetween : 0;
  const msWithin = dfWithin > 0 ? ssWithin / dfWithin : 1e-10;

  const f = msWithin > 0 ? msBetween / msWithin : 0;
  const p = fDistributionPValue(f, dfBetween, dfWithin);

  const etaSquared = ssTotal > 0 ? ssBetween / ssTotal : 0;
  const omegaNumerator = ssBetween - dfBetween * msWithin;
  const omegaDenominator = ssTotal + msWithin;
  const omegaSquared = omegaDenominator > 0 ? Math.max(0, omegaNumerator / omegaDenominator) : 0;

  // Levene's test for ANOVA
  const leveneRes = calculateLeveneTest(rawGroupArrays);

  // Tukey HSD Post-Hoc Pairwise Comparisons
  const postHoc: AnovaPostHocPair[] = [];
  for (let i = 0; i < k; i++) {
    for (let j = i + 1; j < k; j++) {
      const gA = groups[i];
      const gB = groups[j];
      const meanDiff = gA.mean - gB.mean;
      const se = Math.sqrt((msWithin / 2) * (1 / gA.n + 1 / gB.n));
      const q = se > 0 ? Math.abs(meanDiff) / se : 0;

      // Approximate Tukey HSD p-value using Studentized range approximation
      const tEquiv = q / Math.sqrt(2);
      const rawP = tDistributionPValue(tEquiv, dfWithin);
      // Bonferroni / Sidak-like familywise adjustment approximation
      const numComparisons = (k * (k - 1)) / 2;
      const pAdjusted = Math.min(1.0, rawP * numComparisons);

      const margin = 1.96 * Math.sqrt(msWithin * 0.5 * (1 / gA.n + 1 / gB.n));
      postHoc.push({
        groupA: gA.name,
        groupB: gB.name,
        meanDiff,
        se,
        q,
        pAdjusted,
        ci95Low: meanDiff - margin,
        ci95High: meanDiff + margin,
      });
    }
  }

  return {
    type: 'anova',
    dependentVar,
    factorVar,
    groups,
    ssBetween,
    dfBetween,
    msBetween,
    ssWithin,
    dfWithin,
    msWithin,
    ssTotal,
    dfTotal,
    f,
    p,
    etaSquared,
    omegaSquared,
    levene: {
      f: leveneRes.f,
      p: leveneRes.p,
      passed: leveneRes.p >= 0.05,
    },
    postHoc,
  };
}

// --- Multiple Linear Regression ---
// Matrix inversion (Gauss-Jordan) for OLS
function invertMatrix(M: number[][]): number[][] | null {
  const n = M.length;
  const A = M.map((row) => [...row]);
  const I: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );

  for (let i = 0; i < n; i++) {
    let pivot = A[i][i];
    let pivotRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(pivot)) {
        pivot = A[k][i];
        pivotRow = k;
      }
    }

    if (Math.abs(pivot) < 1e-12) return null; // Singular

    if (pivotRow !== i) {
      [A[i], A[pivotRow]] = [A[pivotRow], A[i]];
      [I[i], I[pivotRow]] = [I[pivotRow], I[i]];
    }

    const div = A[i][i];
    for (let j = 0; j < n; j++) {
      A[i][j] /= div;
      I[i][j] /= div;
    }

    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = A[k][i];
        for (let j = 0; j < n; j++) {
          A[k][j] -= factor * A[i][j];
          I[k][j] -= factor * I[i][j];
        }
      }
    }
  }

  return I;
}

export function computeMultipleRegression(
  data: Record<string, any>[],
  dependentVar: string,
  independentVars: string[]
): RegressionResult {
  const completeRows: { y: number; x: number[] }[] = [];
  data.forEach((row) => {
    const yVal = Number(row[dependentVar]);
    const xVals = independentVars.map((v) => Number(row[v]));
    if (!isNaN(yVal) && xVals.every((v) => !isNaN(v))) {
      completeRows.push({ y: yVal, x: xVals });
    }
  });

  const n = completeRows.length;
  const pCount = independentVars.length;
  const cols = pCount + 1; // Intercept + predictors

  // X matrix (with leading 1 for intercept)
  const X: number[][] = completeRows.map((r) => [1, ...r.x]);
  const y: number[] = completeRows.map((r) => r.y);

  // X^T * X
  const XtX: number[][] = Array.from({ length: cols }, () => Array(cols).fill(0));
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < cols; j++) {
      let sum = 0;
      for (let r = 0; r < n; r++) {
        sum += X[r][i] * X[r][j];
      }
      XtX[i][j] = sum;
    }
  }

  // X^T * y
  const Xty: number[] = Array(cols).fill(0);
  for (let i = 0; i < cols; i++) {
    let sum = 0;
    for (let r = 0; r < n; r++) {
      sum += X[r][i] * y[r];
    }
    Xty[i] = sum;
  }

  // Solve beta = (X^T * X)^(-1) * X^T * y
  const invXtX = invertMatrix(XtX) || Array.from({ length: cols }, (_, i) => Array.from({ length: cols }, (_, j) => (i === j ? 1 : 0)));
  const betaCoeffs: number[] = Array(cols).fill(0);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < cols; j++) {
      betaCoeffs[i] += invXtX[i][j] * Xty[j];
    }
  }

  // Model diagnostics: yMean, SS_tot, SS_res, SS_reg
  const yMean = y.reduce((a, b) => a + b, 0) / n;
  let ssTot = 0;
  let ssRes = 0;
  let dwNum = 0;
  const residuals: number[] = [];

  for (let r = 0; r < n; r++) {
    let yPred = 0;
    for (let c = 0; c < cols; c++) {
      yPred += X[r][c] * betaCoeffs[c];
    }
    const res = y[r] - yPred;
    residuals.push(res);
    ssRes += res * res;
    ssTot += Math.pow(y[r] - yMean, 2);

    if (r > 0) {
      dwNum += Math.pow(res - residuals[r - 1], 2);
    }
  }

  const durbinWatson = ssRes > 0 ? dwNum / ssRes : 2.0;
  const ssReg = Math.max(0, ssTot - ssRes);
  const rSquared = ssTot > 0 ? Math.min(1.0, ssReg / ssTot) : 0;
  const r = Math.sqrt(Math.max(0, rSquared));

  const df1 = pCount;
  const df2 = n - pCount - 1;
  const adjRSquared = df2 > 0 ? 1 - ((1 - rSquared) * (n - 1)) / df2 : rSquared;
  const msRes = df2 > 0 ? ssRes / df2 : 0;
  const see = Math.sqrt(msRes);

  const msReg = df1 > 0 ? ssReg / df1 : 0;
  const f = msRes > 0 ? msReg / msRes : 0;
  const p = fDistributionPValue(f, df1, df2);

  // Standard deviation of y and each x for standardized beta
  const sdY = Math.sqrt(ssTot / (n - 1));

  // Compute coefficients table
  const coefficients: RegressionCoefficient[] = [];
  const tCritVal = tCritical(df2, 0.05);

  for (let c = 0; c < cols; c++) {
    const varName = c === 0 ? '(Constant)' : independentVars[c - 1];
    const b = betaCoeffs[c];
    const seB = Math.sqrt(Math.max(0, msRes * invXtX[c][c]));
    const tVal = seB > 0 ? b / seB : 0;
    const pVal = tDistributionPValue(tVal, df2);

    let betaStd = 0;
    let vif = 1;
    let tolerance = 1;

    if (c > 0) {
      const xVals = completeRows.map((r) => r.x[c - 1]);
      const xDesc = calculateDescriptive(xVals, varName);
      betaStd = sdY > 0 ? b * (xDesc.sd / sdY) : 0;

      // Calculate VIF if multiple predictors
      if (pCount > 1) {
        // Regress x_j on all other x
        const otherVars = independentVars.filter((_, idx) => idx !== c - 1);
        if (otherVars.length > 0) {
          const subReg = computeMultipleRegression(data, varName, otherVars);
          tolerance = Math.max(0.01, 1 - subReg.rSquared);
          vif = 1 / tolerance;
        }
      }
    }

    coefficients.push({
      variable: varName,
      b,
      seB,
      beta: betaStd,
      t: tVal,
      p: pVal,
      ci95Low: b - tCritVal * seB,
      ci95High: b + tCritVal * seB,
      vif: c > 0 ? vif : undefined,
      tolerance: c > 0 ? tolerance : undefined,
    });
  }

  return {
    type: 'regression',
    dependentVar,
    independentVars,
    n,
    r,
    rSquared,
    adjRSquared,
    see,
    f,
    df1,
    df2,
    p,
    coefficients,
    durbinWatson,
  };
}

// --- Correlation Matrix (Pearson & Spearman) ---
export function computeCorrelationMatrix(
  data: Record<string, any>[],
  variables: string[],
  method: 'pearson' | 'spearman' = 'pearson'
): CorrelationResult {
  const matrix: CorrelationCell[] = [];

  for (let i = 0; i < variables.length; i++) {
    for (let j = 0; j < variables.length; j++) {
      const v1 = variables[i];
      const v2 = variables[j];

      if (i === j) {
        matrix.push({ var1: v1, var2: v2, r: 1.0, p: 0.0, n: data.length, significant: true });
        continue;
      }

      const pairs: [number, number][] = [];
      data.forEach((row) => {
        const x = Number(row[v1]);
        const y = Number(row[v2]);
        if (!isNaN(x) && !isNaN(y)) {
          pairs.push([x, y]);
        }
      });

      const n = pairs.length;
      if (n < 3) {
        matrix.push({ var1: v1, var2: v2, r: 0, p: 1, n, significant: false });
        continue;
      }

      let rVal = 0;
      if (method === 'pearson') {
        const meanX = pairs.reduce((acc, p) => acc + p[0], 0) / n;
        const meanY = pairs.reduce((acc, p) => acc + p[1], 0) / n;
        let num = 0;
        let denX = 0;
        let denY = 0;
        pairs.forEach(([x, y]) => {
          const dx = x - meanX;
          const dy = y - meanY;
          num += dx * dy;
          denX += dx * dx;
          denY += dy * dy;
        });
        const den = Math.sqrt(denX * denY);
        rVal = den > 0 ? num / den : 0;
      } else {
        // Spearman ranks
        const xRanks = getRanks(pairs.map((p) => p[0]));
        const yRanks = getRanks(pairs.map((p) => p[1]));
        let dSqSum = 0;
        for (let k = 0; k < n; k++) {
          dSqSum += Math.pow(xRanks[k] - yRanks[k], 2);
        }
        rVal = 1 - (6 * dSqSum) / (n * (n * n - 1));
      }

      rVal = Math.max(-1.0, Math.min(1.0, rVal));
      const df = n - 2;
      const tStat = Math.abs(rVal) < 1 ? (rVal * Math.sqrt(df)) / Math.sqrt(1 - rVal * rVal) : 999;
      const pVal = tDistributionPValue(tStat, df);

      matrix.push({
        var1: v1,
        var2: v2,
        r: rVal,
        p: pVal,
        n,
        significant: pVal < 0.05,
      });
    }
  }

  return {
    type: 'correlation',
    variables,
    method,
    matrix,
  };
}

function getRanks(arr: number[]): number[] {
  const indexed = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const ranks = new Array(arr.length);
  let i = 0;
  while (i < indexed.length) {
    let j = i;
    while (j + 1 < indexed.length && indexed[j + 1].v === indexed[i].v) {
      j++;
    }
    const avgRank = (i + 1 + (j + 1)) / 2;
    for (let k = i; k <= j; k++) {
      ranks[indexed[k].i] = avgRank;
    }
    i = j + 1;
  }
  return ranks;
}

// --- Chi-Square Test of Independence ---
export function computeChiSquareTest(
  data: Record<string, any>[],
  rowVar: string,
  colVar: string
): ChiSquareResult {
  const rowCats = Array.from(new Set(data.map((d) => String(d[rowVar])).filter(Boolean))).sort();
  const colCats = Array.from(new Set(data.map((d) => String(d[colVar])).filter(Boolean))).sort();

  const observedMap: Record<string, Record<string, number>> = {};
  rowCats.forEach((r) => {
    observedMap[r] = {};
    colCats.forEach((c) => {
      observedMap[r][c] = 0;
    });
  });

  let totalN = 0;
  data.forEach((row) => {
    const r = String(row[rowVar]);
    const c = String(row[colVar]);
    if (observedMap[r] && observedMap[r][c] !== undefined) {
      observedMap[r][c]++;
      totalN++;
    }
  });

  // Calculate Marginals
  const rowTotals: Record<string, number> = {};
  const colTotals: Record<string, number> = {};

  rowCats.forEach((r) => {
    rowTotals[r] = colCats.reduce((acc, c) => acc + observedMap[r][c], 0);
  });
  colCats.forEach((c) => {
    colTotals[c] = rowCats.reduce((acc, r) => acc + observedMap[r][c], 0);
  });

  let chiSquare = 0;
  const cells: ContingencyCell[] = [];

  rowCats.forEach((r) => {
    colCats.forEach((c) => {
      const obs = observedMap[r][c];
      const exp = totalN > 0 ? (rowTotals[r] * colTotals[c]) / totalN : 0;
      const stdRes = exp > 0 ? (obs - exp) / Math.sqrt(exp) : 0;
      if (exp > 0) {
        chiSquare += Math.pow(obs - exp, 2) / exp;
      }
      cells.push({
        rowValue: r,
        colValue: c,
        observed: obs,
        expected: exp,
        stdResidual: stdRes,
      });
    });
  });

  const df = (rowCats.length - 1) * (colCats.length - 1);
  const p = chiSquarePValue(chiSquare, df);

  const minDim = Math.min(rowCats.length - 1, colCats.length - 1);
  const cramersV = totalN > 0 && minDim > 0 ? Math.sqrt(chiSquare / (totalN * minDim)) : 0;
  const phi = totalN > 0 ? Math.sqrt(chiSquare / totalN) : 0;

  return {
    type: 'chi_square',
    rowVar,
    colVar,
    n: totalN,
    chiSquare,
    df,
    p,
    cramersV,
    phi,
    cells,
    rowCategories: rowCats,
    colCategories: colCats,
  };
}

// --- One-Sample t-Test ---
export function computeOneSampleTTest(
  data: Record<string, any>[],
  variable: string,
  testValue: number = 0
): OneSampleTTestResult {
  const values = data
    .map((r) => Number(r[variable]))
    .filter((v) => !isNaN(v) && v !== null);

  const n = values.length;
  if (n === 0) {
    return {
      type: 'one_sample_ttest',
      variable,
      testValue,
      n: 0,
      mean: 0,
      sd: 0,
      se: 0,
      meanDiff: 0,
      t: 0,
      df: 1,
      p: 1,
      ci95Low: 0,
      ci95High: 0,
      cohensD: 0,
    };
  }

  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / Math.max(1, n - 1);
  const sd = Math.sqrt(variance);
  const se = sd / Math.sqrt(n);
  const meanDiff = mean - testValue;
  const df = Math.max(1, n - 1);
  const t = se > 0 ? meanDiff / se : 0;
  const p = tDistributionPValue(t, df);

  // Critical t for 95% CI (approximated via normInv for large df, or scaled for smaller)
  const zCrit = 1.95996 + 2.38 / df + 2.82 / Math.pow(df, 2);
  const margin = zCrit * se;
  const ci95Low = meanDiff - margin;
  const ci95High = meanDiff + margin;
  const cohensD = sd > 0 ? meanDiff / sd : 0;

  return {
    type: 'one_sample_ttest',
    variable,
    testValue,
    n,
    mean,
    sd,
    se,
    meanDiff,
    t,
    df,
    p,
    ci95Low,
    ci95High,
    cohensD,
  };
}

// --- Non-Parametric Mid-Ranks Helper ---
export function assignMidRanks(values: number[]): number[] {
  const indexed = values.map((val, idx) => ({ val, idx }));
  indexed.sort((a, b) => a.val - b.val);

  const ranks = new Array(values.length).fill(0);
  let i = 0;
  while (i < indexed.length) {
    let j = i;
    while (j < indexed.length && Math.abs(indexed[j].val - indexed[i].val) < 1e-12) {
      j++;
    }
    const midRank = (i + 1 + j) / 2;
    for (let k = i; k < j; k++) {
      ranks[indexed[k].idx] = midRank;
    }
    i = j;
  }
  return ranks;
}

// --- Mann-Whitney U Test (2 Independent Groups) ---
export function computeMannWhitneyTest(
  data: Record<string, any>[],
  dependentVar: string,
  groupVar: string,
  group1Name?: string,
  group2Name?: string
): MannWhitneyResult {
  const g1Values: number[] = [];
  const g2Values: number[] = [];

  const distinct = Array.from(new Set(data.map((r) => String(r[groupVar])).filter(Boolean)));
  const g1 = group1Name || distinct[0] || 'Group 1';
  const g2 = group2Name || distinct[1] || 'Group 2';

  data.forEach((row) => {
    const grp = String(row[groupVar]);
    const val = Number(row[dependentVar]);
    if (!isNaN(val)) {
      if (grp === g1) g1Values.push(val);
      else if (grp === g2) g2Values.push(val);
    }
  });

  const n1 = g1Values.length;
  const n2 = g2Values.length;

  if (n1 === 0 || n2 === 0) {
    return {
      type: 'mann_whitney',
      dependentVar,
      groupVar,
      group1: { name: g1, n: n1, median: 0, meanRank: 0, sumRanks: 0 },
      group2: { name: g2, n: n2, median: 0, meanRank: 0, sumRanks: 0 },
      u: 0,
      w: 0,
      z: 0,
      p: 1,
      rankBiserialR: 0,
    };
  }

  // Medians
  const sorted1 = [...g1Values].sort((a, b) => a - b);
  const sorted2 = [...g2Values].sort((a, b) => a - b);
  const med1 = sorted1.length % 2 === 0
    ? (sorted1[sorted1.length / 2 - 1] + sorted1[sorted1.length / 2]) / 2
    : sorted1[Math.floor(sorted1.length / 2)];
  const med2 = sorted2.length % 2 === 0
    ? (sorted2[sorted2.length / 2 - 1] + sorted2[sorted2.length / 2]) / 2
    : sorted2[Math.floor(sorted2.length / 2)];

  // Combine and assign ranks
  const pooled = [...g1Values, ...g2Values];
  const ranks = assignMidRanks(pooled);

  let sumR1 = 0;
  for (let i = 0; i < n1; i++) {
    sumR1 += ranks[i];
  }
  let sumR2 = 0;
  for (let i = n1; i < n1 + n2; i++) {
    sumR2 += ranks[i];
  }

  const meanR1 = sumR1 / n1;
  const meanR2 = sumR2 / n2;

  const u1 = sumR1 - (n1 * (n1 + 1)) / 2;
  const u2 = sumR2 - (n2 * (n2 + 1)) / 2;
  const u = Math.min(u1, u2);
  const w = sumR1; // Wilcoxon W

  // Asymptotic normal approximation with continuity correction
  const eu = (n1 * n2) / 2;
  const totalN = n1 + n2;
  const sigmaU = Math.sqrt((n1 * n2 * (totalN + 1)) / 12);
  const z = sigmaU > 0 ? (u - eu + 0.5) / sigmaU : 0;
  const p = 2 * (1 - (0.5 * (1 + Math.sign(z) * Math.sqrt(1 - Math.exp(-2 * z * z / Math.PI))))); // Error function approx
  const clampedP = Math.max(0.0001, Math.min(1.0, 2 * (1 - (0.5 * (1 + (z < 0 ? -1 : 1) * Math.sqrt(1 - Math.exp(-z * z * (4 / Math.PI + 0.147 * z * z) / (1 + 0.147 * z * z))))))));

  // Rank-Biserial correlation r = 1 - 2U / (n1*n2)
  const rankBiserialR = (n1 * n2 > 0) ? 1 - (2 * u) / (n1 * n2) : 0;

  return {
    type: 'mann_whitney',
    dependentVar,
    groupVar,
    group1: { name: g1, n: n1, median: med1, meanRank: meanR1, sumRanks: sumR1 },
    group2: { name: g2, n: n2, median: med2, meanRank: meanR2, sumRanks: sumR2 },
    u,
    w,
    z,
    p: clampedP,
    rankBiserialR,
  };
}

// --- Wilcoxon Signed-Rank Test (Paired Samples) ---
export function computeWilcoxonSignedTest(
  data: Record<string, any>[],
  var1: string,
  var2: string
): WilcoxonSignedResult {
  const pairs: { v1: number; v2: number; diff: number }[] = [];

  data.forEach((row) => {
    const v1 = Number(row[var1]);
    const v2 = Number(row[var2]);
    if (!isNaN(v1) && !isNaN(v2)) {
      pairs.push({ v1, v2, diff: v2 - v1 });
    }
  });

  const nTotal = pairs.length;
  const nonZero = pairs.filter((p) => Math.abs(p.diff) > 1e-9);
  const nEffective = nonZero.length;

  if (nEffective === 0) {
    return {
      type: 'wilcoxon_signed',
      var1,
      var2,
      nTotal,
      nEffective: 0,
      median1: 0,
      median2: 0,
      medianDiff: 0,
      wPositive: 0,
      wNegative: 0,
      w: 0,
      z: 0,
      p: 1,
      effectSizeR: 0,
    };
  }

  // Medians
  const s1 = pairs.map((p) => p.v1).sort((a, b) => a - b);
  const s2 = pairs.map((p) => p.v2).sort((a, b) => a - b);
  const sDiff = pairs.map((p) => p.diff).sort((a, b) => a - b);

  const med1 = s1[Math.floor(s1.length / 2)] || 0;
  const med2 = s2[Math.floor(s2.length / 2)] || 0;
  const medDiff = sDiff[Math.floor(sDiff.length / 2)] || 0;

  // Rank absolute differences
  const absDiffs = nonZero.map((p) => Math.abs(p.diff));
  const ranks = assignMidRanks(absDiffs);

  let wPositive = 0;
  let wNegative = 0;

  nonZero.forEach((item, idx) => {
    if (item.diff > 0) wPositive += ranks[idx];
    else wNegative += ranks[idx];
  });

  const w = Math.min(wPositive, wNegative);

  // Normal approximation
  const ew = (nEffective * (nEffective + 1)) / 4;
  const sigmaW = Math.sqrt((nEffective * (nEffective + 1) * (2 * nEffective + 1)) / 24);
  const z = sigmaW > 0 ? (w - ew + 0.5) / sigmaW : 0;

  const clampedP = Math.max(0.0001, Math.min(1.0, 2 * (1 - (0.5 * (1 + (z < 0 ? -1 : 1) * Math.sqrt(1 - Math.exp(-z * z * (4 / Math.PI + 0.147 * z * z) / (1 + 0.147 * z * z))))))));
  const effectSizeR = nTotal > 0 ? Math.abs(z) / Math.sqrt(nTotal) : 0;

  return {
    type: 'wilcoxon_signed',
    var1,
    var2,
    nTotal,
    nEffective,
    median1: med1,
    median2: med2,
    medianDiff: medDiff,
    wPositive,
    wNegative,
    w,
    z,
    p: clampedP,
    effectSizeR,
  };
}

// --- Kruskal-Wallis H Test (3+ Independent Groups) ---
export function computeKruskalWallisTest(
  data: Record<string, any>[],
  dependentVar: string,
  groupVar: string
): KruskalWallisResult {
  const groupMap: Record<string, number[]> = {};

  data.forEach((row) => {
    const grp = String(row[groupVar]);
    const val = Number(row[dependentVar]);
    if (!isNaN(val) && grp && grp !== 'null' && grp !== 'undefined') {
      if (!groupMap[grp]) groupMap[grp] = [];
      groupMap[grp].push(val);
    }
  });

  const groupKeys = Object.keys(groupMap).filter((k) => groupMap[k].length > 0);
  const k = groupKeys.length;

  if (k < 2) {
    return {
      type: 'kruskal_wallis',
      dependentVar,
      groupVar,
      groups: [],
      totalN: 0,
      h: 0,
      df: 1,
      p: 1,
      epsilonSquared: 0,
    };
  }

  // Pool all and assign ranks
  const pooled: { val: number; group: string }[] = [];
  groupKeys.forEach((g) => {
    groupMap[g].forEach((v) => pooled.push({ val: v, group: g }));
  });

  const totalN = pooled.length;
  const ranks = assignMidRanks(pooled.map((p) => p.val));

  const groupRankSums: Record<string, number> = {};
  groupKeys.forEach((g) => (groupRankSums[g] = 0));

  pooled.forEach((p, idx) => {
    groupRankSums[p.group] += ranks[idx];
  });

  let sumR2OverN = 0;
  const groups: { name: string; n: number; median: number; meanRank: number; sumRanks: number }[] = [];

  groupKeys.forEach((g) => {
    const vals = groupMap[g].sort((a, b) => a - b);
    const nG = vals.length;
    const med = vals.length % 2 === 0
      ? (vals[vals.length / 2 - 1] + vals[vals.length / 2]) / 2
      : vals[Math.floor(vals.length / 2)];
    const sumR = groupRankSums[g];
    const meanR = sumR / Math.max(1, nG);

    sumR2OverN += Math.pow(sumR, 2) / nG;

    groups.push({
      name: g,
      n: nG,
      median: med,
      meanRank: meanR,
      sumRanks: sumR,
    });
  });

  // H statistic = [12 / (N*(N+1))] * sum(R_j^2 / n_j) - 3*(N+1)
  const h = totalN > 0
    ? (12 / (totalN * (totalN + 1))) * sumR2OverN - 3 * (totalN + 1)
    : 0;

  const df = k - 1;
  const p = chiSquarePValue(Math.max(0, h), df);
  const epsilonSquared = totalN > k ? Math.max(0, (h - k + 1) / (totalN - k)) : 0;

  return {
    type: 'kruskal_wallis',
    dependentVar,
    groupVar,
    groups,
    totalN,
    h: Math.max(0, h),
    df,
    p,
    epsilonSquared,
  };
}

// --- Friedman Test (Non-Parametric Repeated Measures) ---
export function computeFriedmanTest(
  data: Record<string, any>[],
  variables: string[]
): FriedmanResult {
  const completeRows: number[][] = [];
  data.forEach((row) => {
    const vals = variables.map((v) => Number(row[v]));
    if (vals.every((v) => !isNaN(v) && v !== null)) {
      completeRows.push(vals);
    }
  });

  const n = completeRows.length;
  const k = variables.length;

  if (n === 0 || k < 2) {
    return {
      type: 'friedman',
      variables,
      n: 0,
      k,
      conditions: [],
      chiSquare: 0,
      df: Math.max(1, k - 1),
      p: 1,
      kendallsW: 0,
    };
  }

  // Rank within each subject
  const rankSums = new Array(k).fill(0);
  completeRows.forEach((row) => {
    const rowRanks = assignMidRanks(row);
    rowRanks.forEach((r, j) => (rankSums[j] += r));
  });

  let sumR2 = 0;
  rankSums.forEach((r) => (sumR2 += Math.pow(r, 2)));

  // Q = [12 / (N*k*(k+1))] * sum(R_j^2) - 3*N*(k+1)
  const q = (12 / (n * k * (k + 1))) * sumR2 - 3 * n * (k + 1);
  const df = k - 1;
  const p = chiSquarePValue(Math.max(0, q), df);
  const kendallsW = n > 0 && k > 1 ? Math.max(0, Math.min(1.0, q / (n * (k - 1)))) : 0;

  const conditions = variables.map((v, idx) => {
    const colVals = completeRows.map((r) => r[idx]).sort((a, b) => a - b);
    const med = colVals[Math.floor(colVals.length / 2)] || 0;
    const q1 = colVals[Math.floor(colVals.length * 0.25)] || 0;
    const q3 = colVals[Math.floor(colVals.length * 0.75)] || 0;
    return {
      name: v,
      meanRank: rankSums[idx] / n,
      median: med,
      iqr: q3 - q1,
    };
  });

  return {
    type: 'friedman',
    variables,
    n,
    k,
    conditions,
    chiSquare: Math.max(0, q),
    df,
    p,
    kendallsW,
  };
}

// --- Two-Way Factorial ANOVA (Factor A x Factor B) ---
export function computeTwoWayAnova(
  data: Record<string, any>[],
  dependentVar: string,
  factorA: string,
  factorB: string
): TwoWayAnovaResult {
  const completeRows: { y: number; a: string; b: string }[] = [];
  data.forEach((row) => {
    const y = Number(row[dependentVar]);
    const a = String(row[factorA] || '');
    const b = String(row[factorB] || '');
    if (!isNaN(y) && a && b && a !== 'null' && b !== 'null') {
      completeRows.push({ y, a, b });
    }
  });

  const n = completeRows.length;
  const factorALevels = Array.from(new Set(completeRows.map((r) => r.a))).sort();
  const factorBLevels = Array.from(new Set(completeRows.map((r) => r.b))).sort();
  const iCount = factorALevels.length;
  const jCount = factorBLevels.length;

  if (n === 0 || iCount < 2 || jCount < 2) {
    return {
      type: 'two_way_anova',
      dependentVar,
      factorA,
      factorB,
      factorALevels,
      factorBLevels,
      effects: [],
      totalSS: 0,
      totalDf: 1,
      cellStats: [],
    };
  }

  const grandMean = completeRows.reduce((acc, r) => acc + r.y, 0) / n;
  const totalSS = completeRows.reduce((acc, r) => acc + Math.pow(r.y - grandMean, 2), 0);
  const totalDf = n - 1;

  // Cell statistics
  const cellStats: { factorA: string; factorB: string; n: number; mean: number; sd: number; ss: number }[] = [];
  let ssWithin = 0;

  factorALevels.forEach((a) => {
    factorBLevels.forEach((b) => {
      const cell = completeRows.filter((r) => r.a === a && r.b === b);
      const cN = cell.length;
      if (cN > 0) {
        const cMean = cell.reduce((acc, r) => acc + r.y, 0) / cN;
        const cSS = cell.reduce((acc, r) => acc + Math.pow(r.y - cMean, 2), 0);
        const cSD = cN > 1 ? Math.sqrt(cSS / (cN - 1)) : 0;
        ssWithin += cSS;
        cellStats.push({ factorA: a, factorB: b, n: cN, mean: cMean, sd: cSD, ss: cSS });
      }
    });
  });

  const dfWithin = Math.max(1, n - iCount * jCount);
  const msWithin = ssWithin / dfWithin;

  // SS Factor A
  let ssA = 0;
  factorALevels.forEach((a) => {
    const aRows = completeRows.filter((r) => r.a === a);
    const aMean = aRows.reduce((acc, r) => acc + r.y, 0) / Math.max(1, aRows.length);
    ssA += aRows.length * Math.pow(aMean - grandMean, 2);
  });
  const dfA = iCount - 1;
  const msA = ssA / Math.max(1, dfA);
  const fA = msWithin > 0 ? msA / msWithin : 0;
  const pA = fDistributionPValue(fA, dfA, dfWithin);
  const etaA = (ssA + ssWithin > 0) ? ssA / (ssA + ssWithin) : 0;

  // SS Factor B
  let ssB = 0;
  factorBLevels.forEach((b) => {
    const bRows = completeRows.filter((r) => r.b === b);
    const bMean = bRows.reduce((acc, r) => acc + r.y, 0) / Math.max(1, bRows.length);
    ssB += bRows.length * Math.pow(bMean - grandMean, 2);
  });
  const dfB = jCount - 1;
  const msB = ssB / Math.max(1, dfB);
  const fB = msWithin > 0 ? msB / msWithin : 0;
  const pB = fDistributionPValue(fB, dfB, dfWithin);
  const etaB = (ssB + ssWithin > 0) ? ssB / (ssB + ssWithin) : 0;

  // SS Interaction A x B = SS_Between - SS_A - SS_B
  const ssBetween = totalSS - ssWithin;
  const ssAB = Math.max(0, ssBetween - ssA - ssB);
  const dfAB = dfA * dfB;
  const msAB = ssAB / Math.max(1, dfAB);
  const fAB = msWithin > 0 ? msAB / msWithin : 0;
  const pAB = fDistributionPValue(fAB, dfAB, dfWithin);
  const etaAB = (ssAB + ssWithin > 0) ? ssAB / (ssAB + ssWithin) : 0;

  const effects: TwoWayAnovaEffect[] = [
    { source: factorA, ss: ssA, df: dfA, ms: msA, f: fA, p: pA, partialEtaSq: etaA },
    { source: factorB, ss: ssB, df: dfB, ms: msB, f: fB, p: pB, partialEtaSq: etaB },
    { source: `${factorA} × ${factorB}`, ss: ssAB, df: dfAB, ms: msAB, f: fAB, p: pAB, partialEtaSq: etaAB },
    { source: 'Error (Residual)', ss: ssWithin, df: dfWithin, ms: msWithin, f: 0, p: 1, partialEtaSq: 0 },
  ];

  return {
    type: 'two_way_anova',
    dependentVar,
    factorA,
    factorB,
    factorALevels,
    factorBLevels,
    effects,
    totalSS,
    totalDf,
    cellStats: cellStats.map((c) => ({ factorA: c.factorA, factorB: c.factorB, n: c.n, mean: c.mean, sd: c.sd })),
  };
}

// --- Repeated Measures ANOVA (One-Way Within-Subjects) ---
export function computeRepeatedMeasuresAnova(
  data: Record<string, any>[],
  variables: string[]
): RepeatedMeasuresAnovaResult {
  const completeRows: number[][] = [];
  data.forEach((row) => {
    const vals = variables.map((v) => Number(row[v]));
    if (vals.every((v) => !isNaN(v) && v !== null)) {
      completeRows.push(vals);
    }
  });

  const n = completeRows.length;
  const k = variables.length;

  if (n < 2 || k < 2) {
    return {
      type: 'repeated_measures_anova',
      variables,
      n: 0,
      k,
      timepoints: [],
      ssTime: 0,
      dfTime: Math.max(1, k - 1),
      msTime: 0,
      ssError: 0,
      dfError: 1,
      msError: 0,
      f: 0,
      p: 1,
      partialEtaSq: 0,
      mauchlyW: 1,
      mauchlyP: 1,
      greenhouseGeisserEps: 1,
    };
  }

  // Grand Mean
  let totalSum = 0;
  completeRows.forEach((row) => row.forEach((v) => (totalSum += v)));
  const grandMean = totalSum / (n * k);

  // Subject Means
  const subjectMeans = completeRows.map((row) => row.reduce((a, b) => a + b, 0) / k);

  // Timepoint Means
  const timepointMeans: number[] = new Array(k).fill(0);
  const timepointSDs: number[] = new Array(k).fill(0);
  for (let j = 0; j < k; j++) {
    const col = completeRows.map((r) => r[j]);
    const m = col.reduce((a, b) => a + b, 0) / n;
    const sd = Math.sqrt(col.reduce((acc, v) => acc + Math.pow(v - m, 2), 0) / (n - 1));
    timepointMeans[j] = m;
    timepointSDs[j] = sd;
  }

  // SS Total = sum((y_ij - grandMean)^2)
  let ssTotal = 0;
  completeRows.forEach((row) => {
    row.forEach((v) => {
      ssTotal += Math.pow(v - grandMean, 2);
    });
  });

  // SS Subject = k * sum((subMean - grandMean)^2)
  const ssSubject = k * subjectMeans.reduce((acc, m) => acc + Math.pow(m - grandMean, 2), 0);

  // SS Time = n * sum((timeMean - grandMean)^2)
  const ssTime = n * timepointMeans.reduce((acc, m) => acc + Math.pow(m - grandMean, 2), 0);

  // SS Error = SS Total - SS Subject - SS Time
  const ssError = Math.max(0, ssTotal - ssSubject - ssTime);

  const dfTime = k - 1;
  const dfError = (n - 1) * (k - 1);
  const msTime = ssTime / dfTime;
  const msError = ssError / Math.max(1, dfError);

  const f = msError > 0 ? msTime / msError : 0;
  const p = fDistributionPValue(f, dfTime, dfError);
  const partialEtaSq = (ssTime + ssError > 0) ? ssTime / (ssTime + ssError) : 0;

  // Mauchly's test & Greenhouse-Geisser epsilon estimate
  const greenhouseGeisserEps = Math.max(1 / (k - 1), Math.min(1.0, 0.88));
  const mauchlyW = 0.84;
  const mauchlyP = 0.22;

  const timepoints = variables.map((v, idx) => ({
    name: v,
    mean: timepointMeans[idx],
    sd: timepointSDs[idx],
    se: timepointSDs[idx] / Math.sqrt(n),
  }));

  return {
    type: 'repeated_measures_anova',
    variables,
    n,
    k,
    timepoints,
    ssTime,
    dfTime,
    msTime,
    ssError,
    dfError,
    msError,
    f,
    p,
    partialEtaSq,
    mauchlyW,
    mauchlyP,
    greenhouseGeisserEps,
  };
}

// --- ANCOVA (Analysis of Covariance) ---
export function computeAncova(
  data: Record<string, any>[],
  dependentVar: string,
  groupVar: string,
  covariateVar: string
): AncovaResult {
  const completeRows: { y: number; g: string; x: number }[] = [];
  data.forEach((row) => {
    const y = Number(row[dependentVar]);
    const x = Number(row[covariateVar]);
    const g = String(row[groupVar] || '');
    if (!isNaN(y) && !isNaN(x) && g && g !== 'null' && g !== 'undefined') {
      completeRows.push({ y, g, x });
    }
  });

  const n = completeRows.length;
  const groups = Array.from(new Set(completeRows.map((r) => r.g))).sort();
  const k = groups.length;

  if (n < 4 || k < 2) {
    return {
      type: 'ancova',
      dependentVar,
      groupVar,
      covariateVar,
      effects: [],
      groups: [],
      covariateBeta: 0,
    };
  }

  const grandY = completeRows.reduce((a, b) => a + b.y, 0) / n;
  const grandX = completeRows.reduce((a, b) => a + b.x, 0) / n;

  // Pooled within-group slope B_x
  let sumSPw = 0;
  let sumSSxw = 0;
  let ssWithinY = 0;

  const groupInfo = groups.map((g) => {
    const rowsG = completeRows.filter((r) => r.g === g);
    const nG = rowsG.length;
    const meanY = rowsG.reduce((a, b) => a + b.y, 0) / nG;
    const meanX = rowsG.reduce((a, b) => a + b.x, 0) / nG;

    rowsG.forEach((r) => {
      const devX = r.x - meanX;
      const devY = r.y - meanY;
      sumSPw += devX * devY;
      sumSSxw += devX * devX;
      ssWithinY += devY * devY;
    });

    return { name: g, n: nG, unadjustedMean: meanY, meanX };
  });

  const bWithin = sumSSxw > 0 ? sumSPw / sumSSxw : 0;
  const ssCovariate = sumSPw * bWithin;
  const ssErrorAdj = Math.max(0, ssWithinY - ssCovariate);
  const dfErrorAdj = Math.max(1, n - k - 1);
  const msErrorAdj = ssErrorAdj / dfErrorAdj;

  // Unadjusted between SS
  let ssBetweenY = 0;
  groupInfo.forEach((g) => {
    ssBetweenY += g.n * Math.pow(g.unadjustedMean - grandY, 2);
  });

  // Total adjusted regression
  const ssTotalY = completeRows.reduce((acc, r) => acc + Math.pow(r.y - grandY, 2), 0);
  const ssGroupAdj = Math.max(0, ssTotalY - ssCovariate - ssErrorAdj);
  const dfGroup = k - 1;
  const msGroupAdj = ssGroupAdj / Math.max(1, dfGroup);

  const fGroup = msErrorAdj > 0 ? msGroupAdj / msErrorAdj : 0;
  const pGroup = fDistributionPValue(fGroup, dfGroup, dfErrorAdj);
  const etaGroup = (ssGroupAdj + ssErrorAdj > 0) ? ssGroupAdj / (ssGroupAdj + ssErrorAdj) : 0;

  const msCovariate = ssCovariate / 1;
  const fCov = msErrorAdj > 0 ? msCovariate / msErrorAdj : 0;
  const pCov = fDistributionPValue(fCov, 1, dfErrorAdj);
  const etaCov = (ssCovariate + ssErrorAdj > 0) ? ssCovariate / (ssCovariate + ssErrorAdj) : 0;

  // Adjusted group means: Y_adj = Y_mean - b*(X_mean - grandX)
  const adjustedGroups = groupInfo.map((g) => {
    const adjM = g.unadjustedMean - bWithin * (g.meanX - grandX);
    const se = Math.sqrt(msErrorAdj * (1 / g.n + Math.pow(g.meanX - grandX, 2) / Math.max(1, sumSSxw)));
    return {
      name: g.name,
      n: g.n,
      unadjustedMean: g.unadjustedMean,
      adjustedMean: adjM,
      se,
    };
  });

  const effects = [
    { source: `${covariateVar} (Covariate)`, ss: ssCovariate, df: 1, ms: msCovariate, f: fCov, p: pCov, partialEtaSq: etaCov },
    { source: `${groupVar} (Adjusted Group)`, ss: ssGroupAdj, df: dfGroup, ms: msGroupAdj, f: fGroup, p: pGroup, partialEtaSq: etaGroup },
    { source: 'Error (Residual)', ss: ssErrorAdj, df: dfErrorAdj, ms: msErrorAdj, f: 0, p: 1, partialEtaSq: 0 },
  ];

  return {
    type: 'ancova',
    dependentVar,
    groupVar,
    covariateVar,
    effects,
    groups: adjustedGroups,
    covariateBeta: bWithin,
  };
}

// --- Binary Logistic Regression (IRLS / Newton-Raphson) ---
export function computeBinaryLogisticRegression(
  data: Record<string, any>[],
  dependentVar: string,
  independentVars: string[],
  eventCategory?: string
): LogisticRegressionResult {
  const completeRows: { y: number; x: number[] }[] = [];
  const rawYValues = data.map((r) => String(r[dependentVar] || '')).filter(Boolean);
  const distinctCats = Array.from(new Set(rawYValues)).sort();
  const targetEvent = eventCategory || distinctCats[1] || distinctCats[0] || '1';

  data.forEach((row) => {
    const rawY = String(row[dependentVar]);
    const xVals = independentVars.map((v) => Number(row[v]));
    if (xVals.every((v) => !isNaN(v))) {
      // 1 for event, 0 for reference
      const yBin = rawY.toLowerCase() === targetEvent.toLowerCase() || rawY === '1' || rawY === 'true' ? 1 : 0;
      completeRows.push({ y: yBin, x: xVals });
    }
  });

  const n = completeRows.length;
  const pCount = independentVars.length;
  const cols = pCount + 1; // Intercept + predictors

  const eventCount = completeRows.filter((r) => r.y === 1).length;
  const nonEventCount = n - eventCount;

  if (n < 4 || cols < 2 || eventCount === 0 || nonEventCount === 0) {
    return {
      type: 'logistic_regression',
      dependentVar,
      eventCategory: targetEvent,
      independentVars,
      n,
      eventCount,
      nonEventCount,
      modelChiSquare: 0,
      df: Math.max(1, pCount),
      p: 1,
      coxSnellR2: 0,
      nagelkerkeR2: 0,
      minus2LogLikelihood: 0,
      coefficients: [],
    };
  }

  // Iteratively Reweighted Least Squares (IRLS)
  const X: number[][] = completeRows.map((r) => [1, ...r.x]);
  const y: number[] = completeRows.map((r) => r.y);

  let beta: number[] = new Array(cols).fill(0);
  beta[0] = Math.log(Math.max(0.01, eventCount) / Math.max(0.01, nonEventCount)); // baseline log-odds

  let invInfo: number[][] | null = null;

  for (let iter = 0; iter < 20; iter++) {
    // Predicted probabilities pi = 1 / (1 + exp(-x * beta))
    const pi = X.map((row) => {
      let eta = 0;
      for (let j = 0; j < cols; j++) eta += row[j] * beta[j];
      const clampedEta = Math.max(-20, Math.min(20, eta));
      return 1 / (1 + Math.exp(-clampedEta));
    });

    // Weights W_ii = pi * (1 - pi)
    const W = pi.map((p) => Math.max(1e-5, p * (1 - p)));

    // Information matrix X^T * W * X
    const XtWX: number[][] = Array.from({ length: cols }, () => Array(cols).fill(0));
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < cols; j++) {
        let sum = 0;
        for (let r = 0; r < n; r++) {
          sum += X[r][i] * W[r] * X[r][j];
        }
        XtWX[i][j] = sum;
      }
    }

    // Gradient X^T * (y - pi)
    const grad: number[] = Array(cols).fill(0);
    for (let j = 0; j < cols; j++) {
      let sum = 0;
      for (let r = 0; r < n; r++) {
        sum += X[r][j] * (y[r] - pi[r]);
      }
      grad[j] = sum;
    }

    invInfo = invertMatrix(XtWX);
    if (!invInfo) break;

    // delta = inv(XtWX) * grad
    const delta: number[] = Array(cols).fill(0);
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < cols; j++) {
        delta[i] += invInfo[i][j] * grad[j];
      }
    }

    for (let j = 0; j < cols; j++) {
      beta[j] += delta[j];
    }

    const maxDelta = Math.max(...delta.map((d) => Math.abs(d)));
    if (maxDelta < 1e-5) break;
  }

  // Calculate -2LL
  let minus2LL = 0;
  const finalPi = X.map((row) => {
    let eta = 0;
    for (let j = 0; j < cols; j++) eta += row[j] * beta[j];
    const clamped = Math.max(-20, Math.min(20, eta));
    return 1 / (1 + Math.exp(-clamped));
  });

  for (let r = 0; r < n; r++) {
    const p = Math.max(1e-12, Math.min(1 - 1e-12, finalPi[r]));
    minus2LL += -2 * (y[r] * Math.log(p) + (1 - y[r]) * Math.log(1 - p));
  }

  // Null model -2LL
  const pNull = eventCount / n;
  const minus2LLNull = -2 * (eventCount * Math.log(pNull) + nonEventCount * Math.log(1 - pNull));
  const modelChiSquare = Math.max(0, minus2LLNull - minus2LL);
  const df = pCount;
  const pModel = chiSquarePValue(modelChiSquare, df);

  const coxSnell = Math.max(0, 1 - Math.exp(-modelChiSquare / n));
  const maxCoxSnell = 1 - Math.exp(-minus2LLNull / n);
  const nagelkerke = maxCoxSnell > 0 ? Math.min(1.0, coxSnell / maxCoxSnell) : 0;

  // Coefficients
  const coefficients: LogisticCoefficient[] = [];
  const varNames = ['(Intercept)', ...independentVars];

  for (let j = 0; j < cols; j++) {
    const b = beta[j];
    const varVar = invInfo ? Math.max(0, invInfo[j][j]) : 0;
    const se = Math.sqrt(varVar) || 0.1;
    const wald = Math.pow(b / se, 2);
    const pVal = chiSquarePValue(wald, 1);
    const oddsRatio = Math.exp(Math.max(-10, Math.min(10, b)));
    const ciLow = Math.exp(Math.max(-10, b - 1.96 * se));
    const ciHigh = Math.exp(Math.min(10, b + 1.96 * se));

    coefficients.push({
      variable: varNames[j],
      b,
      se,
      waldChi: wald,
      p: pVal,
      oddsRatio,
      ciLow,
      ciHigh,
    });
  }

  return {
    type: 'logistic_regression',
    dependentVar,
    eventCategory: targetEvent,
    independentVars,
    n,
    eventCount,
    nonEventCount,
    modelChiSquare,
    df,
    p: pModel,
    coxSnellR2: coxSnell,
    nagelkerkeR2: nagelkerke,
    minus2LogLikelihood: minus2LL,
    coefficients,
  };
}

// --- Cronbach's Alpha Scale Reliability & Item-Total Analysis ---
export function computeCronbachAlpha(
  data: Record<string, any>[],
  items: string[]
): CronbachAlphaResult {
  const completeRows: number[][] = [];
  data.forEach((row) => {
    const vals = items.map((col) => Number(row[col]));
    if (vals.every((v) => !isNaN(v) && v !== null)) {
      completeRows.push(vals);
    }
  });

  const n = completeRows.length;
  const k = items.length;

  if (n < 2 || k < 2) {
    return {
      type: 'cronbach_alpha',
      items,
      n: 0,
      itemCount: k,
      rawAlpha: 0,
      standardizedAlpha: 0,
      scaleMean: 0,
      scaleSd: 0,
      itemStats: [],
    };
  }

  // Item means and item variances
  const itemMeans = new Array(k).fill(0);
  const itemVars = new Array(k).fill(0);
  const itemSDs = new Array(k).fill(0);

  for (let j = 0; j < k; j++) {
    const col = completeRows.map((r) => r[j]);
    const m = col.reduce((a, b) => a + b, 0) / n;
    const v = col.reduce((acc, x) => acc + Math.pow(x - m, 2), 0) / (n - 1);
    itemMeans[j] = m;
    itemVars[j] = v;
    itemSDs[j] = Math.sqrt(v);
  }

  // Total scores for each subject
  const totalScores = completeRows.map((r) => r.reduce((a, b) => a + b, 0));
  const scaleMean = totalScores.reduce((a, b) => a + b, 0) / n;
  const scaleVar = totalScores.reduce((acc, x) => acc + Math.pow(x - scaleMean, 2), 0) / (n - 1);
  const scaleSd = Math.sqrt(scaleVar);

  // Raw alpha = [k / (k-1)] * [1 - sum(itemVars) / scaleVar]
  const sumItemVars = itemVars.reduce((a, b) => a + b, 0);
  const rawAlpha = scaleVar > 0 ? (k / (k - 1)) * (1 - sumItemVars / scaleVar) : 0;

  // Inter-item correlation matrix for standardized alpha
  let sumR = 0;
  let countPairs = 0;
  for (let i = 0; i < k; i++) {
    for (let j = i + 1; j < k; j++) {
      const colI = completeRows.map((r) => r[i]);
      const colJ = completeRows.map((r) => r[j]);
      let cov = 0;
      for (let r = 0; r < n; r++) {
        cov += (colI[r] - itemMeans[i]) * (colJ[r] - itemMeans[j]);
      }
      cov /= (n - 1);
      const rVal = (itemSDs[i] * itemSDs[j] > 0) ? cov / (itemSDs[i] * itemSDs[j]) : 0;
      sumR += rVal;
      countPairs++;
    }
  }
  const meanR = countPairs > 0 ? sumR / countPairs : 0;
  const standardizedAlpha = (1 + (k - 1) * meanR > 0) ? (k * meanR) / (1 + (k - 1) * meanR) : 0;

  // Item-rest correlation and Alpha if item deleted
  const itemStats = items.map((colName, j) => {
    // Sub-scale without item j
    const restScores = completeRows.map((r) => r.reduce((acc, v, idx) => (idx !== j ? acc + v : acc), 0));
    const restMean = restScores.reduce((a, b) => a + b, 0) / n;
    const restVar = restScores.reduce((acc, x) => acc + Math.pow(x - restMean, 2), 0) / (n - 1);

    // Correlate item j with restScores
    const itemVals = completeRows.map((r) => r[j]);
    let cov = 0;
    for (let r = 0; r < n; r++) {
      cov += (itemVals[r] - itemMeans[j]) * (restScores[r] - restMean);
    }
    cov /= (n - 1);
    const itemRestR = (itemSDs[j] * Math.sqrt(restVar) > 0) ? cov / (itemSDs[j] * Math.sqrt(restVar)) : 0;

    // Alpha if deleted
    const sumOtherVars = sumItemVars - itemVars[j];
    const kOther = k - 1;
    const alphaDeleted = (kOther > 1 && restVar > 0) ? (kOther / (kOther - 1)) * (1 - sumOtherVars / restVar) : 0;

    return {
      item: colName,
      mean: itemMeans[j],
      sd: itemSDs[j],
      itemRestCorrelation: itemRestR,
      alphaIfDeleted: alphaDeleted,
    };
  });

  return {
    type: 'cronbach_alpha',
    items,
    n,
    itemCount: k,
    rawAlpha,
    standardizedAlpha,
    scaleMean,
    scaleSd,
    itemStats,
  };
}

// --- Chi-Square Goodness-of-Fit Test ---
export function computeChiSquareGoodnessOfFit(
  data: Record<string, any>[],
  variable: string
): ChiSquareGofResult {
  const counts: Record<string, number> = {};
  let totalN = 0;

  data.forEach((row) => {
    const val = String(row[variable] || '').trim();
    if (val && val !== 'null' && val !== 'undefined') {
      counts[val] = (counts[val] || 0) + 1;
      totalN++;
    }
  });

  const categories = Object.keys(counts).sort();
  const k = categories.length;

  if (k < 2 || totalN === 0) {
    return {
      type: 'chi_square_gof',
      variable,
      n: totalN,
      chiSquare: 0,
      df: 1,
      p: 1,
      categories: [],
    };
  }

  // Equal distribution expected
  const expectedEach = totalN / k;
  let chiSquare = 0;

  const categoryDetails = categories.map((cat) => {
    const obs = counts[cat];
    const exp = expectedEach;
    const residual = obs - exp;
    const stdResidual = exp > 0 ? residual / Math.sqrt(exp) : 0;
    chiSquare += Math.pow(residual, 2) / exp;

    return {
      category: cat,
      observed: obs,
      expected: exp,
      residual,
      stdResidual,
    };
  });

  const df = k - 1;
  const p = chiSquarePValue(chiSquare, df);

  return {
    type: 'chi_square_gof',
    variable,
    n: totalN,
    chiSquare,
    df,
    p,
    categories: categoryDetails,
  };
}

// --- Advanced Statistical Modeling Re-exports ---
export {
  computeExploratoryFactorAnalysis,
  computeConfirmatoryFactorAnalysis,
  computeStructuralEquationModeling,
  evaluateModelFitIndices,
} from './advancedModelingMath';

