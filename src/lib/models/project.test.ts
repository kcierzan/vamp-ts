import type { ProjectData } from "$lib/types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProjectParams } from "./project.svelte";
import type { SupabaseClient } from "@supabase/supabase-js";
import Project from "./project.svelte";
import AudioFile from "./audio-file.svelte";
import Track from "./track.svelte";

let projectParams: ProjectParams;
let projectData: ProjectData;
let mockSupabaseClient: SupabaseClient;

vi.mock("./sampler/sampler.ts", () => ({
  default: vi.fn()
}));

beforeEach(() => {
  const blob = new Blob(["dummy-data"], { type: "audio/wav" });
  const trackData = {
    id: 1,
    gain: 0,
    name: "my track",
    panning: 0,
    project_id: 1,
    next_track_id: null,
    previous_track_id: null,
    audio_clips: []
  };

  const newTrack = {
    id: 2,
    gain: 0,
    name: "new track",
    panning: 0,
    project_id: 1,
    next_track_id: null,
    previous_track_id: 1,
    audio_clips: []
  };

  const audioFileData = {
    id: 1,
    bpm: 120,
    path: "1/my_cool_file.wave::1234567",
    size: 10000,
    bucket: "audio_files",
    mime_type: "audio/wav",
    description: "my looop"
  };

  projectData = {
    id: 2,
    name: "My Project",
    bpm: 128,
    description: "A fun project",
    time_signature: "4/4",
    created_by_user_id: "1234578-182737812-1231221",
    tracks: [trackData],
    audio_files: [audioFileData]
  };

  mockSupabaseClient = {
    storage: {
      from: vi.fn().mockReturnThis(),
      download: vi.fn().mockImplementation(() => {
        return Promise.resolve({ data: blob, error: null });
      })
    },
    rpc: vi.fn().mockImplementation(() => Promise.resolve({ data: newTrack, error: null })),
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() => Promise.resolve({ data: null, error: null }))
  } as unknown as SupabaseClient;

  projectParams = { supabase: mockSupabaseClient, projectData, tracks: [], pool: [] };
});

describe("static methods", () => {
  describe("constructor", () => {
    it("returns an instance of Project", () => {
      const subject = new Project(projectParams);

      expect(subject).toBeInstanceOf(Project);
    });
  });

  describe("new", () => {
    vi.mock("./audio-file.svelte", () => ({
      default: class {
        static download = vi.fn();
      }
    }));

    it("downloads the audio files for the pool", async () => {
      const subject = await Project.new(mockSupabaseClient, projectData);

      expect(subject).toBeInstanceOf(Project);
      expect(AudioFile.download).toHaveBeenCalledOnce();
    });
  });
});

describe("instance methods", () => {
  describe("addTrack", () => {
    it("inserts a track and pushes it onto the tracks array", async () => {
      const project = await Project.new(mockSupabaseClient, projectData);
      expect(project.tracks.length).toBe(1);
      await project.addTrack();

      expect(project.tracks.length).toBe(2);
      expect(project.tracks.at(-1)).toBeInstanceOf(Track);
    });

    it("sets the appropriate next and previous track values", async () => {
      const project = await Project.new(mockSupabaseClient, projectData);
      await project.addTrack();

      expect(project.tracks.at(-1)).toBeInstanceOf(Track);
      expect(project.tracks[0].nextTrackId).toBe(project.tracks.at(-1)!.id);
      expect(project.tracks.at(-1)!.previousTrackId).toBe(project.tracks[0].id);
    });
  });
});
