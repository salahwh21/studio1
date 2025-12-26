'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/icon';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function DriverSettingsPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  
  // إعدادات الإشعارات
  const [notifications, setNotifications] = useState({
    newOrders: true,
    orderUpdates: true,
    messages: true,
    sounds: true,
  });

  // بيانات المستخدم للتعديل
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    whatsapp: '',
  });

  const handleSave = () => {
    // هنا يمكن إضافة حفظ البيانات للـ API
    toast({
      title: 'تم الحفظ',
      description: 'تم حفظ التغييرات بنجاح',
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    setIsLogoutDialogOpen(false);
    await logout();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">الإعدادات</h1>
        <p className="text-muted-foreground mt-1">إدارة حسابك والإعدادات الشخصية</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon name="User" className="h-5 w-5" />
              الملف الشخصي
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Icon name={isEditing ? "X" : "Pencil"} className="h-4 w-4 ml-2" />
              {isEditing ? 'إلغاء' : 'تعديل'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-primary/20">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {user?.name?.charAt(0) || 'س'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-lg">{user?.name || 'السائق'}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground mt-1">سائق توصيل</p>
            </div>
          </div>

          <Separator />

          {/* Editable Fields */}
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="اسمك الكامل"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="07xxxxxxxx"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">رقم الواتساب</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="07xxxxxxxx"
                  dir="ltr"
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                <Icon name="Save" className="h-4 w-4 ml-2" />
                حفظ التغييرات
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Icon name="Phone" className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formData.phone || 'لم يتم إضافة رقم'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Icon name="MessageCircle" className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formData.whatsapp || 'لم يتم إضافة واتساب'}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="Bell" className="h-5 w-5" />
            الإشعارات
          </CardTitle>
          <CardDescription>تحكم في إشعارات التطبيق</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>طلبات جديدة</Label>
              <p className="text-xs text-muted-foreground">إشعار عند تعيين طلب جديد</p>
            </div>
            <Switch
              checked={notifications.newOrders}
              onCheckedChange={(checked) => setNotifications({ ...notifications, newOrders: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>تحديثات الطلبات</Label>
              <p className="text-xs text-muted-foreground">إشعار عند تغيير حالة طلب</p>
            </div>
            <Switch
              checked={notifications.orderUpdates}
              onCheckedChange={(checked) => setNotifications({ ...notifications, orderUpdates: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>الرسائل</Label>
              <p className="text-xs text-muted-foreground">إشعار عند استلام رسالة</p>
            </div>
            <Switch
              checked={notifications.messages}
              onCheckedChange={(checked) => setNotifications({ ...notifications, messages: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>الأصوات</Label>
              <p className="text-xs text-muted-foreground">تشغيل صوت مع الإشعارات</p>
            </div>
            <Switch
              checked={notifications.sounds}
              onCheckedChange={(checked) => setNotifications({ ...notifications, sounds: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* App Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="Info" className="h-5 w-5" />
            معلومات التطبيق
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">الإصدار</span>
            <span className="text-sm font-medium">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">آخر تحديث</span>
            <span className="text-sm font-medium">ديسمبر 2025</span>
          </div>
        </CardContent>
      </Card>

      {/* Logout Button */}
      <Button 
        variant="destructive" 
        className="w-full"
        onClick={() => setIsLogoutDialogOpen(true)}
      >
        <Icon name="LogOut" className="h-4 w-4 ml-2" />
        تسجيل الخروج
      </Button>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد تسجيل الخروج</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في تسجيل الخروج من التطبيق؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <Icon name="LogOut" className="h-4 w-4 ml-2" />
              تسجيل الخروج
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
