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
	"net/url"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"golang.org/x/oauth2"

	common "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	"github.com/coze-dev/coze-studio/backend/bizpkg/config"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/dto"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/encrypt"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/pkg/taskgroup"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

var (
	initOnce           = sync.Once{}
	lastActiveInterval = 15 * 24 * time.Hour
	failedCache        = sync.Map{}
)

const (
	oauthNonceKeyPrefix       = "oauth_state_nonce:"
	oauthNonceTTL             = 10 * time.Minute
	oauthConfirmCodeKeyPrefix = "oauth_confirm_code:"
	oauthConfirmCodeTTL       = 3 * time.Minute
)

func makeConfirmCodeKey(confirmCode string) string {
	return oauthConfirmCodeKeyPrefix + confirmCode
}

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

func (p *pluginServiceImpl) refreshToken(ctx context.Context, info *dto.AuthorizationCodeInfo) {
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

	token, err := source.Token()
	if err != nil {
		logs.CtxWarnf(ctx, "refreshToken failed, recordID=%d, err=%v", info.RecordID, err)
		p.refreshTokenFailedHandler(ctx, info.RecordID, err)
		return
	}

	var expiredAtMS int64
	if !token.Expiry.IsZero() && token.Expiry.After(time.Now()) {
		expiredAtMS = token.Expiry.UnixMilli()
	}

	err = p.oauthRepo.UpsertAuthorizationCode(ctx, &dto.AuthorizationCodeInfo{
		Meta: &dto.AuthorizationCodeMeta{
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
	if err != nil {
		logs.CtxInfof(ctx, "UpsertAuthorizationCode failed, recordID=%d, err=%v", info.RecordID, err)
		p.refreshTokenFailedHandler(ctx, info.RecordID, err)
		return
	}
}

func (p *pluginServiceImpl) refreshTokenFailedHandler(ctx context.Context, recordID int64, err error) {
	if err == nil {
		return
	}

	const maxFailedTimes = 5

	failedTimes, ok := failedCache.Load(recordID)
	if !ok {
		failedCache.Store(recordID, 1)
		return
	}

	failedTimes_ := failedTimes.(int) + 1
	failedCache.Store(recordID, failedTimes_)

	if failedTimes_ < maxFailedTimes {
		return
	}

	logs.CtxErrorf(ctx, "refreshToken exceeds max failed times, recordID=%d, err=%v", recordID, err)

	failedCache.Delete(recordID)

	err_ := p.oauthRepo.BatchDeleteAuthorizationCodeByIDs(ctx, []int64{recordID})
	if err_ != nil {
		logs.CtxErrorf(ctx, "BatchDeleteAuthorizationCodeByIDs failed, recordID=%d, err=%v", recordID, err_)
	}
}

func (p *pluginServiceImpl) GetAccessToken(ctx context.Context, oa *dto.OAuthInfo) (accessToken string, err error) {
	switch oa.OAuthMode {
	case consts.AuthzSubTypeOfOAuthAuthorizationCode:
		accessToken, err = p.getAccessTokenByAuthorizationCode(ctx, oa.AuthorizationCode)
	default:
		return "", fmt.Errorf("invalid oauth mode '%s'", oa.OAuthMode)
	}
	if err != nil {
		return "", err
	}

	return accessToken, nil
}

func (p *pluginServiceImpl) getAccessTokenByAuthorizationCode(ctx context.Context, ci *dto.AuthorizationCodeInfo) (accessToken string, err error) {
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

func (p *pluginServiceImpl) OAuthCode(ctx context.Context, code string, state *dto.OAuthState) (err error) {
	if err = p.validateOAuthNonce(ctx, state); err != nil {
		return err
	}

	return p.exchangeAndSaveToken(ctx, code, state)
}

// exchangeAndSaveToken handles the core OAuth token exchange and storage.
// It is used by both the legacy OAuthCode flow and the new two-step confirmation flow.
func (p *pluginServiceImpl) exchangeAndSaveToken(ctx context.Context, code string, state *dto.OAuthState) error {
	var plugin *entity.PluginInfo
	var err error
	if state.IsDraft {
		plugin, err = p.GetDraftPlugin(ctx, state.PluginID)
	} else {
		plugin, err = p.GetOnlinePlugin(ctx, state.PluginID)
	}
	if err != nil {
		return errorx.Wrapf(err, "GetPlugin failed, pluginID=%d", state.PluginID)
	}

	authInfo := plugin.GetAuthInfo()
	if authInfo.SubType != consts.AuthzSubTypeOfOAuthAuthorizationCode {
		return errorx.New(errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "plugin auth type is not oauth authorization code"))
	}
	if authInfo.AuthOfOAuthAuthorizationCode == nil {
		return errorx.New(errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "plugin auth info is nil"))
	}

	oauthConfig, err := getStanderOAuthConfig(ctx, authInfo.AuthOfOAuthAuthorizationCode, state.PluginID)
	if err != nil {
		return errorx.Wrapf(err, "getStanderOAuthConfig failed, pluginID=%d", state.PluginID)
	}

	token, err := oauthConfig.Exchange(ctx, code)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "exchange token failed"))
	}

	meta := &dto.AuthorizationCodeMeta{
		UserID:   state.UserID,
		PluginID: state.PluginID,
		IsDraft:  state.IsDraft,
	}

	var expiredAtMS int64
	if !token.Expiry.IsZero() && token.Expiry.After(time.Now()) {
		expiredAtMS = token.Expiry.UnixMilli()
	}

	err = p.saveAccessToken(ctx, &dto.OAuthInfo{
		OAuthMode: consts.AuthzSubTypeOfOAuthAuthorizationCode,
		AuthorizationCode: &dto.AuthorizationCodeInfo{
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

// PluginOauthCallback handles the OAuth provider's callback.
// It validates the state/nonce, verifies pluginID matches, and stores a temporary
// confirm_code in Redis instead of immediately completing the token exchange.
func (p *pluginServiceImpl) PluginOauthCallback(ctx context.Context, code, stateStr, pluginID string) (confirmCode string, err error) {
	stateDecoded, err := url.QueryUnescape(stateStr)
	if err != nil {
		return "", errorx.WrapByCode(err, errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "invalid state"))
	}

	secret := os.Getenv(encrypt.StateSecretEnv)
	if secret == "" {
		secret = encrypt.DefaultStateSecret
	}

	stateBytes, err := encrypt.DecryptByAES(stateDecoded, secret)
	if err != nil {
		return "", errorx.WrapByCode(err, errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "invalid state"))
	}

	state := &dto.OAuthState{}
	if err = sonic.Unmarshal(stateBytes, state); err != nil {
		return "", errorx.WrapByCode(err, errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "invalid state"))
	}

	// Verify pluginID from URL path matches state to prevent CSRF
	if fmt.Sprintf("%d", state.PluginID) != pluginID {
		return "", errorx.New(errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "plugin_id mismatch"))
	}

	if err = p.validateOAuthNonce(ctx, state); err != nil {
		return "", err
	}

	// Generate confirm_code and store in Redis
	confirmCode = uuid.New().String()
	data := &dto.PluginOauthConfirmData{
		State:    state,
		AuthCode: code,
	}
	dataBytes, err := sonic.Marshal(data)
	if err != nil {
		return "", errorx.Wrapf(err, "marshal confirm data failed")
	}

	key := makeConfirmCodeKey(confirmCode)
	ttl := oauthConfirmCodeTTL
	if err = p.oauthCache.Set(ctx, key, string(dataBytes), &ttl); err != nil {
		return "", errorx.Wrapf(err, "save confirm code failed")
	}

	return confirmCode, nil
}

// GetPluginOauthInfo retrieves plugin information for the OAuth confirmation page.
func (p *pluginServiceImpl) GetPluginOauthInfo(ctx context.Context, confirmCode string) (*dto.PluginOauthConfirmInfo, error) {
	data, err := p.getConfirmData(ctx, confirmCode)
	if err != nil {
		return nil, err
	}

	state := data.State
	var plugin *entity.PluginInfo
	if state.IsDraft {
		plugin, err = p.GetDraftPlugin(ctx, state.PluginID)
	} else {
		plugin, err = p.GetOnlinePlugin(ctx, state.PluginID)
	}
	if err != nil {
		return nil, errorx.Wrapf(err, "GetPlugin failed, pluginID=%d", state.PluginID)
	}

	iconURL := ""
	if plugin.GetIconURI() != "" {
		iconURL, _ = p.oss.GetObjectUrl(ctx, plugin.GetIconURI())
	}

	return &dto.PluginOauthConfirmInfo{
		PluginID:    conv.Int64ToStr(state.PluginID),
		PluginName:  plugin.GetName(),
		PluginIcon:  iconURL,
		StateUserID: conv.StrToInt64D(state.UserID, 0),
	}, nil
}

// ConfirmPluginOauth completes the OAuth flow after user confirmation.
// It uses currentUserID from the session (not from the original state) to prevent phishing.
func (p *pluginServiceImpl) ConfirmPluginOauth(ctx context.Context, confirmCode string, currentUserID int64) error {
	data, err := p.getConfirmData(ctx, confirmCode)
	if err != nil {
		return err
	}

	// Delete confirm code from Redis (one-time use)
	key := makeConfirmCodeKey(confirmCode)
	_ = p.oauthCache.Del(ctx, key)

	// Override userID with the currently logged-in user to prevent phishing attacks
	state := data.State
	state.UserID = conv.Int64ToStr(currentUserID)

	return p.exchangeAndSaveToken(ctx, data.AuthCode, state)
}

// getConfirmData retrieves and parses the confirm data from Redis.
func (p *pluginServiceImpl) getConfirmData(ctx context.Context, confirmCode string) (*dto.PluginOauthConfirmData, error) {
	if confirmCode == "" {
		return nil, errorx.New(errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "confirm_code is required"))
	}

	key := makeConfirmCodeKey(confirmCode)
	dataStr, exist, err := p.oauthCache.Get(ctx, key)
	if err != nil {
		return nil, errorx.Wrapf(err, "get confirm code failed")
	}
	if !exist {
		return nil, errorx.New(errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "invalid or expired confirm_code"))
	}

	data := &dto.PluginOauthConfirmData{}
	if err = sonic.Unmarshal([]byte(dataStr), data); err != nil {
		return nil, errorx.Wrapf(err, "unmarshal confirm data failed")
	}

	return data, nil
}

func (p *pluginServiceImpl) saveAccessToken(ctx context.Context, oa *dto.OAuthInfo) (err error) {
	switch oa.OAuthMode {
	case consts.AuthzSubTypeOfOAuthAuthorizationCode:
		err = p.saveAuthCodeAccessToken(ctx, oa.AuthorizationCode)
	default:
		return fmt.Errorf("[standardOAuth] invalid oauth mode '%s'", oa.OAuthMode)
	}

	return err
}

func (p *pluginServiceImpl) saveAuthCodeAccessToken(ctx context.Context, info *dto.AuthorizationCodeInfo) (err error) {
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

func (p *pluginServiceImpl) RevokeAccessToken(ctx context.Context, meta *dto.AuthorizationCodeMeta) (err error) {
	return p.oauthRepo.DeleteAuthorizationCode(ctx, meta)
}

func (p *pluginServiceImpl) GetOAuthStatus(ctx context.Context, userID, pluginID int64) (resp *dto.GetOAuthStatusResponse, err error) {
	pl, exist, err := p.pluginRepo.GetDraftPlugin(ctx, pluginID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("draft plugin '%d' not found", pluginID)
	}

	authInfo := pl.GetAuthInfo()
	if authInfo.Type == consts.AuthzTypeOfNone || authInfo.Type == consts.AuthzTypeOfService {
		return &dto.GetOAuthStatusResponse{
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

	resp = &dto.GetOAuthStatusResponse{
		IsOauth:  true,
		Status:   status,
		OAuthURL: authURL,
	}

	return resp, nil
}

func (p *pluginServiceImpl) getPluginOAuthStatus(ctx context.Context, userID int64, plugin *entity.PluginInfo, isDraft bool) (needAuth bool, authURL string, err error) {
	authInfo := plugin.GetAuthInfo()

	if authInfo.Type != consts.AuthzTypeOfOAuth {
		return false, "", fmt.Errorf("invalid auth type '%v'", authInfo.Type)
	}
	if authInfo.SubType != consts.AuthzSubTypeOfOAuthAuthorizationCode {
		return false, "", fmt.Errorf("invalid auth sub type '%v'", authInfo.SubType)
	}

	authCode := &dto.AuthorizationCodeInfo{
		Meta: &dto.AuthorizationCodeMeta{
			UserID:   conv.Int64ToStr(userID),
			PluginID: plugin.ID,
			IsDraft:  isDraft,
		},
		Config: plugin.Manifest.Auth.AuthOfOAuthAuthorizationCode,
	}

	accessToken, err := p.GetAccessToken(ctx, &dto.OAuthInfo{
		OAuthMode:         consts.AuthzSubTypeOfOAuthAuthorizationCode,
		AuthorizationCode: authCode,
	})
	if err != nil {
		return false, "", err
	}

	needAuth = accessToken == ""

	nonce, err := p.generateOAuthNonce(ctx, authCode.Meta.UserID)
	if err != nil {
		return false, "", err
	}

	authURL, err = genAuthURL(ctx, authCode, nonce)
	if err != nil {
		return false, "", err
	}

	return needAuth, authURL, nil
}

func genAuthURL(ctx context.Context, info *dto.AuthorizationCodeInfo, nonce string) (string, error) {
	config, err := getStanderOAuthConfig(ctx, info.Config, info.Meta.PluginID)
	if err != nil {
		return "", err
	}

	state := &dto.OAuthState{
		ClientName: "",
		UserID:     info.Meta.UserID,
		PluginID:   info.Meta.PluginID,
		IsDraft:    info.Meta.IsDraft,
		Nonce:      nonce,
	}
	stateStr, err := json.Marshal(state)
	if err != nil {
		return "", fmt.Errorf("marshal state failed, err=%v", err)
	}

	secret := os.Getenv(encrypt.StateSecretEnv)
	if secret == "" {
		secret = encrypt.DefaultStateSecret
	}

	encryptState, err := encrypt.EncryptByAES(stateStr, secret)
	if err != nil {
		return "", fmt.Errorf("encrypt state failed, err=%v", err)
	}

	authURL := config.AuthCodeURL(encryptState)

	return authURL, nil
}

func (p *pluginServiceImpl) generateOAuthNonce(ctx context.Context, userID string) (string, error) {
	nonce := uuid.New().String()
	key := oauthNonceKeyPrefix + nonce
	ttl := oauthNonceTTL
	err := p.oauthCache.Set(ctx, key, userID, &ttl)
	if err != nil {
		return "", fmt.Errorf("save oauth nonce failed, err=%v", err)
	}
	return nonce, nil
}

func (p *pluginServiceImpl) validateOAuthNonce(ctx context.Context, state *dto.OAuthState) error {
	if state.Nonce == "" {
		return errorx.New(errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "invalid or expired state"))
	}

	key := oauthNonceKeyPrefix + state.Nonce
	storedUserID, exist, err := p.oauthCache.Get(ctx, key)
	if err != nil {
		return errorx.Wrapf(err, "get oauth nonce failed")
	}
	if !exist {
		return errorx.New(errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "invalid or expired state"))
	}
	if storedUserID != state.UserID {
		return errorx.New(errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "invalid state"))
	}

	_ = p.oauthCache.Del(ctx, key)
	return nil
}

func getStanderOAuthConfig(ctx context.Context, authConfig *model.OAuthAuthorizationCodeConfig, pluginID int64) (*oauth2.Config, error) {
	if authConfig == nil {
		return nil, nil
	}

	host, err := config.Base().GetServerHost(ctx)
	if err != nil {
		return nil, fmt.Errorf("GetServerHost failed, err=%w", err)
	}

	return &oauth2.Config{
		ClientID:     authConfig.ClientID,
		ClientSecret: authConfig.ClientSecret,
		Endpoint: oauth2.Endpoint{
			TokenURL: authConfig.AuthorizationURL,
			AuthURL:  authConfig.ClientURL,
		},
		RedirectURL: fmt.Sprintf("%s/api/plugin_oauth/%d/authorization_code", host, pluginID),
		Scopes:      strings.Split(authConfig.Scope, " "),
	}, nil
}

func (p *pluginServiceImpl) GetAgentPluginsOAuthStatus(ctx context.Context, userID, agentID int64) (status []*dto.AgentPluginOAuthStatus, err error) {
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
		if authInfo.Type == consts.AuthzTypeOfNone || authInfo.Type == consts.AuthzTypeOfService {
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

		status = append(status, &dto.AgentPluginOAuthStatus{
			PluginID:      plugin.ID,
			PluginName:    plugin.GetName(),
			PluginIconURL: iconURL,
			Status:        authStatus,
		})
	}

	return status, nil
}
