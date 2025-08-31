
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import {
  useAreasStore,
  type City,
  type Area,
} from '@/store/areas-store';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Sub-component for displaying cities as cards
const CitiesView = ({
  cities,
  onAddCity,
  onEditCity,
  onDeleteCity,
  onSelectCity,
}: {
  cities: City[];
  onAddCity: () => void;
  onEditCity: (city: City) => void;
  onDeleteCity: (city: City) => void;
  onSelectCity: (city: City) => void;
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const filteredCities = cities.filter(city => city.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="space-y-6">
            <Card className="shadow-sm">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Icon name="MapPin" /> إدارة المناطق
                        </CardTitle>
                        <CardDescription className="mt-1">
                        إدارة المدن والمناطق التي تتم خدمتها في عمليات التوصيل.
                        </CardDescription>
                    </div>
                     <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/settings">
                        <Icon name="ArrowLeft" className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                     <div className="relative w-full sm:max-w-xs">
                        <Icon name="Search" className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                            placeholder="بحث عن مدينة..." 
                            className="pr-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 sm:mr-auto">
                         <Button onClick={onAddCity}>
                            <Icon name="PlusCircle" className="mr-2 h-4 w-4" /> إضافة مدينة
                        </Button>
                        <Button variant="outline"><Icon name="Upload" className="mr-2 h-4 w-4" /> استيراد</Button>
                        <Button variant="outline"><Icon name="Download" className="mr-2 h-4 w-4" /> تصدير</Button>
                    </div>
                </div>
            </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCities.map((city) => (
                <Card key={city.id} className="hover:border-primary hover:shadow-lg transition-all duration-300 ease-in-out flex flex-col">
                <CardHeader>
                    <div className="flex justify-between items-start">
                    <div className="space-y-1 cursor-pointer" onClick={() => onSelectCity(city)}>
                        <CardTitle className="text-xl font-bold">{city.name}</CardTitle>
                        <CardDescription>
                        {city.areas.length} مناطق
                        </CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Icon name="MoreVertical" className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => onEditCity(city)}>
                            تعديل
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => onDeleteCity(city)} className="text-destructive">
                            حذف
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                </CardHeader>
                <CardFooter className="mt-auto">
                    <Button onClick={() => onSelectCity(city)} className="w-full">
                    <Icon name="List" className="mr-2 h-4 w-4" />
                    عرض المناطق
                    </Button>
                </CardFooter>
                </Card>
            ))}
            </div>
        </div>
    )
};


// Sub-component for displaying areas within a city
const AreasView = ({
  city,
  onBack,
  onAddArea,
  onEditArea,
  onDeleteArea,
}: {
  city: City;
  onBack: () => void;
  onAddArea: () => void;
  onEditArea: (area: Area) => void;
  onDeleteArea: (area: Area) => void;
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const filteredAreas = city.areas.filter(area => area.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
             <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Icon name="MapPin" /> مناطق مدينة: {city.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                        إدارة المناطق التابعة لهذه المدينة.
                    </CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={onBack}>
                    <Icon name="ArrowLeft" className="h-4 w-4" />
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                 <div className="relative w-full sm:max-w-xs">
                    <Icon name="Search" className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                        placeholder="بحث عن منطقة..." 
                        className="pr-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 sm:mr-auto">
                    <Button onClick={onAddArea}>
                        <Icon name="PlusCircle" className="mr-2 h-4 w-4" /> إضافة منطقة جديدة
                    </Button>
                </div>
            </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم المنطقة</TableHead>
                <TableHead>معرّف المنطقة</TableHead>
                <TableHead className="text-left">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAreas.length > 0 ? filteredAreas.map((area) => (
                <TableRow key={area.id}>
                  <TableCell className="font-medium">{area.name}</TableCell>
                  <TableCell>{area.id}</TableCell>
                  <TableCell className="text-left">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><Icon name="MoreVertical" className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => onEditArea(area)}>تعديل</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onDeleteArea(area)} className="text-destructive">حذف</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                       لا توجد نتائج للبحث أو لم تتم إضافة مناطق بعد.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    )
};


// Dialog for Adding/Editing Cities and Areas
const AreaDialog = ({
  open,
  onOpenChange,
  onSave,
  entity,
  type,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => void;
  entity: City | Area | null;
  type: 'city' | 'area';
}) => {
  const [name, setName] = useState('');

  // Use an effect to update the local state when the dialog opens or the selected entity changes.
  // This ensures the input field has the correct value when editing.
  useState(() => {
    if (open && entity) {
      setName(entity.name);
    } else if (open) {
      setName('');
    }
  }, [entity, open]);


  const handleSave = () => {
    onSave(name);
  };
  
  const title = entity ? `تعديل ${type === 'city' ? 'مدينة' : 'منطقة'}` : `إضافة ${type === 'city' ? 'مدينة' : 'منطقة'} جديدة`;
  const description = entity ? `قم بتعديل اسم ${type === 'city' ? 'المدينة' : 'المنطقة'}.` : `أدخل اسم ${type === 'city' ? 'المدينة' : 'المنطقة'} الجديدة.`;
  const label = `اسم ${type === 'city' ? 'المدينة' : 'المنطقة'}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="name">{label}</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
          <Button onClick={handleSave}>حفظ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default function AreasPage() {
  const { toast } = useToast();
  const { cities, addCity, updateCity, deleteCity, addArea, updateArea, deleteArea } = useAreasStore();
  
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'city' | 'area'>('city');
  const [selectedEntity, setSelectedEntity] = useState<City | Area | null>(null);
  const [entityToDelete, setEntityToDelete] = useState<City | Area | null>(null);
  const [deleteType, setDeleteType] = useState<'city' | 'area'>('city');

  // Handlers for Cities
  const handleAddCity = () => {
    setSelectedEntity(null);
    setDialogType('city');
    setDialogOpen(true);
  };

  const handleEditCity = (city: City) => {
    setSelectedEntity(city);
    setDialogType('city');
    setDialogOpen(true);
  };

  const handleDeleteCity = (city: City) => {
    setEntityToDelete(city);
    setDeleteType('city');
  };

  // Handlers for Areas
  const handleAddArea = () => {
    setSelectedEntity(null);
    setDialogType('area');
    setDialogOpen(true);
  };

  const handleEditArea = (area: Area) => {
      setSelectedEntity(area);
      setDialogType('area');
      setDialogOpen(true);
  };
  
  const handleDeleteArea = (area: Area) => {
      setEntityToDelete(area);
      setDeleteType('area');
  };

  // Generic save handler
  const handleSave = (name: string) => {
    if (!name) {
        toast({
            variant: 'destructive',
            title: 'خطأ',
            description: 'الاسم لا يمكن أن يكون فارغًا.'
        });
        return;
    }
    if (dialogType === 'city') {
      if (selectedEntity) { // Editing city
        updateCity(selectedEntity.id, { name });
        toast({ title: 'تم التعديل', description: 'تم تحديث المدينة بنجاح.' });
      } else { // Adding city
        addCity(name);
        toast({ title: 'تمت الإضافة', description: 'تمت إضافة المدينة بنجاح.' });
      }
    } else { // It's an 'area'
        if (selectedCity) {
            if (selectedEntity) { // Editing area
                updateArea(selectedCity.id, selectedEntity.id, { name });
                toast({ title: 'تم التعديل', description: 'تم تحديث المنطقة بنجاح.' });
            } else { // Adding area
                addArea(selectedCity.id, name);
                toast({ title: 'تمت الإضافة', description: 'تمت إضافة المنطقة بنجاح.' });
            }
            // Update the selectedCity view with the latest data
            const updatedCity = useAreasStore.getState().cities.find(c => c.id === selectedCity.id);
            if (updatedCity) {
                setSelectedCity(updatedCity);
            }
        }
    }
    setDialogOpen(false);
  };

  const confirmDelete = () => {
      if (!entityToDelete) return;
      if (deleteType === 'city') {
          deleteCity(entityToDelete.id);
          toast({ title: 'تم الحذف', description: `تم حذف مدينة "${entityToDelete.name}" بنجاح.` });
      } else if (selectedCity) {
          deleteArea(selectedCity.id, entityToDelete.id);
          const updatedCity = useAreasStore.getState().cities.find(c => c.id === selectedCity.id);
          if (updatedCity) {
            setSelectedCity(updatedCity);
          }
          toast({ title: 'تم الحذف', description: `تم حذف منطقة "${entityToDelete.name}" بنجاح.` });
      }
      setEntityToDelete(null);
  };
  

  if (selectedCity) {
    // Find the latest version of the city from the store in case it was updated
    const currentCityData = cities.find(c => c.id === selectedCity.id);
    if (!currentCityData) {
        // City was deleted, so go back
        setSelectedCity(null);
        return null;
    }
    return (
        <AreasView 
            city={currentCityData}
            onBack={() => setSelectedCity(null)}
            onAddArea={handleAddArea}
            onEditArea={handleEditArea}
            onDeleteArea={handleDeleteArea}
        />
    )
  }

  return (
    <>
      <CitiesView
        cities={cities}
        onAddCity={handleAddCity}
        onEditCity={handleEditCity}
        onDeleteCity={handleDeleteCity}
        onSelectCity={setSelectedCity}
      />
      <AreaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        entity={selectedEntity}
        type={dialogType}
      />
       <AlertDialog open={!!entityToDelete} onOpenChange={() => setEntityToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                    <AlertDialogDescription>
                        هل أنت متأكد من حذف "{entityToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}

    