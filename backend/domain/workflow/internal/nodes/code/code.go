package code

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"

	"golang.org/x/exp/maps"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/code"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/pkg/ctxcache"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
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

// pythonThirdPartyWhitelist is the whitelist of python third-party modules,
// see: https://www.coze.cn/open/docs/guides/code_node#7f41f073
// If you want to use other third-party libraries, you can add them to this whitelist.
// And you also need to install them in `/scripts/setup/python.sh` and `/backend/Dockerfile` via `pip install`.
var pythonThirdPartyWhitelist = map[string]struct{}{
	"requests_async": {},
	"numpy":          {},
}

type Config struct {
	Code         string
	Language     code.Language
	OutputConfig map[string]*vo.TypeInfo
	Runner       code.Runner
}

type CodeRunner struct {
	config      *Config
	importError error
}

func NewCodeRunner(ctx context.Context, cfg *Config) (*CodeRunner, error) {
	if cfg == nil {
		return nil, errors.New("cfg is required")
	}

	if cfg.Language == "" {
		return nil, errors.New("language is required")
	}

	if cfg.Code == "" {
		return nil, errors.New("code is required")
	}

	if cfg.Language != code.Python {
		return nil, errors.New("only support python language")
	}

	if len(cfg.OutputConfig) == 0 {
		return nil, errors.New("output config is required")
	}

	if cfg.Runner == nil {
		return nil, errors.New("run coder is required")
	}

	importErr := validatePythonImports(cfg.Code)

	return &CodeRunner{
		config:      cfg,
		importError: importErr,
	}, nil
}

func validatePythonImports(code string) error {
	imports := parsePythonImports(code)
	importErrors := make([]string, 0)

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

func (c *CodeRunner) RunCode(ctx context.Context, input map[string]any) (ret map[string]any, err error) {
	if c.importError != nil {
		return nil, vo.WrapError(errno.ErrCodeExecuteFail, c.importError, errorx.KV("detail", c.importError.Error()))
	}
	response, err := c.config.Runner.Run(ctx, &code.RunRequest{Code: c.config.Code, Language: c.config.Language, Params: input})
	if err != nil {
		return nil, vo.WrapError(errno.ErrCodeExecuteFail, err, errorx.KV("detail", err.Error()))
	}

	result := response.Result
	ctxcache.Store(ctx, coderRunnerRawOutputCtxKey, result)
	output, err := formatOutput(ctx, c.config.OutputConfig, result)
	if err != nil {
		return nil, err
	}

	return output, nil

}

func (c *CodeRunner) ToCallbackOutput(ctx context.Context, output map[string]any) (*nodes.StructuredCallbackOutput, error) {
	rawOutput, ok := ctxcache.Get[map[string]any](ctx, coderRunnerRawOutputCtxKey)
	if !ok {
		return nil, errors.New("raw output config is required")
	}

	var wfe vo.WorkflowError
	if warnings, ok := ctxcache.Get[nodes.ConversionWarnings](ctx, coderRunnerWarnErrorLevelCtxKey); ok {
		wfe = vo.WrapWarn(errno.ErrNodeOutputParseFail, warnings, errorx.KV("warnings", warnings.Error()))
	}
	return &nodes.StructuredCallbackOutput{
			Output:    output,
			RawOutput: rawOutput,
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

func formatOutput(ctx context.Context, inInfo map[string]*vo.TypeInfo, in map[string]any) (map[string]any, error) {
	ret := make(map[string]any, len(inInfo))
	var warnings nodes.ConversionWarnings
	for k, info := range inInfo {
		if _, ok := in[k]; !ok {
			ret[k] = nil
			continue
		}
		vv, subWarnings, err := nodes.Convert(ctx, in[k], k, info, nodes.WithWarningDefaultValue(map[vo.DataType]any{
			vo.DataTypeObject: map[string]any{},
			vo.DataTypeArray:  []any{},
		}))
		if err != nil {
			return nil, err
		}

		if len(subWarnings) > 0 {
			warnings = subWarnings.Merge(subWarnings)
		}
		ret[k] = vv

	}

	if len(warnings) > 0 {
		ctxcache.Store(ctx, coderRunnerWarnErrorLevelCtxKey, warnings)
	}

	return ret, nil
}
