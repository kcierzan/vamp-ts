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
INSERT INTO public.tracks (id, name, panning, gain, position, project_id) OVERRIDING SYSTEM VALUE
VALUES (
    7,
    'Yellow Rose of Texas',
    DEFAULT,
    DEFAULT,
    30453,
    1
  ),
  (
    8,
    'Mrs Brown You''ve Got a Lovely Daughter',
    DEFAULT,
    DEFAULT,
    3150,
    1
  ),
  (
    9,
    'Reach Out (I''ll Be There)',
    DEFAULT,
    DEFAULT,
    45750,
    1
  ),
  (10, 'Strange Fruit', DEFAULT, DEFAULT, 27733, 1),
  (11, 'Happy Together', DEFAULT, DEFAULT, 24243, 1),
  (
    12,
    'Boogie Oogie Oogie',
    DEFAULT,
    DEFAULT,
    55415,
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