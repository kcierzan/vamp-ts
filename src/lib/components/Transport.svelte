<script lang="ts">
  import { start } from "tone";
  import { transport } from "../messages";
  import { transportStore } from "../stores";
  import { PlayState } from "../types";

  let stopHeldStyle = "";

  $: playing = $transportStore.state === PlayState.Playing;

  const buttonStyles = "text-base bg-gray-400 w-16 h-8 text-black rounded";

  async function startTransport() {
    await start();
    transport.start();
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
    on:click={() => transport.stop()}
    on:mousedown={holdStop}
    on:mouseup={releaseStop}>Stop</button
  >
  <div class="flex-column w-32 justify-center text-xs">
    <div>Transport: {$transportStore.barsBeatsSixteenths}</div>
    <div>Seconds: {$transportStore.seconds}</div>
  </div>
</div>
