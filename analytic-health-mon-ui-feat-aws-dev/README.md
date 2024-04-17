# Analytic Health Monitor/File Transporter User-Interface

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.2.

## Development server

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Docker Build Image:
docker build -f Dockerfile -t img-name:latest .

## Docker Run Image:
<!-- docker run -p 4200:80 --rm img-name -->
docker run -it --rm -e FTS_API_URL=[enter api url here] -e AHM_API_URL=[enter api url here] -p 4200:80 [IMAGE_NAME]:TAG

