import express from "express";
import { WebcastPushConnection } from "tiktok-live-connector";

const app = express();
app.use(express.json());

let tiktok = null;
let currentUser = null;

let gifts = [];
let followers = [];

// ------------------------------
// CONECTAR A TIKTOK LIVE
// ------------------------------
function connectToTikTok(username) {
    try {
        if (tiktok) {
            try { tiktok.disconnect(); } catch {}
        }

        currentUser = username;
        gifts = [];
        followers = [];

        tiktok = new WebcastPushConnection(username);

        // conectar en segundo plano
        tiktok.connect()
            .then(() => {
                console.log("✅ Conectado al LIVE de", username);
            })
            .catch(err => {
                console.error("❌ Error TikTok:", err.message);
            });

        // 🎁 DONACIONES
        tiktok.on("gift", (data) => {
            const gift = {
                user: data.uniqueId,
                gift: data.giftName,
                count: data.repeatCount
            };

            gifts.push(gift);
            console.log("🎁 DONACIÓN:", gift);
        });

        // ➕ NUEVOS SEGUIDORES
        tiktok.on("follow", (data) => {
            const follower = {
                user: data.uniqueId
            };

            followers.push(follower);
            console.log("➕ NUEVO SEGUIDOR:", data.uniqueId);
        });

    } catch (err) {
        console.error("❌ Error general:", err.message);
    }
}

// ------------------------------
// ENDPOINTS
// ------------------------------

// Health
app.get("/", (req, res) => {
    res.send("API TikTok ↔ Roblox OK");
});

// Roblox manda usuario TikTok
app.post("/set-user", (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: "Falta username" });
    }

    // responder rápido
    res.json({
        success: true,
        user: username
    });

    // conectar en segundo plano
    connectToTikTok(username);
});

// Roblox pide eventos
app.get("/events", (req, res) => {
    res.json({
        tiktokUser: currentUser,
        gifts,
        followers
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("🚀 API lista en puerto", PORT);
});
