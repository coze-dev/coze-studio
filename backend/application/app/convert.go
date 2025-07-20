/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app

import (
	resourceCommon "github.com/coze-dev/coze-studio/backend/api/model/resource/common"
	"github.com/coze-dev/coze-studio/backend/domain/app/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
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
