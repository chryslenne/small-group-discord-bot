class Track {
  constructor({ title, url, duration, thumbnail, requestedBy }) {
    this.title = title;
    this.url = url;
    this.duration = duration;
    this.thumbnail = thumbnail;
    this.requestedBy = requestedBy;
  }
}

module.exports = Track;
