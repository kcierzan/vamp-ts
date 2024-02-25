<svelte:options immutable />

<script lang="ts">
  import { getContext } from "svelte";
  import type { ProjectContext } from "../types";
  import AddTrackButton from "./AddTrackButton.svelte";
  import Metronome from "./Metronome.svelte";
  import Quantization from "./Quantization.svelte";
  import Tempo from "./Tempo.svelte";
  import Transport from "./Transport.svelte";

  const { project } = getContext<ProjectContext>("project");
  let element: HTMLElement;
</script>

<div class="my-4 flex flex-row items-center justify-center space-x-4" bind:this={element}>
  <AddTrackButton {project} />
  <Transport />
  <Tempo />
  <Quantization />
  <Metronome />
</div>
