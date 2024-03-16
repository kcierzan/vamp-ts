import type { TrackData } from "$lib/types";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";
import audioClipDataFactory from "./audio-clip-data";

type TrackDataTransientParams = {
  withClip: boolean;
};

const trackDataFactory: Factory<TrackData> = Factory.define<TrackData, TrackDataTransientParams>(
  ({ sequence, afterBuild, params, transientParams, associations }) => {
    const { withClip } = transientParams;
    const { project_id, gain, name, panning, next_track_id, previous_track_id } = params;
    const { audio_clips } = associations;

    if (withClip) {
      afterBuild((track) => {
        const audioClip = audioClipDataFactory.build({ track_id: track.id });
        track.audio_clips.push(audioClip);
      });
    }

    if (audio_clips) {
      afterBuild((track) => {
        const audio_clips = track.audio_clips.map((clip) => ({ ...clip, track_id: track.id }));
        track = { ...track, audio_clips };
      });
    }

    return {
      id: sequence,
      gain: gain ?? faker.number.float({ min: -40.0, max: 6.0 }),
      name: name ?? `${faker.music.genre()} drums`,
      panning: panning ?? faker.number.float({ min: -1, max: 1 }),
      project_id: project_id ?? faker.number.int(),
      audio_clips: audio_clips ?? [],
      next_track_id: next_track_id ?? null,
      previous_track_id: previous_track_id ?? null
    };
  }
);

export default trackDataFactory;
