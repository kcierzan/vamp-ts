import { PlayState, type Clip, type TrackData } from "../types";

export type ClipStateStore = Map<number, PlayState>;

const clipStates: ClipStateStore = $state(new Map());

function setClipState(clip: Clip, state: PlayState) {
  clipStates.set(clip.id, state);
}

function initialize(...tracks: TrackData[]) {
  clipStates.clear();
  for (const track of tracks) {
    for (const clip of track.audio_clips) {
      clipStates.set(clip.id, PlayState.Stopped);
    }
  }
}

function setStateStopped(...clips: Clip[]) {
  for (const clip of clips) {
    clipStates.set(clip.id, PlayState.Stopped);
  }
}

export default {
  get states() {
    return clipStates;
  },
  setStateStopped,
  setClipState,
  initialize
};
