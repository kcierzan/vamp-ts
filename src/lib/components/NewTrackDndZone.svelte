<script lang="ts">
  import { getContext } from "svelte";
  import { SHADOW_ITEM_MARKER_PROPERTY_NAME, TRIGGERS, dndzone } from "svelte-dnd-action";
  import { tracks } from "../messages";
  import type { AudioFile, Clip, DndItem, ProjectContext } from "../types";
  import { isAudioFile, isClip } from "../utils";

  const { project, supabase } = getContext<ProjectContext>("project");

  const dummyItem = { id: "dummy" };
  let items: DndItem[] = [dummyItem];
  let considering = false;
  $: dndBg = considering ? "bg-orange-500" : "bg-transparent";

  // eslint-disable-next-line no-undef
  function considerNewTrack(e: CustomEvent<DndEvent<DndItem>>) {
    setConsidering(e.detail.info.trigger);
    items = ensureDraggedItemFirst(e.detail.items);
  }

  // eslint-disable-next-line no-undef
  async function finalizeNewTrack(e: CustomEvent<DndEvent<DndItem>>) {
    considering = false;
    const audioFile = e.detail.items.find((item) => isAudioFile(item));
    const clip = e.detail.items.find((item) => isClip(item));
    items = [dummyItem];
    if (isAudioFile(audioFile)) {
      await tracks.createFromAudioFile(supabase, project.id, audioFile as AudioFile);
    } else if (isClip(clip)) {
      await tracks.createFromClip(supabase, project.id, clip as Clip);
    }
  }

  function setConsidering(trigger: TRIGGERS) {
    if (trigger === TRIGGERS.DRAGGED_ENTERED) considering = true;
    if (trigger === TRIGGERS.DRAGGED_LEFT) considering = false;
  }

  function ensureDraggedItemFirst(items: DndItem[]) {
    return (
      items
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((item: any) => !item[SHADOW_ITEM_MARKER_PROPERTY_NAME])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .concat(items.filter((item: any) => item[SHADOW_ITEM_MARKER_PROPERTY_NAME]))
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
    {#if i == 0}
      <div class="flex w-40 flex-col items-center gap-4">
        <p class="text-center">Drag some files here to add a new track</p>
      </div>
    {:else}
      <span />
    {/if}
  {/each}
</div>
