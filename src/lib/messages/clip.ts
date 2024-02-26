import { Transport } from "tone";

import type { SupabaseClient } from "@supabase/supabase-js";
import random from "lodash/random";
import instruments from "../instruments";
import { clipStore, trackDataStore } from "../stores";
import { PlayState, type AudioFile, type Clip, type TrackData } from "../types";

function createFromPool(
  supabase: SupabaseClient,
  audio: AudioFile,
  trackId: number,
  index: number
) {
  const clip: Clip = {
    id: random(Number.MAX_SAFE_INTEGER),
    name: audio.name,
    type: audio.media_type,
    index: index,
    track_id: trackId,
    playback_rate: Transport.bpm.value / audio.bpm,
    state: PlayState.Stopped,
    audio_files: audio,
    start_time: 0,
    end_time: null
  };
  instruments.createSamplers(supabase, clip);
  clipStore.initializeClipStates(clip);
  trackDataStore.createClips(clip);
}

function stretchClipsToBpm(tracks: TrackData[], bpm: number) {
  const clipsToStretch: Clip[] = [];
  for (const track of tracks) {
    for (const clip of track.audio_clips) {
      if (clip.audio_files) {
        const rate = bpm / clip.audio_files.bpm;
        // optimistically change rate locally first
        instruments.setPlaybackRate(clip, rate);
        clipsToStretch.push({ ...clip, playback_rate: rate });
      }
    }
  }
  updateClips(...clipsToStretch);
}

function updateClips(...clips: Clip[]): void {
  instruments.updateSamplers(...clips);
  trackDataStore.createClips(...clips);
}

export default {
  createFromPool,
  updateClips,
  stretchClipsToBpm
};
