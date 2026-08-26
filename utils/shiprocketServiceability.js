const axios = require("axios");
const { getShiprocketToken, SHIPROCKET_BASE } = require("./shiprocketAuth");

/**
 * Pincode serviceability check — delivery available का ते Shiprocket API ने तपासतो.
 * @param {string} pickupPincode — तुमचा pickup pincode (.env)
 * @param {string} deliveryPincode — customer चा pincode
 * @returns {{ available, estimatedDays, courierCount }} किंवा { available: false }
 */
async function checkPincodeServiceability(pickupPincode, deliveryPincode) {
  const token = await getShiprocketToken();

  try {
    const res = await axios.get(
      `${SHIPROCKET_BASE}/courier/serviceability`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          pickup_postcode: pickupPincode,
          delivery_postcode: deliveryPincode,
          weight: 0.5,
          cod: 0,
        },
      },
    );

    const couriers = res.data?.data?.available_courier_companies || [];

    if (couriers.length > 0) {
      // सर्वात जलद courier शोधा
      const fastest = couriers.reduce((a, b) =>
        a.estimated_delivery_days < b.estimated_delivery_days ? a : b,
      );

      return {
        available: true,
        estimatedDays: fastest.estimated_delivery_days,
        courierCount: couriers.length,
      };
    }

    return { available: false };
  } catch (err) {
    console.error("Serviceability check failed:", err.response?.data || err.message);
    return { available: false };
  }
}

module.exports = { checkPincodeServiceability };