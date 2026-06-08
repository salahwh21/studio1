'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, Table, FileText, Settings, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'الطلبات', href: '/orders', icon: Package },
  { name: 'المنتجات', href: '/products', icon: Table },
  { name: 'مصمم البوالص', href: '/dashboard/reports/control-panel', icon: FileText },
  { name: 'مصمم التقارير', href: '/dashboard/reports/reports-designer', icon: BarChart3 },
  { name: 'التقارير والاستعلام', href: '/dashboard/reports', icon: Package },
  { name: 'الإعدادات', href: '/dashboard/settings', icon: Settings },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-sm border-b" dir="rtl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-gray-900">
              نظام إدارة التوصيل
            </Link>

            <div className="flex gap-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className={cn(
                        'gap-2 h-10',
                        isActive && 'bg-primary text-primary-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>

          <Link href="/login">
            <Button variant="default" className="bg-primary text-white hover:bg-primary/90">
              تسجيل الدخول
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}