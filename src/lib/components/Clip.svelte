<script lang="ts">
  import { start, Transport } from "tone";
  import type AudioClip from "$lib/models/audio-clip.svelte";
  import type Track from "$lib/models/track.svelte";
  import type { PlaybackState } from "$lib/types";
  import { getProjectContext } from "$lib/utils";

  interface ClipProps {
    clip: AudioClip;
    track: Track;
  }

  let { clip, track }: ClipProps = $props();
  let button: HTMLButtonElement | null = $state(null);
  let animation: Animation | null = null;

  const project = getProjectContext();
  const baseStyles = "flex text-base w-full h-8 text-white rounded";
  const stateStyles = {
    PLAYING: "bg-sky-400",
    STOPPED: "bg-blue-500",
    QUEUED: "",
    PAUSED: ""
  };

  $effect(() => handleQueueAnimation(clip.state));
  let clipStyles = $derived.by(() => computeStyles(clip.state));

  function handleQueueAnimation(state: PlaybackState) {
    if (!animation && button && state === "QUEUED") {
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
      animation && animation.cancel();
      animation = null;
    }
  }

  function computeStyles(state: PlaybackState) {
    const base = baseStyles + " ";
    return base + stateStyles[state];
  }

  async function clickClip(e: MouseEvent) {
    await start();

    if (e.shiftKey && project) {
      project.selection.clip = clip;
      project.selection.track = track;
    } else if (project) {
      project.playClip(clip);
    }
  }
</script>

<div class="flex flex-row">
  <button on:click={clickClip} class={clipStyles} bind:this={button}>
    <span class="w-30 self-center truncate text-left">{clip.name}</span>
  </button>
</div>
