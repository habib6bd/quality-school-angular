#!/usr/bin/env bash
# Starts the built SSR server, prints status + key markup for each URL, then stops it.
set -u
PORT="${PORT:-4310}"
node dist/quality-school-angular/server/server.mjs >/dev/null 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null' EXIT
for _ in $(seq 1 40); do curl -s -o /dev/null "localhost:$PORT/bn" && break; sleep 0.25; done
for url in "$@"; do
  body=$(curl -s -w '\n%{http_code} %{redirect_url}' "localhost:$PORT$url")
  status=$(tail -n1 <<<"$body")
  printf '%-28s %s  %s\n' "$url" "$status" "$(grep -oE '<html lang="[a-z]+"|<title>[^<]*|<h1[^>]*>[^<]*' <<<"$body" | tr '\n' ' ' | cut -c1-160)"
done
