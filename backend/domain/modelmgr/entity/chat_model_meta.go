package entity

import (
	"github.com/getkin/kin-openapi/openapi3"

	"code.byted.org/flow/opencoze/backend/domain/modelmgr/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
)

type ModelMeta struct {
	ID          int64
	Name        string
	Description string

	CreatedAtMs int64
	UpdatedAtMs int64
	DeletedAtMs int64

	ShowName   string             // like: GPT-4o
	Protocol   chatmodel.Protocol // 模型通信协议
	Capability *model.Capability  // 模型能力
	ConnConfig *model.ConnConfig  // 模型连接配置
	Schema     *openapi3.Schema   // 模型可配置参数
	Status     Status             // 模型状态
}
