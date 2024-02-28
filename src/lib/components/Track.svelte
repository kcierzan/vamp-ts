<svelte:options immutable />

<script lang="ts">
  import { afterUpdate } from "svelte";
  import type { TrackData } from "../types";
  import { flash } from "../utils";
  import ClipSlot from "./ClipSlot.svelte";

  export let track: TrackData;
  const NUMBER_OF_ROWS = 16;
  const slots = Array.from({ length: NUMBER_OF_ROWS }, (_, i) => ({
    id: i * NUMBER_OF_ROWS
  }));

  let element: HTMLElement;
  afterUpdate(() => flash(element));
</script>

<div class="flex flex-col gap-1 w-30" bind:this={element}>
  <div>{track.name}</div>
  {#each slots as slot, i (slot.id)}
    <ClipSlot index={i} {track} />
  {/each}
</div>
