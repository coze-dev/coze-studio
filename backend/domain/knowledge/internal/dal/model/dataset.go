package model

import "code.byted.org/flow/opencoze/backend/domain/knowledge/entity"

type TableInfo struct {
	VirtualTableName  string                `json:"virtual_table_name"`
	PhysicalTableName string                `json:"physical_table_name"`
	TableDesc         string                `json:"table_desc"`
	Columns           []*entity.TableColumn `json:"columns"`
}
