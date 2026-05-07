import { useState, useEffect } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { toast } from 'sonner';
import { AuthBackground } from '../components/auth/auth-background';
// import { mockUsers } from '../lib/mock-data/users';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [shake, setShake] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  const validate = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };
    
    if (!email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    
    // const userExists = mockUsers.find(u => u.email === email);
    
    // if (!userExists) {
    //   toast.error('Invalid email or password');
    //   setShake(true);
    //   setTimeout(() => setShake(false), 300);
    //   setPassword('');
    //   setIsLoading(false);
    //   return;
    // }

    // const success = await login(email);
    const success = await login(email, password);

    if (success) {
      toast.success('Welcome back!');
      navigate('/home');
    } else {
      toast.error('Failed to initiate login');
      setIsLoading(false);
    }
  };

  return (
    <AuthBackground>
      <div className={`w-full max-w-[420px] p-8 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl transition-transform ${shake ? 'animate-[shake_0.3s_ease]' : 'animate-in fade-in slide-in-from-bottom-5 duration-500'}`}>
        
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-[#9AB17A] rounded-xl mb-4 shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#2C3E2C] dark:text-[#E4DFB5]">
            TRINETRA
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 text-center">
            Multi-Cloud Threat Intelligence
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Welcome back</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors({...errors, email: ''}); }}
                disabled={isLoading}
                className={`w-full pl-10 pr-4 h-11 rounded-lg bg-slate-100 dark:bg-white/5 border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-transparent focus:border-indigo-500 focus:ring-indigo-500'} outline-none transition-all text-sm text-slate-900 dark:text-slate-100`}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors({...errors, password: ''}); }}
                disabled={isLoading}
                className={`w-full pl-10 pr-10 h-11 rounded-lg bg-slate-100 dark:bg-white/5 border ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-transparent focus:border-indigo-500 focus:ring-indigo-500'} outline-none transition-all text-sm text-slate-900 dark:text-slate-100`}
                placeholder="Enter your password"
                autoComplete="current-password"
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
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" disabled={isLoading} className="rounded text-indigo-500 focus:ring-indigo-500 bg-slate-100 dark:bg-white/5 border-transparent w-4 h-4" />
              <span className="text-sm text-slate-500 dark:text-slate-400">Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-[#9AB17A] hover:bg-[#7A9160] text-white rounded-lg font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center mb-4"
          >
            {isLoading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Signing in...</>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="flex items-center mb-4">
          <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
          <span className="px-3 text-xs text-slate-500 dark:text-slate-400">or</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
        </div>

        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-indigo-500 hover:text-indigo-400 hover:underline transition-colors">
            Sign Up
          </Link>
        </div>

      </div>
      <div className="absolute bottom-6 text-xs text-slate-500 dark:text-slate-500/50">
        v1.0.0
      </div>
    </AuthBackground>
  );
}
