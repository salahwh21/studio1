'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, BarChart3, ArrowRight, Package, ChevronLeft, LayoutGrid, Users, Store, Calendar, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUsersStore } from '@/store/user-store'

export default function ReportsHub() {
    const { users } = useUsersStore()
    const drivers = users.filter(u => u.roleId === 'driver')
    const merchants = [...new Set(users.filter(u => u.roleId === 'merchant').map(u => u.storeName || u.name))]

    const [selectedDriver, setSelectedDriver] = useState<string>('')
    const [selectedMerchant, setSelectedMerchant] = useState<string>('')
    const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])
    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0])

    const downloadDriverReport = () => {
        if (!selectedDriver) return
        window.open(`/api/reports/driver/${selectedDriver}?from=${dateFrom}&to=${dateTo}`, '_blank')
    }

    const downloadMerchantReport = () => {
        if (!selectedMerchant) return
        window.open(`/api/reports/merchant/${encodeURIComponent(selectedMerchant)}?from=${dateFrom}&to=${dateTo}`, '_blank')
    }

    const downloadDailySummary = () => {
        window.open(`/api/reports/daily-summary?date=${reportDate}`, '_blank')
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8" dir="rtl">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Link href="/dashboard" className="hover:text-primary transition-colors">لوحة التحكم</Link>
                    <ChevronLeft className="h-4 w-4" />
                    <Link href="/dashboard/settings" className="hover:text-primary transition-colors">الإعدادات</Link>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="text-foreground font-medium">مركز تصميم التقارير</span>
                </nav>

                {/* Header Section */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 p-8 shadow-xl mb-12">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                                <LayoutGrid className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">مركز تصميم التقارير</h1>
                                <p className="text-slate-300 mt-1">خصص بوالصك وتقاريرك وهويتك البصرية للطباعة</p>
                            </div>
                        </div>
                        <Link href="/dashboard/settings">
                            <Button variant="secondary" size="sm" className="gap-2 bg-white/10 hover:bg-white/20 text-white border-0">
                                <ArrowRight className="h-4 w-4 rotate-180" />
                                رجوع
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Policy Designer Card */}
                    <Link href="/dashboard/reports/control-panel" className="group">
                        <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[40px] overflow-hidden bg-white">
                            <CardContent className="p-10 flex flex-col items-center text-center space-y-6">
                                <div className="p-8 rounded-3xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                    <Package className="h-20 w-20" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-gray-900">مصمم بوالص الشحن</h2>
                                    <p className="text-gray-500 font-medium px-4">خصص بوالص الشحن الحرارية والـ A4 بلمساتك الخاصة، أضف شعارك، الباركود، وتحكم في الحقول.</p>
                                </div>
                                <Button className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-lg font-bold gap-3">
                                    فتح المصمم <ArrowRight className="h-5 w-5" />
                                </Button>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Reports Designer Card */}
                    <Link href="/dashboard/reports/reports-designer" className="group">
                        <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[40px] overflow-hidden bg-white">
                            <CardContent className="p-10 flex flex-col items-center text-center space-y-6">
                                <div className="p-8 rounded-3xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                                    <BarChart3 className="h-20 w-20" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-gray-900">مصمم التقارير</h2>
                                    <p className="text-gray-500 font-medium px-4">أنشئ تقارير ذكية، كشوفات مالية، وجداول بيانات منظمة لعملائك وموظفيك بكل سهولة.</p>
                                </div>
                                <Button className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-lg font-bold gap-3">
                                    فتح المصمم <ArrowRight className="h-5 w-5" />
                                </Button>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* PDF Financial Reports Section */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <FileText className="h-7 w-7 text-red-600" />
                        تقارير PDF المالية
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Driver Report */}
                        <Card className="border-2 hover:border-blue-300 transition-colors">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">كشف حساب سائق</h3>
                                        <p className="text-sm text-muted-foreground">تقرير مالي شامل للسائق</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <Label>اختر السائق</Label>
                                        <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="اختر سائق..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {drivers.map(d => (
                                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label>من</Label>
                                            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>إلى</Label>
                                            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                                    onClick={downloadDriverReport}
                                    disabled={!selectedDriver}
                                >
                                    <Download className="h-4 w-4" />
                                    تحميل PDF
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Merchant Report */}
                        <Card className="border-2 hover:border-green-300 transition-colors">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 rounded-xl bg-green-100 text-green-600">
                                        <Store className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">كشف حساب تاجر</h3>
                                        <p className="text-sm text-muted-foreground">تقرير مالي شامل للتاجر</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <Label>اختر التاجر</Label>
                                        <Select value={selectedMerchant} onValueChange={setSelectedMerchant}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="اختر تاجر..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {merchants.map(m => (
                                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label>من</Label>
                                            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>إلى</Label>
                                            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full gap-2 bg-green-600 hover:bg-green-700"
                                    onClick={downloadMerchantReport}
                                    disabled={!selectedMerchant}
                                >
                                    <Download className="h-4 w-4" />
                                    تحميل PDF
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Daily Summary */}
                        <Card className="border-2 hover:border-orange-300 transition-colors">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                                        <Calendar className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">ملخص يومي</h3>
                                        <p className="text-sm text-muted-foreground">تقرير شامل ليوم محدد</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <Label>اختر التاريخ</Label>
                                        <Input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} />
                                    </div>
                                </div>

                                <Button
                                    className="w-full gap-2 bg-orange-600 hover:bg-orange-700 mt-auto"
                                    onClick={downloadDailySummary}
                                >
                                    <Download className="h-4 w-4" />
                                    تحميل PDF
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-white/50 backdrop-blur-sm border rounded-[30px] p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                    <div className="h-16 w-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        <FileText className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-gray-900">تزامن تلقائي مع النظام</h3>
                        <p className="text-gray-500 font-medium">جميع القوالب المحفوظة هنا ستظهر تلقائياً في نافذة الطباعة السريعة عند اختيار الصيغة المناسبة.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
