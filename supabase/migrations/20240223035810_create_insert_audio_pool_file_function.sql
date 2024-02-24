CREATE OR REPLACE FUNCTION insert_audio_pool_file(
    p_size INTEGER,
    p_path TEXT,
    p_mime_type TEXT,
    p_bpm REAL,
    p_project_id BIGINT,
    p_bucket TEXT DEFAULT 'audio_files'
  ) RETURNS BIGINT AS $$
DECLARE v_audio_file_id BIGINT;
BEGIN -- Insert into audio_files and get the generated id
INSERT INTO audio_files (size, bucket, path, description, mime_type, bpm)
VALUES (
    p_size,
    p_bucket,
    p_path,
    p_mime_type,
    p_bpm
  )
RETURNING id INTO v_audio_file_id;
-- Use the retrieved id to insert into pool_files
INSERT INTO pool_files (audio_file_id, project_id)
VALUES (v_audio_file_id, p_project_id);
-- Commit the transaction
RETURN v_audio_file_id;
END;
$$ LANGUAGE plpgsql;