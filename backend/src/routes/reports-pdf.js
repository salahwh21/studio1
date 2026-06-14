const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const puppeteer = require('puppeteer');

// Helper: Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-JO', { style: 'currency', currency: 'JOD' }).format(amount || 0);
};

// Helper: Generate PDF from HTML
async function generatePDF(html) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({
    format: 'A4',
    margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    printBackground: true,
  });
  await browser.close();
  return pdf;
}

// Common CSS for Arabic RTL reports
const reportCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Tajawal', sans-serif; direction: rtl; padding: 20px; font-size: 12px; }
  .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #F96941; padding-bottom: 15px; }
  .header h1 { color: #F96941; font-size: 24px; margin-bottom: 5px; }
  .header p { color: #666; font-size: 12px; }
  .summary { display: flex; justify-content: space-around; margin-bottom: 25px; background: #f8f9fa; padding: 15px; border-radius: 8px; }
  .summary-item { text-align: center; }
  .summary-item .value { font-size: 20px; font-weight: bold; color: #F96941; }
  .summary-item .label { font-size: 11px; color: #666; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th, td { padding: 10px 8px; border: 1px solid #ddd; text-align: right; }
  th { background: #F96941; color: white; font-weight: bold; }
  tr:nth-child(even) { background: #f9f9f9; }
  .total-row { background: #fff3cd !important; font-weight: bold; }
  .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; color: #666; font-size: 10px; }
  .badge { padding: 3px 8px; border-radius: 4px; font-size: 10px; }
  .badge-success { background: #d4edda; color: #155724; }
  .badge-warning { background: #fff3cd; color: #856404; }
  .badge-danger { background: #f8d7da; color: #721c24; }
`;

// ============================================
// Driver Financial Report
// ============================================
router.get('/driver/:driverId', authenticateToken, async (req, res) => {
  try {
    const { driverId } = req.params;
    const { from, to } = req.query;

    const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const toDate = to || new Date().toISOString().split('T')[0];

    // Get driver info
    const driverResult = await db.query('SELECT name FROM users WHERE id = $1', [driverId]);
    const driverName = driverResult.rows[0]?.name || 'غير معروف';

    // Get orders
    const ordersResult = await db.query(
      `SELECT id, recipient, status, cod, delivery_fee, driver_fee, date, created_at
       FROM orders
       WHERE driver = $1 AND date BETWEEN $2 AND $3
       ORDER BY date DESC`,
      [driverName, fromDate, toDate]
    );

    const orders = ordersResult.rows;
    const delivered = orders.filter(o => o.status === 'تم التوصيل');
    const totalCOD = delivered.reduce((sum, o) => sum + (parseFloat(o.cod) || 0), 0);
    const totalFees = delivered.reduce((sum, o) => sum + (parseFloat(o.driver_fee) || 0), 0);

    const html = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head><meta charset="UTF-8"><style>${reportCSS}</style></head>
      <body>
        <div class="header">
          <h1>كشف حساب السائق</h1>
          <p>${driverName} | من ${fromDate} إلى ${toDate}</p>
        </div>

        <div class="summary">
          <div class="summary-item">
            <div class="value">${orders.length}</div>
            <div class="label">إجمالي الطلبات</div>
          </div>
          <div class="summary-item">
            <div class="value">${delivered.length}</div>
            <div class="label">تم التوصيل</div>
          </div>
          <div class="summary-item">
            <div class="value">${formatCurrency(totalCOD)}</div>
            <div class="label">إجمالي التحصيل</div>
          </div>
          <div class="summary-item">
            <div class="value">${formatCurrency(totalFees)}</div>
            <div class="label">أجرة السائق</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>رقم الطلب</th>
              <th>المستلم</th>
              <th>التاريخ</th>
              <th>الحالة</th>
              <th>المبلغ</th>
              <th>الأجرة</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(o => `
              <tr>
                <td>#${o.id?.slice(-6)}</td>
                <td>${o.recipient}</td>
                <td>${o.date || '-'}</td>
                <td><span class="badge ${o.status === 'تم التوصيل' ? 'badge-success' : 'badge-warning'}">${o.status}</span></td>
                <td>${formatCurrency(o.cod)}</td>
                <td>${formatCurrency(o.driver_fee)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="4">الإجمالي</td>
              <td>${formatCurrency(totalCOD)}</td>
              <td>${formatCurrency(totalFees)}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>تم إنشاء هذا التقرير بتاريخ ${new Date().toLocaleDateString('ar-JO')} | نظام الوميض للتوصيل</p>
        </div>
      </body>
      </html>
    `;

    const pdf = await generatePDF(html);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="driver-report-${driverId}.pdf"`);
    res.send(pdf);
  } catch (error) {
    console.error('Driver report error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// Merchant Financial Report
// ============================================
router.get('/merchant/:merchantName', authenticateToken, async (req, res) => {
  try {
    const { merchantName } = req.params;
    const { from, to } = req.query;

    const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const toDate = to || new Date().toISOString().split('T')[0];

    // Get orders
    const ordersResult = await db.query(
      `SELECT id, recipient, status, cod, delivery_fee, item_price, date
       FROM orders
       WHERE merchant = $1 AND date BETWEEN $2 AND $3
       ORDER BY date DESC`,
      [decodeURIComponent(merchantName), fromDate, toDate]
    );

    const orders = ordersResult.rows;
    const delivered = orders.filter(o => o.status === 'تم التوصيل');
    const returned = orders.filter(o => o.status?.includes('مرتجع') || o.status?.includes('مرجع'));

    const totalCOD = delivered.reduce((sum, o) => sum + (parseFloat(o.cod) || 0), 0);
    const totalFees = delivered.reduce((sum, o) => sum + (parseFloat(o.delivery_fee) || 0), 0);
    const netAmount = totalCOD - totalFees;

    const html = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head><meta charset="UTF-8"><style>${reportCSS}</style></head>
      <body>
        <div class="header">
          <h1>كشف حساب التاجر</h1>
          <p>${decodeURIComponent(merchantName)} | من ${fromDate} إلى ${toDate}</p>
        </div>

        <div class="summary">
          <div class="summary-item">
            <div class="value">${orders.length}</div>
            <div class="label">إجمالي الطلبات</div>
          </div>
          <div class="summary-item">
            <div class="value">${delivered.length}</div>
            <div class="label">تم التوصيل</div>
          </div>
          <div class="summary-item">
            <div class="value">${returned.length}</div>
            <div class="label">مرتجع</div>
          </div>
          <div class="summary-item">
            <div class="value">${formatCurrency(totalCOD)}</div>
            <div class="label">إجمالي التحصيل</div>
          </div>
          <div class="summary-item">
            <div class="value">${formatCurrency(totalFees)}</div>
            <div class="label">رسوم التوصيل</div>
          </div>
          <div class="summary-item">
            <div class="value" style="color: #28a745">${formatCurrency(netAmount)}</div>
            <div class="label">صافي المبلغ</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>رقم الطلب</th>
              <th>المستلم</th>
              <th>التاريخ</th>
              <th>الحالة</th>
              <th>المبلغ</th>
              <th>رسوم التوصيل</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(o => `
              <tr>
                <td>#${o.id?.slice(-6)}</td>
                <td>${o.recipient}</td>
                <td>${o.date || '-'}</td>
                <td><span class="badge ${o.status === 'تم التوصيل' ? 'badge-success' : o.status?.includes('مرتجع') ? 'badge-danger' : 'badge-warning'}">${o.status}</span></td>
                <td>${formatCurrency(o.cod)}</td>
                <td>${formatCurrency(o.delivery_fee)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="4">الإجمالي</td>
              <td>${formatCurrency(totalCOD)}</td>
              <td>${formatCurrency(totalFees)}</td>
            </tr>
          </tbody>
        </table>

        <div style="background: #d4edda; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <strong>صافي المبلغ المستحق للتاجر: ${formatCurrency(netAmount)}</strong>
        </div>

        <div class="footer">
          <p>تم إنشاء هذا التقرير بتاريخ ${new Date().toLocaleDateString('ar-JO')} | نظام الوميض للتوصيل</p>
        </div>
      </body>
      </html>
    `;

    const pdf = await generatePDF(html);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="merchant-report.pdf"`);
    res.send(pdf);
  } catch (error) {
    console.error('Merchant report error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// Daily Summary Report
// ============================================
router.get('/daily-summary', authenticateToken, authorizeRoles('admin', 'accountant'), async (req, res) => {
  try {
    const { date } = req.query;
    const reportDate = date || new Date().toISOString().split('T')[0];

    const result = await db.query(
      `SELECT
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'تم التوصيل' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status LIKE '%مرتجع%' OR status LIKE '%مرجع%' THEN 1 ELSE 0 END) as returned,
        COALESCE(SUM(CASE WHEN status = 'تم التوصيل' THEN cod ELSE 0 END), 0) as total_cod,
        COALESCE(SUM(CASE WHEN status = 'تم التوصيل' THEN delivery_fee ELSE 0 END), 0) as total_fees
       FROM orders WHERE date = $1`,
      [reportDate]
    );

    const stats = result.rows[0];

    // Top drivers
    const driversResult = await db.query(
      `SELECT driver, COUNT(*) as orders,
        SUM(CASE WHEN status = 'تم التوصيل' THEN 1 ELSE 0 END) as delivered
       FROM orders WHERE date = $1 AND driver IS NOT NULL
       GROUP BY driver ORDER BY orders DESC LIMIT 5`,
      [reportDate]
    );

    const html = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head><meta charset="UTF-8"><style>${reportCSS}</style></head>
      <body>
        <div class="header">
          <h1>ملخص اليوم</h1>
          <p>${reportDate}</p>
        </div>

        <div class="summary">
          <div class="summary-item">
            <div class="value">${stats.total_orders}</div>
            <div class="label">إجمالي الطلبات</div>
          </div>
          <div class="summary-item">
            <div class="value" style="color: #28a745">${stats.delivered}</div>
            <div class="label">تم التوصيل</div>
          </div>
          <div class="summary-item">
            <div class="value" style="color: #dc3545">${stats.returned}</div>
            <div class="label">مرتجع</div>
          </div>
          <div class="summary-item">
            <div class="value">${formatCurrency(stats.total_cod)}</div>
            <div class="label">إجمالي التحصيل</div>
          </div>
          <div class="summary-item">
            <div class="value">${formatCurrency(stats.total_fees)}</div>
            <div class="label">رسوم التوصيل</div>
          </div>
        </div>

        <h3 style="margin-bottom: 10px;">أفضل السائقين</h3>
        <table>
          <thead>
            <tr><th>السائق</th><th>الطلبات</th><th>تم التوصيل</th></tr>
          </thead>
          <tbody>
            ${driversResult.rows.map(d => `
              <tr><td>${d.driver}</td><td>${d.orders}</td><td>${d.delivered}</td></tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>تم إنشاء هذا التقرير بتاريخ ${new Date().toLocaleDateString('ar-JO')} | نظام الوميض للتوصيل</p>
        </div>
      </body>
      </html>
    `;

    const pdf = await generatePDF(html);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="daily-summary-${reportDate}.pdf"`);
    res.send(pdf);
  } catch (error) {
    console.error('Daily summary error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
