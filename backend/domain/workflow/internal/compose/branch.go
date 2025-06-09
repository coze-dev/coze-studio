package compose

import (
	"context"
	"errors"
	"fmt"

	"github.com/cloudwego/eino/compose"
	"github.com/spf13/cast"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/qa"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/selector"
)

func (s *NodeSchema) OutputPortCount() int {
	switch s.Type {
	case entity.NodeTypeSelector:
		return len(mustGetKey[[]*selector.OneClauseSchema]("Clauses", s.Configs)) + 1
	case entity.NodeTypeQuestionAnswer:
		if mustGetKey[qa.AnswerType]("AnswerType", s.Configs.(map[string]any)) == qa.AnswerByChoices {
			if mustGetKey[qa.ChoiceType]("ChoiceType", s.Configs.(map[string]any)) == qa.FixedChoices {
				return len(mustGetKey[[]string]("FixedChoices", s.Configs.(map[string]any))) + 1
			} else {
				return 2
			}
		}
		return 1
	case entity.NodeTypeIntentDetector:
		intents := mustGetKey[[]string]("Intents", s.Configs.(map[string]any))
		return len(intents) + 1
	default:
		return 1
	}
}

type BranchMapping []map[string]bool

const (
	DefaultBranch = "default"
	BranchFmt     = "branch_%d"
)

func (s *NodeSchema) GetBranch(bMapping *BranchMapping) (*compose.GraphBranch, error) {
	if bMapping == nil || len(*bMapping) == 0 {
		return nil, errors.New("no branch mapping")
	}

	endNodes := make(map[string]bool)
	for i := range *bMapping {
		for k := range (*bMapping)[i] {
			endNodes[k] = true
		}
	}

	switch s.Type {
	case entity.NodeTypeSelector:
		condition := func(ctx context.Context, choice int) (map[string]bool, error) {
			if choice < 0 || choice > len(*bMapping) {
				return nil, fmt.Errorf("node %s choice out of range: %d", s.Key, choice)
			}

			choices := make(map[string]bool, len((*bMapping)[choice]))
			for k := range (*bMapping)[choice] {
				choices[k] = true
			}

			return choices, nil
		}
		return compose.NewGraphMultiBranch(condition, endNodes), nil
	case entity.NodeTypeQuestionAnswer:
		conf := s.Configs.(map[string]any)
		if mustGetKey[qa.AnswerType]("AnswerType", conf) == qa.AnswerByChoices {
			condition := func(ctx context.Context, in map[string]any) (map[string]bool, error) {
				optionID, ok := nodes.TakeMapValue(in, compose.FieldPath{qa.OptionIDKey})
				if !ok {
					return nil, fmt.Errorf("failed to take option id from input map: %v", in)
				}

				if optionID.(string) == "other" {
					return (*bMapping)[len(*bMapping)-1], nil
				}

				optionIDInt, ok := qa.AlphabetToInt(optionID.(string))
				if !ok {
					return nil, fmt.Errorf("failed to convert option id from input map: %v", optionID)
				}

				if optionIDInt < 0 || optionIDInt >= len(*bMapping)-1 {
					return nil, fmt.Errorf("failed to take option id from input map: %v", in)
				}

				return (*bMapping)[optionIDInt], nil
			}
			return compose.NewGraphMultiBranch(condition, endNodes), nil
		}
		return nil, fmt.Errorf("this qa node should not have branches: %s", s.Key)

	case entity.NodeTypeIntentDetector:
		condition := func(ctx context.Context, in map[string]any) (map[string]bool, error) {
			classificationId, ok := nodes.TakeMapValue(in, compose.FieldPath{"classificationId"})
			if !ok {
				return nil, fmt.Errorf("failed to take classification id from input map: %v", in)
			}

			// Intent detector the node default branch uses classificationId=0. But currently scene, the implementation uses default as the last element of the array.
			// Therefore, when classificationId=0, it needs to be converted into the node corresponding to the last index of the array.
			// Other options also need to reduce the index by 1.
			id, err := cast.ToInt64E(classificationId)
			if err != nil {
				return nil, err
			}
			realID := id - 1

			if realID >= int64(len(*bMapping)) {
				return nil, fmt.Errorf("invalid classification id from input, classification id: %v", classificationId)
			}

			if realID < 0 {
				realID = int64(len(*bMapping)) - 1
			}

			return (*bMapping)[realID], nil
		}
		return compose.NewGraphMultiBranch(condition, endNodes), nil
	default:
		return nil, fmt.Errorf("this node should not have branches: %s", s.Key)
	}
}
