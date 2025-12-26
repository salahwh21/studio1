
import { ColumnConfig } from '@/components/export-data-dialog';
import { GroupByOption, OrderSource } from './types';
import { Store, Edit, FileText } from 'lucide-react';
import { Order } from '@/store/orders-store';

export const ALL_COLUMNS: ColumnConfig[] = [
    { key: 'id', label: 'رقم الطلب', sortable: true },
    { key: 'source', label: 'المصدر', sortable: true },
    { key: 'referenceNumber', label: 'الرقم المرجعي', sortable: true },
    { key: 'recipient', label: 'المستلم', sortable: true },
    { key: 'phone', label: 'الهاتف', sortable: true },
    { key: 'address', label: 'العنوان', sortable: true },
    { key: 'region', label: 'المنطقة', sortable: true },
    { key: 'city', label: 'المدينة', sortable: true },
    { key: 'merchant', label: 'التاجر', sortable: true },
    { key: 'status', label: 'الحالة', sortable: true },
    { key: 'previousStatus', label: 'الحالة السابقة', sortable: true },
    { key: 'driver', label: 'السائق', sortable: true },
    { key: 'itemPrice', label: 'المستحق للتاجر', type: 'financial', sortable: true },
    { key: 'deliveryFee', label: 'أجور التوصيل', type: 'financial', sortable: true },
    { key: 'additionalCost', label: 'تكلفة إضافية', type: 'admin_financial', sortable: true },
    { key: 'driverFee', label: 'أجور السائق', type: 'admin_financial', sortable: true },
    { key: 'driverAdditionalFare', label: 'أجور إضافية للسائق', type: 'admin_financial', sortable: true },
    { key: 'companyDue', label: 'المطلوب للشركة', type: 'admin_financial', sortable: true },
    { key: 'cod', label: 'قيمة التحصيل', type: 'financial', sortable: true },
    { key: 'date', label: 'التاريخ', sortable: true },
    { key: 'notes', label: 'ملاحظات', sortable: true },
];

export const GROUP_BY_OPTIONS: { value: GroupByOption; label: string }[] = [
    { value: null, label: 'بدون تجميع' },
    { value: 'merchant', label: 'التاجر' },
    { value: 'status', label: 'الحالة' },
    { value: 'region', label: 'المنطقة' },
    { value: 'city', label: 'المدينة' },
    { value: 'driver', label: 'السائق' },
    { value: 'date', label: 'التاريخ' },
];

export const SEARCHABLE_FIELDS: { key: keyof Order; label: string; type: 'text' | 'select', options?: string[] }[] = [
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

export const SOURCE_ICONS: Record<OrderSource, React.ElementType> = {
    Shopify: Store,
    WooCommerce: Store,
    Manual: Edit,
    API: FileText,
};

export const COLUMN_SETTINGS_KEY = 'ordersTableColumnSettings';
