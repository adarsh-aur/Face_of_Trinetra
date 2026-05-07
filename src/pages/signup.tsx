import { useState, useEffect } from 'react';
import { Shield, User, Mail, Lock, Eye, EyeOff, Loader2, CircleCheck, CircleX, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { toast } from 'sonner';
import { AuthBackground } from '../components/auth/auth-background';
// import { mockUsers } from '../lib/mock-data/users';

export function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  const reqs = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'One number (0-9)', met: /[0-9]/.test(password) },
    { label: 'One special character (!@#$%)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const allReqsMet = reqs.every(r => r.met);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isFormValid = name.length >= 2 && /\S+@\S+\.\S+/.test(email) && allReqsMet && passwordsMatch;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    // const emailExists = mockUsers.some(u => u.email === email);
    // if (emailExists) {
    //   toast.error('An account with this email already exists');
    //   return;
    // }

    // setIsLoading(true);
    
    // const success = await signup(name, email);
    const success = await signup(name, email, password);

    if (success) {
      toast.success('Verification code sent to your email');
      navigate('/verify-otp?type=signup');
    } else {
      toast.error('Failed to create account');
      setIsLoading(false);
    }
  };

  return (
    <AuthBackground>
      <Link to="/login" className="absolute top-6 left-6 flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors z-50">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
      </Link>
      <div className="w-full max-w-[420px] p-8 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-500 my-8">
        
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl mb-4 shadow-lg shadow-indigo-500/25">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">
            TRINETRA
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 text-center">
            Multi-Cloud Threat Intelligence
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Create Account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Get started with Trinetra</p>
        </div>

        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 h-11 rounded-lg bg-slate-100 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all text-sm text-slate-900 dark:text-slate-100"
                placeholder="John Doe"
                autoComplete="name"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 h-11 rounded-lg bg-slate-100 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all text-sm text-slate-900 dark:text-slate-100"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-10 h-11 rounded-lg bg-slate-100 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all text-sm text-slate-900 dark:text-slate-100"
                placeholder="Create a password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            </div>
          </div>

          <div className="mb-4 pl-1 space-y-1.5">
            {reqs.map((req, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                {req.met ? (
                  <CircleCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />
                ) : (
                  <CircleX className="w-3.5 h-3.5 text-red-400 shrink-0" />
                )}
                <span className={req.met ? 'text-green-500' : 'text-slate-500 dark:text-slate-400'}>{req.label}</span>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
            <div className="relative mb-1.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-10 h-11 rounded-lg bg-slate-100 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all text-sm text-slate-900 dark:text-slate-100"
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showConfirmPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                {passwordsMatch ? (
                  <><CircleCheck className="w-3.5 h-3.5 text-green-500 shrink-0" /><span className="text-green-500">Passwords match</span></>
                ) : (
                  <><CircleX className="w-3.5 h-3.5 text-red-500 shrink-0" /><span className="text-red-500">Passwords do not match</span></>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full h-11 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-lg font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center mb-4"
          >
            {isLoading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating account...</>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="flex items-center mb-4">
          <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
          <span className="px-3 text-xs text-slate-500 dark:text-slate-400">or</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
        </div>

        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-500 hover:text-indigo-400 hover:underline transition-colors">
            Sign In
          </Link>
        </div>

      </div>
    </AuthBackground>
  );
}
