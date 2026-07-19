import { useState, useEffect } from 'react';
import { askAI } from '../services/ai';
import type { AIResponse } from '../types';
import { cn } from '../utils/cn';
import { StadiumScene } from '../components/3d/StadiumScene';
import { useStadiumSimulation } from '../hooks/useStadiumSimulation';
import { motion } from 'framer-motion';

export function OperationsView() {
  const [aiAnalysis, setAiAnalysis] = useState<AIResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [show3D, setShow3D] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState(() => localStorage.getItem('stadiumos_lang') || 'English');

  const {
    state: simState,
    focusGateId,
    setFocusGateId,
    startSimulation,
    acceptRedirection,
  } = useStadiumSimulation();

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setCurrentLanguage(customEvent.detail);
    };
    window.addEventListener('stadiumos-language-change', handleLangChange);
    return () => window.removeEventListener('stadiumos-language-change', handleLangChange);
  }, []);

  useEffect(() => {
    const runAnalysis = async () => {
      setIsAnalyzing(true);
      try {
        const response = await askAI("Analyze current stadium crowd status across all gates and recommend operational actions.", "ops", currentLanguage);
        setAiAnalysis(response);
      } catch (error) {
        console.error(error);
      } finally {
        setIsAnalyzing(false);
      }
    };
    runAnalysis();
  }, [currentLanguage]);

  useEffect(() => {
    if (simState.simulationStep === 5) {
      const fetchAI = async () => {
        setIsAnalyzing(true);
        try {
          const response = await askAI("Gate B crowd density is increasing rapidly. Predict congestion timeline and recommend fan redirection.", "ops", currentLanguage);
          setAiAnalysis(response);
        } catch (error) {
          console.error(error);
        } finally {
          setIsAnalyzing(false);
        }
      };
      fetchAI();
    }
  }, [simState.simulationStep, currentLanguage]);

  const handleAcceptRedirection = () => {
    acceptRedirection();
    setToastMessage("✅ Gate redirection activated. Fans are being rerouted to Gate C.");
    setTimeout(() => setToastMessage(null), 4000);

    // Create DB notification for fans
    const userStr = localStorage.getItem('stadiumos_user');
    const user = userStr ? JSON.parse(userStr) : null;
    fetch('/api/notifications/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user ? user.id : 4,
        title: 'Operational Gate Advisory',
        message: 'Gate B is experiencing high density. Please proceed to Gate C for faster entry.',
        type: 'warning'
      })
    }).catch(console.error);
  };

  const handleDeployVolunteers = () => {
    setToastMessage("👮 12 Volunteers deployed to Gate B perimeter.");
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSelectGate = (gateId: string) => {
    setFocusGateId(gateId);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-10 space-y-8 bg-[#f7f9fb] min-h-screen text-[#191c1e]"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-[#005431] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold animate-bounce flex items-center gap-2">
          <span className="material-symbols-outlined text-base">task_alt</span>
          {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-[#003fad] uppercase tracking-widest block mb-1">
            FIFA World Cup 2026 · Real-Time Operations
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[#191c1e] tracking-tight">
            OPERATIONS COMMAND CENTER
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={startSimulation}
            disabled={simState.isSimulating}
            className={cn(
              "px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm",
              simState.isSimulating 
                ? "bg-[#C7A44A]/20 text-[#C7A44A] border border-[#C7A44A]/40" 
                : "bg-[#003fad] text-white hover:bg-[#1455d9]"
            )}
          >
            <span className="material-symbols-outlined text-sm">play_arrow</span>
            {simState.isSimulating ? 'SIMULATING...' : 'RUN LIVE SIMULATION'}
          </button>

          <div className="flex bg-[#eceef0] p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setShow3D(true)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all",
                show3D ? "bg-white text-[#003fad] shadow-sm" : "text-[#4e5f7b]"
              )}
            >
              <span className="material-symbols-outlined text-sm">view_in_ar</span> 3D
            </button>
            <button
              onClick={() => setShow3D(false)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all",
                !show3D ? "bg-white text-[#003fad] shadow-sm" : "text-[#4e5f7b]"
              )}
            >
              <span className="material-symbols-outlined text-sm">map</span> 2D
            </button>
          </div>
        </div>
      </div>

      {/* Top Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Live Attendance" value="68,412" trend="+12%" icon="groups" color="primary" />
        <MetricCard title="Avg Entry Time" value="4.2 min" trend="-0.5m" icon="schedule" color="tertiary" />
        <MetricCard 
          title="Active Incidents" 
          value={simState.incidents.filter(i => i.status === 'active').length.toString()} 
          trend="Live Alert" 
          icon="warning" 
          color="error" 
        />
        <MetricCard title="Stadium Occupancy" value="82%" trend="+5%" icon="bar_chart" color="primary" />
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: 3D Digital Twin Viewport + Gate Queue Analysis */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 3D Digital Twin Container */}
          <div className="glass-panel rounded-3xl overflow-hidden shadow-lg border border-white/40 h-[480px] relative flex flex-col">
            <div className="p-4 bg-white/70 backdrop-blur-md border-b border-slate-200 flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#003fad]">view_in_ar</span>
                <h2 className="font-display font-bold text-sm text-[#191c1e]">3D Spatial Digital Twin</h2>
              </div>
              <span className="text-[10px] font-bold text-[#005431] bg-[#005431]/10 px-3 py-1 rounded-full uppercase">
                Telemetry Synced
              </span>
            </div>

            <div className="flex-1 relative">
              {show3D ? (
                <StadiumScene
                  gates={simState.gates}
                  selectedGateId={focusGateId}
                  focusGateId={focusGateId}
                  onSelectGate={handleSelectGate}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-[#f2f4f6]">
                  <svg viewBox="0 0 400 300" className="w-full h-full p-6">
                    <rect x="100" y="50" width="200" height="200" rx="20" fill="#e6e8ea" stroke="#c3c6d7" strokeWidth="2" />
                    <rect x="120" y="70" width="160" height="160" rx="10" fill="#ffffff" />
                    {simState.gates.map((gate, i) => {
                      const svgPositions: [number, number][] = [[200, 20], [380, 150], [200, 280], [20, 150]];
                      const pos = svgPositions[i];
                      const color = gate.density === 'low' ? '#005431' : gate.density === 'medium' ? '#C7A44A' : '#ba1a1a';
                      return (
                        <g key={gate.id} transform={`translate(${pos[0]}, ${pos[1]})`}>
                          <circle cx="0" cy="0" r="14" fill={color} />
                          <text x="-4" y="4" fontSize="10" fill="white" fontWeight="bold">{gate.name.split(' ')[1]}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}

              {/* Circular Twin-Controller Dial */}
              <div className="absolute bottom-4 right-4 z-20 glass-panel-heavy p-3 rounded-2xl border border-white/60 shadow-xl flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-[#4e5f7b] uppercase tracking-wider">Twin Camera</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setFocusGateId('gate-a')} 
                    className="w-8 h-8 rounded-full bg-white border border-slate-200 text-xs font-bold hover:bg-[#003fad] hover:text-white transition-colors"
                  >
                    A
                  </button>
                  <button 
                    onClick={() => setFocusGateId('gate-b')} 
                    className="w-8 h-8 rounded-full bg-white border border-slate-200 text-xs font-bold hover:bg-[#003fad] hover:text-white transition-colors"
                  >
                    B
                  </button>
                  <button 
                    onClick={() => setFocusGateId('gate-c')} 
                    className="w-8 h-8 rounded-full bg-white border border-slate-200 text-xs font-bold hover:bg-[#003fad] hover:text-white transition-colors"
                  >
                    C
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Gate Queue Analysis Table */}
          <div className="glass-panel p-6 rounded-3xl fresnel-edge">
            <h2 className="font-display font-bold text-lg text-[#191c1e] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003fad]">table_chart</span>
              Gate Queue & Density Telemetry
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] text-[#4e5f7b] uppercase bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">Gate</th>
                    <th className="px-4 py-3">Queue Length</th>
                    <th className="px-4 py-3">Est. Wait</th>
                    <th className="px-4 py-3">Trend</th>
                    <th className="px-4 py-3 rounded-r-xl">Density</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {simState.gates.map((gate) => (
                    <tr
                      key={gate.id}
                      onClick={() => handleSelectGate(gate.id)}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-white/80",
                        focusGateId === gate.id && "bg-[#003fad]/10 font-bold"
                      )}
                    >
                      <td className="px-4 py-3 font-bold text-[#191c1e]">{gate.name}</td>
                      <td className="px-4 py-3 text-slate-700">{gate.queueLength} persons</td>
                      <td className="px-4 py-3 text-slate-700">{gate.estimatedWaitTime} min</td>
                      <td className="px-4 py-3 font-bold">
                        <span className={gate.trend === 'increasing' ? 'text-[#ba1a1a]' : 'text-[#005431]'}>
                          {gate.trend === 'increasing' ? '↑' : '↓'} {gate.trend.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                          gate.density === 'low' ? 'bg-[#005431]/10 text-[#005431]' :
                          gate.density === 'medium' ? 'bg-[#C7A44A]/10 text-[#C7A44A]' : 'bg-[#ba1a1a]/10 text-[#ba1a1a]'
                        )}>
                          {gate.density}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: AI Copilot & Active Incidents */}
        <div className="space-y-8">
          
          {/* AI Copilot Card */}
          <div className="glass-panel-heavy p-6 rounded-3xl fresnel-edge border border-[#003fad]/30 ai-pulse relative overflow-hidden">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
              <div className="w-10 h-10 rounded-2xl bg-[#003fad] text-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
              <div>
                <h2 className="font-display font-bold text-base text-[#003fad]">Operations AI Copilot</h2>
                <p className="text-[10px] font-bold text-[#4e5f7b] uppercase">Gemini Cognitive Engine</p>
              </div>
            </div>

            <div className="py-4 space-y-4">
              {isAnalyzing ? (
                <div className="flex flex-col items-center py-6 space-y-2">
                  <div className="w-6 h-6 border-2 border-[#003fad] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-500 font-bold">Synthesizing spatial feeds...</p>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ba1a1a]/10 text-[#ba1a1a] uppercase">
                      {aiAnalysis.priority} PRIORITY
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      Confidence: {(aiAnalysis.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <p className="font-bold text-sm text-[#191c1e] leading-snug">
                    {aiAnalysis.summary}
                  </p>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    {aiAnalysis.recommendation}
                  </div>

                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold text-[#4e5f7b] uppercase tracking-wider block">
                      Recommended Actions
                    </span>
                    
                    <button
                      onClick={handleAcceptRedirection}
                      className="w-full py-2.5 px-4 bg-[#003fad] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#1455d9] transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Accept & Reroute Gate B
                    </button>

                    <button
                      onClick={handleDeployVolunteers}
                      className="w-full py-2.5 px-4 glass-panel text-[#003fad] border border-[#003fad]/30 rounded-xl text-xs font-bold hover:bg-white transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">shield</span>
                      Deploy Gate Volunteers
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Awaiting data...</p>
              )}
            </div>
          </div>

          {/* Active Incidents Timeline */}
          <div className="glass-panel p-6 rounded-3xl fresnel-edge">
            <h2 className="font-display font-bold text-base text-[#191c1e] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ba1a1a]">warning</span>
              Active Incidents Timeline
            </h2>

            <div className="space-y-4">
              {simState.incidents.filter(i => i.status === 'active').map((incident) => (
                <div key={incident.id} className="p-3 bg-white/80 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-[#191c1e]">
                    <span>{incident.location}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{incident.summary}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-[#4e5f7b] text-[10px] font-bold rounded">
                    {incident.assignedTeam}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

function MetricCard({ title, value, trend, icon, color }: { title: string; value: string; trend: string; icon: string; color: string }) {
  return (
    <div className="glass-panel p-6 rounded-2xl fresnel-edge hover:translate-y-[-2px] transition-all flex items-center justify-between">
      <div>
        <span className="text-[10px] font-bold text-[#4e5f7b] uppercase tracking-wider block mb-1">{title}</span>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl font-bold text-[#191c1e]">{value}</span>
          <span className={`text-xs font-bold ${color === 'error' ? 'text-[#ba1a1a]' : 'text-[#005431]'}`}>
            {trend}
          </span>
        </div>
      </div>
      <div className="w-12 h-12 rounded-2xl bg-[#003fad]/10 text-[#003fad] flex items-center justify-center">
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
    </div>
  );
}
