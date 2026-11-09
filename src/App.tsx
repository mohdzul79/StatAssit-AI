import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { DatasetManager } from './components/DatasetManager';
import { TestSelector } from './components/TestSelector';
import { StatisticalConsole } from './components/StatisticalConsole';
import { ResultsDisplay } from './components/ResultsDisplay';
import { ApaManuscriptGenerator } from './components/ApaManuscriptGenerator';
import { HypothesisWizardModal } from './components/HypothesisWizardModal';
import { ApaGuideModal } from './components/ApaGuideModal';
import { UserGuideModal } from './components/UserGuideModal';
import { ResearchQuestionModal } from './components/ResearchQuestionModal';
import { SelectingTestView } from './components/SelectingTestView';
import { FeedbackModal } from './components/FeedbackModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { NotebookLMSyncModal } from './components/NotebookLMSyncModal';
import { AdminCmsModal } from './components/AdminCmsModal';
import { LandingPage } from './components/LandingPage';
import { UsabilityTestModal } from './components/UsabilityTestModal';
import { PublishChecklistModal } from './components/PublishChecklistModal';
import { GmailModal } from './components/GmailModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { DonateModal } from './components/DonateModal';
import { IpCopyrightModal } from './components/IpCopyrightModal';
import { getEffectiveGoogleFormUrl } from './data/usabilityTestData';
import { ClipboardCheck, ExternalLink, CheckSquare, Sparkles, ShieldCheck } from 'lucide-react';

import { UserProfile, loadStoredUserProfile, saveStoredUserProfile, MOHDZUL_ADMIN_PROFILE } from './types/user';
import { logOutFromFirebase, firebaseUserToUserProfile } from './services/firebaseAuth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, syncUserProfileToFirestore, saveUserDatasetToFirestore, saveAnalysisResultToFirestore } from './services/firebase';
import { TEST_STUDY_PRESETS } from './utils/testStudyPresets';
import { validateDatasetForTest } from './utils/datasetValidation';

import { Dataset, StatisticalTestType, StatisticalResult, VariableType, ResearchQuestion } from './types/stats';
import { SAMPLE_DATASETS } from './data/sampleDatasets';
import { autoDraftResearchQuestion } from './utils/hypothesisHelper';
import {
  computeDescriptiveStats,
  computeIndependentTTest,
  computePairedTTest,
  computeOneWayAnova,
  computeMultipleRegression,
  computeCorrelationMatrix,
  computeChiSquareTest,
  computeOneSampleTTest,
  computeTwoWayAnova,
  computeRepeatedMeasuresAnova,
  computeAncova,
  computeMannWhitneyTest,
  computeWilcoxonSignedTest,
  computeKruskalWallisTest,
  computeFriedmanTest,
  computeBinaryLogisticRegression,
  computeCronbachAlpha,
  computeChiSquareGoodnessOfFit,
  computeExploratoryFactorAnalysis,
  computeConfirmatoryFactorAnalysis,
  computeStructuralEquationModeling,
} from './utils/statisticalMath';

export default function App() {
  // Main & Front Page default is 'landing'
  const [activeTab, setActiveTab] = useState<'landing' | 'data' | 'analysis' | 'apa-report' | 'wizard'>('landing');
  
  // Available datasets in-memory (pre-populated with tailored datasets for all statistical tests)
  const [availableDatasets, setAvailableDatasets] = useState<Dataset[]>(() => {
    const tailored = Object.values(TEST_STUDY_PRESETS).map((p) => p.dataset);
    return [...tailored, ...JSON.parse(JSON.stringify(SAMPLE_DATASETS))];
  });
  const [currentDatasetId, setCurrentDatasetId] = useState<string>(
    () => TEST_STUDY_PRESETS['independent_ttest'].dataset.id
  );

  const currentDataset = useMemo(() => {
    return availableDatasets.find((d) => d.id === currentDatasetId) || availableDatasets[0];
  }, [availableDatasets, currentDatasetId]);

  const [selectedTest, setSelectedTest] = useState<StatisticalTestType>('independent_ttest');

  // Dynamic variable parameters matching independent_ttest preset
  const [selectedDV, setSelectedDV] = useState<string>(() => TEST_STUDY_PRESETS['independent_ttest'].recommendedDv || 'Exam_Score');
  const [selectedIV, setSelectedIV] = useState<string>(() => TEST_STUDY_PRESETS['independent_ttest'].recommendedIv || 'Treatment_Group');
  const [selectedGroup1, setSelectedGroup1] = useState<string>(() => TEST_STUDY_PRESETS['independent_ttest'].recommendedGroup1 || 'Mindfulness');
  const [selectedGroup2, setSelectedGroup2] = useState<string>(() => TEST_STUDY_PRESETS['independent_ttest'].recommendedGroup2 || 'Control');
  const [selectedSecondVar, setSelectedSecondVar] = useState<string>('Anxiety_Score');
  const [selectedMultiVars, setSelectedMultiVars] = useState<string[]>([
    'Exam_Score',
    'Anxiety_Score',
    'Study_Hours',
  ]);
  const [correlationMethod, setCorrelationMethod] = useState<'pearson' | 'spearman'>('pearson');
  const [alphaLevel, setAlphaLevel] = useState<number>(0.05);

  // Additional parameters for extended quantitative procedures
  const [oneSampleTestValue, setOneSampleTestValue] = useState<number>(220);
  const [selectedFactorB, setSelectedFactorB] = useState<string>('Caffeine_Dose');
  const [selectedCovariate, setSelectedCovariate] = useState<string>('Baseline_Vocab_Age');

  // Active Research Question state initialized to independent_ttest preset
  const [activeResearchQuestion, setActiveResearchQuestion] = useState<ResearchQuestion | null>(
    () => TEST_STUDY_PRESETS['independent_ttest'].researchQuestion
  );
  const [isRqModalOpen, setIsRqModalOpen] = useState(false);
  const [editingRq, setEditingRq] = useState<ResearchQuestion | null>(null);

  // Result state
  const [currentResult, setCurrentResult] = useState<StatisticalResult | null>(null);

  // Modals & First-time banner
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAdminCmsOpen, setIsAdminCmsOpen] = useState(false);
  const [isUsabilityTestOpen, setIsUsabilityTestOpen] = useState(false);
  const [isPublishChecklistOpen, setIsPublishChecklistOpen] = useState(false);
  const [usabilityModalInitialTab, setUsabilityModalInitialTab] = useState<
    'survey' | 'form-sheet' | 'google-form' | 'script' | 'instrument' | 'responses'
  >('google-form');
  const [isNotebookLMSyncOpen, setIsNotebookLMSyncOpen] = useState(false);
  const [isGmailOpen, setIsGmailOpen] = useState(false);
  const [isGoogleDriveOpen, setIsGoogleDriveOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isIpProtectionOpen, setIsIpProtectionOpen] = useState(false);
  const [showQuickstartBanner, setShowQuickstartBanner] = useState(true);

  // User Authentication & Fundamental Profile state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const loaded = loadStoredUserProfile();
    return loaded.isLoggedIn ? loaded.user : null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return loadStoredUserProfile().isLoggedIn;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Pre-set study notification banner state for Dataset view
  const [presetStudyBanner, setPresetStudyBanner] = useState<{
    testTitle: string;
    datasetName: string;
    explanation: string;
  } | null>(() => {
    const preset = TEST_STUDY_PRESETS['independent_ttest'];
    return {
      testTitle: preset.testTitle,
      datasetName: preset.datasetName,
      explanation: preset.explanation,
    };
  });

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    saveStoredUserProfile(user, true);
    syncUserProfileToFirestore(user);
    if (user.preferences?.defaultAlpha) {
      setAlphaLevel(user.preferences.defaultAlpha);
    }
    // Selecting Test is Priority 1 and the default page after login
    setActiveTab('wizard');
    setIsAdminCmsOpen(false);
  };

  // Sync Firebase Auth session on boot
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const profile = firebaseUserToUserProfile(fbUser, 'google');
        setCurrentUser(profile);
        setIsLoggedIn(true);
        saveStoredUserProfile(profile, true);
        syncUserProfileToFirestore(profile);
      }
    });
    return () => unsubscribe();
  }, []);

  // Ensure PayPal SDK with hosted-buttons & USD currency is loaded
  useEffect(() => {
    const existing = document.querySelector('script[src*="paypal.com/sdk/js"]');
    if (!existing) {
      const script = document.createElement('script');
      script.src = "https://www.paypal.com/sdk/js?client-id=BAA3DIIabyVud-YdLEFug1RxOqO_33HBQKtnFWVJAdzXPkE67mr-M8oHDj0RAvck4iStPJxVfXV_aDmPZM&components=hosted-buttons&disable-funding=venmo&currency=USD";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Core function: Change the preset sample data in 'dataset' based on user choice of 'selecting test'
  const applyPresetStudyForTest = (test: StatisticalTestType, navigateToDataset = false) => {
    setSelectedTest(test);
    const preset = TEST_STUDY_PRESETS[test];
    if (preset) {
      // 1. Ensure the tailored dataset with embedded complete research question exists in availableDatasets and set it as active
      const completePresetDataset: Dataset = {
        ...preset.dataset,
        researchQuestions: (preset.dataset.researchQuestions && preset.dataset.researchQuestions.length > 0)
          ? preset.dataset.researchQuestions
          : [preset.researchQuestion],
      };

      setAvailableDatasets((prev) => {
        const idx = prev.findIndex((d) => d.id === completePresetDataset.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = completePresetDataset;
          return next;
        }
        return [completePresetDataset, ...prev];
      });
      setCurrentDatasetId(completePresetDataset.id);

      // 2. Pre-configure variables according to the test's tailored study
      if (preset.recommendedDv) setSelectedDV(preset.recommendedDv);
      if (preset.recommendedIv) setSelectedIV(preset.recommendedIv);
      if (preset.recommendedGroup1) setSelectedGroup1(preset.recommendedGroup1);
      if (preset.recommendedGroup2) setSelectedGroup2(preset.recommendedGroup2);
      if (preset.recommendedSecondVar) setSelectedSecondVar(preset.recommendedSecondVar);
      if (preset.recommendedMultiVars) setSelectedMultiVars(preset.recommendedMultiVars);
      if (preset.recommendedFactorB) setSelectedFactorB(preset.recommendedFactorB);
      if (preset.recommendedCovariate) setSelectedCovariate(preset.recommendedCovariate);
      if (preset.recommendedTestValue !== undefined) setOneSampleTestValue(preset.recommendedTestValue);
      if (preset.correlationMethod) setCorrelationMethod(preset.correlationMethod);
      if (preset.alphaLevel !== undefined) setAlphaLevel(preset.alphaLevel);

      // 3. Set research question
      setActiveResearchQuestion(preset.researchQuestion);

      // 4. Set banner notification for Dataset view
      setPresetStudyBanner({
        testTitle: preset.testTitle,
        datasetName: preset.datasetName,
        explanation: preset.explanation,
      });
    } else if (
      test === 'exploratory_factor_analysis' ||
      test === 'confirmatory_factor_analysis' ||
      test === 'structural_equation_modeling'
    ) {
      const tamDataset = SAMPLE_DATASETS.find((d) => d.id === 'tam-sem-model');
      if (tamDataset) {
        setAvailableDatasets((prev) => {
          const idx = prev.findIndex((d) => d.id === tamDataset.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = tamDataset;
            return next;
          }
          return [tamDataset, ...prev];
        });
        setCurrentDatasetId(tamDataset.id);
        const indicators = ['PEOU_1', 'PEOU_2', 'PEOU_3', 'PU_1', 'PU_2', 'PU_3', 'BI_1', 'BI_2', 'BI_3'];
        setSelectedMultiVars(indicators);
        setSelectedDV('BI_1');
        setSelectedIV('PEOU_1');
        const rqIdx = test === 'exploratory_factor_analysis' ? 0 : test === 'confirmatory_factor_analysis' ? 1 : 2;
        if (tamDataset.researchQuestions && tamDataset.researchQuestions[rqIdx]) {
          setActiveResearchQuestion(tamDataset.researchQuestions[rqIdx]);
        }
        setPresetStudyBanner({
          testTitle:
            test === 'exploratory_factor_analysis'
              ? 'Exploratory Factor Analysis (EFA)'
              : test === 'confirmatory_factor_analysis'
              ? 'Confirmatory Factor Analysis (CFA)'
              : 'Structural Equation Modeling (SEM)',
          datasetName: tamDataset.name,
          explanation:
            'Loaded 9 Likert indicators across Perceived Ease of Use, Perceived Usefulness, and Behavioral Intention from the TAM-SEM empirical study.',
        });
      }
    }

    if (navigateToDataset) {
      setActiveTab('data');
    }
  };

  const handleSelectAndConfigureTest = (test: StatisticalTestType) => {
    applyPresetStudyForTest(test, true);
  };

  const handleSignOut = () => {
    logOutFromFirebase();
    setIsLoggedIn(false);
    setCurrentUser(null);
    saveStoredUserProfile(null, false);
    setIsAdminCmsOpen(false);
    setActiveTab('landing');
  };

  const handleUpdateUserProfile = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    saveStoredUserProfile(updatedUser, true);
    if (updatedUser.preferences?.defaultAlpha) {
      setAlphaLevel(updatedUser.preferences.defaultAlpha);
    }
  };

  // Dataset management handlers for preloaded & uploaded studies
  const handleSelectDataset = (ds: Dataset) => {
    setAvailableDatasets((prev) => {
      const idx = prev.findIndex((d) => d.id === ds.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = ds;
        return copy;
      }
      return [ds, ...prev];
    });
    setCurrentDatasetId(ds.id);
  };

  const handleUpdateDataset = (updated: Dataset) => {
    setAvailableDatasets((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
    if (currentUser?.id) {
      saveUserDatasetToFirestore(currentUser.id, updated);
    }
  };

  const handleDuplicateDataset = (ds: Dataset) => {
    const clone: Dataset = {
      ...JSON.parse(JSON.stringify(ds)),
      id: `${ds.id}-copy-${Date.now()}`,
      name: `${ds.name} (Custom Copy)`,
      description: `Customized working copy of ${ds.name}`,
    };
    setAvailableDatasets((prev) => [clone, ...prev]);
    setCurrentDatasetId(clone.id);
  };

  const handleResetSampleDataset = (datasetId: string) => {
    const original = SAMPLE_DATASETS.find((s) => s.id === datasetId);
    if (original) {
      const pristine = JSON.parse(JSON.stringify(original));
      setAvailableDatasets((prev) =>
        prev.map((d) => (d.id === datasetId ? pristine : d))
      );
    }
  };

  // Reset all datasets to no data
  const handleResetToBaseline = () => {
    setAvailableDatasets((prev) =>
      prev.map((d) => ({
        ...d,
        data: [],
        totalRows: 0,
        columns: d.columns.map((col) => ({
          ...col,
          distinctCount: 0,
          missingCount: 0,
          sampleValues: [],
        })),
      }))
    );
    setCurrentResult(null);
  };

  // Ensure default variables match current dataset when switching datasets or editing variables
  useEffect(() => {
    const cont = currentDataset.columns.filter((c) => c.type === 'continuous');
    const cat = currentDataset.columns.filter((c) => c.type === 'categorical');

    if (cont.length > 0) {
      if (!selectedDV || !cont.some((c) => c.name === selectedDV)) {
        setSelectedDV(cont[0].name);
      }
      if (cont.length > 1) {
        if (!selectedSecondVar || !cont.some((c) => c.name === selectedSecondVar)) {
          setSelectedSecondVar(cont[1].name);
        }
      } else {
        setSelectedSecondVar(cont[0].name);
      }

      setSelectedMultiVars((prev) => {
        const valid = prev.filter((v) => cont.some((c) => c.name === v));
        return valid.length > 0 ? valid : cont.slice(0, 3).map((c) => c.name);
      });
    }

    if (cat.length > 0) {
      const activeIV = cat.some((c) => c.name === selectedIV) ? selectedIV : cat[0].name;
      if (activeIV !== selectedIV) {
        setSelectedIV(activeIV);
      }
      const groups = Array.from(
        new Set(currentDataset.data.map((d) => String(d[activeIV])).filter(Boolean))
      );
      if (groups.length >= 2) {
        if (!groups.includes(selectedGroup1) || !groups.includes(selectedGroup2)) {
          setSelectedGroup1(groups[0]);
          setSelectedGroup2(groups[1]);
        }
      }
    }
  }, [currentDataset.id, currentDataset.columns]);

  // Synchronize active research question when dataset switches
  useEffect(() => {
    if (currentDataset.researchQuestions && currentDataset.researchQuestions.length > 0) {
      if (!activeResearchQuestion || !currentDataset.researchQuestions.some((r) => r.id === activeResearchQuestion.id)) {
        setActiveResearchQuestion(currentDataset.researchQuestions[0]);
      }
    } else {
      setActiveResearchQuestion(null);
    }
  }, [currentDataset.id]);

  const handleSelectResearchQuestion = (rq: ResearchQuestion) => {
    setActiveResearchQuestion(rq);
    if (rq.testType) {
      setSelectedTest(rq.testType);
    }
    if (rq.dependentVar && currentDataset.columns.some((c) => c.name === rq.dependentVar)) {
      setSelectedDV(rq.dependentVar);
    }
    if (rq.independentVar && currentDataset.columns.some((c) => c.name === rq.independentVar)) {
      setSelectedIV(rq.independentVar);
    }
    if (rq.secondVar && currentDataset.columns.some((c) => c.name === rq.secondVar)) {
      setSelectedSecondVar(rq.secondVar);
    }
    if (rq.multiVars && rq.multiVars.length > 0) {
      const valid = rq.multiVars.filter((v) => currentDataset.columns.some((c) => c.name === v));
      if (valid.length > 0) setSelectedMultiVars(valid);
    }
  };

  const handleSaveResearchQuestion = (rq: ResearchQuestion) => {
    const existingRqs = currentDataset.researchQuestions || [];
    const exists = existingRqs.some((r) => r.id === rq.id);

    const updatedRqs = exists
      ? existingRqs.map((r) => (r.id === rq.id ? rq : r))
      : [...existingRqs, rq];

    const updatedDataset: Dataset = {
      ...currentDataset,
      researchQuestions: updatedRqs,
    };

    handleUpdateDataset(updatedDataset);
    handleSelectResearchQuestion(rq);
  };

  const handleDeleteResearchQuestion = (rqId: string) => {
    const updatedRqs = (currentDataset.researchQuestions || []).filter((r) => r.id !== rqId);
    const updatedDataset: Dataset = {
      ...currentDataset,
      researchQuestions: updatedRqs,
    };
    handleUpdateDataset(updatedDataset);
    if (activeResearchQuestion?.id === rqId) {
      setActiveResearchQuestion(updatedRqs[0] || null);
    }
  };

  const handleAutoDraftRq = () => {
    const draft = autoDraftResearchQuestion({
      testType: selectedTest,
      dependentVar: selectedDV,
      independentVar: selectedIV,
      group1: selectedGroup1,
      group2: selectedGroup2,
      secondVar: selectedSecondVar,
      multiVars: selectedMultiVars,
    });

    const newRq: ResearchQuestion = {
      id: `rq-${Date.now()}`,
      ...draft,
    };

    handleSaveResearchQuestion(newRq);
  };

  // Execute analytical calculation
  const executeAnalysis = () => {
    try {
      let res: StatisticalResult | null = null;

      switch (selectedTest) {
        case 'independent_ttest': {
          res = computeIndependentTTest(
            currentDataset.data,
            selectedDV,
            selectedIV,
            selectedGroup1,
            selectedGroup2
          );
          break;
        }
        case 'paired_ttest': {
          res = computePairedTTest(currentDataset.data, selectedDV, selectedSecondVar);
          break;
        }
        case 'one_sample_ttest': {
          res = computeOneSampleTTest(currentDataset.data, selectedDV, oneSampleTestValue);
          break;
        }
        case 'anova': {
          res = computeOneWayAnova(currentDataset.data, selectedDV, selectedIV);
          break;
        }
        case 'two_way_anova': {
          res = computeTwoWayAnova(currentDataset.data, selectedDV, selectedIV, selectedFactorB || selectedIV);
          break;
        }
        case 'repeated_measures_anova': {
          const vars = selectedMultiVars.length >= 2 ? selectedMultiVars : [selectedDV, selectedSecondVar];
          res = computeRepeatedMeasuresAnova(currentDataset.data, vars);
          break;
        }
        case 'ancova': {
          res = computeAncova(currentDataset.data, selectedDV, selectedIV, selectedCovariate || selectedSecondVar);
          break;
        }
        case 'mann_whitney': {
          res = computeMannWhitneyTest(
            currentDataset.data,
            selectedDV,
            selectedIV,
            selectedGroup1,
            selectedGroup2
          );
          break;
        }
        case 'wilcoxon_signed': {
          res = computeWilcoxonSignedTest(currentDataset.data, selectedDV, selectedSecondVar);
          break;
        }
        case 'kruskal_wallis': {
          res = computeKruskalWallisTest(currentDataset.data, selectedDV, selectedIV);
          break;
        }
        case 'friedman': {
          const vars = selectedMultiVars.length >= 2 ? selectedMultiVars : [selectedDV, selectedSecondVar];
          res = computeFriedmanTest(currentDataset.data, vars);
          break;
        }
        case 'regression': {
          const ivs = selectedMultiVars.filter((v) => v !== selectedDV);
          res = computeMultipleRegression(
            currentDataset.data,
            selectedDV,
            ivs.length > 0 ? ivs : [currentDataset.columns.find((c) => c.type === 'continuous')?.name || '']
          );
          break;
        }
        case 'logistic_regression': {
          const ivs = selectedMultiVars.filter((v) => v !== selectedIV);
          res = computeBinaryLogisticRegression(
            currentDataset.data,
            selectedIV,
            ivs.length > 0 ? ivs : [selectedDV],
            selectedGroup1
          );
          break;
        }
        case 'correlation': {
          res = computeCorrelationMatrix(currentDataset.data, selectedMultiVars, correlationMethod);
          break;
        }
        case 'cronbach_alpha': {
          const items = selectedMultiVars.length >= 2 ? selectedMultiVars : [selectedDV, selectedSecondVar];
          res = computeCronbachAlpha(currentDataset.data, items);
          break;
        }
        case 'chi_square': {
          res = computeChiSquareTest(currentDataset.data, selectedIV, selectedSecondVar);
          break;
        }
        case 'chi_square_gof': {
          res = computeChiSquareGoodnessOfFit(currentDataset.data, selectedIV);
          break;
        }
        case 'descriptive': {
          res = computeDescriptiveStats(currentDataset.data, selectedMultiVars);
          break;
        }
        case 'exploratory_factor_analysis': {
          const numericCols = currentDataset.columns
            .filter((c) => c.type === 'continuous')
            .map((c) => c.name);
          const vars = selectedMultiVars.length >= 3 ? selectedMultiVars : numericCols.slice(0, 6);
          if (vars.length >= 3) {
            res = computeExploratoryFactorAnalysis(currentDataset.data, vars);
          }
          break;
        }
        case 'confirmatory_factor_analysis': {
          const numericCols = currentDataset.columns
            .filter((c) => c.type === 'continuous')
            .map((c) => c.name);
          const vars = selectedMultiVars.length >= 3 ? selectedMultiVars : numericCols.slice(0, 6);
          if (vars.length >= 3) {
            const mid = Math.max(2, Math.ceil(vars.length / 2));
            const specs = [
              { name: 'Factor_1', indicators: vars.slice(0, mid) },
              { name: 'Factor_2', indicators: vars.slice(mid) },
            ];
            res = computeConfirmatoryFactorAnalysis(
              currentDataset.data,
              specs[1].indicators.length > 0 ? specs : undefined
            );
          }
          break;
        }
        case 'structural_equation_modeling': {
          const numericCols = currentDataset.columns
            .filter((c) => c.type === 'continuous')
            .map((c) => c.name);
          const vars = selectedMultiVars.length >= 3 ? selectedMultiVars : numericCols.slice(0, 6);
          if (vars.length >= 3) {
            res = computeStructuralEquationModeling(currentDataset.data);
          }
          break;
        }
      }

      if (res) {
        setCurrentResult(res);
        if (currentUser?.id) {
          saveAnalysisResultToFirestore(currentUser.id, res, currentDataset.name);
        }
      }
    } catch (err) {
      console.error('Computation error:', err);
    }
  };

  // Run on first load and whenever test or dataset data changes
  useEffect(() => {
    executeAnalysis();
  }, [
    selectedTest,
    currentDataset.id,
    currentDataset.data,
    selectedDV,
    selectedIV,
    selectedGroup1,
    selectedGroup2,
    selectedSecondVar,
    selectedMultiVars,
    correlationMethod,
    oneSampleTestValue,
    selectedFactorB,
    selectedCovariate,
  ]);

  const handleUpdateColumnType = (colName: string, newType: VariableType) => {
    handleUpdateDataset({
      ...currentDataset,
      columns: currentDataset.columns.map((c) =>
        c.name === colName ? { ...c, type: newType } : c
      ),
    });
  };

  // Quick demo runner for first-time onboarding
  const handleRunDemo = (demoType: StatisticalTestType) => {
    setCurrentDatasetId(SAMPLE_DATASETS[0].id);

    if (demoType === 'independent_ttest') {
      setSelectedTest('independent_ttest');
      setSelectedDV('Exam_Score');
      setSelectedIV('Intervention_Group');
      setSelectedGroup1('Mindfulness');
      setSelectedGroup2('Control');
    } else if (demoType === 'anova') {
      setSelectedTest('anova');
      setSelectedDV('Exam_Score');
      setSelectedIV('Intervention_Group');
    } else if (demoType === 'regression') {
      setSelectedTest('regression');
      setSelectedDV('Exam_Score');
      setSelectedMultiVars(['Study_Hours', 'Sleep_Hours', 'Stress_Score']);
    } else {
      setSelectedTest(demoType);
    }

    setActiveTab('analysis');
  };

  const datasetValidation = useMemo(() => {
    return validateDatasetForTest(currentDataset, selectedTest);
  }, [currentDataset, selectedTest]);

  const isDatasetComplete = datasetValidation.isComplete;

  const handleGoogleFormLinkClick = (e: React.MouseEvent) => {
    const url = getEffectiveGoogleFormUrl();
    // If a custom or official Google Form has been created (not placeholder or forms.new)
    if (url && !url.includes('StatAssistAI_Usability_Benchmark') && url !== 'https://forms.new') {
      return; // allow browser to open real form
    }
    // Intercept to prevent 404 page and open Google Form Sheet Database manager in modal
    e.preventDefault();
    setUsabilityModalInitialTab('form-sheet');
    setIsUsabilityTestOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Navigation (Workspace Stages) */}
      {activeTab !== 'landing' && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (!isLoggedIn && tab !== 'landing') {
              handleLoginSuccess(MOHDZUL_ADMIN_PROFILE);
            }
            if ((tab === 'analysis' || tab === 'apa-report') && !isDatasetComplete) {
              return;
            }
            setActiveTab(tab);
          }}
          onOpenApaGuide={() => setIsGuideOpen(true)}
          onOpenUserGuide={() => setIsUserGuideOpen(true)}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
          onOpenAdminCms={() => setIsAdminCmsOpen(true)}
          onOpenUsabilityTest={() => setIsUsabilityTestOpen(true)}
          onOpenPublishChecklist={() => setIsPublishChecklistOpen(true)}
          onOpenGmail={() => setIsGmailOpen(true)}
          onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
          onRunTest={executeAnalysis}
          hasData={currentDataset.data.length > 0}
          isDatasetComplete={isDatasetComplete}
          currentUser={currentUser}
          isLoggedIn={isLoggedIn}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onDirectLogin={handleLoginSuccess}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />
      )}

      {activeTab === 'landing' ? (
        <LandingPage
          onEnterWorkspace={(tab = 'wizard') => {
            if (!isLoggedIn) {
              handleLoginSuccess(MOHDZUL_ADMIN_PROFILE);
            }
            setActiveTab(tab);
          }}
          onLoginSuccess={handleLoginSuccess}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          onOpenAdminCms={() => setIsAdminCmsOpen(true)}
        />
      ) : (
        <>
          {/* Main Workspace Stage */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* First-Time User Onboarding Banner */}
        {showQuickstartBanner && (
          <div className="bg-white rounded-xl border border-blue-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    First Time Using StatAssist AI?
                  </h3>
                  <span className="text-[11px] font-mono text-blue-700 bg-blue-100/60 px-1.5 py-0.5 rounded font-bold">
                    Quickstart Guide
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Learn how to ingest raw datasets, verify measurement scales, run inferential hypotheses, and generate APA 7th publication tables with our 5-step checklist.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setIsUserGuideOpen(true)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Step-by-Step Checklist
              </button>
              <button
                type="button"
                onClick={() => setShowQuickstartBanner(false)}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        {/* View 1: Selecting Test View (Empirical Methodology Test Selector - Priority 1 & Default) */}
        {activeTab === 'wizard' && (
          <SelectingTestView
            onSelectAndConfigure={handleSelectAndConfigureTest}
            currentSelectedTest={selectedTest}
          />
        )}

        {/* View 2: Dataset Management & Variable Dictionary (Priority 2) */}
        {activeTab === 'data' && (
          <DatasetManager
            currentDataset={currentDataset}
            availableDatasets={availableDatasets}
            onSelectDataset={handleSelectDataset}
            onUpdateDataset={handleUpdateDataset}
            onDuplicateDataset={handleDuplicateDataset}
            onResetSampleDataset={handleResetSampleDataset}
            onResetToBaseline={handleResetToBaseline}
            onUpdateColumnType={handleUpdateColumnType}
            onProceedToAnalysis={() => {
              if (isDatasetComplete) {
                setActiveTab('analysis');
              }
            }}
            activeResearchQuestion={activeResearchQuestion}
            onSelectResearchQuestion={handleSelectResearchQuestion}
            onOpenAddRqModal={() => {
              setEditingRq(null);
              setIsRqModalOpen(true);
            }}
            onOpenEditRqModal={(rq) => {
              setEditingRq(rq);
              setIsRqModalOpen(true);
            }}
            onDeleteResearchQuestion={handleDeleteResearchQuestion}
            presetStudyBanner={presetStudyBanner}
            selectedTest={selectedTest}
            onSelectTestAndStudy={(test) => applyPresetStudyForTest(test, false)}
            onNavigateToSelectingTest={() => setActiveTab('wizard')}
            onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
          />
        )}

        {/* View 3: Test Analysis Stage (Priority 3) */}
        {activeTab === 'analysis' && (
          <div className="space-y-8">
            <TestSelector
              selectedTest={selectedTest}
              onSelectTest={(test) => {
                applyPresetStudyForTest(test, false);
              }}
              onOpenWizard={() => setActiveTab('wizard')}
            />

            <StatisticalConsole
              dataset={currentDataset}
              testType={selectedTest}
              selectedDV={selectedDV}
              setSelectedDV={setSelectedDV}
              selectedIV={selectedIV}
              setSelectedIV={setSelectedIV}
              selectedGroup1={selectedGroup1}
              setSelectedGroup1={setSelectedGroup1}
              selectedGroup2={selectedGroup2}
              setSelectedGroup2={setSelectedGroup2}
              selectedSecondVar={selectedSecondVar}
              setSelectedSecondVar={setSelectedSecondVar}
              selectedMultiVars={selectedMultiVars}
              setSelectedMultiVars={setSelectedMultiVars}
              correlationMethod={correlationMethod}
              setCorrelationMethod={setCorrelationMethod}
              alphaLevel={alphaLevel}
              setAlphaLevel={setAlphaLevel}
              oneSampleTestValue={oneSampleTestValue}
              setOneSampleTestValue={setOneSampleTestValue}
              selectedFactorB={selectedFactorB}
              setSelectedFactorB={setSelectedFactorB}
              selectedCovariate={selectedCovariate}
              setSelectedCovariate={setSelectedCovariate}
              activeResearchQuestion={activeResearchQuestion}
              onSelectResearchQuestion={handleSelectResearchQuestion}
              onOpenAddRqModal={() => {
                setEditingRq(null);
                setIsRqModalOpen(true);
              }}
              onOpenEditRqModal={(rq) => {
                setEditingRq(rq);
                setIsRqModalOpen(true);
              }}
              onAutoDraftRq={handleAutoDraftRq}
              onExecuteAnalysis={() => {
                executeAnalysis();
                setActiveTab('analysis');
                setTimeout(() => {
                  const el = document.getElementById('results-display-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 100);
              }}
            />

            {currentResult && (
              <div id="results-display-section" className="space-y-8 scroll-mt-20">
                <ResultsDisplay
                  result={currentResult}
                  dataset={currentDataset}
                  activeResearchQuestion={activeResearchQuestion}
                  alphaLevel={alphaLevel}
                  onOpenApaGuide={() => setIsGuideOpen(true)}
                  onProceedToAiSynthesis={() => {
                    const el = document.getElementById('wizard-synthesis-section');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  onOpenAddRqModal={() => {
                    setEditingRq(null);
                    setIsRqModalOpen(true);
                  }}
                  onOpenEditRqModal={(rq) => {
                    setEditingRq(rq);
                    setIsRqModalOpen(true);
                  }}
                  onOpenGmail={() => setIsGmailOpen(true)}
                />

                {/* Integrated Manuscript Synthesis & Scholarly Narrative */}
                <div id="wizard-synthesis-section" className="space-y-4 pt-6 border-t border-slate-200 scroll-mt-20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-600 mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Scholarly Narrative & Discussion</span>
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                        APA 7th Manuscript Synthesis & Theoretical Discussion
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Automated generation of publication-ready Results paragraphs, assumption testing audits, and theoretical discussion drafts.
                      </p>
                    </div>
                  </div>

                  <ApaManuscriptGenerator
                    result={currentResult}
                    defaultResearchQuestion={activeResearchQuestion?.question || ''}
                    authorProfile={currentUser}
                    onOpenNotebookLMSync={() => setIsNotebookLMSyncOpen(true)}
                  />
                </div>
              </div>
            )}
          </div>
        )}
        </main>
        </>
      )}

      {/* Footer: Official PayPal Donate & Copyright Protection at Bottom of Page */}
      <footer className={`w-full border-t py-3.5 px-4 sm:px-6 lg:px-8 mt-auto z-20 ${
        activeTab === 'landing'
          ? 'bg-[#080d1a]/95 border-slate-800 text-slate-400'
          : 'bg-white/95 border-slate-200/80 text-slate-600 backdrop-blur-xs'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Copyright & Intellectual Property */}
          <div className="flex flex-wrap items-center gap-2 text-center sm:text-left">
            <button
              type="button"
              onClick={() => setIsIpProtectionOpen(true)}
              className={`inline-flex items-center gap-1.5 font-bold transition-colors px-2.5 py-1 rounded-md border text-xs cursor-pointer shadow-2xs group ${
                activeTab === 'landing'
                  ? 'text-slate-300 bg-slate-900 hover:bg-slate-800 border-slate-700'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border-slate-300'
              }`}
              title="StatAssist AI Copyright 2026 — View Intellectual Property, Copyright & Trade Secret Protections"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
              <span>StatAssist AI Copyright 2026</span>
            </button>
          </div>

          {/* PayPal Hosted SDK Container (supports dynamic Hosted Buttons injection) */}
          <div id="paypal-container-donate" className="hidden"></div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={currentUser}
          onUpdateUser={handleUpdateUserProfile}
          onSignOut={handleSignOut}
          onSwitchProfile={(profile) => {
            handleLoginSuccess(profile);
          }}
          onOpenAdminCms={() => setIsAdminCmsOpen(true)}
        />
      )}

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        defaultEmail={currentUser?.email || ''}
        defaultName={currentUser?.name || ''}
        defaultOrganization={currentUser?.institution || ''}
        adminEmail="mohdzul@gmail.com"
        onOpenAdminCms={() => setIsAdminCmsOpen(true)}
        currentTest={selectedTest}
        datasetStats={{
          hasData: currentDataset.data.length > 0,
          rowCount: currentDataset.data.length,
          colCount: currentDataset.columns.length,
        }}
      />

      <AdminCmsModal
        isOpen={isAdminCmsOpen}
        onClose={() => setIsAdminCmsOpen(false)}
        adminEmail="mohdzul@gmail.com"
        onSelectUserToImpersonate={(member) => {
          // Allow administrator to preview platform as this member if desired
          setIsAdminCmsOpen(false);
        }}
      />

      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
        onRunDemo={handleRunDemo}
      />

      <HypothesisWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSelectTest={(test) => {
          setSelectedTest(test);
          setActiveTab('analysis');
        }}
      />

      <ApaGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <ResearchQuestionModal
        isOpen={isRqModalOpen}
        onClose={() => {
          setIsRqModalOpen(false);
          setEditingRq(null);
        }}
        onSave={handleSaveResearchQuestion}
        dataset={currentDataset}
        editingRq={editingRq}
        currentTestType={selectedTest}
        currentDV={selectedDV}
        currentIV={selectedIV}
        currentMultiVars={selectedMultiVars}
      />

      {/* Google Workspace & Gemini NotebookLM Drive Sync Modal */}
      <NotebookLMSyncModal
        isOpen={isNotebookLMSyncOpen}
        onClose={() => setIsNotebookLMSyncOpen(false)}
        currentDataset={currentDataset}
        currentResult={currentResult}
        activeResearchQuestion={activeResearchQuestion}
        activeTestName={selectedTest}
      />

      {/* Google Workspace Gmail Integration Modal */}
      <GmailModal
        isOpen={isGmailOpen}
        onClose={() => setIsGmailOpen(false)}
        currentDataset={currentDataset}
        currentResult={currentResult}
        activeResearchQuestion={activeResearchQuestion}
        activeTestName={selectedTest}
      />

      {/* Google Workspace Google Drive Integration Modal */}
      <GoogleDriveModal
        isOpen={isGoogleDriveOpen}
        onClose={() => setIsGoogleDriveOpen(false)}
        currentDataset={currentDataset}
        currentResult={currentResult}
        activeResearchQuestion={activeResearchQuestion}
        activeTestName={selectedTest}
        onImportDataset={(imported) => {
          setAvailableDatasets((prev) => [imported, ...prev.filter((d) => d.id !== imported.id)]);
          setCurrentDatasetId(imported.id);
          setActiveTab('data');
        }}
      />

      {/* Usability Test & Google Form Evaluation Modal */}
      <UsabilityTestModal
        isOpen={isUsabilityTestOpen}
        onClose={() => setIsUsabilityTestOpen(false)}
        defaultUserName={currentUser?.name || ''}
        defaultUserEmail={currentUser?.email || ''}
        defaultRole={currentUser?.title || 'Academic Researcher'}
        initialTab={usabilityModalInitialTab}
      />

      {/* Publication Readiness Checklist & Google Keep/Tasks Sync Modal */}
      <PublishChecklistModal
        isOpen={isPublishChecklistOpen}
        onClose={() => setIsPublishChecklistOpen(false)}
      />

      {/* Donate Modal (PayPal & MYR Support) */}
      <DonateModal
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
      />

      {/* Intellectual Property & Copyright Protection Modal */}
      <IpCopyrightModal
        isOpen={isIpProtectionOpen}
        onClose={() => setIsIpProtectionOpen(false)}
        authorEmail={currentUser?.email || 'mohdzul@gmail.com'}
      />
    </div>
  );
}
