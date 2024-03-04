/* eslint-disable @typescript-eslint/no-explicit-any */
import FFT from "fft.js";

import type {
  AudioChannel,
  Input,
  Output,
  WorkletParameters,
  WorkletProcessorOptions
} from "../../types";

const BUFFERED_BLOCK_SIZE = 2048;
const WEBAUDIO_BLOCK_SIZE = 128;

function genHannWindow(length: number) {
  const win = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    win[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / length));
  }
  return win;
}

/** Overlap-Add Node */
class OLAProcessor extends AudioWorkletProcessor {
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

class PhaseVocoderProcessor extends OLAProcessor {
  fftSize: number;
  timeCursor: number;
  hannWindow: Float32Array;
  fft: FFT;
  freqComplexBuffer: any[];
  freqComplexBufferShifted: any[];
  timeComplexBuffer: any[];
  magnitudes: Float32Array;
  peakIndexes: Int32Array;
  numPeaks: number;

  static get parameterDescriptors() {
    return [
      {
        name: "pitchFactor",
        defaultValue: 1.0
      }
    ];
  }

  constructor(options: WorkletProcessorOptions) {
    options.processorOptions = {
      blockSize: BUFFERED_BLOCK_SIZE
    };
    super(options);

    this.fftSize = this.blockSize;
    this.timeCursor = 0;

    this.hannWindow = genHannWindow(this.blockSize);

    // prepare FFT and pre-allocate buffers
    this.fft = new FFT(this.fftSize);
    this.freqComplexBuffer = this.fft.createComplexArray();
    this.freqComplexBufferShifted = this.fft.createComplexArray();
    this.timeComplexBuffer = this.fft.createComplexArray();
    this.magnitudes = new Float32Array(this.fftSize / 2 + 1);
    this.peakIndexes = new Int32Array(this.magnitudes.length);
    this.numPeaks = 0;
  }

  processOLA(inputs: Input[], outputs: Output[], parameters: WorkletParameters) {
    // no automation, take last value
    const pitchFactor = parameters.pitchFactor[parameters.pitchFactor.length - 1];

    for (let i = 0; i < this.numInputs; i++) {
      for (let j = 0; j < inputs[i].length; j++) {
        // big assumption here: output is symetric to input
        const input = inputs[i][j];
        const output = outputs[i][j];

        this.applyHannWindow(input);

        this.fft.realTransform(this.freqComplexBuffer, input);

        this.computeMagnitudes();
        this.findPeaks();
        this.shiftPeaks(pitchFactor);

        this.fft.completeSpectrum(this.freqComplexBufferShifted);
        this.fft.inverseTransform(this.timeComplexBuffer, this.freqComplexBufferShifted);
        this.fft.fromComplexArray(this.timeComplexBuffer, output);

        this.applyHannWindow(output);
      }
    }

    this.timeCursor += this.hopSize;
  }

  /** Apply Hann window in-place */
  applyHannWindow(input: AudioChannel) {
    for (let i = 0; i < this.blockSize; i++) {
      input[i] = input[i] * this.hannWindow[i];
    }
  }

  /** Compute squared magnitudes for peak finding **/
  computeMagnitudes() {
    let i = 0,
      j = 0;
    while (i < this.magnitudes.length) {
      const real = this.freqComplexBuffer[j];
      const imag = this.freqComplexBuffer[j + 1];
      // no need to sqrt for peak finding
      this.magnitudes[i] = real ** 2 + imag ** 2;
      i += 1;
      j += 2;
    }
  }

  /** Find peaks in spectrum magnitudes **/
  findPeaks() {
    this.numPeaks = 0;
    let i = 2;
    const end = this.magnitudes.length - 2;

    while (i < end) {
      const mag = this.magnitudes[i];

      if (this.magnitudes[i - 1] >= mag || this.magnitudes[i - 2] >= mag) {
        i++;
        continue;
      }
      if (this.magnitudes[i + 1] >= mag || this.magnitudes[i + 2] >= mag) {
        i++;
        continue;
      }

      this.peakIndexes[this.numPeaks] = i;
      this.numPeaks++;
      i += 2;
    }
  }

  /** Shift peaks and regions of influence by pitchFactor into new spectrum */
  shiftPeaks(pitchFactor: number) {
    // zero-fill new spectrum
    this.freqComplexBufferShifted.fill(0);

    for (let i = 0; i < this.numPeaks; i++) {
      const peakIndex = this.peakIndexes[i];
      const peakIndexShifted = Math.round(peakIndex * pitchFactor);

      if (peakIndexShifted > this.magnitudes.length) {
        break;
      }

      // find region of influence
      let startIndex = 0;
      let endIndex = this.fftSize;
      if (i > 0) {
        const peakIndexBefore = this.peakIndexes[i - 1];
        startIndex = peakIndex - Math.floor((peakIndex - peakIndexBefore) / 2);
      }
      if (i < this.numPeaks - 1) {
        const peakIndexAfter = this.peakIndexes[i + 1];
        endIndex = peakIndex + Math.ceil((peakIndexAfter - peakIndex) / 2);
      }

      // shift whole region of influence around peak to shifted peak
      const startOffset = startIndex - peakIndex;
      const endOffset = endIndex - peakIndex;
      for (let j = startOffset; j < endOffset; j++) {
        const binIndex = peakIndex + j;
        const binIndexShifted = peakIndexShifted + j;

        if (binIndexShifted >= this.magnitudes.length) {
          break;
        }

        // apply phase correction
        const omegaDelta = (2 * Math.PI * (binIndexShifted - binIndex)) / this.fftSize;
        const phaseShiftReal = Math.cos(omegaDelta * this.timeCursor);
        const phaseShiftImag = Math.sin(omegaDelta * this.timeCursor);

        const indexReal = binIndex * 2;
        const indexImag = indexReal + 1;
        const valueReal = this.freqComplexBuffer[indexReal];
        const valueImag = this.freqComplexBuffer[indexImag];

        const valueShiftedReal = valueReal * phaseShiftReal - valueImag * phaseShiftImag;
        const valueShiftedImag = valueReal * phaseShiftImag + valueImag * phaseShiftReal;

        const indexShiftedReal = binIndexShifted * 2;
        const indexShiftedImag = indexShiftedReal + 1;
        this.freqComplexBufferShifted[indexShiftedReal] += valueShiftedReal;
        this.freqComplexBufferShifted[indexShiftedImag] += valueShiftedImag;
      }
    }
  }
}
registerProcessor("phase-vocoder-processor", PhaseVocoderProcessor);
