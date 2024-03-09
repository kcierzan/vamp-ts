import type { AudioClipData, ProjectID, TrackData, TrackID } from "$lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import AudioFile from "./audio-file.svelte";
import { Transport } from "tone";
import AudioClip from "./audio-clip.svelte";

// function fromPool() {}
// function new() {}
// function fromClip() {}
// function delete() {}
// function stop() {}
const TABLE_NAME = "tracks";
const INSERT_TRACK_FROM_AUDIO_FILE_FUNCTION = "insert_track_from_pool_file";
const INSERT_TRACK_FROM_AUDIO_CLIP_FUNCTION = "insert_track_from_audio_clip";

export default class Track {
  public readonly id: TrackID;
  private _gain: number;
  private _name: string;
  private _panning: number;
  public readonly projectId;
  private _nextTrackId: TrackID | null;
  private _previousTrackId: TrackID | null;
  private _audioClips: AudioClip[];

  constructor(params: TrackData, ...audioClips: AudioClip[]) {
    const { id, gain, name, panning, project_id, next_track_id, previous_track_id } = params;
    this.id = id;
    this._gain = gain;
    this._name = name;
    this._panning = panning;
    this.projectId = project_id;
    this._nextTrackId = next_track_id;
    this._previousTrackId = previous_track_id;
    this._audioClips = audioClips;
  }

  static async new(supabase: SupabaseClient, trackData: TrackData) {
    const audioClips = await Promise.all(
      trackData.audio_clips.map(async (clip) => {
        const blob = await AudioFile.download(supabase, clip.audio_files);
        const audioFile = new AudioFile(clip.audio_files, blob);
        return new AudioClip(clip, audioFile);
      })
    );
    return new Track(trackData, ...audioClips);
  }

  static async fromAudioFile(supabase: SupabaseClient, projectId: ProjectID, audioFile: AudioFile) {
    const { data: track, error } = await supabase.rpc(INSERT_TRACK_FROM_AUDIO_FILE_FUNCTION, {
      p_audio_file_id: audioFile.id,
      p_project_id: projectId,
      p_clip_name: audioFile.fileName,
      p_playback_rate: audioFile.bpm ? Transport.bpm.value / audioFile.bpm : 1.0
    });

    if (error) throw new Error(error.message);

    const audioClipData = track.audio_clips[0];
    const audioClip = new AudioClip(audioClipData, audioFile);
    return new Track(track, audioClip);
  }

  static async fromAudioClip(supabase: SupabaseClient, projectId: ProjectID, audioClip: AudioClip) {
    const { data: trackData, error } = await supabase.rpc(INSERT_TRACK_FROM_AUDIO_CLIP_FUNCTION, {
      p_clip_id: audioClip.id,
      p_project_id: projectId
    });

    if (error) throw new Error(error.message);

    const audioClipData = trackData.audio_clips[0];
    const clip = new AudioClip(audioClipData, audioClip.audioFile);
    // TODO: how do we delete the clip from the old track?
    return new Track(trackData, clip);
  }

  static get tableName() {
    return TABLE_NAME;
  }

  get nextTrackId() {
    return this._nextTrackId;
  }

  set nextTrackId(value) {
    this._nextTrackId = value;
  }

  get previousTrackId() {
    return this._previousTrackId;
  }

  set previousTrackId(value) {
    this._previousTrackId = value;
  }

  public stop() {}
  public playClip() {}
}
