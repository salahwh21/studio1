import type { ColumnConfig } from '@/components/export-data-dialog';
import type { Order } from '@/store/orders-store';

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

export const GROUP_BY_OPTIONS: { value: keyof Order | null; label: string }[] = [
  { value: null, label: 'بدون تجميع' },
  { value: 'merchant', label: 'التاجر' },
  { value: 'status', label: 'الحالة' },
  { value: 'region', label: 'المنطقة' },
  { value: 'city', label: 'المدينة' },
  { value: 'driver', label: 'السائق' },
  { value: 'date', label: 'التاريخ' },
];

import { Store, Edit, FileText, Link as LinkIcon } from 'lucide-react';

export const sourceIcons: Record<Order['source'], React.ElementType> = {
  Shopify: Store,
  WooCommerce: Store,
  Manual: Edit,
  API: FileText,
};

