import string
import yaml
import os
import sys
from shutil import copyfile
from string import Template
from pathlib import Path
from ruamel.yaml import YAML
import re

def addResouces(file_path):
    with open('./templates/resources.yml') as fp:
        resources_yml_data = yaml.safe_load(fp)
    with open(file_path) as fp:
        serverless_yml_data = yaml.safe_load(fp)
    merged = dict()
    serverless_yml_data['resources'] = resources_yml_data['resources']
    with open(file_path, 'w') as yaml_file:
        yaml.dump(serverless_yml_data, yaml_file)
        yaml_file.close()
        
def getTags(): 
    tags = []
    template_env_file_path = 'swaggers/swgger.yaml'
    with open(template_env_file_path) as f:
        data = yaml.load(f, Loader=yaml.FullLoader)
        for key_path in data['paths']:
            for key_name_api in data['paths'][key_path]:
                tag = data['paths'][key_path][key_name_api]["tags"]
                tags.append(tag[0])
                print(tag)
    return tags

def getRequiredHeaders(data,key_path):
    headers = []
    refs = []
    path = data['paths'][key_path]
    pathKey = list(path.keys())
    parameters = path[pathKey[0]]["parameters"]
    # parametersKeys = list(path[pathKey[0]]["parameters"].keys())
    # create headers list 
    for parameter in  parameters :
        ref = parameter["$ref"]
        ref = ref.replace("#/","")
        refs.append(re.split('/',ref)[-1])
    for ref in refs: 
        if testRef(data,ref) :
            print(ref)
            headers.append(ref)
    return headers


def testRef(data,ref):
    # test if ref a header and is required
    refData = data["components"]["parameters"][ref]
    
    # Chaeck if ref is a header
    if refData["in"] == "header":
        # Chaeck if ref is a required
        if refData["required"] == True :
            return True



# def addRequiredHeaders(file_path,headers,folderName):

#     template_env_file_path = file_path
#     with open(template_env_file_path) as f:
#         data = yaml.load(f, Loader=yaml.FullLoader)
#         print(data)
    





#   accounts:
#       events:
#         - http:
#             cors: true
#             reqValidatorName: onlyHead
#             integration: lambda
#             method: post
#             path: /v1.0.8/accounts
#             request:
#               parameters:
#                   headers:
#                     test: true
#                     "test2": true
