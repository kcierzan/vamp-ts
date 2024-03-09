import { describe, it, expect, vi } from "vitest";
import Transport from "./transport.svelte";

vi.mock("tone", () => ({
  Transport: {
    start: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    clear: vi.fn(),
    scheduleRepeat: vi.fn()
  }
}));

describe("constructor", () => {
  it("returns and instance of Transport", () => {
    const subject = new Transport({ bpm: 128 });
    expect(subject).toBeInstanceOf(Transport);
  });
});

describe("start", () => {
  it("sets the state to PLAYING", () => {
    const subject = new Transport({ bpm: 128 });
    expect(subject.state).toBe("STOPPED");
    subject.start();

    expect(subject.state).toBe("PLAYING");
  });
});

describe("stop", () => {
  it("sets the state to STOPPED", () => {
    const subject = new Transport({ bpm: 128 });
    expect(subject.state).toBe("STOPPED");
    subject.start();
    expect(subject.state).toBe("PLAYING");
    subject.stop();
    expect(subject.state).toBe("STOPPED");
  });
});

describe("pause", () => {
  it("sets the state to PAUSED", () => {
    const subject = new Transport({ bpm: 128 });
    expect(subject.state).toBe("STOPPED");
    subject.start();
    expect(subject.state).toBe("PLAYING");
    subject.pause();
    expect(subject.state).toBe("PAUSED");
  });
});

describe("stopOrPause", () => {
  it("sets the state to PAUSED and then STOPPED", () => {
    const subject = new Transport({ bpm: 128 });
    expect(subject.state).toBe("STOPPED");
    subject.start();
    expect(subject.state).toBe("PLAYING");
    subject.stopOrPause();
    expect(subject.state).toBe("PAUSED");
    subject.stopOrPause();
    expect(subject.state).toBe("STOPPED");
  });
});
