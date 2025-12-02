'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export interface ExportField {
    id: string;
    label: string;
    defaultChecked?: boolean;
}

export interface ExportSettings {
    fields: Record<string, boolean>;
    notes?: string;
    showNotes?: boolean;
    orientation?: 'portrait' | 'landscape';
}

interface ExportSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fields: ExportField[];
    defaultNotes?: string;
    onConfirm: (settings: ExportSettings) => void;
    title?: string;
    description?: string;
}

export const ExportSettingsDialog = ({
    open,
    onOpenChange,
    fields,
    defaultNotes = '',
    onConfirm,
    title = 'إعدادات التصدير',
    description = 'اختر الحقول التي تريد تضمينها في التصدير'
}: ExportSettingsDialogProps) => {
    const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        fields.forEach(field => {
            initial[field.id] = field.defaultChecked !== false;
        });
        return initial;
    });
    const [notes, setNotes] = useState(defaultNotes);
    const [showNotes, setShowNotes] = useState(!!defaultNotes);
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

    const handleToggleField = (fieldId: string) => {
        setSelectedFields(prev => ({
            ...prev,
            [fieldId]: !prev[fieldId]
        }));
    };

    const handleSelectAll = () => {
        const allSelected = fields.every(f => selectedFields[f.id]);
        const newState: Record<string, boolean> = {};
        fields.forEach(field => {
            newState[field.id] = !allSelected;
        });
        setSelectedFields(newState);
    };

    const handleConfirm = () => {
        onConfirm({
            fields: selectedFields,
            notes: notes.trim() || undefined,
            showNotes: showNotes && notes.trim().length > 0,
            orientation
        });
        onOpenChange(false);
    };

    const allSelected = fields.every(f => selectedFields[f.id]);
    const someSelected = fields.some(f => selectedFields[f.id]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl flex flex-col max-h-[85vh]">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto space-y-4 min-h-0 pr-2">
                    <div className="flex items-center justify-between border-b pb-2">
                        <Label className="text-base font-semibold">الحقول المتاحة</Label>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAll}
                        >
                            {allSelected ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                        </Button>
                    </div>
                    <ScrollArea className="h-[250px] border rounded-md p-4">
                        <div className="space-y-3">
                            {fields.map(field => (
                                <div key={field.id} className="flex items-center space-x-2 space-x-reverse">
                                    <Checkbox
                                        id={field.id}
                                        checked={selectedFields[field.id] || false}
                                        onCheckedChange={() => handleToggleField(field.id)}
                                    />
                                    <Label
                                        htmlFor={field.id}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                    >
                                        {field.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <div className="space-y-4 border-t pt-4">
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">اتجاه الصفحة</Label>
                            <RadioGroup value={orientation} onValueChange={(value) => setOrientation(value as 'portrait' | 'landscape')}>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <RadioGroupItem value="portrait" id="portrait" />
                                    <Label htmlFor="portrait" className="cursor-pointer">عمودي (A4)</Label>
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <RadioGroupItem value="landscape" id="landscape" />
                                    <Label htmlFor="landscape" className="cursor-pointer">عرضي (A4)</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <Checkbox
                                    id="show-notes"
                                    checked={showNotes}
                                    onCheckedChange={(checked) => setShowNotes(checked as boolean)}
                                />
                                <Label htmlFor="show-notes" className="text-sm font-medium cursor-pointer">
                                    إضافة ملاحظات
                                </Label>
                            </div>
                            {showNotes && (
                                <Textarea
                                    placeholder="أدخل الملاحظات هنا..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="min-h-[80px]"
                                />
                            )}
                        </div>
                    </div>
                </div>
                <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        إلغاء
                    </Button>
                    <Button 
                        onClick={handleConfirm}
                        disabled={!someSelected}
                    >
                        تأكيد التصدير
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

