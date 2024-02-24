<script lang="ts">
  import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";
  import { poolStore } from "$lib/stores";
  import type { AudioFile } from "$lib/types";
  import { guessBPM, shortContentHash } from "$lib/utils";
  import { createClient } from "@supabase/supabase-js";
  import random from "lodash/random";
  import Dropzone from "svelte-file-dropzone";
  import Pool from "./Pool.svelte";

  export let projectId: number;
  export let songTitle: string;

  const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

  async function uploadFile(file: File) {
    const hashString = await shortContentHash(file);
    const path = `${projectId}/${file.name}::${hashString}`;
    const { error } = await supabase.storage.from("audio_files").upload(path, file);

    if (error) throw new Error("File upload failed");

    return path;
  }

  async function onDrop(e: CustomEvent<any>) {
    const { acceptedFiles } = e.detail;
    const file = acceptedFiles[0];
    const { bpm } = await guessBPM(file);
    const tempId = random(Number.MAX_SAFE_INTEGER);
    const audioFile: AudioFile = {
      id: tempId,
      bpm,
      name: file.name,
      file,
      description: "",
      size: file.size,
      media_type: file.media_type
    };

    poolStore.createNewPoolFile(audioFile);
    const path = await uploadFile(file);

    // TODO: handle db error by rolling back upload and local updates
    const { data: audioFileId, error: dbError } = await supabase.rpc("insert_audio_pool_file", {
      p_size: file.size,
      p_path: path,
      p_mime_type: file.media_type,
      p_bpm: bpm,
      p_project_id: projectId
    });

    poolStore.updatePoolFile(tempId, { ...audioFile, id: audioFileId });
  }
</script>

<div class="flex w-1/4 flex-col justify-between gap-y-2">
  <Pool />
  <Dropzone on:drop={onDrop} accept="audio/*" />
</div>
