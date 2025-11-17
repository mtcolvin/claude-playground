#!/bin/bash

# Watch mode script that monitors TypeScript compilation errors
# and outputs them in a format that can be automatically processed

echo "Starting TypeScript watch mode..."
echo "Errors will be captured and can be automatically fixed."
echo ""

while true; do
  # Run TypeScript compiler
  OUTPUT=$(npx tsc --noEmit 2>&1)
  EXIT_CODE=$?

  if [ $EXIT_CODE -ne 0 ]; then
    echo "================================"
    echo "COMPILATION ERRORS DETECTED"
    echo "================================"
    echo "$OUTPUT"
    echo ""
    echo "Waiting 5 seconds before retry..."
    sleep 5
  else
    echo "✓ Compilation successful!"
    echo "Watching for changes..."
    sleep 5
  fi
done
