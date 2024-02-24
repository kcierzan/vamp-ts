import type { Writable } from "svelte/store";
import { writable } from "svelte/store";

import { PlayState, type Clip, type TrackData } from "../types";

export interface ClipStore {
  [key: number]: {
    state: PlayState;
  };
}

const clipStore: Writable<ClipStore> = writable({});
const { subscribe, update, set } = clipStore;

function setClipState(clip: Clip, state: PlayState) {
  update((store) => {
    store[clip.id].state = state;
    return store;
  });
}

function initialize(tracks: TrackData[]) {
  const newState = tracks.reduce((acc: ClipStore, track) => {
    for (const clip of track.audio_clips) {
      acc[clip.id] = {
        state: PlayState.Stopped
      };
    }
    return acc;
  }, {});
  set(newState);
}

function initializeClipStates(...clips: Clip[]) {
  update((store) => {
    for (const clip of clips) {
      store[clip.id] = { state: PlayState.Stopped };
    }
    return store;
  });
}

export default {
  subscribe,
  initializeClipStates,
  setClipState,
  initialize
};
