const nodemailer = require('nodemailer');
require('dotenv').config();

const {
    buildCustomerOrderEmail,
    buildOwnerAlertEmail,
    buildStatusUpdateEmail,
} = require('./emailTemplates');

// ── Transporter (shared across all send functions) ───────────────────────────
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const OWNER_EMAIL = process.env.OWNER_EMAIL || process.env.EMAIL_USER;

// ── Internal base sender ─────────────────────────────────────────────────────
/**
 * Core send utility. Never throws — returns { success, error }.
 */
const _send = async ({ to, subject, html, attachments }) => {
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.COMPANY_NAME || 'Engineering ERP'}" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            ...(attachments ? { attachments } : {}),
        });
        console.log(`[EMAIL ✓] Sent to ${to} | Subject: "${subject}" | ID: ${info.messageId}`);
        return { success: true };
    } catch (error) {
        console.error(`[EMAIL ✗] Failed to send to ${to} | Subject: "${subject}"`);
        console.error(`          Reason: ${error.message}`);
        return { success: false, error: error.message };
    }
};

// ── 1. OTP Email (existing — kept intact) ────────────────────────────────────
const sendOTPEmail = async (toEmail, otp) => {
    const { success } = await _send({
        to: toEmail,
        subject: 'Your OTP Verification Code — Engineering ERP',
        html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb">
              <h2 style="color:#16a34a;margin:0 0 16px 0">Email Verification</h2>
              <p style="color:#374151;margin:0 0 20px 0">Use the OTP below to verify your email address. It expires in <strong>5 minutes</strong>.</p>
              <div style="text-align:center;background:#f0fdf4;border:2px dashed #16a34a;border-radius:10px;padding:20px;margin-bottom:20px">
                <span style="font-size:36px;font-weight:900;color:#16a34a;letter-spacing:10px">${otp}</span>
              </div>
              <p style="color:#9ca3af;font-size:12px;margin:0">If you didn't request this, please ignore this email.</p>
            </div>`,
    });
    return success;
};

// ── 2. Order Confirmation → Customer ─────────────────────────────────────────
/**
 * @param {object} orderData — full order object from DB (including .items and .invoice)
 * @param {string} customerEmail
 */
const sendOrderConfirmationEmail = async (orderData, customerEmail) => {
    const invoice = orderData.invoice || {};
    const { subject, html } = buildCustomerOrderEmail({
        customerName:  orderData.customer_name,
        customerEmail,
        orderId:       orderData.order_id || orderData.id,
        orderDate:     orderData.created_at || new Date(),
        items:         orderData.items || [],
        taxableAmount: invoice.taxable_amount || 0,
        cgst:          invoice.cgst || 0,
        sgst:          invoice.sgst || 0,
        totalTax:      invoice.total_tax || 0,
        finalAmount:   invoice.final_amount || orderData.total_amount || 0,
        status:        orderData.status || 'pending',
    });

    return _send({ to: customerEmail, subject, html });
};

// ── 3. New Order Alert → Owner / Admin ───────────────────────────────────────
/**
 * @param {object} orderData — full order object from DB
 * @param {string} customerEmail
 */
const sendOwnerOrderAlert = async (orderData, customerEmail) => {
    const invoice = orderData.invoice || {};
    const { subject, html } = buildOwnerAlertEmail({
        customerName:  orderData.customer_name,
        customerEmail,
        orderId:       orderData.order_id || orderData.id,
        orderDate:     orderData.created_at || new Date(),
        items:         orderData.items || [],
        finalAmount:   invoice.final_amount || orderData.total_amount || 0,
        itemCount:     (orderData.items || []).length,
        status:        orderData.status || 'pending',
    });

    return _send({ to: OWNER_EMAIL, subject, html });
};

// ── 4. Status Update Email → Customer ────────────────────────────────────────
/**
 * @param {object} orderData — { customer_name, id, status, total_amount }
 * @param {string} customerEmail
 * @param {string} newStatus
 */
const sendOrderStatusUpdateEmail = async (orderData, customerEmail, newStatus) => {
    const { subject, html } = buildStatusUpdateEmail({
        customerName: orderData.customer_name,
        orderId:      orderData.id,
        newStatus,
        finalAmount:  orderData.total_amount || 0,
    });

    return _send({ to: customerEmail, subject, html });
};

module.exports = {
    sendOTPEmail,
    sendOrderConfirmationEmail,
    sendOwnerOrderAlert,
    sendOrderStatusUpdateEmail,
};
