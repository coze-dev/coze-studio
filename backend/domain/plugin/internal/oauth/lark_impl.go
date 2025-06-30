package oauth

import (
	"code.byted.org/flow/opencoze/backend/domain/plugin/repository"
)

type larkOAuth struct {
	oauthRepo repository.OAuthRepository
}
