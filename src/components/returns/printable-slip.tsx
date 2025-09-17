
import { type Order } from '@/store/orders-store';
import { type DriverSlip, type MerchantSlip } from '@/store/returns-store';

type Slip = DriverSlip | MerchantSlip;

function isDriverSlip(slip: Slip): slip is DriverSlip {
  return 'driverName' in slip;
}

const PrintableSlip = ({ slip, logoSrc }: { slip: Slip; logoSrc: string | null }) => {
  const isDriver = isDriverSlip(slip);
  const title = isDriver ? "كشف استلام مرتجعات من السائق" : "كشف تسليم مرتجعات للتاجر";
  const entityName = isDriver ? `السائق: ${slip.driverName}` : `التاجر: ${slip.merchant}`;
  
  return (
    <div className="bg-white text-black p-4" style={{ width: '210mm', height: '297mm', fontFamily: 'sans-serif' }}>
        <div dir="rtl" className="p-5 border border-gray-300 h-full flex flex-col">
            
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b border-gray-300">
                <div className="text-right">
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <p className="text-sm mt-2">{entityName}</p>
                    <p className="text-sm">التاريخ: {new Date(slip.date).toLocaleDateString('ar-JO')}</p>
                    <p className="text-sm">رقم الكشف: {slip.id}</p>
                </div>
                <div className="text-left">
                    {logoSrc && <img src={logoSrc} alt="logo" className="h-16 w-auto" />}
                </div>
            </div>

            {/* Table */}
            <div className="flex-grow mt-4">
                <table className="w-full text-sm text-right border-collapse">
                    <thead>
                        <tr className="bg-gray-800 text-white">
                            <th className="border p-2 text-center">#</th>
                            <th className="border p-2 text-center">رقم الطلب</th>
                            <th className="border p-2">اسم المستلم</th>
                            <th className="border p-2">العنوان</th>
                            <th className="border p-2 text-center">سبب الارجاع</th>
                        </tr>
                    </thead>
                    <tbody>
                        {slip.orders.map((order, index) => (
                            <tr key={order.id} className="[&>td]:border [&>td]:p-2">
                                <td className="text-center">{index + 1}</td>
                                <td className="text-center font-mono">{order.referenceNumber || order.id}</td>
                                <td>
                                    <div>{order.recipient}</div>
                                    <div className="text-xs text-gray-600">{order.phone}</div>
                                </td>
                                <td>{order.address}</td>
                                <td className="text-center">{order.previousStatus || order.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="flex-none pt-8 mt-auto text-sm">
                <div className="flex justify-between items-center">
                    <p>توقيع المستلم: ............................</p>
                    <p>إجمالي الشحنات: {slip.orders.length}</p>
                    <p>توقيع المسلِّم: ............................</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default PrintableSlip;
