
def getOpenApiPaths(data,api):
    pathArray = []
    for key_path in data['paths'] : 
        for key_name_api in data['paths'][key_path] : 
            tag = data['paths'][key_path][key_name_api]["tags"]
            if tag[0] == api : 
                pathArray.append(key_name_api)
    return pathArray
