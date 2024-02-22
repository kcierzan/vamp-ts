import { get } from "svelte/store";

import { quantizationStore, trackDataStore, trackPlaybackStore, transportStore } from "../stores";
import { type Clip, PlayState, SongPlaybackMessage, type TrackID } from "../types";
import { quantizedTransportTime } from "../utils";

function playClips(...clips: Clip[]) {
  // FIXME: make this local first, then end-to-end
  // playbackChannel.push(SongPlaybackMessage.PlayClip, { clips });
  receivePlayClips({ waitMilliseconds: 0, clips });
}

function receivePlayClips({
  waitMilliseconds,
  clips
}: {
  waitMilliseconds: number;
  clips: Clip[];
}) {
  const nowCompensated = waitMilliseconds > 0 ? `+${waitMilliseconds / 1000}` : "+0.001";
  const currentQuantization = get(quantizationStore);
  // FIXME: Either make quantization settings e2e reactive or pass a time w/ the play event
  // (different clients will have different quantization values)
  const nextDivision = quantizedTransportTime(currentQuantization);
  const transport = get(transportStore);

  if (transport.state === PlayState.Stopped) {
    for (const clip of clips) {
      trackPlaybackStore.playTrackClip(clip, nowCompensated);
    }
    transportStore.startLocal(nowCompensated);
  } else {
    for (const clip of clips) {
      trackPlaybackStore.playTrackClip(clip, nextDivision);
    }
  }
}
userChannel.registerListener(SongPlaybackMessage.PlayClip, receivePlayClips);

function stopTracks(...trackIds: TrackID[]): void {
  playbackChannel.push(SongPlaybackMessage.StopTrack, { trackIds });
}

function stopAllTracks(): void {
  const trackIds = get(trackDataStore).map((track) => track.id);
  stopTracks(...trackIds);
}

userChannel.registerListener(
  SongPlaybackMessage.StopTrack,
  function receiveStopTrack({ trackIds }: { trackIds: TrackID[] }): void {
    const currentQuantization = get(quantizationStore);
    // FIXME: Either make quantization settings e2e reactive or pass a time w/ the stop event
    const nextDivision = quantizedTransportTime(currentQuantization);
    for (const trackId of trackIds) {
      trackPlaybackStore.stopTrack(trackId, nextDivision);
    }
  }
);

export default {
  playClips,
  stopTracks,
  stopAllTracks
};
