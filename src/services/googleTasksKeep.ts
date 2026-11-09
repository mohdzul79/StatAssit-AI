// StatAssist AI Development & Publication Checklist Service
// Provides bidirectional local state, Google Keep formatted checklist exports,
// and live Google Tasks API synchronization.

export type ChecklistPhase =
  | 'engine'
  | 'apa-synthesis'
  | 'security'
  | 'usability-sus'
  | 'workspace-cloud'
  | 'production-publish';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  phase: ChecklistPhase;
  phaseLabel: string;
  isCompleted: boolean;
  priority: 'critical' | 'high' | 'medium';
  targetMilestone: string;
}

export const DEFAULT_PUBLISH_CHECKLIST: ChecklistItem[] = [
  // Phase 1: Engine Verification
  {
    id: 'chk-engine-1',
    title: 'Validate 15 core inferential statistical algorithms against R 4.4 and SPSS',
    description:
      'Verify deterministic calculation of t, F, Chi-Square, U, W, H, Q, Pearson r, and regression coefficients with zero variance safeguards.',
    phase: 'engine',
    phaseLabel: '1. Deterministic Inference Engine',
    isCompleted: true,
    priority: 'critical',
    targetMilestone: 'Pre-Beta Verification',
  },
  {
    id: 'chk-engine-2',
    title: 'Floating-point boundary precision and exact p-value rounding tests',
    description:
      'Ensure extreme tails (p < .001) format properly without rounding down to 0.000, adhering to APA 7th section 6.44.',
    phase: 'engine',
    phaseLabel: '1. Deterministic Inference Engine',
    isCompleted: true,
    priority: 'critical',
    targetMilestone: 'Pre-Beta Verification',
  },
  {
    id: 'chk-engine-3',
    title: 'Assumption testing & automated FSM recommendation logic',
    description:
      'Automate Shapiro-Wilk normality and Levene homogeneity tests before dispatching parametric vs non-parametric routes.',
    phase: 'engine',
    phaseLabel: '1. Deterministic Inference Engine',
    isCompleted: true,
    priority: 'high',
    targetMilestone: 'Release Candidate',
  },

  // Phase 2: APA 7th Synthesis
  {
    id: 'chk-apa-1',
    title: 'APA 7th narrative synthesis generation across all 15 tests',
    description:
      'Format italicized test statistics (t, F, r, p, d, ηp²), degrees of freedom, and explicit formal hypothesis decisions (Reject / Fail to Reject H0).',
    phase: 'apa-synthesis',
    phaseLabel: '2. APA 7th Manuscript Synthesis',
    isCompleted: true,
    priority: 'critical',
    targetMilestone: 'Pre-Beta Verification',
  },
  {
    id: 'chk-apa-2',
    title: 'Publication-ready APA 7th summary tables',
    description:
      'Generate three-line horizontal rule tables with means, standard deviations, confidence intervals, and effect size metrics.',
    phase: 'apa-synthesis',
    phaseLabel: '2. APA 7th Manuscript Synthesis',
    isCompleted: true,
    priority: 'high',
    targetMilestone: 'Release Candidate',
  },
  {
    id: 'chk-apa-3',
    title: 'Automated manuscript export (Word DOCX & LaTeX formats)',
    description:
      'Export synthesized academic results directly for thesis chapters, journal submissions, and conference proceedings.',
    phase: 'apa-synthesis',
    phaseLabel: '2. APA 7th Manuscript Synthesis',
    isCompleted: false,
    priority: 'high',
    targetMilestone: 'Production Release',
  },

  // Phase 3: Security & Academic Compliance
  {
    id: 'chk-sec-1',
    title: 'Enforce Zero-Retention browser RAM architecture',
    description:
      'Ensure raw respondent data stays entirely in client memory and is never harvested, logged, or utilized for AI model training.',
    phase: 'security',
    phaseLabel: '3. Security & Institutional Ethics',
    isCompleted: true,
    priority: 'critical',
    targetMilestone: 'Pre-Beta Verification',
  },
  {
    id: 'chk-sec-2',
    title: 'Firebase security rules & role-based access control (RBAC)',
    description:
      'Lock down Firestore rules to verified academic investigators, ensuring encrypted ticket logs and protected admin CMS queues.',
    phase: 'security',
    phaseLabel: '3. Security & Institutional Ethics',
    isCompleted: true,
    priority: 'critical',
    targetMilestone: 'Release Candidate',
  },
  {
    id: 'chk-sec-3',
    title: 'Institutional Review Board (IRB) & FERPA compliance disclosure',
    description:
      'Provide downloadable data sovereignty statements for university ethics clearance committees and institutional audit compliance.',
    phase: 'security',
    phaseLabel: '3. Security & Institutional Ethics',
    isCompleted: false,
    priority: 'medium',
    targetMilestone: 'Production Release',
  },

  // Phase 4: Usability Testing & Field Evaluation
  {
    id: 'chk-ux-1',
    title: 'Standard System Usability Scale (SUS) 10-item instrument integration',
    description:
      'Brooke (1996) odd/even Likert scoring methodology with real-time grade brackets (A+ to F) and ISO 9241-11 benchmarking.',
    phase: 'usability-sus',
    phaseLabel: '4. Usability Testing & Evaluation',
    isCompleted: true,
    priority: 'critical',
    targetMilestone: 'Field Validation',
  },
  {
    id: 'chk-ux-2',
    title: 'Live Google Form & Google Drive response repository',
    description:
      'Direct synchronization to researcher Google Drive with Google Apps Script 1-click generator for institutional evaluations.',
    phase: 'usability-sus',
    phaseLabel: '4. Usability Testing & Evaluation',
    isCompleted: true,
    priority: 'high',
    targetMilestone: 'Field Validation',
  },
  {
    id: 'chk-ux-3',
    title: 'Post-graduate & faculty pilot trial (N >= 30 participants)',
    description:
      'Collect and aggregate pilot usability feedback to guarantee an empirical SUS score benchmark above 80.3 (Top 10th percentile).',
    phase: 'usability-sus',
    phaseLabel: '4. Usability Testing & Evaluation',
    isCompleted: false,
    priority: 'high',
    targetMilestone: 'Production Release',
  },

  // Phase 5: Google Workspace & Cloud Sync
  {
    id: 'chk-cloud-1',
    title: 'Google Drive & Google Docs live APA manuscript synchronization',
    description:
      'OAuth client-side token flow allowing researchers to save generated statistical reports straight to their Drive academic folders.',
    phase: 'workspace-cloud',
    phaseLabel: '5. Workspace & Cloud Sync',
    isCompleted: true,
    priority: 'high',
    targetMilestone: 'Release Candidate',
  },
  {
    id: 'chk-cloud-2',
    title: 'Google Keep checklist synchronization & note export',
    description:
      '1-Click checklist export to Google Keep and live task synchronization with Google Tasks API for mobile and desktop tracking.',
    phase: 'workspace-cloud',
    phaseLabel: '5. Workspace & Cloud Sync',
    isCompleted: true,
    priority: 'high',
    targetMilestone: 'Release Candidate',
  },
  {
    id: 'chk-cloud-3',
    title: 'Progressive Web App (PWA) offline computation caching',
    description:
      'Enable service worker offline mode so field researchers can perform t-tests and regressions without active internet connectivity.',
    phase: 'workspace-cloud',
    phaseLabel: '5. Workspace & Cloud Sync',
    isCompleted: false,
    priority: 'medium',
    targetMilestone: 'Production Release',
  },

  // Phase 6: Deployment & Publication
  {
    id: 'chk-pub-1',
    title: 'Academic Schema.org structured data, OpenGraph, and SEO optimization',
    description:
      'Configure rich metadata, SoftwareApplication schema, and social cards for academic indexing on Google Scholar and institutional repositories.',
    phase: 'production-publish',
    phaseLabel: '6. Publishing & Production Release',
    isCompleted: true,
    priority: 'high',
    targetMilestone: 'Production Release',
  },
  {
    id: 'chk-pub-2',
    title: 'Zenodo / Open Science Framework DOI registration',
    description:
      'Mint a citable digital object identifier (DOI) for software citation in research papers and academic dissertations.',
    phase: 'production-publish',
    phaseLabel: '6. Publishing & Production Release',
    isCompleted: false,
    priority: 'medium',
    targetMilestone: 'Production Release',
  },
  {
    id: 'chk-pub-3',
    title: 'Production DNS cutover, SSL verification & global CDN caching',
    description:
      'Final domain cutover with HTTPS headers, asset gzip/brotli compression, and zero-downtime container configuration.',
    phase: 'production-publish',
    phaseLabel: '6. Publishing & Production Release',
    isCompleted: false,
    priority: 'critical',
    targetMilestone: 'Publish Cutover',
  },
];

const LOCAL_STORAGE_KEY = 'statassist_publish_checklist_v1';

export const loadStoredChecklist = (): ChecklistItem[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return DEFAULT_PUBLISH_CHECKLIST;
    const parsed: ChecklistItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_PUBLISH_CHECKLIST;
    return parsed;
  } catch (err) {
    console.error('Failed to load stored checklist, reverting to defaults:', err);
    return DEFAULT_PUBLISH_CHECKLIST;
  }
};

export const saveStoredChecklist = (items: ChecklistItem[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save checklist to localStorage:', err);
  }
};

/**
 * Formats the entire checklist into Google Keep compatible checklist syntax.
 * Includes phase separators, checkbox status, and milestone markers.
 */
export const formatChecklistForGoogleKeep = (items: ChecklistItem[]): string => {
  const completedCount = items.filter((i) => i.isCompleted).length;
  const percentage = Math.round((completedCount / items.length) * 100);

  const header = `📋 StatAssist AI — Publication Readiness Checklist\n` +
    `Progress: ${completedCount}/${items.length} tasks completed (${percentage}%)\n` +
    `Updated: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\n` +
    `URL: https://statassist.ai\n\n`;

  const phases: ChecklistPhase[] = [
    'engine',
    'apa-synthesis',
    'security',
    'usability-sus',
    'workspace-cloud',
    'production-publish',
  ];

  const phaseNames: Record<ChecklistPhase, string> = {
    'engine': '🔬 1. DETERMINISTIC ENGINE VERIFICATION',
    'apa-synthesis': '📄 2. APA 7TH MANUSCRIPT SYNTHESIS',
    'security': '🛡️ 3. SECURITY & ACADEMIC PRIVACY',
    'usability-sus': '📊 4. USABILITY TESTING & SUS EVALUATION',
    'workspace-cloud': '☁️ 5. GOOGLE WORKSPACE & CLOUD SYNC',
    'production-publish': '🚀 6. DEPLOYMENT & PRODUCTION RELEASE',
  };

  const body = phases
    .map((phase) => {
      const phaseItems = items.filter((i) => i.phase === phase);
      if (phaseItems.length === 0) return '';
      const list = phaseItems
        .map((item) => {
          const mark = item.isCompleted ? '☑' : '☐';
          return `${mark} ${item.title} [${item.targetMilestone}]`;
        })
        .join('\n');
      return `${phaseNames[phase]}\n${list}`;
    })
    .filter(Boolean)
    .join('\n\n');

  return header + body;
};

/**
 * Creates or synchronizes tasks with Google Tasks API (accessible inside Google Keep and Google Calendar).
 */
export const syncWithGoogleTasksAPI = async (
  accessToken: string,
  items: ChecklistItem[]
): Promise<{ success: boolean; tasklistId: string; createdCount: number; message: string }> => {
  try {
    // 1. Check existing tasklists
    const listRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!listRes.ok) {
      const errText = await listRes.text();
      throw new Error(`Google Tasks API request failed (${listRes.status}): ${errText}`);
    }

    const listData = await listRes.json();
    let targetList = listData.items?.find((l: any) => l.title === 'StatAssist AI — Publish Checklist');

    // 2. Create dedicated tasklist if not found
    if (!targetList) {
      const createListRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'StatAssist AI — Publish Checklist',
        }),
      });

      if (!createListRes.ok) {
        throw new Error('Failed to create "StatAssist AI — Publish Checklist" tasklist.');
      }
      targetList = await createListRes.json();
    }

    const tasklistId = targetList.id;

    // 3. Batch push tasks
    let createdCount = 0;
    for (const item of items) {
      const taskBody = {
        title: item.title,
        notes: `[${item.phaseLabel}] Priority: ${item.priority.toUpperCase()} | Milestone: ${item.targetMilestone}\n${item.description}`,
        status: item.isCompleted ? 'completed' : 'needsAction',
      };

      const taskRes = await fetch(
        `https://tasks.googleapis.com/tasks/v1/lists/${tasklistId}/tasks`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskBody),
        }
      );

      if (taskRes.ok) {
        createdCount++;
      }
    }

    return {
      success: true,
      tasklistId,
      createdCount,
      message: `Successfully synchronized ${createdCount} development tasks to Google Tasks (viewable directly in Google Keep and Calendar)!`,
    };
  } catch (err: any) {
    console.error('Google Tasks sync error:', err);
    throw err;
  }
};
