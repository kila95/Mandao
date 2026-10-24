import React, { useState } from 'react';
import {
  Landmark,
  ArrowUpRight,
  CheckCircle2,
  TrendingUp,
  Percent,
  Clock,
  ShieldCheck,
  Building,
  CreditCard,
  Receipt,
  Download,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/pricing';

export const BankPayoutModal: React.FC = () => {
  const { bankConfig, updateBankConfig, transferEarningsToBankAccount, orders } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [bankName, setBankName] = useState(bankConfig.bankName);
  const [accountType, setAccountType] = useState(bankConfig.accountType);
  const [accountNumber, setAccountNumber] = useState(bankConfig.accountNumber);
  const [holderName, setHolderName] = useState(bankConfig.holderName);
  const [documentId, setDocumentId] = useState(bankConfig.documentId);
  const [transferAmount, setTransferAmount] = useState<number>(bankConfig.accumulatedBalance);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    updateBankConfig({
      bankName,
      accountType,
      accountNumber,
      holderName,
      documentId,
    });
    setIsEditing(false);
  };

  const handleExecutePayout = () => {
    if (transferAmount <= 0) return;
    const result = transferEarningsToBankAccount(transferAmount);
    if (result.success) {
      setTransferSuccess(
        `¡Transferencia enviada con éxito a ${bankConfig.bankName}! Referencia ACH: ${result.reference}`
      );
      setTransferAmount(0);
      setTimeout(() => setTransferSuccess(null), 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-emerald-300 mb-2 border border-emerald-400/30">
            <Landmark className="w-4 h-4 text-emerald-400" />
            <span>Liquidación Automática de Comisiones (2%)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Ganancias de la Plataforma Directo a tu Cuenta Bancaria
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
            La app retiene automáticamente el <strong>2% de cada domicilio completado</strong>. Los
            fondos se acumulan en tiempo real y son transferidos directamente a tu cuenta bancaria
            vinculada.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-right">
          <span className="text-[11px] text-emerald-200 uppercase font-bold block">
            Saldo Disponible para Retiro
          </span>
          <span className="text-3xl font-black text-emerald-300">
            {formatCurrency(bankConfig.accumulatedBalance)}
          </span>
          <p className="text-[10px] text-emerald-200 mt-0.5">Liquidación instantánea vía ACH</p>
        </div>
      </div>

      {transferSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{transferSuccess}</span>
        </div>
      )}

      {/* Main Grid: Bank Configuration & Quick Transfer Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Linked Bank Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Cuenta Bancaria Receptora
                </h3>
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Vinculada y Verificada para Pagos
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 transition-colors"
            >
              {isEditing ? 'Cancelar Edición' : 'Cambiar Cuenta'}
            </button>
          </div>

          {!isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">
                  Entidad Bancaria
                </span>
                <span className="text-base font-black text-slate-900 mt-0.5 block">
                  {bankConfig.bankName}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Cuenta de {bankConfig.accountType}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">
                  Número de Cuenta
                </span>
                <span className="text-base font-mono font-black text-slate-900 mt-0.5 block">
                  {bankConfig.accountNumber}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Titular: {bankConfig.holderName} ({bankConfig.documentId})
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveBank} className="space-y-3 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Banco</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="Bancolombia">Bancolombia</option>
                    <option value="Nequi">Nequi</option>
                    <option value="Davivienda">Davivienda</option>
                    <option value="Daviplata">Daviplata</option>
                    <option value="BBVA Colombia">BBVA Colombia</option>
                    <option value="Banco de Bogotá">Banco de Bogotá</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tipo de Cuenta
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="Ahorros">Cuenta de Ahorros</option>
                    <option value="Corriente">Cuenta Corriente</option>
                    <option value="Nequi">Billetera Nequi</option>
                    <option value="Daviplata">Daviplata</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Número de Cuenta
                  </label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Titular de la Cuenta
                  </label>
                  <input
                    type="text"
                    required
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Cédula / NIT
                  </label>
                  <input
                    type="text"
                    required
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Guardar Datos Bancarios
              </button>
            </form>
          )}

          {/* Quick Metrics */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Total histórico transferido a tu banco:{' '}
              <strong className="text-slate-900 font-bold">
                {formatCurrency(bankConfig.totalPaidOut)}
              </strong>
            </span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Depósitos Automáticos Activos
            </span>
          </div>
        </div>

        {/* Transfer Action Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-base flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
              Transferir a mi Banco Ahora
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              Envía tus comisiones acumuladas del 2% directamente a tu cuenta bancaria registrada.
            </p>

            <div className="mt-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Monto a Transferir
              </label>
              <div className="text-2xl font-black text-white">
                {formatCurrency(transferAmount)}
              </div>
              <input
                type="range"
                min="0"
                max={bankConfig.accumulatedBalance}
                step="1000"
                value={transferAmount}
                onChange={(e) => setTransferAmount(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>$0</span>
                <span>Máx: {formatCurrency(bankConfig.accumulatedBalance)}</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleExecutePayout}
              disabled={transferAmount <= 0}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-2xl shadow-lg shadow-emerald-500/20 text-xs transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              Transferir {formatCurrency(transferAmount)} a {bankConfig.bankName}
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              Sin costo por transferencia ACH Colombia
            </p>
          </div>
        </div>
      </div>

      {/* Payouts History Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-slate-400" />
          Historial de Transferencias Bancarias Exitosas
        </h3>

        <div className="divide-y divide-slate-100">
          {bankConfig.payoutHistory.map((p) => (
            <div key={p.id} className="py-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <h5 className="font-bold text-slate-900">
                    Depósito Bancario a {bankConfig.bankName}
                  </h5>
                  <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                    Ref: {p.bankReference} • Fecha: {p.date}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-black text-emerald-600 text-sm block">
                  +{formatCurrency(p.amount)}
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Transferido Exitosamente
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
