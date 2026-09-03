const ENVIA_BASE = process.env.ENVIA_BASE_URL || "https://api-test.envia.com";

function getEnviaHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.ENVIA_API_KEY}`,
  };
}

function getOriginAddress() {
  return {
    name: "BoardVala.Com",
    phone: "+919172914161",
    street: "C9, Beside Ajmera Tyres, Oppsite To Royal Enfield Showroom, Saturna Midc Amravati, Maharashtra.",
    city: "Amravati",
    state: "MH",
    country: "IN",
    postalCode: "444607",
  };
}

module.exports = { ENVIA_BASE, getEnviaHeaders, getOriginAddress };
