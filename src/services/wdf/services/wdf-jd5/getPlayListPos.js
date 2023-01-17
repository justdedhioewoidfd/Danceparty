const utils = require("wdf-utils")
const time = require("time")

const Playlist = require("wdf-playlist");
const Session = require("wdf-session");

/**
 * getPlayListPos is for the game to be in sync with the current WDF playlist
 */
module.exports = {

    name: `getPlayListPos`,
    description: ``,
    version: `1.0.0`,

    async init(req, res, /* next */) {

        const { lang } = req.body;

        const now = time.milliseconds();

        const playlist = new Playlist(req.version);
        const session = new Session(req.version);

        const durations = playlist.durations;

        const { prev, cur, next } = await playlist.getScreens();

        const count = await session.sessionCount();

        let pos = (now - cur.timing.start_song_time) / 1000; // "pos" indicates the position of the playlist
        let left = (cur.timing.stop_song_time - now) / 1000; // "left" shows how many seconds are left until a map ends

        let modeData = {
            mode: cur.theme.id,
            nextmode: next.theme.id,
        };

        let timingData = {
            start: cur.timing.start_song_time,
            end: cur.timing.stop_song_time,

            pos,
            left,

            sessionToWorldResultTime: durations.world_result_duration / 1000, // Duration from map end till world result screen
            display_next_song_time: durations.display_next_song_duration / 1000, // The duration of "next song" popup on right side
            session_recap_time: durations.session_result_duration / 1000, // Duration of lobby/party recap time

            // Theme durations
            theme_choice_duration: 0,
            theme_result_duration: 0,
            coach_choice_duration: 0,
            coach_result_duration: 0,

            rankwait: durations.waiting_recap_duration / 1000 // Duration of waiting for recap results
        };

        let voteData = {
            vote1: 0,
            vote2: 0,
            vote3: 0,
            vote4: 0,
            votenumresult: 0,
            vote1_song: 0,
            vote2_song: 0,
            vote3_song: 0,
            vote4_song: 0,
            votenumchoices: 0,
            vote_end: cur.timing.last_vote_time,
            next1: 0,
            next2: 0,
            next3: 0,
            next4: 0
        };

        let playlistData = {
            ...modeData,
            ...timingData,
            ...voteData,

            unique_song_id: cur.map.songId,
            nextsong: next.map.songId,

            requestPlaylistTime: cur.timing.request_playlist_time,
            interlude: "yes",

            last_song_unlocked: 23366640638,
            next_unlocked_song_id:  24699558761,

            current_star_count: 3040,
            star_count_for_unlock: 50000,

            happyhour: Date.now() + (60 * 1000 * 60),
            happyhour_duration: 3600
        };

        // Depending on theme type, set extra information.
        switch (cur.theme.id) {
            case 1:
                playlistData.community1name = cur.theme.communities[0];
                playlistData.community2name = cur.theme.communities[1];
                playlistData.theme_choice_duration = durations.community_choice_duration / 1000;
                playlistData.theme_result_duration = durations.community_result_duration / 1000;
                break;
            case 2:
                break;
            case 3:
                playlistData.coach_choice_duration = durations.coach_choice_duration / 1000;
                playlistData.coach_result_duration = durations.coach_result_duration / 1000;
                break;
        }

        // Times to parse
        ["start", "end", "requestPlaylistTime", "vote_end", "happyhour"].forEach(t => {
            playlistData[t] = utils.serverTime(playlistData[t]);
        });

        return res.uenc({
            ...playlistData,
            count,
            t: utils.serverTime(now)
        });
    }
};