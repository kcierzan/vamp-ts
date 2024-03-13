CREATE OR REPLACE FUNCTION insert_track_from_audio_clip(
  p_clip_id BIGINT,
  p_project_id BIGINT
) RETURNS BIGINT AS $$
DECLARE
  v_project_track_count BIGINT;
  v_current_last_track_id BIGINT;
  v_new_track_id BIGINT;
BEGIN
  -- Get the track count for the project
  SELECT COUNT(*)
    INTO v_project_track_count
    FROM tracks
   WHERE project_id = p_project_id;

  -- Get the current last track
  SELECT id
    INTO v_current_last_track_id
    FROM tracks
   WHERE project_id = p_project_id
     AND next_track_id IS NULL;

  v_project_track_count := v_project_track_count + 1;

     INSERT INTO tracks (name, project_id, previous_track_id)
     VALUES ('Track ' || v_project_track_count::TEXT, p_project_id, v_current_last_track_id)
  RETURNING id INTO v_new_track_id;

  -- Point the last track to the new track
  UPDATE tracks
     SET next_track_id = v_new_track_id
   WHERE id = v_current_last_track_id;

  -- Update the audio clip with the new track
  UPDATE audio_clips
     SET track_id = v_new_track_id
   WHERE id = p_clip_id;

  RETURN v_new_track_id;
END;
$$ LANGUAGE plpgsql;