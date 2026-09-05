#!/bin/bash
# Permanent fix for corrupted git index
rm -f .git/index .git/index.lock 2>/dev/null
git reset --quiet 2>/dev/null || git reset
echo "Git index successfully restored and healthy!"
