<script lang="ts">
  import { onDestroy } from "svelte";
  import WaveSurfer from "wavesurfer.js";
  import type { Region, RegionParams } from "wavesurfer.js/dist/plugins/regions.js";
  import Regions from "wavesurfer.js/dist/plugins/regions.js";
  import { clips } from "../messages";
  import type { Clip } from "../types";

  export let clip: Clip | undefined;
  export let clipDuration: number;

  let waveformContainer: HTMLElement;
  let waveform: WaveSurfer;

  $: {
    !!waveformContainer && drawWaveform(clip);
  }

  function drawWaveform(currentClip?: Clip) {
    !!waveform && waveform.destroy();
    if (currentClip?.audio_files) {
      waveform = WaveSurfer.create({
        container: waveformContainer,
        waveColor: "#06b6d4",
        interact: false,
        cursorWidth: 0,
        // TODO: Fix maybe not having an audio_files.file on the clip
        url: URL.createObjectURL(currentClip.audio_files.file)
      });
      waveform.on("decode", () => createPlaybackRegion(currentClip, waveform));
    }
  }

  function createPlaybackRegion(currentClip: Clip, waveform: WaveSurfer) {
    const regions = waveform.registerPlugin(Regions.create());
    const regionParams: RegionParams = {
      start: currentClip.start_time,
      end: currentClip.end_time ?? clipDuration,
      color: "rgba(34, 211, 238, 0.5)",
      drag: true,
      resize: true
    };
    regions.addRegion(regionParams);
    regions.on("region-updated", (region: Region) => {
      clips.updateClips({
        ...currentClip,
        start_time: region.start,
        end_time: region.end
      });
    });
  }

  onDestroy(async () => {
    !!waveform && waveform.destroy();
  });
</script>

<div bind:this={waveformContainer} class="placeholder mt-2" />
