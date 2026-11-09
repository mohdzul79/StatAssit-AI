import { Dataset, StatisticalTestType, ResearchQuestion } from '../types/stats';
import { refreshDatasetMetadata } from '../utils/datasetEditor';
import { EXTENDED_STUDY_CONFIGS } from './extendedTestSpecificDatasets';

export interface TestSpecificStudyConfig {
  dataset: Dataset;
  recommendedDv?: string;
  recommendedIv?: string;
  recommendedGroup1?: string;
  recommendedGroup2?: string;
  recommendedSecondVar?: string;
  recommendedMultiVars?: string[];
  recommendedFactorB?: string;
  recommendedCovariate?: string;
  recommendedTestValue?: number;
  correlationMethod?: 'pearson' | 'spearman';
  alphaLevel?: number;
  researchQuestion: ResearchQuestion;
  explanation: string;
}

// 1. Independent-Samples t-Test
const INDEPENDENT_T_DATA: Record<string, any>[] = [
  { Student_ID: 'S101', Treatment_Group: 'Mindfulness', Exam_Score: 88.5, Anxiety_Score: 18.0, Study_Hours: 19.5 },
  { Student_ID: 'S102', Treatment_Group: 'Control', Exam_Score: 65.0, Anxiety_Score: 39.5, Study_Hours: 12.0 },
  { Student_ID: 'S103', Treatment_Group: 'Mindfulness', Exam_Score: 82.0, Anxiety_Score: 22.5, Study_Hours: 17.0 },
  { Student_ID: 'S104', Treatment_Group: 'Control', Exam_Score: 59.5, Anxiety_Score: 44.0, Study_Hours: 10.5 },
  { Student_ID: 'S105', Treatment_Group: 'Mindfulness', Exam_Score: 91.0, Anxiety_Score: 16.5, Study_Hours: 21.0 },
  { Student_ID: 'S106', Treatment_Group: 'Control', Exam_Score: 71.0, Anxiety_Score: 35.0, Study_Hours: 14.5 },
  { Student_ID: 'S107', Treatment_Group: 'Mindfulness', Exam_Score: 84.5, Anxiety_Score: 20.0, Study_Hours: 18.0 },
  { Student_ID: 'S108', Treatment_Group: 'Control', Exam_Score: 62.5, Anxiety_Score: 42.0, Study_Hours: 11.5 },
  { Student_ID: 'S109', Treatment_Group: 'Mindfulness', Exam_Score: 89.0, Anxiety_Score: 17.5, Study_Hours: 20.5 },
  { Student_ID: 'S110', Treatment_Group: 'Control', Exam_Score: 68.0, Anxiety_Score: 37.0, Study_Hours: 13.0 },
  { Student_ID: 'S111', Treatment_Group: 'Mindfulness', Exam_Score: 86.0, Anxiety_Score: 19.0, Study_Hours: 18.5 },
  { Student_ID: 'S112', Treatment_Group: 'Control', Exam_Score: 57.0, Anxiety_Score: 46.5, Study_Hours: 9.5 },
  { Student_ID: 'S113', Treatment_Group: 'Mindfulness', Exam_Score: 93.5, Anxiety_Score: 15.0, Study_Hours: 22.0 },
  { Student_ID: 'S114', Treatment_Group: 'Control', Exam_Score: 70.0, Anxiety_Score: 36.5, Study_Hours: 15.0 },
  { Student_ID: 'S115', Treatment_Group: 'Mindfulness', Exam_Score: 80.5, Anxiety_Score: 23.0, Study_Hours: 16.5 },
  { Student_ID: 'S116', Treatment_Group: 'Control', Exam_Score: 64.0, Anxiety_Score: 40.0, Study_Hours: 12.5 },
  { Student_ID: 'S117', Treatment_Group: 'Mindfulness', Exam_Score: 87.5, Anxiety_Score: 18.5, Study_Hours: 19.0 },
  { Student_ID: 'S118', Treatment_Group: 'Control', Exam_Score: 66.5, Anxiety_Score: 38.0, Study_Hours: 13.5 },
  { Student_ID: 'S119', Treatment_Group: 'Mindfulness', Exam_Score: 85.0, Anxiety_Score: 21.0, Study_Hours: 17.5 },
  { Student_ID: 'S120', Treatment_Group: 'Control', Exam_Score: 61.0, Anxiety_Score: 43.5, Study_Hours: 11.0 },
  { Student_ID: 'S121', Treatment_Group: 'Mindfulness', Exam_Score: 90.0, Anxiety_Score: 17.0, Study_Hours: 20.0 },
  { Student_ID: 'S122', Treatment_Group: 'Control', Exam_Score: 69.5, Anxiety_Score: 36.0, Study_Hours: 14.0 },
  { Student_ID: 'S123', Treatment_Group: 'Mindfulness', Exam_Score: 83.0, Anxiety_Score: 22.0, Study_Hours: 16.0 },
  { Student_ID: 'S124', Treatment_Group: 'Control', Exam_Score: 58.5, Anxiety_Score: 45.0, Study_Hours: 10.0 },
  { Student_ID: 'S125', Treatment_Group: 'Mindfulness', Exam_Score: 92.0, Anxiety_Score: 16.0, Study_Hours: 21.5 },
  { Student_ID: 'S126', Treatment_Group: 'Control', Exam_Score: 67.0, Anxiety_Score: 38.5, Study_Hours: 13.0 },
  { Student_ID: 'S127', Treatment_Group: 'Mindfulness', Exam_Score: 81.5, Anxiety_Score: 23.5, Study_Hours: 16.5 },
  { Student_ID: 'S128', Treatment_Group: 'Control', Exam_Score: 63.5, Anxiety_Score: 41.0, Study_Hours: 12.0 },
  { Student_ID: 'S129', Treatment_Group: 'Mindfulness', Exam_Score: 88.0, Anxiety_Score: 19.5, Study_Hours: 19.0 },
  { Student_ID: 'S130', Treatment_Group: 'Control', Exam_Score: 72.5, Anxiety_Score: 34.0, Study_Hours: 15.5 },
];

// 2. Paired-Samples t-Test (Pre vs. Post)
const PAIRED_T_DATA: Record<string, any>[] = [
  { Patient_ID: 'P201', Pre_CBT_BDI_Score: 32.0, Post_CBT_BDI_Score: 14.5, Age: 42, Therapy_Sessions: 12 },
  { Patient_ID: 'P202', Pre_CBT_BDI_Score: 28.5, Post_CBT_BDI_Score: 16.0, Age: 36, Therapy_Sessions: 11 },
  { Patient_ID: 'P203', Pre_CBT_BDI_Score: 35.0, Post_CBT_BDI_Score: 18.5, Age: 49, Therapy_Sessions: 12 },
  { Patient_ID: 'P204', Pre_CBT_BDI_Score: 24.0, Post_CBT_BDI_Score: 11.0, Age: 29, Therapy_Sessions: 10 },
  { Patient_ID: 'P205', Pre_CBT_BDI_Score: 30.5, Post_CBT_BDI_Score: 15.5, Age: 44, Therapy_Sessions: 12 },
  { Patient_ID: 'P206', Pre_CBT_BDI_Score: 27.0, Post_CBT_BDI_Score: 13.0, Age: 38, Therapy_Sessions: 11 },
  { Patient_ID: 'P207', Pre_CBT_BDI_Score: 36.5, Post_CBT_BDI_Score: 20.0, Age: 53, Therapy_Sessions: 12 },
  { Patient_ID: 'P208', Pre_CBT_BDI_Score: 26.0, Post_CBT_BDI_Score: 12.5, Age: 31, Therapy_Sessions: 10 },
  { Patient_ID: 'P209', Pre_CBT_BDI_Score: 33.0, Post_CBT_BDI_Score: 17.0, Age: 46, Therapy_Sessions: 12 },
  { Patient_ID: 'P210', Pre_CBT_BDI_Score: 29.0, Post_CBT_BDI_Score: 14.0, Age: 35, Therapy_Sessions: 11 },
  { Patient_ID: 'P211', Pre_CBT_BDI_Score: 34.5, Post_CBT_BDI_Score: 19.0, Age: 50, Therapy_Sessions: 12 },
  { Patient_ID: 'P212', Pre_CBT_BDI_Score: 25.5, Post_CBT_BDI_Score: 11.5, Age: 30, Therapy_Sessions: 10 },
  { Patient_ID: 'P213', Pre_CBT_BDI_Score: 31.0, Post_CBT_BDI_Score: 16.5, Age: 43, Therapy_Sessions: 12 },
  { Patient_ID: 'P214', Pre_CBT_BDI_Score: 28.0, Post_CBT_BDI_Score: 13.5, Age: 37, Therapy_Sessions: 11 },
  { Patient_ID: 'P215', Pre_CBT_BDI_Score: 37.0, Post_CBT_BDI_Score: 21.0, Age: 55, Therapy_Sessions: 12 },
  { Patient_ID: 'P216', Pre_CBT_BDI_Score: 23.5, Post_CBT_BDI_Score: 10.0, Age: 27, Therapy_Sessions: 10 },
  { Patient_ID: 'P217', Pre_CBT_BDI_Score: 32.5, Post_CBT_BDI_Score: 15.0, Age: 45, Therapy_Sessions: 12 },
  { Patient_ID: 'P218', Pre_CBT_BDI_Score: 27.5, Post_CBT_BDI_Score: 12.0, Age: 34, Therapy_Sessions: 11 },
  { Patient_ID: 'P219', Pre_CBT_BDI_Score: 35.5, Post_CBT_BDI_Score: 18.0, Age: 51, Therapy_Sessions: 12 },
  { Patient_ID: 'P220', Pre_CBT_BDI_Score: 26.5, Post_CBT_BDI_Score: 13.0, Age: 32, Therapy_Sessions: 10 },
  { Patient_ID: 'P221', Pre_CBT_BDI_Score: 30.0, Post_CBT_BDI_Score: 14.5, Age: 41, Therapy_Sessions: 12 },
  { Patient_ID: 'P222', Pre_CBT_BDI_Score: 29.5, Post_CBT_BDI_Score: 15.0, Age: 39, Therapy_Sessions: 11 },
  { Patient_ID: 'P223', Pre_CBT_BDI_Score: 33.5, Post_CBT_BDI_Score: 17.5, Age: 47, Therapy_Sessions: 12 },
  { Patient_ID: 'P224', Pre_CBT_BDI_Score: 25.0, Post_CBT_BDI_Score: 11.0, Age: 28, Therapy_Sessions: 10 },
  { Patient_ID: 'P225', Pre_CBT_BDI_Score: 36.0, Post_CBT_BDI_Score: 19.5, Age: 52, Therapy_Sessions: 12 },
];

// 3. One-Way Between-Subjects ANOVA (3 Groups)
const ANOVA_DATA: Record<string, any>[] = [
  { Participant_ID: 'A301', Exercise_Protocol: 'HIIT_Interval', Stroop_RT_ms: 485.0, VO2_Max: 44.5 },
  { Participant_ID: 'A302', Exercise_Protocol: 'HIIT_Interval', Stroop_RT_ms: 510.0, VO2_Max: 46.0 },
  { Participant_ID: 'A303', Exercise_Protocol: 'HIIT_Interval', Stroop_RT_ms: 495.0, VO2_Max: 43.0 },
  { Participant_ID: 'A304', Exercise_Protocol: 'HIIT_Interval', Stroop_RT_ms: 530.0, VO2_Max: 42.5 },
  { Participant_ID: 'A305', Exercise_Protocol: 'HIIT_Interval', Stroop_RT_ms: 475.0, VO2_Max: 47.0 },
  { Participant_ID: 'A306', Exercise_Protocol: 'HIIT_Interval', Stroop_RT_ms: 505.0, VO2_Max: 45.0 },
  { Participant_ID: 'A307', Exercise_Protocol: 'HIIT_Interval', Stroop_RT_ms: 520.0, VO2_Max: 43.5 },
  { Participant_ID: 'A308', Exercise_Protocol: 'HIIT_Interval', Stroop_RT_ms: 490.0, VO2_Max: 45.5 },
  { Participant_ID: 'A309', Exercise_Protocol: 'HIIT_Interval', Stroop_RT_ms: 515.0, VO2_Max: 44.0 },
  { Participant_ID: 'A310', Exercise_Protocol: 'HIIT_Interval', Stroop_RT_ms: 480.0, VO2_Max: 46.5 },
  { Participant_ID: 'A311', Exercise_Protocol: 'Moderate_Continuous', Stroop_RT_ms: 565.0, VO2_Max: 38.0 },
  { Participant_ID: 'A312', Exercise_Protocol: 'Moderate_Continuous', Stroop_RT_ms: 580.0, VO2_Max: 39.5 },
  { Participant_ID: 'A313', Exercise_Protocol: 'Moderate_Continuous', Stroop_RT_ms: 550.0, VO2_Max: 40.0 },
  { Participant_ID: 'A314', Exercise_Protocol: 'Moderate_Continuous', Stroop_RT_ms: 595.0, VO2_Max: 37.0 },
  { Participant_ID: 'A315', Exercise_Protocol: 'Moderate_Continuous', Stroop_RT_ms: 560.0, VO2_Max: 38.5 },
  { Participant_ID: 'A316', Exercise_Protocol: 'Moderate_Continuous', Stroop_RT_ms: 575.0, VO2_Max: 39.0 },
  { Participant_ID: 'A317', Exercise_Protocol: 'Moderate_Continuous', Stroop_RT_ms: 545.0, VO2_Max: 41.0 },
  { Participant_ID: 'A318', Exercise_Protocol: 'Moderate_Continuous', Stroop_RT_ms: 585.0, VO2_Max: 37.5 },
  { Participant_ID: 'A319', Exercise_Protocol: 'Moderate_Continuous', Stroop_RT_ms: 570.0, VO2_Max: 38.5 },
  { Participant_ID: 'A320', Exercise_Protocol: 'Moderate_Continuous', Stroop_RT_ms: 555.0, VO2_Max: 40.5 },
  { Participant_ID: 'A321', Exercise_Protocol: 'Sedentary_Control', Stroop_RT_ms: 640.0, VO2_Max: 31.0 },
  { Participant_ID: 'A322', Exercise_Protocol: 'Sedentary_Control', Stroop_RT_ms: 665.0, VO2_Max: 29.5 },
  { Participant_ID: 'A323', Exercise_Protocol: 'Sedentary_Control', Stroop_RT_ms: 630.0, VO2_Max: 32.5 },
  { Participant_ID: 'A324', Exercise_Protocol: 'Sedentary_Control', Stroop_RT_ms: 680.0, VO2_Max: 28.0 },
  { Participant_ID: 'A325', Exercise_Protocol: 'Sedentary_Control', Stroop_RT_ms: 650.0, VO2_Max: 30.5 },
  { Participant_ID: 'A326', Exercise_Protocol: 'Sedentary_Control', Stroop_RT_ms: 660.0, VO2_Max: 30.0 },
  { Participant_ID: 'A327', Exercise_Protocol: 'Sedentary_Control', Stroop_RT_ms: 625.0, VO2_Max: 33.0 },
  { Participant_ID: 'A328', Exercise_Protocol: 'Sedentary_Control', Stroop_RT_ms: 675.0, VO2_Max: 28.5 },
  { Participant_ID: 'A329', Exercise_Protocol: 'Sedentary_Control', Stroop_RT_ms: 645.0, VO2_Max: 31.5 },
  { Participant_ID: 'A330', Exercise_Protocol: 'Sedentary_Control', Stroop_RT_ms: 655.0, VO2_Max: 29.0 },
];

// 4. Two-Way Factorial ANOVA (2 x 3)
const TWO_WAY_ANOVA_DATA: Record<string, any>[] = [
  { ID: 'TW01', Sleep_Condition: 'Normal_Sleep', Caffeine_Dose: 'Placebo_0mg', Working_Memory_Score: 78.0, RT_ms: 420 },
  { ID: 'TW02', Sleep_Condition: 'Normal_Sleep', Caffeine_Dose: 'Placebo_0mg', Working_Memory_Score: 81.5, RT_ms: 405 },
  { ID: 'TW03', Sleep_Condition: 'Normal_Sleep', Caffeine_Dose: 'Placebo_0mg', Working_Memory_Score: 75.0, RT_ms: 435 },
  { ID: 'TW04', Sleep_Condition: 'Normal_Sleep', Caffeine_Dose: 'Placebo_0mg', Working_Memory_Score: 84.0, RT_ms: 395 },
  { ID: 'TW05', Sleep_Condition: 'Normal_Sleep', Caffeine_Dose: 'Low_100mg', Working_Memory_Score: 88.0, RT_ms: 360 },
  { ID: 'TW06', Sleep_Condition: 'Normal_Sleep', Caffeine_Dose: 'Low_100mg', Working_Memory_Score: 91.0, RT_ms: 345 },
  { ID: 'TW07', Sleep_Condition: 'Normal_Sleep', Caffeine_Dose: 'Low_100mg', Working_Memory_Score: 86.5, RT_ms: 370 },
  { ID: 'TW08', Sleep_Condition: 'Normal_Sleep', Caffeine_Dose: 'Low_100mg', Working_Memory_Score: 89.5, RT_ms: 350 },
  { ID: 'TW09', Sleep_Condition: 'Normal_Sleep', Caffeine_Dose: 'High_200mg', Working_Memory_Score: 92.5, RT_ms: 330 },
  { ID: 'TW10', Sleep_Condition: 'Normal_Sleep', Caffeine_Dose: 'High_200mg', Working_Memory_Score: 95.0, RT_ms: 320 },
  { ID: 'TW11', Sleep_Condition: 'Normal_Sleep', Caffeine_Dose: 'High_200mg', Working_Memory_Score: 90.0, RT_ms: 340 },
  { ID: 'TW12', Sleep_Condition: 'Normal_Sleep', Caffeine_Dose: 'High_200mg', Working_Memory_Score: 94.0, RT_ms: 325 },
  { ID: 'TW13', Sleep_Condition: 'Deprived_24h', Caffeine_Dose: 'Placebo_0mg', Working_Memory_Score: 52.0, RT_ms: 580 },
  { ID: 'TW14', Sleep_Condition: 'Deprived_24h', Caffeine_Dose: 'Placebo_0mg', Working_Memory_Score: 48.5, RT_ms: 610 },
  { ID: 'TW15', Sleep_Condition: 'Deprived_24h', Caffeine_Dose: 'Placebo_0mg', Working_Memory_Score: 55.0, RT_ms: 565 },
  { ID: 'TW16', Sleep_Condition: 'Deprived_24h', Caffeine_Dose: 'Placebo_0mg', Working_Memory_Score: 50.0, RT_ms: 595 },
  { ID: 'TW17', Sleep_Condition: 'Deprived_24h', Caffeine_Dose: 'Low_100mg', Working_Memory_Score: 68.0, RT_ms: 480 },
  { ID: 'TW18', Sleep_Condition: 'Deprived_24h', Caffeine_Dose: 'Low_100mg', Working_Memory_Score: 71.5, RT_ms: 460 },
  { ID: 'TW19', Sleep_Condition: 'Deprived_24h', Caffeine_Dose: 'Low_100mg', Working_Memory_Score: 65.0, RT_ms: 495 },
  { ID: 'TW20', Sleep_Condition: 'Deprived_24h', Caffeine_Dose: 'Low_100mg', Working_Memory_Score: 70.0, RT_ms: 470 },
  { ID: 'TW21', Sleep_Condition: 'Deprived_24h', Caffeine_Dose: 'High_200mg', Working_Memory_Score: 82.0, RT_ms: 410 },
  { ID: 'TW22', Sleep_Condition: 'Deprived_24h', Caffeine_Dose: 'High_200mg', Working_Memory_Score: 85.5, RT_ms: 395 },
  { ID: 'TW23', Sleep_Condition: 'Deprived_24h', Caffeine_Dose: 'High_200mg', Working_Memory_Score: 79.0, RT_ms: 425 },
  { ID: 'TW24', Sleep_Condition: 'Deprived_24h', Caffeine_Dose: 'High_200mg', Working_Memory_Score: 84.0, RT_ms: 400 },
];

// 5. One-Way Repeated Measures ANOVA (3 Timepoints)
const RM_ANOVA_DATA: Record<string, any>[] = [
  { Patient_ID: 'RM01', Pain_VAS_Baseline: 78.0, Pain_VAS_Month_1: 54.0, Pain_VAS_Month_3: 32.0, Mobility_Score: 45 },
  { Patient_ID: 'RM02', Pain_VAS_Baseline: 82.5, Pain_VAS_Month_1: 59.0, Pain_VAS_Month_3: 36.5, Mobility_Score: 42 },
  { Patient_ID: 'RM03', Pain_VAS_Baseline: 71.0, Pain_VAS_Month_1: 48.5, Pain_VAS_Month_3: 28.0, Mobility_Score: 50 },
  { Patient_ID: 'RM04', Pain_VAS_Baseline: 85.0, Pain_VAS_Month_1: 62.0, Pain_VAS_Month_3: 39.0, Mobility_Score: 38 },
  { Patient_ID: 'RM05', Pain_VAS_Baseline: 69.5, Pain_VAS_Month_1: 46.0, Pain_VAS_Month_3: 25.5, Mobility_Score: 53 },
  { Patient_ID: 'RM06', Pain_VAS_Baseline: 76.0, Pain_VAS_Month_1: 52.5, Pain_VAS_Month_3: 30.0, Mobility_Score: 47 },
  { Patient_ID: 'RM07', Pain_VAS_Baseline: 80.0, Pain_VAS_Month_1: 56.5, Pain_VAS_Month_3: 34.0, Mobility_Score: 44 },
  { Patient_ID: 'RM08', Pain_VAS_Baseline: 73.5, Pain_VAS_Month_1: 50.0, Pain_VAS_Month_3: 29.5, Mobility_Score: 49 },
  { Patient_ID: 'RM09', Pain_VAS_Baseline: 84.0, Pain_VAS_Month_1: 60.5, Pain_VAS_Month_3: 38.0, Mobility_Score: 40 },
  { Patient_ID: 'RM10', Pain_VAS_Baseline: 70.0, Pain_VAS_Month_1: 47.0, Pain_VAS_Month_3: 26.0, Mobility_Score: 52 },
  { Patient_ID: 'RM11', Pain_VAS_Baseline: 77.5, Pain_VAS_Month_1: 53.0, Pain_VAS_Month_3: 31.5, Mobility_Score: 46 },
  { Patient_ID: 'RM12', Pain_VAS_Baseline: 81.0, Pain_VAS_Month_1: 57.5, Pain_VAS_Month_3: 35.0, Mobility_Score: 43 },
  { Patient_ID: 'RM13', Pain_VAS_Baseline: 72.0, Pain_VAS_Month_1: 49.0, Pain_VAS_Month_3: 28.5, Mobility_Score: 51 },
  { Patient_ID: 'RM14', Pain_VAS_Baseline: 86.0, Pain_VAS_Month_1: 63.5, Pain_VAS_Month_3: 40.0, Mobility_Score: 37 },
  { Patient_ID: 'RM15', Pain_VAS_Baseline: 68.0, Pain_VAS_Month_1: 45.0, Pain_VAS_Month_3: 24.0, Mobility_Score: 55 },
  { Patient_ID: 'RM16', Pain_VAS_Baseline: 79.0, Pain_VAS_Month_1: 55.0, Pain_VAS_Month_3: 33.0, Mobility_Score: 45 },
  { Patient_ID: 'RM17', Pain_VAS_Baseline: 83.0, Pain_VAS_Month_1: 58.0, Pain_VAS_Month_3: 37.0, Mobility_Score: 41 },
  { Patient_ID: 'RM18', Pain_VAS_Baseline: 74.0, Pain_VAS_Month_1: 51.0, Pain_VAS_Month_3: 30.5, Mobility_Score: 48 },
  { Patient_ID: 'RM19', Pain_VAS_Baseline: 81.5, Pain_VAS_Month_1: 57.0, Pain_VAS_Month_3: 35.5, Mobility_Score: 42 },
  { Patient_ID: 'RM20', Pain_VAS_Baseline: 70.5, Pain_VAS_Month_1: 47.5, Pain_VAS_Month_3: 27.0, Mobility_Score: 52 },
];

// 6. ANCOVA (Covariate Control)
const ANCOVA_DATA: Record<string, any>[] = [
  { Student_ID: 'C601', Instruction_Method: 'Phonics_Intensive', Baseline_Vocab_Age: 6.8, Post_Comprehension: 88.0 },
  { Student_ID: 'C602', Instruction_Method: 'Phonics_Intensive', Baseline_Vocab_Age: 7.2, Post_Comprehension: 91.5 },
  { Student_ID: 'C603', Instruction_Method: 'Phonics_Intensive', Baseline_Vocab_Age: 6.5, Post_Comprehension: 85.0 },
  { Student_ID: 'C604', Instruction_Method: 'Phonics_Intensive', Baseline_Vocab_Age: 7.5, Post_Comprehension: 94.0 },
  { Student_ID: 'C605', Instruction_Method: 'Phonics_Intensive', Baseline_Vocab_Age: 7.0, Post_Comprehension: 89.5 },
  { Student_ID: 'C606', Instruction_Method: 'Phonics_Intensive', Baseline_Vocab_Age: 6.9, Post_Comprehension: 87.0 },
  { Student_ID: 'C607', Instruction_Method: 'Whole_Language', Baseline_Vocab_Age: 6.7, Post_Comprehension: 72.0 },
  { Student_ID: 'C608', Instruction_Method: 'Whole_Language', Baseline_Vocab_Age: 7.3, Post_Comprehension: 78.5 },
  { Student_ID: 'C609', Instruction_Method: 'Whole_Language', Baseline_Vocab_Age: 6.6, Post_Comprehension: 70.0 },
  { Student_ID: 'C610', Instruction_Method: 'Whole_Language', Baseline_Vocab_Age: 7.4, Post_Comprehension: 80.0 },
  { Student_ID: 'C611', Instruction_Method: 'Whole_Language', Baseline_Vocab_Age: 7.1, Post_Comprehension: 76.5 },
  { Student_ID: 'C612', Instruction_Method: 'Whole_Language', Baseline_Vocab_Age: 6.8, Post_Comprehension: 74.0 },
  { Student_ID: 'C613', Instruction_Method: 'Balanced_Literacy', Baseline_Vocab_Age: 6.9, Post_Comprehension: 81.0 },
  { Student_ID: 'C614', Instruction_Method: 'Balanced_Literacy', Baseline_Vocab_Age: 7.1, Post_Comprehension: 83.5 },
  { Student_ID: 'C615', Instruction_Method: 'Balanced_Literacy', Baseline_Vocab_Age: 6.5, Post_Comprehension: 77.0 },
  { Student_ID: 'C616', Instruction_Method: 'Balanced_Literacy', Baseline_Vocab_Age: 7.6, Post_Comprehension: 87.5 },
  { Student_ID: 'C617', Instruction_Method: 'Balanced_Literacy', Baseline_Vocab_Age: 7.0, Post_Comprehension: 82.0 },
  { Student_ID: 'C618', Instruction_Method: 'Balanced_Literacy', Baseline_Vocab_Age: 6.8, Post_Comprehension: 79.5 },
];

// 7. Multiple Linear Regression
const REGRESSION_DATA: Record<string, any>[] = [
  { Employee_ID: 'E701', Burnout_Index: 22.0, Weekly_Work_Hours: 38.0, Autonomy_Rating: 8.5, Sleep_Deficit_Hours: 2.0 },
  { Employee_ID: 'E702', Burnout_Index: 48.0, Weekly_Work_Hours: 52.0, Autonomy_Rating: 4.0, Sleep_Deficit_Hours: 9.5 },
  { Employee_ID: 'E703', Burnout_Index: 31.0, Weekly_Work_Hours: 42.0, Autonomy_Rating: 7.0, Sleep_Deficit_Hours: 4.5 },
  { Employee_ID: 'E704', Burnout_Index: 56.5, Weekly_Work_Hours: 58.0, Autonomy_Rating: 3.5, Sleep_Deficit_Hours: 12.0 },
  { Employee_ID: 'E705', Burnout_Index: 25.0, Weekly_Work_Hours: 40.0, Autonomy_Rating: 8.0, Sleep_Deficit_Hours: 3.0 },
  { Employee_ID: 'E706', Burnout_Index: 44.0, Weekly_Work_Hours: 49.0, Autonomy_Rating: 5.0, Sleep_Deficit_Hours: 8.0 },
  { Employee_ID: 'E707', Burnout_Index: 19.5, Weekly_Work_Hours: 36.0, Autonomy_Rating: 9.0, Sleep_Deficit_Hours: 1.5 },
  { Employee_ID: 'E708', Burnout_Index: 52.0, Weekly_Work_Hours: 55.0, Autonomy_Rating: 3.8, Sleep_Deficit_Hours: 11.0 },
  { Employee_ID: 'E709', Burnout_Index: 28.0, Weekly_Work_Hours: 41.0, Autonomy_Rating: 7.5, Sleep_Deficit_Hours: 3.5 },
  { Employee_ID: 'E710', Burnout_Index: 46.5, Weekly_Work_Hours: 51.0, Autonomy_Rating: 4.5, Sleep_Deficit_Hours: 9.0 },
  { Employee_ID: 'E711', Burnout_Index: 24.0, Weekly_Work_Hours: 39.0, Autonomy_Rating: 8.2, Sleep_Deficit_Hours: 2.5 },
  { Employee_ID: 'E712', Burnout_Index: 58.0, Weekly_Work_Hours: 60.0, Autonomy_Rating: 3.0, Sleep_Deficit_Hours: 13.5 },
  { Employee_ID: 'E713', Burnout_Index: 30.0, Weekly_Work_Hours: 43.0, Autonomy_Rating: 7.2, Sleep_Deficit_Hours: 4.0 },
  { Employee_ID: 'E714', Burnout_Index: 42.5, Weekly_Work_Hours: 48.0, Autonomy_Rating: 5.5, Sleep_Deficit_Hours: 7.5 },
  { Employee_ID: 'E715', Burnout_Index: 21.0, Weekly_Work_Hours: 37.0, Autonomy_Rating: 8.8, Sleep_Deficit_Hours: 2.0 },
  { Employee_ID: 'E716', Burnout_Index: 50.0, Weekly_Work_Hours: 54.0, Autonomy_Rating: 4.2, Sleep_Deficit_Hours: 10.0 },
  { Employee_ID: 'E717', Burnout_Index: 27.0, Weekly_Work_Hours: 40.5, Autonomy_Rating: 7.8, Sleep_Deficit_Hours: 3.0 },
  { Employee_ID: 'E718', Burnout_Index: 45.0, Weekly_Work_Hours: 50.0, Autonomy_Rating: 4.8, Sleep_Deficit_Hours: 8.5 },
  { Employee_ID: 'E719', Burnout_Index: 23.5, Weekly_Work_Hours: 38.5, Autonomy_Rating: 8.4, Sleep_Deficit_Hours: 2.5 },
  { Employee_ID: 'E720', Burnout_Index: 54.0, Weekly_Work_Hours: 56.0, Autonomy_Rating: 3.6, Sleep_Deficit_Hours: 11.5 },
];

// 8. Bivariate & Matrix Correlation
const CORRELATION_DATA: Record<string, any>[] = [
  { Subject_ID: 'B801', Salivary_Cortisol_nmol: 18.2, Anxiety_Score: 42.0, Sleep_Quality_PSQI: 11.0, Heart_Rate_Variability: 38.5 },
  { Subject_ID: 'B802', Salivary_Cortisol_nmol: 8.5, Anxiety_Score: 19.0, Sleep_Quality_PSQI: 4.0, Heart_Rate_Variability: 68.0 },
  { Subject_ID: 'B803', Salivary_Cortisol_nmol: 14.0, Anxiety_Score: 33.5, Sleep_Quality_PSQI: 8.0, Heart_Rate_Variability: 46.5 },
  { Subject_ID: 'B804', Salivary_Cortisol_nmol: 22.0, Anxiety_Score: 48.0, Sleep_Quality_PSQI: 13.5, Heart_Rate_Variability: 29.0 },
  { Subject_ID: 'B805', Salivary_Cortisol_nmol: 9.0, Anxiety_Score: 21.0, Sleep_Quality_PSQI: 5.0, Heart_Rate_Variability: 65.0 },
  { Subject_ID: 'B806', Salivary_Cortisol_nmol: 16.5, Anxiety_Score: 38.0, Sleep_Quality_PSQI: 9.5, Heart_Rate_Variability: 41.0 },
  { Subject_ID: 'B807', Salivary_Cortisol_nmol: 7.8, Anxiety_Score: 17.5, Sleep_Quality_PSQI: 3.5, Heart_Rate_Variability: 72.0 },
  { Subject_ID: 'B808', Salivary_Cortisol_nmol: 19.5, Anxiety_Score: 44.5, Sleep_Quality_PSQI: 12.0, Heart_Rate_Variability: 34.0 },
  { Subject_ID: 'B809', Salivary_Cortisol_nmol: 11.0, Anxiety_Score: 26.0, Sleep_Quality_PSQI: 6.5, Heart_Rate_Variability: 57.0 },
  { Subject_ID: 'B810', Salivary_Cortisol_nmol: 17.0, Anxiety_Score: 39.5, Sleep_Quality_PSQI: 10.0, Heart_Rate_Variability: 40.0 },
  { Subject_ID: 'B811', Salivary_Cortisol_nmol: 9.5, Anxiety_Score: 22.5, Sleep_Quality_PSQI: 5.5, Heart_Rate_Variability: 63.0 },
  { Subject_ID: 'B812', Salivary_Cortisol_nmol: 21.0, Anxiety_Score: 47.0, Sleep_Quality_PSQI: 13.0, Heart_Rate_Variability: 31.0 },
  { Subject_ID: 'B813', Salivary_Cortisol_nmol: 12.5, Anxiety_Score: 29.0, Sleep_Quality_PSQI: 7.0, Heart_Rate_Variability: 52.0 },
  { Subject_ID: 'B814', Salivary_Cortisol_nmol: 15.5, Anxiety_Score: 36.0, Sleep_Quality_PSQI: 9.0, Heart_Rate_Variability: 43.5 },
  { Subject_ID: 'B815', Salivary_Cortisol_nmol: 8.0, Anxiety_Score: 18.0, Sleep_Quality_PSQI: 4.0, Heart_Rate_Variability: 70.0 },
  { Subject_ID: 'B816', Salivary_Cortisol_nmol: 18.8, Anxiety_Score: 43.0, Sleep_Quality_PSQI: 11.5, Heart_Rate_Variability: 36.0 },
  { Subject_ID: 'B817', Salivary_Cortisol_nmol: 10.5, Anxiety_Score: 24.0, Sleep_Quality_PSQI: 6.0, Heart_Rate_Variability: 59.0 },
  { Subject_ID: 'B818', Salivary_Cortisol_nmol: 16.0, Anxiety_Score: 37.5, Sleep_Quality_PSQI: 9.0, Heart_Rate_Variability: 42.0 },
  { Subject_ID: 'B819', Salivary_Cortisol_nmol: 9.2, Anxiety_Score: 20.5, Sleep_Quality_PSQI: 4.5, Heart_Rate_Variability: 66.0 },
  { Subject_ID: 'B820', Salivary_Cortisol_nmol: 20.5, Anxiety_Score: 46.0, Sleep_Quality_PSQI: 12.5, Heart_Rate_Variability: 32.5 },
];

// 9. Chi-Square Test of Independence
const CHI_SQUARE_DATA: Record<string, any>[] = [
  { Record_ID: 'CS01', Insurance_Plan: 'Private_PPO', Screening_Compliance: 'Compliant' },
  { Record_ID: 'CS02', Insurance_Plan: 'Private_PPO', Screening_Compliance: 'Compliant' },
  { Record_ID: 'CS03', Insurance_Plan: 'Private_PPO', Screening_Compliance: 'Compliant' },
  { Record_ID: 'CS04', Insurance_Plan: 'Private_PPO', Screening_Compliance: 'Compliant' },
  { Record_ID: 'CS05', Insurance_Plan: 'Private_PPO', Screening_Compliance: 'Compliant' },
  { Record_ID: 'CS06', Insurance_Plan: 'Private_PPO', Screening_Compliance: 'Compliant' },
  { Record_ID: 'CS07', Insurance_Plan: 'Private_PPO', Screening_Compliance: 'Compliant' },
  { Record_ID: 'CS08', Insurance_Plan: 'Private_PPO', Screening_Compliance: 'Non_Compliant' },
  { Record_ID: 'CS09', Insurance_Plan: 'Private_PPO', Screening_Compliance: 'Non_Compliant' },
  { Record_ID: 'CS10', Insurance_Plan: 'Private_PPO', Screening_Compliance: 'Compliant' },
  { Record_ID: 'CS11', Insurance_Plan: 'Public_Medicare', Screening_Compliance: 'Compliant' },
  { Record_ID: 'CS12', Insurance_Plan: 'Public_Medicare', Screening_Compliance: 'Compliant' },
  { Record_ID: 'CS13', Insurance_Plan: 'Public_Medicare', Screening_Compliance: 'Compliant' },
  { Record_ID: 'CS14', Insurance_Plan: 'Public_Medicare', Screening_Compliance: 'Compliant' },
  { Record_ID: 'CS15', Insurance_Plan: 'Public_Medicare', Screening_Compliance: 'Non_Compliant' },
  { Record_ID: 'CS16', Insurance_Plan: 'Public_Medicare', Screening_Compliance: 'Non_Compliant' },
  { Record_ID: 'CS17', Insurance_Plan: 'Public_Medicare', Screening_Compliance: 'Non_Compliant' },
  { Record_ID: 'CS18', Insurance_Plan: 'Public_Medicare', Screening_Compliance: 'Non_Compliant' },
  { Record_ID: 'CS19', Insurance_Plan: 'Public_Medicare', Screening_Compliance: 'Compliant' },
  { Record_ID: 'CS20', Insurance_Plan: 'Public_Medicare', Screening_Compliance: 'Non_Compliant' },
  { Record_ID: 'CS21', Insurance_Plan: 'Uninsured', Screening_Compliance: 'Non_Compliant' },
  { Record_ID: 'CS22', Insurance_Plan: 'Uninsured', Screening_Compliance: 'Non_Compliant' },
  { Record_ID: 'CS23', Insurance_Plan: 'Uninsured', Screening_Compliance: 'Non_Compliant' },
  { Record_ID: 'CS24', Insurance_Plan: 'Uninsured', Screening_Compliance: 'Non_Compliant' },
  { Record_ID: 'CS25', Insurance_Plan: 'Uninsured', Screening_Compliance: 'Non_Compliant' },
  { Record_ID: 'CS26', Insurance_Plan: 'Uninsured', Screening_Compliance: 'Non_Compliant' },
  { Record_ID: 'CS27', Insurance_Plan: 'Uninsured', Screening_Compliance: 'Non_Compliant' },
  { Record_ID: 'CS28', Insurance_Plan: 'Uninsured', Screening_Compliance: 'Compliant' },
  { Record_ID: 'CS29', Insurance_Plan: 'Uninsured', Screening_Compliance: 'Compliant' },
  { Record_ID: 'CS30', Insurance_Plan: 'Uninsured', Screening_Compliance: 'Non_Compliant' },
];

// 10. Mann-Whitney U Test (Skewed 2 Groups)
const MANN_WHITNEY_DATA: Record<string, any>[] = [
  { Patient_ID: 'MW01', Surgical_Approach: 'Laparoscopic', Hospital_Stay_Days: 2.0, Pain_Score: 3 },
  { Patient_ID: 'MW02', Surgical_Approach: 'Laparoscopic', Hospital_Stay_Days: 2.5, Pain_Score: 2 },
  { Patient_ID: 'MW03', Surgical_Approach: 'Laparoscopic', Hospital_Stay_Days: 3.0, Pain_Score: 4 },
  { Patient_ID: 'MW04', Surgical_Approach: 'Laparoscopic', Hospital_Stay_Days: 2.0, Pain_Score: 2 },
  { Patient_ID: 'MW05', Surgical_Approach: 'Laparoscopic', Hospital_Stay_Days: 4.0, Pain_Score: 5 },
  { Patient_ID: 'MW06', Surgical_Approach: 'Laparoscopic', Hospital_Stay_Days: 2.5, Pain_Score: 3 },
  { Patient_ID: 'MW07', Surgical_Approach: 'Laparoscopic', Hospital_Stay_Days: 3.0, Pain_Score: 3 },
  { Patient_ID: 'MW08', Surgical_Approach: 'Laparoscopic', Hospital_Stay_Days: 2.0, Pain_Score: 2 },
  { Patient_ID: 'MW09', Surgical_Approach: 'Laparoscopic', Hospital_Stay_Days: 3.5, Pain_Score: 4 },
  { Patient_ID: 'MW10', Surgical_Approach: 'Laparoscopic', Hospital_Stay_Days: 2.5, Pain_Score: 3 },
  { Patient_ID: 'MW11', Surgical_Approach: 'Open_Surgery', Hospital_Stay_Days: 7.0, Pain_Score: 7 },
  { Patient_ID: 'MW12', Surgical_Approach: 'Open_Surgery', Hospital_Stay_Days: 8.5, Pain_Score: 8 },
  { Patient_ID: 'MW13', Surgical_Approach: 'Open_Surgery', Hospital_Stay_Days: 6.0, Pain_Score: 6 },
  { Patient_ID: 'MW14', Surgical_Approach: 'Open_Surgery', Hospital_Stay_Days: 11.0, Pain_Score: 9 },
  { Patient_ID: 'MW15', Surgical_Approach: 'Open_Surgery', Hospital_Stay_Days: 7.5, Pain_Score: 7 },
  { Patient_ID: 'MW16', Surgical_Approach: 'Open_Surgery', Hospital_Stay_Days: 9.0, Pain_Score: 8 },
  { Patient_ID: 'MW17', Surgical_Approach: 'Open_Surgery', Hospital_Stay_Days: 6.5, Pain_Score: 6 },
  { Patient_ID: 'MW18', Surgical_Approach: 'Open_Surgery', Hospital_Stay_Days: 10.0, Pain_Score: 9 },
  { Patient_ID: 'MW19', Surgical_Approach: 'Open_Surgery', Hospital_Stay_Days: 8.0, Pain_Score: 7 },
  { Patient_ID: 'MW20', Surgical_Approach: 'Open_Surgery', Hospital_Stay_Days: 7.0, Pain_Score: 7 },
];

// 11. Wilcoxon Signed-Rank Test (Non-Parametric Paired)
const WILCOXON_DATA: Record<string, any>[] = [
  { Subject_ID: 'WX01', Pre_Exposure_Distress: 90.0, Post_Exposure_Distress: 35.0, Heart_Rate: 112 },
  { Subject_ID: 'WX02', Pre_Exposure_Distress: 85.0, Post_Exposure_Distress: 30.0, Heart_Rate: 105 },
  { Subject_ID: 'WX03', Pre_Exposure_Distress: 95.0, Post_Exposure_Distress: 45.0, Heart_Rate: 118 },
  { Subject_ID: 'WX04', Pre_Exposure_Distress: 80.0, Post_Exposure_Distress: 25.0, Heart_Rate: 98 },
  { Subject_ID: 'WX05', Pre_Exposure_Distress: 92.0, Post_Exposure_Distress: 38.0, Heart_Rate: 115 },
  { Subject_ID: 'WX06', Pre_Exposure_Distress: 88.0, Post_Exposure_Distress: 32.0, Heart_Rate: 108 },
  { Subject_ID: 'WX07', Pre_Exposure_Distress: 96.0, Post_Exposure_Distress: 42.0, Heart_Rate: 120 },
  { Subject_ID: 'WX08', Pre_Exposure_Distress: 78.0, Post_Exposure_Distress: 20.0, Heart_Rate: 95 },
  { Subject_ID: 'WX09', Pre_Exposure_Distress: 91.0, Post_Exposure_Distress: 36.0, Heart_Rate: 114 },
  { Subject_ID: 'WX10', Pre_Exposure_Distress: 87.0, Post_Exposure_Distress: 28.0, Heart_Rate: 106 },
  { Subject_ID: 'WX11', Pre_Exposure_Distress: 94.0, Post_Exposure_Distress: 40.0, Heart_Rate: 116 },
  { Subject_ID: 'WX12', Pre_Exposure_Distress: 82.0, Post_Exposure_Distress: 24.0, Heart_Rate: 100 },
  { Subject_ID: 'WX13', Pre_Exposure_Distress: 89.0, Post_Exposure_Distress: 34.0, Heart_Rate: 110 },
  { Subject_ID: 'WX14', Pre_Exposure_Distress: 86.0, Post_Exposure_Distress: 30.0, Heart_Rate: 104 },
  { Subject_ID: 'WX15', Pre_Exposure_Distress: 98.0, Post_Exposure_Distress: 48.0, Heart_Rate: 122 },
];

// 12. Kruskal-Wallis Test (Non-Parametric 3 Groups)
const KRUSKAL_DATA: Record<string, any>[] = [
  { User_ID: 'KW01', Checkout_Interface: 'Express_One_Click', Trust_Rating_10pt: 9.0, Time_Sec: 28 },
  { User_ID: 'KW02', Checkout_Interface: 'Express_One_Click', Trust_Rating_10pt: 8.5, Time_Sec: 32 },
  { User_ID: 'KW03', Checkout_Interface: 'Express_One_Click', Trust_Rating_10pt: 9.5, Time_Sec: 25 },
  { User_ID: 'KW04', Checkout_Interface: 'Express_One_Click', Trust_Rating_10pt: 8.0, Time_Sec: 35 },
  { User_ID: 'KW05', Checkout_Interface: 'Express_One_Click', Trust_Rating_10pt: 9.0, Time_Sec: 30 },
  { User_ID: 'KW06', Checkout_Interface: 'Express_One_Click', Trust_Rating_10pt: 10.0, Time_Sec: 22 },
  { User_ID: 'KW07', Checkout_Interface: 'Express_One_Click', Trust_Rating_10pt: 8.5, Time_Sec: 31 },
  { User_ID: 'KW08', Checkout_Interface: 'Multi_Step_Wizard', Trust_Rating_10pt: 6.5, Time_Sec: 75 },
  { User_ID: 'KW09', Checkout_Interface: 'Multi_Step_Wizard', Trust_Rating_10pt: 7.0, Time_Sec: 68 },
  { User_ID: 'KW10', Checkout_Interface: 'Multi_Step_Wizard', Trust_Rating_10pt: 6.0, Time_Sec: 82 },
  { User_ID: 'KW11', Checkout_Interface: 'Multi_Step_Wizard', Trust_Rating_10pt: 7.5, Time_Sec: 62 },
  { User_ID: 'KW12', Checkout_Interface: 'Multi_Step_Wizard', Trust_Rating_10pt: 5.5, Time_Sec: 88 },
  { User_ID: 'KW13', Checkout_Interface: 'Multi_Step_Wizard', Trust_Rating_10pt: 6.5, Time_Sec: 72 },
  { User_ID: 'KW14', Checkout_Interface: 'Multi_Step_Wizard', Trust_Rating_10pt: 7.0, Time_Sec: 66 },
  { User_ID: 'KW15', Checkout_Interface: 'Guest_No_Login', Trust_Rating_10pt: 4.0, Time_Sec: 105 },
  { User_ID: 'KW16', Checkout_Interface: 'Guest_No_Login', Trust_Rating_10pt: 3.5, Time_Sec: 120 },
  { User_ID: 'KW17', Checkout_Interface: 'Guest_No_Login', Trust_Rating_10pt: 5.0, Time_Sec: 95 },
  { User_ID: 'KW18', Checkout_Interface: 'Guest_No_Login', Trust_Rating_10pt: 3.0, Time_Sec: 130 },
  { User_ID: 'KW19', Checkout_Interface: 'Guest_No_Login', Trust_Rating_10pt: 4.5, Time_Sec: 110 },
  { User_ID: 'KW20', Checkout_Interface: 'Guest_No_Login', Trust_Rating_10pt: 4.0, Time_Sec: 108 },
  { User_ID: 'KW21', Checkout_Interface: 'Guest_No_Login', Trust_Rating_10pt: 3.5, Time_Sec: 125 },
];

// 13. Friedman Test (Non-Parametric Repeated Ranks)
const FRIEDMAN_DATA: Record<string, any>[] = [
  { Panellist_ID: 'FD01', Liking_Formula_A: 8.5, Liking_Formula_B: 6.0, Liking_Formula_C: 4.0 },
  { Panellist_ID: 'FD02', Liking_Formula_A: 9.0, Liking_Formula_B: 6.5, Liking_Formula_C: 3.5 },
  { Panellist_ID: 'FD03', Liking_Formula_A: 8.0, Liking_Formula_B: 7.0, Liking_Formula_C: 5.0 },
  { Panellist_ID: 'FD04', Liking_Formula_A: 9.5, Liking_Formula_B: 5.5, Liking_Formula_C: 4.5 },
  { Panellist_ID: 'FD05', Liking_Formula_A: 8.0, Liking_Formula_B: 6.0, Liking_Formula_C: 3.0 },
  { Panellist_ID: 'FD06', Liking_Formula_A: 9.0, Liking_Formula_B: 7.0, Liking_Formula_C: 4.0 },
  { Panellist_ID: 'FD07', Liking_Formula_A: 8.5, Liking_Formula_B: 6.5, Liking_Formula_C: 4.5 },
  { Panellist_ID: 'FD08', Liking_Formula_A: 9.0, Liking_Formula_B: 5.0, Liking_Formula_C: 3.5 },
  { Panellist_ID: 'FD09', Liking_Formula_A: 8.5, Liking_Formula_B: 6.0, Liking_Formula_C: 4.0 },
  { Panellist_ID: 'FD10', Liking_Formula_A: 9.5, Liking_Formula_B: 7.5, Liking_Formula_C: 5.0 },
  { Panellist_ID: 'FD11', Liking_Formula_A: 8.0, Liking_Formula_B: 6.0, Liking_Formula_C: 3.5 },
  { Panellist_ID: 'FD12', Liking_Formula_A: 9.0, Liking_Formula_B: 6.5, Liking_Formula_C: 4.0 },
  { Panellist_ID: 'FD13', Liking_Formula_A: 8.5, Liking_Formula_B: 7.0, Liking_Formula_C: 4.5 },
  { Panellist_ID: 'FD14', Liking_Formula_A: 9.0, Liking_Formula_B: 5.5, Liking_Formula_C: 3.0 },
  { Panellist_ID: 'FD15', Liking_Formula_A: 8.0, Liking_Formula_B: 6.0, Liking_Formula_C: 4.0 },
];

// 14. One-Sample t-Test against Known Population Benchmark (μ = 220)
const ONE_SAMPLE_DATA: Record<string, any>[] = [
  { Candidate_ID: 'OS01', Board_Exam_Score: 234.0, Undergraduate_GPA: 3.85, Prep_Months: 6 },
  { Candidate_ID: 'OS02', Board_Exam_Score: 228.5, Undergraduate_GPA: 3.72, Prep_Months: 5 },
  { Candidate_ID: 'OS03', Board_Exam_Score: 241.0, Undergraduate_GPA: 3.92, Prep_Months: 7 },
  { Candidate_ID: 'OS04', Board_Exam_Score: 225.0, Undergraduate_GPA: 3.65, Prep_Months: 5 },
  { Candidate_ID: 'OS05', Board_Exam_Score: 238.5, Undergraduate_GPA: 3.88, Prep_Months: 6 },
  { Candidate_ID: 'OS06', Board_Exam_Score: 230.0, Undergraduate_GPA: 3.78, Prep_Months: 5 },
  { Candidate_ID: 'OS07', Board_Exam_Score: 245.0, Undergraduate_GPA: 3.96, Prep_Months: 8 },
  { Candidate_ID: 'OS08', Board_Exam_Score: 227.0, Undergraduate_GPA: 3.69, Prep_Months: 4 },
  { Candidate_ID: 'OS09', Board_Exam_Score: 236.0, Undergraduate_GPA: 3.82, Prep_Months: 6 },
  { Candidate_ID: 'OS10', Board_Exam_Score: 232.5, Undergraduate_GPA: 3.75, Prep_Months: 5 },
  { Candidate_ID: 'OS11', Board_Exam_Score: 240.0, Undergraduate_GPA: 3.90, Prep_Months: 7 },
  { Candidate_ID: 'OS12', Board_Exam_Score: 226.5, Undergraduate_GPA: 3.68, Prep_Months: 4 },
  { Candidate_ID: 'OS13', Board_Exam_Score: 237.0, Undergraduate_GPA: 3.84, Prep_Months: 6 },
  { Candidate_ID: 'OS14', Board_Exam_Score: 231.0, Undergraduate_GPA: 3.74, Prep_Months: 5 },
  { Candidate_ID: 'OS15', Board_Exam_Score: 243.5, Undergraduate_GPA: 3.94, Prep_Months: 7 },
  { Candidate_ID: 'OS16', Board_Exam_Score: 224.0, Undergraduate_GPA: 3.62, Prep_Months: 4 },
  { Candidate_ID: 'OS17', Board_Exam_Score: 239.0, Undergraduate_GPA: 3.89, Prep_Months: 6 },
  { Candidate_ID: 'OS18', Board_Exam_Score: 229.5, Undergraduate_GPA: 3.71, Prep_Months: 5 },
  { Candidate_ID: 'OS19', Board_Exam_Score: 242.0, Undergraduate_GPA: 3.93, Prep_Months: 7 },
  { Candidate_ID: 'OS20', Board_Exam_Score: 228.0, Undergraduate_GPA: 3.70, Prep_Months: 5 },
];

// 15. Binary Logistic Regression
const LOGISTIC_DATA: Record<string, any>[] = [
  { Patient_ID: 'LR01', Coronary_Event: 'Event_Yes', LDL_Cholesterol: 185.0, Systolic_BP: 158.0, Patient_Age: 64 },
  { Patient_ID: 'LR02', Coronary_Event: 'Event_No', LDL_Cholesterol: 105.0, Systolic_BP: 118.0, Patient_Age: 42 },
  { Patient_ID: 'LR03', Coronary_Event: 'Event_Yes', LDL_Cholesterol: 172.0, Systolic_BP: 152.0, Patient_Age: 61 },
  { Patient_ID: 'LR04', Coronary_Event: 'Event_No', LDL_Cholesterol: 115.0, Systolic_BP: 124.0, Patient_Age: 46 },
  { Patient_ID: 'LR05', Coronary_Event: 'Event_Yes', LDL_Cholesterol: 195.0, Systolic_BP: 164.0, Patient_Age: 68 },
  { Patient_ID: 'LR06', Coronary_Event: 'Event_No', LDL_Cholesterol: 98.0, Systolic_BP: 114.0, Patient_Age: 39 },
  { Patient_ID: 'LR07', Coronary_Event: 'Event_Yes', LDL_Cholesterol: 168.0, Systolic_BP: 148.0, Patient_Age: 59 },
  { Patient_ID: 'LR08', Coronary_Event: 'Event_No', LDL_Cholesterol: 122.0, Systolic_BP: 126.0, Patient_Age: 48 },
  { Patient_ID: 'LR09', Coronary_Event: 'Event_Yes', LDL_Cholesterol: 180.0, Systolic_BP: 156.0, Patient_Age: 63 },
  { Patient_ID: 'LR10', Coronary_Event: 'Event_No', LDL_Cholesterol: 110.0, Systolic_BP: 120.0, Patient_Age: 44 },
  { Patient_ID: 'LR11', Coronary_Event: 'Event_Yes', LDL_Cholesterol: 190.0, Systolic_BP: 162.0, Patient_Age: 66 },
  { Patient_ID: 'LR12', Coronary_Event: 'Event_No', LDL_Cholesterol: 102.0, Systolic_BP: 116.0, Patient_Age: 41 },
  { Patient_ID: 'LR13', Coronary_Event: 'Event_Yes', LDL_Cholesterol: 175.0, Systolic_BP: 154.0, Patient_Age: 62 },
  { Patient_ID: 'LR14', Coronary_Event: 'Event_No', LDL_Cholesterol: 118.0, Systolic_BP: 122.0, Patient_Age: 47 },
  { Patient_ID: 'LR15', Coronary_Event: 'Event_Yes', LDL_Cholesterol: 188.0, Systolic_BP: 160.0, Patient_Age: 65 },
  { Patient_ID: 'LR16', Coronary_Event: 'Event_No', LDL_Cholesterol: 95.0, Systolic_BP: 112.0, Patient_Age: 38 },
  { Patient_ID: 'LR17', Coronary_Event: 'Event_Yes', LDL_Cholesterol: 170.0, Systolic_BP: 150.0, Patient_Age: 60 },
  { Patient_ID: 'LR18', Coronary_Event: 'Event_No', LDL_Cholesterol: 125.0, Systolic_BP: 128.0, Patient_Age: 49 },
  { Patient_ID: 'LR19', Coronary_Event: 'Event_Yes', LDL_Cholesterol: 182.0, Systolic_BP: 158.0, Patient_Age: 64 },
  { Patient_ID: 'LR20', Coronary_Event: 'Event_No', LDL_Cholesterol: 108.0, Systolic_BP: 118.0, Patient_Age: 43 },
];

// 16. Cronbach's Alpha Scale Reliability (5 Items)
const CRONBACH_DATA: Record<string, any>[] = [
  { Respondent_ID: 'R01', Resilience_Item_1: 4, Resilience_Item_2: 4, Resilience_Item_3: 5, Resilience_Item_4: 4, Resilience_Item_5: 5 },
  { Respondent_ID: 'R02', Resilience_Item_1: 2, Resilience_Item_2: 2, Resilience_Item_3: 3, Resilience_Item_4: 2, Resilience_Item_5: 3 },
  { Respondent_ID: 'R03', Resilience_Item_1: 5, Resilience_Item_2: 4, Resilience_Item_3: 5, Resilience_Item_4: 5, Resilience_Item_5: 4 },
  { Respondent_ID: 'R04', Resilience_Item_1: 3, Resilience_Item_2: 3, Resilience_Item_3: 3, Resilience_Item_4: 3, Resilience_Item_5: 4 },
  { Respondent_ID: 'R05', Resilience_Item_1: 5, Resilience_Item_2: 5, Resilience_Item_3: 4, Resilience_Item_4: 5, Resilience_Item_5: 5 },
  { Respondent_ID: 'R06', Resilience_Item_1: 1, Resilience_Item_2: 2, Resilience_Item_3: 2, Resilience_Item_4: 1, Resilience_Item_5: 2 },
  { Respondent_ID: 'R07', Resilience_Item_1: 4, Resilience_Item_2: 3, Resilience_Item_3: 4, Resilience_Item_4: 4, Resilience_Item_5: 4 },
  { Respondent_ID: 'R08', Resilience_Item_1: 2, Resilience_Item_2: 3, Resilience_Item_3: 2, Resilience_Item_4: 2, Resilience_Item_5: 3 },
  { Respondent_ID: 'R09', Resilience_Item_1: 5, Resilience_Item_2: 4, Resilience_Item_3: 5, Resilience_Item_4: 4, Resilience_Item_5: 5 },
  { Respondent_ID: 'R10', Resilience_Item_1: 3, Resilience_Item_2: 2, Resilience_Item_3: 3, Resilience_Item_4: 3, Resilience_Item_5: 2 },
  { Respondent_ID: 'R11', Resilience_Item_1: 4, Resilience_Item_2: 5, Resilience_Item_3: 4, Resilience_Item_4: 4, Resilience_Item_5: 4 },
  { Respondent_ID: 'R12', Resilience_Item_1: 2, Resilience_Item_2: 2, Resilience_Item_3: 1, Resilience_Item_4: 2, Resilience_Item_5: 2 },
  { Respondent_ID: 'R13', Resilience_Item_1: 5, Resilience_Item_2: 5, Resilience_Item_3: 5, Resilience_Item_4: 4, Resilience_Item_5: 5 },
  { Respondent_ID: 'R14', Resilience_Item_1: 3, Resilience_Item_2: 4, Resilience_Item_3: 3, Resilience_Item_4: 3, Resilience_Item_5: 3 },
  { Respondent_ID: 'R15', Resilience_Item_1: 4, Resilience_Item_2: 4, Resilience_Item_3: 4, Resilience_Item_4: 5, Resilience_Item_5: 4 },
  { Respondent_ID: 'R16', Resilience_Item_1: 1, Resilience_Item_2: 1, Resilience_Item_3: 2, Resilience_Item_4: 2, Resilience_Item_5: 1 },
  { Respondent_ID: 'R17', Resilience_Item_1: 5, Resilience_Item_2: 4, Resilience_Item_3: 4, Resilience_Item_4: 5, Resilience_Item_5: 5 },
  { Respondent_ID: 'R18', Resilience_Item_1: 2, Resilience_Item_2: 3, Resilience_Item_3: 3, Resilience_Item_4: 2, Resilience_Item_5: 2 },
  { Respondent_ID: 'R19', Resilience_Item_1: 4, Resilience_Item_2: 4, Resilience_Item_3: 5, Resilience_Item_4: 4, Resilience_Item_5: 4 },
  { Respondent_ID: 'R20', Resilience_Item_1: 3, Resilience_Item_2: 3, Resilience_Item_3: 2, Resilience_Item_4: 3, Resilience_Item_5: 3 },
];

// 17. Chi-Square Goodness-of-Fit Test
const GOF_DATA: Record<string, any>[] = [
  { Transaction_ID: 'TX01', Color_Choice: 'Midnight_Black' },
  { Transaction_ID: 'TX02', Color_Choice: 'Midnight_Black' },
  { Transaction_ID: 'TX03', Color_Choice: 'Midnight_Black' },
  { Transaction_ID: 'TX04', Color_Choice: 'Midnight_Black' },
  { Transaction_ID: 'TX05', Color_Choice: 'Midnight_Black' },
  { Transaction_ID: 'TX06', Color_Choice: 'Glacier_Silver' },
  { Transaction_ID: 'TX07', Color_Choice: 'Glacier_Silver' },
  { Transaction_ID: 'TX08', Color_Choice: 'Glacier_Silver' },
  { Transaction_ID: 'TX09', Color_Choice: 'Glacier_Silver' },
  { Transaction_ID: 'TX10', Color_Choice: 'Ocean_Blue' },
  { Transaction_ID: 'TX11', Color_Choice: 'Ocean_Blue' },
  { Transaction_ID: 'TX12', Color_Choice: 'Ocean_Blue' },
  { Transaction_ID: 'TX13', Color_Choice: 'Emerald_Green' },
  { Transaction_ID: 'TX14', Color_Choice: 'Emerald_Green' },
  { Transaction_ID: 'TX15', Color_Choice: 'Midnight_Black' },
  { Transaction_ID: 'TX16', Color_Choice: 'Midnight_Black' },
  { Transaction_ID: 'TX17', Color_Choice: 'Glacier_Silver' },
  { Transaction_ID: 'TX18', Color_Choice: 'Ocean_Blue' },
  { Transaction_ID: 'TX19', Color_Choice: 'Emerald_Green' },
  { Transaction_ID: 'TX20', Color_Choice: 'Midnight_Black' },
];

// 18. Descriptive Statistics
const DESCRIPTIVE_DATA: Record<string, any>[] = [
  { Subject_ID: 'DS01', BMI: 24.5, Fasting_Glucose: 92.0, Resting_Heart_Rate: 64, Systolic_BP: 118.0 },
  { Subject_ID: 'DS02', BMI: 28.2, Fasting_Glucose: 108.0, Resting_Heart_Rate: 74, Systolic_BP: 132.0 },
  { Subject_ID: 'DS03', BMI: 22.0, Fasting_Glucose: 86.0, Resting_Heart_Rate: 58, Systolic_BP: 112.0 },
  { Subject_ID: 'DS04', BMI: 31.4, Fasting_Glucose: 118.0, Resting_Heart_Rate: 82, Systolic_BP: 144.0 },
  { Subject_ID: 'DS05', BMI: 25.0, Fasting_Glucose: 95.0, Resting_Heart_Rate: 66, Systolic_BP: 120.0 },
  { Subject_ID: 'DS06', BMI: 27.5, Fasting_Glucose: 102.0, Resting_Heart_Rate: 72, Systolic_BP: 128.0 },
  { Subject_ID: 'DS07', BMI: 23.2, Fasting_Glucose: 89.0, Resting_Heart_Rate: 60, Systolic_BP: 115.0 },
  { Subject_ID: 'DS08', BMI: 29.8, Fasting_Glucose: 112.0, Resting_Heart_Rate: 78, Systolic_BP: 138.0 },
  { Subject_ID: 'DS09', BMI: 26.0, Fasting_Glucose: 98.0, Resting_Heart_Rate: 68, Systolic_BP: 124.0 },
  { Subject_ID: 'DS10', BMI: 24.0, Fasting_Glucose: 91.0, Resting_Heart_Rate: 62, Systolic_BP: 116.0 },
  { Subject_ID: 'DS11', BMI: 30.5, Fasting_Glucose: 115.0, Resting_Heart_Rate: 80, Systolic_BP: 142.0 },
  { Subject_ID: 'DS12', BMI: 21.5, Fasting_Glucose: 84.0, Resting_Heart_Rate: 56, Systolic_BP: 110.0 },
  { Subject_ID: 'DS13', BMI: 28.8, Fasting_Glucose: 106.0, Resting_Heart_Rate: 75, Systolic_BP: 134.0 },
  { Subject_ID: 'DS14', BMI: 25.5, Fasting_Glucose: 96.0, Resting_Heart_Rate: 67, Systolic_BP: 122.0 },
  { Subject_ID: 'DS15', BMI: 26.8, Fasting_Glucose: 100.0, Resting_Heart_Rate: 70, Systolic_BP: 126.0 },
];

function buildDataset(
  id: string,
  name: string,
  description: string,
  domain: string,
  data: Record<string, any>[],
  columnTypes: Record<string, 'continuous' | 'categorical' | 'id'>
): Dataset {
  const colKeys = Object.keys(data[0] || {});
  const dummyDataset: Dataset = {
    id,
    name,
    description,
    domain,
    columns: colKeys.map((k) => ({
      name: k,
      type: columnTypes[k] || 'continuous',
      distinctCount: 0,
      missingCount: 0,
      sampleValues: [],
    })),
    data,
    totalRows: data.length,
  };
  return refreshDatasetMetadata(dummyDataset, data);
}

const BASE_TEST_SPECIFIC_STUDIES: Record<string, TestSpecificStudyConfig> = {
  independent_ttest: {
    dataset: buildDataset(
      'study-preset-independent-ttest',
      'Mindfulness Meditation vs. Active Control: Exam Performance Trial',
      'Empirical randomized trial evaluating whether an 8-week structured mindfulness program significantly increases student examination performance relative to an active study-skills control group.',
      'Educational Psychology & Cognitive Science',
      INDEPENDENT_T_DATA,
      { Student_ID: 'id', Treatment_Group: 'categorical', Exam_Score: 'continuous', Anxiety_Score: 'continuous', Study_Hours: 'continuous' }
    ),
    recommendedDv: 'Exam_Score',
    recommendedIv: 'Treatment_Group',
    recommendedGroup1: 'Mindfulness',
    recommendedGroup2: 'Control',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-preset-indep-t',
      title: 'RQ: Mindfulness vs. Control Exam Scores',
      question: 'Does the 8-week mindfulness meditation intervention significantly improve student exam scores compared to the control group?',
      hypothesisNull: 'H₀: μ_Mindfulness = μ_Control (No difference in mean exam score between mindfulness and control).',
      hypothesisAlt: 'H₁: μ_Mindfulness > μ_Control (Mindfulness students achieve significantly higher exam scores).',
      testType: 'independent_ttest',
      dependentVar: 'Exam_Score',
      independentVar: 'Treatment_Group',
    },
    explanation: 'Loaded 30-student randomized trial data with Treatment_Group (Mindfulness vs. Control) and Exam_Score.',
  },

  paired_ttest: {
    dataset: buildDataset(
      'study-preset-paired-ttest',
      'Cognitive Behavioral Therapy: Pre- vs. Post-Intervention BDI Scores',
      'Within-subjects clinical trial measuring Beck Depression Inventory (BDI-II) scores in 25 patients before and immediately following a 12-week course of Cognitive Behavioral Therapy.',
      'Clinical Psychology & Psychiatry',
      PAIRED_T_DATA,
      { Patient_ID: 'id', Pre_CBT_BDI_Score: 'continuous', Post_CBT_BDI_Score: 'continuous', Age: 'continuous', Therapy_Sessions: 'continuous' }
    ),
    recommendedDv: 'Pre_CBT_BDI_Score',
    recommendedSecondVar: 'Post_CBT_BDI_Score',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-preset-paired-t',
      title: 'RQ: Pre- vs. Post-Treatment BDI Reduction',
      question: 'Did patients experience a statistically significant reduction in Beck Depression Inventory scores from baseline (Pre_CBT_BDI_Score) to endpoint (Post_CBT_BDI_Score)?',
      hypothesisNull: 'H₀: μ_diff = 0 (Mean difference between baseline and post-treatment BDI scores is zero).',
      hypothesisAlt: 'H₁: μ_diff > 0 (Patients show a statistically significant reduction in depression scores).',
      testType: 'paired_ttest',
      dependentVar: 'Pre_CBT_BDI_Score',
      secondVar: 'Post_CBT_BDI_Score',
    },
    explanation: 'Loaded 25-patient pre-post clinical trial data with Pre_CBT_BDI_Score and Post_CBT_BDI_Score.',
  },

  anova: {
    dataset: buildDataset(
      'study-preset-anova',
      'Aerobic Exercise Modalities: Impact on Executive Function (Stroop RT)',
      'Between-subjects experiment assessing Stroop task reaction times (in milliseconds) across three distinct physical activity conditions: High-Intensity Interval Training (HIIT), Moderate Continuous, and Sedentary Control.',
      'Kinesiology & Cognitive Neuroscience',
      ANOVA_DATA,
      { Participant_ID: 'id', Exercise_Protocol: 'categorical', Stroop_RT_ms: 'continuous', VO2_Max: 'continuous' }
    ),
    recommendedDv: 'Stroop_RT_ms',
    recommendedIv: 'Exercise_Protocol',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-preset-anova',
      title: 'RQ: Exercise Modality and Stroop Reaction Time',
      question: 'Are there statistically significant differences in Stroop reaction times across HIIT, Moderate Continuous, and Sedentary Control cohorts?',
      hypothesisNull: 'H₀: μ_HIIT = μ_Moderate = μ_Sedentary (All cohort reaction times are equivalent).',
      hypothesisAlt: 'H₁: At least one exercise protocol cohort differs significantly in mean reaction time.',
      testType: 'anova',
      dependentVar: 'Stroop_RT_ms',
      independentVar: 'Exercise_Protocol',
    },
    explanation: 'Loaded 3-group exercise trial data with Exercise_Protocol (HIIT vs. Moderate vs. Sedentary) and Stroop_RT_ms.',
  },

  two_way_anova: {
    dataset: buildDataset(
      'study-preset-two-way-anova',
      'Sleep Deprivation and Caffeine Dosage on Working Memory Capacity',
      'A 2 × 3 factorial experiment examining the main effects and interaction of Sleep Condition (Normal Sleep vs. 24h Deprived) and Caffeine Dosage (Placebo 0mg, Low 100mg, High 200mg) on working memory digit span.',
      'Neurobiology & Human Factors',
      TWO_WAY_ANOVA_DATA,
      { ID: 'id', Sleep_Condition: 'categorical', Caffeine_Dose: 'categorical', Working_Memory_Score: 'continuous', RT_ms: 'continuous' }
    ),
    recommendedDv: 'Working_Memory_Score',
    recommendedIv: 'Sleep_Condition',
    recommendedFactorB: 'Caffeine_Dose',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-preset-two-way',
      title: 'RQ: Sleep Condition × Caffeine Dosage Factorial Interaction',
      question: 'Do sleep deprivation and caffeine dosage interact to influence working memory capacity?',
      hypothesisNull: 'H₀: No main effect of Sleep, no main effect of Caffeine, and no Sleep × Caffeine interaction.',
      hypothesisAlt: 'H₁: Statistically significant main effects or interaction effect exist on working memory.',
      testType: 'two_way_anova',
      dependentVar: 'Working_Memory_Score',
      independentVar: 'Sleep_Condition',
    },
    explanation: 'Loaded 2 × 3 factorial study data with Sleep_Condition, Caffeine_Dose, and Working_Memory_Score.',
  },

  repeated_measures_anova: {
    dataset: buildDataset(
      'study-preset-rm-anova',
      'Longitudinal Pain Rehabilitation: VAS Ratings Across 3 Months',
      'Repeated measures trial tracking visual analog scale (VAS 0-100) pain scores across 3 longitudinal timepoints (Baseline, Month 1, Month 3) in chronic back pain patients undergoing physical therapy.',
      'Physical Therapy & Rehabilitation Science',
      RM_ANOVA_DATA,
      { Patient_ID: 'id', Pain_VAS_Baseline: 'continuous', Pain_VAS_Month_1: 'continuous', Pain_VAS_Month_3: 'continuous', Mobility_Score: 'continuous' }
    ),
    recommendedDv: 'Pain_VAS_Baseline',
    recommendedSecondVar: 'Pain_VAS_Month_1',
    recommendedMultiVars: ['Pain_VAS_Baseline', 'Pain_VAS_Month_1', 'Pain_VAS_Month_3'],
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-preset-rm-anova',
      title: 'RQ: Longitudinal VAS Pain Reduction',
      question: 'Does patient VAS pain rating change significantly across Baseline, Month 1, and Month 3 timepoints?',
      hypothesisNull: 'H₀: μ_Baseline = μ_Month1 = μ_Month3 (Pain ratings remain equal across timepoints).',
      hypothesisAlt: 'H₁: Mean pain ratings differ significantly across at least two timepoints.',
      testType: 'repeated_measures_anova',
      dependentVar: 'Pain_VAS_Baseline',
      secondVar: 'Pain_VAS_Month_1',
    },
    explanation: 'Loaded 3-timepoint longitudinal study data with Pain_VAS_Baseline, Pain_VAS_Month_1, and Pain_VAS_Month_3.',
  },

  ancova: {
    dataset: buildDataset(
      'study-preset-ancova',
      'Reading Comprehension Intervention Controlling for Baseline Vocabulary Age',
      'Educational intervention study comparing reading comprehension scores across three instructional methods (Phonics Intensive, Whole Language, Balanced Literacy) after statistically controlling for baseline vocabulary age.',
      'Pedagogical Science & Language Acquisition',
      ANCOVA_DATA,
      { Student_ID: 'id', Instruction_Method: 'categorical', Baseline_Vocab_Age: 'continuous', Post_Comprehension: 'continuous' }
    ),
    recommendedDv: 'Post_Comprehension',
    recommendedIv: 'Instruction_Method',
    recommendedCovariate: 'Baseline_Vocab_Age',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-preset-ancova',
      title: 'RQ: Instructional Method Effect Controlling for Baseline Vocab',
      question: 'Do post-comprehension scores differ across instructional methods after adjusting for baseline vocabulary age?',
      hypothesisNull: 'H₀: Adjusted mean comprehension scores are equal across methods after controlling for baseline.',
      hypothesisAlt: 'H₁: Adjusted mean comprehension scores differ significantly across instructional methods.',
      testType: 'ancova',
      dependentVar: 'Post_Comprehension',
      independentVar: 'Instruction_Method',
    },
    explanation: 'Loaded ANCOVA study with Instruction_Method (IV), Baseline_Vocab_Age (Covariate), and Post_Comprehension (DV).',
  },

  regression: {
    dataset: buildDataset(
      'study-preset-regression',
      'Corporate Burnout Prediction: Workload, Autonomy, and Sleep Deficit',
      'Multivariate organizational psychology dataset investigating how weekly work hours, job autonomy, and sleep deficit collectively predict employee burnout index scores.',
      'Organizational Psychology',
      REGRESSION_DATA,
      { Employee_ID: 'id', Burnout_Index: 'continuous', Weekly_Work_Hours: 'continuous', Autonomy_Rating: 'continuous', Sleep_Deficit_Hours: 'continuous' }
    ),
    recommendedDv: 'Burnout_Index',
    recommendedMultiVars: ['Weekly_Work_Hours', 'Autonomy_Rating', 'Sleep_Deficit_Hours'],
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-preset-reg',
      title: 'RQ: Predictors of Corporate Burnout Index',
      question: 'To what extent do weekly work hours, job autonomy, and sleep deficit collectively account for variance in burnout index?',
      hypothesisNull: 'H₀: Predictors explain zero variance in employee burnout (R² = 0).',
      hypothesisAlt: 'H₁: Predictors collectively explain significant variance in burnout index (R² > 0).',
      testType: 'regression',
      dependentVar: 'Burnout_Index',
      multiVars: ['Weekly_Work_Hours', 'Autonomy_Rating', 'Sleep_Deficit_Hours'],
    },
    explanation: 'Loaded multiple regression dataset with Burnout_Index (DV) and Weekly_Work_Hours, Autonomy_Rating, Sleep_Deficit_Hours (IVs).',
  },

  correlation: {
    dataset: buildDataset(
      'study-preset-correlation',
      'Biopsychosocial Stress Matrix: Cortisol, Anxiety, Sleep, and HRV',
      'Empirical physiological dataset examining bivariate and matrix associations between salivary cortisol, anxiety inventory scores, sleep quality (PSQI), and heart rate variability (HRV).',
      'Behavioral Medicine & Psychoneuroendocrinology',
      CORRELATION_DATA,
      { Subject_ID: 'id', Salivary_Cortisol_nmol: 'continuous', Anxiety_Score: 'continuous', Sleep_Quality_PSQI: 'continuous', Heart_Rate_Variability: 'continuous' }
    ),
    recommendedMultiVars: ['Salivary_Cortisol_nmol', 'Anxiety_Score', 'Sleep_Quality_PSQI', 'Heart_Rate_Variability'],
    correlationMethod: 'pearson',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-preset-corr',
      title: 'RQ: Correlation Matrix of Biomarkers and Anxiety',
      question: 'What are the magnitudes and directions of pairwise linear associations between Cortisol, Anxiety, Sleep, and HRV?',
      hypothesisNull: 'H₀: All pairwise population correlation coefficients equal zero (ρ = 0).',
      hypothesisAlt: 'H₁: At least one pairwise correlation coefficient differs significantly from zero (ρ ≠ 0).',
      testType: 'correlation',
      multiVars: ['Salivary_Cortisol_nmol', 'Anxiety_Score', 'Sleep_Quality_PSQI', 'Heart_Rate_Variability'],
    },
    explanation: 'Loaded biomarker correlation matrix dataset with Cortisol, Anxiety, Sleep Quality, and HRV.',
  },

  chi_square: {
    dataset: buildDataset(
      'study-preset-chi-square',
      'Patient Compliance with Preventive Screening by Healthcare Insurance Type',
      'Epidemiological contingency dataset investigating whether preventive health screening compliance (Compliant vs. Non-Compliant) is independent of health insurance type (Private PPO, Public Medicare, Uninsured).',
      'Public Health & Health Economics',
      CHI_SQUARE_DATA,
      { Record_ID: 'id', Insurance_Plan: 'categorical', Screening_Compliance: 'categorical' }
    ),
    recommendedIv: 'Insurance_Plan',
    recommendedSecondVar: 'Screening_Compliance',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-preset-chisq',
      title: 'RQ: Insurance Type vs. Screening Adherence',
      question: 'Is preventive screening compliance independent of patient healthcare insurance plan?',
      hypothesisNull: 'H₀: Insurance plan and screening compliance are mutually independent.',
      hypothesisAlt: 'H₁: Insurance plan and screening compliance are significantly associated.',
      testType: 'chi_square',
      independentVar: 'Insurance_Plan',
      secondVar: 'Screening_Compliance',
    },
    explanation: 'Loaded contingency dataset with Insurance_Plan (Private vs. Public vs. Uninsured) and Screening_Compliance.',
  },

  mann_whitney: {
    dataset: buildDataset(
      'study-preset-mann-whitney',
      'Post-Operative Recovery Days: Laparoscopic vs. Open Resection (Skewed Distribution)',
      'Surgical recovery study measuring hospital length of stay (in days) across Laparoscopic and Open Resection procedures, exhibiting marked positive skewness that violates parametric normality.',
      'Surgical Outcomes Research',
      MANN_WHITNEY_DATA,
      { Patient_ID: 'id', Surgical_Approach: 'categorical', Hospital_Stay_Days: 'continuous', Pain_Score: 'continuous' }
    ),
    recommendedDv: 'Hospital_Stay_Days',
    recommendedIv: 'Surgical_Approach',
    recommendedGroup1: 'Laparoscopic',
    recommendedGroup2: 'Open_Surgery',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-preset-mann-w',
      title: 'RQ: Non-Parametric Hospital Stay Comparison',
      question: 'Do median hospital stay days differ significantly between Laparoscopic and Open surgery patients without assuming normality?',
      hypothesisNull: 'H₀: Population distributions of hospital stay days are equal for Laparoscopic and Open surgery.',
      hypothesisAlt: 'H₁: Laparoscopic surgery results in systematically lower hospital stay ranks.',
      testType: 'mann_whitney',
      dependentVar: 'Hospital_Stay_Days',
      independentVar: 'Surgical_Approach',
    },
    explanation: 'Loaded non-parametric surgical dataset with Surgical_Approach and skewed Hospital_Stay_Days.',
  },

  wilcoxon_signed: {
    dataset: buildDataset(
      'study-preset-wilcoxon',
      'Arachnophobia Exposure Therapy: Pre- vs. Post-Session SUDs (0-100 Rating)',
      'Within-subjects behavioral study recording Subjective Units of Distress (SUDs ordinal scale 0-100) before and after in-vivo virtual reality spider exposure therapy.',
      'Behavior Therapy & Clinical Psychology',
      WILCOXON_DATA,
      { Subject_ID: 'id', Pre_Exposure_Distress: 'continuous', Post_Exposure_Distress: 'continuous', Heart_Rate: 'continuous' }
    ),
    recommendedDv: 'Pre_Exposure_Distress',
    recommendedSecondVar: 'Post_Exposure_Distress',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-preset-wilcoxon',
      title: 'RQ: Non-Parametric Pre vs. Post Distress Comparison',
      question: 'Do median subjective distress ratings decrease significantly from pre-exposure to post-exposure?',
      hypothesisNull: 'H₀: The median difference between pre- and post-exposure distress ratings is zero.',
      hypothesisAlt: 'H₁: Median subjective distress ratings decrease significantly post-exposure.',
      testType: 'wilcoxon_signed',
      dependentVar: 'Pre_Exposure_Distress',
      secondVar: 'Post_Exposure_Distress',
    },
    explanation: 'Loaded paired non-parametric exposure dataset with Pre_Exposure_Distress and Post_Exposure_Distress.',
  },

  kruskal_wallis: {
    dataset: buildDataset(
      'study-preset-kruskal',
      'Customer Trust Scores Across 3 E-Commerce Checkout Interfaces',
      'Human-computer interaction study evaluating customer trust ratings (ordinal Likert scale 1-10) across Express One-Click, Multi-Step Wizard, and Guest No-Login checkout flows.',
      'Human-Computer Interaction & E-Commerce',
      KRUSKAL_DATA,
      { User_ID: 'id', Checkout_Interface: 'categorical', Trust_Rating_10pt: 'continuous', Time_Sec: 'continuous' }
    ),
    recommendedDv: 'Trust_Rating_10pt',
    recommendedIv: 'Checkout_Interface',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-preset-kruskal',
      title: 'RQ: Checkout Interface and Customer Trust Rankings',
      question: 'Do median customer trust rankings differ significantly across the 3 checkout interface designs?',
      hypothesisNull: 'H₀: The distribution of trust ratings is equal across all three checkout designs.',
      hypothesisAlt: 'H₁: At least one checkout interface design yields systematically higher trust ranks.',
      testType: 'kruskal_wallis',
      dependentVar: 'Trust_Rating_10pt',
      independentVar: 'Checkout_Interface',
    },
    explanation: 'Loaded 3-interface HCI dataset with Checkout_Interface and ordinal Trust_Rating_10pt.',
  },

  friedman: {
    dataset: buildDataset(
      'study-preset-friedman',
      'Sensory Taste Panel: Hedonic Liking Across 3 Beverage Formulations',
      'Sensory evaluation experiment where 15 trained panellists ranked overall hedonic liking (1-9 scale) across three alternative sugar-reduced beverage formulas (A, B, C).',
      'Food Science & Sensory Evaluation',
      FRIEDMAN_DATA,
      { Panellist_ID: 'id', Liking_Formula_A: 'continuous', Liking_Formula_B: 'continuous', Liking_Formula_C: 'continuous' }
    ),
    recommendedMultiVars: ['Liking_Formula_A', 'Liking_Formula_B', 'Liking_Formula_C'],
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-preset-friedman',
      title: 'RQ: Non-Parametric Sensory Liking Comparison',
      question: 'Do median hedonic liking ratings differ significantly across Formulations A, B, and C?',
      hypothesisNull: 'H₀: Panellist liking ratings have identical median distributions across all three formulas.',
      hypothesisAlt: 'H₁: At least one beverage formula differs significantly in ranked panellist preference.',
      testType: 'friedman',
      multiVars: ['Liking_Formula_A', 'Liking_Formula_B', 'Liking_Formula_C'],
    },
    explanation: 'Loaded sensory evaluation dataset with repeated panellist ratings across Formula_A, Formula_B, and Formula_C.',
  },

  one_sample_ttest: {
    dataset: buildDataset(
      'study-preset-one-sample',
      'Licensing Exam Performance: University Medical Cohort vs. National Standard (220)',
      'Educational assessment dataset comparing Step 1 medical licensing examination scores of 20 university graduates against the established national passing benchmark of 220.0 points.',
      'Medical Education',
      ONE_SAMPLE_DATA,
      { Candidate_ID: 'id', Board_Exam_Score: 'continuous', Undergraduate_GPA: 'continuous', Prep_Months: 'continuous' }
    ),
    recommendedDv: 'Board_Exam_Score',
    recommendedTestValue: 220,
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-preset-one-sample',
      title: 'RQ: University Cohort vs. National Benchmark (μ = 220)',
      question: 'Does the mean medical board score of the university cohort differ significantly from the national standard of 220.0?',
      hypothesisNull: 'H₀: μ = 220.0 (Cohort mean matches the national benchmark).',
      hypothesisAlt: 'H₁: μ ≠ 220.0 (Cohort mean differs significantly from the national benchmark).',
      testType: 'one_sample_ttest',
      dependentVar: 'Board_Exam_Score',
    },
    explanation: 'Loaded examination performance dataset with Board_Exam_Score tested against national benchmark (220.0).',
  },

  logistic_regression: {
    dataset: buildDataset(
      'study-preset-logistic',
      'Cardiac Event Prediction: LDL, Systolic BP, and Age on Coronary Event',
      'Clinical cohort study predicting 5-year binary coronary event occurrence (Event_Yes vs. Event_No) based on LDL cholesterol, systolic blood pressure, and patient age.',
      'Cardiology & Epidemiology',
      LOGISTIC_DATA,
      { Patient_ID: 'id', Coronary_Event: 'categorical', LDL_Cholesterol: 'continuous', Systolic_BP: 'continuous', Patient_Age: 'continuous' }
    ),
    recommendedDv: 'Coronary_Event',
    recommendedMultiVars: ['LDL_Cholesterol', 'Systolic_BP', 'Patient_Age'],
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-preset-logistic',
      title: 'RQ: Odds of Coronary Event Occurrence',
      question: 'How do LDL cholesterol, systolic blood pressure, and patient age predict the log-odds of a coronary event?',
      hypothesisNull: 'H₀: The clinical predictors do not improve model log-likelihood over the null model (χ² = 0).',
      hypothesisAlt: 'H₁: Clinical predictors significantly predict the odds of coronary event occurrence.',
      testType: 'logistic_regression',
      dependentVar: 'Coronary_Event',
      multiVars: ['LDL_Cholesterol', 'Systolic_BP', 'Patient_Age'],
    },
    explanation: 'Loaded clinical cardiology dataset with binary outcome Coronary_Event and predictors LDL, BP, and Age.',
  },

  cronbach_alpha: {
    dataset: buildDataset(
      'study-preset-cronbach',
      'Psychometric Validation: 5-Item Academic Resilience Scale (ARS-5)',
      'Psychometric measurement dataset capturing Likert responses (1 to 5) across 5 inventory items measuring student academic resilience and perseverance.',
      'Psychometrics & Educational Assessment',
      CRONBACH_DATA,
      { Respondent_ID: 'id', Resilience_Item_1: 'continuous', Resilience_Item_2: 'continuous', Resilience_Item_3: 'continuous', Resilience_Item_4: 'continuous', Resilience_Item_5: 'continuous' }
    ),
    recommendedMultiVars: ['Resilience_Item_1', 'Resilience_Item_2', 'Resilience_Item_3', 'Resilience_Item_4', 'Resilience_Item_5'],
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-preset-alpha',
      title: 'RQ: Academic Resilience Scale Internal Consistency',
      question: 'What is the internal consistency reliability (Cronbach’s α) of the 5-item Academic Resilience Scale?',
      hypothesisNull: 'H₀: True item covariance is zero (α = 0).',
      hypothesisAlt: 'H₁: The scale items exhibit high internal consistency reliability (α ≥ .70).',
      testType: 'cronbach_alpha',
      multiVars: ['Resilience_Item_1', 'Resilience_Item_2', 'Resilience_Item_3', 'Resilience_Item_4', 'Resilience_Item_5'],
    },
    explanation: 'Loaded psychometric instrument dataset with 5 survey indicators (Resilience_Item_1 to 5).',
  },

  chi_square_gof: {
    dataset: buildDataset(
      'study-preset-gof',
      'Smartphone Color Preference: Expected Equal Share across 4 Options',
      'Retail transaction dataset recording smartphone color selections across 4 options (Midnight Black, Glacier Silver, Ocean Blue, Emerald Green) to test against an equal choice hypothesis.',
      'Consumer Behavior & Marketing Analytics',
      GOF_DATA,
      { Transaction_ID: 'id', Color_Choice: 'categorical' }
    ),
    recommendedIv: 'Color_Choice',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-preset-gof',
      title: 'RQ: Goodness-of-Fit Across Color Selections',
      question: 'Does consumer color preference deviate significantly from an equal 25% distribution across all 4 options?',
      hypothesisNull: 'H₀: Observed color counts follow the expected equal distribution (p₁ = p₂ = p₃ = p₄ = .25).',
      hypothesisAlt: 'H₁: Consumer color choice deviates significantly from equal distribution.',
      testType: 'chi_square_gof',
      independentVar: 'Color_Choice',
    },
    explanation: 'Loaded consumer choice dataset with categorical Color_Choice tested against equal distribution.',
  },

  descriptive: {
    dataset: buildDataset(
      'study-preset-descriptive',
      'Adult Metabolic Health Profile: BMI, Fasting Glucose, Heart Rate, and BP',
      'Biometric health dataset capturing core metabolic indicators in 15 adults for descriptive statistical profiling, central tendency estimation, and normality auditing.',
      'Preventive Medicine & Biostatistics',
      DESCRIPTIVE_DATA,
      { Subject_ID: 'id', BMI: 'continuous', Fasting_Glucose: 'continuous', Resting_Heart_Rate: 'continuous', Systolic_BP: 'continuous' }
    ),
    recommendedMultiVars: ['BMI', 'Fasting_Glucose', 'Resting_Heart_Rate', 'Systolic_BP'],
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-preset-desc',
      title: 'RQ: Distributional Profiling of Metabolic Indicators',
      question: 'What are the central tendencies, standard deviations, and distributional shapes of metabolic health indicators?',
      hypothesisNull: 'H₀: Sample distributions exhibit normal bell-curve properties.',
      hypothesisAlt: 'H₁: Sample distributions exhibit observable skewness or kurtosis patterns.',
      testType: 'descriptive',
      multiVars: ['BMI', 'Fasting_Glucose', 'Resting_Heart_Rate', 'Systolic_BP'],
    },
    explanation: 'Loaded metabolic health dataset with BMI, Fasting_Glucose, Resting_Heart_Rate, and Systolic_BP.',
  },
};


// 62-64. Advanced Factor Analysis & SEM Psychometric Dataset (N=60)
const ADVANCED_MODELING_DATA: Record<string, any>[] = Array.from({ length: 60 }, (_, idx) => {
  const i = idx + 1;
  const f1 = 3.5 + 0.8 * Math.sin(i * 1.3) + (i % 7) * 0.15;
  const f2 = 4.0 + 0.7 * Math.cos(i * 0.9) + (i % 5) * 0.2;
  return {
    Student_ID: 'STU_' + (1000 + i),
    Cognitive_Engagement: Number((f1 * 1.1 + Math.sin(i * 0.4) * 0.4).toFixed(2)),
    Behavioral_Engagement: Number((f1 * 0.95 + Math.cos(i * 0.6) * 0.35).toFixed(2)),
    Emotional_Engagement: Number((f1 * 1.05 + Math.sin(i * 0.8) * 0.3).toFixed(2)),
    Self_Efficacy_Focus: Number((f2 * 1.0 + Math.cos(i * 0.5) * 0.4).toFixed(2)),
    Self_Efficacy_Persistence: Number((f2 * 0.9 + Math.sin(i * 0.7) * 0.45).toFixed(2)),
    Academic_Achievement: Number((0.45 * f1 + 0.52 * f2 + 10.0 + (i % 9) * 0.3).toFixed(2)),
  };
});

const ADVANCED_MODELING_DATASET: Dataset = refreshDatasetMetadata(
  {
    id: 'factor-sem-latent-psychometrics',
    name: 'Higher Education Academic Engagement & Latent Self-Efficacy Study',
    description: 'Empirical survey dataset (N=60) measuring multi-dimensional student engagement, self-efficacy dimensions, and academic achievement for factor analysis and structural equation modeling.',
    domain: 'Educational Psychology & Psychometrics',
    columns: [
      { name: 'Student_ID', type: 'id', distinctCount: 60, missingCount: 0, sampleValues: [] },
      { name: 'Cognitive_Engagement', type: 'continuous', distinctCount: 0, missingCount: 0, sampleValues: [] },
      { name: 'Behavioral_Engagement', type: 'continuous', distinctCount: 0, missingCount: 0, sampleValues: [] },
      { name: 'Emotional_Engagement', type: 'continuous', distinctCount: 0, missingCount: 0, sampleValues: [] },
      { name: 'Self_Efficacy_Focus', type: 'continuous', distinctCount: 0, missingCount: 0, sampleValues: [] },
      { name: 'Self_Efficacy_Persistence', type: 'continuous', distinctCount: 0, missingCount: 0, sampleValues: [] },
      { name: 'Academic_Achievement', type: 'continuous', distinctCount: 0, missingCount: 0, sampleValues: [] },
    ],
    data: ADVANCED_MODELING_DATA,
    totalRows: 60,
  },
  ADVANCED_MODELING_DATA
);

export const TEST_SPECIFIC_STUDIES: Record<StatisticalTestType, TestSpecificStudyConfig> = {
  ...(BASE_TEST_SPECIFIC_STUDIES as Record<StatisticalTestType, TestSpecificStudyConfig>),
  ...(EXTENDED_STUDY_CONFIGS as Record<StatisticalTestType, TestSpecificStudyConfig>),

  // Tailored configurations for all distinct secondary procedures
  three_way_repeated_anova: {
    ...(EXTENDED_STUDY_CONFIGS.within_within_anova || BASE_TEST_SPECIFIC_STUDIES.repeated_measures_anova),
    researchQuestion: {
      id: 'rq-three-way-repeated',
      title: 'RQ: Three-Way Repeated Measures (2x2x2 Within-Subjects)',
      question: 'Do reaction times vary significantly across Task Complexity, Time-of-Day, and Stimulus Modality within subjects?',
      hypothesisNull: 'H₀: All within-subject main effects and three-way interaction equal zero.',
      hypothesisAlt: 'H₁: Significant three-way repeated measures interaction observed across conditions.',
      testType: 'three_way_repeated_anova',
    },
    explanation: 'Loaded 3-way within-subjects repeated measures dataset with multiple repeated trials per subject.',
  },

  three_way_mixed_anova: {
    ...(EXTENDED_STUDY_CONFIGS.three_way_anova || BASE_TEST_SPECIFIC_STUDIES.two_way_anova),
    researchQuestion: {
      id: 'rq-three-way-mixed',
      title: 'RQ: Three-Way Mixed ANOVA (1 Between, 2 Within)',
      question: 'Does the longitudinal recovery trajectory across therapy sessions differ between treatment cohorts?',
      hypothesisNull: 'H₀: No interaction between treatment cohort (between) and repeated measurement factors (within).',
      hypothesisAlt: 'H₁: Significant three-way mixed interaction between cohort and repeated factors.',
      testType: 'three_way_mixed_anova',
    },
    explanation: 'Loaded 3-way mixed factorial dataset with Between-Subjects Cohort and Within-Subjects Timepoints.',
  },

  two_way_manova: {
    ...(EXTENDED_STUDY_CONFIGS.one_way_manova || BASE_TEST_SPECIFIC_STUDIES.anova),
    researchQuestion: {
      id: 'rq-two-way-manova',
      title: 'RQ: Two-Way MANOVA (Factor A × Factor B on Multiple DVs)',
      question: 'Do Training Modality and Experience Level jointly impact composite cognitive performance vectors?',
      hypothesisNull: 'H₀: Vector of multivariate means is equal across all Factor A × Factor B cells.',
      hypothesisAlt: 'H₁: Significant multivariate interaction between Factor A and B on the dependent vectors.',
      testType: 'two_way_manova',
    },
    explanation: 'Loaded 2-way MANOVA dataset with multiple continuous outcome vectors across 2 categorical factors.',
  },

  one_way_mancova: {
    ...(EXTENDED_STUDY_CONFIGS.two_way_ancova || BASE_TEST_SPECIFIC_STUDIES.ancova),
    researchQuestion: {
      id: 'rq-one-way-mancova',
      title: 'RQ: One-Way MANCOVA (Multivariate ANCOVA with Covariate Control)',
      question: 'Do treatment cohorts differ on multiple psychological outcomes while controlling for baseline score?',
      hypothesisNull: 'H₀: Adjusted multivariate population centroid vectors are identical across cohorts.',
      hypothesisAlt: 'H₁: Adjusted multivariate centroids differ significantly after controlling for covariate.',
      testType: 'one_way_mancova',
    },
    explanation: 'Loaded one-way MANCOVA dataset with multivariate outcomes adjusted for baseline continuous covariate.',
  },

  chi_square_homogeneity_rx2: {
    ...(EXTENDED_STUDY_CONFIGS.chi_square_homogeneity_2xc || BASE_TEST_SPECIFIC_STUDIES.chi_square),
    researchQuestion: {
      id: 'rq-homogeneity-rx2',
      title: 'RQ: Chi-Square Test of Homogeneity (R × 2 Design)',
      question: 'Are binary success proportions homogeneous across R distinct institutional populations?',
      hypothesisNull: 'H₀: The binary proportion p is identical across all R populations (p₁ = p₂ = ... = p_R).',
      hypothesisAlt: 'H₁: At least two populations differ in their binary success proportions.',
      testType: 'chi_square_homogeneity_rx2',
    },
    explanation: 'Loaded R × 2 homogeneity contingency data evaluating binary outcomes across multiple populations.',
  },

  weighted_kappa: {
    ...(EXTENDED_STUDY_CONFIGS.cohens_kappa || BASE_TEST_SPECIFIC_STUDIES.cronbach_alpha),
    researchQuestion: {
      id: 'rq-weighted-kappa',
      title: 'RQ: Weighted Cohen’s Kappa (Ordinal Inter-Rater Agreement)',
      question: 'What is the quadratic-weighted inter-rater agreement between two clinical evaluators on disease stage?',
      hypothesisNull: 'H₀: Rater agreement does not exceed chance levels (κ_w = 0).',
      hypothesisAlt: 'H₁: Weighted inter-rater agreement is significantly greater than chance (κ_w > 0).',
      testType: 'weighted_kappa',
    },
    explanation: 'Loaded ordinal diagnostic staging data for weighted kappa evaluation penalizing larger disagreements.',
  },

  spearman_correlation: {
    ...BASE_TEST_SPECIFIC_STUDIES.correlation,
    correlationMethod: 'spearman',
    researchQuestion: {
      id: 'rq-spearman',
      title: 'RQ: Spearman’s Rank-Order Monotonic Association (r_s)',
      question: 'Is there a statistically significant monotonic association between ranked academic workload and stress?',
      hypothesisNull: 'H₀: There is no monotonic association between the ranked variables in the population (r_s = 0).',
      hypothesisAlt: 'H₁: A statistically significant monotonic association exists (r_s ≠ 0).',
      testType: 'spearman_correlation',
    },
    explanation: 'Loaded continuous/ordinal dataset preconfigured for Spearman non-parametric monotonic rank correlation.',
  },

  gamma_test: {
    ...(EXTENDED_STUDY_CONFIGS.kendalls_tau_b || BASE_TEST_SPECIFIC_STUDIES.correlation),
    researchQuestion: {
      id: 'rq-gamma',
      title: 'RQ: Goodman and Kruskal’s Gamma (γ)',
      question: 'What is the strength of monotonic association between two ordered polytomous categorical variables?',
      hypothesisNull: 'H₀: Concordant and discordant pairs are equally probable (γ = 0).',
      hypothesisAlt: 'H₁: Significant directional preponderance of concordant or discordant pairs (γ ≠ 0).',
      testType: 'gamma_test',
    },
    explanation: 'Loaded cross-classified ordered ordinal table evaluating Goodman and Kruskal’s gamma.',
  },

  somers_d: {
    ...(EXTENDED_STUDY_CONFIGS.kendalls_tau_b || BASE_TEST_SPECIFIC_STUDIES.correlation),
    researchQuestion: {
      id: 'rq-somers-d',
      title: 'RQ: Somers’ d Directional Association',
      question: 'To what extent does the ordinal predictor reduce prediction error in the ordinal criterion?',
      hypothesisNull: 'H₀: The directional Somers’ d statistic equals zero in the population.',
      hypothesisAlt: 'H₁: Significant asymmetric ordinal association between predictor and outcome.',
      testType: 'somers_d',
    },
    explanation: 'Loaded asymmetric ordinal contingency dataset for Somers’ d directional calculation.',
  },

  mantel_haenszel: {
    ...(EXTENDED_STUDY_CONFIGS.chi_square_homogeneity_2xc || BASE_TEST_SPECIFIC_STUDIES.chi_square),
    researchQuestion: {
      id: 'rq-mantel-haenszel',
      title: 'RQ: Mantel-Haenszel Test of Linear Trend',
      question: 'Is there a significant linear trend in outcome proportions across ordered exposure levels?',
      hypothesisNull: 'H₀: There is no linear trend in proportions across ordered exposure levels (M² = 0).',
      hypothesisAlt: 'H₁: Proportions exhibit a statistically significant linear monotonic increase or decrease.',
      testType: 'mantel_haenszel',
    },
    explanation: 'Loaded ordered exposure categories dataset for Mantel-Haenszel linear trend chi-square analysis.',
  },

  cochran_armitage: {
    ...(EXTENDED_STUDY_CONFIGS.chi_square_homogeneity_2xc || BASE_TEST_SPECIFIC_STUDIES.chi_square),
    researchQuestion: {
      id: 'rq-cochran-armitage',
      title: 'RQ: Cochran-Armitage Test for Trend',
      question: 'Does the incidence rate of adverse outcomes follow a monotonic dose-response trend across ordinal dosage?',
      hypothesisNull: 'H₀: The binomial proportion is constant across all ordered dose levels (slope β = 0).',
      hypothesisAlt: 'H₁: The proportion displays a monotonic increasing or decreasing linear trend across dose levels.',
      testType: 'cochran_armitage',
    },
    explanation: 'Loaded clinical dose-response contingency dataset for Cochran-Armitage ordinal trend analysis.',
  },

  chi_square_association_2x2: {
    ...(EXTENDED_STUDY_CONFIGS.fishers_exact || BASE_TEST_SPECIFIC_STUDIES.chi_square),
    researchQuestion: {
      id: 'rq-chi-sq-assoc-2x2',
      title: 'RQ: Chi-Square Test for Association (2 × 2 Contingency)',
      question: 'Is there a statistically significant association between binary intervention and binary recovery?',
      hypothesisNull: 'H₀: Intervention and recovery are completely independent (Odds Ratio = 1.0).',
      hypothesisAlt: 'H₁: Recovery rates depend significantly on intervention assignment.',
      testType: 'chi_square_association_2x2',
    },
    explanation: 'Loaded 2 × 2 binary trial table with continuity correction and Fisher’s exact validation.',
  },

  goodman_kruskal_lambda: {
    ...(EXTENDED_STUDY_CONFIGS.chi_square_homogeneity_2xc || BASE_TEST_SPECIFIC_STUDIES.chi_square),
    researchQuestion: {
      id: 'rq-lambda',
      title: 'RQ: Goodman and Kruskal’s Lambda (λ)',
      question: 'How much does knowledge of the nominal predictor reduce relative error in predicting nominal category?',
      hypothesisNull: 'H₀: Proportional reduction in prediction error is zero (λ = 0).',
      hypothesisAlt: 'H₁: The predictor achieves significant proportional reduction in category prediction error (λ > 0).',
      testType: 'goodman_kruskal_lambda',
    },
    explanation: 'Loaded nominal contingency matrix for Goodman and Kruskal’s asymmetric and symmetric lambda.',
  },

  loglinear: {
    ...(EXTENDED_STUDY_CONFIGS.three_way_anova || BASE_TEST_SPECIFIC_STUDIES.chi_square),
    researchQuestion: {
      id: 'rq-loglinear',
      title: 'RQ: Hierarchical Loglinear Analysis (Multi-Way Contingency)',
      question: 'Which higher-order categorical interactions are required to adequately reproduce multi-way cell frequencies?',
      hypothesisNull: 'H₀: The parsimonious loglinear model with restricted interactions fits the observed data adequately.',
      hypothesisAlt: 'H₁: Higher-order three-way interaction parameters are required for adequate data fit.',
      testType: 'loglinear',
    },
    explanation: 'Loaded multi-way cross-tabulated categorical frequency table for hierarchical loglinear modeling.',
  },


  data_transformation: {
    ...(EXTENDED_STUDY_CONFIGS.normality_test || BASE_TEST_SPECIFIC_STUDIES.descriptive),
    researchQuestion: {
      id: 'rq-data-transformation',
      title: 'RQ: Data Transformation (Log10, Square Root & Box-Cox)',
      question: 'Does mathematical data transformation reduce positive skewness and normalize non-normal variables?',
      hypothesisNull: 'H₀: Transformed variables continue to violate normality assumptions.',
      hypothesisAlt: 'H₁: Mathematical power transformation successfully restores normal Gaussian distributional symmetry.',
      testType: 'data_transformation',
    },
    explanation: 'Loaded skewed biomarker distribution dataset for comparative Log10, Sqrt, and Box-Cox normalization.',
  },

  exploratory_factor_analysis: {
    dataset: ADVANCED_MODELING_DATASET,
    recommendedMultiVars: [
      'Cognitive_Engagement',
      'Behavioral_Engagement',
      'Emotional_Engagement',
      'Self_Efficacy_Focus',
      'Self_Efficacy_Persistence',
      'Academic_Achievement',
    ],
    researchQuestion: {
      id: 'rq-preset-efa',
      title: 'RQ: Exploratory Factor Structure of Student Engagement & Efficacy',
      question: 'How many underlying latent dimensions account for the common variance among the academic engagement and self-efficacy indicators?',
      hypothesisNull: 'H₀: The correlation matrix is an identity matrix; no common latent factors underlie the observed indicators.',
      hypothesisAlt: 'H₁: At least two distinct common latent factors account for the observed psychometric covariance structure.',
      testType: 'exploratory_factor_analysis',
      multiVars: [
        'Cognitive_Engagement',
        'Behavioral_Engagement',
        'Emotional_Engagement',
        'Self_Efficacy_Focus',
        'Self_Efficacy_Persistence',
        'Academic_Achievement',
      ],
    },
    explanation: 'Loaded 6-indicator psychometric survey dataset for principal axis / maximum likelihood factor extraction and Varimax orthogonal rotation.',
  },

  confirmatory_factor_analysis: {
    dataset: ADVANCED_MODELING_DATASET,
    recommendedMultiVars: [
      'Cognitive_Engagement',
      'Behavioral_Engagement',
      'Emotional_Engagement',
      'Self_Efficacy_Focus',
      'Self_Efficacy_Persistence',
      'Academic_Achievement',
    ],
    researchQuestion: {
      id: 'rq-preset-cfa',
      title: 'RQ: Confirmatory Measurement Model Fit for Engagement & Self-Efficacy',
      question: 'Does the hypothesized two-factor measurement model (Engagement & Self-Efficacy) exhibit adequate goodness-of-fit to the observed data?',
      hypothesisNull: 'H₀: The hypothesized two-factor measurement model covariance matrix perfectly reproduces the observed sample covariance matrix (exact fit).',
      hypothesisAlt: 'H₁: The hypothesized measurement model covariance matrix significantly departs from the observed sample covariance matrix.',
      testType: 'confirmatory_factor_analysis',
      multiVars: [
        'Cognitive_Engagement',
        'Behavioral_Engagement',
        'Emotional_Engagement',
        'Self_Efficacy_Focus',
        'Self_Efficacy_Persistence',
        'Academic_Achievement',
      ],
    },
    explanation: 'Loaded two-factor latent measurement model assessing fit indices (CFI, TLI, RMSEA, SRMR) and standardized factor loadings.',
  },

  structural_equation_modeling: {
    dataset: ADVANCED_MODELING_DATASET,
    recommendedMultiVars: [
      'Cognitive_Engagement',
      'Behavioral_Engagement',
      'Emotional_Engagement',
      'Self_Efficacy_Focus',
      'Self_Efficacy_Persistence',
      'Academic_Achievement',
    ],
    recommendedIv: 'Cognitive_Engagement',
    recommendedDv: 'Academic_Achievement',
    researchQuestion: {
      id: 'rq-preset-sem',
      title: 'RQ: Structural Equation Path Model of Engagement, Self-Efficacy, and Achievement',
      question: 'Does student engagement directly and indirectly (via self-efficacy) predict academic achievement within a full structural equation model?',
      hypothesisNull: 'H₀: The structural regression paths between engagement, self-efficacy, and academic achievement equal zero (β = 0).',
      hypothesisAlt: 'H₁: Student engagement and self-efficacy significantly predict academic achievement with acceptable overall model fit.',
      testType: 'structural_equation_modeling',
      multiVars: [
        'Cognitive_Engagement',
        'Behavioral_Engagement',
        'Emotional_Engagement',
        'Self_Efficacy_Focus',
        'Self_Efficacy_Persistence',
        'Academic_Achievement',
      ],
      independentVar: 'Cognitive_Engagement',
      dependentVar: 'Academic_Achievement',
    },
    explanation: 'Loaded structural equation model evaluating direct, indirect, and total effects with full covariance structure and model fit metrics.',
  },
};

