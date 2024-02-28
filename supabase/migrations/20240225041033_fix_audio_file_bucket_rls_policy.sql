BEGIN;
DROP POLICY IF EXISTS "users can select audio_files associated with projects they created" ON storage.objects;
CREATE POLICY "users can select audio_files associated with projects they created" ON storage.objects FOR
SELECT TO authenticated USING (
    (storage.foldername(name)) [1] IN (
      SELECT id::text
      FROM projects
      WHERE projects.created_by_user_id = auth.uid()
    )
    AND bucket_id = 'audio_files'
  );
DROP POLICY IF EXISTS "users can insert audio_files associated with projects they created" ON storage.objects;
CREATE POLICY "users can insert audio_files associated with projects they created" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (
    (storage.foldername(name)) [1] IN (
      SELECT id::text
      FROM projects
      WHERE projects.created_by_user_id = auth.uid()
    )
    AND bucket_id = 'audio_files'
  );
DROP POLICY IF EXISTS "users can update audio_files associated with projects they created" ON storage.objects;
CREATE POLICY "users can update audio_files associated with projects they created" ON storage.objects FOR
UPDATE TO authenticated USING (
    (storage.foldername(name)) [1] IN (
      SELECT id::text
      FROM projects
      WHERE projects.created_by_user_id = auth.uid()
    )
    AND bucket_id = 'audio_files'
  ) WITH CHECK (
    (storage.foldername(name)) [1] IN (
      SELECT id::text
      FROM projects
      WHERE projects.created_by_user_id = auth.uid()
    )
    AND bucket_id = 'audio_files'
  );
DROP POLICY IF EXISTS "users can delete audio_files associated with projects they created" ON storage.objects;
CREATE POLICY "users can delete audio_files associated with projects they created" ON storage.objects FOR DELETE TO authenticated USING (
  (storage.foldername(name)) [1] IN (
    SELECT id::text
    FROM projects
    WHERE projects.created_by_user_id = auth.uid()
  )
  AND bucket_id = 'audio_files'
);
COMMIT;