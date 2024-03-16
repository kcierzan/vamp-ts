import AudioFile from "$lib/models/audio-file.svelte";
import type { TrackData } from "$lib/types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { audioClipData, audioFileData } from "../../../tests/factories";
import Track from "./track.svelte";

vi.mock("./sampler/sampler.ts", () => ({
  default: vi.fn()
}));

describe("static methods", () => {
  let trackData: TrackData;
  let pool: AudioFile[];
  beforeEach(() => {
    const blob = new Blob(["dummy-data"], { type: "audio/wav" });
    const poolFile = audioFileData.build();
    const clipData = audioClipData.associations({ audio_files: poolFile }).build();
    pool = [new AudioFile(poolFile, blob)];

    trackData = {
      id: 1,
      gain: 0,
      name: "My Track",
      panning: 0,
      project_id: 1,
      next_track_id: null,
      previous_track_id: null,
      audio_clips: [clipData]
    };
  });

  describe("constructor", () => {
    it("returns a Track instance", () => {
      const subject = new Track(trackData);

      expect(subject).toBeInstanceOf(Track);
    });
  });

  describe("new", () => {
    it("downloads the audio files for the clips in the track", async () => {
      const subject = Track.new(pool, trackData);

      expect(subject).toBeInstanceOf(Track);
    });
  });
});
