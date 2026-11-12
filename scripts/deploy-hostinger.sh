#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
case "${1:---dry-run}" in
  --dry-run) deploy=0 ;;
  --deploy) deploy=1 ;;
  *) echo 'Usage: bash scripts/deploy-hostinger.sh [--dry-run|--deploy]' >&2; exit 2 ;;
esac
root=/home/bornar/pass.luc.sh
target=bornar@93.127.192.202
ssh_args=(-p 65002 -o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=15)
ssh_command='ssh -p 65002 -o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=15'
[[ -f dist/index.html && -f dist/sw.js ]] || { echo 'Build dist/ first' >&2; exit 1; }
rsync -az --no-owner --no-group --no-perms --omit-dir-times --dry-run --itemize-changes -e "$ssh_command" dist/ "$target:$root/"
[[ "$deploy" = 1 ]] || exit 0
[[ -z "$(git status --porcelain)" ]] || { echo 'Commit changes before deploying' >&2; exit 1; }
commit=$(git rev-parse HEAD)
release_id="$(date -u +%Y%m%dT%H%M%SZ)-${commit:0:12}"
release="/home/bornar/site-releases/master-password/$release_id"
mkdir -p .release
tar -czf ".release/$release_id.tar.gz" -C dist .
shasum -a 256 ".release/$release_id.tar.gz" > ".release/$release_id.sha256"
ssh "${ssh_args[@]}" "$target" "bash -s -- '$root' '$release' '$commit'" <<'REMOTE'
set -euo pipefail
root=$1; release=$2; commit=$3
[[ -f "$root/index.html" && -f "$root/.htaccess" ]]
mkdir -p "$(dirname "$release")"
mkdir -m 700 "$release"
mkdir "$release/site"
tar -czf "$release/previous-site.tar.gz" -C "$root" .
printf '%s\n' "$commit" > "$release/commit.txt"
printf '#!/usr/bin/env bash\nset -euo pipefail\ntar -xzf %q -C %q\n' "$release/previous-site.tar.gz" "$root" > "$release/rollback.sh"
chmod 700 "$release/rollback.sh"
sha256sum "$root/index.html" > "$release/previous-index.sha256"
REMOTE
rsync -az -e "$ssh_command" dist/ "$target:$release/site/"
rsync -az -e "$ssh_command" ".release/$release_id.tar.gz" ".release/$release_id.sha256" "$target:$release/"
ssh "${ssh_args[@]}" "$target" "bash -s -- '$root' '$release'" <<'REMOTE'
set -euo pipefail
root=$1; release=$2
# Keep hosting configuration, legacy v1, and old hashed assets intact.
rsync -a --no-owner --no-group --no-perms --omit-dir-times --exclude 'index.html*' --exclude 'sw.js' "$release/site/" "$root/"
# HTML and the worker must revalidate rather than inherit month-long caching.
if ! grep -q 'BEGIN master-password release cache' "$root/.htaccess"; then
  cat >> "$root/.htaccess" <<'CACHE'

# BEGIN master-password release cache
<IfModule mod_headers.c>
  <FilesMatch "^(index\.html(\.gz)?|sw\.js)$">
    Header set Cache-Control "no-cache, must-revalidate"
    Header unset Expires
  </FilesMatch>
</IfModule>
# END master-password release cache
CACHE
fi
# Only content-hashed bundles are immutable; unversioned files keep their policy.
if ! grep -q 'BEGIN master-password immutable assets' "$root/.htaccess"; then
  cat >> "$root/.htaccess" <<'CACHE'

# BEGIN master-password immutable assets
<IfModule mod_headers.c>
  <FilesMatch "^(main|vendor|style)\.[a-f0-9]{8,}\.(js|css)(\.gz)?$">
    Header set Cache-Control "public, max-age=31536000, immutable"
    Header unset Expires
  </FilesMatch>
</IfModule>
# END master-password immutable assets
CACHE
fi
for file in index.html.gz index.html sw.js; do
  [[ -f "$release/site/$file" ]] || continue
  cp "$release/site/$file" "$root/.$file.next"
  chmod 644 "$root/.$file.next"
  mv -f "$root/.$file.next" "$root/$file"
done
sha256sum "$root/index.html" > "$release/deployed-index.sha256"
REMOTE
printf '%s\n' "$release" > .release/latest-remote.txt
printf 'Deployed %s\nRollback: bash %s/rollback.sh\n' "$commit" "$release"
