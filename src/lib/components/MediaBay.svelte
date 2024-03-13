<script lang="ts">
  import type { ProjectContext } from "$lib/types";
  import { getContext } from "svelte";
  import Dropzone from "svelte-file-dropzone";
  import Pool from "./Pool.svelte";

  const { project } = getContext<ProjectContext>("project");

  async function onDrop(e: CustomEvent) {
    const { acceptedFiles } = e.detail;
    const file: File = acceptedFiles[0];
    if (!file) throw new Error("invalid file")

    await project.uploadFileToPool(file)
  }
</script>

<div class="flex w-1/4 flex-col justify-between gap-y-2">
  <Pool />
  <Dropzone on:drop={onDrop} accept="audio/*" />
</div>
