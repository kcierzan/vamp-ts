import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AudioFileData, { type AudioFileDataConstructorParams } from "./audio-file-data.svelte";

let subject: AudioFileData;
let params: AudioFileDataConstructorParams;

beforeEach(() => {
  params = {
    id: 1,
    bpm: 120,
    size: 47812938,
    path: "1/my_cool_file.wav::1234567",
    bucket: "audio_files",
    mime_type: "audio/wav",
    description: "a cool file"
  };
  subject = new AudioFileData(params);
});

describe("constructor", () => {
  it("should correctly initialize an AudioFileData instance", () => {
    expect(subject).toBeInstanceOf(AudioFileData);
  });
});

describe("fileName", () => {
  it("should return the correct file name", () => {
    expect(subject.fileName).toBe("my_cool_file.wav");
  });
});

describe("downloadFile", () => {
  it("should download a file and return a Blob", async () => {
    const blob = new Blob(["dummy-data"], { type: "audio/wav" });
    const mockSupabaseClient = {
      storage: {
        from: vi.fn().mockReturnThis(),
        download: vi.fn().mockImplementation(() => Promise.resolve({ data: blob, error: null }))
      }
    } as unknown as SupabaseClient;

    expect(await subject.downloadFile(mockSupabaseClient)).toBe(blob);
    expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith("audio_files");
    expect(mockSupabaseClient.storage.from("audio_files").download).toHaveBeenCalledWith(
      params.path
    );
  });
});
