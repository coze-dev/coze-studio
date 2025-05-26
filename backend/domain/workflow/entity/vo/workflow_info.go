package vo

import (
	"github.com/bytedance/sonic"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
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
