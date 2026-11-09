import React, { useState } from 'react';
import { X, Sparkles, ArrowRight, CheckCircle2, ChevronRight, RotateCcw } from 'lucide-react';
import { StatisticalTestType } from '../types/stats';

interface HypothesisWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTest: (test: StatisticalTestType) => void;
}

type WizardObjective =
  | 'compare_parametric'
  | 'compare_nonparametric'
  | 'predict'
  | 'associate'
  | 'frequencies'
  | 'descriptive';

export const HypothesisWizardModal: React.FC<HypothesisWizardModalProps> = ({
  isOpen,
  onClose,
  onSelectTest,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [objective, setObjective] = useState<WizardObjective | null>(null);

  if (!isOpen) return null;

  const handleObjectiveSelect = (obj: WizardObjective) => {
    setObjective(obj);
    if (obj === 'descriptive') {
      onSelectTest('descriptive');
      onClose();
    } else {
      setStep(2);
    }
  };

  const handleTestPick = (test: StatisticalTestType) => {
    onSelectTest(test);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              APA Quantitative Hypothesis Decision Wizard
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-3.5">
            <p className="text-xs text-slate-600">
              Step 1 of 2: What is your primary quantitative research objective?
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleObjectiveSelect('compare_parametric')}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                    I. Comparing Means & Group Differences (Parametric)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Compare average scores across 1, 2, or 3+ groups, repeated timepoints, or controlling for covariates.
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 ml-3" />
              </button>

              <button
                onClick={() => handleObjectiveSelect('compare_nonparametric')}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                    II. Non-Parametric & Rank-Based Comparisons
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    For skewed distributions, Likert ordinal scales, or when normality assumptions fail.
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 ml-3" />
              </button>

              <button
                onClick={() => handleObjectiveSelect('predict')}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                    III. Predicting Outcomes (Regression Modeling)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Predict continuous numeric outcomes (OLS regression) or binary event likelihood (logistic regression).
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 ml-3" />
              </button>

              <button
                onClick={() => handleObjectiveSelect('associate')}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                    IV. Correlation & Psychometric Scale Reliability
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Assess linear associations (Pearson/Spearman) or verify multi-item scale reliability (Cronbach's α).
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 ml-3" />
              </button>

              <button
                onClick={() => handleObjectiveSelect('frequencies')}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                    V. Categorical Frequencies & Proportions
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Test independence in cross-tabulations or assess goodness-of-fit against expected distributions.
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 ml-3" />
              </button>

              <button
                onClick={() => handleObjectiveSelect('descriptive')}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                    VI. Descriptive Screening & Normality Checks
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Screen Mean, SD, Median, Skewness, Kurtosis, and parametric normality bounds.
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 ml-3" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600">
                Step 2 of 2: Select the specific design that matches your variables:
              </p>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Change Objective</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {objective === 'compare_parametric' && (
                <>
                  <button
                    onClick={() => handleTestPick('independent_ttest')}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900">Two Independent Groups (Between-Subjects)</div>
                    <div className="text-[11px] text-slate-500">e.g. Treatment vs. Control on exam performance.</div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                      Independent Samples t-Test
                    </span>
                  </button>

                  <button
                    onClick={() => handleTestPick('paired_ttest')}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900">Same Participants Measured Twice (Within-Subjects)</div>
                    <div className="text-[11px] text-slate-500">e.g. Baseline Pre-test vs. Follow-up Post-test.</div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                      Paired Samples t-Test
                    </span>
                  </button>

                  <button
                    onClick={() => handleTestPick('one_sample_ttest')}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900">Single Sample vs. Criterion Benchmark (μ₀)</div>
                    <div className="text-[11px] text-slate-500">e.g. Comparing cohort mean against a state benchmark of 75.0.</div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                      One-Sample t-Test
                    </span>
                  </button>

                  <button
                    onClick={() => handleTestPick('anova')}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900">Three or More Independent Groups (One-Way)</div>
                    <div className="text-[11px] text-slate-500">e.g. Placebo vs. Low Dose vs. High Dose with Tukey HSD post-hoc.</div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                      One-Way Between-Subjects ANOVA
                    </span>
                  </button>

                  <button
                    onClick={() => handleTestPick('two_way_anova')}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900">Two Independent Factors with Interaction (Factorial)</div>
                    <div className="text-[11px] text-slate-500">e.g. Intervention Arm × Gender on Blood Pressure.</div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                      Two-Way Factorial ANOVA (A × B)
                    </span>
                  </button>

                  <button
                    onClick={() => handleTestPick('repeated_measures_anova')}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900">Longitudinal / 3+ Repeated Timepoints (Within-Subjects)</div>
                    <div className="text-[11px] text-slate-500">e.g. Week 0, Week 6, Week 12 tracked within same participants.</div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                      Repeated Measures ANOVA
                    </span>
                  </button>

                  <button
                    onClick={() => handleTestPick('ancova')}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900">Group Differences Controlling for a Continuous Confounder</div>
                    <div className="text-[11px] text-slate-500">e.g. Post-treatment score adjusting for baseline score or age.</div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                      ANCOVA (Analysis of Covariance)
                    </span>
                  </button>
                </>
              )}

              {objective === 'compare_nonparametric' && (
                <>
                  <button
                    onClick={() => handleTestPick('mann_whitney')}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900">2 Independent Groups (Non-Normal / Ordinal)</div>
                    <div className="text-[11px] text-slate-500">Non-parametric alternative to independent t-test (Wilcoxon rank-sum).</div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                      Mann-Whitney U Test
                    </span>
                  </button>

                  <button
                    onClick={() => handleTestPick('wilcoxon_signed')}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900">Paired / Matched Conditions (Non-Normal Differences)</div>
                    <div className="text-[11px] text-slate-500">Non-parametric alternative to paired t-test using signed ranks.</div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                      Wilcoxon Signed-Rank Test
                    </span>
                  </button>

                  <button
                    onClick={() => handleTestPick('kruskal_wallis')}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900">3 or More Independent Groups (Non-Normal)</div>
                    <div className="text-[11px] text-slate-500">Non-parametric alternative to One-Way ANOVA using ranks.</div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                      Kruskal-Wallis H Test
                    </span>
                  </button>

                  <button
                    onClick={() => handleTestPick('friedman')}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900">3 or More Repeated Conditions (Non-Normal)</div>
                    <div className="text-[11px] text-slate-500">Non-parametric alternative to repeated measures ANOVA.</div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                      Friedman Test
                    </span>
                  </button>
                </>
              )}

              {objective === 'predict' && (
                <>
                  <button
                    onClick={() => handleTestPick('regression')}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900">Continuous Numeric Outcome (OLS Regression)</div>
                    <div className="text-[11px] text-slate-500">e.g. Predicting GPA or Blood Pressure from study hours and sleep.</div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                      Multiple Linear Regression
                    </span>
                  </button>

                  <button
                    onClick={() => handleTestPick('logistic_regression')}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900">Dichotomous Categorical Event (Binary 0/1 Outcome)</div>
                    <div className="text-[11px] text-slate-500">e.g. Predicting Pass vs Fail, or Turnover Risk with Odds Ratios.</div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                      Binary Logistic Regression
                    </span>
                  </button>
                </>
              )}

              {objective === 'associate' && (
                <>
                  <button
                    onClick={() => handleTestPick('correlation')}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900">Bivariate Linear Association between Continuous Measures</div>
                    <div className="text-[11px] text-slate-500">Pearson r (parametric) or Spearman rho (monotonic rank).</div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                      Bivariate Correlation Matrix
                    </span>
                  </button>

                  <button
                    onClick={() => handleTestPick('cronbach_alpha')}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900">Multi-Item Scale Psychometric Reliability</div>
                    <div className="text-[11px] text-slate-500">Verify survey items form a coherent construct (α ≥ .70).</div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                      Cronbach's Alpha Scale Reliability
                    </span>
                  </button>
                </>
              )}

              {objective === 'frequencies' && (
                <>
                  <button
                    onClick={() => handleTestPick('chi_square')}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900">Relationship between 2 Categorical Variables</div>
                    <div className="text-[11px] text-slate-500">Contingency cross-tabulation table with Cramér’s V.</div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                      Chi-Square Test of Independence
                    </span>
                  </button>

                  <button
                    onClick={() => handleTestPick('chi_square_gof')}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900">Single Categorical Observed vs. Expected Frequencies</div>
                    <div className="text-[11px] text-slate-500">Test whether category frequencies differ from equality.</div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                      Chi-Square Goodness-of-Fit Test
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
