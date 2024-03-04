import type { TrackData } from "$lib/types";

// function fromPool() {}
// function new() {}
// function fromClip() {}
// function delete() {}
// function stop() {}

export class Track {
  private trackData: TrackData;

  constructor(trackData: TrackData) {
    this.trackData = trackData;
  }

  static fromPool(audioFile: AudioFile) {
    const trackData = {
      gain: 0,
      name: audioFile.name
    };
    return new Track();
  }
}
