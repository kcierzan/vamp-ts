import type { AudioFileData } from "$lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { audioFileData } from "../../../tests/factories";
import AudioFile from "./audio-file.svelte";

let file: File;
let fileData: AudioFileData;

beforeEach(() => {
  fileData = audioFileData.build({ bpm: 120 });
  file = new File(["1010101010"], "my_cool_file.wav", { type: "audio/wav" });
});

describe("constructor", () => {
  it("should correctly initialize an AudioFile instance", () => {
    const subject = new AudioFile(fileData, file);

    expect(subject).toBeInstanceOf(AudioFile);
    expect(subject.bpm).toBe(120);
    expect(subject.blob).toBe(file);
    expect(subject.bucket).toBe("audio_files");
  });
});

describe("fromFile", () => {
  vi.mock("$lib/utils", () => {
    return {
      guessBPM: vi.fn().mockImplementation(() => {
        return Promise.resolve({ bpm: 120, offset: 0 });
      })
    };
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("should return an AudioFile instance", async () => {
    const mockSupabaseClient = {
      rpc: vi.fn().mockResolvedValue({ data: 4, error: null }),
      storage: {
        from: vi.fn().mockReturnThis(),
        upload: vi.fn().mockImplementation(() => {
          return Promise.resolve({ error: null });
        })
      }
    } as unknown as SupabaseClient;
    const subject = await AudioFile.fromFile(mockSupabaseClient, 14, file);

    expect(subject).toBeInstanceOf(AudioFile);
  });

  it("should call supabase.rpc with the correct function name", async () => {
    const mockSupabaseClient = {
      rpc: vi.fn().mockResolvedValue({ data: 4, error: null }),
      storage: {
        from: vi.fn().mockReturnThis(),
        upload: vi.fn().mockImplementation(() => {
          return Promise.resolve({ error: null });
        })
      }
    } as unknown as SupabaseClient;
    await AudioFile.fromFile(mockSupabaseClient, 14, file);
    const dbFunctionParams = {
      p_size: 10,
      p_path: "14/my_cool_file.wav::F5saPp4xnP8Mpmce",
      p_mime_type: "audio/wav",
      p_bpm: 120,
      p_project_id: 14,
      p_bucket: "audio_files"
    };
    expect(mockSupabaseClient.rpc).toHaveBeenCalledWith("insert_audio_pool_file", dbFunctionParams);
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

    expect(await AudioFile.download(mockSupabaseClient, fileData)).toBe(blob);
    expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith("audio_files");
    expect(mockSupabaseClient.storage.from("audio_files").download).toHaveBeenCalledWith(
      fileData.path
    );
  });
});

describe("fileName", () => {
  it("should return the correct file name", () => {
    fileData = audioFileData.build({ path: "1/my_cool_file.wav::1234hlahfl123" });
    const subject = new AudioFile(fileData, file);

    expect(subject.fileName).toBe("my_cool_file.wav");
  });
});
