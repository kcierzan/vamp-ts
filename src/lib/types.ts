import type { SupabaseClient } from "@supabase/supabase-js";
import type { Transport } from "tone";
import type AudioClipData from "./models/audio-clip-data.svelte";
import type AudioFileData from "./models/audio-file-data.svelte";
import type AudioFile from "./models/audio-file.svelte";

export type TrackID = number;
export type AudioClipID = number;
export type AudioFileID = number;
export type ProjectID = number;
export type UserID = string;

export type ClipQueuedEvent = number;
export type ClipPlaybackEvent = number;

export interface ProjectData {
  readonly id: ProjectID;
  name: string;
  description: string | null;
  time_signature: string;
  bpm: number;
  readonly created_by_user_id: UserID;
  tracks: TrackData[];
  audio_files: AudioFileData[];
}

export interface TrackData {
  readonly id: TrackID;
  gain: number;
  name: string;
  panning: number;
  readonly project_id: number;
  audio_clips: AudioClipData[];
  next_track_id: TrackID | null;
  previous_track_id: TrackID | null;
}

// export interface AudioClipData {
//   readonly id: AudioClipID;
//   name: string;
//   index: number;
//   start_time: number;
//   end_time: number | null;
//   track_id: TrackID;
//   audio_files: AudioFileData;
//   audio_file_id: AudioFileID;
//   playback_rate: number;
// }

export interface ProjectContext {
  project: ProjectData;
  supabase: SupabaseClient;
}

export interface Clip {
  id: number;
  track_id: number;
  name: string;
  playback_rate: number;
  index: number;
  state: PlayState;
  type: string;
  audio_files: AudioFile;
  start_time: number;
  end_time: number | null;
  isDndShadowItem?: boolean;
}

export enum PlayState {
  Playing = "PLAYING",
  Stopped = "STOPPED",
  Queued = "QUEUED",
  Paused = "PAUSED"
}

export type Playing = "PLAYING";
export type Stopped = "STOPPED";
export type Queued = "QUEUED";
export type Paused = "PAUSED";

export type PlaybackState = Playing | Stopped | Queued | Paused;

export interface TransportStore {
  transport: typeof Transport;
  state: PlayState;
  bpm: number;
  barsBeatsSixteenths: string;
  seconds: string;
  bbsUpdateEvent: number | null;
  secondsUpdateEvent: number | null;
}

export interface SceneStates {
  [key: string]: PlayState;
}

export interface SceneStore {
  states: SceneStates;
  scenes: Scenes;
}

export enum QuantizationInterval {
  None = "+0.01",
  EightBars = "@8m",
  FourBars = "@4m",
  TwoBars = "@2m",
  OneBar = "@1m",
  HalfNote = "@2n",
  QuarterNote = "@4n",
  EigthNote = "@8n",
  SixteenthNote = "@16n"
}

export interface Scenes {
  [key: string]: Clip[];
}

export type HTMLInputEvent = Event & {
  currentTarget: EventTarget & HTMLInputElement;
};

interface PlaceHolderDndItem {
  id: string;
}

export type DndItem = PlaceHolderDndItem | AudioFile | Clip;

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
