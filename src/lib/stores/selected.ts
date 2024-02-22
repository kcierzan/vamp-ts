import { type Writable, writable } from "svelte/store";

import type { Clip, TrackData } from "../types";

export interface SelectedStore {
  track: TrackData | null;
  clip: Clip | null;
}

const selectedStore: Writable<SelectedStore> = writable({
  track: null,
  clip: null
});

const { subscribe, set } = selectedStore;

export default {
  subscribe,
  set
};
