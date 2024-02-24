BEGIN;
ALTER TABLE pool_files DROP CONSTRAINT pool_files_pkey;
ALTER TABLE pool_files DROP COLUMN id;
ALTER TABLE pool_files
ADD PRIMARY KEY (project_id, audio_file_id);
COMMIT;