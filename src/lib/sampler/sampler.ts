/* eslint-disable @typescript-eslint/no-explicit-any */
import { Gain, Player, getContext } from "tone";
import { type Time } from "tone/build/esm/core/type/Units";

export default class Sampler {
  private _pitchFactorParam: AudioParam;
  private _player: Player;
  private _pitchFactor: number;
  private _speedFactor: number;
  private _phaseVocoderNode: AudioWorkletNode;

  constructor(url: string, bufferBpm?: number, targetBpm?: number) {
    const context = getContext();
    const gain = new Gain(1).toDestination();
    this._phaseVocoderNode = context.createAudioWorkletNode("phase-vocoder-processor");
    this._player = new Player(url);
    this._pitchFactor = 1.0;
    this._speedFactor = !!bufferBpm && !!targetBpm ? targetBpm / bufferBpm : 1.0;
    this._player.playbackRate = this._speedFactor;

    const parameters: any = this._phaseVocoderNode.parameters;
    this._pitchFactorParam = parameters.get("pitchFactor");
    this._pitchFactorParam.value = this._pitchFactor / this._speedFactor;
    this._player.connect(this._phaseVocoderNode);
    this._phaseVocoderNode.connect(gain.input);
  }

  get pitchFactor() {
    return this._pitchFactor;
  }

  set pitchFactor(value: number) {
    this._pitchFactor = value;
    this._pitchFactorParam.value = this._pitchFactor / this._speedFactor;
  }

  get speedFactor() {
    return this._speedFactor;
  }

  set speedFactor(value: number) {
    this._speedFactor = value;
    this._player.playbackRate = value;
    this._pitchFactorParam.value = this._pitchFactor / this._speedFactor;
  }

  start(...args: any[]) {
    return this._player.start(...args);
  }

  stop(...args: any[]) {
    return this._player.stop(...args);
  }

  restart(...args: any[]) {
    return this._player.restart(...args);
  }

  seek(offset: Time, when?: Time) {
    return this._player.seek(offset, when);
  }

  get reverse() {
    return this._player.reverse;
  }

  set reverse(value: boolean) {
    this._player.reverse = value;
  }

  get duration() {
    return this._player.buffer.duration;
  }
}
