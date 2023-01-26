const Joi = require("joi")

const uenc = require("uenc")
const utils = require("wdf-utils");

const Session = require("wdf-session");
const Scores = require("wdf-score");

const cache = require("cache");

/**
 * getMyRank is for listing the top 10 users who scored the best in a WDF session
 */
module.exports = {

    name: `getMyRank`,
    description: `Serves rank status for top 10 players & client's score`,
    version: `1.0.0`,

    async init(req, res, next) {

        try {
            const { onlinescore, sid, song_id } = req.body;

            const userCache = await cache.get(`wdf-player-cache:${sid}`);

            if (!userCache)
                return next({
                    status: 401,
                    message: "User does not have a session!"
                });

            const session = new Session(userCache.game.version);
            const scores = new Scores(userCache.game.version);

            // User's leveled up their WDF level, update it
            // TODO: maybe have 1 function to updateRank OR
            // remove profile from score and make session have it only
            await session.updateRank(sid, onlinescore);
            await scores.updateRank(sid, onlinescore);

            const count = await session.sessionCount();
            const total = await scores.scoreCount();

            const userRank = await scores.getRank(sid);
            const userScore = await scores.getScore(sid);

            // Get theme results (coach/theme) and amount of winning side's player count
            const { themeResults } = await scores.getThemeAndCoachResult();
            const winners = await scores.getNumberOfWinners(themeResults);

            // Get top 30 scores
            const topTen = await scores.getRanks(30);
            const mappedScores = topTen.map(s => {
                return {
                    avatar: s.profile.avatar,
                    name: s.profile.name,
                    pays: s.profile.country,
                    score: s.totalScore,
                    rank: s.rank,
                    onlinescore: s.profile.rank,
                    sid: s.sessionId
                };
            });

            return res.uenc({
                onlinescore,
                onlinescore_updated: onlinescore,

                ...uenc.setIndex(mappedScores),
                
                numscores: mappedScores.length,

                count,
                total,

                myrank: userRank || count,
                myscore: userScore?.totalScore || 0,
                star_score: userScore?.stars || 0,

                ...themeResults,
                song_id: song_id,

                // Locked songs
                last_song_unlocked: global.config.LOCKED.lastSong,
                next_unlocked_song_id: global.config.LOCKED.nextSong,

                current_star_count: await scores.getStarCount(),
                star_count_for_unlock: global.config.LOCKED.starCountToUnlock,

                happyhour: utils.serverTime(global.config.HAPPYHOUR.time),
                happyhour_duration: global.config.HAPPYHOUR.duration,

                t: utils.serverTime()
            });
        }
        catch (err) {
            return next({
                status: 500,
                message: `Can't get ranking: ${err}`,
                error: err.message
            });

        }
    }
}