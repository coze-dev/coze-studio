package lark

import (
	"context"
	"errors"
	"fmt"
	"sort"
	"strconv"
	"strings"
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
	larkwiki "github.com/larksuite/oapi-sdk-go/v3/service/wiki/v2"
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
func filterWikiFileListByFileType(ctx context.Context, fileTypeList []dataconnector.FileNodeType, wikiNodeList []http.FeishuWikiSpaceNode, fileMetaMap map[string]*larkdrive.Meta) (map[string]*dataconnector.FileNode, map[string][]string) {
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
	fileList, err := http.GetDriveFileListByParam(ctx, http.FeishuAuthParam{
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
	fileMetaMap := make(map[string]*larkdrive.Meta)
	// query meta
	fileMetaMap, err = l.batchQueryFileURL(ctx, ak, req, fileList)
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

func (l *LarkFetcher) batchQueryFileURL(ctx context.Context, ak string, req *dataconnector.SearchFileRequest, wikiNodeList []http.FeishuWikiSpaceNode) (map[string]*larkdrive.Meta, error) {
	const prefix = "[fillFileURL]"
	// node wikiNodeList
	nodeList := make([]*larkwiki.Node, 0)
	for _, node := range wikiNodeList {
		if node.SpaceNode != nil {
			nodeList = append(nodeList, node.SpaceNode)
		}
	}
	authParam := http.FeishuAuthParam{
		AppId:           l.config.AuthConfig.ClientID,
		AppSecret:       l.config.AuthConfig.ClientSecret,
		UserAccessToken: ak,
	}
	var paramList []http.QueryMetaParams
	paramList = slices.Transform(nodeList, func(node *larkwiki.Node) http.QueryMetaParams {
		return http.QueryMetaParams{
			DocToken: ptr.From(node.ObjToken),
			DocType:  ptr.From(node.ObjType),
		}
	})
	metaList, err := http.BatchQueryDriveFileMetas(ctx, authParam, paramList)
	if err != nil {
		logs.CtxErrorf(ctx, "%v BatchQueryDriveFileMetas error:%+v", prefix, err)
		return nil, errors.New(fmt.Sprintf("batch query drive file metas error:%v", err))
	}
	metaMap := slices.ToMap(metaList, func(meta *larkdrive.Meta) (string, *larkdrive.Meta) {
		return ptr.From(meta.DocToken), meta
	})
	return metaMap, nil
}
func (l *LarkFetcher) fetchFeishuWikiDocList(ctx context.Context, ak string, req *dataconnector.SearchFileRequest) ([]http.FeishuWikiSpaceNode, error) {
	const prefix = "[fetchFeishuWikiDocList]"
	var wikiSpaceNodeList []http.FeishuWikiSpaceNode
	var err error
	var wikiSpaces []*larkwiki.Space
	// 某个space下面的node列表
	if ptr.From(req.SpaceID) != "" {
		// 1. 获取知识空间列表
		var wikiSpace *larkwiki.Space
		wikiSpace, err = http.GetWikiSpace(ctx, l.config, ptr.From(req.SpaceID), ak)
		if err != nil {
			logs.CtxErrorf(ctx, "%v GetWikiSpace err: %v", prefix, err)
			return nil, errors.New(fmt.Sprintf("get wiki space error:%v", err))
		}
		// 2. 获取知识空间子节点列表
		wikiSpaceNodeList, err = http.GetWikiSpaceNodeListByParam(ctx, l.config, wikiSpace, ptr.From(req.FolderID), ak)
		if err != nil {
			logs.CtxErrorf(ctx, "%v GetWikiSpaceNodeList err: %v", prefix, err)
			return nil, errors.New(fmt.Sprintf("get wiki space node list error:%v", err))
		}
	} else {
		// 根目录下所有space列表
		wikiSpaces, err = http.GetWikiSpaceList(ctx, l.config, ak)
		if err != nil {
			logs.CtxErrorf(ctx, "%v GetWikiSpaceList err: %v", prefix, err)
			return nil, errors.New(fmt.Sprintf("get wiki space list error:%v", err))
		}
		for _, wikiSpace := range wikiSpaces {
			wikiSpaceNodeList = append(wikiSpaceNodeList,
				http.FeishuWikiSpaceNode{
					Space:     wikiSpace,
					SpaceNode: nil,
					IsSpace:   true,
					HasMore:   true, // 默认space下有子节点
				})
		}
	}
	return wikiSpaceNodeList, nil
}

type searchParam struct {
	AuthID         int64
	AccessToken    string
	FileTypeList   []dataconnector.FileNodeType
	FolderId       string
	PageToken      string
	SpaceId        string
	DocSourceType  dataconnector.DocSourceType
	SearchKeywords *string
	PageSize       int64
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
