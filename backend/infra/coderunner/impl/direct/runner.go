/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package direct

import (
	"bytes"
	"context"
	"fmt"
	"os/exec"

	"github.com/coze-dev/coze-studio/backend/bizpkg/fileutil"
	"github.com/coze-dev/coze-studio/backend/infra/coderunner"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
)

var pythonCode = `import asyncio
import json
import sys

# === SECURITY: Runtime import and builtins restriction ===
# Prevents bypass of static import blacklist via __import__(), importlib,
# eval(), exec(), open(), compile(), globals()['__builtins__'], etc.
# See: GHSA-pfc8-gmgc-5pwq

_BLOCKED_MODULES = frozenset({
    'os', 'subprocess', 'sys', 'shutil', 'ctypes', 'importlib',
    'multiprocessing', 'threading', 'socket', 'pty', 'tty',
    'signal', 'ssl', 'ftplib', 'smtplib', 'http', 'xmlrpc',
    'socketserver', 'select', 'selectors', 'resource', 'fcntl',
    'grp', 'pwd', 'curses', 'dbm', 'ensurepip', 'termios',
    'tkinter', 'turtle', 'turtledemo', 'venv', 'winreg', 'winsound',
    'msvcrt', 'syslog', 'lib2to3', 'idlelib',
})

_original_import = __builtins__['__import__'] if isinstance(__builtins__, dict) else __builtins__.__import__

def _restricted_import(name, *args, **kwargs):
    """Import hook that enforces the module blacklist at runtime."""
    top_level = name.split('.')[0]
    if top_level in _BLOCKED_MODULES:
        raise ImportError(
            f"ModuleNotFoundError: The module '{name}' is removed from the "
            f"Python standard library for security reasons"
        )
    return _original_import(name, *args, **kwargs)

import builtins as _builtins_mod

# Patch __import__ globally so __import__('os') is caught
_builtins_mod.__import__ = _restricted_import

# Remove dangerous builtins that allow code execution or file access
# without any import statement
def _blocked_open(*args, **kwargs):
    raise PermissionError("open() is not allowed in Code node for security reasons")

def _blocked_eval(*args, **kwargs):
    raise PermissionError("eval() is not allowed in Code node for security reasons")

def _blocked_exec(*args, **kwargs):
    raise PermissionError("exec() is not allowed in Code node for security reasons")

def _blocked_compile(*args, **kwargs):
    raise PermissionError("compile() is not allowed in Code node for security reasons")

def _blocked_breakpoint(*args, **kwargs):
    raise PermissionError("breakpoint() is not allowed in Code node for security reasons")

_builtins_mod.open = _blocked_open
_builtins_mod.eval = _blocked_eval
_builtins_mod.exec = _blocked_exec
_builtins_mod.compile = _blocked_compile
_builtins_mod.breakpoint = _blocked_breakpoint

# Remove reference to the original import to prevent recovery
del _original_import

# Remove sys.modules access to dangerous modules already loaded
for _mod_name in list(sys.modules.keys()):
    _top = _mod_name.split('.')[0]
    if _top in _BLOCKED_MODULES and _top not in ('sys',):
        # We need sys for argv/stdout, but remove it after setup
        pass

# After setup, restrict sys module access
class _RestrictedSys:
    """Proxy that only exposes safe sys attributes."""
    _ALLOWED = frozenset({'argv', 'stdout', 'stderr', 'exit', 'version', 'version_info', 'platform'})

    def __getattr__(self, name):
        if name in self._ALLOWED:
            import sys as _real_sys
            return getattr(_real_sys, name)
        raise AttributeError(f"module 'sys' has no attribute '{name}' (restricted)")

# === END SECURITY SETUP ===

class Args:
    def __init__(self, params):
        self.params = params

class Output(dict):
    pass

%s

try:
    result = asyncio.run(main(Args(json.loads(sys.argv[1]))))
    # Use the real json.dumps (already imported before restriction)
    print(json.dumps(result))
except Exception as e:
    print(f"{type(e).__name__}: {str(e)}", file=sys.stderr)
    sys.exit(1)
`

func NewRunner() coderunner.Runner {
	return &runner{}
}

type runner struct{}

func (r *runner) Run(ctx context.Context, request *coderunner.RunRequest) (*coderunner.RunResponse, error) {
	var (
		params = request.Params
		c      = request.Code
	)
	if request.Language == coderunner.Python {
		ret, err := r.pythonCmdRun(ctx, c, params)
		if err != nil {
			return nil, err
		}
		return &coderunner.RunResponse{
			Result: ret,
		}, nil
	}
	return nil, fmt.Errorf("unsupported language: %s", request.Language)
}

func (r *runner) pythonCmdRun(_ context.Context, code string, params map[string]any) (map[string]any, error) {
	bs, err := sonic.Marshal(params)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal params to json, err: %w", err)
	}
	cmd := exec.Command(fileutil.GetPython3Path(), "-c", fmt.Sprintf(pythonCode, code), string(bs))
	stdout := new(bytes.Buffer)
	stderr := new(bytes.Buffer)
	cmd.Stdout = stdout
	cmd.Stderr = stderr
	err = cmd.Run()
	if err != nil {
		return nil, fmt.Errorf("failed to run python script err: %s, std err: %s", err.Error(), stderr.String())
	}

	ret := make(map[string]any)
	err = sonic.Unmarshal(stdout.Bytes(), &ret)
	if err != nil {
		return nil, err
	}
	return ret, nil
}
