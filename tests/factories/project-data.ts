import type { ProjectData } from "$lib/types";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";
import audioFileData from "./audio-file-data";
import trackDataFactory from "./track-data";

type ProjectDataTransientParams = {
  withTrack: boolean;
  withPoolFile: boolean;
};

const projectDataFactory: Factory<ProjectData> = Factory.define<
  ProjectData,
  ProjectDataTransientParams
>(({ sequence, afterBuild, associations, transientParams }) => {
  const { withTrack, withPoolFile } = transientParams;

  if (withTrack) {
    afterBuild((project) => {
      const trackData = trackDataFactory.build({ project_id: project.id });
      project.tracks.push(trackData);
    });
  }

  const associatedTracks = (associations.tracks ?? []).map((track) => ({
    ...track,
    project_id: sequence
  }));

  return {
    id: sequence,
    name: faker.music.songName(),
    description: `${faker.music.genre()} ${faker.word.noun()} but ${faker.word.adjective()}`,
    time_signature: "4/4",
    bpm: faker.number.int({ max: 180 }),
    created_by_user_id: faker.string.uuid(),
    tracks: associatedTracks,
    audio_files: withPoolFile ? [audioFileData.build()] : []
  };
});

export default projectDataFactory;
