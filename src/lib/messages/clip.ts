import { Transport } from "tone";

import type { SupabaseClient } from "@supabase/supabase-js";
import omit from "lodash/omit";
import random from "lodash/random";
import instruments from "../instruments";
import { clipStore, trackDataStore } from "../stores";
import { PlayState, type AudioFile, type Clip, type TrackData } from "../types";

async function createFromPool(
  supabase: SupabaseClient,
  audio: AudioFile,
  trackId: number,
  index: number
) {
  const localClipProperties = ["id", "type", "state", "playback_rate", "audio_files"];
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
  const clipToPersist: Partial<Clip> = omit(
    { ...clip, audio_file_id: audio.id },
    localClipProperties
  );
  instruments.createSamplers(clip);
  clipStore.initializeClipStates(clip);
  trackDataStore.createClips(clip);
  const { error } = await supabase.from("audio_clips").insert(clipToPersist);

  if (error) throw new Error(error.message);
}

function stretchClipsToBpm(supabase: SupabaseClient, tracks: TrackData[], bpm: number) {
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
  updateClips(supabase, ...clipsToStretch);
}

async function updateClips(supabase: SupabaseClient, ...clips: Clip[]): Promise<void> {
  instruments.updateSamplers(...clips);
  // TODO: there is a bug in createClips
  // trackDataStore.createClips(...clips);
  const promises = clips.map((clip) => {
    if (!clip?.id) throw new Error("Clip missing ID");
    return supabase
      .from("audio_clips")
      .update(omit(clip, ["id", "audio_files"]))
      .eq("id", clip.id);
  });
  const results = await Promise.allSettled(promises);
  results.forEach((result) => {
    if (result.status === "fulfilled" && result.value.error) {
      throw new Error(result.value.error.message);
    }
  });
}

export default {
  createFromPool,
  updateClips,
  stretchClipsToBpm
};
