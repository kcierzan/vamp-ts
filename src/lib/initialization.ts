import { get } from "svelte/store";
import { getContext } from "tone";

import instruments from "./instruments";
import { clips } from "./messages";
import { clipStore, poolStore, trackDataStore, trackPlaybackStore, transportStore } from "./stores";
import type { Project } from "./types";

const trackInitializedStores = [trackDataStore, trackPlaybackStore, clipStore, instruments];

function initializeStores(project: Project) {
  trackInitializedStores.forEach((store) => store.initialize(project.tracks));
  transportStore.initialize(project.bpm);
  poolStore.initialize(project.audio_files);
}

async function configureAudioContext() {
  const context = getContext();
  context.lookAhead = 0.05;
  await context.addAudioWorkletModule("./sampler/phase-vocoder.ts?url");
}

export async function initialize(project: Project) {
  await configureAudioContext();
  initializeStores(project);
  clips.stretchClipsToBpm(get(trackDataStore), project.bpm);
}
