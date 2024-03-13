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
  import Project from "$lib/models/project.svelte";
  import PhaseVocoderUrl from "$lib/models/sampler/phase-vocoder?worker&url";
  import type { ProjectData } from "$lib/types";
  import type { SupabaseClient } from "@supabase/supabase-js";
  import { onMount, setContext } from "svelte";
  import { getContext } from "tone";

  interface ProjectProps {
    projectData: ProjectData;
    supabase: SupabaseClient;
  }

  const { projectData, supabase }: ProjectProps = $props();
  const sessionEmpty = $derived(projectData.tracks.length === 0);
  let project: Project | null = $state(null);

  function configureAudioContext() {
    const context = getContext();
    context.lookAhead = 0.05;
    context.addAudioWorkletModule(PhaseVocoderUrl);
  }

  const getProject = () => project;
  setContext("project", { project: getProject(), supabase });

  onMount(async () => {
    configureAudioContext();
    project = await Project.new(supabase, projectData);
  });
</script>

<div class="flex flex-col items-center">
  <h1 class="bold text-4xl underline">{project?.name ?? ""}</h1>
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
