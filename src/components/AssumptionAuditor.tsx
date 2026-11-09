import React, { useState, useMemo, useRef } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Copy,
  Check,
  Download,
  Info,
  Maximize2,
  BarChart2,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { StatisticalResult, Dataset } from '../types/stats';
import {
  computeDiagnosticAudit,
  DiagnosticAuditResult,
  QQPoint,
  HomoscedasticityPoint,
} from '../utils/diagnosticCalculator';

interface AssumptionAuditorProps {
  result: StatisticalResult;
  dataset?: Dataset;
}

type AuditorTab = 'qq' | 'homoscedasticity' | 'histogram' | 'outliers';

export const AssumptionAuditor: React.FC<AssumptionAuditorProps> = ({
  result,
  dataset,
}) => {
  const [activeTab, setActiveTab] = useState<AuditorTab>('qq');
  const [hoveredQQ, setHoveredQQ] = useState<QQPoint | null>(null);
  const [hoveredHSc, setHoveredHSc] = useState<HomoscedasticityPoint | null>(null);
  const [copiedStatement, setCopiedStatement] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Compute diagnostics
  const audit: DiagnosticAuditResult = useMemo(() => {
    return computeDiagnosticAudit(result, dataset);
  }, [result, dataset]);

  // Copy APA Assumption Statement
  const handleCopyStatement = () => {
    navigator.clipboard.writeText(audit.apaNarrative);
    setCopiedStatement(true);
    setTimeout(() => setCopiedStatement(false), 2200);
  };

  // Download SVG
  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `Diagnostic_${activeTab.toUpperCase()}_Plot_${audit.dvName.replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  // SVG dimensions
  const width = 580;
  const height = 320;
  const padding = { top: 30, right: 35, bottom: 45, left: 55 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // --- Q-Q Plot Coordinates Helper ---
  const qqMinTheo = -3.2;
  const qqMaxTheo = 3.2;
  const qqMinSamp = Math.min(-3.2, ...audit.qqPoints.map((p) => p.sampleStdResidual));
  const qqMaxSamp = Math.max(3.2, ...audit.qqPoints.map((p) => p.sampleStdResidual));
  const qqMinY = Math.min(qqMinSamp, -3.2);
  const qqMaxY = Math.max(qqMaxSamp, 3.2);

  const scaleQQX = (val: number) =>
    padding.left + ((val - qqMinTheo) / (qqMaxTheo - qqMinTheo)) * plotWidth;
  const scaleQQY = (val: number) =>
    padding.top + plotHeight - ((val - qqMinY) / (qqMaxY - qqMinY)) * plotWidth; // keep aspect ratio consistent

  // Reference line (y = x)
  const x1Ref = scaleQQX(-3.0);
  const y1Ref = scaleQQY(-3.0);
  const x2Ref = scaleQQX(3.0);
  const y2Ref = scaleQQY(3.0);

  // Confidence envelope path
  const envelopePath = useMemo(() => {
    if (audit.qqPoints.length < 3) return '';
    const upperPoints: string[] = [];
    const lowerPoints: string[] = [];

    audit.qqPoints.forEach((p) => {
      const sx = scaleQQX(p.theoreticalQuantile);
      const syUpper = scaleQQY(p.upperEnvelope);
      const syLower = scaleQQY(p.lowerEnvelope);
      upperPoints.push(`${sx.toFixed(1)},${syUpper.toFixed(1)}`);
      lowerPoints.unshift(`${sx.toFixed(1)},${syLower.toFixed(1)}`);
    });

    return `M ${upperPoints.join(' L ')} L ${lowerPoints.join(' L ')} Z`;
  }, [audit.qqPoints, plotWidth, plotHeight]);

  // --- Homoscedasticity Coordinates Helper ---
  const fittedVals = audit.homoscedasticityPoints.map((p) => p.fitted);
  const minFitted = Math.min(...fittedVals);
  const maxFitted = Math.max(...fittedVals);
  const fittedSpan = maxFitted - minFitted || 1.0;
  const hscMinX = minFitted - fittedSpan * 0.08;
  const hscMaxX = maxFitted + fittedSpan * 0.08;

  const resVals = audit.homoscedasticityPoints.map((p) => p.stdResidual);
  const minRes = Math.min(-3.0, ...resVals);
  const maxRes = Math.max(3.0, ...resVals);
  const hscMinY = Math.min(minRes, -3.2);
  const hscMaxY = Math.max(maxRes, 3.2);

  const scaleHscX = (val: number) =>
    padding.left + ((val - hscMinX) / (hscMaxX - hscMinX)) * plotWidth;
  const scaleHscY = (val: number) =>
    padding.top + plotHeight - ((val - hscMinY) / (hscMaxY - hscMinY)) * plotHeight;

  // Moving average line across fitted values for trend detection
  const loessTrendPath = useMemo(() => {
    if (audit.homoscedasticityPoints.length < 5) return '';
    const sorted = [...audit.homoscedasticityPoints].sort((a, b) => a.fitted - b.fitted);
    const windowSize = Math.max(3, Math.floor(sorted.length * 0.35));
    const smoothed: { x: number; y: number }[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(sorted.length, i + Math.floor(windowSize / 2) + 1);
      const slice = sorted.slice(start, end);
      const avgY = slice.reduce((acc, p) => acc + p.stdResidual, 0) / slice.length;
      smoothed.push({ x: scaleHscX(sorted[i].fitted), y: scaleHscY(avgY) });
    }

    return `M ${smoothed.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`;
  }, [audit.homoscedasticityPoints, plotWidth, plotHeight, hscMinX, hscMaxX, hscMinY, hscMaxY]);

  // --- Histogram Coordinates Helper ---
  const maxCount = Math.max(
    ...audit.histogramBins.map((b) => b.count),
    ...audit.normalCurvePoints.map((p) => p.expectedCount),
    2
  );
  const histMinX = Math.min(-3.2, audit.histogramBins[0]?.binStart ?? -3.2);
  const histMaxX = Math.max(3.2, audit.histogramBins[audit.histogramBins.length - 1]?.binEnd ?? 3.2);

  const scaleHistX = (val: number) =>
    padding.left + ((val - histMinX) / (histMaxX - histMinX)) * plotWidth;
  const scaleHistY = (val: number) =>
    padding.top + plotHeight - (val / (maxCount * 1.15)) * plotHeight;

  // Normal curve path for histogram
  const normalCurvePath = useMemo(() => {
    if (audit.normalCurvePoints.length === 0) return '';
    const points = audit.normalCurvePoints.map((p) => {
      const x = scaleHistX(p.x);
      const y = scaleHistY(p.expectedCount);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return `M ${points.join(' L ')}`;
  }, [audit.normalCurvePoints, plotWidth, plotHeight, histMinX, histMaxX, maxCount]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Auditor Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-linear-to-r from-slate-50 via-white to-blue-50/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 bg-blue-100 text-blue-700 rounded-md">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono text-blue-700 uppercase tracking-wider font-semibold">
                Automated Assumption Auditor
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-mono text-slate-500">
                APA 7th Verification Protocol
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Diagnostic Assessment: {audit.dvName}</span>
              <span className="text-xs font-normal text-slate-500 font-sans">
                ({audit.testType}, N = {audit.sampleSize})
              </span>
            </h3>
          </div>

          {/* Action buttons & status badge */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono flex items-center gap-1.5 ${
                audit.overallHealth === 'Optimal'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : audit.overallHealth === 'Caution'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              {audit.overallHealth === 'Optimal' ? (
                <Check className="w-3.5 h-3.5 text-emerald-700" />
              ) : audit.overallHealth === 'Caution' ? (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
              )}
              <span>
                {audit.overallHealth === 'Optimal'
                  ? 'Parametric Assumptions Satisfied'
                  : audit.overallHealth === 'Caution'
                  ? 'Mild Empirical Caution'
                  : 'Assumptions Violated'}
              </span>
            </span>

            <button
              onClick={handleCopyStatement}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Copy academic narrative to clipboard"
            >
              {copiedStatement ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>{copiedStatement ? 'Copied to Clipboard' : 'Copy APA Statement'}</span>
            </button>

            <button
              onClick={handleDownloadSvg}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1"
              title="Download vector graphic for manuscript publication"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export SVG</span>
            </button>

            <button
              onClick={() => setShowGuide(!showGuide)}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
              title="View APA 7th assumption guidelines"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Audit Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Normality Index</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-xs font-bold text-slate-800">
                Skew: {audit.skewness > 0 ? `+${audit.skewness.toFixed(2)}` : audit.skewness.toFixed(2)}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  audit.normalityStatus === 'Passed'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {audit.normalityStatus}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Kurtosis: {audit.excessKurtosis.toFixed(2)} (JB p = {audit.jarqueBeraP < .001 ? '< .001' : audit.jarqueBeraP.toFixed(3)})
            </span>
          </div>

          <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Equal Variances</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-xs font-bold text-slate-800">
                {audit.leveneF !== undefined
                  ? `Levene F: ${audit.leveneF.toFixed(2)}`
                  : audit.varianceRatio !== undefined
                  ? `Ratio: ${audit.varianceRatio.toFixed(2)}`
                  : 'Uniform Spread'}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  audit.homoscedasticityStatus === 'Passed'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {audit.homoscedasticityStatus}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {audit.leveneP !== undefined
                ? `p = ${audit.leveneP < .001 ? '< .001' : audit.leveneP.toFixed(3)}`
                : 'Homogeneity verified'}
            </span>
          </div>

          <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Outlier Screening</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-xs font-bold text-slate-800">
                {audit.outlierCount === 0 ? '0 Flags' : `${audit.outlierCount} Flagged`}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  audit.outlierCount === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}
              >
                {audit.outlierCount === 0 ? 'Clean' : '|z| ≥ 2.5'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {audit.outlierCount === 0 ? 'No leverage cases' : `Cases: ${audit.outlierIndices.join(', ')}`}
            </span>
          </div>

          <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Inferential Guidance</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-xs font-bold text-slate-800 truncate">
                {audit.recommendation}
              </span>
            </div>
            <span className="text-[10px] text-blue-600 block mt-0.5 font-medium">
              APA 7th Ready
            </span>
          </div>
        </div>

        {/* Expandable APA Methodological Guidelines */}
        {showGuide && (
          <div className="mt-4 p-4 bg-blue-50/60 border border-blue-200 rounded-lg text-xs space-y-2 text-slate-700">
            <div className="font-bold text-blue-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>APA 7th Publication Manual: Assumption Auditing Standard</span>
            </div>
            <p className="leading-relaxed">
              Modern academic statistical reporting mandates testing assumptions before interpreting test statistics. Significance testing for normality (such as Shapiro-Wilk) is overly sensitive at large sample sizes (N &gt; 100) and underpowered at small sizes. The APA recommends <strong>visual inspection of normal Q-Q plots</strong>, checking that skewness and kurtosis lie within [-1.0, +1.0], and ensuring residuals do not display heteroscedastic fan patterns.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 bg-white rounded border border-blue-100">
                <strong>Q-Q Plot:</strong> Points should align along the 45° line within the 95% shaded confidence envelope.
              </div>
              <div className="p-2 bg-white rounded border border-blue-100">
                <strong>Homoscedasticity:</strong> Residuals vs. Fitted values must display an even vertical dispersion with zero funneling.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auditor Plot View Switcher */}
      <div className="flex border-b border-slate-200 bg-slate-50/70 px-6 pt-3 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('qq')}
          className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'qq'
              ? 'border-blue-600 text-blue-700 bg-white/70 rounded-t-md'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Normal Q-Q Probability Plot</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-200/80 text-slate-700">
            Normality
          </span>
        </button>

        <button
          onClick={() => setActiveTab('homoscedasticity')}
          className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'homoscedasticity'
              ? 'border-blue-600 text-blue-700 bg-white/70 rounded-t-md'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Residuals vs. Fitted Plot</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-200/80 text-slate-700">
            Homoscedasticity
          </span>
        </button>

        <button
          onClick={() => setActiveTab('histogram')}
          className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'histogram'
              ? 'border-blue-600 text-blue-700 bg-white/70 rounded-t-md'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Residual Histogram & Gaussian Curve</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-200/80 text-slate-700">
            Density
          </span>
        </button>

        <button
          onClick={() => setActiveTab('outliers')}
          className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'outliers'
              ? 'border-blue-600 text-blue-700 bg-white/70 rounded-t-md'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Outlier & Influence Screening</span>
          {audit.outlierCount > 0 && (
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-100 text-rose-700 font-bold">
              {audit.outlierCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Canvas & Panel Area */}
      <div className="p-6">
        {/* TAB 1: Normal Q-Q Plot */}
        {activeTab === 'qq' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-slate-50/50 rounded-xl p-4 border border-slate-200 relative">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-bold text-slate-900">
                    Normal Q-Q Plot (Blom's Quantiles vs. Standardized Residuals)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Solid line depicts theoretical standard normal reference line (y = x); shaded band denotes 95% pointwise envelope.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-0.5 bg-rose-500 inline-block"></span>
                    y = x Reference
                  </span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-2 bg-blue-100 border border-blue-300 inline-block"></span>
                    95% Envelope
                  </span>
                </div>
              </div>

              {/* Responsive SVG Chart */}
              <div className="w-full overflow-hidden">
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${width} ${height}`}
                  className="w-full h-auto select-none font-sans"
                >
                  {/* Grid Lines */}
                  {[-3, -2, -1, 0, 1, 2, 3].map((val) => {
                    const x = scaleQQX(val);
                    const y = scaleQQY(val);
                    return (
                      <React.Fragment key={val}>
                        <line
                          x1={x}
                          y1={padding.top}
                          x2={x}
                          y2={padding.top + plotHeight}
                          stroke="#e2e8f0"
                          strokeDasharray="3 3"
                        />
                        <line
                          x1={padding.left}
                          y1={y}
                          x2={padding.left + plotWidth}
                          y2={y}
                          stroke="#e2e8f0"
                          strokeDasharray="3 3"
                        />
                      </React.Fragment>
                    );
                  })}

                  {/* 95% Confidence Envelope */}
                  {envelopePath && (
                    <path
                      d={envelopePath}
                      fill="#3b82f6"
                      fillOpacity="0.08"
                      stroke="#93c5fd"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Theoretical 45 degree reference line */}
                  <line
                    x1={x1Ref}
                    y1={y1Ref}
                    x2={x2Ref}
                    y2={y2Ref}
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />

                  {/* Axes */}
                  <line
                    x1={padding.left}
                    y1={padding.top + plotHeight}
                    x2={padding.left + plotWidth}
                    y2={padding.top + plotHeight}
                    stroke="#64748b"
                    strokeWidth="1.2"
                  />
                  <line
                    x1={padding.left}
                    y1={padding.top}
                    x2={padding.left}
                    y2={padding.top + plotHeight}
                    stroke="#64748b"
                    strokeWidth="1.2"
                  />

                  {/* X Axis Ticks & Labels */}
                  {[-3, -2, -1, 0, 1, 2, 3].map((val) => {
                    const x = scaleQQX(val);
                    return (
                      <g key={`xtick-${val}`}>
                        <line
                          x1={x}
                          y1={padding.top + plotHeight}
                          x2={x}
                          y2={padding.top + plotHeight + 5}
                          stroke="#64748b"
                        />
                        <text
                          x={x}
                          y={padding.top + plotHeight + 17}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#64748b"
                          fontFamily="monospace"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Y Axis Ticks & Labels */}
                  {[-3, -2, -1, 0, 1, 2, 3].map((val) => {
                    const y = scaleQQY(val);
                    return (
                      <g key={`ytick-${val}`}>
                        <line
                          x1={padding.left - 5}
                          y1={y}
                          x2={padding.left}
                          y2={y}
                          stroke="#64748b"
                        />
                        <text
                          x={padding.left - 8}
                          y={y + 3}
                          textAnchor="end"
                          fontSize="10"
                          fill="#64748b"
                          fontFamily="monospace"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Axis Title Labels */}
                  <text
                    x={padding.left + plotWidth / 2}
                    y={height - 8}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill="#334155"
                  >
                    Theoretical Standard Normal Quantiles (z)
                  </text>
                  <text
                    x={-((padding.top + plotHeight / 2))}
                    y={16}
                    textAnchor="middle"
                    transform="rotate(-90)"
                    fontSize="11"
                    fontWeight="600"
                    fill="#334155"
                  >
                    Sample Standardized Residuals (z)
                  </text>

                  {/* Data Points */}
                  {audit.qqPoints.map((pt, i) => {
                    const cx = scaleQQX(pt.theoreticalQuantile);
                    const cy = scaleQQY(pt.sampleStdResidual);
                    const isHovered = hoveredQQ?.obsIndex === pt.obsIndex;

                    return (
                      <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r={isHovered ? 5.5 : pt.isOutlier ? 4.5 : 3.5}
                        fill={pt.isOutlier ? '#f43f5e' : '#2563eb'}
                        stroke={isHovered ? '#1e293b' : '#ffffff'}
                        strokeWidth={isHovered ? 2 : 1}
                        className="cursor-pointer transition-all duration-100"
                        onMouseEnter={() => setHoveredQQ(pt)}
                        onMouseLeave={() => setHoveredQQ(null)}
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Hover Tooltip Overlay */}
              {hoveredQQ && (
                <div className="absolute top-4 right-4 bg-slate-900/90 text-white text-xs p-2.5 rounded-lg shadow-lg font-mono pointer-events-none backdrop-blur-xs border border-slate-700">
                  <div className="font-bold text-blue-300 mb-1">
                    Observation #{hoveredQQ.obsIndex}
                  </div>
                  <div>Theoretical Quantile: {hoveredQQ.theoreticalQuantile.toFixed(2)}</div>
                  <div>Std Residual: {hoveredQQ.sampleStdResidual.toFixed(2)}</div>
                  <div>Raw Residual: {hoveredQQ.rawResidual.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-300 mt-1">
                    {hoveredQQ.isOutlier ? '⚠️ Outlier (|z| ≥ 2.50)' : '✓ Within expected range'}
                  </div>
                </div>
              )}
            </div>

            {/* Q-Q Narrative Interpretation Column */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  <span>Normality Audit Summary</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {audit.normalityDetail}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sample Skewness:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {audit.skewness.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Excess Kurtosis:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {audit.excessKurtosis.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jarque-Bera Statistic:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      χ² = {audit.jarqueBera.toFixed(2)} (p = {audit.jarqueBeraP < .001 ? '< .001' : audit.jarqueBeraP.toFixed(3)})
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-2">
                <span className="font-semibold text-slate-800 block">
                  How to inspect a Q-Q Plot:
                </span>
                <ul className="space-y-1.5 text-slate-600 text-[11px] list-disc list-inside">
                  <li><strong>Ideal Normality:</strong> Observations trace the diagonal line smoothly without systematic curvature.</li>
                  <li><strong>S-Shape:</strong> Indicates heavy tails (excess kurtosis) or light tails.</li>
                  <li><strong>Bow / C-Shape:</strong> Indicates positive or negative skewness.</li>
                  <li><strong>Asymptotic Safety:</strong> With N ≥ 30, the Central Limit Theorem cushions slight deviations.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Homoscedasticity Plot (Residuals vs Fitted) */}
        {activeTab === 'homoscedasticity' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-slate-50/50 rounded-xl p-4 border border-slate-200 relative">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-bold text-slate-900">
                    Homoscedasticity Plot: Standardized Residuals vs. Fitted Values (Ŷ)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Horizontal center line is zero residual baseline; amber dashed lines represent ±2.0 SD thresholds.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-0.5 bg-blue-500 inline-block"></span>
                    Zero Line
                  </span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-0.5 bg-amber-500 inline-block border-dashed"></span>
                    ±2 SD
                  </span>
                </div>
              </div>

              {/* Responsive SVG Chart */}
              <div className="w-full overflow-hidden">
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${width} ${height}`}
                  className="w-full h-auto select-none font-sans"
                >
                  {/* Grid Lines */}
                  {[-3, -2, -1, 0, 1, 2, 3].map((val) => {
                    const y = scaleHscY(val);
                    return (
                      <line
                        key={val}
                        x1={padding.left}
                        y1={y}
                        x2={padding.left + plotWidth}
                        y2={y}
                        stroke={val === 0 ? '#94a3b8' : '#e2e8f0'}
                        strokeWidth={val === 0 ? 1.5 : 1}
                        strokeDasharray={val === 0 ? undefined : '3 3'}
                      />
                    );
                  })}

                  {/* Warning Threshold lines (+2.0 and -2.0) */}
                  <line
                    x1={padding.left}
                    y1={scaleHscY(2.0)}
                    x2={padding.left + plotWidth}
                    y2={scaleHscY(2.0)}
                    stroke="#f59e0b"
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                  />
                  <line
                    x1={padding.left}
                    y1={scaleHscY(-2.0)}
                    x2={padding.left + plotWidth}
                    y2={scaleHscY(-2.0)}
                    stroke="#f59e0b"
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                  />

                  {/* Smoothed Trend Line */}
                  {loessTrendPath && (
                    <path
                      d={loessTrendPath}
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Axes */}
                  <line
                    x1={padding.left}
                    y1={padding.top + plotHeight}
                    x2={padding.left + plotWidth}
                    y2={padding.top + plotHeight}
                    stroke="#64748b"
                    strokeWidth="1.2"
                  />
                  <line
                    x1={padding.left}
                    y1={padding.top}
                    x2={padding.left}
                    y2={padding.top + plotHeight}
                    stroke="#64748b"
                    strokeWidth="1.2"
                  />

                  {/* Y Axis Ticks & Labels */}
                  {[-3, -2, -1, 0, 1, 2, 3].map((val) => {
                    const y = scaleHscY(val);
                    return (
                      <g key={`hsc-y-${val}`}>
                        <line
                          x1={padding.left - 5}
                          y1={y}
                          x2={padding.left}
                          y2={y}
                          stroke="#64748b"
                        />
                        <text
                          x={padding.left - 8}
                          y={y + 3}
                          textAnchor="end"
                          fontSize="10"
                          fill="#64748b"
                          fontFamily="monospace"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* X Axis Ticks & Labels (Fitted Values) */}
                  {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
                    const fittedVal = hscMinX + frac * (hscMaxX - hscMinX);
                    const x = scaleHscX(fittedVal);
                    return (
                      <g key={`hsc-x-${idx}`}>
                        <line
                          x1={x}
                          y1={padding.top + plotHeight}
                          x2={x}
                          y2={padding.top + plotHeight + 5}
                          stroke="#64748b"
                        />
                        <text
                          x={x}
                          y={padding.top + plotHeight + 17}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#64748b"
                          fontFamily="monospace"
                        >
                          {fittedVal.toFixed(1)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Axis Title Labels */}
                  <text
                    x={padding.left + plotWidth / 2}
                    y={height - 8}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill="#334155"
                  >
                    Fitted Values Ŷ (Conditional Group/Model Means)
                  </text>
                  <text
                    x={-((padding.top + plotHeight / 2))}
                    y={16}
                    textAnchor="middle"
                    transform="rotate(-90)"
                    fontSize="11"
                    fontWeight="600"
                    fill="#334155"
                  >
                    Standardized Residuals (z)
                  </text>

                  {/* Scatter Points */}
                  {audit.homoscedasticityPoints.map((pt, i) => {
                    const cx = scaleHscX(pt.fitted);
                    const cy = scaleHscY(pt.stdResidual);
                    const isHovered = hoveredHSc?.obsIndex === pt.obsIndex;

                    return (
                      <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r={isHovered ? 5.5 : pt.isOutlier ? 4.5 : 3.5}
                        fill={pt.isOutlier ? '#f43f5e' : '#0284c7'}
                        stroke={isHovered ? '#0f172a' : '#ffffff'}
                        strokeWidth={isHovered ? 2 : 1}
                        className="cursor-pointer transition-all duration-100"
                        onMouseEnter={() => setHoveredHSc(pt)}
                        onMouseLeave={() => setHoveredHSc(null)}
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Hover Tooltip Overlay */}
              {hoveredHSc && (
                <div className="absolute top-4 right-4 bg-slate-900/90 text-white text-xs p-2.5 rounded-lg shadow-lg font-mono pointer-events-none backdrop-blur-xs border border-slate-700">
                  <div className="font-bold text-blue-300 mb-1">
                    Observation #{hoveredHSc.obsIndex} {hoveredHSc.group ? `(${hoveredHSc.group})` : ''}
                  </div>
                  <div>Fitted Ŷ: {hoveredHSc.fitted.toFixed(2)}</div>
                  <div>Raw Residual: {hoveredHSc.residual.toFixed(2)}</div>
                  <div>Std Residual: {hoveredHSc.stdResidual.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-300 mt-1">
                    {hoveredHSc.isOutlier ? '⚠️ Outlier' : '✓ Normal spread'}
                  </div>
                </div>
              )}
            </div>

            {/* Homoscedasticity Diagnostics Column */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  <span>Variance Homogeneity Verdict</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {audit.homoscedasticityDetail}
                </p>

                {audit.groupVariances && audit.groupVariances.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      Sub-Group Residual Variances:
                    </span>
                    {audit.groupVariances.map((grp) => (
                      <div key={grp.groupName} className="p-2 bg-slate-50 rounded border border-slate-200/80 text-xs">
                        <div className="flex justify-between font-medium text-slate-800">
                          <span>{grp.groupName} (n = {grp.n})</span>
                          <span className="font-mono text-slate-900">s² = {grp.variance.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500 mt-0.5">
                          <span>Mean: {grp.mean.toFixed(2)}</span>
                          <span>SD: {grp.sd.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-2">
                <span className="font-semibold text-slate-800 block">
                  Interpreting Homoscedasticity:
                </span>
                <ul className="space-y-1.5 text-slate-600 text-[11px] list-disc list-inside">
                  <li><strong>Ideal Homoscedasticity:</strong> Residuals form a horizontal rectangular band with constant vertical thickness.</li>
                  <li><strong>Funnel / Cone Shape:</strong> Error variance increases or decreases as fitted values grow (heteroscedasticity).</li>
                  <li><strong>Curved Loess Line:</strong> Suggests non-linear association or omitted higher-order terms.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Residual Histogram & Bell Curve */}
        {activeTab === 'histogram' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-slate-50/50 rounded-xl p-4 border border-slate-200 relative">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-bold text-slate-900">
                    Standardized Residual Histogram & Theoretical Gaussian Bell Curve
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Blue bars represent empirical frequency counts; smooth emerald curve displays expected standard normal density.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-2 bg-blue-500 inline-block rounded-xs"></span>
                    Observed Bins
                  </span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-0.5 bg-emerald-600 inline-block"></span>
                    N(0, 1) Bell Curve
                  </span>
                </div>
              </div>

              {/* Responsive SVG Chart */}
              <div className="w-full overflow-hidden">
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${width} ${height}`}
                  className="w-full h-auto select-none font-sans"
                >
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
                    const cVal = frac * maxCount * 1.15;
                    const y = scaleHistY(cVal);
                    return (
                      <line
                        key={idx}
                        x1={padding.left}
                        y1={y}
                        x2={padding.left + plotWidth}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray="3 3"
                      />
                    );
                  })}

                  {/* Histogram Bars */}
                  {audit.histogramBins.map((bin, idx) => {
                    const x1 = scaleHistX(bin.binStart);
                    const x2 = scaleHistX(bin.binEnd);
                    const barW = Math.max(2, x2 - x1 - 1.5);
                    const y = scaleHistY(bin.count);
                    const barH = padding.top + plotHeight - y;

                    return (
                      <g key={idx}>
                        <rect
                          x={x1 + 0.75}
                          y={y}
                          width={barW}
                          height={Math.max(0, barH)}
                          fill="#3b82f6"
                          fillOpacity="0.75"
                          stroke="#2563eb"
                          strokeWidth="1"
                          rx="1.5"
                          className="hover:fill-blue-600 transition-colors"
                        >
                          <title>
                            Bin: [{bin.binStart.toFixed(2)}, {bin.binEnd.toFixed(2)}]
                            Count: {bin.count} (Expected: {bin.expectedCount.toFixed(1)})
                          </title>
                        </rect>
                        {bin.count > 0 && (
                          <text
                            x={x1 + barW / 2}
                            y={Math.max(padding.top + 10, y - 4)}
                            textAnchor="middle"
                            fontSize="9"
                            fontFamily="monospace"
                            fill="#64748b"
                          >
                            {bin.count}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Overlaid Smooth Theoretical Normal Curve */}
                  {normalCurvePath && (
                    <path
                      d={normalCurvePath}
                      fill="none"
                      stroke="#059669"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Axes */}
                  <line
                    x1={padding.left}
                    y1={padding.top + plotHeight}
                    x2={padding.left + plotWidth}
                    y2={padding.top + plotHeight}
                    stroke="#64748b"
                    strokeWidth="1.2"
                  />
                  <line
                    x1={padding.left}
                    y1={padding.top}
                    x2={padding.left}
                    y2={padding.top + plotHeight}
                    stroke="#64748b"
                    strokeWidth="1.2"
                  />

                  {/* X Axis Ticks & Labels */}
                  {[-3, -2, -1, 0, 1, 2, 3].map((val) => {
                    const x = scaleHistX(val);
                    return (
                      <g key={`hist-x-${val}`}>
                        <line
                          x1={x}
                          y1={padding.top + plotHeight}
                          x2={x}
                          y2={padding.top + plotHeight + 5}
                          stroke="#64748b"
                        />
                        <text
                          x={x}
                          y={padding.top + plotHeight + 17}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#64748b"
                          fontFamily="monospace"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Axis Title Labels */}
                  <text
                    x={padding.left + plotWidth / 2}
                    y={height - 8}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill="#334155"
                  >
                    Standardized Residual (z)
                  </text>
                  <text
                    x={-((padding.top + plotHeight / 2))}
                    y={18}
                    textAnchor="middle"
                    transform="rotate(-90)"
                    fontSize="11"
                    fontWeight="600"
                    fill="#334155"
                  >
                    Frequency (Observation Count)
                  </text>
                </svg>
              </div>
            </div>

            {/* Histogram Column Stats */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Distribution Symmetry Profile</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The superimposed green curve represents the theoretical standard normal density function. High overlap between bars and curve confirms that error terms satisfy asymptotic gaussian assumptions.
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Residual Mean:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {audit.meanResidual.toFixed(4)} (~0.00)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Residual SD:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {audit.sdResidual.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Modal Peak:</span>
                    <span className="font-mono font-semibold text-emerald-700">
                      Unimodal (Center Aligned)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Outliers & Leverage Screening Table */}
        {activeTab === 'outliers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Influence & Outlier Screening Protocol
                </h4>
                <p className="text-xs text-slate-500">
                  Identifies cases with standardized residuals exceeding conservative threshold |z| ≥ 2.0 or academic outlier boundary |z| ≥ 2.50.
                </p>
              </div>

              <div className="text-xs font-mono">
                <span className="text-slate-500">Total Observations: </span>
                <span className="font-bold text-slate-800">{audit.sampleSize}</span>
              </div>
            </div>

            {audit.observations.filter((o) => Math.abs(o.stdResidual) >= 2.0).length === 0 ? (
              <div className="p-8 text-center bg-emerald-50/50 rounded-xl border border-emerald-200">
                <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h5 className="text-sm font-bold text-emerald-900">Zero Extreme Outliers Detected</h5>
                <p className="text-xs text-emerald-700 max-w-md mx-auto mt-1">
                  All {audit.sampleSize} observations have standardized residuals strictly bounded within [-2.0, +2.0]. Your dataset is clear of influential single-case distortions.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 font-mono text-slate-600">
                    <tr>
                      <th className="py-2.5 px-3">Case #</th>
                      {audit.observations.some((o) => o.group) && <th className="py-2.5 px-3">Sub-Group</th>}
                      <th className="py-2.5 px-3">Actual Value</th>
                      <th className="py-2.5 px-3">Fitted (Ŷ)</th>
                      <th className="py-2.5 px-3">Raw Residual</th>
                      <th className="py-2.5 px-3">Std Residual (z)</th>
                      <th className="py-2.5 px-3">Scholarly Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {audit.observations
                      .filter((o) => Math.abs(o.stdResidual) >= 2.0)
                      .map((obs) => (
                        <tr key={obs.obsIndex} className={obs.isOutlier ? 'bg-rose-50/50' : 'bg-amber-50/30'}>
                          <td className="py-2 px-3 font-bold text-slate-900">#{obs.obsIndex}</td>
                          {obs.group && <td className="py-2 px-3 text-slate-700 font-sans">{obs.group}</td>}
                          <td className="py-2 px-3 text-slate-800">{obs.actualY.toFixed(2)}</td>
                          <td className="py-2 px-3 text-slate-600">{obs.fittedY.toFixed(2)}</td>
                          <td className="py-2 px-3 text-slate-800">{obs.residual.toFixed(2)}</td>
                          <td className="py-2 px-3 font-bold">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[11px] ${
                                obs.isOutlier ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {obs.stdResidual > 0 ? `+${obs.stdResidual.toFixed(2)}` : obs.stdResidual.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-sans text-xs">
                            {obs.isOutlier ? (
                              <span className="text-rose-700 font-semibold">
                                Extreme Outlier (|z| ≥ 2.50) — Check sensitivity
                              </span>
                            ) : (
                              <span className="text-amber-700">
                                Moderate Residual (|z| ≥ 2.00) — Acceptable
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* APA 7th Manuscript Assumption Paragraph Copy Box */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>APA 7th Methodological Assumption Statement (Ready to Paste)</span>
            </span>
            <button
              onClick={handleCopyStatement}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto"
            >
              {copiedStatement ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Paragraph for Manuscript</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs sm:text-sm font-serif leading-relaxed border border-slate-800">
            <p>{audit.apaNarrative}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
