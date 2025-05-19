package modelmgr

import "code.byted.org/flow/opencoze/backend/domain/modelmgr"

type ModelmgrApplicationService struct {
	DomainSVC modelmgr.Manager
}

var ModelmgrApplicationSVC ModelmgrApplicationService
