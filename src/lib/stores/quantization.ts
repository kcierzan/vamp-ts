import { type Writable, writable } from "svelte/store";

import { QuantizationInterval } from "../types";

const quantizationStore: Writable<QuantizationInterval> = writable(QuantizationInterval.OneBar);

export default quantizationStore;
