'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

interface RecentOrdersProps {
  orders: any[];
  statuses: any[];
  limit?: number;
}

export function RecentOrders({ orders, statuses, limit = 6 }: RecentOrdersProps) {
  const { formatCurrency, formatDate } = useSettings();

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

  const getStatusInfo = (orderStatus: string) => {
    const matched = statuses.find((s: any) =>
      s.name === orderStatus ||
      s.code === orderStatus ||
      s.name?.toLowerCase() === orderStatus?.toLowerCase()
    );
    return {
      color: matched?.color || '#6b7280',
      icon: matched?.icon || 'Package',
      name: matched?.name || orderStatus,
    };
  };

  if (recentOrders.length === 0) return null;

  return (
    <Card className="border-2 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon name="ClipboardList" className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">آخر الطلبات</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                آخر {recentOrders.length} طلبات تم إضافتها
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" asChild>
            <Link href="/dashboard/orders">
              عرض الكل
              <Icon name="ArrowLeft" className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {recentOrders.map((order, index) => {
            const statusInfo = getStatusInfo(order.status);
            const hasCOD = (order.cod || 0) > 0;

            return (
              <Link
                key={order.id || order.orderNumber || index}
                href={`/dashboard/orders?search=${encodeURIComponent(order.orderNumber || '')}`}
                className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/50 transition-all hover:shadow-sm group"
              >
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${statusInfo.color}15` }}
                >
                  <Icon
                    name={statusInfo.icon as any}
                    className="h-4 w-4"
                    style={{ color: statusInfo.color }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold truncate">
                      {order.recipient || 'بدون اسم'}
                    </span>
                    {order.orderNumber && (
                      <span className="text-[11px] text-muted-foreground font-mono bg-muted/60 px-1.5 py-0.5 rounded flex-shrink-0">
                        #{order.orderNumber}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {order.region && (
                      <span className="truncate max-w-[120px]">{order.region}</span>
                    )}
                    {order.region && order.driver && (
                      <span className="text-muted/40">•</span>
                    )}
                    {order.driver && (
                      <span className="truncate max-w-[100px]">{order.driver}</span>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0 text-left flex flex-col items-end gap-1">
                  {hasCOD && (
                    <span className="text-sm font-bold text-foreground">
                      {formatCurrency(order.cod)}
                    </span>
                  )}
                  <span
                    className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      color: statusInfo.color,
                      backgroundColor: `${statusInfo.color}15`,
                    }}
                  >
                    {statusInfo.name}
                  </span>
                </div>

                <Icon
                  name="ChevronLeft"
                  className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors flex-shrink-0"
                />
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
