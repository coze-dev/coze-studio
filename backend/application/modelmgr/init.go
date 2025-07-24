package modelmgr

import (
	"github.com/coze-dev/coze-studio/backend/infra/contract/modelmgr"
	"github.com/coze-dev/coze-studio/backend/infra/impl/storage"
)

func InitService(mgr modelmgr.Manager, tosClient storage.Storage) *ModelmgrApplicationService {
	ModelmgrApplicationSVC = &ModelmgrApplicationService{mgr, tosClient}
	return ModelmgrApplicationSVC
}
