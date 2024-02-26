import type { Writable } from "svelte/store";
import { writable } from "svelte/store";

import type { AudioFile } from "../types";

const poolStore: Writable<AudioFile[]> = writable([]);

const { subscribe, set, update } = poolStore;

function getFileName(audioFile: AudioFile) {
  return audioFile.path?.split("/")[1].split("::")[0];
}

function createNewPoolFile(audioFile: AudioFile) {
  update((store) => {
    return [...store, audioFile];
  });
}

function updatePoolFile(id: number, newPoolFile: AudioFile) {
  update((store) => {
    return store.map((af) => (af.id === id ? newPoolFile : af));
  });
}

function initialize(audioFiles: AudioFile[]) {
  const withNames = audioFiles.map((audioFile) => {
    return { ...audioFile, name: getFileName(audioFile) || "???" };
  });
  set(withNames);
}

export default {
  subscribe,
  initialize,
  createNewPoolFile,
  updatePoolFile
};
