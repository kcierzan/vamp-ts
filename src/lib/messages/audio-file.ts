import { type AudioFile, SongDataMessage } from "../types";
import { fileToArrayBuffer, guessBPM } from "../utils";
import poolStore from "../stores/pool";

async function createPoolFile(file: File, songId: string) {
  const { bpm } = await guessBPM(file);
  const buffer = await fileToArrayBuffer(file);
  fileChannel.push(
    {
      name: file.name,
      song_id: songId,
      media_type: file.type,
      size: buffer.byteLength,
      bpm
    },
    buffer
  );
}

dataChannel.registerListener(SongDataMessage.NewPoolFile, (audioFile: AudioFile) =>
  poolStore.createNewPoolFile(audioFile)
);

export function isAudioFile(item: any): item is AudioFile {
  if (!item) return false;
  return "id" in item && "file" in item && "bpm" in item && !item.isDndShadowItem;
}

export default {
  createPoolFile
};
