'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center" dir="rtl">
      <h2 className="text-xl font-semibold text-destructive">حدث خطأ غير متوقع</h2>
      <p className="text-sm text-muted-foreground max-w-md">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}
