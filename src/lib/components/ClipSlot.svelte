<script lang="ts">
  /* global DndEvent */
  import { getContext } from "svelte";
  import { dndzone } from "svelte-dnd-action";
  import { type DndItem, type ProjectContext } from "../types";
  import ClipComponent from "./Clip.svelte";
  import AudioClip from "$lib/models/audio-clip.svelte";
  import type Track from "$lib/models/track.svelte";
  import AudioFile from "$lib/models/audio-file.svelte";

  interface ClipSlotProps {
    clip: AudioClip | null;
    track: Track;
    index: number;
  }

  let { clip, index, track } = $props<ClipSlotProps>();
  const { project, supabase } = getContext<ProjectContext>("project");

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
    const audioFile = e.detail.items.find((item) => item instanceof AudioFile);
    const clip = e.detail.items.find((item) => item instanceof AudioClip);

    considering = false;
    const newItem = clip ?? audioFile;
    items = newItem ? [newItem] : [];

    if (audioFile instanceof AudioFile) {
      await AudioClip.fromAudioFile(supabase, audioFile, index, track.id, project.bpm);
    } else if (clip instanceof AudioClip) {
      await project.moveClipToTrack(clip, track, index)
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
      <ClipComponent {clip} {track} />
    {:else}
      <div class="placeholder h-8 w-36" />
    {/if}
  {/each}
</div>
