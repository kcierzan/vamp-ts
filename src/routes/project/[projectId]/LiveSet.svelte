<svelte:options immutable />

<script lang="ts">
  import { onMount, setContext } from "svelte";
  import type { PageData } from "./$types";
  import type { ProjectContext } from "$lib/types";
  import Editor from "$lib/components/Editor.svelte";
  import MediaBay from "$lib/components/MediaBay.svelte";
  import Scenes from "$lib/components/Scenes.svelte";
  import SongNav from "$lib/components/SongNav.svelte";
  import TrackArea from "$lib/components/TrackArea.svelte";

  export let data: PageData;

  const { project } = data;

  const sessionEmpty = project.tracks.length === 0;

  onMount(async () => {
    const { initialize } = await import("$lib/initialization");
    await initialize(project);
  });

  const projectContext: ProjectContext = {
    project,
    supabase: data.supabase
  };

  setContext("project", projectContext);
</script>

<div class="flex flex-col items-center">
  <h1 class="bold text-4xl underline">{project.name}</h1>
  <h2 class="text-2xl" class:invisible={!sessionEmpty}>
    Why don't you start by adding some tracks?
  </h2>
</div>

<SongNav />

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
