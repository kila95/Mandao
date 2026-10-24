import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  MessageSquare,
  Phone,
  Send,
  AlertTriangle,
  HelpCircle,
  Clock,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SupportAIModal: React.FC = () => {
  const {
    isAIAssistantOpen,
    setIsAIAssistantOpen,
    askSupportAI,
    activeOrder,
    setIsChatOpen,
    startInternalCall,
    openDeveloperWhatsApp,
    developerWhatsApp,
  } = useApp();

  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([
    {
      role: 'ai',
      text: '¡Hola! Soy tu Asistente IA de Soporte Mandao. ¿Tienes algún problema con tu pedido o entrega? Cuéntame y te ayudaré a resolverlo de inmediato.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  if (!isAIAssistantOpen) return null;

  const quickIssues = [
    'El repartidor tarda más de lo previsto',
    'Deseo cambiar las instrucciones de entrega',
    'El pedido llegó incompleto o dañado',
    'No logro comunicarme con el repartidor',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: query }]);
    setInputPrompt('');
    setLoading(true);

    try {
      const response = await askSupportAI(query);
      setMessages((prev) => [...prev, { role: 'ai', text: response.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: 'Lamento el inconveniente. Te sugiero abrir el chat interno con el repartidor o llamar a soporte técnico.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-orange-600 via-amber-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Bot className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-base sm:text-lg">Asistente IA de Soporte</h3>
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  GEMINI
                </span>
              </div>
              <p className="text-xs text-orange-100">
                Resolución inteligente de problemas y mediación en vivo
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAIAssistantOpen(false)}
            className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {/* Action Shortcuts Bar */}
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs gap-2">
          <button
            onClick={() => {
              setIsAIAssistantOpen(false);
              setIsChatOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-orange-400 rounded-xl font-bold text-slate-700 shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
            <span>Chat con Repartidor</span>
          </button>

          <button
            onClick={() => {
              setIsAIAssistantOpen(false);
              startInternalCall('REPARTIDOR');
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-400 rounded-xl font-bold text-slate-700 shadow-2xs"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Llamada Interna</span>
          </button>

          <button
            onClick={() => openDeveloperWhatsApp('Hola desarrollador, necesito soporte técnico con la entrega.')}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-2xs"
            title="WhatsApp directo del desarrollador"
          >
            <span>WhatsApp Soporte</span>
          </button>
        </div>

        {/* Chat Conversation Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-black">
                  AI
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-slate-900 text-white font-medium rounded-tr-none'
                    : 'bg-white border border-slate-200/90 text-slate-800 shadow-2xs rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              <span>La IA está analizando tu solicitud...</span>
            </div>
          )}
        </div>

        {/* Quick Issue Chips */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
          {quickIssues.map((issue, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(issue)}
              className="bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 px-2.5 py-1 rounded-xl text-[11px] font-medium whitespace-nowrap transition-colors shrink-0"
            >
              {issue}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Describe el inconveniente o pregunta..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputPrompt.trim()}
            className="p-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
