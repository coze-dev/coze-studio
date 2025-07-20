import json
import sys
import os
import asyncio
import time
import random
try:
    from RestrictedPython import safe_builtins, limited_builtins, utility_builtins
except ModuleNotFoundError:
    print("RestrictedPython module required, please run pip install RestrictedPython",file=sys.stderr)
    sys.exit(1)

custom_builtins = safe_builtins.copy()

custom_builtins['__import__'] = __import__
custom_builtins['asyncio'] = asyncio
custom_builtins['json'] = json
custom_builtins['time'] = time
custom_builtins['random'] = random

restricted_globals = {
    '__builtins__': custom_builtins,
    '_utility_builtins': utility_builtins,
    '_limited_builtins': limited_builtins,
    '__name__': '__main__',
    'dict': dict,
    'list': list,
    'print': print,
    'set': set,

}

class Args:
    def __init__(self, params):
        self.params = params


DefaultCode = """
class Args:
    def __init__(self, params):
        self.params = params
class Output(dict):
    pass
"""


async def run_main(app_code, params):
    try:
        complete_code = DefaultCode + app_code
        locals_dict = {"args": Args(params=params)}
        exec(complete_code, restricted_globals, locals_dict)  # ignore_security_alert
        main_func = locals_dict['main']
        ret = await main_func(locals_dict['args'])
    except Exception as e:
        print(f"{type(e).__name__}: {str(e)}", file=sys.stderr)
        sys.exit(1)
    return ret


code = sys.argv[1]
result = asyncio.run(run_main(code, params=json.loads(sys.argv[2])))
print(json.dumps(result))
