    
import string
import yaml
import os
import sys
from shutil import copyfile,copytree,rmtree
from string import Template
from pathlib import Path
from ruamel.yaml import YAML
import re
import datetime
from pprint import pp, pprint
import json
import jsonref
import copy
from generatorLambdaUtils.nginxUtils import createNginxConfig
from generatorLambdaUtils.cliUtils import getParser

def npmInstall(folder_path):
    os.system(f"cd {folder_path} ; npm i  ")
    os.system("cd ..")
    os.system("cd ..")

def slsDeploy(folder_path):
    os.system(f"cd {folder_path} ; sls deploy ")
    os.system("cd ..")
    os.system("cd ..")



def prepareServelessYaml(file_path,folder_name,env): 
    # date = datetime.datetime.now()
    # dateTime = date.strftime("%Y%m%d%M")
    template_env_file_path = file_path
    with open(template_env_file_path) as f:
        data = yaml.load(f, Loader=yaml.FullLoader)
        data["provider"]["apiName"] = folder_name + " api gateway" 
        data["provider"]["deploymentBucket"] = folder_name + "-leumi"
        data["provider"]["tags"]["env"] = "dev"
        data["provider"]["tags"]["system"] = "Open Banking Aws"
        data["provider"]["tags"]["applications"] = "Open Banking Aws"
        # for key in data["functions"] :
        #     eventList = []
        #     for event in data["functions"][key]["events"]:
        #         eventList.append(data["functions"][key]["events"])
        #     data["functions"][key]["events"] = eventList
        data["service"] = folder_name  
        data["provider"]["profile"] = "ob-" + env
        with open(file_path, 'w') as yaml_file:
            yaml.dump(data, yaml_file)
            yaml_file.close()



def changePathParameters(file_path):
    paths = []
    with open(file_path,'r') as f:
        data = yaml.load(f, Loader=yaml.FullLoader)
    for function in data['functions']:
        data['functions'][function]["events"][0]["http"]["path"]
        print(data['functions'][function]["events"][0]["http"]["path"])
        path =  data['functions'][function]["events"][0]["http"]["path"] 
        paths.append(path)
    #     if "-" in  path :
    #         key_pathArry = path.split("-")
    #         for i in range(len(key_pathArry))[1::2] :
    #             # print(key_pathArry[i])
    #             key = key_pathArry[i]
    #             key_pathArry[i]= key
    #         newPath = "".join(key_pathArry)
    #         paths.append(newPath)
            
    #         data['functions'][function]["events"][0]["http"]["path"] = newPath
    # #         print(file_path)
    # addAllPaths(paths,file_path,data)
    # with open(file_path,'w') as file : 
    #     yaml.dump(data,file)
    return addAllPaths(paths,file_path,data)


def addAllPaths(paths,serverless_path,serveless_data) :
    openApi_path = serverless_path.replace("serverless.yml","openApi.yaml")
    pprint(openApi_path)
    with open(openApi_path, 'r') as yaml_in :
        with open(serverless_path.replace("serverless.yml","openApi.json"), "w") as json_out:
                yamldata = yaml.load(yaml_in, Loader=yaml.FullLoader)
                json.dump(yamldata, json_out,indent=4)
        with open(serverless_path.replace("serverless.yml","openApi.json"),"r") as jsonf : 
            data = jsonref.load(jsonf)
            with open(serverless_path.replace("serverless.yml","fullOpenApi.json"), "w")  as json_out:
                json.dump(data,json_out,indent=4)
            # with open(serverless_path.replace("serverless.yml","openApi.json"),"r") as jsonf2 : 
            #     json.dump(serverless_path.replace("serverless.yml","fullOpenApi.json"),jsonref.load(data),indent=4)
            # jsonf.close()


    return defGetallPaths(paths,data,serverless_path)

def defGetallPaths(paths,data,serverless_path) : 
    # print(paths)
    pathsobj = {}
    parser = getParser()
    args = parser.parse_args()
    folder_path = serverless_path.replace("/" + "serverless.yml","" )
    for key_path in data["paths"] : 
        
        if key_path in paths : 
            newObj = {}
            print(key_path)
            path_data = data["paths"][key_path]
            pathKeys = path_data.keys()
            for methodKey in pathKeys :
                newObj[methodKey] = {}
                newObj[methodKey]["paths"] = [key_path]
                for parametar in data["paths"][key_path][methodKey]["parameters"] : 
                    if(parametar["in"] == "path" and parametar["required"] == True ) :
                        schema = parametar["schema"]
                        if("enum" in schema.keys()) :
                            enums = schema["enum"]
                            newPaths = []
                            for enum in enums : 
                                for newPath in newObj[methodKey]["paths"] : 
                                    if len(args.rt) !=  0   :
                                        print (args.rt)
                                        for rt in args.rt :
                                            if  newPath.replace("{"+ parametar["name"] + "}", enum).find("/" + rt + "/") != -1  :
                                                newPaths.append(newPath.replace("{"+ parametar["name"] + "}", enum))
                                                print(newPath.replace("{"+ parametar["name"] + "}", enum))
                                                break
                                    else : 
                                        newPaths.append(newPath.replace("{"+ parametar["name"] + "}", enum))
                            for p in newPaths :
                                createNginxConfig(p,folder_path)
                            newObj[methodKey]["paths"] = newPaths
        pathsobj[key_path] = newObj
    return pathsobj
                
def createFullServelrssYmal(filepath,paths,folder_path):
    
    with open(filepath) as f :
        data = yaml.load(f, Loader=yaml.FullLoader)
    newData = data
    pathsKeys= list(paths.keys())
    for function in data["functions"] :
        # pprint(data["functions"][function])
        newEvents = []
        for event in data["functions"][function]["events"] : 
            for httpEvent in event : 
                if event[httpEvent]["path"] in list(paths.keys()) : 
                    newPathsData = paths[event[httpEvent]["path"]]
                    try :  
                        for methodKey in list(newPathsData.keys()) :
                                    for newNewPath in paths[event[httpEvent]["path"]][methodKey]["paths"] :
                                        newHttpEvent = copy.deepcopy(event[httpEvent])
                                        newHttpEvent["method"] = methodKey 
                                        newHttpEvent["path"] = newNewPath
                                        # pprint (newHttpEvent) 
                                        temp = {}
                                        temp["http"] = newHttpEvent 
                                        data["functions"][function]["events"].append(temp)
                                        print(temp)
            

                    except : 
                        pass
        del data["functions"][function]["events"][0]
            # newEvents.append(eventss)
        
        # pprint
    with open(filepath, 'w') as f :
        yaml.dump(newData,f)



