import express from "express";
import { WebcastPushConnection } from "tiktok-live-connector";

const app = express();
app.use(express.json());

let tiktok = null;
let currentUser = null;
let gifts = [];

// ------------------------------
// CONECTAR A TIKTOK LIVE
// ------------------------------
async function connectToTikTok(username) {
    try {
        if (tiktok) {
            try {
                tiktok.disconnect();
            } catch {}
        }

        gifts = [];
        currentUser = username;

        tiktok = new WebcastPushConnection(username);

        // conectar SIN bloquear
        tiktok.connect().then(() => {
            console.log("✅ Conectado al LIVE de", username);
        }).catch(err => {
            console.error("❌ Error TikTok:", err.message);
        });

        tiktok.on("gift", (data) => {
            gifts.push({
                user: data.uniqueId,
                gift: data.giftName,
                count: data.repeatCount
            });

            console.log("🎁", data.uniqueId, data.giftName);
        });

    } catch (err) {
        console.error("❌ Error general:", err.message);
    }
}

// ------------------------------
// ENDPOINTS
// ------------------------------

// Salud
app.get("/", (req, res) => {
    res.send("API TikTok ↔ Roblox OK");
});

// Roblox manda usuario TikTok
app.post("/set-user", (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: "Falta username" });
    }

    // responder INMEDIATO
    res.json({
        success: true,
        user: username
    });

    // conectar en segundo plano
    connectToTikTok(username);
});

// Roblox pide donaciones
app.get("/gifts", (req, res) => {
    res.json({
        tiktokUser: currentUser,
        gifts: gifts
    });
});

// ------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("🚀 API lista en puerto", PORT);
});
