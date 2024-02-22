<svelte:options immutable />

<script lang="ts">
  import type { AudioFile } from "../types";

  export let audioFile: AudioFile;
</script>

<div>
  <div class="flex flex-row text-base w-36 h-8 px-1 bg-green-400 text-white rounded">
    <span class="hero-musical-note self-center ml-1 h-4 w-6" />
    <span class="text-left self-center w-10">{audioFile.file?.file_name}</span>
  </div>
</div>
