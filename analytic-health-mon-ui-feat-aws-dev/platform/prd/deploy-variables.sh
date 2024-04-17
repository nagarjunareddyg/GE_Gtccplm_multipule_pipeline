#!/bin/bash

if [ "$0" = "$BASH_SOURCE" ]; then
  echo "This script is only for sourcing, exiting..."
  exit
fi


ENV="prd"
ACCOUNT_NUMBER="907050794246"
SUBNETS="subnet-030c65e63a92fcb86,subnet-02f4ee7c272d7e664"
SECURITY_GROUPS="sg-0f49b62719374888c"