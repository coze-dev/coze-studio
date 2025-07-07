package dataconnector

import (
	"context"
)

type ConnectorConfig struct {
	ConnectorName string      `json:"connector_name"`
	ConnectorID   ConnectorID `json:"connector_id"`
	AuthConfig    AuthConfig  `json:"auth_config"`
	BaseOpenURL   string      `json:"base_open_url"`
}

type AuthConfig struct {
	ClientID         string `json:"client_id"`
	ClientSecret     string `json:"client_secret"`
	RedirectURI      string `json:"redirect_uri"`
	AuthorizationURI string `json:"authorization_uri"`
	GetTokenURI      string `json:"get_token_uri"`
}

type ConnectorID int64

const (
	ConnectorIDFeishuWeb ConnectorID = 103
)

type AuthTokenInfo struct {
	AccessToken     string      `json:"access_token"`
	RefreshToken    string      `json:"refresh_token"`
	TokenExpireIn   int64       `json:"token_expire_in"`
	RefreshExpireIn int64       `json:"refresh_expire_in"`
	Scope           string      `json:"scope"`
	Extra           interface{} `json:"extra"`
}

type AuthInfo struct {
	ID          int64         `json:"id"`           // 主键id
	CreatorID   int64         `json:"creator_id"`   // 用户id
	ConnectorID int64         `json:"connector_id"` // 数据来源ID
	AuthUniqID  string        `json:"auth_uniq_id"` // 令牌的uuid
	Name        string        `json:"name"`         // 名称
	Icon        string        `json:"icon"`         // icon
	AuthType    string        `json:"auth_type"`    // 鉴权类型["none"、"oauth"...]
	AuthInfo    AuthTokenInfo `json:"auth_info"`    // json 存储鉴权详细配置
}

type SearchRequest struct {
	AccessToken string `json:"access_token"`
	SearchQuery string `json:"search_query"`
	PageToken   string `json:"page_token"`
}

type Fetcher interface {
	GetConsentURL(ctx context.Context) (string, error)
	AuthorizeCode(ctx context.Context, creatorID int64, code string) error
	GetAuthInfo(ctx context.Context, creatorID int64) ([]*AuthInfo, error)
	GetAccessTokenByAuthID(ctx context.Context, authID int64) (string, error)
	RefreshAccessToken(ctx context.Context, authID int64) (string, error)
	Search(ctx context.Context, req *SearchRequest) ([]byte, error)
}
