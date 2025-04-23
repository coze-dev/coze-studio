package code

import (
	"context"
	"errors"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/code"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
)

const occurWarnErrorKey = "#occur_code_warn_errors"

type Config struct {
	Code            string
	Language        code.Language
	OutputConfig    map[string]*nodes.TypeInfo
	Runner          code.Runner
	IgnoreException bool
	DefaultOutput   map[string]any
}

type CodeRunner struct {
	config *Config
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

	return &CodeRunner{
		config: cfg,
	}, nil
}

func (c *CodeRunner) RunCode(ctx context.Context, input map[string]any) (ret map[string]any, err error) {

	defer func() {
		if err != nil && c.config.IgnoreException {
			ret = c.config.DefaultOutput
			ret["errorBody"] = map[string]interface{}{
				"errorMessage": err.Error(),
				"errorCode":    -1,
			}
			err = nil
		}
	}()

	response, err := c.config.Runner.Run(ctx, &code.RunRequest{Code: c.config.Code, Language: c.config.Language, Params: input})
	if err != nil {
		return nil, err
	}
	result := response.Result

	return formatOutput(c.config.OutputConfig, result)
}

func formatOutput(inInfo map[string]*nodes.TypeInfo, in map[string]any) (map[string]any, error) {
	ret := make(map[string]any, len(inInfo))
	var warnError = &WarnError{errs: make([]error, 0, len(inInfo))}
	for k, info := range inInfo {
		if _, ok := in[k]; !ok {
			ret[k] = nil
			continue
		}
		vv, wError := codeResponseFormatted(k, in[k], info)
		if wError != nil && len(wError.errs) != 0 {
			warnError.errs = append(warnError.errs, wError.errs...)
		}
		ret[k] = vv
	}

	if len(warnError.errs) != 0 {
		ret[occurWarnErrorKey] = warnError.Error()
	}
	return ret, nil
}
