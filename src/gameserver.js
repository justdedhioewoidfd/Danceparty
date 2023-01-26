/**
 * GAMESERVER
 */

// Register aliases
require("dotenv").config();
require("./aliases")();

// see TODO #1
global.ENV = "local";

const fs = require("fs");
const path = require("path");
const http = require("http");
const async = require("async");
const logger = require("logger")("gameserver");
const migrateDb = require("./migrate-db");
        
const dbClient = require("./lib/clients/db-client");
const redisClient = require("./lib/clients/redis-client");

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
    global.ENV = args.env || process.env.ENV || serviceConfig.ENV || "local";
    global.PORT = args.port || process.env.PORT || serviceConfig.PORT || 5000;

    const clients = service.clients || [];

    // If service has any clients, initalize them
    if (clients.length > 0) {
        logger.info("Initalizing clients...");

        const dbURI = process.env.DB_URI || config.DATABASE[service.id][global.ENV];
        const redisURI = process.env.REDIS_URI || config.REDIS[service.id][global.ENV];

        if (clients.includes("db"))
            await dbClient(dbURI);
            global.logger.info("Initalized Database client!");
        
        if (clients.includes("redis"))
            await redisClient(redisURI);
            global.logger.info("Initalized Redis client!");

        logger.success("Initalized all clients!");
    }

    // DB migration here TODO

    // Initate provided service
    logger.info(`Starting service ${service.name}...`);

    // Set globals for service and gs
    global.config = serviceConfig;
    global.config.service = global.service;
    global.service = service;
    global.gs = config;
    global.secrets = config.SECRETS;
    global.project = require("../package.json");
    
    // Call service and bind to the port
    if (args.testService) {
        require(args.testService)();
        logger.success("Started test service!");
        return;
    }
    
    const app = require(service.path);
    app.listen(global.PORT, "127.0.0.1");
    logger.success(`Service ${service.name} is listening on port ${global.PORT} in '${global.ENV}' enviroment successfully!`);
})();