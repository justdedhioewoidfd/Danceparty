const cache = require("cache");
const utils = require("utils");
const games = require("games");
const songs = require("songs");
const time = require("time");
const scheduler = require("scheduler");

const redisHelper = require("wdf-playlist-redis");
const playlistUtils = require("wdf-playlist-utils");

const Vote = require("wdf-vote");

class Playlist {
    constructor(version) {
        this.version = version;
        if (!games.isGameAvailable(this.version))
            throw new Error(`${version} is not available for use!`);

        this.vote = new Vote(this.version);
        this.helper = new redisHelper(this.version);
        this.utils = new playlistUtils(this.version);
        this.game = games.getGameByVersion(this.version);
    }

    async populateQueue() {
        for (let count = await this.helper.getQueueSize(); count < 2; count++) {
            const screen = await this.createScreen(count);
            await this.helper.pushSong(await this.createScreen(count));
        }
    }

    async getScreens(updatePlaylist = true) {
        const now = time.milliseconds();

        if (updatePlaylist && current && current.timing && current.timing.request_playlist_time < now) {
            console.log("POPPED SONG!", current.timing.request_playlist_time, now)
            await this.helper.popSong();
        }

        await this.populateQueue();

        return {
            current: await this.helper.getCurrentSong(),
            next: await this.helper.getNextSong()
        }
    }

    async createScreen(count) {
        const now = time.milliseconds();
        const init = (count == 0);

        let baseTime = 0;
        let ignoredTheme = [];
        let ignoredSongs = [];

        let prevThemeId;

        if (init) {
            prevThemeId = -1;
            // First screen should not be voting
            ignoredTheme.push(2);
        }
        else {

            

            prevThemeId
        }

        let theme = this.randomTheme(ignoredTheme);
        if (this.isThemeCommunity(theme.id)) {
            let randomTheme = this.randomCommunity();
            theme.communities = [randomTheme[0], randomTheme[1]];
        }

        // To filter maps depending on theme type
        let mapFilter = {};

        // Theme 3 is coach pick and map filter should be non-solo maps
        if (this.isThemeCoach(theme.id)) {
            mapFilter = {
                numCoach: {
                    $gt: 1
                }
            }
        };

        // Get a random map
        let map = await this.randomMap(1, ignoredSongs, mapFilter);
        map = map[0];
        if (!map) 
            throw new Error(`Playlist couldn't find a map to create screen for, is the song database empty?`);
    
        // Set baseTime depending on theme type
        if (isNext && cur && cur.timing.request_playlist_time && this.isThemeVote(theme.id)) {
            baseTime = cur.timing.request_playlist_time
        }
        else if (isNext && cur && cur.timing.world_result_stop_time) {
            baseTime = cur.timing.world_result_stop_time
        }
        else baseTime = now;

        // Make sure that the baseTime is bigger than the current epoch 
        // (can happen if the server sleeps for a while)
        if (baseTime < now) baseTime = now;

        let screen = {
            theme,
            map
        };

        // If theme is voting, pick out random maps
        if (this.isThemeVote(theme.id)) {
            let choiceAmount = utils.randomNumber(2, 4);
            // Don't make any map from prev cur and next as vote option
            let choices = await this.randomMap(choiceAmount, [
                prev?.map.mapName, cur?.map.mapName, next?.map.mapName
            ]);
            screen.voteChoices = choices;
            global.logger.info(`Generated following maps for vote screen: ${choices.map(m => m.mapName)}`)
        };
        
        let times = this.calculateTime(baseTime, screen, isNext);
        screen.timing = times.timing;
        screen.timingProgramming = times.timingProgramming;
        
        // Schedule the next rotation
        let rotationTime = screen.timing.request_playlist_time - 5000;
        let resetScoreTime = screen.timing.request_playlist_time - 6000;
        
        return screen;
    }

    computePreSongDuration(themeType, durations = this.durations) {
        switch (themeType) {
            case this.isThemeVote(themeType):
                break;
        }
        if (this.isThemeVote(themeType))
            return durations["vote_result_duration"]
        else if (this.isThemeCommunity(themeType)) {
            return durations["community_choice_duration"]
        }
        else if (this.isThemeCoach(themeType)) {
            return durations["coach_choice_duration"]
        }
        else if (this.isThemeStarChallenge(themeType)) {
            return durations["star_challenge_intro_duration"]
        }
        else return 0
    }

    computeThemeResultDuration(themeType, durations = this.durations) {
        if (this.isThemeAutodance(themeType))
            return durations["autodance_result_duration"]
        else if (this.isThemeCommunity(themeType)) {
            return durations["community_result_duration"]
        }
        else if (this.isThemeCoach(themeType)) {
            return durations["coach_result_duration"]
        }
        else if (this.isThemeStarChallenge(themeType)) {
            return durations["star_challenge_outro_duration"]
        }
        else return 0
    }

    isThemeAutodance = (id) => id == 0;
    isThemeCommunity = (id) => id == 1;
    isThemeVote = (id) => id == 2;
    isThemeCoach = (id) => id == 3;
    isThemeStarChallenge = (id) => id == 4;
}

module.exports = Playlist;
