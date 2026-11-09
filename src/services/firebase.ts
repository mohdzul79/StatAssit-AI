import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
  collection,
  getDocs,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile } from '../types/user';
import { Dataset, StatisticalResult } from '../types/stats';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore using the firestoreDatabaseId from config if provided
export const db = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Operation types for Firestore security error diagnosis
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

/**
 * Mandatory Firestore error handler conforming to skill specification
 */
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

/**
 * Validate Connection to Firestore on boot
 */
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

// Run initial connection test safely
testConnection().catch(() => {
  // Silent catch for initial unauthenticated test doc
});

/**
 * Persist user profile to Firestore
 */
export async function syncUserProfileToFirestore(profile: UserProfile): Promise<void> {
  const path = `users/${profile.id}`;
  try {
    await setDoc(
      doc(db, 'users', profile.id),
      {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.systemRole || 'researcher',
        institution: profile.institution || 'Quantitative Research Institute',
        department: profile.department || 'Faculty of Social Sciences',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Could not sync user profile to Firestore:', error);
  }
}

/**
 * Load user profile from Firestore
 */
export async function loadUserProfileFromFirestore(userId: string): Promise<Partial<UserProfile> | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as Partial<UserProfile>;
    }
    return null;
  } catch (error) {
    console.warn('Could not fetch user profile from Firestore:', error);
    return null;
  }
}

/**
 * Persist user dataset to Firestore
 */
export async function saveUserDatasetToFirestore(userId: string, dataset: Dataset): Promise<void> {
  const path = `users/${userId}/datasets/${dataset.id}`;
  try {
    await setDoc(
      doc(db, 'users', userId, 'datasets', dataset.id),
      {
        id: dataset.id,
        userId,
        name: dataset.name,
        description: dataset.description || '',
        rowCount: dataset.data.length,
        colCount: dataset.columns.length,
        columns: dataset.columns,
        data: dataset.data.slice(0, 500), // Protect payload size
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Could not sync dataset to Firestore:', error);
  }
}

/**
 * Load user datasets from Firestore
 */
export async function loadUserDatasetsFromFirestore(userId: string): Promise<Dataset[]> {
  const path = `users/${userId}/datasets`;
  try {
    const querySnap = await getDocs(collection(db, 'users', userId, 'datasets'));
    const list: Dataset[] = [];
    querySnap.forEach((docSnap) => {
      list.push(docSnap.data() as Dataset);
    });
    return list;
  } catch (error) {
    console.warn('Could not load user datasets from Firestore:', error);
    return [];
  }
}

/**
 * Persist analysis result to Firestore
 */
export async function saveAnalysisResultToFirestore(
  userId: string,
  result: StatisticalResult,
  datasetName: string
): Promise<void> {
  const id = `res_${Date.now()}`;
  const resObj = result as any;
  try {
    await setDoc(doc(db, 'users', userId, 'analyses', id), {
      id,
      userId,
      testType: resObj.testType || 'statistical_test',
      testName: resObj.testName || 'Inferential Test',
      datasetName,
      result: {
        testName: resObj.testName || 'Statistical Result',
        statistic: resObj.statistic ?? resObj.fValue ?? resObj.tValue ?? null,
        pValue: resObj.pValue ?? null,
        df: resObj.df ?? null,
        effectSize: resObj.effectSize ?? null,
        conclusion: resObj.conclusion ?? '',
      },
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Could not save analysis result to Firestore:', error);
  }
}
