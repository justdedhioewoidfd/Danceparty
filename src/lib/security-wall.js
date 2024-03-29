const async = require("async");
const ipRangeCheck = require("ip-range-check");

/**
 * Security Wall is a middleware that protects Gameserver from any hijacking etc.
 * - Ubisoft IPs
 * - VPN & Proxy IPs (TODO)
 */

module.exports = (req, res, next) => {

    const blockedIps = global.gs.BLOCKLIST;
    
    const ip = req.ip;
    const blocklist = blockedIps.map(a => a.ips).flat(2);
    const blockedCountries = global.gs.BLOCKED_COUNTRIES;

    const localIps = ["127.0.0.1", "::ffff:127.0.0.1", "0.0.0.0"]
    if (localIps.includes(ip)) return next();

    async.waterfall([

        // Block any IP on our blocklist, mainly for Ubisoft & hijacker IPs.
        (cb) => {
            const isBlocked = ipRangeCheck(ip, blocklist);

            if (isBlocked) {
                global.logger.warn({
                    msg: `Blocked IP ${ip} tried to access ${req.originalUrl}!`,
                    headers: req.headers,
                    body: req.body
                });
                return res.status(403).send();
            };

            return cb();
        },

        // Block any forbidden country from access.
        (cb) => {
            if (!global.IS_ON_CLOUDFLARE) return cb();
            const country = req.headers["cf-ipcountry"]
            if (!country) {
                return next({
                    status: 403,
                    message: "Country header is missing from Cloudflare!"
                });
            };

            if (blockedCountries.includes(country)) {
                global.logger.warn({
                    msg: `Blocked country ${country} from ${ip} tried to access ${req.originalUrl}!`,
                    headers: req.headers,
                    body: req.body
                });
                return next({
                    status: 403,
                    message: `Country "${country}" cannot access this server.`
                });
            }
            else return cb();

        },
        () => {
            return next();
        }
    ]);
};