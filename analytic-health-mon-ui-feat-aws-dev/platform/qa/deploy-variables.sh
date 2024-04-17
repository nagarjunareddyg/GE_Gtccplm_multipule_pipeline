#!/bin/bash

if [ "$0" = "$BASH_SOURCE" ]; then
  echo "This script is only for sourcing, exiting..."
  exit
fi


ENV="qa"
ACCOUNT_NUMBER="598619258634"
SUBNETS="subnet-076fbc33b8e7fc094,subnet-00a2cc8eb8b597505"
SECURITY_GROUPS="sg-08f8578b7f005fec1"