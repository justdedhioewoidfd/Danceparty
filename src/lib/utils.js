class Utils {
    constructor() {}

    random(arr = []) {
        return arr[Math.floor((Math.random() * arr.length))];
    }

    getConfig() {
        let config = {
            gsConf: global.gs,
            srvConf: global.config
        };

        config.gsConf.DATABASE = "PROTECTED";
        config.gsConf.SECRETS = "PROTECTED";

        return config;
    }

    /**
     * Health check middleware
     * @param {*} req 
     * @param {*} res 
     * @returns {any}
     */
    healthCheck(req, res) {
        return res.end(process.uptime().toString());
    }

    /**
     * Checks if server's enviroment is a dev enviroment
     * @returns {Boolean}
     */
    isDev() {
        let env = global.ENV || "local";
        return ["dev", "local", "uat", "docker", "test", "beta"].includes(env.toLowerCase());
    }

    /**
     * Current server time
     * @returns {Number}
     */
    serverTime() {
        return Date.now();
    }
}

module.exports = new Utils();