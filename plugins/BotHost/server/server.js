import express from "express";
import {
    Client,
    GatewayIntentBits,
    ActivityType
} from "discord.js";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!API_KEY || !BOT_TOKEN) {
    throw new Error("BOT_TOKEN and API_KEY are required.");
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

let running = false;

client.once("ready", () => {
    running = true;
    console.log(`Bot connected as ${client.user.tag}`);
});

client.on("error", error => {
    console.error("Discord client error:", error);
    running = false;
});

function authorized(req, res, next) {
    if (req.headers.authorization !== `Bearer ${API_KEY}`) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }

    next();
}

app.get("/status", authorized, (req, res) => {
    res.json({
        running,
        user: client.user
            ? {
                id: client.user.id,
                username: client.user.username
            }
            : null
    });
});

app.post("/presence", authorized, async (req, res) => {
    if (!client.user) {
        return res.status(503).json({
            error: "Bot is not connected."
        });
    }

    const {
        status = "online",
        activityType = "Playing",
        activityText = ""
    } = req.body;

    const types = {
        Playing: ActivityType.Playing,
        Streaming: ActivityType.Streaming,
        Listening: ActivityType.Listening,
        Watching: ActivityType.Watching,
        Competing: ActivityType.Competing
    };

    client.user.setPresence({
        status,
        activities: activityText
            ? [{
                name: activityText,
                type: types[activityType] ?? ActivityType.Playing
            }]
            : []
    });

    res.json({
        ok: true
    });
});

app.listen(PORT, () => {
    console.log(`Bot Host API listening on ${PORT}`);
});

client.login(BOT_TOKEN);
