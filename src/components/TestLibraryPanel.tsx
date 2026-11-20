import React, { useMemo, useState } from 'react';
import {
  BookMarked,
  Check,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Search,
  PlayCircle,
} from 'lucide-react';
import {
  PERMANENT_TEST_LIBRARY,
  TEST_LIBRARY_CATEGORIES,
  TestLibraryCategoryKey,
  TestLibraryEntry,
} from '../data/testLibraryDatasets';

interface TestLibraryPanelProps {
  currentDatasetId: string;
  onLoadEntry: (entry: TestLibraryEntry) => void;
  onResetLibraryDataset: (datasetId: string) => void;
}

export const TestLibraryPanel: React.FC<TestLibraryPanelProps> = ({
  currentDatasetId,
  onLoadEntry,
  onResetLibraryDataset,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | TestLibraryCategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: PERMANENT_TEST_LIBRARY.length };
    TEST_LIBRARY_CATEGORIES.forEach((cat) => {
      counts[cat.key] = PERMANENT_TEST_LIBRARY.filter((e) => e.categoryKey === cat.key).length;
    });
    return counts;
  }, []);

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return PERMANENT_TEST_LIBRARY.filter((entry) => {
      const matchesCat = activeCategory === 'all' || entry.categoryKey === activeCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        entry.dataset.name.toLowerCase().includes(q) ||
        entry.dataset.domain.toLowerCase().includes(q) ||
        entry.dataset.description.toLowerCase().includes(q) ||
        entry.categoryLabel.toLowerCase().includes(q) ||
        entry.recommendedTestTitle.toLowerCase().includes(q) ||
        entry.statisticalProfile.toLowerCase().includes(q)
      );
    });
  }, [activeCategory, searchQuery]);

  const activeCategoryMeta = useMemo(
    () => TEST_LIBRARY_CATEGORIES.find((c) => c.key === activeCategory) || null,
    [activeCategory]
  );

  const activeLibraryEntry = useMemo(
    () => PERMANENT_TEST_LIBRARY.find((e) => e.dataset.id === currentDatasetId) || null,
    [currentDatasetId]
  );

  return (
    <section
      id="permanent-test-library-section"
      className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5"
    >
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
            <BookMarked className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Permanent Benchmark Archive</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums text-slate-700 font-semibold">
              {TEST_LIBRARY_CATEGORIES.length} Categories · {PERMANENT_TEST_LIBRARY.length} Datasets
            </span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Permanent Statistical Test Library
          </h2>
          <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
            Built-in benchmark datasets engineered for assumption checks, edge cases, and inferential testing across parametric, non-parametric, missing-data, heteroscedastic, factorial, and reliability designs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!isExpanded) setIsExpanded(true);
              }}
              placeholder="Filter library datasets..."
              aria-label="Filter library datasets"
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-56"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>{isExpanded ? 'Collapse Library' : 'Expand Library'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Currently Active Library Notice (unboxed typographic strip) */}
      {activeLibraryEntry && (
        <div className="flex flex-wrap items-center justify-between gap-3 py-2 px-3 bg-blue-50/70 border-l-2 border-blue-600 text-xs text-slate-700">
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <span className="font-semibold text-blue-700">Active Library Benchmark:</span>
            <span className="font-sans font-semibold text-slate-900">
              {activeLibraryEntry.dataset.name}
            </span>
            <span aria-hidden="true">·</span>
            <span>{activeLibraryEntry.categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{activeLibraryEntry.recommendedTestTitle}</span>
          </div>
          <button
            type="button"
            onClick={() => onResetLibraryDataset(activeLibraryEntry.dataset.id)}
            className="text-xs font-medium text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
            title="Restore pristine copy of this library dataset"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restore Pristine Copy</span>
          </button>
        </div>
      )}

      {isExpanded && (
        <div className="space-y-4">
          {/* Interactive Category Filter Buttons */}
          <div
            role="tablist"
            aria-label="Test library categories"
            className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'all'}
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer tabular-nums ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              All Benchmarks ({categoryCounts.all})
            </button>

            {TEST_LIBRARY_CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer tabular-nums ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {cat.shortLabel} ({categoryCounts[cat.key]})
                </button>
              );
            })}
          </div>

          {/* Active Category Context Note */}
          {activeCategoryMeta && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 pb-1">
              <p>{activeCategoryMeta.description}</p>
              <span className="font-mono text-[11px] text-slate-500 shrink-0">
                {activeCategoryMeta.recommendedProcedures}
              </span>
            </div>
          )}

          {/* Library Dataset Grid */}
          {filteredEntries.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg text-xs text-slate-500">
              No test library datasets match "{searchQuery}". Clear the search input or switch category filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredEntries.map((entry) => {
                const isActive = entry.dataset.id === currentDatasetId;
                const totalMissing = entry.dataset.columns.reduce(
                  (acc, c) => acc + c.missingCount,
                  0
                );
                return (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-xl border transition-colors flex flex-col justify-between gap-3 ${
                      isActive
                        ? 'border-blue-600 bg-blue-50/40'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-slate-500">
                        <span className="uppercase tracking-wider font-semibold text-blue-700">
                          {entry.categoryLabel}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{entry.dataset.domain}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums text-slate-700 font-semibold shrink-0">
                          N = {entry.dataset.totalRows}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {entry.dataset.name}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {entry.diagnosticFocus}
                      </p>

                      <div className="pt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-mono tabular-nums text-slate-500">
                        <span>{entry.statisticalProfile}</span>
                        <span aria-hidden="true">·</span>
                        <span>{entry.dataset.columns.length} vars</span>
                        {totalMissing > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-amber-700 font-semibold">
                              {totalMissing} missing cells
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3">
                      <span className="text-[11px] font-mono text-slate-600 truncate">
                        Preset: <strong className="text-slate-900 font-semibold">{entry.recommendedTestTitle}</strong>
                      </span>

                      <div className="flex items-center gap-2 shrink-0">
                        {isActive && (
                          <button
                            type="button"
                            onClick={() => onResetLibraryDataset(entry.dataset.id)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Restore pristine library values"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onLoadEntry(entry)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                            isActive
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-slate-900 text-white hover:bg-blue-600'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Loaded</span>
                            </>
                          ) : (
                            <>
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>Load Dataset</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
