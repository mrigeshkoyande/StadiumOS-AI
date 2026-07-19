import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


export const LoginDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    window.addEventListener('open-login-drawer', handleOpen);
    window.addEventListener('close-login-drawer', handleClose);

    return () => {
      window.removeEventListener('open-login-drawer', handleOpen);
      window.removeEventListener('close-login-drawer', handleClose);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('stadiumos_user', JSON.stringify(data.user));
        setIsOpen(false);
        // Refresh page to apply layout changes and route properly
        window.location.reload();
      } else {
        setError(data.error || 'Authentication failed. Invalid credentials.');
      }
    } catch {
      setError('Network error connecting to authentication service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSelect = (roleUser: string, rolePass: string) => {
    setUsername(roleUser);
    setPassword(rolePass);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-[#191c1e]/40 backdrop-blur-sm z-[999]"
          />

          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[1000] flex flex-col border-l border-white/20"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#003fad] text-2xl font-bold">stadium</span>
                <span className="font-display font-bold text-lg text-[#003fad]">StadiumOS AI</span>
              </div>
              <button 
                onClick={handleClose}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-8 flex-1 overflow-y-auto">
              <div className="mb-8">
                <h2 className="font-display font-bold text-2xl mb-2 text-[#191c1e]">
                  Sign In to Access Layer
                </h2>
                <p className="text-xs font-bold text-[#4e5f7b] uppercase tracking-widest">
                  FIFA World Cup 2026 Authentication Portal
                </p>
              </div>

              {error && (
                <div className="bg-[#ba1a1a]/10 border border-[#ba1a1a]/30 text-[#ba1a1a] p-3.5 rounded-xl mb-6 text-xs font-bold">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-[#4e5f7b] uppercase tracking-wider mb-1.5">
                    Username / Account ID
                  </label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. fan or ops or admin"
                    className="w-full px-4 py-3 bg-[#f2f4f6] border border-slate-200 rounded-xl text-xs font-bold text-[#191c1e] outline-none focus:ring-2 focus:ring-[#003fad]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#4e5f7b] uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-[#f2f4f6] border border-slate-200 rounded-xl text-xs font-bold text-[#191c1e] outline-none focus:ring-2 focus:ring-[#003fad]"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#003fad] text-white hover:bg-[#1455d9] rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {isLoading ? 'AUTHENTICATING...' : 'AUTHENTICATE & ENTER'}
                </button>
              </form>

              {/* Quick Account Selector */}
              <div className="mt-10 pt-8 border-t border-slate-200">
                <span className="text-[10px] font-bold text-[#4e5f7b] uppercase tracking-wider block text-center mb-4">
                  Quick Select Account Role:
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                  <button
                    onClick={() => handleDemoSelect('fan', 'fan123')}
                    className="py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#003fad] hover:bg-[#003fad]/10 transition-colors"
                  >
                    Fan Demo
                  </button>
                  <button
                    onClick={() => handleDemoSelect('ops', 'ops123')}
                    className="py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#003fad] hover:bg-[#003fad]/10 transition-colors"
                  >
                    Ops Demo
                  </button>
                  <button
                    onClick={() => handleDemoSelect('volunteer', 'vol123')}
                    className="py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#003fad] hover:bg-[#003fad]/10 transition-colors"
                  >
                    Volunteer Demo
                  </button>
                  <button
                    onClick={() => handleDemoSelect('admin', 'admin123')}
                    className="py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#ba1a1a] hover:bg-[#ba1a1a]/10 transition-colors"
                  >
                    Admin Demo
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
