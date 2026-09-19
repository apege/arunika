'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import AdminSidebar from './components/AdminSidebar';
import AdminTopnav from './components/AdminTopnav';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthenticated(true);
      return;
    }

    let isMounted = true;
    fetch('/api/admin/auth/check')
      .then((res) => {
        if (res.ok) {
          if (isMounted) setIsAuthenticated(true);
        } else {
          if (isMounted) {
            setIsAuthenticated(false);
            router.push('/admin/login');
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsAuthenticated(false);
          router.push('/admin/login');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pathname, isLoginPage, router]);

  // If on login page, render children directly without admin layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If verifying session, show clean loading splash
  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#070b15] text-white p-4 space-y-4">
        <div className="relative w-16 h-16 rounded-3xl p-0.5 bg-gradient-to-tr from-cyan-400 via-sky-500 to-blue-600 shadow-xl shadow-cyan-500/30 animate-pulse">
          <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center p-2">
            <Image src="/logo.png" alt="Arunika Store" width={44} height={44} className="object-contain" priority />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Memverifikasi Akses Admin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f8fbff] dark:bg-[#070b15] text-slate-800 dark:text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Sidebar Navigation wrapped in Suspense */}
      <Suspense fallback={<div className="w-72 hidden lg:block bg-white dark:bg-[#070b15] border-r border-cyan-100 dark:border-cyan-900/30" />}>
        <AdminSidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <AdminTopnav
          onToggleMobileMenu={() => setMobileSidebarOpen(true)}
        />

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-7 md:p-8 max-w-7xl w-full mx-auto space-y-6 overflow-x-clip">
          {children}
        </main>
      </div>
    </div>
  );
}

