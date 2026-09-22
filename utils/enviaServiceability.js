const axios = require("axios");
const { ENVIA_BASE, getEnviaHeaders, getOriginAddress } = require("./enviaAuth");

const CARRIERS = ["bluedart", "delhivery", "dtdc", "ecom-express"];

async function checkPincodeServiceability(deliveryPincode) {
  const origin = getOriginAddress();

  const baseBody = {
    origin,
    destination: {
      name: "Customer",
      phone: "+919999999999",
      street: "NA",
      city: "NA",
      state: "NA",
      country: "IN",
      postalCode: deliveryPincode,
    },
    packages: [{
      type: "box",
      content: "Name Plate",
      amount: 1,
      declaredValue: 500,
      lengthUnit: "CM",
      weightUnit: "KG",
      weight: 0.5,
      dimensions: { length: 30, width: 20, height: 5 },
    }],
  };

  try {
    const results = await Promise.allSettled(
      CARRIERS.map((carrier) =>
        axios.post(`${ENVIA_BASE}/ship/rate/`, {
          ...baseBody,
          shipment: { type: 1, carrier },
        }, {
          headers: getEnviaHeaders(),
        }),
      ),
    );

    // सगळ्या successful responses मधून rates collect
    const allRates = [];
    results.forEach((result) => {
      if (
        result.status === "fulfilled" &&
        result.value?.data?.meta === "rate" &&
        Array.isArray(result.value.data.data)
      ) {
        result.value.data.data.forEach((rate) => {
      const service = (rate.service || rate.serviceDescription || "").toLowerCase();
      // Air skip, surface/ground keep
      if (!service.includes("air")) {
        allRates.push(rate);
      }
    });
      }
    });

    if (allRates.length > 0) {
      return {
        available: true,
        estimatedDays: allRates[0].deliveryEstimate || allRates[0].deliveryDate?.dateDifference || "3-7",
        carrierCount: allRates.length,
      };
    }

    return { available: false };
  } catch (err) {
    console.error("Envia serviceability failed:", err.message);
    return { available: false };
  }
}

module.exports = { checkPincodeServiceability };