package entity

import (
	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
)

type ModelMeta struct {
	ID          int64
	Name        string
	IconURI     string
	IconURL     string
	Description string

	CreatedAtMs int64
	UpdatedAtMs int64
	DeletedAtMs int64

	Protocol   chatmodel.Protocol // 模型通信协议
	Capability *Capability        // 模型能力
	ConnConfig *ConnConfig        // 模型连接配置
	Status     ModelMetaStatus    // 模型状态
}
