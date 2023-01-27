const Joi = require("joi")

const uenc = require("uenc")
const utils = require("wdf-utils");

const Session = require("wdf-session");
const Scores = require("wdf-score");

module.exports = {

    name: `getMyRank`,
    description: `Serves rank status for top 10 players & client's score`,
    version: `1.0.0`,

    async init(req, res, next) {

        try {
            const { onlinescore, song_id, star_score } = req.body;

            const session = new Session(req.game.version);
            const scores = new Scores(req.game.version);

            // User's leveled up their WDF level, update it
            // TODO: maybe have 1 function to updateLevel OR
            // remove profile from score and make session have it only
            await session.updateLevel(req.sid, onlinescore);
            await scores.updateLevel(req.sid, onlinescore);

            const count = await session.sessionCount();
            const total = await scores.scoreCount();

            const userRank = await scores.getRank(req.sid);
            const userScore = await scores.getScore(req.sid);

            // Get theme results (coach/theme) and amount of winning side's player count
            const { themeResults } = await scores.getThemeAndCoachResult();
            const winners = await scores.getNumberOfWinners(themeResults);

            // Get top 10 scores
            const topTen = await scores.getRanks(30);
            const entries = [];
            for (let i = 0; i < topTen.length; i++) {
                const entry = topTen[i];

                // If any of the top scores don't have a session don't include them
                // (which means they left wdf right before ranking)
                const entrySession = await session.getOtherSession(entry.sessionId);
                if (!entrySession) continue;

                entries.push({
                    sid: entry.sid,
                    score: entry.totalScore,
                    name: entrySession.profile.name,
                    pays: entrySession.profile.country,
                    avatar: entrySession.profile.avatar,
                    onlinescore: entrySession.profile.rank,
                });
            };

            return res.uenc({
                onlinescore_updated: onlinescore,

                ...uenc.setIndex(entries),
                numscores: entries.length,

                count,
                total,

                myrank: userRank || count,
                myscore: userScore?.totalScore || 0,
                song_id: song_id,

                ...themeResults,

                nb_winners: winners,
                star_score,

                t: utils.serverTime()
            });
        }
        catch (err) {
            return next({
                status: 500,
                message: `Can't get current rank: ${err}`,
                error: err.message
            });
        }
    }
}