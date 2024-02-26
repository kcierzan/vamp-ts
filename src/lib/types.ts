import type { SupabaseClient } from "@supabase/supabase-js";
import type { Transport } from "tone";

export interface Project {
  readonly id: number;
  name: string;
  description: string | null;
  time_signature: string;
  bpm: number;
  tracks: TrackData[];
  audio_files: AudioFile[];
}

export interface ProjectContext {
  project: Project;
  supabase: SupabaseClient;
}

export interface TrackData {
  id: number;
  gain: number;
  panning: number;
  name: string;
  audio_clips: Clip[];
  project_id: number;
}

export interface Clip {
  id: number;
  track_id: number;
  name: string;
  playback_rate: number;
  index: number;
  state: PlayState;
  type: string;
  audio_files: AudioFile | null;
  start_time: number;
  end_time: number | null;
  isDndShadowItem?: boolean;
}

export interface AudioFile {
  id: number;
  bpm: number;
  // TODO: make this a method based on `path`?
  name: string;
  description: string;
  // TODO: make this an array
  path?: string;
  bucket?: string;
  file?: Blob;
  isDndShadowItem?: boolean;
  readonly size: number;
  readonly media_type: string;
}

export enum PlayState {
  Playing = "PLAYING",
  Stopped = "STOPPED",
  Queued = "QUEUED",
  Paused = "PAUSED"
}

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
