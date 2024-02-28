CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_unique_previous_track_project
ON tracks (previous_track_id, project_id);
