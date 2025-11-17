#!/bin/bash

# Check Vercel deployment status for the latest deployment
# Requires: vercel CLI (npm install -g vercel)

echo "Checking latest Vercel deployment status..."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found"
    echo "Install with: npm install -g vercel"
    exit 1
fi

# Get latest deployment
DEPLOYMENT=$(vercel ls --yes 2>/dev/null | head -2 | tail -1)

if [ -z "$DEPLOYMENT" ]; then
    echo "No deployments found"
    exit 0
fi

# Parse deployment URL and status
URL=$(echo "$DEPLOYMENT" | awk '{print $1}')
STATUS=$(echo "$DEPLOYMENT" | awk '{print $2}')

echo "Latest Deployment:"
echo "  URL: $URL"
echo "  Status: $STATUS"
echo ""

# Check deployment details
if [ "$STATUS" = "Ready" ]; then
    echo "✅ Deployment successful!"
elif [ "$STATUS" = "Error" ]; then
    echo "❌ Deployment failed!"
    echo ""
    echo "Getting error logs..."
    vercel logs "$URL" --output logs/vercel-error.log
    echo "Logs saved to: logs/vercel-error.log"
else
    echo "⏳ Deployment in progress: $STATUS"
fi
