import type { AudioClipData } from "$lib/types";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";
import audioFileDataFactory from "./audio-file-data";

const audioClipDataFactory: Factory<AudioClipData> = Factory.define<AudioClipData>(
  ({ sequence, params, associations }) => {
    const { track_id } = params;
    const audioFile = associations.audio_files ?? audioFileDataFactory.build();

    return {
      id: sequence,
      name: `${faker.music.genre()} drum loop`,
      index: faker.number.int({ max: 30 }),
      start_time: 0,
      end_time: null,
      track_id: track_id ?? faker.number.int(),
      audio_files: audioFile,
      audio_file_id: audioFile.id,
      playback_rate: faker.number.float()
    };
  }
);

export default audioClipDataFactory;
