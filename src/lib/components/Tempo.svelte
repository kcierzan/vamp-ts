<script lang="ts">
  import type { HTMLInputEvent } from "../types";
  import { getProjectContext } from "$lib/utils";

  const project = getProjectContext();

  async function setTransportBpm(e: HTMLInputEvent) {
    const bpm = parseInt(e.currentTarget.value);
    project?.setBpm(bpm);
  }
</script>

<div class="flex flex-col items-center">
  <input
    class="h-8 w-24 rounded border-2 text-lg"
    id="tempo"
    value={project?.bpm ?? 120}
    type="number"
    min="40"
    max="250"
    step="1"
    on:change={setTransportBpm}
  />
</div>
