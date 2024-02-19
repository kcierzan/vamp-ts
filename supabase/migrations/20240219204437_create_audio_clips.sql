BEGIN;
CREATE TABLE IF NOT EXISTS audio_files (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  size INTEGER NOT NULL CHECK (size > 0),
  bucket TEXT NOT NULL DEFAULT 'audio_files' CHECK (bucket <> ''),
  path TEXT NOT NULL CHECK (path <> ''),
  description TEXT CHECK (description <> ''),
  mime_type TEXT NOT NULL CHECK (mime_type ~ '^audio/.+$'),
  bpm REAL CHECK (bpm > 0.0)
);
CREATE TABLE IF NOT EXISTS audio_clips (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL CHECK (name <> ''),
  playback_rate DOUBLE PRECISION NOT NULL DEFAULT 1.0 CHECK (playback_rate > 0.0),
  index INTEGER NOT NULL CHECK (index >= 0),
  start_time DOUBLE PRECISION NOT NULL DEFAULT 0.0 CHECK (start_time >= 0.0),
  end_time DOUBLE PRECISION CHECK (end_time >= 0.0),
  track_id BIGINT NOT NULL,
  audio_file_id BIGINT,
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
  FOREIGN KEY (audio_file_id) REFERENCES audio_files(id) ON DELETE
  SET NULL
);
COMMIT;