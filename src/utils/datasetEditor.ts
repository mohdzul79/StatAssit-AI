import { Dataset, ColumnMetadata, VariableType } from '../types/stats';

/**
 * Recomputes column metadata (missing counts, distinct values, sample values)
 * and updates totalRows after rows or values are edited.
 */
export function refreshDatasetMetadata(
  dataset: Dataset,
  updatedData: Record<string, any>[],
  columnsOverride?: ColumnMetadata[]
): Dataset {
  const baseColumns = columnsOverride || dataset.columns;
  const totalRows = updatedData.length;

  const refreshedColumns: ColumnMetadata[] = baseColumns.map((col) => {
    const values = updatedData
      .map((r) => r[col.name])
      .filter((v) => v !== null && v !== undefined && String(v).trim() !== '');

    const distinctSet = new Set(values);

    return {
      ...col,
      distinctCount: distinctSet.size,
      missingCount: totalRows - values.length,
      sampleValues: Array.from(distinctSet).slice(0, 3),
    };
  });

  return {
    ...dataset,
    columns: refreshedColumns,
    data: updatedData,
    totalRows,
  };
}

/**
 * Box-Muller transform for normal distribution sampling
 */
function randomNormal(mean: number, sd: number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * (sd > 0 ? sd : 1);
}

/**
 * Resizes the sample size N of a dataset.
 * - If targetN < current N: truncates to the first targetN observations.
 * - If targetN > current N:
 *     - 'resample': generates statistically consistent observations preserving means, SDs, and categorical proportions.
 *     - 'duplicate': cycles and duplicates existing rows while generating sequential participant IDs.
 *     - 'blank': appends blank/default rows for manual entry.
 */
export function resizeDatasetN(
  dataset: Dataset,
  targetN: number,
  mode: 'resample' | 'duplicate' | 'blank' = 'resample'
): Dataset {
  const currentN = dataset.data.length;
  if (targetN <= 0 || targetN === currentN) return dataset;

  if (targetN < currentN) {
    const truncatedData = dataset.data.slice(0, targetN);
    return refreshDatasetMetadata(dataset, truncatedData);
  }

  // targetN > currentN: Generate additional rows
  const additionalCount = targetN - currentN;

  // Extract distributions for continuous & categorical columns
  const columnProfiles: Record<
    string,
    {
      mean: number;
      sd: number;
      min: number;
      max: number;
      decimals: number;
      categoryWeights: { cat: string; weight: number }[];
    }
  > = {};

  dataset.columns.forEach((col) => {
    if (col.type === 'continuous') {
      const numbers = dataset.data
        .map((r) => Number(r[col.name]))
        .filter((n) => !isNaN(n) && isFinite(n));

      if (numbers.length > 0) {
        const sum = numbers.reduce((a, b) => a + b, 0);
        const mean = sum / numbers.length;
        const variance =
          numbers.length > 1
            ? numbers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (numbers.length - 1)
            : 1;
        const sd = Math.sqrt(variance);
        const min = Math.min(...numbers);
        const max = Math.max(...numbers);

        // Detect decimal places
        const firstWithDecimals = numbers.find((n) => n % 1 !== 0);
        const decimals = firstWithDecimals ? 1 : 0;

        columnProfiles[col.name] = {
          mean,
          sd,
          min,
          max,
          decimals,
          categoryWeights: [],
        };
      } else {
        columnProfiles[col.name] = {
          mean: 50,
          sd: 10,
          min: 0,
          max: 100,
          decimals: 1,
          categoryWeights: [],
        };
      }
    } else if (col.type === 'categorical') {
      const counts: Record<string, number> = {};
      let totalCats = 0;
      dataset.data.forEach((r) => {
        const val = String(r[col.name] || '');
        if (val) {
          counts[val] = (counts[val] || 0) + 1;
          totalCats++;
        }
      });

      const categoryWeights = Object.entries(counts).map(([cat, count]) => ({
        cat,
        weight: totalCats > 0 ? count / totalCats : 1,
      }));

      columnProfiles[col.name] = {
        mean: 0,
        sd: 0,
        min: 0,
        max: 0,
        decimals: 0,
        categoryWeights:
          categoryWeights.length > 0
            ? categoryWeights
            : [{ cat: col.sampleValues[0] ? String(col.sampleValues[0]) : 'Group_A', weight: 1 }],
      };
    }
  });

  // Infer ID column prefix pattern
  const idCol = dataset.columns.find((c) => c.type === 'id');
  let idPrefix = 'OBS';
  let idDigits = 3;
  if (idCol && dataset.data.length > 0) {
    const sampleId = String(dataset.data[0][idCol.name] || '');
    const match = sampleId.match(/^([A-Za-z]+)(\d+)$/);
    if (match) {
      idPrefix = match[1];
      idDigits = match[2].length;
    }
  }

  const newRows: Record<string, any>[] = [];

  for (let i = 0; i < additionalCount; i++) {
    const rowNum = currentN + i + 1;
    const row: Record<string, any> = {};

    if (mode === 'duplicate' && currentN > 0) {
      const sourceRow = dataset.data[i % currentN];
      dataset.columns.forEach((col) => {
        if (col.type === 'id') {
          row[col.name] = `${idPrefix}${String(rowNum).padStart(idDigits, '0')}`;
        } else {
          row[col.name] = sourceRow[col.name];
        }
      });
    } else {
      dataset.columns.forEach((col) => {
        if (col.type === 'id') {
          row[col.name] = `${idPrefix}${String(rowNum).padStart(idDigits, '0')}`;
        } else if (mode === 'blank') {
          row[col.name] = col.type === 'continuous' ? 0 : col.sampleValues[0] || 'Group_A';
        } else {
          // Resample mode
          const prof = columnProfiles[col.name];
          if (col.type === 'continuous' && prof) {
            const rawVal = randomNormal(prof.mean, prof.sd);
            // Clamp within reasonable empirical bounds
            const bounded = Math.max(prof.min * 0.9, Math.min(prof.max * 1.1, rawVal));
            row[col.name] = prof.decimals > 0 ? Number(bounded.toFixed(prof.decimals)) : Math.round(bounded);
          } else if (col.type === 'categorical' && prof && prof.categoryWeights.length > 0) {
            // Weighted random selection
            const rand = Math.random();
            let cumulative = 0;
            let chosenCat = prof.categoryWeights[0].cat;
            for (const item of prof.categoryWeights) {
              cumulative += item.weight;
            }
            let running = 0;
            for (const item of prof.categoryWeights) {
              running += item.weight / cumulative;
              if (rand <= running) {
                chosenCat = item.cat;
                break;
              }
            }
            row[col.name] = chosenCat;
          } else {
            row[col.name] = col.sampleValues[0] || null;
          }
        }
      });
    }

    newRows.push(row);
  }

  const updatedData = [...dataset.data, ...newRows];
  return refreshDatasetMetadata(dataset, updatedData);
}

/**
 * Recodes values of a categorical variable according to a mapping
 */
export function recodeVariable(
  dataset: Dataset,
  colName: string,
  mapping: Record<string, string>
): Dataset {
  const updatedData = dataset.data.map((row) => {
    const val = String(row[colName] || '');
    if (val in mapping && mapping[val].trim() !== '') {
      return {
        ...row,
        [colName]: mapping[val].trim(),
      };
    }
    return row;
  });

  return refreshDatasetMetadata(dataset, updatedData);
}

/**
 * Reorders columns in a dataset according to the specified array of column names
 */
export function reorderColumns(dataset: Dataset, newColOrder: string[]): Dataset {
  const colMap = new Map(dataset.columns.map((c) => [c.name, c]));
  const orderedCols: ColumnMetadata[] = [];

  newColOrder.forEach((name) => {
    const col = colMap.get(name);
    if (col) {
      orderedCols.push(col);
      colMap.delete(name);
    }
  });

  // Append any columns that weren't in newColOrder
  colMap.forEach((col) => orderedCols.push(col));

  return {
    ...dataset,
    columns: orderedCols,
  };
}

/**
 * Exports a dataset object to a standard CSV string
 */
export function exportDatasetToCsv(dataset: Dataset): string {
  if (dataset.columns.length === 0) return '';

  const headers = dataset.columns.map((c) => `"${c.name.replace(/"/g, '""')}"`).join(',');
  const rows = dataset.data.map((row) => {
    return dataset.columns
      .map((col) => {
        const val = row[col.name];
        if (val === null || val === undefined) return '';
        if (typeof val === 'number') return String(val);
        const str = String(val);
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  return [headers, ...rows].join('\r\n');
}

/**
 * Initiates browser download of the dataset as a .csv file
 */
export function downloadDatasetCsv(dataset: Dataset, filename?: string): void {
  const csvContent = exportDatasetToCsv(dataset);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = (filename || dataset.name || 'dataset')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  link.setAttribute('href', url);
  link.setAttribute('download', `${safeName}_edited.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
