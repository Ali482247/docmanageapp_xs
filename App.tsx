import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Dashboard from './components/Devonxona';
import Taskbar from './components/Taskbar';
import CorrespondenceView from './components/CorrespondenceView';
import UserManagement from './components/UserManagement';
import RoleManagement from './components/RoleManagement';
import DisciplineManagement from './components/DisciplineManagement';
import ApiManagement from './components/ApiManagement';

const App: React.FC = () => {
  const { user, login } = useAuth(); // <- важно, берем login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  // --- ЭКРАН ВХОДА ---
  if (!user) {
    return (
      <HashRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <div className="flex items-center justify-center h-screen relative">
                <img
                  src="https://pngimg.com/d/eagle_PNG1225.png"
                  alt="Eagle"
                  className="absolute right-20 bottom-20 w-96 drop-shadow-xl"
                />

                <div className="flex flex-col space-y-4 bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg w-80 text-white">
                  <h2 className="text-center text-lg tracking-wider">TIZIMGA KIRISH</h2>
                  <input
                    type="text"
                    placeholder="Login"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-transparent border-b border-gray-300 text-sm px-2 py-1 focus:outline-none focus:border-white"
                  />
                  <input
                    type="password"
                    placeholder="Parol"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent border-b border-gray-300 text-sm px-2 py-1 focus:outline-none focus:border-white"
                  />
                  <button
                    onClick={() => login(username, password)} // <- вот тут логин
                    className="mt-4 py-2 rounded-md bg-gray-800/70 hover:bg-gray-700 transition"
                  >
                    KIRISH
                  </button>
                </div>
              </div>
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </HashRouter>
    );
  }

  // --- ОСНОВНОЕ ПРИЛОЖЕНИЕ ---
  return (
    <HashRouter>
      <div className="w-full h-screen flex items-center justify-center p-4">
        <div className="w-full h-full max-w-7xl mx-auto bg-gray-900/40 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl flex flex-col overflow-hidden relative">
          <div className="flex-shrink-0 h-10 bg-black/10 flex items-center px-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <Routes>
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/correspondence/:id" element={<ProtectedRoute><CorrespondenceView /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
              <Route path="/roles" element={<ProtectedRoute><RoleManagement /></ProtectedRoute>} />
              <Route path="/discipline" element={<ProtectedRoute><DisciplineManagement /></ProtectedRoute>} />
              <Route path="/api-docs" element={<ProtectedRoute><ApiManagement /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
          <Taskbar />
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
