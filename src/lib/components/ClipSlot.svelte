<script lang="ts">
  /* global DndEvent */
  import { dndzone } from "svelte-dnd-action";
  import { type DndItem } from "../types";
  import Clip from "./Clip.svelte";
  import AudioClip from "$lib/models/audio-clip.svelte";
  import type Track from "$lib/models/track.svelte";
  import AudioFile from "$lib/models/audio-file.svelte";
  import { getProjectContext } from "$lib/utils";

  interface ClipSlotProps {
    clip: AudioClip | null;
    track: Track;
    index: number;
  }

  const project = getProjectContext();
  let { clip, index, track }: ClipSlotProps = $props();

  let items: DndItem[] = $state(clip ? [clip] : []);
  let considering = $state(false);
  let dndBg = $derived(considering ? "bg-orange-500" : "bg-transparent");
  let options = $derived({
    dropFromOthersDisabled: !!items?.length,
    items,
    flipDurationMs: 100
  });

  function consider(e: CustomEvent<DndEvent<DndItem>>) {
    considering = !!e.detail.items.length;
    items = e.detail.items;
  }

  async function finalize(e: CustomEvent<DndEvent<DndItem>>) {
    if (!project) throw new Error("Project not loaded");

    const audioFile = e.detail.items.find((item) => item instanceof AudioFile);
    const clip = e.detail.items.find((item) => item instanceof AudioClip);

    considering = false;

    if (audioFile instanceof AudioFile) {
      const newClip = await project.moveAudioFileToTrack(audioFile, index, track);
      items = [newClip];
    } else if (clip instanceof AudioClip) {
      await project.moveClipToTrack(clip, track, index);
      items = [clip];
    }
  }
</script>

<div
  class="box-content h-8 w-36 rounded border-2 {dndBg}"
  use:dndzone={options}
  on:consider={consider}
  on:finalize={finalize}
>
  {#each items as clip (clip.id)}
    {#if clip instanceof AudioClip}
      <Clip {clip} {track} />
    {:else}
      <div class="placeholder h-8 w-36" />
    {/if}
  {/each}
</div>
