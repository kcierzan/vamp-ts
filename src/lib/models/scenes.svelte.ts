import type AudioClip from "$lib/models/audio-clip.svelte";
import type Track from "$lib/models/track.svelte";
import type { PlaybackState } from "$lib/types";

interface ScenesParams {
  tracks: Track[];
}

type SceneIndex = number;

interface SceneMap {
  [key: SceneIndex]: AudioClip[];
}
interface SceneStateMap {
  [key: SceneIndex]: PlaybackState;
}

export default class Scenes {
  private readonly _tracks: Track[];
  private readonly _sceneMap: SceneMap = $state({});
  private readonly _stateMap: SceneStateMap = $state({});

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
    return this._stateMap[index] ?? "STOPPED";
  }

  getSceneClips(index: SceneIndex): AudioClip[] {
    return this._sceneMap[index] ?? [];
  }

  private static scenesFromTracks(tracks: Track[]): SceneMap {
    return tracks.reduce((map: SceneMap, track: Track) => {
      for (const clip of track.clips) {
        if (clip.index in map) {
          map[clip.index].push(clip);
        } else {
          map[clip.index] = [clip];
        }
      }
      return map;
    }, {});
  }

  private static statesFromScenes(scenes: SceneMap): SceneStateMap {
    return Object.entries(scenes).reduce(
      (map: SceneStateMap, [sceneIndex, clips]: [string, AudioClip[]]) => {
        const clipStates = clips.map((clip) => clip.state);
        const uniqueClipStates = new Set(clipStates);
        const firstUniqueState = uniqueClipStates.values().next().value;
        if (uniqueClipStates.size === 1 && firstUniqueState) {
          map[parseInt(sceneIndex)] = firstUniqueState;
        } else {
          map[parseInt(sceneIndex)] = "STOPPED";
        }
        return map;
      },
      {}
    );
  }
}
