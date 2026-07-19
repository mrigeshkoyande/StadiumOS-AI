import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const AdminView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [configData, setConfigData] = useState<any>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
    fetchUsers();
    fetchConfig();
  }, []);

  const fetchLogs = () => {
    fetch('/api/logs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLogs(data);
      })
      .catch(console.error);
  };

  const fetchUsers = () => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsersList(data);
      })
      .catch(console.error);
  };

  const fetchConfig = () => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setConfigData(data))
      .catch(console.error);
  };

  const handleUpdateConfig = (key: string, value: string) => {
    const userStr = localStorage.getItem('stadiumos_user');
    const user = userStr ? JSON.parse(userStr) : { id: 1 };

    fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value, userId: user.id })
    })
      .then(res => res.json())
      .then(() => {
        setToastMessage(`Saved configuration: ${key} = ${value}`);
        setTimeout(() => setToastMessage(null), 3000);
        fetchConfig();
        fetchLogs();
      });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-10 space-y-8 bg-[#f7f9fb] min-h-screen text-[#191c1e]"
    >
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-[#003fad] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <span className="text-xs font-bold text-[#ba1a1a] uppercase tracking-widest block mb-1">
            Restricted Operational Domain
          </span>
          <h1 className="font-display text-3xl font-bold text-[#191c1e]">SYSTEM ADMIN CONSOLE</h1>
        </div>
        <span className="px-3 py-1 bg-[#ba1a1a]/10 text-[#ba1a1a] text-xs font-bold rounded-full uppercase">
          ADMIN SECURITY CLEARANCE
        </span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* User Management & Global Config (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* User Management Table */}
          <div className="glass-panel p-6 rounded-3xl fresnel-edge">
            <h2 className="font-display font-bold text-lg text-[#191c1e] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003fad]">manage_accounts</span>
              User & Role Registry
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] text-[#4e5f7b] uppercase bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">ID</th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3 rounded-r-xl">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-white/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-400">#{u.id}</td>
                      <td className="px-4 py-3 font-bold text-[#191c1e]">{u.username}</td>
                      <td className="px-4 py-3 text-slate-700">{u.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'Admin' ? 'bg-[#ba1a1a]/10 text-[#ba1a1a]' :
                          u.role === 'Ops' ? 'bg-[#003fad]/10 text-[#003fad]' :
                          u.role === 'Volunteer' ? 'bg-[#C7A44A]/10 text-[#C7A44A]' : 'bg-[#005431]/10 text-[#005431]'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Configuration */}
          <div className="glass-panel p-6 rounded-3xl fresnel-edge space-y-4">
            <h2 className="font-display font-bold text-lg text-[#191c1e] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003fad]">tune</span>
              Global Stadium Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-white/80 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-[#4e5f7b]">AI Safety Constraints</span>
                <select
                  value={configData.ai_mode || 'strict'}
                  onChange={(e) => handleUpdateConfig('ai_mode', e.target.value)}
                  className="w-full p-2 bg-[#f2f4f6] rounded-xl font-bold border-0 text-xs"
                >
                  <option value="strict">Strict (Human Approval Required)</option>
                  <option value="moderate">Moderate (Autonomous Low Risk)</option>
                  <option value="full_auto">Full Automation (Autonomous Redirection)</option>
                </select>
              </div>

              <div className="p-4 bg-white/80 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-[#4e5f7b]">Stadium Name Setting</span>
                <input
                  type="text"
                  value={configData.stadium_name || 'FIFA World Cup 2026 Arena'}
                  onChange={(e) => setConfigData({ ...configData, stadium_name: e.target.value })}
                  onBlur={(e) => handleUpdateConfig('stadium_name', e.target.value)}
                  className="w-full p-2 bg-[#f2f4f6] rounded-xl font-bold border-0 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Audit Log Stream (1 Col) */}
        <div className="glass-panel p-6 rounded-3xl fresnel-edge h-[560px] flex flex-col">
          <h2 className="font-display font-bold text-base text-[#191c1e] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003fad]">shield</span>
            Security Audit Logs Stream
          </h2>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-white/80 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between font-bold text-[#191c1e]">
                  <span className="text-[#003fad]">{log.action}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">{log.details}</p>
                <span className="text-[10px] text-slate-400 font-bold">User: {log.username || 'System'}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
};
