<script lang="ts">
  import { quintIn, quintOut } from "svelte/easing";
  import { slide } from "svelte/transition";
  import ClipProperties from "./ClipProperties.svelte";
  import ClipWaveform from "./ClipWaveform.svelte";
  import { getProjectContext } from "$lib/utils";

  const project = getProjectContext();

  function closeEditor() {
    if (project) {
      project.selection.clip = null;
    }
  }
</script>

{#if project?.selection.clip}
  <section
    in:slide={{ axis: "y", duration: 250, easing: quintIn }}
    out:slide={{ axis: "y", duration: 300, easing: quintOut }}
    class="mt-2 flex-col gap-y-2 rounded border-2 border-slate-200 p-4"
  >
    <div class="flex flex-row items-center justify-between">
      <div class="font-bold">{project?.selection.clip.name ?? "No clip selected"}</div>
      <button
        class="h-8 w-16 rounded bg-red-500 font-semibold text-white hover:bg-red-700"
        on:click={closeEditor}>close</button
      >
    </div>
    <ClipWaveform clip={project?.selection.clip} />
    <ClipProperties />
  </section>
{/if}
