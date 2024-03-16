<script lang="ts">
  import { round } from "../utils";
  import { getProjectContext } from "$lib/utils";

  const project = getProjectContext();
</script>

{#if project?.selection.clip}
  <div class="flex flex-row gap-x-2">
    <div>
      <span class="font-semibold">BPM: </span>
      {project?.selection.clip.audioFile.bpm ?? "N/A"}
    </div>
    <div>
      <span class="font-semibold">Playback Rate: </span>
      {project?.selection.clip.playbackRate}
    </div>
    <div>
      <span class="font-semibold">Start: </span>
      {round(project?.selection.clip.startTime ?? 0, 1_000)}
    </div>
    <div>
      <span class="font-semibold">End: </span>
      {project?.selection.clip.endTime
        ? round(project.selection.clip.endTime, 1_000)
        : round(project?.selection.clip?.duration ?? 0, 1_000)}
    </div>
    <div>
      <span class="font-semibold">Size: </span>
      {project?.selection.clip.audioFile
        ? `${round(project.selection.clip.audioFile.size / 1_000_000, 10_000)} MB`
        : "N/A"}
    </div>
  </div>
{/if}
