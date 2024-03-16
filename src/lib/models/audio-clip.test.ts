import type { AudioClipData } from "$lib/types";
import { Transport } from "tone";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { audioClipData, audioFileData } from "../../../tests/factories";
import { createMockSupabase, type MockSupabase } from "../../../tests/utils";
import AudioClip from "./audio-clip.svelte";
import AudioFile from "./audio-file.svelte";

let clipData: AudioClipData;
let audioFile: AudioFile;

vi.mock("./sampler/sampler.ts", () => ({
  default: vi.fn()
}));

beforeEach(() => {
  const fileData = audioFileData.build({ description: "bass loop" });
  clipData = audioClipData.build({ name: "my_cool_file.wav" });

  const file = new File([""], "my_cool_file.wav", { type: "audio/wav" });
  audioFile = new AudioFile(fileData, file);
});

describe("constructor", () => {
  it("should correctly initialize an AudioClip instance", () => {
    const subject = new AudioClip(clipData, audioFile);

    expect(subject).toBeInstanceOf(AudioClip);
    expect(subject.state).toBe("STOPPED");
    expect(subject.audioFile.description).toBe("bass loop");
  });
});

describe("fromAudioFile", () => {
  it("should return an AudioClip instance", async () => {
    const supabaseClient = createMockSupabase({ data: clipData, error: null });
    const subject = await AudioClip.fromAudioFile(supabaseClient, audioFile, 0, 1, 120);
    const insertParams = {
      name: audioFile.fileName,
      index: 0,
      track_id: 1,
      playback_rate: 120 / audioFile.bpm,
      audio_file_id: audioFile.id,
      start_time: 0,
      end_time: null
    };

    expect(subject).toBeInstanceOf(AudioClip);
    expect(supabaseClient.from).toHaveBeenCalledWith("audio_clips");
    expect(supabaseClient.from("audio_clips").insert).toHaveBeenCalledWith(insertParams);
  });
});

describe("instance methods", () => {
  let supabaseClient: MockSupabase;
  let subject: AudioClip;

  beforeEach(() => {
    supabaseClient = createMockSupabase();
    subject = new AudioClip(clipData, audioFile);
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
      await subject.setStartEndTimes({ supabase: supabaseClient, startTime: 0, endTime: 4800 });

      expect(supabaseClient.from).toHaveBeenCalledWith("audio_clips");
      expect(supabaseClient.update).toHaveBeenCalledWith({ start_time: 0, end_time: 4800 });
      expect(supabaseClient.eq).toHaveBeenCalledWith("id", clipData.id);
    });

    it("sets the endTime property", async () => {
      await subject.setStartEndTimes({ supabase: supabaseClient, startTime: 0, endTime: 1000 });
      expect(subject.startTime).toBe(0);
      expect(subject.endTime).toBe(1000);
      await subject.setStartEndTimes({ supabase: supabaseClient, startTime: 40, endTime: 900 });
      expect(subject.startTime).toBe(40);
      expect(subject.endTime).toBe(900);
    });
  });

  describe("playbackRate", () => {
    it("has a getter", () => {
      expect(subject.playbackRate).toBe(clipData.playback_rate);
    });
  });

  describe("setPlaybackRate", () => {
    it("calls supabase to update the audio_clips table", async () => {
      await subject.setPlaybackRate(supabaseClient, 1.28);

      expect(supabaseClient.from).toHaveBeenCalledWith("audio_clips");
      expect(supabaseClient.update).toHaveBeenCalledWith({ playback_rate: 1.28 });
      expect(supabaseClient.eq).toHaveBeenCalledWith("id", clipData.id);
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
      await subject.stretchToBpm(supabaseClient, 128);

      expect(subject.playbackRate).toBe(128 / audioFile.bpm);
    });

    it("calls supabase update with the correct playback rate", async () => {
      await subject.stretchToBpm(supabaseClient, 128);

      expect(supabaseClient.from).toHaveBeenCalledWith("audio_clips");
      expect(supabaseClient.update).toHaveBeenCalledWith({ playback_rate: 128 / audioFile.bpm });
      expect(supabaseClient.eq).toHaveBeenCalledWith("id", subject.id);
    });
  });
});
