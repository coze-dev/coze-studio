package lark

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/infra/contract/document/dataconnector"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/dataconnector/builtin"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/dataconnector/builtin/repository"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"gorm.io/gorm"
)

type LarkFetcher struct {
	builtin.BaseFetcher
	authDao repository.AuthRepo
	config  *dataconnector.ConnectorConfig
}

func NewLarkFetcher(db *gorm.DB, config *dataconnector.ConnectorConfig) *LarkFetcher {
	return &LarkFetcher{
		config:  config,
		authDao: repository.NewAuthRepo(db),
	}
}

// func (l *LarkFetcher) AuthorizeCode(ctx context.Context, creatorID int64, code string) error {
// 	// 1.换取token
// 	authParam := http.FeishuAuthParam{
// 		AppId:     l.Config.AuthConfig.ClientID,
// 		AppSecret: l.Config.AuthConfig.ClientSecret,
// 	}
// 	authTokenInfo, err := l.BaseFetcher.
// 	if err != nil {
// 		logl.CtxErrorf(ctx, "[AuthorizeCode] connectorName:feishu getentity.AuthTokenInfo error: %v", err)
// 		return err
// 	}

// 	// 2.获取token的用户信息
// 	authParam.UserAccessToken = authTokenInfo.AccessToken
// 	userInfo, ocErr := http.GetUserInfo(ctx, authParam)
// 	if ocErr != nil {
// 		logl.CtxErrorf(ctx, "[AuthorizeCode] GetUserInfo error: %v", ocErr)
// 		return ocErr
// 	}

// 	// 3.初始化auth
// 	authInfoStr, err := sonic.MarshalString(authTokenInfo)
// 	if err != nil {
// 		logl.CtxErrorf(ctx, "[AuthorizeCode] marshal token error: %v", err)
// 		return err
// 	}
// 	var auth *model.Auth
// 	auth, err = dao.GetAuthByUniqID(ctx, bizID, creatorID, *userInfo.OpenId)
// 	if err != nil {
// 		logl.CtxErrorf(ctx, "[AuthorizeCode] GetAuthByUniqID error:%v", err)
// 		return error_code.SystemError.WithError(ctx, err)
// 	}
// 	if auth == nil {
// 		id, err := idgen.IdGenCli.Get(ctx)
// 		if err != nil {
// 			logl.CtxError(ctx, "[AuthorizeCode] connectorName:%v IdGenCli generate id error: %v", connectorConfig.ConnectorName, err)
// 			return error_code.SystemError.WithError(ctx, err)
// 		}
// 		authModel := &model.Auth{
// 			ID:    int64(id),
// 			BizID: bizID,
// 			Name: func() string {
// 				if userInfo.Name == nil {
// 					return ""
// 				}
// 				return *userInfo.Name
// 			}(),
// 			Icon: func() string {
// 				if userInfo.AvatarUrl == nil {
// 					return ""
// 				}
// 				return *userInfo.AvatarUrl
// 			}(),
// 			CreatorID:   creatorID,
// 			ConnectorID: connectorConfig.ConnectorID,
// 			AuthUniqID:  *userInfo.OpenId,
// 			AuthType:    connectorConfig.AuthType,
// 			AuthInfo:    authInfoStr,
// 		}
// 		err = dao.CreateConnectionAuth(ctx, authModel)
// 		if err != nil {
// 			logl.CtxError(ctx, "[AuthorizeCode] connectorName:%v CreateConnection error:%v", connectorConfig.ConnectorName, err)
// 			return error_code.SystemError.WithError(ctx, err)
// 		}
// 		return nil
// 	}
// 	auth.ConnectorID = connectorConfig.ConnectorID
// 	if userInfo.Name != nil {
// 		auth.Name = *userInfo.Name
// 	}
// 	if userInfo.AvatarUrl != nil {
// 		auth.Icon = *userInfo.AvatarUrl
// 	}
// 	auth.AuthType = connectorConfig.AuthType
// 	auth.AuthInfo = authInfoStr
// 	auth.IsDeleted = 0
// 	// 更新auth
// 	err = dao.UpdateConnectionAuth(ctx, auth)
// 	if err != nil {
// 		logl.CtxError(ctx, "[AuthorizeCode] connectorName:%v UpdateConnectionAuth error:%v", connectorConfig.ConnectorName, err)
// 		return error_code.SystemError.WithError(ctx, err)
// 	}
// 	return nil
// }

func (l *LarkFetcher) GetAuthInfo(ctx context.Context, creatorID int64) ([]*dataconnector.AuthInfo, error) {
	auths, err := l.authDao.GetAuthByCreatorID(ctx, creatorID)
	if err != nil {
		logs.CtxErrorf(ctx, "[GetAuthInfo] GetAuthByCreatorID error:%v", err)
		return nil, error_code.SystemError.WithError(ctx, err)
	}
	return auths, nil
}
