# vamp-ts

browser-based music production.

## Setting up a local dev environment

1. Install CLI dependencies via homebrew:

```sh
brew install pnpm supabase homebrew/cask/docker
```

2. Install node:

[mise](https://github.com/jdx/mise) is recommended for managing node versions. If mise is installed, run the following command to install an appropriate version of node:

```sh
mise install
```

3. Install node dependencies:

```sh
pnpm i
```

4. Initialize supabase and follow the prompts:

> [!IMPORTANT]
> Make sure docker is running before starting supabase

```sh
supabase init && supabase start
```

5. Generate a .env file via script:

```sh
./dotenv.sh
```

6. Start the development server:

```sh
pnpm run dev --open
```

## Local environment data

Local env data is populated via the `seed.sql` file. To log in via the UI, use the following credentials:

| Email address    | Password    |
| ---------------- | ----------- |
| kyle@example.com | password123 |

This seed file is executed every time you run `supabase start` or `supabase db reset`. To reset all local environment data to the initial state, run:

```sh
supabase db reset
```

## Running tests

To run the test suite:

```sh
pnpm run test
```
