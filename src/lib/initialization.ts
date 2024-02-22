import { get } from "svelte/store";
import { getContext } from "tone";

import instruments from "./instruments";
import { clips, latency } from "./messages";
import { clipStore, poolStore, trackDataStore, trackPlaybackStore, transportStore } from "./stores";
import type { Song } from "./types";

const trackInitializedStores = [trackDataStore, trackPlaybackStore, clipStore, instruments];

function initializeStores(song: Song) {
  trackInitializedStores.forEach((store) => store.initialize(song.tracks));
  transportStore.initialize(song.bpm);
  poolStore.initialize(song.audio_files);
}

async function configureAudioContext() {
  const context = getContext();
  context.lookAhead = 0.05;
  await context.addAudioWorkletModule("/assets/phase-vocoder.js");
}

export async function initialize(song: Song) {
  await configureAudioContext();
  initializeStores(song);
  clips.stretchClipsToBpm(get(trackDataStore), song.bpm);
  latency.calculateLatency();
}
