<script lang="ts">
  import { quintIn, quintOut } from "svelte/easing";
  import { slide } from "svelte/transition";
  import ClipProperties from "./ClipProperties.svelte";
  import ClipWaveform from "./ClipWaveform.svelte";
  import { getContext } from "svelte";
  import type { ProjectContext } from "$lib/types";

  // eslint-disable-next-line no-undef
  const { project } = getContext<ProjectContext>("project");

  function closeEditor() {
    project.selection.clip = null;
    project.selection.track = null;
  }
</script>

{#if project.selection.clip}
  <section
    in:slide={{ axis: "y", duration: 250, easing: quintIn }}
    out:slide={{ axis: "y", duration: 300, easing: quintOut }}
    class="mt-2 flex-col gap-y-2 rounded border-2 border-slate-200 p-4"
  >
    <div class="flex flex-row items-center justify-between">
      <div class="font-bold">{project.selection.clip?.name ?? "No clip selected"}</div>
      <button
        class="h-8 w-16 rounded bg-red-500 font-semibold text-white hover:bg-red-700"
        on:click={closeEditor}>close</button
      >
    </div>
    <ClipWaveform clip={project.selection.clip} />
    <ClipProperties />
  </section>
{/if}
