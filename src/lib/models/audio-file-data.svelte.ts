import type { AudioFileID } from "$lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET_NAME = "audio_files";

export default class AudioFileData {
  public readonly id: AudioFileID;
  public readonly bpm: number;
  public readonly path: string;
  public readonly size: number;
  public readonly bucket: string = BUCKET_NAME;
  public readonly mimeType: string;
  public readonly description: string | null;

  constructor(
    id: AudioFileID,
    bpm: number,
    path: string,
    size: number,
    bucket: string,
    mime_type: string,
    description: string | null
  ) {
    this.id = id;
    this.bpm = bpm;
    this.path = path;
    this.size = size;
    this.bucket = bucket;
    this.mimeType = mime_type;
    this.description = description;
  }

  get fileName() {
    return this.path.split("/")[1].split("::")[0];
  }

  public async downloadFile(supabase: SupabaseClient): Promise<Blob> {
    const { data, error } = await supabase.storage.from(BUCKET_NAME).download(this.path);
    if (error || !data) throw new Error(error.message);
    return data;
  }
}
