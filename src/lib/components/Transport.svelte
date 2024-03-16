<script lang="ts">
  import { start } from "tone";
  import { getProjectContext } from "$lib/utils";

  const project = getProjectContext();

  let stopHeldStyle = $state("");
  let playing = $derived(project && project.transport.state === "PLAYING");

  const buttonStyles = "text-base bg-gray-400 w-16 h-8 text-black rounded";

  async function startTransport() {
    await start();
    project?.transport.start();
  }

  function holdStop() {
    stopHeldStyle = "text-white bg-red-500";
  }

  function releaseStop() {
    stopHeldStyle = "";
  }
</script>

<div class="flex flex-row items-center space-x-4">
  <button
    class={buttonStyles}
    class:bg-green-500={playing}
    class:text-white={playing}
    on:click={startTransport}>Play</button
  >
  <button
    class={buttonStyles + " " + stopHeldStyle}
    on:click={() => project?.transport.stop()}
    on:mousedown={holdStop}
    on:mouseup={releaseStop}>Stop</button
  >
  <div class="flex-column w-32 justify-center text-xs">
    <div>Transport: {project?.transport.barsBeatsSixteenths ?? "0:0:0"}</div>
    <div>Seconds: {project?.transport.seconds ?? "0:00"}</div>
  </div>
</div>
