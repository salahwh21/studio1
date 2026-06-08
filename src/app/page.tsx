'use client'

import Link from 'next/link'
import { Package, Table, FileText, BarChart3, Printer, Eye, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Navigation from '@/components/navigation'

export default function HomePage() {
  const features = [
    {
      title: 'إدارة الطلبات',
      description: 'إدارة شاملة للطلبات مع إمكانية الطباعة المباشرة',
      icon: Package,
      href: '/orders',
      color: 'bg-blue-500'
    },
    {
      title: 'إدارة المنتجات',
      description: 'تنظيم المنتجات وطباعة الجداول التفصيلية',
      icon: Table,
      href: '/products',
      color: 'bg-green-500'
    },
    {
      title: 'مصمم PDF المتقدم',
      description: 'تصميم البوالص والتقارير مع معاينة مباشرة مثل Figma',
      icon: FileText,
      href: '/dashboard/reports/control-panel',
      color: 'bg-purple-500'
    },
    {
      title: 'التقارير والإحصائيات',
      description: 'تقارير تفصيلية وإحصائيات شاملة',
      icon: BarChart3,
      href: '/dashboard/reports',
      color: 'bg-orange-500'
    }
  ]

  const capabilities = [
    {
      title: '3 أنواع مستندات',
      description: 'بوالص شحن، تقارير بيانات، جداول منتجات',
      icon: FileText
    },
    {
      title: 'طباعة سريعة',
      description: 'طباعة مباشرة من المتصفح بدون تحميل',
      icon: Printer
    },
    {
      title: 'معاينة مباشرة',
      description: 'معاينة فورية للتصميم مع كل تغيير',
      icon: Eye
    },
    {
      title: 'قوالب قابلة للحفظ',
      description: 'حفظ وإعادة استخدام التصاميم المفضلة',
      icon: Settings
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="p-6" dir="rtl">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6 py-12">
            <h1 className="text-5xl font-bold text-gray-900">
              نظام إدارة التوصيل المتكامل
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              نظام شامل لإدارة الطلبات والمنتجات مع مصمم PDF متقدم يدعم الطباعة الحرارية والعادية
              مع معاينة مباشرة وقوالب قابلة للتخصيص
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/orders">
                <Button size="lg" className="gap-2">
                  <Package className="h-5 w-5" />
                  ابدأ مع الطلبات
                </Button>
              </Link>
              <Link href="/dashboard/reports/control-panel">
                <Button size="lg" variant="outline" className="gap-2">
                  <FileText className="h-5 w-5" />
                  جرب مصمم PDF
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Link key={feature.title} href={feature.href}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>

          {/* Capabilities Section */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                مميزات مصمم PDF المتقدم
              </h2>
              <p className="text-gray-600">
                تصميم احترافي مع تحكم كامل في كل التفاصيل
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {capabilities.map((capability) => {
                const Icon = capability.icon
                return (
                  <div key={capability.title} className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{capability.title}</h3>
                    <p className="text-sm text-gray-600">{capability.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">13</div>
                <div className="text-gray-600">أحجام طباعة مختلفة</div>
                <div className="text-sm text-gray-500 mt-1">حراري + عادي</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">4</div>
                <div className="text-gray-600">خطوط عربية</div>
                <div className="text-sm text-gray-500 mt-1">Cairo, Amiri, Tajawal, Noto</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">∞</div>
                <div className="text-gray-600">إمكانيات التخصيص</div>
                <div className="text-sm text-gray-500 mt-1">ألوان، خطوط، تخطيط</div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">جاهز للبدء؟</h2>
            <p className="text-xl mb-6 opacity-90">
              ابدأ بإدارة طلباتك وتصميم البوالص الاحترافية الآن
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/orders">
                <Button size="lg" variant="secondary" className="gap-2">
                  <Package className="h-5 w-5" />
                  إدارة الطلبات
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="secondary" className="gap-2">
                  <Table className="h-5 w-5" />
                  إدارة المنتجات
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}