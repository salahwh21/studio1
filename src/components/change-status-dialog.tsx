'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Truck, CheckCircle } from 'lucide-react';
import { useUsersStore } from '@/store/user-store';
import { useOrdersStore } from '@/store/orders-store';
import { useStatusesStore } from '@/store/statuses-store';
import { validateStatusTransition, requiresDriver } from '@/lib/status-rules';
import { useToast } from '@/hooks/use-toast';

interface ChangeStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  currentStatus: string;
  currentDriver?: string;
}

export function ChangeStatusDialog({
  open,
  onOpenChange,
  orderId,
  currentStatus,
  currentDriver = 'غير معين',
}: ChangeStatusDialogProps) {
  const { users } = useUsersStore();
  const { updateOrderStatus } = useOrdersStore();
  const { statuses } = useStatusesStore();
  const { toast } = useToast();

  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [selectedDriver, setSelectedDriver] = useState(currentDriver);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get active statuses from store
  const activeStatuses = statuses.filter(s => s.isActive).map(s => s.name);
  const drivers = users.filter(u => u.roleId === 'driver');
  const needsDriver = requiresDriver(currentStatus, selectedStatus);

  // Debug logging
  useEffect(() => {
    console.log('ChangeStatusDialog - Total users:', users.length);
    console.log('ChangeStatusDialog - Drivers:', drivers.length, drivers.map(d => d.name));
  }, [users, drivers]);

  useEffect(() => {
    if (open) {
      setSelectedStatus(currentStatus);
      setSelectedDriver(currentDriver);
      setError(null);
    }
  }, [open, currentStatus, currentDriver]);

  const handleSubmit = async () => {
    setError(null);

    // Validate
    const validation = validateStatusTransition(
      currentStatus,
      selectedStatus,
      selectedDriver
    );

    if (!validation.valid) {
      setError(validation.error || 'خطأ في التحقق');
      return;
    }

    setIsLoading(true);
    try {
      await updateOrderStatus(orderId, selectedStatus, selectedDriver !== 'غير معين' ? selectedDriver : undefined);

      toast({
        title: '✅ تم تحديث الحالة',
        description: `تم تغيير الحالة إلى "${selectedStatus}"`,
      });

      onOpenChange(false);
    } catch (error: any) {
      setError(error.message || 'فشل في تحديث الحالة');
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message || 'فشل في تحديث الحالة',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            تغيير حالة الطلب
          </DialogTitle>
          <DialogDescription>
            الحالة الحالية: <span className="font-semibold">{currentStatus}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">الحالة الجديدة *</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="اختر الحالة..." />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={5} className="max-h-[200px] overflow-y-auto z-[9999]">
                {activeStatuses.map((status) => (
                  <SelectItem key={status} value={status} className="text-right">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Driver Selection - Show when needed */}
          {needsDriver && (
            <div className="space-y-2 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border-2 border-amber-300 dark:border-amber-700">
              <Label htmlFor="driver" className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <Truck className="h-4 w-4" />
                السائق * (مطلوب)
              </Label>
              <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                <SelectTrigger id="driver" className="border-2">
                  <SelectValue placeholder="اختر سائق..." />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={5} className="max-h-[200px] overflow-y-auto z-[9999]">
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.name} className="text-right">
                      {driver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                يجب تعيين سائق لتغيير الحالة إلى "جاري التوصيل" أو "بانتظار السائق"
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || selectedStatus === currentStatus}
          >
            {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
