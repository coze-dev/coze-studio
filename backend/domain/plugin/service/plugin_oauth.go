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

package service

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"sync"
	"time"

	"golang.org/x/oauth2"

	model "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/plugin"
	common "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop_common"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/utils"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/taskgroup"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

var (
	initOnce           = sync.Once{}
	lastActiveInterval = 15 * 24 * time.Hour
)

func (p *pluginServiceImpl) processOAuthAccessToken(ctx context.Context) {
	const (
		deleteLimit  = 100
		refreshLimit = 50
	)

	for {
		now := time.Now()

		lastActiveAt := now.Add(-lastActiveInterval)
		err := p.oauthRepo.DeleteInactiveAuthorizationCodeTokens(ctx, lastActiveAt.UnixMilli(), deleteLimit)
		if err != nil {
			logs.CtxWarnf(ctx, "DeleteInactiveAuthorizationCodeTokens failed, err=%v", err)
		}

		err = p.oauthRepo.DeleteExpiredAuthorizationCodeTokens(ctx, now.UnixMilli(), deleteLimit)
		if err != nil {
			logs.CtxWarnf(ctx, "DeleteExpiredAuthorizationCodeTokens failed, err=%v", err)
		}

		refreshTokenList, err := p.oauthRepo.GetAuthorizationCodeRefreshTokens(ctx, now.UnixMilli(), refreshLimit)
		if err != nil {
			logs.CtxErrorf(ctx, "GetAuthorizationCodeRefreshTokens failed, err=%v", err)
			<-time.After(time.Second)
			continue
		}

		taskGroups := taskgroup.NewTaskGroup(ctx, 3)
		expired := make([]int64, 0, len(refreshTokenList))

		for _, info := range refreshTokenList {
			if info.GetNextTokenRefreshAtMS() == 0 || info.TokenExpiredAtMS == 0 {
				continue
			}

			if info.GetNextTokenRefreshAtMS() > now.UnixMilli() ||
				info.LastActiveAtMS <= lastActiveAt.UnixMilli() {
				expired = append(expired, info.RecordID)
				continue
			}

			taskGroups.Go(func() error {
				p.refreshToken(ctx, info)
				return nil
			})
		}

		_ = taskGroups.Wait()

		if len(expired) > 0 {
			err = p.oauthRepo.BatchDeleteAuthorizationCodeByIDs(ctx, expired)
			if err != nil {
				logs.CtxWarnf(ctx, "BatchDeleteAuthorizationCodeByIDs failed, err=%v", err)
			}
		}

		<-time.After(5 * time.Second)
	}
}

func (p *pluginServiceImpl) refreshToken(ctx context.Context, info *entity.AuthorizationCodeInfo) {
	config := oauth2.Config{
		ClientID:     info.Config.ClientID,
		ClientSecret: info.Config.ClientSecret,
		Endpoint: oauth2.Endpoint{
			TokenURL: info.Config.AuthorizationURL,
		},
		Scopes: strings.Split(info.Config.Scope, " "),
	}

	token := &oauth2.Token{
		AccessToken:  info.AccessToken,
		RefreshToken: info.RefreshToken,
		Expiry:       time.UnixMilli(info.TokenExpiredAtMS),
	}

	source := config.TokenSource(ctx, token)

	var (
		err      error
		newToken *oauth2.Token
	)

	for i := 0; i < 3; i++ {
		newToken, err = source.Token()
		if err == nil {
			token = newToken
			break
		}
		<-time.After(time.Second)
	}
	if err != nil {
		logs.CtxInfof(ctx, "refreshToken failed, recordID=%d, err=%v", info.RecordID, err)
		err = p.oauthRepo.BatchDeleteAuthorizationCodeByIDs(ctx, []int64{info.RecordID})
		if err != nil {
			logs.CtxErrorf(ctx, "BatchDeleteAuthorizationCodeByIDs failed, recordID=%d, err=%v", info.RecordID, err)
		}
		return
	}

	for i := 0; i < 3; i++ {
		var expiredAtMS int64
		if !token.Expiry.IsZero() && token.Expiry.After(time.Now()) {
			expiredAtMS = token.Expiry.UnixMilli()
		}

		err = p.oauthRepo.UpsertAuthorizationCode(ctx, &entity.AuthorizationCodeInfo{
			Meta: &entity.AuthorizationCodeMeta{
				UserID:   info.Meta.UserID,
				PluginID: info.Meta.PluginID,
				IsDraft:  info.Meta.IsDraft,
			},
			Config:               info.Config,
			AccessToken:          token.AccessToken,
			RefreshToken:         token.RefreshToken,
			TokenExpiredAtMS:     expiredAtMS,
			NextTokenRefreshAtMS: ptr.Of(getNextTokenRefreshAtMS(expiredAtMS)),
		})
		if err == nil {
			break
		}
		<-time.After(time.Second)
	}
	if err != nil {
		logs.CtxInfof(ctx, "UpsertAuthorizationCode failed, recordID=%d, err=%v", info.RecordID, err)
		err = p.oauthRepo.BatchDeleteAuthorizationCodeByIDs(ctx, []int64{info.RecordID})
		if err != nil {
			logs.CtxErrorf(ctx, "BatchDeleteAuthorizationCodeByIDs failed, recordID=%d, err=%v", info.RecordID, err)
		}
	}
}

func (p *pluginServiceImpl) GetAccessToken(ctx context.Context, oa *entity.OAuthInfo) (accessToken string, err error) {
	switch oa.OAuthMode {
	case model.AuthzSubTypeOfOAuthAuthorizationCode:
		accessToken, err = p.getAccessTokenByAuthorizationCode(ctx, oa.AuthorizationCode)
	default:
		return "", fmt.Errorf("invalid oauth mode '%s'", oa.OAuthMode)
	}
	if err != nil {
		return "", err
	}

	return accessToken, nil
}

func (p *pluginServiceImpl) getAccessTokenByAuthorizationCode(ctx context.Context, ci *entity.AuthorizationCodeInfo) (accessToken string, err error) {
	meta := ci.Meta
	info, exist, err := p.oauthRepo.GetAuthorizationCode(ctx, ci.Meta)
	if err != nil {
		return "", errorx.Wrapf(err, "GetAuthorizationCode failed, userID=%s, pluginID=%d, isDraft=%t",
			meta.UserID, meta.PluginID, meta.IsDraft)
	}
	if !exist {
		return "", nil
	}

	if !isValidAuthCodeConfig(info.Config, ci.Config, info.TokenExpiredAtMS, info.LastActiveAtMS) {
		return "", nil
	}

	now := time.Now().UnixMilli()
	if now-info.LastActiveAtMS > time.Minute.Milliseconds() { // don't update too frequently
		err = p.oauthRepo.UpdateAuthorizationCodeLastActiveAt(ctx, meta, now)
		if err != nil {
			logs.CtxWarnf(ctx, "UpdateAuthorizationCodeLastActiveAt failed, userID=%s, pluginID=%d, isDraft=%t, err=%v",
				meta.UserID, meta.PluginID, meta.IsDraft, err)
		}
	}

	return info.AccessToken, nil
}

func isValidAuthCodeConfig(o, n *model.OAuthAuthorizationCodeConfig, expireAt, lastActiveAt int64) bool {
	now := time.Now()

	if expireAt > 0 && expireAt <= now.UnixMilli() {
		return false
	}
	if lastActiveAt > 0 && lastActiveAt <= now.Add(-lastActiveInterval).UnixMilli() {
		return false
	}

	if o.ClientID != n.ClientID {
		return false
	}
	if o.ClientSecret != n.ClientSecret {
		return false
	}
	if o.ClientURL != n.ClientURL {
		return false
	}
	if o.AuthorizationURL != n.AuthorizationURL {
		return false
	}
	if o.AuthorizationContentType != n.AuthorizationContentType {
		return false
	}

	oldScope := strings.Split(o.Scope, " ")
	newScope := strings.Split(n.Scope, " ")

	if len(oldScope) != len(newScope) {
		return false
	}

	m := make(map[string]bool, len(oldScope))
	for _, v := range oldScope {
		m[v] = false
	}
	for _, v := range newScope {
		if _, ok := m[v]; !ok {
			return false
		}
	}

	return true
}

func (p *pluginServiceImpl) OAuthCode(ctx context.Context, code string, state *entity.OAuthState) (err error) {
	var plugin *entity.PluginInfo
	if state.IsDraft {
		plugin, err = p.GetDraftPlugin(ctx, state.PluginID)
	} else {
		plugin, err = p.GetOnlinePlugin(ctx, state.PluginID)
	}
	if err != nil {
		return errorx.Wrapf(err, "GetPlugin failed, pluginID=%d", state.PluginID)
	}

	authInfo := plugin.GetAuthInfo()
	if authInfo.SubType != model.AuthzSubTypeOfOAuthAuthorizationCode {
		return errorx.New(errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "plugin auth type is not oauth authorization code"))
	}
	if authInfo.AuthOfOAuthAuthorizationCode == nil {
		return errorx.New(errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "plugin auth info is nil"))
	}

	config := getStanderOAuthConfig(authInfo.AuthOfOAuthAuthorizationCode)

	token, err := config.Exchange(ctx, code)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "exchange token failed"))
	}

	meta := &entity.AuthorizationCodeMeta{
		UserID:   state.UserID,
		PluginID: state.PluginID,
		IsDraft:  state.IsDraft,
	}

	var expiredAtMS int64
	if !token.Expiry.IsZero() && token.Expiry.After(time.Now()) {
		expiredAtMS = token.Expiry.UnixMilli()
	}

	err = p.saveAccessToken(ctx, &entity.OAuthInfo{
		OAuthMode: model.AuthzSubTypeOfOAuthAuthorizationCode,
		AuthorizationCode: &entity.AuthorizationCodeInfo{
			Meta:                 meta,
			Config:               authInfo.AuthOfOAuthAuthorizationCode,
			AccessToken:          token.AccessToken,
			RefreshToken:         token.RefreshToken,
			TokenExpiredAtMS:     expiredAtMS,
			NextTokenRefreshAtMS: ptr.Of(getNextTokenRefreshAtMS(expiredAtMS)),
			LastActiveAtMS:       time.Now().UnixMilli(),
		},
	})
	if err != nil {
		return errorx.Wrapf(err, "SaveAccessToken failed, pluginID=%d", state.PluginID)
	}

	return nil
}

func (p *pluginServiceImpl) saveAccessToken(ctx context.Context, oa *entity.OAuthInfo) (err error) {
	switch oa.OAuthMode {
	case model.AuthzSubTypeOfOAuthAuthorizationCode:
		err = p.saveAuthCodeAccessToken(ctx, oa.AuthorizationCode)
	default:
		return fmt.Errorf("[standardOAuth] invalid oauth mode '%s'", oa.OAuthMode)
	}

	return err
}

func (p *pluginServiceImpl) saveAuthCodeAccessToken(ctx context.Context, info *entity.AuthorizationCodeInfo) (err error) {
	meta := info.Meta
	err = p.oauthRepo.UpsertAuthorizationCode(ctx, info)
	if err != nil {
		return errorx.Wrapf(err, "SaveAuthorizationCodeInfo failed, userID=%s, pluginID=%d, isDraft=%t",
			meta.UserID, meta.PluginID, meta.IsDraft)
	}

	return nil
}

func getNextTokenRefreshAtMS(expiredAtMS int64) int64 {
	if expiredAtMS == 0 {
		return 0
	}
	return time.Now().Add(time.Duration((expiredAtMS-time.Now().UnixMilli())/2) * time.Millisecond).UnixMilli()
}

func (p *pluginServiceImpl) RevokeAccessToken(ctx context.Context, meta *entity.AuthorizationCodeMeta) (err error) {
	return p.oauthRepo.DeleteAuthorizationCode(ctx, meta)
}

func (p *pluginServiceImpl) GetOAuthStatus(ctx context.Context, userID, pluginID int64) (resp *GetOAuthStatusResponse, err error) {
	pl, exist, err := p.pluginRepo.GetDraftPlugin(ctx, pluginID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("draft plugin '%d' not found", pluginID)
	}

	authInfo := pl.GetAuthInfo()
	if authInfo.Type == model.AuthzTypeOfNone || authInfo.Type == model.AuthzTypeOfService {
		return &GetOAuthStatusResponse{
			IsOauth: false,
		}, nil
	}

	needAuth, authURL, err := p.getPluginOAuthStatus(ctx, userID, pl, true)
	if err != nil {
		return nil, err
	}

	status := common.OAuthStatus_Authorized
	if needAuth {
		status = common.OAuthStatus_Unauthorized
	}

	resp = &GetOAuthStatusResponse{
		IsOauth:  true,
		Status:   status,
		OAuthURL: authURL,
	}

	return resp, nil
}

func (p *pluginServiceImpl) getPluginOAuthStatus(ctx context.Context, userID int64, plugin *entity.PluginInfo, isDraft bool) (needAuth bool, authURL string, err error) {
	authInfo := plugin.GetAuthInfo()

	if authInfo.Type != model.AuthzTypeOfOAuth {
		return false, "", fmt.Errorf("invalid auth type '%v'", authInfo.Type)
	}
	if authInfo.SubType != model.AuthzSubTypeOfOAuthAuthorizationCode {
		return false, "", fmt.Errorf("invalid auth sub type '%v'", authInfo.SubType)
	}

	authCode := &entity.AuthorizationCodeInfo{
		Meta: &entity.AuthorizationCodeMeta{
			UserID:   conv.Int64ToStr(userID),
			PluginID: plugin.ID,
			IsDraft:  isDraft,
		},
		Config: plugin.Manifest.Auth.AuthOfOAuthAuthorizationCode,
	}

	accessToken, err := p.GetAccessToken(ctx, &entity.OAuthInfo{
		OAuthMode:         model.AuthzSubTypeOfOAuthAuthorizationCode,
		AuthorizationCode: authCode,
	})
	if err != nil {
		return false, "", err
	}

	needAuth = accessToken == ""

	authURL, err = genAuthURL(authCode)
	if err != nil {
		return false, "", err
	}

	return needAuth, authURL, nil
}

func genAuthURL(info *entity.AuthorizationCodeInfo) (string, error) {
	config := getStanderOAuthConfig(info.Config)

	state := &entity.OAuthState{
		ClientName: "",
		UserID:     info.Meta.UserID,
		PluginID:   info.Meta.PluginID,
		IsDraft:    info.Meta.IsDraft,
	}
	stateStr, err := json.Marshal(state)
	if err != nil {
		return "", fmt.Errorf("marshal state failed, err=%v", err)
	}

	secret := os.Getenv(utils.StateSecretEnv)
	if secret == "" {
		secret = utils.DefaultStateSecret
	}

	encryptState, err := utils.EncryptByAES(stateStr, secret)
	if err != nil {
		return "", fmt.Errorf("encrypt state failed, err=%v", err)
	}

	authURL := config.AuthCodeURL(encryptState)

	return authURL, nil
}

func getStanderOAuthConfig(config *model.OAuthAuthorizationCodeConfig) *oauth2.Config {
	if config == nil {
		return nil
	}
	return &oauth2.Config{
		ClientID:     config.ClientID,
		ClientSecret: config.ClientSecret,
		Endpoint: oauth2.Endpoint{
			TokenURL: config.AuthorizationURL,
			AuthURL:  config.ClientURL,
		},
		RedirectURL: fmt.Sprintf("https://%s/api/oauth/authorization_code", os.Getenv("SERVER_HOST")),
		Scopes:      strings.Split(config.Scope, " "),
	}
}

func (p *pluginServiceImpl) GetAgentPluginsOAuthStatus(ctx context.Context, userID, agentID int64) (status []*AgentPluginOAuthStatus, err error) {
	pluginIDs, err := p.toolRepo.GetAgentPluginIDs(ctx, agentID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetAgentPluginIDs failed, agentID=%d", agentID)
	}

	if len(pluginIDs) == 0 {
		return nil, nil
	}

	plugins, err := p.pluginRepo.MGetOnlinePlugins(ctx, pluginIDs)
	if err != nil {
		return nil, errorx.Wrapf(err, "MGetOnlinePlugins failed, pluginIDs=%v", pluginIDs)
	}

	for _, plugin := range plugins {
		authInfo := plugin.GetAuthInfo()
		if authInfo.Type == model.AuthzTypeOfNone || authInfo.Type == model.AuthzTypeOfService {
			continue
		}

		needAuth, _, err := p.getPluginOAuthStatus(ctx, userID, plugin, false)
		if err != nil {
			logs.CtxErrorf(ctx, "getPluginOAuthStatus failed, pluginID=%d, err=%v", plugin.ID, err)
			continue
		}

		iconURL := ""
		if plugin.GetIconURI() != "" {
			iconURL, _ = p.oss.GetObjectUrl(ctx, plugin.GetIconURI())
		}

		authStatus := common.OAuthStatus_Authorized
		if needAuth {
			authStatus = common.OAuthStatus_Unauthorized
		}

		status = append(status, &AgentPluginOAuthStatus{
			PluginID:      plugin.ID,
			PluginName:    plugin.GetName(),
			PluginIconURL: iconURL,
			Status:        authStatus,
		})
	}

	return status, nil
}
