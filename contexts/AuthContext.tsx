import React, { createContext, useState, useEffect } from 'react';
import { User } from '../types';
// --- ИЗМЕНЕНО: Импортируем из реального API вместо mockApi ---
import { login as apiLogin } from '../services/api';

interface AuthContextType {
  user: User | null;
  // --- ИЗМЕНЕНО: Функция login теперь принимает пароль ---
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // В реальном приложении лучше проверять токен на валидность,
    // но пока оставим так для простоты.
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // --- ИЗМЕНЕНО: Функция login теперь принимает и использует пароль ---
  const login = async (email: string, password: string) => {
    const loggedInUser = await apiLogin(email, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      // Храним пользователя в localStorage, так как токен тоже там
      localStorage.setItem('user', JSON.stringify(loggedInUser));
    } else {
        throw new Error('User not found or invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
    // Очищаем localStorage при выходе
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Перенаправляем на страницу логина
    window.location.href = '/#/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};