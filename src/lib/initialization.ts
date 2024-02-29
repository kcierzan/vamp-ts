import { getContext } from "tone";
import PhaseVocoderUrl from "./sampler/phase-vocoder?worker&url";

import type { SupabaseClient } from "@supabase/supabase-js";
import instruments from "./instruments";
import { clips } from "./messages";
import { clipStore, poolStore, trackDataStore, trackPlaybackStore, transportStore } from "./stores";
import type { Clip, Project } from "./types";
import { downloadAudioFile } from "./utils";

const trackInitializedStores = [trackDataStore, trackPlaybackStore, clipStore];

async function configureAudioContext() {
  const context = getContext();
  context.lookAhead = 0.05;
  await context.addAudioWorkletModule(PhaseVocoderUrl);
}

async function downloadAudioFiles(supabase: SupabaseClient, project: Project) {
  const audioClips = project.tracks.reduce((acc: Clip[], track) => {
    return [...acc, ...track.audio_clips];
  }, []);

  const promises = audioClips.map((clip) => downloadAudioFile(supabase, clip.audio_files));
  const results = await Promise.all(promises);

  for (const track of project.tracks) {
    for (const audioClip of track.audio_clips) {
      const resultIdx = results.findIndex((audioFile) => audioClip.audio_files.id === audioFile.id);
      const poolFileIdx = project.audio_files.findIndex((file) => file.id === audioClip.id);
      audioClip.audio_files = results[resultIdx];
      project.audio_files[poolFileIdx] = results[resultIdx];
    }
  }
}

export async function initialize(supabase: SupabaseClient, project: Project) {
  await configureAudioContext();
  await downloadAudioFiles(supabase, project);
  trackInitializedStores.forEach((store) => store.initialize(project.tracks));
  await instruments.initialize(supabase, project.tracks);
  transportStore.initialize(project.bpm);
  poolStore.initialize(project.audio_files);
  clips.stretchClipsToBpm(supabase, trackDataStore.tracks, project.bpm);
}
