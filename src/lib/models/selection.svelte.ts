import type AudioClip from "./audio-clip.svelte";
import type Track from "./track.svelte";

export default class Selection {
  private _clip: AudioClip | null = $state(null);
  private _track: Track | null = $state(null);

  get clip() {
    return this._clip;
  }

  set clip(value) {
    this._clip = value;
  }

  get track() {
    return this._track;
  }

  set track(value) {
    this._track = value;
  }
}
