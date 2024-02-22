<script lang="ts">
  import Pool from "./Pool.svelte";
  import Dropzone from "svelte-file-dropzone";
  import { audioFiles } from "../messages";

  export let songId: string;

  function onDrop(e: CustomEvent<any>) {
    const { acceptedFiles } = e.detail;
    audioFiles.createPoolFile(acceptedFiles[0], songId);
  }
</script>

<div class="flex w-1/4 flex-col justify-between gap-y-2">
  <Pool />
  <Dropzone on:drop={onDrop} accept="audio/*" />
</div>
