import type { Time } from "tone/build/esm/core/type/Units";

import type { SupabaseClient } from "@supabase/supabase-js";
import Sampler from "./sampler/sampler";
import type { Clip, TrackData } from "./types";
import { downloadAudioFiles } from "./utils";

interface SamplerState {
  sampler: Sampler | null;
  startTime: number;
  endTime: number | null;
}

interface Instruments {
  [key: number]: SamplerState;
}

const instruments: Instruments = {};

function stop(clip: Clip, time?: Time) {
  instruments[clip.id].sampler?.stop(time);
}

function play(clip: Clip, startTime: Time) {
  const sampler = instruments[clip.id]?.sampler;

  if (sampler) {
    const startOffset = instruments[clip.id].startTime;
    const endTime = instruments[clip.id].endTime;
    const stopTime = endTime ? endTime - startOffset : sampler.duration;

    instruments[clip.id].sampler
      ?.start(startTime, startOffset)
      .stop(`+${stopTime / sampler.speedFactor}`);
  }
}

function setPlaybackRate(clip: Clip, playbackRate: number) {
  if (instruments[clip.id].sampler) {
    instruments[clip.id].sampler!.speedFactor = playbackRate;
  }
}

async function createSampler(supabase: SupabaseClient, clip: Clip): Promise<Sampler> {
  console.log(`clip in create sampler: ${JSON.stringify(clip)}`);
  if (!clip.audio_files)
    throw new Error("Cannot create sampler for clip: missing audio file record on clip");

  const downloadedAudioFiles = await downloadAudioFiles(supabase, clip.audio_files);

  if (downloadedAudioFiles[0]?.file === undefined)
    throw new Error(`File download failed for instrument: ${clip.audio_files}`);

  const audioUrl = URL.createObjectURL(downloadedAudioFiles[0].file);
  const sampler = new Sampler(audioUrl, clip.audio_files.bpm);
  sampler.speedFactor = clip.playback_rate;
  return sampler;
}

async function initialize(supabase: SupabaseClient, tracks: TrackData[]) {
  for (const track of tracks) {
    for (const clip of track.audio_clips) {
      instruments[clip.id] = {
        sampler: await createSampler(supabase, clip),
        startTime: clip.start_time,
        endTime: clip.end_time
      };
    }
  }
}

async function createSamplers(supabase: SupabaseClient, ...clips: Clip[]) {
  for (const clip of clips) {
    instruments[clip.id] = {
      sampler: await createSampler(supabase, clip),
      startTime: clip.start_time,
      endTime: clip.end_time
    };
  }
}

function updateSamplers(...clips: Clip[]) {
  for (const clip of clips) {
    if (instruments[clip.id].sampler) {
      instruments[clip.id].sampler!.speedFactor = clip.playback_rate;
      instruments[clip.id].startTime = clip.start_time;
      instruments[clip.id].endTime = clip.end_time;
    }
  }
}

function getClipDuration(clipId: number) {
  const sampler = instruments[clipId].sampler;
  if (!sampler) throw new Error(`Sampler for clipId ${clipId} not found`);

  return sampler.duration;
}

export default {
  play,
  stop,
  setPlaybackRate,
  initialize,
  createSamplers,
  updateSamplers,
  getClipDuration
};
