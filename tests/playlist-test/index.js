const Playlist = require("../../src/lib/wdf-playlist");

module.exports = async () => {

    const version = 2015;
    const playlist = new Playlist(version);

    try {
        const screens = await playlist.getScreens();
        console.log("screens", screens)
    }
    catch(err) {
        console.error(err)
    }

};