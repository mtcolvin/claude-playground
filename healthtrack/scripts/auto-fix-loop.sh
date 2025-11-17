#!/bin/bash

# Automated error detection and fixing loop
# This script continuously monitors for TypeScript errors
# and outputs them in a structured format for automated fixing

ERROR_LOG="type-errors.log"
LAST_ERROR_HASH=""

echo "🤖 Starting automated error monitoring..."
echo "Press Ctrl+C to stop"
echo ""

while true; do
  # Run type check and save to log
  npm run type-check 2>&1 > "$ERROR_LOG"
  EXIT_CODE=$?

  if [ $EXIT_CODE -ne 0 ]; then
    # Calculate hash of current errors
    CURRENT_HASH=$(md5sum "$ERROR_LOG" | awk '{print $1}')

    # Only report if errors have changed
    if [ "$CURRENT_HASH" != "$LAST_ERROR_HASH" ]; then
      echo "================================"
      echo "NEW ERRORS DETECTED ($(date +"%H:%M:%S"))"
      echo "================================"
      cat "$ERROR_LOG"
      echo ""
      echo "Errors saved to: $ERROR_LOG"
      echo "Waiting for fixes..."
      LAST_ERROR_HASH="$CURRENT_HASH"
    fi
  else
    if [ -n "$LAST_ERROR_HASH" ]; then
      echo "✅ All errors fixed! ($(date +"%H:%M:%S"))"
      LAST_ERROR_HASH=""
    fi
  fi

  # Wait before next check
  sleep 3
done
