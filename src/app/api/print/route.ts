
import { NextResponse } from 'next/server';
import net from 'net'; // يستخدم للاتصال عبر TCP (شبكة)

export async function POST(req: Request) {
  try {
    const { data } = await req.json();

    // 🖨️ إعدادات الطابعة (IP + منفذ)
    const printerIp = "192.168.1.100"; // غيره حسب طابعتك
    const printerPort = 9100; // المنفذ الافتراضي لطابعات الشبكة

    await new Promise<void>((resolve, reject) => {
      const client = new net.Socket();
      client.connect(printerPort, printerIp, () => {
        client.write(Buffer.from(data, "binary"));
        client.destroy();
        resolve();
      });
      client.on("error", reject);
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("خطأ في API الطباعة:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
