'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { ArunikaSparkle } from '../../components/ArunikaIcons';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(json.error || 'Username atau password admin salah!');
      }
    } catch (err: any) {
      console.error('Login request error:', err);
      setError('Terjadi kesalahan koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fbff] dark:bg-[#070b15] p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-400/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full rounded-[32px] bg-white dark:bg-slate-900/90 border-2 border-cyan-100 dark:border-cyan-900/40 p-8 sm:p-10 shadow-xl relative z-10 space-y-7">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-block relative w-16 h-16 rounded-3xl p-0.5 bg-gradient-to-tr from-cyan-400 via-sky-500 to-blue-600 shadow-lg shadow-cyan-500/30">
            <div className="w-full h-full rounded-[22px] bg-slate-950 overflow-hidden flex items-center justify-center p-2">
              <Image
                src="/logo.png"
                alt="Arunika Store"
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1.5">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Arunika<span className="text-cyan-500">Store</span>
              </h2>
              <ArunikaSparkle className="w-4 h-4" color="cyan" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
              Admin Control Panel
            </p>
          </div>
        </div>

        {/* Error alert */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-600 text-xs font-bold text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 dark:text-slate-300">
              Username Admin
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username admin"
                autoComplete="username"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-cyan-400 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password admin"
                autoComplete="current-password"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-cyan-400 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm shadow-lg shadow-cyan-500/25 transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Masuk ke Panel...' : 'Masuk ke Dashboard Admin'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="pt-2 text-center">
          <Link
            href="/"
            className="text-xs font-bold text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
          >
            ← Kembali ke Toko Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
