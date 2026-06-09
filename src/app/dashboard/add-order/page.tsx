'use client';

import dynamic from 'next/dynamic';
import { Check, ChevronsUpDown, Printer, Trash2, Package, Clock, MessageSquareWarning, MapPin } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/icon';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SimplePrintDialog } from '@/components/simple-print-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

import { useOrderForm, predefinedNotes } from '@/hooks/use-order-form';

const LocationPickerMap = dynamic(() => import('@/components/location-picker-map'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-lg" />,
});

const AddOrderPage = () => {
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
    availableTemplates,
    printablePolicyRef,

    handleAddOrder,
    handleUpdateRecentlyAdded,
    handleSelectRecent,
    handleSelectAllRecent,
    handleDeleteSelected,
    handleAddPredefinedNote,
    handleLocationSelect,

    isPrintDialogOpen, setIsPrintDialogOpen,
    showEnhancedPrintDialog, setShowEnhancedPrintDialog,
    selectedTemplate, setSelectedTemplate,
    handlePrintClick,
    handleEnhancedPrint,
  } = useOrderForm();

  return (
    <>
      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>طباعة البوالص</DialogTitle>
            <DialogDescription>اختر القالب وقم بمعاينة البوالص قبل الطباعة النهائية.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 min-h-0">
            <div className="md:col-span-1 flex flex-col gap-4">
              <Card>
                <CardHeader className='p-4'><CardTitle className='text-base'>1. اختر القالب</CardTitle></CardHeader>
                <CardContent className='p-4'>
                  <RadioGroup
                    value={selectedTemplate?.id}
                    onValueChange={(id) => setSelectedTemplate(availableTemplates.find((t: any) => t.id === id) || null)}
                  >
                    {availableTemplates.map((template: any) => (
                      <div key={template.id} className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value={template.id} id={template.id} />
                        <Label htmlFor={template.id}>{template.name}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='p-4'><CardTitle className='text-base'>2. إجراء الطباعة</CardTitle></CardHeader>
                <CardContent className='p-4 flex flex-col gap-2'>
                  <Button onClick={() => printablePolicyRef.current?.handleExport()} className="w-full">
                    <Icon name="Save" className="ml-2 h-4 w-4 inline" /> طباعة PDF
                  </Button>
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-3 bg-muted rounded-md flex items-center justify-center overflow-hidden">
              <ScrollArea className="h-full w-full">
                <div className="p-4 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p>استخدم SimplePrintDialog للطباعة</p>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-2">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>تحديد الموقع على الخريطة</DialogTitle>
            <DialogDescription>انقر على الخريطة لتحديد الموقع الدقيق للعنوان.</DialogDescription>
          </DialogHeader>
          <LocationPickerMap onLocationSelect={handleLocationSelect} />
        </DialogContent>
      </Dialog>

      <div className="space-y-4">

        {/* AI Quick Add - Enhanced Presence & Subtle Contrast */}
        <div className="rounded-xl border border-amber-200/70 dark:border-amber-700/30 bg-gradient-to-r from-amber-100/60 via-amber-50/40 to-orange-100/50 dark:from-amber-900/30 dark:via-slate-900 dark:to-orange-900/20 p-4 shadow-md transition-all duration-300 hover:shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3 md:w-56 shrink-0">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
                <Icon name="Sparkles" className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-amber-900 dark:text-amber-200">الإدخال السريع الذكي</span>
                <span className="text-[11px] text-amber-700/80 dark:text-amber-400/80 font-medium">لصق نص الطلب للتعبئة التلقائية</span>
              </div>
            </div>
            <div className="flex-1 w-full">
              <form action={formAction} className="flex gap-2 w-full">
                <Textarea
                  name="request"
                  placeholder="مثال: اوردر باسم احمد، هاتف 0791234567، عمان، 15 دينار..."
                  className="flex-1 min-h-[48px] h-[48px] text-sm bg-white dark:bg-slate-950 border-amber-300/50 focus-visible:ring-amber-500/50 resize-none py-3 shadow-inner"
                />
                <Button
                  type="submit"
                  className="h-[48px] px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md transition-all font-bold gap-2"
                  disabled={isAiPending || !selectedMerchantId}
                >
                  {isAiPending ? <Icon name="Loader2" className="animate-spin h-4 w-4" /> : <Icon name="Bot" className="h-4 w-4" />}
                  <span className="hidden sm:inline">{isAiPending ? 'تحليل...' : 'تعبئة'}</span>
                </Button>
              </form>
              {aiState.error && (
                <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
                  <Icon name="AlertCircle" className="h-3 w-3" />
                  {aiState.error}
                </div>
              )}
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAddOrder)} className="space-y-4">
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="space-y-3 p-0">
                {/* ── Form Sections ── */}
                <div className="space-y-3">
                  {/* Section 1: Customer Data */}
                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-900/60 p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="merchant-select" className="font-semibold text-slate-700 dark:text-slate-300">
                          المتجر <span className="text-red-500">*</span>
                        </Label>
                        <Popover open={merchantPopoverOpen} onOpenChange={setMerchantPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              id="merchant-select"
                              variant="outline"
                              role="combobox"
                              aria-expanded={merchantPopoverOpen}
                              className={cn(
                                "w-full justify-between h-10 font-normal",
                                selectedMerchantId ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20" : "text-muted-foreground"
                              )}
                            >
                              {selectedMerchantId ? (merchantOptions.find(m => m.id === selectedMerchantId)?.storeName || merchantOptions.find(m => m.id === selectedMerchantId)?.name) : "اختر متجرًا..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="بحث عن متجر..." />
                              <CommandList>
                                <CommandEmpty>لم يتم العثور على متجر.</CommandEmpty>
                                <CommandGroup>
                                  {merchantOptions.map(m => (
                                    <CommandItem
                                      key={m.id}
                                      value={m.storeName || m.name}
                                      onSelect={() => {
                                        setSelectedMerchantId(m.id);
                                        setMerchantPopoverOpen(false);
                                      }}
                                    >
                                      <Check className={cn("mr-2 h-4 w-4", selectedMerchantId === m.id ? "opacity-100" : "opacity-0")} />
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
                        <FormItem className="flex flex-col space-y-2">
                          <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">اسم المستلم</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="أدخل اسم المستلم" className="h-10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem className="flex flex-col space-y-2">
                          <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">رقم الهاتف</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="07xxxxxxxx" className="h-10" dir="ltr" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  {/* Section 2: Delivery Address */}
                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-900/60 p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      <FormField control={form.control} name="region" render={({ field }) => (
                        <FormItem className="flex flex-col space-y-2">
                          <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">المنطقة <span className="text-red-500">*</span></FormLabel>
                          <Popover open={regionPopoverOpen} onOpenChange={setRegionPopoverOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn("w-full justify-between h-10 font-normal", field.value ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20" : "text-muted-foreground")}
                                >
                                  {field.value
                                    ? allRegions.find(r => `${r.name}_${r.cityName}` === field.value)?.name
                                    : "اختر منطقة..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                                      <CommandItem
                                        value={`${r.name} ${r.cityName}`}
                                        key={`${r.id}-${r.cityName}`}
                                        onSelect={() => {
                                          form.setValue("region", `${r.name}_${r.cityName}`);
                                          setRegionPopoverOpen(false);
                                        }}
                                      >
                                        <Check className={cn("mr-2 h-4 w-4", `${r.name}_${r.cityName}` === field.value ? "opacity-100" : "opacity-0")} />
                                        {r.name} ({r.cityName})
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem className="flex flex-col space-y-2">
                          <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">المدينة</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly className="h-10 bg-muted" placeholder="تلقائي" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem className="flex flex-col space-y-2">
                          <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">العنوان التفصيلي (اختياري)</FormLabel>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input {...field} className="h-10" placeholder={lat && lng ? "تم التحديد على الخريطة" : "الشارع، البناية..."} />
                            </FormControl>
                            <Button type="button" variant="outline" size="icon" onClick={() => setIsMapOpen(true)} className={cn("h-10 w-10 shrink-0", lat && lng && 'bg-green-100 border-green-400 text-green-700')}>
                              <MapPin className="h-5 w-5" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  {/* Section 3: Payment Details */}
                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-900/60 p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      <FormField control={form.control} name="cod" render={({ field }) => (
                        <FormItem className="flex flex-col space-y-2">
                          <FormLabel className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            قيمة التحصيل (COD) <span className="text-orange-600 dark:text-orange-400 font-bold ml-1">({currencySymbol})</span>
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
                              className="h-10 text-base font-mono"
                              style={{ unicodeBidi: 'plaintext' }}
                              placeholder="0.00"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      
                      <div className="flex flex-col space-y-2">
                        <Label className="font-semibold text-slate-700 dark:text-slate-300 opacity-0 select-none hidden md:block">Spacer</Label>
                        <div className="flex items-center space-x-2 space-x-reverse bg-card px-4 h-10 rounded-md border border-input hover:border-blue-400 transition-colors cursor-pointer" onClick={() => setIsPrepaid((prev) => !prev)}>
                          <Checkbox id="isPrepaid" checked={isPrepaid} className="h-4 w-4 rounded pointer-events-none" />
                          <Label htmlFor="isPrepaid" className="font-medium cursor-pointer text-slate-700 dark:text-slate-300 w-full select-none pointer-events-none">
                            الطلب مدفوع مسبقًا
                          </Label>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <Label className="font-semibold text-slate-700 dark:text-slate-300">تفاصيل الرسوم</Label>
                        <div className="flex gap-4 rounded-md border border-border px-3 bg-muted/20 h-10 items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">التاجر:</span>
                            <span className="font-medium text-sm text-foreground">{formatCurrency(calculatedFees.itemPrice)}</span>
                          </div>
                          <Separator orientation="vertical" className="h-5 bg-border" />
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">التوصيل:</span>
                            <span className="font-medium text-sm text-foreground">{formatCurrency(calculatedFees.deliveryFee)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Extra Options (Unified Time and Notes) */}
                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-900/60 p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex flex-col space-y-4">
                      
                      {/* Unified Time Controls & Predefined Notes */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Time Control Toggle */}
                        <FormField
                          control={form.control}
                          name="deliveryTimeType"
                          render={({ field }) => (
                            <div className="flex bg-background p-1 rounded-md gap-1 border border-border shadow-sm shrink-0 items-center">
                              <div className="flex items-center px-2 text-xs font-semibold text-muted-foreground border-l border-border ml-1">
                                <Clock className="h-3.5 w-3.5 ml-1 text-orange-500" /> التوصيل
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
                                    "text-xs font-medium px-3 py-1.5 rounded-sm transition-all duration-200",
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
                          <Button key={note.text} type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-dashed" onClick={() => handleAddPredefinedNote(note.text)}>
                            <Icon name={note.icon} className="h-3.5 w-3.5 text-slate-500" />
                            {note.text}
                          </Button>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 items-start">
                        {/* Optional Time Input */}
                        {deliveryTimeType !== 'any' && (
                          <FormField
                            control={form.control}
                            name="deliveryTime"
                            render={({ field }) => (
                              <FormItem className="animate-in fade-in zoom-in duration-200 shrink-0 w-full sm:w-auto">
                                <FormControl><Input type="time" {...field} className="h-10 w-full sm:w-[150px]" /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {/* Textarea for Notes */}
                        <FormField control={form.control} name="notes" render={({ field }) => (
                          <FormItem className="flex-1 w-full">
                            <FormControl><Textarea {...field} placeholder="أضف ملاحظات إضافية للسائق هنا..." className="min-h-[40px] resize-y" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 border-t border-border p-6">
                <Button
                  type="submit"
                  size="lg"
                  disabled={!selectedMerchantId}
                  className="w-full h-11 text-base font-medium shadow-sm"
                >
                  <Icon name="Plus" className="mr-2 h-4 w-4" />
                  {selectedMerchantId ? 'تأكيد وإضافة الطلب' : 'الرجاء اختيار متجر أولاً'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>

        {recentlyAdded.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>طلبات مضافة حديثاً ({recentlyAdded.length})</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrintClick} disabled={selectedRecent.length === 0}><Printer className="h-4 w-4 ml-2" />طباعة بوليصة</Button>
                  <Button variant="destructive" size="sm" disabled={selectedRecent.length === 0} onClick={handleDeleteSelected}><Trash2 className="h-4 w-4 ml-2" />حذف المحدد</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center border-l"><Checkbox onCheckedChange={(checked) => handleSelectAllRecent(!!checked)} /></TableHead>
                    <TableHead className="text-center border-l">#</TableHead>
                    <TableHead className="text-center border-l">رقم الطلب</TableHead>
                    <TableHead className="text-center border-l w-48">المتجر</TableHead>
                    <TableHead className="text-center border-l w-48">المستلم</TableHead>
                    <TableHead className="text-center border-l w-40">الهاتف</TableHead>
                    <TableHead className="text-center border-l w-40">المنطقة</TableHead>
                    <TableHead className="text-center border-l w-32">المدينة</TableHead>
                    <TableHead className="text-center border-l w-32">قيمة التحصيل</TableHead>
                    <TableHead className="text-center w-40">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentlyAdded.map((order, index) => (
                    <TableRow key={order.id}>
                      <TableCell className="text-center border-l"><Checkbox checked={selectedRecent.includes(order.id)} onCheckedChange={() => handleSelectRecent(order.id)} /></TableCell>
                      <TableCell className="text-center border-l">{index + 1}</TableCell>
                      <TableCell className="text-center border-l font-mono text-xs">{order.id}</TableCell>
                      <TableCell className="text-center border-l">
                        <Popover open={popoverStates[`merchant-${order.id}`]} onOpenChange={() => togglePopover(`merchant-${order.id}`)}>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" className="w-full h-8 justify-between hover:bg-muted font-normal border">
                              {order.merchant}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
                            <Command>
                              <CommandInput placeholder="بحث..." />
                              <CommandList>
                                <CommandEmpty>لم يوجد.</CommandEmpty>
                                <CommandGroup>
                                  {merchantOptions.map(m => (
                                    <CommandItem
                                      key={m.id}
                                      value={m.storeName || m.name}
                                      onSelect={() => {
                                        handleUpdateRecentlyAdded(order.id, 'merchant', m.storeName || m.name);
                                        togglePopover(`merchant-${order.id}`);
                                      }}
                                    >
                                      <Check className={cn("mr-2 h-4 w-4", order.merchant === (m.storeName || m.name) ? "opacity-100" : "opacity-0")} />
                                      {m.storeName || m.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell className="text-center border-l">
                        <Input
                          value={order.recipient}
                          onChange={(e) => handleUpdateRecentlyAdded(order.id, 'recipient', e.target.value)}
                          className="h-8 text-center border-0 focus-visible:ring-offset-0 focus-visible:ring-0 bg-transparent hover:bg-muted"
                        />
                      </TableCell>
                      <TableCell className="text-center border-l">
                        <Input
                          value={order.phone}
                          onChange={(e) => handleUpdateRecentlyAdded(order.id, 'phone', e.target.value)}
                          className="h-8 text-center border-0 focus-visible:ring-offset-0 focus-visible:ring-0 bg-transparent hover:bg-muted"
                        />
                      </TableCell>
                      <TableCell className="text-center border-l">
                        <Popover open={popoverStates[`region-${order.id}`]} onOpenChange={() => togglePopover(`region-${order.id}`)}>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" className="w-full h-8 justify-between hover:bg-muted font-normal border">
                              {order.region}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
                            <Command>
                              <CommandInput placeholder="بحث..." />
                              <CommandList>
                                <CommandEmpty>لم يوجد.</CommandEmpty>
                                <CommandGroup>
                                  {allRegions.map(r => (
                                    <CommandItem
                                      key={`${r.id}-${r.cityName}`}
                                      value={`${r.name} ${r.cityName}`}
                                      onSelect={() => {
                                        handleUpdateRecentlyAdded(order.id, 'region', `${r.name}_${r.cityName}`);
                                        togglePopover(`region-${order.id}`);
                                      }}
                                    >
                                      <Check className={cn("mr-2 h-4 w-4", `${order.region}_${order.city}` === `${r.name}_${r.cityName}` ? "opacity-100" : "opacity-0")} />
                                      {r.name} ({r.cityName})
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell className="text-center border-l">{order.city}</TableCell>
                      <TableCell className="text-center border-l">
                        <Input
                          type="number"
                          value={order.cod}
                          onChange={(e) => handleUpdateRecentlyAdded(order.id, 'cod', parseFloat(e.target.value) || 0)}
                          className="h-8 text-center border-0 focus-visible:ring-offset-0 focus-visible:ring-0 bg-transparent hover:bg-muted"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleUpdateRecentlyAdded(order.id, 'status', value)}
                        >
                          <SelectTrigger className="h-8 text-center border-0 focus:ring-0 bg-transparent hover:bg-muted">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.filter(s => s.isActive).map(s => (
                              <SelectItem key={s.id} value={s.name}>
                                <div className="flex items-center gap-2">
                                  <Icon name={s.icon as any} style={{ color: s.color }} className="h-4 w-4" />
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
            </CardContent>
          </Card>
        )}
      </div>

      {/* Simple Print Dialog */}
      <SimplePrintDialog
        open={showEnhancedPrintDialog}
        onOpenChange={setShowEnhancedPrintDialog}
        selectedCount={selectedRecent.length}
        onPrint={handleEnhancedPrint}
        orders={recentlyAdded.filter(order => selectedRecent.includes(order.id))}
      />
    </>
  );
};

export default AddOrderPage;
