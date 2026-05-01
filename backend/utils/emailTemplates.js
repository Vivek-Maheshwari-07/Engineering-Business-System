/**
 * emailTemplates.js
 * Professional HTML email templates for the Engineering ERP system.
 * All templates return complete HTML strings ready to send via Nodemailer.
 */

const COMPANY_NAME  = 'Engineering ERP';
const COMPANY_EMAIL = 'erp.manegement.system@gmail.com';
const BRAND_GREEN   = '#16a34a';
const BRAND_DARK    = '#111827';

// ── Shared formatter helpers ─────────────────────────────────────────────────
const fmtINR = (n) =>
    `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (d) =>
    new Date(d).toLocaleString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

// ── Shared email wrapper ─────────────────────────────────────────────────────
const emailWrapper = (bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${COMPANY_NAME}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
      background-color: #f3f4f6;
      color: #374151;
      padding: 24px 16px;
    }
    .wrapper    { max-width: 620px; margin: 0 auto; }
    .card       { background: #ffffff; border-radius: 12px; overflow: hidden;
                  box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .header     { background: ${BRAND_GREEN}; padding: 28px 36px; text-align: center; }
    .header h1  { color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
    .header p   { color: #dcfce7; font-size: 13px; margin-top: 4px; }
    .body       { padding: 32px 36px; }
    .greeting   { font-size: 18px; font-weight: 700; color: ${BRAND_DARK}; margin-bottom: 8px; }
    .subtext    { font-size: 14px; color: #6b7280; line-height: 1.6; margin-bottom: 24px; }
    .section-title {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 12px;
      padding-bottom: 6px; border-bottom: 1px solid #e5e7eb;
    }
    .info-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
    .info-item  { background: #f9fafb; border-radius: 8px; padding: 12px 14px;
                  border: 1px solid #e5e7eb; }
    .info-label { font-size: 11px; font-weight: 700; text-transform: uppercase;
                  letter-spacing: 0.06em; color: #9ca3af; margin-bottom: 3px; }
    .info-value { font-size: 14px; font-weight: 600; color: ${BRAND_DARK}; }
    table.items { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    table.items thead tr { background: #f0fdf4; }
    table.items thead th {
      padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.06em; color: ${BRAND_GREEN};
      border-bottom: 2px solid #dcfce7;
    }
    table.items thead th:last-child { text-align: right; }
    table.items tbody tr { border-bottom: 1px solid #f3f4f6; }
    table.items tbody tr:hover { background: #fafafa; }
    table.items td { padding: 10px 12px; vertical-align: middle; }
    table.items td.right { text-align: right; font-weight: 600; color: ${BRAND_DARK}; }
    table.items td.name { font-weight: 600; color: ${BRAND_DARK}; }
    table.items td.sub  { font-size: 11px; color: #9ca3af; }
    .totals-box { background: #f9fafb; border: 1px solid #e5e7eb;
                  border-radius: 10px; padding: 18px 20px; margin-bottom: 24px; }
    .total-row  { display: flex; justify-content: space-between;
                  font-size: 13px; margin-bottom: 8px; color: #4b5563; }
    .total-row.divider { border-top: 1px dashed #d1d5db; padding-top: 8px; margin-top: 4px; color: #374151; font-weight: 600; }
    .total-row.grand   { border-top: 2px solid ${BRAND_GREEN}; padding-top: 10px; margin-top: 4px;
                          font-size: 16px; font-weight: 800; color: ${BRAND_DARK}; }
    .total-row.grand span:last-child { color: ${BRAND_GREEN}; }
    .status-badge {
      display: inline-block; padding: 4px 12px; border-radius: 9999px;
      font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
    }
    .status-pending   { background: #fef3c7; color: #b45309; }
    .status-completed { background: #dcfce7; color: #166534; }
    .status-cancelled { background: #fee2e2; color: #991b1b; }
    .cta-button {
      display: inline-block; margin: 6px 0 24px 0;
      background: ${BRAND_GREEN}; color: #ffffff;
      padding: 12px 28px; border-radius: 8px; text-decoration: none;
      font-weight: 700; font-size: 14px; letter-spacing: 0.3px;
    }
    .footer { padding: 20px 36px; background: #f9fafb;
              border-top: 1px solid #e5e7eb; text-align: center; }
    .footer p { font-size: 12px; color: #9ca3af; line-height: 1.6; }
    .footer a { color: ${BRAND_GREEN}; text-decoration: none; }
    @media (max-width: 480px) {
      .body, .footer { padding: 24px 20px; }
      .info-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      ${bodyContent}
    </div>
  </div>
</body>
</html>`;

// ── 1. Customer Order Confirmation ───────────────────────────────────────────
/**
 * @param {object} params
 * @param {string}  params.customerName
 * @param {string}  params.customerEmail
 * @param {number}  params.orderId
 * @param {Date}    params.orderDate
 * @param {Array}   params.items          [{product_name, size, unit, quantity, price, subtotal}]
 * @param {number}  params.taxableAmount
 * @param {number}  params.cgst
 * @param {number}  params.sgst
 * @param {number}  params.totalTax
 * @param {number}  params.finalAmount
 * @param {string}  params.status         'pending' | 'completed' | 'cancelled'
 */
const buildCustomerOrderEmail = ({
    customerName, customerEmail, orderId, orderDate,
    items, taxableAmount, cgst, sgst, totalTax, finalAmount, status
}) => {
    const statusClass = `status-${status}`;

    const itemRows = (items || []).map(item => `
        <tr>
          <td>
            <span class="name">${item.product_name}</span><br/>
            <span class="sub">Size: ${item.size} &nbsp;|&nbsp; Unit: ${item.unit}</span>
          </td>
          <td style="text-align:center; color:#374151;">${item.quantity}</td>
          <td class="right">${fmtINR(item.price)}</td>
          <td class="right">${fmtINR(item.subtotal || item.quantity * item.price)}</td>
        </tr>`).join('');

    const body = `
    <div class="header">
      <h1>✅ Order Confirmed</h1>
      <p>${COMPANY_NAME} &nbsp;•&nbsp; Order #ORD-${orderId}</p>
    </div>
    <div class="body">
      <p class="greeting">Hello, ${customerName}!</p>
      <p class="subtext">
        Thank you for placing your order with <strong>${COMPANY_NAME}</strong>. 
        Your order has been received and is being processed. 
        You can find your complete order details below.
      </p>

      <p class="section-title">Order Information</p>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Order ID</div>
          <div class="info-value">#ORD-${orderId}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Order Date</div>
          <div class="info-value">${fmtDate(orderDate)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Customer</div>
          <div class="info-value">${customerName}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Payment Status</div>
          <div class="info-value">
            <span class="status-badge ${statusClass}">${status}</span>
          </div>
        </div>
      </div>

      <p class="section-title">Items Ordered</p>
      <table class="items">
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align:center">Qty</th>
            <th style="text-align:right">Unit Price</th>
            <th style="text-align:right">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <p class="section-title">GST Breakdown</p>
      <div class="totals-box">
        <div class="total-row">
          <span>Taxable Amount</span>
          <span>${fmtINR(taxableAmount)}</span>
        </div>
        <div class="total-row">
          <span>CGST @ 9%</span>
          <span>${fmtINR(cgst)}</span>
        </div>
        <div class="total-row divider">
          <span>SGST @ 9%</span>
          <span>${fmtINR(sgst)}</span>
        </div>
        <div class="total-row">
          <span>Total GST (18%)</span>
          <span>${fmtINR(totalTax)}</span>
        </div>
        <div class="total-row grand">
          <span>Grand Total</span>
          <span>${fmtINR(finalAmount)}</span>
        </div>
      </div>

      <p class="subtext">
        If you have any questions about your order, please contact us at 
        <a href="mailto:${COMPANY_EMAIL}" style="color:${BRAND_GREEN}">${COMPANY_EMAIL}</a>.
      </p>
    </div>
    <div class="footer">
      <p>This is an automated confirmation from <strong>${COMPANY_NAME}</strong>.</p>
      <p style="margin-top:4px">Please do not reply to this email &nbsp;•&nbsp; 
         <a href="mailto:${COMPANY_EMAIL}">Contact Support</a></p>
    </div>`;

    return {
        subject: `Order Confirmed ✅ - #ORD-${orderId} | ${COMPANY_NAME}`,
        html: emailWrapper(body),
    };
};

// ── 2. Owner / Admin New Order Alert ─────────────────────────────────────────
/**
 * @param {object} params
 * @param {string}  params.customerName
 * @param {string}  params.customerEmail
 * @param {number}  params.orderId
 * @param {Date}    params.orderDate
 * @param {Array}   params.items
 * @param {number}  params.finalAmount
 * @param {number}  params.itemCount
 * @param {string}  params.status
 */
const buildOwnerAlertEmail = ({
    customerName, customerEmail, orderId, orderDate,
    items, finalAmount, itemCount, status
}) => {
    const itemRows = (items || []).map(item => `
        <tr>
          <td>${item.product_name} (${item.size})</td>
          <td style="text-align:center">${item.quantity} ${item.unit}</td>
          <td style="text-align:right; font-weight:600">${fmtINR(item.subtotal || item.quantity * item.price)}</td>
        </tr>`).join('');

    const body = `
    <div class="header" style="background:#1f2937">
      <h1 style="color:#ffffff">🛒 New Order Received</h1>
      <p style="color:#d1d5db">${COMPANY_NAME} &nbsp;•&nbsp; Admin Notification</p>
    </div>
    <div class="body">
      <p class="greeting">New order placed — action may be required.</p>
      <p class="subtext">
        A customer has placed a new order. Review the details below and update the order status as needed.
      </p>

      <p class="section-title">Customer Details</p>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Customer Name</div>
          <div class="info-value">${customerName}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Email</div>
          <div class="info-value" style="word-break:break-word">${customerEmail}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Order ID</div>
          <div class="info-value">#ORD-${orderId}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Order Date</div>
          <div class="info-value">${fmtDate(orderDate)}</div>
        </div>
      </div>

      <p class="section-title">Order Summary (${itemCount} item${itemCount !== 1 ? 's' : ''})</p>
      <table class="items">
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align:center">Quantity</th>
            <th style="text-align:right">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div class="totals-box">
        <div class="total-row">
          <span>Status</span>
          <span><span class="status-badge status-${status}">${status}</span></span>
        </div>
        <div class="total-row grand">
          <span>Order Total (incl. 18% GST)</span>
          <span>${fmtINR(finalAmount)}</span>
        </div>
      </div>

      <p class="subtext" style="font-size:12px;color:#9ca3af">
        Log into the ERP system to view the full order details and invoice.
      </p>
    </div>
    <div class="footer">
      <p><strong>${COMPANY_NAME}</strong> &nbsp;•&nbsp; Internal Admin Notification</p>
      <p style="margin-top:4px">Do not share this email externally.</p>
    </div>`;

    return {
        subject: `🛒 New Order #ORD-${orderId} — ${customerName} | ${COMPANY_NAME}`,
        html: emailWrapper(body),
    };
};

// ── 3. Order Status Update (e.g. completed / cancelled) ──────────────────────
/**
 * @param {object} params
 * @param {string}  params.customerName
 * @param {number}  params.orderId
 * @param {string}  params.newStatus     'completed' | 'cancelled' | 'pending'
 * @param {number}  params.finalAmount
 */
const buildStatusUpdateEmail = ({ customerName, orderId, newStatus, finalAmount }) => {
    const isCompleted = newStatus === 'completed';
    const isCancelled = newStatus === 'cancelled';

    const emoji    = isCompleted ? '✅' : isCancelled ? '❌' : '⏳';
    const headline = isCompleted ? 'Order Completed' : isCancelled ? 'Order Cancelled' : 'Order Updated';
    const message  = isCompleted
        ? `Your order <strong>#ORD-${orderId}</strong> has been marked as <strong>completed</strong>. Thank you for your business!`
        : isCancelled
        ? `Your order <strong>#ORD-${orderId}</strong> has been <strong>cancelled</strong>. If this was unexpected, please contact our support team.`
        : `The status of order <strong>#ORD-${orderId}</strong> has been updated to <strong>${newStatus}</strong>.`;

    const accentColor = isCompleted ? BRAND_GREEN : isCancelled ? '#dc2626' : '#f59e0b';

    const body = `
    <div class="header" style="background:${accentColor}">
      <h1>${emoji} ${headline}</h1>
      <p style="color:rgba(255,255,255,0.8)">${COMPANY_NAME} &nbsp;•&nbsp; Order #ORD-${orderId}</p>
    </div>
    <div class="body">
      <p class="greeting">Hello, ${customerName}!</p>
      <p class="subtext">${message}</p>

      <div class="totals-box">
        <div class="total-row">
          <span>Order ID</span>
          <span style="font-weight:700">#ORD-${orderId}</span>
        </div>
        <div class="total-row">
          <span>New Status</span>
          <span><span class="status-badge status-${newStatus}">${newStatus}</span></span>
        </div>
        <div class="total-row grand">
          <span>Order Total</span>
          <span>${fmtINR(finalAmount)}</span>
        </div>
      </div>

      <p class="subtext">
        Questions? Contact us at 
        <a href="mailto:${COMPANY_EMAIL}" style="color:${BRAND_GREEN}">${COMPANY_EMAIL}</a>
      </p>
    </div>
    <div class="footer">
      <p>This is an automated notification from <strong>${COMPANY_NAME}</strong>.</p>
    </div>`;

    return {
        subject: `${emoji} Order #ORD-${orderId} ${headline} | ${COMPANY_NAME}`,
        html: emailWrapper(body),
    };
};

module.exports = {
    buildCustomerOrderEmail,
    buildOwnerAlertEmail,
    buildStatusUpdateEmail,
};
