
import { BotMessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <BotMessageSquare className="h-8 w-8 text-primary" />
      <span className="text-xl font-bold text-foreground">
        الوميض
      </span>
    </div>
  );
}
