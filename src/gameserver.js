/**
 * GAMESERVER
 */

require("dotenv").config();
require("./aliases")();

// see TODO #1
global.ENV = "local";

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const async = require("async");
const dotenv = require("dotenv");
const logger = require("./lib/logger")("gameserver");
const migrateDb = require("./migrate-db");

const dbClient = require("./lib/clients/db-client");
const redisClient = require("./lib/clients/redis-client");
const memcachedClient = require("./lib/clients/memcached-client");

const utils = require("./lib/utils");
const nginx = require("./lib/nginx");

global.logger = logger;

let config;
let service;
let serviceConfig;

// We use waterfall to run functions in order, here's an explanation (will be better in time)
// 1. Start the CLI and wait for client's arguments, get the selected service
// 2. Load .env and gameserver's configuration
// 3. Set service's information
// 4. Load service's configuration 
// and set ENV either from arguments, .env file or set default value
// do the same for PORT, from args, service's config or default value
// 5. Initalize any client the service requires
// 6. Start the service and define configs under global for easy access
// It's all confusing at the moment, which will be improved in future
(async() => {
    // Start CLI progress
    const args = require("./cli")();
    global.args = args;

    // Load gameserver configuration
    config = require("./lib/load-config").gs();

    // Set service information
    service = config.SERVICES[args.service];
    service.path = path.resolve(__dirname, service.path);
    service.base = path.resolve(__dirname, path.dirname(service.path));

    // Load service configuration
    serviceConfig = require("./lib/load-config").service(service);

    // Set ENV and PORT
    global.ENV = args.env || process.env.NODE_ENV || serviceConfig.NODE_ENV || "local";
    global.HTTP_PORT = args.httpPort || process.env.HTTP_PORT || serviceConfig.HTTP_PORT || 5000;
    global.HTTPS_PORT = args.httpsPort || process.env.HTTPS_PORT || serviceConfig.HTTPS_PORT || global.HTTPS_PORT + 443 || 5443;
    
    global.FQDN = process.env.FQDN || serviceConfig.FQDN; // Environmental OR service config wise
    global.SERVER_IP = process.env.SERVER_IP || ""; // Enviromental wise

     // Argumental OR enviromental OR service config wise
    global.IS_TEST_MODE = args.testMode || (process.env.IS_TEST_MODE == "true" ? true : false) || serviceConfig.IS_TEST_MODE || false;
    
    global.IS_PUBLIC_SERVER = process.env.IS_SERVER_PUBLIC == "true" ? true : false; // Enviromental wise
    // Service OR enviromental wise (Some services might not need cloudflare)
    global.IS_ON_CLOUDFLARE = serviceConfig.IS_ON_CLOUDFLARE || (process.env.IS_ON_CLOUDFLARE == "true" ? true : false);

    // Set globals for service and gs
    /**
     * Config of the service
     */
    global.config = serviceConfig;
    global.config.service = global.service;
    global.service = service;
    global.gs = config;
    global.secrets = config.SECRETS;
    global.project = require("../package.json");
    global.jobs = [];
    global.isDev = utils.isDev();

    // If service has any clients, initalize them
    const clients = service.clients || [];
    if (clients.length > 0) {
        logger.info("Initalizing clients...");

        if (clients.includes("db")) {
            const dbURI = process.env.DB_URI || config.DATABASE[service.id][global.ENV];
            await dbClient(dbURI);
            global.logger.info("Initalized Database client!");
        };
        if (clients.includes("redis")) {
            const redisURI = process.env.REDIS_URI || config.REDIS[service.id][global.ENV];
            await redisClient(redisURI);
            global.logger.info("Initalized Redis client!");
        };
        if (clients.includes("memcached")) {
            const memURI = process.env.MEMCACHED_URI || config.MEMCACHED[service.id][global.ENV];
            memcachedClient(memURI);
            global.logger.info("Initalized Memcached client!");
        };

        logger.success("Initalized all clients!");
    };

    
    await migrateDb(); // DB Migration
    nginx(); // Write NGINX conf

    // Initate provided service
    logger.info(`Starting service ${service.name}...`);
    
    const { app } = require(service.path);

    // Start HTTP server first
    const httpServer = http.createServer(app);
    httpServer.listen(global.HTTP_PORT, () => {
        logger.success(`Service ${service.name} is listening on port HTTP ${global.HTTP_PORT} in '${global.ENV}' enviroment successfully.`);
    });

})();