<script lang="ts">
  /* global DndEvent */
  import { afterUpdate, getContext } from "svelte";
  import { dndzone } from "svelte-dnd-action";
  import { clips as clipmsg } from "../messages";
  import type { Clip, DndItem, ProjectContext } from "../types";
  import { flash, isAudioFile, isClip } from "../utils";
  import ClipComponent from "./Clip.svelte";
  import { trackDataStore } from "$lib/stores";

  export let trackId: number;
  export let index: number;
  export let clips: Clip[];

  const { supabase } = getContext<ProjectContext>("project");

  let items: DndItem[] = [];
  let considering = false;
  let element: HTMLElement;
  $: dndBg = considering ? "bg-orange-500" : "bg-transparent";
  $: occupyingClip = clips.find((clip) => clip.index === index && trackId === clip.track_id);
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
      clipmsg.createFromPool(supabase, audioFile, trackId, index);
    } else if (isClip(clip)) {
      // move the clip optimistically
      trackDataStore.moveClip(clip, index, trackId);
      clipmsg.updateClips(supabase, { ...clip, index, track_id: trackId });
    }
  }

  $: options = {
    dropFromOthersDisabled: !!items?.length,
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
