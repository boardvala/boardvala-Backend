const sendEmail = require("./sendemail");

// ---- Templates ----
function customerOrderHtml(order) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; color:#0f172a;">
      <h2 style="color:#0f172a;">Thank you for your order! 🎉</h2>
      <p>Hi ${order.customerName}, we've received your custom design order. Here are the details:</p>

      <table style="width:100%; border-collapse: collapse; margin: 18px 0;">
        <tr><td style="padding:8px 0; color:#64748b;">Order ID</td><td style="padding:8px 0; text-align:right; font-weight:bold;">${order._id}</td></tr>
        <tr><td style="padding:8px 0; color:#64748b;">Material</td><td style="padding:8px 0; text-align:right;">${order.material}</td></tr>
        <tr><td style="padding:8px 0; color:#64748b;">Size</td><td style="padding:8px 0; text-align:right;">${order.frameSize}</td></tr>
        <tr><td style="padding:8px 0; color:#64748b;">Orientation</td><td style="padding:8px 0; text-align:right;">${order.orientation}</td></tr>
        <tr><td style="padding:8px 0; color:#64748b;">Quantity</td><td style="padding:8px 0; text-align:right;">${order.quantity || 1}</td></tr>
        <tr><td style="padding:8px 0; color:#64748b;">Amount</td><td style="padding:8px 0; text-align:right; font-weight:bold;">₹${order.price}</td></tr>
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
  return `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; color:#0f172a;">
      <h2 style="color:#2563eb;">New Order Received</h2>

      <table style="width:100%; border-collapse: collapse; margin: 18px 0;">
        <tr><td style="padding:8px 0; color:#64748b;">Order ID</td><td style="padding:8px 0; text-align:right; font-weight:bold;">${order._id}</td></tr>
        <tr><td style="padding:8px 0; color:#64748b;">Material</td><td style="padding:8px 0; text-align:right;">${order.material}</td></tr>
        <tr><td style="padding:8px 0; color:#64748b;">Size</td><td style="padding:8px 0; text-align:right;">${order.frameSize}</td></tr>
        <tr><td style="padding:8px 0; color:#64748b;">Orientation</td><td style="padding:8px 0; text-align:right;">${order.orientation}</td></tr>
        <tr><td style="padding:8px 0; color:#64748b;">Quantity</td><td style="padding:8px 0; text-align:right;">${order.quantity || 1}</td></tr>
        <tr><td style="padding:8px 0; color:#64748b;">Amount</td><td style="padding:8px 0; text-align:right; font-weight:bold;">₹${order.price}</td></tr>
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
  // ग्राहकाला confirmation
  if (order.customerEmail) {
    await sendEmail({
      to: order.customerEmail,
      subject: "Your BoardVala order is confirmed",
      html: customerOrderHtml(order),
    });
  }

  // admin ला नवीन-order सूचना
  if (process.env.ADMIN_EMAIL) {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New order received — ${order.customerName}`,
      html: adminOrderHtml(order),
    });
  }
}

module.exports = { sendOrderEmails };