import { writable } from "svelte/store";

const latencyStore = writable(0);
const { subscribe, set } = latencyStore;

export default {
  subscribe,
  set
};
