import type { AudioFileData } from "$lib/types";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

const audioFileDataFactory = Factory.define<AudioFileData>(({ sequence, params }) => {
  const { bpm, size, path, bucket, mime_type, description } = params;
  return {
    id: sequence,
    bpm: bpm ?? faker.number.int({ max: 180 }),
    size: size ?? faker.number.int(),
    path:
      path ?? `${faker.number.int()}/${faker.system.fileName()}::${faker.string.alphanumeric(16)}`,
    bucket: bucket ?? "audio_files",
    mime_type: mime_type ?? "audio/wav",
    description: description ?? `The sound of ${faker.word.noun()} but it's ${faker.music.genre()}`
  };
});

export default audioFileDataFactory;
