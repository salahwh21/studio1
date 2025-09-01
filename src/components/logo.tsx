
'use client';

import { BotMessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContext } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export function Logo({ className }: { className?: string }) {
  const context = useSettings();
  const companyName = context?.settings.login.companyName || 'الوميض';

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <BotMessageSquare className="h-8 w-8 text-primary" />
      <span className="text-xl font-bold text-foreground">
        {companyName}
      </span>
    </div>
  );
}
