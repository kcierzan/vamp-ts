import type { Time } from "tone/build/esm/core/type/Units";

import type { Clip, TrackData } from "../types";
import Sampler from "./sampler/sampler";

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

async function createSampler(clip: Clip): Promise<Sampler> {
  if (!clip.audio_files.file)
    throw new Error("Cannot create sampler for clip: missing audio file record on clip");

  const audioUrl = URL.createObjectURL(clip.audio_files.file);
  const sampler = new Sampler(audioUrl, clip.audio_files.bpm);
  sampler.speedFactor = clip.playback_rate;
  return sampler;
}

async function initialize(tracks: TrackData[]) {
  for (const track of tracks) {
    for (const clip of track.audio_clips) {
      instruments[clip.id] = {
        sampler: await createSampler(clip),
        startTime: clip.start_time,
        endTime: clip.end_time
      };
    }
  }
}

// TODO: make this singular
async function createSamplers(...clips: Clip[]) {
  for (const clip of clips) {
    instruments[clip.id] = {
      sampler: await createSampler(clip),
      startTime: clip.start_time,
      endTime: clip.end_time
    };
  }
}

// TODO: make this singular
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
