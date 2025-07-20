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

package compose

import (
	"context"
	"errors"
	"fmt"

	"github.com/cloudwego/eino/compose"
	"github.com/spf13/cast"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/qa"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/selector"
)

func (s *NodeSchema) OutputPortCount() (int, bool) {
	var hasExceptionPort bool
	if s.ExceptionConfigs != nil && s.ExceptionConfigs.ProcessType != nil &&
		*s.ExceptionConfigs.ProcessType == vo.ErrorProcessTypeExceptionBranch {
		hasExceptionPort = true
	}

	switch s.Type {
	case entity.NodeTypeSelector:
		return len(mustGetKey[[]*selector.OneClauseSchema]("Clauses", s.Configs)) + 1, hasExceptionPort
	case entity.NodeTypeQuestionAnswer:
		if mustGetKey[qa.AnswerType]("AnswerType", s.Configs.(map[string]any)) == qa.AnswerByChoices {
			if mustGetKey[qa.ChoiceType]("ChoiceType", s.Configs.(map[string]any)) == qa.FixedChoices {
				return len(mustGetKey[[]string]("FixedChoices", s.Configs.(map[string]any))) + 1, hasExceptionPort
			} else {
				return 2, hasExceptionPort
			}
		}
		return 1, hasExceptionPort
	case entity.NodeTypeIntentDetector:
		intents := mustGetKey[[]string]("Intents", s.Configs.(map[string]any))
		return len(intents) + 1, hasExceptionPort
	default:
		return 1, hasExceptionPort
	}
}

type BranchMapping struct {
	Normal    []map[string]bool
	Exception map[string]bool
}

const (
	DefaultBranch = "default"
	BranchFmt     = "branch_%d"
)

func (s *NodeSchema) GetBranch(bMapping *BranchMapping) (*compose.GraphBranch, error) {
	if bMapping == nil {
		return nil, errors.New("no branch mapping")
	}

	endNodes := make(map[string]bool)
	for i := range bMapping.Normal {
		for k := range bMapping.Normal[i] {
			endNodes[k] = true
		}
	}

	if bMapping.Exception != nil {
		for k := range bMapping.Exception {
			endNodes[k] = true
		}
	}

	switch s.Type {
	case entity.NodeTypeSelector:
		condition := func(ctx context.Context, in map[string]any) (map[string]bool, error) {
			choice := in[selector.SelectKey].(int)
			if choice < 0 || choice > len(bMapping.Normal) {
				return nil, fmt.Errorf("node %s choice out of range: %d", s.Key, choice)
			}

			choices := make(map[string]bool, len((bMapping.Normal)[choice]))
			for k := range (bMapping.Normal)[choice] {
				choices[k] = true
			}

			return choices, nil
		}
		return compose.NewGraphMultiBranch(condition, endNodes), nil
	case entity.NodeTypeQuestionAnswer:
		conf := s.Configs.(map[string]any)
		if mustGetKey[qa.AnswerType]("AnswerType", conf) == qa.AnswerByChoices {
			choiceType := mustGetKey[qa.ChoiceType]("ChoiceType", conf)
			condition := func(ctx context.Context, in map[string]any) (map[string]bool, error) {
				optionID, ok := nodes.TakeMapValue(in, compose.FieldPath{qa.OptionIDKey})
				if !ok {
					return nil, fmt.Errorf("failed to take option id from input map: %v", in)
				}

				if optionID.(string) == "other" {
					return (bMapping.Normal)[len(bMapping.Normal)-1], nil
				}

				if choiceType == qa.DynamicChoices { // all dynamic choices maps to branch 0
					return (bMapping.Normal)[0], nil
				}

				optionIDInt, ok := qa.AlphabetToInt(optionID.(string))
				if !ok {
					return nil, fmt.Errorf("failed to convert option id from input map: %v", optionID)
				}

				if optionIDInt < 0 || optionIDInt >= len(bMapping.Normal) {
					return nil, fmt.Errorf("failed to take option id from input map: %v", in)
				}

				return (bMapping.Normal)[optionIDInt], nil
			}
			return compose.NewGraphMultiBranch(condition, endNodes), nil
		}
		return nil, fmt.Errorf("this qa node should not have branches: %s", s.Key)

	case entity.NodeTypeIntentDetector:
		condition := func(ctx context.Context, in map[string]any) (map[string]bool, error) {
			isSuccess, ok := in["isSuccess"]
			if ok && isSuccess != nil && !isSuccess.(bool) {
				return bMapping.Exception, nil
			}

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

			if realID >= int64(len(bMapping.Normal)) {
				return nil, fmt.Errorf("invalid classification id from input, classification id: %v", classificationId)
			}

			if realID < 0 {
				realID = int64(len(bMapping.Normal)) - 1
			}

			return (bMapping.Normal)[realID], nil
		}
		return compose.NewGraphMultiBranch(condition, endNodes), nil
	default:
		condition := func(ctx context.Context, in map[string]any) (map[string]bool, error) {
			isSuccess, ok := in["isSuccess"]
			if ok && isSuccess != nil && !isSuccess.(bool) {
				return bMapping.Exception, nil
			}

			return (bMapping.Normal)[0], nil
		}
		return compose.NewGraphMultiBranch(condition, endNodes), nil
	}
}
