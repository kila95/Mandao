import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  Globe,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Building,
  KeyRound,
  Laptop,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MandaoLogo } from '../MandaoLogo';

interface AdminAuthPanelProps {
  onSuccess?: () => void;
  isModal?: boolean;
}

export const AdminAuthPanel: React.FC<AdminAuthPanelProps> = ({ onSuccess, isModal = false }) => {
  const {
    registerAdmin,
    loginAdmin,
    setIsAdminAuthModalOpen,
    openDeveloperWhatsApp,
    developerWhatsApp,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Registration Form
  const [regName, setRegName] = useState('Esteban Ochoa Mesa');
  const [regEmail, setRegEmail] = useState('estebanochoamesa@gmail.com');
  const [regPhone, setRegPhone] = useState('+57 310 305 6071');
  const [regPin, setRegPin] = useState('1234');

  // Login Form
  const [loginEmail, setLoginEmail] = useState('estebanochoamesa@gmail.com');
  const [loginPin, setLoginPin] = useState('1234');
  const [showPin, setShowPin] = useState(false);

  // Status & Error
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regName.trim() || !regEmail.trim()) {
      setErrorMsg('Por favor completa todos los campos requeridos.');
      return;
    }

    if (!regEmail.includes('@') || !regEmail.includes('.')) {
      setErrorMsg('Ingresa un correo electrónico corporativo válido.');
      return;
    }

    registerAdmin({
      name: regName,
      email: regEmail,
      phone: regPhone,
      pin: regPin,
    });

    setSuccessMsg('¡Cuenta de administrador registrada exitosamente! Abriendo panel de control...');
    if (onSuccess) onSuccess();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!loginEmail.trim()) {
      setErrorMsg('Ingresa tu correo de administrador.');
      return;
    }

    const res = loginAdmin(loginEmail, loginPin);
    if (res.success) {
      setSuccessMsg(res.message);
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleQuickMasterLogin = () => {
    const res = loginAdmin('estebanochoamesa@gmail.com', '1234');
    if (res.success) {
      setSuccessMsg('Sesión iniciada con credenciales maestras autorizadas.');
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div className={`w-full ${isModal ? 'max-w-xl mx-auto' : 'max-w-2xl mx-auto my-8 px-4'}`}>
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-2 text-xs font-bold text-amber-300">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Acceso Exclusivo Web Autorizado</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700">
              <Laptop className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Web Engine • Host Seguro</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MandaoLogo size="md" />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Panel de Administrador <span className="text-orange-500">Mandao</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Regístrate o inicia sesión con tu cuenta de administrador para acceder a las métricas confidenciales.
              </p>
            </div>
          </div>

          {/* Web-only security badge indicator */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Entorno Web Verificado (ais-dev-*.run.app)
            </span>
            <span className="hidden sm:inline">Propietario: Esteban Ochoa Mesa</span>
          </div>
        </div>

        {/* Quick One-Click Owner Login Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200/80 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-black shadow-md shadow-orange-500/20 shrink-0">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  Acceso Maestro Pre-configurado
                </h4>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                  Propietario
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Esteban Ochoa Mesa • <span className="font-mono font-bold text-slate-800">estebanochoamesa@gmail.com</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleQuickMasterLogin}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 shrink-0"
          >
            <span>Entrar con mi Cuenta</span>
            <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('LOGIN');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'LOGIN'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4 text-orange-500" />
            <span>Iniciar Sesión Admin</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('REGISTER');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'REGISTER'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Registrarme como Administrador</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-700 font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'LOGIN' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico de Administrador
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ej: estebanochoamesa@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white outline-hidden"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Usa tu cuenta autorizada para acceder a métricas de facturación e ingresos del 2%.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  PIN o Clave de Seguridad
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    placeholder="Clave maestra (por defecto: 1234)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white outline-hidden pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md shadow-orange-600/20 transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Ingresar al Panel Administrativo</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Esteban Ochoa Mesa"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono Celular / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+57 310 305 6071"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico de Administrador
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="estebanochoamesa@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Definir PIN / Contraseña de Seguridad Maestra
                </label>
                <input
                  type="password"
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value)}
                  placeholder="ej: 1234"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white outline-hidden"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>Plataforma Web Exclusiva:</strong> Al registrarte tendrás control total sobre
                  el 2% de ganancias por domicilio, auditoría de pedidos y validación de SOAT de repartidores.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Registrarme y Ver Información Administrativa</span>
              </button>
            </form>
          )}

          {/* Direct WhatsApp Tech Assistance for Admin */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>¿Requieres soporte para tu cuenta?</span>
            <button
              type="button"
              onClick={() =>
                openDeveloperWhatsApp('Hola Esteban, requiero soporte de acceso de administrador en Mandao.')
              }
              className="font-bold text-emerald-600 hover:text-emerald-700 underline"
            >
              WhatsApp Desarrollador: {developerWhatsApp}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
