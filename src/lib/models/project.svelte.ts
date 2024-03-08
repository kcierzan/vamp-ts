import type { ProjectData, TrackData, UserID } from "$lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import AudioFile from "./audio-file.svelte";
import Track from "./track.svelte";

interface ProjectParams {
  supabase: SupabaseClient;
  projectData: ProjectData;
  tracks: Track[];
  pool: AudioFile[];
}

export class Project {
  public readonly id: number;
  private _name: string;
  private _bpm: number;
  private _description: string | null;
  private _created_by_user_id: string;
  private _tracks: Track[];
  private _pool: AudioFile[];
  private supabase: SupabaseClient;

  constructor(params: ProjectParams) {
    const { projectData, supabase, tracks, pool } = params;
    const { id, name, description, bpm, created_by_user_id } = projectData;
    this.id = id;
    this._name = name;
    this._description = description;
    this._bpm = bpm;
    this._created_by_user_id = created_by_user_id;
    this.supabase = supabase;
  }

  get name() {
    return this._name;
  }

  get pool(): AudioFile[] {
    return this._pool;
  }

  get tracks(): Track[] {
    return this._tracks;
  }

  get createdByUserId(): UserID {
    return this._created_by_user_id;
  }

  static async new(supabase: SupabaseClient, projectData: ProjectData) {
    const { tracks: trackData, audio_files: poolData } = projectData;
    const tracks = await Promise.all(
      trackData.map(async (track) => await Track.new(supabase, track))
    );
    const pool = await Promise.all(
      poolData.map(async (audioFileData) => {
        const blob = await AudioFile.download(supabase, audioFileData);
        return new AudioFile(audioFileData, blob);
      })
    );
    return new Project({ supabase, projectData, tracks, pool });
  }
}
