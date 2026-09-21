const axios = require("axios");
const { ENVIA_BASE, getEnviaHeaders } = require("./enviaAuth");

async function trackShipment(trackingNumber) {
  try {
    const res = await axios.post(
      `${ENVIA_BASE}/ship/generaltrack/`,
      { trackingNumbers: [trackingNumber] },
      { headers: getEnviaHeaders() },
    );

    const shipment = res.data?.data?.[0];

    if (!shipment) {
      return {
        success: false,
        trackingNumber,
        status: "No data found",
        events: [],
      };
    }

    return {
      success: true,
      trackingNumber: shipment.trackingNumber || trackingNumber,
      status: shipment.status || "Unknown",
      carrier: shipment.carrier?.name || "",
      signedBy: shipment.signedBy || "",
      estimatedDelivery: shipment.estimatedDelivery || "",
      trackUrl: shipment.trackUrl || "",
      events: (shipment.eventHistory || []).map((ev) => ({
        description: ev.description || "",
        location: (ev.location || "").trim(),
        date: ev.date || "",
      })),
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