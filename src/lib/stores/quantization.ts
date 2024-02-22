import { writable, type Writable } from "svelte/store";

import { QuantizationInterval } from "../types";

const quantizationStore: Writable<QuantizationInterval> = writable(QuantizationInterval.OneBar);

export default quantizationStore;
