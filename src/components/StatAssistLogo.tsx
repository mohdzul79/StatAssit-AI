import React from 'react';

interface StatAssistLogoProps {
  variant?: 'full-banner' | 'emblem-only' | 'compact' | 'horizontal-sm';
  className?: string;
  animated?: boolean;
}

export const StatAssistLogo: React.FC<StatAssistLogoProps> = ({
  variant = 'full-banner',
  className = '',
  animated = true,
}) => {
  // SVG Emblem matching the shield in the picture
  const renderShieldEmblem = (size: 'sm' | 'md' | 'lg' = 'lg') => {
    const dimensions = {
      sm: { width: 36, height: 42 },
      md: { width: 64, height: 76 },
      lg: { width: 140, height: 165 },
    }[size];

    return (
      <div className={`relative shrink-0 select-none ${animated ? 'transition-transform duration-300 hover:scale-105' : ''}`}>
        {/* Ambient neon backglow */}
        {animated && (
          <div
            className="absolute inset-0 rounded-2xl bg-cyan-500/20 blur-xl pointer-events-none animate-pulse"
            style={{ animationDuration: '4s' }}
          />
        )}

        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox="0 0 140 165"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative drop-shadow-[0_0_15px_rgba(6,182,212,0.45)]"
        >
          <defs>
            {/* Outer shield gradient */}
            <linearGradient id="shieldBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00e5ff" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            {/* Inner shield background */}
            <linearGradient id="shieldBgGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#0e1726" />
              <stop offset="50%" stopColor="#080e1a" />
              <stop offset="100%" stopColor="#04070e" />
            </linearGradient>

            {/* Blue curve fill */}
            <linearGradient id="curveFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
            </linearGradient>

            {/* Histogram bars gradient */}
            <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>

            {/* Golden Star Glow */}
            <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#fef08a" />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer Shield Hexagon Path */}
          <path
            d="M70 4 L126 24 L126 98 C126 130 96 150 70 160 C44 150 14 130 14 98 L14 24 Z"
            fill="url(#shieldBgGrad)"
            stroke="url(#shieldBorderGrad)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Inner Accent Ring */}
          <path
            d="M70 11 L120 28 L120 95 C120 124 93 142 70 151 C47 142 20 124 20 95 L20 28 Z"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="1"
            strokeOpacity="0.5"
          />

          {/* Background Grid Pattern Lines */}
          <line x1="28" y1="55" x2="112" y2="55" stroke="#1e293b" strokeWidth="0.75" strokeDasharray="2 2" />
          <line x1="28" y1="80" x2="112" y2="80" stroke="#1e293b" strokeWidth="0.75" strokeDasharray="2 2" />
          <line x1="28" y1="105" x2="112" y2="105" stroke="#1e293b" strokeWidth="0.75" strokeDasharray="2 2" />

          {/* Histogram Bars (Left Side) */}
          <rect x="28" y="98" width="8" height="20" rx="1.5" fill="url(#barGrad)" opacity="0.85" />
          <rect x="39" y="80" width="8" height="38" rx="1.5" fill="url(#barGrad)" opacity="0.9" />
          <rect x="50" y="60" width="8" height="58" rx="1.5" fill="url(#barGrad)" opacity="0.95" />
          <rect x="61" y="44" width="8" height="74" rx="1.5" fill="url(#barGrad)" />

          {/* Center Vertical Axis Line to Apex */}
          <line x1="70" y1="36" x2="70" y2="118" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />

          {/* Left-to-Right Normal Distribution Bell Curve (Filled) */}
          <path
            d="M26 118 Q52 116 63 60 Q70 36 70 36 Q70 36 77 60 Q88 116 114 118 L114 118 L26 118 Z"
            fill="url(#curveFillGrad)"
          />

          {/* Bell Curve Stroke Line */}
          <path
            d="M26 118 Q52 116 63 60 Q70 36 70 36 Q70 36 77 60 Q88 116 114 118"
            fill="none"
            stroke="#00e5ff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Right Side: Horizontal Statistical Feature Lines (Emerald Green) */}
          <line x1="77" y1="62" x2="104" y2="62" stroke="#10b981" strokeWidth="3" strokeLinecap="round" opacity="0.95" />
          <line x1="77" y1="74" x2="112" y2="74" stroke="#10b981" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
          <line x1="77" y1="86" x2="100" y2="86" stroke="#10b981" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
          <line x1="77" y1="98" x2="92" y2="98" stroke="#10b981" strokeWidth="3" strokeLinecap="round" opacity="0.75" />

          {/* Green Regression Line & Node Circles */}
          <line x1="70" y1="36" x2="108" y2="92" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 2" />
          <circle cx="108" cy="92" r="3.5" fill="#080e1a" stroke="#10b981" strokeWidth="2" />
          <circle cx="61" cy="95" r="3" fill="#080e1a" stroke="#38bdf8" strokeWidth="2" />

          {/* Golden 4-point Apex Star with Radiant Lens Flare */}
          <g className={animated ? 'animate-pulse' : ''} style={{ transformOrigin: '70px 36px' }}>
            {/* Halo Glow */}
            <circle cx="70" cy="36" r="16" fill="url(#starGlow)" opacity="0.8" />
            <circle cx="70" cy="36" r="8" fill="#fef08a" opacity="0.9" />

            {/* Lens flare cross rays */}
            <line x1="48" y1="36" x2="92" y2="36" stroke="#fef08a" strokeWidth="1.5" opacity="0.85" />
            <line x1="70" y1="14" x2="70" y2="58" stroke="#fef08a" strokeWidth="1.5" opacity="0.85" />
            <line x1="56" y1="22" x2="84" y2="50" stroke="#fef08a" strokeWidth="0.75" opacity="0.6" />
            <line x1="56" y1="50" x2="84" y2="22" stroke="#fef08a" strokeWidth="0.75" opacity="0.6" />

            {/* Central Bright Diamond */}
            <path
              d="M70 28 L72.5 34.5 L79 36 L72.5 37.5 L70 44 L67.5 37.5 L61 36 L67.5 34.5 Z"
              fill="#ffffff"
            />
          </g>

          {/* Tiny accent spark on the right */}
          <circle cx="105" cy="46" r="1.5" fill="#34d399" opacity="0.9" />

          {/* Baseline Ground Line */}
          <line x1="24" y1="118" x2="116" y2="118" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />

          {/* Bottom Badge: HDPA ★ r=1.0 */}
          <g>
            <rect
              x="36"
              y="126"
              width="68"
              height="18"
              rx="9"
              fill="#080e1a"
              stroke="#0ea5e9"
              strokeWidth="1.5"
            />
            <text
              x="70"
              y="138.5"
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="8.5"
              fontFamily="monospace"
              fontWeight="bold"
              letterSpacing="0.5"
            >
              HDPA ★ r=1.0
            </text>
          </g>
        </svg>
      </div>
    );
  };

  // 1. Emblem Only
  if (variant === 'emblem-only') {
    return <div className={`inline-flex items-center ${className}`}>{renderShieldEmblem('lg')}</div>;
  }

  // 2. Compact / Navbar representation
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        {renderShieldEmblem('sm')}
        <div className="flex items-center">
          <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
            StatAssist
          </span>
          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[11px] font-black tracking-wider bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-xs">
            AI
          </span>
        </div>
      </div>
    );
  }

  // 3. Horizontal Small
  if (variant === 'horizontal-sm') {
    return (
      <div className={`flex items-center gap-3.5 ${className}`}>
        {renderShieldEmblem('md')}
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono tracking-wider font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            HYBRID DETERMINISTIC-PROBABILISTIC AI
          </div>
          <div className="flex items-center">
            <span className="text-2xl font-black tracking-tight text-white">StatAssist</span>
            <span className="ml-2 px-2 py-0.5 rounded-lg text-sm font-black tracking-wider bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-xs">
              AI
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 4. Default: Full Hero Brand Banner (Exact match to the provided image)
  return (
    <div
      className={`relative w-full max-w-4xl mx-auto rounded-2xl p-6 sm:p-8 bg-[#070c18] border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden ${className}`}
    >
      {/* Background ambient decorative grid lines */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 50%, rgba(6,182,212,0.2) 0%, transparent 60%), linear-gradient(rgba(14,165,233,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.15) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 28px 28px, 28px 28px',
        }}
      />

      {/* Main banner row: Shield Emblem + Brand Info */}
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center gap-6 sm:gap-8">
        {/* Left: Shield Emblem with Bell Curve & Golden Star */}
        <div className="shrink-0 flex items-center justify-center">
          {renderShieldEmblem('lg')}
        </div>

        {/* Right: Brand Typography & Pillars */}
        <div className="flex-1 text-center md:text-left space-y-3.5">
          {/* Primary Wordmark Title */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-sans drop-shadow-md">
              StatAssist
            </h1>
            <span className="px-3 py-1 sm:px-3.5 sm:py-1 rounded-xl text-lg sm:text-xl lg:text-2xl font-black tracking-wider bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.5)] border border-cyan-200/50">
              AI
            </span>
          </div>

          {/* Accent Horizontal Gradient Underline */}
          <div className="h-1 w-full max-w-xl rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]" />

          {/* Subtitle / Tagline */}
          <p className="text-sm sm:text-base font-medium text-slate-200 tracking-wide">
            Non-Hallucinating Statistical Computation & Pedagogical Scaffolding
          </p>

          {/* Bottom Three Characteristic Pills */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-2.5 pt-1">
            <div className="px-3 py-1 rounded-lg text-xs font-mono font-medium text-cyan-300 bg-cyan-950/50 border border-cyan-500/40 flex items-center gap-1.5 shadow-2xs hover:border-cyan-400 transition-colors">
              <span className="text-cyan-400 font-bold">✓</span>
              <span>FSM Logic Router</span>
            </div>
            <div className="px-3 py-1 rounded-lg text-xs font-mono font-medium text-emerald-300 bg-emerald-950/50 border border-emerald-500/40 flex items-center gap-1.5 shadow-2xs hover:border-emerald-400 transition-colors">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Zero-Retention RAM</span>
            </div>
            <div className="px-3 py-1 rounded-lg text-xs font-mono font-medium text-amber-300 bg-amber-950/50 border border-amber-500/40 flex items-center gap-1.5 shadow-2xs hover:border-amber-400 transition-colors">
              <span className="text-amber-400 font-bold">✓</span>
              <span>APA 7th Output</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
