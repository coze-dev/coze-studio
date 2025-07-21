package dao

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/infra/contract/document/dataconnector"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/dataconnector/builtin/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/dataconnector/builtin/internal/dal/query"
	"gorm.io/gorm"
)

type AuthDAO struct {
	DB    *gorm.DB
	Query *query.Query
}

func (dao *AuthDAO) GetAuthInfoByCreatorIDAndConnectorID(ctx context.Context, creatorID int64, connectorID dataconnector.ConnectorID) ([]*model.Auth, error) {
	return dao.Query.Auth.WithContext(ctx).Where(dao.Query.Auth.CreatorID.Eq(creatorID), dao.Query.Auth.ConnectorID.Eq(int64(connectorID))).Find()
}

func (dao *AuthDAO) GetAuthByUniqID(ctx context.Context, uniqID string) (*model.Auth, error) {
	info, err := dao.Query.Auth.WithContext(ctx).Where(dao.Query.Auth.AuthUniqID.Eq(uniqID)).First()
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
	}
	return info, err
}
