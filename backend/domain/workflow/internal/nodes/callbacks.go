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

package nodes

import (
	"reflect"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type StructuredCallbackOutput struct {
	Output    map[string]any
	RawOutput *string
	Extra     map[string]any // node specific extra info, will go into node execution's extra.ResponseExtra
	Error     vo.WorkflowError
	Input     map[string]any // if you want to override Input on node end, set this field
	Answer    *string        // if this node produces 'answer' that should go into llm's context, set this field

	// OutputStr indicates this node does not want to save the Output map
	// directly in NodeExecutionHistory, instead, it wants to save this OutputStr directly.
	OutputStr *string
}

type StructuredCallbackInput struct {
	Input map[string]any
	Extra map[string]any // node specific extra info, will go into node execution's extra.ResponseExtra
}

func ConcatStructuredCallbackOutputs(outputs []*StructuredCallbackOutput) (
	*StructuredCallbackOutput, error) {
	if len(outputs) == 0 {
		return nil, nil
	}

	if len(outputs) == 1 {
		return outputs[0], nil
	}

	var (
		fullOutput    map[string]any
		fullRawOutput *string
		extra         map[string]any
		input         map[string]any
		wfErr         vo.WorkflowError
		answer        *string
		outputStr     *string
	)

	outputLists := make([]map[string]any, len(outputs))
	var (
		rawOutputList []string
		inputList     []map[string]any
		extraList     []map[string]any
		answerList    []string
		outputStrList []string
	)
	for i, o := range outputs {
		outputLists[i] = o.Output
		if o.RawOutput != nil {
			rawOutputList = append(rawOutputList, *o.RawOutput)
		}
		if o.Error != nil { // just overwrite
			wfErr = o.Error
		}
		if o.Input != nil {
			inputList = append(inputList, o.Input)
		}
		if o.Extra != nil {
			extraList = append(extraList, o.Extra)
		}
		if o.Answer != nil {
			answerList = append(answerList, *o.Answer)
		}
		if o.OutputStr != nil {
			outputStrList = append(outputStrList, *o.OutputStr)
		}
	}

	m, err := ConcatMaps(reflect.ValueOf(outputLists))
	if err != nil {
		return nil, err
	}

	fullOutput = m.Interface().(map[string]any)

	if len(rawOutputList) == 1 {
		fullRawOutput = ptr.Of(rawOutputList[0])
	} else {
		if s, err := concatStrings(rawOutputList); err != nil {
			return nil, err
		} else {
			fullRawOutput = &s
		}
	}

	if len(inputList) > 0 {
		if len(inputList) == 1 {
			input = inputList[0]
		} else {
			if m, err = ConcatMaps(reflect.ValueOf(inputList)); err != nil {
				return nil, err
			}
			input = m.Interface().(map[string]any)
		}
	}

	if len(extraList) > 0 {
		if len(extraList) == 1 {
			extra = extraList[0]
		} else {
			if m, err = ConcatMaps(reflect.ValueOf(extraList)); err != nil {
				return nil, err
			}
			extra = m.Interface().(map[string]any)
		}
	}

	if len(answerList) > 0 {
		var fullAnswer string
		for _, a := range answerList {
			fullAnswer += a
		}
		answer = &fullAnswer
	}

	if len(outputStrList) > 0 {
		var fullOutputStr string
		for _, o := range outputStrList {
			fullOutputStr += o
		}
		outputStr = &fullOutputStr
	}

	return &StructuredCallbackOutput{
		Output:    fullOutput,
		RawOutput: fullRawOutput,
		Extra:     extra,
		Error:     wfErr,
		Input:     input,
		Answer:    answer,
		OutputStr: outputStr,
	}, nil
}

func ConcatStructuredCallbackInputs(inputs []*StructuredCallbackInput) (
	*StructuredCallbackInput, error) {
	if len(inputs) == 0 {
		return nil, nil
	}

	if len(inputs) == 1 {
		return inputs[0], nil
	}

	var (
		extra map[string]any
		input map[string]any
	)

	inputLists := make([]map[string]any, len(inputs))
	var extraList []map[string]any
	for i, o := range inputs {
		inputLists[i] = o.Input
		if o.Extra != nil {
			extraList = append(extraList, o.Extra)
		}
	}

	m, err := ConcatMaps(reflect.ValueOf(inputLists))
	if err != nil {
		return nil, err
	}

	if len(extraList) > 0 {
		if len(extraList) == 1 {
			extra = extraList[0]
		} else {
			if m, err = ConcatMaps(reflect.ValueOf(extraList)); err != nil {
				return nil, err
			}
			extra = m.Interface().(map[string]any)
		}
	}

	return &StructuredCallbackInput{
		Input: input,
		Extra: extra,
	}, nil
}
