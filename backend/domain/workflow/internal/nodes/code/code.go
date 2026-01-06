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

package code

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"

	"golang.org/x/exp/maps"

	wf "github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/infra/coderunner"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

const (
	coderRunnerRawOutputCtxKey      = "ctx_raw_output"
	coderRunnerWarnErrorLevelCtxKey = "ctx_warn_error_level"
)

var (
	importRegex     = regexp.MustCompile(`^\s*import\s+([a-zA-Z0-9_.,\s]+)`)
	fromImportRegex = regexp.MustCompile(`^\s*from\s+([a-zA-Z0-9_.]+)\s+import`)
)

// pythonBuiltinModules is the list of python built-in modules,
// see: https://docs.python.org/3.9/library/
var pythonBuiltinModules = map[string]struct{}{
	"abc": {}, "aifc": {}, "antigravity": {}, "argparse": {}, "ast": {}, "asynchat": {}, "asyncio": {}, "asyncore": {}, "array": {},
	"atexit": {}, "base64": {}, "bdb": {}, "binhex": {}, "bisect": {}, "builtins": {}, "bz2": {}, "cProfile": {}, "binascii": {},
	"calendar": {}, "cgi": {}, "cgitb": {}, "chunk": {}, "cmd": {}, "code": {}, "codecs": {}, "codeop": {}, "cmath": {}, "audioop": {},
	"collections": {}, "colorsys": {}, "compileall": {}, "concurrent": {}, "configparser": {}, "contextlib": {}, "contextvars": {}, "copy": {},
	"copyreg": {}, "crypt": {}, "csv": {}, "ctypes": {}, "curses": {}, "dataclasses": {}, "datetime": {}, "dbm": {}, "fcntl": {},
	"decimal": {}, "difflib": {}, "dis": {}, "distutils": {}, "doctest": {}, "email": {}, "encodings": {}, "ensurepip": {}, "ossaudiodev": {},
	"enum": {}, "errno": {}, "faulthandler": {}, "filecmp": {}, "fileinput": {}, "fnmatch": {}, "formatter": {}, "fractions": {},
	"ftplib": {}, "functools": {}, "gc": {}, "genericpath": {}, "getopt": {}, "getpass": {}, "gettext": {}, "glob": {}, "grp": {},
	"graphlib": {}, "gzip": {}, "hashlib": {}, "heapq": {}, "hmac": {}, "html": {}, "http": {}, "imaplib": {}, "msvcrt": {},
	"imghdr": {}, "imp": {}, "importlib": {}, "inspect": {}, "io": {}, "ipaddress": {}, "itertools": {}, "json": {}, "mmap": {},
	"keyword": {}, "lib2to3": {}, "linecache": {}, "locale": {}, "logging": {}, "lzma": {}, "mailbox": {}, "mailcap": {}, "msilib": {},
	"marshal": {}, "math": {}, "mimetypes": {}, "modulefinder": {}, "multiprocessing": {}, "netrc": {}, "nntplib": {}, "ntpath": {},
	"nturl2path": {}, "numbers": {}, "opcode": {}, "operator": {}, "optparse": {}, "os": {}, "pathlib": {}, "pdb": {}, "readline": {},
	"pickle": {}, "pickletools": {}, "pipes": {}, "pkgutil": {}, "platform": {}, "plistlib": {}, "poplib": {}, "posix": {}, "parser": {},
	"posixpath": {}, "pprint": {}, "profile": {}, "pstats": {}, "pty": {}, "pwd": {}, "py_compile": {}, "pyclbr": {}, "spwd": {},
	"pydoc": {}, "pydoc_data": {}, "queue": {}, "quopri": {}, "random": {}, "re": {}, "reprlib": {}, "rlcompleter": {}, "resource": {},
	"runpy": {}, "sched": {}, "secrets": {}, "selectors": {}, "shelve": {}, "shlex": {}, "shutil": {}, "signal": {}, "select": {},
	"site": {}, "smtpd": {}, "smtplib": {}, "sndhdr": {}, "socket": {}, "socketserver": {}, "sqlite3": {}, "sre_compile": {},
	"sre_constants": {}, "sre_parse": {}, "ssl": {}, "stat": {}, "statistics": {}, "string": {}, "stringprep": {}, "struct": {},
	"subprocess": {}, "sunau": {}, "symbol": {}, "symtable": {}, "sys": {}, "sysconfig": {}, "tabnanny": {}, "tarfile": {}, "nis": {},
	"telnetlib": {}, "tempfile": {}, "textwrap": {}, "this": {}, "threading": {}, "time": {}, "timeit": {}, "tkinter": {}, "test": {},
	"token": {}, "tokenize": {}, "trace": {}, "traceback": {}, "tracemalloc": {}, "tty": {}, "turtle": {}, "turtledemo": {},
	"types": {}, "typing": {}, "unittest": {}, "urllib": {}, "uu": {}, "uuid": {}, "venv": {}, "warnings": {}, "termios": {},
	"wave": {}, "weakref": {}, "webbrowser": {}, "wsgiref": {}, "xdrlib": {}, "xml": {}, "xmlrpc": {}, "xxsubtype": {}, "zlib": {},
	"zipapp": {}, "zipfile": {}, "zipimport": {}, "zoneinfo": {}, "winreg": {}, "syslog": {}, "winsound": {}, "unicodedata": {},
}

// pythonBuiltinBlacklist is the blacklist of python built-in modules,
// see: https://www.coze.cn/open/docs/guides/code_node#7f41f073
var pythonBuiltinBlacklist = map[string]struct{}{
	"curses":          {},
	"dbm":             {},
	"ensurepip":       {},
	"fcntl":           {},
	"grp":             {},
	"idlelib":         {},
	"lib2to3":         {},
	"msvcrt":          {},
	"pwd":             {},
	"resource":        {},
	"syslog":          {},
	"termios":         {},
	"tkinter":         {},
	"turtle":          {},
	"turtledemo":      {},
	"venv":            {},
	"winreg":          {},
	"winsound":        {},
	"multiprocessing": {},
	"threading":       {},
	"socket":          {},
	"pty":             {},
	"tty":             {},
}

type Config struct {
	Code     string
	Language coderunner.Language

	Runner coderunner.Runner
}

func (c *Config) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeCodeRunner,
		Name:    n.Data.Meta.Title,
		Configs: c,
	}
	inputs := n.Data.Inputs

	code := inputs.Code
	c.Code = code

	language, err := convertCodeLanguage(inputs.Language)
	if err != nil {
		return nil, err
	}
	c.Language = language

	if err := convert.SetInputsForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	if err := convert.SetOutputTypesForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func convertCodeLanguage(l int64) (coderunner.Language, error) {
	switch l {
	case 5:
		return coderunner.JavaScript, nil
	case 3:
		return coderunner.Python, nil
	default:
		return "", fmt.Errorf("invalid language: %d", l)
	}
}

func (c *Config) Build(_ context.Context, ns *schema.NodeSchema, _ ...schema.BuildOption) (any, error) {

	if c.Language != coderunner.Python {
		return nil, errors.New("only support python language")
	}

	importErr := validatePythonImports(c.Code)

	return &Runner{
		code:         c.Code,
		language:     c.Language,
		outputConfig: ns.OutputTypes,
		runner:       coderunner.GetCodeRunner(),
		importError:  importErr,
	}, nil
}

type Runner struct {
	outputConfig map[string]*vo.TypeInfo
	code         string
	language     coderunner.Language
	runner       coderunner.Runner
	importError  error
}

func validatePythonImports(code string) error {
	imports := parsePythonImports(code)
	importErrors := make([]string, 0)

	pythonThirdPartyWhitelist := slices.ToMap(wf.GetRepository().GetNodeOfCodeConfig().GetSupportThirdPartModules(), func(e string) (string, bool) {
		return e, true
	})
	var blacklistedModules []string
	var nonWhitelistedModules []string
	for _, imp := range imports {
		if _, ok := pythonBuiltinModules[imp]; ok {
			if _, blacklisted := pythonBuiltinBlacklist[imp]; blacklisted {
				blacklistedModules = append(blacklistedModules, imp)
			}
		} else {
			if _, whitelisted := pythonThirdPartyWhitelist[imp]; !whitelisted {
				nonWhitelistedModules = append(nonWhitelistedModules, imp)
			}
		}
	}

	if len(blacklistedModules) > 0 {
		moduleNames := fmt.Sprintf("'%s'", strings.Join(blacklistedModules, "', '"))
		importErrors = append(importErrors, fmt.Sprintf("ModuleNotFoundError: The module(s) %s are removed from the Python standard library for security reasons\n", moduleNames))
	}
	if len(nonWhitelistedModules) > 0 {
		moduleNames := fmt.Sprintf("'%s'", strings.Join(nonWhitelistedModules, "', '"))
		importErrors = append(importErrors, fmt.Sprintf("ModuleNotFoundError: No module named %s\n", moduleNames))
	}

	if len(importErrors) > 0 {
		return errors.New(strings.Join(importErrors, ","))
	}

	return nil
}

func (c *Runner) Invoke(ctx context.Context, input map[string]any) (ret map[string]any, err error) {
	if c.importError != nil {
		return nil, vo.WrapError(errno.ErrCodeExecuteFail, c.importError, errorx.KV("detail", c.importError.Error()))
	}
	response, err := c.runner.Run(ctx, &coderunner.RunRequest{Code: c.code, Language: c.language, Params: input})
	if err != nil {
		return nil, vo.WrapError(errno.ErrCodeExecuteFail, err, errorx.KV("detail", err.Error()))
	}

	result := response.Result
	ctxcache.Store(ctx, coderRunnerRawOutputCtxKey, result)

	output, ws, err := nodes.ConvertInputs(ctx, result, c.outputConfig)
	if err != nil {
		return nil, vo.WrapIfNeeded(errno.ErrCodeExecuteFail, err, errorx.KV("detail", err.Error()))
	}

	if ws != nil && len(*ws) > 0 {
		logs.CtxWarnf(ctx, "convert inputs warnings: %v", *ws)
		ctxcache.Store(ctx, coderRunnerWarnErrorLevelCtxKey, *ws)
	}

	return output, nil

}

func (c *Runner) ToCallbackOutput(ctx context.Context, output map[string]any) (*nodes.StructuredCallbackOutput, error) {
	rawOutput, ok := ctxcache.Get[map[string]any](ctx, coderRunnerRawOutputCtxKey)
	if !ok {
		return nil, errors.New("raw output config is required")
	}

	rawOutputStr, err := sonic.MarshalString(rawOutput)
	if err != nil {
		return nil, err
	}

	var wfe vo.WorkflowError
	if warnings, ok := ctxcache.Get[nodes.ConversionWarnings](ctx, coderRunnerWarnErrorLevelCtxKey); ok {
		wfe = vo.WrapWarn(errno.ErrNodeOutputParseFail, warnings, errorx.KV("warnings", warnings.Error()))
	}
	return &nodes.StructuredCallbackOutput{
			Output:    output,
			RawOutput: &rawOutputStr,
			Error:     wfe,
		},
		nil

}

func parsePythonImports(code string) []string {
	modules := make(map[string]struct{})
	lines := strings.Split(code, "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "#") {
			continue
		}

		if matches := importRegex.FindStringSubmatch(line); len(matches) > 1 {
			importedItemsStr := matches[1]
			importedItems := strings.Split(importedItemsStr, ",")
			for _, item := range importedItems {
				item = strings.TrimSpace(item)
				parts := strings.Split(item, " ")
				if len(parts) > 0 {
					moduleName := parts[0]
					topLevelModule := strings.Split(moduleName, ".")[0]
					modules[topLevelModule] = struct{}{}
				}
			}
			continue
		}

		if matches := fromImportRegex.FindStringSubmatch(line); len(matches) > 1 {
			fullModuleName := matches[1]
			parts := strings.Split(fullModuleName, ".")
			if len(parts) > 0 {
				modules[parts[0]] = struct{}{}
			}
		}
	}

	return maps.Keys(modules)
}
