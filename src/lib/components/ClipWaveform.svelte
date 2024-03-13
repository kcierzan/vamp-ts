<script lang="ts">
  import { getContext } from "svelte";
  import WaveSurfer from "wavesurfer.js";
  import type { Region, RegionParams } from "wavesurfer.js/dist/plugins/regions.js";
  import Regions from "wavesurfer.js/dist/plugins/regions.js";
  import type { ProjectContext } from "../types";
  import type AudioClip from "$lib/models/audio-clip.svelte";

  interface ClipWaveformProps {
    clip: AudioClip;
    clipDuration: number;
  }

  const { clip, clipDuration } = $props<ClipWaveformProps>()
  const { supabase } = getContext<ProjectContext>("project");
  let waveformContainer: HTMLElement;

  $effect(() => {
    const wave = WaveSurfer.create({
      container: waveformContainer,
      waveColor: "#06b6d4",
      interact: false,
      cursorWidth: 0,
      url: URL.createObjectURL(clip.audioFile.blob)
    });
    wave.on("decode", () => createPlaybackRegion(clip, wave))
  });

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
    regions.on("region-updated", async (region: Region) => {
      await clip.setStartEndTimes({ supabase, startTime: region.start, endTime: region.end })
    });
  }
</script>

<div bind:this={waveformContainer} class="placeholder mt-2" />
