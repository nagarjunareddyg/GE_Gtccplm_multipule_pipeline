#!/bin/bash

echo "BUILD SCRIPT - Build started"

# mv .netrc ~/.
# git config --global url."https://github".insteadOf git://github
# npm install
npm uninstall @angular-devkit/build-angular

#npm install --save-dev @angular-devkit/build-angular
ng update @angular/cli @angular/core --allow-dirty --force

npm run build -- --configuration=dev --outputPath="dist_dev"
npm run build -- --configuration=qa  --outputPath="dist_qa"
npm run build -- --configuration=production --outputPath="dist_prod"
