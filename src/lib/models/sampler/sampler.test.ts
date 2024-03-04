import { Gain, Player, getContext } from "tone";
import { describe, expect, it, vi } from "vitest";
import Sampler from "./sampler";

const blob = new Blob([""], { type: "audio/wav" });
const url = URL.createObjectURL(blob);

vi.mock("tone", () => ({
  Gain: vi.fn().mockImplementation(() => ({
    toDestination: vi.fn().mockReturnThis(),
    input: null
  })),
  Player: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    playbackRate: 1.0,
    start: vi.fn(),
    stop: vi.fn(),
    seek: vi.fn(),
    reverse: false,
    buffer: {
      duration: 1
    }
  })),
  getContext: vi.fn().mockImplementation(() => ({
    createAudioWorkletNode: vi.fn().mockImplementation(() => ({
      connect: vi.fn(),
      parameters: {
        get: vi.fn().mockImplementation(() => ({
          value: 1.0
        }))
      }
    }))
  }))
}));

describe("constructor", () => {
  it("should correctly initialize a Sampler instance", () => {
    const subject = new Sampler(url, 110, 128);

    expect(subject).toBeInstanceOf(Sampler);
  });

  it("should call start on the Tone Player instance", () => {
    const subject = new Sampler(url, 110, 120);
    subject.start();

    expect(getContext).toHaveBeenCalled();
    expect(Gain).toHaveBeenCalledWith(1);
    expect(Player).toHaveBeenCalledWith(url);
  });
});

describe("pitchFactor", () => {
  it("should have working getters and setters", () => {
    const subject = new Sampler(url, 110, 128);

    expect(subject.pitchFactor).toBe(1.0);
    subject.pitchFactor = 1.4;
    expect(subject.pitchFactor).toBe(1.4);
  });
});

describe("speedFactor", () => {
  it("should have working getters and setters", () => {
    const subject = new Sampler(url, 110, 120);

    expect(subject.speedFactor).toBe(120 / 110);
    subject.speedFactor = 1.4;
    expect(subject.speedFactor).toBe(1.4);
  });
});
