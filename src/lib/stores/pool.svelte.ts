import type { AudioFile } from "../types";

let _audioFiles: AudioFile[] = $state([]);

function getFileName(audioFile: AudioFile) {
  return audioFile.path?.split("/")[1].split("::")[0];
}

function createNewPoolFile(audioFile: AudioFile) {
  _audioFiles.push(audioFile);
}

function updatePoolFile(id: number, blob: Blob) {
  const idx = _audioFiles.findIndex((audioFile) => audioFile.id === id);
  if (idx == -1) {
    throw new Error(
      `Attempted to update pool file with ID ${id} but it was not found in the pool store`
    );
  }
  _audioFiles[idx].file = blob;
}

function initialize(files: AudioFile[]) {
  _audioFiles = [];
  for (const file of files) {
    _audioFiles.push({ ...file, name: getFileName(file) || "??" });
  }
}

export default {
  get audioFiles() {
    return _audioFiles;
  },
  initialize,
  createNewPoolFile,
  updatePoolFile
};
