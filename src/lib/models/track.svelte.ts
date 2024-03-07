import type { ProjectID, TrackData, TrackID } from "$lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import AudioFile from "./audio-file.svelte";
import { Transport } from "tone";
import AudioClip from "./audio-clip.svelte";
import AudioClipData, { type AudioClipDataConstructorParams } from "./audio-clip-data.svelte";

// function fromPool() {}
// function new() {}
// function fromClip() {}
// function delete() {}
// function stop() {}
const INSERT_TRACK_FROM_AUDIO_FILE_FUNCTION = "insert_track_from_pool_file";
const INSERT_TRACK_FROM_AUDIO_CLIP_FUNCTION = "insert_track_from_audio_clip";

export interface TrackConstructorParams {
  id: TrackID;
  gain: number;
  name: string;
  panning: number;
  project_id: ProjectID;
  next_track_id: TrackID | null;
  previous_track_id: TrackID | null;
  audio_clips: AudioClip[];
}

export default class Track {
  public readonly id: TrackID;
  private _gain: number;
  private _name: string;
  private _panning: number;
  public readonly projectId;
  private _nextTrackId: TrackID | null;
  private _previousTrackId: TrackID | null;
  private _audioClips: AudioClipDataConstructorParams[];

  constructor(params: TrackConstructorParams) {
    const { id, gain, name, panning, project_id, next_track_id, previous_track_id, audio_clips } =
      params;
    this.id = id;
    this._gain = gain;
    this._name = name;
    this._panning = panning;
    this.projectId = project_id;
    this._nextTrackId = next_track_id;
    this._previousTrackId = previous_track_id;
    this._audioClips = audio_clips;
  }

  static async new(supabase: SupabaseClient, trackData: TrackData) {
    const audioClips = await Promise.all(
      trackData.audio_clips.map(async (clip) => {
        const blob = await clip.audioFileData.downloadFile(supabase);
        const audioFile = new AudioFile({ audioFileData: clip.audioFileData, file: blob });
        return new AudioClip({ audioClipData: clip, audioFile });
      })
    );
    return new Track({ ...trackData, audio_clips: audioClips });
  }

  static async fromAudioFile(supabase: SupabaseClient, projectId: ProjectID, audioFile: AudioFile) {
    const { data: track, error } = await supabase.rpc(INSERT_TRACK_FROM_AUDIO_FILE_FUNCTION, {
      p_audio_file_id: audioFile.id,
      p_project_id: projectId,
      p_clip_name: audioFile.fileName,
      p_playback_rate: audioFile.bpm ? Transport.bpm.value / audioFile.bpm : 1.0
    });

    if (error) throw new Error(error.message);

    const clip = track.audio_clips[0];
    const audioClipData = new AudioClipData({
      ...clip,
      audio_files: audioFile.toParams(),
      audio_file_id: audioFile.id
    });
    const audioClip = new AudioClip({ audioClipData, audioFile });
    return new Track({ ...track, audio_clips: [audioClip] });
  }

  static async fromAudioClip(supabase: SupabaseClient, projectId: ProjectID, audioClip: AudioClip) {
    const { data: track, error } = await supabase.rpc(INSERT_TRACK_FROM_AUDIO_CLIP_FUNCTION, {
      p_clip_id: audioClip.id,
      p_project_id: projectId
    });

    if (error) throw new Error(error.message);

    const audioClipData = new AudioClipData({
      ...track.audio_clips[0],
      audio_files: audioClip.audioFileData.toParams(),
      audio_file_id: audioClip.audioFileId
    });

    // TODO: how do we delete the clip from the old track?
    const clip = new AudioClip({ audioClipData, audioFile: audioClip.audioFile });
    return new Track({ ...track, audio_clips: [clip] });
  }

  public stop() {}
  public playClip() {}
}
