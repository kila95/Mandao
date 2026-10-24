import React from 'react';

const MANDAO_LOGO_IMG = '/src/assets/images/mandao_logo_1792810017576.jpg';

interface MandaoLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const MandaoLogo: React.FC<MandaoLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { img: 'w-8 h-8', text: 'text-lg', badge: 'text-[9px]' },
    md: { img: 'w-10 h-10', text: 'text-xl', badge: 'text-[10px]' },
    lg: { img: 'w-14 h-14', text: 'text-2xl', badge: 'text-xs' },
    xl: { img: 'w-20 h-20', text: 'text-4xl', badge: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 rounded-2xl blur-xs opacity-60 group-hover:opacity-100 transition-opacity" />
        <img
          src={MANDAO_LOGO_IMG}
          alt="Mandao Logo"
          className={`${currentSize.img} relative rounded-xl object-cover border border-white/60 shadow-md transform group-hover:scale-105 transition-transform duration-200`}
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black ${currentSize.text} tracking-tight text-slate-900 font-sans`}
            >
              Man<span className="text-orange-600">dao</span>
            </span>
            <span className="text-orange-500 font-black animate-pulse text-base">•</span>
            <span
              className={`font-black px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded-md uppercase tracking-wider ${currentSize.badge}`}
            >
              APP
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 tracking-wide mt-0.5">
            Comida & Envíos en Tiempo Real
          </span>
        </div>
      )}
    </div>
  );
};
