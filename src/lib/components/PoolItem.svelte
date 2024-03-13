<script lang="ts">
  import type AudioFile from "$lib/models/audio-file.svelte";

  export let audioFile: AudioFile;
</script>

<div>
  <div
    class="flex flex-row items-center justify-center w-36 h-8 px-1 bg-green-400 text-white rounded"
  >
    <span class="text-left text-sm truncate align-baseline">{audioFile.fileName}</span>
  </div>
</div>
