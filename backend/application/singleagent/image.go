/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package singleagent

import (
	"context"
	"strings"

	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
	"github.com/coze-dev/coze-studio/backend/api/model/playground"
)

func (s *SingleAgentApplicationService) GetUploadAuthToken(ctx context.Context, req *developer_api.GetUploadAuthTokenRequest) (*developer_api.GetUploadAuthTokenResponse, error) {

	authToken, err := s.getAuthToken(ctx)
	if err != nil {
		return nil, err
	}

	prefix := s.getUploadPrefix(req.Scene, req.DataType)

	return &developer_api.GetUploadAuthTokenResponse{
		Data: &developer_api.GetUploadAuthTokenData{
			ServiceID:        authToken.ServiceID,
			UploadPathPrefix: prefix,
			UploadHost:       authToken.UploadHost,
			Auth: &developer_api.UploadAuthTokenInfo{
				AccessKeyID:     authToken.AccessKeyID,
				SecretAccessKey: authToken.SecretAccessKey,
				SessionToken:    authToken.SessionToken,
				ExpiredTime:     authToken.ExpiredTime,
				CurrentTime:     authToken.CurrentTime,
			},
			Schema: authToken.HostScheme,
		},
	}, nil
}
func (s *SingleAgentApplicationService) getAuthToken(ctx context.Context) (*bot_common.AuthToken, error) {
	uploadAuthToken, err := s.appContext.ImageX.GetUploadAuth(ctx)
	if err != nil {
		return nil, err
	}
	authToken := &bot_common.AuthToken{
		ServiceID:       s.appContext.ImageX.GetServerID(),
		AccessKeyID:     uploadAuthToken.AccessKeyID,
		SecretAccessKey: uploadAuthToken.SecretAccessKey,
		SessionToken:    uploadAuthToken.SessionToken,
		ExpiredTime:     uploadAuthToken.ExpiredTime,
		CurrentTime:     uploadAuthToken.CurrentTime,
		UploadHost:      s.appContext.ImageX.GetUploadHost(ctx),
		HostScheme:      uploadAuthToken.HostScheme,
	}
	return authToken, nil
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
