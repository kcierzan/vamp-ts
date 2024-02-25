<svelte:options immutable />

<script lang="ts">
  import { onMount, setContext } from "svelte";
  import type { PageData } from "../../routes/project/[projectId]/$types";
  import type { ProjectContext } from "../types";
  import Editor from "./Editor.svelte";
  import MediaBay from "./MediaBay.svelte";
  import Scenes from "./Scenes.svelte";
  import SongNav from "./SongNav.svelte";
  import TrackArea from "./TrackArea.svelte";

  export let data: PageData;

  const { project } = data;

  const sessionEmpty = project.tracks.length === 0;

  onMount(async () => {
    const { initialize } = await import("../initialization");
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

<SongNav {project} />

<div class="flex w-full flex-row items-center justify-center gap-1">
  <div class="flex h-5/6 w-10/12 flex-col justify-between">
    <div class="flex flex-row gap-x-2">
      <Scenes />
      <TrackArea {project} />
      <MediaBay />
    </div>
    <Editor />
  </div>
</div>
