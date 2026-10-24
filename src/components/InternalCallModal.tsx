import React from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ShieldCheck,
  User,
  Bike,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const InternalCallModal: React.FC = () => {
  const {
    callState,
    endInternalCall,
    toggleMuteCall,
    toggleSpeakerCall,
    setIsChatOpen,
    openDeveloperWhatsApp,
    developerWhatsApp,
  } = useApp();

  if (!callState.isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isConnected = callState.status === 'CONNECTED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-black text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/80 flex flex-col items-center justify-between min-h-[460px] overflow-hidden">
        {/* Top Encryption / In-App VoIP Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] text-emerald-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Llamada Interna Cifrada Mandao</span>
        </div>

        {/* Center Caller Profile & Animated Radar */}
        <div className="flex flex-col items-center text-center my-6 space-y-3">
          <div className="relative">
            {/* Pulsing ring animation */}
            <div
              className={`absolute -inset-3 rounded-full opacity-30 ${
                isConnected
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-amber-400 animate-ping duration-1000'
              }`}
            />
            <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 overflow-hidden flex items-center justify-center shadow-2xl relative z-10">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                alt="Caller"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-black text-white tracking-tight">
              {callState.callerName || 'Carlos Mario Restrepo'}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {callState.callerRole === 'REPARTIDOR' ? 'Repartidor Asignado' : 'Cliente Final'} •{' '}
              {callState.callerPhone || '+57 301 555 9210'}
            </p>
          </div>

          {/* Status / Timer */}
          <div className="pt-1">
            {isConnected ? (
              <span className="font-mono text-lg font-bold text-emerald-400 tracking-wider">
                {formatTimer(callState.durationSeconds)}
              </span>
            ) : (
              <span className="text-xs font-semibold text-amber-300 animate-pulse">
                Marcando llamada interna...
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="w-full space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {/* Mute */}
            <button
              onClick={toggleMuteCall}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                callState.isMuted
                  ? 'bg-red-500/20 border-red-500 text-red-400'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {callState.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span className="text-[10px] font-bold mt-1">
                {callState.isMuted ? 'Silenciado' : 'Mudo'}
              </span>
            </button>

            {/* Speaker */}
            <button
              onClick={toggleSpeakerCall}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                callState.isSpeaker
                  ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {callState.isSpeaker ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
              <span className="text-[10px] font-bold mt-1">Altavoz</span>
            </button>

            {/* Switch to Chat */}
            <button
              onClick={() => {
                endInternalCall();
                setIsChatOpen(true);
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-all"
            >
              <MessageSquare className="w-5 h-5 text-orange-400" />
              <span className="text-[10px] font-bold mt-1">Chat</span>
            </button>
          </div>

          {/* End Call Button */}
          <button
            onClick={endInternalCall}
            className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-transform active:scale-95 cursor-pointer"
          >
            <PhoneOff className="w-5 h-5" />
            <span>Colgar Llamada</span>
          </button>

          {/* Direct WhatsApp Tech Support notice */}
          <button
            onClick={() =>
              openDeveloperWhatsApp(
                `Soporte Mandao: Dificultad para contactar al repartidor en la llamada interna.`
              )
            }
            className="w-full text-center text-[11px] text-slate-400 hover:text-emerald-400 transition-colors block underline"
          >
            ¿Problemas de conexión? Contactar al Desarrollador en WhatsApp ({developerWhatsApp})
          </button>
        </div>
      </div>
    </div>
  );
};
