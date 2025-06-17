package vo

import (
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/pkg/sonic"
)

type WorkFlowAsToolInfo struct {
	ID            int64
	Name          string
	Desc          string
	IconURL       string
	PublishStatus PublishStatus
	VersionName   string
	CreatorID     int64
	InputParams   []*NamedTypeInfo
	CreatedAt     int64
	UpdatedAt     *int64
}

type ToolDetailInfo struct {
	ApiDetailData *workflow.ApiDetailData
	ToolInputs    any
	ToolOutputs   any
}

func (t *ToolDetailInfo) MarshalJSON() ([]byte, error) {
	bs, _ := sonic.Marshal(t.ApiDetailData)
	result := make(map[string]any)
	_ = sonic.Unmarshal(bs, &result)
	result["inputs"] = t.ToolInputs
	result["outputs"] = t.ToolOutputs
	return sonic.Marshal(result)
}
