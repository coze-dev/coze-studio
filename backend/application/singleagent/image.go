package singleagent

import (
	"context"
	"strings"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/developer_api"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/playground"
)

func (s *SingleAgentApplicationService) GetUploadAuthToken(ctx context.Context, req *developer_api.GetUploadAuthTokenRequest) (*developer_api.GetUploadAuthTokenResponse, error) {
	prefix := s.getUploadPrefix(req.Scene, req.DataType)
	authToken, err := s.appContext.ImageX.GetUploadAuth(ctx)
	if err != nil {
		return nil, err
	}

	return &developer_api.GetUploadAuthTokenResponse{
		Data: &developer_api.GetUploadAuthTokenData{
			ServiceID:        s.appContext.ImageX.GetServerID(),
			UploadPathPrefix: prefix,
			UploadHost:       s.appContext.ImageX.GetUploadHost(),
			Auth: &developer_api.UploadAuthTokenInfo{
				AccessKeyID:     authToken.AccessKeyID,
				SecretAccessKey: authToken.SecretAccessKey,
				SessionToken:    authToken.SessionToken,
				ExpiredTime:     authToken.ExpiredTime,
				CurrentTime:     authToken.CurrentTime,
			},
		},
	}, nil
}

func (s *SingleAgentApplicationService) getUploadPrefix(scene, dataType string) string {
	return strings.Replace(scene, "_", "-", -1) + "-" + dataType
}

func (s *SingleAgentApplicationService) GetImagexShortUrl(ctx context.Context, req *playground.GetImagexShortUrlRequest) (*playground.GetImagexShortUrlResponse, error) {
	urlInfo := make(map[string]*playground.UrlInfo, len(req.Uris))
	for _, uri := range req.Uris {
		resURL, err := s.appContext.ImageX.GetResourceURL(ctx, uri)
		if err != nil {
			return nil, err
		}

		urlInfo[uri] = &playground.UrlInfo{
			URL:          resURL.URL,
			ReviewStatus: true,
		}
	}

	return &playground.GetImagexShortUrlResponse{
		Data: &playground.GetImagexShortUrlData{
			URLInfo: urlInfo,
		},
	}, nil
}
