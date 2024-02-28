CREATE OR REPLACE FUNCTION insert_track_from_pool_file(
  p_audio_file_id BIGINT,
  p_project_id BIGINT,
  p_clip_name TEXT,
  p_playback_rate DOUBLE PRECISION
) RETURNS JSON AS $$
DECLARE
  v_project_track_count BIGINT;
  v_current_last_track_id BIGINT;
  v_new_track_id BIGINT;
  v_track_with_clip JSON;
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

  -- Eagerly insert the track
     INSERT INTO tracks (name, project_id)
     VALUES ('Track 1', p_project_id)
  RETURNING id INTO v_new_track_id;


  IF v_current_last_track_id IS NOT NULL THEN
    v_project_track_count := v_project_track_count + 1;

    -- Point the last track to the new track
    UPDATE tracks
       SET next_track_id = v_new_track_id
     WHERE id = v_current_last_track_id;

    -- Point the new track's previous track to the final track
    UPDATE tracks
       SET previous_track_id = v_current_last_track_id,
           name = 'Track ' || v_project_track_count::TEXT
     WHERE id = v_new_track_id;
  END IF;


  -- Insert the clip
  INSERT INTO audio_clips (name, playback_rate, index, track_id, audio_file_id)
  VALUES (p_clip_name, p_playback_rate, 0, v_new_track_id, p_audio_file_id);

  -- Return the track with its clips as JSON
  SELECT row_to_json(track_with_clips) INTO v_track_with_clip
    FROM (SELECT t.*,
                 (SELECT json_agg(clip_details)
                    FROM (SELECT *
                            FROM audio_clips ac
                           WHERE ac.track_id = t.id) clip_details) AS audio_clips
            FROM tracks t
           WHERE t.id = v_new_track_id) track_with_clips;

  RETURN v_track_with_clip;
END;
$$ LANGUAGE plpgsql;
