package entity

import (
	"strings"

	openauthModel "code.byted.org/flow/opencoze/backend/api/model/crossdomain/openauth"
)

const (
	larkPluginOAuthHostName = "open.larkoffice.com"
	larkOAuthHostName       = "open.feishu.cn"
)

func GetOAuthProvider(tokenURL string) openauthModel.OAuthProvider {
	if strings.Contains(tokenURL, larkPluginOAuthHostName) {
		return openauthModel.OAuthProviderOfLarkPlugin
	}
	if strings.Contains(tokenURL, larkOAuthHostName) {
		return openauthModel.OAuthProviderOfLark
	}
	return openauthModel.OAuthProviderOfStandard
}

type SortField string

const (
	SortByCreatedAt SortField = "created_at"
	SortByUpdatedAt SortField = "updated_at"
)
