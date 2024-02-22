import { get } from "svelte/store";
import { Transport } from "tone";

import instruments from "../instruments";
import { clipStore, trackDataStore, trackPlaybackStore } from "../stores";
import { type AudioFile, type Clip, SongDataMessage, type TrackData, type TrackID } from "../types";

function createFromAudioFile(songId: string, audioFile: AudioFile) {
  const trackCount = get(trackDataStore).length;
  const trackWithClipAttrs = {
    song_id: songId,
    name: `Track ${trackCount + 1}`,
    gain: 0.0,
    panning: 0.0,
    audio_clips: [
      {
        name: audioFile.file.file_name,
        type: audioFile.media_type,
        playback_rate: audioFile.bpm ? Transport.bpm.value / audioFile.bpm : 1.0,
        index: 0,
        audio_file_id: audioFile.id
      }
    ]
  };
  dataChannel.push(SongDataMessage.NewTrack, trackWithClipAttrs);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
async function createEmpty(songId: string, onOk: (res: any) => any = (_res) => {}): Promise<void> {
  dataChannel
    .push(SongDataMessage.NewTrack, {
      name: "new track",
      gain: 0.0,
      panning: 0.0,
      song_id: songId
    })
    ?.receive("ok", onOk);
}

function createFromClip(songId: string, clip: Clip) {
  const trackCount = get(trackDataStore).length;
  const trackWithClipAttrs = {
    song_id: songId,
    name: `Track ${trackCount + 1}`,
    gain: 0.0,
    panning: 0.0,
    audio_clips: [clip]
  };
  dataChannel.push(SongDataMessage.NewTrackFromClip, trackWithClipAttrs);
}

function remove(id: TrackID) {
  dataChannel.push(SongDataMessage.RemoveTrack, { id });
}

dataChannel.registerListener(
  SongDataMessage.RemoveTrack,
  function receiveRemoveTrack(trackId: TrackID) {
    // TODO: remove clipStates and GrainPlayers
    trackPlaybackStore.stopCurrentlyPlayingAudio(trackId, undefined);
    trackPlaybackStore.cancelPlayingEvent(trackId);
    trackPlaybackStore.cancelQueuedEvent(trackId);
    trackDataStore.removeTrack(trackId);
  }
);

// TODO: add DB properties to the track store!
function receiveNewTrack(track: TrackData) {
  trackPlaybackStore.initializeTrackPlaybackState(track);
  instruments.createSamplers(...track.audio_clips);
  clipStore.initializeClipStates(...track.audio_clips);
  trackDataStore.createTrack(track);
}

dataChannel.registerListener(SongDataMessage.NewTrack, receiveNewTrack);
dataChannel.registerListener(SongDataMessage.NewTrackFromClip, receiveNewTrack);

export default {
  createFromAudioFile,
  createFromClip,
  createEmpty,
  remove
};
