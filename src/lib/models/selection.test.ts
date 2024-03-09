import { describe, expect, it, vi } from "vitest";
import Selection from "./selection.svelte";
import AudioFile from "./audio-file.svelte";
import AudioClip from "./audio-clip.svelte";
import Track from "./track.svelte";

describe("constructor", () => {
  it("returns an instance of Selection", () => {
    const subject = new Selection();
    expect(subject).toBeInstanceOf(Selection);
  });

  it("has a default value of null for clip", () => {
    const subject = new Selection();
    expect(subject.clip).toBeNull();
  });

  it("has a default value of null for track", () => {
    const subject = new Selection();
    expect(subject.track).toBeNull();
  });
});

describe("clip", () => {
  vi.mock("./sampler/sampler.ts", () => ({
    default: vi.fn()
  }));

  it("has a setter", () => {
    const audioFileData = {
      id: 1,
      bpm: 120,
      path: "1/my_cool_file.wav::1234567",
      size: 10000,
      bucket: "audio_files",
      mime_type: "audio/wav",
      description: "bass loop"
    };
    const audioClipData = {
      id: 1,
      track_id: 1,
      name: "my_cool_file",
      index: 0,
      start_time: 0,
      end_time: null,
      playback_rate: 1,
      audio_files: audioFileData,
      audio_file_id: audioFileData.id
    };
    const file = new File([""], "my_cool_file.wav", { type: "audio/wav" });
    const audioFile = new AudioFile(audioFileData, file);
    const audioClip = new AudioClip(audioClipData, audioFile);
    const subject = new Selection();

    subject.clip = audioClip;

    expect(subject.clip).toBe(audioClip);
  });
});

describe("track", () => {
  it("has a setter", () => {
    const track = new Track({
      id: 1,
      gain: 0,
      name: "My Track",
      panning: 0,
      project_id: 1,
      next_track_id: null,
      previous_track_id: null,
      audio_clips: []
    });
    const subject = new Selection();
    subject.track = track;

    expect(subject.track).toBe(track);
  });
});
