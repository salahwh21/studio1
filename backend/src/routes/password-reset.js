const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

// ── Mailer — يستخدم Resend SDK إذا توفر RESEND_API_KEY، وإلا nodemailer ──
async function sendEmail({ to, subject, html }) {
    const companyName = process.env.COMPANY_NAME || 'الوميض';

    if (process.env.RESEND_API_KEY) {
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        const from = process.env.RESEND_FROM || `${companyName} <onboarding@resend.dev>`;
        const { error } = await resend.emails.send({ from, to, subject, html });
        if (error) throw new Error(error.message);
        return;
    }

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
            port:   parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
        await transporter.sendMail({ from: `"${companyName}" <${process.env.SMTP_USER}>`, to, subject, html });
        return;
    }

    // بيئة تطوير — لا يوجد إعداد بريد
    throw new Error('NO_EMAIL_CONFIG');
}

// POST /api/auth/forgot-password
// يرسل رابط إعادة التعيين للبريد
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });

    try {
        const result = await db.query('SELECT id, name FROM users WHERE email = $1', [email]);
        // نرد بنجاح دائماً لمنع تخمين الإيميلات
        if (result.rows.length === 0) {
            return res.json({ message: 'إذا كان البريد مسجلاً ستصلك رسالة' });
        }

        const user = result.rows[0];
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000); // ساعة واحدة

        await db.query(
            'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
            [token, expires, user.id]
        );

        const appUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
        const resetLink = `${appUrl}/reset-password?token=${token}`;
        const companyName = process.env.COMPANY_NAME || 'الوميض';

        const html = `
            <div dir="rtl" style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f9f9f9;border-radius:12px">
                <h2 style="color:#f97316">إعادة تعيين كلمة المرور</h2>
                <p>مرحباً ${user.name}،</p>
                <p>طُلب إعادة تعيين كلمة المرور لحسابك في <strong>${companyName}</strong>.</p>
                <p>اضغط على الزر التالي (صالح لمدة ساعة واحدة):</p>
                <a href="${resetLink}" style="display:inline-block;margin:16px 0;padding:12px 28px;background:#f97316;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">
                    إعادة تعيين كلمة المرور
                </a>
                <p style="color:#999;font-size:12px">إذا لم تطلب ذلك، تجاهل هذه الرسالة.</p>
            </div>`;

        try {
            await sendEmail({ to: email, subject: 'إعادة تعيين كلمة المرور', html });
        } catch (mailErr) {
            if (mailErr.message === 'NO_EMAIL_CONFIG') {
                console.log(`[DEV] Reset link for ${email}: ${resetLink}`);
            } else {
                throw mailErr;
            }
        }

        res.json({ message: 'إذا كان البريد مسجلاً ستصلك رسالة' });
    } catch (err) {
        console.error('forgot-password error:', err);
        res.status(500).json({ error: 'حدث خطأ، حاول مرة أخرى' });
    }
});

// POST /api/auth/reset-password
// يتحقق من التوكن ويحدّث كلمة المرور
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'البيانات ناقصة' });
    if (password.length < 6) return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });

    try {
        const result = await db.query(
            'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'الرابط غير صالح أو انتهت صلاحيته' });
        }

        const hashed = await bcrypt.hash(password, 10);
        await db.query(
            'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
            [hashed, result.rows[0].id]
        );

        res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
    } catch (err) {
        console.error('reset-password error:', err);
        res.status(500).json({ error: 'حدث خطأ، حاول مرة أخرى' });
    }
});

// GET /api/auth/verify-reset-token?token=xxx
// يتحقق إذا التوكن صالح قبل عرض الصفحة
router.get('/verify-reset-token', async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).json({ valid: false });

    try {
        const result = await db.query(
            'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
            [token]
        );
        res.json({ valid: result.rows.length > 0 });
    } catch (err) {
        res.status(500).json({ valid: false });
    }
});

module.exports = router;
