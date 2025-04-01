package entity

import (
	"github.com/getkin/kin-openapi/openapi3"

	"code.byted.org/flow/opencoze/backend/domain/chatmodel/entity/common"
	"code.byted.org/flow/opencoze/backend/domain/chatmodel/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/chatmodel/internal/dal/model/protocol"
)

type ModelMeta struct {
	common.Info
	ShowName   string            // like: GPT-4o
	Protocol   protocol.Protocol // 模型通信协议
	Capability *model.Capability // 模型能力
	ConnConfig *model.ConnConfig // 模型连接信息。这个字段目前仅可写，不可修改不可读取，仅 model manager 运行内部可以取值
	Schema     *openapi3.Schema  // 模型请求参数
	Status     Status            // 模型状态
}
