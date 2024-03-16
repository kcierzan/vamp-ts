import AudioFile from "$lib/models/audio-file.svelte";
import type { ProjectData } from "$lib/types";
import * as utils from "$lib/utils";
import { Transport } from "tone";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { trackData as trackDataFactory } from "../../../tests/factories";
import audioClipDataFactory from "../../../tests/factories/audio-clip-data";
import projectDataFactory from "../../../tests/factories/project-data";
import { createMockSupabase, type MockSupabase } from "../../../tests/utils";
import type { ProjectParams } from "./project.svelte";
import Project from "./project.svelte";
import Track from "./track.svelte";

let projectParams: ProjectParams;
let projectData: ProjectData;
let mockSupabaseClient: MockSupabase;

vi.mock("./sampler/sampler.ts", () => ({
  default: vi.fn().mockImplementation(() => {
    return {
      stop: vi.fn()
    };
  })
}));

vi.mock("tone", () => ({
  Transport: {
    bpm: {
      value: 120,
      setValueAtTime: vi.fn()
    },
    start: vi.fn(),
    scheduleRepeat: vi.fn(),
    scheduleOnce: vi.fn()
  }
}));

beforeEach(() => {
  const blob = new Blob(["dummy-data"], { type: "audio/wav" });
  const newTrackData = trackDataFactory.build();

  projectData = projectDataFactory.build({}, { transient: { withTrack: true } });

  mockSupabaseClient = createMockSupabase(
    { data: null, error: null },
    { data: blob, error: null },
    { data: newTrackData, error: null }
  );

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
    it("returns an instance of Project", async () => {
      const subject = await Project.new(mockSupabaseClient, projectData);

      expect(subject).toBeInstanceOf(Project);
      expect(subject.pool.length).toBe(1);
      expect(subject.pool[0]).toBeInstanceOf(AudioFile);
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

  describe("setBpm", () => {
    it("sets the project bpm", async () => {
      const subject = new Project(projectParams);

      expect(subject.bpm).toBe(projectData.bpm);
      await subject.setBpm(128);
      expect(subject.bpm).toBe(128);
    });

    it("sets the tone bpm", async () => {
      const subject = new Project(projectParams);

      await subject.setBpm(128);

      expect(Transport.bpm.setValueAtTime).toHaveBeenCalledWith(128, "+0.5");
    });

    it("updates the database", async () => {
      const subject = new Project(projectParams);

      await subject.setBpm(128);

      expect(mockSupabaseClient.update).toHaveBeenCalledOnce();
    });
  });

  describe("playClip", () => {
    it("starts the transport if it is stopped", async () => {
      const subject = await Project.new(mockSupabaseClient, projectData);
      const projectClip = subject.tracks[0].clips[0];

      subject.playClip(projectClip);

      expect(Transport.start).toHaveBeenCalledOnce();
    });

    it("sets the clip to QUEUED", async () => {
      const subject = await Project.new(mockSupabaseClient, projectData);
      const projectClip = subject.tracks[0].clips[0];

      expect(projectClip.state).toBe("STOPPED");
      subject.playClip(projectClip);
      expect(projectClip.state).toBe("QUEUED");
    });
  });

  // TODO: this is tough as it's almost all side-effects
  // describe("stopTrack", () => {});

  describe("moveClipToTrack", () => {
    it("removes the clip from the clip's current track", async () => {
      const subject = await Project.new(mockSupabaseClient, projectData);
      await subject.addTrack();

      const clip = subject.tracks[0].clips[0];
      const originTrack = subject.tracks[0];
      const targetTrack = subject.tracks[1];

      expect(originTrack.clips.length).toBe(1);
      await subject.moveClipToTrack(clip, targetTrack, 0);
      expect(originTrack.clips.length).toBe(0);
    });

    it("add the track to the target track", async () => {
      const subject = await Project.new(mockSupabaseClient, projectData);
      await subject.addTrack();

      const clip = subject.tracks[0].clips[0];
      const targetTrack = subject.tracks[1];

      expect(targetTrack.clips.length).toBe(0);
      await subject.moveClipToTrack(clip, targetTrack, 0);
      expect(targetTrack.clips.length).toBe(1);
    });

    it("updates the clip index", async () => {
      const subject = await Project.new(mockSupabaseClient, projectData);
      await subject.addTrack();

      const clip = subject.tracks[0].clips[0];
      const originalIndex = clip.index;
      const targetTrack = subject.tracks[1];

      await subject.moveClipToTrack(clip, targetTrack, originalIndex + 1);
      expect(clip.index).toBe(originalIndex + 1);
    });

    it("updates the clip record in the database", async () => {
      const subject = await Project.new(mockSupabaseClient, projectData);
      await subject.addTrack();

      const clip = subject.tracks[0].clips[0];
      const targetTrack = subject.tracks[1];

      await subject.moveClipToTrack(clip, targetTrack, 4);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("audio_clips");
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({
        track_id: targetTrack.id,
        index: 4
      });
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith("id", clip.id);
    });

    it("updates the clip's track_id", async () => {
      const subject = await Project.new(mockSupabaseClient, projectData);
      await subject.addTrack();

      const clip = subject.tracks[0].clips[0];
      const originTrack = subject.tracks[0];
      const targetTrack = subject.tracks[1];

      expect(clip.trackId).toBe(originTrack.id);
      await subject.moveClipToTrack(clip, targetTrack, 4);
      expect(clip.trackId).toBe(targetTrack.id);
    });
  });

  describe("moveAudioFileToTrack", () => {
    it("adds a clip to the target track", async () => {
      const audioClipData = audioClipDataFactory.build({
        index: 4,
        playback_rate: projectData.bpm / projectData.audio_files[0].bpm,
        audio_file_id: projectData.audio_files[0].id
      });
      const newTrackData = trackDataFactory.build();

      mockSupabaseClient = createMockSupabase({ data: audioClipData, error: null }, undefined, {
        data: newTrackData,
        error: null
      });
      const subject = await Project.new(mockSupabaseClient, projectData);
      await subject.addTrack();

      const audioFile = subject.pool[0];
      const targetTrack = subject.tracks[1];

      expect(targetTrack.clips.length).toBe(0);
      await subject.moveAudioFileToTrack(audioFile, 4, targetTrack);
      expect(targetTrack.clips.length).toBe(1);
      expect(targetTrack.clips[0].audioFile).toBe(audioFile);
      expect(targetTrack.clips[0].index).toBe(4);
    });
  });

  describe("uploadFileToPool", () => {
    beforeEach(() => {
      vi.spyOn(utils, "guessBPM").mockResolvedValue({ bpm: 120, offset: 0 });
    });

    it("creates a new file and adds it to the pool", async () => {
      const subject = await Project.new(mockSupabaseClient, projectData);
      const file = new File(["dummy-data"], "my_cool_file.wav", { type: "audio/wav" });

      expect(subject.pool.length).toBe(1);
      await subject.uploadFileToPool(file);
      expect(subject.pool.length).toBe(2);
    });
  });
});
