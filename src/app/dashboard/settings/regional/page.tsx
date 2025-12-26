'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Redirect to new location under company settings
export default function RegionalRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/settings/company/regional');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">جاري التحويل...</p>
      </div>
    </div>
  );
}
