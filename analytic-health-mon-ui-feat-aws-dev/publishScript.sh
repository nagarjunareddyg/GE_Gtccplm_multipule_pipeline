#!/bin/bash

imageName='fts-ahm-frontend'
dockerRepoUrl='registry.gear.ge.com/pwr-plp-dib'

BUILD_VERSION="build-${BUILD_ID}-$(date +'%Y%m%d')"
echo "PUBLISH SCRIPT - BUILD Version is ${BUILD_VERSION}"

# build docker image 
docker build --build-arg distFolder=dist_dev -t $dockerRepoUrl/$imageName:latest . --no-cache
docker build --build-arg distFolder=dist_qa -t $dockerRepoUrl/$imageName:qa-$BUILD_VERSION . --no-cache
docker build --build-arg distFolder=dist_prod -t $dockerRepoUrl/$imageName:prod-$BUILD_VERSION . --no-cache

# tag docker image
docker tag $dockerRepoUrl/$imageName:latest $dockerRepoUrl/$imageName:dev-$BUILD_VERSION

# push docker image to the repo
echo "PUBLISH SCRIPT - Push Docker Image $dockerRepoUrl/$imageName:$BUILD_VERSION"
docker push $dockerRepoUrl/$imageName:latest
docker push $dockerRepoUrl/$imageName:dev-$BUILD_VERSION
docker push $dockerRepoUrl/$imageName:qa-$BUILD_VERSION
docker push $dockerRepoUrl/$imageName:prod-$BUILD_VERSION

echo "PUBLISH SCRIPT - Setting BanzaiUserData.json for GitOps:"
jq --arg APPVERSION "$BUILD_VERSION" '.gitOps.versions."proe-fts-ahm-ui".version = $APPVERSION' gitOps.json > BanzaiUserData.json
cat BanzaiUserData.json
