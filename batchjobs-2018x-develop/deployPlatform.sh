#!/bin/bash
export env_name=$1

if [ "${env_name}" == "TRG" ]; then
  myvar="tr" 
else {
  myvar="${env_name.toLowerCase()}" 
}
fi

mkdir -p $WORKSPACE/${env_name}/templates
mv $WORKSPACE/templates/*.yml $WORKSPACE/${env_name}/templates
cd $WORKSPACE/${env_name}
stack_master --yes apply us-east-1 uai3026525-powerplmgtcc-$myvar-jobs-computeenvironment
#stack_master --yes apply us-east-1 uai3026525-powerplmgtcc-$myvar-jobs-ucoprocessing
