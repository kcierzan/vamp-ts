<svelte:options immutable />

<script lang="ts">
  /* global DndEvent */
  import { afterUpdate, getContext } from "svelte";
  import { dndzone } from "svelte-dnd-action";
  import { clips } from "../messages";
  import { trackDataStore } from "../stores";
  import type { Clip, DndItem, ProjectContext, TrackData } from "../types";
  import { flash, isAudioFile, isClip } from "../utils";
  import ClipComponent from "./Clip.svelte";

  export let index: number;
  export let track: TrackData;

  const { supabase } = getContext<ProjectContext>("project");

  let items: DndItem[];
  let considering = false;
  let element: HTMLElement;
  $: dndBg = considering ? "bg-orange-500" : "bg-transparent";
  $: occupyingClip = track.audio_clips.find(
    (clip) => clip.index === index && track.id === clip.track_id
  );
  $: items = occupyingClip ? [occupyingClip] : [];

  function consider(e: CustomEvent<DndEvent<DndItem>>) {
    considering = !!e.detail.items.length;
    items = e.detail.items;
  }

  function finalize(e: CustomEvent<DndEvent<DndItem>>) {
    const audioFile = e.detail.items.find((item) => isAudioFile(item));
    const clip = e.detail.items.find((item) => isClip(item));

    considering = false;
    const newItem = clip ?? audioFile;
    items = newItem ? [newItem] : [];

    if (isAudioFile(audioFile)) {
      // create a new clip from the pool
      clips.createFromPool(supabase, audioFile, track.id, index);
    } else if (isClip(clip)) {
      // move the clip optimistically
      trackDataStore.deleteClip(clip as Clip);
      clips.updateClips({ ...(clip as Clip), index, track_id: track.id });
    }
  }

  $: options = {
    dropFromOthersDisabled: !!items.length,
    items: items,
    flipDurationMs: 100
  };
  afterUpdate(() => flash(element));
</script>

<div
  class="box-content h-8 w-36 rounded border-2 {dndBg}"
  use:dndzone={options}
  on:consider={consider}
  on:finalize={finalize}
  bind:this={element}
>
  {#each items as clip (clip.id)}
    {#if "audio_files" in clip && !clip.isDndShadowItem}
      <ClipComponent {clip} />
    {:else}
      <div class="placeholder h-8 w-36" />
    {/if}
  {/each}
</div>
