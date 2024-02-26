import { get } from "svelte/store";
import { getContext } from "tone";
import PhaseVocoderUrl from "./sampler/phase-vocoder?worker&url";

import type { SupabaseClient } from "@supabase/supabase-js";
import instruments from "./instruments";
import { clips } from "./messages";
import { clipStore, poolStore, trackDataStore, trackPlaybackStore, transportStore } from "./stores";
import type { Project } from "./types";

const trackInitializedStores = [trackDataStore, trackPlaybackStore, clipStore];

async function configureAudioContext() {
  const context = getContext();
  context.lookAhead = 0.05;
  await context.addAudioWorkletModule(PhaseVocoderUrl);
}

export async function initialize(supabase: SupabaseClient, project: Project) {
  await configureAudioContext();
  trackInitializedStores.forEach((store) => store.initialize(project.tracks));
  await instruments.initialize(supabase, project.tracks);
  transportStore.initialize(project.bpm);
  // TODO: make sure this is attached to the project
  poolStore.initialize(project.audio_files || []);
  clips.stretchClipsToBpm(get(trackDataStore), project.bpm);
}
