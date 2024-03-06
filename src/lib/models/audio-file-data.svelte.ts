import type { AudioFileID } from "$lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET_NAME = "audio_files";

export interface AudioFileDataConstructorParams {
  id: AudioFileID;
  bpm: number;
  path: string;
  size: number;
  bucket: string;
  mime_type: string;
  description: string | null;
}

export default class AudioFileData {
  public readonly id: AudioFileID;
  public readonly bpm: number;
  public readonly path: string;
  public readonly size: number;
  public readonly bucket: string = BUCKET_NAME;
  public readonly mimeType: string;
  public readonly description: string | null;

  constructor(params: AudioFileDataConstructorParams) {
    const { id, bpm, path, size, bucket: bucket = BUCKET_NAME, mime_type, description } = params;
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

  toParams() {
    return {
      id: this.id,
      bpm: this.bpm,
      path: this.path,
      size: this.size,
      bucket: this.bucket,
      mime_type: this.mimeType,
      description: this.description
    };
  }
}
