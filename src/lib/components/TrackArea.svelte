<script lang="ts">
  import ClipProgressIcon from "./ClipProgressIcon.svelte";
  import NewTrackDndZone from "./NewTrackDndZone.svelte";
  import TrackComponent from "./Track.svelte";
  import { getContext } from "svelte";
  import type { ProjectContext } from "$lib/types";

  const { project } = getContext<ProjectContext>("project");
</script>

<div class="flex w-3/4 flex-row-reverse overflow-scroll rounded border-2 border-slate-200 p-2">
  <NewTrackDndZone />
  <div class="flex flex-row">
    {#each project.tracks as track (track.id)}
      <div class="flex flex-col">
        <TrackComponent {track} />
        <div class="my-2">
          <ClipProgressIcon {track} />
        </div>
      </div>
    {/each}
  </div>
</div>
