<script lang="ts">
  import { poolStore } from "$lib/stores";
  import type { AudioFile, ProjectContext } from "$lib/types";
  import { guessBPM, shortContentHash } from "$lib/utils";
  import random from "lodash/random";
  import { getContext } from "svelte";
  import Dropzone from "svelte-file-dropzone";
  import Pool from "./Pool.svelte";

  const BUCKET = "audio_files";
  const { project, supabase } = getContext<ProjectContext>("project");

  async function uploadFile(file: File) {
    const hashString = await shortContentHash(file);
    const path = `${project.id}/${file.name}::${hashString}`;
    const { error, data } = await supabase.storage.from("audio_files").upload(path, file);

    console.log(`Upload data: ${JSON.stringify(data)}`);
    if (error) throw new Error(`File upload failed: ${error.message}`);

    return path;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function onDrop(e: CustomEvent<any>) {
    const { acceptedFiles } = e.detail;
    const file = acceptedFiles[0];
    console.log(file);
    const { bpm } = await guessBPM(file);
    const tempId = random(Number.MAX_SAFE_INTEGER);
    const audioFile: AudioFile = {
      id: tempId,
      bpm,
      name: file.name,
      file,
      path: "",
      bucket: BUCKET,
      description: "",
      size: file.size,
      media_type: file.type
    };

    poolStore.createNewPoolFile(audioFile);
    const path = await uploadFile(file);

    const functionArgs = {
      p_size: file.size,
      p_path: path,
      p_mime_type: file.type,
      p_bpm: bpm,
      p_project_id: project.id,
      p_bucket: BUCKET
    };

    // TODO: handle db error by rolling back upload and local updates
    const { data: audioFileId, error } = await supabase.rpc("insert_audio_pool_file", functionArgs);
    if (error) throw new Error(`Pool file insert error: ${error.message}`);

    poolStore.updatePoolFile(tempId, { ...audioFile, id: audioFileId, path });
  }
</script>

<div class="flex w-1/4 flex-col justify-between gap-y-2">
  <Pool />
  <Dropzone on:drop={onDrop} accept="audio/*" />
</div>
