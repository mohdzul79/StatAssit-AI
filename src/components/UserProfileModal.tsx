import React, { useState } from 'react';
import {
  X,
  User,
  GraduationCap,
  Building,
  Mail,
  Award,
  Sliders,
  History,
  CheckCircle2,
  LogOut,
  Save,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  BarChart2,
  FileText,
  Clock,
  Layers,
  Settings,
  CreditCard,
  Check,
} from 'lucide-react';
import { UserProfile, SCHOLAR_GUEST_PROFILE, DEFAULT_USER_PROFILE } from '../types/user';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onSignOut: () => void;
  onSwitchProfile?: (profile: UserProfile) => void;
  onOpenAdminCms?: () => void;
}

const AVATAR_COLOR_OPTIONS = [
  { label: 'Blue to Indigo', class: 'from-blue-600 to-indigo-700' },
  { label: 'Emerald to Teal', class: 'from-emerald-600 to-teal-700' },
  { label: 'Purple to Fuchsia', class: 'from-purple-600 to-fuchsia-700' },
  { label: 'Amber to Orange', class: 'from-amber-600 to-orange-700' },
  { label: 'Slate to Zinc', class: 'from-slate-700 to-zinc-900' },
  { label: 'Rose to Pink', class: 'from-rose-600 to-pink-700' },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onSignOut,
  onSwitchProfile,
  onOpenAdminCms,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'edit' | 'preferences' | 'activity'>('edit');

  // Edit form states
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [title, setTitle] = useState(user.title);
  const [institution, setInstitution] = useState(user.institution);
  const [department, setDepartment] = useState(user.department);
  const [discipline, setDiscipline] = useState(user.discipline);
  const [bio, setBio] = useState(user.bio || '');
  const [orcidId, setOrcidId] = useState(user.orcidId || '');
  const [avatarColor, setAvatarColor] = useState(user.avatarColor || 'from-blue-600 to-indigo-700');

  // Preferences form states
  const [defaultAlpha, setDefaultAlpha] = useState(user.preferences.defaultAlpha);
  const [citationFormat, setCitationFormat] = useState(user.preferences.citationFormat);
  const [effectSizePreference, setEffectSizePreference] = useState(user.preferences.effectSizePreference);
  const [decimalPrecision, setDecimalPrecision] = useState(user.preferences.decimalPrecision);
  const [autoCheckAssumptions, setAutoCheckAssumptions] = useState(user.preferences.autoCheckAssumptions);
  const [highlightSignificant, setHighlightSignificant] = useState(user.preferences.highlightSignificant);

  // Success indicator
  const [showSavedToast, setShowSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const nameParts = name.trim().split(' ');
    const initials = nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();

    const updated: UserProfile = {
      ...user,
      name: name.trim(),
      email: email.trim(),
      title: title.trim(),
      institution: institution.trim(),
      department: department.trim(),
      discipline,
      bio: bio.trim(),
      orcidId: orcidId.trim(),
      avatarInitials: initials,
      avatarColor,
      preferences: {
        ...user.preferences,
        defaultAlpha,
        citationFormat,
        effectSizePreference,
        decimalPrecision,
        autoCheckAssumptions,
        highlightSignificant,
      },
      stats: {
        ...user.stats,
        lastActive: 'Just now',
      },
    };

    onUpdateUser(updated);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      setActiveTab('edit');
    }, 1200);
  };

  const handleResetToDefaults = () => {
    setDefaultAlpha(0.05);
    setCitationFormat('APA 7th');
    setEffectSizePreference('cohen_d');
    setDecimalPrecision(2);
    setAutoCheckAssumptions(true);
    setHighlightSignificant(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* User Profile Identity Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${avatarColor} text-white font-bold text-xl flex items-center justify-center shadow-lg ring-2 ring-white/20 shrink-0`}
              >
                {user.avatarInitials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-white">{user.name}</h2>
                  {user.isVerifiedAcademic && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Scholar
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 font-medium flex items-center gap-1.5 mt-0.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{user.title}</span>
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 text-2xs text-slate-400">
              <span className="text-slate-300 font-mono text-2xs">
                Open Science Scholar
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 mt-6 bg-white/10 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className="py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap bg-white text-slate-900 shadow-xs cursor-pointer font-bold"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {showSavedToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">User profile and statistical preferences updated successfully!</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Academic Scholar Workspace Card */}
              <div className="p-4 rounded-xl border border-emerald-300 bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs font-bold text-sm shrink-0">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          Academic Scholar Workspace
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Universal Access
                        </span>
                      </div>
                      <p className="text-2xs text-slate-500">
                        Open-access statistical computation & APA 7th manuscript synthesis engine
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                    Open Science
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    <span className="text-2xs text-slate-500 block font-medium">Access Scope</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Universal Academic Access</span>
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    <span className="text-2xs text-slate-500 block font-medium">Statistical Engine</span>
                    <span className="font-bold text-emerald-700 mt-0.5 block">
                      Deterministic High-Precision
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    <span className="text-2xs text-slate-500 block font-medium">Dataset & Analysis Quotas</span>
                    <span className="font-bold text-slate-900 mt-0.5 block text-xs">
                      Unlimited Tests & Synthesis
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-2xs text-slate-600 pt-2 border-t border-emerald-200/60">
                  <span className="flex items-center gap-1 text-emerald-900 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Unrestricted Access to All Parametric & Non-Parametric Tests
                  </span>
                  <span className="flex items-center gap-1 text-emerald-900 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Automated 6-Point Assumption Diagnostic Auditor
                  </span>
                  <span className="flex items-center gap-1 text-emerald-900 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Full APA 7th Manuscript Export
                  </span>
                </div>
              </div>

              {/* Quantitative Metrics Tiles */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                  Workspace Metrics & Statistical Activity
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                    <span className="text-2xs font-semibold text-slate-600 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-blue-600" />
                      Active Datasets
                    </span>
                    <span className="text-xl font-bold text-slate-900 mt-1">{user.stats.datasetsCount}</span>
                    <span className="text-2xs text-slate-600 mt-0.5">Empirical data files</span>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                    <span className="text-2xs font-semibold text-slate-600 flex items-center gap-1">
                      <BarChart2 className="w-3 h-3 text-indigo-600" />
                      Analyses Run
                    </span>
                    <span className="text-xl font-bold text-slate-900 mt-1">{user.stats.analysesRunCount}</span>
                    <span className="text-2xs text-slate-600 mt-0.5">Parametric & Non-par</span>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                    <span className="text-2xs font-semibold text-slate-600 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-emerald-600" />
                      APA Exports
                    </span>
                    <span className="text-xl font-bold text-slate-900 mt-1">{user.stats.apaReportsExported}</span>
                    <span className="text-2xs text-slate-600 mt-0.5">Manuscripts created</span>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                    <span className="text-2xs font-semibold text-slate-600 flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-600" />
                      Alpha Level (α)
                    </span>
                    <span className="text-xl font-bold text-slate-900 mt-1">{user.preferences.defaultAlpha}</span>
                    <span className="text-2xs text-slate-600 mt-0.5">{user.preferences.citationFormat} Standard</span>
                  </div>
                </div>
              </div>

              {/* Scholar Biography & Academic Details */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Academic Affiliation & Research Scope
                  </h4>
                  {user.orcidId && (
                    <a
                      href={`https://orcid.org/${user.orcidId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-2xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1"
                    >
                      <span>ORCID: {user.orcidId}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-600 font-medium">Email:</span>{' '}
                    <span className="text-slate-900 font-semibold">{user.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">Primary Discipline:</span>{' '}
                    <span className="text-slate-900 font-semibold">{user.discipline}</span>
                  </div>
                </div>

                {user.bio && (
                  <div className="pt-2 border-t border-slate-200/80 text-xs text-slate-700 leading-relaxed italic">
                    "{user.bio}"
                  </div>
                )}
              </div>

              {/* Methodological Preferences Summary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Default Methodology Configuration
                  </h4>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preferences')}
                    className="text-2xs text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Modify Preferences
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                    <span className="text-2xs text-slate-600 block">Significance Threshold</span>
                    <span className="font-semibold text-slate-900">p &lt; {user.preferences.defaultAlpha}</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                    <span className="text-2xs text-slate-600 block">Default Effect Size</span>
                    <span className="font-semibold text-slate-900 capitalize">
                      {user.preferences.effectSizePreference.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                    <span className="text-2xs text-slate-600 block">Decimal Precision</span>
                    <span className="font-semibold text-slate-900">{user.preferences.decimalPrecision} Decimal Places</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EDIT PROFILE */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name with Academic Title
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Designation / Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Associate Professor, Biostatistician"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    University / Research Institution
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Faculty / Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Research Discipline
                  </label>
                  <select
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="Quantitative Psychology & Applied Statistics">Quantitative Psychology & Applied Statistics</option>
                    <option value="Biostatistics, Clinical & Health Sciences">Biostatistics, Clinical & Health Sciences</option>
                    <option value="Educational Measurement & Evaluation">Educational Measurement & Evaluation</option>
                    <option value="Economics, Econometrics & Finance">Economics, Econometrics & Finance</option>
                    <option value="Data Science & Applied Analytics">Data Science & Applied Analytics</option>
                    <option value="Sociology & Public Policy">Sociology & Public Policy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ORCID Identifier (Optional)
                  </label>
                  <input
                    type="text"
                    value={orcidId}
                    onChange={(e) => setOrcidId(e.target.value)}
                    placeholder="0000-0002-1825-0097"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Avatar Gradient Theme
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {AVATAR_COLOR_OPTIONS.map((opt) => (
                      <button
                        key={opt.class}
                        type="button"
                        onClick={() => setAvatarColor(opt.class)}
                        className={`w-7 h-7 rounded-full bg-gradient-to-tr ${opt.class} transition-transform ${
                          avatarColor === opt.class
                            ? 'ring-2 ring-offset-2 ring-slate-900 scale-110'
                            : 'opacity-80 hover:opacity-100 hover:scale-105'
                        }`}
                        title={opt.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Biography & Research Focus
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Briefly state your empirical focus, methodological paradigms, or quantitative research objectives..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: METHODOLOGICAL PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Statistical Engine Defaults</h3>
                  <p className="text-2xs text-slate-600">
                    Configure significance alpha, effect sizes, and assumption testing rules for your analyses.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetToDefaults}
                  className="text-2xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Significance Alpha Level (α)
                  </label>
                  <select
                    value={defaultAlpha}
                    onChange={(e) => setDefaultAlpha(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value={0.05}>α = 0.05 (Standard Behavioral & Social Sciences)</option>
                    <option value={0.01}>α = 0.01 (Strict Clinical & High-Stakes)</option>
                    <option value={0.001}>α = 0.001 (Genome-Wide / High Significance)</option>
                    <option value={0.10}>α = 0.10 (Exploratory / Pilot Studies)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reporting & Citation Standard
                  </label>
                  <select
                    value={citationFormat}
                    onChange={(e) => setCitationFormat(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="APA 7th">APA 7th Edition (Recommended)</option>
                    <option value="Harvard">Harvard Reference System</option>
                    <option value="Vancouver">Vancouver Biomedical Standard</option>
                    <option value="IEEE">IEEE Technical Format</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Effect Size Metric
                  </label>
                  <select
                    value={effectSizePreference}
                    onChange={(e) => setEffectSizePreference(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="cohen_d">Cohen's d (Standardized Mean Difference)</option>
                    <option value="eta_squared">Eta-Squared / Partial η² (ANOVA Variance Explained)</option>
                    <option value="hedges_g">Hedges' g (Corrected for small sample sizes)</option>
                    <option value="r">Pearson r (Correlation & Association)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Table Decimal Precision
                  </label>
                  <select
                    value={decimalPrecision}
                    onChange={(e) => setDecimalPrecision(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value={2}>2 Decimal Places (APA 7th Standard: e.g. M = 4.25, SD = 1.10)</option>
                    <option value={3}>3 Decimal Places (High Precision: e.g. p = .003)</option>
                    <option value={4}>4 Decimal Places (Exact Scientific: e.g. 0.0012)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCheckAssumptions}
                    onChange={(e) => setAutoCheckAssumptions(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      Automated Statistical Assumption Verification
                    </span>
                    <span className="text-2xs text-slate-600 block">
                      Automatically evaluate Shapiro-Wilk normality and Levene's test for homogeneity before running parametric procedures.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={highlightSignificant}
                    onChange={(e) => setHighlightSignificant(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      Visual Highlighting of Significant Results (p &lt; α)
                    </span>
                    <span className="text-2xs text-slate-600 block">
                      Color-code hypothesis outcomes with green confidence badges when null hypotheses are rejected.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Apply Preferences</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: RECENT ACTIVITY */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Quantitative Research Timeline</h3>
                  <p className="text-2xs text-slate-600">
                    Chronological audit log of procedures and manuscript syntheses executed by this profile.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {user.recentActivities && user.recentActivities.length > 0 ? (
                  user.recentActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        {act.type === 'analysis' && <BarChart2 className="w-4 h-4" />}
                        {act.type === 'report' && <FileText className="w-4 h-4" />}
                        {act.type === 'dataset' && <Layers className="w-4 h-4" />}
                        {act.type === 'feedback' && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">{act.title}</span>
                          <span className="text-2xs text-slate-600 whitespace-nowrap flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {act.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{act.detail}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-600 text-xs">
                    No recent activities recorded yet. Run a statistical test to populate your research timeline.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onSwitchProfile && (
              <button
                type="button"
                onClick={() => {
                  const alt = user.id === DEFAULT_USER_PROFILE.id ? SCHOLAR_GUEST_PROFILE : DEFAULT_USER_PROFILE;
                  onSwitchProfile(alt);
                  setShowSavedToast(true);
                  setTimeout(() => setShowSavedToast(false), 1200);
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Switch to alternate scholar profile"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Switch to {user.id === DEFAULT_USER_PROFILE.id ? 'Visiting Scholar' : 'Dr. Alex'}</span>
              </button>
            )}

            {onOpenAdminCms && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminCms();
                }}
                className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Open Admin CMS for User & Membership Control"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>Admin CMS</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onSignOut();
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
