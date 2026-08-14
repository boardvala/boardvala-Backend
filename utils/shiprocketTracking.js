const axios = require("axios");
const { getShiprocketToken, SHIPROCKET_BASE } = require("./shiprocketAuth");

/**
 * order च्या Shiprocket order id ने सद्यस्थिती आणतो (AWB, status).
 * courier assign झाल्यावर AWB मिळतो; तोपर्यंत रिकामा असतो.
 *
 * response रचना (actual docs वरून):
 *   data.status            — order status ("PENDING", "RETURN PENDING", ...)
 *   data.status_code       — status code (21, ...)
 *   data.shipments.awb     — AWB (tracking number) — assign नंतर
 *   data.shipments.courier — courier नाव
 *   data.shipments.status  — shipment status ("PENDING", ...)
 *   data.delivered_date    — delivered तारीख (असेल तर)
 *
 * @param shiprocketOrderId — order मध्ये saved
 * परत: { awbCode, courierName, orderStatus, shipmentStatus, statusCode, deliveredDate } किंवा null
 */
async function getOrderStatus(shiprocketOrderId) {
  if (!shiprocketOrderId) return null;

  const token = await getShiprocketToken();

  try {
    const response = await axios.get(
      `${SHIPROCKET_BASE}/orders/show/${shiprocketOrderId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    // खरी रचना — data थेट (data.data नाही)
    const data = response.data?.data;
    if (!data) return null;

    const shipment = data.shipments || {};

    return {
      awbCode: shipment.awb || "",
      courierName: shipment.courier || "",
      orderStatus: data.status || "",
      shipmentStatus: shipment.status || "",
      statusCode: data.status_code || "",
      deliveredDate: data.delivered_date || shipment.delivered_date || "",
    };
  } catch (err) {
    console.error(
      "Shiprocket status fetch failed:",
      err.response?.data || err.message,
    );
    return null;
  }
}

/**
 * AWB ने detailed tracking (checkpoints — कुठे पोहोचलं). AWB असेल तरच.
 * @param awbCode
 * परत: tracking data किंवा null
 *
 * ⚠️ endpoint/response docs शी पडताळा.
 */
async function trackByAwb(awbCode) {
  if (!awbCode) return null;

  const token = await getShiprocketToken();

  try {
    const response = await axios.get(
      `${SHIPROCKET_BASE}/courier/track/awb/${awbCode}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return response.data;
  } catch (err) {
    console.error(
      "Shiprocket AWB track failed:",
      err.response?.data || err.message,
    );
    return null;
  }
}

module.exports = { getOrderStatus, trackByAwb };