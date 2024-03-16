import type { AudioClipData } from "$lib/types";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";
import audioFileDataFactory from "./audio-file-data";

const audioClipDataFactory: Factory<AudioClipData> = Factory.define<AudioClipData>(
  ({ sequence, params, associations }) => {
    const { name, start_time, end_time, playback_rate, track_id, index } = params;
    const { audio_files } = associations;
    const audioFile = audio_files ?? audioFileDataFactory.build();

    return {
      id: sequence,
      name: name ?? `${faker.music.genre()} drum loop`,
      index: index ?? faker.number.int({ max: 30 }),
      start_time: start_time ?? 0,
      end_time: end_time ?? null,
      track_id: track_id ?? faker.number.int(),
      audio_files: audioFile,
      audio_file_id: audioFile.id,
      playback_rate: playback_rate ?? faker.number.float()
    };
  }
);

export default audioClipDataFactory;
