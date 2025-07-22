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

func (dao *AuthDAO) GetAuthByUniqID(ctx context.Context, creatorID int64, uniqID string) (*model.Auth, error) {
	info, err := dao.Query.Auth.WithContext(ctx).Where(dao.Query.Auth.AuthUniqID.Eq(uniqID), dao.Query.Auth.CreatorID.Eq(creatorID)).First()
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
	}
	return info, err
}

func (dao *AuthDAO) CreateAuth(ctx context.Context, auth *model.Auth) error {
	return dao.Query.Auth.WithContext(ctx).Create(auth)
}

func (dao *AuthDAO) UpdateAuth(ctx context.Context, auth *model.Auth) error {
	_, err := dao.Query.Auth.WithContext(ctx).Updates(auth)
	return err
}

func (dao *AuthDAO) GetAuthByID(ctx context.Context, id int64) (*model.Auth, error) {
	info, err := dao.Query.Auth.WithContext(ctx).Where(dao.Query.Auth.ID.Eq(id)).First()
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
	}
	return info, err
}
