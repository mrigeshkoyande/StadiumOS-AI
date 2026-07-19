import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const ScannerView: React.FC = () => {
  const [ticketInput, setTicketInput] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;

    setIsScanning(true);
    setScanResult(null);

    const userStr = localStorage.getItem('stadiumos_user');
    const user = userStr ? JSON.parse(userStr) : { id: 3 };

    try {
      const res = await fetch('/api/tickets/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrToken: ticketInput.trim(),
          ticketId: ticketInput.trim(),
          scannerId: user.id
        })
      });
      const data = await res.json();
      setScanResult(data);
    } catch {
      setScanResult({
        success: false,
        message: 'Network error communicating with SQLite validation backend.'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleQuickDemoScan = (token: string) => {
    setTicketInput(token);
    setTimeout(() => {
      document.getElementById('scan-form-submit')?.click();
    }, 100);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-10 min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center text-[#191c1e]"
    >
      <div className="text-center mb-8">
        <span className="text-xs font-bold text-[#003fad] uppercase tracking-widest block mb-1">
          FIFA World Cup 2026 · Volunteer Portal
        </span>
        <h1 className="font-display text-3xl font-bold text-[#191c1e]">GATE ACCESS SCANNER</h1>
      </div>

      <div className="glass-panel-heavy p-8 rounded-3xl max-w-md w-full shadow-2xl border border-white/60 text-center space-y-6">
        {/* Camera Viewport Simulation */}
        <div className="w-full h-52 bg-[#091c35] rounded-2xl relative overflow-hidden border-2 border-dashed border-[#003fad]/40 flex flex-col items-center justify-center text-white">
          <div className="absolute inset-4 border border-[#003fad]/40 rounded-xl animate-pulse" />
          <span className="material-symbols-outlined text-4xl text-[#003fad] mb-2">qr_code_scanner</span>
          <span className="text-xs font-bold tracking-wider text-slate-300">ALIGN QR CODE WITHIN FRAME</span>
        </div>

        {/* Manual Input Form */}
        <form onSubmit={handleScanSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-[#4e5f7b] uppercase tracking-wider text-left mb-1">
              Manual Token or Ticket ID
            </label>
            <input
              type="text"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              placeholder="e.g. STADIUMOS-WC26-FAN-102F14 or 1"
              className="w-full px-4 py-3 bg-[#f2f4f6] text-xs text-[#191c1e] font-bold rounded-xl outline-none focus:ring-2 focus:ring-[#003fad]"
            />
          </div>

          <button
            id="scan-form-submit"
            type="submit"
            disabled={isScanning || !ticketInput.trim()}
            className="w-full py-3.5 bg-[#003fad] text-white rounded-xl font-bold text-xs shadow-md hover:bg-[#1455d9] transition-all disabled:opacity-50"
          >
            {isScanning ? 'VALIDATING WITH SQL DB...' : 'VALIDATE TICKET'}
          </button>
        </form>

        {/* Quick Preset Buttons for Testing */}
        <div className="pt-2 border-t border-slate-200 text-left">
          <span className="text-[10px] font-bold text-[#4e5f7b] uppercase tracking-wider block mb-2">
            Demo Presets:
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleQuickDemoScan('STADIUMOS-WC26-FAN-102F14')}
              className="flex-1 py-1.5 bg-[#003fad]/10 text-[#003fad] rounded-lg text-[10px] font-bold hover:bg-[#003fad]/20"
            >
              Valid Fan Token
            </button>
            <button
              onClick={() => handleQuickDemoScan('INVALID-TOKEN-999')}
              className="flex-1 py-1.5 bg-[#ba1a1a]/10 text-[#ba1a1a] rounded-lg text-[10px] font-bold hover:bg-[#ba1a1a]/20"
            >
              Invalid Token
            </button>
          </div>
        </div>

        {/* Validation Result Box */}
        {scanResult && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`p-6 rounded-2xl text-left border ${
              scanResult.success 
                ? 'bg-[#005431] text-white border-[#005431]' 
                : 'bg-[#ba1a1a] text-white border-[#ba1a1a]'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-3xl">
                {scanResult.success ? 'check_circle' : 'cancel'}
              </span>
              <div>
                <h3 className="font-display font-bold text-base tracking-tight">{scanResult.message}</h3>
                <p className="text-[10px] opacity-80 uppercase tracking-wider">
                  {scanResult.success ? 'Access Granted' : 'Access Denied'}
                </p>
              </div>
            </div>

            {scanResult.ticket && (
              <div className="mt-3 pt-3 border-t border-white/20 text-xs space-y-1">
                <p><strong>Match:</strong> {scanResult.ticket.match_id}</p>
                <p><strong>Seat:</strong> {scanResult.ticket.seat}</p>
                <p><strong>Gate:</strong> {scanResult.ticket.gate}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
