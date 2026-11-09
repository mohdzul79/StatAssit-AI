import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Building,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile, DEFAULT_USER_PROFILE, SCHOLAR_GUEST_PROFILE, MOHDZUL_ADMIN_PROFILE } from '../types/user';
import {
  signInWithFirebaseGoogle,
  signInWithFirebaseMicrosoft,
  signInWithFirebaseApple,
  signInWithFirebaseTwitter,
  signInWithFirebaseFacebook,
  signInWithFirebaseEmail,
  formatFirebaseAuthError,
} from '../services/firebaseAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign in fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign up fields
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpTitle, setSignUpTitle] = useState('Researcher / Faculty');
  const [signUpInstitution, setSignUpInstitution] = useState('');
  const [signUpDiscipline, setSignUpDiscipline] = useState('Quantitative Psychology & Social Sciences');
  const [signUpPassword, setSignUpPassword] = useState('');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!signInEmail.trim() || !signInEmail.includes('@')) {
      setError('Please provide a valid academic email address.');
      return;
    }

    setIsLoading(true);
    try {
      const { user } = await signInWithFirebaseEmail(signInEmail, signInPassword);
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setError(formatFirebaseAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLoginAdmin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { user } = await signInWithFirebaseGoogle();
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setError(formatFirebaseAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLoginScholar = () => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(DEFAULT_USER_PROFILE);
      onClose();
    }, 300);
  };

  const handleQuickLoginLive = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { user } = await signInWithFirebaseMicrosoft();
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setError(formatFirebaseAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLoginGuest = () => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(SCHOLAR_GUEST_PROFILE);
      onClose();
    }, 300);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!signUpName.trim()) {
      setError('Please enter your full academic name.');
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!signUpPassword || signUpPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const nameParts = signUpName.trim().split(' ');
      const initials = nameParts.length > 1
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
        : signUpName.slice(0, 2).toUpperCase();

      const newUser: UserProfile = {
        ...DEFAULT_USER_PROFILE,
        id: `usr-${Date.now()}`,
        name: signUpName.trim(),
        email: signUpEmail.trim(),
        title: signUpTitle || 'Quantitative Researcher',
        institution: signUpInstitution || 'Academic Research Center',
        discipline: signUpDiscipline,
        avatarInitials: initials,
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
            title: 'Account Initialized',
            detail: 'Welcome to StatAssist AI quantitative workspace',
            timestamp: 'Just now',
          },
        ],
      };
      onLoginSuccess(newUser);
      onClose();
    }, 450);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Academic Researcher Authentication</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {mode === 'signin' ? 'Sign In to StatAssist AI' : 'Create Researcher Account'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Access your empirical datasets, statistical hypotheses, and APA 7th publication notebooks.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex gap-2 mt-4 bg-white/10 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mode === 'signin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register New Scholar</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Clean Pill Auth Provider List matching attached image */}
          {mode === 'signin' && (
            <div className="space-y-2.5">
              <div className="text-center pb-1">
                <span className="text-xs font-bold text-slate-700">Sign in</span>
              </div>

              {/* 1. PRIORITY AT TOP: Google */}
              <button
                type="button"
                onClick={handleQuickLoginAdmin}
                disabled={isLoading}
                className="w-full h-11 px-4 rounded-full bg-white text-slate-800 font-semibold text-xs sm:text-sm border-2 border-blue-500/40 shadow-2xs hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all flex items-center relative cursor-pointer group disabled:opacity-50"
                title="Sign in with Google"
              >
                <div className="absolute left-4 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
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
                </div>
                <span className="w-full text-center pl-4 text-slate-900 group-hover:text-blue-600 transition-colors flex items-center justify-center">
                  <span>Google</span>
                </span>
              </button>

              {/* 2. Microsoft */}
              <button
                type="button"
                onClick={handleQuickLoginLive}
                disabled={isLoading}
                className="w-full h-11 px-4 rounded-full bg-white text-slate-800 font-semibold text-xs sm:text-sm border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all flex items-center relative cursor-pointer group disabled:opacity-50"
              >
                <div className="absolute left-4 flex items-center justify-center">
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-[#f25022] rounded-xs" />
                    <div className="bg-[#7fba00] rounded-xs" />
                    <div className="bg-[#00a4ef] rounded-xs" />
                    <div className="bg-[#ffb900] rounded-xs" />
                  </div>
                </div>
                <span className="w-full text-center pl-4 text-slate-800 group-hover:text-slate-950 transition-colors">
                  Microsoft
                </span>
              </button>

              {/* 3. Apple */}
              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  setError(null);
                  try {
                    const { user } = await signInWithFirebaseApple();
                    onLoginSuccess(user);
                    onClose();
                  } catch (err: any) {
                    setError(formatFirebaseAuthError(err));
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="w-full h-11 px-4 rounded-full bg-white text-slate-800 font-semibold text-xs sm:text-sm border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all flex items-center relative cursor-pointer group disabled:opacity-50"
              >
                <div className="absolute left-4 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 fill-black" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 1.01-2.85-.9.04-2 .6-2.65 1.35-.58.67-1.09 1.73-1.02 2.76.99.08 2.04-.51 2.66-1.26z" />
                  </svg>
                </div>
                <span className="w-full text-center pl-4 text-slate-800 group-hover:text-slate-950 transition-colors">
                  Apple
                </span>
              </button>

              {/* 4. Twitter */}
              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  setError(null);
                  try {
                    const { user } = await signInWithFirebaseTwitter();
                    onLoginSuccess(user);
                    onClose();
                  } catch (err: any) {
                    setError(formatFirebaseAuthError(err));
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="w-full h-11 px-4 rounded-full bg-white text-slate-800 font-semibold text-xs sm:text-sm border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all flex items-center relative cursor-pointer group disabled:opacity-50"
              >
                <div className="absolute left-4 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 fill-[#1DA1F2]" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
                  </svg>
                </div>
                <span className="w-full text-center pl-4 text-slate-800 group-hover:text-slate-950 transition-colors">
                  Twitter
                </span>
              </button>

              {/* 5. Facebook */}
              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  setError(null);
                  try {
                    const { user } = await signInWithFirebaseFacebook();
                    onLoginSuccess(user);
                    onClose();
                  } catch (err: any) {
                    setError(formatFirebaseAuthError(err));
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="w-full h-11 px-4 rounded-full bg-white text-slate-800 font-semibold text-xs sm:text-sm border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all flex items-center relative cursor-pointer group disabled:opacity-50"
              >
                <div className="absolute left-4 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <span className="w-full text-center pl-4 text-slate-800 group-hover:text-slate-950 transition-colors">
                  Facebook
                </span>
              </button>

              {/* Clean Divider Line matching attached image */}
              <div className="pt-2 pb-1">
                <div className="border-t border-slate-200" />
              </div>
            </div>
          )}

            {/* Sign In Form */}
            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic / Researcher Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      required
                      placeholder="e.g. scholar@university.edu / name@live.com"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    />
                  </div>

                  {/* 1-click Domain Appender Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] text-slate-500 font-mono">Domain:</span>
                    {['@gmail.com', '@live.com', '@outlook.com', '@hotmail.com', '@academic.edu'].map((dom) => (
                      <button
                        key={dom}
                        type="button"
                        onClick={() => {
                          const base = signInEmail.includes('@') ? signInEmail.split('@')[0] : signInEmail;
                          setSignInEmail(`${base || 'scholar'}${dom}`);
                        }}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer"
                      >
                        {dom}
                      </button>
                    ))}
                  </div>
                </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                    placeholder="Enter password"
                    className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                  />
                  <span>Remember my researcher session</span>
                </label>
                <span className="text-2xs text-blue-600 hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Log In to Workspace</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name & Academic Title
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    required
                    placeholder="e.g. Dr. Alex Morgan / Prof. Jane Smith"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institutional Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      required
                      placeholder="scholar@university.edu"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role / Position
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={signUpTitle}
                      onChange={(e) => setSignUpTitle(e.target.value)}
                      placeholder="e.g. Assistant Professor, PhD Candidate"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  University / Research Institution
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={signUpInstitution}
                    onChange={(e) => setSignUpInstitution(e.target.value)}
                    placeholder="e.g. University Faculty of Social Sciences"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Research Discipline
                </label>
                <select
                  value={signUpDiscipline}
                  onChange={(e) => setSignUpDiscipline(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="Quantitative Psychology & Social Sciences">Quantitative Psychology & Social Sciences</option>
                  <option value="Biostatistics, Clinical & Health Sciences">Biostatistics, Clinical & Health Sciences</option>
                  <option value="Educational Measurement & Evaluation">Educational Measurement & Evaluation</option>
                  <option value="Economics, Econometrics & Finance">Economics, Econometrics & Finance</option>
                  <option value="Data Science & Applied Analytics">Data Science & Applied Analytics</option>
                  <option value="Sociology & Public Policy">Sociology & Public Policy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-2xs text-slate-600">
                By registering, your statistical analyses, hypothesis decisions, and APA 7th reporting preferences are saved locally with encryption for confidential academic research.
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Registering Researcher...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Academic Registration</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
