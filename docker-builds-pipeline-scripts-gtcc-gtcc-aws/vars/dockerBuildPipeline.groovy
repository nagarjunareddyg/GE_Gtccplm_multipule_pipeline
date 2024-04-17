def call(Map pipelineParams) {

	pipeline {

		agent any

		parameters {
		    choice(name: 'BUILD_ENVIRONMENT', choices: ['dev1', 'tr'], description: 'Select Environment')
		    choice(name: 'DEPLOY_IMAGE_ONLY', choices: ['no', 'yes'], description: 'No :Image Build & Deploy.  \n Yes - Only deploy image, no build')
	  	}
		
		environment {		
			//TWISTLOCK Credentials
			TWISTCLI_CREDS=credentials('twistcli-credentials')
			artifactory_server='plmenovia_buildge_artifactory_server'
			properties = ""	
			message = ""
			
		}
			
		options {
			disableConcurrentBuilds()
			buildDiscarder(logRotator(daysToKeepStr: '5', numToKeepStr: '10'))    
		}


		stages {
			stage('Setup & Validate') {
				steps {
					script {
						pipelineUtils = new ge.plm.docker.PipelineUtils()
						userAdminPermission = pipelineUtils.validateUserAdminPermission([ReleaseTo:params.ReleaseTo])
						pipelineUtils.copyLibraryFilesToWorkspace()

						/** download installables during build image in Dev*/
						pipelineUtils.downloadInstallables([artifactoryServer:artifactory_server])
						//if( 'Dev'.equalsIgnoreCase(params.ReleaseTo)) {
						//	pipelineUtils.downloadInstallables([artifactoryServer:artifactory_server])
						//}
						//LAST_STARTED_STAGE=env.STAGE_NAME
						//properties = pipelineUtils.initilize()											
						/** load input parameters*/
						//properties.putAll(params)
						//print(properties)
					}
				}
			}		
			
			
			stage('Image Build') {
				when{
					expression {'no'.equalsIgnoreCase(params.DEPLOY_IMAGE_ONLY) }
				}
				steps {
					script {
						//LAST_STARTED_STAGE=env.STAGE_NAME
						println("Image Build Stage")						
						//tag the image to latest in registry
						sh "make dbuild ENV_NAME=dev BRANCH=${env.BRANCH_NAME} TWISTLOCK_USER=${TWISTCLI_CREDS_USR} TWISTLOCK_PASSWORD=${TWISTCLI_CREDS_PSW}"
					}
				}
			}
			
			stage('Approval Required') {
				
				when {
					expression {'prd'.equalsIgnoreCase(params.BUILD_ENVIRONMENT) }
				} 
				steps {
					script {
						//LAST_STARTED_STAGE=env.STAGE_NAME
						def userInput
						
						emailext  subject: 'Build Approval Request - dev - $JOB_NAME',  
						to: "${env.PRODUCTION_APPROVER}", 
						from: "${env.FROM_ADDRESS}" ,
						body: 'Job Details: ${JOB_NAME} ,  Build #: ${BUILD_NUMBER} <br/> Please use below URL to Approve/Reject <br/> ${BUILD_URL}input',
						mimeType: 'text/html'

						try {
							userInput = input (id: 'test', message: 'Do you apporve?', parameters: [ 
								[$class: 'BooleanParameterDefinition', defaultValue: true, description:'', name: 'You agree to deploy to production?']
								])

						} catch (org.jenkinsci.plugins.workflow.steps.FlowInterruptedException ex) {
							cause = ex.causes.get(0)
							echo "aborted by " + ex.getUser().toString()
							userAbourted = true
							echo "System aborted " + cause
						}
					}
				}
			}
			
			stage('Push to ECR') {
				when{
					expression {'no'.equalsIgnoreCase(params.DEPLOY_IMAGE_ONLY) }
				}
				steps {
					script {
					    //LAST_STARTED_STAGE=env.STAGE_NAME
						println("Publish")
			
						sh "make publish ENV_NAME=dev TWISTLOCK_USER=${TWISTCLI_CREDS_USR} TWISTLOCK_PASSWORD=${TWISTCLI_CREDS_PSW}"
						
					}
				}
			} 
			
			stage('Deploy Containers') {
				steps {
					script {
					    //LAST_STARTED_STAGE=env.STAGE_NAME
						println("Publish")
			
						sh "make buildplatform ENV_NAME=${params.BUILD_ENVIRONMENT}"
						
					}
				}
			} 

  
		} // stages
		
		post {

			always {
				script {
					echo 'make logout'
					//sh "make logout"
					echo 'Clean Workspace'
					cleanWs()
				}
			}
			 success {
				 	emailext  subject: '$BUILD_ENVIRONMENT - $DEFAULT_SUBJECT',  
					to: '$DEFAULT_RECIPIENTS', 
					from: "${env.FROM_ADDRESS}" ,
					body: '$DEFAULT_CONTENT',
					mimeType: 'text/html'
			 }
			 failure{
					emailext  subject: '$BUILD_ENVIRONMENT - $DEFAULT_SUBJECT',  
					to: '$DEFAULT_RECIPIENTS', 
					from: "${env.FROM_ADDRESS}" ,
					body: "Job Details: ${env.JOB_NAME} ,  Build #: ${env.BUILD_NUMBER} <br/> Build Status:  <font color=#FF0000> ${currentBuild.currentResult} </font> <br/> Failed Stage: <font color=#FF0000> env.STAGE_NAME </font> </br>  <br/> More info at: ${env.BUILD_URL} <br/><br/> Please do not reply.",
                    			mimeType: 'text/html'
			 }
		}

	} //pipeline
} //top level params
