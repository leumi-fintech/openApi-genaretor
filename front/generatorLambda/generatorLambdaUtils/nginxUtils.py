import string
import yaml
import os
import sys
from shutil import copyfile
from string import Template
from pathlib import Path
from ruamel.yaml import YAML
import re


config_file = '/nginx-config'
build_file = '/build-output.yml'
def createNginxConfig(key_path ,folder_path):
    nginx = """\
location ^~ $key_path {
    #prox pass to APIGateway by http
    proxy_pass_request_headers on;
    proxy_ssl_server_name on;
    proxy_set_header Host $proxy_host;
    proxy_pass $uri;
    include /etc/nginx/proxy-set-header.conf;
    }
    """
    proxy_host='$proxy_host'
    uri='$uri'
    create_nginx_config = Template(nginx).substitute(key_path=key_path,proxy_host=proxy_host,uri=uri)
    with open(folder_path + config_file, 'a+') as f:
        f.write(create_nginx_config)
        f.close

def addUri(folder_path):
    
    with open(folder_path + build_file,'r') as file:
        p = yaml.load(file, Loader=yaml.FullLoader)
        uri = p['ServiceEndpoint']
    
    with open(folder_path + config_file,'r') as f:
        newlines = ['ServiceEndpoint']
        for line in f.readlines():
            newlines.append(line.replace('$uri', uri))
    with open(folder_path + config_file, 'w') as f:
        for line in newlines:
            f.write(line)