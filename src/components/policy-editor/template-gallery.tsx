'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { readyTemplates, SavedTemplate } from '@/contexts/SettingsContext';
import { LayoutTemplate, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateGalleryProps {
    onSelect: (template: SavedTemplate) => void;
}

export function TemplateGallery({ onSelect }: TemplateGalleryProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (template: SavedTemplate) => {
        // نمرر نسخة من القالب
        onSelect({ ...template });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200">
                    <LayoutTemplate className="w-4 h-4" />
                    معرض القوالب
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl" style={{ direction: 'rtl' }}>
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <LayoutTemplate className="w-6 h-6 text-indigo-600" />
                        معرض القوالب الجاهزة
                    </DialogTitle>
                    <p className="text-muted-foreground text-sm mt-2">
                        اختر قالباً جاهزاً للبدء. يمكنك تعديله وحفظه كقالب خاص بك.
                    </p>
                </DialogHeader>

                <ScrollArea className="h-[500px] w-full rounded-md border p-4 bg-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {readyTemplates.map((template) => (
                            <div
                                key={template.id}
                                className="group relative flex flex-col justify-between rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-indigo-300 cursor-pointer"
                                onClick={() => handleSelect(template)}
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                                            <LayoutTemplate className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                            {template.paperSize === 'custom'
                                                ? `${template.customDimensions.width}×${template.customDimensions.height}`
                                                : template.paperSize}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                            {template.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                            {template.elements.length} عنصر - {template.isReadyMade ? 'قالب نظام' : 'قالب مخصص'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t flex items-center justify-between">
                                    <span className="text-xs text-gray-400">انقر للاستخدام</span>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full group-hover:bg-indigo-50 group-hover:text-indigo-600">
                                        <Check className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <DialogFooter className="sm:justify-start">
                    <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                        إغلاق
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
