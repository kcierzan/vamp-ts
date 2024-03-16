import type { SupabaseClient } from "@supabase/supabase-js";
import { vi } from "vitest";

export function createMockSupabase() {
  const blob = new Blob(["dummy-data"], { type: "audio/wav" });
  return {
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
}
