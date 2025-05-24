package vo

import (
	"code.byted.org/flow/opencoze/backend/api/model/base"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
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

type DebugExample struct {
	ReqExample  string
	RespExample string
}

type ToolDetailInfo struct {
	Code        int64                   `json:"code"`
	Msg         string                  `json:"msg"`
	Data        *workflow.ApiDetailData `json:"data"`
	ToolInputs  any                     `json:"-"`
	ToolOutputs any                     `json:"-"`
	BaseResp    *base.BaseResp          `json:"BaseResp" `
}
