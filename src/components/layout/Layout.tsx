import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [lang, setLang] = useState(() => localStorage.getItem('stadiumos_lang') || 'English');
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifModal, setShowNotifModal] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('stadiumos_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      setUser(u);
      fetchNotifications(u.id);
    }
  }, [location]);

  const fetchNotifications = (userId: number) => {
    fetch(`/api/notifications/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(console.error);
  };

  const handleMarkAsRead = (id: number) => {
    fetch('/api/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: id })
    }).then(() => {
      if (user) fetchNotifications(user.id);
    });
  };

  const handleMarkAllRead = () => {
    if (!user) return;
    fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    }).then(() => fetchNotifications(user.id));
  };

  const handleLangChange = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem('stadiumos_lang', newLang);
    window.dispatchEvent(new CustomEvent('stadiumos-language-change', { detail: newLang }));
  };

  const handleLogout = () => {
    localStorage.removeItem('stadiumos_user');
    setUser(null);
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.read_state).length;
  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans">
      {/* 1. Side Navigation (Stitch SideNavBar) */}
      <aside className="fixed left-0 top-0 h-screen w-20 border-r border-white/20 bg-white/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(7,26,51,0.08)] flex-col items-center py-6 gap-6 z-50 hidden md:flex">
        <Link to="/" aria-label="Go to Home" className="w-12 h-12 rounded-xl bg-[#003fad]/10 flex items-center justify-center mb-4 text-[#003fad] hover:bg-[#003fad]/20 transition-colors">
          <span className="material-symbols-outlined text-2xl font-bold">stadium</span>
        </Link>

        <nav className="flex flex-col gap-6 w-full items-center">
          <Link
            to="/operations"
            aria-label="Digital Twin View"
            className={`group flex flex-col items-center gap-1 w-full py-2 relative transition-all ${
              currentPath === '/operations' ? 'text-[#003fad]' : 'text-[#4e5f7b]/70 hover:text-[#003fad]'
            }`}
          >
            {currentPath === '/operations' && (
              <div className="absolute left-0 top-0 h-full w-1 bg-[#003fad] rounded-r-full" />
            )}
            <span className="material-symbols-outlined text-xl">view_in_ar</span>
            <span className="text-[10px] font-bold tracking-tight">Twin</span>
          </Link>

          <Link
            to="/operations"
            aria-label="Operations Control"
            className={`group flex flex-col items-center gap-1 w-full py-2 relative transition-all ${
              currentPath.includes('operations') ? 'text-[#003fad]' : 'text-[#4e5f7b]/70 hover:text-[#003fad]'
            }`}
          >
            <span className="material-symbols-outlined text-xl">settings_suggest</span>
            <span className="text-[10px] font-bold tracking-tight">Ops</span>
          </Link>

          <Link
            to="/fan"
            aria-label="Fan AI Assistant"
            className={`group flex flex-col items-center gap-1 w-full py-2 relative transition-all ${
              currentPath.includes('fan') ? 'text-[#003fad]' : 'text-[#4e5f7b]/70 hover:text-[#003fad]'
            }`}
          >
            {currentPath.includes('fan') && (
              <div className="absolute left-0 top-0 h-full w-1 bg-[#003fad] rounded-r-full" />
            )}
            <span className="material-symbols-outlined text-xl">groups</span>
            <span className="text-[10px] font-bold tracking-tight">Fan AI</span>
          </Link>

          <Link
            to="/ticket"
            aria-label="Digital Ticket"
            className={`group flex flex-col items-center gap-1 w-full py-2 relative transition-all ${
              currentPath.includes('ticket') ? 'text-[#003fad]' : 'text-[#4e5f7b]/70 hover:text-[#003fad]'
            }`}
          >
            {currentPath.includes('ticket') && (
              <div className="absolute left-0 top-0 h-full w-1 bg-[#003fad] rounded-r-full" />
            )}
            <span className="material-symbols-outlined text-xl">confirmation_number</span>
            <span className="text-[10px] font-bold tracking-tight">Ticket</span>
          </Link>

          <Link
            to="/scanner"
            aria-label="Gate Scanner"
            className={`group flex flex-col items-center gap-1 w-full py-2 relative transition-all ${
              currentPath.includes('scanner') ? 'text-[#003fad]' : 'text-[#4e5f7b]/70 hover:text-[#003fad]'
            }`}
          >
            {currentPath.includes('scanner') && (
              <div className="absolute left-0 top-0 h-full w-1 bg-[#003fad] rounded-r-full" />
            )}
            <span className="material-symbols-outlined text-xl">verified</span>
            <span className="text-[10px] font-bold tracking-tight">Scanner</span>
          </Link>

          {user && user.role === 'Admin' && (
            <Link
              to="/admin"
              aria-label="Admin Dashboard"
              className={`group flex flex-col items-center gap-1 w-full py-2 relative transition-all ${
                currentPath.includes('admin') ? 'text-[#003fad]' : 'text-[#4e5f7b]/70 hover:text-[#003fad]'
              }`}
            >
              {currentPath.includes('admin') && (
                <div className="absolute left-0 top-0 h-full w-1 bg-[#003fad] rounded-r-full" />
              )}
              <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
              <span className="text-[10px] font-bold tracking-tight">Admin</span>
            </Link>
          )}
        </nav>
      </aside>

      {/* 2. Top Navigation Bar (Stitch TopAppBar) */}
      <header className="fixed top-0 right-0 left-0 md:left-20 h-16 z-40 flex justify-between items-center px-6 bg-white/40 backdrop-blur-2xl border-b border-white/20">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-display text-lg font-bold text-[#003fad] tracking-tight">
            StadiumOS AI
          </Link>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#003fad]/10 text-[#003fad] font-bold uppercase tracking-wider hidden sm:inline-block">
            FIFA World Cup 2026
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-white/80 border border-slate-200 px-3 py-1 rounded-xl text-xs font-bold text-[#191c1e] shadow-sm">
            <span className="material-symbols-outlined text-sm text-[#003fad]">translate</span>
            <select
              value={lang}
              onChange={(e) => handleLangChange(e.target.value)}
              className="bg-transparent border-0 focus:ring-0 focus:outline-none cursor-pointer pr-1 font-bold text-xs"
              aria-label="Select Language"
            >
              <option value="English">ENG</option>
              <option value="Spanish">ESP</option>
              <option value="French">FRA</option>
              <option value="Arabic">ARB</option>
              <option value="Hindi">HIN</option>
              <option value="Portuguese">POR</option>
            </select>
          </div>

          {/* Notifications Center Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifModal(!showNotifModal)}
              aria-label="Notifications"
              className="p-2 rounded-xl text-[#003fad] hover:bg-white/60 transition-colors relative"
            >
              <span className="material-symbols-outlined text-2xl">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ba1a1a] text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Center Modal */}
            {showNotifModal && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 glass-panel-heavy rounded-2xl p-4 shadow-2xl border border-white/40 z-50">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <h3 className="font-display font-bold text-sm text-[#003fad]">Notifications Center</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead} 
                      className="text-xs text-[#003fad] font-bold hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto py-2 space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">No notifications yet.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkAsRead(n.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          !n.read_state 
                            ? 'bg-white border-[#003fad]/30 shadow-sm' 
                            : 'bg-slate-50 border-slate-200 opacity-70'
                        }`}
                      >
                        <div className="flex justify-between font-bold text-[#191c1e] mb-1">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Auth Button */}
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#003fad] text-white flex items-center justify-center font-bold text-xs">
                {user.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-[#191c1e] leading-none">{user.name}</p>
                <p className="text-[10px] text-[#003fad] font-semibold uppercase mt-0.5">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-[#ba1a1a] transition-colors"
                title="Logout"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-login-drawer'))}
              className="px-4 py-2 bg-[#003fad] text-white rounded-xl text-xs font-bold hover:bg-[#1455d9] transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* 3. Main Outlet View */}
      <main className="pt-16 ml-0 md:ml-20 min-h-[calc(100vh-64px)]">
        <Outlet />
      </main>
    </div>
  );
}
