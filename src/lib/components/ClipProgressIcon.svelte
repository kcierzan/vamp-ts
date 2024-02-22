<script lang="ts">
  import { Transport } from "tone";
  import { clipStore, trackPlaybackStore, transportStore } from "../stores";
  import { PlayState, type TrackID } from "../types";

  export let trackId: TrackID;
  let circle: SVGCircleElement;
  let animation: Animation | null = null;

  $: playingClip = !!trackId && $trackPlaybackStore[trackId].currentlyPlaying;
  $: trackIsPlaying = !!playingClip && $clipStore[playingClip.id].state === PlayState.Playing;
  $: transportIsPlaying = $transportStore.state === PlayState.Playing;

  $: {
    trackIsPlaying ? spin() : stop();
  }

  $: {
    trackIsPlaying && transportIsPlaying ? animation?.play() : animation?.pause();
  }

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
