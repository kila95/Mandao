import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminAuthPanel } from './AdminAuthPanel';

export const AdminAuthModal: React.FC = () => {
  const { isAdminAuthModalOpen, setIsAdminAuthModalOpen } = useApp();

  if (!isAdminAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl">
        <button
          onClick={() => setIsAdminAuthModalOpen(false)}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition-colors"
          title="Cerrar modal de autenticación"
        >
          <X className="w-5 h-5" />
        </button>

        <AdminAuthPanel onSuccess={() => setIsAdminAuthModalOpen(false)} isModal={true} />
      </div>
    </div>
  );
};
