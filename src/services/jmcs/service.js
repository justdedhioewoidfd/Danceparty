/**
 * JMCS service
 */

const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

const morganMiddleware = require("morgan-middleware");
const mids = require("http-middleware");
const logger = require("logger");
const uenc = require("uenc");

// Middlewares
app.use(express.static(__dirname + "/static"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morganMiddleware);
app.use(uenc.client);
app.disable("x-powered-by");
app.disable("etag");
app.use((req, res, next) => {
    res.set("Connection", "close");
    return next();
});

global.logger = logger;

// All sub-services that are used by JMCS
const services = fs.readdirSync(path.resolve(__dirname, "services")).filter(f => !f.startsWith("_"));

// Loop through services and load them
for (let i = 0; i < services.length; i++) {
    const file = services[i];
    
    let scriptPath = path.resolve(__dirname, "services", file);
    let serviceName = file.split(".")[0];

    if (!fs.statSync(scriptPath).isFile()) continue;

    let route = `/${serviceName}`;
    let router = express.Router({ 
        caseSensitive: true, 
        strict: true 
    });

    require(scriptPath).init(app, router, route);
    app.use(route, router);
}

app.use(mids.errorHandler);
app.use(mids.notFound);

module.exports = app;