import express from "express";
import { WebcastPushConnection } from "tiktok-live-connector";

const app = express();
app.use(express.json());

// 🔒 Token simple (seguridad básica)
const API_KEY = process.env.API_KEY || "123456";

// Usuario que está en LIVE
const TIKTOK_USER = process.env.TIKTOK_USER || "TU_USUARIO_TIKTOK";

let lastGift = null;

// TikTok LIVE
const tiktok = new WebcastPushConnection(TIKTOK_USER);

tiktok.connect()
    .then(() => console.log("✅ Conectado a TikTok LIVE"))
    .catch(err => console.error("❌ Error TikTok:", err));

// Escuchar donaciones
tiktok.on("gift", (data) => {
    lastGift = {
        user: data.uniqueId,
        gift: data.giftName,
        count: data.repeatCount
    };

    console.log("🎁 Donación:", lastGift);
});

// Endpoint para Roblox
app.get("/gift", (req, res) => {
    if (req.headers["x-api-key"] !== API_KEY) {
        return res.status(403).json({ error: "No autorizado" });
    }

    res.json(lastGift || {});
});

// Health check (Railway)
app.get("/", (req, res) => {
    res.send("API TikTok → Roblox funcionando");
});

// Railway usa PORT automático
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("🚀 Servidor en puerto", PORT);
});
