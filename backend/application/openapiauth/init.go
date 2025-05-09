package openapiauth

import (
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/permission/openapiauth"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

var (
	openapiAuthDomainSVC openapiauth.ApiAuth
)

func InitService(db *gorm.DB, idGenSVC idgen.IDGenerator) {
	openapiAuthDomainSVC = openapiauth.NewService(&openapiauth.Components{
		IDGen: idGenSVC,
		DB:    db,
	})
}
