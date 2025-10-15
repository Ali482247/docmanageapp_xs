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

// SVG icons for the password visibility toggle
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243" />
  </svg>
);

const App: React.FC = () => {
  const { user, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  // --- LOGIN SCREEN ---
  if (!user) {
    return (
      <HashRouter>
        <Routes>
          <Route
            path="/login"
            element={
              // Added p-4 to ensure content doesn't touch screen edges on mobile
              <div className="flex items-center justify-center h-screen relative p-4">
                {/* MODIFICATION: Eagle is now hidden on small screens (e.g., mobile) 
                    and appears on medium screens (md) and larger to avoid clutter. */}
                <img
                  src="https://pngimg.com/d/eagle_PNG1225.png"
                  alt="Eagle"
                  className="hidden md:block absolute right-10 bottom-10 w-64 lg:w-96 drop-shadow-xl"
                />
                
                {/* MODIFICATION: Adjusted width and padding for mobile.
                    - w-full: Takes full width on very small screens.
                    - max-w-xs: Caps the width to a reasonable size on mobile.
                    - md:w-80: Reverts to the original fixed width on medium screens and up.
                    - p-6: Slightly reduced padding for smaller screens. */}
                <div className="flex flex-col space-y-4 bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-xs md:w-80 text-white">
                  <h2 className="text-center text-lg tracking-wider font-bold">TIZIMGA KIRISH</h2>
                  <input
                    type="text"
                    placeholder="Login"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-transparent border-b border-gray-300 text-sm px-2 py-1 focus:outline-none focus:border-white font-normal placeholder:text-white text-white text-center"
                  />
                  {/* Wrapper for password input and icon */}
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Parol"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-b border-gray-300 text-sm px-2 py-1 focus:outline-none focus:border-white font-normal placeholder:text-white text-white text-center"
                    />
                    {/* Button to toggle password visibility */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 px-2 flex items-center text-white/70 hover:text-white"
                    >
                      {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                  </div>

                  <button
                    onClick={() => login(username, password)}
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

  // --- MAIN APPLICATION ---
  // This section was already well-structured for responsiveness.
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