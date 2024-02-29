<script lang="ts">
  import { Transport, start } from "tone";
  import { playback } from "../messages";
  import { clipStore, selectedStore, trackDataStore } from "../stores";
  import type { Clip } from "../types";
  import { PlayState } from "../types";

  export let clip: Clip;
  let button: HTMLButtonElement;
  let animation: Animation | null = null;

  $: currentTrack = trackDataStore.tracks.find((track) => track.id === clip.track_id);

  function handleQueueAnimation(state: PlayState) {
    if (!animation && state === PlayState.Queued) {
      animation = button.animate(
        [
          {
            backgroundColor: "#eab308"
          },
          {
            backgroundColor: "#0ea5e9"
          }
        ],
        {
          easing: "ease-in",
          iterations: Infinity,
          direction: "alternate",
          duration: (30 / Transport.bpm.value) * 1000
        }
      );
    } else {
      !!animation && animation.cancel();
      animation = null;
    }
  }

  // eslint-disable-next-line svelte/valid-compile
  $: handleQueueAnimation($clipStore[clip.id].state);

  // TODO: extract this to PlayableButton or something
  const baseStyles = "flex text-base w-full h-8 text-white rounded";
  const stateStyles = {
    [PlayState.Playing]: "bg-sky-400",
    [PlayState.Stopped]: "bg-blue-500",
    [PlayState.Queued]: "",
    [PlayState.Paused]: ""
  };

  function computeStyles(state: PlayState) {
    const base = baseStyles + " ";
    return base + stateStyles[state];
  }

  $: clipStyles = computeStyles($clipStore[clip.id].state);

  async function clickClip(e: MouseEvent) {
    await start();

    if (e.shiftKey) {
      selectedStore.set({ clip: clip, track: currentTrack ?? null });
    } else {
      playback.playClips(clip);
    }
  }
</script>

<div class="flex flex-row">
  <button on:click={clickClip} class={clipStyles} bind:this={button}>
    <span class="w-30 self-center truncate text-left">{clip.name}</span>
  </button>
</div>
