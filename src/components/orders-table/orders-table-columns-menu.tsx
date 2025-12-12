'use client';

import { useState, useEffect } from 'react';
import { ListOrdered } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { ALL_COLUMNS, type ColumnConfig } from './orders-table-constants';

const COLUMN_SETTINGS_KEY = 'ordersTableColumnSettings';

const SortableColumn = ({ id, label, onToggle, isVisible }: { id: string; label: string; onToggle: (id: string, checked: boolean) => void; isVisible: boolean; }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: transform ? CSS.Transform.toString(transform) : undefined, transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
    >
      <GripVertical {...attributes} {...listeners} className="h-5 w-5 cursor-grab text-muted-foreground" />
      <Checkbox checked={isVisible} id={`col-${id}`} onCheckedChange={(checked) => onToggle(id, !!checked)} className="h-4 w-4" />
      <Label htmlFor={`col-${id}`} className="flex-1 cursor-pointer">{label}</Label>
    </div>
  );
};

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
  const sensors = useSensors(useSensor(PointerSensor));

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
    setVisibleColumnKeys(prev =>
      checked ? [...new Set([...prev, key])] : prev.filter(k => k !== key)
    );
  };

  const handleColumnDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setColumns((currentColumns) => {
        const oldIndex = currentColumns.findIndex(c => c.key === active.id);
        const newIndex = currentColumns.findIndex(c => c.key === over.id);
        return arrayMove(currentColumns, oldIndex, newIndex);
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <ListOrdered className="h-4 w-4" />
          <span>الأعمدة</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2 max-h-[400px] flex flex-col">
        <DropdownMenuLabel>إظهار/إخفاء الأعمدة</DropdownMenuLabel>
        <div className='flex items-center gap-2 p-1'>
          <Button variant="link" size="sm" className='h-auto p-1' onClick={() => setVisibleColumnKeys(ALL_COLUMNS.map(c => c.key))}>
            إظهار الكل
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <Button variant="link" size="sm" className='h-auto p-1' onClick={() => setVisibleColumnKeys(['id', 'recipient', 'status'])}>
            إخفاء الكل
          </Button>
        </div>
        <DropdownMenuSeparator />
        <div className="flex-1 min-h-0 overflow-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleColumnDragEnd}>
            <SortableContext items={columns.map(c => c.key)} strategy={verticalListSortingStrategy}>
              {ALL_COLUMNS.map((column) => (
                <SortableColumn
                  key={column.key}
                  id={column.key}
                  label={column.label}
                  isVisible={visibleColumnKeys.includes(column.key)}
                  onToggle={handleColumnVisibilityChange}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

