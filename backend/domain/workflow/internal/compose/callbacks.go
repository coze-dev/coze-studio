package compose

import (
	"fmt"
	"strconv"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	nodes2 "code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	selector2 "code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/selector"
)

type SelectorCallbackInput = []*SelectorBranch

type CallbackField struct {
	FromNodeKey string            `json:"from_node_key"`
	FromPath    compose.FieldPath `json:"from_path"`
	Type        nodes2.DataType   `json:"type"`
	Value       any               `json:"value"`
	VarType     *variable.Type    `json:"var_type"`
}

type SelectorCondition struct {
	Left     CallbackField      `json:"left"`
	Operator selector2.Operator `json:"operator"`
	Right    *CallbackField     `json:"right"`
}

type SelectorBranch struct {
	Conditions []*SelectorCondition     `json:"conditions"`
	Relation   selector2.ClauseRelation `json:"relation"`
}

func (s *NodeSchema) ToSelectorCallbackInput(in map[string]any) (map[string]any, error) {
	config := s.Configs.([]*selector2.OneClauseSchema)
	count := len(config)

	output := make([]*SelectorBranch, count)

	for _, source := range s.InputSources {
		targetPath := source.Path
		if len(targetPath) == 2 {
			indexStr := targetPath[0]
			index, err := strconv.Atoi(indexStr)
			if err != nil {
				return nil, err
			}

			branch := output[index]
			if branch == nil {
				output[index] = &SelectorBranch{
					Conditions: []*SelectorCondition{
						{
							Operator: *config[index].Single,
						},
					},
					Relation: selector2.ClauseRelationAND,
				}
			}

			if targetPath[1] == selector2.LeftKey {
				leftV, ok := nodes2.TakeMapValue(in, targetPath)
				if !ok {
					return nil, fmt.Errorf("failed to take left value of %s", targetPath)
				}
				output[index].Conditions[0].Left = CallbackField{
					FromNodeKey: string(source.Source.Ref.FromNodeKey),
					FromPath:    source.Source.Ref.FromPath,
					Type:        s.InputTypes[targetPath[0]].Properties[targetPath[1]].Type,
					Value:       leftV,
					VarType:     source.Source.Ref.VariableType,
				}
			} else if targetPath[1] == selector2.RightKey {
				rightV, ok := nodes2.TakeMapValue(in, targetPath)
				if !ok {
					return nil, fmt.Errorf("failed to take right value of %s", targetPath)
				}
				output[index].Conditions[0].Right = &CallbackField{
					Type:  s.InputTypes[targetPath[0]].Properties[targetPath[1]].Type,
					Value: rightV,
				}

				if source.Source.Ref != nil {
					output[index].Conditions[0].Right.FromNodeKey = string(source.Source.Ref.FromNodeKey)
					output[index].Conditions[0].Right.FromPath = source.Source.Ref.FromPath
					output[index].Conditions[0].Right.VarType = source.Source.Ref.VariableType
				}
			}
		} else if len(targetPath) == 3 {
			indexStr := targetPath[0]
			index, err := strconv.Atoi(indexStr)
			if err != nil {
				return nil, err
			}

			multi := config[index].Multi

			branch := output[index]
			if branch == nil {
				output[index] = &SelectorBranch{
					Conditions: make([]*SelectorCondition, len(multi.Clauses)),
					Relation:   multi.Relation,
				}
			}

			for j := range multi.Clauses {
				if output[index].Conditions[j] == nil {
					output[index].Conditions[j] = &SelectorCondition{
						Operator: *multi.Clauses[j],
					}
				}

				if targetPath[2] == selector2.LeftKey {
					leftV, ok := nodes2.TakeMapValue(in, targetPath)
					if !ok {
						return nil, fmt.Errorf("failed to take left value of %s", targetPath)
					}
					output[index].Conditions[j].Left = CallbackField{
						FromNodeKey: string(source.Source.Ref.FromNodeKey),
						FromPath:    source.Source.Ref.FromPath,
						Type:        s.InputTypes[targetPath[0]].Properties[targetPath[1]].Properties[targetPath[2]].Type,
						Value:       leftV,
						VarType:     source.Source.Ref.VariableType,
					}
				} else if targetPath[2] == selector2.RightKey {
					rightV, ok := nodes2.TakeMapValue(in, targetPath)
					if !ok {
						return nil, fmt.Errorf("failed to take right value of %s", targetPath)
					}
					output[index].Conditions[j].Right = &CallbackField{
						Type:  s.InputTypes[targetPath[0]].Properties[targetPath[1]].Properties[targetPath[2]].Type,
						Value: rightV,
					}
					if source.Source.Ref != nil {
						output[index].Conditions[j].Right.FromNodeKey = string(source.Source.Ref.FromNodeKey)
						output[index].Conditions[j].Right.FromPath = source.Source.Ref.FromPath
						output[index].Conditions[j].Right.VarType = source.Source.Ref.VariableType
					}
				}
			}
		}
	}

	return map[string]any{"branches": output}, nil
}

func (s *NodeSchema) ToSelectorCallbackOutput(out int) (map[string]any, error) {
	count := len(s.Configs.([]*selector2.OneClauseSchema))
	if out == count {
		return map[string]any{"result": "pass to else branch"}, nil
	}

	if out >= 0 && out < count {
		return map[string]any{"result": fmt.Sprintf("pass to condition %d branch", out)}, nil
	}

	return nil, fmt.Errorf("out of range: %d", out)
}
