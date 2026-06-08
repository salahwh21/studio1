'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUsersStore } from '@/store/user-store';
import { useOrdersStore, Order } from '@/store/orders-store';
import { useAreas } from '@/hooks/use-areas';
import { useToast } from '@/hooks/use-toast';
import { useActionState } from 'react';
import { parseOrderFromRequest } from '@/app/actions/parse-order';
import { useStatusesStore } from '@/store/statuses-store';
import { useSettings } from '@/contexts/SettingsContext';
import type { SavedTemplate } from '@/contexts/SettingsContext';

// ── Schema ──────────────────────────────────────────────
export const orderSchema = z.object({
  recipientName: z.string().min(2, "اسم المستلم يجب أن يكون حرفين على الأقل."),
  phone: z.string().regex(/^07\d{8}$/, "رقم الهاتف يجب أن يكون 10 أرقام ويبدأ بـ 07."),
  whatsapp: z.string().regex(/^07\d{8}$/, "رقم الواتساب يجب أن يكون 10 أرقام ويبدأ بـ 07.").optional().or(z.literal('')),
  region: z.string({ required_error: "الرجاء اختيار المنطقة." }).min(1, "الرجاء اختيار المنطقة."),
  city: z.string().min(2, "اسم المدينة يجب أن يكون حرفين على الأقل."),
  address: z.string().optional(),
  cod: z.coerce.number().min(0, "المبلغ يجب أن يكون أكبر من أو يساوي 0."),
  notes: z.string().max(1000, "الملاحظات يجب أن تكون أقل من 1000 حرف.").optional(),
  referenceNumber: z.string().optional(),
  parcelCount: z.coerce.number().min(1, "يجب أن يكون طرد واحد على الأقل."),
  deliveryTimeType: z.enum(['any', 'fixed', 'before', 'after']).optional(),
  deliveryTime: z.string().optional(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
});

export type OrderFormValues = z.infer<typeof orderSchema>;

// ── Predefined Notes ────────────────────────────────────
export const predefinedNotes = [
  { text: 'قابل للكسر', icon: 'GlassWater' as const },
  { text: 'يرجى التواصل باكرًا', icon: 'Sunrise' as const },
  { text: 'توصيل في الفترة المسائية', icon: 'Sunset' as const },
  { text: 'هدية، يرجى عدم إظهار السعر', icon: 'Gift' as const },
];

// ── Hook ────────────────────────────────────────────────
export function useOrderForm() {
  const { toast } = useToast();
  const { users } = useUsersStore();
  const { addOrder, deleteOrders, updateOrderField } = useOrdersStore();
  const { cities, isLoading: areasLoading } = useAreas();
  const { statuses } = useStatusesStore();
  const context = useSettings();
  const { settings, formatCurrency, isHydrated: settingsHydrated } = context;
  const currencySymbol = settings.regional.currencySymbol;

  // ── State ──
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('');
  const [merchantPopoverOpen, setMerchantPopoverOpen] = useState(false);
  const [regionPopoverOpen, setRegionPopoverOpen] = useState(false);
  const [popoverStates, setPopoverStates] = useState<Record<string, boolean>>({});

  const togglePopover = (id: string) => {
    setPopoverStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [recentlyAdded, setRecentlyAdded] = useState<Order[]>([]);
  const [selectedRecent, setSelectedRecent] = useState<string[]>([]);

  const [aiState, formAction, isAiPending] = useActionState(parseOrderFromRequest, {
    data: null, error: null, message: ''
  });

  const [isPrepaid, setIsPrepaid] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [showEnhancedPrintDialog, setShowEnhancedPrintDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SavedTemplate | null>(null);

  // ── Form ──
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      recipientName: '', phone: '', whatsapp: '', city: '', region: '', address: '',
      cod: 0, notes: '', referenceNumber: '', parcelCount: 1,
      deliveryTimeType: 'any', lat: null, lng: null,
    },
  });

  const { watch, setValue, getValues, reset } = form;
  const selectedRegionValue = watch('region');
  const codValue = watch('cod');
  const selectedCity = watch('city');
  const deliveryTimeType = watch('deliveryTimeType');
  const lat = watch('lat');
  const lng = watch('lng');

  // ── Derived ──
  const merchantOptions = useMemo(() => users.filter(u => u.roleId === 'merchant'), [users]);
  const drivers = useMemo(() => users.filter(u => u.roleId === 'driver'), [users]);
  const allRegions = useMemo(() =>
    cities.flatMap(c => (c.areas || []).map(a => ({ ...a, cityName: c.name })))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [cities]
  );

  const printablePolicyRef = useRef<{ handleExport: () => Promise<void> } | null>(null);
  const availableTemplates = (settings as any).templates || [];

  // ── Effects ──

  // تعبئة المدينة عند اختيار المنطقة
  useEffect(() => {
    if (selectedRegionValue) {
      const [regionName, cityName] = selectedRegionValue.split('_');
      const regionData = allRegions.find(r => r.name === regionName && r.cityName === cityName);
      if (regionData) {
        setValue('city', regionData.cityName, { shouldValidate: true });
      }
    }
  }, [selectedRegionValue, allRegions, setValue]);

  // إعادة تعيين COD عند التحويل لمدفوع مسبقاً
  useEffect(() => {
    if (isPrepaid) {
      setValue('cod', 0);
    }
  }, [isPrepaid, setValue]);

  // تعبئة تلقائية من الذكاء الاصطناعي
  useEffect(() => {
    if (aiState.data) {
      const { customerName, phone, city, region, addressDetails, cod } = aiState.data;

      form.reset({
        ...form.getValues(),
        recipientName: customerName || '',
        phone: phone || '',
        address: addressDetails || '',
        cod: cod || 0,
      });

      if (region) {
        const bestMatch = allRegions.find(r => r.name.includes(region) || region.includes(r.name));
        if (bestMatch) {
          setValue('region', `${bestMatch.name}_${bestMatch.cityName}`, { shouldValidate: true });
          setValue('city', bestMatch.cityName, { shouldValidate: true });
        }
      } else if (city) {
        const cityMatch = cities.find(c => c.name.includes(city));
        if (cityMatch && cityMatch.areas && cityMatch.areas.length > 0) {
          setValue('region', `${cityMatch.areas[0].name}_${cityMatch.name}`, { shouldValidate: true });
          setValue('city', cityMatch.name, { shouldValidate: true });
        }
      }

      toast({ title: 'تم تحليل الطلب', description: 'تم ملء الحقول بنجاح. يرجى المراجعة والإضافة.' });
    }
    if (aiState.error) {
      toast({ variant: 'destructive', title: 'خطأ في التحليل', description: aiState.error });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiState]);

  // ── Calculated Fees ──
  const calculatedFees = useMemo(() => {
    const safeCodValue = codValue || 0;
    if (!selectedCity) {
      return { deliveryFee: 0, itemPrice: 0 };
    }
    const deliveryFee = selectedCity === 'عمان' ? 2.5 : 3.5;
    const itemPrice = isPrepaid ? 0 : (safeCodValue - deliveryFee);
    return { deliveryFee, itemPrice };
  }, [codValue, selectedCity, isPrepaid]);

  // ── Handlers ──

  const handleUpdateRecentlyAdded = (orderId: string, field: keyof Order, value: any) => {
    if (field === 'region') {
      const [regionName, cityName] = value.split('_');
      updateOrderField(orderId, 'region', regionName);
      updateOrderField(orderId, 'city', cityName);
      setRecentlyAdded(prev => prev.map(o => o.id === orderId ? { ...o, region: regionName, city: cityName } : o));
    } else {
      updateOrderField(orderId, field, value);
      setRecentlyAdded(prev => prev.map(o => o.id === orderId ? { ...o, [field]: value } : o));
    }
  };

  const handleAddPredefinedNote = (note: string) => {
    const currentNotes = getValues('notes');
    setValue('notes', currentNotes ? `${currentNotes}\n- ${note}` : `- ${note}`);
  };

  const handleLocationSelect = ({ lat, lng }: { lat: number; lng: number }) => {
    setValue('lat', lat);
    setValue('lng', lng);
    setValue('address', `[GEO] ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setIsMapOpen(false);
    toast({ title: 'تم تحديد الموقع', description: 'تم حفظ الإحداثيات.' });
  };

  const handleAddOrder = async (data: OrderFormValues) => {
    const merchant = users.find(u => u.id === selectedMerchantId);
    if (!merchant) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء اختيار متجر أولاً.' });
      return;
    }

    const [regionName] = data.region.split('_');

    if (!settingsHydrated) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'الإعدادات لم تحمل بعد، يرجى المحاولة بعد لحظات.' });
      return;
    }

    let finalNotes = data.notes || '';
    if (isPrepaid) {
      finalNotes = `الطلب مدفوع مسبقًا.\n${finalNotes}`.trim();
    }
    if (data.deliveryTimeType && data.deliveryTimeType !== 'any' && data.deliveryTime) {
      let timeNote = '';
      try {
        const timeString = new Date(`1970-01-01T${data.deliveryTime}`).toLocaleTimeString('ar-JO', { hour: 'numeric', minute: 'numeric', hour12: true });
        if (data.deliveryTimeType === 'fixed') timeNote = `التوصيل الساعة ${timeString} تمامًا.`;
        if (data.deliveryTimeType === 'before') timeNote = `التوصيل قبل الساعة ${timeString}.`;
        if (data.deliveryTimeType === 'after') timeNote = `التوصيل بعد الساعة ${timeString}.`;
      } catch (e) { /* ignore invalid time */ }
      finalNotes = `${timeNote}\n${finalNotes}`.trim();
    }
    finalNotes = `${finalNotes}\n(عدد الطرود: ${data.parcelCount})`.trim();

    const newOrder: Omit<Order, 'id' | 'orderNumber'> = {
      source: 'Manual',
      referenceNumber: data.referenceNumber || '',
      recipient: data.recipientName || 'زبون غير مسمى',
      phone: data.phone || '',
      whatsapp: data.whatsapp || '',
      address: `${data.address ? `${data.address}, ` : ''}${regionName}, ${data.city}`,
      city: data.city || '',
      region: regionName,
      status: 'بالانتظار',
      driver: 'غير معين',
      merchant: merchant.storeName || merchant.name,
      cod: isPrepaid ? 0 : data.cod,
      itemPrice: calculatedFees.itemPrice,
      deliveryFee: calculatedFees.deliveryFee,
      date: new Date().toISOString().split('T')[0],
      notes: finalNotes,
      // @ts-ignore
      parcelCount: data.parcelCount,
      lat: data.lat ?? undefined,
      lng: data.lng ?? undefined,
    };

    try {
      const addedOrder = await addOrder(newOrder);
      if (addedOrder) {
        setRecentlyAdded(prev => [addedOrder, ...prev]);
        toast({
          title: 'تمت الإضافة',
          description: `تمت إضافة طلب "${data.recipientName}" بنجاح. الطلب متاح الآن في جدول الطلبات.`
        });
        reset({
          ...getValues(),
          recipientName: '', phone: '', whatsapp: '', cod: 0, notes: '',
          referenceNumber: '', address: '', parcelCount: 1,
          deliveryTimeType: 'any', deliveryTime: '', lat: null, lng: null,
        });
        setIsPrepaid(false);
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل في إضافة الطلب. يرجى المحاولة مرة أخرى.' });
    }
  };

  const handleSelectRecent = (id: string) => {
    setSelectedRecent(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAllRecent = (checked: boolean) => {
    setSelectedRecent(checked ? recentlyAdded.map(o => o.id) : []);
  };

  const handleDeleteSelected = () => {
    deleteOrders(selectedRecent);
    setRecentlyAdded(prev => prev.filter(o => !selectedRecent.includes(o.id)));
    toast({ title: "تم الحذف", description: `تم حذف ${selectedRecent.length} طلبات.` });
    setSelectedRecent([]);
  };

  const handlePrintClick = () => {
    if (selectedRecent.length === 0) {
      toast({
        variant: "destructive",
        title: "لم يتم تحديد طلبات",
        description: "الرجاء تحديد طلب واحد على الأقل للطباعة."
      });
      return;
    }
    setShowEnhancedPrintDialog(true);
  };

  const handleEnhancedPrint = (
    type: 'pdf' | 'colored' | 'thermal',
    size: 'a4' | 'a5' | '100x150' | '100x100' | '75x50' | '60x40' | '50x30',
    orientation: 'portrait' | 'landscape',
  ) => {
    console.log('طباعة:', { type, size, orientation, orders: selectedRecent.length });
    setIsPrintDialogOpen(true);
    toast({
      title: 'تم اختيار إعدادات الطباعة',
      description: `النوع: ${type} • الحجم: ${size} • الاتجاه: ${orientation} • الطلبات: ${selectedRecent.length}`,
    });
  };

  // ── Reset (for modal re-open) ──
  const resetAll = () => {
    form.reset();
    setSelectedMerchantId('');
    setRecentlyAdded([]);
    setSelectedRecent([]);
    setIsPrepaid(false);
    setIsMapOpen(false);
    setIsPrintDialogOpen(false);
    setShowEnhancedPrintDialog(false);
    setSelectedTemplate(null);
  };

  return {
    // Form
    form,
    selectedRegionValue,
    codValue,
    selectedCity,
    deliveryTimeType,
    lat, lng,
    calculatedFees,

    // State
    selectedMerchantId, setSelectedMerchantId,
    merchantPopoverOpen, setMerchantPopoverOpen,
    regionPopoverOpen, setRegionPopoverOpen,
    popoverStates, togglePopover,
    recentlyAdded,
    selectedRecent,
    isPrepaid, setIsPrepaid,
    isMapOpen, setIsMapOpen,

    // AI
    aiState, formAction, isAiPending,

    // Data
    merchantOptions,
    drivers,
    allRegions,
    cities, areasLoading,
    statuses,
    users,
    settings, formatCurrency, currencySymbol,
    settingsHydrated,
    availableTemplates,
    printablePolicyRef,

    // Handlers
    handleAddOrder,
    handleUpdateRecentlyAdded,
    handleSelectRecent,
    handleSelectAllRecent,
    handleDeleteSelected,
    handleAddPredefinedNote,
    handleLocationSelect,
    resetAll,

    // Print
    isPrintDialogOpen, setIsPrintDialogOpen,
    showEnhancedPrintDialog, setShowEnhancedPrintDialog,
    selectedTemplate, setSelectedTemplate,
    handlePrintClick,
    handleEnhancedPrint,
  };
}
