'use client';

import { ArunikaSparkle } from './ArunikaIcons';

export default function FloatingParticles() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {/* High impact cyan and magenta ambient neon orbs */}
      <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-cyan-400/15 rounded-full blur-[100px]" />
      <div className="absolute top-1/4 -right-32 w-[30rem] h-[30rem] bg-fuchsia-600/15 rounded-full blur-[110px]" />
      <div className="absolute top-2/3 -left-20 w-[28rem] h-[28rem] bg-cyan-500/12 rounded-full blur-[90px]" />
      <div className="absolute -bottom-24 right-1/4 w-[34rem] h-[34rem] bg-pink-500/15 rounded-full blur-[120px]" />

      {/* Cyber Grid Subtle Lines Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00e5ff0a_1px,transparent_1px),linear-gradient(to_bottom,#ff007f0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Signature 4-pointed sparkle stars from Arunika logo */}
      <div className="absolute top-28 left-[8%] animate-twinkle">
        <ArunikaSparkle className="w-7 h-7" color="cyan" />
      </div>
      <div className="absolute top-44 right-[10%] animate-twinkle [animation-delay:1.5s]">
        <ArunikaSparkle className="w-8 h-8" color="magenta" />
      </div>
      <div className="absolute top-[38%] left-[4%] animate-twinkle [animation-delay:0.8s]">
        <ArunikaSparkle className="w-5 h-5" color="gradient" />
      </div>
      <div className="absolute top-[62%] right-[6%] animate-twinkle [animation-delay:2.1s]">
        <ArunikaSparkle className="w-7 h-7" color="cyan" />
      </div>
      <div className="absolute top-[82%] left-[12%] animate-twinkle [animation-delay:1.2s]">
        <ArunikaSparkle className="w-6 h-6" color="magenta" />
      </div>
      <div className="absolute top-[15%] left-[48%] animate-twinkle [animation-delay:2.7s]">
        <ArunikaSparkle className="w-4 h-4" color="cyan" />
      </div>
      <div className="absolute top-[70%] left-[52%] animate-twinkle [animation-delay:1.8s]">
        <ArunikaSparkle className="w-5 h-5" color="gradient" />
      </div>
    </div>
  );
}
