<script lang="ts">
  import { getContext } from "svelte";
  import { dndzone, TRIGGERS } from "svelte-dnd-action";
  import type { DndItem, PlaceHolderDndItem, ProjectContext } from "../types";
  import Track from "$lib/models/track.svelte";
  import AudioClip from "$lib/models/audio-clip.svelte";
  import AudioFile from "$lib/models/audio-file.svelte";

  const { project, supabase } = getContext<ProjectContext>("project");

  const dummyItem = { id: "dummy", isDndShadowItem: false };
  let items: DndItem[] = $state([dummyItem]);
  let considering = $state(false);
  let dndBg = $derived(considering ? "bg-orange-500" : "bg-transparent")

  // eslint-disable-next-line no-undef
  function considerNewTrack(e: CustomEvent<DndEvent<DndItem>>) {
    setConsidering(e.detail.info.trigger);
    items = ensureDraggedItemFirst(e.detail.items);
  }

  // eslint-disable-next-line no-undef
  async function finalizeNewTrack(e: CustomEvent<DndEvent<DndItem>>) {
    considering = false;
    const audioFile = e.detail.items.find((item) => item instanceof AudioFile);
    const clip = e.detail.items.find((item) => item instanceof AudioClip);

    items = [dummyItem];

    if (audioFile instanceof AudioFile) {
      await Track.fromAudioFile(supabase, project.id, audioFile);
    } else if (clip instanceof AudioClip) {
      await Track.fromAudioClip(supabase, project.id, clip);
    }
  }

  function setConsidering(trigger: TRIGGERS) {
    if (trigger === TRIGGERS.DRAGGED_ENTERED) considering = true;
    if (trigger === TRIGGERS.DRAGGED_LEFT) considering = false;
  }

  function isDndShadowItem(item: DndItem): item is PlaceHolderDndItem {
    return !(item instanceof AudioClip || item instanceof AudioFile);
  }

  function ensureDraggedItemFirst(items: DndItem[]) {
    return (
      items
        .filter((item: DndItem) => !isDndShadowItem(item))
        .concat(items.filter((item: DndItem) => isDndShadowItem(item)))
    );
  }
</script>

<div
  use:dndzone={{
    items: items,
    flipDurationMs: 100,
    morphDisabled: true,
    dragDisabled: true
  }}
  on:consider={considerNewTrack}
  on:finalize={finalizeNewTrack}
  class="flex w-full items-center justify-center {dndBg}"
>
  {#each items as item, i (item.id)}
    {#if i === 0}
      <div class="flex w-40 flex-col items-center gap-4">
        <p class="text-center">Drag some files here to add a new track</p>
      </div>
    {:else}
      <span />
    {/if}
  {/each}
</div>
