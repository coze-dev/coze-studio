package processor

import "code.byted.org/flow/opencoze/backend/domain/knowledge/entity"

type DocProcessor interface {
	BeforeCreate() error         // 获取数据源
	BuildDBModel() error         // 构建Doc记录
	InsertDBModel() error        // 向数据库中插入一条Doc记录
	Indexing() error             // 发起索引任务
	GetResp() []*entity.Document // 返回处理后的文档信息
	//GetColumnName()
}
