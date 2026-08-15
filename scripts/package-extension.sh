#!/bin/sh

set -eu

project_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
version=$(jq -r '.version' "$project_dir/manifest.json")
archive="$project_dir/screenshot-auto-saver-v${version}.zip"

if [ -e "$archive" ]; then
  /usr/bin/trash "$archive"
fi

cd "$project_dir"
zip -q -r "$archive" \
  manifest.json \
  background.js \
  content.js \
  popup.html \
  popup.js \
  options.html \
  options.js \
  i18n.js \
  LICENSE \
  _locales \
  icons/icon16.png \
  icons/icon32.png \
  icons/icon48.png \
  icons/icon128.png

printf '%s\n' "$archive"
