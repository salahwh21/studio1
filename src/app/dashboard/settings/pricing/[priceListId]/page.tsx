
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAreasStore, type City } from '@/store/areas-store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

// Mock data for price lists - replace with a store later
const mockPriceLists = [
    { id: 'pl_1', name: 'الأسعار الافتراضية' },
    { id: 'pl_2', name: 'أسعار VIP' },
    { id: 'pl_3', name: 'أسعار المحافظات' },
];

type PricingRule = {
    id: string;
    name: string;
    fromCities: string[]; // Array of city IDs
    toCities: string[]; // Array of city IDs
    price: string;
}

const generateId = () => `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const CitySelectionDialog = ({
    cities,
    selectedCities,
    onSelectionChange,
    trigger
}: {
    cities: City[],
    selectedCities: string[],
    onSelectionChange: (selected: string[]) => void,
    trigger: React.ReactNode
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentSelection, setCurrentSelection] = useState(selectedCities);

    useEffect(() => {
        if(isOpen) {
            setCurrentSelection(selectedCities);
        }
    }, [isOpen, selectedCities]);
    
    const handleSelectAll = () => {
        setCurrentSelection(cities.map(c => c.id));
    }

    const handleSave = () => {
        onSelectionChange(currentSelection);
        setIsOpen(false);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>اختر المدن</DialogTitle>
                </DialogHeader>
                 <div className="flex items-center gap-2 my-2">
                    <Button variant="outline" size="sm" onClick={handleSelectAll}>تحديد الكل</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentSelection([])}>مسح الكل</Button>
                </div>
                <ScrollArea className="h-72 border rounded-md p-4">
                    <div className="space-y-2">
                    {cities.map(city => (
                        <div key={city.id} className="flex items-center space-x-2 space-x-reverse">
                            <Checkbox 
                                id={`city-${city.id}`}
                                checked={currentSelection.includes(city.id)}
                                onCheckedChange={(checked) => {
                                    setCurrentSelection(prev => 
                                        checked ? [...prev, city.id] : prev.filter(id => id !== city.id)
                                    )
                                }}
                            />
                            <label htmlFor={`city-${city.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {city.name}
                            </label>
                        </div>
                    ))}
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>إلغاء</Button>
                    <Button onClick={handleSave}>حفظ الاختيار</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function PriceListDetailPage() {
    const { toast } = useToast();
    const params = useParams();
    const { priceListId } = params;
    const { cities } = useAreasStore();
    
    const [rules, setRules] = useState<PricingRule[]>([]);
    
    const priceList = mockPriceLists.find(p => p.id === priceListId);

    const handleAddRule = () => {
        setRules(prev => [...prev, {
            id: generateId(),
            name: '',
            fromCities: [],
            toCities: [],
            price: ''
        }]);
    };

    const handleRuleChange = (ruleId: string, field: keyof PricingRule, value: any) => {
        setRules(prev => prev.map(rule => rule.id === ruleId ? { ...rule, [field]: value } : rule));
    }
    
    const handleDeleteRule = (ruleId: string) => {
        setRules(prev => prev.filter(rule => rule.id !== ruleId));
        toast({ title: "تم الحذف", description: "تم حذف بند التسعير." });
    }

    const handleSaveRule = (ruleId: string) => {
        const rule = rules.find(r => r.id === ruleId);
        if (!rule || !rule.name || rule.fromCities.length === 0 || rule.toCities.length === 0 || !rule.price) {
            toast({ variant: 'destructive', title: "خطأ", description: "الرجاء ملء جميع الحقول قبل الحفظ." });
            return;
        }
        // Here you would save the rule to your backend/store
        console.log("Saving rule:", rule);
        toast({ title: "تم الحفظ", description: `تم حفظ بند "${rule.name}" بنجاح.`});
    }

    const CitySelectionButton = ({ selectedCityIds, onSelectionChange }: { selectedCityIds: string[], onSelectionChange: (ids: string[]) => void }) => {
        let text = 'اختر المدن';
        if (selectedCityIds.length === cities.length) {
            text = 'كل المدن';
        } else if (selectedCityIds.length > 1) {
            text = `${selectedCityIds.length} مدن`;
        } else if (selectedCityIds.length === 1) {
            text = cities.find(c => c.id === selectedCityIds[0])?.name || 'مدينة واحدة';
        }

        return (
            <CitySelectionDialog
                cities={cities}
                selectedCities={selectedCityIds}
                onSelectionChange={onSelectionChange}
                trigger={<Button variant="outline" className="w-full justify-start text-right">{text}</Button>}
            />
        )
    };


    if (!priceList) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                           <Icon name="DollarSign" /> إدارة أسعار: {priceList.name}
                        </CardTitle>
                         <CardDescription className="mt-1">
                            إضافة وتعديل بنود التسعير لهذه القائمة.
                        </CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/dashboard/settings/pricing">
                                <Icon name="ArrowLeft" className="h-4 w-4" />
                            </Link>
                        </Button>
                         <Button onClick={handleAddRule}>
                            <Icon name="PlusCircle" className="h-4 w-4 ml-2" /> إضافة بند تسعير
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardContent className="p-0">
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[250px] text-right">اسم البند</TableHead>
                                <TableHead className="w-[200px] text-right">من (المدن المصدر)</TableHead>
                                <TableHead className="w-[200px] text-right">إلى (المدن الوجهة)</TableHead>
                                <TableHead className="w-[120px] text-right">السعر (د.أ)</TableHead>
                                <TableHead className="text-center w-[150px]">إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {rules.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="h-24 text-center">لم تتم إضافة بنود تسعير بعد.</TableCell></TableRow>
                        ) : (
                            rules.map((rule) => (
                                <TableRow key={rule.id}>
                                    <TableCell>
                                        <Input 
                                            placeholder="مثال: توصيل داخل عمان" 
                                            value={rule.name}
                                            onChange={(e) => handleRuleChange(rule.id, 'name', e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                       <CitySelectionButton 
                                            selectedCityIds={rule.fromCities}
                                            onSelectionChange={(ids) => handleRuleChange(rule.id, 'fromCities', ids)}
                                       />
                                    </TableCell>
                                    <TableCell>
                                        <CitySelectionButton 
                                            selectedCityIds={rule.toCities}
                                            onSelectionChange={(ids) => handleRuleChange(rule.id, 'toCities', ids)}
                                       />
                                    </TableCell>
                                    <TableCell>
                                         <Input 
                                            type="number" 
                                            placeholder="2.50"
                                            value={rule.price}
                                            onChange={(e) => handleRuleChange(rule.id, 'price', e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleSaveRule(rule.id)}>
                                                <Icon name="Save" className="h-4 w-4 text-primary" />
                                            </Button>
                                             <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(rule.id)}>
                                                <Icon name="Trash2" className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
