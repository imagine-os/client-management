#!/usr/bin/env bash
# Re-copies the Between Gigs Design System into packages/design-system/ from a local clone.
# Usage: scripts/sync-design-system.sh /path/to/between-gigs-design-system
# Never edit packages/design-system/ by hand: change the system upstream, then re-run this.
set -euo pipefail

SRC="${1:-${DESIGN_SYSTEM_DIR:-../between-gigs-design-system}}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/packages/design-system"

if [ ! -f "$SRC/styles/between-gigs.css" ]; then
  echo "No design system at $SRC. Pass the path to a clone of Between-Gigs/between-gigs-design-system." >&2
  exit 1
fi

rm -rf "$DEST"
mkdir -p "$DEST/src" "$DEST/styles" "$DEST/docs"
cp -R "$SRC/src/components" "$SRC/src/motion" "$DEST/src/"
cp "$SRC/styles/between-gigs.css" "$DEST/styles/"
cp "$SRC/tokens/tokens.json" "$DEST/"
cp -R "$SRC/fonts" "$SRC/logos" "$DEST/"
cp "$SRC/BRAND.md" "$SRC/MOTION.md" "$SRC/ICONS.md" "$SRC/MATERIALS.md" "$SRC/LOGO.md" "$DEST/docs/"
# The approved prototypes are reference only: the app rebuilds them as routed pages.
mkdir -p "$DEST/reference/templates"
cp -R "$SRC/src/templates/gigs" "$DEST/reference/templates/"

COMMIT="$(git -C "$SRC" rev-parse HEAD 2>/dev/null || echo unknown)"
VERSION="$(node -p "require('$SRC/package.json').version" 2>/dev/null || echo unknown)"
cat > "$DEST/VERSION" <<V
Between-Gigs/between-gigs-design-system
version: $VERSION
commit: $COMMIT
synced: $(date -u +%Y-%m-%d)
V

# Fictional sample portraits and portfolio images, served by the app.
rm -rf "$ROOT/public/img/people" && mkdir -p "$ROOT/public/img/people"
cp "$SRC"/docs/showcase/app/img/*.jpg "$ROOT/public/img/people/"
echo "Synced design system $VERSION ($COMMIT) into packages/design-system/"
node "$ROOT/scripts/build-email-tokens.mjs"
