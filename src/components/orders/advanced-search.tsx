
import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Filter, ListTree, ChevronRight, ChevronDown, Calendar, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DatePickerPro } from '@/components/ui/date-picker-pro';
import { FilterDefinition } from '@/app/actions/get-orders';
import { Order } from '@/store/orders-store';
import { GroupByOption } from './types';

interface SearchField {
    key: keyof Order;
    label: string;
    type: 'text' | 'select' | 'date';
    options?: string[];
    canGroupBy?: boolean;
}

// خيارات التجميع حسب التاريخ
export type DateGroupOption = 'day' | 'week' | 'month' | 'year';

// الحقول الرئيسية للفلترة
const FILTER_FIELDS: SearchField[] = [
    { key: 'merchant', label: 'التاجر', type: 'select', options: [], canGroupBy: true },
    { key: 'status', label: 'الحالة', type: 'select', options: [], canGroupBy: true },
    { key: 'driver', label: 'السائق', type: 'select', options: [], canGroupBy: true },
    { key: 'city', label: 'المدينة', type: 'select', options: [], canGroupBy: true },
    { key: 'region', label: 'المنطقة', type: 'select', options: [], canGroupBy: true },
    { key: 'date', label: 'التاريخ', type: 'date', canGroupBy: true },
];

// خيارات تجميع التاريخ
const DATE_GROUP_OPTIONS: { value: DateGroupOption; label: string }[] = [
    { value: 'day', label: 'يومياً' },
    { value: 'week', label: 'أسبوعياً' },
    { value: 'month', label: 'شهرياً' },
    { value: 'year', label: 'سنوياً' },
];

// واجهة الفلتر المحفوظ
interface SavedFilter {
    id: string;
    name: string;
    filters: FilterDefinition[];
    groupBy?: GroupByOption;
    groupByLevels?: GroupByOption[];
    dateGroupBy?: DateGroupOption;
}

// مفتاح التخزين المحلي
const SAVED_FILTERS_KEY = 'orders-saved-filters';

interface AdvancedSearchProps {
    filters: FilterDefinition[];
    onAddFilter: (filter: FilterDefinition) => void;
    onRemoveFilter: (index: number) => void;
    onGlobalSearchChange: (term: string) => void;
    globalSearchTerm: string;
    searchableFields: SearchField[];
    groupBy?: GroupByOption;
    onGroupByChange?: (option: GroupByOption) => void;
    groupByLevels?: GroupByOption[];
    onAddGroupByLevel?: (option: GroupByOption) => void;
    onRemoveGroupByLevel?: (index: number) => void;
    dateGroupBy?: DateGroupOption;
    onDateGroupByChange?: (option: DateGroupOption | null) => void;
}

export const AdvancedSearch = ({
    filters,
    onAddFilter,
    onRemoveFilter,
    onGlobalSearchChange,
    globalSearchTerm,
    searchableFields,
    groupBy,
    onGroupByChange,
    groupByLevels = [],
    onAddGroupByLevel,
    onRemoveGroupByLevel,
    dateGroupBy: externalDateGroupBy,
    onDateGroupByChange,
}: AdvancedSearchProps) => {
    const [inputValue, setInputValue] = useState(globalSearchTerm);
    const [currentField, setCurrentField] = useState<SearchField | null>(null);
    const [viewMode, setViewMode] = useState<'search' | 'filter-list' | 'filter-action' | 'filter-value' | 'date-filter'>('search');
    const [optionsSearch, setOptionsSearch] = useState('');
    const [optionsOpen, setOptionsOpen] = useState(false);
    const [dateGroupOpen, setDateGroupOpen] = useState(false);
    const [savedFiltersOpen, setSavedFiltersOpen] = useState(false);
    const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
    const [newFilterName, setNewFilterName] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [internalDateGroupBy, setInternalDateGroupBy] = useState<DateGroupOption | null>(null);
    const dateGroupBy = externalDateGroupBy ?? internalDateGroupBy;
    const setDateGroupBy = (val: DateGroupOption | null) => {
        setInternalDateGroupBy(val);
        onDateGroupByChange?.(val);
    };
    const [animatingBadges, setAnimatingBadges] = useState<Set<number>>(new Set());
    
    const inputRef = useRef<HTMLInputElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const optionsSearchRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // تحميل الفلاتر المحفوظة من localStorage
    useEffect(() => {
        const saved = localStorage.getItem(SAVED_FILTERS_KEY);
        if (saved) {
            try {
                setSavedFilters(JSON.parse(saved));
            } catch (e) {
                console.error('Error loading saved filters:', e);
            }
        }
    }, []);

    // دمج الحقول مع الخيارات الديناميكية
    const filterFields = FILTER_FIELDS.map(field => {
        const dynamicField = searchableFields.find(f => f.key === field.key);
        return {
            ...field,
            options: dynamicField?.options || field.options,
        };
    });

    // الحصول على الحقل الحالي مع الخيارات المحدثة
    const currentFieldWithOptions = currentField 
        ? filterFields.find(f => f.key === currentField.key) || currentField
        : null;

    // فلترة الخيارات حسب البحث
    const filteredOptions = currentFieldWithOptions?.options?.filter(opt => 
        opt.toLowerCase().includes(optionsSearch.toLowerCase())
    ) || [];

    // البحث عن تطابقات في خيارات الفلاتر أثناء الكتابة في البحث الشامل
    const matchingSuggestions = React.useMemo(() => {
        if (!inputValue.trim() || viewMode !== 'search') return [];
        
        const searchTerm = inputValue.toLowerCase().trim();
        const matches: { field: SearchField; value: string; exactMatch: boolean }[] = [];
        
        filterFields.forEach(field => {
            if (field.options && field.options.length > 0) {
                field.options.forEach(option => {
                    const optionLower = option.toLowerCase();
                    if (optionLower.includes(searchTerm) || searchTerm.includes(optionLower)) {
                        matches.push({
                            field,
                            value: option,
                            exactMatch: optionLower === searchTerm
                        });
                    }
                });
            }
        });
        
        // ترتيب: التطابق الكامل أولاً، ثم حسب طول النص
        return matches.sort((a, b) => {
            if (a.exactMatch && !b.exactMatch) return -1;
            if (!a.exactMatch && b.exactMatch) return 1;
            return a.value.length - b.value.length;
        }).slice(0, 5); // أقصى 5 اقتراحات
    }, [inputValue, viewMode, filterFields]);

    useEffect(() => {
        setInputValue(globalSearchTerm);
    }, [globalSearchTerm]);

    useEffect(() => {
        if (viewMode === 'filter-value' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [viewMode]);

    useEffect(() => {
        if (optionsOpen && optionsSearchRef.current) {
            optionsSearchRef.current.focus();
        }
    }, [optionsOpen]);

    // إغلاق القائمة عند النقر خارجها
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (viewMode !== 'search') {
                    resetToSearch();
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [viewMode]);

    // أنيميشن عند إضافة فلتر جديد
    const triggerAddAnimation = useCallback((index: number) => {
        setAnimatingBadges(prev => new Set(prev).add(index));
        setTimeout(() => {
            setAnimatingBadges(prev => {
                const next = new Set(prev);
                next.delete(index);
                return next;
            });
        }, 300);
    }, []);

    const resetToSearch = () => {
        setViewMode('search');
        setCurrentField(null);
        setOptionsSearch('');
        setOptionsOpen(false);
        setDateFrom('');
        setDateTo('');
    };

    const handleFilterClick = () => {
        setViewMode(viewMode === 'filter-list' ? 'search' : 'filter-list');
    };

    const handleSelectField = (fieldKey: string) => {
        const field = filterFields.find(f => f.key === fieldKey);
        if (field) {
            setCurrentField(field);
            if (field.type === 'date') {
                setViewMode('date-filter');
            } else {
                setViewMode('filter-action');
            }
            setOptionsSearch('');
        }
    };

    const handleGroupBy = () => {
        if (currentField) {
            const fieldKey = currentField.key as GroupByOption;
            // إذا كان الحقل موجود بالفعل في مستويات التجميع، لا نضيفه مرة أخرى
            if (groupByLevels.includes(fieldKey)) {
                resetToSearch();
                return;
            }
            // إضافة مستوى تجميع جديد
            if (onAddGroupByLevel) {
                onAddGroupByLevel(fieldKey);
            } else if (onGroupByChange) {
                onGroupByChange(fieldKey);
            }
            resetToSearch();
        }
    };

    const handleDateGroupBy = (option: DateGroupOption) => {
        setDateGroupBy(option);
        // إضافة التاريخ كمستوى تجميع جديد
        if (!groupByLevels.includes('date' as GroupByOption)) {
            if (onAddGroupByLevel) {
                onAddGroupByLevel('date' as GroupByOption);
            } else if (onGroupByChange) {
                onGroupByChange('date' as GroupByOption);
            }
        }
        setDateGroupOpen(false);
        resetToSearch();
    };

    const handleEnterValue = () => {
        setViewMode('filter-value');
    };

    const handleAddAsFilter = () => {
        // عند الضغط على Enter، نثبت البحث كفلتر شامل
        if (inputValue.trim()) {
            onAddFilter({
                field: '_global' as keyof Order,
                operator: 'contains',
                value: inputValue.trim(),
            });
            triggerAddAnimation(filters.length);
            setInputValue('');
            onGlobalSearchChange('');
            // إعادة التركيز لحقل البحث للاستمرار في الكتابة
            setTimeout(() => searchInputRef.current?.focus(), 50);
        }
    };

    const handleAddTextFilter = () => {
        if (currentField && inputValue) {
            onAddFilter({
                field: currentField.key,
                operator: 'contains',
                value: inputValue,
            });
            triggerAddAnimation(filters.length);
            resetToSearch();
            setInputValue('');
            onGlobalSearchChange('');
        }
    };

    // إضافة اقتراح كفلتر محدد
    const handleAddSuggestion = (field: SearchField, value: string) => {
        onAddFilter({
            field: field.key,
            operator: 'equals',
            value: value,
        });
        triggerAddAnimation(filters.length);
        setInputValue('');
        onGlobalSearchChange('');
        // إعادة التركيز لحقل البحث للاستمرار في الكتابة
        setTimeout(() => searchInputRef.current?.focus(), 50);
    };

    const handleAddSelectFilter = (value: string) => {
        if (currentField) {
            // حفظ الحقل الحالي قبل إعادة التعيين
            const fieldKey = currentField.key;
            
            // إضافة الفلتر
            onAddFilter({
                field: fieldKey,
                operator: 'equals',
                value: value,
            });
            
            // تشغيل الأنيميشن
            triggerAddAnimation(filters.length);
            
            // إغلاق القائمة أولاً
            setOptionsOpen(false);
            
            // ثم إعادة التعيين بعد تأخير قصير
            setTimeout(() => {
                setViewMode('search');
                setCurrentField(null);
                setOptionsSearch('');
                setInputValue('');
                onGlobalSearchChange('');
            }, 50);
        }
    };

    const handleAddDateFilter = () => {
        if (dateFrom || dateTo) {
            const dateValue = dateFrom && dateTo 
                ? `${dateFrom} - ${dateTo}` 
                : dateFrom || dateTo;
            onAddFilter({
                field: 'date',
                operator: 'contains',
                value: dateValue,
            });
            triggerAddAnimation(filters.length);
            resetToSearch();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setInputValue(term);
        
        // البحث الشامل يعمل أثناء الكتابة
        if (viewMode === 'search') {
            onGlobalSearchChange(term);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            if (viewMode === 'filter-value' && currentField) {
                handleAddTextFilter();
            } else if (viewMode === 'search') {
                // إذا كان هناك تطابق كامل مع قيمة فلتر، اختره
                const exactMatch = matchingSuggestions.find(s => s.exactMatch);
                if (exactMatch) {
                    handleAddSuggestion(exactMatch.field, exactMatch.value);
                } else if (matchingSuggestions.length === 1) {
                    // إذا كان هناك اقتراح واحد فقط، اختره
                    handleAddSuggestion(matchingSuggestions[0].field, matchingSuggestions[0].value);
                } else {
                    // وإلا أضفه كبحث شامل
                    handleAddAsFilter();
                }
            }
        }
        if (e.key === 'Escape') {
            resetToSearch();
            setInputValue('');
            onGlobalSearchChange('');
        }
        // Backspace على حقل فارغ يحذف آخر فلتر
        if (e.key === 'Backspace' && !inputValue) {
            if (filters.length > 0) {
                onRemoveFilter(filters.length - 1);
            } else if (groupByLevels.length > 0 && onRemoveGroupByLevel) {
                onRemoveGroupByLevel(groupByLevels.length - 1);
            }
        }
    };

    const clearAllFilters = () => {
        for (let i = filters.length - 1; i >= 0; i--) {
            onRemoveFilter(i);
        }
        // مسح كل مستويات التجميع
        while (groupByLevels.length > 0) {
            onRemoveGroupByLevel?.(groupByLevels.length - 1);
        }
        setDateGroupBy(null);
    };

    const clearGroupBy = () => {
        if (onGroupByChange) {
            onGroupByChange(null);
        }
        setDateGroupBy(null);
    };

    // حذف مستوى تجميع محدد
    const removeGroupLevel = (index: number) => {
        if (onRemoveGroupByLevel) {
            onRemoveGroupByLevel(index);
            // إذا كان المستوى المحذوف هو التاريخ، امسح dateGroupBy أيضاً
            if (groupByLevels[index] === 'date') {
                setDateGroupBy(null);
            }
        }
    };

    // حفظ الفلاتر الحالية
    const saveCurrentFilters = () => {
        if (!newFilterName.trim()) {
            // تنبيه المستخدم لإدخال اسم
            alert('الرجاء إدخال اسم للفلتر');
            return;
        }
        if (filters.length === 0 && groupByLevels.length === 0) {
            alert('الرجاء إضافة فلاتر أو تجميعات أولاً');
            return;
        }
        
        const newSavedFilter: SavedFilter = {
            id: Date.now().toString(),
            name: newFilterName.trim(),
            filters: [...filters],
            groupByLevels: [...groupByLevels],
            dateGroupBy: dateGroupBy || undefined,
        };
        
        const updated = [...savedFilters, newSavedFilter];
        setSavedFilters(updated);
        localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
        setNewFilterName('');
        setSavedFiltersOpen(false);
    };

    // تطبيق فلتر محفوظ
    const applySavedFilter = (saved: SavedFilter) => {
        // مسح الفلاتر الحالية
        clearAllFilters();
        
        // تطبيق الفلاتر المحفوظة
        saved.filters.forEach((filter, index) => {
            setTimeout(() => {
                onAddFilter(filter);
                triggerAddAnimation(index);
            }, index * 100);
        });
        
        // تطبيق التجميعات المتعددة
        if (saved.groupByLevels && saved.groupByLevels.length > 0) {
            saved.groupByLevels.forEach((level, index) => {
                setTimeout(() => {
                    onAddGroupByLevel?.(level);
                }, index * 100);
            });
        } else if (saved.groupBy && onAddGroupByLevel) {
            // للتوافق مع الفلاتر المحفوظة القديمة
            onAddGroupByLevel(saved.groupBy);
        }
        
        if (saved.dateGroupBy) {
            setDateGroupBy(saved.dateGroupBy);
        }
        
        setSavedFiltersOpen(false);
        resetToSearch();
    };

    // حذف فلتر محفوظ
    const deleteSavedFilter = (id: string) => {
        const updated = savedFilters.filter(f => f.id !== id);
        setSavedFilters(updated);
        localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
    };

    return (
        <div className="w-full" ref={containerRef}>
            {/* صندوق البحث الموحد */}
            <div className="flex items-center gap-2 w-full min-h-[48px] px-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-orange-300 dark:hover:border-orange-700 focus-within:border-orange-500 transition-all duration-300 overflow-x-auto">
                <Search className="h-5 w-5 text-orange-500 flex-shrink-0" />
                
                {/* زر الفلتر مع عداد */}
                <button 
                    onClick={handleFilterClick}
                    className={`p-1.5 rounded-lg flex-shrink-0 transition-all duration-200 relative ${viewMode !== 'search' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400 scale-110' : 'hover:bg-orange-50 dark:hover:bg-orange-900/30 text-orange-500 hover:scale-105'}`}
                    title="فلتر متقدم"
                >
                    <Filter className="h-4 w-4" />
                    {filters.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
                            {filters.length}
                        </span>
                    )}
                </button>

                {/* زر الفلاتر المحفوظة */}
                <Popover open={savedFiltersOpen} onOpenChange={setSavedFiltersOpen}>
                    <PopoverTrigger asChild>
                        <button 
                            className={`p-1.5 rounded-lg flex-shrink-0 transition-all duration-200 relative ${savedFiltersOpen ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400 scale-110' : 'hover:bg-yellow-50 dark:hover:bg-yellow-900/30 text-yellow-500 hover:scale-105'}`}
                            title="الفلاتر المحفوظة"
                        >
                            <Star className={`h-4 w-4 ${savedFilters.length > 0 ? 'fill-current' : ''}`} />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[320px] p-0 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 shadow-xl border-slate-200 dark:border-slate-700" align="start">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 border-b border-slate-100 dark:border-slate-800 rounded-t-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                                    <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <h4 className="font-semibold text-slate-700 dark:text-slate-200">الفلاتر المحفوظة</h4>
                            </div>
                            {/* حفظ الفلاتر الحالية */}
                            {(filters.length > 0 || groupByLevels.length > 0) ? (
                                <div className="flex gap-2">
                                    <input
                                        value={newFilterName}
                                        onChange={(e) => setNewFilterName(e.target.value)}
                                        placeholder="اسم الفلتر الجديد..."
                                        className="flex-1 h-9 px-3 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 dark:focus:ring-yellow-900/30 transition-all"
                                        onKeyDown={(e) => e.key === 'Enter' && saveCurrentFilters()}
                                    />
                                    <Button 
                                        size="sm" 
                                        onClick={saveCurrentFilters} 
                                        className="h-9 px-4 bg-yellow-500 hover:bg-yellow-600 text-white transition-all hover:scale-105 shadow-sm"
                                    >
                                        <Star className="h-3.5 w-3.5 ml-1" />
                                        حفظ
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-500 dark:text-slate-400">أضف فلاتر أو تجميعات أولاً لتتمكن من حفظها</p>
                            )}
                        </div>
                        {/* قائمة الفلاتر المحفوظة */}
                        <div className="max-h-[280px] overflow-y-auto">
                            {savedFilters.length > 0 ? (
                                <div className="p-2 space-y-1">
                                    {savedFilters.map((saved, idx) => (
                                        <div 
                                            key={saved.id} 
                                            className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/20 dark:hover:to-orange-900/20 transition-all duration-200 animate-in fade-in slide-in-from-right cursor-pointer border border-transparent hover:border-yellow-200 dark:hover:border-yellow-800"
                                            style={{ animationDelay: `${idx * 50}ms` }}
                                        >
                                            {/* أيقونة */}
                                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/50 transition-colors">
                                                <Filter className="h-4 w-4 text-slate-500 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors" />
                                            </div>
                                            {/* المعلومات */}
                                            <button
                                                onClick={() => applySavedFilter(saved)}
                                                className="flex-1 min-w-0 text-right"
                                            >
                                                <p className="font-medium text-sm text-slate-700 dark:text-slate-200 truncate group-hover:text-yellow-700 dark:group-hover:text-yellow-400 transition-colors">
                                                    {saved.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                                                        {saved.filters.length} فلتر
                                                    </span>
                                                    {saved.groupBy && (
                                                        <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded">
                                                            تجميع
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                            {/* زر الحذف */}
                                            <button
                                                onClick={() => deleteSavedFilter(saved.id)}
                                                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-all hover:scale-110"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 px-4">
                                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                                        <Star className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center">لا توجد فلاتر محفوظة</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-1">أضف فلاتر واحفظها للوصول السريع</p>
                                </div>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* عرض قائمة الفلاتر في نفس السطر */}
                {viewMode === 'filter-list' && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                        {filterFields.map((field, idx) => (
                            <button
                                key={field.key}
                                onClick={() => handleSelectField(field.key)}
                                className={`px-2.5 py-1 text-sm rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0 flex items-center gap-1 hover:scale-105 animate-in fade-in slide-in-from-bottom ${field.type === 'date' ? 'bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400' : 'bg-slate-50 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400'}`}
                                style={{ animationDelay: `${idx * 30}ms` }}
                            >
                                {field.type === 'date' && <Calendar className="h-3 w-3" />}
                                {field.label}
                            </button>
                        ))}
                        <button onClick={resetToSearch} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0 transition-all hover:scale-110 hover:rotate-90">
                            <X className="h-4 w-4 text-slate-400" />
                        </button>
                    </div>
                )}

                {/* فلتر التاريخ */}
                {viewMode === 'date-filter' && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                        <button onClick={() => setViewMode('filter-list')} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0 transition-all hover:scale-110">
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                        </button>
                        <Calendar className="h-4 w-4 text-purple-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400 whitespace-nowrap flex-shrink-0">التاريخ:</span>
                        
                        {/* قائمة التجميع حسب الوقت */}
                        <Popover open={dateGroupOpen} onOpenChange={setDateGroupOpen} modal={false}>
                            <PopoverTrigger asChild>
                                <button type="button" className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200 whitespace-nowrap flex-shrink-0 hover:scale-105">
                                    <ListTree className="h-3 w-3" />
                                    {dateGroupBy ? DATE_GROUP_OPTIONS.find(o => o.value === dateGroupBy)?.label || 'تجميع' : 'تجميع'}
                                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${dateGroupOpen ? 'rotate-180' : ''}`} />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[150px] p-1 animate-in fade-in-0 zoom-in-95" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                                {DATE_GROUP_OPTIONS.map((opt) => (
                                    <div
                                        key={opt.value}
                                        role="button"
                                        tabIndex={0}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            setDateGroupBy(opt.value);
                                            if (onGroupByChange) {
                                                onGroupByChange('date' as GroupByOption);
                                            }
                                            setDateGroupOpen(false);
                                        }}
                                        className={`w-full text-right px-3 py-2 text-sm rounded-lg transition-all duration-150 cursor-pointer ${dateGroupBy === opt.value ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                    >
                                        {opt.label}
                                    </div>
                                ))}
                            </PopoverContent>
                        </Popover>

                        {/* حقول التاريخ - في الشريط مباشرة */}
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-500">من</span>
                            <DatePickerPro
                                value={dateFrom}
                                onChange={setDateFrom}
                                placeholder="البداية"
                            />
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-500">إلى</span>
                            <DatePickerPro
                                value={dateTo}
                                onChange={setDateTo}
                                placeholder="النهاية"
                            />
                        </div>
                        
                        {(dateFrom || dateTo) && (
                            <button
                                onClick={handleAddDateFilter}
                                className="px-2 py-1 text-xs rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-all duration-200 whitespace-nowrap flex-shrink-0"
                            >
                                تطبيق
                            </button>
                        )}

                        <button onClick={resetToSearch} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0 transition-all hover:scale-110 hover:rotate-90">
                            <X className="h-4 w-4 text-slate-400" />
                        </button>
                    </div>
                )}

                {/* عرض خيارات الفلتر المحدد في نفس السطر */}
                {viewMode === 'filter-action' && currentField && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                        <button onClick={() => setViewMode('filter-list')} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0 transition-all hover:scale-110">
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                        </button>
                        <span className="text-sm font-medium text-orange-600 dark:text-orange-400 whitespace-nowrap flex-shrink-0">{currentField.label}:</span>
                        
                        {/* زر التجميع */}
                        {currentField.canGroupBy && onGroupByChange && (
                            <button
                                onClick={handleGroupBy}
                                className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200 whitespace-nowrap flex-shrink-0 hover:scale-105"
                            >
                                <ListTree className="h-3 w-3" />
                                تجميع
                            </button>
                        )}

                        {/* زر البحث بقيمة للحقول النصية */}
                        {currentField.type === 'text' && (
                            <button
                                onClick={handleEnterValue}
                                className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-all duration-200 whitespace-nowrap flex-shrink-0 hover:scale-105"
                            >
                                <Search className="h-3 w-3" />
                                بحث
                            </button>
                        )}

                        {/* قائمة منسدلة مع بحث للحقول من نوع select */}
                        {currentField.type === 'select' && currentFieldWithOptions?.options && currentFieldWithOptions.options.length > 0 && (
                            <Popover open={optionsOpen} onOpenChange={setOptionsOpen} modal={false}>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-all duration-200 whitespace-nowrap flex-shrink-0 hover:scale-105"
                                    >
                                        اختر قيمة
                                        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${optionsOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[220px] p-0 animate-in fade-in-0 zoom-in-95" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                                    {/* حقل البحث في القائمة */}
                                    <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                                        <div className="relative">
                                            <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                            <input
                                                ref={optionsSearchRef}
                                                value={optionsSearch}
                                                onChange={(e) => setOptionsSearch(e.target.value)}
                                                className="w-full h-8 pr-8 pl-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 outline-none focus:border-orange-400 transition-colors"
                                                placeholder="بحث..."
                                            />
                                        </div>
                                    </div>
                                    {/* قائمة الخيارات */}
                                    <div className="max-h-[200px] overflow-y-auto p-1">
                                        {filteredOptions.length > 0 ? (
                                            filteredOptions.map((opt, idx) => (
                                                <div
                                                    key={`${opt}-${idx}`}
                                                    role="button"
                                                    tabIndex={0}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        // حفظ الحقل مباشرة
                                                        const fieldKey = currentField.key;
                                                        onAddFilter({
                                                            field: fieldKey,
                                                            operator: 'equals',
                                                            value: opt,
                                                        });
                                                        triggerAddAnimation(filters.length);
                                                        setOptionsOpen(false);
                                                        setOptionsSearch('');
                                                        // البقاء في نفس الفلتر للسماح باختيار قيم متعددة
                                                    }}
                                                    className="w-full text-right px-3 py-2 text-sm rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:text-orange-600 transition-all duration-150 cursor-pointer"
                                                >
                                                    {opt}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-sm text-slate-400 py-3">لا توجد نتائج</p>
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}

                        <button onClick={resetToSearch} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0 transition-all hover:scale-110 hover:rotate-90">
                            <X className="h-4 w-4 text-slate-400" />
                        </button>
                    </div>
                )}

                {/* شارات التجميع - كل مستوى بشكل منفصل */}
                {viewMode === 'search' && groupByLevels.map((level, index) => (
                    <Badge 
                        key={`group-${index}-${level}`}
                        variant="secondary" 
                        className="gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-0 px-2 py-1 flex-shrink-0 animate-in fade-in zoom-in slide-in-from-left-2 duration-300"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <ListTree className="h-3 w-3" />
                        <span className="text-xs">
                            {filterFields.find(f => f.key === level)?.label || level}
                            {level === 'date' && dateGroupBy && ` (${DATE_GROUP_OPTIONS.find(o => o.value === dateGroupBy)?.label})`}
                        </span>
                        <button 
                            onClick={() => removeGroupLevel(index)} 
                            className="rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 p-0.5 transition-all hover:scale-110 hover:rotate-90"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
                
                {/* الفلاتر النشطة مع أنيميشن */}
                {viewMode === 'search' && filters.map((filter, index) => (
                    <Badge 
                        key={index} 
                        variant="secondary" 
                        className={`gap-1 ${filter.field === '_global' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'} border-0 px-2 py-1 flex-shrink-0 transition-all duration-300 ${animatingBadges.has(index) ? 'animate-in fade-in zoom-in-150 slide-in-from-left-4' : 'animate-in fade-in slide-in-from-left-2'}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {filter.field === '_global' && <Search className="h-3 w-3" />}
                        {filter.field === 'date' && <Calendar className="h-3 w-3" />}
                        <span className="text-xs">{filter.value}</span>
                        <button 
                            onClick={() => onRemoveFilter(index)} 
                            className={`rounded-full ${filter.field === '_global' ? 'hover:bg-green-200 dark:hover:bg-green-800' : 'hover:bg-orange-200 dark:hover:bg-orange-800'} p-0.5 transition-all hover:scale-110 hover:rotate-90`}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}

                {/* حقل إدخال القيمة للفلتر */}
                {viewMode === 'filter-value' && currentField ? (
                    <div className="flex items-center gap-1 flex-1 min-w-[150px] animate-in fade-in slide-in-from-right-2 duration-200">
                        <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded flex-shrink-0">{currentField.label}:</span>
                        <input
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm"
                            placeholder="أدخل قيمة واضغط Enter..."
                            autoFocus
                        />
                        <button onClick={resetToSearch} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0 transition-all hover:scale-110 hover:rotate-90">
                            <X className="h-4 w-4 text-slate-400" />
                        </button>
                    </div>
                ) : viewMode === 'search' ? (
                    /* حقل البحث الشامل مع الاقتراحات */
                    <div className="flex-1 min-w-[100px] relative">
                        <input
                            ref={searchInputRef}
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-transparent border-none outline-none text-base placeholder:text-slate-400"
                            placeholder="بحث..."
                        />
                        {/* قائمة الاقتراحات */}
                        {matchingSuggestions.length > 0 && inputValue.length > 0 && (
                            <div className="absolute top-full right-0 mt-2 w-[280px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 animate-in fade-in-0 zoom-in-95">
                                <div className="text-xs text-slate-500 px-2 py-1 border-b border-slate-100 dark:border-slate-800">
                                    اقتراحات الفلاتر
                                </div>
                                {matchingSuggestions.map((suggestion, idx) => (
                                    <button
                                        key={`${suggestion.field.key}-${suggestion.value}-${idx}`}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleAddSuggestion(suggestion.field, suggestion.value);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors text-right"
                                    >
                                        <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex-shrink-0">
                                            {suggestion.field.label}
                                        </span>
                                        <span className={`flex-1 ${suggestion.exactMatch ? 'font-medium text-orange-600 dark:text-orange-400' : ''}`}>
                                            {suggestion.value}
                                        </span>
                                        <Filter className="h-3 w-3 text-slate-400" />
                                    </button>
                                ))}
                                <div className="text-xs text-slate-400 px-2 py-1 border-t border-slate-100 dark:border-slate-800">
                                    اضغط Enter للبحث الشامل
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}

                {/* زر التراجع - يلغي آخر عملية */}
                {viewMode === 'search' && (
                    <button 
                        onClick={() => {
                            // أولاً: مسح النص إذا موجود
                            if (inputValue && inputValue.trim()) {
                                setInputValue('');
                                onGlobalSearchChange('');
                                return;
                            }
                            // ثانياً: حذف آخر فلتر إذا موجود
                            if (filters.length > 0) {
                                onRemoveFilter(filters.length - 1);
                                return;
                            }
                            // ثالثاً: حذف آخر تجميع إذا موجود
                            if (groupByLevels.length > 0 && onRemoveGroupByLevel) {
                                onRemoveGroupByLevel(groupByLevels.length - 1);
                                return;
                            }
                        }} 
                        className={`p-1.5 rounded-full flex-shrink-0 transition-all hover:scale-110 ${
                            (inputValue && inputValue.trim()) || filters.length > 0 || groupByLevels.length > 0
                                ? 'hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 hover:text-red-600'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-300'
                        }`}
                        title="تراجع (Backspace)"
                        disabled={!inputValue && filters.length === 0 && groupByLevels.length === 0}
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}

                {/* زر مسح كل الفلاتر */}
                {viewMode === 'search' && filters.length > 0 && (
                    <button 
                        onClick={clearAllFilters} 
                        className="text-xs text-red-500 hover:text-red-700 flex-shrink-0 px-1 transition-all hover:underline animate-in fade-in slide-in-from-right"
                    >
                        مسح الكل
                    </button>
                )}
            </div>
        </div>
    );
};
