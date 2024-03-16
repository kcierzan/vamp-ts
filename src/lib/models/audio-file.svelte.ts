import type { AudioFileData, AudioFileID, ProjectID } from "$lib/types";
import { guessBPM } from "$lib/utils";
import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET_NAME = "audio_files";
const INSERT_AUDIO_FILE_FUNCTION = "insert_audio_pool_file";

export default class AudioFile {
  public readonly id: AudioFileID;
  readonly _bpm: number;
  readonly _size: number;
  readonly _path: string;
  readonly _bucket: string;
  readonly _mimeType: string;
  readonly _description: string | null;
  readonly blob: Blob;

  constructor(params: AudioFileData, blob: Blob) {
    const { id, bpm, size, path, bucket, mime_type, description } = params;
    this.id = id;
    this._bpm = bpm;
    this._size = size;
    this._path = path;
    this._bucket = bucket;
    this._mimeType = mime_type;
    this._description = description;
    this.blob = blob;
  }

  get bpm() {
    return this._bpm;
  }

  get size() {
    return this._size;
  }

  get path() {
    return this._path;
  }

  get bucket() {
    return this._bucket;
  }

  get mimeType() {
    return this._mimeType;
  }

  get description() {
    return this._description;
  }

  get fileName() {
    return this.path.split("/")[1].split("::")[0];
  }

  static get bucketName() {
    return BUCKET_NAME;
  }

  public static async fromFile(
    supabase: SupabaseClient,
    projectId: ProjectID,
    file: File,
    bucket: string = BUCKET_NAME
  ) {
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

    const audioFileData: AudioFileData = {
      id: audioFileId,
      bpm,
      path,
      size: file.size,
      bucket,
      mime_type: file.type,
      description: null
    };

    return new AudioFile(audioFileData, file);
  }

  static async download(supabase: SupabaseClient, audioFileData: AudioFileData): Promise<Blob> {
    const { data, error } = await supabase.storage.from(BUCKET_NAME).download(audioFileData.path);
    if (error || !data) throw new Error(error.message);
    return data as Blob;
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
