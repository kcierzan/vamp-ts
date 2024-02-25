<svelte:options immutable />

<script lang="ts">
  import type { AudioFile } from "../types";

  export let audioFile: AudioFile;
</script>

<div>
  <div class="flex flex-row text-base w-36 h-8 px-1 bg-green-400 text-white rounded">
    <span class="text-left self-center w-10">{audioFile.name}</span>
  </div>
</div>
