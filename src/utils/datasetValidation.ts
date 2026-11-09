import { Dataset, StatisticalTestType } from '../types/stats';
import { TEST_STUDY_PRESETS } from './testStudyPresets';

export interface DatasetValidationResult {
  isComplete: boolean;
  reason: string;
  missingCount: number;
  emptyCells: { rowIndex: number; colName: string }[];
  testTitle?: string;
  testRequirementsSummary?: string;
  missingResearchQuestion?: boolean;
}

/**
 * Validates whether a dataset fulfills all compulsory empirical data requirements
 * based on the selected statistical test design before proceeding to Step 3: Test Analysis.
 */
export function validateDatasetForTest(
  dataset: Dataset | null | undefined,
  selectedTest?: StatisticalTestType
): DatasetValidationResult {
  if (!dataset) {
    return {
      isComplete: false,
      reason: 'No dataset is currently selected.',
      missingCount: 0,
      emptyCells: [],
    };
  }

  const totalRows = dataset.totalRows !== undefined && dataset.totalRows !== null ? dataset.totalRows : dataset.data?.length || 0;
  const totalCols = dataset.columns?.length || 0;
  const testPreset = selectedTest ? TEST_STUDY_PRESETS[selectedTest] : null;
  const testTitle = testPreset?.testTitle || 'Selected Statistical Test';

  // 1. Check if dataset has 0 rows (e.g. after reset to baseline)
  if (totalRows === 0 || !dataset.data || dataset.data.length === 0) {
    return {
      isComplete: false,
      reason: `Dataset is empty (N = 0). Please insert observation rows or load a study dataset for ${testTitle}.`,
      missingCount: 0,
      emptyCells: [],
      testTitle,
      testRequirementsSummary: 'Requires at least 2 observation rows with complete values.',
    };
  }

  // 2. Check if dataset has at least 2 rows (minimum mathematical requirement for any inferential test)
  if (totalRows < 2) {
    return {
      isComplete: false,
      reason: `Sample size N (${totalRows}) is insufficient. At least 2 observations are required to conduct statistical analysis.`,
      missingCount: 0,
      emptyCells: [],
      testTitle,
      testRequirementsSummary: 'Requires at least 2 observations.',
    };
  }

  // 3. Check if variables are defined
  if (totalCols === 0) {
    return {
      isComplete: false,
      reason: 'Dataset must have at least one defined variable column.',
      missingCount: 0,
      emptyCells: [],
      testTitle,
      testRequirementsSummary: 'Requires defined variable columns.',
    };
  }

  // 4. Check for blank, empty, null, undefined, or NaN cells
  const emptyCells: { rowIndex: number; colName: string }[] = [];
  for (let rowIndex = 0; rowIndex < dataset.data.length; rowIndex++) {
    const row = dataset.data[rowIndex];
    for (const col of dataset.columns) {
      const val = row[col.name];
      if (
        val === undefined ||
        val === null ||
        String(val).trim() === '' ||
        (typeof val === 'number' && isNaN(val))
      ) {
        emptyCells.push({ rowIndex, colName: col.name });
      }
    }
  }

  if (emptyCells.length > 0) {
    return {
      isComplete: false,
      reason: `Found ${emptyCells.length} blank or incomplete cell${
        emptyCells.length > 1 ? 's' : ''
      }. All observation cells must be filled up before proceeding.`,
      missingCount: emptyCells.length,
      emptyCells,
      testTitle,
      testRequirementsSummary: 'All data cells must be filled with valid numbers or categories.',
    };
  }

  // 5. Compulsory Check: Research Questions Added & Defined
  const researchQuestions = dataset.researchQuestions || [];
  if (researchQuestions.length === 0) {
    return {
      isComplete: false,
      reason: `No research questions added. You must add and define at least one empirical research question for ${testTitle} before proceeding to Step 3.`,
      missingCount: 0,
      emptyCells: [],
      testTitle,
      testRequirementsSummary: 'At least 1 empirical research question must be added and defined.',
      missingResearchQuestion: true,
    };
  }

  const validRqs = researchQuestions.filter(
    (rq) => rq.question && rq.question.trim().length > 0 && rq.title && rq.title.trim().length > 0
  );
  if (validRqs.length === 0) {
    return {
      isComplete: false,
      reason: 'Research question inquiry statement is undefined. Please define the question details before proceeding to Step 3.',
      missingCount: 0,
      emptyCells: [],
      testTitle,
      testRequirementsSummary: 'Research question title and question statement must be defined.',
      missingResearchQuestion: true,
    };
  }

  // 6. Test-Specific Design Architecture Validation
  const continuousCols = dataset.columns.filter((c) => c.type === 'continuous');
  const categoricalCols = dataset.columns.filter((c) => c.type === 'categorical');

  // Verify that continuous columns contain parseable numbers
  for (const col of continuousCols) {
    for (let rIdx = 0; rIdx < dataset.data.length; rIdx++) {
      const v = dataset.data[rIdx][col.name];
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        const num = Number(v);
        if (isNaN(num)) {
          return {
            isComplete: false,
            reason: `Column "${col.name}" is marked as Continuous (numeric), but row ${rIdx + 1} contains non-numeric value "${v}". Please correct or fill up numeric data.`,
            missingCount: 1,
            emptyCells: [{ rowIndex: rIdx, colName: col.name }],
            testTitle,
            testRequirementsSummary: 'Continuous columns must have valid numeric values in all rows.',
          };
        }
      }
    }
  }

  if (selectedTest) {
    // A. Differences Between Groups (Independent Samples)
    if (
      selectedTest === 'independent_ttest' ||
      selectedTest === 'mann_whitney'
    ) {
      if (continuousCols.length < 1) {
        return {
          isComplete: false,
          reason: `${testTitle} design requires at least 1 Continuous (scale/ratio) dependent variable (DV).`,
          missingCount: 0,
          emptyCells: [],
          testTitle,
          testRequirementsSummary: '1 continuous numeric DV + 1 categorical IV with 2 groups.',
        };
      }
      if (categoricalCols.length < 1) {
        return {
          isComplete: false,
          reason: `${testTitle} design requires at least 1 Categorical grouping variable (IV) with at least 2 groups (e.g., Treatment vs Control).`,
          missingCount: 0,
          emptyCells: [],
          testTitle,
          testRequirementsSummary: '1 continuous numeric DV + 1 categorical IV with 2 groups.',
        };
      }
      // Check if categorical column has at least 2 distinct groups in data
      const distinctGroups = new Set(dataset.data.map((r) => String(r[categoricalCols[0].name]).trim()));
      if (distinctGroups.size < 2) {
        return {
          isComplete: false,
          reason: `Grouping variable "${categoricalCols[0].name}" only has ${distinctGroups.size} group in current data. ${testTitle} requires at least 2 distinct groups.`,
          missingCount: 0,
          emptyCells: [],
          testTitle,
          testRequirementsSummary: 'Categorical IV must contain at least 2 distinct groups in data.',
        };
      }
    }

    // B. Paired-Samples Differences
    else if (
      selectedTest === 'paired_ttest' ||
      selectedTest === 'wilcoxon_signed'
    ) {
      if (continuousCols.length < 2) {
        return {
          isComplete: false,
          reason: `${testTitle} design requires at least 2 Continuous numeric variables for paired/repeated measurement (e.g. Pre-Test and Post-Test).`,
          missingCount: 0,
          emptyCells: [],
          testTitle,
          testRequirementsSummary: 'At least 2 continuous numeric variables (paired measures).',
        };
      }
    }

    // C. One-Way ANOVA / Kruskal-Wallis
    else if (selectedTest === 'anova' || selectedTest === 'kruskal_wallis') {
      if (continuousCols.length < 1) {
        return {
          isComplete: false,
          reason: `${testTitle} design requires at least 1 Continuous dependent variable (DV).`,
          missingCount: 0,
          emptyCells: [],
          testTitle,
          testRequirementsSummary: '1 continuous DV + 1 categorical factor with 2 or more groups.',
        };
      }
      if (categoricalCols.length < 1) {
        return {
          isComplete: false,
          reason: `${testTitle} design requires at least 1 Categorical grouping factor (IV).`,
          missingCount: 0,
          emptyCells: [],
          testTitle,
          testRequirementsSummary: '1 continuous DV + 1 categorical factor with 2 or more groups.',
        };
      }
    }

    // D. Two-Way ANOVA
    else if (selectedTest === 'two_way_anova') {
      if (continuousCols.length < 1) {
        return {
          isComplete: false,
          reason: 'Two-Way ANOVA design requires at least 1 Continuous dependent variable (DV).',
          missingCount: 0,
          emptyCells: [],
          testTitle,
          testRequirementsSummary: '1 continuous DV + 2 categorical factors (Factor A and Factor B).',
        };
      }
      if (categoricalCols.length < 2) {
        return {
          isComplete: false,
          reason: 'Two-Way ANOVA design requires at least 2 Categorical grouping factors (Factor A and Factor B).',
          missingCount: 0,
          emptyCells: [],
          testTitle,
          testRequirementsSummary: '1 continuous DV + 2 categorical factors (Factor A and Factor B).',
        };
      }
    }

    // E. Repeated Measures ANOVA / Friedman
    else if (
      selectedTest === 'repeated_measures_anova' ||
      selectedTest === 'friedman'
    ) {
      if (continuousCols.length < 2) {
        return {
          isComplete: false,
          reason: `${testTitle} design requires at least 2 Continuous repeated-measure variables (e.g. Time 1, Time 2, Time 3).`,
          missingCount: 0,
          emptyCells: [],
          testTitle,
          testRequirementsSummary: 'At least 2 continuous repeated-measure variables.',
        };
      }
    }

    // F. Correlation
    else if (
      selectedTest === 'correlation' ||
      selectedTest === 'spearman_correlation' ||
      selectedTest === 'point_biserial'
    ) {
      if (continuousCols.length < 2) {
        return {
          isComplete: false,
          reason: `${testTitle} design requires at least 2 Continuous numeric variables to calculate bivariate correlation.`,
          missingCount: 0,
          emptyCells: [],
          testTitle,
          testRequirementsSummary: 'At least 2 continuous numeric variables with N >= 3.',
        };
      }
      if (totalRows < 3) {
        return {
          isComplete: false,
          reason: `${testTitle} requires at least 3 paired observations to evaluate correlation.`,
          missingCount: 0,
          emptyCells: [],
          testTitle,
          testRequirementsSummary: 'At least 3 paired observations.',
        };
      }
    }

    // G. Simple Linear Regression
    else if (selectedTest === 'regression') {
      if (continuousCols.length < 2) {
        return {
          isComplete: false,
          reason: 'Simple Linear Regression requires at least 2 Continuous variables (1 predictor IV and 1 outcome DV).',
          missingCount: 0,
          emptyCells: [],
          testTitle,
          testRequirementsSummary: '1 continuous predictor IV + 1 continuous outcome DV.',
        };
      }
      if (totalRows < 3) {
        return {
          isComplete: false,
          reason: 'Simple Linear Regression requires at least 3 observations.',
          missingCount: 0,
          emptyCells: [],
          testTitle,
          testRequirementsSummary: 'At least 3 observations.',
        };
      }
    }

    // H. Multiple Linear Regression
    else if (selectedTest === 'multiple_regression') {
      if (continuousCols.length < 3) {
        return {
          isComplete: false,
          reason: 'Multiple Linear Regression requires at least 3 Continuous variables (at least 2 predictors and 1 outcome DV).',
          missingCount: 0,
          emptyCells: [],
          testTitle,
          testRequirementsSummary: 'At least 2 continuous predictors + 1 continuous outcome DV.',
        };
      }
      if (totalRows < 4) {
        return {
          isComplete: false,
          reason: 'Multiple Linear Regression requires at least 4 observations.',
          missingCount: 0,
          emptyCells: [],
          testTitle,
          testRequirementsSummary: 'At least 4 observations.',
        };
      }
    }

    // I. Chi-Square Test
    else if (
      selectedTest === 'chi_square' ||
      selectedTest === 'chi_square_association_2x2' ||
      selectedTest === 'chi_square_homogeneity_2xc' ||
      selectedTest === 'chi_square_homogeneity_rx2'
    ) {
      if (categoricalCols.length < 2) {
        return {
          isComplete: false,
          reason: `${testTitle} requires at least 2 Categorical variables for cross-tabulation contingency table.`,
          missingCount: 0,
          emptyCells: [],
          testTitle,
          testRequirementsSummary: 'At least 2 categorical variables for cross-tabulation.',
        };
      }
      if (totalRows < 4) {
        return {
          isComplete: false,
          reason: `${testTitle} requires at least 4 observations for cross-tabulation.`,
          missingCount: 0,
          emptyCells: [],
          testTitle,
          testRequirementsSummary: 'At least 4 observations.',
        };
      }
    }

    // J. One-Sample t-test
    else if (selectedTest === 'one_sample_ttest') {
      if (continuousCols.length < 1) {
        return {
          isComplete: false,
          reason: 'One-Sample t-test requires at least 1 Continuous numeric variable.',
          missingCount: 0,
          emptyCells: [],
          testTitle,
          testRequirementsSummary: 'At least 1 continuous numeric variable.',
        };
      }
    }
  }

  return {
    isComplete: true,
    reason: `Dataset fully completed: all ${totalRows} observations and variables meet the empirical requirements for ${testTitle}.`,
    missingCount: 0,
    emptyCells: [],
    testTitle,
  };
}
