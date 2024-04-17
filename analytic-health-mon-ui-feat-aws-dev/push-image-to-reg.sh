# #!/bin/sh

#1: Build the angular code based on the environemts
echo '#1: Build the angular code based on the environemts'
# mv nginx/terms_redirect.html terms_redirect.html
npm run ng build -- --configuration=$1 --outputPath="dist"
# mv terms_redirect.html nginx/terms_redirect.html

# # #2 Github Commit
echo '#2 Github Commit'
git add *
commit_msg="$2. ENVIRONMENT: $1"
git commit -m "$commit_msg"

#3: Login to registry
echo '#3: Login to registry'
docker login registry.gear.ge.com

#4: Build and deploy image to registry
echo '#4: Build and deploy image to registry'
docker build -t registry.gear.ge.com/pwr-plp-dib/fts-ahm-frontend:$1 .
docker push registry.gear.ge.com/pwr-plp-dib/fts-ahm-frontend:$1


#5: Github push 
echo '#5: Github push'
git push origin master

#6 Remove dist output folder
rm -rf dist

