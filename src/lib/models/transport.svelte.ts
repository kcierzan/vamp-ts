import type { PlaybackState } from "$lib/types";
import { Draw, Transport as ToneTransport } from "tone";
import round from "lodash/round";

export interface TransportParams {
  bpm: number;
}

export default class Transport {
  private _state: PlaybackState = $state("STOPPED");
  private _toneTransport = ToneTransport;
  private _barsBeatsSixteenths = $state("0:0:0");
  private _seconds = $state("0.00");
  private _bbsUpdateEvent: number | null = null;
  private _secondsUpdateEvent: number | null = null;
  private _bpm: number = $state(120);

  constructor(params: TransportParams) {
    const { bpm } = params;
    this._bpm = bpm;
  }

  start() {
    this.scheduleUpdates();
    this._toneTransport.start();
    this._state = "PLAYING";
  }

  stop() {
    this._toneTransport.stop();
    this._state = "STOPPED";
    this._seconds = "0.00";
    this._barsBeatsSixteenths = "0:0:0";
  }

  pause() {
    this._toneTransport.pause();
    this._state = "PAUSED";
  }

  stopOrPause() {
    this.state === "PLAYING" ? this.pause() : this.stop();
    this.clearEvents();
  }

  rampToBpm(bpm: number) {
    if (this._toneTransport.bpm.value) {
      this._toneTransport.bpm.setValueAtTime(bpm, "+0.5");
    }
    this._bpm = bpm;
  }

  get state() {
    return this._state;
  }

  get bpm() {
    return this._bpm;
  }

  set bpm(value: number) {
    if (this._toneTransport.bpm.value) {
      this._toneTransport.bpm.value = value;
    }
    this._bpm = value;
  }

  private scheduleUpdates() {
    this.clearEvents();
    this._bbsUpdateEvent = this.scheduleBarsBeatsSixteenthsUpdate();
    this._secondsUpdateEvent = this.scheduleSecondsUpdate();
  }

  private clearEvents() {
    this._bbsUpdateEvent !== null && this._toneTransport.clear(this._bbsUpdateEvent);
    this._secondsUpdateEvent !== null && this._toneTransport.clear(this._secondsUpdateEvent);
  }

  private scheduleSecondsUpdate() {
    return this._toneTransport.scheduleRepeat((time) => {
      Draw.schedule(() => {
        const now = round(this._toneTransport.seconds, 2);
        this._seconds = now.toFixed(2);
      }, time);
    }, "10hz");
  }

  private scheduleBarsBeatsSixteenthsUpdate() {
    return this._toneTransport.scheduleRepeat((time) => {
      Draw.schedule(() => {
        const [bars, beats, sixteenths] = this._toneTransport.position.toString().split(":");
        this._barsBeatsSixteenths = `${bars}:${beats}:${Math.floor(parseInt(sixteenths))}`;
      }, time);
    }, "16n");
  }
}
