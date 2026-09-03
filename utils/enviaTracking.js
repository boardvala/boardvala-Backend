const axios = require("axios");
const { ENVIA_BASE, getEnviaHeaders } = require("./enviaAuth");

/**
 * Track shipment by tracking number — Shiprocket trackByAwb चा replacement
 */
async function trackShipment(trackingNumber) {
  try {
    const res = await axios.post(
      `${ENVIA_BASE}/ship/tracking/`,
      { trackingNumber },
      { headers: getEnviaHeaders() },
    );

    const data = res.data?.data || res.data;

    return {
      success: true,
      trackingNumber: data.trackingNumber || trackingNumber,
      status: data.status || data.shipmentStatus || "Unknown",
      carrier: data.carrier || "",
      events: (data.events || data.checkpoints || []).map((e) => ({
        date: e.date || e.timestamp || "",
        status: e.status || e.description || "",
        location: e.location || e.city || "",
      })),
      estimatedDelivery: data.estimatedDelivery || "",
    };
  } catch (err) {
    console.error("Envia tracking failed:", err.response?.data || err.message);
    return {
      success: false,
      trackingNumber,
      status: "Unable to track",
      events: [],
    };
  }
}

module.exports = { trackShipment };