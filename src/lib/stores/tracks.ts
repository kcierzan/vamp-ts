import { get, writable, type Writable } from "svelte/store";
import { Draw, Transport } from "tone";
import type { Time } from "tone/build/esm/core/type/Units";

import instruments from "../instruments";
import clipStore from "../stores/clips";
import { PlayState, type Clip, type TrackData } from "../types";
import { transportAtOrNow, transportNow } from "../utils";

export interface TrackState {
  id: number;
  currentlyPlaying: Clip | null;
  currentlyQueued: Clip | null;
  playingEvent: number | null;
  queuedEvent: number | null;
}

export interface TrackStateStore {
  [key: number]: TrackState;
}

const trackPlaybackStore: Writable<TrackStateStore> = writable({});
const { subscribe, update, set } = trackPlaybackStore;
const INIT_TRACK_STATE = {
  currentlyPlaying: null,
  currentlyQueued: null,
  playingEvent: null,
  queuedEvent: null
};

function cancelPlayingEvent(trackId: number) {
  update((store) => {
    if (store[trackId].playingEvent !== null) {
      Transport.clear(store[trackId].playingEvent as number);
    }
    store[trackId].playingEvent = null;
    return store;
  });
}

function cancelQueuedEvent(trackId: number) {
  update((store) => {
    if (store[trackId].queuedEvent !== null) {
      Transport.clear(store[trackId].queuedEvent as number);
    }
    store[trackId].queuedEvent = null;
    return store;
  });
}

function setCurrentlyQueued(clip: Clip, event: number) {
  update((store) => {
    store[clip.track_id].currentlyQueued = clip;
    store[clip.track_id].queuedEvent = event;
    return store;
  });
}

function queueClip(clip: Clip) {
  clipStore.setClipState(clip, PlayState.Queued);
  cancelQueuedEvent(clip.track_id);
  update((store) => {
    const queued = store[clip.track_id].currentlyQueued;
    !!queued && clipStore.setClipState(queued, PlayState.Stopped);
    return store;
  });
}

function stopTrack(trackId: number, at: Time) {
  update((store) => {
    store[trackId].playingEvent !== null && Transport.clear(store[trackId].playingEvent as number);
    const launchTime = Transport.seconds > (at as number) ? transportNow() : at;

    Transport.scheduleOnce((time) => {
      const playing = store[trackId].currentlyPlaying;
      !!playing && instruments.stop(playing, time);
      Draw.schedule(() => {
        !!playing && clipStore.setClipState(playing, PlayState.Stopped);
        store[trackId].currentlyPlaying = null;
        store[trackId].playingEvent = null;
      }, time);
    }, launchTime);
    return store;
  });
}

function stopCurrentAudio(trackId: number, time: Time | undefined) {
  const currentlyPlaying = get(trackPlaybackStore)[trackId]?.currentlyPlaying;
  !!currentlyPlaying && instruments.stop(currentlyPlaying, time);
}

function stopAllTracksAudio() {
  update((store) => {
    for (const track of Object.values(store)) {
      !!track.currentlyPlaying && instruments.stop(track.currentlyPlaying, undefined);
    }
    return store;
  });
}

function playTrackClip(clip: Clip, at: Time) {
  const launchTime = transportAtOrNow(at);
  const playEvent = startClipLoop(clip, launchTime);
  queueClip(clip);
  const queuedEvent = Transport.scheduleOnce((time: number) => {
    stopCurrentAudio(clip.track_id, time);
    Draw.schedule(() => {
      cancelPlayingEvent(clip.track_id);
      clipStore.setClipState(clip, PlayState.Playing);
      update((store) => setPlaying(store, clip, playEvent));
    }, time);
  }, launchTime as number);
  setCurrentlyQueued(clip, queuedEvent);
}

function startClipLoop(clip: Clip, at: Time) {
  return Transport.scheduleRepeat(
    (acTime: number) => {
      instruments.play(clip, acTime);
    },
    "1m",
    at
  );
}

function setPlaying(store: TrackStateStore, clip: Clip, playEvent: number) {
  const playing = store[clip.track_id].currentlyPlaying;
  if (!!playing && playing?.id !== clip.id) {
    clipStore.setClipState(playing, PlayState.Stopped);
  }
  store[clip.track_id].currentlyPlaying = clip;
  if (store[clip.track_id].currentlyQueued === clip) {
    store[clip.track_id].currentlyQueued = null;
  }
  store[clip.track_id].playingEvent = playEvent;
  return store;
}

function initialize(tracks: TrackData[]) {
  const state = tracks.reduce((acc: TrackStateStore, track: TrackData) => {
    acc[track.id] = {
      ...INIT_TRACK_STATE,
      id: track.id
    };
    return acc;
  }, {});
  set(state);
}

function initializeTrackPlaybackState(track: TrackData) {
  update((store) => {
    store[track.id] = {
      ...INIT_TRACK_STATE,
      id: track.id
    };
    return store;
  });
}

export default {
  subscribe,
  playTrackClip,
  stopTrack,
  stopAllTracksAudio,
  stopCurrentlyPlayingAudio: stopCurrentAudio,
  cancelPlayingEvent,
  cancelQueuedEvent,
  initialize,
  initializeTrackPlaybackState
};
