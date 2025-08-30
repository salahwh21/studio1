'use client';

import { BotMessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContext } from 'react';
import { LoginExperienceContext } from '@/context/LoginExperienceContext';

export function Logo({ className }: { className?: string }) {
  const context = useContext(LoginExperienceContext);
  const companyName = context?.settings.companyName || 'الوميض';

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <BotMessageSquare className="h-8 w-8 text-primary" />
      <span className="text-xl font-bold text-foreground">
        {companyName}
      </span>
    </div>
  );
}
