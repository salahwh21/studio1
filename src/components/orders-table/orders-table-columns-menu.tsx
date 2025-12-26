'use client';

import { useState, useEffect } from 'react';
import { ListOrdered, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ALL_COLUMNS } from './orders-table-constants';
import type { ColumnConfig } from '@/components/export-data-dialog';

const COLUMN_SETTINGS_KEY = 'ordersTableColumnSettings';

interface OrdersTableColumnsMenuProps {
  columns?: ColumnConfig[];
  visibleColumnKeys?: string[];
  onColumnsChange?: (columns: ColumnConfig[]) => void;
  onVisibleColumnsChange?: (keys: string[]) => void;
}

export function OrdersTableColumnsMenu({
  columns: externalColumns,
  visibleColumnKeys: externalVisibleKeys,
  onColumnsChange,
  onVisibleColumnsChange,
}: OrdersTableColumnsMenuProps) {
  const [columns, setColumns] = useState<ColumnConfig[]>(externalColumns || ALL_COLUMNS);
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(externalVisibleKeys || ALL_COLUMNS.map(c => c.key));
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedColumnSettings = localStorage.getItem(COLUMN_SETTINGS_KEY);
        if (savedColumnSettings) {
          const { savedColumns, savedVisibleKeys } = JSON.parse(savedColumnSettings);
          if (Array.isArray(savedColumns) && Array.isArray(savedVisibleKeys)) {
            setColumns(savedColumns);
            setVisibleColumnKeys(savedVisibleKeys);
          }
        }
      } catch (e) {
        console.error("Error loading column settings from localStorage:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const settingsToSave = JSON.stringify({ savedColumns: columns, savedVisibleKeys: visibleColumnKeys });
      localStorage.setItem(COLUMN_SETTINGS_KEY, settingsToSave);
    }
    if (onColumnsChange) onColumnsChange(columns);
    if (onVisibleColumnsChange) onVisibleColumnsChange(visibleColumnKeys);
  }, [columns, visibleColumnKeys, onColumnsChange, onVisibleColumnsChange]);

  const handleColumnVisibilityChange = (key: string, checked: boolean) => {
    setVisibleColumnKeys(prev => {
      if (checked) {
        const newKeys = columns.map(c => c.key).filter(k => prev.includes(k) || k === key);
        return newKeys;
      } else {
        return prev.filter(k => k !== key);
      }
    });
  };

  const moveColumn = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const newColumns = [...columns];
    const [movedItem] = newColumns.splice(fromIndex, 1);
    newColumns.splice(toIndex, 0, movedItem);
    
    setColumns(newColumns);
    setVisibleColumnKeys(prev => {
      const newKeys = newColumns.map(c => c.key).filter(k => prev.includes(k));
      return newKeys;
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = draggedIndex;
    if (fromIndex !== null && fromIndex !== toIndex) {
      moveColumn(fromIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <ListOrdered className="h-4 w-4" />
          <span>الأعمدة</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2 max-h-[400px] flex flex-col" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="font-medium text-sm mb-2">إظهار/إخفاء الأعمدة</div>
        <div className='flex items-center gap-2 p-1'>
          <Button variant="link" size="sm" className='h-auto p-1' onClick={() => setVisibleColumnKeys(ALL_COLUMNS.map(c => c.key))}>
            إظهار الكل
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <Button variant="link" size="sm" className='h-auto p-1' onClick={() => setVisibleColumnKeys(['id', 'recipient', 'status'])}>
            إخفاء الكل
          </Button>
        </div>
        <Separator className="my-2" />
        <div className="flex-1 min-h-0 overflow-auto space-y-1">
          {columns.map((column, index) => (
            <div
              key={column.key}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                flex items-center gap-2 p-2 rounded-md bg-background
                ${draggedIndex === index ? 'opacity-50' : ''}
                ${dragOverIndex === index ? 'border-t-2 border-primary' : ''}
                hover:bg-muted cursor-grab
              `}
            >
              <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <Checkbox 
                checked={visibleColumnKeys.includes(column.key)} 
                id={`col-${column.key}`} 
                onCheckedChange={(checked) => handleColumnVisibilityChange(column.key, !!checked)} 
                className="h-4 w-4"
                onClick={(e) => e.stopPropagation()}
              />
              <Label htmlFor={`col-${column.key}`} className="flex-1 cursor-pointer select-none">{column.label}</Label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

