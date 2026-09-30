import express from "express";
import { Client, GatewayIntentBits, ActivityType } from "discord.js";

const app = express();

app.use(express.json());

const PORT = Number(process.env.PORT || 3000);
const API_KEY = process.env.API_KEY;

let client = null;
let running = false;

function auth(req, res, next) {
    if (!API_KEY || req.headers.authorization !== `Bearer ${API_KEY}`) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    next();
}

app.get("/", (req, res) => {
    res.json({
        online: true,
        service: "Bot Host"
    });
});

app.get("/status", auth, (req, res) => {
    res.json({
        running,
        username: client?.user?.tag ?? null
    });
});

app.post("/start", auth, async (req, res) => {
    const token = String(req.body?.token || "").trim();

    if (!token) {
        return res.status(400).json({
            error: "Bot token is required."
        });
    }

    if (client) {
        try {
            client.destroy();
        } catch {}
    }

    client = new Client({
        intents: [GatewayIntentBits.Guilds]
    });

    client.once("ready", () => {
        running = true;
        console.log(`Connected as ${client.user?.tag}`);
    });

    client.on("shardDisconnect", () => {
        running = false;
    });

    try {
        await client.login(token);

        res.json({
            ok: true,
            running: true
        });
    } catch {
        running = false;

        try {
            client.destroy();
        } catch {}

        client = null;

        res.status(401).json({
            error: "Discord rejected the bot token."
        });
    }
});

app.post("/stop", auth, (req, res) => {
    if (client) {
        try {
            client.destroy();
        } catch {}
    }

    client = null;
    running = false;

    res.json({
        ok: true,
        running: false
    });
});

app.post("/presence", auth, (req, res) => {
    if (!client?.user) {
        return res.status(409).json({
            error: "Bot is not running."
        });
    }

    const types = {
        Playing: ActivityType.Playing,
        Streaming: ActivityType.Streaming,
        Listening: ActivityType.Listening,
        Watching: ActivityType.Watching,
        Competing: ActivityType.Competing
    };

    const status = String(req.body?.status || "online");
    const type = String(req.body?.activityType || "Playing");
    const text = String(req.body?.activityText || "").trim();

    client.user.setPresence({
        status,
        activities: text
            ? [{
                name: text,
                type: types[type] ?? ActivityType.Playing
            }]
            : []
    });

    res.json({ ok: true });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Bot Host listening on ${PORT}`);
});
