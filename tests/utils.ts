import type { AudioClipData, AudioFileData, TrackData } from "$lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { vi } from "vitest";

type SingleResultData = AudioClipData | AudioFileData | TrackData | null;

interface SingleResult {
  data: SingleResultData;
  error: null;
}

interface DownloadResult {
  data: Blob;
  error: null;
}

export type MockSupabase = SupabaseClient & { update: () => void; eq: () => void };

const blob = new Blob(["dummy-data"], { type: "audio/wav" });

export function createMockSupabase(
  singleResult: SingleResult = { data: null, error: null },
  downloadResult: DownloadResult = { data: blob, error: null },
  rpcResult: SingleResult = { data: null, error: null }
) {
  return {
    storage: {
      from: vi.fn().mockReturnThis(),
      download: vi.fn().mockImplementation(() => {
        return Promise.resolve(downloadResult);
      }),
      upload: vi.fn().mockResolvedValue({ error: null })
    },
    rpc: vi.fn().mockResolvedValue(rpcResult),
    from: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ error: null }),
    single: vi.fn().mockImplementation(() => Promise.resolve(singleResult))
  } as unknown as MockSupabase;
}
