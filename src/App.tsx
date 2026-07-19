import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Layout } from './components/layout/Layout';
import { LandingView } from './pages/LandingView';
import { LoginDrawer } from './components/auth/LoginDrawer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Lazy Load Heavy Components for Efficiency
const OperationsView = lazy(() => import('./pages/OperationsView').then(m => ({ default: m.OperationsView })));
const FanView = lazy(() => import('./pages/FanView').then(m => ({ default: m.FanView })));
const AdminView = lazy(() => import('./pages/AdminView').then(m => ({ default: m.AdminView })));
const FanTicketView = lazy(() => import('./pages/FanTicketView').then(m => ({ default: m.FanTicketView })));
const ScannerView = lazy(() => import('./pages/ScannerView').then(m => ({ default: m.ScannerView })));


// AnimatePresence requires a component that knows the location
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<LandingView />} />
        
        {/* Protected Routes Wrapper with Layout */}
        <Route path="/" element={<Layout />}>
          {/* Operations / Dashboard */}
          <Route path="operations" element={
            <ProtectedRoute allowedRoles={['Admin', 'Ops']}>
              <Suspense fallback={<div className="p-10 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-[#003fad] border-t-transparent animate-spin" /></div>}>
                <OperationsView />
              </Suspense>
            </ProtectedRoute>
          } />
          
          {/* Admin */}
          <Route path="admin" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Suspense fallback={<div className="p-10 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-[#003fad] border-t-transparent animate-spin" /></div>}>
                <AdminView />
              </Suspense>
            </ProtectedRoute>
          } />
          
          {/* Fan Experience */}
          <Route path="fan" element={
            <ProtectedRoute allowedRoles={['Fan', 'Admin']}>
              <Suspense fallback={<div className="p-10 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-[#003fad] border-t-transparent animate-spin" /></div>}>
                <FanView />
              </Suspense>
            </ProtectedRoute>
          } />
          
          <Route path="ticket" element={
            <ProtectedRoute allowedRoles={['Fan', 'Admin']}>
              <Suspense fallback={<div className="p-10 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-[#003fad] border-t-transparent animate-spin" /></div>}>
                <FanTicketView />
              </Suspense>
            </ProtectedRoute>
          } />

          {/* Volunteer / Scanner */}
          <Route path="scanner" element={
            <ProtectedRoute allowedRoles={['Volunteer', 'Ops', 'Admin']}>
              <Suspense fallback={<div className="p-10 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-[#003fad] border-t-transparent animate-spin" /></div>}>
                <ScannerView />
              </Suspense>
            </ProtectedRoute>
          } />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <LoginDrawer />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
