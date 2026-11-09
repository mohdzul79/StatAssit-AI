import React, { useState } from 'react';
import {
  Mail,
  ArrowRight,
  ChevronLeft,
  Lock,
  User,
  Sparkles,
  Eye,
  EyeOff,
  UserPlus,
} from 'lucide-react';
import { UserProfile } from '../types/user';
import {
  signInWithFirebaseGoogle,
  signInWithFirebaseMicrosoft,
  signInWithFirebaseApple,
  signInWithFirebaseTwitter,
  signInWithFirebaseFacebook,
  signInWithFirebaseEmail,
  registerNewUserWithProfile,
  formatFirebaseAuthError,
} from '../services/firebaseAuth';

interface DirectLoginCardProps {
  onLoginSuccess: (user: UserProfile) => void;
  className?: string;
  isCompact?: boolean;
}

export const DirectLoginCard: React.FC<DirectLoginCardProps> = ({
  onLoginSuccess,
  className = '',
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Sign In inputs
  const [emailInput, setEmailInput] = useState('mohdzul@gmail.com');
  const [passwordInput, setPasswordInput] = useState('');

  // Sign Up inputs (essential credentials only; institutional profile can be set later in profile)
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  const QUICK_DOMAINS = ['@gmail.com', '@live.com', '@outlook.com', '@hotmail.com'];

  // Button 1: Google OAuth
  const handleGoogleClick = async () => {
    setIsLoading(true);
    setLoadingProvider('google');
    setNotification(null);
    try {
      const { user } = await signInWithFirebaseGoogle();
      onLoginSuccess(user);
    } catch (err: any) {
      setNotification(formatFirebaseAuthError(err));
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  // Button 2: Microsoft OAuth
  const handleMicrosoftClick = async () => {
    setIsLoading(true);
    setLoadingProvider('microsoft');
    setNotification(null);
    try {
      const { user } = await signInWithFirebaseMicrosoft();
      onLoginSuccess(user);
    } catch (err: any) {
      setNotification(formatFirebaseAuthError(err));
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  // Button 3: Apple OAuth
  const handleAppleClick = async () => {
    setIsLoading(true);
    setLoadingProvider('apple');
    setNotification(null);
    try {
      const { user } = await signInWithFirebaseApple();
      onLoginSuccess(user);
    } catch (err: any) {
      setNotification(formatFirebaseAuthError(err));
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  // Button 4: Twitter OAuth
  const handleTwitterClick = async () => {
    setIsLoading(true);
    setLoadingProvider('twitter');
    setNotification(null);
    try {
      const { user } = await signInWithFirebaseTwitter();
      onLoginSuccess(user);
    } catch (err: any) {
      setNotification(formatFirebaseAuthError(err));
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  // Button 5: Facebook OAuth
  const handleFacebookClick = async () => {
    setIsLoading(true);
    setLoadingProvider('facebook');
    setNotification(null);
    try {
      const { user } = await signInWithFirebaseFacebook();
      onLoginSuccess(user);
    } catch (err: any) {
      setNotification(formatFirebaseAuthError(err));
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  // Email Sign In Submit
  const handleEmailFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      setNotification('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setLoadingProvider('custom-email');
    setNotification(null);

    try {
      const { user } = await signInWithFirebaseEmail(emailInput, passwordInput || undefined);
      onLoginSuccess(user);
    } catch (err: any) {
      setNotification(formatFirebaseAuthError(err));
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  // New User Sign Up Submit (Essentials only: Full Name, Email, Password)
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!signUpName.trim()) {
      setNotification('Please enter your full academic name.');
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      setNotification('Please enter a valid academic email address.');
      return;
    }
    if (!signUpPassword || signUpPassword.length < 6) {
      setNotification('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setLoadingProvider('signup');

    try {
      const { user } = await registerNewUserWithProfile({
        name: signUpName.trim(),
        email: signUpEmail.trim(),
        password: signUpPassword,
        title: 'Scholar Researcher',
        institution: 'Academic Research Center',
        department: 'Quantitative Research Division',
        discipline: 'Quantitative Psychology & Social Sciences',
      });

      onLoginSuccess(user);
    } catch (err: any) {
      setNotification(formatFirebaseAuthError(err));
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleAppendDomain = (domain: string) => {
    const username = emailInput.includes('@') ? emailInput.split('@')[0] : emailInput;
    setEmailInput(`${username || 'scholar'}${domain}`);
  };

  return (
    <div
      className={`w-full max-w-[290px] rounded-2xl bg-[#f2f4f2] text-slate-800 p-4 shadow-xl border border-slate-300/80 transition-all duration-200 ${className}`}
    >

      {notification && (
        <div className="mb-2.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-2xs text-center font-medium animate-in fade-in">
          {notification}
        </div>
      )}

      {/* ===================== MODE 1: SIGN IN ===================== */}
      {authMode === 'signin' && (
        <>
          {!showEmailForm ? (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isLoading}
                className="w-full h-8 px-3 rounded-full bg-white text-slate-800 font-semibold text-xs border border-blue-500/30 shadow-2xs hover:border-blue-500 hover:shadow-xs active:scale-[0.99] transition-all flex items-center relative cursor-pointer group disabled:opacity-50"
                title="Sign in with Google"
              >
                <div className="absolute left-3 flex items-center justify-center">
                  {isLoading && loadingProvider === 'google' ? (
                    <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                </div>
                <span className="w-full text-center pl-3 text-slate-900 group-hover:text-blue-600 transition-colors flex items-center justify-center">
                  <span>Google</span>
                </span>
              </button>

              {/* Microsoft */}
              <button
                type="button"
                onClick={handleMicrosoftClick}
                disabled={isLoading}
                className="w-full h-8 px-3 rounded-full bg-white text-slate-800 font-semibold text-xs border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs active:scale-[0.99] transition-all flex items-center relative cursor-pointer group disabled:opacity-50"
              >
                <div className="absolute left-3 flex items-center justify-center">
                  {isLoading && loadingProvider === 'microsoft' ? (
                    <div className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="w-3 h-3 grid grid-cols-2 gap-0.5">
                      <div className="bg-[#f25022] rounded-xs" />
                      <div className="bg-[#7fba00] rounded-xs" />
                      <div className="bg-[#00a4ef] rounded-xs" />
                      <div className="bg-[#ffb900] rounded-xs" />
                    </div>
                  )}
                </div>
                <span className="w-full text-center pl-3 text-slate-800 group-hover:text-slate-950 transition-colors">
                  Microsoft
                </span>
              </button>

              {/* Apple */}
              <button
                type="button"
                onClick={handleAppleClick}
                disabled={isLoading}
                className="w-full h-8 px-3 rounded-full bg-white text-slate-800 font-semibold text-xs border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs active:scale-[0.99] transition-all flex items-center relative cursor-pointer group disabled:opacity-50"
              >
                <div className="absolute left-3 flex items-center justify-center">
                  {isLoading && loadingProvider === 'apple' ? (
                    <div className="w-3.5 h-3.5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-3.5 h-3.5 fill-black" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 1.01-2.85-.9.04-2 .6-2.65 1.35-.58.67-1.09 1.73-1.02 2.76.99.08 2.04-.51 2.66-1.26z" />
                    </svg>
                  )}
                </div>
                <span className="w-full text-center pl-3 text-slate-800 group-hover:text-slate-950 transition-colors">
                  Apple
                </span>
              </button>

              {/* Twitter */}
              <button
                type="button"
                onClick={handleTwitterClick}
                disabled={isLoading}
                className="w-full h-8 px-3 rounded-full bg-white text-slate-800 font-semibold text-xs border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs active:scale-[0.99] transition-all flex items-center relative cursor-pointer group disabled:opacity-50"
              >
                <div className="absolute left-3 flex items-center justify-center">
                  {isLoading && loadingProvider === 'twitter' ? (
                    <div className="w-3.5 h-3.5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-3.5 h-3.5 fill-[#1DA1F2]" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
                    </svg>
                  )}
                </div>
                <span className="w-full text-center pl-3 text-slate-800 group-hover:text-slate-950 transition-colors">
                  Twitter
                </span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={handleFacebookClick}
                disabled={isLoading}
                className="w-full h-8 px-3 rounded-full bg-white text-slate-800 font-semibold text-xs border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs active:scale-[0.99] transition-all flex items-center relative cursor-pointer group disabled:opacity-50"
              >
                <div className="absolute left-3 flex items-center justify-center">
                  {isLoading && loadingProvider === 'facebook' ? (
                    <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-3.5 h-3.5 fill-[#1877F2]" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )}
                </div>
                <span className="w-full text-center pl-3 text-slate-800 group-hover:text-slate-950 transition-colors">
                  Facebook
                </span>
              </button>

              {/* Divider */}
              <div className="pt-1 pb-0.5">
                <div className="border-t border-slate-300/80" />
              </div>

              {/* Sign in with Email Option */}
              <button
                type="button"
                onClick={() => setShowEmailForm(true)}
                className="w-full h-8 px-3 rounded-full bg-white text-slate-800 font-semibold text-xs border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs active:scale-[0.99] transition-all flex items-center relative cursor-pointer group"
              >
                <div className="absolute left-3 flex items-center justify-center text-slate-700 group-hover:text-slate-950">
                  <Mail className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <span className="w-full text-center pl-3 text-slate-800 group-hover:text-slate-950 transition-colors">
                  Sign in with Email
                </span>
              </button>
            </div>
          ) : (
            /* Email Form */
            <div className="animate-in fade-in slide-in-from-right-2 duration-200 space-y-2.5">
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="text-2xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back to options</span>
              </button>

              <form onSubmit={handleEmailFormSubmit} className="space-y-2">
                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-0.5">
                    Academic or Institutional Email
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="name@university.edu"
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono shadow-inner"
                      autoFocus
                    />
                  </div>

                  {/* Domain chips */}
                  <div className="flex flex-wrap items-center gap-1 mt-1.5">
                    <span className="text-[9px] text-slate-500 font-medium">Domain:</span>
                    {QUICK_DOMAINS.map((dom) => (
                      <button
                        key={dom}
                        type="button"
                        onClick={() => handleAppendDomain(dom)}
                        className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 transition-colors cursor-pointer"
                      >
                        {dom}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-0.5">
                    Password <span className="font-normal text-slate-400 text-[9px]">(optional)</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Password"
                      className="w-full pl-8 pr-8 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-8 px-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isLoading && loadingProvider === 'custom-email' ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5" />
                  )}
                  <span>Sign in</span>
                </button>
              </form>
            </div>
          )}

          {/* Toggle to Sign up */}
          <div className="mt-2.5 pt-2 border-t border-slate-200 text-center">
            <span className="text-[11px] text-slate-600">
              New scholar?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setNotification(null);
                }}
                className="font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
              >
                Create Account (Sign Up)
              </button>
            </span>
          </div>
        </>
      )}

      {/* ===================== MODE 2: SIGN UP ===================== */}
      {authMode === 'signup' && (
        <div className="animate-in fade-in duration-200">
          <div className="text-center mb-2.5">
            <h4 className="text-xs font-bold text-slate-900">
              Create Scholar Account
            </h4>
          </div>

          <form onSubmit={handleSignUpSubmit} className="space-y-2.5">
            {/* 1. Full Academic Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="Dr. / Prof. / Full Name"
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-inner"
                  autoFocus
                />
              </div>
            </div>

            {/* 2. Academic Email Address */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono shadow-inner"
                />
              </div>
            </div>

            {/* 3. Password */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                Password (min 6 chars) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full pl-8 pr-8 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Submit Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 h-8 px-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading && loadingProvider === 'signup' ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-3.5 h-3.5" />
              )}
              <span>Create</span>
            </button>
          </form>

          {/* Toggle back to Sign In */}
          <div className="mt-2.5 pt-2 border-t border-slate-200 text-center">
            <span className="text-[11px] text-slate-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setNotification(null);
                }}
                className="font-bold text-slate-900 hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
