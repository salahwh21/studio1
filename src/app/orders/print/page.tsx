'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import PDFDesigner from '@/app/dashboard/reports/control-panel/page'

function PrintOrdersContent() {
  const searchParams = useSearchParams()
  const orderIds = searchParams.get('ids')?.split(',') || []
  const [orders, setOrders] = useState([])

  useEffect(() => {
    if (orderIds.length > 0) {
      // جلب الطلبات من API
      fetch(`/api/orders?ids=${orderIds.join(',')}`)
        .then(res => res.json())
        .then(data => setOrders(data))
    }
  }, [orderIds])

  return <PDFDesigner initialOrders={orders} />
}

export default function PrintOrdersPage() {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <PrintOrdersContent />
    </Suspense>
  )
}