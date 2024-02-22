import { Transport } from "tone";

import instruments from "../instruments";
import { clipStore, trackDataStore } from "../stores";
import { type AudioFile, type Clip, SongDataMessage, type TrackData, type TrackID } from "../types";

function createFromPool(audio: AudioFile, trackId: TrackID, index: number) {
  dataChannel.push(SongDataMessage.NewClip, {
    name: audio.file.file_name,
    type: audio.media_type,
    index: index,
    track_id: trackId,
    audio_file_id: audio.id,
    playback_rate: Transport.bpm.value / audio.bpm
  });
}

function stretchClipsToBpm(tracks: TrackData[], bpm: number) {
  const clipsToStretch: Clip[] = [];
  for (const track of tracks) {
    for (const clip of track.audio_clips) {
      if (clip.audio_file) {
        const rate = bpm / clip.audio_file.bpm;
        // optimistically change rate locally first
        instruments.setPlaybackRate(clip, rate);
        clipsToStretch.push({ ...clip, playback_rate: rate });
      }
    }
  }
  updateClips(...clipsToStretch);
}

function updateClips(...clips: Clip[]): void {
  dataChannel.push(SongDataMessage.UpdateClips, { clips });
}

dataChannel.registerListener(SongDataMessage.NewClip, function receiveNewClip(clip: Clip) {
  instruments.createSamplers(clip);
  clipStore.initializeClipStates(clip);
  trackDataStore.createClips(clip);
});

dataChannel.registerListener(
  SongDataMessage.UpdateClips,
  function receiveUpdateClips({ clips }: { clips: Clip[] }) {
    instruments.updateSamplers(...clips);
    trackDataStore.createClips(...clips);
  }
);

export default {
  createFromPool,
  updateClips,
  stretchClipsToBpm
};
