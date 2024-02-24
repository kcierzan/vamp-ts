import type { Readable } from "svelte/store";
import { derived } from "svelte/store";

import clipsStore, { type ClipStore } from "../stores/clips";
import trackDataStore from "../stores/track-data";
import type { SceneStates, SceneStore, Scenes, TrackData } from "../types";
import { PlayState, type Clip } from "../types";

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

function computeSceneStates(scenes: Scenes, clipsStore: ClipStore): SceneStates {
  return Object.entries(scenes).reduce(
    (acc: SceneStates, [sceneIndex, clips]: [string, Clip[]]) => {
      const sceneClipStates = clips.map((clip: Clip) => clipsStore[clip.id]?.state);
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

const scenes: Readable<SceneStore> = derived(
  [trackDataStore, clipsStore],
  ([$tracks, $clips], set) => {
    const scenes = scenesFromTracks($tracks);
    const states = computeSceneStates(scenes, $clips);
    set({
      scenes,
      states
    });
  }
);

export default scenes;
