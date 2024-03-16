import type {
  AudioClipData,
  AudioClipID,
  ClipPlaybackEvent,
  PlaybackState,
  TrackID
} from "$lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Transport } from "tone";
import type { Time } from "tone/build/esm/core/type/Units";
import type AudioFile from "./audio-file.svelte";
import Sampler from "./sampler/sampler";

const AUDIO_CLIPS_TABLE = "audio_clips";

export default class AudioClip {
  public readonly id: AudioClipID;
  private _name: string;
  private _index: number;
  private _startTime: number = $state(0);
  private _endTime: number | null = $state(null);
  private _trackId: TrackID;
  private _playbackRate: number = $state(1.0);
  public readonly audioFile: AudioFile;
  private _state: PlaybackState = $state("STOPPED");
  private sampler: Sampler;

  constructor(params: AudioClipData, audioFile: AudioFile) {
    const { id, name, index, start_time, end_time, track_id, playback_rate } = params;
    this.id = id;
    this._name = name;
    this._index = index;
    this._startTime = start_time;
    this._endTime = end_time;
    this._trackId = track_id;
    this.audioFile = audioFile;
    this._playbackRate = playback_rate;
    const audioUrl = URL.createObjectURL(this.audioFile.blob);
    this._state = "STOPPED";
    this.sampler = new Sampler(audioUrl, this.audioFile.bpm);
    this.sampler.speedFactor = this._playbackRate;
  }

  static async fromAudioFile(
    supabase: SupabaseClient,
    audioFile: AudioFile,
    index: number,
    trackId: TrackID,
    currentProjectBpm: number
  ) {
    const audioClipParams = {
      name: audioFile.fileName,
      index,
      track_id: trackId,
      playback_rate: currentProjectBpm / audioFile.bpm,
      audio_file_id: audioFile.id,
      start_time: 0,
      end_time: null
    };

    const { data, error } = await supabase
      .from(AUDIO_CLIPS_TABLE)
      .insert(audioClipParams)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return new AudioClip(data, audioFile);
  }

  static get tableName() {
    return AUDIO_CLIPS_TABLE;
  }

  get state(): PlaybackState {
    return this._state;
  }

  set state(value: PlaybackState) {
    this._state = value;
  }

  get startTime() {
    return this._startTime;
  }

  get endTime() {
    return this._endTime;
  }

  get index() {
    return this._index;
  }

  set index(value) {
    this._index = value;
  }

  get trackId() {
    return this._trackId;
  }

  set trackId(value: TrackID) {
    this._trackId = value;
  }

  get name() {
    return this._name;
  }

  get duration() {
    return this.sampler.duration;
  }

  async setStartEndTimes({
    supabase,
    startTime,
    endTime
  }: {
    supabase: SupabaseClient;
    startTime: number;
    endTime: number;
  }) {
    const { error } = await supabase
      .from(AUDIO_CLIPS_TABLE)
      .update({ end_time: endTime, start_time: startTime })
      .eq("id", this.id);
    if (error) throw new Error(error.message);
    this._endTime = endTime;
    this._startTime = startTime;
  }

  get playbackRate() {
    return this._playbackRate;
  }

  async setPlaybackRate(supabase: SupabaseClient, playbackRate: number) {
    const { error } = await supabase
      .from(AUDIO_CLIPS_TABLE)
      .update({ playback_rate: playbackRate })
      .eq("id", this.id);
    if (error) throw new Error(error.message);
    this.sampler.speedFactor = playbackRate;
    this._playbackRate = playbackRate;
  }

  scheduleLoop(time: Time): ClipPlaybackEvent {
    const playbackEvent: ClipPlaybackEvent = Transport.scheduleRepeat(
      (launchTime: number) => {
        const stopTime = this.endTime ? this.endTime - this.startTime : this.sampler.duration;
        this.sampler
          .start(launchTime, this.startTime)
          .stop(`+${stopTime / this.sampler.speedFactor}`);
      },
      "1m",
      time
    );
    this.state = "QUEUED";
    return playbackEvent;
  }

  stopAudio(time: Time) {
    this.sampler.stop(time);
  }

  async stretchToBpm(supabase: SupabaseClient, targetBpm: number) {
    const playbackRate = targetBpm / this.audioFile.bpm;
    this.sampler.speedFactor = playbackRate;
    this._playbackRate = playbackRate;

    const { error } = await supabase
      .from(AUDIO_CLIPS_TABLE)
      .update({ playback_rate: playbackRate })
      .eq("id", this.id);

    if (error) throw new Error(error.message);
  }
}
