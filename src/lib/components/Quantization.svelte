<script lang="ts">
  import { getContext } from "svelte";
  import type { ProjectContext } from "$lib/types";

  const { project } = getContext<ProjectContext>("project");

  const options = new Map([
    ["8 Bars", "@8m"],
    ["4 Bars", "@4m"],
    ["2 Bars", "@2m"],
    ["1 Bar", "@1m"],
    ["1/2", "@2n"],
    ["1/4", "@4n"],
    ["1/8", "@8n"],
    ["1/16", "@16n"]
  ])
</script>

<select class="h-8 w-36 rounded border-2 p-0 pl-2" bind:value={project.launchQuantization}>
  {#each options.entries() as [label, value] (value)}
    <option {value}>{label}</option>
  {/each}
</select>
