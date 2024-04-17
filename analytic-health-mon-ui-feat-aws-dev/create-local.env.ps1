
#proe-ahm-api
invoke-expression 'cmd /c start powershell -Command { docker run -it --rm -e NO_PROXY=ice.predix.io,ice.ge.com,localhost,127.0.0.1,openge.com,github.build.ge.com,cloud.ge.com -e ENV_INSTANCE=local -e SERVER_PORT=8552 -e SPRING_DATASOURCE_URL=jdbc:oracle:thin:@//PDMALQ04-scan.pw.ge.com:1521/pnnpsd05 -e SPRING_DATASOURCE_USERNAME=SSO502533536 -e SPRING_DATASOURCE_PASSWORD=Cr33p3p5n -e SPRING_DATASOURCE_DRIVER_CLASS_NAME=oracle.jdbc.OracleDriver -e USER_INFO_URL=http://ased6333a-1.pw.ge.com:7000/lcpr/rest/webservice/fetchUser?ssoId= -p 8552:8552 registry.gear.ge.com/pwr-plp-dib/proe-ahm-api:local }'

#fts-api
invoke-expression 'cmd /c start powershell -Command { docker run -it --rm -e SPRING_PROFILES_ACTIVE=local -p 8442:8442 registry.gear.ge.com/pwr-plp-dib/fts-monitor-api:local }'

#node server for siteminder
invoke-expression 'cmd /c start powershell -Command { docker run -it --rm -e DEPLOY_ENV=local -p 9000:9000 registry.gear.ge.com/pwr-plp-dib/fts-monitor-ui:local  }'

# Angular UI
invoke-expression 'cmd /c start powershell -Command { docker run -it --rm -p 4200:80 registry.gear.ge.com/pwr-plp-dib/fts-ahm-frontend:local  }'

#open vs code editor
#code .

#install all packages if not present already
#npm install

#start application locally
# npm start