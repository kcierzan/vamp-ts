import AudioClip from "$lib/models/audio-clip.svelte";
import AudioFile from "$lib/models/audio-file.svelte";
import type { TrackData } from "$lib/types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  audioClipData,
  audioFileData,
  trackData as trackDataFactory
} from "../../../tests/factories";
import audioFileDataFactory from "../../../tests/factories/audio-file-data";
import { createMockSupabase } from "../../../tests/utils";
import Track from "./track.svelte";

vi.mock("./sampler/sampler.ts", () => ({
  default: vi.fn()
}));

vi.mock("tone", () => ({
  Transport: {
    start: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    clear: vi.fn(),
    scheduleRepeat: vi.fn(),
    scheduleOnce: vi.fn(),
    bpm: {
      value: 120
    }
  }
}));

describe("static methods", () => {
  let trackData: TrackData;
  let pool: AudioFile[];
  beforeEach(() => {
    const blob = new Blob(["dummy-data"], { type: "audio/wav" });
    const poolFile = audioFileData.build();
    const clipData = audioClipData.associations({ audio_files: poolFile }).build();
    pool = [new AudioFile(poolFile, blob)];

    trackData = trackDataFactory.build({}, { associations: { audio_clips: [clipData] } });
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

  describe("fromAudioFile", () => {
    it("creates a new track and clip from an audio file", async () => {
      const rpcResult = trackDataFactory.build({}, { transient: { withClip: true } });
      const supabaseClient = createMockSupabase(undefined, undefined, {
        data: rpcResult,
        error: null
      });
      const fileData = audioFileData.build();
      const blob = new Blob(["data"], { type: "audio/wav" });
      const audioFile = new AudioFile(fileData, blob);

      const subject = await Track.fromAudioFile(supabaseClient, 1, audioFile);

      expect(subject).toBeInstanceOf(Track);
      expect(supabaseClient.rpc).toHaveBeenCalledWith("insert_track_from_pool_file", {
        p_audio_file_id: audioFile.id,
        p_project_id: 1,
        p_clip_name: audioFile.fileName,
        p_playback_rate: 120 / audioFile.bpm
      });
      expect(subject.clips[0].audioFile).toBe(audioFile);
    });
  });

  describe("fromAudioClip", () => {
    it("creates a new track from an audio clip", async () => {
      const rpcResult = trackDataFactory.build({}, { transient: { withClip: true } });
      const supabaseClient = createMockSupabase(undefined, undefined, {
        data: rpcResult,
        error: null
      });
      const blob = new Blob(["data"], { type: "audio/wav" });
      const audioFile = new AudioFile(rpcResult.audio_clips[0].audio_files, blob);
      const audioClip = new AudioClip(rpcResult.audio_clips[0], audioFile);

      const subject = await Track.fromAudioClip(supabaseClient, 1, audioClip);

      expect(subject).toBeInstanceOf(Track);
      expect(supabaseClient.rpc).toHaveBeenCalledWith("insert_track_from_audio_clip", {
        p_clip_id: audioClip.id,
        p_project_id: 1
      });
      expect(subject.clips[0]).toStrictEqual(audioClip);
      expect(subject.clips[0].audioFile).toStrictEqual(audioFile);
    });
  });
});

describe("instance methods", () => {
  describe("isFirstTrack", () => {
    it("returns true when the previous track id is null", () => {
      const trackData = trackDataFactory.build({ previous_track_id: null });
      const subject = new Track(trackData);

      expect(subject.isFirstTrack).toBeTruthy;
    });

    it("returns false if the previous track id is a number", () => {
      const trackData = trackDataFactory.build({ previous_track_id: 2 });
      const subject = new Track(trackData);

      expect(subject.isFirstTrack).toBeFalsy;
    });
  });

  describe("playClip", () => {
    it("sets the clip state to queued", () => {
      const trackData = trackDataFactory.build({}, { transient: { withClip: true } });
      const blob = new Blob(["dummy-data"], { type: "audio/wav" });
      const audioFile = new AudioFile(trackData.audio_clips[0].audio_files, blob);
      const clip = new AudioClip(trackData.audio_clips[0], audioFile);
      const subject = new Track(trackData, clip);

      subject.playClip(clip, "+0.001");

      expect(subject.queued).toBe(clip);
      expect(subject.clips[0].state).toBe("QUEUED");
    });
  });

  describe("addClip", () => {
    it("adds a clip to the array of clips", () => {
      const blob = new Blob(["dummy-data"], { type: "audio/wav" });
      const trackData = trackDataFactory.build();
      const audioFileData = audioFileDataFactory.build();
      const clipData = audioClipData.build();

      const audioFile = new AudioFile(audioFileData, blob);
      const clip = new AudioClip(clipData, audioFile);

      const subject = new Track(trackData);

      expect(subject.clips.length).toBe(0);
      subject.addClip(clip);
      expect(subject.clips.length).toBe(1);
      expect(subject.clips[0]).toBe(clip);
    });
  });
});
