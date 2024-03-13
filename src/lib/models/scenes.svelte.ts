import type AudioClip from "$lib/models/audio-clip.svelte";
import type Track from "$lib/models/track.svelte";
import type { PlaybackState } from "$lib/types";

interface ScenesParams {
  tracks: Track[];
}

type SceneIndex = number;
type SceneMap = Map<SceneIndex, AudioClip[]>;
type SceneStateMap = Map<SceneIndex, PlaybackState>;

export default class Scenes {
  private readonly _tracks: Track[];
  private readonly _sceneMap: SceneMap = $state(new Map());
  private readonly _stateMap: SceneStateMap = $state(new Map());

  constructor(params: ScenesParams) {
    const { tracks } = params;
    this._tracks = tracks;
    this._sceneMap = Scenes.scenesFromTracks(this._tracks);
    this._stateMap = Scenes.statesFromScenes(this._sceneMap);
  }

  get sceneMap() {
    return this._sceneMap;
  }

  get sceneStateMap() {
    return this._stateMap;
  }

  getSceneState(index: SceneIndex): PlaybackState {
    return this._stateMap.get(index) ?? "STOPPED";
  }

  getSceneClips(index: SceneIndex): AudioClip[] {
    return this._sceneMap.get(index) ?? [];
  }

  private static scenesFromTracks(tracks: Track[]): SceneMap {
    return tracks.reduce((map: SceneMap, track: Track) => {
      for (const clip of track.clips) {
        if (map.has(clip.index)) {
          map.get(clip.index)!.push(clip);
        } else {
          map.set(clip.index, [clip]);
        }
      }
      return map;
    }, new Map());
  }

  private static statesFromScenes(scenes: SceneMap): SceneStateMap {
    return Array.from(scenes.entries()).reduce(
      (map: SceneStateMap, [sceneIndex, clips]: [SceneIndex, AudioClip[]]) => {
        const clipStates = clips.map((clip) => clip.state);
        const uniqueClipStates = new Set(clipStates);
        const firstUniqueState = uniqueClipStates.values().next().value;
        if (uniqueClipStates.size === 1 && firstUniqueState) {
          map.set(sceneIndex, firstUniqueState);
        } else {
          map.set(sceneIndex, "STOPPED");
        }
        return map;
      },
      new Map()
    );
  }
}
