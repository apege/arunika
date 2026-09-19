'use client';

import { useState, Suspense } from 'react';
import AdminSidebar from './components/AdminSidebar';
import AdminTopnav from './components/AdminTopnav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
