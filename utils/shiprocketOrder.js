const axios = require("axios");
const { getShiprocketToken, SHIPROCKET_BASE } = require("./shiprocketAuth");

// तुमच्या Shiprocket dashboard मधल्या pickup चं नेमकं नाव (env मध्ये ठेवा — बदलता येईल)
const PICKUP_LOCATION = process.env.SHIPROCKET_PICKUP_LOCATION || "Primary";

// default package मान (products ला weight नाही म्हणून — नंतर material नुसार करता येईल)
const DEFAULT_PACKAGE = {
  weight: 0.5, // kg
  length: 10, // cm
  breadth: 10, // cm
  height: 5, // cm
};

/**
 * एक order Shiprocket ला push करतो (create adhoc order API).
 * @param order  — आपला saved order (custom किंवा featured)
 * @param items  — [{ name, sku, units, selling_price }]
 * परत: { shiprocketOrderId, shipmentId } किंवा throw
 *
 * ⚠️ fields/endpoint/response Shiprocket च्या current docs शी पडताळा.
 */
async function pushOrderToShiprocket(order, items) {
  const token = await getShiprocketToken();

  const orderRef = order._id.toString();

  const payload = {
    order_id: orderRef,
    order_date: new Date(order.createdAt || Date.now())
      .toISOString()
      .slice(0, 10), // YYYY-MM-DD
    pickup_location: PICKUP_LOCATION,

    // billing = shipping (एकच customer)
    billing_customer_name: order.customerName,
    billing_last_name: "",
    billing_address: order.customerAddress,
    billing_city: order.customerCity,
    billing_pincode: order.customerPincode,
    billing_state: order.customerState,
    billing_country: "India",
    billing_email: order.customerEmail || "",
    billing_phone: order.customerPhone,
    shipping_is_billing: true,

    order_items: items,

    payment_method: "Prepaid", // Razorpay ने आधीच paid
    sub_total: order.totalAmount,

    // package (default — products ला weight नाही)
    length: DEFAULT_PACKAGE.length,
    breadth: DEFAULT_PACKAGE.breadth,
    height: DEFAULT_PACKAGE.height,
    weight: DEFAULT_PACKAGE.weight,
  };

  try {
    const response = await axios.post(
      `${SHIPROCKET_BASE}/orders/create/adhoc`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    // response मध्ये order_id, shipment_id — docs शी पडताळा
    return {
      shiprocketOrderId: response.data.order_id,
      shipmentId: response.data.shipment_id,
    };
  } catch (err) {
    console.error(
      "Shiprocket order push failed:",
      err.response?.data || err.message,
    );
    throw new Error("Could not push order to Shiprocket.");
  }
}

module.exports = { pushOrderToShiprocket };