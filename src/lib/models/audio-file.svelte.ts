import type { ProjectID } from "$lib/types";
import { guessBPM } from "$lib/utils";
import type { SupabaseClient } from "@supabase/supabase-js";
import AudioFileData, { type AudioFileDataConstructorParams } from "./audio-file-data.svelte";

const BUCKET_NAME = "audio_files";
const INSERT_AUDIO_FILE_FUNCTION = "insert_audio_pool_file";

interface AudioFileConstructorParams {
  audioFileData: AudioFileData;
  file: Blob;
}

export default class AudioFile extends AudioFileData {
  public readonly file: Blob;

  constructor(params: AudioFileConstructorParams) {
    const { audioFileData, file } = params;
    super(audioFileData.toParams());
    this.file = file;
  }

  public static async fromFile(
    supabase: SupabaseClient,
    projectId: ProjectID,
    file: File,
    bucket: string = BUCKET_NAME
  ) {
    // TODO: How do we add this to our pool array?
    const path = await this.uploadFile(supabase, projectId, file, bucket);
    const { bpm } = await guessBPM(file);
    const insertParams = {
      p_size: file.size,
      p_path: path,
      p_mime_type: file.type,
      p_bpm: bpm,
      p_project_id: projectId,
      p_bucket: BUCKET_NAME
    };
    const { data: audioFileId, error } = await supabase.rpc(
      INSERT_AUDIO_FILE_FUNCTION,
      insertParams
    );

    if (error) throw new Error(error.message);

    const audioFileDataParams: AudioFileDataConstructorParams = {
      id: audioFileId,
      bpm,
      path,
      size: file.size,
      bucket,
      mime_type: file.type,
      description: null
    };
    const audioFileData = new AudioFileData(audioFileDataParams);

    return new AudioFile({ audioFileData, file });
  }

  private static async uploadFile(
    supabase: SupabaseClient,
    projectId: ProjectID,
    file: File,
    bucket: string = BUCKET_NAME
  ) {
    const hashString = await this.shortContentHash(file);
    const path = `${projectId}/${file.name}::${hashString}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);

    if (error) throw new Error(`File upload failed: ${error.message}`);

    return path;
  }

  private static async shortContentHash(file: File): Promise<string> {
    // Read the file as an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Hash the ArrayBuffer using SHA-256
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);

    // Convert the hash to a Base64 string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashBase64 = btoa(String.fromCharCode(...hashArray));

    // Truncate the Base64 string to 16 characters and return
    return hashBase64.substring(0, 16);
  }
}
