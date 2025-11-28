import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import BookingPage from './pages/BookingPage';
import AppointmentsPage from './pages/AppointmentsPage';
import AiAssistant from './components/AiAssistant';
import { db } from './services/db';

// Private Route Wrapper
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = db.getUser();
  if (!user) return <Navigate to="/auth" />;
  if (!user.completedOnboarding) return <Navigate to="/onboarding" />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const user = db.getUser();

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          
          <Route path="/" element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } />
          
          <Route path="/booking" element={
            <PrivateRoute>
              <BookingPage />
            </PrivateRoute>
          } />
          
          <Route path="/appointments" element={
            <PrivateRoute>
              <AppointmentsPage />
            </PrivateRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        
        {/* Only show AI Assistant if user is logged in */}
        {user && user.completedOnboarding && <AiAssistant />}
        
      </Layout>
    </Router>
  );
};

export default App;