
'use client';

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Settings, Users, MapPin, ListChecks, Bell, Trash2, Edit, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


type Panel = 'general' | 'users' | 'areas' | 'statuses' | 'notifications';

const navItems: { id: Panel; label: string; icon: LucideIcon }[] = [
  { id: 'general', label: 'الإعدادات العامة', icon: Settings },
  { id: 'users', label: 'المستخدمين والتجار', icon: Users },
  { id: 'areas', label: 'المناطق وقوائم الأسعار', icon: MapPin },
  { id: 'statuses', label: 'حالات الطلب', icon: ListChecks },
  { id: 'notifications', label: 'الإشعارات والتكامل', icon: Bell },
];

const SidebarNav = ({ activePanel, setActivePanel }: { activePanel: Panel, setActivePanel: (panel: Panel) => void }) => {
  return (
    <nav className="flex flex-col gap-2">
      {navItems.map(item => (
        <Button
          key={item.id}
          variant={activePanel === item.id ? 'default' : 'ghost'}
          className="justify-start w-full"
          onClick={() => setActivePanel(item.id)}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </Button>
      ))}
    </nav>
  );
};

const GeneralSettingsPanel = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات الملف الشخصي</CardTitle>
        <CardDescription>تحديث معلوماتك الشخصية.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">الاسم الأول</Label>
            <Input id="firstName" defaultValue="مسؤول" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">الاسم الأخير</Label>
            <Input id="lastName" defaultValue="النظام" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input id="email" type="email" defaultValue="admin@alwameedh.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">اللغة</Label>
          <Select defaultValue="ar">
            <SelectTrigger id="language">
              <SelectValue placeholder="اختر اللغة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">العربية</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="theme">المظهر</Label>
          <Select defaultValue="system">
            <SelectTrigger id="theme">
              <SelectValue placeholder="اختر المظهر" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">فاتح</SelectItem>
              <SelectItem value="dark">داكن</SelectItem>
              <SelectItem value="system">النظام</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="mt-2">تحديث الملف الشخصي</Button>
      </CardContent>
    </Card>
  );
};

const AreasSettingsPanel = () => {
    const [areas, setAreas] = useState([
        { id: 1, province: 'بغداد', area: 'كل المناطق', price: 5000 },
        { id: 2, province: 'البصرة', area: 'كل المناطق', price: 8000 },
        { id: 3, province: 'أربيل', area: 'كل المناطق', price: 10000 },
        { id: 4, province: 'الأنبار', area: 'كل المناطق', price: 9000 },
    ]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>المناطق وقوائم الأسعار</CardTitle>
                        <CardDescription>إدارة مناطق التوصيل وأسعارها.</CardDescription>
                    </div>
                    <Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/>إضافة منطقة جديدة</Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2 max-w-sm">
                    <Label htmlFor="defaultPrice">سعر التوصيل الافتراضي</Label>
                    <Input id="defaultPrice" type="number" placeholder="ادخل السعر الافتراضي" defaultValue="6000"/>
                    <p className="text-xs text-muted-foreground">السعر المستخدم في حال لم تكن للمنطقة سعر مخصص.</p>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-medium mb-2">أسعار خاصة بالمناطق</h3>
                  <div className="border rounded-md">
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>المحافظة</TableHead>
                                  <TableHead>المنطقة</TableHead>
                                  <TableHead>سعر التوصيل (د.ع)</TableHead>
                                  <TableHead className="text-right">إجراءات</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {areas.map(area => (
                                  <TableRow key={area.id}>
                                      <TableCell className="font-medium">{area.province}</TableCell>
                                      <TableCell>{area.area}</TableCell>
                                      <TableCell>{area.price.toLocaleString('ar-IQ')}</TableCell>
                                      <TableCell className="text-right">
                                          <Button variant="ghost" size="icon">
                                              <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                              <Trash2 className="h-4 w-4" />
                                          </Button>
                                      </TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </div>
                </div>
            </CardContent>
        </Card>
    );
};


const PlaceholderPanel = ({ title }: { title: string }) => {
  return (
    <Card className="flex items-center justify-center min-h-[300px]">
      <CardContent className="text-center text-muted-foreground p-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm">هذه الميزة قيد التطوير حاليًا.</p>
      </CardContent>
    </Card>
  );
};

export default function SettingsPage() {
  const [activePanel, setActivePanel] = useState<Panel>('general');

  return (
    <div className="mx-auto max-w-full space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">مركز التحكم</h1>
        <p className="text-muted-foreground">إدارة حسابك وإعدادات النظام.</p>
      </div>
      <Separator />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        {/* Sidebar */}
        <div className="hidden md:block md:col-span-1">
          <SidebarNav activePanel={activePanel} setActivePanel={setActivePanel} />
        </div>

        {/* Mobile dropdown */}
        <div className="md:hidden">
          <Select onValueChange={(value) => setActivePanel(value as Panel)} defaultValue={activePanel}>
            <SelectTrigger>
              <SelectValue placeholder="اختر قسمًا" />
            </SelectTrigger>
            <SelectContent>
              {navItems.map(item => (
                <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Main content */}
        <div className="md:col-span-3">
          {activePanel === 'general' && <GeneralSettingsPanel />}
          {activePanel === 'users' && <PlaceholderPanel title="إدارة المستخدمين والتجار" />}
          {activePanel === 'areas' && <AreasSettingsPanel />}
          {activePanel === 'statuses' && <PlaceholderPanel title="إدارة حالات الطلب" />}
          {activePanel === 'notifications' && <PlaceholderPanel title="إدارة الإشعارات والتكامل" />}
        </div>
      </div>
    </div>
  );
}
