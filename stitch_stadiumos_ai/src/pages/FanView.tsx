import { useState, useEffect } from 'react';
import { askAI } from '../services/ai';
import type { AIResponse } from '../types';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

export function FanView() {
  const [query, setQuery] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState(() => localStorage.getItem('stadiumos_lang') || 'English');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'ai', content: string, aiData?: AIResponse}>>(() => {
    const welcomeMessages: Record<string, string> = {
      'English': "Welcome to the FIFA World Cup 2026! I'm your StadiumOS Assistant. How can I help you today?",
      'Spanish': "¡Bienvenido a la Copa Mundial de la FIFA 2026! Soy tu Asistente de StadiumOS.",
      'French': "Bienvenue à la Coupe du Monde de la FIFA 2026 ! Je suis votre Assistant StadiumOS.",
      'Arabic': "مرحبًا بك في كأس العالم FIFA 2026! أنا مساعد StadiumOS الخاص بك.",
      'Hindi': "फीफा विश्व कप 2026 में आपका स्वागत है! मैं आपका StadiumOS सहायक हूँ।",
      'Portuguese': "Bem-vindo à Copa do Mundo da FIFA 2026! Sou o seu Assistente do StadiumOS.",
    };
    const currentLang = localStorage.getItem('stadiumos_lang') || 'English';
    return [{ role: 'ai', content: welcomeMessages[currentLang] || welcomeMessages['English'] }];
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setCurrentLanguage(customEvent.detail);
    };
    window.addEventListener('stadiumos-language-change', handleLangChange);
    return () => window.removeEventListener('stadiumos-language-change', handleLangChange);
  }, []);

  const handleSend = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length > 500) return;
    
    const userQuery = trimmedQuery;
    setQuery('');
    setChatHistory(prev => [...prev, { role: 'user', content: userQuery }]);
    setIsLoading(true);

    try {
      const response = await askAI(userQuery, 'fan', currentLanguage);
      setChatHistory(prev => [
        ...prev, 
        { role: 'ai', content: response.recommendation, aiData: response }
      ]);
    } catch {
      setChatHistory(prev => [
        ...prev, 
        { role: 'ai', content: "I'm having trouble connecting to live stadium data right now. Please locate a volunteer for assistance." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (text: string) => {
    setQuery(text);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 bg-[#f7f9fb] min-h-screen text-[#191c1e]"
    >
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <span className="text-xs font-bold text-[#003fad] uppercase tracking-widest block mb-1">
            FIFA World Cup 2026 · Fan Services
          </span>
          <h1 className="font-display text-3xl font-bold text-[#191c1e]">
            FAN EXPERIENCE & WAYFINDING
          </h1>
        </div>
      </div>

      {/* Quick Action Shortcuts Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <QuickActionButton icon="location_on" label="Find My Seat" onClick={() => handleQuickAction("How do I get to Section 102?")} />
        <QuickActionButton icon="fast_forward" label="Shortest Queue" onClick={() => handleQuickAction("Which gate has the shortest queue?")} />
        <QuickActionButton icon="local_cafe" label="Food & Drink" onClick={() => handleQuickAction("Where is the nearest food stand?")} />
        <QuickActionButton icon="medical_services" label="Medical Help" onClick={() => handleQuickAction("I need medical assistance")} />
        <QuickActionButton icon="accessible" label="Accessible Route" onClick={() => handleQuickAction("Find an accessible route to my seat")} />
        <QuickActionButton icon="directions_bus" label="Transport Help" onClick={() => handleQuickAction("What is the fastest transport option to leave?")} />
      </div>

      {/* AI Assistant Chat Panel */}
      <div className="glass-panel-heavy rounded-3xl border border-[#003fad]/30 shadow-xl overflow-hidden flex flex-col h-[520px]">
        <div className="bg-[#003fad] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl">auto_awesome</span>
            <div>
              <h2 className="font-display font-bold text-base">StadiumOS Fan Assistant</h2>
              <p className="text-[10px] opacity-80 uppercase tracking-wider">Multi-Lingual AI Cognitive Layer ({currentLanguage})</p>
            </div>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/40">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={cn(
                "max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm text-xs leading-relaxed",
                msg.role === 'user' 
                  ? 'bg-[#003fad] text-white rounded-tr-none font-medium' 
                  : 'bg-white text-[#191c1e] border border-slate-200 rounded-tl-none'
              )}>
                <p>{msg.content}</p>
                {msg.aiData && msg.aiData.actions.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                    {msg.aiData.actions.map((act: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-[#003fad]/10 text-[#003fad] rounded-full font-bold text-[10px]">
                        {act}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#003fad] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#003fad] rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-[#003fad] rounded-full animate-bounce delay-200" />
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200 flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask directions, wait times, food, accessible routes..."
            className="flex-1 px-4 py-3 bg-[#f2f4f6] text-xs text-[#191c1e] rounded-xl outline-none focus:ring-2 focus:ring-[#003fad]"
          />
          <button
            onClick={handleSend}
            disabled={!query.trim() || isLoading}
            className="px-6 py-3 bg-[#003fad] text-white font-bold text-xs rounded-xl hover:bg-[#1455d9] transition-colors disabled:opacity-50"
          >
            SEND
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function QuickActionButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="glass-panel p-5 rounded-2xl fresnel-edge hover:translate-y-[-2px] transition-all flex flex-col items-center justify-center gap-2 text-center group"
    >
      <span className="material-symbols-outlined text-2xl text-[#003fad] group-hover:scale-110 transition-transform">
        {icon}
      </span>
      <span className="text-xs font-bold text-[#191c1e]">{label}</span>
    </button>
  );
}
