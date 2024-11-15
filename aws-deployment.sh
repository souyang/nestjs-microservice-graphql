#!/bin/bash

# Set variables
ECR_ACCOUNT_ID="992382714725"
ECR_REGION="us-east-1"
ECR_REPO_PREFIX="my-user-microservices"
SERVICES=(
  "db-app"
  "migrate-app"
  "gateway-app"
  "service-user-app"
  "service-auth-app"
  "service-password-app"
)

# Login to Amazon ECR
echo "Logging in to Amazon ECR..."
aws ecr get-login-password --region $ECR_REGION | docker login --username AWS --password-stdin $ECR_ACCOUNT_ID.dkr.ecr.$ECR_REGION.amazonaws.com

# Tag and push images for each service
for SERVICE in "${SERVICES[@]}"; do
  IMAGE_URI="$ECR_ACCOUNT_ID.dkr.ecr.$ECR_REGION.amazonaws.com/$ECR_REPO_PREFIX/$SERVICE:latest"

  echo "Tagging image for $SERVICE..."
  docker tag $SERVICE $IMAGE_URI

  echo "Pushing image for $SERVICE..."
  docker push $IMAGE_URI
done

echo "All images have been tagged and pushed successfully!"
