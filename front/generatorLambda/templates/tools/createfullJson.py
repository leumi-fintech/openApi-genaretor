# from ruamel.yaml import YAML
# import re
# import json
# import yaml
# import pathlib
# import jsonref
# import os
# from pprint import pp, pprint
# import sys


# def createExample(data):
#     Example = {
#         "headers" : {},
#         "body" : {},
#         "description" : ""
#     }
#     headers = data["headers"]
#     for header in headers :
#         if data["headers"][header]["required"] == True : 
#              pprint(data["headers"][header])
#              Example["headers"][header] = data["headers"][header]["example"]
#     try: 
#         body = data["content"]["application/json"]["examples"]
#         Example["body"] = body
#     except :
#         del Example["body"]
    
#     Example["description"] = data["description"]
#     return Example


# def getResponsebody(data,key_path):
#     path = data['paths'][key_path]
#     last_path = re.sub('[^a-zA-Z0-9 \n\.]', '', os.path.basename(os.path.normpath(key_path)))
#     pathKey = list(path.keys())
#     responses = path[pathKey[0]]["responses"]
#     responsesKeys = list(path[pathKey[0]]["responses"].keys())
#     try:
#         os.makedirs(f"examples/{last_path}")
#     except FileExistsError:
#     # directory already exists
#         pass
#     for key in responsesKeys: 
#         print (key)
#         example = createExample(path[pathKey[0]]["responses"][key])
#         with open(f"examples/{last_path}/{key}.json","w")  as outJson :
#             json.dump(example,outJson,indent=4)


# def getResponsebodyExamples(data,responsesRefKey):
#     try:
#         examples = data["components"]["responses"][responsesRefKey]["content"]["application/json"]["examples"]
#     except:
#         return {
#             'examples' : "path dose not have a example response body"
#         }
#     example = list(examples.keys())[0]
#     exampleRef = examples[example]["$ref"]
#     exampleRef = exampleRef.replace("#/","")
#     exampleKey = re.split('/',exampleRef)
#     exampleBody = data["components"]["examples"][exampleKey[-1]]["value"]
#     return  exampleBody



# def createFullOpenApiJson(api,openApiFile = "openApi.yaml" ) : 
#     template_env_file_path = openApiFile
#     with open(template_env_file_path) as f:
#         yamldata = yaml.load(f, Loader=yaml.FullLoader)
#         with open("example.json", "w") as json_out:
#             json.dump(yamldata,json_out,indent=4)
#             json_out.close()
#         with open("example.json") as f :
#             data = j = jsonref.load(f)
#             with open("fullOpenApi.json", "w")  as json_out:
#                 json.dump(data,json_out,indent=4)



# def main():
#     env = sys.argv[1]
#     if len(sys.argv) == 2 :
#         tags = getTags()
#         tags = list (dict.fromkeys(tags))
#         print(tags)
#         for tag in tags :
#             api = tag 
#             createServerlessYaml(env,api)
        
#     else : 
#         for apiNum in range(2, len(sys.argv)):
#             api = sys.argv[apiNum]
#             createServerlessYaml(api,openApiFile)


# if __name__ == "__main__":
#     x = main()

