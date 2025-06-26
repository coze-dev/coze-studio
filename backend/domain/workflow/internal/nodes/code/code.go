package code

import (
	"context"
	"errors"
	"fmt"
	"strings"

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

type Config struct {
	Code         string
	Language     code.Language
	OutputConfig map[string]*vo.TypeInfo
	Runner       code.Runner
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
	response, err := c.config.Runner.Run(ctx, &code.RunRequest{Code: c.config.Code, Language: c.config.Language, Params: input})
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrCodeExecuteFail)
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

	var errInfo *vo.ErrorInfo
	if warnings, ok := ctxcache.Get[[]string](ctx, coderRunnerWarnErrorLevelCtxKey); ok {
		errInfo = &vo.ErrorInfo{
			Err:   fmt.Errorf("赋值异常: %s", strings.Join(warnings, ", ")),
			Level: vo.LevelWarn,
		}
	}
	return &nodes.StructuredCallbackOutput{
			Output:    output,
			RawOutput: rawOutput,
			Error:     errInfo,
		},
		nil

}

func formatOutput(ctx context.Context, inInfo map[string]*vo.TypeInfo, in map[string]any) (map[string]any, error) {
	ret := make(map[string]any, len(inInfo))
	warnings := make([]string, 0, len(inInfo))
	for k, info := range inInfo {
		if _, ok := in[k]; !ok {
			ret[k] = nil
			continue
		}
		vv, err := nodes.Convert(ctx, in[k], k, info)
		if err != nil {
			warnings = append(warnings, err.Error())
		} else {
			ret[k] = vv
		}

	}

	if len(warnings) > 0 {
		ctxcache.Store(ctx, coderRunnerWarnErrorLevelCtxKey, warnings)
	}

	return ret, nil
}
