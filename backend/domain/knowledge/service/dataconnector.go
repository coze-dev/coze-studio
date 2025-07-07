package service

import (
	"context"
	"strconv"

	"github.com/coze-dev/coze-studio/backend/infra/contract/document/dataconnector"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
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
	resp.ConsentURL = consentURL
	return resp, nil
}
