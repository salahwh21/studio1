'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Icon from '@/components/icon';
import Link from 'next/link';

const returnSections = [
  {
    href: '/dashboard/returns/receive-from-drivers',
    icon: 'Truck',
    title: '1. استلام من السائقين',
    description: 'استلام الشحنات الراجعة من السائقين وتسجيلها في النظام.',
  },
  {
    href: '/dashboard/returns/driver-slips',
    icon: 'History',
    title: '2. كشوفات استلام السائقين',
    description: 'عرض وطباعة الكشوفات السابقة التي تم إنشاؤها للسائقين.',
  },
  {
    href: '/dashboard/returns/prepare-for-merchants',
    icon: 'Package',
    title: '3. تجهيز مرتجعات التجار',
    description: 'تجميع مرتجعات كل تاجر في قوائم تمهيدًا لإنشاء كشف إرجاع.',
  },
  {
    href: '/dashboard/returns/merchant-slips',
    icon: 'ClipboardList',
    title: '4. كشوفات إرجاع التجار',
    description: 'عرض وتأكيد تسليم الكشوفات النهائية للتجار.',
  },
];

export default function ReturnsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <Icon name="Undo2" />
            إدارة المرتجعات
          </CardTitle>
          <CardDescription>
            اتبع الخطوات التالية لإدارة دورة المرتجعات بكفاءة، بدءًا من استلامها من السائق وحتى إعادتها للتاجر.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {returnSections.map((section) => (
          <Link key={section.href} href={section.href} className="block group">
            <Card className="h-full hover:border-primary hover:shadow-lg transition-all duration-300 ease-in-out">
              <CardHeader className="flex flex-row items-center gap-5 p-5">
                <div className="bg-primary/10 text-primary p-4 rounded-lg group-hover:scale-110 transition-transform">
                  <Icon name={section.icon as any} className="h-7 w-7" />
                </div>
                <div>
                  <CardTitle className="text-lg mb-1">{section.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">{section.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
