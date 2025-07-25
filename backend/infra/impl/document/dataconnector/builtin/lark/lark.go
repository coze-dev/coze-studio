package lark

import (
	"context"
	"errors"
	"fmt"
	"math/rand"
	"net/http"
	"net/url"
	"path"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/coze-dev/coze-studio/backend/infra/contract/document/dataconnector"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/dataconnector/builtin/internal/dal/model"
	lark_http "github.com/coze-dev/coze-studio/backend/infra/impl/document/dataconnector/builtin/lark/http"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/dataconnector/builtin/lark/lark_api"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/dataconnector/builtin/lark/larkparse"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/dataconnector/builtin/repository"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/sets"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/google/uuid"
	larkdocx "github.com/larksuite/oapi-sdk-go/v3/service/docx/v1"
	larkdrive "github.com/larksuite/oapi-sdk-go/v3/service/drive/v1"
	larkwiki "github.com/larksuite/oapi-sdk-go/v3/service/wiki/v2"
	"github.com/spf13/cast"
	"github.com/xuri/excelize/v2"
	"gorm.io/gorm"
)

type LarkFetcher struct {
	authDao repository.AuthRepo
	idgen   idgen.IDGenerator
	config  *dataconnector.ConnectorConfig
	storage storage.Storage
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
	authParam := lark_http.FeishuAuthParam{
		AppId:     l.config.AuthConfig.ClientID,
		AppSecret: l.config.AuthConfig.ClientSecret,
	}
	authTokenInfo, err := l.getAuthTokenInfo(ctx, authParam, code)
	if err != nil {
		logs.CtxErrorf(ctx, "[AuthorizeCode] getAuthTokenInfo error:%v", err)
		return errors.New("get auth token info error")
	}

	authParam.UserAccessToken = authTokenInfo.AccessToken
	userInfo, err := lark_http.GetUserInfo(ctx, authParam)
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

func (l *LarkFetcher) getAuthTokenInfo(ctx context.Context, authParam lark_http.FeishuAuthParam, code string) (*dataconnector.AuthTokenInfo, error) {
	now := time.Now().UnixMilli()
	var authTokenInfo *dataconnector.AuthTokenInfo
	tokenData, err := lark_http.GetWebUserAccessToken(ctx, authParam, code)
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
	res := &dataconnector.SearchFileResponse{}
	switch request.DocSourceType {
	case dataconnector.DocSourceTypeWiki:
		res, err = l.searchWikiFile(ctx, ak, request)
	case dataconnector.DocSourceTypeDrive:
		res, err = l.searchFeishuFile(ctx, ak, request)
	}
	if err != nil {
		return nil, err
	}
	return res, nil
}

var feishuFileTypeMapping = map[string]dataconnector.FileNodeType{
	"folder": dataconnector.FileNodeTypeFolder,
	"docx":   dataconnector.FileNodeTypeDocument,
	"sheet":  dataconnector.FileNodeTypeSheet,
	"doc":    dataconnector.FileNodeTypeDocument,
	"space":  dataconnector.FileNodeTypeSpace,
}

func filterLarkFileListBySearchQuery(ctx context.Context, fileList []*larkdrive.File, searchQuery string) []*larkdrive.File {
	var result []*larkdrive.File
	for _, file := range fileList {
		if file.Name != nil && strings.Contains(ptr.From(file.Name), searchQuery) {
			result = append(result, file)
		}
	}
	return result
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
			FileType: func() dataconnector.FileType {
				if file.Type == nil || *file.Type == "" {
					return dataconnector.FileTypeDoc
				}
				return dataconnector.FileType(ptr.From(file.Type))
			}(),
			FileURL: ptr.From(file.Url),
			CreateTime: func() int64 {
				val, err := strconv.ParseInt(ptr.From(file.CreatedTime), 10, 64)
				if err != nil {
					return 0
				}
				return val
			}(),
			UpdateTime: func() int64 {
				val, err := strconv.ParseInt(ptr.From(file.CreatedTime), 10, 64)
				if err != nil {
					return 0
				}
				return val
			}(),
		}
		fileParentMap[*file.ParentToken] = append(fileParentMap[*file.ParentToken], *file.Token)
	}
	return feishuFileMap, fileParentMap
}

// 过滤文件类型，只支持部分类型的文件
func filterWikiFileListByFileType(ctx context.Context, fileTypeList []dataconnector.FileNodeType, wikiNodeList []lark_http.FeishuWikiSpaceNode, fileMetaMap map[string]*larkdrive.Meta) (map[string]*dataconnector.FileNode, map[string][]string) {
	const prefix = "[filterFileType]"
	fileNodeTypeListSet := sets.FromSlice(fileTypeList)
	var feishuFileMap = make(map[string]*dataconnector.FileNode)
	var fileParentMap = make(map[string][]string)
	for _, wikiNode := range wikiNodeList {
		if (wikiNode.Space.SpaceId == nil || *wikiNode.Space.SpaceId == "") && (wikiNode.SpaceNode == nil || *wikiNode.SpaceNode.SpaceId == "") {
			logs.CtxWarnf(ctx, "%v spaceId is empty", prefix)
			continue
		}
		// space空间首节点
		if wikiNode.IsSpace {
			feishuFileMap[*wikiNode.Space.SpaceId] = &dataconnector.FileNode{
				FileID:           *wikiNode.Space.SpaceId,
				FileNodeType:     dataconnector.FileNodeTypeSpace,
				FileName:         *wikiNode.Space.Name,
				SpaceID:          wikiNode.Space.SpaceId,
				SpaceType:        wikiNode.Space.SpaceType,
				HasChildrenNodes: true, // space默认有更多
				SpaceDescription: wikiNode.Space.Description,
				SpaceVisibility:  wikiNode.Space.Visibility,
			}
			// 父节点Map
			fileParentMap[*wikiNode.Space.SpaceId] = append(fileParentMap[*wikiNode.Space.SpaceId], *wikiNode.Space.SpaceId)
			continue
		}
		// file node type
		fileNodeType := feishuFileTypeMapping[ptr.From(wikiNode.SpaceNode.ObjType)]
		// 不支持的类型则过滤
		if _, ok := fileNodeTypeListSet[feishuFileTypeMapping[ptr.From(wikiNode.SpaceNode.ObjType)]]; !ok {
			// 不属于当前展示类型，但space node下有子节点，则认为是文件夹类型
			if *wikiNode.SpaceNode.HasChild {
				fileNodeType = dataconnector.FileNodeTypeFolder
			} else {
				continue
			}
		}
		// file url
		fileURL := ""
		if len(fileMetaMap) > 0 {
			fileMeta := fileMetaMap[*wikiNode.SpaceNode.ObjToken]
			if fileMeta != nil {
				fileURL = ptr.From(fileMeta.Url)
			}
		}
		// 使用ObjToken作为key
		feishuFileMap[*wikiNode.SpaceNode.ObjToken] = &dataconnector.FileNode{
			FileID:       *wikiNode.SpaceNode.NodeToken,
			FileNodeType: fileNodeType,
			FileName: func() string {
				if wikiNode.SpaceNode.Title == nil || *wikiNode.SpaceNode.Title == "" {
					return "Unnamed document"
				}
				return *wikiNode.SpaceNode.Title
			}(),
			FileType: func() dataconnector.FileType {
				if wikiNode.SpaceNode.ObjType == nil || *wikiNode.SpaceNode.ObjType == "" {
					return dataconnector.FileTypeDoc
				}
				return dataconnector.FileType(ptr.From(wikiNode.SpaceNode.ObjType))
			}(),
			FileURL:          fileURL,
			HasChildrenNodes: ptr.From(wikiNode.SpaceNode.HasChild),
			SpaceID:          wikiNode.Space.SpaceId,
			SpaceType:        wikiNode.Space.SpaceType,
			ObjToken:         wikiNode.SpaceNode.ObjToken,
			ObjType:          wikiNode.SpaceNode.ObjType,
			CreateTime: func() int64 {
				val, err := strconv.ParseInt(ptr.From(wikiNode.SpaceNode.ObjCreateTime), 10, 64)
				if err != nil {
					return 0
				}
				return val
			}(),
			UpdateTime: func() int64 {
				val, err := strconv.ParseInt(ptr.From(wikiNode.SpaceNode.ObjEditTime), 10, 64)
				if err != nil {
					return 0
				}
				return val
			}(),
		}
		// 父节点Map
		fileParentMap[*wikiNode.SpaceNode.ParentNodeToken] = append(fileParentMap[*wikiNode.SpaceNode.ParentNodeToken], *wikiNode.SpaceNode.NodeToken)
	}
	return feishuFileMap, fileParentMap
}

func buildFileTreeDocList(ctx context.Context, feishuFileMap map[string]*dataconnector.FileNode, fileParentMap map[string][]string) []*dataconnector.FileNode {
	var docList []*dataconnector.FileNode
	for key, fileNode := range feishuFileMap {
		if fileNode == nil {
			logs.CtxInfof(ctx, "fileNode is nil, key:%v", key)
			continue
		}
		// 文件夹类型设置 hasChildrenNodes 为true
		if fileNode.FileNodeType == dataconnector.FileNodeTypeFolder {
			fileNode.HasChildrenNodes = true
		}
		docList = append(docList, fileNode)
	}
	// 对结果进行排序
	sort.SliceStable(docList, func(i, j int) bool {
		// 为空则排在后面
		if docList[i] == nil || docList[j] == nil {
			return false
		}
		// 文件夹排在前面
		if docList[i].FileNodeType == dataconnector.FileNodeTypeFolder &&
			docList[j].FileNodeType != dataconnector.FileNodeTypeFolder {
			return true
		}
		if docList[i].UpdateTime > 0 && docList[j].UpdateTime > 0 {
			return docList[i].UpdateTime > docList[j].UpdateTime
		}
		return false
	})

	return docList
}

func (l *LarkFetcher) searchFeishuFile(ctx context.Context, ak string, request *dataconnector.SearchFileRequest) (*dataconnector.SearchFileResponse, error) {
	result := dataconnector.SearchFileResponse{}
	// get doc list
	fileList, err := lark_http.GetDriveFileListByParam(ctx, lark_http.FeishuAuthParam{
		AppId:           l.config.AuthConfig.ClientID,
		AppSecret:       l.config.AuthConfig.ClientSecret,
		UserAccessToken: ak,
	}, request.FolderID)
	if err != nil {
		logs.CtxErrorf(ctx, "GetDriveFileListByParam error:%+v", err)
		return nil, err
	}
	if ptr.From(request.SearchQuery) != "" {
		fileList = filterLarkFileListBySearchQuery(ctx, fileList, ptr.From(request.SearchQuery))
	}
	// filter file list by file type
	feishuFileMap, fileParentMap := filterLarkFileListByFileType(ctx, fileList, request.FileTypeList)

	// build doc list
	docList := buildFileTreeDocList(ctx, feishuFileMap, fileParentMap)

	result.FileList = docList
	result.HasMore = false
	result.Offset = 0
	return &result, nil
}

func (l *LarkFetcher) searchWikiFile(ctx context.Context, ak string, req *dataconnector.SearchFileRequest) (*dataconnector.SearchFileResponse, error) {
	result := dataconnector.SearchFileResponse{}
	// fetch doclist
	fileList, err := l.fetchFeishuWikiDocList(ctx, ak, req)
	if err != nil {
		logs.CtxErrorf(ctx, "fetchFeishuWikiDocList error:%+v", err)
		return nil, err
	}
	// query meta
	fileMetaMap, err := l.batchQueryFileURL(ctx, ak, req, fileList)
	if err != nil {
		logs.CtxErrorf(ctx, "batchQueryFileURL error:%+v", err)
		return nil, err
	}
	// filter
	feishuFileMap, fileParentMap := filterWikiFileListByFileType(ctx, req.FileTypeList, fileList, fileMetaMap)

	// build doc list
	docList := buildWikiFileTreeDocList(ctx, feishuFileMap, fileParentMap)
	docList = filterWikiFileListBySearchQuery(ctx, docList, ptr.From(req.SearchQuery))
	result.FileList = docList
	result.Total = int64(len(docList))
	result.Offset = 0
	result.HasMore = false
	return &result, nil
}

func filterWikiFileListBySearchQuery(ctx context.Context, fileList []*dataconnector.FileNode, searchQuery string) []*dataconnector.FileNode {
	var result []*dataconnector.FileNode
	for _, file := range fileList {
		if file.FileNodeType == dataconnector.FileNodeTypeFolder {
			continue
		}
		if strings.Contains(file.FileName, searchQuery) {
			result = append(result, file)
		}
	}
	return result
}

func (l *LarkFetcher) batchQueryFileURL(ctx context.Context, ak string, req *dataconnector.SearchFileRequest, wikiNodeList []lark_http.FeishuWikiSpaceNode) (map[string]*larkdrive.Meta, error) {
	const prefix = "[fillFileURL]"
	// node wikiNodeList
	nodeList := make([]*larkwiki.Node, 0)
	for _, node := range wikiNodeList {
		if node.SpaceNode != nil {
			nodeList = append(nodeList, node.SpaceNode)
		}
	}
	authParam := lark_http.FeishuAuthParam{
		AppId:           l.config.AuthConfig.ClientID,
		AppSecret:       l.config.AuthConfig.ClientSecret,
		UserAccessToken: ak,
	}
	paramList := slices.Transform(nodeList, func(node *larkwiki.Node) lark_http.QueryMetaParams {
		return lark_http.QueryMetaParams{
			DocToken: ptr.From(node.ObjToken),
			DocType:  ptr.From(node.ObjType),
		}
	})
	metaList, err := lark_http.BatchQueryDriveFileMetas(ctx, authParam, paramList)
	if err != nil {
		logs.CtxErrorf(ctx, "%v BatchQueryDriveFileMetas error:%+v", prefix, err)
		return nil, fmt.Errorf("batch query drive file metas error:%v", err)
	}
	metaMap := slices.ToMap(metaList, func(meta *larkdrive.Meta) (string, *larkdrive.Meta) {
		return ptr.From(meta.DocToken), meta
	})
	return metaMap, nil
}
func (l *LarkFetcher) fetchFeishuWikiDocList(ctx context.Context, ak string, req *dataconnector.SearchFileRequest) ([]lark_http.FeishuWikiSpaceNode, error) {
	const prefix = "[fetchFeishuWikiDocList]"
	var wikiSpaceNodeList []lark_http.FeishuWikiSpaceNode
	var err error
	var wikiSpaces []*larkwiki.Space
	// 某个space下面的node列表
	if ptr.From(req.SpaceID) != "" {
		// 1. 获取知识空间列表
		var wikiSpace *larkwiki.Space
		wikiSpace, err = lark_http.GetWikiSpace(ctx, l.config, ptr.From(req.SpaceID), ak)
		if err != nil {
			logs.CtxErrorf(ctx, "%v GetWikiSpace err: %v", prefix, err)
			return nil, fmt.Errorf("get wiki space error:%v", err)
		}
		// 2. 获取知识空间子节点列表
		wikiSpaceNodeList, err = lark_http.GetWikiSpaceNodeListByParam(ctx, l.config, wikiSpace, ptr.From(req.FolderID), ak)
		if err != nil {
			logs.CtxErrorf(ctx, "%v GetWikiSpaceNodeList err: %v", prefix, err)
			return nil, fmt.Errorf("get wiki space node list error:%v", err)
		}
	} else {
		// 根目录下所有space列表
		wikiSpaces, err = lark_http.GetWikiSpaceList(ctx, l.config, ak)
		if err != nil {
			logs.CtxErrorf(ctx, "%v GetWikiSpaceList err: %v", prefix, err)
			return nil, fmt.Errorf("get wiki space list error:%v", err)
		}
		for _, wikiSpace := range wikiSpaces {
			wikiSpaceNodeList = append(wikiSpaceNodeList,
				lark_http.FeishuWikiSpaceNode{
					Space:     wikiSpace,
					SpaceNode: nil,
					IsSpace:   true,
					HasMore:   true, // 默认space下有子节点
				})
		}
	}
	return wikiSpaceNodeList, nil
}

func (l *LarkFetcher) GetAccessTokenByAuthID(ctx context.Context, authID int64) (token string, err error) {
	auth, err := l.authDao.GetAuthByID(ctx, authID)
	if err != nil {
		logs.CtxErrorf(ctx, "[AuthorizeCode] GetAuthByUniqID error:%v", err)
		return "", errors.New("get auth info 「GetAuthByUniqID」error")
	}
	if auth == nil {
		return "", errors.New("auth info is nil")
	}
	auth, err = l.RefreshAccessToken(ctx, auth)
	if err != nil {
		return "", err
	}
	return auth.AuthInfo.AccessToken, nil
}

const (
	NeedRefreshTokenRightNowDuration = time.Minute * 5
)

func (l *LarkFetcher) RefreshAccessToken(ctx context.Context, auth *model.Auth) (*model.Auth, error) {
	if auth.AuthInfo.RefreshToken == "" || time.UnixMilli(auth.AuthInfo.RefreshExpireIn).Before(time.Now()) {
		logs.CtxInfof(ctx, "[RefreshAccessToken] authID:%v refreshToken:%v refreshExpireIn:%v is expired", auth.ID, auth.AuthInfo.RefreshToken, time.UnixMilli(auth.AuthInfo.RefreshExpireIn))
		return auth, errors.New("refresh token is expired")
	}
	duration := time.Until(time.UnixMilli(auth.AuthInfo.TokenExpireIn))
	if duration <= NeedRefreshTokenRightNowDuration {
		logs.CtxInfof(ctx, "[RefreshAccessToken] authID:%v tokenExpireIn:%v need refresh token right now", auth.ID, time.UnixMilli(auth.AuthInfo.TokenExpireIn))
		now := time.Now().UnixMilli()
		refreshTokenData, err := lark_http.RefreshAccessToken(ctx, lark_http.FeishuAuthParam{
			AppId:     l.config.AuthConfig.ClientID,
			AppSecret: l.config.AuthConfig.ClientSecret,
		}, auth.AuthInfo.RefreshToken)
		if err != nil {
			logs.CtxErrorf(ctx, "[refreshAuthInfo] RefreshAccessToken authID:%v error: %v", auth.ID, err)
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

func buildWikiFileTreeDocList(ctx context.Context, feishuFileMap map[string]*dataconnector.FileNode, fileParentMap map[string][]string) []*dataconnector.FileNode {
	var docList []*dataconnector.FileNode
	for key, fileNode := range feishuFileMap {
		if fileNode == nil {
			logs.CtxWarnf(ctx, "buildWikiFileTreeDocList fileNode is nil, key:%v", key)
			continue
		}
		// 文件夹类型设置 hasChildrenNodes 为true
		if fileNode.FileNodeType == dataconnector.FileNodeTypeFolder {
			fileNode.HasChildrenNodes = true
		}
		docList = append(docList, fileNode)
	}
	// 对结果进行排序
	sort.SliceStable(docList, func(i, j int) bool {
		// 文件夹排在前面
		if docList[i].FileNodeType == dataconnector.FileNodeTypeFolder &&
			docList[j].FileNodeType != dataconnector.FileNodeTypeFolder {
			return true
		}
		if docList[i].UpdateTime > 0 && docList[j].UpdateTime > 0 {
			return docList[i].UpdateTime > docList[j].UpdateTime
		}
		return false
	})

	return docList
}

func (l *LarkFetcher) GetFileContent(ctx context.Context, req *dataconnector.GetFileContentRequest) (resp *dataconnector.GetFileContentResponse, err error) {
	defer func() {
		if recoverErr := recover(); recoverErr != nil {
			logs.CtxErrorf(ctx, "[ReadRecord] recovery error: %v", recoverErr)
			err = fmt.Errorf("non-retry,panic:%v", recoverErr)
			return
		}
	}()
	if req.FileID == "" {
		return nil, errors.New("non-retry,file_id is empty")
	}
	ak, err := l.GetAccessTokenByAuthID(ctx, req.AuthID)
	if err != nil {
		return nil, errors.New("non-retry,get access token by auth id failed")
	}
	var content []byte
	var fName string
	switch req.FileType {
	case dataconnector.FileTypeDocx:
		content, err = l.fetchDocx(ctx, ak, req)
		if err != nil {
			return nil, err
		}
	case dataconnector.FileTypeSheet:
		content, err = l.fetchSheet(ctx, ak, req)
		if err != nil {
			return nil, err
		}
	case dataconnector.FileTypeDoc:
		content, err = l.fetchDoc(ctx, ak, req)
		if err != nil {
			return nil, err
		}
	default:
		return nil, errors.New("non-retry,file type not support")
	}
	if req.FileType == dataconnector.FileTypeSheet {
		fName = uuid.NewString() + ".xlsx"
	} else {
		fName = uuid.NewString() + ".txt"
	}
	objKey := fmt.Sprintf("%s/%d_%s", "FileBizType.BIZ_CONNECTOR_IMAGE", time.Now().UnixNano(), fName)
	err = l.storage.PutObject(ctx, objKey, content)
	if err != nil {
		return nil, err
	}
	resp = &dataconnector.GetFileContentResponse{
		URI:      objKey,
		FileSize: int64(len(content)),
	}
	return resp, nil
}

func (l *LarkFetcher) fetchDoc(ctx context.Context, ak string, req *dataconnector.GetFileContentRequest) (content []byte, err error) {
	logs.CtxInfof(ctx, "[ReadLarkDocxFile] GetDocumentRawContent accessToken:%v fileID:%v", ak, req.FileID)
	ctx = context.WithValue(ctx, lark_api.ContextAccessToken, ak)
	cfg := lark_api.NewConfiguration()
	cfg.BasePath = l.config.BaseOpenURL
	cfg.HTTPClient = &http.Client{
		Timeout: 15 * time.Second,
	}
	body, resp, err := lark_api.NewAPIClient(cfg).DefaultApi.OpenApisDocV2DocumentIdRawContentGet(ctx, req.FileID)
	if err != nil {
		logs.CtxErrorf(ctx, "[ReadLarkDocxFile] GetDocumentRawContent error: %v", err)
		return nil, err
	}
	if body.Code != 0 {
		requestID := GetLarkRequestId(resp)
		err = lark_http.DealLarkError(ctx, int(body.Code), body.Msg, requestID)
		logs.CtxErrorf(ctx, "[ReadLarkDocxFile] GetDocumentRawContent not success,code:%v msg:%v request_id:%v", int(body.Code), body.Msg, requestID)
		return nil, err
	}
	if body.Data == nil {
		err = errors.New("non-retry,body data is nil")
		return nil, err
	}
	if body.Data.Content == "" {
		err = errors.New("non-retry,body data content is empty")
		return nil, err
	}
	content = []byte(body.Data.Content)
	return content, nil
}

func (l *LarkFetcher) fetchDocx(ctx context.Context, ak string, req *dataconnector.GetFileContentRequest) (content []byte, err error) {
	var blockList []*larkdocx.Block
	authParam := lark_http.FeishuAuthParam{
		AppId:           l.config.AuthConfig.ClientID,
		AppSecret:       l.config.AuthConfig.ClientSecret,
		UserAccessToken: ak,
	}
	blockList, err = lark_http.RetrieveDocxBlockList(ctx, authParam, req.FileID)
	if err != nil {
		return nil, err
	}
	imageTokenSet := map[string]struct{}{}
	for _, block := range blockList {
		if block.BlockType == nil &&
			*block.BlockType != int(larkparse.FeishuDocxBlockTypeImage) ||
			block.Image == nil || block.Image.Token == nil {
			continue
		}
		imageTokenSet[ptr.From(block.Image.Token)] = struct{}{}
	}
	imageTokenList := []string{}
	for imageToken := range imageTokenSet {
		imageTokenList = append(imageTokenList, imageToken)
	}
	var imageTokenMap map[string]string
	imageTokenMap, err = l.RetrieveImage(ctx, authParam, imageTokenList)
	if err != nil {
		logs.CtxErrorf(ctx, "[FetchData] RetrieveImage err: %v", err)
	} else {
		logs.CtxInfof(ctx, "[FetchData] RetrieveImage res:%v", imageTokenMap)
		content = []byte(larkparse.FeishuDocx2MD(req.FileID, blockList, imageTokenMap))
	}
	return content, nil
}

type SheetInfo struct {
	Title        string
	Index        int32
	RowCount     int32
	ColCount     int32
	SheetContent [][]string
}

func (l *LarkFetcher) fetchSheet(ctx context.Context, ak string, req *dataconnector.GetFileContentRequest) (content []byte, err error) {
	ctx = context.WithValue(ctx, lark_api.ContextAccessToken, ak)
	cfg := lark_api.NewConfiguration()
	cfg.BasePath = l.config.BaseOpenURL
	cfg.HTTPClient = &http.Client{
		Timeout: 15 * time.Second,
	}
	body, resp, err := lark_api.NewAPIClient(cfg).DefaultApi.OpenApisSheetsV3SpreadsheetsSpreadsheetTokenSheetsQueryGet(ctx, req.FileID)
	if err != nil {
		logs.CtxErrorf(ctx, "[ReadLarkSheet] GetSheetList error: %v", err)
		return nil, err
	}
	if body.Code != 0 {
		requestID := GetLarkRequestId(resp)
		logs.CtxErrorf(ctx, "[ReadLarkSheet] GetSheetList not success,entityID:%v code:%v msg:%v request_id:%v", int(body.Code), body.Msg, requestID)
		err = lark_http.DealLarkError(ctx, int(body.Code), body.Msg, requestID)
		return nil, err
	}
	if body.Data == nil {
		logs.CtxErrorf(ctx, "[ReadLarkSheet] GetSheetList data is nil")
		return nil, errors.New("non-retry,get sheet list data is nil")
	}
	authParam := lark_http.FeishuAuthParam{
		AppId:           l.config.AuthConfig.ClientID,
		AppSecret:       l.config.AuthConfig.ClientSecret,
		UserAccessToken: ak,
		BaseUrl:         l.config.BaseOpenURL,
	}
	// 内容为空检查
	allSheetEmpty := true
	sheetInfoList := make([]*SheetInfo, 0)
	for _, sheet := range body.Data.Sheets {
		if sheet.GridProperties == nil {
			logs.CtxInfof(ctx, "[ReadLarkSheet] sheet:%v gridProperties is nil", sheet.SheetId)
			continue
		}
		// 2.拉取表格内容
		rangeValue := sheet.SheetId + "!" + "A1:" + larkparse.GetExcelTitle(sheet.GridProperties.ColumnCount) + fmt.Sprint(sheet.GridProperties.RowCount)
		valueRanges, ocErr := lark_http.ReadLarkSheet(ctx, authParam, req.FileID, []string{rangeValue})
		if ocErr != nil {
			logs.CtxErrorf(ctx, "ReadLarkSheet error:%v", ocErr)
			return nil, ocErr
		}
		if valueRanges == nil {
			continue
		}
		if len(valueRanges[rangeValue]) == 0 {
			continue
		}
		content := make([][]string, len(valueRanges[rangeValue]))
		for i, line := range valueRanges[rangeValue] {
			content[i] = make([]string, len(line))
			for j, value := range line {
				content[i][j] = l.translateFeishuSheetValue(ctx, authParam, value)
			}
		}
		if len(content) != 0 {
			allSheetEmpty = false
			sheetInfoList = append(sheetInfoList, &SheetInfo{
				Title:        sheet.Title,
				Index:        sheet.Index,
				RowCount:     sheet.GridProperties.RowCount,
				ColCount:     sheet.GridProperties.ColumnCount,
				SheetContent: content,
			})
		}
	}
	if allSheetEmpty {
		logs.CtxErrorf(ctx, "[ReadLarkSheet]allSheetEmpty is empty")
		return nil, errors.New("non-retry,all sheet is empty")
	}
	sort.SliceStable(sheetInfoList, func(i, j int) bool {
		return sheetInfoList[i].Index < sheetInfoList[j].Index
	})
	contentBytes, ocErr := l.genLocalExcelFile(ctx, sheetInfoList)
	if ocErr != nil {
		logs.CtxErrorf(ctx, "genLocalExcelFile error: %v", ocErr)
		return nil, ocErr
	}
	return contentBytes, nil
}
func GetLarkRequestId(resp *http.Response) string {
	if resp == nil {
		return ""
	}
	logID := resp.Header.Get(HttpHeaderKeyLogId)
	if logID != "" {
		return logID
	}
	return resp.Header.Get(HttpHeaderKeyRequestId)
}
func (l *LarkFetcher) translateFeishuSheetValue(ctx context.Context, authParam lark_http.FeishuAuthParam, value interface{}) string {
	if value == nil {
		return ""
	}
	// 如果不是图片类型直接marshal string处理
	imageSheetVal, ok := value.(map[string]interface{})
	if !ok {
		imageSheetValList, ok := value.([]interface{})
		if !ok || len(imageSheetValList) == 0 {
			return cast.ToString(value)
		}
		result := ""
		for _, imageSheetValInterface := range imageSheetValList {
			// 图片链接类型通过拼接<img src="" data-tos-key="">
			result += func() string {
				imageSheetVal, ok = imageSheetValInterface.(map[string]interface{})
				if !ok {
					return cast.ToString(value)
				}
				link, ok := imageSheetVal["link"].(string)
				if !ok {
					text, ok := imageSheetVal["text"].(string)
					if ok {
						return cast.ToString(text)
					}
					return cast.ToString(value)
				}
				urlInfo, err := url.ParseRequestURI(link)
				if err != nil || urlInfo.Scheme == "" || urlInfo.Host == "" {
					text, ok := imageSheetVal["text"].(string)
					if ok {
						return cast.ToString(text)
					}
					return cast.ToString(value)
				}
				urlType, ok := imageSheetVal["type"].(string)
				if !ok || urlType != "url" {
					return fmt.Sprintf("<img src=\"%s\">", link)
				}
				return link
			}()
		}
		return result
	}
	// 图片类型通过image token获取图片二进制流并上传到tos
	fileToken, ok := imageSheetVal["fileToken"].(string)
	if !ok {
		return cast.ToString(value)
	}
	imageTokenMap, ocErr := l.RetrieveImage(ctx, authParam, []string{fileToken})
	if ocErr != nil {
		logs.CtxWarnf(ctx, "DownloadMedia error:%+v", ocErr)
		return cast.ToString(value)
	}
	logs.CtxInfof(ctx, "[FetchData] RetrieveImage res:%v", imageTokenMap)
	tosKey, ok := imageTokenMap[fileToken]
	if !ok {
		return cast.ToString(value)
	}
	return fmt.Sprintf("<img src=\"%s\" data-tos-key=\"%s\" >", "", tosKey)
}

const (
	HttpHeaderKeyRequestId = "X-Request-Id"
	HttpHeaderKeyLogId     = "X-Tt-Logid"
)

func (l *LarkFetcher) RetrieveImage(ctx context.Context, authParam lark_http.FeishuAuthParam, imageTokenList []string) (map[string]string, error) {
	imageTokenMap := make(map[string]string)
	for _, imageToken := range imageTokenList {
		if _, ok := imageTokenMap[imageToken]; ok {
			continue
		}
		var imageName string
		var imageContent []byte
		var err error
		for i := 0; i < 3; i++ {
			imageName, imageContent, err = lark_http.DownloadMedia(ctx, authParam, imageToken)
			if err == nil {
				break
			}
			if strings.Contains(err.Error(), "rate limit") {
				time.Sleep(time.Duration(rand.Intn(10)) * 200 * time.Millisecond)
			}
			continue
		}
		if err != nil {
			logs.CtxErrorf(ctx, "DownloadMedia error:%+v", err)
			continue
		}
		fileExtension := path.Base(imageName)
		ext := path.Ext(fileExtension)
		fName := uuid.NewString() + ext
		objKey := fmt.Sprintf("%s/%d_%s", "FileBizType.BIZ_CONNECTOR_IMAGE", time.Now().UnixNano(), fName)
		err = l.storage.PutObject(ctx, objKey, imageContent)
		if err != nil {
			logs.CtxErrorf(ctx, "[RetrieveImage] PutObject objKey:%v err:%v", objKey, err)
			return nil, err
		}
		imageTokenMap[imageToken] = objKey
	}
	return imageTokenMap, nil
}

func (l *LarkFetcher) genLocalExcelFile(ctx context.Context, sheetInfos []*SheetInfo) ([]byte, error) {
	f := excelize.NewFile()
	defer func() {
		if err := f.Close(); err != nil {
			logs.CtxErrorf(ctx, "[genLocalExcelFile] file close err: %v", err)
		}
	}()

	sheetIndex2Title := make(map[int32]string)
	for _, sheetInfo := range sheetInfos {
		sheetIndex2Title[sheetInfo.Index] = sheetInfo.Title
	}
	for i, sheet := range sheetInfos {
		if i != 0 {
			_, err := f.NewSheet(sheet.Title)
			if err != nil {
				logs.CtxErrorf(ctx, "[genLocalExcelFile] new sheet err: %v", err)
				return nil, errors.New("new sheet err")
			}
		} else {
			err := f.SetSheetName("Sheet1", sheet.Title)
			if err != nil {
				logs.CtxErrorf(ctx, "[genLocalExcelFile] set sheet name err: %v", err)
				return nil, errors.New("set sheet name err")
			}
		}

		for rowNum, row := range sheet.SheetContent {
			row = filterEmptyValue(row)
			if len(row) == 0 {
				continue
			}
			// rowNum 从0开始，CoordinatesToCellName 接收的参数从1开始
			beginCell, err := excelize.CoordinatesToCellName(1, rowNum+1)
			if err != nil {
				logs.CtxErrorf(ctx, "[genLocalExcelFile] CoordinatesToCellName err: %v", err)
				return nil, errors.New("coordinates to cell name err")
			}
			err = f.SetSheetRow(sheet.Title, beginCell, &sheet.SheetContent[rowNum])
			if err != nil {
				logs.CtxErrorf(ctx, "[genLocalExcelFile] set sheet row err: %v", err)
				return nil, errors.New("set sheet row err")
			}
		}
	}

	buffer, err := f.WriteToBuffer()
	if err != nil {
		logs.CtxErrorf(ctx, "[genLocalExcelFile] write to buffer err: %v", err)
		return nil, errors.New("write to buffer err")
	}

	return buffer.Bytes(), nil
}
func filterEmptyValue(valueRanges []string) []string {
	for i := len(valueRanges) - 1; i >= 0; i-- {
		if valueRanges[i] != "" {
			return valueRanges[:i+1]
		}
	}
	return nil
}
