#!/usr/bin/env bash
# Pull main and rebuild dist/ if there are new commits. Safe to run from cron:
# it exits quietly when nothing changed and only touches dist/ after a build
# succeeds, so a failed build never takes the live site down.
#
# Server: ~/apps/websites/halalfinders/source (nginx container mounts ./dist)
#
# Everything lives in main() and the file ends with `main; exit` on one line:
# bash reads scripts incrementally, and `git reset --hard` rewrites this very
# file mid-run. Parsing the whole body up front means the version that
# started is the version that finishes.
set -euo pipefail

main() {
  cd "$(dirname "${BASH_SOURCE[0]}")/.."

  export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"
  local LOG="${DEPLOY_LOG:-/tmp/halalfinders-deploy.log}"
  log() { echo "$(date '+%F %T') $*" | tee -a "$LOG"; }

  git fetch -q origin main
  local REMOTE DEPLOYED
  REMOTE=$(git rev-parse origin/main)
  # Compare against the commit actually built into dist/, not HEAD -- a manual
  # git pull must not make the script think the site is already up to date.
  DEPLOYED=$(cat dist/.deployed 2>/dev/null || echo none)

  if [[ "$DEPLOYED" == "$REMOTE" && "${FORCE:-0}" != "1" ]]; then
    ensure_mount
    return 0
  fi

  log "deploying $REMOTE (live: $DEPLOYED)"
  git reset -q --hard origin/main

  if [[ ! -f .env ]]; then
    log "WARNING: no .env -- site will build without Supabase config"
  fi

  npm ci --no-audit --no-fund >>"$LOG" 2>&1
  rm -rf dist.new
  # --clear: Metro caches transforms without env values; a stale cache can
  # silently bake in an old/undefined EXPO_PUBLIC_* value.
  CI=1 npx expo export --platform web --clear --output-dir dist.new >>"$LOG" 2>&1
  echo "$REMOTE" > dist.new/.deployed

  # Update dist/ IN PLACE. The nginx container bind-mounts this directory by
  # inode, so replacing it with mv leaves the container pointing at a deleted
  # directory (every page 500s until the container restarts).
  mkdir -p dist
  if command -v rsync >/dev/null; then
    rsync -a --delete dist.new/ dist/
  else
    find dist -mindepth 1 -delete
    cp -a dist.new/. dist/
  fi
  rm -rf dist.new
  log "live: $(git rev-parse --short HEAD)"

  ensure_mount
}

# If the container's view of dist/ is empty (dangling bind mount), restart it.
ensure_mount() {
  command -v docker >/dev/null || return 0
  if ! docker exec halalfinders test -f /usr/share/nginx/html/index.html 2>/dev/null; then
    echo "$(date '+%F %T') container mount stale; restarting nginx" | tee -a "${DEPLOY_LOG:-/tmp/halalfinders-deploy.log}"
    docker restart halalfinders >/dev/null 2>&1 || true
  fi
}

main "$@"; exit $?
