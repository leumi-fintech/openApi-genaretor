
import string
import yaml
import os
import sys
from shutil import copyfile
from string import Template
from pathlib import Path
from ruamel.yaml import YAML
import re
import json

def createHandlerFile(folder_path,key_path ,file_handler,responseModel,responseBody):
    handler = """ 
    module.exports.$last_path = async (event) => {
    let response = {
        statusCode: 200,
        body: ""
    }
    /***
    Set your code here! 
    ***/
    response.body = JSON.stringify( $responseBody)
    return response
    };
    """
    last_path = re.sub('[^a-zA-Z0-9 \n\.]', '', os.path.basename(os.path.normpath(key_path)))
    create_handler = Template(handler).substitute(last_path=last_path,consents=responseModel,responseBody=str(responseBody))
    with open(file_handler, "a") as file_object:
        file_object.write(create_handler)

def addFile_handleRrequire(file_handler):
    validateReqest =  """ const {validateReqest,} = require('./utils/validateSwaggerUtils');"""
    lambdify =  """ const {lambdify,} = require('./utils/response-utils');"""
    # Validator =  """ const { Validator } = require('./utils/validation/Validator');"""
    # SignatureValidation = """const {  SignatureValidation,} = require('./utils/validation/SignatureValidation');"""
    # CertificateValidation = """const {   CertificateValidation,} = require('./utils/validation/CertificateValidation');""" 
    # validateCertificates  = "const {  validateCertificates,} = require('./utils/certificateEnforcer/certEnforcerUtils');"
    # logEvent = """const { logEvent } = require('./utils/loggingUtils/logUtils');"""
    # DigestValidation = """const { DigestValidation } = require('./utils/validation/DigestValidation');"""
    # UidValidation = """const { UidValidation } = require('./utils/validation/UidValidation');"""

    line_prepender(file_handler,validateReqest)
    line_prepender(file_handler,lambdify)
    # line_prepender(file_handler,Validator)
    # line_prepender(file_handler,SignatureValidation)
    # line_prepender(file_handler,CertificateValidation)
    # line_prepender(file_handler,validateCertificates)
    # line_prepender(file_handler,logEvent)
    # line_prepender(file_handler,DigestValidation)
    # line_prepender(file_handler,UidValidation)

def formatPackageJson(file_handler,responseModel):
    packagePath = file_handler  + "/package.json"
    with open(packagePath) as f:
        data = json.load(f)
        data["name"] = responseModel
        json.dump(data, open(packagePath, "w"), indent = 4)
        


def line_prepender(filename, line):
    with open(filename, 'r+') as f:
        content = f.read()
        f.seek(0, 0)
        f.write(line.rstrip('\r\n') + '\n' + content)
        f.close()

def getResponsebody(data,key_path):
    path = data['paths'][key_path]
    pathKey = list(path.keys())
    responses = path[pathKey[0]]["responses"]
    responsesKeys = list(path[pathKey[0]]["responses"].keys())
    responsesRef = path[pathKey[0]]["responses"][responsesKeys[0]]["$ref"]
    responsesRef = responsesRef.replace("#/","")
    responsesRefKey = re.split('/',responsesRef)[-1]
    return getResponsebodyExamples(data,responsesRefKey)

def getResponsebodyExamples(data,responsesRefKey):
    try:
        examples = data["components"]["responses"][responsesRefKey]["content"]["application/json"]["examples"]
    except:
        return {
            'examples' : "path dose not have a example response body"
        }
    example = list(examples.keys())[0]
    exampleRef = examples[example]["$ref"]
    exampleRef = exampleRef.replace("#/","")
    exampleKey = re.split('/',exampleRef)
    exampleBody = data["components"]["examples"][exampleKey[-1]]["value"]
    return  exampleBody