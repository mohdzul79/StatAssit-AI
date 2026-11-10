// Open Access local persistence replacing Firebase
import { UserProfile } from '../types/user';
import { Dataset, StatisticalResult } from '../types/stats';

// Lightweight dummy Auth and DB objects for zero-dependency open access
export const auth = {
  currentUser: null as { uid?: string; email?: string | null; displayName?: string | null; emailVerified?: boolean; isAnonymous?: boolean; tenantId?: string | null; providerData?: any[] } | null,
};

export const db = {};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  console.error('Storage Error: ', error, operationType, path);
  throw error;
}

export async function testConnection(): Promise<void> {
  // Open access mode: local state ready
}

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
  } catch (e) {
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
  } catch (e) {
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
