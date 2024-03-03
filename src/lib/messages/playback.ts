import { get } from "svelte/store";

import { quantizationStore, trackDataStore, trackPlaybackStore, transportStore } from "../stores";
import { PlayState, type Clip } from "../types";
import { quantizedTransportTime } from "../utils";

function playClips(...clips: Clip[]) {
  const currentQuantization = get(quantizationStore);
  // FIXME: Either make quantization settings e2e reactive or pass a time w/ the play event
  // (different clients will have different quantization values)
  const nextDivision = quantizedTransportTime(currentQuantization);
  const transport = get(transportStore);

  if (transport.state === PlayState.Stopped) {
    for (const clip of clips) {
      trackPlaybackStore.playTrackClip(clip, "+0.001");
    }
    transportStore.startLocal();
  } else {
    for (const clip of clips) {
      trackPlaybackStore.playTrackClip(clip, nextDivision);
    }
  }
}

function stopTracks(...trackIds: number[]): void {
  const currentQuantization = get(quantizationStore);
  // FIXME: Either make quantization settings e2e reactive or pass a time w/ the stop event
  const nextDivision = quantizedTransportTime(currentQuantization);
  for (const trackId of trackIds) {
    trackPlaybackStore.stopTrack(trackId, nextDivision);
  }
}

function stopAllTracks(): void {
  const trackIds = trackDataStore.tracks.map((track) => track.id);
  stopTracks(...trackIds);
}

export default {
  playClips,
  stopTracks,
  stopAllTracks
};
