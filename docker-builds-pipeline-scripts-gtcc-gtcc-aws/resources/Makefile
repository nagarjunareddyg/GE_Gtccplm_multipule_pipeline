
#Environment variable to include any project specific variables
include local.env

# Common settings
include Makefile.settings

.PHONY: cbuild dbuild clean cleandangling login logout publish buildplatform sonarscan unittest

JWT := $$(curl -s -X POST ${TWISTCLI_ADDRESS}/api/v1/authenticate -H "Content-Type: application/json" -d '{"username":"${TWISTCLI_CREDS_USR}","password":"${TWISTCLI_CREDS_PSW}"}' | jq -r .token)

#Make action for code build
cbuild:
	#make clean
	@echo MY_VAR IS $(JWT)
	${INFO} "Creating maven code build.1.."
	
	./buildScript.sh
	${INFO} "Both Maven Build complete"

dbuild:
	${INFO} "delete any dangling images already exists on host.."
	make cleandangling
	
	# ECR Login
	make login

	${INFO} "Building docker image 12345.. $(ECR_DOCKER_REGISTRY_TEST) "
	 echo "Do something1 $(DOCKER_FILE_PATH)"
	${INFO} "docker Registry variable:  $(VAR_DOCKER_REGISTRY) , docker image: $(VAR_DOCKER_IMAGE), base image: $(VAR_BASE_IMAGE)"
		
	#$(UAI)-$(APP)-$(ENV_NAME):$(REPO_NAME) - $(VAR_DOCKER_IMAGE)
	docker build --network=host -t $(REPO_NAME) \
				 -f ${DOCKER_FILE_PATH}/Dockerfile ./ --no-cache=true \
				--build-arg BASE_IMAGE=$(VAR_BASE_IMAGE)  \
				--build-arg DEBIAN_FRONTEND=noninteractive  \
				--label source=$(REPO_NAME):$(BRANCH) \
				--label base=$(VAR_BASE_IMAGE) \
				--label application=$(REPO_NAME) \
				--label UAI=$(UAI)
	
	${INFO} "downloading twistcli..."
	@ bash -c 'curl -k -u $(TWISTLOCK_USER):$(TWISTLOCK_PASSWORD) --output ./twistcli ${TWISTCLI_ADDRESS}/api/v1/util/twistcli'
	@ bash -c 'chmod a+x ./twistcli'
	${INFO} "downloading twistcli completed..."
	
	${INFO} "image scanning twistcli... twistcli images scan "
	@ test -f ./twistcli && bash -c './twistcli images scan $(REPO_NAME) --publish --address ${TWISTCLI_ADDRESS} --token "'${JWT}'"  || true'
	@ bash -c 'rm -f twistcli'
	${INFO} "image scanning done..."
	
	#retagging image to origina image name
	docker tag $(REPO_NAME) $(VAR_DOCKER_IMAGE)
	
clean:
	${INFO} "Cleaning intermediate docker images created..."
	@ $(call clean_dangling_images,$(REPO_NAME))
	${INFO} "Removing development images from Jenkins host ..."
	@ $(call clean_images,$(REPO_NAME))
	${INFO} "Clean complete"

	#clean untagged images
	#aws ecr list-images --region us-east-1 --repository-name $(UAI)-$(APP)-$(ENV_NAME) --filter tagStatus=UNTAGGED --query 'imageIds[*]' --output text \
	#			| while read imageId; do aws ecr batch-delete-image --region us-east-1 --repository-name $(UAI)-$(APP)-$(ENV_NAME) --image-ids imageDigest=$$imageId; done || true

cleandangling:
	${INFO} "Removing exited=1 containers from Jenkins host ..."
	@ $(call clean_dangling_containers)
	${INFO} "Cleaning dangling and intermediate docker images created..."
	${INFO} "Removing dangling images..."
	@ $(call clean_dangling_images,$(REPO_NAME))
	${INFO} "Clean cleandangling complete"

login:
	${INFO} "Logging into ECR"
	aws ecr get-login-password --region us-east-1  | docker login --username AWS --password-stdin $(VAR_DOCKER_REGISTRY)
	
logout:
	${INFO} "Logging out of Docker registry $(VAR_DOCKER_REGISTRY)..."
	docker logout $(VAR_DOCKER_REGISTRY)
	${INFO} "Logged out of Docker registry $(VAR_DOCKER_REGISTRY)"	
	
publish:
	
	${INFO}  "Publishing image $(VAR_DOCKER_IMAGE)"
	
	${INFO} "Logging into ECR"
	$(aws ecr get-login --no-include-email --region us-east-1 --no-verify-ssl)
	
	@ docker push $(VAR_DOCKER_IMAGE)
	${INFO} "Publish complete"
	
	${INFO} "Cleaning dangling and intermediate docker images after push completes..."
	make clean
	
buildplatform:
	${INFO} "Creating buildplatform..$(ENV_NAME), $(UPDATE_SERVICE_FLAG)"
	chmod +x ./platform/deployPlatform.sh
	./platform/deployPlatform.sh $(ENV_NAME) $(CAS_PLATFORM_FOLDER)

sonarscan:
	${INFO} "Sonarscan **"
	# run sonarscript.sh file if file exist 
	@ test -f ./sonarScript.sh && chmod +x sonarScript.sh && ./sonarScript.sh || echo "Sonarscript.sh file not found in applicaiton code."

unittest:
	#make clean
	
	${INFO} "start unit test script 1.."
	@ test -f ./utScript.sh && chmod +x utScript.sh && ./utScript.sh
	${INFO} "end unit test script 1.."
