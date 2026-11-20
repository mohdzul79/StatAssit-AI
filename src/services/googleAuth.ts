// Client-side Google Authentication & OAuth Access Token Manager via Firebase Auth
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import { auth } from './firebase';

export const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
];

export { auth };

export const googleProvider = new GoogleAuthProvider();
SCOPES.forEach((scope) => {
  googleProvider.addScope(scope);
});
googleProvider.setCustomParameters({ prompt: 'select_account' });

export interface WorkspaceUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// Strict in-memory caching for OAuth access token (never localStorage/sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;

function toWorkspaceUser(user: User): WorkspaceUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  };
}

export const initGoogleAuth = (
  onAuthSuccess?: (user: WorkspaceUser, token: string) => void,
  onAuthFailure?: () => void,
  onUserStateChange?: (user: WorkspaceUser | null) => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      const workspaceUser = toWorkspaceUser(user);
      if (onUserStateChange) onUserStateChange(workspaceUser);
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(workspaceUser, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onUserStateChange) onUserStateChange(null);
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogleOAuth = async (
  forceConsent = false
): Promise<{
  user: WorkspaceUser;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const provider = new GoogleAuthProvider();
    SCOPES.forEach((scope) => {
      provider.addScope(scope);
    });
    provider.setCustomParameters({
      prompt: forceConsent ? 'consent select_account' : 'select_account',
    });

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || '';
    cachedAccessToken = token || null;

    return {
      user: toWorkspaceUser(result.user),
      accessToken: token,
    };
  } finally {
    isSigningIn = false;
  }
};

export const getGoogleAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setGoogleAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const getCurrentGoogleUser = (): WorkspaceUser | null => {
  return auth.currentUser ? toWorkspaceUser(auth.currentUser) : null;
};

export const googleSignOut = async () => {
  cachedAccessToken = null;
  await signOut(auth);
};
