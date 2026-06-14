'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Table, Package, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Navigation from '@/components/navigation'

export default function ProductsPage() {
  const router = useRouter()
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [products, setProducts] = useState<any[]>([])

  // تحميل بيانات تجريبية
  useEffect(() => {
    setProducts([
      {
        id: '1',
        name: 'هاتف ذكي سامسونج Galaxy S24',
        category: 'إلكترونيات',
        quantity: 2,
        price: 2500,
        total: 5000
      },
      {
        id: '2',
        name: 'سماعات بلوتوث لاسلكية',
        category: 'إكسسوارات',
        quantity: 5,
        price: 800,
        total: 4000
      },
      {
        id: '3',
        name: 'كابل شحن سريع USB-C',
        category: 'إكسسوارات',
        quantity: 10,
        price: 150,
        total: 1500
      },
      {
        id: '4',
        name: 'حامل هاتف للسيارة',
        category: 'إكسسوارات',
        quantity: 3,
        price: 600,
        total: 1800
      },
      {
        id: '5',
        name: 'شاحن لاسلكي سريع',
        category: 'إكسسوارات',
        quantity: 8,
        price: 75,
        total: 600
      },
      {
        id: '6',
        name: 'غطاء حماية للهاتف',
        category: 'إكسسوارات',
        quantity: 12,
        price: 45,
        total: 540
      }
    ])
  }, [])

  const handlePrintSelected = () => {
    if (selectedProducts.length === 0) {
      alert('يرجى اختيار منتجات للطباعة')
      return
    }

    // الانتقال لصفحة الطباعة مع IDs
    router.push(`/dashboard/reports/control-panel?productIds=${selectedProducts.join(',')}&documentType=table`)
  }

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map(p => p.id))
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
              <h1 className="text-3xl font-bold">إدارة المنتجات</h1>
              <p className="text-gray-600 mt-1">
                {products.length} منتج | {selectedProducts.length} محدد
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
                disabled={selectedProducts.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                <Table className="h-4 w-4 ml-2" />
                طباعة الجدول ({selectedProducts.length})
              </Button>
            </div>
          </div>

          {/* جدول المنتجات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                قائمة المنتجات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="p-4 text-right">
                        <Checkbox
                          checked={selectedProducts.length === products.length && products.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </th>
                      <th className="p-4 text-right font-bold">اسم المنتج</th>
                      <th className="p-4 text-right font-bold">الفئة</th>
                      <th className="p-4 text-right font-bold">الكمية</th>
                      <th className="p-4 text-right font-bold">السعر (د.أ)</th>
                      <th className="p-4 text-right font-bold">الإجمالي (د.أ)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr
                        key={product.id}
                        className={`border-b hover:bg-gray-50 ${
                          selectedProducts.includes(product.id) ? 'bg-green-50' : ''
                        }`}
                      >
                        <td className="p-4">
                          <Checkbox
                            checked={selectedProducts.includes(product.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedProducts([...selectedProducts, product.id])
                              } else {
                                setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                              }
                            }}
                          />
                        </td>
                        <td className="p-4 font-semibold">{product.name}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                            {product.category}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold">{product.quantity}</td>
                        <td className="p-4 font-mono font-bold text-blue-600">
                          {product.price.toLocaleString()}
                        </td>
                        <td className="p-4 font-mono font-bold text-green-600">
                          {product.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {products.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد منتجات</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* معلومات إضافية */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                  <div className="text-sm text-gray-600">عدد المنتجات</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {products.reduce((sum, p) => sum + p.quantity, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">الكمية الكلية</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {products.reduce((sum, p) => sum + p.total, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">القيمة الإجمالية (د.أ)</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {[...new Set(products.map(p => p.category))].length}
                  </div>
                  <div className="text-sm text-gray-600">عدد الفئات</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}