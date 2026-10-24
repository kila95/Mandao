import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Phone,
  Send,
  User,
  Bike,
  ShieldCheck,
  CheckCheck,
  Bot,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const InternalChatModal: React.FC = () => {
  const {
    isChatOpen,
    setIsChatOpen,
    chatMessages,
    sendChatMessage,
    activeOrder,
    startInternalCall,
    user,
    currentDriver,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [rolePerspective, setRolePerspective] = useState<'CLIENTE' | 'REPARTIDOR'>('CLIENTE');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  if (!isChatOpen) return null;

  const quickChips = [
    'Ya estoy en portería esperándote',
    'Por favor timbrar en el apto 402',
    'Dejar con el guardia de seguridad',
    '¿En cuántos minutos llegas aprox?',
    'El ascensor está funcionando',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;
    sendChatMessage(text, rolePerspective);
    setInputText('');
  };

  const driverName = activeOrder?.driverName || currentDriver.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[82vh]">
        {/* Chat Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={
                  activeOrder?.driverAvatar ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                }
                alt="Repartidor"
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400"
              />
              <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 absolute bottom-0 right-0" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-sm">{driverName}</h4>
                <span className="text-[10px] bg-emerald-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                  Repartidor
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Pedido {activeOrder?.id || 'ACTIVO'} • En camino
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Start In-app Internal Phone Call */}
            <button
              onClick={() => {
                setIsChatOpen(false);
                startInternalCall(rolePerspective === 'CLIENTE' ? 'REPARTIDOR' : 'CLIENTE');
              }}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1 text-xs font-bold"
              title="Iniciar llamada telefónica interna en la app"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Llamar</span>
            </button>

            <button
              onClick={() => setIsChatOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Perspective Switcher (Allows testing both sides) */}
        <div className="bg-slate-100 px-4 py-1.5 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 font-medium">Estás respondiendo como:</span>
          <div className="flex gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setRolePerspective('CLIENTE')}
              className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition-colors ${
                rolePerspective === 'CLIENTE'
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cliente ({user.name.split(' ')[0]})
            </button>
            <button
              onClick={() => setRolePerspective('REPARTIDOR')}
              className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition-colors ${
                rolePerspective === 'REPARTIDOR'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Repartidor ({driverName.split(' ')[0]})
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {chatMessages.map((msg) => {
            const isMe = msg.senderRole === rolePerspective;
            const isSupport = msg.senderRole === 'IA_SOPORTE';

            if (isSupport) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl px-3.5 py-2 text-xs text-amber-900 max-w-[90%] text-center font-medium shadow-2xs">
                    <span className="font-bold flex items-center justify-center gap-1 text-[11px] text-amber-800 mb-0.5">
                      <Bot className="w-3.5 h-3.5" /> Mandao Bot
                    </span>
                    {msg.text}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-slate-400 font-medium px-1 mb-0.5">
                  {msg.senderName} • {msg.timestamp}
                </span>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-orange-600 text-white font-medium rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Chips */}
        <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700 px-3 py-1 rounded-xl text-[11px] font-medium whitespace-nowrap transition-colors shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder={`Escribe un mensaje como ${
              rolePerspective === 'CLIENTE' ? 'Cliente' : 'Repartidor'
            }...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="p-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
