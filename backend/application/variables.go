package application

import (
	"context"
	"encoding/json"
	"fmt"
	"regexp"

	"code.byted.org/flow/opencoze/backend/api/model/base"
	"code.byted.org/flow/opencoze/backend/api/model/kvmemory"
	"code.byted.org/flow/opencoze/backend/api/model/project_memory"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ternary"
	"code.byted.org/flow/opencoze/backend/types/consts"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type VariableApplicationService struct{}

var VariableSVC = VariableApplicationService{}

var channel2GroupVariableInfo = map[project_memory.VariableChannel]project_memory.GroupVariableInfo{
	project_memory.VariableChannel_APP: {
		GroupName:    "应用变量",
		GroupDesc:    "用于配置应用中多处开发场景需要访问的数据，每次新请求均会初始化为默认值。",
		GroupExtDesc: "",
		IsReadOnly:   false,
	},
	project_memory.VariableChannel_Custom: {
		GroupName:    "用户变量",
		GroupDesc:    "用于存储每个用户使用项目过程中，需要持久化存储和读取的数据，如用户的语言偏好、个性化设置等。",
		GroupExtDesc: "",
		IsReadOnly:   false,
	},
	project_memory.VariableChannel_System: {
		GroupName:    "系统变量",
		GroupDesc:    "可选择开启你需要获取的，系统在用户在请求自动产生的数据，仅可读不可修改。如用于通过ID识别用户或处理某些渠道特有的功能。",
		GroupExtDesc: "",
		SubGroupList: nil,
		IsReadOnly:   true,
	},
}

func (v *VariableApplicationService) GetSysVariableConf(ctx context.Context, req *kvmemory.GetSysVariableConfRequest) (*kvmemory.GetSysVariableConfResponse, error) {
	vars := variablesDomainSVC.GetSysVariableConf(ctx)

	return &kvmemory.GetSysVariableConfResponse{
		Conf:      vars,
		GroupConf: vars.GroupByName(),
	}, nil
}

func (v *VariableApplicationService) GetProjectVariablesMeta(ctx context.Context, req *project_memory.GetProjectVariableListReq) (*project_memory.GetProjectVariableListResp, error) {
	// TODO:  后面再确认这个鉴权要不要
	// GetProjectKvMemoryHandler - checkParamsAndParams
	// CheckResourceOperatePermissionV2  鉴权

	uid := getUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	version := ""
	if req.Version != 0 {
		version = fmt.Sprintf("%d", req.Version)
	}

	data, err := variablesDomainSVC.GetProjectVariablesMeta(ctx, req.ProjectID, version)
	if err != nil {
		return nil, err
	}

	groupConf, err := v.toGroupVariableInfo(ctx, data)
	if err != nil {
		return nil, err
	}

	return &project_memory.GetProjectVariableListResp{
		VariableList: data.ToProjectVariables(),
		GroupConf:    groupConf,
		CanEdit:      *uid == req.UserID, // TODO: 协同编辑的用户也要判断
	}, nil
}

func (v *VariableApplicationService) getGroupVariableConf(channel project_memory.VariableChannel) project_memory.GroupVariableInfo {
	groupConf, ok := channel2GroupVariableInfo[channel]
	if ok {
		return groupConf
	}
	return project_memory.GroupVariableInfo{}
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
		groupConf := v.getGroupVariableConf(ch)
		groupConf.DefaultChannel = &ch
		if channel != project_memory.VariableChannel_System {
			groupConf.VarInfoList = vars
		} else {
			vars := variablesDomainSVC.GetSysVariableConf(ctx).RemoveLocalChannelVariable()
			groupName2Group := vars.GroupByName()
			subGroupList := make([]*project_memory.GroupVariableInfo, 0, len(groupName2Group))

			for _, group := range groupName2Group {
				var e entity.SysConfVariables = group.VarInfoList
				pGroupVariableInfo := &project_memory.GroupVariableInfo{
					GroupName:    group.GroupName,
					GroupDesc:    group.GroupDesc,
					GroupExtDesc: group.GroupExtDesc,
					IsReadOnly:   true,
					VarInfoList:  e.ToVariables().ToProjectVariables(),
				}

				subGroupList = append(subGroupList, pGroupVariableInfo)
			}

			groupConf.SubGroupList = subGroupList
		}

		groupConfList = append(groupConfList, &groupConf)
	}

	return groupConfList, nil
}

func (v *VariableApplicationService) UpdateProjectVariable(ctx context.Context, req project_memory.UpdateProjectVariableReq) (*project_memory.UpdateProjectVariableResp, error) {
	uid := getUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	if req.UserID != *uid {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "uid permission denied"))
	}

	list := req.VariableList
	sysVars := variablesDomainSVC.GetSysVariableConf(ctx).ToVariables()

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
				return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "can not update system variable"))
			}
		}
	}

	for _, vv := range list {
		if vv.Channel == project_memory.VariableChannel_APP {
			err := v.checkAppVariableSchema(ctx, nil, vv.Schema)
			if err != nil {
				return nil, err
			}
		}
	}

	// TODO: authz.ActionAndResource CheckResourceOperatePermissionV2

	_, err := variablesDomainSVC.UpsertProjectMeta(ctx, req.ProjectID, "", req.UserID, entity.NewVariables(list))
	if err != nil {
		return nil, err
	}

	return &project_memory.UpdateProjectVariableResp{
		Code: 0,
		Msg:  "success",
	}, nil
}

func (v *VariableApplicationService) checkAppVariableSchema(ctx context.Context, schemaObj *schemaStruct, schema string) error {
	if len(schema) == 0 && schemaObj == nil {
		return errorx.New(errno.ErrUpdateVariableSchemaCode, errorx.KV("msg", "schema is nil"))
	} else if schemaObj == nil {
		schemaObj = &schemaStruct{}
		err := json.Unmarshal([]byte(schema), schemaObj)
		if err != nil {
			return errorx.New(errno.ErrUpdateVariableSchemaCode, errorx.KV("msg", err.Error()))
		}
	}

	if !schemaObj.NameValidate() {
		return errorx.New(errno.ErrUpdateVariableSchemaCode, errorx.KV("msg", fmt.Sprintf("name(%s) is invalid", schemaObj.Name)))
	}

	if schemaObj.Type == "object" {
		return v.checkSchemaObj(ctx, schemaObj.Schema)
	} else if schemaObj.Type == "array" {
		return v.checkSchemaArray(ctx, schemaObj.Schema)
	}

	return nil
}

func (v *VariableApplicationService) checkSchemaObj(ctx context.Context, schema []byte) error {
	schemas := make([]*schemaStruct, 0)
	err := json.Unmarshal(schema, &schemas)
	if err != nil {
		return errorx.New(errno.ErrUpdateVariableSchemaCode, errorx.KV("msg", "schema array content json invalid"))
	}

	for _, schemaObj := range schemas {
		if err := v.checkAppVariableSchema(ctx, schemaObj, ""); err != nil {
			return err
		}
	}

	return nil
}

func (v *VariableApplicationService) checkSchemaArray(ctx context.Context, schema []byte) error {
	schemaObj := schemaStruct{}
	err := json.Unmarshal(schema, &schemaObj)
	if err != nil {
		return errorx.New(errno.ErrUpdateVariableSchemaCode, errorx.KV("msg", err.Error()))
	}

	if !schemaObj.NameValidate() {
		return errorx.New(errno.ErrUpdateVariableSchemaCode, errorx.KV("msg", fmt.Sprintf("name(%s) is invalid", schemaObj.Name)))
	}

	return v.checkAppVariableSchema(ctx, nil, string(schemaObj.Schema))
}

type schemaStruct struct {
	Type   string          `json:"type,omitempty"`
	Name   string          `json:"name,omitempty"`
	Schema json.RawMessage `json:"schema,omitempty"`
}

func (s *schemaStruct) NameValidate() bool {
	identifier := s.Name

	reservedWords := map[string]bool{
		"true": true, "false": true, "and": true, "AND": true,
		"or": true, "OR": true, "not": true, "NOT": true,
		"null": true, "nil": true, "If": true, "Switch": true,
	}

	if reservedWords[identifier] {
		return false
	}

	// 检查是否符合后面的部分正则规则
	pattern := `^[a-zA-Z_][a-zA-Z_$0-9]*$`
	match, _ := regexp.MatchString(pattern, identifier)

	return match
}

func (v *VariableApplicationService) GetVariableMeta(ctx context.Context, req *project_memory.GetMemoryVariableMetaReq) (*project_memory.GetMemoryVariableMetaResp, error) {
	// TODO: 鉴权
	vars, err := variablesDomainSVC.GetVariableMeta(ctx, req.ConnectorID, req.ConnectorType, req.GetVersion())
	if err != nil {
		return nil, err
	}

	vars.RemoveDisableVariable()

	return &project_memory.GetMemoryVariableMetaResp{
		VariableMap: vars.GroupByChannel(),
	}, nil
}

func (v *VariableApplicationService) DeleteVariableInstance(ctx context.Context, req *kvmemory.DelProfileMemoryRequest) (*kvmemory.DelProfileMemoryResponse, error) {
	uid := getUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	bizType := ternary.IFElse(req.BotID == 0, project_memory.VariableConnector_Project, project_memory.VariableConnector_Bot)
	bizID := ternary.IFElse(req.BotID == 0, req.ProjectID, fmt.Sprintf("%d", req.BotID))

	e := entity.UserVariableMeta{
		BizType:      int32(bizType),
		BizID:        bizID,
		Version:      "",
		ConnectorID:  consts.CozeConnectorID, // TODO（@fanlv）：目前应该只有 coze 场景，后续再看 API 场景 connectorID 怎么拿。
		ConnectorUID: fmt.Sprintf("%d", *uid),
	}

	err := variablesDomainSVC.DeleteVariableInstance(ctx, &e, req.Keywords)
	if err != nil {
		return nil, err
	}

	// TODO: 鉴权 util.CheckResourceOperatePermissionV2
	return &kvmemory.DelProfileMemoryResponse{}, nil
}

func (v *VariableApplicationService) GetPlayGroundMemory(ctx context.Context, req *kvmemory.GetProfileMemoryRequest) (*kvmemory.GetProfileMemoryResponse, error) {
	uid := getUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	bizType := ternary.IFElse(req.BotID == 0, project_memory.VariableConnector_Project, project_memory.VariableConnector_Bot)
	bizID := ternary.IFElse(req.BotID == 0, req.GetProjectID(), fmt.Sprintf("%d", req.BotID))
	version := ternary.IFElse(req.BotID == 0, fmt.Sprintf("%d", req.GetProjectVersion()), req.GetVersion())
	connectId := ternary.IFElse(req.ConnectorID == nil, consts.CozeConnectorID, req.GetConnectorID())
	connectorUID := ternary.IFElse(req.UserID == 0, *uid, req.UserID)

	entity := entity.UserVariableMeta{
		BizType:      int32(bizType),
		BizID:        bizID,
		Version:      version,
		ConnectorID:  connectId,
		ConnectorUID: fmt.Sprintf("%d", connectorUID),
	}

	res, err := variablesDomainSVC.GetVariableInstance(ctx, &entity, req.Keywords, req.VariableChannel)
	if err != nil {
		return nil, err
	}

	return &kvmemory.GetProfileMemoryResponse{
		Memories: res,
	}, nil
}

func (v *VariableApplicationService) SetVariableInstance(ctx context.Context, req *kvmemory.SetKvMemoryReq) (*kvmemory.SetKvMemoryResp, error) {
	// TODO: 鉴权
	uid := getUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	bizType := ternary.IFElse(req.BotID == 0, project_memory.VariableConnector_Project, project_memory.VariableConnector_Bot)
	bizID := ternary.IFElse(req.BotID == 0, req.GetProjectID(), fmt.Sprintf("%d", req.BotID))
	version := ternary.IFElse(req.BotID == 0, fmt.Sprintf("%d", req.GetProjectVersion()), "")
	connectId := ternary.IFElse(req.ConnectorID == nil, consts.CozeConnectorID, req.GetConnectorID())
	connectorUID := ternary.IFElse(req.GetUserID() == 0, *uid, req.GetUserID())

	entity := entity.UserVariableMeta{
		BizType:      int32(bizType),
		BizID:        bizID,
		Version:      version,
		ConnectorID:  connectId,
		ConnectorUID: fmt.Sprintf("%d", connectorUID),
	}

	exitKeys, err := variablesDomainSVC.SetVariableInstance(ctx, &entity, req.Data)
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
