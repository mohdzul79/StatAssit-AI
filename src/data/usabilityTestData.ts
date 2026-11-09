// StatAssist AI Usability Test Data, System Usability Scale (SUS) Specifications,
// and Google Form Automation Assets

export interface SusQuestion {
  id: number;
  text: string;
  isPositive: boolean; // odd items (1, 3, 5, 7, 9) are positive; even items (2, 4, 6, 8, 10) are negative
}

export const SUS_QUESTIONS: SusQuestion[] = [
  {
    id: 1,
    text: 'I think that I would like to use StatAssist AI frequently for statistical analysis and academic writing.',
    isPositive: true,
  },
  {
    id: 2,
    text: 'I found StatAssist AI unnecessarily complex or difficult to understand.',
    isPositive: false,
  },
  {
    id: 3,
    text: 'I thought StatAssist AI was easy to use for navigating tests and loading datasets.',
    isPositive: true,
  },
  {
    id: 4,
    text: 'I think that I would need the support of a technical statistical expert to be able to use StatAssist AI.',
    isPositive: false,
  },
  {
    id: 5,
    text: 'I found the various functions (data repository, statistical test selection, console, and APA report generator) in StatAssist AI were well integrated.',
    isPositive: true,
  },
  {
    id: 6,
    text: 'I thought there was too much inconsistency in StatAssist AI workflows.',
    isPositive: false,
  },
  {
    id: 7,
    text: 'I would imagine that most researchers and students would learn to use StatAssist AI very quickly.',
    isPositive: true,
  },
  {
    id: 8,
    text: 'I found StatAssist AI very cumbersome or awkward to use.',
    isPositive: false,
  },
  {
    id: 9,
    text: 'I felt very confident using StatAssist AI to verify assumptions and interpret hypothesis testing results.',
    isPositive: true,
  },
  {
    id: 10,
    text: 'I needed to learn a lot of things before I could get going with StatAssist AI.',
    isPositive: false,
  },
];

export interface TaskEvaluation {
  id: string;
  taskTitle: string;
  description: string;
  ratingQuestion: string;
}

export const TASK_EVALUATIONS: TaskEvaluation[] = [
  {
    id: 'task_data',
    taskTitle: 'Data Management & Research Repository',
    description: 'Loading sample research datasets, uploading custom CSV/Excel files, and checking variable metadata.',
    ratingQuestion: 'How intuitive and effective was the data loading and variable management?',
  },
  {
    id: 'task_selection',
    taskTitle: 'Selecting Test Matrix (60+ Procedures & 21 Chart Types)',
    description: 'Browsing statistical methods by design category, viewing visual graphs, and synchronizing tailored datasets.',
    ratingQuestion: 'How easy was it to identify and select the appropriate statistical test for your research question?',
  },
  {
    id: 'task_console',
    taskTitle: 'Statistical Console & Diagnostic Verification',
    description: 'Assigning variables (IV, DV, Covariates), computing deterministic p-values, and auditing assumption violations.',
    ratingQuestion: 'How clear and mathematically trustworthy were the statistical calculations and assumption checks?',
  },
  {
    id: 'task_apa',
    taskTitle: 'Wizard Synthesis (APA 7th Manuscript & Narrative)',
    description: 'Generating APA 7th style manuscript sections, formatted summary tables, effect sizes, and academic interpretations.',
    ratingQuestion: 'How valuable and publication-ready are the generated APA 7th tables and narrative summaries?',
  },
  {
    id: 'task_ai_sync',
    taskTitle: 'Gemini AI Statistical Assistant & Google NotebookLM Sync',
    description: 'Receiving contextual methodology advice and syncing log book records with Google Drive & NotebookLM.',
    ratingQuestion: 'How helpful was the AI assistance and academic research synchronization capability?',
  },
];

export interface UsabilityResponse {
  id: string;
  submittedAt: string;
  participantName: string;
  participantEmail: string;
  participantRole: string;
  fieldOfStudy: string;
  priorSoftware: string[];
  susAnswers: Record<number, number>; // 1 to 5 scale for items 1-10
  susScore: number;
  susGrade: string;
  susAdjective: string;
  taskRatings: Record<string, number>; // 1 to 5 scale
  npsScore: number; // 0 to 10
  mostValuableFeature: string;
  painPoints: string;
  featureSuggestions: string;
}

/**
 * Standard Brooke (1996) System Usability Scale (SUS) Score Calculation
 * For odd items (1, 3, 5, 7, 9): score contribution = response - 1
 * For even items (2, 4, 6, 8, 10): score contribution = 5 - response
 * Multiply sum of contributions by 2.5 to get final score on 0-100 scale.
 */
export function calculateSusScore(susAnswers: Record<number, number>): {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  adjective: string;
  percentile: number;
} {
  let totalContribution = 0;
  for (let i = 1; i <= 10; i++) {
    const val = susAnswers[i] ?? 3;
    if (i % 2 === 1) {
      // Positive item
      totalContribution += Math.max(0, val - 1);
    } else {
      // Negative item
      totalContribution += Math.max(0, 5 - val);
    }
  }

  const rawScore = totalContribution * 2.5;
  const score = Math.round(rawScore * 10) / 10;

  // Bangor, Kortum & Miller (2009) SUS benchmarks
  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'C';
  let adjective = 'OK';
  let percentile = 50;

  if (score >= 84.1) {
    grade = 'A+';
    adjective = 'Best Imaginable (Superior)';
    percentile = 96;
  } else if (score >= 80.3) {
    grade = 'A';
    adjective = 'Excellent (Top Tier)';
    percentile = 90;
  } else if (score >= 74.0) {
    grade = 'B';
    adjective = 'Good (Above Average)';
    percentile = 70;
  } else if (score >= 68.0) {
    grade = 'C';
    adjective = 'Acceptable (Industry Benchmark: 68)';
    percentile = 50;
  } else if (score >= 51.0) {
    grade = 'D';
    adjective = 'Marginal / OK';
    percentile = 20;
  } else {
    grade = 'F';
    adjective = 'Unacceptable (Needs Redesign)';
    percentile = 5;
  }

  return { score, grade, adjective, percentile };
}

// Default Google Form URL: configured official usability survey
export const DEFAULT_GOOGLE_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSdJHIJZhAgVpBKYDAQIzwEaG18xrfk_fSKg05RBZHzzzXSGhA/viewform?usp=publish-editor';

export const STORAGE_KEY_GOOGLE_FORM_URL = 'statassist_custom_google_form_url';
export const STORAGE_KEY_USABILITY_RESPONSES = 'statassist_usability_responses_v1';

export function isGoogleFormUrlConfigured(): boolean {
  return true;
}

export function getEffectiveGoogleFormUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_GOOGLE_FORM_URL;
  const custom = localStorage.getItem(STORAGE_KEY_GOOGLE_FORM_URL);
  if (
    custom &&
    custom.trim() &&
    !custom.includes('StatAssistAI_Usability_Benchmark') &&
    custom !== 'https://forms.new'
  ) {
    return custom.trim();
  }
  return DEFAULT_GOOGLE_FORM_URL;
}

export function saveEffectiveGoogleFormUrl(url: string) {
  if (typeof window === 'undefined') return;
  if (!url || !url.trim()) {
    localStorage.removeItem(STORAGE_KEY_GOOGLE_FORM_URL);
  } else {
    localStorage.setItem(STORAGE_KEY_GOOGLE_FORM_URL, url.trim());
  }
}

export function getStoredUsabilityResponses(): UsabilityResponse[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USABILITY_RESPONSES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse usability responses:', err);
    return [];
  }
}

export function saveUsabilityResponse(response: UsabilityResponse) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredUsabilityResponses();
    const updated = [response, ...existing];
    localStorage.setItem(STORAGE_KEY_USABILITY_RESPONSES, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save usability response:', err);
  }
}

/**
 * Generates an automated Google Apps Script that builds the entire Google Form
 * programmatically in the user's Google Drive with all 10 SUS questions, task grids,
 * validation, and links it directly to Google Sheets!
 */
export function generateGoogleAppsScriptForForm(): string {
  return `/**
 * StatAssist AI — Automated Google Form Creator Script
 * 
 * Instructions:
 * 1. Open Google Apps Script: https://script.google.com/
 * 2. Click "New project"
 * 3. Replace all existing code with this script
 * 4. Click "Run" -> choose "createStatAssistUsabilityForm"
 * 5. Grant permissions when prompted by Google
 * 6. Check the Execution log: Your live Google Form URL and Google Sheets response link will be printed!
 */

function createStatAssistUsabilityForm() {
  var formTitle = "StatAssist AI — System Usability Scale (SUS) & User Evaluation";
  var form = FormApp.create(formTitle);
  
  form.setDescription(
    "Welcome to the official usability evaluation for StatAssist AI: Quantitative Analysis & APA 7th Edition Reporting Engine.\\n\\n" +
    "This academic usability study measures System Usability Scale (SUS, Brooke 1996), task completion efficiency, " +
    "and user satisfaction with the statistical calculation and APA manuscript generation capabilities.\\n\\n" +
    "Estimated completion time: 4-6 minutes. Your feedback directly informs future academic releases."
  );
  
  form.setAllowResponseEdits(true)
      .setCollectEmail(true)
      .setShowLinkToRespondAgain(false)
      .setProgressBar(true);

  // -------------------------------------------------------------
  // SECTION 1: Participant Demographics & Background
  // -------------------------------------------------------------
  var page1 = form.addPageBreakItem();
  page1.setTitle("Section 1: Participant Profile & Research Background");
  
  var nameItem = form.addTextItem();
  nameItem.setTitle("Participant Full Name (or Pseudonym)");
  nameItem.setRequired(false);
  
  var roleItem = form.addMultipleChoiceItem();
  roleItem.setTitle("Primary Academic or Professional Role")
    .setChoiceValues([
      "Postgraduate / Doctoral Scholar (PhD / Masters)",
      "Undergraduate Student",
      "Academic Lecturer / Faculty Member / Professor",
      "Institutional Researcher / Postdoc",
      "Data Scientist / Industry Quantitative Analyst",
      "Medical / Clinical Researcher"
    ])
    .showOtherOption(true)
    .setRequired(true);

  var fieldItem = form.addMultipleChoiceItem();
  fieldItem.setTitle("Primary Field of Study / Domain")
    .setChoiceValues([
      "Psychology & Behavioral Sciences",
      "Education & Educational Technology",
      "Medicine, Nursing & Health Sciences",
      "Business, Management & Economics",
      "Social Sciences & Sociology",
      "Computer Science & STEM",
      "Biological & Environmental Sciences"
    ])
    .showOtherOption(true)
    .setRequired(true);

  var toolsItem = form.addCheckboxItem();
  toolsItem.setTitle("Statistical Analysis Software Previously Used")
    .setChoiceValues([
      "IBM SPSS Statistics",
      "R / RStudio",
      "Jamovi / JASP",
      "GraphPad Prism",
      "Python (Pandas, SciPy, Statsmodels)",
      "Stata / SAS",
      "Microsoft Excel"
    ])
    .showOtherOption(true)
    .setRequired(false);

  // -------------------------------------------------------------
  // SECTION 2: Core Task Evaluation (StatAssist AI Workflows)
  // -------------------------------------------------------------
  var page2 = form.addPageBreakItem();
  page2.setTitle("Section 2: Task Experience & Feature Workflow Evaluation");
  page2.setHelpText("Rate your experience performing the key workflows in StatAssist AI on a scale from 1 (Very Difficult / Poor) to 5 (Very Easy / Excellent).");

  var tasks = [
    "1. Data Management: Loading sample research datasets or uploading custom Excel/CSV files",
    "2. Selecting Test Matrix: Browsing 60+ procedures, 21 graph taxonomy cards, and selecting appropriate tests",
    "3. Statistical Console: Mapping variables (DV, IV, Covariates), computing deterministic p-values, and assumption audits",
    "4. Wizard Synthesis: Generating APA 7th format summary tables, effect sizes, and manuscript narratives",
    "5. AI Guidance & Synchronization: Interacting with statistical advisor and Google NotebookLM Drive sync"
  ];

  var taskGrid = form.addGridItem();
  taskGrid.setTitle("Task Usability & Satisfaction Assessment")
    .setRows(tasks)
    .setColumns(["1 - Very Difficult", "2 - Difficult", "3 - Neutral", "4 - Easy", "5 - Very Easy"])
    .setRequired(true);

  // -------------------------------------------------------------
  // SECTION 3: System Usability Scale (SUS - Brooke, 1996)
  // -------------------------------------------------------------
  var page3 = form.addPageBreakItem();
  page3.setTitle("Section 3: Standard System Usability Scale (SUS)");
  page3.setHelpText("Please indicate your level of agreement with each statement regarding StatAssist AI (1 = Strongly Disagree, 5 = Strongly Agree).");

  var susStatements = [
    "1. I think that I would like to use StatAssist AI frequently.",
    "2. I found StatAssist AI unnecessarily complex.",
    "3. I thought StatAssist AI was easy to use.",
    "4. I think that I would need the support of a technical person to be able to use StatAssist AI.",
    "5. I found the various functions in StatAssist AI were well integrated.",
    "6. I thought there was too much inconsistency in StatAssist AI.",
    "7. I would imagine that most people would learn to use StatAssist AI very quickly.",
    "8. I found StatAssist AI very cumbersome to use.",
    "9. I felt very confident using StatAssist AI.",
    "10. I needed to learn a lot of things before I could get going with StatAssist AI."
  ];

  var susGrid = form.addGridItem();
  susGrid.setTitle("System Usability Scale (SUS) 10-Item Benchmark")
    .setRows(susStatements)
    .setColumns([
      "1 - Strongly Disagree",
      "2 - Disagree",
      "3 - Neutral",
      "4 - Agree",
      "5 - Strongly Agree"
    ])
    .setRequired(true);

  // -------------------------------------------------------------
  // SECTION 4: Qualitative Feedback & Recommendations
  // -------------------------------------------------------------
  var page4 = form.addPageBreakItem();
  page4.setTitle("Section 4: Qualitative Feedback & Suggestions");

  var npsItem = form.addScaleItem();
  npsItem.setTitle("How likely are you to recommend StatAssist AI to a colleague, student, or research team?")
    .setBounds(0, 10)
    .setLabels("0 - Not at all likely", "10 - Extremely likely")
    .setRequired(true);

  var qBest = form.addParagraphTextItem();
  qBest.setTitle("What feature or aspect of StatAssist AI did you find most valuable?")
    .setRequired(false);

  var qPain = form.addParagraphTextItem();
  qPain.setTitle("What aspects, workflows, or terminology felt confusing or need improvement?")
    .setRequired(false);

  var qFeatures = form.addParagraphTextItem();
  qFeatures.setTitle("What additional statistical procedures, visualization formats, or integrations would you like to see?")
    .setRequired(false);

  // Link response to Google Sheets automatically
  var responseSheet = SpreadsheetApp.create("StatAssist AI Usability Test Responses");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, responseSheet.getId());

  Logger.log("=== STATASSIST AI USABILITY FORM CREATED ===");
  Logger.log("Live Form URL: " + form.getPublishedUrl());
  Logger.log("Edit Form URL: " + form.getEditUrl());
  Logger.log("Google Sheets Response URL: " + responseSheet.getUrl());
}
`;
}
