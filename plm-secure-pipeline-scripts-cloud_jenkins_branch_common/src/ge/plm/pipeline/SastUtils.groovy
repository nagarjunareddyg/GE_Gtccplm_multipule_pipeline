#!/usr/bin/groovy
package ge.plm.pipeline;
import ge.plm.pipeline.PipelineUtils;

def runSast(params) {
      
	/** CREATE stream name (branch name) in Coverity server if its not created already */
	def coverity_stream_name = params.properties.getProperty("coverity_stream")
	coverity_stream_name = coverity_stream_name.replace("<BRANCH>", env.WebRelease)
	 
	if(! isStreamExist(params,coverity_stream_name)) {
		createNewStream(params,coverity_stream_name)
	}
		
     /** Below logic is to Run Coverity build, Analysis and Commit defects */
// 	withCoverityEnvironment(coverityInstanceUrl: params.properties.coverityInstanceUrl){
	withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'coverity-scan-cred', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]){	
		try {
		sh 'rm -Rf "$WORKSPACE/covtemp/"'
		sh 'mkdir -p $WORKSPACE/covtemp'
		println "Stream Name:"+coverity_stream_name
		sh "${covbin}/cov-configure --java"
                				      
               // withAnt(installation: env.antTool, jdk: params.properties.jdk) {

                 /** STEP1: Run coverity Build **/
                                 if (params.properties.publishType == 'app') {
                             
				sh "${covbin}/cov-build --dir $WORKSPACE/covtemp ant \
                                    -Dssh-user=afn38x5  \
                                    -Dvcs-tag=${env.WebRelease} \
                                    -Dbas-dir=${env.current_ws} \
                                    -Denv-tag=${env.Environment} \
                                    -Dclasspath-lib=${params.properties.jenkins_pwwebplm_lib_path} \
                                    -Dclasspath-bin=${params.properties.jenkins_pwwebplm_bin_path} \
                                    -f  ${params.properties.buildFile} \
                                    ${params.properties.coverity_build_targets}"
                                    
                                    /** For GE specific JSP files
                                     */
				   def coverity_files_exclude_scm_regex_formatted = getCoveritySCMExcludeRegexFormattedString(params)
								 			 
                                    sh "rm -rf ${env.current_ws}/scm_ge_specific_files.lst"
                                    sh "find  ${env.current_ws}/${params.properties.base_folder}/war/build \
					 -type f -name '${params.properties.coverity_files_include_scm_regex}' \
					 ${coverity_files_exclude_scm_regex_formatted}>> scm_ge_specific_files.lst"
                                    
                                    sh "${covbin}/cov-build \
					 --dir $WORKSPACE/covtemp \
                                    --fs-capture-list  ${env.current_ws}/scm_ge_specific_files.lst \
                                    --no-command"
                                    
                              } 
				else if (params.properties.publishType == 'db') {
                                             sh "${covbin}/cov-build  \
					--dir $WORKSPACE/covtemp \
                                              ant  \
                                             -Dssh-user=afn38x5  \
                                             -Dvcs-tag=${env.WebRelease} \
                                             -Dbas-dir=${env.current_ws}/${params.properties.webDirectory} \
                                             -Ddb-bas-dir=${env.current_ws} \
                                             -Denv-tag=${env.Environment} \
                                             -Dclasspath-lib=${params.properties.jenkins_pwwebplm_lib_path} \
		                             -Dclasspath-bin=${params.properties.jenkins_pwwebplm_bin_path} \
                                             -Dcoverity_postprod_branch_workspace=${params.properties.coverity_postprod_branch_workspace} \
                                             -f  ${params.properties.git_base_folder}/${params.properties.buildFile}  \
                                             ${params.properties.coverity_build_targets}"
				      
					    // include spinner folder to run custom checkers like password search on code
				   		 sh "${covbin}/cov-build \
						--dir $WORKSPACE/covtemp \
						--fs-capture-search ${env.current_ws}/${params.properties.git_base_folder} \
						--no-command"
                                   } 
                    //           }
		
		/** STEP2: REMOVE jars from Coverity Scan **/
					// list all emitted files
                                          sh "${covbin}/cov-manage-emit --dir $WORKSPACE/covtemp list "
					
					// Remove all jar files from scan
                                          echo 'remove Jar files from coverity analyis'
                                          sh "${covbin}/cov-manage-emit \
                                          --dir $WORKSPACE/covtemp \
                                          --tu-pattern \"file(\'.*/*.jar.*\') \" \
                                          delete"
				
		/** STEP3: Run Coverity Analysis **/
					echo 'cov-analyze Started ***'       
				       if (params.properties.publishType == 'app') {
						sh "${covbin}/cov-analyze \
					    	 --dir $WORKSPACE/covtemp \
						--all --webapp-security \
						--strip-path ${env.current_ws}/ \
						--disable-fb"
					} 
				       else if (params.properties.publishType == 'db') {
					  def customCheckersJsonFile = new PipelineUtils().copyGlobalLibraryScript('coverity_custom_checkers/plm_coverity_text_checkers.json')
						sh "${covbin}/cov-analyze \
						--dir $WORKSPACE/covtemp \
						--strip-path ${env.current_ws}/${params.properties.webDirectory}/spinner_all_jpos/ \
						--strip-path ${env.current_ws}/${params.properties.webDirectory}/ \
						--strip-path ${env.current_ws}/ \
						--disable-fb \
						--directive-file ${customCheckersJsonFile} \
						--enable TEXT.PLM_HARDCODED_PASSWORD"
					} 
		
		
				 /*     sh "cov-format-errors  --dir ${WORKSPACE/covtemp}   --html-output ${COV_DIR}/Report"
				  */
		
			/** STEP4: Commit Defects **/
					withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'coverity-scan-cred', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]) {
                sh "${covbin}/cov-commit-defects --dir $WORKSPACE/covtemp --stream $coverity_stream_name --debug --host $COV_HOST --https-port $COV_PORT  --description $DESCRIPTION  --user $USERNAME --password $PASSWORD --on-new-cert trust --debug --noxrefs"
		}
	
		}catch(Exception ex) {
					
					echo '*** Coverity Error LOG (build-log) ***'
					sh "[ -f $WORKSPACE/covtemp/build-log.txt ] &&  cat $WORKSPACE/covtemp/build-log.txt || echo 'No Coverity build log file exist' "
					echo '*** Coverity Error LOG (jsp-compilation-log) ***'
					sh "[ -f $WORKSPACE/covtemp/jsp-compilation-log.txt ] &&  cat $WORKSPACE/covtemp/jsp-compilation-log.txt || echo 'No Coverity Jsp compile log file exist' "
					echo '*** Coverity Error LOG (output/commit-error-log.txt) ***'
					sh "[ -f $WORKSPACE/covtemp/output/commit-error-log.txt ] &&  cat $WORKSPACE/covtemp/output/commit-error-log.txt || echo 'No Coverity commit-error-log.txt log file exist' "
					throw new Exception("Throw to stop pipeline")
			        
				} //catch
                   } // with coverity env
 } //method end

/* Util methods to create stream in coverity */
def isStreamExist(params, coverity_stream_name ) {
	def isStreamExist = false
	println " Checking isStreamExist: "+ coverity_stream_name
	
	withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'coverity-scan-cred', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]){
		 /** check if Stream exists*/
		try {
			 def current_streams = sh returnStdout: true, script: "${covbin}/cov-manage-im \
								--mode streams \
								--show --stream  ${coverity_stream_name} \
								--url ${COV_URL} \
								--user $USERNAME \
								--password $PASSWORD \
								--on-new-cert trust"

			println current_streams 
			if(current_streams.contains("${coverity_stream_name},") ) {
				
				   if(current_streams.contains("${params.properties.coverity_project_name},")) {
					isStreamExist = true
				  }
		          /** Delete the steram if its created but not assigned to project */
				else {
					 sh "${covbin}/cov-manage-im  \
					--mode streams \
					--delete --stream ${coverity_stream_name} \
					--url ${COV_URL} \
					--user $USERNAME \
					--password $PASSWORD \
					--on-new-cert trust"
				 }
				
			}


		 } catch(Exception ex) {
			println "Exception is thrown.."
			println ex
		 }
	 }
	
	println " isStreamExist: "+ coverity_stream_name + ": " +isStreamExist
	return isStreamExist
}
	
	
def createNewStream(params , coverity_stream_name) {
//     	withCoverityEnvironment(coverityInstanceUrl: params.properties.coverityInstanceUrl){
	withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'coverity-scan-cred', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]){
	
			 /** Create Stream if it not exist */
				sh "${covbin}/cov-manage-im  \
				--mode streams \
				--add --set name:${coverity_stream_name} \
				--url ${COV_URL} \
				--user $USERNAME \
				--password $PASSWORD \
				--on-new-cert trust"
				

			  /** Associate new Stream with project */

				sh "${covbin}/cov-manage-im  \
				 --mode projects --name ${params.properties.coverity_project_name}  \
				 --update --insert stream:${coverity_stream_name} \
				 --url ${COV_URL} \
				 --user $USERNAME \
				 --password $PASSWORD \
				 --on-new-cert trust"
				
			 }
	 
	println "NewStream is Crated:"+coverity_stream_name
	return coverity_stream_name
}

def getCoveritySCMExcludeRegexFormattedString(params) {
	def exclude_const="-not -name"
	def exclude_pattern_formatted=""
	try {
	if(params.properties.coverity_files_exclude_scm_regex != null){
	for (String exclude_file :  params.properties.coverity_files_exclude_scm_regex.split()) {
	exclude_pattern_formatted="$exclude_pattern_formatted $exclude_const $exclude_file"
	}
	}
	}catch(Exception ex) {
		println ex
	}
	return exclude_pattern_formatted
}
