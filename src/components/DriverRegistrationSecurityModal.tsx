import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  FileCheck2,
  FileWarning,
  Bike,
  User,
  PlusCircle,
  Calendar,
  Building,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Driver, DocumentVerification } from '../types';

export const DriverRegistrationSecurityModal: React.FC = () => {
  const {
    drivers,
    registerNewDriver,
    verifyDriverDocuments,
    currentDriver,
    selectActiveDriver,
    openDeveloperWhatsApp,
    developerWhatsApp,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'LISTA' | 'NUEVO_REGISTRO'>('LISTA');
  const [isVerifying, setIsVerifying] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+57 3');
  const [vehicle, setVehicle] = useState<'Moto Yamaha FZ' | 'Bicicleta Eléctrica' | 'Scooter Pro' | 'Moto Honda CB160'>('Moto Yamaha FZ');
  const [plate, setPlate] = useState('');
  const [soatNumber, setSoatNumber] = useState('');
  const [soatInsurer, setSoatInsurer] = useState('Seguros del Estado S.A.');
  const [soatExpiry, setSoatExpiry] = useState('2027-05-30');
  const [rtmNumber, setRtmNumber] = useState('');
  const [rtmCda, setRtmCda] = useState('CDA AutoCheck Medellín');
  const [rtmExpiry, setRtmExpiry] = useState('2027-04-10');
  const [licNumber, setLicNumber] = useState('');
  const [licCategory, setLicCategory] = useState('A2');
  const [licExpiry, setLicExpiry] = useState('2029-10-15');
  const [formSuccess, setFormSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !plate) return;

    const soatExpired = new Date(soatExpiry) < new Date();
    const rtmExpired = new Date(rtmExpiry) < new Date();
    const licExpired = new Date(licExpiry) < new Date();

    registerNewDriver({
      name,
      phone,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      vehicle,
      plate: plate.toUpperCase(),
      soat: {
        number: soatNumber || `SOAT-${Math.floor(100000 + Math.random() * 900000)}`,
        entity: soatInsurer,
        expiresAt: soatExpiry,
        status: soatExpired ? 'VENCIDO' : 'VIGENTE',
        verifiedAt: new Date().toISOString(),
      },
      tecnomecanica: {
        number: rtmNumber || `RTM-${Math.floor(10000 + Math.random() * 90000)}`,
        entity: rtmCda,
        expiresAt: rtmExpiry,
        status: rtmExpired ? 'VENCIDO' : 'VIGENTE',
        verifiedAt: new Date().toISOString(),
      },
      driverLicense: {
        number: licNumber || `LIC-${Math.floor(1000000 + Math.random() * 9000000)}`,
        entity: `MinTransporte (${licCategory})`,
        expiresAt: licExpiry,
        status: licExpired ? 'VENCIDO' : 'VIGENTE',
        verifiedAt: new Date().toISOString(),
      },
    });

    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setActiveTab('LISTA');
    }, 1500);
  };

  const handleSimulateRuntVerification = (driverId: string) => {
    setIsVerifying(driverId);
    setTimeout(() => {
      verifyDriverDocuments(driverId);
      setIsVerifying(null);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-blue-300 mb-2 border border-blue-400/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Control de Seguridad Vial & RUNT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Verificación de SOAT, Tecnomecánica y Licencia
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Para garantizar la seguridad de los clientes y repartidores, ningún conductor puede
            recibir pedidos si cuenta con su SOAT o revisión técnico-mecánica vencidos.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('NUEVO_REGISTRO')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Nuevo Repartidor</span>
          </button>

          <button
            onClick={() =>
              openDeveloperWhatsApp(
                'Soporte Técnico Repartidores: Consulta sobre validación de SOAT y Tecnomecánica.'
              )
            }
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
          >
            <span>WhatsApp Soporte Técnico ({developerWhatsApp})</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('LISTA')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'LISTA'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Repartidores Registrados ({drivers.length})
        </button>

        <button
          onClick={() => setActiveTab('NUEVO_REGISTRO')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'NUEVO_REGISTRO'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Formulario de Inscripción y Documentos
        </button>
      </div>

      {/* TAB 1: LIST OF DRIVERS & DOCUMENT STATUS */}
      {activeTab === 'LISTA' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {drivers.map((drv) => {
            const isSoatOk = drv.soat.status === 'VIGENTE';
            const isRtmOk = drv.tecnomecanica.status === 'VIGENTE';
            const isLicOk = drv.driverLicense.status === 'VIGENTE';
            const isAllCompliant = isSoatOk && isRtmOk && isLicOk;

            return (
              <div
                key={drv.id}
                className={`bg-white rounded-3xl p-5 border shadow-xs transition-all ${
                  isAllCompliant
                    ? 'border-emerald-200 ring-1 ring-emerald-100'
                    : 'border-red-300 ring-2 ring-red-100'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={drv.avatar}
                      alt={drv.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-base">{drv.name}</h4>
                        {isAllCompliant ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Aprobado RUNT
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <ShieldAlert className="w-3 h-3 text-red-600" />
                            Bloqueado (Doc. Vencido)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {drv.vehicle} • Placa{' '}
                        <span className="font-mono font-bold text-slate-800">{drv.plate}</span> • Tel:{' '}
                        {drv.phone}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => selectActiveDriver(drv.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                  >
                    {drv.id === currentDriver.id ? 'Seleccionado' : 'Usar Perfil'}
                  </button>
                </div>

                {/* Document Status Cards Grid */}
                <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  {/* SOAT */}
                  <div
                    className={`p-3 rounded-2xl border ${
                      isSoatOk
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : 'bg-red-50 border-red-200 text-red-950'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[11px] mb-1">
                      <span>Póliza SOAT</span>
                      {isSoatOk ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      )}
                    </div>
                    <p className="font-mono text-[10px] font-bold truncate">{drv.soat.number}</p>
                    <p className="text-[10px] text-slate-500 truncate">{drv.soat.entity}</p>
                    <div className="mt-1 pt-1 border-t border-slate-200/60 flex justify-between text-[10px]">
                      <span>Vence:</span>
                      <strong className={isSoatOk ? 'text-emerald-700' : 'text-red-700'}>
                        {drv.soat.expiresAt}
                      </strong>
                    </div>
                  </div>

                  {/* Tecnomecánica (RTM) */}
                  <div
                    className={`p-3 rounded-2xl border ${
                      isRtmOk
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : 'bg-red-50 border-red-200 text-red-950'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[11px] mb-1">
                      <span>RTM CDA</span>
                      {isRtmOk ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      )}
                    </div>
                    <p className="font-mono text-[10px] font-bold truncate">
                      {drv.tecnomecanica.number}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {drv.tecnomecanica.entity}
                    </p>
                    <div className="mt-1 pt-1 border-t border-slate-200/60 flex justify-between text-[10px]">
                      <span>Vence:</span>
                      <strong className={isRtmOk ? 'text-emerald-700' : 'text-red-700'}>
                        {drv.tecnomecanica.expiresAt}
                      </strong>
                    </div>
                  </div>

                  {/* Licencia de Conducción */}
                  <div
                    className={`p-3 rounded-2xl border ${
                      isLicOk
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : 'bg-red-50 border-red-200 text-red-950'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[11px] mb-1">
                      <span>Licencia</span>
                      {isLicOk ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      )}
                    </div>
                    <p className="font-mono text-[10px] font-bold truncate">
                      {drv.driverLicense.number}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {drv.driverLicense.entity}
                    </p>
                    <div className="mt-1 pt-1 border-t border-slate-200/60 flex justify-between text-[10px]">
                      <span>Vence:</span>
                      <strong className={isLicOk ? 'text-emerald-700' : 'text-red-700'}>
                        {drv.driverLicense.expiresAt}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Footer validation action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {isAllCompliant
                      ? '✓ Habilitado para entregas con propina 10%'
                      : '⚠️ Debe renovar el documento para ponerse en línea'}
                  </span>

                  <button
                    onClick={() => handleSimulateRuntVerification(drv.id)}
                    disabled={isVerifying === drv.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isVerifying === drv.id ? 'animate-spin' : ''}`}
                    />
                    <span>
                      {isVerifying === drv.id ? 'Consultando RUNT...' : 'Validar / Renovar'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: REGISTER NEW DRIVER WITH DOCUMENTS */}
      {activeTab === 'NUEVO_REGISTRO' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Inscripción de Conductor & Verificación Vehicular
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Ingresa los datos del vehículo para cotejar la vigencia del SOAT, revisión
              técnico-mecánica y licencia de conducir.
            </p>
          </div>

          {formSuccess && (
            <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ¡Repartidor registrado y verificado con éxito! Ya puede conectarse a recibir servicios.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Driver Profile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan David Montoya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Teléfono</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Vehicle & Plate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tipo de Vehículo
                </label>
                <select
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="Moto Yamaha FZ">Moto Yamaha FZ</option>
                  <option value="Moto Honda CB160">Moto Honda CB160</option>
                  <option value="Bicicleta Eléctrica">Bicicleta Eléctrica</option>
                  <option value="Scooter Pro">Scooter Pro</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Placa del Vehículo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. XYZ-42F"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs uppercase font-mono"
                />
              </div>
            </div>

            {/* Document 1: SOAT */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-600" /> 1. Póliza de SOAT Obligatoria
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Número de Póliza
                  </label>
                  <input
                    type="text"
                    placeholder="SOAT-2026-..."
                    value={soatNumber}
                    onChange={(e) => setSoatNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Aseguradora
                  </label>
                  <input
                    type="text"
                    value={soatInsurer}
                    onChange={(e) => setSoatInsurer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    required
                    value={soatExpiry}
                    onChange={(e) => setSoatExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Document 2: Revisión Técnico-Mecánica (RTM) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-blue-600" /> 2. Revisión Técnico-Mecánica (CDA)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Certificado CDA
                  </label>
                  <input
                    type="text"
                    placeholder="RTM-CDA-..."
                    value={rtmNumber}
                    onChange={(e) => setRtmNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Centro de Diagnóstico
                  </label>
                  <input
                    type="text"
                    value={rtmCda}
                    onChange={(e) => setRtmCda(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    required
                    value={rtmExpiry}
                    onChange={(e) => setRtmExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Document 3: Licencia */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-indigo-600" /> 3. Licencia de Conducción
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    N° de Licencia
                  </label>
                  <input
                    type="text"
                    placeholder="LIC-..."
                    value={licNumber}
                    onChange={(e) => setLicNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Categoría
                  </label>
                  <select
                    value={licCategory}
                    onChange={(e) => setLicCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="A2">A2 (Motos & Motociclos)</option>
                    <option value="B1">B1 (Automóviles particulares)</option>
                    <option value="C1">C1 (Servicio público)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    required
                    value={licExpiry}
                    onChange={(e) => setLicExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-md transition-all active:scale-98 text-sm"
            >
              Registrar Repartidor y Validar Documentos
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
