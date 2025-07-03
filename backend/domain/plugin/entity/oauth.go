package entity

import (
	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

type AuthorizationCodeMeta struct {
	UserID   string
	PluginID int64
	IsDraft  bool
}

type AuthorizationCodeInfo struct {
	RecordID             int64
	Meta                 *AuthorizationCodeMeta
	Config               *model.OAuthAuthorizationCodeConfig
	AccessToken          string
	RefreshToken         string
	TokenExpiredAtMS     int64
	NextTokenRefreshAtMS *int64
	LastActiveAtMS       int64
}

func (a *AuthorizationCodeInfo) GetNextTokenRefreshAtMS() int64 {
	if a == nil {
		return 0
	}
	return ptr.FromOrDefault(a.NextTokenRefreshAtMS, 0)
}

type OAuthInfo struct {
	OAuthMode         model.AuthzSubType
	AuthorizationCode *AuthorizationCodeInfo
}

type OAuthState struct {
	ClientName OAuthProvider `json:"client_name"`
	UserID     string        `json:"user_id"`
	PluginID   int64         `json:"plugin_id"`
	IsDraft    bool          `json:"is_draft"`
}
