import React, { useMemo, useRef, useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  ChevronsUpDown,
  ChevronsDownUp,
} from 'lucide-react';
import { StatisticalTestType } from '../types/stats';

type MindMapAccent = 'slate' | 'blue' | 'emerald' | 'violet' | 'amber';

interface MindMapTreeNode {
  id: string;
  label: string;
  sublabel?: string;
  accent: MindMapAccent;
  leafId?: string;
  children?: MindMapTreeNode[];
}

interface PositionedMindMapNode {
  id: string;
  label: string;
  sublabel?: string;
  accent: MindMapAccent;
  depth: number;
  x: number;
  y: number;
  w: number;
  parentId?: string;
  hasChildren: boolean;
  isExpanded: boolean;
  leafId?: string;
}

interface FlowchartLeafDetail {
  leafId: string;
  goalLabel: string;
  testName: string;
  launchTestType?: StatisticalTestType;
  altLabel?: string;
  altTestType?: StatisticalTestType;
  statisticalRule: string;
  assumptions: string;
  apaPattern: string;
}

interface StatisticalFlowchartCanvasProps {
  onLaunchTutorialTest?: (testType: StatisticalTestType) => void;
  onClose: () => void;
}

const NODE_H = 34;
const ROW_STEP = 44;
const COL_STEP = 218;
const NODE_W = 178;
const ROOT_W = 188;

const ACCENT_STYLES: Record<
  MindMapAccent,
  {
    pill: string;
    activePill: string;
    stroke: string;
    activeStroke: string;
    badge: string;
  }
> = {
  slate: {
    pill: 'bg-slate-900 text-white border-slate-900',
    activePill: 'bg-slate-900 text-white border-slate-900 ring-2 ring-blue-400',
    stroke: '#64748b',
    activeStroke: '#2563eb',
    badge: 'bg-slate-100 text-slate-800 border-slate-200',
  },
  blue: {
    pill: 'bg-blue-50 text-blue-950 border-blue-200 hover:border-blue-400',
    activePill: 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200 shadow-xs',
    stroke: '#93c5fd',
    activeStroke: '#2563eb',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  emerald: {
    pill: 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:border-emerald-400',
    activePill: 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-200 shadow-xs',
    stroke: '#6ee7b7',
    activeStroke: '#059669',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  violet: {
    pill: 'bg-violet-50 text-violet-950 border-violet-200 hover:border-violet-400',
    activePill: 'bg-violet-600 text-white border-violet-600 ring-2 ring-violet-200 shadow-xs',
    stroke: '#c4b5fd',
    activeStroke: '#7c3aed',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  amber: {
    pill: 'bg-amber-50 text-amber-950 border-amber-200 hover:border-amber-400',
    activePill: 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-200 shadow-xs',
    stroke: '#fcd34d',
    activeStroke: '#d97706',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

const MINDMAP_ROOT: MindMapTreeNode = {
  id: 'root',
  label: 'What is your research goal?',
  accent: 'slate',
  children: [
    // 1. Compare groups
    {
      id: 'g1',
      label: '1. Compare groups',
      sublabel: 'Do the groups differ?',
      accent: 'blue',
      children: [
        {
          id: 'g1-cont',
          label: 'Continuous outcome',
          sublabel: 'e.g., height, exam score',
          accent: 'blue',
          children: [
            {
              id: 'g1-cont-2',
              label: 'Two groups',
              accent: 'blue',
              children: [
                {
                  id: 'g1-paired-yes',
                  label: 'Paired (same people)',
                  accent: 'blue',
                  children: [
                    {
                      id: 'leaf-paired-t',
                      label: 'Paired t-test / Wilcoxon',
                      accent: 'blue',
                      leafId: 'leaf-paired-t',
                    },
                  ],
                },
                {
                  id: 'g1-paired-no',
                  label: 'Separate groups',
                  accent: 'blue',
                  children: [
                    {
                      id: 'g1-norm2-yes',
                      label: 'Normal distribution',
                      accent: 'blue',
                      children: [
                        {
                          id: 'leaf-ind-t',
                          label: "Independent t-test (Student's)",
                          accent: 'blue',
                          leafId: 'leaf-ind-t',
                        },
                      ],
                    },
                    {
                      id: 'g1-norm2-no',
                      label: 'Non-normal',
                      accent: 'blue',
                      children: [
                        {
                          id: 'leaf-mw-u',
                          label: 'Mann-Whitney U test',
                          accent: 'blue',
                          leafId: 'leaf-mw-u',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'g1-cont-3',
              label: '3 or more groups',
              accent: 'blue',
              children: [
                {
                  id: 'g1-norm3-yes',
                  label: 'Normal & equal var.',
                  accent: 'blue',
                  children: [
                    {
                      id: 'leaf-anova',
                      label: 'One-way ANOVA (+ post-hoc)',
                      accent: 'blue',
                      leafId: 'leaf-anova',
                    },
                  ],
                },
                {
                  id: 'g1-norm3-no',
                  label: 'Non-normal / unequal',
                  accent: 'blue',
                  children: [
                    {
                      id: 'leaf-kw',
                      label: 'Kruskal-Wallis (+ post-hoc)',
                      accent: 'blue',
                      leafId: 'leaf-kw',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'g1-cat',
          label: 'Categorical outcome',
          sublabel: 'e.g., pass/fail',
          accent: 'blue',
          children: [
            {
              id: 'g1-cat-2',
              label: 'Two groups',
              accent: 'blue',
              children: [
                {
                  id: 'g1-exp2-yes',
                  label: 'Expected counts ≥ 5',
                  accent: 'blue',
                  children: [
                    {
                      id: 'leaf-chi2-2',
                      label: 'Chi-square test',
                      accent: 'blue',
                      leafId: 'leaf-chi2-2',
                    },
                  ],
                },
                {
                  id: 'g1-exp2-no',
                  label: 'Expected counts < 5',
                  accent: 'blue',
                  children: [
                    {
                      id: 'leaf-fisher-2',
                      label: "Fisher's exact test",
                      accent: 'blue',
                      leafId: 'leaf-fisher-2',
                    },
                  ],
                },
              ],
            },
            {
              id: 'g1-cat-3',
              label: '3 or more groups',
              accent: 'blue',
              children: [
                {
                  id: 'g1-exp3-yes',
                  label: 'Expected counts ≥ 5',
                  accent: 'blue',
                  children: [
                    {
                      id: 'leaf-chi2-3',
                      label: 'Chi-square (contingency)',
                      accent: 'blue',
                      leafId: 'leaf-chi2-3',
                    },
                  ],
                },
                {
                  id: 'g1-exp3-no',
                  label: 'Expected counts < 5',
                  accent: 'blue',
                  children: [
                    {
                      id: 'leaf-fisher-3',
                      label: "Fisher's exact / Monte Carlo",
                      accent: 'blue',
                      leafId: 'leaf-fisher-3',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },

    // 2. Assess association
    {
      id: 'g2',
      label: '2. Assess association',
      sublabel: 'Are the variables related?',
      accent: 'emerald',
      children: [
        {
          id: 'g2-2cat',
          label: 'Two categorical',
          accent: 'emerald',
          children: [
            {
              id: 'leaf-assoc-chi2',
              label: "Chi-square / Fisher's exact",
              accent: 'emerald',
              leafId: 'leaf-assoc-chi2',
            },
          ],
        },
        {
          id: 'g2-2cont',
          label: 'Two continuous',
          sublabel: 'e.g., weight, blood sugar',
          accent: 'emerald',
          children: [
            {
              id: 'g2-lin-yes',
              label: 'Linear & normal',
              accent: 'emerald',
              children: [
                {
                  id: 'leaf-pearson',
                  label: 'Pearson correlation',
                  accent: 'emerald',
                  leafId: 'leaf-pearson',
                },
              ],
            },
            {
              id: 'g2-lin-no',
              label: 'Non-linear / non-normal',
              accent: 'emerald',
              children: [
                {
                  id: 'leaf-spearman',
                  label: "Spearman / Kendall's tau",
                  accent: 'emerald',
                  leafId: 'leaf-spearman',
                },
              ],
            },
          ],
        },
        {
          id: 'g2-mix',
          label: '1 categorical + 1 cont.',
          sublabel: 'e.g., sex, weight',
          accent: 'emerald',
          children: [
            {
              id: 'g2-mix-2',
              label: 'Two groups',
              accent: 'emerald',
              children: [
                {
                  id: 'leaf-assoc-t',
                  label: 'Ind. t-test / Mann-Whitney',
                  accent: 'emerald',
                  leafId: 'leaf-assoc-t',
                },
              ],
            },
            {
              id: 'g2-mix-3',
              label: '3 or more groups',
              accent: 'emerald',
              children: [
                {
                  id: 'leaf-assoc-anova',
                  label: 'ANOVA / Kruskal-Wallis',
                  accent: 'emerald',
                  leafId: 'leaf-assoc-anova',
                },
              ],
            },
          ],
        },
      ],
    },

    // 3. Predict an outcome
    {
      id: 'g3',
      label: '3. Predict an outcome',
      sublabel: 'Which factors explain it?',
      accent: 'violet',
      children: [
        {
          id: 'g3-bin',
          label: 'Binary outcome',
          sublabel: 'e.g., pass/fail',
          accent: 'violet',
          children: [
            {
              id: 'leaf-logistic',
              label: 'Logistic regression',
              accent: 'violet',
              leafId: 'leaf-logistic',
            },
          ],
        },
        {
          id: 'g3-mult',
          label: '3+ categories',
          sublabel: 'e.g., diet',
          accent: 'violet',
          children: [
            {
              id: 'leaf-multinomial',
              label: 'Multinomial logistic',
              accent: 'violet',
              leafId: 'leaf-multinomial',
            },
          ],
        },
        {
          id: 'g3-cont',
          label: 'Continuous outcome',
          sublabel: 'e.g., income, marks',
          accent: 'violet',
          children: [
            {
              id: 'leaf-linear',
              label: 'Linear regression',
              accent: 'violet',
              leafId: 'leaf-linear',
            },
          ],
        },
      ],
    },

    // 4. Analyze relationships
    {
      id: 'g4',
      label: '4. Analyze relationships',
      sublabel: 'Many variables / repeated',
      accent: 'amber',
      children: [
        {
          id: 'g4-yes',
          label: 'Clustered or repeated',
          sublabel: 'e.g., repeated visits',
          accent: 'amber',
          children: [
            {
              id: 'leaf-mixed',
              label: 'Mixed-effects model',
              accent: 'amber',
              leafId: 'leaf-mixed',
            },
          ],
        },
        {
          id: 'g4-no',
          label: 'Independent observations',
          accent: 'amber',
          children: [
            {
              id: 'leaf-matching-reg',
              label: 'Matching regression model',
              accent: 'amber',
              leafId: 'leaf-matching-reg',
            },
          ],
        },
      ],
    },
  ],
};

function collectAllParentIds(node: MindMapTreeNode, acc: string[] = []): string[] {
  if (node.children && node.children.length > 0) {
    acc.push(node.id);
    node.children.forEach((c) => collectAllParentIds(c, acc));
  }
  return acc;
}

const ALL_PARENT_IDS = collectAllParentIds(MINDMAP_ROOT);

const DEFAULT_EXPANDED_IDS = [
  'root',
  'g1',
  'g1-cont',
  'g1-cont-2',
  'g1-paired-yes',
  'g1-paired-no',
  'g1-norm2-yes',
  'g1-norm2-no',
];

function computeMindMapLayout(root: MindMapTreeNode, expandedIds: Set<string>) {
  const nodes: PositionedMindMapNode[] = [];
  let rowCursor = 0;
  let maxDepth = 0;

  const visit = (node: MindMapTreeNode, depth: number, parentId?: string): number => {
    maxDepth = Math.max(maxDepth, depth);
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const isExpanded = hasChildren && expandedIds.has(node.id);
    const x = 24 + depth * COL_STEP;
    const w = depth === 0 ? ROOT_W : NODE_W;

    if (!isExpanded || !node.children) {
      const y = 24 + rowCursor * ROW_STEP;
      rowCursor += 1;
      nodes.push({
        id: node.id,
        label: node.label,
        sublabel: node.sublabel,
        accent: node.accent,
        depth,
        x,
        y,
        w,
        parentId,
        hasChildren,
        isExpanded: false,
        leafId: node.leafId,
      });
      return y;
    }

    const childYs = node.children.map((child) => visit(child, depth + 1, node.id));
    const y = (childYs[0] + childYs[childYs.length - 1]) / 2;
    nodes.push({
      id: node.id,
      label: node.label,
      sublabel: node.sublabel,
      accent: node.accent,
      depth,
      x,
      y,
      w,
      parentId,
      hasChildren,
      isExpanded: true,
      leafId: node.leafId,
    });
    return y;
  };

  visit(root, 0);

  const width = Math.max(760, 24 + (maxDepth + 1) * COL_STEP + 32);
  const height = Math.max(380, 24 + rowCursor * ROW_STEP + 32);
  return { nodes, width, height };
}

export const StatisticalFlowchartCanvas: React.FC<StatisticalFlowchartCanvasProps> = () => {
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(
    () => new Set(DEFAULT_EXPANDED_IDS)
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string>('leaf-ind-t');
  const [zoom, setZoom] = useState<number>(0.9);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 14, y: 18 });

  const dragStateRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });

  const mindMapLayout = useMemo(
    () => computeMindMapLayout(MINDMAP_ROOT, expandedNodeIds),
    [expandedNodeIds]
  );

  const highlightedNodeIds = useMemo(() => {
    const activeIds = new Set<string>();
    const nodeMap = new Map(mindMapLayout.nodes.map((n) => [n.id, n]));
    let curr: PositionedMindMapNode | undefined = nodeMap.get(selectedNodeId);
    while (curr) {
      activeIds.add(curr.id);
      curr = curr.parentId ? nodeMap.get(curr.parentId) : undefined;
    }
    return activeIds;
  }, [mindMapLayout.nodes, selectedNodeId]);

  const toggleExpandNode = (nodeId: string) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleNodeSelect = (node: PositionedMindMapNode) => {
    setSelectedNodeId(node.id);
    if (node.hasChildren && !node.isExpanded) {
      setExpandedNodeIds((prev) => {
        const next = new Set(prev);
        next.add(node.id);
        return next;
      });
    }
  };

  const handleExpandAll = () => {
    setExpandedNodeIds(new Set(ALL_PARENT_IDS));
    setZoom(0.68);
    setPan({ x: 8, y: 12 });
  };

  const handleCollapseBranches = () => {
    setExpandedNodeIds(new Set(['root']));
    setSelectedNodeId('g1');
    setZoom(1);
    setPan({ x: 24, y: 40 });
  };

  const handleResetView = () => {
    setExpandedNodeIds(new Set(DEFAULT_EXPANDED_IDS));
    setSelectedNodeId('leaf-ind-t');
    setZoom(0.9);
    setPan({ x: 14, y: 18 });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3">
      {/* Interactive Expandable Mind Map Canvas */}
      <div
        className="relative flex-1 min-h-[240px] rounded-xl border border-slate-200 bg-slate-50 overflow-hidden select-none cursor-grab active:cursor-grabbing"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          dragStateRef.current = {
            active: true,
            startX: e.clientX,
            startY: e.clientY,
            origX: pan.x,
            origY: pan.y,
          };
        }}
        onPointerMove={(e) => {
          if (!dragStateRef.current.active) return;
          const dx = e.clientX - dragStateRef.current.startX;
          const dy = e.clientY - dragStateRef.current.startY;
          setPan({
            x: dragStateRef.current.origX + dx,
            y: dragStateRef.current.origY + dy,
          });
        }}
        onPointerUp={() => {
          dragStateRef.current.active = false;
        }}
        onPointerLeave={() => {
          dragStateRef.current.active = false;
        }}
      >
        {/* Top Toolbar: Expand All & Collapse */}
        <div className="absolute top-3 right-3 z-20 flex items-center justify-end gap-2 pointer-events-none">
          <div className="pointer-events-auto inline-flex items-center gap-1 p-1 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={handleExpandAll}
              className="px-2.5 py-1 rounded text-[11px] font-medium text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1 cursor-pointer"
              title="Expand all statistical branches"
            >
              <ChevronsUpDown className="w-3 h-3 text-blue-600" />
              <span>Expand All</span>
            </button>
            <button
              type="button"
              onClick={handleCollapseBranches}
              className="px-2.5 py-1 rounded text-[11px] font-medium text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1 cursor-pointer"
              title="Collapse to primary research goals"
            >
              <ChevronsDownUp className="w-3 h-3 text-slate-500" />
              <span>Collapse</span>
            </button>
          </div>
        </div>

        {/* Pan & Zoom Transform Stage */}
        <div
          style={{
            width: `${mindMapLayout.width}px`,
            height: `${mindMapLayout.height}px`,
            transform: `translate(${pan.x}px, ${pan.y + 24}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
          className="relative transition-transform duration-150 ease-out"
        >
          {/* Smooth Cubic Bezier Curves SVG Layer */}
          <svg
            width={mindMapLayout.width}
            height={mindMapLayout.height}
            viewBox={`0 0 ${mindMapLayout.width} ${mindMapLayout.height}`}
            className="absolute inset-0 pointer-events-none"
          >
            {mindMapLayout.nodes.map((node) => {
              if (!node.parentId) return null;
              const parent = mindMapLayout.nodes.find((p) => p.id === node.parentId);
              if (!parent) return null;
              const x1 = parent.x + parent.w;
              const y1 = parent.y + NODE_H / 2;
              const x2 = node.x;
              const y2 = node.y + NODE_H / 2;
              const cx = (x1 + x2) / 2;
              const isActiveEdge =
                highlightedNodeIds.has(parent.id) && highlightedNodeIds.has(node.id);
              const accentStyle = ACCENT_STYLES[node.accent];
              const strokeColor = isActiveEdge ? accentStyle.activeStroke : accentStyle.stroke;

              return (
                <path
                  key={`${parent.id}->${node.id}`}
                  d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isActiveEdge ? 2.6 : 1.75}
                  strokeOpacity={isActiveEdge ? 1 : 0.72}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Interactive Mind Map Node Pills with Fold/Unfold Toggles */}
          {mindMapLayout.nodes.map((node) => {
            const isActive = highlightedNodeIds.has(node.id);
            const accentStyle = ACCENT_STYLES[node.accent];
            const isLeaf = Boolean(node.leafId);

            return (
              <div
                key={node.id}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: `${node.w}px`,
                  height: `${NODE_H}px`,
                }}
                className="absolute flex items-center"
              >
                <button
                  type="button"
                  onClick={() => handleNodeSelect(node)}
                  className={`w-full h-full flex flex-col justify-center text-left px-2.5 rounded-lg border shadow-2xs transition-all cursor-pointer ${
                    isActive ? accentStyle.activePill : accentStyle.pill
                  } ${isLeaf ? 'font-bold' : 'font-medium'}`}
                  title={node.sublabel ? `${node.label} (${node.sublabel})` : node.label}
                >
                  <span className="truncate text-[11px] leading-tight">{node.label}</span>
                  {node.sublabel && (
                    <span
                      className={`truncate text-[9px] leading-tight ${
                        isActive ? 'text-white/85' : 'text-slate-500'
                      }`}
                    >
                      {node.sublabel}
                    </span>
                  )}
                </button>

                {node.hasChildren && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpandNode(node.id);
                    }}
                    aria-label={
                      node.isExpanded ? `Collapse ${node.label}` : `Expand ${node.label}`
                    }
                    className={`-ml-2.5 z-10 w-5 h-5 rounded-full border shadow-xs flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                      node.isExpanded
                        ? 'bg-white border-slate-300 text-slate-600 hover:border-blue-500 hover:text-blue-600'
                        : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {node.isExpanded ? (
                      <ChevronLeft className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom-Right Studio Zoom Controls */}
        <div className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1 p-1 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.45, Number((z - 0.1).toFixed(2))))}
            className="p-1.5 rounded text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            aria-label="Zoom out"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-1.5 text-[11px] font-mono text-slate-600 min-w-[42px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(2))))}
            className="p-1.5 rounded text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            aria-label="Zoom in"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="p-1.5 rounded text-slate-600 hover:bg-slate-100 hover:text-blue-600 border-l border-slate-200 pl-2 cursor-pointer"
            aria-label="Reset mind map view"
            title="Reset view"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
