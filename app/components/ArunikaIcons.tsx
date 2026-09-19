'use client';

export function ArunikaSparkle({ className = "w-5 h-5", color = "cyan" }: { className?: string; color?: "cyan" | "magenta" | "gradient" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00e5ff" />
          <stop offset="50%" stopColor="#c026d3" />
          <stop offset="100%" stopColor="#ff007f" />
        </linearGradient>
      </defs>
      <path
        d="M12 0C12 7 7 12 0 12C7 12 12 17 12 24C12 17 17 12 24 12C17 12 12 7 12 0Z"
        fill={color === 'cyan' ? '#00e5ff' : color === 'magenta' ? '#ff007f' : 'url(#sparkleGrad)'}
      />
    </svg>
  );
}

export function ArunikaOrbitIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00e5ff" />
          <stop offset="50%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#ff007f" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="6" fill="url(#orbitGrad)" />
      <ellipse
        cx="16"
        cy="16"
        rx="14"
        ry="5"
        stroke="url(#orbitGrad)"
        strokeWidth="2"
        transform="rotate(-25 16 16)"
      />
      <circle cx="28" cy="11" r="2" fill="#00e5ff" />
    </svg>
  );
}

export function ArunikaBadgeStep({ number }: { number: string | number }) {
  return (
    <div className="relative w-10 h-10 shrink-0 rounded-2xl p-0.5 bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-pink-500 shadow-md shadow-cyan-500/20">
      <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center text-white font-black text-base tracking-wider border border-white/20">
        <span className="bg-gradient-to-r from-cyan-300 via-pink-300 to-white bg-clip-text text-transparent">
          {number}
        </span>
      </div>
      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
    </div>
  );
}
