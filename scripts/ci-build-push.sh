#!/bin/bash
# AxionBio CI/CD: Multi-Worker Image Build & Push
# Usage: ./scripts/ci-build-push.sh [project-id] [region]

PROJECT_ID=${1:-$GCP_PROJECT_ID}
REGION=${2:-"asia-south1"}
REPO="axionbio-workers"

if [ -z "$PROJECT_ID" ]; then
    echo "Error: PROJECT_ID not set. Pass it as \$1 or set GCP_PROJECT_ID env."
    exit 1
fi

echo "Starting AxionBio Worker Build Flow..."
echo "Target: $REGION-docker.pkg.dev/$PROJECT_ID/$REPO"

# Iterate through each compute directory
for dir in compute/*; do
    if [ -d "$dir" ] && [ -f "$dir/Dockerfile" ]; then
        worker_name=$(basename "$dir")
        image_tag="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/$worker_name:latest"
        
        echo "----------------------------------------------------"
        echo "Building worker: $worker_name"
        echo "Tag: $image_tag"
        
        # Build from the root context so 'shared' logic is accessible if needed
        docker build -t "$image_tag" -f "$dir/Dockerfile" .
        
        echo "⬆️ Pushing to Artifact Registry..."
        docker push "$image_tag"
    fi
done

echo "✅ All workers built and pushed successfully."
