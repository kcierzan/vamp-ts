import { transportStore } from "../stores/index.svelte";

function start(): void {
  transportStore.startLocal();
}

function stop(): void {
  transportStore.stopOrPauseLocal();
}

export default {
  start,
  stop
};
