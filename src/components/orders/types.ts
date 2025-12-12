
import { Order } from '@/store/orders-store';

export type OrderSource = Order['source'];
export type GroupByOption = keyof Order | null;
export type GroupedOrders = { [key: string]: Order[] };

export type ModalState =
    | { type: 'none' }
    | { type: 'delete' }
    | { type: 'history', order: Order }
    | { type: 'whatsapp', order: Order }
    | { type: 'barcode', order: Order }
    | { type: 'assignDriver' }
    | { type: 'changeStatus', orderId: string, currentStatus: string, currentDriver?: string }
    | { type: 'print' }
    | { type: 'export' };
