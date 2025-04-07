package schema

import (
	"fmt"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/batch"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/selector"
)

func ToSelectorConfig(s *NodeSchema) (*selector.Config, error) {
	conf := &selector.Config{}

	orderedConfigs, ok := s.Configs.([]*selector.OneClauseSchema)
	if !ok {
		return nil, fmt.Errorf("invalid config for selector: %v", s.Configs)
	}

	conf.Clauses = orderedConfigs

	return conf, nil
}

func ToBatchConfig(s *NodeSchema) (*batch.Config, error) {
	conf := &batch.Config{
		BatchNodeKey: s.Configs.(map[string]any)["BatchNodeKey"].(string),
	}

	panic("not implemented")
}
