import { Dataset, StatisticalTestType, ResearchQuestion, TestSpecificStudyConfig } from '../types/stats';
import { refreshDatasetMetadata } from '../utils/datasetEditor';

function buildExtendedDataset(
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

// 1. Three-Way ANOVA (2 x 2 x 2 Factorial)
const THREE_WAY_ANOVA_DATA: Record<string, any>[] = [
  { Subject_ID: 'T301', Age_Group: 'Young', Training_Type: 'Active', Noise_Level: 'Quiet', Recall_Score: 89.0 },
  { Subject_ID: 'T302', Age_Group: 'Young', Training_Type: 'Active', Noise_Level: 'Noisy', Recall_Score: 82.5 },
  { Subject_ID: 'T303', Age_Group: 'Young', Training_Type: 'Passive', Noise_Level: 'Quiet', Recall_Score: 78.0 },
  { Subject_ID: 'T304', Age_Group: 'Young', Training_Type: 'Passive', Noise_Level: 'Noisy', Recall_Score: 68.5 },
  { Subject_ID: 'T305', Age_Group: 'Older', Training_Type: 'Active', Noise_Level: 'Quiet', Recall_Score: 79.5 },
  { Subject_ID: 'T306', Age_Group: 'Older', Training_Type: 'Active', Noise_Level: 'Noisy', Recall_Score: 66.0 },
  { Subject_ID: 'T307', Age_Group: 'Older', Training_Type: 'Passive', Noise_Level: 'Quiet', Recall_Score: 69.0 },
  { Subject_ID: 'T308', Age_Group: 'Older', Training_Type: 'Passive', Noise_Level: 'Noisy', Recall_Score: 54.0 },
  { Subject_ID: 'T309', Age_Group: 'Young', Training_Type: 'Active', Noise_Level: 'Quiet', Recall_Score: 92.0 },
  { Subject_ID: 'T310', Age_Group: 'Young', Training_Type: 'Active', Noise_Level: 'Noisy', Recall_Score: 85.0 },
  { Subject_ID: 'T311', Age_Group: 'Young', Training_Type: 'Passive', Noise_Level: 'Quiet', Recall_Score: 76.5 },
  { Subject_ID: 'T312', Age_Group: 'Young', Training_Type: 'Passive', Noise_Level: 'Noisy', Recall_Score: 71.0 },
  { Subject_ID: 'T313', Age_Group: 'Older', Training_Type: 'Active', Noise_Level: 'Quiet', Recall_Score: 81.0 },
  { Subject_ID: 'T314', Age_Group: 'Older', Training_Type: 'Active', Noise_Level: 'Noisy', Recall_Score: 69.5 },
  { Subject_ID: 'T315', Age_Group: 'Older', Training_Type: 'Passive', Noise_Level: 'Quiet', Recall_Score: 71.5 },
  { Subject_ID: 'T316', Age_Group: 'Older', Training_Type: 'Passive', Noise_Level: 'Noisy', Recall_Score: 58.0 },
];

// 2. Within-Within-Subjects ANOVA (2 x 2 Repeated Factors)
const WITHIN_WITHIN_DATA: Record<string, any>[] = [
  { Participant_ID: 'WW01', HighSalience_LowDensity_RT: 340, HighSalience_HighDensity_RT: 395, LowSalience_LowDensity_RT: 460, LowSalience_HighDensity_RT: 580 },
  { Participant_ID: 'WW02', HighSalience_LowDensity_RT: 355, HighSalience_HighDensity_RT: 410, LowSalience_LowDensity_RT: 480, LowSalience_HighDensity_RT: 605 },
  { Participant_ID: 'WW03', HighSalience_LowDensity_RT: 325, HighSalience_HighDensity_RT: 380, LowSalience_LowDensity_RT: 445, LowSalience_HighDensity_RT: 560 },
  { Participant_ID: 'WW04', HighSalience_LowDensity_RT: 370, HighSalience_HighDensity_RT: 425, LowSalience_LowDensity_RT: 500, LowSalience_HighDensity_RT: 620 },
  { Participant_ID: 'WW05', HighSalience_LowDensity_RT: 345, HighSalience_HighDensity_RT: 400, LowSalience_LowDensity_RT: 470, LowSalience_HighDensity_RT: 590 },
  { Participant_ID: 'WW06', HighSalience_LowDensity_RT: 360, HighSalience_HighDensity_RT: 415, LowSalience_LowDensity_RT: 490, LowSalience_HighDensity_RT: 615 },
  { Participant_ID: 'WW07', HighSalience_LowDensity_RT: 330, HighSalience_HighDensity_RT: 390, LowSalience_LowDensity_RT: 450, LowSalience_HighDensity_RT: 570 },
  { Participant_ID: 'WW08', HighSalience_LowDensity_RT: 350, HighSalience_HighDensity_RT: 405, LowSalience_LowDensity_RT: 475, LowSalience_HighDensity_RT: 595 },
  { Participant_ID: 'WW09', HighSalience_LowDensity_RT: 365, HighSalience_HighDensity_RT: 420, LowSalience_LowDensity_RT: 495, LowSalience_HighDensity_RT: 610 },
  { Participant_ID: 'WW10', HighSalience_LowDensity_RT: 335, HighSalience_HighDensity_RT: 385, LowSalience_LowDensity_RT: 455, LowSalience_HighDensity_RT: 565 },
];

// 3. Mixed ANOVA (1 Between Factor x 1 Within Factor)
const MIXED_ANOVA_DATA: Record<string, any>[] = [
  { Subject_ID: 'M01', Intervention_Group: 'HIIT_Cardio', Baseline_VO2: 38.5, Week6_VO2: 44.0, Week12_VO2: 48.5 },
  { Subject_ID: 'M02', Intervention_Group: 'HIIT_Cardio', Baseline_VO2: 36.0, Week6_VO2: 41.5, Week12_VO2: 46.0 },
  { Subject_ID: 'M03', Intervention_Group: 'HIIT_Cardio', Baseline_VO2: 40.0, Week6_VO2: 46.5, Week12_VO2: 51.0 },
  { Subject_ID: 'M04', Intervention_Group: 'HIIT_Cardio', Baseline_VO2: 37.5, Week6_VO2: 43.0, Week12_VO2: 47.5 },
  { Subject_ID: 'M05', Intervention_Group: 'HIIT_Cardio', Baseline_VO2: 39.0, Week6_VO2: 45.0, Week12_VO2: 49.5 },
  { Subject_ID: 'M06', Intervention_Group: 'Standard_Control', Baseline_VO2: 37.0, Week6_VO2: 37.5, Week12_VO2: 38.0 },
  { Subject_ID: 'M07', Intervention_Group: 'Standard_Control', Baseline_VO2: 35.5, Week6_VO2: 36.0, Week12_VO2: 36.5 },
  { Subject_ID: 'M08', Intervention_Group: 'Standard_Control', Baseline_VO2: 39.5, Week6_VO2: 40.0, Week12_VO2: 40.5 },
  { Subject_ID: 'M09', Intervention_Group: 'Standard_Control', Baseline_VO2: 38.0, Week6_VO2: 38.5, Week12_VO2: 39.0 },
  { Subject_ID: 'M10', Intervention_Group: 'Standard_Control', Baseline_VO2: 36.5, Week6_VO2: 37.0, Week12_VO2: 37.5 },
];

// 4. Hotelling's T2 (2 Independent Groups on 2 Multivariate DVs)
const HOTELLINGS_T2_DATA: Record<string, any>[] = [
  { Executive_ID: 'EX101', Training_Program: 'Cognitive_Agility', Processing_Speed_Index: 118, Executive_Working_Memory: 122 },
  { Executive_ID: 'EX102', Training_Program: 'Cognitive_Agility', Processing_Speed_Index: 114, Executive_Working_Memory: 119 },
  { Executive_ID: 'EX103', Training_Program: 'Cognitive_Agility', Processing_Speed_Index: 122, Executive_Working_Memory: 126 },
  { Executive_ID: 'EX104', Training_Program: 'Cognitive_Agility', Processing_Speed_Index: 116, Executive_Working_Memory: 120 },
  { Executive_ID: 'EX105', Training_Program: 'Cognitive_Agility', Processing_Speed_Index: 120, Executive_Working_Memory: 124 },
  { Executive_ID: 'EX106', Training_Program: 'Cognitive_Agility', Processing_Speed_Index: 112, Executive_Working_Memory: 116 },
  { Executive_ID: 'EX107', Training_Program: 'Waitlist_Control', Processing_Speed_Index: 101, Executive_Working_Memory: 104 },
  { Executive_ID: 'EX108', Training_Program: 'Waitlist_Control', Processing_Speed_Index: 98, Executive_Working_Memory: 100 },
  { Executive_ID: 'EX109', Training_Program: 'Waitlist_Control', Processing_Speed_Index: 105, Executive_Working_Memory: 107 },
  { Executive_ID: 'EX110', Training_Program: 'Waitlist_Control', Processing_Speed_Index: 102, Executive_Working_Memory: 103 },
  { Executive_ID: 'EX111', Training_Program: 'Waitlist_Control', Processing_Speed_Index: 99, Executive_Working_Memory: 102 },
  { Executive_ID: 'EX112', Training_Program: 'Waitlist_Control', Processing_Speed_Index: 104, Executive_Working_Memory: 106 },
];

// 5. One-Way MANOVA (3 Groups on 3 Dependent Variables)
const ONE_WAY_MANOVA_DATA: Record<string, any>[] = [
  { Student_ID: 'MAN01', Academic_Track: 'STEM', Math_Fluency: 88, Science_Reasoning: 91, Verbal_Aptitude: 74 },
  { Student_ID: 'MAN02', Academic_Track: 'STEM', Math_Fluency: 85, Science_Reasoning: 89, Verbal_Aptitude: 76 },
  { Student_ID: 'MAN03', Academic_Track: 'STEM', Math_Fluency: 92, Science_Reasoning: 95, Verbal_Aptitude: 72 },
  { Student_ID: 'MAN04', Academic_Track: 'Humanities', Math_Fluency: 70, Science_Reasoning: 72, Verbal_Aptitude: 94 },
  { Student_ID: 'MAN05', Academic_Track: 'Humanities', Math_Fluency: 73, Science_Reasoning: 75, Verbal_Aptitude: 91 },
  { Student_ID: 'MAN06', Academic_Track: 'Humanities', Math_Fluency: 68, Science_Reasoning: 71, Verbal_Aptitude: 96 },
  { Student_ID: 'MAN07', Academic_Track: 'Arts_Design', Math_Fluency: 75, Science_Reasoning: 78, Verbal_Aptitude: 85 },
  { Student_ID: 'MAN08', Academic_Track: 'Arts_Design', Math_Fluency: 77, Science_Reasoning: 80, Verbal_Aptitude: 87 },
  { Student_ID: 'MAN09', Academic_Track: 'Arts_Design', Math_Fluency: 72, Science_Reasoning: 76, Verbal_Aptitude: 83 },
];

// 6. Two-Way ANCOVA (2x2 with continuous covariate)
const TWO_WAY_ANCOVA_DATA: Record<string, any>[] = [
  { Student_ID: 'ANCO01', Instruction_Method: 'Inquiry', Class_Level: 'Honor', Prior_Baseline_GPA: 3.4, Final_Exam_Grade: 91.5 },
  { Student_ID: 'ANCO02', Instruction_Method: 'Inquiry', Class_Level: 'Honor', Prior_Baseline_GPA: 3.6, Final_Exam_Grade: 94.0 },
  { Student_ID: 'ANCO03', Instruction_Method: 'Inquiry', Class_Level: 'Standard', Prior_Baseline_GPA: 2.8, Final_Exam_Grade: 83.5 },
  { Student_ID: 'ANCO04', Instruction_Method: 'Inquiry', Class_Level: 'Standard', Prior_Baseline_GPA: 3.0, Final_Exam_Grade: 86.0 },
  { Student_ID: 'ANCO05', Instruction_Method: 'Direct', Class_Level: 'Honor', Prior_Baseline_GPA: 3.5, Final_Exam_Grade: 87.0 },
  { Student_ID: 'ANCO06', Instruction_Method: 'Direct', Class_Level: 'Honor', Prior_Baseline_GPA: 3.7, Final_Exam_Grade: 89.5 },
  { Student_ID: 'ANCO07', Instruction_Method: 'Direct', Class_Level: 'Standard', Prior_Baseline_GPA: 2.9, Final_Exam_Grade: 78.0 },
  { Student_ID: 'ANCO08', Instruction_Method: 'Direct', Class_Level: 'Standard', Prior_Baseline_GPA: 3.1, Final_Exam_Grade: 80.5 },
];

// 7. Jonckheere-Terpstra Test (Ordered categorical treatment)
const JONCKHEERE_DATA: Record<string, any>[] = [
  { Patient_ID: 'JT01', Drug_Dose_Ordered: 'Placebo_0mg', Tremor_Reduction_Score: 12 },
  { Patient_ID: 'JT02', Drug_Dose_Ordered: 'Placebo_0mg', Tremor_Reduction_Score: 15 },
  { Patient_ID: 'JT03', Drug_Dose_Ordered: 'Placebo_0mg', Tremor_Reduction_Score: 11 },
  { Patient_ID: 'JT04', Drug_Dose_Ordered: 'Low_10mg', Tremor_Reduction_Score: 22 },
  { Patient_ID: 'JT05', Drug_Dose_Ordered: 'Low_10mg', Tremor_Reduction_Score: 26 },
  { Patient_ID: 'JT06', Drug_Dose_Ordered: 'Low_10mg', Tremor_Reduction_Score: 20 },
  { Patient_ID: 'JT07', Drug_Dose_Ordered: 'Medium_25mg', Tremor_Reduction_Score: 35 },
  { Patient_ID: 'JT08', Drug_Dose_Ordered: 'Medium_25mg', Tremor_Reduction_Score: 39 },
  { Patient_ID: 'JT09', Drug_Dose_Ordered: 'Medium_25mg', Tremor_Reduction_Score: 33 },
  { Patient_ID: 'JT10', Drug_Dose_Ordered: 'High_50mg', Tremor_Reduction_Score: 48 },
  { Patient_ID: 'JT11', Drug_Dose_Ordered: 'High_50mg', Tremor_Reduction_Score: 52 },
  { Patient_ID: 'JT12', Drug_Dose_Ordered: 'High_50mg', Tremor_Reduction_Score: 46 },
];

// 8. McNemar's Test (Paired Dichotomous Pre vs Post)
const MCNEMAR_DATA: Record<string, any>[] = [
  { Voter_ID: 'V01', Pre_Campaign_Approval: 'Approve', Post_Campaign_Approval: 'Approve' },
  { Voter_ID: 'V02', Pre_Campaign_Approval: 'Disapprove', Post_Campaign_Approval: 'Approve' },
  { Voter_ID: 'V03', Pre_Campaign_Approval: 'Disapprove', Post_Campaign_Approval: 'Approve' },
  { Voter_ID: 'V04', Pre_Campaign_Approval: 'Disapprove', Post_Campaign_Approval: 'Approve' },
  { Voter_ID: 'V05', Pre_Campaign_Approval: 'Disapprove', Post_Campaign_Approval: 'Approve' },
  { Voter_ID: 'V06', Pre_Campaign_Approval: 'Disapprove', Post_Campaign_Approval: 'Disapprove' },
  { Voter_ID: 'V07', Pre_Campaign_Approval: 'Approve', Post_Campaign_Approval: 'Disapprove' },
  { Voter_ID: 'V08', Pre_Campaign_Approval: 'Disapprove', Post_Campaign_Approval: 'Approve' },
  { Voter_ID: 'V09', Pre_Campaign_Approval: 'Disapprove', Post_Campaign_Approval: 'Approve' },
  { Voter_ID: 'V10', Pre_Campaign_Approval: 'Approve', Post_Campaign_Approval: 'Approve' },
];

// 9. Cochran's Q Test (3 Related Dichotomous Conditions)
const COCHRANS_Q_DATA: Record<string, any>[] = [
  { User_ID: 'U01', Interface_Classic: 'Fail', Interface_Modern: 'Pass', Interface_Minimalist: 'Pass' },
  { User_ID: 'U02', Interface_Classic: 'Fail', Interface_Modern: 'Pass', Interface_Minimalist: 'Pass' },
  { User_ID: 'U03', Interface_Classic: 'Pass', Interface_Modern: 'Pass', Interface_Minimalist: 'Pass' },
  { User_ID: 'U04', Interface_Classic: 'Fail', Interface_Modern: 'Fail', Interface_Minimalist: 'Pass' },
  { User_ID: 'U05', Interface_Classic: 'Fail', Interface_Modern: 'Pass', Interface_Minimalist: 'Pass' },
  { User_ID: 'U06', Interface_Classic: 'Fail', Interface_Modern: 'Pass', Interface_Minimalist: 'Pass' },
  { User_ID: 'U07', Interface_Classic: 'Fail', Interface_Modern: 'Fail', Interface_Minimalist: 'Pass' },
  { User_ID: 'U08', Interface_Classic: 'Pass', Interface_Modern: 'Pass', Interface_Minimalist: 'Pass' },
  { User_ID: 'U09', Interface_Classic: 'Fail', Interface_Modern: 'Pass', Interface_Minimalist: 'Pass' },
  { User_ID: 'U10', Interface_Classic: 'Fail', Interface_Modern: 'Pass', Interface_Minimalist: 'Pass' },
];

// 10. Sign Test (Matched Pairs Ordinal Differences)
const SIGN_TEST_DATA: Record<string, any>[] = [
  { Client_ID: 'CL01', Rating_Before_Renovation: 4, Rating_After_Renovation: 8 },
  { Client_ID: 'CL02', Rating_Before_Renovation: 3, Rating_After_Renovation: 7 },
  { Client_ID: 'CL03', Rating_Before_Renovation: 5, Rating_After_Renovation: 8 },
  { Client_ID: 'CL04', Rating_Before_Renovation: 6, Rating_After_Renovation: 9 },
  { Client_ID: 'CL05', Rating_Before_Renovation: 4, Rating_After_Renovation: 7 },
  { Client_ID: 'CL06', Rating_Before_Renovation: 5, Rating_After_Renovation: 5 },
  { Client_ID: 'CL07', Rating_Before_Renovation: 3, Rating_After_Renovation: 6 },
  { Client_ID: 'CL08', Rating_Before_Renovation: 4, Rating_After_Renovation: 8 },
];

// 11. Test of Two Proportions
const TWO_PROPORTIONS_DATA: Record<string, any>[] = [
  { Visitor_ID: 'VIS101', Landing_Page_Version: 'Design_A', Subscription_Converted: 'Yes' },
  { Visitor_ID: 'VIS102', Landing_Page_Version: 'Design_A', Subscription_Converted: 'No' },
  { Visitor_ID: 'VIS103', Landing_Page_Version: 'Design_A', Subscription_Converted: 'No' },
  { Visitor_ID: 'VIS104', Landing_Page_Version: 'Design_A', Subscription_Converted: 'Yes' },
  { Visitor_ID: 'VIS105', Landing_Page_Version: 'Design_A', Subscription_Converted: 'No' },
  { Visitor_ID: 'VIS106', Landing_Page_Version: 'Design_B', Subscription_Converted: 'Yes' },
  { Visitor_ID: 'VIS107', Landing_Page_Version: 'Design_B', Subscription_Converted: 'Yes' },
  { Visitor_ID: 'VIS108', Landing_Page_Version: 'Design_B', Subscription_Converted: 'Yes' },
  { Visitor_ID: 'VIS109', Landing_Page_Version: 'Design_B', Subscription_Converted: 'Yes' },
  { Visitor_ID: 'VIS110', Landing_Page_Version: 'Design_B', Subscription_Converted: 'No' },
];

// 12. Chi-Square Test of Homogeneity (2 x C)
const HOMOGENEITY_2XC_DATA: Record<string, any>[] = [
  { Shopper_ID: 'SH01', Geographic_Region: 'Urban', Preferred_Payment: 'Mobile_Pay' },
  { Shopper_ID: 'SH02', Geographic_Region: 'Urban', Preferred_Payment: 'Mobile_Pay' },
  { Shopper_ID: 'SH03', Geographic_Region: 'Urban', Preferred_Payment: 'Credit_Card' },
  { Shopper_ID: 'SH04', Geographic_Region: 'Urban', Preferred_Payment: 'Crypto' },
  { Shopper_ID: 'SH05', Geographic_Region: 'Rural', Preferred_Payment: 'Cash' },
  { Shopper_ID: 'SH06', Geographic_Region: 'Rural', Preferred_Payment: 'Cash' },
  { Shopper_ID: 'SH07', Geographic_Region: 'Rural', Preferred_Payment: 'Debit_Card' },
  { Shopper_ID: 'SH08', Geographic_Region: 'Rural', Preferred_Payment: 'Credit_Card' },
];

// 13. Kaplan-Meier Survival Analysis
const KAPLAN_MEIER_DATA: Record<string, any>[] = [
  { Patient_ID: 'KM01', Survival_Months: 4.5, Event_Occurred: 'Died', Treatment_Arm: 'Novel_Immunotherapy' },
  { Patient_ID: 'KM02', Survival_Months: 12.0, Event_Occurred: 'Censored', Treatment_Arm: 'Novel_Immunotherapy' },
  { Patient_ID: 'KM03', Survival_Months: 18.5, Event_Occurred: 'Censored', Treatment_Arm: 'Novel_Immunotherapy' },
  { Patient_ID: 'KM04', Survival_Months: 9.2, Event_Occurred: 'Died', Treatment_Arm: 'Novel_Immunotherapy' },
  { Patient_ID: 'KM05', Survival_Months: 24.0, Event_Occurred: 'Censored', Treatment_Arm: 'Novel_Immunotherapy' },
  { Patient_ID: 'KM06', Survival_Months: 2.1, Event_Occurred: 'Died', Treatment_Arm: 'Standard_Chemo' },
  { Patient_ID: 'KM07', Survival_Months: 5.4, Event_Occurred: 'Died', Treatment_Arm: 'Standard_Chemo' },
  { Patient_ID: 'KM08', Survival_Months: 8.0, Event_Occurred: 'Died', Treatment_Arm: 'Standard_Chemo' },
  { Patient_ID: 'KM09', Survival_Months: 10.5, Event_Occurred: 'Censored', Treatment_Arm: 'Standard_Chemo' },
  { Patient_ID: 'KM10', Survival_Months: 3.8, Event_Occurred: 'Died', Treatment_Arm: 'Standard_Chemo' },
];

// 14. Cohen's Kappa (Inter-Rater Reliability: 2 Raters)
const COHENS_KAPPA_DATA: Record<string, any>[] = [
  { Patient_ID: 'CK01', Clinical_Psychologist_A: 'Major_Depression', Clinical_Psychologist_B: 'Major_Depression' },
  { Patient_ID: 'CK02', Clinical_Psychologist_A: 'Generalized_Anxiety', Clinical_Psychologist_B: 'Generalized_Anxiety' },
  { Patient_ID: 'CK03', Clinical_Psychologist_A: 'Bipolar_II', Clinical_Psychologist_B: 'Bipolar_II' },
  { Patient_ID: 'CK04', Clinical_Psychologist_A: 'Major_Depression', Clinical_Psychologist_B: 'Generalized_Anxiety' },
  { Patient_ID: 'CK05', Clinical_Psychologist_A: 'Healthy_Control', Clinical_Psychologist_B: 'Healthy_Control' },
  { Patient_ID: 'CK06', Clinical_Psychologist_A: 'Major_Depression', Clinical_Psychologist_B: 'Major_Depression' },
  { Patient_ID: 'CK07', Clinical_Psychologist_A: 'Generalized_Anxiety', Clinical_Psychologist_B: 'Generalized_Anxiety' },
  { Patient_ID: 'CK08', Clinical_Psychologist_A: 'Bipolar_II', Clinical_Psychologist_B: 'Bipolar_II' },
];

// 15. Fleiss' Kappa (Multi-Rater Agreement: 3+ Raters)
const FLEISS_KAPPA_DATA: Record<string, any>[] = [
  { Sample_Scan_ID: 'FL01', Radiologist_1: 'Malignant', Radiologist_2: 'Malignant', Radiologist_3: 'Malignant' },
  { Sample_Scan_ID: 'FL02', Radiologist_1: 'Benign', Radiologist_2: 'Benign', Radiologist_3: 'Benign' },
  { Sample_Scan_ID: 'FL03', Radiologist_1: 'Atypical', Radiologist_2: 'Atypical', Radiologist_3: 'Benign' },
  { Sample_Scan_ID: 'FL04', Radiologist_1: 'Malignant', Radiologist_2: 'Malignant', Radiologist_3: 'Atypical' },
  { Sample_Scan_ID: 'FL05', Radiologist_1: 'Benign', Radiologist_2: 'Benign', Radiologist_3: 'Benign' },
];

// 16. Kendall's W (Coefficient of Concordance: Judges ranking targets)
const KENDALLS_W_DATA: Record<string, any>[] = [
  { Finalist_Project: 'App_AI_Health', Judge_1_Rank: 1, Judge_2_Rank: 1, Judge_3_Rank: 2, Judge_4_Rank: 1 },
  { Finalist_Project: 'Clean_Water_Filter', Judge_1_Rank: 2, Judge_2_Rank: 2, Judge_3_Rank: 1, Judge_4_Rank: 2 },
  { Finalist_Project: 'Solar_Grid_Optimizer', Judge_1_Rank: 3, Judge_2_Rank: 4, Judge_3_Rank: 3, Judge_4_Rank: 3 },
  { Finalist_Project: 'Drone_Pollination', Judge_1_Rank: 4, Judge_2_Rank: 3, Judge_3_Rank: 4, Judge_4_Rank: 5 },
  { Finalist_Project: 'Bio_Plastic_Wrap', Judge_1_Rank: 5, Judge_2_Rank: 5, Judge_3_Rank: 5, Judge_4_Rank: 4 },
];

// 17. Hierarchical Multiple Regression (Block Entry)
const HIERARCHICAL_REG_DATA: Record<string, any>[] = [
  { Employee_ID: 'HR01', Age: 28, Years_Tenure: 2.5, Workload_Hours: 48, Emotional_Exhaustion: 32, Job_Burnout_Score: 68 },
  { Employee_ID: 'HR02', Age: 42, Years_Tenure: 12.0, Workload_Hours: 42, Emotional_Exhaustion: 18, Job_Burnout_Score: 42 },
  { Employee_ID: 'HR03', Age: 35, Years_Tenure: 6.0, Workload_Hours: 55, Emotional_Exhaustion: 41, Job_Burnout_Score: 84 },
  { Employee_ID: 'HR04', Age: 50, Years_Tenure: 18.0, Workload_Hours: 38, Emotional_Exhaustion: 14, Job_Burnout_Score: 35 },
  { Employee_ID: 'HR05', Age: 31, Years_Tenure: 4.0, Workload_Hours: 52, Emotional_Exhaustion: 36, Job_Burnout_Score: 76 },
  { Employee_ID: 'HR06', Age: 46, Years_Tenure: 14.5, Workload_Hours: 45, Emotional_Exhaustion: 24, Job_Burnout_Score: 50 },
];

// 18. Ordinal Logistic Regression
const ORDINAL_REG_DATA: Record<string, any>[] = [
  { Patient_ID: 'ORD01', Age: 62, Biomarker_Concentration: 45.2, Smoking_History_PackYears: 20, Osteoarthritis_Stage: 'Severe' },
  { Patient_ID: 'ORD02', Age: 48, Biomarker_Concentration: 24.1, Smoking_History_PackYears: 5, Osteoarthritis_Stage: 'Mild' },
  { Patient_ID: 'ORD03', Age: 55, Biomarker_Concentration: 33.8, Smoking_History_PackYears: 12, Osteoarthritis_Stage: 'Moderate' },
  { Patient_ID: 'ORD04', Age: 70, Biomarker_Concentration: 51.0, Smoking_History_PackYears: 28, Osteoarthritis_Stage: 'Severe' },
  { Patient_ID: 'ORD05', Age: 42, Biomarker_Concentration: 18.5, Smoking_History_PackYears: 0, Osteoarthritis_Stage: 'Mild' },
  { Patient_ID: 'ORD06', Age: 58, Biomarker_Concentration: 37.4, Smoking_History_PackYears: 15, Osteoarthritis_Stage: 'Moderate' },
];

// 19. Point-Biserial Correlation (Binary vs Continuous)
const POINT_BISERIAL_DATA: Record<string, any>[] = [
  { Cadet_ID: 'PB01', Flight_Simulator_Certified: 'Certified_1', Spatial_Orientation_Score: 94.5 },
  { Cadet_ID: 'PB02', Flight_Simulator_Certified: 'Certified_1', Spatial_Orientation_Score: 91.0 },
  { Cadet_ID: 'PB03', Flight_Simulator_Certified: 'Certified_1', Spatial_Orientation_Score: 88.5 },
  { Cadet_ID: 'PB04', Flight_Simulator_Certified: 'Uncertified_0', Spatial_Orientation_Score: 68.0 },
  { Cadet_ID: 'PB05', Flight_Simulator_Certified: 'Uncertified_0', Spatial_Orientation_Score: 72.5 },
  { Cadet_ID: 'PB06', Flight_Simulator_Certified: 'Uncertified_0', Spatial_Orientation_Score: 65.0 },
];

// 20. Pearson's Partial Correlation (Controlling for Covariate)
const PARTIAL_CORR_DATA: Record<string, any>[] = [
  { Student_ID: 'PC01', Revision_Hours: 24, Final_Exam_Grade: 88, Test_Anxiety_Score: 32 },
  { Student_ID: 'PC02', Revision_Hours: 12, Final_Exam_Grade: 62, Test_Anxiety_Score: 54 },
  { Student_ID: 'PC03', Revision_Hours: 18, Final_Exam_Grade: 79, Test_Anxiety_Score: 40 },
  { Student_ID: 'PC04', Revision_Hours: 30, Final_Exam_Grade: 95, Test_Anxiety_Score: 22 },
  { Student_ID: 'PC05', Revision_Hours: 10, Final_Exam_Grade: 58, Test_Anxiety_Score: 60 },
  { Student_ID: 'PC06', Revision_Hours: 21, Final_Exam_Grade: 83, Test_Anxiety_Score: 36 },
];

// 21. Kendall's tau-b (Rank correlation with ties)
const KENDALLS_TAUB_DATA: Record<string, any>[] = [
  { Employee_ID: 'KT01', Job_Seniority_Rank: 1, Salary_Tier_Rank: 1 },
  { Employee_ID: 'KT02', Job_Seniority_Rank: 2, Salary_Tier_Rank: 2 },
  { Employee_ID: 'KT03', Job_Seniority_Rank: 3, Salary_Tier_Rank: 3 },
  { Employee_ID: 'KT04', Job_Seniority_Rank: 4, Salary_Tier_Rank: 3 },
  { Employee_ID: 'KT05', Job_Seniority_Rank: 5, Salary_Tier_Rank: 4 },
  { Employee_ID: 'KT06', Job_Seniority_Rank: 6, Salary_Tier_Rank: 5 },
];

// 22. Fisher's Exact Test (2x2 Independence for Small Expected Frequencies)
const FISHERS_EXACT_DATA: Record<string, any>[] = [
  { Patient_ID: 'FE01', Rare_Gene_Mutation: 'Mutated', Severe_Toxicity: 'Toxic' },
  { Patient_ID: 'FE02', Rare_Gene_Mutation: 'Mutated', Severe_Toxicity: 'Toxic' },
  { Patient_ID: 'FE03', Rare_Gene_Mutation: 'Mutated', Severe_Toxicity: 'Toxic' },
  { Patient_ID: 'FE04', Rare_Gene_Mutation: 'Mutated', Severe_Toxicity: 'Tolerated' },
  { Patient_ID: 'FE05', Rare_Gene_Mutation: 'Wildtype', Severe_Toxicity: 'Toxic' },
  { Patient_ID: 'FE06', Rare_Gene_Mutation: 'Wildtype', Severe_Toxicity: 'Tolerated' },
  { Patient_ID: 'FE07', Rare_Gene_Mutation: 'Wildtype', Severe_Toxicity: 'Tolerated' },
  { Patient_ID: 'FE08', Rare_Gene_Mutation: 'Wildtype', Severe_Toxicity: 'Tolerated' },
];

// 23. Relative Risk and Odds Ratio (2x2 Epidemiological Study)
const EPIDEMIOLOGY_2X2_DATA: Record<string, any>[] = [
  { Case_ID: 'EP01', Environmental_Hazard_Exposure: 'Exposed', Respiratory_Condition: 'Diseased' },
  { Case_ID: 'EP02', Environmental_Hazard_Exposure: 'Exposed', Respiratory_Condition: 'Diseased' },
  { Case_ID: 'EP03', Environmental_Hazard_Exposure: 'Exposed', Respiratory_Condition: 'Healthy' },
  { Case_ID: 'EP04', Environmental_Hazard_Exposure: 'Unexposed', Respiratory_Condition: 'Diseased' },
  { Case_ID: 'EP05', Environmental_Hazard_Exposure: 'Unexposed', Respiratory_Condition: 'Healthy' },
  { Case_ID: 'EP06', Environmental_Hazard_Exposure: 'Unexposed', Respiratory_Condition: 'Healthy' },
  { Case_ID: 'EP07', Environmental_Hazard_Exposure: 'Unexposed', Respiratory_Condition: 'Healthy' },
  { Case_ID: 'EP08', Environmental_Hazard_Exposure: 'Unexposed', Respiratory_Condition: 'Healthy' },
];

// 24. Principal Components Analysis (PCA / Data Reduction)
const PCA_DATA: Record<string, any>[] = [
  { Subject_ID: 'PCA01', Verbal_Comprehension: 88, Working_Memory: 84, Spatial_Rotation: 45, Matrix_Reasoning: 52 },
  { Subject_ID: 'PCA02', Verbal_Comprehension: 92, Working_Memory: 89, Spatial_Rotation: 41, Matrix_Reasoning: 48 },
  { Subject_ID: 'PCA03', Verbal_Comprehension: 48, Working_Memory: 55, Spatial_Rotation: 90, Matrix_Reasoning: 94 },
  { Subject_ID: 'PCA04', Verbal_Comprehension: 52, Working_Memory: 58, Spatial_Rotation: 86, Matrix_Reasoning: 91 },
  { Subject_ID: 'PCA05', Verbal_Comprehension: 85, Working_Memory: 81, Spatial_Rotation: 49, Matrix_Reasoning: 55 },
  { Subject_ID: 'PCA06', Verbal_Comprehension: 50, Working_Memory: 53, Spatial_Rotation: 88, Matrix_Reasoning: 89 },
];

// 25. Testing for Normality (Shapiro-Wilk & Kolmogorov-Smirnov)
const NORMALITY_DATA: Record<string, any>[] = [
  { Specimen_ID: 'N01', Fasting_Blood_Glucose: 88.5, Serum_Cortisol: 14.2 },
  { Specimen_ID: 'N02', Fasting_Blood_Glucose: 92.0, Serum_Cortisol: 15.8 },
  { Specimen_ID: 'N03', Fasting_Blood_Glucose: 86.0, Serum_Cortisol: 13.5 },
  { Specimen_ID: 'N04', Fasting_Blood_Glucose: 95.5, Serum_Cortisol: 16.9 },
  { Specimen_ID: 'N05', Fasting_Blood_Glucose: 90.0, Serum_Cortisol: 15.0 },
  { Specimen_ID: 'N06', Fasting_Blood_Glucose: 89.0, Serum_Cortisol: 14.7 },
  { Specimen_ID: 'N07', Fasting_Blood_Glucose: 93.5, Serum_Cortisol: 16.1 },
  { Specimen_ID: 'N08', Fasting_Blood_Glucose: 87.5, Serum_Cortisol: 13.9 },
];

// 26. Moderation Analysis (Dichotomous & Continuous Moderator)
const MODERATION_DATA: Record<string, any>[] = [
  { Participant_ID: 'MOD01', Work_Stress_Level: 42, Social_Support_Binary: 'High_Support', Depressive_Symptoms: 18 },
  { Participant_ID: 'MOD02', Work_Stress_Level: 48, Social_Support_Binary: 'Low_Support', Depressive_Symptoms: 38 },
  { Participant_ID: 'MOD03', Work_Stress_Level: 35, Social_Support_Binary: 'High_Support', Depressive_Symptoms: 14 },
  { Participant_ID: 'MOD04', Work_Stress_Level: 52, Social_Support_Binary: 'Low_Support', Depressive_Symptoms: 44 },
  { Participant_ID: 'MOD05', Work_Stress_Level: 39, Social_Support_Binary: 'High_Support', Depressive_Symptoms: 16 },
  { Participant_ID: 'MOD06', Work_Stress_Level: 55, Social_Support_Binary: 'Low_Support', Depressive_Symptoms: 48 },
];

export const EXTENDED_STUDY_CONFIGS: Partial<Record<StatisticalTestType, TestSpecificStudyConfig>> = {
  three_way_anova: {
    dataset: buildExtendedDataset(
      'study-preset-three-way-anova',
      'Cognitive Recall: Age x Training x Noise 2x2x2 Factorial Study',
      'Cognitive psychology experimental dataset investigating three-way interaction effects among participant age group, cognitive training modality, and environmental acoustic noise on verbal recall.',
      'Cognitive Psychology & Neuroscience',
      THREE_WAY_ANOVA_DATA,
      { Subject_ID: 'id', Age_Group: 'categorical', Training_Type: 'categorical', Noise_Level: 'categorical', Recall_Score: 'continuous' }
    ),
    recommendedDv: 'Recall_Score',
    recommendedIv: 'Age_Group',
    recommendedFactorB: 'Training_Type',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-three-way-anova',
      title: 'RQ: Three-Way Interaction in Recall Performance',
      question: 'Is there a significant three-way interaction between Age Group, Training Type, and Acoustic Noise on cognitive recall scores?',
      hypothesisNull: 'H₀: The effect of training on recall across noise conditions does not differ between age groups.',
      hypothesisAlt: 'H₁: A significant three-way interaction exists among Age, Training, and Noise.',
      testType: 'three_way_anova',
      dependentVar: 'Recall_Score',
      independentVar: 'Age_Group',
    },
    explanation: 'Loaded 2x2x2 factorial dataset with Age_Group, Training_Type, Noise_Level, and Recall_Score.',
  },

  within_within_anova: {
    dataset: buildExtendedDataset(
      'study-preset-within-within-anova',
      'Visual Search Latency: Salience x Distractor Density Within-Subjects Study',
      'Psychophysics dataset tracking human visual search latencies across 4 repeated combinations of target salience and distractor density.',
      'Vision Science & Perceptual Psychophysics',
      WITHIN_WITHIN_DATA,
      { Participant_ID: 'id', HighSalience_LowDensity_RT: 'continuous', HighSalience_HighDensity_RT: 'continuous', LowSalience_LowDensity_RT: 'continuous', LowSalience_HighDensity_RT: 'continuous' }
    ),
    recommendedMultiVars: ['HighSalience_LowDensity_RT', 'HighSalience_HighDensity_RT', 'LowSalience_LowDensity_RT', 'LowSalience_HighDensity_RT'],
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-within-within-anova',
      title: 'RQ: Within-Subjects Salience by Density Interaction',
      question: 'Do reaction times vary significantly across repeated combinations of target salience and background distractor density?',
      hypothesisNull: 'H₀: Repeated reaction time means are equal across all within-subject combinations.',
      hypothesisAlt: 'H₁: Significant main and interaction effects occur within participants.',
      testType: 'within_within_anova',
    },
    explanation: 'Loaded 2x2 fully repeated measures dataset with 4 within-subject reaction time conditions.',
  },

  mixed_anova: {
    dataset: buildExtendedDataset(
      'study-preset-mixed-anova',
      'Aerobic Capacity Progression: HIIT vs Control Across 3 Timepoints',
      'Exercise physiology dataset measuring VO2 max changes across Baseline, Week 6, and Week 12 between high-intensity training and standard control participants.',
      'Exercise Physiology & Sports Medicine',
      MIXED_ANOVA_DATA,
      { Subject_ID: 'id', Intervention_Group: 'categorical', Baseline_VO2: 'continuous', Week6_VO2: 'continuous', Week12_VO2: 'continuous' }
    ),
    recommendedIv: 'Intervention_Group',
    recommendedMultiVars: ['Baseline_VO2', 'Week6_VO2', 'Week12_VO2'],
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-mixed-anova',
      title: 'RQ: Time x Group Interaction on Aerobic Fitness',
      question: 'Does aerobic capacity (VO2 max) increase at a significantly higher rate over 12 weeks in the HIIT group compared to control?',
      hypothesisNull: 'H₀: The rate of VO2 max change across time is identical between groups.',
      hypothesisAlt: 'H₁: A significant interaction between Intervention Group and Time indicates differential aerobic gains.',
      testType: 'mixed_anova',
    },
    explanation: 'Loaded mixed split-plot dataset with between-factor Intervention_Group and within-factor VO2 measurements.',
  },

  hotellings_t2: {
    dataset: buildExtendedDataset(
      'study-preset-hotellings-t2',
      'Executive Neurocognition: Training vs Control Multivariate Comparison',
      'Neuropsychology dataset simultaneously comparing cognitive agility training against waitlist control on Processing Speed Index and Working Memory Span.',
      'Clinical Neuropsychology & Cognitive Training',
      HOTELLINGS_T2_DATA,
      { Executive_ID: 'id', Training_Program: 'categorical', Processing_Speed_Index: 'continuous', Executive_Working_Memory: 'continuous' }
    ),
    recommendedIv: 'Training_Program',
    recommendedMultiVars: ['Processing_Speed_Index', 'Executive_Working_Memory'],
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-hotellings-t2',
      title: 'RQ: Multivariate Group Difference in Neurocognitive Function',
      question: 'Does the training program induce significant multivariate differences across Processing Speed and Working Memory simultaneously?',
      hypothesisNull: 'H₀: The centroid vector of cognitive outcomes is equal between training and control groups.',
      hypothesisAlt: 'H₁: Significant multivariate centroid divergence exists between groups.',
      testType: 'hotellings_t2',
    },
    explanation: 'Loaded multivariate dataset with Training_Program grouping and 2 continuous cognitive outcome vectors.',
  },

  one_way_manova: {
    dataset: buildExtendedDataset(
      'study-preset-manova',
      'Multidisciplinary Academic Aptitude: STEM vs Humanities vs Arts Profiles',
      'Educational psychometrics dataset testing multivariate achievement differences across three academic tracks on Math, Science, and Verbal capabilities.',
      'Educational Psychology & Psychometrics',
      ONE_WAY_MANOVA_DATA,
      { Student_ID: 'id', Academic_Track: 'categorical', Math_Fluency: 'continuous', Science_Reasoning: 'continuous', Verbal_Aptitude: 'continuous' }
    ),
    recommendedIv: 'Academic_Track',
    recommendedMultiVars: ['Math_Fluency', 'Science_Reasoning', 'Verbal_Aptitude'],
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-one-way-manova',
      title: 'RQ: Multivariate Profile Differences Across Academic Tracks',
      question: 'Do academic track groups differ significantly on the composite multivariate vector of Math, Science, and Verbal aptitudes?',
      hypothesisNull: 'H₀: Population mean vectors for all 3 aptitude measures are identical across the 3 academic tracks.',
      hypothesisAlt: 'H₁: At least one academic track differs significantly in its multivariate aptitude profile.',
      testType: 'one_way_manova',
    },
    explanation: 'Loaded One-Way MANOVA dataset with Academic_Track and 3 dependent aptitude indicators.',
  },

  two_way_ancova: {
    dataset: buildExtendedDataset(
      'study-preset-two-way-ancova',
      'Pedagogical Efficacy: Method x Class Level Controlling for Prior GPA',
      'Education analytics dataset assessing final exam grades across teaching methods and class tiers while holding prior baseline GPA constant.',
      'Higher Education & Learning Analytics',
      TWO_WAY_ANCOVA_DATA,
      { Student_ID: 'id', Instruction_Method: 'categorical', Class_Level: 'categorical', Prior_Baseline_GPA: 'continuous', Final_Exam_Grade: 'continuous' }
    ),
    recommendedDv: 'Final_Exam_Grade',
    recommendedIv: 'Instruction_Method',
    recommendedFactorB: 'Class_Level',
    recommendedCovariate: 'Prior_Baseline_GPA',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-two-way-ancova',
      title: 'RQ: Teaching Method and Class Tier Controlling for Prior GPA',
      question: 'Are there significant main and interaction effects on final exam grade after adjusting for students baseline GPA?',
      hypothesisNull: 'H₀: Adjusted population means do not differ across instruction methods or class levels.',
      hypothesisAlt: 'H₁: Significant adjusted mean differences exist after removing baseline GPA covariance.',
      testType: 'two_way_ancova',
    },
    explanation: 'Loaded Two-Way ANCOVA dataset with Instruction_Method, Class_Level, Final_Exam_Grade, and covariate Prior_Baseline_GPA.',
  },

  jonckheere_terpstra: {
    dataset: buildExtendedDataset(
      'study-preset-jonckheere',
      'Dose-Response Efficacy: Monotonic Symptom Reduction Across Ordered Doses',
      'Pharmacodynamics study evaluating monotonic ordered progression of tremor reduction scores across 4 ascending drug dosages.',
      'Clinical Pharmacology & Neurology',
      JONCKHEERE_DATA,
      { Patient_ID: 'id', Drug_Dose_Ordered: 'categorical', Tremor_Reduction_Score: 'continuous' }
    ),
    recommendedDv: 'Tremor_Reduction_Score',
    recommendedIv: 'Drug_Dose_Ordered',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-jonckheere',
      title: 'RQ: Monotonic Trend Across Ordered Treatment Tiers',
      question: 'Does tremor reduction increase monotonically across escalating dosage levels (Placebo < Low < Medium < High)?',
      hypothesisNull: 'H₀: Medians across ordered dose groups are identical (M₁ = M₂ = M₃ = M₄).',
      hypothesisAlt: 'H₁: An ordered monotonic increase exists across dosage groups (M₁ ≤ M₂ ≤ M₃ ≤ M₄ with at least one strict inequality).',
      testType: 'jonckheere_terpstra',
    },
    explanation: 'Loaded ordered categorical pharmacology dataset for Jonckheere-Terpstra monotonic trend analysis.',
  },

  mcnemar: {
    dataset: buildExtendedDataset(
      'study-preset-mcnemar',
      'Civic Engagement Shift: Pre vs Post Public Campaign Approval Pairs',
      'Political communications dataset capturing paired voter sentiment (Approve/Disapprove) before and after an educational civic campaign.',
      'Political Science & Public Opinion',
      MCNEMAR_DATA,
      { Voter_ID: 'id', Pre_Campaign_Approval: 'categorical', Post_Campaign_Approval: 'categorical' }
    ),
    recommendedIv: 'Pre_Campaign_Approval',
    recommendedDv: 'Post_Campaign_Approval',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-mcnemar',
      title: 'RQ: Paired Proportional Shift Following Campaign Exposure',
      question: 'Is there a statistically significant change in voter approval proportions from pre-campaign to post-campaign?',
      hypothesisNull: 'H₀: The marginal probabilities of approval before and after the campaign are equal (marginal homogeneity).',
      hypothesisAlt: 'H₁: The proportion of approval shifted significantly following the campaign.',
      testType: 'mcnemar',
    },
    explanation: 'Loaded paired categorical dataset for McNemars test of marginal homogeneity.',
  },

  cochrans_q: {
    dataset: buildExtendedDataset(
      'study-preset-cochrans-q',
      'Usability Benchmark: Binary Task Completion Across 3 UI Configurations',
      'Human-computer interaction benchmark recording binary task completion (Pass/Fail) for identical subjects across 3 user interfaces.',
      'HCI & Cognitive Ergonomics',
      COCHRANS_Q_DATA,
      { User_ID: 'id', Interface_Classic: 'categorical', Interface_Modern: 'categorical', Interface_Minimalist: 'categorical' }
    ),
    recommendedMultiVars: ['Interface_Classic', 'Interface_Modern', 'Interface_Minimalist'],
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-cochrans-q',
      title: 'RQ: Success Rate Disparities Across 3 Matched Interfaces',
      question: 'Do user task completion rates differ significantly across the three software interface designs for matched users?',
      hypothesisNull: 'H₀: The probability of task success is identical across all three interface conditions.',
      hypothesisAlt: 'H₁: At least one interface exhibits a significantly different task completion rate.',
      testType: 'cochrans_q',
    },
    explanation: 'Loaded repeated dichotomous usability dataset with 3 interface completion variables for Cochrans Q test.',
  },

  sign_test: {
    dataset: buildExtendedDataset(
      'study-preset-sign-test',
      'Customer Perception Shift: Paired Service Ratings Before and After',
      'Hospitality management dataset recording paired ordinal customer satisfaction ratings before and after service renovation.',
      'Services Marketing & Hospitality Research',
      SIGN_TEST_DATA,
      { Client_ID: 'id', Rating_Before_Renovation: 'continuous', Rating_After_Renovation: 'continuous' }
    ),
    recommendedDv: 'Rating_After_Renovation',
    recommendedIv: 'Rating_Before_Renovation',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-sign-test',
      title: 'RQ: Directional Median Difference in Service Ratings',
      question: 'Does the median satisfaction rating improve significantly following service renovation?',
      hypothesisNull: 'H₀: The median difference between paired satisfaction ratings equals zero.',
      hypothesisAlt: 'H₁: The median difference between paired ratings is statistically greater than zero.',
      testType: 'sign_test',
    },
    explanation: 'Loaded matched-pairs ordinal dataset for non-parametric Sign Test analysis.',
  },

  two_proportions_test: {
    dataset: buildExtendedDataset(
      'study-preset-two-proportions',
      'Digital Marketing A/B Test: Subscription Conversion Proportions',
      'Growth analytics dataset measuring subscription conversion events across landing page Design A and Design B.',
      'Digital Marketing & Conversion Rate Optimization',
      TWO_PROPORTIONS_DATA,
      { Visitor_ID: 'id', Landing_Page_Version: 'categorical', Subscription_Converted: 'categorical' }
    ),
    recommendedIv: 'Landing_Page_Version',
    recommendedDv: 'Subscription_Converted',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-two-proportions',
      title: 'RQ: Two-Sample Proportion Difference in Conversion Rate',
      question: 'Is the conversion proportion for Landing Page Design B significantly superior to Design A?',
      hypothesisNull: 'H₀: The true conversion rates for Design A and Design B are equal (p_A = p_B).',
      hypothesisAlt: 'H₁: The conversion rate differs significantly between landing page designs (p_A ≠ p_B).',
      testType: 'two_proportions_test',
    },
    explanation: 'Loaded A/B split-testing dataset with Landing_Page_Version and Subscription_Converted.',
  },

  chi_square_homogeneity_2xc: {
    dataset: buildExtendedDataset(
      'study-preset-homogeneity-2xc',
      'Payment Preference Distribution: Urban vs Rural Regional Homogeneity',
      'Consumer behavior dataset comparing payment channel preference profiles across urban and rural sub-populations.',
      'FinTech & Consumer Economics',
      HOMOGENEITY_2XC_DATA,
      { Shopper_ID: 'id', Geographic_Region: 'categorical', Preferred_Payment: 'categorical' }
    ),
    recommendedIv: 'Geographic_Region',
    recommendedDv: 'Preferred_Payment',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-homogeneity-2xc',
      title: 'RQ: Homogeneity of Consumer Payment Choices Between Regions',
      question: 'Are the proportions of payment method preferences homogeneous between urban and rural populations?',
      hypothesisNull: 'H₀: The multinomial distribution of payment preferences is homogeneous across both regions.',
      hypothesisAlt: 'H₁: Payment method preferences differ significantly between urban and rural consumers.',
      testType: 'chi_square_homogeneity_2xc',
    },
    explanation: 'Loaded 2xC contingency dataset with Geographic_Region and Preferred_Payment.',
  },

  kaplan_meier: {
    dataset: buildExtendedDataset(
      'study-preset-kaplan-meier',
      'Oncology Survival Protocol: Immunotherapy vs Standard Chemotherapy',
      'Clinical oncology trial tracking patient survival time in months and censoring status across two treatment cohorts.',
      'Medical Oncology & Survival Biostatistics',
      KAPLAN_MEIER_DATA,
      { Patient_ID: 'id', Survival_Months: 'continuous', Event_Occurred: 'categorical', Treatment_Arm: 'categorical' }
    ),
    recommendedDv: 'Survival_Months',
    recommendedIv: 'Treatment_Arm',
    recommendedSecondVar: 'Event_Occurred',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-kaplan-meier',
      title: 'RQ: Log-Rank Survival Curves Comparison Between Protocols',
      question: 'Does novel immunotherapy significantly prolong overall survival compared to standard chemotherapy?',
      hypothesisNull: 'H₀: Survival functions for immunotherapy and chemotherapy are identical across time (S₁(t) = S₂(t)).',
      hypothesisAlt: 'H₁: Survival distributions differ significantly between the two therapeutic cohorts.',
      testType: 'kaplan_meier',
    },
    explanation: 'Loaded time-to-event survival dataset with Survival_Months, Event_Occurred, and Treatment_Arm.',
  },

  cohens_kappa: {
    dataset: buildExtendedDataset(
      'study-preset-cohens-kappa',
      'Diagnostic Concordance: Inter-Rater Reliability Between 2 Clinicians',
      'Psychiatric evaluation dataset capturing independent diagnostic classifications from two expert clinicians on identical patients.',
      'Psychiatric Diagnostics & Psychometrics',
      COHENS_KAPPA_DATA,
      { Patient_ID: 'id', Clinical_Psychologist_A: 'categorical', Clinical_Psychologist_B: 'categorical' }
    ),
    recommendedIv: 'Clinical_Psychologist_A',
    recommendedDv: 'Clinical_Psychologist_B',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-cohens-kappa',
      title: 'RQ: Inter-Rater Agreement Beyond Chance Expectation',
      question: 'Do the two clinical psychologists achieve statistically significant diagnostic agreement beyond chance expectation?',
      hypothesisNull: 'H₀: Agreement between raters is no better than expected by chance alone (κ = 0).',
      hypothesisAlt: 'H₁: Inter-rater agreement is significantly higher than chance expectation (κ > 0).',
      testType: 'cohens_kappa',
    },
    explanation: 'Loaded 2-rater categorical concordance dataset with Clinical_Psychologist_A and B.',
  },

  fleiss_kappa: {
    dataset: buildExtendedDataset(
      'study-preset-fleiss-kappa',
      'Multi-Rater Radiological Agreement: 3 Specialists Evaluating Tissue Scans',
      'Radiology research dataset recording diagnostic classifications across 3 independent specialists evaluating biopsy scans.',
      'Diagnostic Radiology & Quality Assurance',
      FLEISS_KAPPA_DATA,
      { Sample_Scan_ID: 'id', Radiologist_1: 'categorical', Radiologist_2: 'categorical', Radiologist_3: 'categorical' }
    ),
    recommendedMultiVars: ['Radiologist_1', 'Radiologist_2', 'Radiologist_3'],
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-fleiss-kappa',
      title: 'RQ: Multi-Rater Fleiss Concordance Across Radiologists',
      question: 'Do multiple radiologists demonstrate substantial diagnostic reliability across sample scans?',
      hypothesisNull: 'H₀: Rating agreement among multiple specialists is attributable to chance (κ_fleiss = 0).',
      hypothesisAlt: 'H₁: Overall multi-rater agreement significantly exceeds chance.',
      testType: 'fleiss_kappa',
    },
    explanation: 'Loaded multi-rater dataset with 3 radiologist rating columns for Fleiss Kappa analysis.',
  },

  kendalls_w: {
    dataset: buildExtendedDataset(
      'study-preset-kendalls-w',
      'Panel Ranking Concordance: 4 Judges Evaluating Innovation Finalists',
      'Innovation competition dataset recording ranks (1 to 5) assigned by 4 independent judges across finalist projects.',
      'Decision Science & Evaluation Methodology',
      KENDALLS_W_DATA,
      { Finalist_Project: 'id', Judge_1_Rank: 'continuous', Judge_2_Rank: 'continuous', Judge_3_Rank: 'continuous', Judge_4_Rank: 'continuous' }
    ),
    recommendedMultiVars: ['Judge_1_Rank', 'Judge_2_Rank', 'Judge_3_Rank', 'Judge_4_Rank'],
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-kendalls-w',
      title: 'RQ: Overall Concordance Among Expert Panel Ranks',
      question: 'Is there a significant level of agreement among the 4 judges ranking the innovation finalists?',
      hypothesisNull: 'H₀: There is no agreement among judge rankings (W = 0).',
      hypothesisAlt: 'H₁: The panel of judges exhibits statistically significant ranking concordance (W > 0).',
      testType: 'kendalls_w',
    },
    explanation: 'Loaded judge ranking dataset with 4 judge ranking columns for Kendalls W concordance.',
  },

  multiple_regression: {
    dataset: buildExtendedDataset(
      'study-preset-multiple-regression',
      'Predictive Modeling: Cognitive & Psychometric Predictors of Job Performance',
      'Organizational psychology dataset modeling employee job performance from tenure, workload, and emotional indicators.',
      'Industrial & Organizational Psychology',
      HIERARCHICAL_REG_DATA,
      { Employee_ID: 'id', Age: 'continuous', Years_Tenure: 'continuous', Workload_Hours: 'continuous', Emotional_Exhaustion: 'continuous', Job_Burnout_Score: 'continuous' }
    ),
    recommendedDv: 'Job_Burnout_Score',
    recommendedMultiVars: ['Years_Tenure', 'Workload_Hours', 'Emotional_Exhaustion'],
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-multiple-regression',
      title: 'RQ: Multivariate Prediction of Employee Burnout',
      question: 'Do Tenure, Workload, and Emotional Exhaustion significantly predict employee burnout scores?',
      hypothesisNull: 'H₀: R² = 0 (The combined regression model explains zero variance in burnout).',
      hypothesisAlt: 'H₁: R² > 0 (The predictors explain a significant proportion of variance in burnout).',
      testType: 'multiple_regression',
    },
    explanation: 'Loaded multiple regression dataset with continuous outcome and 3 predictor indicators.',
  },

  hierarchical_regression: {
    dataset: buildExtendedDataset(
      'study-preset-hierarchical-reg',
      'Incremental Prediction: Demographics Block 1 vs Psychological Block 2',
      'Workplace research dataset evaluating whether psychological workload adds significant predictive variance over baseline demographic variables.',
      'Occupational Health & Applied Statistics',
      HIERARCHICAL_REG_DATA,
      { Employee_ID: 'id', Age: 'continuous', Years_Tenure: 'continuous', Workload_Hours: 'continuous', Emotional_Exhaustion: 'continuous', Job_Burnout_Score: 'continuous' }
    ),
    recommendedDv: 'Job_Burnout_Score',
    recommendedMultiVars: ['Age', 'Years_Tenure', 'Workload_Hours', 'Emotional_Exhaustion'],
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-hierarchical-regression',
      title: 'RQ: Incremental F-Change in Hierarchical Block Entry',
      question: 'Does the addition of workload and emotional exhaustion significantly improve R² beyond age and tenure?',
      hypothesisNull: 'H₀: ΔR² = 0 (Block 2 adds no unique explanatory variance).',
      hypothesisAlt: 'H₁: ΔR² > 0 (Block 2 accounts for significant incremental variance in burnout).',
      testType: 'hierarchical_regression',
    },
    explanation: 'Loaded hierarchical regression dataset for blockwise model comparison and R-squared change evaluation.',
  },

  ordinal_regression: {
    dataset: buildExtendedDataset(
      'study-preset-ordinal-regression',
      'Cumulative Logit Modeling: Biomarker Predictors of Osteoarthritis Stage',
      'Rheumatology dataset predicting ordered disease severity stages (Mild, Moderate, Severe) from age, biomarkers, and smoking history.',
      'Rheumatology & Clinical Biostatistics',
      ORDINAL_REG_DATA,
      { Patient_ID: 'id', Age: 'continuous', Biomarker_Concentration: 'continuous', Smoking_History_PackYears: 'continuous', Osteoarthritis_Stage: 'categorical' }
    ),
    recommendedDv: 'Osteoarthritis_Stage',
    recommendedMultiVars: ['Age', 'Biomarker_Concentration', 'Smoking_History_PackYears'],
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-ordinal-regression',
      title: 'RQ: Proportional Odds Modeling of Disease Staging',
      question: 'Do circulating biomarkers and smoking history predict progression to higher ordinal stages of osteoarthritis?',
      hypothesisNull: 'H₀: Regression coefficients for all predictors across cumulative logits are equal to zero.',
      hypothesisAlt: 'H₁: At least one predictor significantly increases the log-odds of higher disease severity.',
      testType: 'ordinal_regression',
    },
    explanation: 'Loaded ordinal logistic regression dataset with ordered outcome Osteoarthritis_Stage.',
  },

  point_biserial: {
    dataset: buildExtendedDataset(
      'study-preset-point-biserial',
      'Binary-Continuous Correlation: Simulator Certification vs Spatial Ability',
      'Aviation training dataset investigating the association between binary simulator qualification and continuous spatial test scores.',
      'Aeronautical Psychology & Human Factors',
      POINT_BISERIAL_DATA,
      { Cadet_ID: 'id', Flight_Simulator_Certified: 'categorical', Spatial_Orientation_Score: 'continuous' }
    ),
    recommendedIv: 'Flight_Simulator_Certified',
    recommendedDv: 'Spatial_Orientation_Score',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-point-biserial',
      title: 'RQ: Point-Biserial Association with Spatial Performance',
      question: 'Is there a statistically significant correlation between simulator certification status and spatial orientation score?',
      hypothesisNull: 'H₀: The population point-biserial correlation equals zero (r_pb = 0).',
      hypothesisAlt: 'H₁: Simulator certification is significantly correlated with spatial orientation score (r_pb ≠ 0).',
      testType: 'point_biserial',
    },
    explanation: 'Loaded point-biserial dataset with binary grouping and continuous spatial score.',
  },

  partial_correlation: {
    dataset: buildExtendedDataset(
      'study-preset-partial-correlation',
      'Controlled Linear Association: Study Hours vs Grades Controlling for Anxiety',
      'Educational psychology dataset quantifying the pure correlation between study hours and academic grade while controlling for test anxiety.',
      'Educational Psychology & Psychometrics',
      PARTIAL_CORR_DATA,
      { Student_ID: 'id', Revision_Hours: 'continuous', Final_Exam_Grade: 'continuous', Test_Anxiety_Score: 'continuous' }
    ),
    recommendedDv: 'Final_Exam_Grade',
    recommendedIv: 'Revision_Hours',
    recommendedCovariate: 'Test_Anxiety_Score',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-partial-correlation',
      title: 'RQ: Partial Correlation Controlling for Test Anxiety',
      question: 'What is the strength and significance of the linear relationship between revision hours and exam grade when controlling for test anxiety?',
      hypothesisNull: 'H₀: The partial correlation coefficient equals zero (r_xy.z = 0).',
      hypothesisAlt: 'H₁: A significant linear relationship persists after controlling for test anxiety (r_xy.z ≠ 0).',
      testType: 'partial_correlation',
    },
    explanation: 'Loaded partial correlation dataset with Revision_Hours, Final_Exam_Grade, and control variable Test_Anxiety_Score.',
  },

  kendalls_tau_b: {
    dataset: buildExtendedDataset(
      'study-preset-kendalls-tau-b',
      'Rank Association with Ties: Job Seniority vs Compensation Tier',
      'Organizational analytics dataset examining the non-parametric rank association between employee seniority ranks and compensation bands.',
      'Applied Economics & Human Resource Analytics',
      KENDALLS_TAUB_DATA,
      { Employee_ID: 'id', Job_Seniority_Rank: 'continuous', Salary_Tier_Rank: 'continuous' }
    ),
    recommendedIv: 'Job_Seniority_Rank',
    recommendedDv: 'Salary_Tier_Rank',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-kendalls-tau-b',
      title: 'RQ: Kendall Tau-b Monotonic Concordance with Tied Ranks',
      question: 'Is there a significant monotonic association between employee seniority rank and compensation tier adjusted for ties?',
      hypothesisNull: 'H₀: The population rank correlation equals zero (τ_b = 0).',
      hypothesisAlt: 'H₁: Seniority rank and salary tier exhibit statistically significant rank concordance (τ_b ≠ 0).',
      testType: 'kendalls_tau_b',
    },
    explanation: 'Loaded ordinal rank dataset for Kendalls tau-b correlation analysis.',
  },

  fishers_exact: {
    dataset: buildExtendedDataset(
      'study-preset-fishers-exact',
      'Low Frequency Contingency: Rare Mutation vs Severe Drug Toxicity',
      'Pharmacogenomics dataset analyzing whether a rare genetic variant is significantly associated with severe adverse drug toxicity in a small clinical sample.',
      'Pharmacogenomics & Precision Medicine',
      FISHERS_EXACT_DATA,
      { Patient_ID: 'id', Rare_Gene_Mutation: 'categorical', Severe_Toxicity: 'categorical' }
    ),
    recommendedIv: 'Rare_Gene_Mutation',
    recommendedDv: 'Severe_Toxicity',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-fishers-exact',
      title: 'RQ: Exact Hypergeometric Independence for Sparse Cells',
      question: 'Is the rare genetic mutation significantly associated with adverse clinical drug toxicity?',
      hypothesisNull: 'H₀: Gene mutation and adverse toxicity are independent in the population.',
      hypothesisAlt: 'H₁: Gene mutation status is non-randomly associated with severe drug toxicity.',
      testType: 'fishers_exact',
    },
    explanation: 'Loaded sparse 2x2 contingency dataset for Fishers Exact Test.',
  },

  relative_risk: {
    dataset: buildExtendedDataset(
      'study-preset-relative-risk',
      'Cohort Risk Ratio: Industrial Airborne Exposure vs Respiratory Disease',
      'Epidemiological cohort study computing the cumulative incidence risk ratio between exposed factory workers and unexposed baseline controls.',
      'Epidemiology & Environmental Health',
      EPIDEMIOLOGY_2X2_DATA,
      { Case_ID: 'id', Environmental_Hazard_Exposure: 'categorical', Respiratory_Condition: 'categorical' }
    ),
    recommendedIv: 'Environmental_Hazard_Exposure',
    recommendedDv: 'Respiratory_Condition',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-relative-risk',
      title: 'RQ: Prospective Risk Ratio for Occupational Exposure',
      question: 'What is the relative risk (RR) of developing respiratory conditions among workers exposed to environmental hazards compared to unexposed?',
      hypothesisNull: 'H₀: The true relative risk equals 1.0 (Exposure carries no elevated risk of disease).',
      hypothesisAlt: 'H₁: The relative risk deviates significantly from 1.0 (Exposure significantly alters disease risk).',
      testType: 'relative_risk',
    },
    explanation: 'Loaded 2x2 cohort dataset for Relative Risk and 95% Confidence Interval calculation.',
  },

  odds_ratio: {
    dataset: buildExtendedDataset(
      'study-preset-odds-ratio',
      'Case-Control Association: Retrospective Odds Ratio of Environmental Exposure',
      'Case-control study assessing the odds ratio of prior exposure among patients diagnosed with disease versus matched healthy controls.',
      'Biostatistics & Retrospective Epidemiology',
      EPIDEMIOLOGY_2X2_DATA,
      { Case_ID: 'id', Environmental_Hazard_Exposure: 'categorical', Respiratory_Condition: 'categorical' }
    ),
    recommendedIv: 'Environmental_Hazard_Exposure',
    recommendedDv: 'Respiratory_Condition',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-odds-ratio',
      title: 'RQ: Case-Control Odds Ratio and Confidence Interval',
      question: 'Are the odds of prior environmental exposure significantly higher in cases than in healthy controls?',
      hypothesisNull: 'H₀: The population odds ratio equals 1.0 (Exposure is unrelated to case status).',
      hypothesisAlt: 'H₁: The population odds ratio differs significantly from 1.0.',
      testType: 'odds_ratio',
    },
    explanation: 'Loaded case-control dataset for Odds Ratio computation with Wald 95% CI.',
  },

  pca: {
    dataset: buildExtendedDataset(
      'study-preset-pca',
      'Cognitive Battery Factor Extraction: Verbal vs Spatial Latent Dimensions',
      'Psychometric test battery data for extracting principal components and determining eigenvalue variance explained across multiple cognitive subtests.',
      'Psychometrics & Multidimensional Data Reduction',
      PCA_DATA,
      { Subject_ID: 'id', Verbal_Comprehension: 'continuous', Working_Memory: 'continuous', Spatial_Rotation: 'continuous', Matrix_Reasoning: 'continuous' }
    ),
    recommendedMultiVars: ['Verbal_Comprehension', 'Working_Memory', 'Spatial_Rotation', 'Matrix_Reasoning'],
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-pca',
      title: 'RQ: Latent Dimensionality and Principal Component Extraction',
      question: 'Can the 4 cognitive test scores be reduced to distinct orthogonal principal components capturing verbal and spatial abilities?',
      hypothesisNull: 'H₀: Correlation matrix equals identity matrix (Variables are orthogonal, PCA not appropriate).',
      hypothesisAlt: 'H₁: Significant inter-correlations allow reduction into discrete latent components.',
      testType: 'pca',
    },
    explanation: 'Loaded psychometric test battery dataset with 4 continuous indicators for PCA factor extraction.',
  },

  normality_test: {
    dataset: buildExtendedDataset(
      'study-preset-normality',
      'Distributional Assumption Audit: Fasting Glucose & Cortisol Normality Screening',
      'Clinical biostatistics screening dataset evaluating sample distribution symmetry, skewness, kurtosis, and Shapiro-Wilk p-values.',
      'Biostatistics & Quality Screening',
      NORMALITY_DATA,
      { Specimen_ID: 'id', Fasting_Blood_Glucose: 'continuous', Serum_Cortisol: 'continuous' }
    ),
    recommendedMultiVars: ['Fasting_Blood_Glucose', 'Serum_Cortisol'],
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-normality-test',
      title: 'RQ: Normality Auditing via Shapiro-Wilk & Kolmogorov-Smirnov',
      question: 'Do the continuous biometric markers conform adequately to normal bell-curve distributions?',
      hypothesisNull: 'H₀: The sample data is drawn from a normally distributed population (p > .05).',
      hypothesisAlt: 'H₁: The sample distribution deviates significantly from normality (p < .05).',
      testType: 'normality_test',
    },
    explanation: 'Loaded continuous biomarker screening dataset for Shapiro-Wilk and KS normality diagnostics.',
  },

  moderation_analysis: {
    dataset: buildExtendedDataset(
      'study-preset-moderation',
      'Buffering Hypothesis: Social Support Moderating the Stress-Depression Link',
      'Clinical psychology dataset testing whether high social support buffers and attenuates the adverse impact of work stress on depressive symptoms.',
      'Clinical Psychology & Mental Health',
      MODERATION_DATA,
      { Participant_ID: 'id', Work_Stress_Level: 'continuous', Social_Support_Binary: 'categorical', Depressive_Symptoms: 'continuous' }
    ),
    recommendedDv: 'Depressive_Symptoms',
    recommendedIv: 'Work_Stress_Level',
    recommendedFactorB: 'Social_Support_Binary',
    alphaLevel: 0.05,
    researchQuestion: {
      id: 'rq-moderation',
      title: 'RQ: Moderating Role of Social Support on the Stress-Depression Axis',
      question: 'Does social support significantly moderate the relationship between workplace stress and depressive symptoms?',
      hypothesisNull: 'H₀: The interaction term (Stress × Support) has a regression coefficient of zero (no moderation).',
      hypothesisAlt: 'H₁: A significant interaction term confirms social support moderates the stress-depression slope.',
      testType: 'moderation_analysis',
    },
    explanation: 'Loaded moderation dataset with Predictor (Work_Stress_Level), Moderator (Social_Support_Binary), and Outcome (Depressive_Symptoms).',
  },
};
