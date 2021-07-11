    
import string
import yaml
import os
import sys
from shutil import copyfile,copytree,rmtree
from string import Template
from pathlib import Path
from ruamel.yaml import YAML
import re
import argparse
from generatorLambdaUtils.cliUtils import getParser
import copy
import uuid
from generatorLambdaUtils.deployUtils import npmInstall,prepareServelessYaml,slsDeploy
from generatorLambdaUtils.functionUtils import createFunction,appandFunctions,createFunctionYml,addRequiredHeaders
from generatorLambdaUtils.deployUtils import npmInstall,prepareServelessYaml,slsDeploy,changePathParameters,createFullServelrssYmal
from generatorLambdaUtils.functionUtils import createFunction,appandFunctions,createFunctionYml
from generatorLambdaUtils.handlerUtils import createHandlerFile,addFile_handleRrequire,formatPackageJson,getResponsebody
from generatorLambdaUtils.serverlessUtils import addResouces,getTags,getRequiredHeaders
from generatorLambdaUtils.nginxUtils import createNginxConfig,addUri


#TODO: add body schema validation
#FIXME: serveless dosent support all path events !! 

def createServerlessYaml(env,api,uuidV4):
    folderName = api.lower()
    folderName = re.sub("\s+\S+","",folderName)
    print(folderName)
    folder_path=Template('./devops/generatorLambda/demo/$api').substitute(api=folderName)
    # delete old folders 
    rmtree(folder_path,ignore_errors=True)
    # copy utils folder to the new folder 

    copytree("./devops/generatorLambda/templates/utils/",folder_path + "/utils")
   
    template_env_file_path = './devops/generatorLambda/swaggers/open-banking-1.0.8.yml'
    stream = open(template_env_file_path, 'r')
    #open function file ########### 
    template_create_folder = './devops/generatorLambda/demo/$api'
    create_folder = Template(template_create_folder).substitute(api=folderName)
    Path(create_folder).mkdir(parents=True, exist_ok=True)
    template_file_path = folder_path+'/serverless.$env.yml'
    file_path = Template(template_file_path).substitute(env=env,api=folderName)
     # copy openApi file 
    copyfile('./devops/generatorLambda/templates/serverless.yml', file_path)
    copyfile(template_env_file_path,folder_path+"/swgger.yaml")
    addResouces(file_path)
    createFunctionYml(folder_path)
    file_handler = Template(folder_path+"/$api-handler.js").substitute(api=folderName)
    handler_name = Template("$api-handler.js").substitute(api=folderName)
    print(file_handler)
    with open(file_handler, "w") as file_object:
        pass
    with open(file_path ,'r') as f:
        try:
            serverless_yml_data = yaml.load(f, Loader=yaml.FullLoader)
        except yaml.YAMLError as exc:
            print(exc)
    serverless_yml_data['service'] = api
    serverless_yml_data['provider']['apiName'] = api + "Api Gateway"
    with open(template_env_file_path) as f:
        data = yaml.load(f, Loader=yaml.FullLoader)
        for key_path in data['paths']:
            for key_name_api in data['paths'][key_path]:
                # print(key_name_api)
                tag = data['paths'][key_path][key_name_api]["tags"]
                if tag[0] == api :
                    print("key_path --------------------------------" + key_path) 
                    with open(template_env_file_path) as f:
                        Responsebody = getResponsebody(data,key_path)
                        requiredHeaders =  getRequiredHeaders(data,key_path)
                        createFunction(api ,key_name_api ,key_path,folder_path,handler_name)
                        createHandlerFile(folder_path,key_path ,file_handler,folderName,Responsebody)
                        addRequiredHeaders(folder_path,requiredHeaders,key_path,key_name_api)
                    for key_method in data['paths'][key_path][key_name_api]['parameters']:
                        pass
    appandFunctions(folder_path,file_path)
    addFile_handleRrequire(file_handler)
    # copy package.json 
    copyfile(file_path, file_path.replace(f".{env}",""))
    prepareServelessYaml(file_path.replace(f".{env}",""),folderName,env)
    fullPaths = changePathParameters(file_path.replace(f".{env}",""))
    createFullServelrssYmal(file_path.replace(f".{env}",""),fullPaths,folder_path)
    createFullServelrssYmal(file_path,fullPaths,folder_path)
    copyfile("./devops/generatorLambda/templates/package.json",folder_path  +"/package.json" )
    formatPackageJson(folder_path,folderName)
    # install npm packageses 
    npmInstall(folder_path)
    slsDeploy(folder_path)
    addUri(folder_path)
    
    


def main():
    uuidV4 = uuid.uuid4().hex

    parser = getParser()
    args = parser.parse_args()
    env = "test"
    tags = args.tags
    if len(tags) == 0 :
        openApiTags = getTags()
        openApiTags = list (dict.fromkeys(openApiTags))
        print(tags)
        for tag in tags :
            api = tag 
            createServerlessYaml(env,api,uuidV4)
        
    else : 
        for tag in tags :
            createServerlessYaml(env,tag,uuidV4)



if __name__ == "__main__":

    x = main()



  


