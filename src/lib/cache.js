class Cache {
    constructor() {
        this.m = global.memcached;
    }

    async set(key, value, expires) {
        this.m = global.memcached;
        try {
            let data = value;
            if (Array.isArray(data) || typeof data == "object")
                data = JSON.stringify(data);
            await this.m.set(key, data, { expires });
            return value;
        }
        catch(err) {
            throw new Error(`Can't save ${key} to cache: ${err}`);
        }
    }

    async get(key) {
        this.m = global.memcached;
        const { value } = await this.m.get(key);
        if (value == null) return value;
        try {
            return JSON.parse(value);
        }
        catch(err) {
            if (!err) return null;
            throw new Error(err);
        }
    }

    async getStr(key) {
        this.m = global.memcached;
        const { value } = await this.m.get(key);
        if (value == null) return value;
        try {
            return Buffer.from(value).toString();
        }
        catch(err) {
            if (!err) return null;
            throw new Error(err);
        }
    };

    async getRaw(key) {
        this.m = global.memcached;
        const { value } = await this.m.get(key);
        if (value == null) return value;
        try {
            return value;
        }
        catch(err) {
            if (!err) return null;
            throw new Error(err);
        }
    };
}

module.exports = new Cache();