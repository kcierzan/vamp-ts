import { get } from "svelte/store";
import { Transport } from "tone";

import random from "lodash/random";
import instruments from "../instruments";
import { clipStore, trackDataStore, trackPlaybackStore } from "../stores";
import { PlayState, type AudioFile, type Clip, type TrackData } from "../types";

function newTrack(track: TrackData) {
  trackPlaybackStore.initializeTrackPlaybackState(track);
  instruments.createSamplers(...track.audio_clips);
  clipStore.initializeClipStates(...track.audio_clips);
  trackDataStore.createTrack(track);
}

function createFromAudioFile(projectId: number, audioFile: AudioFile) {
  const trackCount = get(trackDataStore).length;
  const trackId = random(Number.MAX_SAFE_INTEGER);
  const trackWithClipAttrs = {
    id: trackId,
    song_id: projectId,
    name: `Track ${trackCount + 1}`,
    gain: 0.0,
    panning: 0.0,
    project_id: projectId,
    audio_clips: [
      {
        id: random(Number.MAX_SAFE_INTEGER),
        name: audioFile.file.file_name,
        type: audioFile.media_type,
        playback_rate: audioFile.bpm ? Transport.bpm.value / audioFile.bpm : 1.0,
        index: 0,
        audio_file: audioFile,
        track_id: trackId,
        start_time: 0,
        end_time: null,
        state: PlayState.Stopped
      }
    ]
  };
  newTrack(trackWithClipAttrs);
}

async function createEmpty(projectId: number): Promise<void> {
  const track: TrackData = {
    id: random(Number.MAX_SAFE_INTEGER), // get ID from actual persistence
    name: "new track",
    gain: 0.0,
    panning: 0.0,
    audio_clips: [],
    project_id: projectId
  };
  newTrack(track);
}

function createFromClip(projectId: number, clip: Clip) {
  const trackCount = get(trackDataStore).length;
  const trackWithClipAttrs = {
    id: random(Number.MAX_SAFE_INTEGER),
    project_id: projectId,
    name: `Track ${trackCount + 1}`,
    gain: 0.0,
    panning: 0.0,
    audio_clips: [clip]
  };
  newTrack(trackWithClipAttrs);
}

function remove(trackId: number) {
  trackPlaybackStore.stopCurrentlyPlayingAudio(trackId, undefined);
  trackPlaybackStore.cancelPlayingEvent(trackId);
  trackPlaybackStore.cancelQueuedEvent(trackId);
  trackDataStore.removeTrack(trackId);
}
export default {
  createFromAudioFile,
  createFromClip,
  createEmpty,
  remove
};
