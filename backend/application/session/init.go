package session

import (
	"code.byted.org/flow/opencoze/backend/domain/session"
	"code.byted.org/flow/opencoze/backend/infra/contract/cache"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

var sessionDomainSVC session.Session

func InitService(cacheCli cache.Cmdable, idGenSVC idgen.IDGenerator) {
	sessionDomainSVC = session.NewService(cacheCli, idGenSVC)
}
