import type { SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import AudioFileData, { type AudioFileDataConstructorParams } from "./audio-file-data.svelte";
import AudioFile from "./audio-file.svelte";

let file: File;
let audioFileData: AudioFileData;

beforeEach(() => {
  const params: AudioFileDataConstructorParams = {
    id: 1,
    bpm: 120,
    path: "1/my_cool_file.wave::1234567",
    size: 10000,
    bucket: "audio_files",
    mime_type: "audio/wav",
    description: "bass loop"
  };
  audioFileData = new AudioFileData(params);
  file = new File(["1010101010"], "my_cool_file.wav", { type: "audio/wav" });
});

describe("constructor", () => {
  it("should correctly initialize an AudioFile instance", () => {
    const subject = new AudioFile({ audioFileData, file });

    expect(subject).toBeInstanceOf(AudioFile);
    expect(subject.bpm).toBe(120);
    expect(subject.file).toBe(file);
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
