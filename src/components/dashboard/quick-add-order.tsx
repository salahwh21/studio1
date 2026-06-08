'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Check, ChevronsUpDown, Printer, Trash2, Clock, MessageSquareWarning, MapPin } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { SimplePrintDialog } from '@/components/simple-print-dialog';
import Icon from '@/components/icon';
import { cn } from '@/lib/utils';

import { useOrderForm, predefinedNotes } from '@/hooks/use-order-form';

const LocationPickerMap = dynamic(() => import('@/components/location-picker-map'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-lg" />,
});

interface QuickAddOrderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickAddOrder({ open, onOpenChange }: QuickAddOrderProps) {
  const {
    form,
    selectedRegionValue,
    codValue,
    selectedCity,
    deliveryTimeType,
    lat, lng,
    calculatedFees,

    selectedMerchantId, setSelectedMerchantId,
    merchantPopoverOpen, setMerchantPopoverOpen,
    regionPopoverOpen, setRegionPopoverOpen,
    popoverStates, togglePopover,
    recentlyAdded,
    selectedRecent,
    isPrepaid, setIsPrepaid,
    isMapOpen, setIsMapOpen,

    aiState, formAction, isAiPending,

    merchantOptions,
    allRegions,
    statuses,
    formatCurrency, currencySymbol,

    handleAddOrder,
    handleUpdateRecentlyAdded,
    handleSelectRecent,
    handleSelectAllRecent,
    handleDeleteSelected,
    handleAddPredefinedNote,
    handleLocationSelect,
    resetAll,

    showEnhancedPrintDialog, setShowEnhancedPrintDialog,
    handlePrintClick,
    handleEnhancedPrint,
  } = useOrderForm();

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      resetAll();
    }
  }, [open]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] p-0 gap-0 overflow-hidden">
          {/* Header */}
          <DialogHeader className="px-6 pt-5 pb-3 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Icon name="PackagePlus" className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg">إضافة طلب سريع</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  نفس وظائف صفحة إضافة الطلب — مع واجهة مدمجة
                </DialogDescription>
              </div>
              {recentlyAdded.length > 0 && (
                <div className="mr-auto bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full">
                  {recentlyAdded.length} طلب مُضاف
                </div>
              )}
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[78vh]">
            <div className="p-5 space-y-4">

              {/* AI Quick Add - Enhanced Presence & Subtle Contrast */}
              <div className="rounded-xl border border-amber-200/70 dark:border-amber-700/30 bg-gradient-to-r from-amber-100/60 via-amber-50/40 to-orange-100/50 dark:from-amber-900/30 dark:via-slate-900 dark:to-orange-900/20 p-3 shadow-md transition-all duration-300 hover:shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex items-center gap-2 md:w-36 shrink-0">
                    <div className="p-1.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
                      <Icon name="Sparkles" className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-amber-900 dark:text-amber-200">الإدخال السريع الذكي</span>
                    </div>
                  </div>
                  <div className="flex-1 w-full">
                    <form action={formAction} className="flex gap-2 w-full">
                      <Textarea
                        name="request"
                        placeholder="لصق نص الطلب هنا..."
                        className="flex-1 min-h-[38px] h-[38px] text-xs bg-white dark:bg-slate-950 border-amber-300/50 focus-visible:ring-amber-500/50 resize-none py-2 shadow-inner"
                      />
                      <Button
                        type="submit"
                        className="h-[38px] px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md transition-all font-bold gap-1.5"
                        disabled={isAiPending || !selectedMerchantId}
                      >
                        {isAiPending ? <Icon name="Loader2" className="animate-spin h-3 w-3" /> : <Icon name="Bot" className="h-3 w-3" />}
                      </Button>
                    </form>
                    {aiState.error && (
                      <div className="mt-2 text-[10px] text-red-500 flex items-center gap-1">
                        <Icon name="AlertCircle" className="h-3 w-3" />
                        {aiState.error}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Form ── */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddOrder)} className="space-y-4">
                  <div className="space-y-3">
                    {/* ── Form Sections ── */}
                    <div className="space-y-3">
                      {/* Section 1: Customer Data */}
                      <div className="space-y-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-900/60 p-3 shadow-sm transition-shadow hover:shadow-md">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                          <div className="flex flex-col space-y-1">
                            <Label className="text-[11px] font-medium text-muted-foreground">المتجر <span className="text-red-500">*</span></Label>
                            <Popover open={merchantPopoverOpen} onOpenChange={setMerchantPopoverOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between h-9 text-xs font-normal border-border",
                                    !selectedMerchantId && "text-muted-foreground"
                                  )}
                                >
                                  {selectedMerchantId ? (merchantOptions.find(m => m.id === selectedMerchantId)?.storeName || merchantOptions.find(m => m.id === selectedMerchantId)?.name) : "اختر متجرًا..."}
                                  <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                  <CommandInput placeholder="بحث..." />
                                  <CommandList>
                                    <CommandEmpty>لم يوجد.</CommandEmpty>
                                    <CommandGroup>
                                      {merchantOptions.map(m => (
                                        <CommandItem key={m.id} value={m.storeName || m.name} onSelect={() => { setSelectedMerchantId(m.id); setMerchantPopoverOpen(false); }}>
                                          <Check className={cn("mr-2 h-3.5 w-3.5", selectedMerchantId === m.id ? "opacity-100" : "opacity-0")} />
                                          {m.storeName || m.name}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <FormField control={form.control} name="recipientName" render={({ field }) => (
                            <FormItem className="flex flex-col space-y-1">
                              <FormLabel className="text-[11px] font-medium text-muted-foreground">المستلم</FormLabel>
                              <FormControl><Input {...field} placeholder="اسم المستلم" className="h-9 text-sm" /></FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem className="flex flex-col space-y-1">
                              <FormLabel className="text-[11px] font-medium text-muted-foreground">الهاتف</FormLabel>
                              <FormControl><Input {...field} placeholder="07xxxxxxxx" className="h-9 text-sm" dir="ltr" /></FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )} />
                        </div>
                      </div>

                      {/* Section 2: Delivery Address */}
                      <div className="space-y-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-900/60 p-3 shadow-sm transition-shadow hover:shadow-md">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                          <FormField control={form.control} name="region" render={({ field }) => (
                            <FormItem className="flex flex-col space-y-1">
                              <FormLabel className="text-[11px] font-medium text-muted-foreground">المنطقة <span className="text-red-500">*</span></FormLabel>
                              <Popover open={regionPopoverOpen} onOpenChange={setRegionPopoverOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button variant="outline" role="combobox" className={cn("w-full justify-between h-9 text-xs font-normal border-border", !field.value && "text-muted-foreground")}>
                                      {field.value ? allRegions.find(r => `${r.name}_${r.cityName}` === field.value)?.name : "اختر منطقة..."}
                                      <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                  <Command>
                                    <CommandInput placeholder="بحث عن منطقة..." />
                                    <CommandList>
                                      <CommandEmpty>لم يتم العثور على المنطقة.</CommandEmpty>
                                      <CommandGroup>
                                        {allRegions.map(r => (
                                          <CommandItem value={`${r.name} ${r.cityName}`} key={`${r.id}-${r.cityName}`} onSelect={() => { form.setValue("region", `${r.name}_${r.cityName}`); setRegionPopoverOpen(false); }}>
                                            <Check className={cn("mr-2 h-3.5 w-3.5", `${r.name}_${r.cityName}` === field.value ? "opacity-100" : "opacity-0")} />
                                            {r.name} ({r.cityName})
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="city" render={({ field }) => (
                            <FormItem className="flex flex-col space-y-1">
                              <FormLabel className="text-[11px] font-medium text-muted-foreground">المدينة</FormLabel>
                              <FormControl><Input {...field} readOnly className="h-9 text-sm bg-muted" placeholder="تلقائياً" /></FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem className="flex flex-col space-y-1">
                              <FormLabel className="text-[11px] font-medium text-muted-foreground">العنوان التفصيلي</FormLabel>
                              <div className="flex gap-1.5">
                                <FormControl><Input {...field} placeholder={lat && lng ? "تم التحديد على الخريطة" : "العنوان..."} className="h-9 text-sm" /></FormControl>
                                <Button type="button" variant="outline" size="icon" className={cn("h-9 w-9 flex-shrink-0", lat && lng && 'bg-green-100 border-green-400 text-green-700')} onClick={() => setIsMapOpen(true)}>
                                  <MapPin className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )} />
                        </div>
                      </div>

                      {/* Section 3: Payment Details */}
                      <div className="space-y-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-900/60 p-3 shadow-sm transition-shadow hover:shadow-md">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                          <FormField control={form.control} name="cod" render={({ field }) => (
                            <FormItem className="flex flex-col space-y-1">
                              <FormLabel className="text-[11px] font-medium text-muted-foreground">
                                قيمة التحصيل <span className="text-orange-600 font-bold ml-1">({currencySymbol})</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  inputMode="decimal"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString()).replace(/[^\d.]/g, '');
                                    field.onChange(value ? parseFloat(value) : 0);
                                  }}
                                  value={field.value || ''}
                                  disabled={isPrepaid}
                                  className="h-9 text-sm font-mono border-input"
                                  style={{ unicodeBidi: 'plaintext' }}
                                  placeholder="0.00"
                                />
                              </FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )} />
                          
                          <div className="flex flex-col space-y-1">
                            <Label className="text-[11px] font-medium text-muted-foreground opacity-0 select-none hidden md:block">Spacer</Label>
                            <div className="flex items-center space-x-2 space-x-reverse bg-card px-3 h-9 rounded-md border border-input hover:border-blue-400 transition-colors cursor-pointer" onClick={() => setIsPrepaid(!isPrepaid)}>
                              <Checkbox id="isPrepaidModal" checked={isPrepaid} onCheckedChange={(checked) => setIsPrepaid(!!checked)} className="h-3.5 w-3.5 rounded" />
                              <Label htmlFor="isPrepaidModal" className="text-[11px] cursor-pointer text-slate-700 dark:text-slate-300 select-none w-full">مدفوع مسبقاً</Label>
                            </div>
                          </div>

                          <div className="flex flex-col space-y-1">
                            <Label className="text-[11px] font-medium text-muted-foreground">تفاصيل الرسوم</Label>
                            <div className="flex gap-2 rounded-md border border-border px-2 bg-muted/20 h-9 items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-muted-foreground">التاجر:</span>
                                <span className="text-xs font-medium text-foreground">{formatCurrency(calculatedFees.itemPrice)}</span>
                              </div>
                              <Separator orientation="vertical" className="h-5 bg-border" />
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-muted-foreground">التوصيل:</span>
                                <span className="text-xs font-medium text-foreground">{formatCurrency(calculatedFees.deliveryFee)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 4: Extra Options */}
                      <div className="space-y-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-900/60 p-3 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex flex-col space-y-3">
                          {/* Unified Time Controls & Predefined Notes */}
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Time Control Toggle */}
                            <FormField
                              control={form.control}
                              name="deliveryTimeType"
                              render={({ field }) => (
                                <div className="flex bg-background p-1 rounded-md gap-1 border border-border shadow-sm shrink-0 items-center">
                                  <div className="flex items-center px-2 text-[10px] font-semibold text-muted-foreground border-l border-border ml-1">
                                    <Clock className="h-3 w-3 ml-1 text-orange-500" /> التوصيل
                                  </div>
                                  {[
                                    { id: 'any', label: 'أي وقت' },
                                    { id: 'fixed', label: 'محدد' },
                                    { id: 'before', label: 'قبل' },
                                    { id: 'after', label: 'بعد' }
                                  ].map(option => (
                                    <button
                                      key={option.id}
                                      type="button"
                                      onClick={() => field.onChange(option.id)}
                                      className={cn(
                                        "text-[10px] font-medium px-2 py-1 rounded-sm transition-all duration-200",
                                        field.value === option.id
                                          ? "bg-primary text-primary-foreground shadow"
                                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                      )}
                                    >
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            />

                            {/* Predefined Notes */}
                            {predefinedNotes.map(note => (
                              <Button key={note.text} type="button" variant="outline" size="sm" className="h-7 gap-1 text-[10px] border-dashed" onClick={() => handleAddPredefinedNote(note.text)}>
                                <Icon name={note.icon} className="h-3 w-3 text-slate-500" />
                                {note.text}
                              </Button>
                            ))}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 items-start">
                            {/* Optional Time Input */}
                            {deliveryTimeType !== 'any' && (
                              <FormField
                                control={form.control}
                                name="deliveryTime"
                                render={({ field }) => (
                                  <FormItem className="animate-in fade-in zoom-in duration-200 shrink-0 w-full sm:w-auto">
                                    <FormControl><Input type="time" {...field} className="h-9 w-full sm:w-[120px] text-xs" /></FormControl>
                                    <FormMessage className="text-[10px]" />
                                  </FormItem>
                                )}
                              />
                            )}

                            {/* Input for Notes */}
                            <FormField control={form.control} name="notes" render={({ field }) => (
                              <FormItem className="flex-1 w-full">
                                <FormControl><Input {...field} placeholder="ملاحظات إضافية (اختياري)" className="h-9 text-xs flex-1" /></FormControl>
                                <FormMessage className="text-[10px]" />
                              </FormItem>
                            )} />
                          </div>
                        </div>

                        {/* Submit Button Outside Grid */}
                        <div className="pt-2">
                          <Button
                            type="submit"
                            disabled={!selectedMerchantId}
                            className="w-full gap-2 h-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-colors"
                          >
                            <Icon name="Plus" className="h-4 w-4" />
                            {selectedMerchantId ? 'تأكيد وإضافة الطلب' : 'اختر متجر أولاً'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </Form>

              {/* ── Recently Added Table ── */}
              {recentlyAdded.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Icon name="List" className="h-4 w-4 text-primary" />
                      طلبات مضافة حديثاً ({recentlyAdded.length})
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={handlePrintClick} disabled={selectedRecent.length === 0}>
                        <Printer className="h-3.5 w-3.5" />طباعة
                      </Button>
                      {selectedRecent.length > 0 && (
                        <Button variant="destructive" size="sm" className="h-7 gap-1.5 text-xs" onClick={handleDeleteSelected}>
                          <Trash2 className="h-3.5 w-3.5" />
                          حذف ({selectedRecent.length})
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead className="w-10 text-center"><Checkbox onCheckedChange={(checked) => handleSelectAllRecent(!!checked)} /></TableHead>
                          <TableHead className="text-center text-xs w-10">#</TableHead>
                          <TableHead className="text-center text-xs">رقم الطلب</TableHead>
                          <TableHead className="text-center text-xs">المتجر</TableHead>
                          <TableHead className="text-center text-xs">المستلم</TableHead>
                          <TableHead className="text-center text-xs">الهاتف</TableHead>
                          <TableHead className="text-center text-xs">المنطقة</TableHead>
                          <TableHead className="text-center text-xs">المدينة</TableHead>
                          <TableHead className="text-center text-xs">COD</TableHead>
                          <TableHead className="text-center text-xs">الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentlyAdded.map((order, index) => (
                          <TableRow key={order.id} className="group">
                            <TableCell className="text-center"><Checkbox checked={selectedRecent.includes(order.id)} onCheckedChange={() => handleSelectRecent(order.id)} /></TableCell>
                            <TableCell className="text-center text-xs text-muted-foreground">{index + 1}</TableCell>
                            <TableCell className="text-center text-xs font-mono">{order.id}</TableCell>
                            <TableCell className="text-center">
                              <Popover open={popoverStates[`merchant-${order.id}`]} onOpenChange={() => togglePopover(`merchant-${order.id}`)}>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" className="h-7 text-xs w-full justify-between hover:bg-muted font-normal border">
                                    {order.merchant}
                                    <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[180px] p-0">
                                  <Command>
                                    <CommandInput placeholder="بحث..." />
                                    <CommandList>
                                      <CommandEmpty>لم يوجد.</CommandEmpty>
                                      <CommandGroup>
                                        {merchantOptions.map(m => (
                                          <CommandItem key={m.id} value={m.storeName || m.name} onSelect={() => { handleUpdateRecentlyAdded(order.id, 'merchant', m.storeName || m.name); togglePopover(`merchant-${order.id}`); }}>
                                            <Check className={cn("mr-2 h-3.5 w-3.5", order.merchant === (m.storeName || m.name) ? "opacity-100" : "opacity-0")} />
                                            {m.storeName || m.name}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </TableCell>
                            <TableCell className="text-center">
                              <Input value={order.recipient} onChange={(e) => handleUpdateRecentlyAdded(order.id, 'recipient', e.target.value)} className="h-7 text-xs text-center border-0 bg-transparent hover:bg-muted focus-visible:ring-0 focus-visible:ring-offset-0" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Input value={order.phone} onChange={(e) => handleUpdateRecentlyAdded(order.id, 'phone', e.target.value)} className="h-7 text-xs text-center border-0 bg-transparent hover:bg-muted focus-visible:ring-0 focus-visible:ring-offset-0" dir="ltr" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Popover open={popoverStates[`region-${order.id}`]} onOpenChange={() => togglePopover(`region-${order.id}`)}>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" className="h-7 text-xs w-full justify-between hover:bg-muted font-normal border">
                                    {order.region}
                                    <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[180px] p-0">
                                  <Command>
                                    <CommandInput placeholder="بحث..." />
                                    <CommandList>
                                      <CommandEmpty>لم يوجد.</CommandEmpty>
                                      <CommandGroup>
                                        {allRegions.map(r => (
                                          <CommandItem key={`${r.id}-${r.cityName}`} value={`${r.name} ${r.cityName}`} onSelect={() => { handleUpdateRecentlyAdded(order.id, 'region', `${r.name}_${r.cityName}`); togglePopover(`region-${order.id}`); }}>
                                            <Check className={cn("mr-2 h-3.5 w-3.5", `${order.region}_${order.city}` === `${r.name}_${r.cityName}` ? "opacity-100" : "opacity-0")} />
                                            {r.name} ({r.cityName})
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </TableCell>
                            <TableCell className="text-center text-xs">{order.city}</TableCell>
                            <TableCell className="text-center">
                              <Input type="number" value={order.cod} onChange={(e) => handleUpdateRecentlyAdded(order.id, 'cod', parseFloat(e.target.value) || 0)} className="h-7 text-xs text-center border-0 bg-transparent hover:bg-muted focus-visible:ring-0 focus-visible:ring-offset-0 w-20 mx-auto" dir="ltr" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Select value={order.status} onValueChange={(value) => handleUpdateRecentlyAdded(order.id, 'status', value)}>
                                <SelectTrigger className="h-7 text-xs text-center border-0 focus:ring-0 bg-transparent hover:bg-muted">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {statuses.filter(s => s.isActive).map(s => (
                                    <SelectItem key={s.id} value={s.name}>
                                      <div className="flex items-center gap-1.5">
                                        <Icon name={s.icon as any} style={{ color: s.color }} className="h-3.5 w-3.5" />
                                        {s.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-[11px] text-muted-foreground text-center">
                    يمكنك تعديل جميع الحقول مباشرة من الجدول
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Map Dialog */}
      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-2">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>تحديد الموقع على الخريطة</DialogTitle>
            <DialogDescription>انقر على الخريطة لتحديد الموقع الدقيق.</DialogDescription>
          </DialogHeader>
          <LocationPickerMap onLocationSelect={handleLocationSelect} />
        </DialogContent>
      </Dialog>

      {/* Print Dialog */}
      <SimplePrintDialog
        open={showEnhancedPrintDialog}
        onOpenChange={setShowEnhancedPrintDialog}
        selectedCount={selectedRecent.length}
        onPrint={handleEnhancedPrint}
        orders={recentlyAdded.filter(order => selectedRecent.includes(order.id))}
      />
    </>
  );
}
