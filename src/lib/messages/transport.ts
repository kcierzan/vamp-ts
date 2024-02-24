import { transportStore } from "../stores";

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
