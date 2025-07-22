package service

import (
	"context"
	"encoding/base64"
	"net/url"
	"strconv"

	"github.com/coze-dev/coze-studio/backend/infra/contract/document/dataconnector"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (k *knowledgeSVC) MGetAuthInfo(ctx context.Context, request *MGetAuthInfoRequest) (*MGetAuthInfoResponse, error) {
	resp := &MGetAuthInfoResponse{}
	resp.AuthMap = map[string][]*dataconnector.AuthInfo{}
	for _, cid := range request.ConnectorIDs {
		fetcher, err := k.dataConnectorManager.Get(dataconnector.ConnectorID(cid))
		if err != nil {
			return nil, errorx.New(errno.ErrKnowledgeFetcherNotFoundCode, errorx.KV("msg", err.Error()))
		}
		authInfo, err := fetcher.GetAuthInfo(ctx, request.CreatorID)
		if err != nil {
			return nil, errorx.New(errno.ErrKnowledgeGetAuthInfoFailCode, errorx.KV("msg", err.Error()))
		}
		resp.AuthMap[strconv.FormatInt(cid, 10)] = authInfo
	}
	return resp, nil
}

type state struct {
	ConnectorID int64
	CreatorID   int64
	RedirectURI string
}

func (k *knowledgeSVC) GetAuthConsentURL(ctx context.Context, request *GetAuthConsentURLRequest) (*GetAuthConsentURLResponse, error) {
	resp := &GetAuthConsentURLResponse{}
	fetcher, err := k.dataConnectorManager.Get(dataconnector.ConnectorID(request.ConnectorID))
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeFetcherNotFoundCode, errorx.KV("msg", err.Error()))
	}
	consentURL, err := fetcher.GetConsentURL(ctx)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeGetAuthConsentURLFailCode, errorx.KV("msg", err.Error()))
	}
	byteData, err := sonic.Marshal(&state{
		ConnectorID: request.ConnectorID,
		CreatorID:   request.CreatorID,
		RedirectURI: request.RedirectURI,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "marshal state fail, err=%v", err)
		return nil, errorx.New(errno.ErrKnowledgeParseJSONCode, errorx.KV("msg", err.Error()))
	}
	stateVal := base64.RawURLEncoding.EncodeToString(byteData)
	urlInfo, err := url.Parse(consentURL)
	if err != nil {
		logs.CtxErrorf(ctx, "parse consent url fail, err=%v", err)
		return nil, errorx.New(errno.ErrKnowledgeSystemCode, errorx.KV("msg", err.Error()))
	}
	query := urlInfo.Query()
	redirectURI := query.Get("redirect_uri")
	parsedRedirectURI, err := url.Parse(redirectURI)
	if err != nil {
		logs.CtxErrorf(ctx, "parse redirect uri fail, err=%v", err)
		return nil, errorx.New(errno.ErrKnowledgeSystemCode, errorx.KV("msg", err.Error()))
	}
	redirectQueryParams := parsedRedirectURI.Query()
	redirectQueryParams.Set("state", stateVal)
	parsedRedirectURI.RawQuery = redirectQueryParams.Encode()
	query.Set("redirect_uri", parsedRedirectURI.String())
	urlInfo.RawQuery = query.Encode()
	resp.ConsentURL = urlInfo.String()
	return resp, nil
}

func (k *knowledgeSVC) DataSourceOAuthComplete(ctx context.Context, request *DataSourceOAuthCompleteRequest) (*DataSourceOAuthCompleteResponse, error) {
	resp := &DataSourceOAuthCompleteResponse{}
	stateByteData, err := base64.RawURLEncoding.DecodeString(string(request.State))
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeSystemCode, errorx.KV("msg", err.Error()))
	}
	stateVal := state{}
	err = sonic.Unmarshal(stateByteData, &stateVal)
	if err != nil {
		logs.CtxErrorf(ctx, "unmarshal state fail, err=%v", err)
		return nil, errorx.New(errno.ErrKnowledgeParseJSONCode, errorx.KV("msg", err.Error()))
	}
	fetcher, err := k.dataConnectorManager.Get(dataconnector.ConnectorID(stateVal.ConnectorID))
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeFetcherNotFoundCode, errorx.KV("msg", err.Error()))
	}
	err = fetcher.AuthorizeCode(ctx, stateVal.CreatorID, request.Code)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeAuthorizeCodeFailCode, errorx.KV("msg", err.Error()))
	}
	resp.RedirectURL = stateVal.RedirectURI
	resp.StatusCode = 301
	return resp, nil
}

func (k *knowledgeSVC) DataConnectorSearchFile(ctx context.Context, request *DataConnectorSearchFileRequest) (*DataConnectorSearchFileResponse, error) {
	resp := &DataConnectorSearchFileResponse{}
	fetcher, err := k.dataConnectorManager.GetByAuthID(ctx, request.SearchRequest.AuthID)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeFetcherNotFoundCode, errorx.KV("msg", err.Error()))
	}
	domainResp, err := fetcher.SearchFile(ctx, request.SearchRequest)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeSearchFileFailCode, errorx.KV("msg", err.Error()))
	}
	resp.SearchResponse = &dataconnector.SearchFileResponse{
		FileList:  domainResp.FileList,
		HasMore:   domainResp.HasMore,
		PageToken: domainResp.PageToken,
		Total:     domainResp.Total,
		Offset:    domainResp.Offset,
	}
	return resp, nil
}
