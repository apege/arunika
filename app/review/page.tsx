'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ReviewRedirectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      router.replace(`/?token=${encodeURIComponent(token)}#testimoni`);
    } else {
      router.replace('/#testimoni');
    }
  }, [token, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-400">Mengalihkan ke formulir testimoni di halaman utama...</p>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
          <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ReviewRedirectContent />
    </Suspense>
  );
}
