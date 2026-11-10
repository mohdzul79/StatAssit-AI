// Open Access authentication service (No Firebase dependency)
import { UserProfile, MOHDZUL_ADMIN_PROFILE, DEFAULT_USER_PROFILE } from '../types/user';

export interface SignUpProfileInput {
  name: string;
  email: string;
  password?: string;
  title: string;
  institution: string;
  department?: string;
  discipline: string;
  orcidId?: string;
}

export const googleProvider = {};
export const microsoftProvider = {};
export const appleProvider = {};
export const twitterProvider = {};
export const facebookProvider = {};

export interface MockUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}

export const firebaseUserToUserProfile = (
  fbUser: { email?: string | null; displayName?: string | null; uid?: string },
  _providerLabel: string = 'Open Access'
): UserProfile => {
  const email = (fbUser.email || '').trim().toLowerCase();
  if (email === 'mohdzul@gmail.com' || email.startsWith('mohdzul')) {
    return MOHDZUL_ADMIN_PROFILE;
  }

  const name = fbUser.displayName || email.split('@')[0] || 'Academic Scholar';
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AS';

  return {
    ...DEFAULT_USER_PROFILE,
    id: fbUser.uid || `user_${Date.now()}`,
    name,
    email: email || 'scholar@university.edu',
    avatarInitials: initials,
  };
};

export type AuthResult = UserProfile & { user: UserProfile };

const wrapAuthResult = (profile: UserProfile): AuthResult => {
  return Object.assign({}, profile, { user: profile });
};

export const signInWithFirebaseGoogle = async (): Promise<AuthResult> => wrapAuthResult(MOHDZUL_ADMIN_PROFILE);
export const signInWithFirebaseMicrosoft = async (): Promise<AuthResult> => wrapAuthResult(MOHDZUL_ADMIN_PROFILE);
export const signInWithFirebaseApple = async (): Promise<AuthResult> => wrapAuthResult(MOHDZUL_ADMIN_PROFILE);
export const signInWithFirebaseTwitter = async (): Promise<AuthResult> => wrapAuthResult(MOHDZUL_ADMIN_PROFILE);
export const signInWithFirebaseFacebook = async (): Promise<AuthResult> => wrapAuthResult(MOHDZUL_ADMIN_PROFILE);
export const signInWithFirebaseEmail = async (email: string, _password?: string): Promise<AuthResult> => {
  if (email.toLowerCase().includes('mohdzul')) {
    return wrapAuthResult(MOHDZUL_ADMIN_PROFILE);
  }
  const prof: UserProfile = {
    ...DEFAULT_USER_PROFILE,
    id: `user_${Date.now()}`,
    email,
    name: email.split('@')[0] || 'Scholar',
    avatarInitials: email.substring(0, 2).toUpperCase(),
  };
  return wrapAuthResult(prof);
};

export const registerNewUserWithProfile = async (input: SignUpProfileInput): Promise<AuthResult> => {
  const prof: UserProfile = {
    ...DEFAULT_USER_PROFILE,
    id: `user_${Date.now()}`,
    name: input.name,
    email: input.email,
    title: input.title,
    institution: input.institution,
    department: input.department || 'Quantitative Research',
    discipline: input.discipline,
    orcidId: input.orcidId,
    avatarInitials: input.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'AS',
  };
  return wrapAuthResult(prof);
};

export const formatFirebaseAuthError = (error: any): string => {
  return error?.message || 'Authentication error';
};

export const signInWithGooglePopup = signInWithFirebaseGoogle;
export const signInWithMicrosoftPopup = signInWithFirebaseMicrosoft;
export const signInWithApplePopup = signInWithFirebaseApple;
export const signInWithTwitterPopup = signInWithFirebaseTwitter;
export const signInWithFacebookPopup = signInWithFirebaseFacebook;
export const signInWithEmailPassword = signInWithFirebaseEmail;
export const signUpWithEmailPassword = registerNewUserWithProfile;

export const logOutFromFirebase = async (): Promise<void> => {};
export const subscribeToAuthChanges = (callback: (user: UserProfile | null) => void) => {
  callback(MOHDZUL_ADMIN_PROFILE);
  return () => {};
};
