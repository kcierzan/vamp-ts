INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    recovery_sent_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '51e7ccb7-e955-58a5-9e9a-3deaf580fc34',
    'authenticated',
    'authenticated',
    'kyle@example.com',
    crypt('password123', gen_salt('bf')),
    current_timestamp,
    current_timestamp,
    current_timestamp,
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
  );
INSERT INTO public.projects (
    id,
    name,
    description,
    bpm,
    time_signature,
    created_by_user_id
  ) OVERRIDING SYSTEM VALUE
VALUES (
    1,
    'Cool Jam 2024',
    'The track of the summer',
    128,
    DEFAULT,
    '51e7ccb7-e955-58a5-9e9a-3deaf580fc34'
  ),
  (
    2,
    'Tropical House',
    'a lot of steel drums',
    126,
    DEFAULT,
    '51e7ccb7-e955-58a5-9e9a-3deaf580fc34'
  );
INSERT INTO public.tracks (id, name, panning, gain, previous_track_id, next_track_id, project_id) OVERRIDING SYSTEM VALUE
VALUES (
    7,
    'Drums',
    DEFAULT,
    DEFAULT,
    NULL,
    8,
    1
  ),
  (
    8,
    'Bass',
    DEFAULT,
    DEFAULT,
    7,
    9,
    1
  ),
  (
    9,
    'Guitar',
    DEFAULT,
    DEFAULT,
    8,
    10,
    1
  ),
  (10, 'Vocal', DEFAULT, DEFAULT, 9, 11, 1),
  (11, 'FX', DEFAULT, DEFAULT, 10, 12, 1),
  (
    12,
    'Synths',
    DEFAULT,
    DEFAULT,
    11,
    NULL,
    1
  );
SELECT setval(
    'public.projects_id_seq'::regclass,
    (
      SELECT MAX("id")
      FROM "public"."projects"
    )
  );
SELECT setval(
    'public.tracks_id_seq'::regclass,
    (
      SELECT MAX("id")
      FROM "public"."tracks"
    )
  );
INSERT INTO storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
  )
VALUES (
    'audio_files',
    'audio_files',
    TRUE,
    1000000,
    ARRAY ['audio/*']
  );
