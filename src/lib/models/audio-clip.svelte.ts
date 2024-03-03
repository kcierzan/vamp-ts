import type { PlaybackState, TrackID } from "$lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import AudioClipData from "./audio-clip-data.svelte";
import type AudioFile from "./audio-file.svelte";

// function stretchToBpm() {}
// function update() {}
// function play() {}

export default class AudioClip extends AudioClipData {
  private audioFile: AudioFile;
  public isDndShadowItem: boolean = false;
  public state: PlaybackState;

  // can only be created with a downloaded audio file
  constructor(audioClipData: AudioClipData, audioFile: AudioFile) {
    super(
      audioClipData.id,
      audioClipData.name,
      audioClipData.index,
      audioClipData.startTime,
      audioClipData.endTime,
      audioClipData.trackId,
      audioClipData.audioFileData,
      audioClipData.audioFileId,
      audioClipData.playbackRate
    );
    this.audioFile = audioFile;
    this.state = "STOPPED";
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

    const { data: audioClipData, error } = await supabase
      .from(this.tableName)
      .insert(audioClipParams)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return new AudioClip(audioClipData, audioFile);
  }
}
