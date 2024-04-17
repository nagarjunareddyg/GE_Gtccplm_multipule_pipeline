# Common settings
include Makefile.settings
JWT := $$(curl -s -X POST ${TWISTCLI_ADDRESS}/api/v1/authenticate -H "Content-Type: application/json" -d '{"username":"${TWISTCLI_CREDS_USR}","password":"${TWISTCLI_CREDS_PSW}"}' | jq -r .token)

.PHONY: dbuild

dbuild:
        docker build --network=host -t ${VAR_BASE_DOCKER_REGISTRY}/${UAI}-${APP}:gtccplminternal -f ./Dockerfile_noncas ./ --no-cache
						
	${INFO} "downloading twistcli..."
	@ bash -c 'curl -k -u $(TWISTLOCK_USER):$(TWISTLOCK_PASSWORD) --output ./twistcli ${TWISTCLI_ADDRESS}/api/v1/util/twistcli'
	@ bash -c 'chmod a+x ./twistcli'
	${INFO} "downloading twistcli completed..."
	
	${INFO} "image scanning twistcli... twistcli images scan "
	@ test -f ./twistcli && bash -c './twistcli images scan ${VAR_BASE_DOCKER_REGISTRY}/${UAI}-${APP}:gtccplminternal --publish --address ${TWISTCLI_ADDRESS} --token "'${JWT}'"  || true'
	@ bash -c 'rm -f twistcli'
	${INFO} "image scanning done..."
	
