'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FilterDefinition, Order } from './types';

const SEARCHABLE_FIELDS: { key: keyof Order; label: string; type: 'text' | 'select', options?: string[] }[] = [
  { key: 'id', label: 'رقم الطلب', type: 'text' },
  { key: 'referenceNumber', label: 'الرقم المرجعي', type: 'text' },
  { key: 'recipient', label: 'المستلم', type: 'text' },
  { key: 'phone', label: 'الهاتف', type: 'text' },
  { key: 'address', label: 'العنوان', type: 'text' },
  { key: 'status', label: 'الحالة', type: 'select', options: [] },
  { key: 'driver', label: 'السائق', type: 'select', options: [] },
  { key: 'merchant', label: 'التاجر', type: 'select', options: [] },
  { key: 'city', label: 'المدينة', type: 'text' },
  { key: 'region', label: 'المنطقة', type: 'text' },
  { key: 'date', label: 'التاريخ', type: 'text' },
];

interface AdvancedSearchProps {
  filters: FilterDefinition[];
  onAddFilter: (filter: FilterDefinition) => void;
  onRemoveFilter: (index: number) => void;
  onGlobalSearchChange: (term: string) => void;
  globalSearchTerm: string;
  searchableFieldsWithOptions?: typeof SEARCHABLE_FIELDS;
}

export function AdvancedSearch({
  filters,
  onAddFilter,
  onRemoveFilter,
  onGlobalSearchChange,
  globalSearchTerm,
  searchableFieldsWithOptions = SEARCHABLE_FIELDS,
}: AdvancedSearchProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [inputValue, setInputValue] = useState(globalSearchTerm);
  const [currentField, setCurrentField] = useState<(typeof searchableFieldsWithOptions)[number] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(globalSearchTerm);
  }, [globalSearchTerm]);

  useEffect(() => {
    if (currentField && currentField.type === 'text' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentField]);

  const handleSelectField = (fieldKey: string) => {
    const field = searchableFieldsWithOptions.find(f => f.key === fieldKey);
    if (field) {
      setCurrentField(field);
      setPopoverOpen(false);
    }
  };

  const handleAddTextFilter = () => {
    if (currentField && inputValue) {
      onAddFilter({
        field: currentField.key,
        operator: 'contains',
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
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <div className="flex items-center gap-2 flex-wrap border rounded-lg p-1.5 min-h-[40px] w-full max-w-lg bg-background">
        <Search className="h-4 w-4 text-muted-foreground mx-1" />
        {filters.map((filter, index) => (
          <Badge key={index} variant="secondary" className="gap-1.5">
            {searchableFieldsWithOptions.find(f => f.key === filter.field)?.label || filter.field}: {filter.value}
            <button onClick={() => onRemoveFilter(index)} className="rounded-full hover:bg-background/50">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <PopoverTrigger asChild>
          <div className="flex-1 min-w-[200px] flex items-center">
            {currentField ? (
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">{currentField.label}:</span>
                {currentField.type === 'text' ? (
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTextFilter()}
                    onBlur={() => { if (!inputValue) setCurrentField(null); }}
                    className="h-7 border-none focus-visible:ring-0 p-1"
                    placeholder="أدخل قيمة..."
                  />
                ) : (
                  <Select onValueChange={handleAddSelectFilter}>
                    <SelectTrigger className="h-7 border-none focus:ring-0 p-1 w-auto text-muted-foreground">
                      <SelectValue placeholder="اختر قيمة..." />
                    </SelectTrigger>
                    <SelectContent>
                      {currentField.options?.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ) : (
              <Input
                placeholder="بحث شامل أو إضافة فلتر..."
                className="h-7 border-none focus-visible:ring-0 p-1"
                value={inputValue}
                onChange={handleInputChange}
              />
            )}
          </div>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder="ابحث عن حقل للفلترة..." />
          <CommandList>
            <CommandEmpty>لم يتم العثور على حقل.</CommandEmpty>
            <CommandGroup>
              {searchableFieldsWithOptions.map(field => (
                <CommandItem key={field.key} onSelect={() => handleSelectField(field.key)}>
                  {field.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

