import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  CheckSquare,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Filter,
  Search,
  Calendar,
  AlertCircle,
  FileText,
  Shield,
  BarChart3,
  Cloud,
  Rocket,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  ChecklistItem,
  ChecklistPhase,
  loadStoredChecklist,
  saveStoredChecklist,
  formatChecklistForGoogleKeep,
  syncWithGoogleTasksAPI,
  DEFAULT_PUBLISH_CHECKLIST,
} from '../services/googleTasksKeep';
import { signInWithGoogleOAuth } from '../services/googleAuth';

interface PublishChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishChecklistModal: React.FC<PublishChecklistModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [items, setItems] = useState<ChecklistItem[]>(() => loadStoredChecklist());
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKeep, setCopiedKeep] = useState(false);
  const [isSyncingTasks, setIsSyncingTasks] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Custom task form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPhase, setNewPhase] = useState<ChecklistPhase>('engine');
  const [newPriority, setNewPriority] = useState<'critical' | 'high' | 'medium'>('high');
  const [newMilestone, setNewMilestone] = useState('Release Candidate');

  // Active tab in modal: 'checklist' | 'keep-sync' | 'export'
  const [activeTab, setActiveTab] = useState<'checklist' | 'keep-sync'>('checklist');

  useEffect(() => {
    saveStoredChecklist(items);
  }, [items]);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      )
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const phaseLabels: Record<ChecklistPhase, string> = {
      engine: '1. Deterministic Inference Engine',
      'apa-synthesis': '2. APA 7th Manuscript Synthesis',
      security: '3. Security & Academic Privacy',
      'usability-sus': '4. Usability Testing & Evaluation',
      'workspace-cloud': '5. Workspace & Cloud Sync',
      'production-publish': '6. Publishing & Production Release',
    };

    const newItem: ChecklistItem = {
      id: `chk-custom-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Custom development requirement for publication.',
      phase: newPhase,
      phaseLabel: phaseLabels[newPhase],
      isCompleted: false,
      priority: newPriority,
      targetMilestone: newMilestone.trim() || 'Production Release',
    };

    setItems((prev) => [newItem, ...prev]);
    setNewTitle('');
    setNewDesc('');
    setShowAddForm(false);
  };

  const handleResetChecklist = () => {
    setItems(DEFAULT_PUBLISH_CHECKLIST);
  };

  const handleCopyKeepText = () => {
    const formatted = formatChecklistForGoogleKeep(items);
    navigator.clipboard.writeText(formatted);
    setCopiedKeep(true);
    setTimeout(() => setCopiedKeep(false), 3000);
  };

  const handleOpenGoogleKeep = () => {
    handleCopyKeepText();
    window.open('https://keep.google.com/', '_blank');
  };

  const handleSyncGoogleTasks = async () => {
    setIsSyncingTasks(true);
    setSyncStatus({ type: null, message: '' });

    try {
      const authResult = await signInWithGoogleOAuth();
      if (!authResult?.accessToken) {
        throw new Error('Please authorize Google Workspace to synchronize tasks.');
      }

      const res = await syncWithGoogleTasksAPI(authResult.accessToken, items);
      setSyncStatus({
        type: 'success',
        message: res.message,
      });
    } catch (err: any) {
      setSyncStatus({
        type: 'error',
        message: err.message || 'Failed to sync with Google Tasks.',
      });
    } finally {
      setIsSyncingTasks(false);
    }
  };

  const completedCount = items.filter((i) => i.isCompleted).length;
  const totalCount = items.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesPhase = selectedPhase === 'all' || item.phase === selectedPhase;
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'completed' && item.isCompleted) ||
        (selectedStatus === 'pending' && !item.isCompleted);
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.targetMilestone.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPhase && matchesStatus && matchesSearch;
    });
  }, [items, selectedPhase, selectedStatus, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-inner">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  StatAssist AI — Publication Readiness Checklist
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  Google Keep & Tasks Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Technical milestones, empirical accuracy benchmarks, and ethics criteria before release.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress & Quick Metrics Bar */}
        <div className="px-5 py-3 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <div className="flex-1 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700/60">
              <div
                className="bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">
              {progressPercent}% Complete
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded-md bg-slate-800/90 text-slate-300 font-mono">
              <strong className="text-white">{completedCount}</strong> done
            </span>
            <span className="px-2 py-1 rounded-md bg-slate-800/90 text-slate-300 font-mono">
              <strong className="text-amber-400">{totalCount - completedCount}</strong> pending
            </span>
            <span className="px-2 py-1 rounded-md bg-slate-800/90 text-slate-300 font-mono">
              <strong className="text-cyan-400">{totalCount}</strong> total
            </span>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="px-5 pt-3 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('checklist')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'checklist'
                  ? 'border-amber-400 text-amber-300 bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Interactive Checklist ({items.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('keep-sync')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'keep-sync'
                  ? 'border-amber-400 text-amber-300 bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cloud className="w-4 h-4 text-amber-400" />
              <span>Google Keep & Tasks Sync</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Task</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'checklist' ? (
            <>
              {/* Optional Custom Task Creation Form */}
              {showAddForm && (
                <form
                  onSubmit={handleAddTask}
                  className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/40 space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Plus className="w-4 h-4" /> Add Task to Publication Checklist
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Conduct double-blind trial on Repeated Measures ANOVA synthesis"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Detailed verification criteria or notes..."
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Phase</label>
                      <select
                        value={newPhase}
                        onChange={(e) => setNewPhase(e.target.value as ChecklistPhase)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none"
                      >
                        <option value="engine">1. Deterministic Engine</option>
                        <option value="apa-synthesis">2. APA 7th Synthesis</option>
                        <option value="security">3. Security & Ethics</option>
                        <option value="usability-sus">4. Usability & SUS</option>
                        <option value="workspace-cloud">5. Workspace & Cloud</option>
                        <option value="production-publish">6. Release & Publishing</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Priority</label>
                      <select
                        value={newPriority}
                        onChange={(e) =>
                          setNewPriority(e.target.value as 'critical' | 'high' | 'medium')
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none"
                      >
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Target Milestone</label>
                      <input
                        type="text"
                        value={newMilestone}
                        onChange={(e) => setNewMilestone(e.target.value)}
                        placeholder="e.g. Release Candidate"
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm cursor-pointer transition-colors"
                    >
                      Save Task
                    </button>
                  </div>
                </form>
              )}

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
                <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-[260px]">
                  <div className="relative flex-1 min-w-[160px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tasks or milestones..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950/70 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>

                  <select
                    value={selectedPhase}
                    onChange={(e) => setSelectedPhase(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-slate-950/70 border border-slate-700 rounded-lg text-slate-300 focus:outline-none"
                  >
                    <option value="all">All Phases</option>
                    <option value="engine">1. Engine Verification</option>
                    <option value="apa-synthesis">2. APA 7th Synthesis</option>
                    <option value="security">3. Security & Ethics</option>
                    <option value="usability-sus">4. Usability & SUS</option>
                    <option value="workspace-cloud">5. Workspace & Cloud</option>
                    <option value="production-publish">6. Production Release</option>
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as any)}
                    className="px-2.5 py-1.5 text-xs bg-slate-950/70 border border-slate-700 rounded-lg text-slate-300 focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending Only</option>
                    <option value="completed">Completed Only</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleResetChecklist}
                  className="text-2xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {filteredItems.map((item) => {
                  const priorityColors = {
                    critical: 'bg-rose-950/60 border-rose-500/40 text-rose-300',
                    high: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
                    medium: 'bg-blue-950/60 border-blue-500/40 text-blue-300',
                  };

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 group select-none ${
                        item.isCompleted
                          ? 'bg-slate-950/30 border-slate-800 text-slate-400'
                          : 'bg-slate-950/70 border-slate-700/80 hover:border-slate-600 text-slate-200 shadow-xs'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleItem(item.id);
                        }}
                        className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                          item.isCompleted
                            ? 'bg-emerald-500 text-slate-950 shadow-xs'
                            : 'border border-slate-600 group-hover:border-amber-400 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`text-xs sm:text-sm font-semibold tracking-tight ${
                              item.isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
                            }`}
                          >
                            {item.title}
                          </span>

                          <span
                            className={`text-[10px] font-mono px-2 py-0.2 rounded-full border uppercase ${
                              priorityColors[item.priority]
                            }`}
                          >
                            {item.priority}
                          </span>

                          <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {item.targetMilestone}
                          </span>
                        </div>

                        <p
                          className={`text-2xs sm:text-xs leading-relaxed ${
                            item.isCompleted ? 'text-slate-500' : 'text-slate-300'
                          }`}
                        >
                          {item.description}
                        </p>

                        <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-slate-400">
                          <span>{item.phaseLabel}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredItems.length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No tasks match the active filters.
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Google Keep & Tasks Sync Hub Tab */
            <div className="space-y-5">
              {/* Google Keep Direct Connect Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-500/40 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Google Keep Note & Checklist Generator</span>
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-white">
                      Instant Synchronization with Google Keep
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                      Export your live publication readiness checklist into Google Keep with preserved checkmarks (☑/☐), phase headings, and milestone tags. Open Keep to pin, share with your research team, or set reminders.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleOpenGoogleKeep}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                  >
                    {copiedKeep ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-950" />
                        <span>Copied! Opening Google Keep...</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        <span>Copy Checklist & Open Google Keep</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyKeepText}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    {copiedKeep ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKeep ? 'Checklist Text Copied' : 'Copy Keep Text Only'}</span>
                  </button>
                </div>

                {/* 3-Step Guide */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-amber-500/20 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-amber-400">Step 1</span>
                    <p className="text-2xs text-slate-300">
                      Click <strong>Copy & Open Google Keep</strong> to launch Keep in a new tab.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-amber-400">Step 2</span>
                    <p className="text-2xs text-slate-300">
                      Click <strong>"New note with checkboxes"</strong> at the top of Google Keep.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-amber-400">Step 3</span>
                    <p className="text-2xs text-slate-300">
                      Paste (Ctrl+V / Cmd+V). Keep automatically turns each item into a checklist item!
                    </p>
                  </div>
                </div>
              </div>

              {/* Google Tasks API Live Push (Shows in Keep Side Panel) */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30">
                        Google Workspace Tasks API
                      </span>
                      <span className="text-2xs text-slate-400">
                        (Syncs to Google Keep and Calendar side panel)
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-white">
                      Direct Tasklist API Push
                    </h4>
                    <p className="text-2xs sm:text-xs text-slate-400 leading-relaxed max-w-xl">
                      Pushes this entire checklist directly into your Google Workspace account as a dedicated tasklist: <strong>"StatAssist AI — Publish Checklist"</strong> with completion statuses preserved.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSyncGoogleTasks}
                    disabled={isSyncingTasks}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 cursor-pointer transition-all shadow-xs disabled:opacity-50 shrink-0"
                  >
                    {isSyncingTasks ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Pushing Tasks...</span>
                      </>
                    ) : (
                      <>
                        <Cloud className="w-3.5 h-3.5" />
                        <span>Sync to Google Tasks</span>
                      </>
                    )}
                  </button>
                </div>

                {syncStatus.message && (
                  <div
                    className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 animate-in fade-in ${
                      syncStatus.type === 'success'
                        ? 'bg-emerald-950/50 border border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/50 border border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {syncStatus.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{syncStatus.message}</span>
                  </div>
                )}
              </div>

              {/* Formatted Keep Checklist Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Live Google Keep Checklist Syntax Preview
                  </span>
                  <span className="text-2xs font-mono text-slate-500">
                    Markdown / Checkbox Notation
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 max-h-56 overflow-y-auto leading-relaxed whitespace-pre-wrap selection:bg-amber-500 selection:text-black">
                  {formatChecklistForGoogleKeep(items)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>State persisted locally in browser & synced via Google Workspace OAuth.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenGoogleKeep}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Send to Google Keep</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
