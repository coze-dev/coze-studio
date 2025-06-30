package entity

import (
	"strings"
)

const (
	larkPluginOAuthHostName = "open.larkoffice.com"
	larkOAuthHostName       = "open.feishu.cn"
)

func GetOAuthProvider(tokenURL string) OAuthProvider {
	if strings.Contains(tokenURL, larkPluginOAuthHostName) {
		return OAuthProviderOfLarkPlugin
	}
	if strings.Contains(tokenURL, larkOAuthHostName) {
		return OAuthProviderOfLark
	}
	return OAuthProviderOfStandard
}

type SortField string

const (
	SortByCreatedAt SortField = "created_at"
	SortByUpdatedAt SortField = "updated_at"
)

type OAuthProvider string

const (
	OAuthProviderOfLarkPlugin OAuthProvider = "lark_plugin"
	OAuthProviderOfLark       OAuthProvider = "lark"
	OAuthProviderOfStandard   OAuthProvider = "standard"
)
