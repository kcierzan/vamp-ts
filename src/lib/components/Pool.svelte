<script lang="ts">
  import { dndzone } from "svelte-dnd-action";
  import { poolStore } from "../stores";
  import type { AudioFile } from "../types";
  import PoolItem from "./PoolItem.svelte";

  let items = $state(poolStore.audioFiles);

  // eslint-disable-next-line no-undef
  function handleDndConsider(e: CustomEvent<DndEvent<AudioFile>>) {
    items = e.detail.items;
  }

  // eslint-disable-next-line no-undef
  function handleDndFinalize(e: CustomEvent<DndEvent<AudioFile>>) {
    if (e.detail.items.length < poolStore.audioFiles.length) {
      items = poolStore.audioFiles;
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
