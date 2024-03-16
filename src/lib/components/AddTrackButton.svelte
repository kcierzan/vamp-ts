<script lang="ts">
  import { getProjectContext } from "$lib/utils";

  const project = getProjectContext();
</script>

<button class="add-track" on:click={() => project?.addTrack()}>
  <span class="self-center">Add track</span>
</button>

<style lang="postcss">
  .add-track {
    @apply flex h-8 w-36 justify-center rounded bg-green-500 p-1 text-lg text-white hover:bg-green-700;
  }
</style>
