package lark

import (
	"context"
	"errors"
	"strconv"
	"time"

	"github.com/coze-dev/coze-studio/backend/infra/contract/document/dataconnector"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/dataconnector/builtin/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/dataconnector/builtin/lark/http"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/dataconnector/builtin/repository"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/sets"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	larkdrive "github.com/larksuite/oapi-sdk-go/v3/service/drive/v1"
	"gorm.io/gorm"
)

type LarkFetcher struct {
	authDao repository.AuthRepo
	idgen   idgen.IDGenerator
	config  *dataconnector.ConnectorConfig
}

func NewLarkFetcher(db *gorm.DB, config *dataconnector.ConnectorConfig) *LarkFetcher {
	return &LarkFetcher{
		config:  config,
		authDao: repository.NewAuthDAO(db),
	}
}

func (l *LarkFetcher) GetAuthInfo(ctx context.Context, creatorID int64) ([]*dataconnector.AuthInfo, error) {
	auths, err := l.authDao.GetAuthInfoByCreatorIDAndConnectorID(ctx, creatorID, l.config.ConnectorID)
	if err != nil {
		logs.CtxErrorf(ctx, "[GetAuthInfo] GetAuthByCreatorID error:%v", err)
		return nil, errors.New("get auth info error")
	}
	resp, err := slices.TransformWithErrorCheck(auths, l.fromModelAuth)
	if err != nil {
		logs.CtxErrorf(ctx, "[GetAuthInfo] TransformWithErrorCheck error:%v", err)
		return nil, errors.New("transform auth info error")
	}
	return resp, nil
}

func (l *LarkFetcher) GetConsentURL(ctx context.Context) (string, error) {
	return l.config.AuthConfig.AuthorizationURI, nil
}

func (l *LarkFetcher) AuthorizeCode(ctx context.Context, creatorID int64, code string) error {
	// get token
	authParam := http.FeishuAuthParam{
		AppId:     l.config.AuthConfig.ClientID,
		AppSecret: l.config.AuthConfig.ClientSecret,
	}
	authTokenInfo, err := l.getAuthTokenInfo(ctx, authParam, code)
	if err != nil {
		logs.CtxErrorf(ctx, "[AuthorizeCode] getAuthTokenInfo error:%v", err)
		return errors.New("get auth token info error")
	}

	authParam.UserAccessToken = authTokenInfo.AccessToken
	userInfo, err := http.GetUserInfo(ctx, authParam)
	if err != nil {
		logs.CtxErrorf(ctx, "[AuthorizeCode] GetUserInfo error:%v", err)
		return err
	}

	var auth *model.Auth
	auth, err = l.authDao.GetAuthByUniqID(ctx, creatorID, ptr.From(userInfo.OpenId))
	if err != nil {
		logs.CtxErrorf(ctx, "[AuthorizeCode] GetAuthByUniqID error:%v", err)
		return errors.New("get auth info 「GetAuthByUniqID」error")
	}
	if auth == nil {
		id, err := l.idgen.GenID(ctx)
		if err != nil {
			logs.CtxErrorf(ctx, "[AuthorizeCode] GenID error:%v", err)
			return errors.New("gen auth id error")
		}
		authModel := &model.Auth{
			ID:          id,
			CreatorID:   creatorID,
			ConnectorID: int64(l.config.ConnectorID),
			AuthUniqID:  ptr.From(userInfo.OpenId),
			Name:        ptr.From(userInfo.Name),
			Icon:        ptr.From(userInfo.AvatarUrl),
			AuthType:    l.config.AuthType,
			AuthInfo:    authTokenInfo,
			CreatedAt:   time.Now().UnixMilli(),
			UpdatedAt:   time.Now().UnixMilli(),
		}
		err = l.authDao.CreateAuth(ctx, authModel)
		if err != nil {
			logs.CtxErrorf(ctx, "[AuthorizeCode] CreateAuth error:%v", err)
			return errors.New("create auth error")
		}
	}
	auth.ConnectorID = int64(l.config.ConnectorID)
	if userInfo.Name != nil {
		auth.Name = ptr.From(userInfo.Name)
	}
	if userInfo.AvatarUrl != nil {
		auth.Icon = ptr.From(userInfo.AvatarUrl)
	}
	auth.AuthType = l.config.AuthType
	auth.AuthInfo = authTokenInfo
	err = l.authDao.UpdateAuth(ctx, auth)
	if err != nil {
		logs.CtxErrorf(ctx, "[AuthorizeCode] UpdateAuth error:%v", err)
		return errors.New("update auth error")
	}
	return nil
}

func (l *LarkFetcher) getAuthTokenInfo(ctx context.Context, authParam http.FeishuAuthParam, code string) (*dataconnector.AuthTokenInfo, error) {
	now := time.Now().UnixMilli()
	var authTokenInfo *dataconnector.AuthTokenInfo
	tokenData, err := http.GetWebUserAccessToken(ctx, authParam, code)
	if err != nil {
		logs.CtxErrorf(ctx, "[getAuthTokenInfo] GetWebUserAccessToken error:%v", err)
		return nil, errors.New("get auth token info error")
	}
	authTokenInfo = &dataconnector.AuthTokenInfo{
		AccessToken:  ptr.From(tokenData.AccessToken),
		RefreshToken: ptr.From(tokenData.RefreshToken),
		TokenExpireIn: func(expiresIn *int) int64 {
			if expiresIn == nil {
				return now
			}
			return now + int64(time.Duration(*expiresIn)*time.Second/time.Millisecond)
		}(tokenData.ExpiresIn),
		RefreshExpireIn: func(refreshExpiresIn *int) int64 {
			if refreshExpiresIn == nil {
				return now
			}
			return now + int64(time.Duration(*refreshExpiresIn)*time.Second/time.Millisecond)
		}(tokenData.RefreshExpiresIn),
		Scope: ptr.From(tokenData.Scope),
		Extra: tokenData,
	}
	return authTokenInfo, nil
}

func (l *LarkFetcher) SearchFile(ctx context.Context, request *dataconnector.SearchFileRequest) (*dataconnector.SearchFileResponse, error) {
	ak, err := l.GetAccessTokenByAuthID(ctx, request.AuthID)
	if err != nil {
		return nil, err
	}
	result := dataconnector.SearchFileResponse{}
	fileList, err := http.GetDriveFileListByParam(ctx, http.FeishuAuthParam{
		AppId:           l.config.AuthConfig.ClientID,
		AppSecret:       l.config.AuthConfig.ClientSecret,
		UserAccessToken: ak,
	}, request.FolderID)
	if err != nil {
		logs.CtxErrorf(ctx, "GetDriveFileListByParam error:%+v", err)
		return nil, err
	}

	return nil, nil
}

var feishuFileTypeMapping = map[string]dataconnector.FileNodeType{
	"folder": dataconnector.FileNodeTypeFolder,
	"docx":   dataconnector.FileNodeTypeDocument,
	"sheet":  dataconnector.FileNodeTypeSheet,
	"doc":    dataconnector.FileNodeTypeDocument,
}

func filterLarkFileListByFileType(ctx context.Context, fileList []*larkdrive.File, fileTypeList []dataconnector.FileNodeType) (map[string]*dataconnector.FileNode, map[string][]string) {
	fileTypeSet := sets.FromSlice(fileTypeList)
	var feishuFileMap = make(map[string]*dataconnector.FileNode)
	var fileParentMap = make(map[string][]string)
	for _, file := range fileList {
		if file.Type == nil || file.ParentToken == nil {
			logs.CtxInfof(ctx, "fileToken or parentToken not found %v", *file.Token)
			continue
		}
		if _, ok := fileTypeSet[feishuFileTypeMapping[ptr.From(file.Type)]]; !ok {
			continue
		}
		feishuFileMap[ptr.From(file.Token)] = &dataconnector.FileNode{
			FileID:       ptr.From(file.Token),
			FileNodeType: feishuFileTypeMapping[ptr.From(file.Type)],
			FileName: func() string {
				if file.Name == nil || *file.Name == "" {
					return "Unnamed document"
				}
				return ptr.From(file.Name)
			}(),
			FileType: func() string {
				if file.Type == nil || *file.Type == "" {
					return util.DefaultFeishuFileType
				}
				return *file.Type
			}(),
			FileURL: ptr.From(file.Url),
			CreateTime: func() int64 {
				val, err := strconv.ParseInt(ptr.From(file.CreatedTime))
				return conv.Int64Default(conv.StringPtrToVal(file.CreatedTime, "0"), 0)
			},
			UpdateTime: conv.Int64Default(conv.StringPtrToVal(file.ModifiedTime, "0"), 0),
		}
		fileParentMap[*file.ParentToken] = append(fileParentMap[*file.ParentToken], *file.Token)
	}
	return feishuFileMap, fileParentMap
}

func (l *LarkFetcher) searchFeishuFile(ctx context.Context, ak string, req *dataconnector.SearchFileRequest) {

}

func (l *LarkFetcher) searchWikiFile(ctx context.Context, ak string, req *dataconnector.SearchFileRequest)

func (l *LarkFetcher) GetAccessTokenByAuthID(ctx context.Context, authID int64) (token string, err error) {
	auth, err := l.authDao.GetAuthByID(ctx, authID)
	if err != nil {
		logs.CtxErrorf(ctx, "[AuthorizeCode] GetAuthByUniqID error:%v", err)
		return "", errors.New("get auth info 「GetAuthByUniqID」error")
	}
	if auth == nil {
		return "", errors.New("auth info is nil")
	}
	auth, err = l.refreshAccessToken(ctx, auth)
	if err != nil {
		return "", err
	}
	return auth.AuthInfo.AccessToken, nil
}

const (
	NeedRefreshTokenRightNowDuration = time.Minute * 5
)

func (l *LarkFetcher) refreshAccessToken(ctx context.Context, auth *model.Auth) (*model.Auth, error) {
	if auth.AuthInfo.RefreshToken == "" || time.UnixMilli(auth.AuthInfo.RefreshExpireIn).Before(time.Now()) {
		logs.CtxInfof(ctx, "[refreshAccessToken] authID:%v refreshToken:%v refreshExpireIn:%v is expired", auth.ID, auth.AuthInfo.RefreshToken, time.UnixMilli(auth.AuthInfo.RefreshExpireIn))
		return auth, errors.New("refresh token is expired")
	}
	duration := time.Until(time.UnixMilli(auth.AuthInfo.TokenExpireIn))
	if duration <= NeedRefreshTokenRightNowDuration {
		logs.CtxInfof(ctx, "[refreshAccessToken] authID:%v tokenExpireIn:%v need refresh token right now", auth.ID, time.UnixMilli(auth.AuthInfo.TokenExpireIn))
		now := time.Now().UnixMilli()
		refreshTokenData, err := http.RefreshAccessToken(ctx, http.FeishuAuthParam{
			AppId:     l.config.AuthConfig.ClientID,
			AppSecret: l.config.AuthConfig.ClientSecret,
		}, auth.AuthInfo.RefreshToken)
		if err != nil {
			logs.CtxErrorf(ctx, "[refreshAuthInfo] refreshAccessToken authID:%v error: %v", auth.ID, err)
			return auth, err
		}
		auth.AuthInfo.AccessToken = ptr.From(refreshTokenData.AccessToken)
		if refreshTokenData.RefreshToken != nil {
			auth.AuthInfo.RefreshToken = ptr.From(refreshTokenData.RefreshToken)
		}
		auth.AuthInfo.TokenExpireIn = now
		auth.AuthInfo.RefreshExpireIn = now
		if refreshTokenData.ExpiresIn != nil {
			auth.AuthInfo.TokenExpireIn += int64(time.Duration(*refreshTokenData.ExpiresIn) * time.Second / time.Millisecond)
		}
		if refreshTokenData.RefreshExpiresIn != nil {
			auth.AuthInfo.RefreshExpireIn += int64(time.Duration(*refreshTokenData.RefreshExpiresIn) * time.Second / time.Millisecond)
		}
		if refreshTokenData.Scope != nil {
			auth.AuthInfo.Scope = *refreshTokenData.Scope
		}
		auth.AuthInfo.Extra = refreshTokenData
		auth.UpdatedAt = time.Now().UnixMilli()
		err = l.authDao.UpdateAuth(ctx, auth)
		if err != nil {
			logs.CtxErrorf(ctx, "[refreshAuthInfo] UpdateAuth authID:%v error: %v", auth.ID, err)
			return auth, err
		}
		return auth, nil
	}
	return auth, nil
}

func (l *LarkFetcher) fromModelAuth(auth *model.Auth) (*dataconnector.AuthInfo, error) {
	if auth == nil {
		return nil, errors.New("auth is nil")
	}
	authInfo := &dataconnector.AuthInfo{
		ID:          auth.ID,
		CreatorID:   auth.CreatorID,
		ConnectorID: auth.ConnectorID,
		Name:        auth.Name,
		Icon:        auth.Icon,
		AuthType:    auth.AuthType,
		AuthInfo: dataconnector.AuthTokenInfo{
			AccessToken:     auth.AuthInfo.AccessToken,
			RefreshToken:    auth.AuthInfo.RefreshToken,
			TokenExpireIn:   auth.AuthInfo.TokenExpireIn,
			RefreshExpireIn: auth.AuthInfo.RefreshExpireIn,
			Scope:           auth.AuthInfo.Scope,
			Extra:           auth.AuthInfo.Extra,
		},
	}
	return authInfo, nil
}
