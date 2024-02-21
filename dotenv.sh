#!/usr/bin/env bash

set -e

echo "PUBLIC_SUPABASE_URL=$(sudo supabase status 2>/dev/null | grep 'API URL' | cut -d: -f2- | tr -d ' ')" > .env
echo "PUBLIC_SUPABASE_ANON_KEY=$(sudo supabase status 2>/dev/null | grep 'anon key' | cut -d: -f2- | tr -d ' ')" >> .env
echo "envvars written to .env"
