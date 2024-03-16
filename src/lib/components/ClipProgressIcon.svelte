<script lang="ts">
  import { Transport } from "tone";
  import type Track from "$lib/models/track.svelte";
  import { getProjectContext } from "$lib/utils";

  const project = getProjectContext();

  interface ProgressIconProps {
    track: Track;
  }

  let { track }: ProgressIconProps = $props();

  let circle: SVGCircleElement;
  let animation: Animation | null = null;

  $effect(() => (track.playing ? spin() : stop()));
  $effect(() => (project?.transport.state === "PLAYING" ? animation?.play() : animation?.pause()));

  function spin() {
    animation = circle.animate(
      [
        {
          strokeDasharray: "0 39"
        },
        {
          strokeDasharray: "39"
        }
      ],
      {
        easing: "linear",
        iterations: Infinity,
        direction: "normal",
        // FIXME: this should be the repeat rate of the clip
        // which is not necessarily its buffer length / speedFactor
        duration: (oneBarInSeconds() || 0) * 1000
      }
    );
  }

  function stop() {
    !!animation && animation.cancel();
  }

  function oneBarInSeconds() {
    return (60 / Transport.bpm.value) * 4;
  }
</script>

<svg width="25" height="25" class="chart">
  <circle bind:this={circle} r="6.25" cx="12.5" cy="12.5" class="pie"></circle>
</svg>

<style>
  circle {
    fill: #ddd;
    stroke: #0074d9;
    stroke-width: 12.5;
    stroke-dasharray: 0 39;
  }

  svg {
    margin: 0 auto;
    transform: rotate(-90deg);
    background: #ddd;
    border-radius: 50%;
    display: block;
  }
</style>
