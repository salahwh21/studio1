
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { FilterDefinition } from '@/app/actions/get-orders';
import { Order } from '@/store/orders-store';

interface SearchField {
    key: keyof Order;
    label: string;
    type: 'text' | 'select';
    options?: string[];
}

interface AdvancedSearchProps {
    filters: FilterDefinition[];
    onAddFilter: (filter: FilterDefinition) => void;
    onRemoveFilter: (index: number) => void;
    onGlobalSearchChange: (term: string) => void;
    globalSearchTerm: string;
    searchableFields: SearchField[];
}

export const AdvancedSearch = ({
    filters,
    onAddFilter,
    onRemoveFilter,
    onGlobalSearchChange,
    globalSearchTerm,
    searchableFields,
}: AdvancedSearchProps) => {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [inputValue, setInputValue] = useState(globalSearchTerm);
    const [currentField, setCurrentField] = useState<SearchField | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setInputValue(globalSearchTerm);
    }, [globalSearchTerm])

    useEffect(() => {
        if (currentField && currentField.type === 'text' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [currentField]);

    const handleSelectField = (fieldKey: string) => {
        const field = searchableFields.find(f => f.key === fieldKey);
        if (field) {
            setCurrentField(field);
            setPopoverOpen(false);
        }
    };

    const handleAddTextFilter = () => {
        if (currentField && inputValue) {
            onAddFilter({
                field: currentField.key,
                operator: 'contains', // Simplified for now
                value: inputValue,
            });
            setCurrentField(null);
            setInputValue('');
            onGlobalSearchChange('');
        }
    };

    const handleAddSelectFilter = (value: string) => {
        if (currentField) {
            onAddFilter({
                field: currentField.key,
                operator: 'equals',
                value: value,
            });
            setCurrentField(null);
            setInputValue('');
            onGlobalSearchChange('');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setInputValue(term);
        if (!currentField) {
            onGlobalSearchChange(term);
        }
    }

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <div className="flex items-center gap-2 flex-wrap border border-slate-300 dark:border-slate-700 rounded-xl p-2 min-h-[42px] w-full bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
                <Search className="h-4 w-4 text-orange-500 mx-1 flex-shrink-0" />
                {filters.map((filter, index) => (
                    <Badge 
                        key={index} 
                        variant="secondary" 
                        className="gap-1.5 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 dark:from-orange-900/40 dark:to-orange-900/20 dark:text-orange-400 border border-orange-200 dark:border-orange-800 px-2 py-0.5"
                    >
                        <span className="text-xs font-medium">{searchableFields.find(f => f.key === filter.field)?.label || filter.field}:</span>
                        <span className="text-xs font-semibold">{filter.value}</span>
                        <button onClick={() => onRemoveFilter(index)} className="rounded-full hover:bg-orange-200 dark:hover:bg-orange-800 p-0.5 transition-colors">
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
                <PopoverTrigger asChild>
                    <div className="flex-1 min-w-[200px] flex items-center">
                        {currentField ? (
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded">{currentField.label}:</span>
                                {currentField.type === 'text' ? (
                                    <Input
                                        ref={inputRef}
                                        value={inputValue}
                                        onChange={handleInputChange}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddTextFilter()}
                                        onBlur={() => { if (!inputValue) setCurrentField(null); }}
                                        className="h-7 border-none focus-visible:ring-0 p-1 text-sm"
                                        placeholder="أدخل قيمة..."
                                    />
                                ) : (
                                    <Select onValueChange={handleAddSelectFilter}>
                                        <SelectTrigger className="h-7 border-none focus:ring-0 p-1 w-auto text-muted-foreground text-sm">
                                            <SelectValue placeholder="اختر قيمة..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currentField.options?.map(opt => (
                                                <SelectItem key={opt} value={opt} className="text-sm">{opt}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        ) : (
                            <Input
                                placeholder="بحث شامل... أو اضغط لإضافة فلتر"
                                className="h-7 border-none focus-visible:ring-0 p-1 text-sm placeholder:text-slate-400"
                                value={inputValue}
                                onChange={handleInputChange}
                            />
                        )}
                    </div>
                </PopoverTrigger>
            </div>
            <PopoverContent className="w-[280px] p-0 shadow-xl border-slate-200 dark:border-slate-700" align="start">
                <Command>
                    <CommandInput placeholder="ابحث عن حقل للفلترة..." className="text-sm" />
                    <CommandList>
                        <CommandEmpty className="text-sm py-4 text-center text-slate-500">لم يتم العثور على حقل.</CommandEmpty>
                        <CommandGroup>
                            {searchableFields.map(field => (
                                <CommandItem 
                                    key={field.key} 
                                    onSelect={() => handleSelectField(field.key)}
                                    className="text-sm hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer"
                                >
                                    {field.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
