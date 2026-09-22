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
  const rowStyle = 'padding: 6px 0; color: #6b7280; font-size: 14px;';
  const valStyle = 'padding: 6px 0; font-weight: 600; color: #1b263b; font-size: 14px; text-align: right;';
  const amtStyle = 'padding: 8px 0; font-weight: 700; color: #16a34a; font-size: 18px; text-align: right; border-top: 1px solid #e2e8f0;';
  const amtLabelStyle = 'padding: 8px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e2e8f0;';

  if (isFeatured(order)) {
    return `
      <tr><td style="${rowStyle}">Product</td><td style="${valStyle}">${order.title}</td></tr>
      <tr><td style="${rowStyle}">Quantity</td><td style="${valStyle}">${order.quantity || 1}</td></tr>
      <tr><td style="${amtLabelStyle}">Amount Paid</td><td style="${amtStyle}">₹ ${order.totalAmount}</td></tr>
    `;
  }

  const orientationRow = isBanner(order)
    ? ""
    : `<tr><td style="${rowStyle}">Orientation</td><td style="${valStyle}">${order.orientation}</td></tr>`;

  const sizeLabel = isBanner(order) ? "Banner Size" : "Size";

  return `
    <tr><td style="${rowStyle}">Material</td><td style="${valStyle}">${order.material}</td></tr>
    <tr><td style="${rowStyle}">${sizeLabel}</td><td style="${valStyle}">${order.frameSize}</td></tr>
    ${orientationRow}
    <tr><td style="${rowStyle}">Quantity</td><td style="${valStyle}">${order.quantity || 1}</td></tr>
    <tr><td style="${amtLabelStyle}">Amount Paid</td><td style="${amtStyle}">₹ ${order.totalAmount}</td></tr>
  `;
}

// ---- Templates ----
function customerOrderHtml(order) {
  const orderKind = isFeatured(order) ? "featured product" : isBanner(order) ? "custom banner" : "custom design";
  const orderId = order._id.toString().slice(-6).toUpperCase();

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1b263b 0%, #243c63 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Order Confirmed! 🎉</h1>
        <p style="color: #94a3b8; margin: 8px 0 0; font-size: 14px;">BoardVala — Custom UV Printing</p>
      </div>

      <!-- Body -->
      <div style="padding: 30px;">
        
        <p style="font-size: 16px; color: #1b263b;">Hi <strong>${order.customerName}</strong>,</p>
        
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
          Thank you for your order! We've received your ${orderKind} order and will start crafting it soon.
        </p>

        <!-- Order ID -->
        <div style="text-align: center; margin: 20px 0;">
          <span style="background: #1b263b; color: #fff; padding: 8px 20px; border-radius: 8px; font-size: 14px; font-weight: 600;">
            Order #${orderId}
          </span>
        </div>

        <!-- Order Details -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px; color: #1b263b; font-size: 16px;">📦 Order Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${detailRows(order)}
          </table>
        </div>

        <!-- Payment -->
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px 20px; margin: 20px 0; text-align: center;">
          <span style="color: #16a34a; font-weight: 700; font-size: 14px;">✅ Payment Successful</span>
        </div>

        <!-- Delivery Address -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px; color: #1b263b; font-size: 16px;">📍 Delivery Address</h3>
          <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">
            <strong>${order.customerName}</strong><br>
            ${order.customerAddress || ""}<br>
            ${order.customerCity || ""}, ${order.customerState || ""} - ${order.customerPincode || ""}<br>
            📞 ${order.customerPhone || ""}
            ${order.customerEmail ? `<br>✉️ ${order.customerEmail}` : ""}
          </p>
        </div>

        <!-- What's Next -->
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px; color: #1b263b; font-size: 16px;">🔜 What's Next?</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; font-size: 14px; color: #334155;"><strong style="color: #2563eb;">1.</strong> We'll start production of your order</td></tr>
            <tr><td style="padding: 6px 0; font-size: 14px; color: #334155;"><strong style="color: #2563eb;">2.</strong> Dispatched within 3-5 business days</td></tr>
            <tr><td style="padding: 6px 0; font-size: 14px; color: #334155;"><strong style="color: #2563eb;">3.</strong> You'll receive tracking details via email</td></tr>
          </table>
        </div>

        <!-- CTA -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://boardvala.com/account/orders" 
             style="background: #1b263b; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
            View My Orders →
          </a>
        </div>

        <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin-top: 20px;">
          If you have any questions about your order, reply to this email or contact us on WhatsApp. We're happy to help!
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
}

function adminOrderHtml(order) {
  let typeLabel = "Custom Design";
  if (isFeatured(order)) {
    typeLabel = "Featured Product";
  } else if (isBanner(order)) {
    typeLabel = "Banner";
  }

  const orderId = order._id.toString().slice(-6).toUpperCase();

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1b263b 0%, #243c63 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Order Received! 🛒</h1>
        <p style="color: #94a3b8; margin: 8px 0 0; font-size: 14px;">BoardVala Admin</p>
      </div>

      <!-- Body -->
      <div style="padding: 30px;">

        <!-- Order ID + Type -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <span style="background: #1b263b; color: #fff; padding: 8px 20px; border-radius: 8px; font-size: 14px; font-weight: 600;">
            Order #${orderId}
          </span>
          <span style="background: #eff6ff; color: #2563eb; padding: 6px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;">
            ${typeLabel}
          </span>
        </div>

        <!-- Order Details -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px; color: #1b263b; font-size: 16px;">📦 Order Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${detailRows(order)}
          </table>
        </div>

        <!-- Customer Info -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px; color: #1b263b; font-size: 16px;">👤 Customer Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Name</td>
              <td style="padding: 6px 0; font-weight: 600; color: #1b263b; font-size: 14px; text-align: right;">${order.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Phone</td>
              <td style="padding: 6px 0; font-weight: 600; color: #1b263b; font-size: 14px; text-align: right;">📞 ${order.customerPhone}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Email</td>
              <td style="padding: 6px 0; font-weight: 600; color: #1b263b; font-size: 14px; text-align: right;">${order.customerEmail || "Not provided"}</td>
            </tr>
          </table>
        </div>

        <!-- Delivery Address -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px; color: #1b263b; font-size: 16px;">📍 Delivery Address</h3>
          <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">
            ${order.customerAddress || ""}<br>
            ${order.customerCity || ""}, ${order.customerState || ""} - ${order.customerPincode || ""}
          </p>
        </div>

        <!-- Special Instructions -->
        ${order.instructions ? `
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 8px; color: #92400e; font-size: 16px;">📝 Special Instructions</h3>
          <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.5;">${order.instructions}</p>
        </div>
        ` : ""}

        <!-- CTA -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://boardvala.com/admin/custom-design-orders/${order._id}" 
             style="background: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
            View Order Details →
          </a>
        </div>

      </div>

      <!-- Footer -->
      <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #94a3b8; font-size: 12px;">
          BoardVala Admin Panel<br>
          © ${new Date().getFullYear()} BoardVala. All rights reserved.
        </p>
      </div>

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

  await sendEmail({to: customerEmail, subject: subject, html: html});
}

module.exports = { sendOrderEmails, sendShippingEmail  };