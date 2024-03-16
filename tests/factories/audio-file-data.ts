import type { AudioFileData } from "$lib/types";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

const audioFileDataFactory = Factory.define<AudioFileData>(({ sequence }) => ({
  id: sequence,
  bpm: faker.number.int({ max: 180 }),
  size: faker.number.int(),
  path: `${faker.number.int()}/${faker.system.fileName()}::${faker.string.alphanumeric(16)}`,
  bucket: "audio_files",
  mime_type: "audio/wav",
  description: `The sound of ${faker.word.noun()} but it's ${faker.music.genre()}`
}));

export default audioFileDataFactory;
