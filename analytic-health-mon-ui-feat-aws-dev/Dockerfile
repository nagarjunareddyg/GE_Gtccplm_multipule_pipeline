FROM nginx:1.14.1-alpine

ARG distFolder=dist

## Copy our default nginx config
#COPY nginx.conf /etc/nginx/
COPY nginx/default.conf /etc/nginx/conf.d/

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## Copy over the artifacts in dist folder to default nginx public folder
COPY $distFolder /usr/share/nginx/html
