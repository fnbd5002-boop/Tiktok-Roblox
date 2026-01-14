import express from "express";
import { WebcastPushConnection } from "tiktok-live-connector";

const app = express();
app.use(express.json());

const API_KEY = process.env.API_KEY || "123456";

let tiktok = null;
let currentUser = null;
let gifts = [];

// 🔌 Conectar a un LIVE
async function connectToTikTok(username) {
    if (tiktok) {
        try { tiktok.disconnect(); } catch {}
    }

    gifts = [];
    currentUser = username;

    tiktok = new WebcastPushConnection(username);

    await tiktok.connect();

    tiktok.on("gift", (data) => {
        gifts.push({
            user: data.uniqueId,
            gift: data.giftName,
            count: data.repeatCount
        });

        console.log("🎁", data.uniqueId, data.giftName);
    });
}

// 🔐 Middleware simple
function auth(req, res, next) {
    if (req.headers["x-api-key"] !== API_KEY) {
        return res.status(403).json({ error: "No autorizado" });
    }
    next();
}

// 📌 Roblox manda el usuario TikTok
app.post("/set-user", auth, async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: "Falta username" });
    }

    try {
        await connectToTikTok(username);
        res.json({ success: true, live: true });
    } catch (e) {
        res.json({ success: false, live: false });
    }
});

// 📌 Roblox pide donaciones
app.get("/gifts", auth, (req, res) => {
    res.json({
        tiktokUser: currentUser,
        gifts
    });
});

// Health
app.get("/", (req, res) => {
    res.send("API TikTok ↔ Roblox OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 API lista"));
