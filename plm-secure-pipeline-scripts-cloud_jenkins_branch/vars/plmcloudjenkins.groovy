def call(Map pipelineParams) {

  pipeline {
	  agent any	  
	  
		parameters {
			// 	string(name: 'Environment' )
	              	//  string(name: 'WebRelease', description: 'Branch used for Spinner build')
			//	string(name: 'APP_DB_BUILD_NUMBER', description: 'Auto or Manual Build ')
			//	string(name: 'BuildType', description: 'Auto or Manual Build ')
				string(name: 'SonarScan', description: 'Run Sonar')
			//	string(name: 'Junit',  description: 'Run Junit')
			// 	string(name: 'Sast',  description: 'Run Sast')
			
			choice choices: ['cdev1', 'trg', 'DEV1'], name: 'Environment'
			choice choices: ['true', 'false'], name: 'Sast'
			choice choices: ['true', 'false'], name: 'SonarScan'
			choice choices: ['Dev_3_0_220', 'cloud_jenkins_test'], name: 'branch'
		} 
  
		environment {
			current_ws = pwd()
			branch = "${env.BRANCH_NAME}"	 
			ENV_NAME = 'dev'
			dev_ACCOUNT = '598619258634'
			qa_ACCOUNT  = '598619258634'
			prd_ACCOUNT = '907050794246'
			UAI = 'uai3026525'
			APP = 'powerplmgtcc-dev1-common'
			ECR_DOCKER_REGISTRY = 'dkr.ecr.us-east-1.amazonaws.com'
			VAR_BASE_DOCKER_REGISTRY = '880379568593.dkr.ecr.us-east-1.amazonaws.com'
			plp_docker_registry='880379568593.dkr.ecr.us-east-1.amazonaws.com/uai3026525-powerplmgtcc-tr-common'
			TWISTCLI_CREDS = credentials('twistcli-credentials')
			TWISTCLI_ADDRESS="https://us-east1.cloud.twistlock.com/us-2-158286731"


			/**  POWER JENKINS: Jenkins tools and credential ids */
			credentials_id='plmenovia_github_cred_id'
			artifactory_repo="QQHDK"
			//sonarqube_server='plmenovia-propel-sonarqube'
			sonarqube_server='sonarqube'
			//sonarqube_scanner='sonarQube Runner'
			sonarqube_scanner='sonarqube_scanner'
			

			/** Artifactory server id for old artifactory Devcloud */
			//artifactory_server='plmenovia_artifactory_server'

			/** Artifactory server id for NEW artifactory BUILD.GE */
			artifactory_server='plmenovia_buildge_artifactory_server'

			antTool='ant'
			coverityTool='cov-analysis-2018.12'
			coverity_server='plm-coverity'
					
			/* AWS properties using for aws deployment */
				AWS_PLM_PROXY='iss-americas-pitc-cincinnatiz.proxy.corporate.ge.com:80'
			AWS_PLM_REST_URL='s3-artifacts-uai3026525-us8p'
			aws_credentials_id='GTCCPLM_AWS'

			/** Assign values later in stages. **/
			pipelineUtils = ""
			properties = ""
			buildMessage =""
			junitbuildResult=""
			lastStartedStage=""			


		}
	
		stages {

			stage('Initilize') {
				steps{
					script {
										lastStartedStage = env.STAGE_NAME
							/* load application properties */
							pipelineUtils = new ge.plm.pipeline.PipelineUtils()
							properties = pipelineUtils.initilize()
											
							/** load input parameters*/
							properties.putAll(params)
							
							print(properties)

					}
				}
			}
			
			
			
       /****************************************** SonarScan Stage ******************************/
			stage('SonarScan'){
				when{
				expression {'true'.equalsIgnoreCase(params.SonarScan) && properties.publishType == "app"  }
				/*expression { params.SonarScan == 'true'  && properties.publishType == "app" }*/
				}  
				steps {
				script { 
				 lastStartedStage = env.STAGE_NAME
				pipelineUtils.runSonarScan()
				}
				}
			}
	
	 	stage("SonarScan Quality Gate") {
				when { 
					expression { 'true'.equalsIgnoreCase(params.SonarScan) && properties.publishType == "app" && 
						properties.sonarscan_quality_gate_test == "true" }
				  } 

				steps {
				script {
					 lastStartedStage = env.STAGE_NAME
					
					timeout(time: 5, unit: 'MINUTES') {
						def qg = waitForQualityGate()
						if (qg.status != 'OK') {
							buildMessage="Pipeline aborted due to sonarqube quality gate failure: ${qg.status}"
							currentBuild.result = 'FAILURE'
							error buildMessage 
							}
						}
					}
				}
              	  	  }
			
			/****************************************** SAST Stage *********************************************/		
				stage('SAST'){
					when{
					expression { params.Sast == 'true' }
					}  

					steps {
					script { 
                       				 lastStartedStage = env.STAGE_NAME
						try {
						new ge.plm.pipeline.SastUtils().runSast([properties:properties])
						} catch(Exception ex) {
							echo "**** EXCeption caught"
							buildMessage="Error with Coverity"
							currentBuild.result = 'FAILURE'
							error buildMessage 
						}
					}
					}
				}
	
	   
				stage('SAST Quality Gate') {
					/** when condition 
					for non prod environments, no need to run sast with every build to check defects. Sast parameter can be false.
					for prod environments, sast should be run in order to check sast quality gate. Otherwise qualitygate stage will be skipped.**/
					when { 
					expression {  	  properties.coverity_quality_gate == "true" && 
							  (  !params.Environment.equalsIgnoreCase("PROD") || 
							      (params.Environment.equalsIgnoreCase("PROD") && params.Sast == 'true') 
							  )       
						   }
					}

					steps {
					script{
                       				 lastStartedStage = env.STAGE_NAME
						coverityResult =coverityIssueCheck coverityInstanceUrl: properties.coverityInstanceUrl, projectName: properties.coverity_project_name, returnIssueCount: true, viewName: properties.coverity_view
						if(coverityResult !=null && coverityResult >0) {
						buildMessage = properties.sast_qualitygate_msg
						currentBuild.result = 'FAILURE'
						error buildMessage 
						}
						
					}
					}
			   	 }
			
			

	/****************************************** Build & Publish Stage *********************************************/	 
			stage('Build') {
				steps {	
					script {
						echo "Build"
						   lastStartedStage = env.STAGE_NAME
						try {
						   pipelineUtils.build([properties:properties])
						} catch(Exception ex) {
							buildMessage = properties.build_failed_msg
							currentBuild.result = 'FAILURE'
							error buildMessage
						}
					}
				}
			}
	/****************************************** Build & Publish Stage *********************************************/				
			stage('Image Build') {
				steps {
					script {
						LAST_STARTED_STAGE=env.STAGE_NAME
						println("Image Build Stage")
						//tag the image to latest in registry
						sh "tar -xvzf /var/lib/jenkins/workspace/gtccplm/gtccplm/war/build/gtccplm.tar.gz -C /var/lib/jenkins/workspace/gtccplm/"
						sh "cp -r /var/lib/jenkins/workspace/gtccplm/gtccplm/docker-files/* /var/lib/jenkins/workspace/gtccplm/"
						sh "chmod 755 -R /var/lib/jenkins/workspace/gtccplm/*"
						sh "aws ecr get-login-password --region us-east-1  | docker login --username AWS --password-stdin ${VAR_BASE_DOCKER_REGISTRY}"
						sh "docker build -t ${VAR_BASE_DOCKER_REGISTRY}/${UAI}-${APP}:gtccplminternal -f ./Dockerfile_noncas ./ --no-cache"
					//	sh "docker build -t ${VAR_BASE_DOCKER_REGISTRY}/${UAI}-${APP}:gtccplmcad -f ./Dockerfile_cad ./ --no-cache"
						sh "docker build -t ${VAR_BASE_DOCKER_REGISTRY}/${UAI}-${APP}:gtccplm -f ./Dockerfile_cas ./ --no-cache"
					//	sh "docker build -t ${VAR_BASE_DOCKER_REGISTRY}/${UAI}-${APP}:gtccplmext -f ./Dockerfile_ext ./ --no-cache"
					}
				}
			}
        	stage('twistcli download and image scan') {
        				steps {
        					script {
        					  println("twistcli download and image scan")
        					  withCredentials([usernamePassword(credentialsId: 'twistcli-credentials', passwordVariable: 'TWISTLOCK_PASS', usernameVariable: 'TWISTLOCK_USER')]){
        					  sh '''
        					        curl -k -u ${TWISTLOCK_USER}:${TWISTLOCK_PASS} --output ./twistcli ${TWISTCLI_ADDRESS}/api/v1/util/twistcli
        					        chmod a+x ./twistcli
        						    JWT=`curl -k -X POST ${TWISTCLI_ADDRESS}/api/v1/authenticate -H "Content-Type: application/json" -d '{"username": "'${TWISTLOCK_USER}'", "password":"'${TWISTLOCK_PASS}'"}' | jq -r .token`
        					        echo ${JWT}
        					        ./twistcli images scan ${VAR_BASE_DOCKER_REGISTRY}/${UAI}-${APP}:gtccplminternal --publish --address ${TWISTCLI_ADDRESS} --token "'${JWT}'"  || true
        					  //    ./twistcli images scan ${VAR_BASE_DOCKER_REGISTRY}/${UAI}-${APP}:gtccplmcad --publish --address ${TWISTCLI_ADDRESS} --token "'${JWT}'"  || true
        				            ./twistcli images scan ${VAR_BASE_DOCKER_REGISTRY}/${UAI}-${APP}:gtccplm --publish --address ${TWISTCLI_ADDRESS} --token "'${JWT}'"  || true
        					        rm -f twistcli
        					  '''
        					  }
        					  
        					}
        				}
        			}
			stage('Push to ECR') {
				steps {
					script {
						println("Publish")
						sh "aws ecr get-login-password --region us-east-1  | docker login --username AWS --password-stdin ${VAR_BASE_DOCKER_REGISTRY}"
						sh "docker image push ${VAR_BASE_DOCKER_REGISTRY}/${UAI}-${APP}:gtccplminternal"
					//	sh "docker image push ${VAR_BASE_DOCKER_REGISTRY}/${UAI}-${APP}:gtccplmcad"
						sh "docker image push ${VAR_BASE_DOCKER_REGISTRY}/${UAI}-${APP}:gtccplm"
					//	sh "docker image push ${VAR_BASE_DOCKER_REGISTRY}/${UAI}-${APP}:gtccplmext"						
						sh "docker image rmi ${VAR_BASE_DOCKER_REGISTRY}/${UAI}-${APP}:gtccplminternal"
					//	sh "docker image rmi ${VAR_BASE_DOCKER_REGISTRY}/${UAI}-${APP}:gtccplmcad"
						sh "docker image rmi ${VAR_BASE_DOCKER_REGISTRY}/${UAI}-${APP}:gtccplm"
					//	sh "docker image rmi ${VAR_BASE_DOCKER_REGISTRY}/${UAI}-${APP}:gtccplmext"
					}
				}
			}
		}//stages
  
  

/****************************************** POST build Actions ********************************************/	
	/*	 
	post{
				success {
					script {
						/**  Trigger build Metrics update job */
	/*					build job: 'PLM-UPDATE-BUILD-INFO', parameters: [string(name: 'BuildType', value: properties.BuildType), string(name: 'Application', value: properties.application ), string(name: 'Environment', value: properties.Environment ), string(name: 'App_Db_Job_BuildNumber', value:  properties.APP_DB_BUILD_NUMBER), string(name: 'Component', value: properties.publishType), string(name: 'Job_name', value: env.JOB_NAME), string(name: 'Release', value: env.BRANCH_NAME), string(name: 'Build_number', value:  env.BUILD_NUMBER), string(name: 'Duration', value: currentBuild.duration.toString()), string(name: 'MetricsFor', value: 'Build')], propagate: false, wait: false

					}
				}
				failure {
					script {
						echo 'Notify on Failed'
						pipelineUtils.notifyOnFailure([properties:properties, buildMessage:buildMessage, lastStartedStage:lastStartedStage])
					}
				}
		
		        	 always { 
				echo 'Clean Workspace'
				cleanWs()
				} 

	    }
*/
				
  } //pipeline
  
  }//def call


