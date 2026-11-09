import React from 'react';
import {
  Layers,
  ShieldCheck,
  Activity,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Info,
} from 'lucide-react';
import {
  StatisticalResult,
  EfaResult,
  CfaResult,
  SemResult,
  ModelFitIndices,
} from '../types/stats';

interface AdvancedModelingResultsProps {
  result: StatisticalResult;
}

export const AdvancedModelingResults: React.FC<AdvancedModelingResultsProps> = ({ result }) => {
  if (
    result.type !== 'exploratory_factor_analysis' &&
    result.type !== 'confirmatory_factor_analysis' &&
    result.type !== 'structural_equation_modeling'
  ) {
    return null;
  }

  return (
    <div className="space-y-6">
      {result.type === 'exploratory_factor_analysis' && <EfaPanel result={result} />}
      {result.type === 'confirmatory_factor_analysis' && <CfaPanel result={result} />}
      {result.type === 'structural_equation_modeling' && <SemPanel result={result} />}
    </div>
  );
};

// ==========================================
// 1. EFA PANEL
// ==========================================
const EfaPanel: React.FC<{ result: EfaResult }> = ({ result }) => {
  const {
    kmo,
    bartlett,
    eigenvalues,
    factorLoadings,
    variables,
    rotationMethod,
    extractionMethod,
    interpretationGuidelines,
    sampleSize,
    factorsExtracted,
  } = result;

  const retainedEigenvalues = eigenvalues.filter((ev) => ev.eigenvalue >= 1.0);
  const totalVarianceExplained = retainedEigenvalues.reduce((sum, ev) => sum + ev.varianceExplainedPct, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Exploratory Factor Analysis (EFA) &amp; Dimensionality Reduction</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Latent Factor Structure &amp; Sampling Adequacy
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Extraction: <span className="font-semibold text-slate-700">{extractionMethod}</span> · Rotation: <span className="font-semibold text-slate-700">{rotationMethod}</span> · Analyzed Items: <span className="font-semibold text-slate-700">{variables.length}</span> · Sample N = <span className="font-semibold text-slate-700">{sampleSize}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-lg text-xs font-mono font-bold">
            {factorsExtracted} Retained Factors ({totalVarianceExplained.toFixed(1)}% Var)
          </span>
        </div>
      </div>

      {/* Diagnostic Sampling Adequacy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* KMO Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Kaiser-Meyer-Olkin (KMO) Measure
              </span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                kmo.overall >= 0.70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {kmo.interpretation}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-slate-900">
                {kmo.overall.toFixed(3).replace(/^0/, '')}
              </span>
              <span className="text-xs text-slate-500">Sampling Adequacy (Target ≥ .60)</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-3 pt-2 border-t border-slate-200/60 leading-relaxed">
            Kaiser (1974) classification indicates the sample correlation matrix possesses suitable shared variance for factor extraction.
          </p>
        </div>

        {/* Bartlett's Test Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Bartlett's Test of Sphericity
              </span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                bartlett.p < 0.05 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {bartlett.p < 0.05 ? 'Significant (p < .05)' : 'Non-Significant'}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-slate-900">
                χ²({bartlett.df}) = {bartlett.chiSquare.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-500">
                {bartlett.p < 0.001 ? 'p < .001' : `p = ${bartlett.p.toFixed(3).replace(/^0/, '')}`}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-3 pt-2 border-t border-slate-200/60 leading-relaxed">
            Rejects the null hypothesis that correlation matrix is an identity matrix. Sufficient inter-item collinearity exists for factor extraction.
          </p>
        </div>
      </div>

      {/* Factor Variance & Eigenvalue Breakdown */}
      <div>
        <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-indigo-600" />
          <span>Extracted Factors &amp; Total Variance Explained (Kaiser Criterion: Eigenvalue &gt; 1.0)</span>
        </h4>
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-mono">
              <tr>
                <th className="py-2.5 px-3">Factor</th>
                <th className="py-2.5 px-3">Initial Eigenvalue (λ)</th>
                <th className="py-2.5 px-3">% of Variance Explained</th>
                <th className="py-2.5 px-3">Cumulative Variance %</th>
                <th className="py-2.5 px-3">Kaiser Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {eigenvalues.map((ev, i: number) => {
                const isRetained = ev.eigenvalue >= 1.0;
                return (
                  <tr key={i} className={`hover:bg-slate-50/60 ${isRetained ? 'bg-indigo-50/20' : ''}`}>
                    <td className="py-2 px-3 font-semibold text-slate-900">Factor {ev.factor}</td>
                    <td className="py-2 px-3 text-slate-800">{ev.eigenvalue.toFixed(3)}</td>
                    <td className="py-2 px-3 text-slate-800">{ev.varianceExplainedPct.toFixed(1)}%</td>
                    <td className="py-2 px-3 text-slate-800">{ev.cumulativeVariancePct?.toFixed(1) || '—'}%</td>
                    <td className="py-2 px-3">
                      {isRetained ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Retained (λ &gt; 1.0)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                          Dropped (λ &lt; 1.0)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Factor Loading Matrix with Varimax Rotation */}
      <div>
        <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Rotated Factor Loading Matrix (Varimax with Kaiser Normalization)</span>
        </h4>
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-mono">
              <tr>
                <th className="py-2.5 px-3 font-sans">Item / Indicator</th>
                {Array.from({ length: factorsExtracted }, (_, idx) => (
                  <th key={idx} className="py-2.5 px-3">
                    Factor {idx + 1}
                  </th>
                ))}
                <th className="py-2.5 px-3">Communality (h²)</th>
                <th className="py-2.5 px-3">Uniqueness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {factorLoadings.map((fl, rowIdx: number) => {
                return (
                  <tr key={rowIdx} className="hover:bg-slate-50/60">
                    <td className="py-2 px-3 font-semibold text-slate-900 font-sans">{fl.variable}</td>
                    {fl.loadings.map((load: number, fIdx: number) => {
                      const isHigh = Math.abs(load) >= 0.40;
                      return (
                        <td
                          key={fIdx}
                          className={`py-2 px-3 ${
                            isHigh
                              ? 'font-bold text-indigo-700 bg-indigo-50/50'
                              : 'text-slate-600'
                          }`}
                        >
                          {load.toFixed(3)}
                        </td>
                      );
                    })}
                    <td className="py-2 px-3 text-slate-800">{fl.communality.toFixed(3)}</td>
                    <td className="py-2 px-3 text-slate-500">{fl.uniqueness.toFixed(3)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guidelines Card */}
      <InterpretationGuidelinesCard guidelines={interpretationGuidelines} />
    </div>
  );
};

// ==========================================
// 2. CFA PANEL
// ==========================================
const CfaPanel: React.FC<{ result: CfaResult }> = ({ result }) => {
  const { latentFactors, factorLoadings, fitIndices, sampleSize, reliability, interpretationGuidelines } = result;
  const isOverallAcceptable = fitIndices.cfi >= 0.90 && fitIndices.rmsea <= 0.08;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-600 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Confirmatory Factor Analysis (CFA) &amp; Measurement Model</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Measurement Theory Fit &amp; Construct Validity (CR &amp; AVE)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Estimator: <span className="font-semibold text-slate-700">Maximum Likelihood</span> · Latent Constructs: <span className="font-semibold text-slate-700">{latentFactors.length}</span> · Indicators: <span className="font-semibold text-slate-700">{factorLoadings.length}</span> · Sample N = <span className="font-semibold text-slate-700">{sampleSize}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${
            isOverallAcceptable
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            Overall Fit: {isOverallAcceptable ? 'Acceptable / Good' : 'Marginal'}
          </span>
        </div>
      </div>

      {/* Model Fit Indices Dashboard */}
      <ModelFitIndicesDashboard fit={fitIndices} />

      {/* Latent Construct Reliability & Convergent Validity Table */}
      <div>
        <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Construct Reliability &amp; Convergent Validity (Fornell &amp; Larcker, 1981)</span>
        </h4>
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-mono">
              <tr>
                <th className="py-2.5 px-3 font-sans">Latent Construct</th>
                <th className="py-2.5 px-3">Composite Reliability (CR)</th>
                <th className="py-2.5 px-3">Average Variance Extracted (AVE)</th>
                <th className="py-2.5 px-3">Cronbach's α</th>
                <th className="py-2.5 px-3">Convergent Validity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {(reliability || []).map((rel, idx: number) => {
                const isValid = rel.compositeReliability >= 0.70 && rel.ave >= 0.50;
                return (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-2 px-3 font-semibold text-slate-900 font-sans">{rel.factor}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      {rel.compositeReliability.toFixed(3)}
                      <span className="text-[10px] text-slate-400 font-normal ml-1">(Target &gt; .70)</span>
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      {rel.ave.toFixed(3)}
                      <span className="text-[10px] text-slate-400 font-normal ml-1">(Target &gt; .50)</span>
                    </td>
                    <td className="py-2 px-3 text-slate-800">{rel.cronbachAlpha.toFixed(3)}</td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isValid
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {isValid ? 'Supported (CR > .70, AVE > .50)' : 'Marginal'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Indicator Loadings & Significance */}
      <div>
        <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-blue-600" />
          <span>Measurement Model Indicator Loadings &amp; Significance</span>
        </h4>
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-mono">
              <tr>
                <th className="py-2.5 px-3 font-sans">Latent Construct</th>
                <th className="py-2.5 px-3 font-sans">Indicator Variable</th>
                <th className="py-2.5 px-3">Unstd (B)</th>
                <th className="py-2.5 px-3">SE</th>
                <th className="py-2.5 px-3">Std Loading (λ)</th>
                <th className="py-2.5 px-3">z-value</th>
                <th className="py-2.5 px-3">p-value</th>
                <th className="py-2.5 px-3">Explained Var (R²)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {factorLoadings.map((ind, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-2 px-3 font-semibold text-slate-900 font-sans">{ind.latentFactor}</td>
                  <td className="py-2 px-3 text-slate-800 font-sans">{ind.indicator}</td>
                  <td className="py-2 px-3 text-slate-800">{ind.unstandardized.toFixed(3)}</td>
                  <td className="py-2 px-3 text-slate-600">{ind.se.toFixed(3)}</td>
                  <td className="py-2 px-3 font-bold text-blue-700">{ind.standardized.toFixed(3)}</td>
                  <td className="py-2 px-3 text-slate-800">{ind.zValue.toFixed(2)}</td>
                  <td className="py-2 px-3 text-slate-800">
                    {ind.pValue < 0.001 ? '< .001' : ind.pValue.toFixed(3).replace(/^0/, '')}
                  </td>
                  <td className="py-2 px-3 text-slate-800">{ind.rSquared.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guidelines Card */}
      <InterpretationGuidelinesCard guidelines={interpretationGuidelines} />
    </div>
  );
};

// ==========================================
// 3. SEM PANEL
// ==========================================
const SemPanel: React.FC<{ result: SemResult }> = ({ result }) => {
  const { structuralPaths, mediationEffects, fitIndices, sampleSize, interpretationGuidelines } = result;
  const isOverallAcceptable = fitIndices.cfi >= 0.90 && fitIndices.rmsea <= 0.08;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-600 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Structural Equation Modeling (SEM)</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Hypothesized Structural Paths &amp; Mediation Analysis
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Estimator: <span className="font-semibold text-slate-700">Maximum Likelihood</span> · Structural Paths: <span className="font-semibold text-slate-700">{structuralPaths.length}</span> · Mediation Models: <span className="font-semibold text-slate-700">{mediationEffects?.length || 0}</span> · Sample N = <span className="font-semibold text-slate-700">{sampleSize}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${
            isOverallAcceptable
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            Overall Fit: {isOverallAcceptable ? 'Acceptable / Good' : 'Marginal'}
          </span>
        </div>
      </div>

      {/* Model Fit Indices Dashboard */}
      <ModelFitIndicesDashboard fit={fitIndices} />

      {/* Structural Paths Table */}
      <div>
        <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-purple-600" />
          <span>Hypothesized Direct Structural Paths (Regression Coefficients)</span>
        </h4>
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-mono">
              <tr>
                <th className="py-2.5 px-3 font-sans">Structural Path</th>
                <th className="py-2.5 px-3">Unstd (B)</th>
                <th className="py-2.5 px-3">SE</th>
                <th className="py-2.5 px-3">Std Path (β)</th>
                <th className="py-2.5 px-3">z-value</th>
                <th className="py-2.5 px-3">p-value</th>
                <th className="py-2.5 px-3">95% CI</th>
                <th className="py-2.5 px-3">Hypothesis Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {structuralPaths.map((p, idx: number) => {
                const isSig = p.pValue < 0.05;
                return (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-2 px-3 font-semibold text-slate-900 font-sans">
                      {p.source} → {p.target}
                    </td>
                    <td className="py-2 px-3 text-slate-800">{p.estimate.toFixed(3)}</td>
                    <td className="py-2 px-3 text-slate-600">{p.stdError.toFixed(3)}</td>
                    <td className="py-2 px-3 font-bold text-purple-700">{p.beta.toFixed(3)}</td>
                    <td className="py-2 px-3 text-slate-800">{p.zValue.toFixed(2)}</td>
                    <td className="py-2 px-3 text-slate-800">
                      {p.pValue < 0.001 ? '< .001' : p.pValue.toFixed(3).replace(/^0/, '')}
                    </td>
                    <td className="py-2 px-3 text-slate-600">
                      [{p.ci95[0].toFixed(2)}, {p.ci95[1].toFixed(2)}]
                    </td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isSig
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isSig ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Supported (p &lt; .05)
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 text-slate-400" />
                            Not Supported
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mediation & Indirect Effects Table (if present) */}
      {mediationEffects && mediationEffects.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>Indirect Effects &amp; Mediation Tests (Sobel Delta Method)</span>
          </h4>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-mono">
                <tr>
                  <th className="py-2.5 px-3 font-sans">Mediation Pathway</th>
                  <th className="py-2.5 px-3">Direct Effect</th>
                  <th className="py-2.5 px-3">Indirect Effect</th>
                  <th className="py-2.5 px-3">Total Effect</th>
                  <th className="py-2.5 px-3">Sobel z</th>
                  <th className="py-2.5 px-3">p-value</th>
                  <th className="py-2.5 px-3">Mediation Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {mediationEffects.map((m, idx: number) => {
                  const isSigMed = m.sobelP < 0.05;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-2 px-3 font-semibold text-slate-900 font-sans">
                        {m.independent} → {m.mediator} → {m.dependent}
                      </td>
                      <td className="py-2 px-3 text-slate-800">{m.directEffect.toFixed(3)}</td>
                      <td className="py-2 px-3 font-bold text-indigo-700">{m.indirectEffect.toFixed(3)}</td>
                      <td className="py-2 px-3 text-slate-800">{m.totalEffect.toFixed(3)}</td>
                      <td className="py-2 px-3 text-slate-800">{m.sobelZ.toFixed(2)}</td>
                      <td className="py-2 px-3 text-slate-800">
                        {m.sobelP < 0.001 ? '< .001' : m.sobelP.toFixed(3).replace(/^0/, '')}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isSigMed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isSigMed ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Mediation Confirmed (p &lt; .05)
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 text-slate-400" />
                              No Mediation
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Guidelines Card */}
      <InterpretationGuidelinesCard guidelines={interpretationGuidelines} />
    </div>
  );
};

// ==========================================
// 4. SHARED FIT INDICES DASHBOARD
// ==========================================
const ModelFitIndicesDashboard: React.FC<{ fit: ModelFitIndices }> = ({ fit }) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-blue-600" />
          <span>Global Goodness-of-Fit Indices (Hu &amp; Bentler, 1999 Joint Benchmarks)</span>
        </h4>
        <span className="text-[11px] text-slate-500 font-mono">
          χ²({fit.df}) = {fit.chiSquare.toFixed(2)}, p = {fit.p < 0.001 ? '< .001' : fit.p.toFixed(3).replace(/^0/, '')}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(fit.interpretation || []).map((idxItem, i: number) => {
          const isGood = idxItem.status === 'Good';
          const isAcceptable = idxItem.status === 'Acceptable';

          return (
            <div
              key={i}
              className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-slate-600 uppercase">
                    {idxItem.metric}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${
                      isGood
                        ? 'bg-emerald-100 text-emerald-800'
                        : isAcceptable
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {idxItem.status}
                  </span>
                </div>
                <div className="mt-1.5 text-xl font-mono font-bold text-slate-900">
                  {typeof idxItem.value === 'number'
                    ? idxItem.value.toFixed(3).replace(/^0\./, '.')
                    : idxItem.value}
                </div>
              </div>
              <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[10px] text-slate-500 font-mono">
                Target: {idxItem.benchmark}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2.5 p-2.5 bg-blue-50/50 border border-blue-200/60 rounded-lg flex items-start gap-2 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          Hu &amp; Bentler (1999) 2-index recommendation: Report <strong>SRMR</strong> alongside either <strong>CFI</strong> (≥ .95) or <strong>RMSEA</strong> (≤ .06) for robust control against Type I and Type II misspecification errors.
        </span>
      </div>
    </div>
  );
};

// ==========================================
// 5. INTERPRETATION GUIDELINES CARD
// ==========================================
const InterpretationGuidelinesCard: React.FC<{ guidelines: string[] }> = ({ guidelines }) => {
  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
      <div className="flex items-center gap-2 mb-2 text-xs font-bold font-mono text-slate-700 uppercase tracking-wider">
        <BookOpen className="w-4 h-4 text-indigo-600" />
        <span>Academic Interpretation &amp; Reporting Guidelines</span>
      </div>
      <ul className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
        {guidelines.map((g: string, i: number) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold shrink-0">›</span>
            <span>{g}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
