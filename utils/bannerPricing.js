const Pricing = require("../models/Pricing");

/**
 * Banner ची किंमत मोजतो — spec चं logic, पण दर/rolls/min database मधून.
 *
 * नियम:
 *  - roll rounding: user width जवळच्या मोठ्या roll ला (pana waste)
 *  - rotation: लहान बाजू roll ला लावतो (कमी waste, स्वस्त)
 *  - billable = selectedRoll × longSide (actual नाही)
 *  - price = billable × rate × quantity
 *  - min order लागू (कमी आलं तर minOrderValue)
 *
 * सुरक्षा: दर/rolls/min frontend कडून नाही, Banner च्या Pricing entry मधून.
 * frontend ने पाठवलेली किंमत कधीच वापरायची नाही — फक्त width/length/quantity.
 */
async function calculateBannerPrice(material, width, length, quantity = 1) {
  // --- inputs तपासा ---
  const w = Number(width);
  const l = Number(length);
  const qty = Number(quantity) || 1;

  if (!w || !l || w <= 0 || l <= 0) {
    throw new Error("Please provide valid banner width and length.");
  }

  if (qty < 1) {
    throw new Error("Quantity must be at least 1.");
  }

  // --- Banner ची pricing entry (दर database मधून) ---
  const pricing = await Pricing.findOne({ material });

  if (!pricing) {
    throw new Error("Invalid material or pricing not configured.");
  }

  if (pricing.pricingType !== "banner") {
    throw new Error("This material does not use banner pricing.");
  }

  const rate = pricing.ratePerSqFt;
  const rolls = Array.isArray(pricing.availableRolls)
    ? [...pricing.availableRolls].sort((a, b) => a - b)
    : [];
  const minOrder = pricing.minOrderValue || 0;
  const maxLen = pricing.maxLength || Infinity;

  if (!rate || rolls.length === 0) {
    throw new Error("Banner pricing is not fully configured.");
  }

  // --- rotation: लहान बाजू roll ला, मोठी बाजू लांबी ---
  const shortSide = Math.min(w, l);
  const longSide = Math.max(w, l);

  // --- लांबी मर्यादा ---
  if (longSide > maxLen) {
    throw new Error(`Maximum allowable length is ${maxLen} feet.`);
  }

  // --- सर्वात लहान roll जो shortSide बसवतो ---
  const selectedRoll = rolls.find((roll) => roll >= shortSide);

  if (!selectedRoll) {
    const maxRoll = rolls[rolls.length - 1];
    throw new Error(`Dimensions exceed maximum roll width of ${maxRoll} feet.`);
  }

  // --- billable area (actual नाही, roll × longSide) ---
  const billableSqFt = selectedRoll * longSide;

  // --- किंमत ---
  const rawPrice = billableSqFt * rate * qty;
  const finalPrice = Math.max(rawPrice, minOrder);

  return {
    finalPrice, // हीच खरी किंमत (रुपयांत)
    billableSqFt: billableSqFt * qty,
    billableSize: `${selectedRoll} ft x ${longSide} ft`,
    selectedRoll,
    rate,
    minOrderApplied: rawPrice < minOrder,
  };
}

module.exports = { calculateBannerPrice };