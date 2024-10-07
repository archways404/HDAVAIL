#!/bin/bash

FLAG_FILE="/tmp/deploy_at_2am"
REPO_PATH="/path/to/your/repo"

if [ -f "$FLAG_FILE" ]; then
    echo "Pulling latest changes from master at 2 AM..."
    cd "$REPO_PATH" || exit
    git pull origin master
    rm "$FLAG_FILE" # Remove the flag file after pulling
else
    echo "No deploy scheduled for 2 AM."
fi


# notes:

# crontab -e

# 0 2 * * * /path/to/deploy_at_2am.sh >> /path/to/deploy.log 2>&1
