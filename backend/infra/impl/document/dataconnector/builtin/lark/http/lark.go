package http

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/coze-dev/coze-studio/backend/infra/contract/document/dataconnector"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	lark "github.com/larksuite/oapi-sdk-go/v3"
	larkcore "github.com/larksuite/oapi-sdk-go/v3/core"
	larkauthen "github.com/larksuite/oapi-sdk-go/v3/service/authen/v1"
	larkdocx "github.com/larksuite/oapi-sdk-go/v3/service/docx/v1"
	larkdrive "github.com/larksuite/oapi-sdk-go/v3/service/drive/v1"
	larkdrive2 "github.com/larksuite/oapi-sdk-go/v3/service/drive/v2"
	larksheets "github.com/larksuite/oapi-sdk-go/v3/service/sheets/v3"
)

const (
	GetDriveFileListPerSize = 200
)

type SearchFeishuFileResponse struct {
	Code int `json:"code"`
	Data struct {
		DocsEntities []struct {
			DocsToken string `json:"docs_token"`
			DocsType  string `json:"docs_type"`
			OwnerId   string `json:"owner_id"`
			Title     string `json:"title"`
		} `json:"docs_entities"`
		HasMore bool `json:"has_more"`
		Total   int  `json:"total"`
	} `json:"data"`
	Msg string `json:"msg"`
}

type SearchFeishuFileParams struct {
	ConnectorConfig *dataconnector.ConnectorConfig
	AccessToken     string
	SearchQuery     string
	DocsTypes       []string
}

func SearchFeishuFiles(ctx context.Context, params SearchFeishuFileParams) ([]*larkdrive.File, error) {
	const prefix = "[SearchFeishuFiles]"
	// 创建 API Client
	client := lark.NewClient(params.ConnectorConfig.AuthConfig.ClientID, params.ConnectorConfig.AuthConfig.ClientSecret,
		lark.WithReqTimeout(time.Second*30), lark.WithLogLevel(larkcore.LogLevelDebug), lark.WithLogReqAtDebug(true))
	var searchFileList []*larkdrive.File
	hasMore := true
	count := 50
	offset := 0
	searchKey := params.SearchQuery
	docsTypes := params.DocsTypes
	accessToken := params.AccessToken
	for hasMore {
		apiPath := params.ConnectorConfig.BaseOpenURL + "/open-apis/suite/docs-api/search/object" // api path
		body := map[string]interface{}{}                                                          // body
		body["search_key"] = searchKey
		body["count"] = count
		body["offset"] = offset
		body["docs_types"] = docsTypes
		resp, err := client.Do(ctx, &larkcore.ApiReq{
			HttpMethod:                http.MethodPost,
			ApiPath:                   apiPath,
			Body:                      body,
			QueryParams:               nil,
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
			errMsg := fmt.Sprintf("file search fail,resp=%v", resp)
			return nil, errors.New(errMsg)
		}
		// response
		searchResp := &SearchFeishuFileResponse{}
		err = resp.JSONUnmarshalBody(searchResp, &larkcore.Config{
			Serializable: &larkcore.DefaultSerialization{},
		})
		if err != nil {
			logs.CtxErrorf(ctx, "%v resp.JSONUnmarshalBody error, searchResp=%v, error=%v", prefix, resp, err)
			return nil, err
		}
		if searchResp == nil || len(searchResp.Data.DocsEntities) == 0 {
			logs.CtxErrorf(ctx, "%v searchResp is nil, searchResp=%v", prefix, searchResp)
			break
		}
		hasMore = searchResp.Data.HasMore // has more
		if !hasMore || len(searchResp.Data.DocsEntities) < count {
			hasMore = false
		}
		offset += count                                     // offset
		for _, file := range searchResp.Data.DocsEntities { // searchFileList
			token := file.DocsToken
			name := file.Title
			fileType := file.DocsType
			ownerID := file.OwnerId
			searchFileList = append(searchFileList, &larkdrive.File{
				Token:   &token,
				Name:    &name,
				Type:    &fileType,
				OwnerId: &ownerID,
			})
		}
	}
	return searchFileList, nil
}

type FeishuAuthParam struct {
	AppId           string
	AppSecret       string
	UserAccessToken string
	BaseUrl         string
}

// GetWebUserAccessToken 获取网页应用登陆用户的user_access_token
// https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/authen-v1/oidc-access_token/create?appId=cli_a538d651e13cd00c
func GetWebUserAccessToken(ctx context.Context, authParam FeishuAuthParam, code string) (*larkauthen.CreateOidcAccessTokenRespData, error) {
	client := lark.NewClient(authParam.AppId, authParam.AppSecret, lark.WithReqTimeout(time.Second*3))
	req := larkauthen.NewCreateOidcAccessTokenReqBuilder().
		Body(larkauthen.NewCreateOidcAccessTokenReqBodyBuilder().
			GrantType(`authorization_code`).
			Code(code).
			Build()).
		Build()
	logs.CtxInfof(ctx, "GetUserAccessToken authParam:%v code:%v", authParam, code)

	// 发起请求
	resp, err := client.Authen.OidcAccessToken.Create(ctx, req)
	if err != nil {
		return nil, err
	}
	logs.CtxInfof(ctx, "GetUserAccessToken response:%v", larkcore.Prettify(resp))
	// 服务端错误处理
	if !resp.Success() {
		logs.CtxErrorf(ctx, "GetUserAccessToken not success,code:%v msg:%v request_id:%v", resp.Code, resp.Msg, resp.RequestId())
		return nil, errors.New(resp.Msg)
	}
	if resp.Data == nil || resp.Data.AccessToken == nil {
		logs.CtxErrorf(ctx, "GetUserAccessToken response data or access_token is nil")
		return nil, errors.New(resp.Msg)
	}
	return resp.Data, nil
}

func RefreshAccessToken(ctx context.Context, authParam FeishuAuthParam, refreshToken string) (*larkauthen.CreateOidcRefreshAccessTokenRespData, error) {
	client := lark.NewClient(authParam.AppId, authParam.AppSecret, lark.WithReqTimeout(time.Second*3))
	req := larkauthen.NewCreateOidcRefreshAccessTokenReqBuilder().
		Body(larkauthen.NewCreateOidcRefreshAccessTokenReqBodyBuilder().
			GrantType(`refresh_token`).
			RefreshToken(refreshToken).
			Build()).
		Build()
	logs.CtxInfof(ctx, "RefreshAccessToken authParam:%v refresh_token:%v", authParam, refreshToken)
	// 发起请求
	resp, err := client.Authen.OidcRefreshAccessToken.Create(ctx, req, larkcore.WithUserAccessToken(refreshToken))
	if err != nil {
		return nil, err
	}
	logs.CtxInfof(ctx, "RefreshAccessToken response:%v", larkcore.Prettify(resp))
	// 服务端错误处理
	if !resp.Success() {
		logs.CtxErrorf(ctx, "RefreshAccessToken not success,code:%v msg:%v request_id:%v", resp.Code, resp.Msg, resp.RequestId())
		return nil, DealLarkError(ctx, resp.Code, resp.Msg, resp.RequestId())
	}
	if resp.Data == nil || resp.Data.AccessToken == nil {
		logs.CtxErrorf(ctx, "RefreshAccessToken response data or access_token is nil")
		return nil, errors.New(resp.Msg)
	}
	return resp.Data, nil
}

func GetUserInfo(ctx context.Context, authParam FeishuAuthParam) (*larkauthen.GetUserInfoRespData, error) {

	client := lark.NewClient(authParam.AppId, authParam.AppSecret, lark.WithReqTimeout(time.Second*3))
	logs.CtxInfof(ctx, "GetUserInfo authParam:%v", authParam)
	resp, err := client.Authen.UserInfo.Get(ctx, larkcore.WithUserAccessToken(authParam.UserAccessToken))
	if err != nil {
		return nil, err
	}
	logs.CtxInfof(ctx, "GetUserInfo response:%v", larkcore.Prettify(resp))
	// 服务端错误处理
	if !resp.Success() {
		logs.CtxErrorf(ctx, "GetUserInfo not success,code:%v msg:%v request_id:%v", resp.Code, resp.Msg, resp.RequestId())
		return nil, errors.New(resp.Msg)
	}
	if resp.Data == nil {
		logs.CtxErrorf(ctx, "GetUserInfo response data is nil")
		return nil, errors.New(resp.Msg)
	}
	return resp.Data, nil
}

func GetDriveFileListByParam(ctx context.Context, authParam FeishuAuthParam, parentFileID *string) ([]*larkdrive.File, error) {
	const prefix = "[GetDriveFileListByParam]"
	var driveFileList []*larkdrive.File

	hasMore := true
	pageSize := 200
	nextPageToken := ""
	// client and request
	client := lark.NewClient(authParam.AppId, authParam.AppSecret, lark.WithReqTimeout(time.Second*3))
	for hasMore {
		// request
		req := larkdrive.NewListFileReqBuilder().
			PageSize(pageSize).
			FolderToken(ptr.From(parentFileID)).
			PageToken(nextPageToken).
			Build()
		logs.CtxInfof(ctx, "%v GetDriveFileList req: %v", prefix, larkcore.Prettify(req))
		resp, err := client.Drive.File.List(ctx, req, larkcore.WithUserAccessToken(authParam.UserAccessToken))
		if err != nil {
			return nil, err
		}
		if resp == nil {
			return nil, errors.New("resp is nil")
		}
		logs.CtxInfof(ctx, "%v GetDriveFileList response:%v", prefix, larkcore.Prettify(resp))
		// 服务端错误处理
		if !resp.Success() {
			logs.CtxErrorf(ctx, "%v GetDriveFileList not success,code:%v msg:%v request_id:%v", prefix, resp.Code, resp.Msg, resp.RequestId())
			return nil, errors.New(resp.Msg)
		}
		// result
		driveFileList = append(driveFileList, resp.Data.Files...)
		hasMore = ptr.From(resp.Data.HasMore)
		nextPageToken = ptr.From(resp.Data.NextPageToken)
	}

	return driveFileList, nil
}

func GetDriveFileList(ctx context.Context, authParam FeishuAuthParam, parentFileID *string) ([]*larkdrive.File, error) {
	var apiCallNum int
	var driveFileList []*larkdrive.File

	client := lark.NewClient(authParam.AppId, authParam.AppSecret, lark.WithReqTimeout(time.Second*3))
	hasMore := true
	var pageToken string
	for hasMore {
		apiCallNum++
		reqBuilder := larkdrive.NewListFileReqBuilder().
			PageSize(GetDriveFileListPerSize)
		var folderToken string
		if parentFileID != nil {
			folderToken = *parentFileID
			reqBuilder = reqBuilder.FolderToken(folderToken)
		}
		if pageToken != "" {
			reqBuilder = reqBuilder.PageToken(pageToken)
		}
		req := reqBuilder.Build()
		logs.CtxInfof(ctx, "GetDriveFileList authParam:%v folderToken:%v pageToken:%v", authParam, folderToken, pageToken)
		resp, err := client.Drive.File.List(ctx, req, larkcore.WithUserAccessToken(authParam.UserAccessToken))
		if err != nil {
			return nil, err
		}
		logs.CtxInfof(ctx, "GetDriveFileList response:%v", larkcore.Prettify(resp))
		// 服务端错误处理
		if !resp.Success() {
			logs.CtxErrorf(ctx, "GetDriveFileList not success,code:%v msg:%v request_id:%v", resp.Code, resp.Msg, resp.RequestId())
			return nil, errors.New(resp.Msg)
		}
		if resp.Data == nil {
			break
		}
		hasMore = resp.Data.HasMore != nil && *resp.Data.HasMore
		if resp.Data.NextPageToken != nil {
			pageToken = *resp.Data.NextPageToken
		}
		driveFileList = append(driveFileList, resp.Data.Files...)
	}
	return driveFileList, nil
}

// GetFeishuFilePermissionPublic 获取云文档权限设置
func GetFeishuFilePermissionPublic(ctx context.Context, authParam FeishuAuthParam, fileToken string, fileType string) (*larkdrive2.PermissionPublic, error) {
	const prefix = "GetFeishuFilePermissionPublic"

	client := lark.NewClient(authParam.AppId, authParam.AppSecret, lark.WithReqTimeout(time.Second*3))
	req := larkdrive2.NewGetPermissionPublicReqBuilder().
		Token(fileToken).
		Type(fileType).
		Build()
	logs.CtxInfof(ctx, "GetFeishuFilePermissionPublic authParam:%v fileToken:%v fileType:%v", authParam, fileToken, fileType)
	// 发起请求
	resp, err := client.Drive.V2.PermissionPublic.Get(ctx, req, larkcore.WithUserAccessToken(authParam.UserAccessToken))
	if err != nil {
		return nil, err
	}
	logs.CtxInfof(ctx, "GetFeishuFilePermissionPublic fileToken:%v fileType:%v response:%v", fileToken, fileType, larkcore.Prettify(resp))
	// 服务端错误处理
	if !resp.Success() {
		return nil, errors.New(resp.Msg)
	}
	if resp.Data == nil {
		return nil, nil
	}
	return resp.Data.PermissionPublic, nil
}

func BatchGetFeishuFileMeta(ctx context.Context, authParam FeishuAuthParam, fileInfoMap map[string][]string) ([]*larkdrive.Meta, error) {

	client := lark.NewClient(authParam.AppId, authParam.AppSecret, lark.WithReqTimeout(time.Second*3))
	var requestDocs []*larkdrive.RequestDoc
	for docType, docTokenList := range fileInfoMap {
		for _, docToken := range docTokenList {
			requestDocs = append(requestDocs, larkdrive.NewRequestDocBuilder().DocToken(docToken).DocType(docType).Build())
		}
	}
	req := larkdrive.NewBatchQueryMetaReqBuilder().
		MetaRequest(larkdrive.NewMetaRequestBuilder().
			RequestDocs(requestDocs).
			WithUrl(false).
			Build()).
		Build()
	logs.CtxInfof(ctx, "BatchGetFeishuFileMeta authParam:%v fileInfoMap:%v", authParam, fileInfoMap)
	// 发起请求
	resp, err := client.Drive.Meta.BatchQuery(ctx, req, larkcore.WithUserAccessToken(authParam.UserAccessToken))
	if err != nil {
		return nil, err
	}
	logs.CtxInfof(ctx, "BatchGetFeishuFileMeta response:%v", larkcore.Prettify(resp))
	// 服务端错误处理
	if !resp.Success() {
		logs.CtxErrorf(ctx, "BatchGetFeishuFileMeta not success,code:%v msg:%v request_id:%v", resp.Code, resp.Msg, resp.RequestId())
		return nil, errors.New(resp.Msg)
	}
	if resp.Data == nil {
		return nil, nil
	}
	return resp.Data.Metas, nil
}

func RetrieveDocxBlockList(ctx context.Context, authParam FeishuAuthParam, docID string) ([]*larkdocx.Block, error) {
	var blockList []*larkdocx.Block

	client := lark.NewClient(authParam.AppId, authParam.AppSecret, lark.WithOpenBaseUrl(authParam.BaseUrl), lark.WithReqTimeout(30*time.Second))
	hasMore := true
	var pageToken string

	for hasMore {
		reqBuilder := larkdocx.NewListDocumentBlockReqBuilder().
			PageSize(500).
			DocumentId(docID).
			DocumentRevisionId(-1)
		if pageToken != "" {
			reqBuilder = reqBuilder.PageToken(pageToken)
		}
		req := reqBuilder.Build()
		logs.CtxInfof(ctx, "RetrieveDocxBlockList LarkBaseOpenURL:%v authParam:%v docID:%v pageToken:%v", authParam.BaseUrl, authParam, docID, pageToken)

		resp, err := client.Docx.DocumentBlock.List(ctx, req, larkcore.WithUserAccessToken(authParam.UserAccessToken))
		if err != nil {
			return nil, err
		}
		logs.CtxInfof(ctx, "RetrieveDocxBlockList response:%v", larkcore.Prettify(resp))
		// 服务端错误处理
		if !resp.Success() {
			logs.CtxErrorf(ctx, "RetrieveDocxBlockList not success,code:%v msg:%v request_id:%v", resp.Code, resp.Msg, resp.RequestId())
			return nil, DealLarkError(ctx, resp.Code, resp.Msg, resp.RequestId())
		}
		if resp.Data == nil {
			break
		}
		hasMore = resp.Data.HasMore != nil && *resp.Data.HasMore
		if resp.Data.PageToken != nil {
			pageToken = *resp.Data.PageToken
		}
		blockList = append(blockList, resp.Data.Items...)
	}
	return blockList, nil
}

func DownloadMedia(ctx context.Context, authParam FeishuAuthParam, fileToken string) (string, []byte, error) {

	client := lark.NewClient(authParam.AppId, authParam.AppSecret, lark.WithOpenBaseUrl(authParam.BaseUrl), lark.WithReqTimeout(15*time.Second))
	req := larkdrive.NewDownloadMediaReqBuilder().
		FileToken(fileToken).
		Build()
	logs.CtxInfof(ctx, "DownloadMedia authParam:%v fileToken:%v", authParam, fileToken)

	resp, err := client.Drive.Media.Download(ctx, req, larkcore.WithUserAccessToken(authParam.UserAccessToken))
	if err != nil {
		return "", nil, err
	}
	logs.CtxInfof(ctx, "DownloadMedia response:%v", larkcore.Prettify(resp))
	if !resp.Success() {
		logs.CtxErrorf(ctx, "DownloadMedia not success,code:%v msg:%v request_id:%v", resp.Code, resp.Msg, resp.RequestId())
		return "", nil, DealLarkError(ctx, resp.Code, resp.Msg, resp.RequestId())
	}

	fileContent, err := io.ReadAll(resp.File)
	if err != nil {
		return "", nil, err
	}
	return resp.FileName, fileContent, nil
}

// GetSheetList https://open.feishu.cn/document/server-docs/docs/sheets-v3/data-operation/reading-multiple-ranges
func GetSheetList(ctx context.Context, authParam FeishuAuthParam, spreadsheetToken string) ([]*larksheets.Sheet, error) {
	client := lark.NewClient(authParam.AppId, authParam.AppSecret, lark.WithOpenBaseUrl(authParam.BaseUrl), lark.WithReqTimeout(time.Second*3))
	// 创建请求对象
	req := larksheets.NewQuerySpreadsheetSheetReqBuilder().
		SpreadsheetToken(spreadsheetToken).
		Build()
	logs.CtxInfof(ctx, "GetSheetList requestURL:%v authParam:%v spreadsheetToken:%v", authParam.BaseUrl, authParam, spreadsheetToken)
	// 发起请求
	resp, err := client.Sheets.SpreadsheetSheet.Query(ctx, req, larkcore.WithUserAccessToken(authParam.UserAccessToken))
	// 处理错误
	if err != nil {
		return nil, err
	}
	logs.CtxInfof(ctx, "GetSheetList response:%v", larkcore.Prettify(resp))
	// 服务端错误处理
	if !resp.Success() {
		logs.CtxErrorf(ctx, "GetSheetList not success,code:%v msg:%v request_id:%v", resp.Code, resp.Msg, resp.RequestId())
		return nil, DealLarkError(ctx, resp.Code, resp.Msg, resp.RequestId())
	}
	if resp.Data == nil {
		logs.CtxErrorf(ctx, "GetSheetList response data is nil")
		return nil, errors.New("GetUserAccessToken response data is nil")
	}
	return resp.Data.Sheets, nil
}

type RawBody struct {
	Code int `json:"code"`
	Data struct {
		ValueRanges []struct {
			Range  string          `json:"range"`
			Values [][]interface{} `json:"values"`
		} `json:"valueRanges"`
	} `json:"data"`
	Msg string `json:"msg"`
}

func ReadLarkSheet(ctx context.Context, authParam FeishuAuthParam, spreadsheetToken string, ranges []string) (map[string][][]interface{}, error) {
	client := lark.NewClient(authParam.AppId, authParam.AppSecret, lark.WithReqTimeout(time.Second*3))

	// 发起请求
	httpPath := fmt.Sprintf("/open-apis/sheets/v2/spreadsheets/%s/values_batch_get?ranges=%s&valueRenderOption=FormattedValue", spreadsheetToken, strings.Join(ranges, ","))
	logs.CtxInfof(ctx, "ReadLarkSheet authParam:%v httpPath:%v", authParam, httpPath)
	resp, err := client.Get(ctx,
		httpPath,
		nil,
		larkcore.AccessTokenTypeUser,
		larkcore.WithUserAccessToken(authParam.UserAccessToken))
	// 错误处理
	if err != nil {
		logs.CtxErrorf(ctx, "ReadLarkSheet err:%v", err)
		return nil, err
	}
	rawBody := &RawBody{}
	err = sonic.Unmarshal(resp.RawBody, rawBody)
	if err != nil {
		logs.CtxErrorf(ctx, "ReadLarkSheet sonic.Unmarshal body err:%v", err)
		return nil, err
	}
	logs.CtxInfof(ctx, "ReadLarkSheet response:%v rawBody:%v", larkcore.Prettify(resp), larkcore.Prettify(rawBody))
	if rawBody.Code != 0 {
		logs.CtxErrorf(ctx, "ReadLarkSheet not success,code:%v msg:%v request_id:%v", rawBody.Code, rawBody.Msg, resp.RequestId())
		return nil, DealLarkError(ctx, rawBody.Code, rawBody.Msg, resp.RequestId())
	}
	valueRanges := make(map[string][][]interface{})
	for _, rangeInfo := range rawBody.Data.ValueRanges {
		valueRanges[rangeInfo.Range] = rangeInfo.Values
	}
	return valueRanges, nil
}

const (
	LarkErrorCodeMethodRateLimited  = 1000004
	LarkErrorCodeAppRateLimited     = 1000005
	LarkErrorCodeInvalidToken       = 4001
	LarkErrorCodeInvalidAccessToken = 20005
)

func DealLarkError(ctx context.Context, code int, msg string, requestID string) error {
	switch code {
	case LarkErrorCodeMethodRateLimited, LarkErrorCodeAppRateLimited:
		return fmt.Errorf("rate limit,code:%v msg:%v request_id:%v", code, msg, requestID)
	case LarkErrorCodeInvalidToken, LarkErrorCodeInvalidAccessToken:
		return fmt.Errorf("non-retry,code:%v msg:%v request_id:%v", code, msg, requestID)
	default:
		return fmt.Errorf("system error,code:%v msg:%v request_id:%v", code, msg, requestID)
	}
}
