const sendEmail = require("./sendemail");

// order custom design आहे की featured product — ओळखतो.
function isFeatured(order) {
  return !!order.featuredProduct || (!!order.title && !order.material);
}

// custom order banner आहे का — banner ला bannerWidth असतो (किंवा orientation रिकामं)
function isBanner(order) {
  return order.bannerWidth != null || order.orientation === "";
}

// order च्या प्रकारानुसार details ओळी (rows) बनवतो.
function detailRows(order) {
  if (isFeatured(order)) {
    // ---- Featured product ----
    return `
      <tr><td style="padding:8px 0; color:#64748b;">Product</td><td style="padding:8px 0; text-align:right;">${order.title}</td></tr>
      <tr><td style="padding:8px 0; color:#64748b;">Quantity</td><td style="padding:8px 0; text-align:right;">${order.quantity || 1}</td></tr>
      <tr><td style="padding:8px 0; color:#64748b;">Amount</td><td style="padding:8px 0; text-align:right; font-weight:bold;">₹${order.totalAmount}</td></tr>
    `;
  }

  // ---- Custom design (banner की fixed) ----
  const orientationRow = isBanner(order)
    ? "" // banner ला orientation दाखवायचं नाही
    : `<tr><td style="padding:8px 0; color:#64748b;">Orientation</td><td style="padding:8px 0; text-align:right;">${order.orientation}</td></tr>`;

  const sizeLabel = isBanner(order) ? "Banner Size" : "Size";

  return `
    <tr><td style="padding:8px 0; color:#64748b;">Material</td><td style="padding:8px 0; text-align:right;">${order.material}</td></tr>
    <tr><td style="padding:8px 0; color:#64748b;">${sizeLabel}</td><td style="padding:8px 0; text-align:right;">${order.frameSize}</td></tr>
    ${orientationRow}
    <tr><td style="padding:8px 0; color:#64748b;">Quantity</td><td style="padding:8px 0; text-align:right;">${order.quantity || 1}</td></tr>
    <tr><td style="padding:8px 0; color:#64748b;">Amount</td><td style="padding:8px 0; text-align:right; font-weight:bold;">₹${order.totalAmount}</td></tr>
  `;
}

// ---- Templates ----
function customerOrderHtml(order) {
  const orderKind = isFeatured(order) ? "order" : "custom design order";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; color:#0f172a;">
      <h2 style="color:#0f172a;">Thank you for your order! 🎉</h2>
      <p>Hi ${order.customerName}, we've received your ${orderKind}. Here are the details:</p>

      <table style="width:100%; border-collapse: collapse; margin: 18px 0;">
        <tr><td style="padding:8px 0; color:#64748b;">Order ID</td><td style="padding:8px 0; text-align:right; font-weight:bold;">#${order._id.toString().slice(-6).toUpperCase()}</td></tr>
        ${detailRows(order)}
      </table>

      <p style="color:#64748b;"><strong>Delivery to:</strong><br/>
        ${order.customerName}<br/>
        ${order.customerAddress}<br/>
        Phone: ${order.customerPhone}
      </p>

      <p>We'll start crafting your order and keep you updated. For any queries, just reply to this email.</p>
      <p style="margin-top:24px;">— Team BoardVala</p>
    </div>
  `;
}

function adminOrderHtml(order) {
  let typeLabel = "Custom Design";
  if (isFeatured(order)) {
    typeLabel = "Featured Product";
  } else if (isBanner(order)) {
    typeLabel = "Banner";
  }

  return `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; color:#0f172a;">
      <h2 style="color:#2563eb;">New Order Received</h2>

      <table style="width:100%; border-collapse: collapse; margin: 18px 0;">
        <tr><td style="padding:8px 0; color:#64748b;">Order ID</td><td style="padding:8px 0; text-align:right; font-weight:bold;">#${order._id.toString().slice(-6).toUpperCase()}</td></tr>
        <tr><td style="padding:8px 0; color:#64748b;">Type</td><td style="padding:8px 0; text-align:right;">${typeLabel}</td></tr>
        ${detailRows(order)}
      </table>

      <p style="color:#64748b;"><strong>Customer:</strong><br/>
        ${order.customerName}<br/>
        ${order.customerAddress}<br/>
        Phone: ${order.customerPhone}<br/>
        Email: ${order.customerEmail || "Not provided"}
      </p>

      ${order.instructions ? `<p style="color:#64748b;"><strong>Instructions:</strong> ${order.instructions}</p>` : ""}
    </div>
  `;
}

/**
 * Order झाल्यावर ग्राहक + admin दोघांना email पाठवतो.
 * हे स्वतःच्या try/catch मध्ये चालवा — email fail झालं तरी order तुटू नये.
 */
async function sendOrderEmails(order) {
  if (order.customerEmail) {
    await sendEmail({
      to: order.customerEmail,
      subject: "Your BoardVala order is confirmed",
      html: customerOrderHtml(order),
    });
  }

  if (process.env.ADMIN_EMAIL) {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New order received — ${order.customerName}`,
      html: adminOrderHtml(order),
    });
  }
}

// ---- Shipping/Pickup Notification Email ----
async function sendShippingEmail(order) {
  const {
    customerName,
    customerEmail,
    courierName,
    trackingNumber,
    shippingStatus,
    material,
    frameSize,
    price,
    quantity,
    totalAmount,
  } = order;

  const subject = `Your BoardVala Order Has Been Shipped! 🚚`;

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1b263b 0%, #243c63 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Your Order is on the Way! 🎉</h1>
        <p style="color: #94a3b8; margin: 8px 0 0; font-size: 14px;">BoardVala — Custom UV Printing</p>
      </div>

      <!-- Body -->
      <div style="padding: 30px;">
        
        <p style="font-size: 16px; color: #1b263b;">Hi <strong>${customerName}</strong>,</p>
        
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
          Great news! Your order has been shipped and is on its way to you. Here are the shipping details:
        </p>

        <!-- Shipping Details -->
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px; color: #16a34a; font-size: 16px;">
            🚚 Shipping Details
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Courier</td>
              <td style="padding: 6px 0; font-weight: 600; color: #1b263b; font-size: 14px; text-align: right;">${courierName || "—"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Tracking Number</td>
              <td style="padding: 6px 0; font-weight: 600; color: #2563eb; font-size: 14px; text-align: right;">${trackingNumber}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Status</td>
              <td style="padding: 6px 0; font-weight: 600; color: #16a34a; font-size: 14px; text-align: right;">${shippingStatus || "Shipped"}</td>
            </tr>
          </table>
        </div>

        <!-- Order Summary -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px; color: #1b263b; font-size: 16px;">
            📦 Order Summary
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${material ? `
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Material</td>
              <td style="padding: 6px 0; font-weight: 600; color: #1b263b; font-size: 14px; text-align: right;">${material}</td>
            </tr>` : ""}
            ${frameSize ? `
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Size</td>
              <td style="padding: 6px 0; font-weight: 600; color: #1b263b; font-size: 14px; text-align: right;">${frameSize}</td>
            </tr>` : ""}
            ${quantity ? `
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Quantity</td>
              <td style="padding: 6px 0; font-weight: 600; color: #1b263b; font-size: 14px; text-align: right;">${quantity}</td>
            </tr>` : ""}
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Amount</td>
              <td style="padding: 6px 0; font-weight: 700; color: #16a34a; font-size: 16px; text-align: right;">₹ ${totalAmount || price || "—"}</td>
            </tr>
          </table>
        </div>

        <!-- Delivery Address -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px; color: #1b263b; font-size: 16px;">
            📍 Delivering To
          </h3>
          <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">
            <strong>${customerName}</strong><br>
            ${order.customerAddress || ""}<br>
            ${order.customerCity || ""}, ${order.customerState || ""} - ${order.customerPincode || ""}<br>
            📞 ${order.customerPhone || ""}
          </p>
        </div>

        <!-- CTA -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://boardvala.com/account/orders" 
             style="background: #1b263b; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
            Track Your Order →
          </a>
        </div>

        <!-- Note -->
        <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin-top: 20px;">
          Your order will be delivered within 3-7 business days. If you have any questions, reply to this email or contact us on WhatsApp.
        </p>

      </div>

      <!-- Footer -->
      <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #94a3b8; font-size: 12px;">
          BoardVala.com — Custom UV Printing & Home Decor<br>
          © ${new Date().getFullYear()} BoardVala. All rights reserved.
        </p>
      </div>

    </div>
  `;

  await sendMail(customerEmail, subject, html);
}

module.exports = { sendOrderEmails, sendShippingEmail  };