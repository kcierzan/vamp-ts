<script lang="ts">
  import { start } from "tone";
  import type { PlaybackState } from "$lib/types";
  import type AudioClip from "$lib/models/audio-clip.svelte";
  import type Track from "$lib/models/track.svelte";
  import { getProjectContext } from "$lib/utils";

  const project = getProjectContext();

  interface SceneButtonProps {
    index: number;
    clips: AudioClip[];
    state: PlaybackState;
  }

  let { index, clips, state }: SceneButtonProps = $props();

  async function playScene(): Promise<void> {
    await start();
    const tracksInScene = clips.map((clip: AudioClip) => clip.trackId);
    const tracksToStop = project?.tracks.filter(
      (track: Track) => !tracksInScene.includes(track.id)
    );
    clips.forEach((clip) => project?.playClip(clip));
    tracksToStop?.forEach((track) => project?.stopTrack(track));
  }

  function stopScene() {
    const sceneTrackIDs = clips.map((clip: AudioClip) => clip.trackId);
    project?.tracks.forEach((track) => {
      if (sceneTrackIDs.includes(track.id)) {
        project.stopTrack(track);
      }
    });
  }

  function sceneAction() {
    switch (state) {
      case "STOPPED":
        playScene();
        break;
      case "PLAYING":
        stopScene();
    }
  }

  // TODO: extract this to PlayableButton or something
  const baseStyles = "w-20 h-8 text-white rounded";

  const stateStyles = new Map<PlaybackState, string>([
    ["PLAYING", "bg-red-500 hover:bg-red-700"],
    ["STOPPED", "bg-green-500 hover:bg-green-700"],
    ["QUEUED", "bg-yellow-500 hover:bg-yellow-700 text-black"],
    ["PAUSED", ""]
  ]);

  let sceneStyles = $derived(`${baseStyles} ${stateStyles.get(state)}`);
</script>

<div>
  <button class={sceneStyles} on:click={sceneAction}>Scene {index + 1}</button>
</div>
