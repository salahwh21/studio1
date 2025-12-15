'use client';

import * as React from 'react';
import { useEffect, useCallback } from 'react';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcut {
    keys: string[];
    description: string;
    action: () => void;
    category: 'navigation' | 'selection' | 'actions' | 'general';
}

interface UseKeyboardShortcutsProps {
    shortcuts: Omit<KeyboardShortcut, 'category'>[];
    enabled?: boolean;
}

export const useKeyboardShortcuts = ({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) => {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (!enabled) return;
        
        // Don't trigger shortcuts when typing in inputs
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return;
        }

        for (const shortcut of shortcuts) {
            const keys = shortcut.keys.map(k => k.toLowerCase());
            const pressedKeys: string[] = [];
            
            if (event.ctrlKey || event.metaKey) pressedKeys.push('ctrl');
            if (event.shiftKey) pressedKeys.push('shift');
            if (event.altKey) pressedKeys.push('alt');
            pressedKeys.push(event.key.toLowerCase());

            // Check if all required keys are pressed
            const allKeysMatch = keys.every(k => pressedKeys.includes(k)) && 
                                 pressedKeys.length === keys.length;

            if (allKeysMatch) {
                event.preventDefault();
                shortcut.action();
                break;
            }
        }
    }, [shortcuts, enabled]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
};

// Predefined shortcuts configuration
export const createOrdersTableShortcuts = ({
    onSearch,
    onSelectAll,
    onDeselectAll,
    onDelete,
    onToggleEditMode,
    onNextPage,
    onPrevPage,
    onFirstPage,
    onLastPage,
    onRefresh,
    onExport,
    onPrint,
    onShowHelp,
}: {
    onSearch: () => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onDelete: () => void;
    onToggleEditMode: () => void;
    onNextPage: () => void;
    onPrevPage: () => void;
    onFirstPage: () => void;
    onLastPage: () => void;
    onRefresh: () => void;
    onExport: () => void;
    onPrint: () => void;
    onShowHelp: () => void;
}): Omit<KeyboardShortcut, 'category'>[] => [
    // Search & General
    { keys: ['ctrl', 'f'], description: 'تفعيل البحث', action: onSearch },
    { keys: ['ctrl', 'r'], description: 'تحديث البيانات', action: onRefresh },
    { keys: ['?'], description: 'عرض الاختصارات', action: onShowHelp },
    { keys: ['e'], description: 'تفعيل/إلغاء وضع التعديل', action: onToggleEditMode },
    
    // Selection
    { keys: ['ctrl', 'a'], description: 'تحديد الكل', action: onSelectAll },
    { keys: ['escape'], description: 'إلغاء التحديد', action: onDeselectAll },
    { keys: ['delete'], description: 'حذف المحدد', action: onDelete },
    
    // Navigation
    { keys: ['arrowright'], description: 'الصفحة التالية', action: onNextPage },
    { keys: ['arrowleft'], description: 'الصفحة السابقة', action: onPrevPage },
    { keys: ['ctrl', 'arrowright'], description: 'الصفحة الأخيرة', action: onLastPage },
    { keys: ['ctrl', 'arrowleft'], description: 'الصفحة الأولى', action: onFirstPage },
    
    // Actions
    { keys: ['ctrl', 'e'], description: 'تصدير Excel', action: onExport },
    { keys: ['ctrl', 'p'], description: 'طباعة', action: onPrint },
];

// Keyboard Shortcuts Help Dialog
interface KeyboardShortcutsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const shortcutCategories = [
    {
        id: 'general',
        title: 'عام',
        shortcuts: [
            { keys: ['Ctrl', 'F'], description: 'تفعيل البحث' },
            { keys: ['Ctrl', 'R'], description: 'تحديث البيانات' },
            { keys: ['E'], description: 'تفعيل/إلغاء وضع التعديل' },
            { keys: ['?'], description: 'عرض الاختصارات' },
        ],
    },
    {
        id: 'selection',
        title: 'التحديد',
        shortcuts: [
            { keys: ['Ctrl', 'A'], description: 'تحديد الكل' },
            { keys: ['Esc'], description: 'إلغاء التحديد' },
            { keys: ['Delete'], description: 'حذف المحدد' },
        ],
    },
    {
        id: 'navigation',
        title: 'التنقل',
        shortcuts: [
            { keys: ['→'], description: 'الصفحة التالية' },
            { keys: ['←'], description: 'الصفحة السابقة' },
            { keys: ['Ctrl', '→'], description: 'الصفحة الأخيرة' },
            { keys: ['Ctrl', '←'], description: 'الصفحة الأولى' },
        ],
    },
    {
        id: 'actions',
        title: 'الإجراءات',
        shortcuts: [
            { keys: ['Ctrl', 'E'], description: 'تصدير Excel' },
            { keys: ['Ctrl', 'P'], description: 'طباعة' },
        ],
    },
];

export const KeyboardShortcutsDialog = ({ open, onOpenChange }: KeyboardShortcutsDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Keyboard className="h-5 w-5" />
                        اختصارات لوحة المفاتيح
                    </DialogTitle>
                    <DialogDescription>
                        استخدم هذه الاختصارات للتنقل والعمل بشكل أسرع
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                    {shortcutCategories.map((category) => (
                        <div key={category.id} className="space-y-2">
                            <h4 className="text-sm font-semibold text-muted-foreground">
                                {category.title}
                            </h4>
                            <div className="space-y-1.5">
                                {category.shortcuts.map((shortcut, idx) => (
                                    <div 
                                        key={idx} 
                                        className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors"
                                    >
                                        <span className="text-sm">{shortcut.description}</span>
                                        <div className="flex items-center gap-1">
                                            {shortcut.keys.map((key, keyIdx) => (
                                                <React.Fragment key={keyIdx}>
                                                    <Badge 
                                                        variant="outline" 
                                                        className="px-2 py-0.5 font-mono text-xs bg-muted"
                                                    >
                                                        {key}
                                                    </Badge>
                                                    {keyIdx < shortcut.keys.length - 1 && (
                                                        <span className="text-muted-foreground text-xs">+</span>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Floating hint for keyboard shortcuts
export const KeyboardShortcutHint = () => {
    return (
        <div className="fixed bottom-4 left-4 z-50">
            <Badge 
                variant="outline" 
                className="px-2.5 py-1 bg-background/80 backdrop-blur-sm border-muted-foreground/20 text-muted-foreground text-xs cursor-default"
            >
                <Keyboard className="h-3 w-3 ml-1.5" />
                اضغط <span className="font-mono mx-1 px-1 bg-muted rounded">?</span> للاختصارات
            </Badge>
        </div>
    );
};
