// import React, { Suspense } from 'react';
// import { createRoot } from 'react-dom/client';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { ThemeProvider } from './contexts/theme-context';
// import { AuthProvider } from './contexts/auth-context';
// import { SidebarProvider } from './contexts/sidebar-context';
// import { Layout } from './components/layout/layout';
// import { Login } from './pages/login';
// import { Signup } from './pages/signup';
// import { VerifyOTP } from './pages/verify-otp';
// import { ConnectCloud } from './pages/connect-cloud';
// import { PageSectionSkeleton } from './components/loading/page-section-skeleton';
// import { Toaster } from 'sonner';
// import './index.css';

// // Lazy load heavy routes
// const Settings = React.lazy(() => import('./pages/settings').then(m => ({ default: m.Settings })));
// const Home = React.lazy(() => import('./pages/home').then(m => ({ default: m.Home })));
// const Dashboard = React.lazy(() => import('./pages/dashboard').then(m => ({ default: m.Dashboard })));
// const AttackGraph = React.lazy(() => import('./pages/graph').then(m => ({ default: m.AttackGraph })));
// import { Alerts } from './pages/alerts';

// // Lazy load placeholder pages
// import { Logs } from './pages/logs';
// const Vulnerabilities = React.lazy(() => import('./pages/vulnerabilities').then(m => ({ default: m.Vulnerabilities })));
// const Identities = React.lazy(() => import('./pages/identities').then(m => ({ default: m.Identities })));
// const Timeline = React.lazy(() => import('./pages/timeline').then(m => ({ default: m.Timeline })));
// import { Reports } from './pages/reports';
// import { ReportDetail } from './pages/report-detail';
// const Performance = React.lazy(() => import('./pages/performance').then(m => ({ default: m.Performance })));
// const About = React.lazy(() => import('./pages/placeholders').then(m => ({ default: m.About })));

// function App() {
//   return (
//     <ThemeProvider>
//       <AuthProvider>
//         <SidebarProvider>
//           <BrowserRouter>
//             <Suspense fallback={<PageSectionSkeleton />}>
//               <Routes>
//                 <Route path="/login" element={<Login />} />
//                 <Route path="/signup" element={<Signup />} />
//                 <Route path="/verify-otp" element={<VerifyOTP />} />
//                 <Route path="/connect-cloud" element={<ConnectCloud />} />
//                 <Route path="/" element={<Layout />}>
//                   <Route index element={<Navigate to="/home" replace />} />
//                   <Route path="home" element={<Home />} />
//                   <Route path="dashboard" element={<Dashboard />} />
//                   <Route path="graph" element={<AttackGraph />} />
//                   <Route path="alerts" element={<Alerts />} />
//                   <Route path="logs" element={<Logs />} />
//                   <Route path="vulnerabilities" element={<Vulnerabilities />} />
//                   <Route path="identities" element={<Identities />} />
//                   <Route path="timeline" element={<Timeline />} />
//                   <Route path="reports" element={<Reports />} />
//                   <Route path="reports/:nodeId" element={<ReportDetail />} />
//                   <Route path="performance" element={<Performance />} />
//                   <Route path="settings" element={<Settings />} />
//                   <Route path="about" element={<About />} />
//                   <Route path="*" element={<Navigate to="/home" replace />} />
//                 </Route>
//               </Routes>
//             </Suspense>
//             <Toaster position="top-right" theme="system" />
//           </BrowserRouter>
//         </SidebarProvider>
//       </AuthProvider>
//     </ThemeProvider>
//   );
// }

// const root = createRoot(document.getElementById('root')!);
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { ThemeProvider } from './contexts/theme-context';
import { AuthProvider } from './contexts/auth-context';
import { SidebarProvider } from './contexts/sidebar-context';

import { Layout } from './components/layout/layout';

import { Login } from './pages/login';
import { Signup } from './pages/signup';
import { VerifyOTP } from './pages/verify-otp';
import { ConnectCloud } from './pages/connect-cloud';
import Landing from './pages/landing';

import { PageSectionSkeleton } from './components/loading/page-section-skeleton';
import { Toaster } from 'sonner';
import './index.css';

// Lazy loaded pages
const Settings = React.lazy(() =>
  import('./pages/settings').then(m => ({ default: m.Settings }))
);

const Home = React.lazy(() =>
  import('./pages/home').then(m => ({ default: m.Home }))
);

const Dashboard = React.lazy(() =>
  import('./pages/dashboard').then(m => ({ default: m.Dashboard }))
);

const AttackGraph = React.lazy(() =>
  import('./pages/graph').then(m => ({ default: m.AttackGraph }))
);

const Vulnerabilities = React.lazy(() =>
  import('./pages/vulnerabilities').then(m => ({ default: m.Vulnerabilities }))
);

const Identities = React.lazy(() =>
  import('./pages/identities').then(m => ({ default: m.Identities }))
);

const Timeline = React.lazy(() =>
  import('./pages/timeline').then(m => ({ default: m.Timeline }))
);

const Performance = React.lazy(() =>
  import('./pages/performance').then(m => ({ default: m.Performance }))
);

const About = React.lazy(() =>
  import('./pages/placeholders').then(m => ({ default: m.About }))
);

// Non-lazy pages
import { Alerts } from './pages/alerts';
import { Logs } from './pages/logs';
import { Reports } from './pages/reports';
import { ReportDetail } from './pages/report-detail';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SidebarProvider>
          <BrowserRouter>
            <Suspense fallback={<PageSectionSkeleton />}>
              <Routes>

                {/* PUBLIC ROUTES (NO Layout, NO auth) */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/connect-cloud" element={<ConnectCloud />} />

                {/* PROTECTED ROUTES (WITH Layout + auth) */}
                <Route path="/" element={<Layout />}>
                  <Route path="home" element={<Home />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="graph" element={<AttackGraph />} />
                  <Route path="alerts" element={<Alerts />} />
                  <Route path="logs" element={<Logs />} />
                  <Route path="vulnerabilities" element={<Vulnerabilities />} />
                  <Route path="identities" element={<Identities />} />
                  <Route path="timeline" element={<Timeline />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="reports/:nodeId" element={<ReportDetail />} />
                  <Route path="performance" element={<Performance />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="about" element={<About />} />

                  {/* fallback inside app */}
                  <Route path="*" element={<Navigate to="/home" replace />} />
                </Route>

                {/* global fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />

              </Routes>
          </Suspense>

          <Toaster position="top-right" theme="system" />
        </BrowserRouter>
      </SidebarProvider>
    </AuthProvider>
    </ThemeProvider >
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);