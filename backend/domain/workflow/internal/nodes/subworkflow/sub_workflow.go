package subworkflow

import (
	"context"
	"errors"

	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
)

type Config struct {
	Runner          compose.Runnable[map[string]any, map[string]any]
	IgnoreException bool
	DefaultOutput   map[string]any
}

type SubWorkflow struct {
	cfg *Config
}

func NewSubWorkflow(_ context.Context, cfg *Config) (*SubWorkflow, error) {
	if cfg == nil {
		return nil, errors.New("config is nil")
	}

	if cfg.Runner == nil {
		return nil, errors.New("runnable is nil")
	}

	return &SubWorkflow{cfg: cfg}, nil
}

func (s *SubWorkflow) Invoke(ctx context.Context, in map[string]any, opts ...compose.Option) (map[string]any, error) {
	out, err := s.cfg.Runner.Invoke(ctx, in, opts...)
	if err != nil {
		if s.cfg.IgnoreException {
			return s.cfg.DefaultOutput, nil
		}
		return nil, err
	}
	return out, nil
}

func (s *SubWorkflow) Stream(ctx context.Context, in map[string]any, opts ...compose.Option) (*schema.StreamReader[map[string]any], error) {
	out, err := s.cfg.Runner.Stream(ctx, in, opts...)
	if err != nil {
		if s.cfg.IgnoreException {
			return schema.StreamReaderFromArray([]map[string]any{s.cfg.DefaultOutput}), nil
		}
		return nil, err
	}

	return out, nil
}
