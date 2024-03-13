CREATE OR REPLACE FUNCTION insert_empty_track (
    p_project_id BIGINT
) RETURNS tracks AS $$
DECLARE
    v_project_track_count BIGINT;
    v_current_last_track_id BIGINT;
    v_new_track tracks;
BEGIN
    -- Get the track count for the project
  SELECT COUNT(*)
    INTO v_project_track_count
    FROM tracks
   WHERE project_id = p_project_id;

    -- Get the current last  track
  SELECT id
    INTO v_current_last_track_id
    FROM tracks
   WHERE project_id = p_project_id
     AND next_track_id IS NULL;

    IF v_current_last_track_id IS NOT NULL THEN
        INSERT INTO tracks (name, project_id, previous_track_id)
        VALUES ('Track ' || v_project_track_count + 1, p_project_id, v_current_last_track_id)
     RETURNING * INTO v_new_track;

      UPDATE tracks
         SET next_track_id = v_new_track.id
       WHERE id = v_current_last_track_id;
    ELSE
         INSERT INTO tracks (name, project_id)
         VALUES ('Track 1', p_project_id)
      RETURNING * INTO v_new_track;
    END IF;

    RETURN v_new_track;
END;
$$ LANGUAGE plpgsql;
