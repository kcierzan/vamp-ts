<script lang="ts">
  import { quintIn, quintOut } from "svelte/easing";
  import { slide } from "svelte/transition";
  import instruments from "../models/instruments";
  import { selectedStore } from "../stores";
  import ClipProperties from "./ClipProperties.svelte";
  import ClipWaveform from "./ClipWaveform.svelte";

  $: clipDuration = $selectedStore.clip ? instruments.getClipDuration($selectedStore.clip.id) : 0;

  function closeEditor() {
    selectedStore.set({ clip: null, track: null });
  }
</script>

{#if !!$selectedStore.clip}
  <section
    in:slide={{ axis: "y", duration: 250, easing: quintIn }}
    out:slide={{ axis: "y", duration: 300, easing: quintOut }}
    class="mt-2 flex-col gap-y-2 rounded border-2 border-slate-200 p-4"
  >
    <div class="flex flex-row items-center justify-between">
      <div class="font-bold">{$selectedStore.clip.name}</div>
      <button
        class="h-8 w-16 rounded bg-red-500 font-semibold text-white hover:bg-red-700"
        on:click={closeEditor}>close</button
      >
    </div>
    <ClipWaveform clip={$selectedStore.clip} {clipDuration} />
    <ClipProperties />
  </section>
{/if}
