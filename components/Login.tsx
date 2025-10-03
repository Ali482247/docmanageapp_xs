import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
// MOCK_USERS больше не нужен для быстрого входа, так как пароли неизвестны
// Вместо этого мы можем оставить кнопки, но они будут подставлять email, а пароль нужно будет ввести
import { MOCK_USERS } from '../services/mockApi'; 
import { DocumentIcon } from './icons/IconComponents';
import { UserRole } from '../constants';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  // --- ДОБАВЛЕНО: Состояние для пароля ---
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // --- ИЗМЕНЕНО: Передаем email и пароль ---
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      // Улучшаем сообщение об ошибке
      setError(err.message || 'Ошибка входа. Проверьте email и пароль.');
    } finally {
      setIsLoading(false);
    }
  };

  // Функция быстрого входа теперь просто подставляет email
  const quickSetEmail = (userEmail: string) => {
    setEmail(userEmail);
  };

  const quickLoginUsers = [
      MOCK_USERS.find(u => u.role === UserRole.Admin),
      MOCK_USERS.find(u => u.role === UserRole.BankApparati),
      MOCK_USERS.find(u => u.role === UserRole.Boshqaruv),
      MOCK_USERS.find(u => u.role === UserRole.Yordamchi),
      MOCK_USERS.find(u => u.role === UserRole.Tarmoq),
      MOCK_USERS.find(u => u.role === UserRole.Resepshn),
      MOCK_USERS.find(u => u.role === UserRole.BankKengashiKotibi),
  ].filter(Boolean) as any[];


  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-8 backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl shadow-lg text-white">
        <div className="text-center">
            <DocumentIcon className="w-16 h-16 mx-auto text-white/80" />
          <h2 className="mt-4 text-3xl font-bold">
            Agrobank | Ijro Intizomi
          </h2>
           <p className="mt-2 text-white/70">Tizimga kirish</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email manzil
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full px-3 py-3 text-white placeholder-white/50 bg-white/10 border border-white/20 rounded-md appearance-none focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Email manzil"
              />
            </div>
            {/* --- ДОБАВЛЕНО: Поле для ввода пароля --- */}
            <div>
              <label htmlFor="password" className="sr-only">
                Parol
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full px-3 py-3 text-white placeholder-white/50 bg-white/10 border border-white/20 rounded-md appearance-none focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Parol"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white border border-transparent rounded-md group bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-primary disabled:bg-white/20"
            >
              {isLoading ? 'Kirilmoqda...' : 'Kirish'}
            </button>
          </div>
        </form>

        <div className="pt-4 mt-4 border-t border-white/20">
            <p className="text-sm text-center text-white/70">Yoki tezkor kirish (email tanlang):</p>
            <div className="grid grid-cols-2 gap-3 mt-4">
                {quickLoginUsers.map(user => (
                    <button key={user.id} onClick={() => quickSetEmail(user.email)} className="px-4 py-2 text-sm text-white rounded-md bg-white/10 hover:bg-white/20 border border-white/20 transition-colors">
                        {user.role}
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;