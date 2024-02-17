BEGIN;
CREATE TABLE IF NOT EXISTS projects (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL CHECK (name <> ''),
  description TEXT CHECK (description <> ''),
  bpm REAL NOT NULL DEFAULT 120.0 CHECK (bpm > 0),
  time_signature VARCHAR(5) NOT NULL DEFAULT '4/4' CHECK (time_signature ~ '^\d+/\d+$'),
  created_by_user_id UUID NOT NULL,
  FOREIGN KEY (created_by_user_id) REFERENCES auth.users(id) ON DELETE
  SET NULL
);
CREATE TABLE IF NOT EXISTS tracks (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT,
  panning DOUBLE PRECISION NOT NULL DEFAULT 0.0 CHECK (
    panning >= -1
    AND panning <= 1
  ),
  gain DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  position INTEGER NOT NULL CHECK (position >= 0),
  project_id BIGINT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE (project_id, position) DEFERRABLE INITIALLY DEFERRED
);
COMMIT;