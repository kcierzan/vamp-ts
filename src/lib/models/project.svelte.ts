import type AudioClip from "$lib/models/audio-clip.svelte";
import Transport from "$lib/models/transport.svelte";
import type { ProjectData, QuantizationInterval, UserID } from "$lib/types";
import { quantizedTransportTime } from "$lib/utils";
import type { SupabaseClient } from "@supabase/supabase-js";
import AudioFile from "./audio-file.svelte";
import Track from "./track.svelte";

const PROJECTS_TABLE = "projects";
const INSERT_EMPTY_TRACK_FUNCTION = "insert_empty_track";

export interface ProjectParams {
  supabase: SupabaseClient;
  projectData: ProjectData;
  tracks: Track[];
  pool: AudioFile[];
}

export default class Project {
  public readonly id: number;
  private _name: string = $state("");
  private _bpm: number = $state(0);
  private _description: string | null = $state(null);
  private _createdByUserId: string;
  private _tracks: Track[] = $state([]);
  private _pool: AudioFile[] = $state([]);
  // TODO: Add this to the project table
  private _launchQuantization: QuantizationInterval = $state("+0.001");
  private supabase: SupabaseClient;
  public readonly transport: Transport;

  constructor(params: ProjectParams) {
    const { projectData, supabase, tracks, pool } = params;
    const { id, name, description, bpm, created_by_user_id } = projectData;
    this.id = id;
    this._name = name;
    this._description = description;
    this._bpm = bpm;
    this._createdByUserId = created_by_user_id;
    this.supabase = supabase;
    this._tracks = Project.orderTracks(tracks);
    this._pool = pool;
    this.transport = new Transport({ bpm });
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

  get name() {
    return this._name;
  }

  get bpm() {
    return this._bpm;
  }

  get description() {
    return this._description;
  }

  get pool(): AudioFile[] {
    return this._pool;
  }

  get tracks(): Track[] {
    return this._tracks;
  }

  get createdByUserId(): UserID {
    return this._createdByUserId;
  }

  get launchQuantization() {
    return this._launchQuantization;
  }

  set launchQuantization(value) {
    this._launchQuantization = value;
  }

  async addTrack() {
    const { data: trackData, error } = await this.supabase.rpc(INSERT_EMPTY_TRACK_FUNCTION, {
      p_project_id: this.id
    });

    if (error) throw new Error(error.message);
    const track = new Track(trackData);
    this.pushTrack(track);
  }

  async setBpm(value: number) {
    this.transport.rampToBpm(value);
    this._bpm = value;
    const { error } = await this.supabase
      .from(PROJECTS_TABLE)
      .update({ bpm: value })
      .eq("id", this.id);

    if (error) throw new Error(error.message);
  }

  playClip(clip: AudioClip) {
    const track = this.tracks.find((track) => track.id === clip.trackId);
    const nextDivision = quantizedTransportTime(this._launchQuantization);
    track?.playClip(clip, nextDivision);
  }

  stopAllTracks() {
    const nextDivision = quantizedTransportTime(this._launchQuantization);
    this.tracks.forEach((track) => track.stop(nextDivision));
  }

  private static orderTracks(tracks: Track[]) {
    const orderedTracks = [];
    const tracksMap = new Map<number, Track>();
    tracks.forEach((track) => tracksMap.set(track.id, track));
    let currentTrack = tracks.find((track) => track.previousTrackId === null);

    while (currentTrack) {
      orderedTracks.push(currentTrack);
      currentTrack =
        currentTrack.nextTrackId !== null ? tracksMap.get(currentTrack.nextTrackId) : undefined;
    }

    return orderedTracks;
  }

  private pushTrack(track: Track) {
    if (this.tracks.length) {
      this.tracks.at(-1)!.nextTrackId = track.id;
      track.previousTrackId = this.tracks.at(-1)!.id;
    }
    this._tracks.push(track);
  }
}
