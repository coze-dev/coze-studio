package openauth

import (
	"gorm.io/gorm"

	openapiauth2 "code.byted.org/flow/opencoze/backend/domain/openauth/openapiauth"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

var (
	openapiAuthDomainSVC openapiauth2.APIAuth
)

func InitService(db *gorm.DB, idGenSVC idgen.IDGenerator) *OpenAuthApplicationService {
	openapiAuthDomainSVC = openapiauth2.NewService(&openapiauth2.Components{
		IDGen: idGenSVC,
		DB:    db,
	})

	OpenAuthApplication.OpenAPIDomainSVC = openapiAuthDomainSVC

	return OpenAuthApplication
}
