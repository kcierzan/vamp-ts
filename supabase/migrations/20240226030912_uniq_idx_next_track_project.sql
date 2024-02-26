CREATE UNIQUE INDEX CONCURRENTLY idx_unique_next_track_project
ON tracks (next_track_id, project_id);

