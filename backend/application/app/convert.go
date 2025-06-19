package app

import (
	resourceCommon "code.byted.org/flow/opencoze/backend/api/model/resource/common"
	"code.byted.org/flow/opencoze/backend/domain/app/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

func toResourceType(resType resourceCommon.ResType) (entity.ResourceType, error) {
	switch resType {
	case resourceCommon.ResType_Plugin:
		return entity.ResourceTypeOfPlugin, nil
	case resourceCommon.ResType_Workflow:
		return entity.ResourceTypeOfWorkflow, nil
	case resourceCommon.ResType_Knowledge:
		return entity.ResourceTypeOfKnowledge, nil
	case resourceCommon.ResType_Database:
		return entity.ResourceTypeOfDatabase, nil
	default:
		return "", errorx.New(errno.ErrAppInvalidParamCode,
			errorx.KVf(errno.APPMsgKey, "unsupported resource type '%s'", resType))
	}
}

func toThriftResourceType(resType entity.ResourceType) (resourceCommon.ResType, error) {
	switch resType {
	case entity.ResourceTypeOfPlugin:
		return resourceCommon.ResType_Plugin, nil
	case entity.ResourceTypeOfWorkflow:
		return resourceCommon.ResType_Workflow, nil
	case entity.ResourceTypeOfKnowledge:
		return resourceCommon.ResType_Knowledge, nil
	case entity.ResourceTypeOfDatabase:
		return resourceCommon.ResType_Database, nil
	default:
		return 0, errorx.New(errno.ErrAppInvalidParamCode,
			errorx.KVf(errno.APPMsgKey, "unsupported resource type '%s'", resType))
	}
}
