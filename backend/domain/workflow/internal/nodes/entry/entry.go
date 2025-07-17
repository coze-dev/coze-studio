package entry

import (
	"context"
	"fmt"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
)

type Config struct {
	DefaultValues map[string]any
	OutputTypes   map[string]*vo.TypeInfo
}

type Entry struct {
	cfg           *Config
	defaultValues map[string]any
}

func NewEntry(ctx context.Context, cfg *Config) (*Entry, error) {
	if cfg == nil {
		return nil, fmt.Errorf("config is requried")
	}
	defaultValues, _, err := nodes.ConvertInputs(ctx, cfg.DefaultValues, cfg.OutputTypes, nodes.FailFast(), nodes.SkipRequireCheck())
	if err != nil {
		return nil, err
	}

	return &Entry{
		cfg:           cfg,
		defaultValues: defaultValues,
	}, nil

}

func (e *Entry) Invoke(_ context.Context, in map[string]any) (out map[string]any, err error) {

	for k, v := range e.defaultValues {
		if val, ok := in[k]; ok {
			tInfo := e.cfg.OutputTypes[k]
			switch tInfo.Type {
			case vo.DataTypeString:
				if len(val.(string)) == 0 {
					in[k] = v
				}
			case vo.DataTypeArray:
				if len(val.([]any)) == 0 {
					in[k] = v
				}
			case vo.DataTypeObject:
				if len(val.(map[string]any)) == 0 {
					in[k] = v
				}
			}
		} else {
			in[k] = v
		}
	}

	return in, err
}
