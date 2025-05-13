package singleagent

import (
	"context"
	"strings"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/developer_api"
)

func (s *SingleAgentApplicationService) GetUploadAuthToken(ctx context.Context, req *developer_api.GetUploadAuthTokenRequest) (*developer_api.GetUploadAuthTokenResponse, error) {
	prefix := s.getUploadPrefix(req.Scene, req.DataType)
	authToken, err := s.dependencies.ImageX.GetUploadAuth(ctx)
	if err != nil {
		return nil, err
	}

	return &developer_api.GetUploadAuthTokenResponse{
		Data: &developer_api.GetUploadAuthTokenData{
			ServiceID:        s.dependencies.ImageX.GetServerID(),
			UploadPathPrefix: prefix,
			UploadHost:       s.dependencies.ImageX.GetUploadHost(),
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
