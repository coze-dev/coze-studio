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

package memory

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/coze-dev/coze-studio/backend/api/model/base"
	"github.com/coze-dev/coze-studio/backend/api/model/data/variable/kvmemory"
	"github.com/coze-dev/coze-studio/backend/api/model/data/variable/project_memory"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	model "github.com/coze-dev/coze-studio/backend/crossdomain/variables/model"
	"github.com/coze-dev/coze-studio/backend/domain/memory/variables/entity"
	variables "github.com/coze-dev/coze-studio/backend/domain/memory/variables/service"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/i18n"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type VariableApplicationService struct {
	DomainSVC variables.Variables
}

var VariableApplicationSVC = VariableApplicationService{}

var i18nLocal2GroupVariableInfo = map[i18n.Locale]map[project_memory.VariableChannel]project_memory.GroupVariableInfo{
	i18n.LocaleEN: {
		project_memory.VariableChannel_APP: {
			GroupName: "App variable",
			GroupDesc: "Configures data accessed across multiple development scenarios in the app. It is initialized to a default value each time a new request is sent.",
		},
		project_memory.VariableChannel_Custom: {
			GroupName: "User variable",
			GroupDesc: "Persistently stores and reads project date for users, such as the preferred language and custom settings.",
		},
		project_memory.VariableChannel_System: {
			GroupName: "System variable",
			GroupDesc: "Displays the data that you enabled as needed, which can be used to identify users via IDs or handle channel-specific features. The data is automatically generated and is read-only.",
		},
	},
}

var channel2GroupVariableInfo = map[project_memory.VariableChannel]project_memory.GroupVariableInfo{
	project_memory.VariableChannel_APP: {
		GroupName:    "应用变量",
		GroupDesc:    "用于配置应用中多处开发场景需要访问的数据，每次新请求均会初始化为默认值。",
		GroupExtDesc: "",
		IsReadOnly:   false,
		SubGroupList: []*project_memory.GroupVariableInfo{},
		VarInfoList:  []*project_memory.Variable{},
	},
	project_memory.VariableChannel_Custom: {
		GroupName:    "用户变量",
		GroupDesc:    "用于存储每个用户使用项目过程中，需要持久化存储和读取的数据，如用户的语言偏好、个性化设置等。",
		GroupExtDesc: "",
		IsReadOnly:   false,
		SubGroupList: []*project_memory.GroupVariableInfo{},
		VarInfoList:  []*project_memory.Variable{},
	},
	project_memory.VariableChannel_System: {
		GroupName:    "系统变量",
		GroupDesc:    "可选择开启你需要获取的，系统在用户在请求自动产生的数据，仅可读不可修改。如用于通过ID识别用户或处理某些渠道特有的功能。",
		GroupExtDesc: "",
		IsReadOnly:   true,
		SubGroupList: []*project_memory.GroupVariableInfo{},
		VarInfoList:  []*project_memory.Variable{},
	},
}

func (v *VariableApplicationService) GetSysVariableConf(ctx context.Context, req *kvmemory.GetSysVariableConfRequest) (*kvmemory.GetSysVariableConfResponse, error) {
	vars := v.DomainSVC.GetSysVariableConf(ctx)

	return &kvmemory.GetSysVariableConfResponse{
		Conf:      vars,
		GroupConf: vars.GroupByName(),
	}, nil
}

func (v *VariableApplicationService) GetProjectVariablesMeta(ctx context.Context, appOwnerID int64, req *project_memory.GetProjectVariableListReq) (*project_memory.GetProjectVariableListResp, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrMemoryPermissionCode, errorx.KV("msg", "session required"))
	}

	version := ""
	if req.Version != 0 {
		version = fmt.Sprintf("%d", req.Version)
	}

	meta, err := v.DomainSVC.GetProjectVariablesMeta(ctx, req.ProjectID, version)
	if err != nil {
		return nil, err
	}

	groupConf, err := v.toGroupVariableInfo(ctx, meta)
	if err != nil {
		return nil, err
	}

	return &project_memory.GetProjectVariableListResp{
		VariableList: meta.ToProjectVariables(),
		GroupConf:    groupConf,
		CanEdit:      appOwnerID == *uid,
	}, nil
}

func (v *VariableApplicationService) getGroupVariableConf(ctx context.Context, channel project_memory.VariableChannel) project_memory.GroupVariableInfo {
	groupConf, ok := channel2GroupVariableInfo[channel]
	if !ok {
		return project_memory.GroupVariableInfo{}
	}

	local := i18n.GetLocale(ctx)
	i18nConf, ok := i18nLocal2GroupVariableInfo[local][channel]
	if ok {
		groupConf.GroupName = i18nConf.GroupName
		groupConf.GroupDesc = i18nConf.GroupDesc
	}

	return groupConf
}

func (v *VariableApplicationService) toGroupVariableInfo(ctx context.Context, meta *entity.VariablesMeta) ([]*project_memory.GroupVariableInfo, error) {
	channel2Vars := meta.GroupByChannel()
	groupConfList := make([]*project_memory.GroupVariableInfo, 0, len(channel2Vars))

	showChannels := []project_memory.VariableChannel{
		project_memory.VariableChannel_APP,
		project_memory.VariableChannel_Custom,
		project_memory.VariableChannel_System,
	}

	for _, channel := range showChannels {
		ch := channel
		vars := channel2Vars[ch]
		groupConf := v.getGroupVariableConf(ctx, ch)
		groupConf.DefaultChannel = &ch
		if channel != project_memory.VariableChannel_System {
			groupConf.VarInfoList = vars
			groupConfList = append(groupConfList, &groupConf)

			continue
		}

		key2Var := make(map[string]*project_memory.Variable)
		for _, v := range vars {
			key2Var[v.Keyword] = v
		}

		// project_memory.VariableChannel_System
		sysVars := v.DomainSVC.GetSysVariableConf(ctx).RemoveLocalChannelVariable()
		groupName2Group := sysVars.GroupByName()
		subGroupList := make([]*project_memory.GroupVariableInfo, 0, len(groupName2Group))

		for _, group := range groupName2Group {
			var e entity.SysConfVariables = group.VarInfoList
			varList := make([]*project_memory.Variable, 0, len(group.VarInfoList))

			for _, defaultSysMeta := range e.ToVariables().ToProjectVariables() {
				sysMetaInUserConf := key2Var[defaultSysMeta.Keyword]
				if sysMetaInUserConf == nil {
					varList = append(varList, defaultSysMeta)
				} else {
					varList = append(varList, sysMetaInUserConf)
				}
			}

			pGroupVariableInfo := &project_memory.GroupVariableInfo{
				GroupName:    group.GroupName,
				GroupDesc:    group.GroupDesc,
				GroupExtDesc: group.GroupExtDesc,
				IsReadOnly:   true,
				VarInfoList:  varList,
			}

			subGroupList = append(subGroupList, pGroupVariableInfo)
		}

		groupConf.SubGroupList = subGroupList
		groupConfList = append(groupConfList, &groupConf)
	}

	return groupConfList, nil
}

func (v *VariableApplicationService) UpdateProjectVariable(ctx context.Context, req project_memory.UpdateProjectVariableReq) (*project_memory.UpdateProjectVariableResp, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrMemoryPermissionCode, errorx.KV("msg", "session required"))
	}

	if req.UserID == 0 {
		req.UserID = *uid
	}

	// TODO: project owner check

	sysVars := v.DomainSVC.GetSysVariableConf(ctx).ToVariables()

	sysVarsKeys2Meta := make(map[string]*entity.VariableMeta)
	for _, v := range sysVars.Variables {
		sysVarsKeys2Meta[v.Keyword] = v
	}

	list := make([]*project_memory.Variable, 0, len(req.VariableList))
	for _, v := range req.VariableList {
		if v.Channel == project_memory.VariableChannel_System &&
			sysVarsKeys2Meta[v.Keyword] == nil {
			logs.CtxInfof(ctx, "sys variable not found, keyword: %s", v.Keyword)
			continue
		}

		list = append(list, v)
	}

	key2Var := make(map[string]*project_memory.Variable)
	for _, v := range req.VariableList {
		key2Var[v.Keyword] = v
	}

	for _, v := range sysVars.Variables {
		if key2Var[v.Keyword] == nil {
			list = append(list, v.ToProjectVariable())
		} else {
			if key2Var[v.Keyword].DefaultValue != v.DefaultValue ||
				key2Var[v.Keyword].VariableType != v.VariableType {
				return nil, errorx.New(errno.ErrMemoryPermissionCode, errorx.KV("msg", "can not update system variable"))
			}
		}
	}

	for _, vv := range list {
		if vv.Channel == project_memory.VariableChannel_APP {
			e := entity.NewVariableMeta(vv)
			err := e.CheckSchema(ctx)
			if err != nil {
				return nil, err
			}
		}
	}

	_, err := v.DomainSVC.UpsertProjectMeta(ctx, req.ProjectID, "", req.UserID, entity.NewVariables(list))
	if err != nil {
		return nil, err
	}

	return &project_memory.UpdateProjectVariableResp{
		Code: 0,
		Msg:  "success",
	}, nil
}

func (v *VariableApplicationService) GetVariableMeta(ctx context.Context, req *project_memory.GetMemoryVariableMetaReq) (*project_memory.GetMemoryVariableMetaResp, error) {
	vars, err := v.DomainSVC.GetVariableMeta(ctx, req.ConnectorID, req.ConnectorType, req.GetVersion())
	if err != nil {
		return nil, err
	}

	vars.RemoveDisableVariable()

	return &project_memory.GetMemoryVariableMetaResp{
		VariableMap: vars.GroupByChannel(),
	}, nil
}

func (v *VariableApplicationService) DeleteVariableInstance(ctx context.Context, req *kvmemory.DelProfileMemoryRequest) (*kvmemory.DelProfileMemoryResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrMemoryPermissionCode, errorx.KV("msg", "session required"))
	}

	bizType := ternary.IFElse(req.BotID == 0, project_memory.VariableConnector_Project, project_memory.VariableConnector_Bot)
	bizID := ternary.IFElse(req.BotID == 0, req.ProjectID, fmt.Sprintf("%d", req.BotID))
	connectId := ternary.IFElse(req.ConnectorID == nil, consts.CozeConnectorID, req.GetConnectorID())

	e := entity.NewUserVariableMeta(&model.UserVariableMeta{
		BizType:      bizType,
		BizID:        bizID,
		Version:      "",
		ConnectorID:  connectId,
		ConnectorUID: fmt.Sprintf("%d", *uid),
	})

	err := v.DomainSVC.DeleteVariableInstance(ctx, e, req.Keywords)
	if err != nil {
		return nil, err
	}

	return &kvmemory.DelProfileMemoryResponse{}, nil
}

func (v *VariableApplicationService) GetPlayGroundMemory(ctx context.Context, req *kvmemory.GetProfileMemoryRequest) (*kvmemory.GetProfileMemoryResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrMemoryPermissionCode, errorx.KV("msg", "session required"))
	}

	isProjectKV := req.ProjectID != nil
	versionStr := strconv.FormatInt(req.GetProjectVersion(), 10)
	if req.GetProjectVersion() == 0 {
		versionStr = ""
	}

	bizType := ternary.IFElse(isProjectKV, project_memory.VariableConnector_Project, project_memory.VariableConnector_Bot)
	bizID := ternary.IFElse(isProjectKV, req.GetProjectID(), fmt.Sprintf("%d", req.BotID))
	version := ternary.IFElse(isProjectKV, versionStr, "")
	connectId := ternary.IFElse(req.ConnectorID == nil, consts.CozeConnectorID, req.GetConnectorID())
	connectorUID := ternary.IFElse(req.UserID == 0, *uid, req.UserID)

	e := entity.NewUserVariableMeta(&model.UserVariableMeta{
		BizType:      bizType,
		BizID:        bizID,
		Version:      version,
		ConnectorID:  connectId,
		ConnectorUID: fmt.Sprintf("%d", connectorUID),
	})

	res, err := v.DomainSVC.GetVariableChannelInstance(ctx, e, req.Keywords, req.VariableChannel)
	if err != nil {
		return nil, err
	}

	return &kvmemory.GetProfileMemoryResponse{
		Memories: res,
	}, nil
}

func (v *VariableApplicationService) SetVariableInstance(ctx context.Context, req *kvmemory.SetKvMemoryReq) (*kvmemory.SetKvMemoryResp, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrMemoryPermissionCode, errorx.KV("msg", "session required"))
	}

	isProjectKV := req.ProjectID != nil
	versionStr := strconv.FormatInt(req.GetProjectVersion(), 10)
	if req.GetProjectVersion() == 0 {
		versionStr = ""
	}

	bizType := ternary.IFElse(isProjectKV, project_memory.VariableConnector_Project, project_memory.VariableConnector_Bot)
	bizID := ternary.IFElse(isProjectKV, req.GetProjectID(), fmt.Sprintf("%d", req.BotID))
	version := ternary.IFElse(isProjectKV, versionStr, "")
	connectId := ternary.IFElse(req.ConnectorID == nil, consts.CozeConnectorID, req.GetConnectorID())
	connectorUID := ternary.IFElse(req.GetUserID() == 0, *uid, req.GetUserID())

	e := entity.NewUserVariableMeta(&model.UserVariableMeta{
		BizType:      bizType,
		BizID:        bizID,
		Version:      version,
		ConnectorID:  connectId,
		ConnectorUID: fmt.Sprintf("%d", connectorUID),
	})

	exitKeys, err := v.DomainSVC.SetVariableInstance(ctx, e, req.Data)
	if err != nil {
		return nil, err
	}

	exitKeysStr, _ := json.Marshal(exitKeys)

	return &kvmemory.SetKvMemoryResp{
		BaseResp: &base.BaseResp{
			Extra: map[string]string{"existKeys": string(exitKeysStr)},
		},
	}, nil
}
