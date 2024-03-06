import type { ProjectID, TrackData, TrackID } from "$lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import AudioFile from "./audio-file.svelte";
import { Transport } from "tone";
import AudioClip from "./audio-clip.svelte";
import AudioClipData from "./audio-clip-data.svelte";

// function fromPool() {}
// function new() {}
// function fromClip() {}
// function delete() {}
// function stop() {}
const INSERT_TRACK_FROM_AUDIO_FILE_FUNCTION = "insert_track_from_pool_file";

export default class Track {
  public readonly id: TrackID;
  private _gain: number;
  private _name: string;
  private _panning: number;
  public readonly projectId;
  private _nextTrackId: TrackID | null;
  private _previousTrackId: TrackID | null;
  private _clips: AudioClip[];

  constructor(
    id: TrackID,
    gain: number,
    name: string,
    panning: number,
    projectId: number,
    nextTrackId: TrackID | null,
    previousTrackId: TrackID | null,
    clips: AudioClip[] = []
  ) {
    this.id = id;
    this._gain = gain;
    this._name = name;
    this._panning = panning;
    this.projectId = projectId;
    this._nextTrackId = nextTrackId;
    this._previousTrackId = previousTrackId;
    this._clips = clips;
  }

  static async new(supabase: SupabaseClient, trackData: TrackData) {
    const clips = await Promise.all(
      trackData.audio_clips.map(async (clip) => {
        const blob = await clip.audioFileData.downloadFile(supabase);
        const audioFile = new AudioFile(clip.audioFileData, blob);
        return new AudioClip(clip, audioFile);
      })
    );
    return new Track(
      trackData.id,
      trackData.gain,
      trackData.name,
      trackData.panning,
      trackData.project_id,
      trackData.next_track_id,
      trackData.previous_track_id,
      clips
    );
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
    const clipData = new AudioClipData(
      clip.id,
      clip.name,
      clip.index,
      clip.start_time,
      clip.end_time,
      clip.track_id,
      audioFile,
      clip.audio_file_id,
      clip.playback_rate
    );
    const audioClip = new AudioClip(clipData, audioFile);
    return new Track(
      track.id,
      track.gain,
      track.name,
      track.panning,
      track.project_id,
      track.next_track_id,
      track.previous_track_id,
      [audioClip]
    );
  }
}
