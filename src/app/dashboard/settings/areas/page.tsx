
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

// Sub-component for displaying cities as cards
const CitiesView = ({
  cities,
  selectedCities,
  onAddCity,
  onEditCity,
  onDeleteCities,
  onSelectCity,
  onSelectionChange,
  onImport,
  onExport,
}: {
  cities: City[];
  selectedCities: string[];
  onAddCity: () => void;
  onEditCity: (city: City) => void;
  onDeleteCities: (ids: string[]) => void;
  onSelectCity: (city: City) => void;
  onSelectionChange: (id: string, checked: boolean) => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const filteredCities = cities.filter(city => city.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const importInputRef = useRef<HTMLInputElement>(null);

    const handleSelectAll = (checked: boolean) => {
        const allCityIds = filteredCities.map(c => c.id);
        allCityIds.forEach(id => onSelectionChange(id, checked));
    }

    const isAllSelected = filteredCities.length > 0 && selectedCities.length === filteredCities.length;

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
                        <div className="flex items-center gap-2 sm:ml-auto">
                            {selectedCities.length > 0 ? (
                                <>
                                    <span className="text-sm text-muted-foreground">{selectedCities.length} محدد</span>
                                    <Separator orientation="vertical" className="h-6 mx-2" />
                                    <Button variant="outline" size="sm" onClick={() => onEditCity(cities.find(c => c.id === selectedCities[0])!)} disabled={selectedCities.length !== 1}>
                                        <Icon name="Edit" className="h-4 w-4 ml-2" /> تعديل
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => onDeleteCities(selectedCities)}>
                                        <Icon name="Trash2" className="h-4 w-4 ml-2" /> حذف
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button onClick={onAddCity}>
                                        <Icon name="PlusCircle" className="mr-2 h-4 w-4" /> إضافة مدينة
                                    </Button>
                                    <Button variant="outline" onClick={() => importInputRef.current?.click()}>
                                        <Icon name="Upload" className="mr-2 h-4 w-4" /> استيراد
                                    </Button>
                                    <input type="file" ref={importInputRef} className="hidden" accept=".json" onChange={onImport} />
                                    <Button variant="outline" onClick={onExport}><Icon name="Download" className="mr-2 h-4 w-4" /> تصدير</Button>
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center px-2">
                <Checkbox id="select-all-cities" onCheckedChange={(checked) => handleSelectAll(!!checked)} checked={isAllSelected} />
                <Label htmlFor="select-all-cities" className="mr-2">تحديد كل المدن</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCities.map((city) => (
                <Card 
                    key={city.id} 
                    className="hover:border-primary hover:shadow-lg transition-all duration-300 ease-in-out flex flex-col data-[state=checked]:border-primary data-[state=checked]:ring-2 data-[state=checked]:ring-primary"
                    data-state={selectedCities.includes(city.id) ? 'checked' : 'unchecked'}
                >
                    <CardHeader>
                         <div className="flex justify-between items-start">
                             <div className="space-y-1 cursor-pointer flex-1" onClick={() => onSelectCity(city)}>
                                <CardTitle className="text-xl font-bold">{city.name}</CardTitle>
                                <CardDescription>{city.areas.length} مناطق</CardDescription>
                            </div>
                            <Checkbox 
                                className="h-5 w-5"
                                checked={selectedCities.includes(city.id)} 
                                onCheckedChange={(checked) => onSelectionChange(city.id, !!checked)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="mt-auto">
                        <Button variant="secondary" onClick={() => onSelectCity(city)} className="w-full">
                            <Icon name="List" className="mr-2 h-4 w-4" />
                            عرض المناطق
                        </Button>
                    </CardContent>
                </Card>
            ))}
            </div>
        </div>
    )
};


// Sub-component for displaying areas within a city
const AreasView = ({
  city,
  selectedAreas,
  onBack,
  onAddArea,
  onEditArea,
  onDeleteAreas,
  onSelectionChange,
}: {
  city: City;
  selectedAreas: string[];
  onBack: () => void;
  onAddArea: () => void;
  onEditArea: (area: Area) => void;
  onDeleteAreas: (ids: string[]) => void;
  onSelectionChange: (id: string, checked: boolean) => void;
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const filteredAreas = city.areas.filter(area => area.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const handleSelectAll = (checked: boolean) => {
        const allAreaIds = filteredAreas.map(a => a.id);
        allAreaIds.forEach(id => onSelectionChange(id, checked));
    }
    
    const isAllSelected = filteredAreas.length > 0 && selectedAreas.length === filteredAreas.length;
    const isIndeterminate = selectedAreas.length > 0 && selectedAreas.length < filteredAreas.length;

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
                <div className="flex gap-2 sm:ml-auto">
                    {selectedAreas.length > 0 ? (
                        <>
                            <span className="text-sm text-muted-foreground">{selectedAreas.length} محدد</span>
                            <Separator orientation="vertical" className="h-6 mx-2" />
                            <Button variant="outline" size="sm" onClick={() => onEditArea(city.areas.find(a => a.id === selectedAreas[0])!)} disabled={selectedAreas.length !== 1}>
                                <Icon name="Edit" className="h-4 w-4 ml-2" /> تعديل
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => onDeleteAreas(selectedAreas)}>
                                <Icon name="Trash2" className="h-4 w-4 ml-2" /> حذف
                            </Button>
                        </>
                    ) : (
                        <Button onClick={onAddArea}>
                            <Icon name="PlusCircle" className="mr-2 h-4 w-4" /> إضافة منطقة جديدة
                        </Button>
                    )}
                </div>
            </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center w-[60px] px-4">
                   <Checkbox onCheckedChange={(checked) => handleSelectAll(!!checked)} checked={isAllSelected} indeterminate={isIndeterminate} aria-label="Select all rows" />
                </TableHead>
                 <TableHead className="text-center w-[80px] px-4 border-l">#</TableHead>
                <TableHead className="text-right px-4 border-l">اسم المنطقة</TableHead>
                <TableHead className="text-right px-4 border-l">معرّف المنطقة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAreas.length > 0 ? filteredAreas.map((area, index) => (
                <TableRow key={area.id} data-state={selectedAreas.includes(area.id) ? 'checked' : 'unchecked'}>
                    <TableCell className="text-center px-4">
                        <Checkbox checked={selectedAreas.includes(area.id)} onCheckedChange={(checked) => onSelectionChange(area.id, !!checked)} />
                    </TableCell>
                    <TableCell className="text-center px-4 border-l">{index + 1}</TableCell>
                    <TableCell className="font-medium text-right px-4 border-l">{area.name}</TableCell>
                    <TableCell className="font-mono text-muted-foreground text-right px-4 border-l">{area.id}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
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
  onSave: (name: string, id?: string) => void;
  entity: City | Area | null;
  type: 'city' | 'area';
}) => {
  const [name, setName] = useState('');
  const [id, setId] = useState('');

  // Use an effect to update the local state when the dialog opens or the selected entity changes.
  useEffect(() => {
    if (open && entity) {
      setName(entity.name);
      setId(entity.id)
    } else if (open) {
      setName('');
      setId('');
    }
  }, [entity, open]);


  const handleSave = () => {
    onSave(name, selectedEntity ? undefined : (id || undefined));
  };
  
  const title = entity ? `تعديل ${type === 'city' ? 'مدينة' : 'منطقة'}` : `إضافة ${type === 'city' ? 'مدينة' : 'منطقة'} جديدة`;
  const description = entity ? `قم بتعديل اسم ${type === 'city' ? 'المدينة' : 'المنطقة'}.` : `أدخل اسم ${type === 'city' ? 'المدينة' : 'المنطقة'} الجديدة.`;
  const label = `اسم ${type === 'city' ? 'المدينة' : 'المنطقة'}`;
  const idLabel = `معرف ${type === 'city' ? 'المدينة' : 'المنطقة'}`;


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{label}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          {!entity && (
             <div className="space-y-2">
                <Label htmlFor="id">{idLabel} (اختياري)</Label>
                <Input id="id" value={id} onChange={(e) => setId(e.target.value)} placeholder="مثال: amman_downtown" />
            </div>
          )}
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
  const { cities, setCities, addCity, updateCity, deleteCity, addArea, updateArea, deleteArea } = useAreasStore();
  
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'city' | 'area'>('city');
  const [selectedEntity, setSelectedEntity] = useState<City | Area | null>(null);
  const [entityToDelete, setEntityToDelete] = useState<(City | Area)[] | null>(null);
  const [deleteType, setDeleteType] = useState<'city' | 'area'>('city');

  const [selectedCityIds, setSelectedCityIds] = useState<string[]>([]);
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);

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

  const handleDeleteCities = (ids: string[]) => {
      const citiesToDelete = cities.filter(c => ids.includes(c.id));
      setEntityToDelete(citiesToDelete);
      setDeleteType('city');
  };

  const handleCitySelection = (id: string, checked: boolean) => {
      setSelectedCityIds(prev => checked ? [...prev, id] : prev.filter(cityId => cityId !== id));
  }

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
  
  const handleDeleteAreas = (ids: string[]) => {
      if (!selectedCity) return;
      const areasToDelete = selectedCity.areas.filter(a => ids.includes(a.id));
      setEntityToDelete(areasToDelete);
      setDeleteType('area');
  };
  
  const handleAreaSelection = (id: string, checked: boolean) => {
      setSelectedAreaIds(prev => checked ? [...prev, id] : prev.filter(areaId => areaId !== id));
  }

  // Generic save handler
  const handleSave = (name: string, id?: string) => {
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
        addCity(name, id);
        toast({ title: 'تمت الإضافة', description: 'تمت إضافة المدينة بنجاح.' });
      }
      setSelectedCityIds([]);
    } else { // It's an 'area'
        if (selectedCity) {
            if (selectedEntity) { // Editing area
                updateArea(selectedCity.id, selectedEntity.id, { name });
                toast({ title: 'تم التعديل', description: 'تم تحديث المنطقة بنجاح.' });
            } else { // Adding area
                addArea(selectedCity.id, name, id);
                toast({ title: 'تمت الإضافة', description: 'تمت إضافة المنطقة بنجاح.' });
            }
            setSelectedAreaIds([]);
            const updatedCity = useAreasStore.getState().cities.find(c => c.id === selectedCity.id);
            if (updatedCity) setSelectedCity(updatedCity);
        }
    }
    setDialogOpen(false);
  };

  const confirmDelete = () => {
      if (!entityToDelete) return;
      if (deleteType === 'city') {
          entityToDelete.forEach(entity => deleteCity(entity.id));
          toast({ title: 'تم الحذف', description: `تم حذف ${entityToDelete.length} مدن بنجاح.` });
          setSelectedCityIds([]);
      } else if (selectedCity) {
          entityToDelete.forEach(entity => deleteArea(selectedCity.id, entity.id));
          const updatedCity = useAreasStore.getState().cities.find(c => c.id === selectedCity.id);
          if (updatedCity) setSelectedCity(updatedCity);
          toast({ title: 'تم الحذف', description: `تم حذف ${entityToDelete.length} مناطق بنجاح.` });
          setSelectedAreaIds([]);
      }
      setEntityToDelete(null);
  };
  
    // Import/Export Handlers
    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("File is not readable");
                }
                const importedCities: City[] = JSON.parse(text);
                // Basic validation
                if (!Array.isArray(importedCities) || !importedCities.every(c => c.id && c.name && Array.isArray(c.areas))) {
                    throw new Error("Invalid file format");
                }
                setCities(importedCities);
                toast({ title: 'تم الاستيراد بنجاح', description: `تم استيراد ${importedCities.length} مدينة.` });
            } catch (error) {
                toast({ variant: 'destructive', title: 'فشل الاستيراد', description: 'الملف غير صالح أو تالف.' });
            }
        };
        reader.readAsText(file);
        // Reset file input
        event.target.value = '';
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(cities, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', 'cities_and_areas.json');
        linkElement.click();
        
        toast({ title: 'تم التصدير بنجاح' });
    };


  if (selectedCity) {
    const currentCityData = cities.find(c => c.id === selectedCity.id);
    if (!currentCityData) {
        setSelectedCity(null);
        return null;
    }
    return (
        <>
            <AreasView 
                city={currentCityData}
                selectedAreas={selectedAreaIds}
                onBack={() => {
                    setSelectedCity(null);
                    setSelectedAreaIds([]);
                }}
                onAddArea={handleAddArea}
                onEditArea={handleEditArea}
                onDeleteAreas={handleDeleteAreas}
                onSelectionChange={handleAreaSelection}
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
                            هل أنت متأكد من حذف {entityToDelete?.length} {deleteType === 'city' ? 'مدن' : 'مناطق'}؟ لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
  }

  return (
    <>
      <CitiesView
        cities={cities}
        selectedCities={selectedCityIds}
        onAddCity={handleAddCity}
        onEditCity={handleEditCity}
        onDeleteCities={handleDeleteCities}
        onSelectCity={(city) => {
            setSelectedCity(city);
            setSelectedCityIds([]);
            setSelectedAreaIds([]);
        }}
        onSelectionChange={handleCitySelection}
        onImport={handleImport}
        onExport={handleExport}
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
                        هل أنت متأكد من حذف {entityToDelete?.length} {deleteType === 'city' ? 'مدن' : 'مناطق'}؟ لا يمكن التراجع عن هذا الإجراء.
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
