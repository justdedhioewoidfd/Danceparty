
// Database configuration per service and per enviroment.
module.exports = {
    jmcs: {
        local: "redis://127.0.0.1:6379"
    },
    wdf: {
        local: "mongodb://127.0.0.1:27017/dp-legacy-local"
    }
}