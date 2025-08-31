
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAreasStore } from '@/store/areas-store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// Mock data for price lists and prices - replace with a store later
const mockPriceLists = [
    { id: 'pl_1', name: 'الأسعار الافتراضية' },
    { id: 'pl_2', name: 'أسعار VIP' },
    { id: 'pl_3', name: 'أسعار المحافظات' },
];

export default function PriceListDetailPage() {
    const { toast } = useToast();
    const params = useParams();
    const { priceListId } = params;
    const { cities } = useAreasStore();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [prices, setPrices] = useState<Record<string, { delivery: string; return: string }>>({});

    const priceList = mockPriceLists.find(p => p.id === priceListId);
    
    const filteredCities = cities.filter(city => 
        city.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePriceChange = (areaId: string, type: 'delivery' | 'return', value: string) => {
        setPrices(prev => ({
            ...prev,
            [areaId]: {
                ...(prev[areaId] || { delivery: '', return: '' }),
                [type]: value,
            }
        }));
    };
    
    const handleSave = () => {
        // Here you would save the `prices` state to your backend/store
        console.log("Saving prices:", prices);
        toast({ title: "تم الحفظ", description: "تم تحديث الأسعار بنجاح."});
    }

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
                            حدد أسعار التوصيل والإرجاع لكل منطقة في قائمة الأسعار هذه.
                        </CardDescription>
                    </div>
                     <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/settings/pricing">
                            <Icon name="ArrowLeft" className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
            </Card>

            <Card>
                 <CardHeader>
                     <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">أسعار المناطق</CardTitle>
                         <div className="relative w-full sm:max-w-xs">
                            <Icon name="Search" className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                                placeholder="بحث عن مدينة..." 
                                className="pr-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                     </div>
                </CardHeader>
                <CardContent>
                    <Accordion type="multiple" className="w-full">
                        {filteredCities.map(city => (
                            <AccordionItem key={city.id} value={city.id}>
                                <AccordionTrigger className="hover:no-underline bg-muted/50 px-4 rounded-md">
                                    <div className="flex items-center gap-4">
                                        <Icon name="Map" className="h-5 w-5 text-primary" />
                                        <span className="font-semibold text-base">{city.name}</span>
                                        <span className="text-sm text-muted-foreground">({city.areas.length} منطقة)</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="text-right">المنطقة</TableHead>
                                                    <TableHead className="text-center w-[150px]">سعر التوصيل (د.أ)</TableHead>
                                                    <TableHead className="text-center w-[150px]">سعر الإرجاع (د.أ)</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                            {city.areas.map(area => (
                                                <TableRow key={area.id}>
                                                    <TableCell className="font-medium">{area.name}</TableCell>
                                                    <TableCell>
                                                        <Input 
                                                            type="number" 
                                                            className="text-center" 
                                                            placeholder="0.00"
                                                            value={prices[area.id]?.delivery || ''}
                                                            onChange={(e) => handlePriceChange(area.id, 'delivery', e.target.value)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                         <Input 
                                                            type="number" 
                                                            className="text-center" 
                                                            placeholder="0.00"
                                                            value={prices[area.id]?.return || ''}
                                                            onChange={(e) => handlePriceChange(area.id, 'return', e.target.value)}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
            
            <div className="flex justify-end pt-4">
                <Button size="lg" onClick={handleSave}>
                    <Icon name="Save" className="ml-2 h-4 w-4" /> حفظ كل التغييرات
                </Button>
            </div>
        </div>
    );
}

