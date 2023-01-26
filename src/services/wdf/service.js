/**
 * JMCS service
 */

const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

const morganMiddleware = require("morgan-middleware");
const validate = require("http-validate");
const mids = require("http-middleware");
const logger = require("logger")("wdf");
const uenc = require("uenc");
const scheduler = require("scheduler");
const securityWall = require("security-wall");
const utils = require("utils");
const Playlist = require("../../lib/wdf-playlist");

global.logger = logger;
global.httpSchema = require("./http-schema");

// Middlewares
app.use(express.static(__dirname + "/static"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(securityWall);
app.use(morganMiddleware());
app.use(uenc.client);
app.use(validate);

app.set("trust proxy", "loopback");
app.disable("x-powered-by");
app.disable("etag");

app.use((req, res, next) => {
    res.set("Connection", "close");
    return next();
});

const rooms = {
    "wdf-jd5": "wdf",
    "wdf-jd15": "wdf15",
    "wdf-legacy": "wdfjd6"
};

app.use("/api", require("./api/service"));
app.post("/wdf", require("./load-funcs")("wdf-jd5"));
app.post("/wdf15", mids.agentCheck, require("./load-funcs")("wdf-jd15"));
app.post("/wdfjd6", mids.agentCheck, require("./load-funcs")("wdf-legacy"));

app.use(mids.errorHandler);
app.use(mids.notFound);

(async() => {

    if (!global.args.ns) {
        global.logger.info(`Starting schedule deletion job...`);
        await scheduler.sessionJob();
    }

    const Bots = require("wdf-bots");
    const Playlist = require("wdf-playlist");

    const games = require("games");
    const gamesList = games.getGames();

    // Reset playlist of all games
    for (let i = 0; i < gamesList.length; i++) {
        const { name, version } = gamesList[i];

        const playlist = new Playlist(version);
        const wdfBots = new Bots(version);

        return;

        // Reset playlist and set a new one
        await playlist.resetScreens();
        await playlist.getStatus();

        // Remove previous bots and create new ones
        const { scoreCount, sessionCount } = await wdfBots.clearBots();
        if (sessionCount > 0)
            global.logger.info(`Cleared ${sessionCount} bots from ${name} after server restart.`);
        if (scoreCount > 0)
            global.logger.info(`Cleared ${scoreCount} bot scores from ${name} after server restart.`);

        const randomAmount = utils.randomNumber(20, 50);
        const bots = await wdfBots.createBots(randomAmount);
        global.logger.info(`Created ${bots.length} bots for ${name}`);
    }
})();

module.exports = app;