import type { SupabaseClient } from "@supabase/supabase-js";
import type AudioClip from "./models/audio-clip.svelte";
import type AudioFile from "./models/audio-file.svelte";
import type Project from "./models/project.svelte";

export type TrackID = number;
export type AudioClipID = number;
export type AudioFileID = number;
export type ProjectID = number;
export type UserID = string;

export type ClipPlaybackEvent = number;

export interface ProjectData {
  readonly id: ProjectID;
  readonly name: string;
  readonly description: string | null;
  readonly time_signature: string;
  readonly bpm: number;
  readonly created_by_user_id: UserID;
  readonly tracks: TrackData[];
  readonly audio_files: AudioFileData[];
}

export interface TrackData {
  readonly id: TrackID;
  readonly gain: number;
  readonly name: string;
  readonly panning: number;
  readonly project_id: number;
  readonly audio_clips: AudioClipData[];
  readonly next_track_id: TrackID | null;
  readonly previous_track_id: TrackID | null;
}

export interface AudioClipData {
  readonly id: AudioClipID;
  readonly name: string;
  readonly index: number;
  readonly start_time: number;
  readonly end_time: number | null;
  readonly track_id: TrackID;
  readonly audio_files: AudioFileData;
  readonly audio_file_id: AudioFileID;
  readonly playback_rate: number;
}

export interface AudioFileData {
  readonly id: AudioFileID;
  readonly bpm: number;
  readonly size: number;
  readonly path: string;
  readonly bucket: string;
  readonly mime_type: string;
  readonly description: string | null;
}

export interface ProjectContext {
  readonly project: Project;
  readonly supabase: SupabaseClient;
}

export type Playing = "PLAYING";
export type Stopped = "STOPPED";
export type Queued = "QUEUED";
export type Paused = "PAUSED";

export type PlaybackState = Playing | Stopped | Queued | Paused;

export interface SceneStates {
  [key: string]: PlaybackState;
}

export interface SceneStore {
  states: SceneStates;
  scenes: Scenes;
}

type None = "+0.001";
type EightBars = "@8m";
type FourBars = "@4m";
type TwoBars = "@2m";
type OneBar = "@1m";
type HalfNote = "@2n";
type QuarterNote = "@4n";
type EigthNote = "@8n";
type SixteenthNote = "@16n";

export type QuantizationInterval =
  | None
  | EightBars
  | FourBars
  | TwoBars
  | OneBar
  | HalfNote
  | QuarterNote
  | EigthNote
  | SixteenthNote;

export interface Scenes {
  [key: string]: AudioClip[];
}

export type HTMLInputEvent = Event & {
  currentTarget: EventTarget & HTMLInputElement;
};

export interface PlaceHolderDndItem {
  id: string;
  isDndShadowItem: boolean;
}

export type DndItem = PlaceHolderDndItem | AudioFile | AudioClip;

export type AudioChannel = Float32Array;
export type Input = AudioChannel[];
export type Output = AudioChannel[];

export interface WorkletProcessorOptions {
  numberOfInputs: number;
  numberOfOutputs: number;
  processorOptions: {
    blockSize: number;
  };
}

export interface WorkletParameters {
  [key: string]: Float32Array;
}
