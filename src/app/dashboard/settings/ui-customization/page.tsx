'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Redirect to the merged fonts-colors page
export default function InterfaceCustomizationPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/settings/fonts-colors');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">جاري التحويل إلى صفحة تخصيص المظهر...</p>
      </div>
    </div>
  );
}
