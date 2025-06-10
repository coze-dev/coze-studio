package entity

import (
	"strings"

	openauthModel "code.byted.org/flow/opencoze/backend/api/model/crossdomain/openauth"
)

const (
	LarkOauthHostName = "open.larkoffice.com"
)

func GetOAuthProvider(tokenURL string) openauthModel.OAuthProvider {
	if strings.Contains(tokenURL, LarkOauthHostName) {
		return openauthModel.OAuthProviderOfLark
	}
	return openauthModel.OAuthProviderOfStandard
}

type SortField string

const (
	SortByCreatedAt SortField = "created_at"
	SortByUpdatedAt SortField = "updated_at"
)
