import type { Input, Output, WorkletParameters, WorkletProcessorOptions } from "../types";

const WEBAUDIO_BLOCK_SIZE = 128;

/** Overlap-Add Node */
export default class OLAProcessor extends AudioWorkletProcessor {
  numInputs: number;
  numOutputs: number;
  hopSize: number;
  numOverlaps: number;
  blockSize: number;
  inputBuffers: Input[];
  inputBuffersHead: Input[];
  inputBuffersToSend: Input[];
  outputBuffers: Output[];
  outputBuffersToRetrieve: Output[];

  constructor(options: WorkletProcessorOptions) {
    super();

    this.numInputs = options.numberOfInputs;
    this.numOutputs = options.numberOfOutputs;

    this.blockSize = options.processorOptions.blockSize;
    // TODO for now, the only support hop size is the size of a web audio block
    this.hopSize = WEBAUDIO_BLOCK_SIZE;

    this.numOverlaps = this.blockSize / this.hopSize;

    // pre-allocate input buffers (will be reallocated if needed)
    this.inputBuffers = new Array(this.numInputs);
    this.inputBuffersHead = new Array(this.numInputs);
    this.inputBuffersToSend = new Array(this.numInputs);
    // default to 1 channel per input until we know more
    for (let i = 0; i < this.numInputs; i++) {
      this.allocateInputChannels(i, 1);
    }
    // pre-allocate input buffers (will be reallocated if needed)
    this.outputBuffers = new Array(this.numOutputs);
    this.outputBuffersToRetrieve = new Array(this.numOutputs);
    // default to 1 channel per output until we know more
    for (let i = 0; i < this.numOutputs; i++) {
      this.allocateOutputChannels(i, 1);
    }
  }

  /** Handles dynamic reallocation of input/output channels buffer
     (channel numbers may lety during lifecycle) **/
  reallocateChannelsIfNeeded(inputs: Input[], outputs: Output[]) {
    for (let i = 0; i < this.numInputs; i++) {
      const numChannels = inputs[i].length;
      if (numChannels != this.inputBuffers[i].length) {
        this.allocateInputChannels(i, numChannels);
      }
    }

    for (let i = 0; i < this.numOutputs; i++) {
      const numChannels = outputs[i].length;
      if (numChannels != this.outputBuffers[i].length) {
        this.allocateOutputChannels(i, numChannels);
      }
    }
  }

  allocateInputChannels(inputIndex: number, numChannels: number) {
    // allocate input buffers

    this.inputBuffers[inputIndex] = new Array(numChannels);
    for (let i = 0; i < numChannels; i++) {
      this.inputBuffers[inputIndex][i] = new Float32Array(this.blockSize + WEBAUDIO_BLOCK_SIZE);
      this.inputBuffers[inputIndex][i].fill(0);
    }

    // allocate input buffers to send and head pointers to copy from
    // (cannot directly send a pointer/subarray because input may be modified)
    this.inputBuffersHead[inputIndex] = new Array(numChannels);
    this.inputBuffersToSend[inputIndex] = new Array(numChannels);
    for (let i = 0; i < numChannels; i++) {
      this.inputBuffersHead[inputIndex][i] = this.inputBuffers[inputIndex][i].subarray(
        0,
        this.blockSize
      );
      this.inputBuffersToSend[inputIndex][i] = new Float32Array(this.blockSize);
    }
  }

  allocateOutputChannels(outputIndex: number, numChannels: number) {
    // allocate output buffers
    this.outputBuffers[outputIndex] = new Array(numChannels);
    for (let i = 0; i < numChannels; i++) {
      this.outputBuffers[outputIndex][i] = new Float32Array(this.blockSize);
      this.outputBuffers[outputIndex][i].fill(0);
    }

    // allocate output buffers to retrieve
    // (cannot send a pointer/subarray because new output has to be add to existing output)
    this.outputBuffersToRetrieve[outputIndex] = new Array(numChannels);
    for (let i = 0; i < numChannels; i++) {
      this.outputBuffersToRetrieve[outputIndex][i] = new Float32Array(this.blockSize);
      this.outputBuffersToRetrieve[outputIndex][i].fill(0);
    }
  }

  /** Read next web audio block to input buffers **/
  readInputs(inputs: Input[]) {
    // when playback is paused, we may stop receiving new samples
    if (inputs[0].length && inputs[0][0].length == 0) {
      for (let i = 0; i < this.numInputs; i++) {
        for (let j = 0; j < this.inputBuffers[i].length; j++) {
          this.inputBuffers[i][j].fill(0, this.blockSize);
        }
      }
      return;
    }

    for (let i = 0; i < this.numInputs; i++) {
      for (let j = 0; j < this.inputBuffers[i].length; j++) {
        const webAudioBlock = inputs[i][j];
        this.inputBuffers[i][j].set(webAudioBlock, this.blockSize);
      }
    }
  }

  /** Write next web audio block from output buffers **/
  writeOutputs(outputs: Output[]) {
    for (let i = 0; i < this.numInputs; i++) {
      for (let j = 0; j < this.inputBuffers[i].length; j++) {
        const webAudioBlock = this.outputBuffers[i][j].subarray(0, WEBAUDIO_BLOCK_SIZE);
        outputs[i][j].set(webAudioBlock);
      }
    }
  }

  /** Shift left content of input buffers to receive new web audio block **/
  shiftInputBuffers() {
    for (let i = 0; i < this.numInputs; i++) {
      for (let j = 0; j < this.inputBuffers[i].length; j++) {
        this.inputBuffers[i][j].copyWithin(0, WEBAUDIO_BLOCK_SIZE);
      }
    }
  }

  /** Shift left content of output buffers to receive new web audio block **/
  shiftOutputBuffers() {
    for (let i = 0; i < this.numOutputs; i++) {
      for (let j = 0; j < this.outputBuffers[i].length; j++) {
        this.outputBuffers[i][j].copyWithin(0, WEBAUDIO_BLOCK_SIZE);
        this.outputBuffers[i][j].subarray(this.blockSize - WEBAUDIO_BLOCK_SIZE).fill(0);
      }
    }
  }

  /** Copy contents of input buffers to buffer actually sent to process **/
  prepareInputBuffersToSend() {
    for (let i = 0; i < this.numInputs; i++) {
      for (let j = 0; j < this.inputBuffers[i].length; j++) {
        this.inputBuffersToSend[i][j].set(this.inputBuffersHead[i][j]);
      }
    }
  }

  /** Add contents of output buffers just processed to output buffers **/
  handleOutputBuffersToRetrieve() {
    for (let i = 0; i < this.numOutputs; i++) {
      for (let j = 0; j < this.outputBuffers[i].length; j++) {
        for (let k = 0; k < this.blockSize; k++) {
          this.outputBuffers[i][j][k] += this.outputBuffersToRetrieve[i][j][k] / this.numOverlaps;
        }
      }
    }
  }

  process(inputs: Input[], outputs: Output[], params: WorkletParameters) {
    this.reallocateChannelsIfNeeded(inputs, outputs);

    this.readInputs(inputs);
    this.shiftInputBuffers();
    this.prepareInputBuffersToSend();
    this.processOLA(this.inputBuffersToSend, this.outputBuffersToRetrieve, params);
    this.handleOutputBuffersToRetrieve();
    this.writeOutputs(outputs);
    this.shiftOutputBuffers();

    return true;
    // return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  processOLA(_inputs: Input[], _outputs: Output[], _params: WorkletParameters) {
    console.assert(false, "Not overriden");
  }
}
