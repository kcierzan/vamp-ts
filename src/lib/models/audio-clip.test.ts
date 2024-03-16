import type { AudioClipData } from "$lib/types";
import { SupabaseClient } from "@supabase/supabase-js";
import omit from "lodash/omit";
import { Transport } from "tone";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AudioClip from "./audio-clip.svelte";
import AudioFile from "./audio-file.svelte";

let audioClipData: AudioClipData;
let audioFile: AudioFile;

vi.mock("./sampler/sampler.ts", () => ({
  default: vi.fn()
}));

beforeEach(() => {
  const audioFileData = {
    id: 1,
    bpm: 120,
    path: "1/my_cool_file.wav::1234567",
    size: 10000,
    bucket: "audio_files",
    mime_type: "audio/wav",
    description: "bass loop"
  };
  audioClipData = {
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
  audioFile = new AudioFile(audioFileData, file);
});

describe("constructor", () => {
  it("should correctly initialize an AudioClip instance", () => {
    const subject = new AudioClip(audioClipData, audioFile);

    expect(subject).toBeInstanceOf(AudioClip);
    expect(subject.state).toBe("STOPPED");
    expect(subject.audioFile.description).toBe("bass loop");
  });
});

describe("fromAudioFile", () => {
  it("should return an AudioClip instance", async () => {
    const mockSupabaseClient = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi
        .fn()
        .mockImplementation(() => Promise.resolve({ data: audioClipData, error: null }))
    } as unknown as SupabaseClient;
    const subject = await AudioClip.fromAudioFile(mockSupabaseClient, audioFile, 0, 1, 120);

    expect(subject).toBeInstanceOf(AudioClip);
    expect(mockSupabaseClient.from).toHaveBeenCalledWith("audio_clips");
    expect(mockSupabaseClient.from("audio_clips").insert).toHaveBeenCalledWith({
      ...omit(audioClipData, "id", "audio_files"),
      name: "my_cool_file.wav"
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

  describe("endTime", () => {
    it("has a getter", () => {
      expect(subject.endTime).toBeNull();
    });
  });

  describe("setStartEndTimes", async () => {
    it("calls supabase to update the audio_clips table", async () => {
      await subject.setStartEndTimes({ supabase: mockSupabaseClient, startTime: 0, endTime: 4800 });

      expect(mockSupabaseClient.from).toHaveBeenCalledWith("audio_clips");
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({ start_time: 0, end_time: 4800 });
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith("id", 1);
    });

    it("sets the endTime property", async () => {
      await subject.setStartEndTimes({ supabase: mockSupabaseClient, startTime: 0, endTime: 1000 });
      expect(subject.startTime).toBe(0);
      expect(subject.endTime).toBe(1000);
      await subject.setStartEndTimes({ supabase: mockSupabaseClient, startTime: 40, endTime: 900 });
      expect(subject.startTime).toBe(40);
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

  describe("scheduleLoop", () => {
    vi.mock("tone", () => ({
      Transport: {
        scheduleRepeat: vi.fn().mockImplementation(() => 1)
      }
    }));

    it("calls Transport.scheduleRepeat", () => {
      subject.scheduleLoop(0);

      expect(Transport.scheduleRepeat).toHaveBeenCalledOnce();
    });

    it("returns the tone transport event integer", () => {
      const playbackEvent = subject.scheduleLoop(0);

      expect(playbackEvent).toBe(1);
    });

    it("sets the state to QUEUED", () => {
      expect(subject.state).toBe("STOPPED");

      subject.scheduleLoop(0);

      expect(subject.state).toBe("QUEUED");
    });
  });

  describe("stretchToBpm", () => {
    it("sets the correct playbackRate", async () => {
      await subject.stretchToBpm(mockSupabaseClient, 128);

      expect(subject.playbackRate).toBe(128 / 120);
    });

    it("calls supabase update with the correct playback rate", async () => {
      await subject.stretchToBpm(mockSupabaseClient, 128);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith("audio_clips");
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({ playback_rate: 128 / 120 });
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith("id", subject.id);
    });
  });
});
