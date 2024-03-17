import AudioClip from "$lib/models/audio-clip.svelte";
import Scenes from "$lib/models/scenes.svelte";
import Selection from "$lib/models/selection.svelte";
import Transport from "$lib/models/transport.svelte";
import type { ProjectData, QuantizationInterval } from "$lib/types";
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
  readonly _name: string = $state("");
  private _bpm: number = $state(0);
  readonly _description: string | null = $state(null);
  readonly _createdByUserId: string;
  // TODO: make this a reactive map and write a `push` method on this class
  private readonly _tracks: Track[] = $state([]);
  private readonly _pool: AudioFile[] = $state([]);
  // TODO: Add this to the project table and make db updates
  private _launchQuantization: QuantizationInterval = $state("@1m");
  private readonly supabase: SupabaseClient;
  public readonly transport: Transport;
  public readonly selection: Selection;
  private readonly _scenes: Scenes = $derived(new Scenes({ tracks: this._tracks }));

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
    this.selection = new Selection();
  }

  static async new(supabase: SupabaseClient, projectData: ProjectData) {
    const { tracks: trackData, audio_files: poolData } = projectData;
    const pool = await Promise.all(
      poolData.map(async (audioFileData) => {
        const blob = await AudioFile.download(supabase, audioFileData);
        return new AudioFile(audioFileData, blob);
      })
    );
    const tracks = await Promise.all(trackData.map((track) => Track.new(pool, track)));
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

  get launchQuantization() {
    return this._launchQuantization;
  }

  set launchQuantization(value) {
    this._launchQuantization = value;
  }

  get scenes() {
    return this._scenes;
  }

  async addTrack() {
    const { data: trackData, error } = await this.supabase.rpc(INSERT_EMPTY_TRACK_FUNCTION, {
      p_project_id: this.id
    });

    if (error) throw new Error(error.message);
    const track = new Track(trackData);
    this.pushTrack(track);
  }

  setBpm(value: number) {
    this.transport.rampToBpm(value);
    this._bpm = value;
    for (const track of this.tracks) {
      track.stretchClips(this.supabase, this._bpm);
    }

    this.supabase
      .from(PROJECTS_TABLE)
      .update({ bpm: value })
      .eq("id", this.id)
      .then(null, (error) => console.error(`supabase update error: ${error}`));
  }

  playClip(clip: AudioClip) {
    // await startTone();
    const launchTime =
      this.transport.state === "PLAYING" ? this._launchQuantization : this.transport.now;
    if (this.transport.state !== "PLAYING") this.transport.start();
    const track = this.tracks.find((track) => track.id === clip.trackId);
    track?.playClip(clip, launchTime);
  }

  stopTrack(track: Track) {
    const nextDivision = quantizedTransportTime(this._launchQuantization);
    track.stop(nextDivision);
  }

  stopAllTracks() {
    const nextDivision = quantizedTransportTime(this._launchQuantization);
    this.tracks.forEach((track) => track.stop(nextDivision));
  }

  moveClipToTrack(clip: AudioClip, targetTrack: Track, targetIndex: number) {
    const currentTrack = this.tracks.find((track) => track.id === clip.trackId);
    currentTrack?.removeClip(clip);
    clip.index = targetIndex;
    targetTrack.addClip(clip);

    this.supabase
      .from(AudioClip.tableName)
      .update({ track_id: targetTrack.id, index: targetIndex })
      .eq("id", clip.id)
      .then(null, (error) => console.error(`supabase update error: ${error}`));

    clip.trackId = targetTrack.id;
  }

  async moveAudioFileToTrack(audioFile: AudioFile, index: number, track: Track) {
    const audioClip = await AudioClip.fromAudioFile(
      this.supabase,
      audioFile,
      index,
      track.id,
      this.bpm
    );

    const targetTrack = this.tracks.find((targetTrack) => targetTrack.id === track.id);
    targetTrack?.addClip(audioClip);
    return audioClip;
  }

  async createTrackFromDraggable(draggable: AudioClip | AudioFile) {
    const track =
      draggable instanceof AudioFile
        ? await Track.fromAudioFile(this.supabase, this.id, draggable)
        : await Track.fromAudioClip(this.supabase, this.id, draggable);

    this._tracks.push(track);
  }

  async uploadFileToPool(file: File) {
    const audioFile = await AudioFile.fromFile(this.supabase, this.id, file, AudioFile.bucketName);
    this._pool.push(audioFile);
  }

  private static orderTracks(tracks: Track[]) {
    const orderedTracks: Track[] = [];
    const tracksMap = new Map<number, Track>();
    tracks.forEach((track) => tracksMap.set(track.id, track));
    let currentTrack = tracks.find((track) => track.isFirstTrack);

    while (currentTrack) {
      orderedTracks.push(currentTrack);

      if (currentTrack.nextTrackId !== null) {
        currentTrack = tracksMap.get(currentTrack.nextTrackId);
      } else {
        currentTrack = undefined;
      }
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
