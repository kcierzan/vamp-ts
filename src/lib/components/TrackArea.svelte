<script lang="ts">
  import ClipProgressIcon from "./ClipProgressIcon.svelte";
  import NewTrackDndZone from "./NewTrackDndZone.svelte";
  import Track from "./Track.svelte";
  import { getProjectContext } from "$lib/utils";

  const project = getProjectContext();
</script>

<div class="flex w-3/4 flex-row-reverse overflow-scroll rounded border-2 border-slate-200 p-2">
  <NewTrackDndZone />
  {#if project}
    <div class="flex flex-row">
      {#each project.tracks as track (track.id)}
        <div class="flex flex-col">
          <Track {track} />
          <div class="my-2">
            <ClipProgressIcon {track} />
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
