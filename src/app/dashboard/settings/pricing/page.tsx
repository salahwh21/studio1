
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// Mock data, to be replaced with a Zustand store
type PriceList = {
  id: string;
  name: string;
  description: string;
  merchantCount: number;
};

const initialPriceLists: PriceList[] = [
  { id: 'pl_1', name: 'الأسعار الافتراضية', description: 'قائمة الأسعار الأساسية لجميع التجار الجدد (2 دينار عمان، 3 دنانير محافظات).', merchantCount: 25 },
  { id: 'pl_brands_of_less', name: 'Brands of less', description: 'قائمة أسعار خاصة لـ Brands of less.', merchantCount: 1 },
  { id: 'pl_soundrush', name: 'SoundRush', description: 'قائمة أسعار خاصة لـ SoundRush (1.5 دينار عمان، 2 دينار محافظات).', merchantCount: 1 },
  { id: 'pl_stress_killer', name: 'Stress Killer', description: 'قائمة أسعار خاصة لـ Stress Killer.', merchantCount: 1 },
  { id: 'pl_brandlet_outlet', name: 'Brandlet Outlet -1', description: 'قائمة أسعار خاصة لـ Brandlet Outlet -1.', merchantCount: 1 },
  { id: 'pl_nl_botique', name: 'N&L Botique', description: 'قائمة أسعار خاصة لـ N&L Botique.', merchantCount: 1 },
  { id: 'pl_d_boutique', name: 'D boutique -1', description: 'قائمة أسعار خاصة لـ D boutique -1.', merchantCount: 1 },
  { id: 'pl_macrame', name: 'Macrame -1', description: 'قائمة أسعار خاصة لـ Macrame -1.', merchantCount: 1 },
  { id: 'pl_jacks_nyc', name: 'Jacks NYC-1', description: 'قائمة أسعار خاصة لـ Jacks NYC-1.', merchantCount: 1 },
  { id: 'pl_bader', name: 'بدر', description: 'قائمة أسعار خاصة لـ بدر.', merchantCount: 1 },
  { id: 'pl_oud_aljadail', name: 'عود الجدايل', description: 'قائمة أسعار خاصة لـ عود الجدايل.', merchantCount: 1 },
  { id: 'pl_luxury_baskets', name: 'Luxury Baskets - 1', description: 'قائمة أسعار خاصة لـ Luxury Baskets - 1.', merchantCount: 1 },
  { id: 'pl_malek_mobile', name: 'مالك موبايل - 1', description: 'قائمة أسعار خاصة لـ مالك موبايل - 1.', merchantCount: 1 },
  { id: 'pl_oceansfounds', name: 'Oceansfounds -1', description: 'قائمة أسعار خاصة لـ Oceansfounds -1.', merchantCount: 1 },
  { id: 'pl_rubber_ducky', name: 'Rubber Ducky', description: 'قائمة أسعار خاصة لـ Rubber Ducky.', merchantCount: 1 },
  { id: 'pl_travelers_cart', name: 'Travelers Cart', description: 'قائمة أسعار خاصة لـ Travelers Cart.', merchantCount: 1 },
  { id: 'pl_liali', name: 'ليالي', description: 'قائمة أسعار خاصة لـ ليالي.', merchantCount: 1 },
  { id: 'pl_alsami_jadeed', name: 'السامي جديد', description: 'قائمة أسعار خاصة لـ السامي جديد.', merchantCount: 1 },
  { id: 'pl_watermelon', name: 'Watermelon', description: 'قائمة أسعار خاصة لـ Watermelon.', merchantCount: 1 },
  { id: 'pl_visionary_closet', name: 'Visionary Closet', description: 'قائمة أسعار خاصة لـ Visionary Closet.', merchantCount: 1 },
  { id: 'pl_the_beauty_spot', name: 'The beauty Spot', description: 'قائمة أسعار خاصة لـ The beauty Spot.', merchantCount: 1 },
  { id: 'pl_ibra_w_khayt', name: 'ابرة وخيط', description: 'قائمة أسعار خاصة لـ ابرة وخيط.', merchantCount: 1 },
  { id: 'pl_mashghal_saif', name: 'مشغل سيف', description: 'قائمة أسعار خاصة لـ مشغل سيف.', merchantCount: 1 },
  { id: 'pl_vintromatica', name: 'Vintromatica', description: 'قائمة أسعار خاصة لـ Vintromatica.', merchantCount: 1 },
  { id: 'pl_yari_jewelry', name: 'Yari Jewelry', description: 'قائمة أسعار خاصة لـ Yari Jewelry.', merchantCount: 1 },
  { id: 'pl_uniart', name: 'Uniart', description: 'قائمة أسعار خاصة لـ Uniart.', merchantCount: 1 },
  { id: 'pl_salat', name: 'Salat', description: 'قائمة أسعار خاصة لـ Salat.', merchantCount: 1 },
  { id: 'pl_hedoomcom', name: 'هدومكم', description: 'قائمة أسعار خاصة لـ هدومكم.', merchantCount: 1 },
  { id: 'pl_attara_zaloom', name: 'عطارة زلوم', description: 'قائمة أسعار خاصة لـ عطارة زلوم.', merchantCount: 1 },
  { id: 'pl_arqia_perfumes', name: 'ارقية للبخور', description: 'قائمة أسعار خاصة لـ ارقية للبخور.', merchantCount: 1 },
  { id: 'pl_hodi_hodi', name: 'هودي هودي', description: 'قائمة أسعار خاصة لـ هودي هودي.', merchantCount: 1 },
  { id: 'pl_banan_khader', name: 'بنان خضر', description: 'قائمة أسعار خاصة لـ بنان خضر.', merchantCount: 1 },
  { id: 'pl_k_by_women', name: 'k by women', description: 'قائمة أسعار خاصة لـ k by women', merchantCount: 1 },
  { id: 'pl_memories_store', name: 'Memories Store', description: 'قائمة أسعار خاصة لـ Memories Store', merchantCount: 1 },
  { id: 'pl_ro_designs', name: 'Ro Designs', description: 'قائمة أسعار خاصة لـ Ro Designs', merchantCount: 1 },
];

const PriceListCard = ({ list, onEdit, onDelete }: { list: PriceList; onEdit: (list: PriceList) => void; onDelete: (list: PriceList) => void; }) => {
    const router = useRouter();

    return (
        <Card className="hover:border-primary hover:shadow-lg transition-all duration-300 ease-in-out flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                     <div className="space-y-2 flex-1 cursor-pointer" onClick={() => router.push(`/dashboard/settings/pricing/${list.id}`)}>
                        <CardTitle className="text-xl font-bold">{list.name}</CardTitle>
                        <CardDescription className="mt-2">{list.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><Icon name="MoreVertical" className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => onEdit(list)}>تعديل</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => onDelete(list)} className="text-destructive">حذف</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="flex-grow mt-auto">
                <div className="flex justify-between items-center text-sm text-muted-foreground border-t pt-4">
                    <div className="flex items-center gap-2">
                        <Icon name="Users" className="h-4 w-4"/>
                        <span>{list.merchantCount} تجار</span>
                    </div>
                     <Button variant="secondary" onClick={() => router.push(`/dashboard/settings/pricing/${list.id}`)}>
                        <Icon name="Settings" className="mr-2 h-4 w-4" />
                        إدارة الأسعار
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const PriceListDialog = ({ open, onOpenChange, onSave, list }: { open: boolean, onOpenChange: (open: boolean) => void, onSave: (data: Omit<PriceList, 'id' | 'merchantCount'>) => void, list: PriceList | null }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    React.useEffect(() => {
        if(list) {
            setName(list.name);
            setDescription(list.description);
        } else {
            setName('');
            setDescription('');
        }
    }, [list, open]);

    const handleSave = () => {
        onSave({ name, description });
    }
    
    return (
         <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{list ? 'تعديل قائمة الأسعار' : 'إضافة قائمة أسعار جديدة'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">اسم القائمة</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">الوصف</Label>
                        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                         <Button variant="outline">إلغاء</Button>
                    </DialogClose>
                    <Button onClick={handleSave}>حفظ</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function PricingPage() {
    const { toast } = useToast();
    const [priceLists, setPriceLists] = useState(initialPriceLists);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedList, setSelectedList] = useState<PriceList | null>(null);
    const [listToDelete, setListToDelete] = useState<PriceList | null>(null);

    const handleAddNew = () => {
        setSelectedList(null);
        setDialogOpen(true);
    };

    const handleEdit = (list: PriceList) => {
        setSelectedList(list);
        setDialogOpen(true);
    };

    const handleDelete = (list: PriceList) => {
        setListToDelete(list);
    };

    const confirmDelete = () => {
        if (listToDelete) {
            setPriceLists(prev => prev.filter(p => p.id !== listToDelete.id));
            toast({ title: "تم الحذف", description: `تم حذف قائمة "${listToDelete.name}" بنجاح.`});
            setListToDelete(null);
        }
    };
  
    const handleSave = (data: Omit<PriceList, 'id' | 'merchantCount'>) => {
        if (selectedList) {
            setPriceLists(prev => prev.map(p => p.id === selectedList.id ? { ...p, ...data } : p));
            toast({ title: "تم التعديل", description: `تم تعديل قائمة "${data.name}" بنجاح.`});
        } else {
            setPriceLists(prev => [...prev, { ...data, id: `pl_${Date.now()}`, merchantCount: 0 }]);
            toast({ title: "تمت الإضافة", description: `تمت إضافة قائمة "${data.name}" بنجاح.`});
        }
        setDialogOpen(false);
    };
 
    return (
        <div className="space-y-6">
            <Card className="shadow-sm">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Icon name="DollarSign" /> قوائم الأسعار
                        </CardTitle>
                        <CardDescription className="mt-1">
                            إنشاء وتعديل قوائم أسعار التوصيل المختلفة للتحكم في تكاليف الشحن.
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/dashboard/settings"><Icon name="ArrowLeft" className="h-4 w-4" /></Link>
                        </Button>
                        <Button onClick={handleAddNew}>
                            <Icon name="PlusCircle" className="mr-2 h-4 w-4" /> إضافة قائمة جديدة
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {priceLists.map(list => (
                    <PriceListCard 
                        key={list.id} 
                        list={list}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
            
            <PriceListDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSave={handleSave}
                list={selectedList}
            />
            
            <AlertDialog open={!!listToDelete} onOpenChange={() => setListToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                        <AlertDialogDescription>
                            هل أنت متأكد من حذف قائمة "{listToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
