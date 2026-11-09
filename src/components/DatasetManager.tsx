import React, { useState, useRef, useMemo } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Database,
  ChevronLeft,
  ChevronRight,
  ClipboardPaste,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Download,
  RotateCcw,
  Check,
  X,
  FilePlus2,
  Copy,
  SlidersHorizontal,
  Sliders,
  Shuffle,
  ArrowLeft,
  ArrowRight,
  Calculator,
  Sparkles,
  Layers,
  HelpCircle,
  Hash,
  Lock,
  BarChart2,
  Search,
} from 'lucide-react';
import { Dataset, VariableType, ColumnMetadata, ResearchQuestion, StatisticalTestType } from '../types/stats';
import { SAMPLE_DATASETS, parseCsv } from '../data/sampleDatasets';
import { isPresetStudyDataset } from '../utils/testStudyPresets';
import {
  refreshDatasetMetadata,
  resizeDatasetN,
  recodeVariable,
  reorderColumns,
  downloadDatasetCsv,
} from '../utils/datasetEditor';
import { validateDatasetForTest } from '../utils/datasetValidation';

interface DatasetManagerProps {
  currentDataset: Dataset;
  availableDatasets: Dataset[];
  onSelectDataset: (dataset: Dataset) => void;
  onUpdateDataset: (dataset: Dataset) => void;
  onDuplicateDataset: (dataset: Dataset) => void;
  onResetSampleDataset: (datasetId: string) => void;
  onResetToBaseline?: () => void;
  onUpdateColumnType: (colName: string, newType: VariableType) => void;
  onProceedToAnalysis: () => void;
  activeResearchQuestion?: ResearchQuestion | null;
  onSelectResearchQuestion?: (rq: ResearchQuestion) => void;
  onOpenAddRqModal?: () => void;
  onOpenEditRqModal?: (rq: ResearchQuestion) => void;
  onDeleteResearchQuestion?: (rqId: string) => void;
  presetStudyBanner?: {
    testTitle: string;
    datasetName: string;
    explanation: string;
  } | null;
  selectedTest?: StatisticalTestType;
  onSelectTestAndStudy?: (test: StatisticalTestType) => void;
  onNavigateToSelectingTest?: () => void;
  onOpenGoogleDrive?: () => void;
}

export const DatasetManager: React.FC<DatasetManagerProps> = ({
  currentDataset,
  availableDatasets,
  onSelectDataset,
  onUpdateDataset,
  onDuplicateDataset,
  onResetSampleDataset,
  onResetToBaseline,
  onUpdateColumnType,
  onProceedToAnalysis,
  activeResearchQuestion,
  onSelectResearchQuestion,
  onOpenAddRqModal,
  onOpenEditRqModal,
  onDeleteResearchQuestion,
  presetStudyBanner,
  selectedTest,
  onSelectTestAndStudy,
  onNavigateToSelectingTest,
  onOpenGoogleDrive,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [pastedName, setPastedName] = useState('Imported Research Data');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // In-place Cell Editing State
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number; // Absolute row index in currentDataset.data
    colName: string;
  } | null>(null);
  const [editInputValue, setEditInputValue] = useState<string>('');

  // Edit Study Info (Name, Domain, Description) Modal
  const [isEditInfoModalOpen, setIsEditInfoModalOpen] = useState(false);
  const [editStudyName, setEditStudyName] = useState(currentDataset.name);
  const [editStudyDomain, setEditStudyDomain] = useState(currentDataset.domain);
  const [editStudyDesc, setEditStudyDesc] = useState(currentDataset.description);

  // Sample Size (N) Adjuster Modal
  const [isResizeNModalOpen, setIsResizeNModalOpen] = useState(false);
  const [targetNInput, setTargetNInput] = useState<number>(currentDataset.totalRows);
  const [resizeStrategy, setResizeStrategy] = useState<'resample' | 'duplicate' | 'blank'>('resample');

  // Column / Variable Management Modals
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColType, setNewColType] = useState<VariableType>('continuous');
  const [newColGenMode, setNewColGenMode] = useState<'constant' | 'normal' | 'uniform' | 'categories'>('constant');
  const [newColDefaultVal, setNewColDefaultVal] = useState('0');
  const [newColMean, setNewColMean] = useState<number>(50);
  const [newColSd, setNewColSd] = useState<number>(10);
  const [newColMin, setNewColMin] = useState<number>(1);
  const [newColMax, setNewColMax] = useState<number>(100);
  const [newColCategories, setNewColCategories] = useState('Group_A, Group_B');

  // Column Renaming State
  const [renamingCol, setRenamingCol] = useState<string | null>(null);
  const [renameInputValue, setRenameInputValue] = useState<string>('');

  // Categorical Recoding Modal
  const [isRecodeModalOpen, setIsRecodeModalOpen] = useState(false);
  const [recodeColName, setRecodeColName] = useState<string>('');
  const [recodeMapping, setRecodeMapping] = useState<Record<string, string>>({});

  // Continuous Transformation Modal
  const [isTransformModalOpen, setIsTransformModalOpen] = useState(false);
  const [transformColName, setTransformColName] = useState<string>('');
  const [transformOp, setTransformOp] = useState<'standardize' | 'add' | 'multiply' | 'round'>('standardize');
  const [transformParam, setTransformParam] = useState<number>(10);

  const rowsPerPage = 15;

  const showFeedback = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCsv(text, file.name.replace(/\.[^/.]+$/, ''));
        onSelectDataset(parsed);
        setIsUploading(false);
        showFeedback(`Successfully loaded "${parsed.name}" (${parsed.totalRows} observations). Ready to edit.`);
      } catch (err: any) {
        showFeedback(err.message || 'Failed to parse CSV file.', true);
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      showFeedback('Failed to read file.', true);
      setIsUploading(false);
    };
    reader.readAsText(file);
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) {
      showFeedback('Please paste tabular CSV or TSV text.', true);
      return;
    }
    try {
      const parsed = parseCsv(pastedText, pastedName.trim() || 'Imported Data');
      onSelectDataset(parsed);
      setPasteModalOpen(false);
      setPastedText('');
      showFeedback(`Imported "${parsed.name}" with ${parsed.totalRows} rows. Ready to edit.`);
    } catch (err: any) {
      showFeedback(err.message || 'Error parsing pasted data.', true);
    }
  };

  // --- In-place Cell Editing Handlers ---
  const handleStartCellEdit = (absRowIndex: number, colName: string, currentValue: any) => {
    setEditingCell({ rowIndex: absRowIndex, colName });
    setEditInputValue(currentValue !== null && currentValue !== undefined ? String(currentValue) : '');
  };

  const handleSaveCellEdit = () => {
    if (!editingCell) return;
    const { rowIndex, colName } = editingCell;

    const columnMeta = currentDataset.columns.find((c) => c.name === colName);
    let parsedValue: any = editInputValue.trim();

    if (parsedValue === '' || parsedValue.toLowerCase() === 'null' || parsedValue.toLowerCase() === 'na') {
      parsedValue = null;
    } else if (columnMeta?.type === 'continuous') {
      const num = Number(parsedValue);
      parsedValue = !isNaN(num) ? num : parsedValue;
    }

    const updatedData = currentDataset.data.map((row, idx) => {
      if (idx === rowIndex) {
        return {
          ...row,
          [colName]: parsedValue,
        };
      }
      return row;
    });

    const refreshed = refreshDatasetMetadata(currentDataset, updatedData);
    onUpdateDataset(refreshed);
    setEditingCell(null);
  };

  const handleCancelCellEdit = () => {
    setEditingCell(null);
  };

  // --- Edit Study Info (Name, Domain, Description) ---
  const handleOpenEditInfo = () => {
    setEditStudyName(currentDataset.name);
    setEditStudyDomain(currentDataset.domain);
    setEditStudyDesc(currentDataset.description);
    setIsEditInfoModalOpen(true);
  };

  const handleSaveEditInfo = () => {
    const trimmedName = editStudyName.trim();
    if (!trimmedName) {
      showFeedback('Study name cannot be empty.', true);
      return;
    }

    const updated: Dataset = {
      ...currentDataset,
      name: trimmedName,
      domain: editStudyDomain.trim() || currentDataset.domain,
      description: editStudyDesc.trim() || currentDataset.description,
    };

    onUpdateDataset(updated);
    setIsEditInfoModalOpen(false);
    showFeedback(`Updated study information for "${trimmedName}".`);
  };

  // --- Sample Size N Adjuster Handlers ---
  const handleOpenResizeNModal = () => {
    setTargetNInput(currentDataset.totalRows);
    setIsResizeNModalOpen(true);
  };

  const handleApplyResizeN = () => {
    const n = Math.floor(targetNInput);
    if (isNaN(n) || n < 2) {
      showFeedback('Sample size N must be at least 2 observations.', true);
      return;
    }
    if (n > 1000) {
      showFeedback('Maximum sample size is 1,000 observations for responsive browser computations.', true);
      return;
    }
    if (n === currentDataset.totalRows) {
      setIsResizeNModalOpen(false);
      return;
    }

    const previousN = currentDataset.totalRows;
    const resized = resizeDatasetN(currentDataset, n, resizeStrategy);
    onUpdateDataset(resized);
    setIsResizeNModalOpen(false);

    const newTotalPages = Math.ceil(resized.data.length / rowsPerPage);
    if (currentPage > newTotalPages) {
      setCurrentPage(Math.max(1, newTotalPages));
    }

    showFeedback(
      `Adjusted sample size N from ${previousN} to ${n} using ${
        resizeStrategy === 'resample'
          ? 'empirical distribution resampling'
          : resizeStrategy === 'duplicate'
          ? 'observation cycling'
          : 'blank default rows'
      }.`
    );
  };

  const handleQuickStepN = (delta: number) => {
    const newN = currentDataset.totalRows + delta;
    if (newN < 2) {
      showFeedback('Sample size N cannot be less than 2 observations.', true);
      return;
    }
    const resized = resizeDatasetN(currentDataset, newN, 'resample');
    onUpdateDataset(resized);

    const newTotalPages = Math.ceil(resized.data.length / rowsPerPage);
    if (currentPage > newTotalPages) {
      setCurrentPage(Math.max(1, newTotalPages));
    }
    showFeedback(`${delta > 0 ? 'Added' : 'Removed'} ${Math.abs(delta)} observation(s). New N = ${newN}.`);
  };

  // --- Row Insertion & Deletion ---
  const handleAddRow = () => {
    const newRowObj: Record<string, any> = {};
    const nextRowNumber = currentDataset.data.length + 1;

    currentDataset.columns.forEach((col) => {
      if (col.type === 'id') {
        newRowObj[col.name] = `OBS_${String(nextRowNumber).padStart(3, '0')}`;
      } else if (col.type === 'continuous') {
        // Sample random number close to current sample mean if available
        const numbers = currentDataset.data.map((r) => Number(r[col.name])).filter((n) => !isNaN(n));
        const mean = numbers.length > 0 ? Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length) : 50;
        newRowObj[col.name] = mean;
      } else {
        newRowObj[col.name] = col.sampleValues[0] !== undefined ? String(col.sampleValues[0]) : 'Group_A';
      }
    });

    const updatedData = [...currentDataset.data, newRowObj];
    const refreshed = refreshDatasetMetadata(currentDataset, updatedData);
    onUpdateDataset(refreshed);

    const newTotalPages = Math.ceil(updatedData.length / rowsPerPage);
    setCurrentPage(newTotalPages);
    showFeedback(`Added observation row #${updatedData.length}. Current N = ${updatedData.length}. Click cells to edit.`);
  };

  const handleDeleteRow = (absRowIndex: number) => {
    if (currentDataset.data.length <= 2) {
      showFeedback('A minimum of 2 observations is required.', true);
      return;
    }

    const updatedData = currentDataset.data.filter((_, idx) => idx !== absRowIndex);
    const refreshed = refreshDatasetMetadata(currentDataset, updatedData);
    onUpdateDataset(refreshed);

    const newTotalPages = Math.ceil(updatedData.length / rowsPerPage);
    if (currentPage > newTotalPages) {
      setCurrentPage(Math.max(1, newTotalPages));
    }
    showFeedback(`Deleted observation #${absRowIndex + 1}. Current N = ${updatedData.length}.`);
  };

  // --- Variable / Column Renaming & Adding ---
  const handleStartRenameColumn = (colName: string) => {
    setRenamingCol(colName);
    setRenameInputValue(colName);
  };

  const handleSaveRenameColumn = () => {
    if (!renamingCol) return;
    const trimmedNew = renameInputValue.trim().replace(/\s+/g, '_');

    if (!trimmedNew) {
      showFeedback('Variable name cannot be empty.', true);
      return;
    }

    if (trimmedNew !== renamingCol && currentDataset.columns.some((c) => c.name === trimmedNew)) {
      showFeedback(`Variable "${trimmedNew}" already exists.`, true);
      return;
    }

    const updatedColumns = currentDataset.columns.map((c) =>
      c.name === renamingCol ? { ...c, name: trimmedNew } : c
    );

    const updatedData = currentDataset.data.map((row) => {
      const newRow = { ...row };
      if (renamingCol in newRow) {
        newRow[trimmedNew] = newRow[renamingCol];
        delete newRow[renamingCol];
      }
      return newRow;
    });

    const refreshed = refreshDatasetMetadata(currentDataset, updatedData, updatedColumns);
    onUpdateDataset(refreshed);
    setRenamingCol(null);
    showFeedback(`Renamed variable "${renamingCol}" to "${trimmedNew}".`);
  };

  const handleDeleteColumn = (colName: string) => {
    if (currentDataset.columns.length <= 1) {
      showFeedback('Dataset must have at least one variable.', true);
      return;
    }

    const updatedColumns = currentDataset.columns.filter((c) => c.name !== colName);
    const updatedData = currentDataset.data.map((row) => {
      const newRow = { ...row };
      delete newRow[colName];
      return newRow;
    });

    const refreshed = refreshDatasetMetadata(currentDataset, updatedData, updatedColumns);
    onUpdateDataset(refreshed);
    showFeedback(`Removed variable "${colName}". Total variables: ${updatedColumns.length}.`);
  };

  const handleMoveColumn = (colName: string, direction: 'left' | 'right') => {
    const currentIndex = currentDataset.columns.findIndex((c) => c.name === colName);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentDataset.columns.length) return;

    const newColumns = [...currentDataset.columns];
    const [moved] = newColumns.splice(currentIndex, 1);
    newColumns.splice(targetIndex, 0, moved);

    const reordered = reorderColumns(currentDataset, newColumns.map((c) => c.name));
    onUpdateDataset(reordered);
    showFeedback(`Moved variable "${colName}" ${direction}.`);
  };

  const handleAddColumnSubmit = () => {
    const cleanName = newColName.trim().replace(/\s+/g, '_');
    if (!cleanName) {
      showFeedback('Variable name is required.', true);
      return;
    }

    if (currentDataset.columns.some((c) => c.name === cleanName)) {
      showFeedback(`Variable "${cleanName}" already exists.`, true);
      return;
    }

    // Generate values according to selected generation mode
    let initialValues: any[] = [];
    if (newColGenMode === 'normal') {
      const mean = Number(newColMean) || 50;
      const sd = Number(newColSd) || 10;
      initialValues = currentDataset.data.map(() => {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return Math.round((mean + z * sd) * 10) / 10;
      });
    } else if (newColGenMode === 'uniform') {
      const min = Number(newColMin) || 1;
      const max = Number(newColMax) || 100;
      initialValues = currentDataset.data.map(() => {
        return Math.floor(min + Math.random() * (max - min + 1));
      });
    } else if (newColGenMode === 'categories') {
      const cats = newColCategories.split(',').map((c) => c.trim()).filter(Boolean);
      const categoryList = cats.length > 0 ? cats : ['Group_A', 'Group_B'];
      initialValues = currentDataset.data.map((_, i) => {
        return categoryList[i % categoryList.length];
      });
    } else {
      // Constant
      let defaultVal: any = newColDefaultVal.trim();
      if (newColType === 'continuous') {
        const num = Number(defaultVal);
        defaultVal = !isNaN(num) ? num : 0;
      }
      initialValues = currentDataset.data.map(() => defaultVal);
    }

    const newColMeta: ColumnMetadata = {
      name: cleanName,
      type: newColType,
      distinctCount: new Set(initialValues).size,
      missingCount: 0,
      sampleValues: Array.from(new Set(initialValues)).slice(0, 3),
    };

    const updatedColumns = [...currentDataset.columns, newColMeta];
    const updatedData = currentDataset.data.map((row, idx) => ({
      ...row,
      [cleanName]: initialValues[idx],
    }));

    const refreshed = refreshDatasetMetadata(currentDataset, updatedData, updatedColumns);
    onUpdateDataset(refreshed);
    setIsAddColumnModalOpen(false);
    setNewColName('');
    showFeedback(`Added variable "${cleanName}" (${newColType}) to dataset.`);
  };

  // --- Categorical Recoding Handlers ---
  const handleOpenRecodeModal = (colName: string) => {
    const uniqueVals = Array.from(
      new Set(currentDataset.data.map((r) => String(r[colName] || '')).filter(Boolean))
    );
    const initialMapping: Record<string, string> = {};
    uniqueVals.forEach((v) => {
      initialMapping[v] = v;
    });
    setRecodeColName(colName);
    setRecodeMapping(initialMapping);
    setIsRecodeModalOpen(true);
  };

  const handleApplyRecode = () => {
    if (!recodeColName) return;
    const updated = recodeVariable(currentDataset, recodeColName, recodeMapping);
    onUpdateDataset(updated);
    setIsRecodeModalOpen(false);
    showFeedback(`Recoded category levels for "${recodeColName}".`);
  };

  // --- Continuous Transformation Handlers ---
  const handleOpenTransformModal = (colName: string) => {
    setTransformColName(colName);
    setTransformOp('standardize');
    setTransformParam(10);
    setIsTransformModalOpen(true);
  };

  const handleApplyTransform = () => {
    if (!transformColName) return;
    const numbers = currentDataset.data
      .map((r) => Number(r[transformColName]))
      .filter((n) => !isNaN(n) && isFinite(n));

    if (numbers.length === 0) {
      showFeedback('No numeric values to transform.', true);
      return;
    }

    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const variance =
      numbers.length > 1
        ? numbers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (numbers.length - 1)
        : 1;
    const sd = Math.sqrt(variance) || 1;

    const updatedData = currentDataset.data.map((row) => {
      const val = Number(row[transformColName]);
      if (isNaN(val)) return row;

      let newVal = val;
      if (transformOp === 'standardize') {
        newVal = Number(((val - mean) / sd).toFixed(3));
      } else if (transformOp === 'add') {
        newVal = Number((val + transformParam).toFixed(2));
      } else if (transformOp === 'multiply') {
        newVal = Number((val * transformParam).toFixed(2));
      } else if (transformOp === 'round') {
        newVal = Math.round(val);
      }

      return {
        ...row,
        [transformColName]: newVal,
      };
    });

    const refreshed = refreshDatasetMetadata(currentDataset, updatedData);
    onUpdateDataset(refreshed);
    setIsTransformModalOpen(false);
    showFeedback(`Applied ${transformOp} transformation to "${transformColName}".`);
  };

  // Filtering for table viewer
  const filteredWithOrigIndices = currentDataset.data
    .map((row, originalIndex) => ({ row, originalIndex }))
    .filter(({ row }) => {
      if (!searchTerm) return true;
      return Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  const totalPages = Math.ceil(filteredWithOrigIndices.length / rowsPerPage) || 1;
  const paginatedRows = filteredWithOrigIndices.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const isCurrentSample =
    SAMPLE_DATASETS.some((s) => s.id === currentDataset.id) ||
    isPresetStudyDataset(currentDataset.id);
  const continuousCount = currentDataset.columns.filter((c) => c.type === 'continuous').length;
  const categoricalCount = currentDataset.columns.filter((c) => c.type === 'categorical').length;
  const idCount = currentDataset.columns.filter((c) => c.type === 'id').length;

  const datasetValidation = React.useMemo(() => {
    return validateDatasetForTest(currentDataset, selectedTest);
  }, [currentDataset, selectedTest]);

  const emptyCellKeys = React.useMemo(() => {
    const set = new Set<string>();
    datasetValidation.emptyCells?.forEach((c) => {
      set.add(`${c.rowIndex}_${c.colName}`);
    });
    return set;
  }, [datasetValidation.emptyCells]);

  return (
    <div className="space-y-8">
      {/* Pre-set Study Notification Banner based on Selected Test */}
      {presetStudyBanner && (
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50/60 to-cyan-50 border border-blue-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 font-mono">
                  Step 2 · Pre-Set Study Loaded
                </span>
                <span className="text-2xs font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md border border-blue-200">
                  {presetStudyBanner.testTitle}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 font-semibold mt-1">
                "{presetStudyBanner.datasetName}" study is placed with pre-configured variables.
              </p>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {presetStudyBanner.explanation} Inspect or edit data cells below, then advance to Step 3.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!datasetValidation.isComplete) {
                setErrorMsg(`Cannot proceed to Step 3: ${datasetValidation.reason} All required data must be inserted.`);
                showFeedback(`Sign of Error: ${datasetValidation.reason}. Please fill up required data.`, true);
                const tableEl = document.getElementById('dataset-data-table');
                if (tableEl) {
                  tableEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
              }
              onProceedToAnalysis();
            }}
            className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer self-end md:self-auto ${
              datasetValidation.isComplete
                ? 'text-white bg-blue-600 hover:bg-blue-700'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300'
            }`}
            title={datasetValidation.isComplete ? 'Proceed to Step 3: Test Analysis' : `Sign of Error: ${datasetValidation.reason} (Fill required data)`}
          >
            {!datasetValidation.isComplete && <AlertCircle className="w-4 h-4 text-rose-600 animate-pulse shrink-0" />}
            <span>Proceed to Step 3: Test Analysis</span>
            {datasetValidation.isComplete ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <span className="text-[10px] bg-rose-200/80 text-rose-900 px-1.5 py-0.5 rounded font-mono font-bold">
                Error: Incomplete
              </span>
            )}
          </button>
        </div>
      )}

      {/* Top Banner / Dataset Selector Strip */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="pb-6 border-b border-slate-100 space-y-4">
          {/* Top Title & Metadata - Spanning full width across top as instructed */}
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
              <span>Quantitative Data Repository</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Live Editable: N & Variables
              </span>
            </div>

            <div className="flex items-center gap-2.5 mt-1.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {currentDataset.name}
              </h1>
              <button
                onClick={handleOpenEditInfo}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="Edit study title, domain, or description"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-600 mt-1.5 max-w-5xl leading-relaxed">
              {currentDataset.description}
            </p>
          </div>

          {/* Action Toolbar Row - Dedicated horizontal toolbar underneath */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onDuplicateDataset(currentDataset)}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Duplicate this preloaded dataset to create a new editable working copy"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Duplicate Study</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv,.tsv,.txt"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Upload CSV / TSV</span>
              </button>
              <button
                onClick={() => setPasteModalOpen(true)}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ClipboardPaste className="w-3.5 h-3.5 text-slate-500" />
                <span>Paste Data</span>
              </button>
              <button
                onClick={() => downloadDatasetCsv(currentDataset)}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Download your cleaned or edited dataset as a CSV file"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => {
                  if (onResetToBaseline) {
                    onResetToBaseline();
                  } else {
                    onUpdateDataset({
                      ...currentDataset,
                      data: [],
                      totalRows: 0,
                      columns: currentDataset.columns.map((col) => ({
                        ...col,
                        distinctCount: 0,
                        missingCount: 0,
                        sampleValues: [],
                      })),
                    });
                  }
                  showFeedback('All datasets have been reset to baseline (no data).');
                }}
                className="px-2.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Reset all datasets to baseline with no data (clears all rows)"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span>Reset to baseline</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border font-medium ${
                  datasetValidation.isComplete
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border-rose-300 ring-1 ring-rose-200'
                }`}
              >
                {datasetValidation.isComplete ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 animate-pulse" />
                )}
                <span>
                  {datasetValidation.isComplete
                    ? 'Dataset Complete (Compulsory Data Verified)'
                    : `Error · Incomplete: ${datasetValidation.reason}`}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!datasetValidation.isComplete) {
                    setErrorMsg(`Cannot proceed to Step 3: ${datasetValidation.reason}`);
                    showFeedback(`Sign of Error: ${datasetValidation.reason}`, true);
                    if (datasetValidation.missingResearchQuestion) {
                      const rqEl = document.getElementById('research-questions-section');
                      if (rqEl) {
                        rqEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                      if (onOpenAddRqModal) {
                        onOpenAddRqModal();
                      }
                    } else {
                      const tableEl = document.getElementById('dataset-data-table');
                      if (tableEl) {
                        tableEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }
                    return;
                  }
                  onProceedToAnalysis();
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                  datasetValidation.isComplete
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-400 hover:border-rose-500 shadow-rose-200 ring-2 ring-rose-300/40'
                }`}
                title={
                  datasetValidation.isComplete
                    ? 'Proceed to Step 3: Test Analysis'
                    : `Sign of Error: ${datasetValidation.reason} — Click to inspect and fill up data`
                }
              >
                {!datasetValidation.isComplete && (
                  <AlertCircle className="w-4 h-4 text-rose-600 animate-bounce shrink-0" />
                )}
                <span>Proceed to Step 3: Test Analysis</span>
                {!datasetValidation.isComplete && (
                  <span className="ml-1 text-[10px] font-mono font-extrabold uppercase bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded border border-rose-300">
                    {datasetValidation.missingResearchQuestion ? 'Error: Add RQ' : 'Error: Fill Data'}
                  </span>
                )}
                {datasetValidation.isComplete && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {!datasetValidation.isComplete && (
          <div className="mt-4 p-4 bg-rose-50 border-2 border-rose-300 rounded-xl text-xs text-rose-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-600 text-white rounded-lg shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold uppercase font-mono tracking-wider text-rose-800 text-[11px] bg-rose-200/80 px-2 py-0.5 rounded border border-rose-300">
                    Sign of Error · Step 3 Blocked
                  </span>
                  {datasetValidation.testTitle && (
                    <span className="text-2xs font-bold text-rose-900 bg-white/80 px-2 py-0.5 rounded border border-rose-200">
                      Test Design: {datasetValidation.testTitle}
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-rose-800 leading-relaxed">
                  {datasetValidation.reason}
                </p>
                {datasetValidation.testRequirementsSummary && (
                  <p className="text-[11px] text-rose-700 font-mono">
                    Compulsory Requirement: {datasetValidation.testRequirementsSummary}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-auto flex-wrap">
              {datasetValidation.missingResearchQuestion && onOpenAddRqModal && (
                <button
                  type="button"
                  onClick={onOpenAddRqModal}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer animate-pulse"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add & Define Research Question</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleAddRow}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Observation Row</span>
              </button>
              <button
                type="button"
                onClick={() => setPasteModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-rose-800 bg-white hover:bg-rose-100/70 border border-rose-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ClipboardPaste className="w-3.5 h-3.5 text-rose-600" />
                <span>Paste Data</span>
              </button>
              {isPresetStudyDataset(currentDataset.id) && (
                <button
                  type="button"
                  onClick={() => {
                    onResetSampleDataset(currentDataset.id);
                    showFeedback(`Reloaded full verified dataset for ${currentDataset.name}.`);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-800 bg-white hover:bg-rose-100/70 border border-rose-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Reload complete default observations"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                  <span>Reload Complete Preset</span>
                </button>
              )}
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Live N and Variables Quick Management Dashboard Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Sample Size N Manager */}
          <div className="p-4 rounded-xl border border-blue-200/80 bg-blue-50/40 flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-blue-700 font-semibold flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                Sample Size (N)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  N = {currentDataset.totalRows}
                </span>
                <span className="text-xs text-slate-500">observations</span>
              </div>
            </div>
            <button
              onClick={handleOpenResizeNModal}
              className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-300 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Change sample size N (truncate or generate new observations)"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>Change N</span>
            </button>
          </div>

          {/* Card 2: Variables Manager */}
          <div className="p-4 rounded-xl border border-indigo-200/80 bg-indigo-50/40 flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-700 font-semibold flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Variables & Scales
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {currentDataset.columns.length}
                </span>
                <span className="text-xs text-slate-500">total variables</span>
              </div>
            </div>
            <button
              onClick={() => setIsAddColumnModalOpen(true)}
              className="px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-300 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Add a new variable to this dataset"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Add Variable</span>
            </button>
          </div>

          {/* Card 3: Research Questions (RQ) Manager */}
          <div className={`p-4 rounded-xl border flex items-start justify-between ${
            datasetValidation.missingResearchQuestion
              ? 'border-rose-300 bg-rose-50/60 ring-1 ring-rose-300'
              : 'border-purple-200/80 bg-purple-50/40'
          }`}>
            <div>
              <span className={`text-[11px] font-mono uppercase tracking-wider font-semibold flex items-center gap-1.5 ${
                datasetValidation.missingResearchQuestion ? 'text-rose-700' : 'text-purple-700'
              }`}>
                {datasetValidation.missingResearchQuestion ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                ) : (
                  <HelpCircle className="w-3.5 h-3.5" />
                )}
                Research Questions (RQ)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {currentDataset.researchQuestions?.length || 0}
                </span>
                <span className="text-xs text-slate-500">
                  {datasetValidation.missingResearchQuestion ? '0 defined (Required for Step 3)' : 'defined RQs'}
                </span>
              </div>
            </div>
            {onOpenAddRqModal && (
              <button
                type="button"
                onClick={onOpenAddRqModal}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                  datasetValidation.missingResearchQuestion
                    ? 'text-white bg-purple-600 hover:bg-purple-700 animate-pulse'
                    : 'text-purple-700 bg-white hover:bg-purple-50 border border-purple-300'
                }`}
                title="Add a new research question to this study"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add RQ</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Research Questions & Formal Hypotheses Portfolio */}
      <div id="research-questions-section" className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900">
                Research Questions & Formal Hypotheses
              </h2>
              <span className="text-[11px] font-mono text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded font-medium">
                {currentDataset.researchQuestions?.length || 0} Research Questions
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Formulate your quantitative research questions and directional/non-directional hypotheses (H₀ and H₁).
            </p>
          </div>

          {onOpenAddRqModal && (
            <button
              onClick={onOpenAddRqModal}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Research Question</span>
            </button>
          )}
        </div>

        {currentDataset.researchQuestions && currentDataset.researchQuestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentDataset.researchQuestions.map((rq) => {
              const isSelected = activeResearchQuestion?.id === rq.id;
              return (
                <div
                  key={rq.id}
                  className={`p-4 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50/40 ring-1 ring-purple-600'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 font-mono text-[11px] truncate">
                        {rq.title}
                      </span>
                    </div>

                    <p className="text-xs font-serif italic text-slate-800 line-clamp-3 bg-white p-2.5 rounded border border-slate-200/70">
                      "{rq.question}"
                    </p>

                    {(rq.hypothesisNull || rq.hypothesisAlt) && (
                      <div className="space-y-1 text-[11px] font-serif text-slate-600">
                        {rq.hypothesisNull && (
                          <div className="truncate" title={rq.hypothesisNull}>
                            <span className="font-bold text-slate-700 font-sans">H₀: </span>
                            {rq.hypothesisNull.replace(/^H[0₀]:\s*/, '')}
                          </div>
                        )}
                        {rq.hypothesisAlt && (
                          <div className="truncate text-blue-900" title={rq.hypothesisAlt}>
                            <span className="font-bold text-blue-700 font-sans">H₁: </span>
                            {rq.hypothesisAlt.replace(/^H[1₁]:\s*/, '')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {onOpenEditRqModal && (
                        <button
                          onClick={() => onOpenEditRqModal(rq)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                          title="Edit this research question"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                      {onDeleteResearchQuestion && (
                        <button
                          onClick={() => onDeleteResearchQuestion(rq.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete research question"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {onSelectResearchQuestion && (
                      <button
                        onClick={() => {
                          onSelectResearchQuestion(rq);
                          showFeedback(`Active research question set to "${rq.title}".`);
                        }}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white'
                            : 'text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200'
                        }`}
                      >
                        {isSelected ? <Check className="w-3 h-3" /> : null}
                        <span>{isSelected ? 'Active' : 'Select'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 border-2 border-dashed border-rose-300 bg-rose-50/50 rounded-xl text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>Sign of Error: Step 3 Blocked · Research Questions Required</span>
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Research Questions Defined</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Advancing to Step 3 (Test Analysis) requires at least one defined empirical research question with formulated hypotheses (H₀ and H₁).
            </p>
            {onOpenAddRqModal && (
              <button
                type="button"
                onClick={onOpenAddRqModal}
                className="mt-2 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm animate-pulse cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add & Define Research Question</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Variable Dictionary & Role Configuration */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Variable Dictionary & Role Configuration
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review, rename, reorder, recode, or toggle measurement scales (Continuous vs. Categorical vs. ID). All data updates persist dynamically across your study.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddColumnModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <FilePlus2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Add Variable</span>
            </button>
            <div className="text-xs font-mono text-slate-500">
              Total Variables: <span className="font-semibold text-slate-900">{currentDataset.columns.length}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-semibold">
                <th className="py-2.5 px-3">Variable Name (Click Pencil to Rename)</th>
                <th className="py-2.5 px-3">Measurement Scale (Role)</th>
                <th className="py-2.5 px-3">Distinct Values</th>
                <th className="py-2.5 px-3">Missing Values</th>
                <th className="py-2.5 px-3">Sample Values</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentDataset.columns.map((col, colIndex) => {
                const isRenaming = renamingCol === col.name;
                return (
                  <tr key={col.name} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-medium text-slate-900 font-mono">
                      {isRenaming ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={renameInputValue}
                            onChange={(e) => setRenameInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRenameColumn();
                              if (e.key === 'Escape') setRenamingCol(null);
                            }}
                            autoFocus
                            className="px-2 py-0.5 text-xs border border-blue-500 rounded bg-white font-mono focus:outline-none"
                          />
                          <button
                            onClick={handleSaveRenameColumn}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Save Rename"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setRenamingCol(null)}
                            className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span>{col.name}</span>
                          <button
                            onClick={() => handleStartRenameColumn(col.name)}
                            className="p-0.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                            title="Rename variable"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={col.type}
                        onChange={(e) =>
                          onUpdateColumnType(col.name, e.target.value as VariableType)
                        }
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="continuous">Continuous (Interval / Ratio)</option>
                        <option value="categorical">Categorical (Nominal / Factor)</option>
                        <option value="id">Participant Identifier</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {col.distinctCount}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {col.missingCount === 0 ? (
                        <span className="text-emerald-600">0 (Complete)</span>
                      ) : (
                        <span className="text-amber-600">{col.missingCount}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] truncate max-w-xs">
                      {col.sampleValues.join(', ')}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Reorder Buttons */}
                        <button
                          onClick={() => handleMoveColumn(col.name, 'left')}
                          disabled={colIndex === 0}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move variable left"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveColumn(col.name, 'right')}
                          disabled={colIndex === currentDataset.columns.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move variable right"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        {/* Recode for Categorical */}
                        {col.type === 'categorical' && (
                          <button
                            onClick={() => handleOpenRecodeModal(col.name)}
                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                            title="Recode category levels (e.g. rename groups)"
                          >
                            <Shuffle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Transform for Continuous */}
                        {col.type === 'continuous' && (
                          <button
                            onClick={() => handleOpenTransformModal(col.name)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Transform variable (Z-scores, scale, shift)"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete Variable */}
                        <button
                          onClick={() => handleDeleteColumn(col.name)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title={`Delete variable "${col.name}"`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Data Matrix Viewer & In-Place Editor */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900">
                Empirical Data Matrix
              </h2>
              <span className="text-[11px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-medium">
                Click any cell to edit
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-mono">
              <span>Showing {filteredWithOrigIndices.length} observations (Total N = {currentDataset.totalRows})</span>
              <span aria-hidden="true">·</span>
              <span>Page {currentPage} of {totalPages}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleAddRow}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              title="Add a single observation row"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Row</span>
            </button>

            <button
              onClick={handleOpenResizeNModal}
              className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5"
              title="Adjust total sample size N directly"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>Adjust N ({currentDataset.totalRows})</span>
            </button>

            <button
              onClick={() => downloadDatasetCsv(currentDataset)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              title="Download edited CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download CSV</span>
            </button>

            <div className="relative">
              <input
                type="text"
                placeholder="Search values..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-40"
              />
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div id="dataset-data-table" className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold font-mono">
                <th className="py-2.5 px-3 text-slate-400 w-12 text-center">#</th>
                {currentDataset.columns.map((c) => {
                  const isRenaming = renamingCol === c.name;
                  return (
                    <th key={c.name} className="py-2.5 px-3 whitespace-nowrap group">
                      {isRenaming ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={renameInputValue}
                            onChange={(e) => setRenameInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRenameColumn();
                              if (e.key === 'Escape') setRenamingCol(null);
                            }}
                            autoFocus
                            className="px-2 py-0.5 text-xs border border-blue-500 rounded bg-white font-mono focus:outline-none"
                          />
                          <button
                            onClick={handleSaveRenameColumn}
                            className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setRenamingCol(null)}
                            className="p-0.5 text-slate-400 hover:bg-slate-100 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            <span>{c.name}</span>
                            <button
                              onClick={() => handleStartRenameColumn(c.name)}
                              className="p-0.5 text-slate-400 hover:text-slate-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Rename variable"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                          <span
                            onClick={() => {
                              // Cycle scale on click
                              const nextType: VariableType =
                                c.type === 'continuous'
                                  ? 'categorical'
                                  : c.type === 'categorical'
                                  ? 'id'
                                  : 'continuous';
                              onUpdateColumnType(c.name, nextType);
                              showFeedback(`Changed scale of "${c.name}" to ${nextType}.`);
                            }}
                            className={`text-[10px] font-normal uppercase px-1.5 py-0.2 rounded cursor-pointer transition-colors ${
                              c.type === 'continuous'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : c.type === 'categorical'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                            title="Click to cycle measurement scale (Continuous / Categorical / ID)"
                          >
                            {c.type === 'continuous' ? 'num' : c.type === 'id' ? 'id' : 'cat'}
                          </span>
                        </div>
                      )}
                    </th>
                  );
                })}
                <th className="py-2.5 px-3 text-right w-12 text-slate-400">Row</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums text-slate-800">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={currentDataset.columns.length + 2}
                    className="py-14 px-4 text-center bg-slate-50/40"
                  >
                    <div className="flex flex-col items-center justify-center gap-2.5 max-w-md mx-auto text-slate-500">
                      <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                        <Database className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Sign of Error: Data Required Before Step 3</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm">
                          Dataset Reset to Baseline (No Observations)
                        </h4>
                        <p className="text-xs text-slate-500">
                          All datasets have been reset to baseline with 0 rows (N = 0). You must enter observation rows, paste values, or reload a study dataset before proceeding to Step 3.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={handleAddRow}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add New Row</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPasteModalOpen(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <ClipboardPaste className="w-3.5 h-3.5 text-slate-500" />
                          <span>Paste Data</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRows.map(({ row, originalIndex }) => (
                  <tr key={originalIndex} className="hover:bg-blue-50/20 group">
                    <td className="py-2 px-3 text-center text-slate-400 text-[11px]">
                      {originalIndex + 1}
                    </td>

                    {currentDataset.columns.map((c) => {
                      const isEditing =
                        editingCell?.rowIndex === originalIndex &&
                        editingCell?.colName === c.name;
                      const rawVal = row[c.name];
                      const isCellEmpty =
                        emptyCellKeys.has(`${originalIndex}_${c.name}`) ||
                        rawVal === undefined ||
                        rawVal === null ||
                        String(rawVal).trim() === '' ||
                        (typeof rawVal === 'number' && isNaN(rawVal));

                      return (
                        <td
                          key={c.name}
                          onClick={() => {
                            if (!isEditing) {
                              handleStartCellEdit(originalIndex, c.name, rawVal);
                            }
                          }}
                          className={`py-1.5 px-2.5 whitespace-nowrap cursor-pointer transition-colors border ${
                            isEditing
                              ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                              : isCellEmpty
                              ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-400 hover:bg-rose-100/80'
                              : 'border-transparent hover:bg-blue-50/50 hover:border-blue-200'
                          }`}
                        >
                          {isEditing ? (
                            <input
                              type="text"
                              value={editInputValue}
                              onChange={(e) => setEditInputValue(e.target.value)}
                              onBlur={handleSaveCellEdit}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveCellEdit();
                                if (e.key === 'Escape') handleCancelCellEdit();
                              }}
                              autoFocus
                              className="w-full bg-white px-1.5 py-0.5 text-xs font-mono border border-blue-400 rounded focus:outline-none text-slate-900"
                            />
                          ) : (
                            <div className="flex items-center justify-between gap-2">
                              <span>
                                {isCellEmpty ? (
                                  <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[11px] bg-rose-100/90 px-1.5 py-0.5 rounded border border-rose-300">
                                    <AlertCircle className="w-3 h-3 text-rose-600 shrink-0 animate-pulse" />
                                    Empty · Fill data
                                  </span>
                                ) : (
                                  String(rawVal)
                                )}
                              </span>
                              <Edit2 className={`w-2.5 h-2.5 ${isCellEmpty ? 'text-rose-500' : 'text-slate-300 opacity-0 group-hover:opacity-60'} transition-opacity`} />
                            </div>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => handleDeleteRow(originalIndex)}
                        className="p-1 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete this observation row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Sample Size N Modal */}
      {isResizeNModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Adjust Sample Size (N)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Change the total number of observations in this study. Current sample size is{' '}
                <span className="font-semibold text-slate-900 font-mono">N = {currentDataset.totalRows}</span>.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Sample Size (N)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={2}
                    max={1000}
                    value={targetNInput}
                    onChange={(e) => setTargetNInput(Math.max(2, parseInt(e.target.value) || 2))}
                    className="w-full text-sm font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-xs font-mono text-slate-500 whitespace-nowrap">
                    observations
                  </span>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
                  Quick Adjustments:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[-20, -10, -5, +5, +10, +20, +50].map((delta) => {
                    const newTarget = currentDataset.totalRows + delta;
                    if (newTarget < 2) return null;
                    return (
                      <button
                        key={delta}
                        onClick={() => setTargetNInput(newTarget)}
                        className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
                          targetNInput === newTarget
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {delta > 0 ? `+${delta}` : delta} (N={newTarget})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Strategy selector when expanding N */}
              {targetNInput > currentDataset.totalRows && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2">
                  <span className="text-xs font-bold text-blue-900 block">
                    Generation Strategy for Additional {targetNInput - currentDataset.totalRows} Observations:
                  </span>

                  <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="resizeStrategy"
                      checked={resizeStrategy === 'resample'}
                      onChange={() => setResizeStrategy('resample')}
                      className="mt-0.5 text-blue-600"
                    />
                    <div>
                      <span className="font-semibold text-slate-900">
                        Empirical Gaussian Resampling (Recommended)
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Synthesizes realistic data following the sample's current means, SDs, and categorical proportions.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="resizeStrategy"
                      checked={resizeStrategy === 'duplicate'}
                      onChange={() => setResizeStrategy('duplicate')}
                      className="mt-0.5 text-blue-600"
                    />
                    <div>
                      <span className="font-semibold text-slate-900">Duplicate / Cycle Cases</span>
                      <p className="text-[11px] text-slate-500">
                        Replicates existing observations while assigning new sequential participant IDs.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="resizeStrategy"
                      checked={resizeStrategy === 'blank'}
                      onChange={() => setResizeStrategy('blank')}
                      className="mt-0.5 text-blue-600"
                    />
                    <div>
                      <span className="font-semibold text-slate-900">Blank / Default Rows</span>
                      <p className="text-[11px] text-slate-500">
                        Inserts rows with zeroes and default group codes for manual entry.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {targetNInput < currentDataset.totalRows && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  <span className="font-bold">Note:</span> Decreasing N will retain the first{' '}
                  <span className="font-mono font-bold">{targetNInput}</span> observations and truncate the remaining{' '}
                  <span className="font-mono">{currentDataset.totalRows - targetNInput}</span>.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsResizeNModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyResizeN}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply N = {targetNInput}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recode Categorical Levels Modal */}
      {isRecodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Shuffle className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Recode Category Levels for "{recodeColName}"
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Rename factor levels or groups across all observations in this dataset.
              </p>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {Object.keys(recodeMapping).map((originalLevel) => (
                <div key={originalLevel} className="flex items-center gap-2 text-xs">
                  <div className="w-1/2 font-mono bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded truncate text-slate-700">
                    {originalLevel}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={recodeMapping[originalLevel]}
                    onChange={(e) =>
                      setRecodeMapping({
                        ...recodeMapping,
                        [originalLevel]: e.target.value,
                      })
                    }
                    className="w-1/2 font-mono px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsRecodeModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyRecode}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Save Category Recoding
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transform Continuous Variable Modal */}
      {isTransformModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Transform Variable "{transformColName}"
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Apply a mathematical transformation across all {currentDataset.totalRows} observations.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transformation Method
                </label>
                <select
                  value={transformOp}
                  onChange={(e) => setTransformOp(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="standardize">Standardize to Z-Scores (Mean = 0, SD = 1)</option>
                  <option value="add">Add Constant (Shift values by +C)</option>
                  <option value="multiply">Multiply by Factor (Scale values by *K)</option>
                  <option value="round">Round to Nearest Integer</option>
                </select>
              </div>

              {(transformOp === 'add' || transformOp === 'multiply') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Value Parameter ({transformOp === 'add' ? 'Constant C' : 'Factor K'})
                  </label>
                  <input
                    type="number"
                    value={transformParam}
                    onChange={(e) => setTransformParam(Number(e.target.value))}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsTransformModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyTransform}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Apply Transformation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Study Info Modal */}
      {isEditInfoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Edit Study Metadata & Title
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize the preloaded study title, scientific domain, and abstract description.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Study Name
                </label>
                <input
                  type="text"
                  value={editStudyName}
                  onChange={(e) => setEditStudyName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scientific Research Domain
                </label>
                <input
                  type="text"
                  value={editStudyDomain}
                  onChange={(e) => setEditStudyDomain(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Study Description & Context
                </label>
                <textarea
                  rows={3}
                  value={editStudyDesc}
                  onChange={(e) => setEditStudyDesc(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsEditInfoModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditInfo}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Variable Modal */}
      {isAddColumnModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Add New Variable to Dataset
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Appends a new column across all {currentDataset.totalRows} observations.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Variable Name
                </label>
                <input
                  type="text"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="e.g. Cognitive_Score_Post"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Measurement Scale (Role)
                </label>
                <select
                  value={newColType}
                  onChange={(e) => {
                    const t = e.target.value as VariableType;
                    setNewColType(t);
                    if (t === 'categorical') setNewColGenMode('categories');
                    else if (t === 'continuous') setNewColGenMode('normal');
                    else setNewColGenMode('constant');
                  }}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="continuous">Continuous (Interval / Ratio Metric)</option>
                  <option value="categorical">Categorical (Grouping Factor)</option>
                  <option value="id">Participant Identifier (ID)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data Generation Mode
                </label>
                <select
                  value={newColGenMode}
                  onChange={(e) => setNewColGenMode(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="constant">Constant Default Value</option>
                  {newColType === 'continuous' && (
                    <>
                      <option value="normal">Normal / Gaussian Distribution (Mean & SD)</option>
                      <option value="uniform">Uniform Random Range (Min to Max)</option>
                    </>
                  )}
                  {newColType === 'categorical' && (
                    <option value="categories">Distribute Categories (Comma-separated)</option>
                  )}
                </select>
              </div>

              {newColGenMode === 'constant' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Default Value
                  </label>
                  <input
                    type="text"
                    value={newColDefaultVal}
                    onChange={(e) => setNewColDefaultVal(e.target.value)}
                    placeholder="e.g. 0 or Group_A"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              {newColGenMode === 'normal' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target Mean (M)
                    </label>
                    <input
                      type="number"
                      value={newColMean}
                      onChange={(e) => setNewColMean(Number(e.target.value))}
                      className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target SD (s)
                    </label>
                    <input
                      type="number"
                      value={newColSd}
                      onChange={(e) => setNewColSd(Number(e.target.value))}
                      className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {newColGenMode === 'uniform' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Min Value
                    </label>
                    <input
                      type="number"
                      value={newColMin}
                      onChange={(e) => setNewColMin(Number(e.target.value))}
                      className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Max Value
                    </label>
                    <input
                      type="number"
                      value={newColMax}
                      onChange={(e) => setNewColMax(Number(e.target.value))}
                      className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {newColGenMode === 'categories' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categories (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newColCategories}
                    onChange={(e) => setNewColCategories(e.target.value)}
                    placeholder="e.g. Placebo, Low_Dose, High_Dose"
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsAddColumnModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleAddColumnSubmit}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Create Variable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paste Data Modal */}
      {pasteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Paste Raw Tabular Data (CSV / TSV)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Copy columns directly from Microsoft Excel, Google Sheets, or SPSS and paste below. The first row must contain variable names.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dataset Name
              </label>
              <input
                type="text"
                value={pastedName}
                onChange={(e) => setPastedName(e.target.value)}
                placeholder="e.g. Master Thesis Sample Data"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Raw Data (Tab- or Comma-separated)
              </label>
              <textarea
                rows={8}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={`Student_ID\tGender\tScore\nS1\tFemale\t85\nS2\tMale\t78`}
                className="w-full text-xs font-mono p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPasteModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handlePasteSubmit}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Import Dataset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
