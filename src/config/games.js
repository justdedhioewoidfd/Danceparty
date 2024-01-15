// List of games that are available in Gameserver.

// Example:
// {
//     name: "Just Dance 2014", Full name of the game
//     isAvailable: true, If the game is allowed to access services
//     Region games
//     regions: {
//            Region ID
//            SJOP: {
//                region: PAL,
//                isAvailable: true You can also enable/disable certain regions
//            },
//            SJOE: {
//                region: NTSC,
//                isAvailable: true
//            }
//     },
//     We keep the game's star count, amount of songs and unlocksCount here to detect any cheating
//     stats: { 
//         totalStars: 275, Amount of all that can be earned in game
//         songsCount: 55, Amount of all songs in game
//         unlocksCount: 24 Amount of unlockables (avatars)
//     }
// }

const PAL = "PAL";
const NTSC = "NTSC";

// Disabling a game:
// - If a game has isAvailable as "false" it will be disabled completely, you can disable whatever you want but isAvailable will always overwrite.
// - If current service is WDF but game has "wdf" as false, it will be unavailable.
// - If current service is Shop but game has "shop" as false, it will be unavailable.
// - You can also disable specific regions with "isAvailable" in the region object.
const games = [
    {
        name: "Just Dance 3",
        isLyn: true,
        version: 3,
        isAvailable: true,
        ported: false,
        mod: false,
        shop: true,
        wdf: false,
        regions: {
            SD2P: {
                region: "PAL",
                isAvailable: true
            },
            SD2E: {
                region: "NTSC",
                titleId: "0001000573443245",
                isAvailable: true
            }
        }
    },
    {
        name: "Just Dance 3",
        isLyn: true,
        version: 3,
        isAvailable: true,
        ported: false,
        mod: false,
        shop: true,
        wdf: false,
        regions: {
            SJDP: {
                region: "PAL",
                isAvailable: true
            },
            SJDE: {
                region: "NTSC",
                titleId: "00010005734A4450",
                isAvailable: true
            }
        }
    },
    {
        name: "Just Dance 2014",
        isJD5: true,
        version: 2014,
        isAvailable: true,
        ported: false,
        mod: false,
        shop: true,
        wdf: true,
        wdfName: "jd5",
        stats: {},
        maxStars: 5,
        regions: {
            SJOP: {
                region: "PAL",
                isAvailable: true
            },
            SJOE: {
                region: "NTSC",
                titleId: "00010000534A4F45",
                isAvailable: true
            }
        }
    },
    {
        name: "Just Dance 2015",
        isJD15: true,
        version: 2015,
        isAvailable: true,
        ported: false,
        mod: false,
        shop: true,
        wdf: true,
        wdfName: "jd2015",
        stats: {
            totalStars: 465,
            songsCount: 93,
            unlocksCount: 27
        },
        maxStars: 5,
        regions: {
            SE3P: {
                region: "PAL",
                isAvailable: true
            },
            SE3E: {
                region: "NTSC",
                titleId: "0001000573453345",
                isAvailable: true
            }
        }
    },
    {
        name: "Just Dance 2016",
        version: 2016,
        isAvailable: true,
        ported: false,
        mod: false,
        shop: true,
        wdf: true,
        wdfName: "legacy",
        stats: {
            totalStars: 280,
            songsCount: 56,
            unlocksCount: 32
        },
        maxStars: 5,
        regions: {
            SJNP: {
                region: "PAL",
                isAvailable: true
            },
            SJNE: {
                region: "NTSC",
                isAvailable: true
            }
        }
    },
    {
        name: "Just Dance 2017",
        version: 2017,
        isAvailable: true,
        ported: false,
        mod: false,
        shop: true,
        wdf: true,
        wdfName: "legacy",
        stats: {
            totalStars: 275,
            songsCount: 55,
            unlocksCount: 24
        },
        maxStars: 6,
        regions: {
            SZ7P: {
                region: "PAL",
                isAvailable: true
            },
            SZ7E: {
                region: "NTSC",
                isAvailable: true
            }
        }
    },
    {
        name: "Just Dance 2018",
        version: 2018,
        isAvailable: true,
        ported: false,
        mod: false,
        shop: true,
        wdf: true,
        wdfName: "legacy",
        stats: {
            totalStars: 420,
            songsCount: 60,
            unlocksCount: 12
        },
        maxStars: 7,
        regions: {
            SE8P: {
                region: "PAL",
                isAvailable: true
            },
            SE8E: {
                region: "NTSC",
                isAvailable: true
            }
        }
    }
];

const mods = [{
    name: "Just Dance Japan",
    author: "Yunyl",
    version: 1000,
    modVersion: 2014,
    ported: true,
    mod: true,
    isAvailable: false,
    regions: {
        SJME: {
            region: PAL,
            isAvailable: true
        }
    },
    stats: {},
    maxStars: 5,
    wdfName: "jd5",
    isJD5: true,
    wdf: true,
    shop: false
}];

module.exports = [
    ...games,
    ...mods
];