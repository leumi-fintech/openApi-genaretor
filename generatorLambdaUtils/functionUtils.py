
    
import string
import yaml
import os
import sys
from shutil import copyfile
from string import Template
from pathlib import Path
from ruamel.yaml import YAML
import re



def createFunction(api ,key_method ,key_path ,folder_path,handler_name):
    function = """\
    $apiname:
        name: name
        handler: usagePlansHandler.all
        events:
            http:
                path: application/usage-plans/all/consumer
                method: get
                integration: LAMBDA_PROXY
                private: true
                cors: true
        layers:
            - { Ref: NodeModulesUsagePlanLambdaLayer }
    """

    last_path = re.sub('[^a-zA-Z0-9 \n\.]', '', os.path.basename(os.path.normpath(key_path)))
    # last_path = key_method + "-" + last_path
    last_path = last_path + "-" +  key_method 
    create_functions = Template(function).substitute(apiname=last_path)
    yaml2 = YAML()
    code = yaml.safe_load(create_functions)
    code[last_path]['events'] = [{
        "http": {
            "path":"",
            "method":"",
            "reqValidatorName": "onlyHead"
        }
    }]
    # code[last_path]['events'][0]['http'] = {}
    code[last_path]['events'][0]['http']['path'] = key_path
    code[last_path]['events'][0]['http']['method'] = key_method
    code[last_path]['name'] = last_path
    code[last_path]['handler'] = handler_name.replace(".js",".") + last_path
    # code[last_path]['events']['http']['authorizer']['arn'] = '${REACT_APP_AWS_PROVIDER_USER_POOL_ARN}'
    with open(folder_path+"/function.yml", "a") as file_object:
        yaml2.dump(code, file_object)
        file_object.close()

def appandFunctions(folder_path,file_path): 
    with open(folder_path+'/function.yml') as fp:
        function_yml_data = yaml.safe_load(fp)
    with open(file_path) as fp:
        serverless_yml_data = yaml.safe_load(fp)
    serverless_yml_data["functions"] = function_yml_data
    with open(file_path, 'w') as yaml_file:
        yaml.dump(serverless_yml_data, yaml_file)
        yaml_file.close()

def createFunctionYml(folder_path):
    with open(folder_path+"/function.yml", "w") as file_object:
        pass
        file_object.close()
        
def addRequiredHeaders(folder_path,headers,key_path,key_method):
    # FIXME:test if header is reqwired 
    with open(folder_path+'/function.yml','r+') as fp:
        function_yml_data = yaml.load(fp)
        fp.close()
        last_path = re.sub('[^a-zA-Z0-9 \n\.]', '', os.path.basename(os.path.normpath(key_path)))
        # last_path = key_method + "-" + last_path
        last_path = last_path + "-" +  key_method 
    function_yml_data[last_path]["events"][0]["http"]["request"] = {}
    function_yml_data[last_path]["events"][0]["http"]["request"]["parameters"] = {}
    function_yml_data[last_path]["events"][0]["http"]["request"]["parameters"]["headers"] = {}
    for header in headers: 
        function_yml_data[last_path]["events"][0]["http"]["request"]["parameters"]["headers"][header] = True
    print(function_yml_data[last_path]["events"][0]["http"]["request"]["parameters"]["headers"] )
    with open(folder_path+'/function.yml','w') as fp:
        yaml.dump(function_yml_data, fp)
        fp.close()

