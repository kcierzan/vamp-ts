import type { ProjectData, TrackData } from "$lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type AudioClipData from "./audio-clip-data.svelte";
import type AudioFileData from "./audio-file-data.svelte";

export class Project {
  private supabase: SupabaseClient;
  private projectData: ProjectData;
  private _tracks: TrackData[] = $state([]);
  private _audioFiles: AudioFileData[] = $state([]);
  private _clips: AudioClipData[] = $derived(this.tracks.map((track) => track.audio_clips).flat());

  constructor(supabase: SupabaseClient, projectData: ProjectData) {
    this.supabase = supabase;
    this.projectData = projectData;
    this._tracks = projectData.tracks;
    this._audioFiles = projectData.audio_files;
  }

  get name() {
    return this.projectData.name;
  }

  get poolFiles(): AudioFileData[] {
    return this._audioFiles;
  }

  get tracks(): TrackData[] {
    return this._tracks;
  }

  get clips(): AudioClipData[] {
    return this._clips;
  }

  get createdBy() {
    return this.projectData.created_by_user_id;
  }
}
