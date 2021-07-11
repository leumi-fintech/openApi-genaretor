#!/bin/bash
# source ./devops/generatorLambda/generator.sh --env "leumi-sbx" --tags "Payment Initiation Service (PIS)" --rt "payments"
# python3 ./devops/generatorLambda/generator.py --test "leumi-sbx" --tags "Payment Initiation Service (PIS)" --rt "payments"

# Get Env
env=$1
# api=$2

# #Set Env - by a given Environment 
source ./devops/set-env.sh $env
if [ $? -ne 0 ]; then
    echo "Command: source ./devops/set-env.sh env - failed"
    exit
fi

    python3 ./devops/generatorLambda/generator.py "$@"
