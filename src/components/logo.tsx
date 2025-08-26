
import { BotMessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <BotMessageSquare className="h-10 w-10 text-primary" />
      <span className="text-3xl font-bold text-foreground">
        الوميض
      </span>
    </div>
  );
}
