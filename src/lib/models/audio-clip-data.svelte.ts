import type { AudioClipID, AudioFileID, TrackID } from "$lib/types";
import AudioFileData, { type AudioFileDataConstructorParams } from "./audio-file-data.svelte";

const TABLE_NAME = "audio_clips";

export interface AudioClipDataConstructorParams {
  id: AudioClipID;
  name: string;
  index: number;
  start_time: number;
  end_time: number | null;
  track_id: TrackID;
  audio_files: AudioFileDataConstructorParams;
  audio_file_id: AudioFileID;
  playback_rate: number;
}

export default class AudioClipData {
  public readonly id: AudioClipID;
  public readonly name: string;
  public readonly index: number;
  protected _startTime: number;
  protected _endTime: number | null;
  public readonly trackId: TrackID;
  public readonly audioFileData: AudioFileData;
  public readonly audioFileId: AudioFileID;
  protected _playbackRate: number;
  public static readonly tableName = TABLE_NAME;

  constructor(params: AudioClipDataConstructorParams) {
    const {
      id,
      name,
      index,
      start_time,
      end_time,
      track_id,
      audio_files,
      audio_file_id,
      playback_rate
    } = params;

    this.id = id;
    this.name = name;
    this.index = index;
    this._startTime = start_time;
    this._endTime = end_time;
    this.trackId = track_id;
    this.audioFileData = new AudioFileData(audio_files);
    this.audioFileId = audio_file_id;
    this._playbackRate = playback_rate;
  }

  get startTime() {
    return this._startTime;
  }

  get playbackRate() {
    return this._playbackRate;
  }

  get endTime() {
    return this._endTime;
  }

  toParams(): AudioClipDataConstructorParams {
    return {
      id: this.id,
      name: this.name,
      index: this.index,
      start_time: this.startTime,
      playback_rate: this.playbackRate,
      end_time: this.endTime,
      track_id: this.trackId,
      audio_files: this.audioFileData.toParams(),
      audio_file_id: this.audioFileId
    };
  }
}
