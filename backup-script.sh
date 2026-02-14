#!/bin/bash
# Backup script for Command Center

set -e

cd "$(dirname "$0")"

# Ensure we're on the correct branch
if git branch --show-current | grep -q "main"; then
  echo "Already on branch 'main'"
else
  echo "Switching to branch 'main'"
  git checkout main
fi

# Check if there are any changes
if git diff --quiet && git diff --cached --quiet; then
  echo "$(date): No changes to commit for Command Center" >> .backup.log
  echo "No changes to commit"
  exit 0
fi

# Add all changes
git add .

# Commit with date
commit_msg="Auto backup Command Center $(date +%Y-%m-%d)"
git commit -m "$commit_msg"

# Push to origin
git push origin main

echo "Backup completed for Command Center"
