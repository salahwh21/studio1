'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Printer, Package, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Navigation from '@/components/navigation'

export default function OrdersPage() {
  const router = useRouter()
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [orders, setOrders] = useState<any[]>([])

  // تحميل بيانات تجريبية
  useEffect(() => {
    setOrders([
      {
        id: 'ORD-001',
        orderNumber: 'ORD-001',
        recipientName: 'أحمد محمد العلي',
        recipientPhone: '0791234567',
        recipientAddress: 'شارع الملك فهد، الدور الثاني',
        recipientCity: 'عمّان',
        codAmount: 250,
        status: 'delivered',
        createdAt: new Date().toISOString()
      },
      {
        id: 'ORD-002',
        orderNumber: 'ORD-002',
        recipientName: 'فاطمة أحمد',
        recipientPhone: '0781234567',
        recipientAddress: 'جبل الحسين، بناية رقم 15',
        recipientCity: 'عمّان',
        codAmount: 180,
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        id: 'ORD-003',
        orderNumber: 'ORD-003',
        recipientName: 'محمد علي',
        recipientPhone: '0771234567',
        recipientAddress: 'الزرقاء',
        recipientCity: 'الزرقاء',
        codAmount: 320,
        status: 'new',
        createdAt: new Date().toISOString()
      },
      {
        id: 'ORD-004',
        orderNumber: 'ORD-004',
        recipientName: 'سارة خالد',
        recipientPhone: '0761234567',
        recipientAddress: 'إربد',
        recipientCity: 'إربد',
        codAmount: 150,
        status: 'delivered',
        createdAt: new Date().toISOString()
      }
    ])
  }, [])

  const handlePrintSelected = () => {
    if (selectedOrders.length === 0) {
      alert('يرجى اختيار طلبات للطباعة')
      return
    }

    // الانتقال لصفحة الطباعة مع IDs
    router.push(`/dashboard/reports/control-panel?orderIds=${selectedOrders.join(',')}`)
  }

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(orders.map(o => o.id))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="p-6" dir="rtl">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
              <p className="text-gray-600 mt-1">
                {orders.length} طلب | {selectedOrders.length} محدد
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 ml-2" />
                تحديث
              </Button>

              <Button
                onClick={handlePrintSelected}
                disabled={selectedOrders.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Printer className="h-4 w-4 ml-2" />
                طباعة المحدد ({selectedOrders.length})
              </Button>
            </div>
          </div>

          {/* جدول الطلبات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                قائمة الطلبات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="p-4 text-right">
                        <Checkbox
                          checked={selectedOrders.length === orders.length && orders.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </th>
                      <th className="p-4 text-right font-bold">رقم الطلب</th>
                      <th className="p-4 text-right font-bold">المستلم</th>
                      <th className="p-4 text-right font-bold">الهاتف</th>
                      <th className="p-4 text-right font-bold">المدينة</th>
                      <th className="p-4 text-right font-bold">المبلغ</th>
                      <th className="p-4 text-right font-bold">الحالة</th>
                      <th className="p-4 text-right font-bold">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr
                        key={order.id}
                        className={`border-b hover:bg-gray-50 ${
                          selectedOrders.includes(order.id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="p-4">
                          <Checkbox
                            checked={selectedOrders.includes(order.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedOrders([...selectedOrders, order.id])
                              } else {
                                setSelectedOrders(selectedOrders.filter(id => id !== order.id))
                              }
                            }}
                          />
                        </td>
                        <td className="p-4 font-mono font-bold">{order.orderNumber}</td>
                        <td className="p-4">{order.recipientName}</td>
                        <td className="p-4 font-mono" dir="ltr">{order.recipientPhone}</td>
                        <td className="p-4">{order.recipientCity}</td>
                        <td className="p-4 font-bold text-green-600">
                          {order.codAmount?.toLocaleString()} د.أ
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'new' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status === 'delivered' ? 'تم التسليم' :
                             order.status === 'pending' ? 'قيد التوصيل' :
                             order.status === 'new' ? 'جديد' : 'ملغي'}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {orders.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد طلبات</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* معلومات إضافية */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
                  <div className="text-sm text-gray-600">إجمالي الطلبات</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {orders.reduce((sum, o) => sum + o.codAmount, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">إجمالي المبالغ (د.أ)</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {orders.filter(o => o.status === 'delivered').length}
                  </div>
                  <div className="text-sm text-gray-600">تم التسليم</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}