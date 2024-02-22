import type { Transport } from "tone";

export interface Project {
  readonly id: number;
  title: string;
  description: string | null;
  time_signature: string;
  bpm: number;
}

export interface Song {
  readonly id: string;
  title: string;
  description: string;
  time_signature: string;
  bpm: number;
  tracks: TrackData[];
  audio_files: AudioFile[];
}

export interface TrackData {
  readonly id: TrackID;
  gain: number;
  panning: number;
  name: string;
  audio_clips: Clip[];
}

export interface Clip {
  readonly id: ClipID;
  readonly track_id: TrackID;
  name: string;
  playback_rate: number;
  index: number;
  state: PlayState;
  type: string;
  audio_file: AudioFile | null;
  start_time: number;
  end_time: number | null;
  isDndShadowItem?: boolean;
}

export interface StaticFile {
  file_name: string;
  url: string;
}

export interface AudioFile {
  readonly id: string;
  bpm: number;
  name: string;
  description: string;
  file: StaticFile;
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

export enum ChannelPrefix {
  Data = "song_data:",
  Playback = "song_playback:",
  User = "song_user:",
  Files = "song_files:",
  Latency = "latency_tracking:"
}

export enum LatencyMessage {
  Ping = "ping",
  ReportLatency = "report_latency",
  StopTrack = "stop_track",
  ClearLatency = "clear_latency",
  GetLatency = "get_latency"
}

export enum SongDataMessage {
  NewClip = "new_clip",
  UpdateClips = "update_clips",
  NewTrack = "new_track",
  NewTrackFromClip = "new_track_from_clip",
  RemoveTrack = "remove_track",
  NewPoolFile = "new_pool_file"
}

export enum SongPlaybackMessage {
  PlayClip = "play_clip",
  StopTrack = "stop_track",
  StartTransport = "start_transport",
  StopTransport = "stop_transport"
}

export type Message = LatencyMessage | SongDataMessage | SongPlaybackMessage;

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

export type ClipID = string;

export type TrackID = string;

export interface User {
  readonly id: number;
  email: string;
  display_name: string;
  confirmed_at: string;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Listener = [Message, (response?: any) => void];
