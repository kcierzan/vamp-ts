import type { ClipPlaybackEvent, PlaybackState, TrackID } from "$lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Transport } from "tone";
import type { Time } from "tone/build/esm/core/type/Units";
import AudioClipData from "./audio-clip-data.svelte";
import type AudioFile from "./audio-file.svelte";
import Sampler from "./sampler/sampler";

// function move() {}

interface AudioClipConstructorParams {
  audioClipData: AudioClipData;
  audioFile: AudioFile;
}

export default class AudioClip extends AudioClipData {
  private audioFile: AudioFile;
  public isDndShadowItem: boolean = false;
  private _state: PlaybackState;
  private sampler: Sampler;

  // can only be created with a downloaded audio file
  constructor(params: AudioClipConstructorParams) {
    const { audioClipData, audioFile } = params;
    super(audioClipData.toParams());
    this.audioFile = audioFile;
    const audioUrl = URL.createObjectURL(this.audioFile.file);
    this._state = "STOPPED";
    this.sampler = new Sampler(audioUrl, this.audioFile.bpm);
    this.sampler.speedFactor = audioClipData.playbackRate;
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
      type: audioFile.mimeType,
      index,
      track_id: trackId,
      playback_rate: currentProjectBpm / audioFile.bpm,
      audio_file_id: audioFile.id,
      start_time: 0,
      end_time: null
    };

    const { data, error } = await supabase
      .from(this.tableName)
      .insert(audioClipParams)
      .select()
      .single();

    if (error) throw new Error(error.message);
    const audioClipData = new AudioClipData(data);

    return new AudioClip({ audioClipData, audioFile });
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

  async setStartTime(supabase: SupabaseClient, startTime: number) {
    const { error } = await supabase
      .from(AudioClipData.tableName)
      .update({ start_time: startTime })
      .eq("id", this.id);
    if (error) throw new Error(error.message);
    this._startTime = startTime;
  }

  get endTime() {
    return this._endTime;
  }

  async setEndTime(supabase: SupabaseClient, endTime: number) {
    const { error } = await supabase
      .from(AudioClipData.tableName)
      .update({ end_time: endTime })
      .eq("id", this.id);
    if (error) throw new Error(error.message);
    this._endTime = endTime;
  }

  get playbackRate() {
    return this._playbackRate;
  }

  async setPlaybackRate(supabase: SupabaseClient, playbackRate: number) {
    const { error } = await supabase
      .from(AudioClipData.tableName)
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

  async stretchToBpm(supabase: SupabaseClient, targetBpm: number) {
    const playbackRate = targetBpm / this.audioFile.bpm;
    this.sampler.speedFactor = playbackRate;
    this._playbackRate = playbackRate;

    const { error } = await supabase
      .from(AudioClip.tableName)
      .update({ playback_rate: playbackRate })
      .eq("id", this.id);

    if (error) throw new Error(error.message);
  }
}
