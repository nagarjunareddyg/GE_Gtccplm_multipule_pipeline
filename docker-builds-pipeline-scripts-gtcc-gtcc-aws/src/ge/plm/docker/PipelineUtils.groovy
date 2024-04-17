#!/usr/bin/groovy
package ge.plm.docker;


/**
 Returns true if user has admin previleges.
 */
def validateUserAdminPermission(params){

	def userAdminPermission ="" 
	try {
					def cause = currentBuild.getBuildCauses('hudson.model.Cause$UserIdCause')
					if(cause.size()>0) {
					userId = cause.first().userId
					userAdminPermission = Jenkins.getInstance().getAuthorizationStrategy().hasPermission(userId, Jenkins.ADMINISTER)
					}
					}catch (Exception e) {
						println(e)
					}
					println("Build initiated By: "+ userId+"  userAdminPermission: "+userAdminPermission + " Release To: "+params.ReleaseTo)
	
	
	 if( 'Production'.equalsIgnoreCase(params.ReleaseTo) 
                          && !userAdminPermission == true ) {
                          currentBuild.result = 'FAILURE'
                          }
	                          	
	return userAdminPermission
}


/**
Read properties from file generic.properties from repository workspace
*/

def readProperties() {

try {
    
    Properties properties = new Properties()
	def triggercontent = readFile 'installer.properties'
	InputStream is = new ByteArrayInputStream(triggercontent.getBytes());
	properties.load(is)
	return properties
	
 } catch(Exception ex) {
    println (ex)
 }
 
}



/**
 */
 
 def downloadInstallables(params) {
  
  	try {
  		properties = readProperties()
  	} catch(Exception ex) {
  		println (ex)
  	}
  	
  	if(properties!=null && properties.getProperty("artifactory_installables_pattern") != null) { 
   
   	 arr=properties.getProperty("artifactory_installables_pattern").split(',')
   	 println ("files to download:"+ arr)
    
    arr.each { pattern ->
		    def server = Artifactory.server params.artifactoryServer
			echo "target :${params.target}"
			def downloadSpec = """{
		 				 "files": [
		   				 {
		    				  "pattern": "${pattern}",
		     				  "target": "./",
						 	 "flat": "true"
		   				 }
						 ]
						}"""
						
						println downloadSpec
						def buildinfo=server.download(downloadSpec)
						echo "buildinfo: ${buildinfo}"
						
			};
   }
   
   
}

def copyLibraryFilesToWorkspace() {
	try {
	 copyGlobalLibraryScript("Makefile")
	 copyGlobalLibraryScript("Makefile.settings")
	}catch(Exception ex) {
	    println("Error in copyLibraryFilesToWorkspace method")
	    println (ex)
	 }
}

/**
  * Returns the path to a temp location of a script from the global library (resources/ subdirectory)
  *
  * @param srcPath path within the resources/ subdirectory of this repo
  * @param destPath destination path (optional)
  * @return path 
  */
    String copyGlobalLibraryScript(String srcPath) {
        writeFile file: srcPath, text: libraryResource(srcPath)
      echo "copyGlobalLibraryScript:  ${srcPath} copied to workspace"
	return srcPath
    }
