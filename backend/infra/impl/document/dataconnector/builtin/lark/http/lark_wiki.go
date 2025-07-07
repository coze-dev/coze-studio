package http

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/coze-dev/coze-studio/backend/infra/contract/document/dataconnector"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	lark "github.com/larksuite/oapi-sdk-go/v3"
	larkcore "github.com/larksuite/oapi-sdk-go/v3/core"
	larkdrive "github.com/larksuite/oapi-sdk-go/v3/service/drive/v1"
	larkwiki "github.com/larksuite/oapi-sdk-go/v3/service/wiki/v2"
)

type SearchWikiNodeResponse struct {
	Code int `json:"code"`
	Data struct {
		HasMore bool `json:"has_more"`
		Items   []struct {
			NodeId   string `json:"node_id"`
			ObjToken string `json:"obj_token"`
			ObjType  int    `json:"obj_type"`
			ParentId string `json:"parent_id"`
			SortId   int    `json:"sort_id"`
			SpaceId  string `json:"space_id"`
			Title    string `json:"title"`
			Url      string `json:"url"`
		} `json:"items"`
		PageToken string `json:"page_token"`
	} `json:"data"`
	Msg string `json:"msg"`
}

type SearchFeishuWikiParams struct {
	ConnectorConfig *dataconnector.ConnectorConfig
	AccessToken     string
	SearchQuery     string
}

const (
	// 飞书云文档类型
	FeishuFileTypeDocx   = "docx"   // 新版文档
	FeishuFileTypeSheet  = "sheet"  // 表格
	FeishuFileTypeFolder = "folder" // 文件夹
	FeishuFileTypeFile   = "file"   // 文件
	FeishuFileTypeDoc    = "doc"    // 旧版文档

	FeishuPermissionExternalAccessOpen                    = "open"
	FeishuPermissionExternalAccessClosed                  = "closed"
	FeishuPermissionExternalAccessAllowSharePartnerTenant = "allow_share_partner_tenant"

	DefaultFeishuFileName = "未命名文档"
	DefaultFeishuFileType = "未知文件类型"

	//  飞书wiki文档类型
	FeishuWikiFileTypeDoc      = "doc"      // 旧版文档
	FeishuWikiFileTypeSheet    = "sheet"    // 表格
	FeishuWikiFileTypeBiTable  = "bitable"  // 多维表格
	FeishuWikiFileTypeMindNote = "mindnote" // 思维导图
	FeishuWikiFileTypeFile     = "file"     // 文件
	FeishuWikiFileTypeSpace    = "space"    // wiki space类型
	FeishuWikiFileTypeSlide    = "slide"    // 幻灯片
	FeishuWikiFileTypeWiki     = "wiki"     // 知识库节点
	FeishuWikiFileTypeDocx     = "docx"     // 新版文档
	FeishuWikiFileTypeFolder   = "folder"   // 文件夹
	FeishuWikiFileTypeCatalog  = "catalog"  // 文件夹
)
const (
	Doc FeishuWikiObjType = iota + 1
	Sheet
	Bitable
	Mindnote
	File
	Slide
	Wiki
	Docx
	Folder
	Catalog
)

type FeishuWikiObjType int

// IntToFeishuWikiObjType 将 int 转换为 FeishuWikiObjType
func IntToFeishuWikiObjType(i int) FeishuWikiObjType {
	return FeishuWikiObjType(i)
}

// 定义一个映射 FeishuWikiObjType 到说明的函数
func (o FeishuWikiObjType) String() string {
	switch o {
	case Doc:
		return FeishuWikiFileTypeDoc
	case Sheet:
		return FeishuWikiFileTypeSheet
	case Bitable:
		return FeishuWikiFileTypeBiTable
	case Mindnote:
		return FeishuWikiFileTypeMindNote
	case File:
		return FeishuWikiFileTypeFile
	case Slide:
		return FeishuWikiFileTypeSlide
	case Wiki:
		return FeishuWikiFileTypeWiki
	case Docx:
		return FeishuWikiFileTypeDocx
	case Folder:
		return FeishuWikiFileTypeFolder
	case Catalog:
		return FeishuWikiFileTypeCatalog
	default:
		return "Unknown"
	}
}

func SearchFeishuWikiNodes(ctx context.Context, params SearchFeishuWikiParams) ([]*larkwiki.Node, error) {
	const prefix = "[SearchFeishuWikiNodes]"
	// 创建 API Client
	client := lark.NewClient(params.ConnectorConfig.AuthConfig.ClientID, params.ConnectorConfig.AuthConfig.ClientSecret,
		lark.WithReqTimeout(time.Second*10), lark.WithLogLevel(larkcore.LogLevelDebug), lark.WithLogReqAtDebug(true),
	)
	var result []*larkwiki.Node
	hasMore := true
	pageToken := ""
	pageSize := 50
	query := params.SearchQuery
	accessToken := params.AccessToken
	for hasMore {
		apiPath := params.ConnectorConfig.BaseOpenURL + "/open-apis/wiki/v1/nodes/search" // api path
		body := map[string]interface{}{}                                                  // body
		body["query"] = query
		// 发起请求
		resp, err := client.Do(ctx, &larkcore.ApiReq{
			HttpMethod: http.MethodPost,
			ApiPath:    apiPath,
			Body:       body,
			QueryParams: larkcore.QueryParams{
				"page_token": []string{pageToken},
				"page_size":  []string{strconv.Itoa(pageSize)},
			},
			PathParams:                nil,
			SupportedAccessTokenTypes: []larkcore.AccessTokenType{larkcore.AccessTokenTypeUser},
		}, larkcore.WithUserAccessToken(accessToken))
		// 服务端错误处理
		if err != nil || resp == nil {
			requestId := ""
			if resp != nil {
				requestId = resp.RequestId()
			}
			logs.CtxErrorf(ctx, "%v client.Do ,requestId=%v, error=%v", prefix, requestId, err)
			return nil, err
		}
		if resp.StatusCode != http.StatusOK {
			logs.CtxErrorf(ctx, "%v client.Do ,status not ok, resp=%v", prefix, resp)
			errMsg := fmt.Sprintf("node search fail,resp=%v", resp)
			return nil, errors.New(errMsg)
		}
		// response
		searchResp := &SearchWikiNodeResponse{}
		err = resp.JSONUnmarshalBody(searchResp, &larkcore.Config{
			Serializable: &larkcore.DefaultSerialization{},
		})
		if err != nil {
			logs.CtxErrorf(ctx, "%v resp.JSONUnmarshalBody error, searchResp=%v, error=%v", prefix, resp, err)
			return nil, err
		}
		if searchResp == nil || len(searchResp.Data.Items) == 0 {
			logs.CtxErrorf(ctx, "%v searchResp is nil, searchResp=%v", prefix, resp)
			break
		}
		hasMore = searchResp.Data.HasMore            // has more
		pageToken = searchResp.Data.PageToken        // page token
		for _, node := range searchResp.Data.Items { // result
			nodeID := node.NodeId
			objToken := node.ObjToken
			objType := IntToFeishuWikiObjType(node.ObjType).String()
			parentNodeToken := node.ParentId
			spaceID := node.SpaceId
			title := node.Title
			result = append(result, &larkwiki.Node{
				NodeToken:       &nodeID,
				ObjToken:        &objToken,
				ObjType:         &objType,
				ParentNodeToken: &parentNodeToken,
				SpaceId:         &spaceID,
				Title:           &title,
			})
		}
	}
	return result, nil
}

func GetWikiSpace(ctx context.Context, connector *dataconnector.ConnectorConfig, spaceId string, userAccessToken string) (*larkwiki.Space, error) {
	const prefix = "[GetWikiSpace]"
	// 创建 Client
	client := lark.NewClient(connector.AuthConfig.ClientID, connector.AuthConfig.ClientSecret, lark.WithReqTimeout(time.Second*3))
	// 创建请求对象
	req := larkwiki.NewGetSpaceReqBuilder().
		SpaceId(spaceId).
		// Lang("en").
		Build()
	// 发起请求
	resp, err := client.Wiki.V2.Space.Get(ctx, req, larkcore.WithUserAccessToken(userAccessToken))
	// 处理错误
	if err != nil || resp == nil {
		logs.CtxErrorf(ctx, "%v client.Wiki.V2.Space.Get error=%v", prefix, err)
		return nil, err
	}
	// 服务端错误处理
	if !resp.Success() || resp.Data == nil || resp.Data.Space == nil {
		logs.CtxErrorf(ctx, "%v client.Wiki.V2.Space.Get fail,resp=%v", prefix, resp)
		return nil, errors.New(resp.Msg)
	}
	return resp.Data.Space, nil
}

// GetWikiSpaceList 获取用户知识空间下的所有空间列表
func GetWikiSpaceList(ctx context.Context, connector *dataconnector.ConnectorConfig, userAccessToken string) ([]*larkwiki.Space, error) {
	const prefix = "[GetWikiSpaceList]"
	// 创建 Client
	client := lark.NewClient(connector.AuthConfig.ClientID, connector.AuthConfig.ClientSecret, lark.WithReqTimeout(time.Second*3))
	// 获取用户所有wiki space
	var wikiSpaces []*larkwiki.Space
	hasMore := true
	pageToken := ""
	pageSize := 50
	for hasMore {
		// 创建请求对象
		req := larkwiki.NewListSpaceReqBuilder().
			PageSize(pageSize).
			PageToken(pageToken).
			Lang("zh").
			Build()
		// 发起请求
		resp, err := client.Wiki.V2.Space.List(ctx, req, larkcore.WithUserAccessToken(userAccessToken))
		if err != nil {
			logs.CtxErrorf(ctx, "%v client.Wiki.V2.Space.List error=%v", prefix, err)
			return nil, err
		}
		// 服务端错误处理
		if !resp.Success() || resp.Data == nil || len(resp.Data.Items) == 0 {
			logs.CtxErrorf(ctx, "%v client.Wiki.V2.Space.List fail,resp=%v", prefix, resp)
			errMsg := fmt.Sprintf("wiki space list fail,code=%v,msg=%v,requestId=%v", resp.Code, resp.Msg, resp.RequestId())
			return nil, errors.New(errMsg)
		}
		// has more
		hasMore = ptr.From(resp.Data.HasMore)
		// page token
		pageToken = ptr.From(resp.Data.PageToken)
		// result
		wikiSpaces = append(wikiSpaces, resp.Data.Items...)
	}
	return wikiSpaces, nil
}

type FeishuWikiSpaceNode struct {
	Space     *larkwiki.Space `json:"space"`      // space信息
	SpaceNode *larkwiki.Node  `json:"space_node"` // space节点
	IsSpace   bool            `json:"is_space"`   // 是否是space首节点
	HasMore   bool            `json:"has_more"`   // 是否有下一页
	PageToken string          `json:"page_token"` // 分页token
}

func GetWikiSpaceNodeListByParam(ctx context.Context, connector *dataconnector.ConnectorConfig, wikiSpace *larkwiki.Space, parentNodeToken string, userAccessToken string) ([]FeishuWikiSpaceNode, error) {
	const prefix = "[GetWikiSpaceNodeListByParam]"
	// result
	var wikiSpaceNodeList []FeishuWikiSpaceNode
	// 创建 Client
	client := lark.NewClient(connector.AuthConfig.ClientID, connector.AuthConfig.ClientSecret, lark.WithReqTimeout(time.Second*3))
	hasMore := true
	pageToken := ""
	pageSize := 50
	for hasMore {
		// 相等则认为是space下的首节点，则不需要传入parentNodeToken
		spaceId := ptr.From(wikiSpace.SpaceId)
		if spaceId == parentNodeToken {
			parentNodeToken = ""
		}
		req := larkwiki.NewListSpaceNodeReqBuilder().
			SpaceId(spaceId).
			PageSize(pageSize).
			PageToken(pageToken).
			ParentNodeToken(parentNodeToken).
			Build()
		// 发起请求
		resp, err := client.Wiki.V2.SpaceNode.List(ctx, req, larkcore.WithUserAccessToken(userAccessToken))
		if err != nil {
			logs.CtxErrorf(ctx, "%v client.Wiki.V2.SpaceNode.List error=%v", prefix, err)
			return nil, err
		}
		// 服务端错误处理
		if !resp.Success() {
			logs.CtxErrorf(ctx, "%v client.Wiki.V2.SpaceNode.List fail,resp=%v", prefix, resp)
			errMsg := fmt.Sprintf("wiki space list fail,code=%v,msg=%v,requestId=%v", resp.Code, resp.Msg, resp.RequestId())
			return nil, errors.New(errMsg)
		}
		// has more
		hasMore = ptr.From(resp.Data.HasMore)
		// page token
		pageToken = ptr.From(resp.Data.PageToken)
		// result
		for _, spaceNode := range resp.Data.Items {
			wikiSpaceNodeList = append(wikiSpaceNodeList, FeishuWikiSpaceNode{
				Space:     wikiSpace,
				SpaceNode: spaceNode,
				IsSpace:   false,
			})
		}
	}

	return wikiSpaceNodeList, nil
}

type QueryMetaParams struct {
	DocToken string `json:"doc_token"`
	DocType  string `json:"doc_type"`
}

func BatchQueryDriveFileMetas(ctx context.Context, authParam FeishuAuthParam, paramList []QueryMetaParams) ([]*larkdrive.Meta, error) {
	const prefix = "[BatchQueryDriveFileMetas]"
	// client
	client := lark.NewClient(authParam.AppId, authParam.AppSecret, lark.WithReqTimeout(time.Second*3))
	// request
	var requestDocs []*larkdrive.RequestDoc
	for _, val := range paramList {
		if val.DocToken == "" || val.DocType == "" {
			continue
		}
		requestDocs = append(requestDocs, larkdrive.NewRequestDocBuilder().DocToken(val.DocToken).DocType(val.DocType).Build())
	}
	resultMetas := make([]*larkdrive.Meta, 0)

	requestTrunks := slices.Chunks(requestDocs, 200)
	for _, docs := range requestTrunks {
		req := larkdrive.NewBatchQueryMetaReqBuilder().
			MetaRequest(larkdrive.NewMetaRequestBuilder().RequestDocs(docs).WithUrl(true).Build()).
			Build()
		logs.CtxInfof(ctx, "%v authParam:%v paramList:%v", prefix, authParam, paramList)
		// 发起请求
		resp, err := client.Drive.Meta.BatchQuery(ctx, req, larkcore.WithUserAccessToken(authParam.UserAccessToken))
		if err != nil {
			logs.CtxErrorf(ctx, "%v client.Drive.Meta.BatchQuery error=%v", prefix, err)
			continue
		}
		logs.CtxInfof(ctx, "%v response:%v", prefix, larkcore.Prettify(resp))
		// 服务端错误处理
		if !resp.Success() {
			logs.CtxErrorf(ctx, "%v not success,code:%v msg:%v request_id:%v", prefix, resp.Code, resp.Msg, resp.RequestId())
			continue
		}
		if resp.Data == nil {
			continue
		}
		resultMetas = append(resultMetas, resp.Data.Metas...)
	}
	return resultMetas, nil
}
