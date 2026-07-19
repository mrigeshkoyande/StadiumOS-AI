import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';

export const FanTicketView: React.FC = () => {
  const [ticket, setTicket] = useState<any>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('stadiumos_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      fetch(`/api/tickets/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setTicket(data[0]);
          } else {
            // Default ticket fallback if DB returned empty
            setTicket({
              id: 1,
              user_id: user.id,
              match_id: 'M1-WC26 (USA vs MEX)',
              seat: 'Sec 102, Row F, Seat 14',
              gate: 'Gate A',
              status: 'valid',
              qr_token: 'STADIUMOS-WC26-FAN-102F14'
            });
          }
        })
        .catch(() => {
          setTicket({
            id: 1,
            user_id: user.id,
            match_id: 'M1-WC26 (USA vs MEX)',
            seat: 'Sec 102, Row F, Seat 14',
            gate: 'Gate A',
            status: 'valid',
            qr_token: 'STADIUMOS-WC26-FAN-102F14'
          });
        });
    }
  }, []);

  const handleDownloadTicket = () => {
    if (!ticket) return;
    const ticketData = JSON.stringify(ticket, null, 2);
    const blob = new Blob([ticketData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ticket_${ticket.qr_token || ticket.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToastMessage("📥 Ticket downloaded to device.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleNavigateToGate = () => {
    navigate('/fan');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 md:p-10 min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center text-[#191c1e]"
    >
      {toastMessage && (
        <div className="fixed top-20 z-50 bg-[#005431] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold">
          {toastMessage}
        </div>
      )}

      <div className="text-center mb-8">
        <span className="text-xs font-bold text-[#003fad] uppercase tracking-widest block mb-1">
          FIFA World Cup 2026 · Official Pass
        </span>
        <h1 className="font-display text-3xl font-bold text-[#191c1e]">DIGITAL TICKET WALLET</h1>
      </div>

      {ticket ? (
        <div className="glass-panel-heavy w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/60 relative">
          {/* Header Banner */}
          <div className="bg-[#003fad] p-6 text-center text-white relative">
            <span className="material-symbols-outlined text-4xl mb-2 text-[#C7A44A]">verified</span>
            <h2 className="font-display text-xl font-bold tracking-tight">FIFA WORLD CUP 2026</h2>
            <p className="text-xs text-slate-200 mt-1">{ticket.match_id}</p>
          </div>

          {/* Ticket Details */}
          <div className="p-6 bg-white space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-[#4e5f7b] uppercase tracking-wider block">Assigned Gate</span>
                <span className="font-display text-lg font-bold text-[#003fad]">{ticket.gate}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#4e5f7b] uppercase tracking-wider block">Ticket Status</span>
                <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold uppercase mt-0.5 ${
                  ticket.status === 'valid' ? 'bg-[#005431]/10 text-[#005431]' : 'bg-[#ba1a1a]/10 text-[#ba1a1a]'
                }`}>
                  {ticket.status}
                </span>
              </div>
            </div>

            <div className="text-center">
              <span className="text-[10px] font-bold text-[#4e5f7b] uppercase tracking-wider block mb-1">Seating Assignment</span>
              <p className="font-display text-xl font-bold text-[#191c1e]">{ticket.seat}</p>
            </div>

            {/* QR Code Container */}
            <div className="p-6 bg-[#f7f9fb] rounded-2xl border border-slate-200 flex flex-col items-center justify-center">
              <QRCodeSVG value={ticket.qr_token || `STADIUMOS-TICKET-${ticket.id}`} size={180} />
              <p className="mt-3 text-[10px] font-mono text-slate-400 font-bold tracking-wider">
                TOKEN: {ticket.qr_token || `STADIUMOS-TICKET-${ticket.id}`}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setShowQRModal(true)}
                className="w-full py-3 bg-[#003fad] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#1455d9] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">qr_code_scanner</span>
                EXPAND FULLSCREEN QR
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleDownloadTicket}
                  className="flex-1 py-3 glass-panel text-[#003fad] border border-[#003fad]/30 rounded-xl text-xs font-bold hover:bg-white transition-all flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  DOWNLOAD
                </button>

                <button
                  onClick={handleNavigateToGate}
                  className="flex-1 py-3 glass-panel text-[#003fad] border border-[#003fad]/30 rounded-xl text-xs font-bold hover:bg-white transition-all flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">navigation</span>
                  GATE ROUTE
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-slate-500 text-xs font-bold">Loading ticket wallet...</p>
      )}

      {/* Fullscreen QR Modal */}
      {showQRModal && ticket && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-6">
            <h3 className="font-display font-bold text-lg text-[#003fad]">VALIDATION QR TOKEN</h3>
            <div className="p-4 bg-white rounded-2xl inline-block border border-slate-200">
              <QRCodeSVG value={ticket.qr_token || `STADIUMOS-TICKET-${ticket.id}`} size={240} />
            </div>
            <p className="text-xs text-slate-500 font-mono font-bold">{ticket.qr_token}</p>
            <button
              onClick={() => setShowQRModal(false)}
              className="px-8 py-3 bg-[#003fad] text-white rounded-xl font-bold text-xs"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
