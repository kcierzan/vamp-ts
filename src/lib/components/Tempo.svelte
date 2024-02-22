<script lang="ts">
  import { onMount } from "svelte";
  import { clips } from "../messages";
  import { trackDataStore, transportStore } from "../stores";
  import type { HTMLInputEvent } from "../types";

  function setTransportBpm(e: HTMLInputEvent) {
    const bpm = parseInt(e.currentTarget.value);
    // TODO: make this e2e reactive
    setTempoAndStretchClips(bpm);
  }

  function setTempoAndStretchClips(bpm: number) {
    transportStore.setBpm(bpm);
    clips.stretchClipsToBpm($trackDataStore, bpm);
  }

  onMount(async () => setTempoAndStretchClips(120));
</script>

<div class="flex flex-col items-center">
  <input
    class="h-8 w-24 rounded border-2 text-lg"
    id="tempo"
    value={$transportStore.bpm}
    type="number"
    min="40"
    max="250"
    step="1"
    on:change={setTransportBpm}
  />
</div>
