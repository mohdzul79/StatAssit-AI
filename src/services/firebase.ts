import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile } from '../types/user';
import { Dataset, StatisticalResult } from '../types/stats';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();

const LOCAL_STORAGE_USERS_KEY = 'statassist_open_access_users';
const LOCAL_STORAGE_DATASETS_KEY = 'statassist_open_access_datasets';
const LOCAL_STORAGE_ANALYSES_KEY = 'statassist_open_access_analyses';

export async function syncUserProfileToFirestore(profile: UserProfile): Promise<void> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    const users = raw ? JSON.parse(raw) : {};
    users[profile.id] = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.debug('Open access local sync:', e);
  }
}

export async function loadUserProfileFromFirestore(userId: string): Promise<Partial<UserProfile> | null> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (!raw) return null;
    const users = JSON.parse(raw);
    return users[userId] || null;
  } catch {
    return null;
  }
}

export async function saveUserDatasetToFirestore(userId: string, dataset: Dataset): Promise<void> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DATASETS_KEY);
    const datasets = raw ? JSON.parse(raw) : {};
    if (!datasets[userId]) datasets[userId] = [];
    const idx = datasets[userId].findIndex((d: Dataset) => d.id === dataset.id);
    if (idx >= 0) {
      datasets[userId][idx] = dataset;
    } else {
      datasets[userId].unshift(dataset);
    }
    localStorage.setItem(LOCAL_STORAGE_DATASETS_KEY, JSON.stringify(datasets));
  } catch (e) {
    console.debug('Local dataset storage:', e);
  }
}

export async function loadUserDatasetsFromFirestore(userId: string): Promise<Dataset[]> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DATASETS_KEY);
    if (!raw) return [];
    const datasets = JSON.parse(raw);
    return datasets[userId] || [];
  } catch {
    return [];
  }
}

export async function saveAnalysisResultToFirestore(
  userId: string,
  result: StatisticalResult,
  datasetName: string
): Promise<void> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ANALYSES_KEY);
    const analyses = raw ? JSON.parse(raw) : {};
    if (!analyses[userId]) analyses[userId] = [];
    analyses[userId].unshift({
      id: `res_${Date.now()}`,
      datasetName,
      result,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_STORAGE_ANALYSES_KEY, JSON.stringify(analyses));
  } catch (e) {
    console.debug('Local analysis storage:', e);
  }
}
