import type { AudioClipID, AudioFileID, TrackID } from "$lib/types";
import AudioFileData from "./audio-file-data.svelte";

const TABLE_NAME = "audio_clips";

export default class AudioClipData {
  public readonly id: AudioClipID;
  public readonly name: string;
  public readonly index: number;
  public readonly startTime: number;
  public readonly endTime: number | null;
  public readonly trackId: TrackID;
  public readonly audioFileData: AudioFileData;
  public readonly audioFileId: AudioFileID;
  public readonly playbackRate: number;
  public static readonly tableName = TABLE_NAME;

  constructor(
    id: AudioClipID,
    name: string,
    index: number,
    start_time: number,
    end_time: number | null,
    track_id: TrackID,
    audio_files: AudioFileData,
    audio_file_id: AudioFileID,
    playback_rate: number
  ) {
    this.id = id;
    this.name = name;
    this.index = index;
    this.startTime = start_time;
    this.endTime = end_time;
    this.trackId = track_id;
    this.audioFileData = audio_files;
    this.audioFileId = audio_file_id;
    this.playbackRate = playback_rate;
  }
}
