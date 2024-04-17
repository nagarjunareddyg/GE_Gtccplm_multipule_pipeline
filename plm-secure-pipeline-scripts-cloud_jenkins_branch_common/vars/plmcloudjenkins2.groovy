#!/usr/bin/env groovy

import hudson.model.*
import groovy.transform.Field
import hudson.util.*
import jenkins.model.*
import hudson.FilePath.FileCallable
import hudson.slaves.OfflineCause
import hudson.node_monitors.*


def call(Map pipelineParams) {
  pipeline {
	  agent any	 
  	  
		parameters {
			string(name: 'Environment' )
			string(name: 'WebRelease', description: 'Branch used for Spinner build')
			string(name: 'APP_DB_BUILD_NUMBER', description: 'Auto or Manual Build ')
			string(name: 'BuildType', description: 'Auto or Manual Build ')
			string(name: 'SonarScan', description: 'Run Sonar')
			string(name: 'Junit',  description: 'Run Junit')
			string(name: 'Sast',  description: 'Run Sast')

		} 
  
		environment {
			current_ws = pwd()
			branch = "${env.WebRelease}"	 
			ENV_NAME = 'dev'
			UAI = 'uai3026525'
			AWS_BATCH_ARN='arn:aws:batch:us-east-1:880379568593'
			APP = 'powerplmgtcc-dev1-common'
			ECR_DOCKER_REGISTRY = 'dkr.ecr.us-east-1.amazonaws.com'
			VAR_BASE_DOCKER_REGISTRY = '880379568593.dkr.ecr.us-east-1.amazonaws.com'
		    COV_HOST = "coverity.power.ge.com"
            COV_PORT = 443
            PROJECT_NAME = '1100214481_PowerPLM_GTCC'
            COV_URL = 'https://coverity.power.ge.com/'
			DESCRIPTION = 'aws-jenkins-gtccplm-cov'


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
			covbin = '/gpcloud/jenkins/coverity/scan/cov-analysis-linux64-2022.6.1/bin'


		}
	
		stages {

			stage('Initilize') {
				steps{
					script {
							println(env.job_name)
							println(params.branch)
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
				expression {'true'.equalsIgnoreCase(params.SonarScan) && properties.publishType == "db"  }
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
					expression { 'true'.equalsIgnoreCase(params.SonarScan) && properties.publishType == "db" && 
						properties.sonarscan_quality_gate == "true" }
				  } 

				steps {
				script {
                 		  lastStartedStage = env.STAGE_NAME
					sleep(60)
					timeout(time: 5, unit: 'MINUTES') {
						def qg = waitForQualityGate()
						if (qg.status != 'OK') {
							buildMessage= properties.sonarscan_qualitygate_msg
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
							buildMessage = properties.sast_build_failed_msg
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
	/****************************************** Image Build & Publish Stage *********************************************/				
			
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
			
			if (properties.publishtype == "app"){
					
			stage('Image Build') {
				steps {
					script {
						LAST_STARTED_STAGE=env.STAGE_NAME
						println("Image Build Stage")
						//tag the image to latest in registry
						sh "tar -xvzf /var/lib/jenkins/workspace/PLM-ENOVIA_gtccplm_${env.WebRelease}/gtccplm/war/build/gtccplm.tar.gz -C /var/lib/jenkins/workspace/PLM-ENOVIA_gtccplm_${env.WebRelease}/"
 						sh "cp -r /var/lib/jenkins/workspace/PLM-ENOVIA_gtccplm_${env.WebRelease}/gtccplm/docker-files/* /var/lib/jenkins/workspace/PLM-ENOVIA_gtccplm_${env.WebRelease}/"
 						sh "chmod 755 -R /var/lib/jenkins/workspace/PLM-ENOVIA_gtccplm_${env.WebRelease}/*"
						
						sh "aws ecr get-login-password --region us-east-1  | docker login --username AWS --password-stdin ${VAR_BASE_DOCKER_REGISTRY}"
						sh "docker build -t ${VAR_BASE_DOCKER_REGISTRY}/${UAI}-${APP}:gtccplminternal -f ./Dockerfile_noncas ./ --no-cache"
						sh "docker build -t ${VAR_BASE_DOCKER_REGISTRY}/${UAI}-${APP}:gtccplm -f ./Dockerfile_cas ./ --no-cache"
					}
				}
			}
                    
		/****************************************** Image scan *********************************************/	
		
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
			stage('Deploy Containers') {
				steps {
					script {
					    //LAST_STARTED_STAGE=env.STAGE_NAME
						println("Publish")
                                                	myvariable = "${env.Environment}"
	                                                if (env.Environment == 'DEV1') {
		                                        myvariable = 'cdev1'
	                                               }
						echo "$myvariable"
			
						/*sh "make buildplatform ENV_NAME=${params.Environment}"*/
						/*sh "./platform/deployPlatform.sh ${params.Environment} gtcc-cas gtcc-noncas"*/
						sh "./platform/deployPlatform.sh ${myvariable} gtcc-cas gtcc-noncas"
						
					}
				}
			} 
			
			}else (properties.publishtype == "db"){
				stage('Publish') {

						steps {
						script { 
							lastStartedStage = env.STAGE_NAME
							echo "Publish"
							try {
							pipelineUtils.publish([properties:properties])
							} catch(Exception ex) {
							buildMessage = ex.toString()
							currentBuild.result = 'FAILURE'
							error buildMessage
							}
						}
						}
				  }
			
				}
  
		}//stages				

	
  

/****************************************** POST build Actions ********************************************/		 
	post{
				success {
					script {
				
						/**  Trigger build Metrics update job */
						buildMessage="Success"
						pipelineUtils.notify([properties:properties, buildMessage:"${buildMessage}", lastStartedStage:"${lastStartedStage}"])
					}
				}
				failure {
					script {
						buildMessage="Failed"
						currentBuild.result = 'FAILURE'
						echo 'Notify on Failed'
						pipelineUtils.notifyOnFailure([properties:properties, buildMessage:"${buildMessage}"])
					}
				}
		
		        	 always { 
				echo 'Clean Workspace'
				cleanWs()
				}
					

	    }
				
  } //pipeline
  
  }//def call

