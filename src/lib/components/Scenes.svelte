<script lang="ts">
  import type { ClipStateStore } from "$lib/stores/clip-states.svelte";
  import { PlayState, type Clip, type SceneStates, type Scenes, type TrackData } from "$lib/types";
  import { trackDataStore, clipStates } from "../stores";
  import SceneButton from "./SceneButton.svelte";

  const NUMBER_OF_ROWS = 16;
  const slots = Array.from({ length: NUMBER_OF_ROWS }, (_, i) => ({
    id: i * NUMBER_OF_ROWS
  }));

  const scenes = $derived.by(() => {
    const scenes = scenesFromTracks(trackDataStore.tracks);
    const states = computeSceneStates(scenes, clipStates.states);
    return { scenes, states };
  });

  function scenesFromTracks(tracks: TrackData[]): Scenes {
    return tracks.reduce((acc: Scenes, track: TrackData) => {
      for (const clip of track.audio_clips) {
        if (clip.index in acc) {
          acc[clip.index].push(clip);
        } else {
          acc[clip.index] = [clip];
        }
      }
      return acc;
    }, {});
  }

  function computeSceneStates(scenes: Scenes, states: ClipStateStore): SceneStates {
    return Object.entries(scenes).reduce(
      (acc: SceneStates, [sceneIndex, clips]: [string, Clip[]]) => {
        const sceneClipStates = clips.map((clip: Clip) => states.get(clip.id));
        console.log(sceneClipStates);
        const uniqueClipStates = new Set(sceneClipStates);
        const firstUniqueState = uniqueClipStates.values().next().value;
        if (uniqueClipStates.size === 1 && !!firstUniqueState) {
          acc[sceneIndex] = firstUniqueState;
        } else {
          acc[sceneIndex] = PlayState.Stopped;
        }
        return acc;
      },
      {}
    );
  }
</script>

{#if scenes.scenes}
  <div class="flex flex-col items-start gap-1 rounded border-2 border-slate-200 px-1 pt-2">
    <div class="flex h-6 w-full flex-row justify-center">
      <div>Scenes</div>
    </div>
    {#each slots as slot, index (slot.id)}
      {#if Object.keys(scenes.scenes).includes(index.toString())}
        <div class="box-content rounded border-2 border-white">
          <SceneButton
            index={index.toString()}
            clips={scenes.scenes[index.toString()]}
            state={scenes.states[index.toString()]}
          />
        </div>
      {:else}
        <div class="box-content rounded border-2 border-white">
          <div class="placeholder h-8 w-20 rounded" />
        </div>
      {/if}
    {/each}
  </div>
{/if}
