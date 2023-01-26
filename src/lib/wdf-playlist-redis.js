class PlaylistRedis {
  constructor(version) {
    if (!global.redisClient) throw new Error(`Redis is not connected, Redis helper can't even help!`);
    this.client = global.redisClient;

    this.version = version;
    this.keys = {
        PLAYLIST_KEY: `dp-playlist:${this.version}`,
        SONGS_ORDER_KEY: `dp-songs-order:${this.version}`,
        SONG_IDX_KEY: `dp-song-idx:${this.version}`,
    };
  }

  async run(...args) {
    return await this.client.sendCommand(args.map(
      arg => typeof arg == "object" ? JSON.stringify(arg) : "" + arg
    ));
  }

  async getQueueSize() {
    return await this.run("LLEN", this.keys.PLAYLIST_KEY);
  }

  async getCurrentSong() {
    return JSON.parse(await this.run("LINDEX", this.keys.PLAYLIST_KEY, 0));
  }

  async getNextSong() {
    return JSON.parse(await this.run("LINDEX", this.keys.PLAYLIST_KEY, 1));
  }

  async getLastSong() {
    return JSON.parse(await this.run("LINDEX", this.keys.PLAYLIST_KEY, -1));
  }

  async pushSong(song) {
    return await this.run("RPUSH", this.keys.PLAYLIST_KEY, song);
  }

  async popSong() {
    return await this.run("LPOP", this.keys.PLAYLIST_KEY);
  }

  async resetQueue() {
    return await this.run("DEL", this.keys.PLAYLIST_KEY);
  }

  async incrementSongIdx() {
    const len = await this.run("LLEN", this.keys.SONGS_ORDER_KEY);
    const idx = await this.run("GET", this.keys.SONG_IDX_KEY) ?? 0;

    await this.run("SET", this.keys.SONG_IDX_KEY, (idx + 1) % len);
  }

  async getRandomSongId() {
    const song_ids = await this.run("GET", this.keys.SONGS_ORDER_KEY) ?? [];
    const idx = this.run("GET", this.keys.SONG_IDX_KEY) ?? 0;

    await this.incrementSongIdx();

    return song_ids[idx];
  }

  async setSongsOrder(song_ids) {
    await this.run("SET", this.keys.SONG_IDX_KEY, 0);
    await this.run("SET", this.keys.SONGS_ORDER_KEY, song_ids);
  }
}

module.exports = PlaylistRedis;