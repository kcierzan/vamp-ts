<script lang="ts">
  /* global DndEvent */
  import { afterUpdate, getContext } from "svelte";
  import { dndzone } from "svelte-dnd-action";
  import {
    PlayState,
    type AudioFile,
    type Clip,
    type DndItem,
    type ProjectContext
  } from "../types";
  import { flash, isAudioFile, isClip } from "../utils";
  import ClipComponent from "./Clip.svelte";
  import { trackDataStore, clipStates } from "$lib/stores";
  import instruments from "$lib/models/instruments";
  import { Transport } from "tone";
  import type { SupabaseClient } from "@supabase/supabase-js";
  import random from "lodash/random";
  import omit from "lodash/omit";

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
  $: options = {
    dropFromOthersDisabled: !!items?.length,
    items: items,
    flipDurationMs: 100
  };

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
      createFromPool(supabase, audioFile, trackId, index);
    } else if (isClip(clip)) {
      // move the clip optimistically
      trackDataStore.moveClip(clip, index, trackId);
      updateClips({ ...clip, index, track_id: trackId });
    }
  }

  async function updateClips(...clips: Clip[]): Promise<void> {
    instruments.updateSamplers(...clips);
    const promises = clips.map((clip) => {
      if (!clip?.id) throw new Error("Clip missing ID");
      return supabase
        .from("audio_clips")
        .update(omit(clip, ["id", "audio_files"]))
        .eq("id", clip.id);
    });
    const results = await Promise.allSettled(promises);
    results.forEach((result) => {
      if (result.status === "fulfilled" && result.value.error) {
        throw new Error(result.value.error.message);
      }
    });
  }

  async function createFromPool(
    supabase: SupabaseClient,
    audio: AudioFile,
    trackId: number,
    index: number
  ) {
    const localClipProperties = ["id", "type", "state", "playback_rate", "audio_files"];
    const clip: Clip = {
      id: random(Number.MAX_SAFE_INTEGER),
      name: audio.name,
      type: audio.media_type,
      index: index,
      track_id: trackId,
      playback_rate: Transport.bpm.value / audio.bpm,
      state: PlayState.Stopped,
      audio_files: audio,
      start_time: 0,
      end_time: null
    };
    const clipToPersist: Partial<Clip> = omit(
      { ...clip, audio_file_id: audio.id },
      localClipProperties
    );
    instruments.createSamplers(clip);
    clipStates.setStateStopped(clip);
    trackDataStore.createClips(clip);
    const { error } = await supabase.from("audio_clips").insert(clipToPersist);

    if (error) throw new Error(error.message);
  }

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
