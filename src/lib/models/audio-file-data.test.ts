import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import AudioFileData from "./audio-file-data.svelte";

const id = 1;
const bpm = 120;
const size = 47812938;
const path = "1/my_cool_file.wav::1234567";
const bucket = "audio_files";
const mimeType = "audio/wav";
const description = "a cool file";

describe("constructor", () => {
  it("should correctly initialize an AudioFileData instance", () => {
    const subject = new AudioFileData(id, bpm, path, size, bucket, mimeType, description);

    expect(subject).toBeInstanceOf(AudioFileData);
  });
});

describe("fileName", () => {
  it("should return the correct file name", () => {
    const audioFileData = new AudioFileData(id, bpm, path, size, bucket, mimeType, description);

    expect(audioFileData.fileName).toBe("my_cool_file.wav");
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
    const audioFileData = new AudioFileData(id, bpm, path, size, bucket, mimeType, description);

    expect(await audioFileData.downloadFile(mockSupabaseClient)).toBe(blob);
    expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith("audio_files");
    expect(mockSupabaseClient.storage.from("audio_files").download).toHaveBeenCalledWith(path);
  });
});
