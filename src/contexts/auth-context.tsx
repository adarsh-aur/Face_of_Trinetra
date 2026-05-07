// import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
// import { type User, type VerificationResult } from '../types/auth';
// import { mockUsers } from '../lib/mock-data/users';
// import { verifyCloudAccount } from '../lib/verify-cloud';

// interface AuthContextType {
//   user: User | null;
//   isAuthenticated: boolean;
//   isHydrating: boolean;
//   pendingEmail: string | null;
//   mockOTP: string | null;
//   login: (email: string) => Promise<boolean>;
//   signup: (name: string, email: string) => Promise<boolean>;
//   verifyOTP: (code: string, type: 'login' | 'signup') => Promise<boolean>;
//   resendOTP: () => void;
//   connectProvider: (provider: 'aws' | 'azure' | 'gcp', accountId: string) => Promise<VerificationResult>;
//   disconnectProvider: (provider: 'aws' | 'azure' | 'gcp') => void;
//   logout: () => void;
//   completeFirstLogin: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [pendingEmail, setPendingEmail] = useState<string | null>(null);
//   const [pendingName, setPendingName] = useState<string | null>(null);
//   const [mockOTP, setMockOTP] = useState<string | null>(null);
//   const [usersDb, setUsersDb] = useState<User[]>(mockUsers);

//   const [isHydrating, setIsHydrating] = useState(true);

//   // Load from local storage on mount
//   useEffect(() => {
//     const storedUser = localStorage.getItem('trinetra_user');
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//       setIsAuthenticated(true);
//     }
//     // Simulate slight delay for hydration to show AppLoader
//     setTimeout(() => setIsHydrating(false), 800);
//   }, []);

//   // Save to local storage when user changes
//   useEffect(() => {
//     if (user) {
//       localStorage.setItem('trinetra_user', JSON.stringify(user));
//     } else {
//       localStorage.removeItem('trinetra_user');
//     }
//   }, [user]);

//   const generateOTP = () => {
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     setMockOTP(otp);
//     return otp;
//   };

//   const login = async (email: string) => {
//     const foundUser = usersDb.find(u => u.email === email);
//     if (!foundUser) return false;
    
//     setUser(foundUser);
//     setIsAuthenticated(true);
//     return true;
//   };

//   const signup = async (name: string, email: string) => {
//     const foundUser = usersDb.find(u => u.email === email);
//     if (foundUser) return false; // Email exists

//     setPendingName(name);
//     setPendingEmail(email);
//     generateOTP();
//     return true;
//   };

//   const verifyOTP = async (code: string, type: 'login' | 'signup') => {
//     if (code !== mockOTP) return false;

//     if (type === 'login') {
//       const foundUser = usersDb.find(u => u.email === pendingEmail);
//       if (foundUser) {
//         setUser(foundUser);
//         setIsAuthenticated(true);
//       }
//     } else if (type === 'signup') {
//       const newUser: User = {
//         id: Math.random().toString(36).substr(2, 9),
//         name: pendingName || 'New User',
//         email: pendingEmail!,
//         avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${pendingName || 'User'}`,
//         createdAt: new Date().toISOString(),
//         isFirstLogin: true,
//         connectedProviders: { aws: null, azure: null, gcp: null }
//       };
//       setUsersDb([...usersDb, newUser]);
//       setUser(newUser);
//       setIsAuthenticated(true);
//     }

//     setPendingEmail(null);
//     setPendingName(null);
//     setMockOTP(null);
//     return true;
//   };

//   const resendOTP = () => {
//     generateOTP();
//   };

//   const connectProvider = async (provider: 'aws' | 'azure' | 'gcp', accountId: string) => {
//     if (!user) return { success: false, error: 'not_found', message: 'Not logged in' } as VerificationResult;
    
//     const result = verifyCloudAccount(provider, accountId, user.email);
//     if (result.success && result.data) {
//       const updatedUser = {
//         ...user,
//         connectedProviders: {
//           ...user.connectedProviders,
//           [provider]: {
//             provider,
//             accountId,
//             accountName: result.data.accountName,
//             username: result.data.username,
//             region: result.data.region,
//             resources: result.data.resources,
//             connectedAt: new Date().toISOString(),
//             status: 'active'
//           }
//         }
//       };
//       setUser(updatedUser);
//       // Update in mock DB too
//       setUsersDb(usersDb.map(u => u.id === user.id ? updatedUser : u));
//     }
//     return result;
//   };

//   const disconnectProvider = (provider: 'aws' | 'azure' | 'gcp') => {
//     if (!user) return;
//     const updatedUser = {
//       ...user,
//       connectedProviders: {
//         ...user.connectedProviders,
//         [provider]: null
//       }
//     };
//     setUser(updatedUser);
//     setUsersDb(usersDb.map(u => u.id === user.id ? updatedUser : u));
//   };

//   const completeFirstLogin = () => {
//     if (!user) return;
//     const updatedUser = { ...user, isFirstLogin: false };
//     setUser(updatedUser);
//     setUsersDb(usersDb.map(u => u.id === user.id ? updatedUser : u));
//   };

//   const logout = () => {
//     setUser(null);
//     setIsAuthenticated(false);
//     setPendingEmail(null);
//     setMockOTP(null);
//   };

//   return (
//     <AuthContext.Provider value={{ 
//       user, isAuthenticated, isHydrating, pendingEmail, mockOTP, 
//       login, signup, verifyOTP, resendOTP, connectProvider, disconnectProvider, completeFirstLogin, logout 
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }


import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User, type VerificationResult } from '../types/auth';
// import { verifyCloudAccount } from '../lib/verify-cloud';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

// ── Context shape — only login and signup signatures change ──────────────────
interface AuthContextType {
  user:            User | null;
  isAuthenticated: boolean;
  isHydrating:     boolean;
  pendingEmail:    string | null;
  mockOTP:         string | null;
  login:           (email: string, password: string) => Promise<boolean>; // ← password added
  signup:          (name: string, email: string, password: string) => Promise<boolean>; // ← password added
  verifyOTP:       (code: string, type: 'login' | 'signup') => Promise<boolean>;
  resendOTP:       () => void;
  connectProvider:    (provider: 'aws' | 'azure' | 'gcp', accountId: string) => Promise<VerificationResult>;
  disconnectProvider: (provider: 'aws' | 'azure' | 'gcp') => void;
  completeFirstLogin: () => void;
  logout:          () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper: build a frontend User from the backend JWT payload
const buildUser = (data: {
  _id: string; name: string; email: string;
  role?: string; organization?: string;
}, overrides: Partial<User> = {}): User => ({
  id:         data._id,
  name:       data.name,
  email:      data.email,
  avatar:     `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
  createdAt:  new Date().toISOString(),
  isFirstLogin: false,
  connectedProviders: { aws: null, azure: null, gcp: null },
  ...overrides,
});

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,          setUser]          = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrating,   setIsHydrating]   = useState(true);
  const [pendingEmail,  setPendingEmail]  = useState<string | null>(null);
  const [pendingName,   setPendingName]   = useState<string | null>(null);
  const [mockOTP,       setMockOTP]       = useState<string | null>(null);

  // ── Hydration — restore session from localStorage ───────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem('trinetra_user');
      if (raw) {
        const restored: User = JSON.parse(raw);
        setUser(restored);
        setIsAuthenticated(true);
      }
    } catch {
      localStorage.removeItem('trinetra_user');
    }
    setTimeout(() => setIsHydrating(false), 800); // keep AppLoader behaviour
  }, []);

  // ── Persist user to localStorage on every change ────────────────────────
  useEffect(() => {
    if (user) {
      localStorage.setItem('trinetra_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('trinetra_user');
    }
  }, [user]);

  const persistUser = (u: User) => {
    setUser(u);
    setIsAuthenticated(true);
  };

  // ── Auth actions ─────────────────────────────────────────────────────────

  /**
   * Login: hits real backend, sets user directly (no OTP step for login).
   * Matches existing Login.tsx UX: success → navigate('/home').
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res  = await fetch(`${BASE}/api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return false;

      localStorage.setItem('trinetra_token', data.token);
      persistUser(buildUser(data, { isFirstLogin: false }));
      return true;
    } catch {
      return false;
    }
  };

  /**
   * Signup: hits real backend, then enters OTP flow.
   * Matches existing Signup.tsx UX: success → navigate('/verify-otp?type=signup').
   */
  const signup = async (
    name: string, email: string, password: string,
  ): Promise<boolean> => {
    try {
      const res  = await fetch(`${BASE}/api/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return false;

      localStorage.setItem('trinetra_token', data.token);
      setPendingEmail(email);
      setPendingName(data.name ?? name);
      setMockOTP(generateOTP());
      return true;
    } catch {
      return false;
    }
  };

  const verifyOTP = async (
    code: string, type: 'login' | 'signup',
  ): Promise<boolean> => {
    if (code !== mockOTP || !pendingEmail) return false;

    if (type === 'signup') {
      persistUser(buildUser(
        { _id: Date.now().toString(), name: pendingName ?? pendingEmail.split('@')[0], email: pendingEmail },
        { isFirstLogin: true },
      ));
    }
    // login type is handled by login() directly — this branch only for signup

    setPendingEmail(null);
    setPendingName(null);
    setMockOTP(null);
    return true;
  };

  const resendOTP = () => setMockOTP(generateOTP());

  // ── Cloud provider ───────────────────────────────────────────────────────

  // const connectProvider = async (
  //   provider: 'aws' | 'azure' | 'gcp',
  //   accountId: string,
  // ): Promise<VerificationResult> => {
  //   if (!user) {
  //     return { success: false, error: 'not_found', message: 'Not logged in' };
  //   }

  //   // Keep existing verifyCloudAccount for the detailed mock UI
  //   const result = verifyCloudAccount(provider, accountId, user.email);

  //   if (result.success && result.data) {
  //     const updatedUser: User = {
  //       ...user,
  //       connectedProviders: {
  //         ...user.connectedProviders,
  //         [provider]: {
  //           provider,
  //           accountId,
  //           accountName: result.data.accountName,
  //           username:    result.data.username,
  //           region:      result.data.region,
  //           resources:   result.data.resources,
  //           connectedAt: new Date().toISOString(),
  //           status:      'active' as const,
  //         },
  //       },
  //     };
  //     persistUser(updatedUser);

  //     // Also store in real backend (fire-and-forget — non-fatal if fails)
  //     const token = localStorage.getItem('trinetra_token');
  //     if (token) {
  //       fetch(`${BASE}/api/cloud`, {
  //         method:  'POST',
  //         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  //         body:    JSON.stringify({ provider, label: `${provider.toUpperCase()} — ${accountId}`, accountId }),
  //       }).catch(() => {/* silent */});
  //     }
  //   }

  //   return result;
  // };

  const connectProvider = async (
    provider: 'aws' | 'azure' | 'gcp',
    accountId: string,
  ): Promise<VerificationResult> => {
    if (!user) {
      return { success: false, error: 'not_found', message: 'Not logged in' };
    }
  
    if (!accountId.trim()) {
      return { success: false, error: 'format_error', message: 'Account ID cannot be empty' };
    }
  
    // Simulate verification delay
    await new Promise(r => setTimeout(r, 1500));
  
    // Mock provider data — always succeeds for demo
    const PROVIDER_DEFAULTS = {
      aws: {
        accountName: 'Trinetra-AWS-Production',
        username:    'trinetra-admin',
        region:      'ap-south-1',
        resources:   { vms: 12, containers: 8, roles: 15 },
      },
      azure: {
        accountName: 'Trinetra-Azure-Tenant',
        username:    'admin@trinetra.onmicrosoft.com',
        region:      'East Asia',
        resources:   { vms: 8, containers: 5, roles: 10 },
      },
      gcp: {
        accountName: 'Trinetra GCP Project',
        username:    'trinetra-sa@trinetra-prod.iam.gserviceaccount.com',
        region:      'asia-south1',
        resources:   { vms: 6, containers: 4, roles: 8 },
      },
    };
  
    const details = PROVIDER_DEFAULTS[provider];
  
    const updatedUser: User = {
      ...user,
      connectedProviders: {
        ...user.connectedProviders,
        [provider]: {
          provider,
          accountId,
          accountName: details.accountName,
          username:    details.username,
          region:      details.region,
          resources:   details.resources,
          connectedAt: new Date().toISOString(),
          status:      'active' as const,
        },
      },
    };
    persistUser(updatedUser);
  
    // Store in backend (non-fatal)
    const token = localStorage.getItem('trinetra_token');
    if (token) {
      fetch(`${BASE}/api/cloud`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ provider, label: `${provider.toUpperCase()} — ${accountId}`, accountId }),
      }).catch(() => {});
    }
  
    return {
      success: true,
      data: { ...details, accountName: details.accountName },
    };
  };

  const disconnectProvider = (provider: 'aws' | 'azure' | 'gcp') => {
    if (!user) return;
    persistUser({
      ...user,
      connectedProviders: { ...user.connectedProviders, [provider]: null },
    });
  };

  const completeFirstLogin = () => {
    if (!user) return;
    persistUser({ ...user, isFirstLogin: false });
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setPendingEmail(null);
    setPendingName(null);
    setMockOTP(null);
    localStorage.removeItem('trinetra_user');
    localStorage.removeItem('trinetra_token');
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, isHydrating,
      pendingEmail, mockOTP,
      login, signup, verifyOTP, resendOTP,
      connectProvider, disconnectProvider,
      completeFirstLogin, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}