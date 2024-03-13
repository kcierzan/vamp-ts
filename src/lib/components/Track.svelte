<script lang="ts">
  import ClipSlot from "./ClipSlot.svelte";
  import type Track from "$lib/models/track.svelte";

  interface TrackProps {
    track: Track;
  }

  const { track } = $props<TrackProps>();

  const NUMBER_OF_ROWS = 16;
  const slots = Array.from({ length: NUMBER_OF_ROWS }, (_, i) => ({
    id: i * NUMBER_OF_ROWS
  }));
</script>

<div class="flex flex-col gap-1 w-30">
  <div>{track.name}</div>
  {#each slots as slot, index (slot.id)}
    <ClipSlot clip={track.clips[index] ? track.clips[index] : null} {track} {index} />
  {/each}
</div>
