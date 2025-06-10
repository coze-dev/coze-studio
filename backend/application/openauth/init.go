package openauth

import (
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/openauth/oauth/service"
	openapiauth2 "code.byted.org/flow/opencoze/backend/domain/openauth/openapiauth"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

var (
	openapiAuthDomainSVC openapiauth2.APIAuth
	oauthDomainSVC       service.OAuthService
)

func InitService(db *gorm.DB, cacheCli *redis.Client, idGenSVC idgen.IDGenerator) *OpenAuthApplicationService {
	openapiAuthDomainSVC = openapiauth2.NewService(&openapiauth2.Components{
		IDGen: idGenSVC,
		DB:    db,
	})

	oauthDomainSVC = service.NewService(&service.Components{
		IDGen:    idGenSVC,
		DB:       db,
		CacheCli: cacheCli,
	})

	OpenAuthApplication.OpenAPIDomainSVC = openapiAuthDomainSVC
	OpenAuthApplication.OAuthDomainSVC = oauthDomainSVC

	return OpenAuthApplication
}
