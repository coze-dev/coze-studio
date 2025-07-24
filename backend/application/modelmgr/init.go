package modelmgr

import "github.com/coze-dev/coze-studio/backend/infra/contract/modelmgr"

func InitService(mgr modelmgr.Manager) *ModelmgrApplicationService {
	ModelmgrApplicationSVC = &ModelmgrApplicationService{mgr}
	return ModelmgrApplicationSVC
}
