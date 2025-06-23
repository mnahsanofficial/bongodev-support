import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TimelinePage from './pages/TimelinePage';
import MurmurDetailPage from './pages/MurmurDetailPage';
import UserProfilePage from './pages/UserProfilePage'; // Import UserProfilePage
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';

const AppContent: React.FC = () => {
  const { isLoading } = useAuth(); // Corrected line

  if (isLoading) {
    return <div>Loading application...</div>; // Or some splash screen
  }

  return (
    <>
      <Navigation />
      <div className="p-4"> {/* Using PrimeFlex padding */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<TimelinePage />} />
            <Route path="murmurs/:id" element={<MurmurDetailPage />} />
            <Route path="profile" element={<UserProfilePage />} /> {/* Route for own profile */}
            <Route path="users/:userId" element={<UserProfilePage />} /> {/* Route for other users' profiles */}
          </Route>
          
        </Routes>
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;