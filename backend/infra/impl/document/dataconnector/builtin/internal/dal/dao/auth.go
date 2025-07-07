package dao

import (
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/dataconnector/builtin/internal/dal/query"
	"gorm.io/gorm"
)

type AuthDAO struct {
	DB    *gorm.DB
	Query *query.Query
}
