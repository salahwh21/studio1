
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Clipboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CopyableCell = ({ value, children }: { value: string | number, children: React.ReactNode }) => {
    const { toast } = useToast();
    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(String(value));
        toast({ title: "تم النسخ!", description: String(value) });
    };

    return (
        <div className="group relative w-full flex items-center justify-center h-full">
            {children}
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-all bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 shadow-sm rounded border border-slate-200 dark:border-slate-600 z-[5] text-slate-500 dark:text-slate-300"
                onClick={handleCopy}
            >
                <Clipboard className="h-3 w-3" />
            </Button>
        </div>
    );
};
