import { StatisticalTestType } from '../types/stats';

export type DissertationChapterId =
  | 'essentials'
  | 'questions'
  | 'literature'
  | 'strategy'
  | 'sampling'
  | 'ethics'
  | 'writing';

export interface DissertationSubsection {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
  academicTip?: string;
  writeUpTemplate?: string;
  recommendedTest?: StatisticalTestType;
  recommendedTestLabel?: string;
}

export interface DissertationChapter {
  id: DissertationChapterId;
  badge: string;
  title: string;
  subtitle: string;
  overview: string;
  subsections: DissertationSubsection[];
}

export interface SamplingTechniqueInfo {
  id: string;
  name: string;
  family: 'probability' | 'non-probability';
  bestFor: string;
  howItWorks: string;
  strengths: string[];
  limitations: string[];
  justificationSnippet: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const DISSERTATION_CHAPTERS: DissertationChapter[] = [
  {
    id: 'essentials',
    badge: 'Part 1',
    title: 'Dissertation Essentials & Structure',
    subtitle: 'Topics, titles, chapter architecture, abstracts, and core structural components.',
    overview:
      'StatAssist AI Dissertations begins with the foundational architecture of an undergraduate, master’s, or doctoral dissertation. A cohesive structure aligns your title, research problem, methodology, results, and scholarly contribution into a single logical narrative.',
    subsections: [
      {
        id: 'ess-topic-title',
        title: 'Selecting a Viable Topic & Crafting Your Title',
        summary:
          'A strong dissertation topic balances scholarly originality, theoretical grounding, methodological feasibility, and access to data within your available timeline.',
        keyPoints: [
          'Define a narrow, answerable research problem rather than a broad subject area.',
          'Verify data availability, participant access, and ethical feasibility before locking your title.',
          'Include key constructs, target population, and research setting concisely in the dissertation title (typically 12–18 words).',
          'Avoid vague words like "A Study of..." or "An Investigation into..." when more precise directional or analytical terms work better.',
        ],
        academicTip:
          'Test your title by checking whether a reader can immediately identify your independent/dependent variables, population, and research context.',
      },
      {
        id: 'ess-structure',
        title: 'Standard Chapter-by-Chapter Dissertation Architecture',
        summary:
          'Most empirical dissertations follow a five- or six-chapter progression, bracketed by front matter and back matter.',
        keyPoints: [
          'Front Matter: Title Page, Declaration, Abstract (150–300 words), Acknowledgements, Table of Contents, List of Tables & Figures.',
          'Chapter 1 — Introduction: Research background, problem statement, research aims/questions, significance, and dissertation roadmap.',
          'Chapter 2 — Literature Review: Critical synthesis of prior evidence, theoretical/conceptual framework, and explicit research gap.',
          'Chapter 3 — Research Strategy / Methodology: Paradigm, design, sampling strategy, instrumentation, data analysis plan, and ethics.',
          'Chapter 4 — Results / Findings: Objective presentation of descriptive statistics, assumption diagnostics, and inferential test outputs.',
          'Chapter 5 — Discussion & Conclusion: Interpretation against prior literature, theoretical/practical implications, limitations, and future directions.',
        ],
        writeUpTemplate:
          'This dissertation investigates [Core Phenomenon] among [Target Population]. Chapter 1 establishes the research problem and objectives. Chapter 2 synthesises prior empirical literature to develop the conceptual framework. Chapter 3 justifies the [Quantitative/Mixed] research strategy, sampling plan, and ethical safeguards. Chapter 4 reports statistical findings generated via StatAssist AI, and Chapter 5 interprets these results alongside study limitations and future research recommendations.',
      },
      {
        id: 'ess-abstract-limitations',
        title: 'Abstracts, Acknowledgements & Research Limitations',
        summary:
          'The abstract acts as a self-contained executive summary written last, while transparent limitations strengthen scholarly credibility.',
        keyPoints: [
          'Structured Abstract elements: Background/Purpose (1–2 sentences), Methodology & Sample (1–2 sentences), Key Findings with core statistics (2–3 sentences), and Conclusion/Implication (1–2 sentences).',
          'Limitations should distinguish methodological constraints (e.g., cross-sectional design, non-probability sample) from researcher constraints (time/budget).',
          'Always explain how each limitation affects interpretation and what measures were taken to minimise its impact.',
        ],
      },
    ],
  },
  {
    id: 'questions',
    badge: 'Part 2',
    title: 'Research Questions, Hypotheses & Variables',
    subtitle: 'Descriptive, comparative, and relationship-based questions paired with operational variables.',
    overview:
      'Quantitative research questions translate your literature gap into measurable empirical tests. Every question directly determines your research design, sampling requirements, and statistical test in StatAssist AI.',
    subsections: [
      {
        id: 'rq-types',
        title: 'Three Core Types of Quantitative Research Questions',
        summary:
          'Empirical quantitative questions fall into three structured families—each corresponding to distinct statistical procedures.',
        keyPoints: [
          'Descriptive Research Questions: Quantify how much, how often, or what proportion exists in a sample (e.g., "What is the average weekly study duration among first-year engineering students?").',
          'Comparative Research Questions: Examine differences between two or more groups or timepoints on one or more dependent variables (e.g., "Is there a statistically significant difference in exam performance between mindfulness-trained and control students?").',
          'Relationship-Based Research Questions: Evaluate associations, correlations, or predictive trends among two or more variables (e.g., "To what extent do study hours and self-efficacy predict final course grades?").',
        ],
        recommendedTest: 'independent_ttest',
        recommendedTestLabel: 'Try Comparative t-Test in StatAssist AI',
      },
      {
        id: 'rq-hypotheses',
        title: 'Formulating Null (H₀) and Alternative (H₁) Hypotheses',
        summary:
          'Inferential statistical tests formally evaluate the null hypothesis of no difference or no relationship against a theoretically grounded alternative hypothesis.',
        keyPoints: [
          'Null Hypothesis (H₀): States no statistically significant difference, effect, or association exists in the population (e.g., μ₁ = μ₂ or r = 0).',
          'Non-Directional Alternative (H₁): Predicts a difference or relationship without specifying direction (two-tailed test, e.g., μ₁ ≠ μ₂).',
          'Directional Alternative (H₁): Predicts a specific direction supported by strong prior theory (one-tailed test, e.g., μ₁ > μ₂).',
          'Keep every hypothesis tightly aligned with a single measurable dependent variable and clear statistical test.',
        ],
      },
      {
        id: 'rq-constructs-variables',
        title: 'Constructs, Operationalisation & Levels of Measurement',
        summary:
          'Abstract concepts (constructs like "academic resilience" or "job satisfaction") must be operationalised into concrete, measurable variables.',
        keyPoints: [
          'Independent Variable (IV): Manipulated treatment or grouping factor presumed to influence an outcome.',
          'Dependent Variable (DV): Measured outcome variable expected to vary as a function of the IV.',
          'Covariates, Mediators & Moderators: Covariates control baseline variance (ANCOVA); mediators explain how/why an effect occurs; moderators change the strength or direction of an effect.',
          'Measurement Scales: Nominal (unordered categories), Ordinal (ranked categories), Interval (equal intervals, arbitrary zero), and Ratio (equal intervals, true zero).',
        ],
        recommendedTest: 'cronbach_alpha',
        recommendedTestLabel: 'Check Scale Reliability (Cronbach’s α)',
      },
    ],
  },
  {
    id: 'literature',
    badge: 'Part 3',
    title: 'Literature Review & Conceptual Frameworks',
    subtitle: 'Critical synthesis, theoretical grounding, and establishing your empirical research gap.',
    overview:
      'A high-scoring literature review moves far beyond summarising individual papers. It critically compares competing studies, evaluates methodological quality, builds a conceptual model, and logically motivates your research questions.',
    subsections: [
      {
        id: 'lit-synthesis',
        title: 'Moving From Summary to Critical Synthesis',
        summary:
          'Organise Chapter 2 around themes, debates, and methodological patterns rather than an author-by-author annotated list.',
        keyPoints: [
          'Thematic Organisation: Group studies by shared constructs, mechanisms, or competing findings.',
          'Methodological Critique: Compare sample sizes, measurement instruments, research designs, and statistical controls across studies.',
          'Identify Contradictions & Gaps: Highlight under-studied populations, inconsistent findings, or missing covariates/mediators.',
          'Funnel Structure: Progress from broad disciplinary context to specific constructs, culminating directly in your research questions.',
        ],
        writeUpTemplate:
          'Although prior studies consistently link [Predictor X] to [Outcome Y] (Author, 2022; Author, 2024), most investigations relied on cross-sectional convenience samples and omitted [Baseline Covariate Z]. Consequently, the extent to which [Predictor X] independently accounts for variance in [Outcome Y] among [Target Population] remains under-examined.',
      },
      {
        id: 'lit-frameworks',
        title: 'Theoretical vs. Conceptual Frameworks',
        summary:
          'Clarifying how established theory informs your operational model demonstrates postgraduate-level rigour.',
        keyPoints: [
          'Theoretical Framework: Anchors your study in one or more established grand or mid-range theories (e.g., Self-Determination Theory, Technology Acceptance Model).',
          'Conceptual Framework: Maps the specific variables, directional arrows, covariates, and hypotheses tested in your own empirical study.',
          'Ensure every construct shown in your conceptual diagram appears in both your measurement instrument and Chapter 4 analysis.',
        ],
        recommendedTest: 'structural_equation_modeling',
        recommendedTestLabel: 'Explore Path / SEM Modeling',
      },
    ],
  },
  {
    id: 'strategy',
    badge: 'Part 4',
    title: 'Research Strategy & Research Designs',
    subtitle: 'Paradigms, quantitative/qualitative/mixed designs, methods, and validity threats.',
    overview:
      'Chapter 3 (Research Strategy / Methodology) justifies every design decision from philosophical paradigm down to data collection tools. StatAssist AI structures methodology decisions around alignment: Paradigm → Design → Sampling → Methods → Analysis → Ethics.',
    subsections: [
      {
        id: 'strat-paradigms',
        title: 'Research Paradigms & Reasoning Approaches',
        summary:
          'Your research paradigm defines assumptions about reality (ontology) and valid knowledge (epistemology).',
        keyPoints: [
          'Positivism / Post-Positivism: Emphasises objective measurement, hypothesis testing, deductive reasoning, and statistical generalisability (typical for quantitative dissertations).',
          'Interpretivism / Constructivism: Explores subjective meanings, lived experiences, and inductive theory building (typical for qualitative dissertations).',
          'Pragmatism: Prioritises the research problem, combining quantitative breadth with qualitative depth in mixed-methods studies.',
        ],
      },
      {
        id: 'strat-quant-designs',
        title: 'Four Quantitative Research Designs',
        summary:
          'Quantitative designs are chosen based on whether variables are manipulated, whether random assignment is used, and whether the goal is description, group comparison, or prediction.',
        keyPoints: [
          'Descriptive Design: Measures variables as they naturally occur without manipulation to profile prevalence, means, or distributions.',
          'Experimental Design: Manipulates an independent variable and randomly assigns participants to treatment vs. control conditions to establish strong causal inference.',
          'Quasi-Experimental Design: Compares intervention and comparison groups when random assignment is impractical (e.g., intact classrooms or clinics), often controlling baseline scores via ANCOVA.',
          'Relationship-Based Design: Examines naturally occurring associations or predictive models among continuous/categorical variables (correlational, multiple regression, logistic regression, CFA/SEM).',
        ],
        recommendedTest: 'ancova',
        recommendedTestLabel: 'Launch ANCOVA Quasi-Experimental Preset',
      },
      {
        id: 'strat-qual-mixed',
        title: 'Qualitative, Mixed-Methods & Validity Safeguards',
        summary:
          'Recognising threats to internal and external validity helps you defend your design choices in Chapter 3 and Chapter 5.',
        keyPoints: [
          'Qualitative Approaches: Case Study (in-depth bounded system), Phenomenology (lived experience), Grounded Theory (inductive theory generation), and Ethnography (cultural immersion).',
          'Mixed-Methods Sequencing: Convergent Parallel (QUAN + QUAL simultaneously), Explanatory Sequential (QUAN → QUAL follow-up), and Exploratory Sequential (QUAL → QUAN instrument build).',
          'Internal Validity Threats: History, maturation, selection bias, attrition/mortality, instrumentation drift, and regression to the mean.',
          'External Validity & Reliability: Generalisability across populations/settings, plus scale internal consistency (Cronbach’s α ≥ .70) and construct validity (EFA/CFA).',
        ],
        recommendedTest: 'exploratory_factor_analysis',
        recommendedTestLabel: 'Test Construct Validity (EFA)',
      },
    ],
  },
  {
    id: 'sampling',
    badge: 'Part 5',
    title: 'Sampling Strategy & Sample Size',
    subtitle: 'Populations, sampling frames, probability vs. non-probability techniques, and bias control.',
    overview:
      'Your sampling strategy specifies how units (individuals, organisations, or records) are selected from the target population. Justify your chosen technique honestly in light of both statistical ideals and real-world access constraints.',
    subsections: [
      {
        id: 'samp-fundamentals',
        title: 'Population, Sampling Frame & Sampling Bias',
        summary:
          'Precision in defining who is eligible—and how they are reached—prevents hidden bias in statistical estimates.',
        keyPoints: [
          'Population (N): The complete group of units to which you wish to generalise findings.',
          'Sampling Frame: The concrete operational list of population members from which the sample is actually drawn (e.g., university registry, clinic roster).',
          'Sample (n): The subset of units selected for measurement and analysis.',
          'Sampling Bias: Systematic distortion occurring when some population members have a higher or zero probability of selection (e.g., self-selection bias, non-response bias, undercoverage).',
        ],
      },
      {
        id: 'samp-prob-vs-nonprob',
        title: 'Probability vs. Non-Probability Sampling Decisions',
        summary:
          'Use the interactive Sampling Explorer below to compare all 11 probability and non-probability methods and estimate your target sample size.',
        keyPoints: [
          'Probability Sampling: Every unit has a known, non-zero chance of selection via randomisation; enables formal statistical inference and confidence intervals.',
          'Non-Probability Sampling: Selection relies on researcher judgement, convenience, or quotas; widely used when a full sampling frame does not exist or resources are limited.',
          'Transparency Rule: If using non-probability sampling in a quantitative study, explicitly acknowledge limits to statistical generalisation and focus on analytical insight.',
        ],
        writeUpTemplate:
          'Given the absence of a comprehensive national sampling frame and institutional access constraints, this study employed [Sampling Technique] to recruit n = [Sample Size] participants meeting predefined inclusion criteria. While non-probability selection limits direct statistical generalisation to the broader population, demographic balance and power analysis were monitored to strengthen empirical robustness.',
      },
    ],
  },
  {
    id: 'ethics',
    badge: 'Part 6',
    title: 'Research Ethics & Institutional Governance',
    subtitle: 'Five foundational ethical principles, consent documentation, and IRB/REC procedures.',
    overview:
      'Research ethics is integral to every stage of a dissertation—not an afterthought. Ethical safeguards must match your specific research design, participant vulnerability, data sensitivity, and storage practices.',
    subsections: [
      {
        id: 'eth-principles',
        title: 'The Five Core Principles of Research Ethics',
        summary:
          'Every empirical dissertation involving human participants or sensitive data should explicitly address these five principles.',
        keyPoints: [
          '1. Minimising the Risk of Harm (Non-Malfeasance): Prevent physical, psychological, emotional, social, or reputational harm; provide debriefing or support contacts if sensitive topics arise.',
          '2. Obtaining Informed Consent: Clearly explain study purpose, procedures, duration, risks, benefits, data usage, and researcher contact details before participation.',
          '3. Protecting Anonymity & Confidentiality: Remove direct identifiers where possible (anonymity) or store pseudonymous codes securely separate from raw responses (confidentiality).',
          '4. Avoiding Deceptive Practices: Be transparent about study aims; if covert or partial disclosure is methodologically unavoidable, secure formal ethics board approval and conduct full post-study debriefing.',
          '5. Providing the Right to Withdraw: Guarantee participants may decline to answer or withdraw at any stage—without penalty—up to the point of data anonymisation/aggregation.',
        ],
      },
      {
        id: 'eth-governance',
        title: 'Ethics Review Boards, Gatekeepers & Data Protection',
        summary:
          'Documenting formal ethical approval and secure data governance protects both participants and your institution.',
        keyPoints: [
          'Institutional Approval: Obtain formal IRB / Research Ethics Committee approval prior to recruiting a single participant or collecting primary data.',
          'Gatekeeper Permissions: Secure written organisational permission before surveying employees, students, or patients.',
          'Data Storage & Retention: Store encrypted electronic datasets on password-protected institutional drives and state your retention/destruction timeline.',
        ],
      },
    ],
  },
  {
    id: 'writing',
    badge: 'Part 7',
    title: 'Data Analysis & Writing Up Your Dissertation',
    subtitle: 'Screening data, matching StatAssist AI analyses, APA 7th Results, and Discussion mastery.',
    overview:
      'Transforming raw datasets into publication-ready Results and Discussion chapters requires rigorous data screening, assumption auditing, disciplined APA 7th reporting, and thoughtful scholarly interpretation.',
    subsections: [
      {
        id: 'wr-data-prep',
        title: 'Data Preparation & Assumption Auditing Workflow',
        summary:
          'Before running inferential tests, screen your dataset systematically so statistical outputs remain trustworthy.',
        keyPoints: [
          'Inspect missing values, out-of-range codes, duplicate records, and reverse-scored Likert items.',
          'Verify distributional normality (Shapiro-Wilk p > .05, skewness/kurtosis within ±2) and homogeneity of variance (Levene’s test p > .05).',
          'Select robust alternatives automatically when assumptions fail (Welch’s t-test, Mann-Whitney U, Wilcoxon Signed-Rank, Kruskal-Wallis H, Spearman’s ρ).',
          'Always report exact sample sizes (N, n), descriptive statistics (M, SD or Mdn, IQR), test statistics, exact p-values, effect sizes (d, η², R²), and 95% confidence intervals.',
        ],
        recommendedTest: 'descriptive',
        recommendedTestLabel: 'Run Descriptive Screening in StatAssist AI',
      },
      {
        id: 'wr-results-discussion',
        title: 'Structuring Chapter 4 (Results) & Chapter 5 (Discussion)',
        summary:
          'Keep Chapter 4 strictly objective and data-driven; reserve theoretical interpretation and practical recommendations for Chapter 5.',
        keyPoints: [
          'Chapter 4 Sequence: Sample Demographics → Data Screening & Reliability (α) → Assumption Diagnostics → Hypothesis-by-Hypothesis Inferential Findings with APA 7th Tables.',
          'APA 7th Discipline: Italicise Latin symbols (M, SD, t, F, p, r, d, R²), omit leading zeros on bounded metrics (p = .014, r = .48), report p < .001 (never .000), and bracket 95% CIs [LL, UL].',
          'Chapter 5 Sequence: Restate Key Findings → Compare & Contrast with Chapter 2 Literature → Theoretical Contributions → Practical/Policy Implications → Methodological Limitations → Future Research & Final Conclusion.',
        ],
        recommendedTest: 'regression',
        recommendedTestLabel: 'Launch Multiple Regression Analysis',
      },
    ],
  },
];

export const SAMPLING_TECHNIQUES: SamplingTechniqueInfo[] = [
  {
    id: 'simple-random',
    name: 'Simple Random Sampling',
    family: 'probability',
    bestFor: 'Homogeneous populations with a complete, accessible sampling frame.',
    howItWorks: 'Every unit in the sampling frame receives a unique ID and is drawn completely at random using a random number generator.',
    strengths: [
      'Unbiased representation of the target population.',
      'Direct foundation for parametric inferential statistics and confidence intervals.',
    ],
    limitations: [
      'Requires an accurate, exhaustive list of every member in the population.',
      'Can be costly or logistically slow for geographically dispersed populations.',
    ],
    justificationSnippet:
      'Simple random sampling was selected because a complete institutional registry was available, giving every eligible participant an equal and independent probability of inclusion.',
  },
  {
    id: 'systematic',
    name: 'Systematic Sampling',
    family: 'probability',
    bestFor: 'Ordered sampling frames (e.g., clinic intake logs, customer lists) without cyclical periodicity.',
    howItWorks: 'Choose a random starting point between 1 and k (where k = N / n), then select every k-th unit across the ordered list.',
    strengths: [
      'Fast and operationally simple to execute across large lists.',
      'Ensures even coverage across the entire ordering of the sampling frame.',
    ],
    limitations: [
      'Risk of hidden bias if the list has a periodic pattern matching interval k.',
    ],
    justificationSnippet:
      'Systematic random sampling (every k-th record from a random start) ensured evenly distributed population coverage across the chronological registry.',
  },
  {
    id: 'stratified',
    name: 'Stratified Random Sampling',
    family: 'probability',
    bestFor: 'Populations with key subgroups (strata such as year level, gender, or clinic site) that must be proportionally represented.',
    howItWorks: 'Partition the population into mutually exclusive strata, then perform simple random sampling within each stratum proportionally or disproportionately.',
    strengths: [
      'Guarantees sufficient representation of smaller minority subgroups for comparative analysis.',
      'Reduces sampling error compared with simple random sampling of the same size.',
    ],
    limitations: [
      'Requires prior knowledge of stratum membership for every unit in the sampling frame.',
    ],
    justificationSnippet:
      'Proportionate stratified random sampling was applied across [Strata Variable] to preserve population subgroup proportions and lower sampling variance.',
  },
  {
    id: 'cluster',
    name: 'Cluster Sampling',
    family: 'probability',
    bestFor: 'Large, geographically spread populations grouped naturally into clusters (schools, wards, branches).',
    howItWorks: 'Randomly select entire clusters rather than individuals, then include all units (one-stage) or a random sample (two-stage) within chosen clusters.',
    strengths: [
      'Dramatically lowers travel, time, and administrative costs.',
      'Only requires lists of individuals inside the selected clusters.',
    ],
    limitations: [
      'Higher sampling error if units within a cluster are very similar (intra-cluster correlation).',
    ],
    justificationSnippet:
      'Cluster random sampling of intact [Clusters, e.g., schools] enabled feasible field data collection across a geographically dispersed population.',
  },
  {
    id: 'multi-stage',
    name: 'Multi-Stage Sampling',
    family: 'probability',
    bestFor: 'National or multi-regional surveys combining cluster and stratified stages.',
    howItWorks: 'Randomly select progressively smaller geographic or organisational units across two or more nested stages (e.g., regions → districts → schools → students).',
    strengths: [
      'Practical for massive populations where no single individual-level frame exists.',
    ],
    limitations: [
      'Complex variance estimation and larger sample size requirements.',
    ],
    justificationSnippet:
      'A multi-stage probability sampling hierarchy sequentially sampled [Regions], [Institutions], and [Participants] to balance national reach with fieldwork feasibility.',
  },
  {
    id: 'purposive',
    name: 'Purposive (Judgemental) Sampling',
    family: 'non-probability',
    bestFor: 'Targeting information-rich cases, specific clinical/professional criteria, or expert informants.',
    howItWorks: 'Researcher deliberately selects participants meeting explicit theoretical or inclusion criteria (e.g., homogeneous, maximum variation, expert, or critical case).',
    strengths: [
      'Maximises relevance when studying specialised groups or rare phenomena.',
      'Supports deep analytical insight in qualitative and targeted mixed-methods designs.',
    ],
    limitations: [
      'Prone to researcher selection bias and cannot support strict statistical generalisation.',
    ],
    justificationSnippet:
      'Purposive sampling recruited participants meeting strict domain criteria ([Criteria]) to obtain rich, directly relevant empirical evidence.',
  },
  {
    id: 'convenience',
    name: 'Convenience Sampling',
    family: 'non-probability',
    bestFor: 'Pilot studies, exploratory research, or constrained academic timelines with accessible cohorts.',
    howItWorks: 'Recruit participants who are most readily accessible and willing to participate (e.g., available university classes or online panels).',
    strengths: [
      'Low cost, rapid recruitment, and minimal logistical barriers.',
    ],
    limitations: [
      'High risk of selection bias and limited external validity.',
    ],
    justificationSnippet:
      'Convenience sampling was utilised to achieve an adequate sample size within dissertation timeframe constraints; findings are interpreted cautiously without claiming population-wide generalisability.',
  },
  {
    id: 'quota',
    name: 'Quota Sampling',
    family: 'non-probability',
    bestFor: 'Ensuring fixed subgroup counts (e.g., 50% urban, 50% rural) without a random sampling frame.',
    howItWorks: 'Set numerical targets for key demographic strata and recruit non-randomly until each subgroup quota is filled.',
    strengths: [
      'Guarantees balanced group sizes for comparative analyses (e.g., t-tests or ANOVA).',
    ],
    limitations: [
      'Selection within each quota remains non-random, risking within-stratum bias.',
    ],
    justificationSnippet:
      'Quota sampling established balanced subgroup allocations across [Grouping Factor] to ensure adequate statistical power for comparative tests.',
  },
  {
    id: 'snowball',
    name: 'Snowball (Chain-Referral) Sampling',
    family: 'non-probability',
    bestFor: 'Hard-to-reach, hidden, or tightly networked populations lacking public directories.',
    howItWorks: 'Initial seed participants refer eligible peers from their social or professional networks until target sample size or saturation is reached.',
    strengths: [
      'Enables access to populations otherwise unreachable via formal frames.',
    ],
    limitations: [
      'Network homophily may over-represent tightly connected subgroups.',
    ],
    justificationSnippet:
      'Snowball sampling facilitated access to a hard-to-reach population via peer referrals initiated from diverse seed contacts to mitigate network homogeneity.',
  },
  {
    id: 'self-selection',
    name: 'Self-Selection (Volunteer) Sampling',
    family: 'non-probability',
    bestFor: 'Online surveys, behavioural experiments, or open community calls where respondents opt in.',
    howItWorks: 'Publicise the study via announcements or invitations; interested individuals voluntarily choose to participate.',
    strengths: [
      'Participants are often motivated and willing to complete detailed instruments.',
    ],
    limitations: [
      'Volunteer bias: respondents with strong opinions may differ systematically from non-respondents.',
    ],
    justificationSnippet:
      'Volunteer self-selection via institutional invitations enabled ethical, low-pressure recruitment while noting potential self-selection bias in Chapter 5.',
  },
  {
    id: 'total-population',
    name: 'Total Population Sampling',
    family: 'non-probability',
    bestFor: 'Small, clearly bounded populations (e.g., all 45 ICU nurses in a single hospital or all 30 specialist firms).',
    howItWorks: 'Invite every single eligible member of the entire target population to participate.',
    strengths: [
      'Eliminates sampling error caused by selecting a subset when response rates are high.',
    ],
    limitations: [
      'Only feasible when total population size N is relatively small and completely identifiable.',
    ],
    justificationSnippet:
      'Because the entire eligible population consisted of N = [Total N] members, total population sampling was adopted to capture comprehensive coverage.',
  },
];

export const DISSERTATION_QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    question:
      'A researcher wants to know whether mean exam scores differ across three distinct teaching methods without controlling for any covariates. Which quantitative RQ type and statistical test fit best?',
    options: [
      'Descriptive RQ → Descriptive Statistics',
      'Comparative RQ → One-Way ANOVA',
      'Relationship-Based RQ → Pearson Correlation',
      'Comparative RQ → Paired-Samples t-Test',
    ],
    correctIndex: 1,
    explanation:
      'Comparing mean scores across three independent groups is a Comparative research question addressed by One-Way ANOVA (or Kruskal-Wallis H if normality is violated).',
  },
  {
    id: 'q2',
    question:
      'Which sampling method divides the target population into key demographic subgroups first and then randomly samples from each subgroup?',
    options: [
      'Quota Sampling',
      'Purposive Sampling',
      'Stratified Random Sampling',
      'Snowball Sampling',
    ],
    correctIndex: 2,
    explanation:
      'Stratified random sampling is a probability technique that splits the sampling frame into strata and uses random selection within each stratum, unlike quota sampling (which is non-random).',
  },
  {
    id: 'q3',
    question:
      'Which of the following is NOT one of the five core ethical principles for dissertation research?',
    options: [
      'Minimising the risk of harm',
      'Obtaining informed consent',
      'Guaranteeing statistically significant p < .05 results',
      'Providing the right to withdraw',
    ],
    correctIndex: 2,
    explanation:
      'Ethical research requires honest, objective reporting regardless of statistical significance; pressuring or altering analyses to force p < .05 violates research integrity.',
  },
  {
    id: 'q4',
    question:
      'When random assignment to treatment and control groups is impossible (e.g., intact classrooms), which quantitative research design is being used?',
    options: [
      'True Experimental Design',
      'Quasi-Experimental Design',
      'Descriptive Design',
      'Ethnographic Design',
    ],
    correctIndex: 1,
    explanation:
      'Quasi-experimental designs compare intervention and comparison groups without random assignment, often using baseline covariates (ANCOVA) to strengthen internal validity.',
  },
];
