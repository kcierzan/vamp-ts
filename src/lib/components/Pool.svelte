<script lang="ts">
  import { dndzone } from "svelte-dnd-action";
  import PoolItem from "./PoolItem.svelte";
  import type AudioFile from "$lib/models/audio-file.svelte";
  import type Project from "$lib/models/project.svelte";

  let { project }: { project: Project } = $props();

  let items = $state(project.pool);

  // eslint-disable-next-line no-undef
  function handleDndConsider(e: CustomEvent<DndEvent<AudioFile>>) {
    items = e.detail.items;
  }

  // eslint-disable-next-line no-undef
  function handleDndFinalize(e: CustomEvent<DndEvent<AudioFile>>) {
    if (e.detail.items.length < project.pool.length) {
      items = project.pool;
    } else {
      items = e.detail.items;
    }
  }
</script>

<div class="flex h-2/3 w-full flex-col gap-1 rounded border-2 border-slate-200 p-2">
  <div>Audio Pool</div>
  <div
    class="flex flex-col gap-1"
    use:dndzone={{
      items,
      dropFromOthersDisabled: true,
      morphDisabled: true,
      flipDurationMs: 100
    }}
    on:consider={handleDndConsider}
    on:finalize={handleDndFinalize}
  >
    {#if items.length}
      {#each items as audioFile (audioFile.id)}
        <PoolItem {audioFile} />
      {/each}
    {:else}
      <div class="placeholder h-8 w-20" />
    {/if}
  </div>
</div>
