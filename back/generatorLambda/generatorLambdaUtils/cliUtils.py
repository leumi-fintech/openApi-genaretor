import argparse

def getParser():
    parser = argparse.ArgumentParser(allow_abbrev=False)
    parser.add_argument('--test', type=str,required=True,dest= "env")
    parser.add_argument('--tags', nargs='*', type=str,required=True,dest= "tags")
    parser.add_argument('--restrictedPaths',"--rt", nargs='*', type=str,dest= "rt")
    return parser