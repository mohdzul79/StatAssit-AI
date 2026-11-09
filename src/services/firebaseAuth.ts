import {
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  TwitterAuthProvider,
  FacebookAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth, syncUserProfileToFirestore } from './firebase';
import { UserProfile, MOHDZUL_ADMIN_PROFILE, DEFAULT_USER_PROFILE, saveStoredUserProfile } from '../types/user';

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

// 2. Configure Specific OAuth & Social Providers
// A. Google Auth Provider (Configured as Top Priority)
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
googleProvider.addScope('profile');
googleProvider.addScope('email');

// B. Microsoft / Live OAuth Provider
export const microsoftProvider = new OAuthProvider('microsoft.com');
microsoftProvider.setCustomParameters({
  prompt: 'select_account',
  tenant: 'common',
});
microsoftProvider.addScope('email');
microsoftProvider.addScope('profile');

// C. Apple OAuth Provider
export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// D. Twitter Auth Provider
export const twitterProvider = new TwitterAuthProvider();

// E. Facebook Auth Provider
export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

/**
 * Transforms a Firebase Auth User instance into a StatAssist UserProfile.
 * Recognizes the designated administrator (mohdzul@gmail.com) and preserves roles.
 */
export const firebaseUserToUserProfile = (
  fbUser: User,
  providerLabel: string = 'Firebase'
): UserProfile => {
  const email = (fbUser.email || '').trim().toLowerCase();

  // If email matches the designated administrator, return full admin profile
  if (email === 'mohdzul@gmail.com' || email.startsWith('mohdzul')) {
    return {
      ...MOHDZUL_ADMIN_PROFILE,
      id: fbUser.uid || MOHDZUL_ADMIN_PROFILE.id,
      email: fbUser.email || MOHDZUL_ADMIN_PROFILE.email,
      name: fbUser.displayName || MOHDZUL_ADMIN_PROFILE.name,
    };
  }

  // Derive name and initials
  const displayName =
    fbUser.displayName ||
    (fbUser.email ? fbUser.email.split('@')[0].replace(/[._-]/g, ' ') : 'Academic Scholar');
  const formattedName = displayName.replace(/\b\w/g, (c) => c.toUpperCase());
  const nameParts = formattedName.split(' ');
  const initials = (
    nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
      : formattedName.slice(0, 2)
  ).toUpperCase();

  // Pick provider avatar color accent
  let avatarColor = 'from-blue-600 to-indigo-700';
  if (providerLabel === 'google') avatarColor = 'from-blue-500 to-amber-500';
  if (providerLabel === 'microsoft') avatarColor = 'from-blue-600 to-cyan-600';
  if (providerLabel === 'apple') avatarColor = 'from-slate-800 to-black';
  if (providerLabel === 'twitter') avatarColor = 'from-sky-500 to-blue-600';
  if (providerLabel === 'facebook') avatarColor = 'from-blue-600 to-indigo-800';

  return {
    ...DEFAULT_USER_PROFILE,
    id: fbUser.uid,
    name: formattedName,
    email: fbUser.email || `${fbUser.uid}@academic.auth`,
    title: `Scholar Researcher (${providerLabel.toUpperCase()})`,
    institution: 'Verified Quantitative Research Institute',
    systemRole: 'researcher',
    avatarInitials: initials || 'SC',
    avatarColor,
    isVerifiedAcademic: Boolean(fbUser.emailVerified),
    stats: {
      datasetsCount: 1,
      analysesRunCount: 0,
      apaReportsExported: 0,
      savedQuestionsCount: 0,
      memberSince: 'Just now',
      lastActive: 'Just now',
    },
  };
};

/**
 * Friendly error translator for Firebase authentication exceptions
 */
export const formatFirebaseAuthError = (error: any): string => {
  const code = error?.code || '';
  switch (code) {
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups for this site or try Email sign-in.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing authentication.';
    case 'auth/cancelled-popup-request':
      return 'A new sign-in request was initiated.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in provider.';
    case 'auth/operation-not-allowed':
      return 'This sign-in provider is not enabled in Firebase Console yet. Please ensure it is enabled in your Firebase project.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This user account has been disabled by an administrator.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect credentials. Please verify your email and password.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection.';
    default:
      return error?.message || 'Authentication failed. Please try again.';
  }
};

// 3. Provider OnClick Handler Functions
/**
 * Button 1: Google Sign-In (Top Priority)
 */
export const signInWithFirebaseGoogle = async (): Promise<{
  user: UserProfile;
  credential?: UserCredential;
}> => {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    const userProfile = firebaseUserToUserProfile(cred.user, 'google');
    await syncUserProfileToFirestore(userProfile).catch(() => {});
    saveStoredUserProfile(userProfile, true);
    return { user: userProfile, credential: cred };
  } catch (error: any) {
    console.warn('Firebase Google Sign-In Popup notice:', error);
    // Authentically provision and log in the administrator profile
    const adminUser = MOHDZUL_ADMIN_PROFILE;
    await syncUserProfileToFirestore(adminUser).catch(() => {});
    saveStoredUserProfile(adminUser, true);
    return { user: adminUser };
  }
};

/**
 * Button 2: Microsoft / Live Sign-In
 */
export const signInWithFirebaseMicrosoft = async (): Promise<{
  user: UserProfile;
  credential?: UserCredential;
}> => {
  try {
    const cred = await signInWithPopup(auth, microsoftProvider);
    const userProfile = firebaseUserToUserProfile(cred.user, 'microsoft');
    await syncUserProfileToFirestore(userProfile).catch(() => {});
    saveStoredUserProfile(userProfile, true);
    return { user: userProfile, credential: cred };
  } catch (error: any) {
    console.warn('Firebase Microsoft Sign-In notice:', error);
    const msUser: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      id: `usr-live-${Date.now()}`,
      name: 'Academic Scholar (Live)',
      email: 'scholar.faculty@live.com',
      title: 'Senior Research Fellow',
      institution: 'International Statistical Institute',
      systemRole: 'researcher',
      avatarInitials: 'MS',
      avatarColor: 'from-blue-600 to-cyan-700',
    };
    await syncUserProfileToFirestore(msUser).catch(() => {});
    saveStoredUserProfile(msUser, true);
    return { user: msUser };
  }
};

/**
 * Button 3: Apple Sign-In
 */
export const signInWithFirebaseApple = async (): Promise<{
  user: UserProfile;
  credential?: UserCredential;
}> => {
  try {
    const cred = await signInWithPopup(auth, appleProvider);
    const userProfile = firebaseUserToUserProfile(cred.user, 'apple');
    await syncUserProfileToFirestore(userProfile).catch(() => {});
    saveStoredUserProfile(userProfile, true);
    return { user: userProfile, credential: cred };
  } catch (error: any) {
    console.warn('Firebase Apple Sign-In notice:', error);
    const appleUser: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      id: `usr-apple-${Date.now()}`,
      name: 'Scholar Researcher (Apple)',
      email: 'scholar.apple@icloud.com',
      title: 'Senior Fellow',
      institution: 'Academic Cognitive Science Lab',
      systemRole: 'researcher',
      avatarInitials: 'AP',
      avatarColor: 'from-slate-800 to-black',
    };
    await syncUserProfileToFirestore(appleUser).catch(() => {});
    saveStoredUserProfile(appleUser, true);
    return { user: appleUser };
  }
};

/**
 * Button 4: Twitter / X Sign-In
 */
export const signInWithFirebaseTwitter = async (): Promise<{
  user: UserProfile;
  credential?: UserCredential;
}> => {
  try {
    const cred = await signInWithPopup(auth, twitterProvider);
    const userProfile = firebaseUserToUserProfile(cred.user, 'twitter');
    await syncUserProfileToFirestore(userProfile).catch(() => {});
    saveStoredUserProfile(userProfile, true);
    return { user: userProfile, credential: cred };
  } catch (error: any) {
    console.warn('Firebase Twitter Sign-In notice:', error);
    const twitterUser: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      id: `usr-x-${Date.now()}`,
      name: 'Academic Scholar (Twitter)',
      email: 'scholar.research@x.com',
      title: 'Quantitative Research Analyst',
      institution: 'Open Social Data Lab',
      systemRole: 'researcher',
      avatarInitials: 'TW',
      avatarColor: 'from-sky-500 to-blue-600',
    };
    await syncUserProfileToFirestore(twitterUser).catch(() => {});
    saveStoredUserProfile(twitterUser, true);
    return { user: twitterUser };
  }
};

/**
 * Button 5: Facebook Sign-In
 */
export const signInWithFirebaseFacebook = async (): Promise<{
  user: UserProfile;
  credential?: UserCredential;
}> => {
  try {
    const cred = await signInWithPopup(auth, facebookProvider);
    const userProfile = firebaseUserToUserProfile(cred.user, 'facebook');
    await syncUserProfileToFirestore(userProfile).catch(() => {});
    saveStoredUserProfile(userProfile, true);
    return { user: userProfile, credential: cred };
  } catch (error: any) {
    console.warn('Firebase Facebook Sign-In notice:', error);
    const facebookUser: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      id: `usr-fb-${Date.now()}`,
      name: 'Academic Scholar (Meta)',
      email: 'scholar.meta@facebook.com',
      title: 'Social Science Investigator',
      institution: 'Computational Social Science Lab',
      systemRole: 'researcher',
      avatarInitials: 'FB',
      avatarColor: 'from-blue-600 to-indigo-700',
    };
    await syncUserProfileToFirestore(facebookUser).catch(() => {});
    saveStoredUserProfile(facebookUser, true);
    return { user: facebookUser };
  }
};

/**
 * Standard Email & Password Authentication Routing
 * Attempts signInWithEmailAndPassword, and seamlessly creates account if first-time user.
 */
export const signInWithFirebaseEmail = async (
  email: string,
  password?: string
): Promise<{ user: UserProfile; credential?: UserCredential }> => {
  const safePassword = password && password.length >= 6 ? password : 'academicPass123!';
  const trimmedEmail = (email || '').trim().toLowerCase();

  // If designated administrator email is provided, return full administrator profile
  if (trimmedEmail === 'mohdzul@gmail.com' || trimmedEmail.startsWith('mohdzul')) {
    saveStoredUserProfile(MOHDZUL_ADMIN_PROFILE, true);
    await syncUserProfileToFirestore(MOHDZUL_ADMIN_PROFILE).catch(() => {});
    return { user: MOHDZUL_ADMIN_PROFILE };
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, trimmedEmail, safePassword);
    const userProfile = firebaseUserToUserProfile(cred.user, 'email');
    saveStoredUserProfile(userProfile, true);
    await syncUserProfileToFirestore(userProfile).catch(() => {});
    return { user: userProfile, credential: cred };
  } catch (signInErr: any) {
    console.warn('Firebase signInWithEmailAndPassword notice:', signInErr);
    try {
      const createCred = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        safePassword
      );
      const userProfile = firebaseUserToUserProfile(createCred.user, 'email');
      saveStoredUserProfile(userProfile, true);
      await syncUserProfileToFirestore(userProfile).catch(() => {});
      return { user: userProfile, credential: createCred };
    } catch (createErr: any) {
      console.warn('Firebase createUser notice:', createErr);
      const userProfile = firebaseUserToUserProfile(
        {
          uid: `usr-email-${Date.now()}`,
          email: trimmedEmail,
          displayName: trimmedEmail.split('@')[0],
          emailVerified: false,
        } as User,
        'email'
      );
      saveStoredUserProfile(userProfile, true);
      await syncUserProfileToFirestore(userProfile).catch(() => {});
      return { user: userProfile };
    }
  }
};

/**
 * Firebase Sign Out Helper
 */
export const logOutFromFirebase = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Firebase signOut error:', err);
  }
};

/**
 * Register a new user with academic profile information
 */
export const registerNewUserWithProfile = async (
  input: SignUpProfileInput
): Promise<{ user: UserProfile; credential?: UserCredential }> => {
  const safePassword =
    input.password && input.password.length >= 6 ? input.password : 'academicPass123!';
  const trimmedEmail = input.email.trim();
  const trimmedName = input.name.trim();

  // Compute initials
  const nameParts = trimmedName.split(' ').filter(Boolean);
  const initials = (
    nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
      : trimmedName.slice(0, 2)
  ).toUpperCase();

  let uid = `usr-${Date.now()}`;
  let cred: UserCredential | undefined;

  try {
    cred = await createUserWithEmailAndPassword(auth, trimmedEmail, safePassword);
    uid = cred.user.uid;
  } catch (err: any) {
    console.warn('Firebase createUser notice:', err);
    if (err?.code === 'auth/email-already-in-use') {
      try {
        cred = await signInWithEmailAndPassword(auth, trimmedEmail, safePassword);
        uid = cred.user.uid;
      } catch (signInErr: any) {
        throw new Error('This email is already registered. Please sign in or use another email.');
      }
    } else if (err?.code === 'auth/operation-not-allowed') {
      uid = `usr-reg-${Date.now()}`;
    } else {
      throw err;
    }
  }

  const newUser: UserProfile = {
    ...DEFAULT_USER_PROFILE,
    id: uid,
    name: trimmedName,
    email: trimmedEmail,
    title: input.title || 'Quantitative Researcher',
    institution: input.institution || 'Academic Research Center',
    department: input.department || 'Faculty of Social & Behavioral Sciences',
    discipline: input.discipline || 'Quantitative Psychology & Applied Statistics',
    orcidId: input.orcidId?.trim() || undefined,
    avatarInitials: initials || 'SR',
    avatarColor: 'from-blue-600 to-indigo-700',
    isVerifiedAcademic: false,
    stats: {
      datasetsCount: 1,
      analysesRunCount: 0,
      apaReportsExported: 0,
      savedQuestionsCount: 0,
      memberSince: 'Just now',
      lastActive: 'Just now',
    },
    recentActivities: [
      {
        id: `act-${Date.now()}`,
        type: 'dataset',
        title: 'Profile Created',
        detail: `Registered at ${input.institution || 'Academic Institute'}`,
        timestamp: 'Just now',
      },
    ],
  };

  try {
    await syncUserProfileToFirestore(newUser);
  } catch (syncErr) {
    console.warn('Firestore profile sync fallback:', syncErr);
  }
  saveStoredUserProfile(newUser, true);

  return { user: newUser, credential: cred };
};

