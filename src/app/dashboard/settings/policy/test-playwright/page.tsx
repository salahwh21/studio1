'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  generateThermalLabel,
  generateStandardPolicy,
  generatePdf,
  createThermalLabelHTML,
  createStandardPolicyHTML
} from '@/services/pdf-service';

export default function TestPlaywrightPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // بيانات تجريبية
  const testData = {
    companyName: 'شركة التوصيل السريع',
    orderNumber: '12345',
    recipient: 'أحمد محمد علي',
    phone: '0501234567',
    address: 'شارع الملك فهد، حي النزهة، مبنى رقم 123، الطابق الثاني',
    city: 'الرياض',
    region: 'منطقة الرياض',
    cod: 150,
    merchant: 'متجر الإلكترونيات الحديثة',
    date: new Date().toLocaleDateString('ar-SA'),
    notes: 'يرجى التسليم في المساء بعد الساعة 6',
    barcode: '12345'
  };

  const handleTestThermalLabel = async () => {
    setIsLoading(true);
    try {
      await generateThermalLabel(testData, {
        width: 100,
        height: 150
      }, 'thermal-label-test.pdf');
      
      toast({
        title: "نجح! ✅",
        description: "تم فتح نافذة الطباعة للملصق الحراري"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "فشل",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestStandardPolicy = async () => {
    setIsLoading(true);
    try {
      await generateStandardPolicy(testData, {
        width: 210,
        height: 297
      }, 'standard-policy-test.pdf');
      
      toast({
        title: "نجح! ✅",
        description: "تم فتح نافذة الطباعة للبوليصة العادية"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "فشل",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSmallLabel = async () => {
    setIsLoading(true);
    try {
      await generateThermalLabel(testData, {
        width: 75,
        height: 50
      }, 'small-label-test.pdf');
      
      toast({
        title: "نجح! ✅",
        description: "تم فتح نافذة الطباعة للملصق الصغير"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "فشل",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/settings/policy">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">اختبار Playwright PDF</h1>
          <p className="text-muted-foreground">اختبار إنشاء PDF باستخدام Playwright مع دعم عربي كامل</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ملصق حراري 100×150</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              ملصق حراري بحجم 100×150 مم مع نصوص عربية
            </p>
            <Button 
              onClick={handleTestThermalLabel}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "جاري الإنشاء..." : "📄 إنشاء ملصق حراري"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">بوليصة عادية A4</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              بوليصة شحن عادية بحجم A4 مع تفاصيل كاملة
            </p>
            <Button 
              onClick={handleTestStandardPolicy}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "جاري الإنشاء..." : "📋 إنشاء بوليصة عادية"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ملصق صغير 75×50</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              ملصق صغير بحجم 75×50 مم للطرود الصغيرة
            </p>
            <Button 
              onClick={handleTestSmallLabel}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "جاري الإنشاء..." : "🏷️ إنشاء ملصق صغير"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>معلومات الاختبار</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">البيانات التجريبية:</h4>
              <ul className="text-sm space-y-1">
                <li><strong>الشركة:</strong> {testData.companyName}</li>
                <li><strong>رقم الطلب:</strong> {testData.orderNumber}</li>
                <li><strong>المستلم:</strong> {testData.recipient}</li>
                <li><strong>الهاتف:</strong> {testData.phone}</li>
                <li><strong>المبلغ:</strong> {testData.cod} ريال</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">المميزات:</h4>
              <ul className="text-sm space-y-1">
                <li>✅ دعم عربي كامل</li>
                <li>✅ خطوط واضحة</li>
                <li>✅ محاذاة RTL صحيحة</li>
                <li>✅ أحجام دقيقة</li>
                <li>✅ جودة عالية</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}