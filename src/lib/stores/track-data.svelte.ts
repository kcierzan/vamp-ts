import type { Clip, TrackData } from "../types";

const trackData: TrackData[] = $state([]);

function createTrack(track: TrackData) {
  trackData.push(track);
}

function removeTrack(trackId: number) {
  const indexToRemove = trackData.findIndex((track) => track.id === trackId);
  trackData.splice(indexToRemove, 1);
}

function initialize(trackProps: TrackData[]) {
  trackData.length = 0;
  trackData.push(...trackProps);
}

function createClips(...clips: Clip[]) {
  for (const clip of clips) {
    const trackIndex = trackData.findIndex((track: TrackData) => track.id === clip.track_id);
    trackData[trackIndex].audio_clips.push(clip);
  }
}

function moveClip(clip: Clip, index: number, toTrackId: number) {
  const toTrackIdx = trackData.findIndex((track) => track.id === toTrackId);
  const removeTrackIdx = trackData.findIndex((track) => track.id === clip.track_id);
  const removeClipIndex = trackData[removeTrackIdx].audio_clips.findIndex(
    (toRemove) => toRemove.id === clip.id
  );
  trackData[removeTrackIdx].audio_clips.splice(removeClipIndex, 1);
  trackData[toTrackIdx].audio_clips.push({ ...clip, index, track_id: toTrackId });
}

function attachDownloaded(clip: Clip, blob: Blob) {
  const trackIdx = trackData.findIndex((track) => track.id === clip.track_id);
  const targetIndex = trackData[trackIdx].audio_clips.findIndex(
    (toAttach) => toAttach.id === clip.id
  );
  trackData[trackIdx].audio_clips[targetIndex].audio_files.file = blob;
}

export default {
  get tracks() {
    return trackData;
  },
  createTrack,
  removeTrack,
  initialize,
  createClips,
  attachDownloaded,
  moveClip
};
