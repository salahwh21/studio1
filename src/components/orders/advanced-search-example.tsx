'use client';

import { useState } from 'react';
import { AdvancedSearch } from './advanced-search';
import { FilterDefinition } from '@/app/actions/get-orders';
import { Order } from '@/store/orders-store';

// Minimal example of parent component using AdvancedSearch
export function AdvancedSearchExample() {
    // MUST use local useState for filters
    const [filters, setFilters] = useState<FilterDefinition[]>([]);
    const [globalSearch, setGlobalSearch] = useState('');

    // MUST implement onAddFilter to update filters state
    const handleAddFilter = (filter: FilterDefinition) => {
        setFilters(prev => [...prev, filter]);
    };

    // MUST implement onRemoveFilter to update filters state
    const handleRemoveFilter = (index: number) => {
        setFilters(prev => prev.filter((_, i) => i !== index));
    };

    // Example searchable fields
    const searchableFields = [
        { key: 'id' as keyof Order, label: 'رقم الطلب', type: 'text' as const },
        { key: 'recipient' as keyof Order, label: 'المستلم', type: 'text' as const },
        { key: 'phone' as keyof Order, label: 'الهاتف', type: 'text' as const },
        { key: 'merchant' as keyof Order, label: 'التاجر', type: 'select' as const, options: [] },
        { key: 'driver' as keyof Order, label: 'السائق', type: 'select' as const, options: [] },
        { key: 'status' as keyof Order, label: 'الحالة', type: 'select' as const, options: [] },
    ];

    return (
        <div className="p-4">
            <AdvancedSearch
                filters={filters}
                onAddFilter={handleAddFilter}
                onRemoveFilter={handleRemoveFilter}
                onGlobalSearchChange={setGlobalSearch}
                globalSearchTerm={globalSearch}
                searchableFields={searchableFields}
            />
            <div className="mt-4">
                <p>Active filters: {filters.length}</p>
                <pre>{JSON.stringify(filters, null, 2)}</pre>
            </div>
        </div>
    );
}

