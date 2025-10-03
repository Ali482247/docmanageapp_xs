
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import Dashboard from './components/Devonxona';
import Taskbar from './components/Taskbar';
import CorrespondenceView from './components/CorrespondenceView';
import UserManagement from './components/UserManagement';
import RoleManagement from './components/RoleManagement';
import DisciplineManagement from './components/DisciplineManagement';
import ApiManagement from './components/ApiManagement';

const App: React.FC = () => {
  const { user } = useAuth();

  const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  if (!user) {
    return (
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </HashRouter>
    );
  }

  return (
    <HashRouter>
      <div className="flex flex-col h-screen text-white">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8 pb-24">
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/correspondence/:id" element={<ProtectedRoute><CorrespondenceView /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
            <Route path="/roles" element={<ProtectedRoute><RoleManagement /></ProtectedRoute>} />
            <Route path="/api-docs" element={<ProtectedRoute><ApiManagement /></ProtectedRoute>} />
            <Route path="/discipline" element={<ProtectedRoute><DisciplineManagement /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
        <Taskbar />
      </div>
    </HashRouter>
  );
};

export default App;