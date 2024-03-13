<script lang="ts">
  import { start, Transport } from "tone";
  import type AudioClip from "$lib/models/audio-clip.svelte";
  import type Track from "$lib/models/track.svelte";
  import type { PlaybackState, ProjectContext } from "$lib/types";
  import { getContext } from "svelte";

  interface ClipProps {
    clip: AudioClip;
    track: Track;
  }

  let { clip, track }: ClipProps = $props();
  let button: HTMLButtonElement | null = $state(null);
  let animation: Animation | null = $state(null);

  const { project } = getContext<ProjectContext>("project");

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
      !!animation && animation.cancel();
      animation = null;
    }
  }

  $effect(() => handleQueueAnimation(clip.state));

  const baseStyles = "flex text-base w-full h-8 text-white rounded";
  const stateStyles = {
    PLAYING: "bg-sky-400",
    STOPPED: "bg-blue-500",
    QUEUED: "",
    PAUSED: ""
  };

  function computeStyles(state: PlaybackState) {
    const base = baseStyles + " ";
    return base + stateStyles[state];
  }

  let clipStyles = $derived.by(() => computeStyles(clip.state));

  async function clickClip(e: MouseEvent) {
    await start();

    if (e.shiftKey) {
      project.selection.clip = clip;
      project.selection.track = track;
    } else {
      project.playClip(clip);
    }
  }
</script>

<div class="flex flex-row">
  <button on:click={clickClip} class={clipStyles} bind:this={button}>
    <span class="w-30 self-center truncate text-left">{clip.name}</span>
  </button>
</div>
