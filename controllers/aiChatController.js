const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are BoardVala's AI Assistant — a friendly, helpful expert for BoardVala.com, a premium UV printing and signage company based in Amravati, Maharashtra, India.

ABOUT BOARDVALA:
- We specialize in UV printing on MDF, Acrylic, PVC Sunboard, and Vinyl Stickers
- Products: Name plates, photo frames, wall art, shop signage, hospital signage, mall branding, banners, acrylic letters, channel letters, LED boards
- We deliver across India
- Contact: +91 8788736288 (WhatsApp available)
- Email: support@boardvala.com
- Website: www.boardvala.com

YOUR RESPONSIBILITIES:
1. Answer all questions about BoardVala's products and services
2. Help customers choose the right product, material, and size
3. If a customer is confused about design, ask what they need and suggest options
4. For name plates: ask about type (home/office/shop), preferred material, size, and design style
5. For signage: ask about location (indoor/outdoor), size requirements, and material preference
6. Provide approximate pricing when pricing data is available
7. If you don't know exact pricing, say "Let me connect you with our team for exact pricing" and suggest WhatsApp contact
8. Be conversational, warm, and helpful
9. Reply in the same language the customer uses (Hindi, Marathi, or English)
10. Keep responses concise — max 3-4 sentences unless detailed explanation needed
11. Always try to understand what the customer actually needs before suggesting

MATERIAL GUIDE:
- MDF: Budget-friendly, great for indoor name plates and wall art. Starting ₹299
- Acrylic: Premium look, transparent/colored options, perfect for modern homes and offices. Starting ₹499
- PVC Sunboard: Lightweight, affordable, good for temporary signage and displays. Starting ₹249
- Vinyl Stickers: Flexible, waterproof, great for vehicle wraps, shop branding, wall graphics. Starting ₹149

PRICING NOTE: Exact pricing depends on size, material, design complexity, and quantity. For exact quotes, guide customers to WhatsApp: +91 8788736288

DO NOT:
- Share competitor information
- Make promises about delivery dates without confirming
- Provide incorrect pricing — if unsure, redirect to WhatsApp
- Discuss topics unrelated to BoardVala's business`;

// Store chat history per session (in-memory for now)
const chatSessions = new Map();

// Clean old sessions every 30 minutes
setInterval(() => {
    const now = Date.now();
    for (const [id, session] of chatSessions) {
        if (now - session.lastActive > 30 * 60 * 1000) {
            chatSessions.delete(id);
        }
    }
}, 30 * 60 * 1000);

exports.chatWithAI = async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, error: "Message is required" });
        }

        // Get or create session
        let session = chatSessions.get(sessionId);
        if (!session) {
            session = {
                history: [],
                lastActive: Date.now(),
            };
            chatSessions.set(sessionId, session);
        }
        session.lastActive = Date.now();

        // Build conversation history for Gemini
        const model = genAI.getGenerativeModel({
            model: "gemini-3.5-flash-lite",
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        });

        const chat = model.startChat({
            history: session.history.map((msg) => ({
                role: msg.role,
                parts: [{ text: msg.text }],
            })),
        });

        const result = await chat.sendMessage(message);
        const reply = result.response.text();

        // Save to session history
        session.history.push({ role: "user", text: message });
        session.history.push({ role: "model", text: reply });

        // Keep only last 20 messages
        if (session.history.length > 20) {
            session.history = session.history.slice(-20);
        }

        res.json({ success: true, reply });
    } catch (error) {
        console.error("AI Chat Error:", error);
        res.json({
            success: true,
            reply: "Sorry, I'm having trouble right now. Please contact us on WhatsApp: +91 8788736288",
        });
    }
};