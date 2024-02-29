import type { Clip, TrackData } from "../types";

const tracks: TrackData[] = $state([]);

function createTrack(track: TrackData) {
  tracks.push(track);
}

function removeTrack(trackId: number) {
  const indexToRemove = tracks.findIndex((track) => track.id === trackId);
  tracks.splice(indexToRemove, 1);
}

function initialize(trackProps: TrackData[]) {
  tracks.length = 0;
  tracks.push(...trackProps);
}

function createClips(...clips: Clip[]) {
  for (const clip of clips) {
    const trackIndex = tracks.findIndex((track: TrackData) => track.id === clip.track_id);
    tracks[trackIndex].audio_clips.push(clip);
  }
}

function moveClip(clip: Clip, index: number, toTrackId: number) {
  // moving to a new track
  const toTrackIdx = tracks.findIndex((track) => track.id === toTrackId);
  const removeTrackIdx = tracks.findIndex((track) => track.id === clip.track_id);
  const removeClipIndex = tracks[removeTrackIdx].audio_clips.findIndex(
    (toRemove) => toRemove.id === clip.id
  );
  tracks[removeTrackIdx].audio_clips.splice(removeClipIndex, 1);
  tracks[toTrackIdx].audio_clips.push({ ...clip, index, track_id: toTrackId });
}

export default {
  get tracks() {
    return tracks;
  },
  createTrack,
  removeTrack,
  initialize,
  createClips,
  moveClip
};
