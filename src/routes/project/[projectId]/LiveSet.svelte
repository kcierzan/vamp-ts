<script lang="ts">
  import AddTrackButton from "$lib/components/AddTrackButton.svelte";
  import Editor from "$lib/components/Editor.svelte";
  import MediaBay from "$lib/components/MediaBay.svelte";
  import Metronome from "$lib/components/Metronome.svelte";
  import Quantization from "$lib/components/Quantization.svelte";
  import Scenes from "$lib/components/Scenes.svelte";
  import Tempo from "$lib/components/Tempo.svelte";
  import TrackArea from "$lib/components/TrackArea.svelte";
  import Transport from "$lib/components/Transport.svelte";
  import instruments from "$lib/models/instruments";
  import { clips } from "$lib/messages";
  import PhaseVocoderUrl from "$lib/models/sampler/phase-vocoder?worker&url";
  import {
    clipStates,
    poolStore,
    trackDataStore,
    trackPlaybackStore,
    transportStore
  } from "$lib/stores";
  import type { Project, ProjectContext, TrackData } from "$lib/types";
  import { downloadAudioFile } from "$lib/utils";
  import type { SupabaseClient } from "@supabase/supabase-js";
  import { onMount, setContext } from "svelte";
  import { getContext } from "tone";

  const { project, supabase }: { project: Project; supabase: SupabaseClient } = $props();

  const sessionEmpty = $derived(project.tracks.length === 0);

  // onMount(async () => {
  const trackInitializedStores = [trackDataStore, trackPlaybackStore];

  async function configureAudioContext() {
    const context = getContext();
    context.lookAhead = 0.05;
    await context.addAudioWorkletModule(PhaseVocoderUrl);
  }

  async function downloadAudioFiles(supabase: SupabaseClient, tracks: TrackData[]) {
    for (const track of tracks) {
      for (const clip of track.audio_clips) {
        const file = await downloadAudioFile(supabase, clip.audio_files);
        if (!poolStore.audioFiles.find((af) => af.id === clip.audio_files.id)?.file) {
          poolStore.updatePoolFile(clip.audio_files.id, file);
        }
        trackDataStore.attachDownloaded(clip, file);
      }
    }
  }

  poolStore.initialize(project.audio_files);
  trackInitializedStores.forEach((store) => store.initialize(project.tracks));
  clipStates.initialize(...project.tracks);
  transportStore.initialize(project.bpm);

  onMount(async () => {
    await configureAudioContext();
    await downloadAudioFiles(supabase, project.tracks);
    await instruments.initialize(supabase, project.tracks);
    clips.stretchClipsToBpm(supabase, project.tracks, project.bpm);
  });

  const projectContext: ProjectContext = {
    project,
    supabase
  };

  setContext("project", projectContext);
</script>

<div class="flex flex-col items-center">
  <h1 class="bold text-4xl underline">{project.name}</h1>
  <h2 class="text-2xl" class:invisible={!sessionEmpty}>
    Why don't you start by adding some tracks?
  </h2>
</div>

<div class="my-4 flex flex-row items-center justify-center space-x-4">
  <AddTrackButton />
  <Transport />
  <Tempo />
  <Quantization />
  <Metronome />
</div>

<div class="flex w-full flex-row items-center justify-center gap-1">
  <div class="flex h-5/6 w-10/12 flex-col justify-between">
    <div class="flex flex-row gap-x-2">
      <Scenes />
      <TrackArea />
      <MediaBay />
    </div>
    <Editor />
  </div>
</div>
