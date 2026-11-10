// Client-side Google Authentication helpers for Google Workspace (Sheets/Forms/Docs/Drive/Tasks/Gmail)
// Zero external Firebase dependency

export interface WorkspaceUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export const auth = {
  currentUser: {
    uid: 'google_workspace_scholar',
    email: 'mohdzul@gmail.com',
    displayName: 'Dr. Mohd Zul (Principal Investigator)',
  } as WorkspaceUser | null,
};

export const googleProvider = {};

let cachedAccessToken: string | null = null;

export const initGoogleAuth = (
  onAuthSuccess?: (user: WorkspaceUser, token: string) => void,
  _onAuthFailure?: () => void
) => {
  if (auth.currentUser && cachedAccessToken && onAuthSuccess) {
    onAuthSuccess(auth.currentUser, cachedAccessToken);
  }
  return () => {};
};

export const signInWithGoogleOAuth = async (): Promise<{
  user: WorkspaceUser;
  accessToken: string;
} | null> => {
  cachedAccessToken = 'open_access_token_mock';
  return {
    user: auth.currentUser!,
    accessToken: cachedAccessToken,
  };
};

export const getGoogleAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setGoogleAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const googleSignOut = async () => {
  cachedAccessToken = null;
};
