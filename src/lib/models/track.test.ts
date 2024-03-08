import { it, describe, expect, beforeEach, vi } from "vitest";
import Track from "./track.svelte";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { TrackData } from "$lib/types";

let mockSupabaseClient: SupabaseClient;

vi.mock("./sampler/sampler.ts", () => ({
  default: vi.fn()
}));

describe("static methods", () => {
  let trackData: TrackData;
  beforeEach(() => {
    const blob = new Blob(["dummy-data"], { type: "audio/wav" });
    const audioFileData = {
      id: 1,
      bpm: 120,
      path: "1/my_cool_file.wave::1234567",
      size: 10000,
      bucket: "audio_files",
      mime_type: "audio/wav",
      description: "my looop"
    };
    const audioClipData = {
      id: 2,
      name: "cool loop",
      index: 0,
      start_time: 0,
      end_time: null,
      track_id: 3,
      audio_files: audioFileData,
      audio_file_id: 1,
      playback_rate: 1.0
    };
    trackData = {
      id: 1,
      gain: 0,
      name: "My Track",
      panning: 0,
      project_id: 1,
      next_track_id: null,
      previous_track_id: null,
      audio_clips: [audioClipData]
    };

    mockSupabaseClient = {
      storage: {
        from: vi.fn().mockReturnThis(),
        download: vi.fn().mockImplementation(() => {
          return Promise.resolve({ data: blob, error: null });
        })
      },
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() => Promise.resolve({ data: null, error: null }))
    } as unknown as SupabaseClient;
  });

  describe("constructor", () => {
    it("returns a Track instance", () => {
      const subject = new Track(trackData);

      expect(subject).toBeInstanceOf(Track);
    });
  });

  describe("new", () => {
    it("downloads the audio files for the clips in the track", async () => {
      const subject = await Track.new(mockSupabaseClient, trackData);

      expect(subject).toBeInstanceOf(Track);
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith("audio_files");
      expect(mockSupabaseClient.storage.from("audio_files").download).toHaveBeenCalledWith(
        "1/my_cool_file.wave::1234567"
      );
    });
  });
});
