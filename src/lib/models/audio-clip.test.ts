import { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AudioClipData from "./audio-clip-data.svelte";
import AudioClip from "./audio-clip.svelte";
import AudioFileData from "./audio-file-data.svelte";
import AudioFile from "./audio-file.svelte";

const audioFileData = new AudioFileData(
  1,
  120,
  "1/my_cool_file.wav::1234567",
  10000,
  "audio_files",
  "audio/wav",
  "bass loop"
);

const file = new File([""], "my_cool_file.wav", { type: "audio/wav" });

vi.mock("./sampler/sampler.ts", () => ({
  default: vi.fn()
}));

describe("constructor", () => {
  it("should correctly initialize an AudioClip instance", () => {
    const audioClipData = new AudioClipData(1, "my_cool_file", 0, 0, null, 1, audioFileData, 1, 1);
    const audioFile = new AudioFile(audioFileData, file);

    const subject = new AudioClip(audioClipData, audioFile);

    expect(subject).toBeInstanceOf(AudioClip);
    expect(subject.state).toBe("STOPPED");
    expect(subject.audioFileData.description).toBe("bass loop");
  });
});

describe("fromAudioFile", () => {
  it("should return an AudioClip instance", async () => {
    const data = {
      name: "my_cool_file.wav",
      index: 0,
      start_time: 0,
      end_time: null,
      track_id: 1,
      audio_file_id: 1,
      playback_rate: 1
    };
    const mockSupabaseClient = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi
        .fn()
        .mockImplementation(() => Promise.resolve({ data: { ...data, id: 1 }, error: null }))
    } as unknown as SupabaseClient;
    const audioFile = new AudioFile(audioFileData, file);

    const subject = await AudioClip.fromAudioFile(mockSupabaseClient, audioFile, 0, 1, 120);

    expect(subject).toBeInstanceOf(AudioClip);
    expect(mockSupabaseClient.from).toHaveBeenCalledWith("audio_clips");
    expect(mockSupabaseClient.from("audio_clips").insert).toHaveBeenCalledWith({
      ...data,
      type: "audio/wav"
    });
  });
});

describe("instance methods", () => {
  type MockSupabase = SupabaseClient & { update: () => void; eq: () => void };
  let mockSupabaseClient: MockSupabase;
  let subject: AudioClip;

  beforeEach(() => {
    mockSupabaseClient = {
      from: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null })
    } as unknown as MockSupabase;
    const audioClipData = new AudioClipData(1, "my_cool_file", 0, 0, null, 1, audioFileData, 1, 1);
    const audioFile = new AudioFile(audioFileData, file);

    subject = new AudioClip(audioClipData, audioFile);
  });

  describe("state", () => {
    it("should return STOPPED by default", () => {
      expect(subject.state).toBe("STOPPED");
    });

    it("can be set to other valid playback states", () => {
      expect(subject.state).toBe("STOPPED");
      subject.state = "QUEUED";
      expect(subject.state).toBe("QUEUED");
      subject.state = "PLAYING";
      expect(subject.state).toBe("PLAYING");
    });
  });

  describe("startTime", () => {
    it("has a getter", () => {
      expect(subject.startTime).toBe(0);
    });
  });

  describe("setStarttime", () => {
    it("calls supabase to update the audio_clips table", async () => {
      await subject.setStartTime(mockSupabaseClient, 12);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith("audio_clips");
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({ start_time: 12 });
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith("id", 1);
    });

    it("sets the startTime", async () => {
      await subject.setStartTime(mockSupabaseClient, 1234);

      expect(subject.startTime).toBe(1234);
    });
  });

  describe("endTime", () => {
    it("has a getter", () => {
      expect(subject.endTime).toBeNull();
    });
  });

  describe("setEndTime", async () => {
    it("calls supabase to update the audio_clips table", async () => {
      await subject.setEndTime(mockSupabaseClient, 4800);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith("audio_clips");
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({ end_time: 4800 });
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith("id", 1);
    });

    it("sets the endTime property", async () => {
      await subject.setEndTime(mockSupabaseClient, 1234);
      expect(subject.endTime).toBe(1234);
      await subject.setEndTime(mockSupabaseClient, 900);
      expect(subject.endTime).toBe(900);
    });
  });

  describe("playbackRate", () => {
    it("has a getter", () => {
      expect(subject.playbackRate).toBe(1);
    });
  });

  describe("setPlaybackRate", () => {
    it("calls supabase to update the audio_clips table", async () => {
      await subject.setPlaybackRate(mockSupabaseClient, 1.28);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith("audio_clips");
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({ playback_rate: 1.28 });
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith("id", 1);
    });
  });
});
