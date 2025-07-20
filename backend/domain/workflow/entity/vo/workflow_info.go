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

package vo

import (
	"github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/workflow"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
)

type ReleasedWorkflowData struct {
	WorkflowList []*workflow.ReleasedWorkflow
	Inputs       map[string]any
	Outputs      map[string]any
}

func (r *ReleasedWorkflowData) MarshalJSON() ([]byte, error) {
	inputs := r.Inputs
	outputs := r.Outputs
	bs, _ := sonic.Marshal(r.WorkflowList)
	workflowsListMap := make([]map[string]any, 0, len(r.WorkflowList))
	_ = sonic.Unmarshal(bs, &workflowsListMap)
	for _, m := range workflowsListMap {
		if wId, ok := m["workflow_id"]; ok {
			m["inputs"] = inputs[wId.(string)]
			m["outputs"] = outputs[wId.(string)]
		}
	}

	result := map[string]interface{}{
		"workflow_list": workflowsListMap,
		"total":         len(r.WorkflowList),
	}

	return sonic.Marshal(result)

}

type WorkflowDetailDataList struct {
	List    []*workflow.WorkflowDetailData
	Inputs  map[string]any
	Outputs map[string]any
}

func (r *WorkflowDetailDataList) MarshalJSON() ([]byte, error) {
	inputs := r.Inputs
	outputs := r.Outputs
	bs, _ := sonic.Marshal(r.List)
	wfList := make([]map[string]any, 0, len(r.List))
	_ = sonic.Unmarshal(bs, &wfList)

	for _, m := range wfList {
		if wId, ok := m["workflow_id"]; ok {
			m["inputs"] = inputs[wId.(string)]
			m["outputs"] = outputs[wId.(string)]
		}
	}

	return sonic.Marshal(wfList)

}

type WorkflowDetailInfoDataList struct {
	List []*workflow.WorkflowDetailInfoData

	Inputs  map[string]any
	Outputs map[string]any
}

func (r *WorkflowDetailInfoDataList) MarshalJSON() ([]byte, error) {
	inputs := r.Inputs
	outputs := r.Outputs
	bs, _ := sonic.Marshal(r.List)
	wfList := make([]map[string]any, 0, len(r.List))
	_ = sonic.Unmarshal(bs, &wfList)

	for _, m := range wfList {
		if wId, ok := m["workflow_id"]; ok {
			m["inputs"] = inputs[wId.(string)]
			m["outputs"] = outputs[wId.(string)]
		}
	}
	return sonic.Marshal(wfList)

}
