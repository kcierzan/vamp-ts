import { get } from "svelte/store";
import { Transport } from "tone";

import type { SupabaseClient } from "@supabase/supabase-js";
import random from "lodash/random";
import instruments from "../instruments";
import { clipStore, trackDataStore, trackPlaybackStore } from "../stores";
import { type AudioFile, type Clip, type TrackData } from "../types";

async function newTrack(supabase: SupabaseClient, track: TrackData) {
  trackPlaybackStore.initializeTrackPlaybackState(track);
  instruments.createSamplers(supabase, ...track.audio_clips);
  clipStore.initializeClipStates(...track.audio_clips);
  trackDataStore.createTrack(track);
}

async function createFromAudioFile(
  supabase: SupabaseClient,
  projectId: number,
  audioFile: AudioFile
) {
  const { data, error } = await supabase.rpc("insert_track_from_pool_file", {
    p_audio_file_id: audioFile.id,
    p_project_id: projectId,
    p_clip_name: audioFile.name,
    p_playback_rate: audioFile.bpm ? Transport.bpm.value / audioFile.bpm : 1.0
  });

  if (error) throw new Error(error.message);
  console.log(JSON.stringify(data));

  const trackWithClipAttrs = {
    id: data.id,
    name: data.name,
    gain: data.gain,
    panning: data.panning,
    project_id: data.project_id,
    audio_clips: data.audio_clips.map((clip: Clip) => {
      return { ...clip, audio_files: audioFile };
    })
  };

  newTrack(supabase, trackWithClipAttrs);
}

function createEmpty(supabase: SupabaseClient, projectId: number): void {
  const track: TrackData = {
    id: random(Number.MAX_SAFE_INTEGER), // get ID from actual persistence
    name: "new track",
    gain: 0.0,
    panning: 0.0,
    audio_clips: [],
    project_id: projectId
  };
  newTrack(supabase, track);
}

function createFromClip(supabase: SupabaseClient, projectId: number, clip: Clip) {
  const trackCount = get(trackDataStore).length;
  const trackWithClipAttrs = {
    id: random(Number.MAX_SAFE_INTEGER),
    project_id: projectId,
    name: `Track ${trackCount + 1}`,
    gain: 0.0,
    panning: 0.0,
    audio_clips: [clip]
  };
  newTrack(supabase, trackWithClipAttrs);
}

function remove(trackId: number) {
  trackPlaybackStore.stopCurrentlyPlayingAudio(trackId, undefined);
  trackPlaybackStore.cancelPlayingEvent(trackId);
  trackPlaybackStore.cancelQueuedEvent(trackId);
  trackDataStore.removeTrack(trackId);
}
export default {
  createFromAudioFile,
  createFromClip,
  createEmpty,
  remove
};
