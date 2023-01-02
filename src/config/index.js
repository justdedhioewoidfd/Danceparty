/**
 * Base configuration for Gameserver.
 * These configs are used by all services.
 */

module.exports.BASE_URL = process.env.BASE_URL || "http://localhost:" + global.PORT;
module.exports.ENVS = ["local", "test", "docker", "prod", "dev", "uat", "qc"];
module.exports.DEFAULT_PORT = 5000;
module.exports.DEFAULT_ENV = "local";

module.exports.GAMES = require("./games");
module.exports.SECRETS = require("./secrets");
module.exports.DATABASE = require("./database"); // Database loaded here but service and env are configured in service config
module.exports.SERVICES = {

    // --- Internal services
    galaxy: {
        id: "galaxy",
        name: "Galaxy",
        path: "services/galaxy/service.js",
        clients: ["db"]
    },
    // ---

    // --- Legacy services
    jmcs: {
        id: "jmcs",
        name: "JMCS",
        path: "services/jmcs/service.js",
        clients: ["db"]
    },
    wdf: {
        id: "wdf",
        name: "WDF",
        path: "services/wdf/service.js",
        clients: ["db"]
    }
    // ---

};

// --------------------
// Server configuration
// --------------------

module.exports.BYPASS_AUTH = false; // Bypasses authorization on API
module.exports.SHOW_RESPONSE_MESSAGES = true; // Shows direct server responds
module.exports.LOG_SERVER_ERRORS = true; // Logs server errors

module.exports.TOKEN_EXPIRATION = 3 * 3600; // Tokens aren't valid 3 hours after creation

// Headers
module.exports.HEADER_FORCE_JSON = "X-Force-Json";
module.exports.TOKEN_KEY = "token";

// --------------------



// --------------------
// Game configuration
// --------------------

module.exports.MAX_SCORE = 13333;
// 1-1000 for 2014
// 1-5000 for 2015 >>
module.exports.MIN_WDF_LEVEL = 1;
module.exports.MAX_WDF_LEVEL = 5000;
// TODO: JD17 has 6 (superstar), JD18 has 7 stars (superstar & megastar)
// so we need to add a way to change max stars depending on game
// (probably make a function in utils with game as param?)
module.exports.MAX_STARS = 5;
module.exports.MAX_LOBBY_PLAYERS = 8;
module.exports.MAX_LEADERBOARD_SIZE = 3;

// --------------------


// Languages and regions from Wii
// It"s used by JMCS, WDF and DLC Store for localization
module.exports.LANGS = [
    { id: "00", lang: "JA" },
    { id: "01", lang: "EN" },
    { id: "02", lang: "DE" },
    { id: "03", lang: "FR" },
    { id: "04", lang: "ES" },
    { id: "05", lang: "IT" },
    { id: "06", lang: "NL" },
    { id: "07", lang: "ZH" },
    { id: "08", lang: "ZH" },
    { id: "09", lang: "KO" }
];
module.exports.REGIONS = [
    { id: "00", region: "NTSC_J" },
    { id: "01", region: "NTSC" },
    { id: "02", region: "PAL" },
    { id: "03", region: "NTSC_K" }
];