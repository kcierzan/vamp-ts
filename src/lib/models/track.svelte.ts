import type { ProjectID, TrackData, TrackID } from "$lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Draw, Transport } from "tone";
import type { Time } from "tone/build/esm/core/type/Units";
import AudioClip from "./audio-clip.svelte";
import AudioFile from "./audio-file.svelte";

const TRACK_TABLE_NAME = "tracks";
const INSERT_TRACK_FROM_AUDIO_FILE_FUNCTION = "insert_track_from_pool_file";
const INSERT_TRACK_FROM_AUDIO_CLIP_FUNCTION = "insert_track_from_audio_clip";

export default class Track {
  public readonly id: TrackID;
  private _gain: number = $state(0);
  private _name: string = $state("");
  private _panning: number;
  public readonly projectId;
  private _nextTrackId: TrackID | null = $state(null);
  private _previousTrackId: TrackID | null = $state(null);
  private _audioClips: AudioClip[] = $state([]);
  private queuedEvent: number | null = null;
  private playingEvent: number | null = null;
  private queued: AudioClip | null = null;
  private _playing: AudioClip | null = null;

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
    return TRACK_TABLE_NAME;
  }

  get clips() {
    return this._audioClips;
  }

  get name() {
    return this._name;
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

  get playing() {
    return this._playing;
  }

  playClip(clip: AudioClip, time: Time) {
    const playEvent = clip.scheduleLoop(time);
    this.setClipEnqueued(clip);
    const queuedEvent = Transport.scheduleOnce((atTime) => {
      this._playing?.stopAudio(time);
      Draw.schedule(() => {
        this.cancelPlayingEvent();
        this.setClipPlaying(clip);
        this.playingEvent = playEvent;
      }, atTime);
    }, time);
    this.queued = clip;
    this.queuedEvent = queuedEvent;
  }

  stop(time: Time) {
    if (this.playingEvent !== null) {
      Transport.clear(this.playingEvent);
    }
    Transport.scheduleOnce((acTime) => {
      this._playing?.stopAudio(acTime);
      Draw.schedule(() => {
        if (this._playing) {
          this._playing.state = "STOPPED";
        }
        this._playing = null;
        this.playingEvent = null;
      }, acTime);
    }, time);
  }

  addClip(clip: AudioClip) {
    this._audioClips.push(clip);
  }

  removeClip(clipToRemove: AudioClip) {
    clipToRemove.state = "STOPPED";
    clipToRemove.stopAudio("+0.001");
    if (this._playing === clipToRemove) {
      this.cancelPlayingEvent();
    } else if (this.queued === clipToRemove) {
      this.cancelQueuedEvent();
    }
    this._audioClips = this._audioClips.filter((clip) => clip !== clipToRemove);
  }

  private cancelPlayingEvent() {
    if (this.playingEvent !== null) {
      Transport.clear(this.playingEvent);
    }
    this.playingEvent = null;
  }

  private setClipPlaying(clip: AudioClip) {
    clip.state = "PLAYING";
    if (this._playing && this._playing.id !== clip.id) {
      this._playing.state = "STOPPED";
    }
    this._playing = clip;
    if (this.queued === clip) {
      this.queued = null;
    }
  }

  private setClipEnqueued(clip: AudioClip) {
    clip.state = "QUEUED";
    this.cancelQueuedEvent();
    if (this.queued) {
      this.queued.state = "STOPPED";
    }
  }

  private cancelQueuedEvent() {
    if (this.queuedEvent !== null) {
      Transport.clear(this.queuedEvent);
    }
    this.queuedEvent = null;
  }
}
