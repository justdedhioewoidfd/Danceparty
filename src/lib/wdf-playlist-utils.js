class PlaylistUtils {
    constructor(version) {
        this.version = version;
        this.communities = global.config.COMMUNITIES;
        this.durations = global.config.DURATIONS;
        this.themes = global.config.THEMES;
    }

    /**
     * Returns a random theme, if exclude array has any theme ids
     * it will exclude those ids from showing up.
     * @param {Array} exclude 
     * @returns Theme object
     */
    randomTheme(exclude = []) {
        let themes = this.themes.filter(t => !exclude.includes(t.id) && t.isAvailable);
        return utils.random(themes);
    }

    /**
     * Returns a random community
     * @returns 
     */
    randomCommunity() {
        let list = this.communities.list;
        let locs = this.communities.locs;
        let defaultLang = "en";

        // Get a random theme from list
        let random = utils.random(list);
        if (!random) random = utils.random(list);

        const [ theme0, theme1 ] = random;
        return [theme0["en"], theme1["en"]];
    }

    /**
     * Returns a random available map
     * @param {*} amount 
     * @param {*} mapsToExclude 
     * @param {*} filter 
     * @returns 
     */
    async randomMap(amount = 1, mapsToExclude = [], filter = {}) {
        return await songs.random(this.version, amount, mapsToExclude, filter);
    }
}

module.exports = PlaylistUtils;