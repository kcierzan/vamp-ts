import type { TrackData } from "$lib/types";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";
import audioClipDataFactory from "./audio-clip-data";

type TrackDataTransientParams = {
  withClip: boolean;
};

const trackDataFactory: Factory<TrackData> = Factory.define<TrackData, TrackDataTransientParams>(
  ({ sequence, afterBuild, params, transientParams }) => {
    const { withClip } = transientParams;
    const { project_id } = params;

    if (withClip) {
      afterBuild((track) => {
        const audioClip = audioClipDataFactory.build({ track_id: track.id });
        track.audio_clips.push(audioClip);
      });
    }

    return {
      id: sequence,
      gain: faker.number.float({ min: -40.0, max: 6.0 }),
      name: `${faker.music.genre()} drums`,
      panning: faker.number.float({ min: -1, max: 1 }),
      project_id: project_id ?? faker.number.int(),
      audio_clips: [],
      next_track_id: null,
      previous_track_id: null
    };
  }
);

export default trackDataFactory;
