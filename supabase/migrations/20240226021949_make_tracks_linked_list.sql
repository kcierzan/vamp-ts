BEGIN;
ALTER TABLE tracks
ADD COLUMN next_track_id INTEGER;
ALTER TABLE tracks
ADD COLUMN previous_track_id INTEGER;
ALTER TABLE tracks
ADD CONSTRAINT fk_next_track FOREIGN KEY (next_track_id) REFERENCES tracks(id) DEFERRABLE;
ALTER TABLE tracks
ADD CONSTRAINT fk_previous_track FOREIGN KEY (previous_track_id) REFERENCES tracks(id) DEFERRABLE;
COMMIT;