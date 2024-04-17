def call(Map pipelineParams) {

  pipeline {
	  agent any
	  options { buildDiscarder(logRotator(numToKeepStr: '50', daysToKeepStr: '30')) }
		
	  
  parameters {
		string(name: 'Environment' )
		string(name: 'WebRelease', description: 'Branch used for Spinner build')
		string(name: 'APP_DB_BUILD_NUMBER', description: 'Auto or Manual Build ')
		string(name: 'BuildType', description: 'Auto or Manual Build ')
		string(name: 'SonarScan', description: 'Run Sonar')
		string(name: 'Junit',  description: 'Run Junit')
		string(name: 'Sast',  description: 'Run Sast')
	        //choice(name: "publishType", choices: ["db", "app"], description: "checking")
	  
// 	  	choice(name: "Environment", choices: ['DEV1', 'tr'], description: "Env")
// 	  	choice(name: "SpinnerRelease", choices: ['Dev_3_0_230', 'Dev_3_0_220', 'Config_Objects_Master', 'Release_3_0_220', 'Release_3_0_160', 'Dev_3_0_210', 
// 	'Release_3_0_210', 'Release_3_0_206', 'Release_3_0_205', 'Release_3_0_200_Post_Prod', 
//         'cloud_jenkins_test', 'Release_3_0_200', 'Dev_3_0_200', 'Release_3_0_195_Post_Prod', 
//         'Release_3_0_191_Post_Prod', 'Release_3_0_190_Post_Prod', 'Release_3_0_180_Post_Prod',
//         'Release_3_0_195', 'OOTB', 'Dev_1_0', 'Release_1_0_1', 'Release_2_0_15', 'Release_2_0', 
//         'Dev_2_0_1', 'Release_2_0_1', 'Common_Build', 'Dev_2_0_15', 'Dev_2_0', 'Release_2_0_Post_Prod', 
//         'Release_1_0_Post_Prod', 'Release_2_1', 'Dev_2_1', 'TEMP_Dev_2_1_10', 'Release_2_1_Post_Prod',
//         'Dev_2_1_10', '502413399-patch-1', 'Release_2_1_10_Post_Prod', 'Release_2_1_20', 'Dev_2_1_20', 
//         'Release_2_1_20_Post_Prod', 'Dev_2_1_30', 'Release_2_1_10', 'Release_2_1_1', 'Release_2_1_30_Post_Prod',
//         'Release_2_1_40', 'Dev_2_1_40', 'secure_pipeline_Dev_2_1_50', 'Release_2_1_40_Post_Prod', 
//         'Release_2_1_30', 'Dev_2_1_50', 'Release_2_1_50', 'secure_pipeline_Dev_2_1_60', 'Release_1_0', 
//         'Dev_2_1_60', 'Release_2_1_60', 'Dev_2_1_70', 'Release_2_1_71', 'temp_coverity', 
//         'Release_2_1_60_Post_Prod', 'Dev_2_1_KT', 'Release_2_1_80_Postprod', 'dev_2_100', 'release_1_0_100', 
//         'Release_2_1_70', 'Secure_pipeline_qualitygates_test', 'Release_2_1_50_Post_Prod',
//         'Release_2_1_70_Post_Prod', 'Release_2_1_80', 'Dev_2_1_80', 'secure_pipeline_prod_test', 
//         'Release_2_1_80_Post_Prod', 'Dev_2_1_90', 'Release_2_1_90', 'Release_2_1_90_Post_Prod', 'Dev_2_1_100', 
//         'Release_2_1_100', 'Spinner_Rel_2_1_110', '320006192-patch-1', '320006192-patch-2', 'test_coverity', 
//         'test_coverity_1', 'Release_2_1_100_Post_Prod', 'Post_Prod', 'Release_2_1_110', 'Dev_2_1_110', 
//         'Release_2_1_111', 'Current_Post_Prod', 'Release_2_1_111_Post_Prod', 'Test_sonar_temp_branch_Post_Prod',
//         'Test_sonar_temp_branch', 'Release_2_1_112', 'Release_2_1_120', 'Release_2_1_120_Post_Prod', 'Dev_2_1_130',
//         'Release_2_1_130_Post_Prod', 'Dev_2_1_120', 'mas', 'Release_2_1_130', 'Release_2_1_140_Post_Prod', 
//         'Release_2_1_140', 'Release_2_1_150', 'Dev_2_1_150', 'Release_2_1_151', 'Dev_2_1_140', 
//         'Release_2_1_151_Post_Prod', 'SIT-2', 'SIT2_6th', 'QA2_SIT2_6th', 'QA2_SIT2_25th', 'Release_2_1_160', 
//         'Dev_2_1_160', 'TEST_DEPLOYMENT', 'Release_2_1_160_TRG', 'Release_2_1_165', 'Release_2_1_165_Post_Prod', 
//         'appworx', 'Dev_2_1_170', 'Release_2_1_170', 'Release_2_1_170_Post_Prod', 'QA2_TCT_Debug', 
//         'Release_2_1_180', 'Dev_2_1_180', 'Release_2_1_180_Post_Prod', 'Release_2_1_190', 'Dev_2_1_190', 
//         'Release_2_1_190_Post_Prod', 'Release_2_1_200_QA2_March_26th', 'Release_2_1_200', 'Dev_2_1_200', 
//         'Release_2_1_200_Post_Prod', 'UAT2_210_23rd-April', 'Release_2_1_210', 'Dev_2_1_210', 
//         'Release_2_1_210_Post_Prod', 'Release_3_0_000_QA2_May_21st', 'Release_3_0_000_QA2_June_4th', 
//         'Release_3_0_000_temp_June_15th_QA2', 'Release_3_0_000', 'Dev_3_0_000', 'Release_3_0_000_Post_Prod.', 
//         'Dev_3_0_001', 'Release_3_0_001', 'Release_3_0_001_Post_Prod', 'Release_3_0_001_Post_Prod_GO_LIVE',
//         'Release_3_0_002', 'Dev_3_0_100', 'Release_3_0_100', 'Release_3_0_101', 'Release_3_0_002_Post_Prod', 
//         'Release_3_0_101_Post_Prod', 'Release_3_0_110', 'Dev_3_0_110', 'Release_3_0_110_Post_Prod', 
//         'Release_3_0_111', 'Release_3_0_111_Post_Prod', 'Release_3_0_120', 'Dev_3_0_120', 'Release_3_0_121', 
//         'Release_3_0_121_Post_Prod', 'Release_3_0_130', 'Dev_3_0_130', 'Release_3_0_130_Post_Prod', 
//         'Release_3_0_131', 'Release_3_0_131_Post_Prod', 'Release_3_0_132', 'Release_3_0_133', 'Release_3_0_140', 
//         'Dev_3_0_140', 'Release_3_0_133_Post_Prod', 'Release_3_0_140_Post_Prod', 'Dev_3_0_150', 'Release_3_0_150',
//         'Release_3_0_150_Post_Prod', 'JUNIT_TEST', 'Dev_3_0_160', 'Release_3_0_161', 'Release_3_0_160_Post_Prod', 
//         'Release_3_0_170', 'Dev_3_0_170', 'Release_3_0_170_Post_Prod', 'Release_3_0_175_Post_Prod', 'Dev_3_0_180',
//         'Release_3_0_175', 'Dev_3_0_175', 'Release_3_0_180', 'Release_3_0_190', 'Dev_3_0_190',
//         'Release_3_0_191'], description: "Branches")
// 	  	//choice(name: "publishType", choices: ["db", "app"], description: "checking")
// 	  	//choice(name: "BuildType", choices: ["Auto", "Manual"], description: "Check")
//  	  	choice(name: "SonarScan", choices: ["true", "false"], description: "checking")
// 	  	choice(name: "Junit", choices: ["true", "false"], description: "checking")
// 	  	choice(name: "Sast", choices: ["true", "false"], description: "checking")
	  
  } 
	  environment {
		current_ws = pwd()
	        branch = "${env.BRANCH_NAME}"
// 	        branch = "${env.SpinnerRelease}"
// 	 	Release = "${env.SpinnerRelease}"
	        ENV_NAME = 'dev'
		UAI = 'uai3026525'
		APP = 'powerplmgtcc-dev1-common'
		ECR_DOCKER_REGISTRY = 'dkr.ecr.us-east-1.amazonaws.com'
		VAR_BASE_DOCKER_REGISTRY = '880379568593.dkr.ecr.us-east-1.amazonaws.com'
	        COV_HOST = "coverity.power.ge.com"
                COV_PORT = 443
                PROJECT_NAME = '1100214481_PowerPLM_GTCC'
                STREAM = 'aws-jenkins-gtccplm-cov'
                COV_URL = 'https://coverity.power.ge.com/'
		DESCRIPTION = 'aws-jenkins-gtccplm-cov'
	 	covbin = '/gpcloud/jenkins/coverity/scan/cov-analysis-linux64-2022.6.1/bin'

		/**  POWER JENKINS: Jenkins tools and credential ids */
		credentials_id='plmenovia_github_cred_id'
		artifactory_repo="QQHDK"
		/*sonarqube_server='plmenovia-propel-sonarqube'*/
	        /*sonarqube_server = "${env.sonarqube}"*/
	        sonarqube_server='sonarqube'
		/*sonarqube_scanner='sonarQube Runner'*/
	        /*sonarqube_scanner = "${env.sonarqube_scanner}"*/
	        sonarqube_scanner='sonarqube_scanner'
	 	AWS_BATCH_ARN='arn:aws:batch:us-east-1:880379568593'
	 	
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
			script{
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
						
						new ge.plm.pipeline.SastUtils().runSast([properties:properties])
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
stage('Image Build') {
			when{
				expression {properties.publishType == "app"  }
				}  
				steps {
					script {
						LAST_STARTED_STAGE=env.STAGE_NAME
						println("Image Build Stage")
						//tag the image to latest in registry
// 						sh "tar -xvzf /var/lib/jenkins/workspace/gtccplm/gtccplm/war/build/gtccplm.tar.gz -C /var/lib/jenkins/workspace/gtccplm/"
// 						sh "cp -r /var/lib/jenkins/workspace/gtccplm/gtccplm/docker-files/* /var/lib/jenkins/workspace/gtccplm/"
// 						sh "chmod 755 -R /var/lib/jenkins/workspace/gtccplm/*"
						sh "tar -xvzf /var/lib/jenkins/workspace/PLM-ENOVIA_gtccplm_${env.WebRelease}/gtccplm/war/build/gtccplm.tar.gz -C /var/lib/jenkins/workspace/PLM-ENOVIA_gtccplm_${env.WebRelease}/"
 						sh "cp -r /var/lib/jenkins/workspace/PLM-ENOVIA_gtccplm_${env.WebRelease}/gtccplm/docker-files/* /var/lib/jenkins/workspace/PLM-ENOVIA_gtccplm_${env.WebRelease}/"
 						sh "chmod 755 -R /var/lib/jenkins/workspace/PLM-ENOVIA_gtccplm_${env.WebRelease}/*"
						
						sh "aws ecr get-login-password --region us-east-1  | docker login --username AWS --password-stdin ${VAR_BASE_DOCKER_REGISTRY}"
						sh "docker build -t ${VAR_BASE_DOCKER_REGISTRY}/${UAI}-${APP}:gtccplminternal -f ./Dockerfile_noncas ./ --no-cache"
					//	sh "docker build -t ${VAR_BASE_DOCKER_REGISTRY}/${UAI}-${APP}:gtccplmcad -f ./Dockerfile_cad ./ --no-cache"
						sh "docker build -t ${VAR_BASE_DOCKER_REGISTRY}/${UAI}-${APP}:gtccplm -f ./Dockerfile_cas ./ --no-cache"
					//	sh "docker build -t ${VAR_BASE_DOCKER_REGISTRY}/${UAI}-${APP}:gtccplmext -f ./Dockerfile_ext ./ --no-cache"
					}
				}
			} 
	
stage('Push to ECR') {
			when{
				expression {properties.publishType == "app"  }
				}  
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
				when{
				expression {properties.publishType == "app"  }
				}  
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
	
	
stage('Publish') {
		when{
				expression { properties.publishType == "db"  }
				}
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
	
  }//stages 
	  
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
