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

package plugin

import (
	"context"
	"encoding/json"
	"net/url"
	"os"

	botOpenAPI "github.com/coze-dev/coze-studio/backend/api/model/app/bot_open_api"
	developerAPI "github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
	pluginAPI "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop"
	common "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	pluginConf "github.com/coze-dev/coze-studio/backend/domain/plugin/conf"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/dto"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/encrypt"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (p *PluginApplicationService) GetOAuthSchema(ctx context.Context, req *pluginAPI.GetOAuthSchemaRequest) (resp *pluginAPI.GetOAuthSchemaResponse, err error) {
	return &pluginAPI.GetOAuthSchemaResponse{
		OauthSchema: pluginConf.GetOAuthSchema(),
	}, nil
}

func (p *PluginApplicationService) GetOAuthStatus(ctx context.Context, req *pluginAPI.GetOAuthStatusRequest) (resp *pluginAPI.GetOAuthStatusResponse, err error) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrPluginPermissionCode, errorx.KV(errno.PluginMsgKey, "session is required"))
	}

	res, err := p.DomainSVC.GetOAuthStatus(ctx, *userID, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetOAuthStatus failed, pluginID=%d", req.PluginID)
	}
	resp = &pluginAPI.GetOAuthStatusResponse{
		IsOauth: res.IsOauth,
		Status:  res.Status,
		Content: res.OAuthURL,
	}

	return resp, nil
}

func (p *PluginApplicationService) OauthAuthorizationCode(ctx context.Context, req *botOpenAPI.OauthAuthorizationCodeReq) (resp *botOpenAPI.OauthAuthorizationCodeResp, err error) {
	stateStr, err := url.QueryUnescape(req.State)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "invalid state"))
	}

	secret := os.Getenv(encrypt.StateSecretEnv)
	if secret == "" {
		secret = encrypt.DefaultStateSecret
	}

	stateBytes, err := encrypt.DecryptByAES(stateStr, secret)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "invalid state"))
	}

	state := &dto.OAuthState{}
	err = json.Unmarshal(stateBytes, state)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "invalid state"))
	}

	err = p.DomainSVC.OAuthCode(ctx, req.Code, state)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "authorize failed"))
	}

	resp = &botOpenAPI.OauthAuthorizationCodeResp{}

	return resp, nil
}

func (p *PluginApplicationService) GetQueriedOAuthPluginList(ctx context.Context, req *pluginAPI.GetQueriedOAuthPluginListRequest) (resp *pluginAPI.GetQueriedOAuthPluginListResponse, err error) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrPluginPermissionCode, errorx.KV(errno.PluginMsgKey, "session is required"))
	}

	status, err := p.DomainSVC.GetAgentPluginsOAuthStatus(ctx, *userID, req.BotID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetAgentPluginsOAuthStatus failed, userID=%d, agentID=%d", *userID, req.BotID)
	}

	if len(status) == 0 {
		return &pluginAPI.GetQueriedOAuthPluginListResponse{
			OauthPluginList: []*pluginAPI.OAuthPluginInfo{},
		}, nil
	}

	oauthPluginList := make([]*pluginAPI.OAuthPluginInfo, 0, len(status))
	for _, s := range status {
		oauthPluginList = append(oauthPluginList, &pluginAPI.OAuthPluginInfo{
			PluginID:   s.PluginID,
			Status:     s.Status,
			Name:       s.PluginName,
			PluginIcon: s.PluginIconURL,
		})
	}

	resp = &pluginAPI.GetQueriedOAuthPluginListResponse{
		OauthPluginList: oauthPluginList,
	}

	return resp, nil
}

func (p *PluginApplicationService) RevokeAuthToken(ctx context.Context, req *pluginAPI.RevokeAuthTokenRequest) (resp *pluginAPI.RevokeAuthTokenResponse, err error) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrPluginPermissionCode, errorx.KV(errno.PluginMsgKey, "session is required"))
	}

	err = p.DomainSVC.RevokeAccessToken(ctx, &dto.AuthorizationCodeMeta{
		UserID:   conv.Int64ToStr(*userID),
		PluginID: req.PluginID,
		IsDraft:  req.GetBotID() == 0,
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "RevokeAccessToken failed, pluginID=%d", req.PluginID)
	}

	resp = &pluginAPI.RevokeAuthTokenResponse{}

	return resp, nil
}

func (p *PluginApplicationService) GetUserAuthority(ctx context.Context, req *pluginAPI.GetUserAuthorityRequest) (resp *pluginAPI.GetUserAuthorityResponse, err error) {
	resp = &pluginAPI.GetUserAuthorityResponse{
		Data: &common.GetUserAuthorityData{
			CanEdit:          true,
			CanRead:          true,
			CanDelete:        true,
			CanDebug:         true,
			CanPublish:       true,
			CanReadChangelog: true,
		},
	}

	return resp, nil
}

// PluginOauthAuthorizationCode handles the OAuth provider callback in the two-step confirmation flow.
// It validates the state, stores a temporary confirm_code, and returns it for redirect.
func (p *PluginApplicationService) PluginOauthAuthorizationCode(ctx context.Context, req *developerAPI.PluginOauthAuthorizationCodeReq) (confirmCode string, err error) {
	if req.Code == "" {
		return "", errorx.New(errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "code is required"))
	}
	if req.State == "" {
		return "", errorx.New(errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "state is required"))
	}
	if req.PluginID == "" {
		return "", errorx.New(errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "plugin_id is required"))
	}

	confirmCode, err = p.DomainSVC.PluginOauthCallback(ctx, req.Code, req.State, req.PluginID)
	if err != nil {
		return "", errorx.Wrapf(err, "PluginOauthCallback failed")
	}

	return confirmCode, nil
}

// PluginOauthInfo returns plugin information for the OAuth confirmation page.
func (p *PluginApplicationService) PluginOauthInfo(ctx context.Context, req *developerAPI.PluginOauthInfoReq) (resp *developerAPI.PluginOauthInfoResp, err error) {
	info, err := p.DomainSVC.GetPluginOauthInfo(ctx, req.ConfirmCode)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetPluginOauthInfo failed")
	}

	// Look up username from the state's userID via user service
	username := ""
	if info.StateUserID > 0 {
		userProfile, profileErr := p.userSVC.GetUserProfiles(ctx, info.StateUserID)
		if profileErr == nil && userProfile != nil {
			username = userProfile.Name
			if username == "" {
				username = userProfile.UniqueName
			}
		}
	}

	resp = &developerAPI.PluginOauthInfoResp{
		Data: &developerAPI.PluginOauthInfo{
			PluginID:   info.PluginID,
			PluginName: info.PluginName,
			PluginIcon: info.PluginIcon,
			Username:   username,
		},
	}

	return resp, nil
}

// PluginOauthConfirm handles the user's confirmation of OAuth authorization.
// It uses the current session user ID to prevent phishing attacks.
func (p *PluginApplicationService) PluginOauthConfirm(ctx context.Context, req *developerAPI.PluginOauthConfirmReq) (resp *developerAPI.PluginOauthConfirmResp, err error) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrPluginPermissionCode, errorx.KV(errno.PluginMsgKey, "session is required"))
	}

	err = p.DomainSVC.ConfirmPluginOauth(ctx, req.ConfirmCode, *userID)
	if err != nil {
		return nil, errorx.Wrapf(err, "ConfirmPluginOauth failed")
	}

	resp = &developerAPI.PluginOauthConfirmResp{}
	return resp, nil
}
