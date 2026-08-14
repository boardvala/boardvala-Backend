const axios = require("axios");

// Shiprocket API चा base — docs शी पडताळा (बदलू शकतो)
const SHIPROCKET_BASE = "https://apiv2.shiprocket.in/v1/external";

// token cache — प्रत्येक वेळी login नको (token ~10 दिवस वैध)
let cachedToken = null;
let tokenExpiry = null; // timestamp (ms)

/**
 * Shiprocket token मिळवतो (cache असेल तर तोच, नाहीतर नवीन login).
 * सुरक्षा: credentials .env मधून, कधीच hardcode नको.
 */
async function getShiprocketToken() {
  // cache वैध असेल तर तोच परत
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error("Shiprocket credentials are not configured.");
  }

  try {
    const response = await axios.post(`${SHIPROCKET_BASE}/auth/login`, {
      email,
      password,
    });

    // token response मध्ये कुठे येतो — docs शी पडताळा (साधारण data.token)
    const token = response.data.token;

    if (!token) {
      throw new Error("No token received from Shiprocket.");
    }

    cachedToken = token;
    // 9 दिवस cache (10 दिवस वैधतेच्या आत, सुरक्षित)
    tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;

    return token;
  } catch (err) {
    // login fail — cache clear
    cachedToken = null;
    tokenExpiry = null;
    console.error(
      "Shiprocket auth failed:",
      err.response?.data || err.message,
    );
    throw new Error("Could not authenticate with Shiprocket.");
  }
}

// इतर services साठी base पण export (एकाच ठिकाणी)
module.exports = { getShiprocketToken, SHIPROCKET_BASE };